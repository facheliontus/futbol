// ==========================================================
// VERCEL SERVERLESS LEADERBOARD & ANTI-CHEAT API (api/leaderboard.js)
// ==========================================================

const https = require('https');

const FIREBASE_DB_URL = 'https://futbol-62e5b-default-rtdb.firebaseio.com';
const FIREBASE_LEADERBOARD_URL = FIREBASE_DB_URL + '/leaderboard.json';
const CLOUD_OBJECT_ID = 'ff808181a09d98f701a0fbb2a1f55f53';
const CLOUD_URL = 'https://api.restful-api.dev/objects/' + CLOUD_OBJECT_ID;

function httpGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

function httpPut(url, bodyObj) {
  return new Promise((resolve, reject) => {
    const dataStr = JSON.stringify(bodyObj);
    const byteLen = Buffer.byteLength(dataStr, 'utf8');

    const req = https.request(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': byteLen
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.write(dataStr);
    req.end();
  });
}

// Anti-Cheat: Matematiksel tavan doğrulama
function validateAndSanitizePlayer(p) {
  if (!p || typeof p !== 'object') return null;
  const name = String(p.name || 'Futbolcu').replace(/[<>&"']/g, '').trim().substring(0, 30);
  const club = String(p.club || 'Kulüpsüz').replace(/[<>&"']/g, '').trim().substring(0, 35);
  const id = String(p.id || 'p_' + Math.random().toString(36).substr(2, 9)).substring(0, 50);
  const ovr = Math.max(60, Math.min(99, parseInt(p.ovr) || 75));

  const matches = Math.max(0, parseInt(p.matches) || 0);
  const goals = Math.max(0, parseInt(p.goals) || 0);
  const saves = Math.max(0, parseInt(p.saves) || 0);

  // İncele hilesi koruması: Bir oyuncu oynadığı maç başına en fazla ~600.000 kazanabilir
  const maxPossibleMoney = 700000 + (matches * 600000) + (goals * 15000) + (saves * 10000) + 500000;
  let rawMoney = parseInt(p.money) || 0;
  if (rawMoney > maxPossibleMoney || rawMoney > 200000000 || rawMoney < 0) {
    rawMoney = Math.min(rawMoney, maxPossibleMoney);
  }

  return {
    id,
    name,
    club,
    ovr,
    money: rawMoney,
    matches,
    goals,
    saves,
    country: '🇹🇷',
    lastSeen: Date.now(),
    isReal: true
  };
}

module.exports = async (req, res) => {
  // CORS başlıkları
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // 1. GET: Liderlik tablosunu oku (Öncelikli: Firebase Realtime Database)
    if (req.method === 'GET') {
      try {
        const fbData = await httpGet(FIREBASE_LEADERBOARD_URL);
        if (fbData && typeof fbData === 'object') {
          const players = Object.values(fbData).filter(p => p && p.isRealPlayer !== false);
          return res.status(200).json({ success: true, source: 'firebase', players });
        }
      } catch (fbErr) {
        console.warn('Firebase GET hatası, cloud fallback deneniyor:', fbErr.message);
      }

      const cloudData = await httpGet(CLOUD_URL);
      const players = (cloudData.data && Array.isArray(cloudData.data.players)) 
        ? cloudData.data.players 
        : [];
      return res.status(200).json({ success: true, source: 'cloud_backup', players });
    }

    // 2. POST: Yeni/güncel oyuncu kaydet
    if (req.method === 'POST') {
      let body = req.body;
      if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch (e) { body = {}; }
      }
      const rawPlayer = body.player || body;
      const cleanPlayer = validateAndSanitizePlayer(rawPlayer);

      if (!cleanPlayer) {
        return res.status(400).json({ success: false, error: 'Geçersiz oyuncu verisi' });
      }

      // Firebase Realtime Database'e yaz
      let fbSuccess = false;
      try {
        await httpPut(`${FIREBASE_DB_URL}/leaderboard/${cleanPlayer.id}.json`, cleanPlayer);
        fbSuccess = true;
      } catch (fbWriteErr) {
        console.warn('Firebase POST hatası:', fbWriteErr.message);
      }

      // Yedek bulut nesnesine de yaz
      let players = [];
      try {
        const cloudData = await httpGet(CLOUD_URL);
        players = (cloudData.data && Array.isArray(cloudData.data.players)) 
          ? cloudData.data.players 
          : [];

        const existingIdx = players.findIndex(p => p.id === cleanPlayer.id || p.name === cleanPlayer.name);
        if (existingIdx >= 0) {
          players[existingIdx] = { ...players[existingIdx], ...cleanPlayer };
        } else {
          players.push(cleanPlayer);
        }

        players = players
          .map(p => validateAndSanitizePlayer(p))
          .filter(Boolean)
          .slice(-60);

        await httpPut(CLOUD_URL, {
          name: 'PRO_FOOTBALL_3D_GLOBAL_LEADERBOARD',
          data: {
            version: 2,
            lastUpdated: Date.now(),
            players: players
          }
        });
      } catch (backupErr) {}

      return res.status(200).json({ success: true, firebase: fbSuccess, player: cleanPlayer, totalPlayers: players.length, players: players });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Leaderboard API Error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};
