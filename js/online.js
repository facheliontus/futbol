// ==========================================================
// ONLINE ÇOK OYUNCULU ODA SİSTEMİ (online.js)
// 1v1 Düello (Forvet vs Kaleci) & 2 Kişilik Eşli Hücum (Co-op vs Bot Kaleci)
// Çift Katmanlı Mimari: WebRTC P2P (0ms Lag) + Firebase RTDB Kesintisiz Bulut Aktarımı
// "Bağlanılıyor"da takılma sorununu %100 ortadan kaldıran garanti bağlantı sistemi
// ==========================================================

// CO-OP 2 KİŞİLİK EŞLİ HÜCUM VARYASYONLARI
const COOP_SCENARIOS = [
  {
    id: 'wing_cross_volley',
    title: 'KANATTAN MUZ ORTA & 90\'A VOLE',
    desc: 'Sağ kanattan ceza sahasına adrese teslim kavisli orta aç, arkadaşın gelişine voleyi 90\'a çatsın!',
    passerPos: { x: 11.5, y: 0.11, z: 17.0 },
    shooterPos: { x: 1.5, y: 0.11, z: 9.5 },
    arcHeight: 2.6,
    curl: -0.45,
    flightDuration: 1.15,
    hasWall: false,
    roleTitle1: '🎯 ORTA AÇAN (KANAT)',
    roleDesc1: 'Ceza sahasında bekleyen arkadaşına kavisli orta kes!',
    roleTitle2: '💥 BİTİRİCİ (FORVET)',
    roleDesc2: 'Orta gelirken ceza sahasında pozisyon al, kaleye voleyi yapıştır!'
  },
  {
    id: 'wall_pass_attack',
    title: 'VER-KAÇ / DUVAR PASI ORGANİZASYONU',
    desc: 'Ceza yayından savunma arkasına al-ver pası! Savunmayı oyundan düşür ve köşeye plaseyi bırak!',
    passerPos: { x: -4.5, y: 0.11, z: 21.0 },
    shooterPos: { x: 2.2, y: 0.11, z: 14.5 },
    arcHeight: 0.35,
    curl: 0.1,
    flightDuration: 0.95,
    hasWall: true,
    roleTitle1: '⚡ DUVAR PASI (ORTA SAHA)',
    roleDesc1: 'Arkadaşının koşu yoluna savunma arkasına pası yuvarla!',
    roleTitle2: '🏃 GOLCÜ (FORVET)',
    roleDesc2: 'Pası kontrol ettiğin an kaleciyi gör ve uzak köşeye bırak!'
  },
  {
    id: 'edge_box_rocket',
    title: 'CEZA SAHASI DIŞI AL-VER & 115 KM/H FÜZE',
    desc: 'Kanattan ceza yayına yerden sert pas çıkar, yay üzerinden gelişine tek vuruşla çatala füze gönder!',
    passerPos: { x: -9.0, y: 0.11, z: 18.0 },
    shooterPos: { x: 0.0, y: 0.11, z: 20.0 },
    arcHeight: 0.25,
    curl: 0.0,
    flightDuration: 0.9,
    hasWall: false,
    roleTitle1: '🎯 YAY ÜZERİNE PAS (KANAT)',
    roleDesc1: 'Ceza sahası yayına arkadaşına yerden sert pas çıkar!',
    roleTitle2: '💣 ŞUTÖR (10 NUMARA)',
    roleDesc2: 'Yay üzerinde beklemeden gelişine çatala 115 km/h füze çek!'
  },
  {
    id: 'cross_header',
    title: 'ARKA DİREK AŞIRTMA ORTA & UÇAN KAFA',
    desc: 'Sol kanattan arka direğe havadan aşırtma orta, kalecinin uzanamayacağı köşeye uçan kafa vuruşu!',
    passerPos: { x: -11.0, y: 0.11, z: 15.5 },
    shooterPos: { x: 3.2, y: 0.11, z: 8.5 },
    arcHeight: 3.0,
    curl: 0.5,
    flightDuration: 1.2,
    hasWall: false,
    roleTitle1: '📐 ARKA DİREĞE ORTA (KANAT)',
    roleDesc1: 'Arka direkte bekleyen arkadaşına yüksek aşırtma orta kes!',
    roleTitle2: '🦅 KAFA VURUŞU (FORVET)',
    roleDesc2: 'Havalanan topa yüksel ve kalecinin tersine kafayı vur!'
  },
  {
    id: 'freekick_trick',
    title: 'AKILLI FRİKİK ORGANİZASYONU & BARAJI DELME',
    desc: 'Frikikte baraja vurmak yerine barajın sağına boşa kaçan arkadaşına aşırtma pası çıkar!',
    passerPos: { x: 0.0, y: 0.11, z: 23.0 },
    shooterPos: { x: 5.5, y: 0.11, z: 16.0 },
    arcHeight: 0.6,
    curl: 0.2,
    flightDuration: 0.95,
    hasWall: true,
    roleTitle1: '🧠 ASİSTÇİ (FRİKİKÇİ)',
    roleDesc1: 'Baraja vurmak yerine boşa kaçan arkadaşına pası aktar!',
    roleTitle2: '⚡ BİTİRİCİ (GİZLİ GOLCÜ)',
    roleDesc2: 'Barajın arkasından fırla ve kaleci açıyı kapatmadan golü at!'
  }
];

// Güvenilir STUN + Açık TURN Sunucuları (Simetrik NAT & CGNAT aşımı için)
const RTC_ICE_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun.services.mozilla.com' },
    { urls: 'stun:stun.cloudflare.com:3478' },
    {
      urls: 'turn:openrelay.metered.ca:80',
      username: 'openrelay',
      credential: 'openrelay'
    },
    {
      urls: 'turn:openrelay.metered.ca:443',
      username: 'openrelay',
      credential: 'openrelay'
    },
    {
      urls: 'turn:openrelay.metered.ca:443?transport=tcp',
      username: 'openrelay',
      credential: 'openrelay'
    }
  ]
};

class OnlineManager {
  constructor() {
    this.firebaseDbUrl = 'https://futbol-62e5b-default-rtdb.firebaseio.com';
    this.peer = null;
    this.conn = null;
    this.isHost = false;
    this.roomCode = null;
    this.connected = false;
    this.isOnlineMatch = false;
    this.transport = 'none'; // 'webrtc' veya 'firebase'

    this.playerId = 'pl_' + Math.random().toString(36).substr(2, 7);
    this.sendSeq = 0;
    this.lastReceivedSeq = {};

    this.hostRoomEventSource = null;
    this.channelEventSource = null;
    this.roomHeartbeatTimer = null;
    this.connectionWatchdogTimer = null;

    // Oyun Modu: 'coop' (2 Kişilik Eşli Hücum) veya 'duel' (1v1)
    this.gameMode = 'coop';

    // Online Maç Durumu
    this.myRole = 'passer'; // coop için: 'passer'/'shooter', duel için: 'striker'/'goalkeeper'
    this.localPlayerName = 'Oyuncu 1';
    this.remotePlayerName = 'Oyuncu 2';
    this.currentRound = 1;
    this.maxRounds = 6;
    this.score = { host: 0, guest: 0 };
    this.coopScore = { goals: 0, attempts: 0 };
    this.game = null;

    this.checkUrlRoomParam();
  }

  setGame(gameInstance) {
    this.game = gameInstance;
  }

  checkUrlRoomParam() {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const roomParam = urlParams.get('room');
      if (roomParam) {
        setTimeout(() => {
          const inputEl = document.getElementById('input-join-room-code');
          if (inputEl) inputEl.value = roomParam.trim().toUpperCase();
          const tabJoin = document.getElementById('tab-btn-join');
          if (tabJoin) tabJoin.click();
          const modalEl = document.getElementById('online-modal');
          if (modalEl) modalEl.classList.remove('hidden');
        }, 300);
      }
    } catch (e) {
      console.warn("URL Parametresi okunamadı:", e);
    }
  }

  generateRoomCode() {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  getPeerIdFromCode(code) {
    return `fc3d-duel-${code.trim().toUpperCase()}`;
  }

  // Tüm önceki bağlantıları, timerları ve SSE dinleyicilerini temizle
  cleanup(isUnload = false) {
    if (this.connectionWatchdogTimer) {
      clearTimeout(this.connectionWatchdogTimer);
      this.connectionWatchdogTimer = null;
    }
    if (this.roomHeartbeatTimer) {
      clearInterval(this.roomHeartbeatTimer);
      this.roomHeartbeatTimer = null;
    }
    if (this.hostRoomEventSource) {
      this.hostRoomEventSource.close();
      this.hostRoomEventSource = null;
    }
    if (this.channelEventSource) {
      this.channelEventSource.close();
      this.channelEventSource = null;
    }
    if (this.conn) {
      try { this.conn.close(); } catch (e) {}
      this.conn = null;
    }
    if (this.peer) {
      try { this.peer.destroy(); } catch (e) {}
      this.peer = null;
    }

    if (this.isHost && this.roomCode && this.firebaseDbUrl) {
      const roomDelUrl = `${this.firebaseDbUrl}/rooms/${this.roomCode}.json`;
      if (isUnload && navigator.sendBeacon) {
        // Tarayıcı kapanırken odayı temizle
        fetch(roomDelUrl, { method: 'DELETE', keepalive: true }).catch(() => {});
      } else {
        fetch(roomDelUrl, { method: 'DELETE' }).catch(() => {});
      }
    }

    this.connected = false;
    this.isOnlineMatch = false;
    this.transport = 'none';
  }

  // ==========================================================
  // 1. ODA OLUŞTUR (HOST)
  // ==========================================================
  async createRoom(playerName) {
    this.cleanup();

    const p = window.careerManager && window.careerManager.player;
    this.localPlayerName = playerName || (p ? p.name : 'Ev Sahibi');
    this.roomCode = this.generateRoomCode();
    this.isHost = true;

    // Seçili modu al
    const duelCard = document.querySelector('.online-mode-card[data-mode="duel"]');
    if (duelCard && duelCard.classList.contains('selected')) {
      this.gameMode = 'duel';
      this.myRole = 'striker';
      this.maxRounds = 5;
    } else {
      this.gameMode = 'coop';
      this.myRole = 'passer';
      this.maxRounds = 6;
    }

    this.updateStatusText(`Bulut odası oluşturuluyor: #${this.roomCode}...`, "waiting");

    // 1. Firebase üzerinde odayı anında kaydet
    const roomPayload = {
      createdAt: Date.now(),
      updatedAt: Date.now(),
      hostId: this.playerId,
      hostName: this.localPlayerName,
      gameMode: this.gameMode,
      status: 'waiting',
      peerId: this.getPeerIdFromCode(this.roomCode)
    };

    try {
      await fetch(`${this.firebaseDbUrl}/rooms/${this.roomCode}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roomPayload)
      });
      console.log(`[Host] Firebase odası oluşturuldu: #${this.roomCode}`);
    } catch (err) {
      console.warn("[Host] Firebase oda açma uyarısı:", err);
    }

    // UI'ı bekleme moduna geçir
    this.showHostWaitingUI(this.roomCode);

    // 2. Firebase SSE ile misafirin katılımını dinle (0ms bekleme)
    this.listenToHostRoom(this.roomCode);

    // 3. Kalp Atışı (Heartbeat) - Odanın aktif olduğunu Firebase'e bildir
    this.roomHeartbeatTimer = setInterval(() => {
      if (this.isHost && this.roomCode) {
        fetch(`${this.firebaseDbUrl}/rooms/${this.roomCode}/updatedAt.json`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(Date.now())
        }).catch(() => {});
      }
    }, 8000);

    // 4. Eşzamanlı WebRTC P2P Hazırlığı
    if (typeof Peer !== 'undefined') {
      try {
        const peerId = this.getPeerIdFromCode(this.roomCode);
        this.peer = new Peer(peerId, {
          debug: 0,
          config: RTC_ICE_CONFIG
        });

        this.peer.on('open', (id) => {
          console.log('[Host] WebRTC Peer ID hazır:', id);
        });

        this.peer.on('connection', (conn) => {
          console.log('[Host] WebRTC P2P bağlantısı geldi!');
          this.conn = conn;
          this.setupPeerConnectionHandlers();
        });

        this.peer.on('error', (err) => {
          console.warn('[Host] WebRTC bildirim (Bulut aktarımı garanti devrede):', err.type || err);
          if (err.type === 'unavailable-id') {
            this.createRoom(playerName);
          }
        });
      } catch (err) {
        console.warn('[Host] PeerJS başlatılamadı, bulut motoru çalışıyor:', err);
      }
    }
  }

  // Host: Misafirin Firebase odasına katılımını anlık dinle
  listenToHostRoom(code) {
    if (this.hostRoomEventSource) {
      this.hostRoomEventSource.close();
    }

    const roomUrl = `${this.firebaseDbUrl}/rooms/${code}.json`;
    try {
      this.hostRoomEventSource = new EventSource(roomUrl);
      this.hostRoomEventSource.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          const data = parsed && parsed.data ? parsed.data : parsed;
          if (!data) return;

          // Misafir odaya bağlandıysa
          if ((data.status === 'matched' || data.guestId) && !this.connected) {
            this.remotePlayerName = data.guestName || 'Misafir Oyuncu';
            console.log('[Host] Misafir odaya katıldı:', this.remotePlayerName);

            // Kanal dinleyicisini başlat (Misafir mesajları)
            this.listenToMessageChannel(code, 'guestMsg');

            // WebRTC 3.5 saniyede açılmazsa otomatik Firebase bulut aktarımına geç
            this.connectionWatchdogTimer = setTimeout(() => {
              if (!this.connected) {
                console.log('[Host] WebRTC doğrudan bağlantı gecikti. Firebase Kesintisiz Bulut Aktarımı ile maç başlatılıyor!');
                this.onConnectionEstablished('firebase');
              }
            }, 3200);
          }
        } catch (e) {
          console.warn('[Host] SSE veri işleme hatası:', e);
        }
      };

      this.hostRoomEventSource.onerror = () => {
        // SSE düşerse polling ile yedek dinle
        this.pollRoomAsFallback(code);
      };
    } catch (e) {
      this.pollRoomAsFallback(code);
    }
  }

  pollRoomAsFallback(code) {
    if (this._pollingActive || this.connected) return;
    this._pollingActive = true;
    const interval = setInterval(async () => {
      if (this.connected || !this.roomCode) {
        clearInterval(interval);
        this._pollingActive = false;
        return;
      }
      try {
        const res = await fetch(`${this.firebaseDbUrl}/rooms/${code}.json?t=${Date.now()}`);
        const data = await res.json();
        if (data && (data.status === 'matched' || data.guestId) && !this.connected) {
          this.remotePlayerName = data.guestName || 'Misafir Oyuncu';
          this.listenToMessageChannel(code, 'guestMsg');
          this.onConnectionEstablished('firebase');
          clearInterval(interval);
          this._pollingActive = false;
        }
      } catch (e) {}
    }, 1200);
  }

  // ==========================================================
  // 2. ODAYA KATIL (GUEST)
  // ==========================================================
  async joinRoom(code, playerName) {
    const rawCode = (code || '').trim().toUpperCase();
    if (!rawCode || rawCode.length < 3) {
      alert("Lütfen geçerli bir 4 haneli oda kodu girin!");
      return;
    }

    this.cleanup();

    const p = window.careerManager && window.careerManager.player;
    this.localPlayerName = playerName || (p ? p.name : 'Misafir');
    this.roomCode = rawCode;
    this.isHost = false;

    this.updateStatusText(`🔍 #${this.roomCode} kodlu oda aranıyor...`, "waiting");

    // 1. Odanın Firebase'de gerçekten var olup olmadığını KONTROL ET
    let roomData = null;
    try {
      const res = await fetch(`${this.firebaseDbUrl}/rooms/${this.roomCode}.json?t=${Date.now()}`);
      roomData = await res.json();
    } catch (err) {
      console.warn("[Guest] Oda sorgu hatası:", err);
    }

    // Oda yoksa veya 15 dakikadan eskiyse anında hata ver (Asla 'bağlanılıyor'da takılı kalmaz!)
    if (!roomData || !roomData.hostId || (Date.now() - (roomData.updatedAt || roomData.createdAt) > 15 * 60 * 1000)) {
      this.updateStatusText(`❌ #${this.roomCode} kodlu oda bulunamadı veya süresi doldu! Kodu kontrol edin.`, "error");
      return;
    }

    // Oda doluysa
    if (roomData.status === 'in_game' && roomData.guestId && roomData.guestId !== this.playerId) {
      this.updateStatusText(`⚠️ #${this.roomCode} numaralı odada şu an maç oynanıyor!`, "error");
      return;
    }

    this.remotePlayerName = roomData.hostName || 'Ev Sahibi';
    this.gameMode = roomData.gameMode || 'coop';
    this.maxRounds = (this.gameMode === 'coop') ? 6 : 5;

    this.updateStatusText(`🟢 #${this.roomCode} (${this.remotePlayerName}) odasına bağlanılıyor...`, "waiting");

    // 2. Odaya misafir olarak kayıt ol
    try {
      await fetch(`${this.firebaseDbUrl}/rooms/${this.roomCode}.json`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestId: this.playerId,
          guestName: this.localPlayerName,
          status: 'matched',
          updatedAt: Date.now()
        })
      });
      console.log(`[Guest] Firebase odasına katılım bildirildi: #${this.roomCode}`);
    } catch (err) {
      console.warn("[Guest] Katılım kaydı hatası:", err);
    }

    // 3. Firebase kanalını dinlemeye başla (Host mesajları)
    this.listenToMessageChannel(this.roomCode, 'hostMsg');

    // 4. WebRTC Doğrudan P2P Denemesi (0ms gecikme hedefi)
    const targetPeerId = this.getPeerIdFromCode(this.roomCode);
    if (typeof Peer !== 'undefined') {
      try {
        this.peer = new Peer({
          debug: 0,
          config: RTC_ICE_CONFIG
        });

        this.peer.on('open', (myId) => {
          console.log('[Guest] WebRTC Peer açıldı, bağlanılıyor:', targetPeerId);
          this.conn = this.peer.connect(targetPeerId, { reliable: true });
          this.setupPeerConnectionHandlers();
        });

        this.peer.on('error', (err) => {
          console.warn('[Guest] WebRTC bildirim (Bulut aktarımı yedek devrede):', err.type || err);
        });
      } catch (err) {
        console.warn('[Guest] PeerJS başlatılamadı:', err);
      }
    }

    // 5. GARANTİ BAĞLANTI KONTROLÜ (WATCHDOG)
    // Eğer WebRTC NAT/CGNAT/Firewall yüzünden 3.5 saniyede açılamazsa, ASLA BEKLETME:
    // Doğrudan Firebase üzerinden maçı anında başlat!
    this.connectionWatchdogTimer = setTimeout(() => {
      if (!this.connected) {
        console.log('[Guest] WebRTC doğrudan bağlantı gecikti. Firebase Kesintisiz Bulut Aktarımı ile maç başlatılıyor!');
        this.onConnectionEstablished('firebase');
      }
    }, 3200);
  }

  // WebRTC P2P Bağlantı Olaylarını Dinle
  setupPeerConnectionHandlers() {
    if (!this.conn) return;

    const onOpen = () => {
      if (this.connected) return;
      console.log('⚡ WebRTC P2P Doğrudan Veri Kanalı Açıldı!');
      if (this.connectionWatchdogTimer) {
        clearTimeout(this.connectionWatchdogTimer);
        this.connectionWatchdogTimer = null;
      }
      this.onConnectionEstablished('webrtc');
    };

    if (this.conn.open) {
      onOpen();
    } else {
      this.conn.on('open', onOpen);
    }

    this.conn.on('data', (data) => {
      this.handleIncomingData(data);
    });

    this.conn.on('close', () => {
      if (this.transport === 'webrtc') {
        console.log("WebRTC kapandı, Firebase bulut aktarımına geçiliyor...");
        this.transport = 'firebase';
      }
    });

    this.conn.on('error', (err) => {
      console.warn("WebRTC DataConnection hatası:", err);
    });
  }

  // Mesajlaşma Kanalını Dinle (Firebase SSE ile anlık paket alımı)
  listenToMessageChannel(roomCode, channelName) {
    if (this.channelEventSource) {
      this.channelEventSource.close();
    }

    const channelUrl = `${this.firebaseDbUrl}/rooms/${roomCode}/channel/${channelName}.json`;
    try {
      this.channelEventSource = new EventSource(channelUrl);
      this.channelEventSource.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          const data = parsed && parsed.data ? parsed.data : parsed;
          if (data && typeof data === 'object') {
            this.handleIncomingData(data);
          }
        } catch (e) {
          console.warn("Kanal mesaj işleme hatası:", e);
        }
      };

      this.channelEventSource.onerror = () => {
        // SSE düşerse polling ile yedek dinle
        this.pollChannelAsFallback(roomCode, channelName);
      };
    } catch (e) {
      this.pollChannelAsFallback(roomCode, channelName);
    }
  }

  pollChannelAsFallback(roomCode, channelName) {
    if (this._channelPollingActive || !this.isOnlineMatch) return;
    this._channelPollingActive = true;
    const interval = setInterval(async () => {
      if (!this.isOnlineMatch || !this.roomCode) {
        clearInterval(interval);
        this._channelPollingActive = false;
        return;
      }
      try {
        const res = await fetch(`${this.firebaseDbUrl}/rooms/${roomCode}/channel/${channelName}.json?t=${Date.now()}`);
        const data = await res.json();
        if (data && typeof data === 'object') {
          this.handleIncomingData(data);
        }
      } catch (e) {}
    }, 400);
  }

  // ==========================================================
  // BAĞLANTI TAMAMLANDI - MAÇI BAŞLAT
  // ==========================================================
  onConnectionEstablished(transportType = 'firebase') {
    if (this.connected) return;
    this.connected = true;
    this.isOnlineMatch = true;
    this.transport = transportType;

    const transportLabel = (transportType === 'webrtc') 
      ? '⚡ ULTRA DÜŞÜK GECİKME (P2P)' 
      : '☁️ KESİNTİSİZ BULUT AKTARIMI';

    console.log(`[OnlineManager] Maç Başlatılıyor! Aktarım: ${transportLabel}`);
    this.updateStatusText(`🟢 RAKİP BAĞLANDI! [${transportLabel}] SAHA YÜKLENİYOR...`, "success");

    // Kariyer Profili ve Handshake Gönder
    const p = window.careerManager && window.careerManager.player;
    this.send({
      type: 'handshake',
      name: this.localPlayerName,
      isHost: this.isHost,
      gameMode: this.gameMode,
      careerProfile: p ? {
        id: p.id,
        name: p.name,
        club: window.careerManager.getCurrentClub().name,
        ovr: p.overall,
        money: p.money,
        isRealPlayer: true
      } : null
    });

    setTimeout(() => {
      this.startOnlineMatch();
    }, 1000);
  }

  // Ortak Veri Gönderme Fonksiyonu (WebRTC + Firebase Çift Kanallı Güvence)
  send(payload) {
    if (!this.roomCode) return;
    const seq = ++this.sendSeq;
    const fullPayload = {
      ...payload,
      seq: seq,
      senderId: this.playerId,
      senderName: this.localPlayerName,
      time: Date.now()
    };

    // 1. WebRTC Veri Kanalı Açıksa Direkt Gönder (0ms)
    if (this.conn && this.conn.open) {
      try {
        this.conn.send(fullPayload);
      } catch (e) {
        console.warn("WebRTC send uyarısı:", e);
      }
    }

    // 2. Kritik Oyun Aksiyonları & Firebase Modunda Buluta Yaz
    const isCritical = (
      this.transport === 'firebase' ||
      payload.type === 'handshake' ||
      payload.type === 'striker_shot' ||
      payload.type === 'round_result' ||
      payload.type === 'role_swap' ||
      payload.type === 'match_end' ||
      payload.type === 'switch_mode' ||
      payload.type === 'coop_pass' ||
      payload.type === 'coop_shot' ||
      payload.type === 'coop_result' ||
      payload.type === 'coop_round_advance' ||
      payload.type === 'coop_match_end'
    );

    if (isCritical) {
      const channelName = this.isHost ? 'hostMsg' : 'guestMsg';
      fetch(`${this.firebaseDbUrl}/rooms/${this.roomCode}/channel/${channelName}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullPayload)
      }).catch(err => console.warn("Firebase kanal iletim uyarısı:", err));
    }
  }

  // Gelen Veriyi İşle (Çift Paket ve Yankı Koruması ile)
  handleIncomingData(data) {
    if (!data || !data.type) return;
    if (data.senderId === this.playerId) return; // Kendi yankını atla

    // Sıralı paket filtreleme (aynı paketi iki kez çalıştırma)
    if (data.seq) {
      const key = data.senderId || 'remote';
      if (this.lastReceivedSeq[key] && data.seq <= this.lastReceivedSeq[key]) {
        return; // Zaten işlendi
      }
      this.lastReceivedSeq[key] = data.seq;
    }

    switch (data.type) {
      case 'handshake':
        this.remotePlayerName = data.name || this.remotePlayerName;
        if (!this.isHost && data.gameMode) {
          this.gameMode = data.gameMode;
          this.maxRounds = (this.gameMode === 'coop') ? 6 : 5;
        }
        if (data.careerProfile && window.careerManager) {
          window.careerManager.addOrUpdateOnlinePeer(data.careerProfile);
        }
        break;

      case 'switch_mode':
        this.switchGameMode(data.mode, false);
        break;

      case 'gk_position':
        if (this.myRole === 'striker' && this.game && this.game.playerModels) {
          this.game.playerModels.setGoalkeeperManualPosition(data.xRatio, data.yRatio !== undefined ? data.yRatio : 0.5, data.isDiving);
        }
        break;

      case 'striker_shot':
        if (this.myRole === 'goalkeeper' && this.game && this.game.ball) {
          if (data.foot && this.game.currentFoot) this.game.currentFoot = data.foot;
          if (data.shotType && this.game.shotType) this.game.shotType = data.shotType;

          if (this.game.playerModels) {
            this.game.playerModels.triggerKickAnimation(() => {
              this.game.ball.shoot(data.dirX, data.dirY, data.power, data.curl);
              this.game.updateSpeedHUD(data.power);
            }, data.isTrivela);
          } else {
            this.game.ball.shoot(data.dirX, data.dirY, data.power, data.curl);
            this.game.updateSpeedHUD(data.power);
          }
        }
        break;

      case 'round_result':
        this.applyRoundOutcome(data.outcome, data.scorer);
        break;

      case 'role_swap':
        this.currentRound = data.round;
        this.myRole = (this.myRole === 'striker') ? 'goalkeeper' : 'striker';
        this.setupCurrentRound();
        break;

      case 'match_end':
        this.showOnlineGameOverModal(data.winner);
        break;

      case 'coop_player_pos':
        if (this.game && this.game.playerModels && this.game.playerModels.teammate) {
          const tm = this.game.playerModels.teammate;
          tm.group.position.x = THREE.MathUtils.lerp(tm.group.position.x, data.x, 0.45);
          tm.group.position.z = THREE.MathUtils.lerp(tm.group.position.z, data.z, 0.45);
          tm.group.rotation.y = data.rotY;
          this.game.playerModels.updateRunningAnimation(tm, data.isMoving, data.isSprinting, 0.035);

          if (data.hasBall && this.game.ball && !this.game.ball.isMoving) {
            const fX = Math.sin(data.rotY);
            const fZ = Math.cos(data.rotY);
            this.game.ball.position.x = data.x + fX * 0.48;
            this.game.ball.position.z = data.z + fZ * 0.48;
            this.game.ball.position.y = this.game.ball.radius;
            this.game.ball.mesh.position.copy(this.game.ball.position);
            this.game.ball.shadow.position.set(this.game.ball.position.x, 0.015, this.game.ball.position.z);
          }
        }
        break;

      case 'coop_pass':
        if (this.game) {
          this.game.receiveCoopPass(data);
        }
        break;

      case 'coop_shot':
        if (this.game) {
          this.game.receiveCoopShot(data);
        }
        break;

      case 'coop_result':
        if (this.game) {
          this.coopScore = data.coopScore || this.coopScore;
          if (data.outcome === 'goal') {
            this.game.showGoalBanner("GOOOOOOL! HARİKA HÜCUM ORGANİZASYONU! 🚀");
            if (window.uiManager) window.uiManager.launchConfetti();
          } else if (data.outcome === 'save') {
            this.game.showGoalBanner("BOT KALECİ ÇIKARDI! KORNER!");
          } else {
            this.game.showGoalBanner("TOP AZ FARKLA DIŞARIDA!");
          }
          this.updateCoopScoreDisplay();
        }
        break;

      case 'coop_round_advance':
        this.currentRound = data.round;
        if (data.coopScore) this.coopScore = data.coopScore;
        this.setupCurrentRound();
        break;

      case 'coop_match_end':
        if (data.coopScore) this.coopScore = data.coopScore;
        this.showCoopGameOverModal(this.coopScore);
        break;
    }
  }

  // ==========================================================
  // ONLINE MAÇI BAŞLAT VE TURLARI KUR
  // ==========================================================
  startOnlineMatch() {
    const modalEl = document.getElementById('online-modal');
    if (modalEl) modalEl.classList.add('hidden');

    this.currentRound = 1;
    this.score = { host: 0, guest: 0 };
    this.coopScore = { goals: 0, attempts: 0 };
    this.maxRounds = (this.gameMode === 'coop') ? 6 : 5;

    this.updateModeToggleBtnUI();
    this.setupCurrentRound();
  }

  setupCurrentRound() {
    if (!this.game) return;

    if (this.gameMode === 'coop') {
      this.setupCoopCurrentRound();
      return;
    }

    // 1v1 DÜELLO SENARYOSU
    const isStriker = (this.myRole === 'striker');
    const roleText = isStriker ? "⚡ ŞUT ÇEKEN (FORVET)" : "🧤 KALEYİ KORU (KALECİ)";

    const scenario = {
      type: (this.currentRound % 2 === 1) ? 'freekick' : 'penalty',
      title: `ONLINE 1v1 - TUR ${this.currentRound}/${this.maxRounds}`,
      desc: isStriker ? `Top senin elinde! Kaleciyi avla!` : `Rakip topun başında! Köşeyi kapat ve uç!`,
      distance: (this.currentRound % 2 === 1) ? 23 : 11
    };

    this.updateOnlineHUD(scenario, roleText);
    if (this.game.career && this.game.career.player) {
      this.game.career.player.position = isStriker ? 'ST' : 'GK';
    }
    this.game.setupScenario(scenario);
  }

  setupCoopCurrentRound() {
    const scenIdx = (this.currentRound - 1) % COOP_SCENARIOS.length;
    const scen = COOP_SCENARIOS[scenIdx];

    const isHostPasser = (this.currentRound % 2 === 1);
    this.myRole = (this.isHost ? isHostPasser : !isHostPasser) ? 'passer' : 'shooter';

    const roleTitle = (this.myRole === 'passer') ? scen.roleTitle1 : scen.roleTitle2;
    const roleDesc = (this.myRole === 'passer') ? scen.roleDesc1 : scen.roleDesc2;

    this.updateCoopHUD(scen, roleTitle, roleDesc);
    this.game.setupCoopScenario(scen, this.myRole);
  }

  // 1v1 Veri Gönderimleri
  sendGoalkeeperMove(xRatio, yRatio = 0.5, isDiving = false) {
    if (this.isOnlineMatch && this.myRole === 'goalkeeper') {
      this.send({
        type: 'gk_position',
        xRatio: xRatio,
        yRatio: yRatio,
        isDiving: isDiving
      });
    }
  }

  sendShot(dirX, dirY, power, curl, isTrivela = false, foot = 'right', shotType = 'normal') {
    if (this.isOnlineMatch && this.myRole === 'striker') {
      this.send({
        type: 'striker_shot',
        dirX: dirX,
        dirY: dirY,
        power: power,
        curl: curl,
        isTrivela: isTrivela,
        foot: foot,
        shotType: shotType
      });
    }
  }

  // Co-op Veri Gönderimleri
  throttleSendPlayerPos(pos, rotY, isMoving, isSprinting, hasBall) {
    if (!this.isOnlineMatch || !this.connected) return;
    const now = performance.now();
    const interval = (this.transport === 'webrtc') ? 40 : 80;
    if (this._lastPosSend && (now - this._lastPosSend) < interval) return;
    this._lastPosSend = now;

    this.send({
      type: 'coop_player_pos',
      x: Math.round(pos.x * 100) / 100,
      z: Math.round(pos.z * 100) / 100,
      rotY: Math.round(rotY * 100) / 100,
      isMoving: isMoving,
      isSprinting: isSprinting,
      hasBall: hasBall
    });
  }

  sendCoopPass(targetPos, power, curl, arcHeight, flightDuration) {
    if (this.isOnlineMatch && this.gameMode === 'coop') {
      this.send({
        type: 'coop_pass',
        targetPos: targetPos,
        power: power,
        curl: curl,
        arcHeight: arcHeight,
        flightDuration: flightDuration
      });
    }
  }

  sendCoopShot(dirX, dirY, power, curl, shotType = 'ground') {
    if (this.isOnlineMatch && this.gameMode === 'coop') {
      this.send({
        type: 'coop_shot',
        dirX: dirX,
        dirY: dirY,
        power: power,
        curl: curl,
        shotType: shotType
      });
    }
  }

  reportCoopOutcome(outcome) {
    if (!this.isOnlineMatch || this.gameMode !== 'coop') return;

    if (this.isHost) {
      this.applyCoopOutcome(outcome);
      this.send({
        type: 'coop_result',
        outcome: outcome,
        coopScore: this.coopScore
      });
    }
  }

  applyCoopOutcome(outcome) {
    this.coopScore.attempts++;
    if (outcome === 'goal') {
      this.coopScore.goals++;
    }

    this.updateCoopScoreDisplay();

    setTimeout(() => {
      if (this.isHost) {
        if (this.currentRound < this.maxRounds) {
          this.currentRound++;
          this.send({
            type: 'coop_round_advance',
            round: this.currentRound,
            coopScore: this.coopScore
          });
          this.setupCurrentRound();
        } else {
          this.send({
            type: 'coop_match_end',
            coopScore: this.coopScore
          });
          this.showCoopGameOverModal(this.coopScore);
        }
      }
    }, 2500);
  }

  reportOutcome(outcome) {
    if (!this.isOnlineMatch || this.gameMode === 'coop') return;

    const scorer = (this.myRole === 'striker') ? (this.isHost ? 'host' : 'guest') : (this.isHost ? 'guest' : 'host');

    if (this.isHost) {
      this.applyRoundOutcome(outcome, scorer);
      this.send({
        type: 'round_result',
        outcome: outcome,
        scorer: scorer
      });
    }
  }

  applyRoundOutcome(outcome, scorer) {
    if (outcome === 'goal') {
      if (scorer === 'host') this.score.host++;
      else this.score.guest++;
    }

    this.updateOnlineScoreDisplay();

    setTimeout(() => {
      if (this.isHost) {
        if (this.currentRound < this.maxRounds) {
          this.currentRound++;
          this.myRole = (this.myRole === 'striker') ? 'goalkeeper' : 'striker';
          this.send({
            type: 'role_swap',
            round: this.currentRound
          });
          this.setupCurrentRound();
        } else {
          let winner = 'draw';
          if (this.score.host > this.score.guest) winner = 'host';
          else if (this.score.guest > this.score.host) winner = 'guest';

          this.send({ type: 'match_end', winner: winner });
          this.showOnlineGameOverModal(winner);
        }
      }
    }, 2400);
  }

  // HUD GÜNCELLEMELERİ
  updateOnlineHUD(scenario, roleText) {
    const titleEl = document.getElementById('hud-scenario-title');
    const descEl = document.getElementById('hud-scenario-desc');
    const distEl = document.getElementById('hud-match-distance');

    if (titleEl) titleEl.innerText = scenario.title;
    if (descEl) descEl.innerHTML = `<b style="color: #00f2fe;">${roleText}</b> - ${scenario.desc}`;
    if (distEl) distEl.innerText = scenario.distance + 'm';

    this.updateOnlineScoreDisplay();
  }

  updateCoopHUD(scen, roleTitle, roleDesc) {
    const titleEl = document.getElementById('hud-scenario-title');
    const descEl = document.getElementById('hud-scenario-desc');
    const distEl = document.getElementById('hud-match-distance');

    if (titleEl) titleEl.innerText = `TUR ${this.currentRound}/${this.maxRounds}: ${scen.title}`;
    if (descEl) descEl.innerHTML = `<b style="color: #00ff88;">${roleTitle}</b> - ${roleDesc}`;
    if (distEl) distEl.innerText = `${Math.round(scen.passerPos.z)}m`;

    this.updateCoopScoreDisplay();
  }

  updateOnlineScoreDisplay() {
    const homeTeamEl = document.getElementById('hud-team-home');
    const awayTeamEl = document.getElementById('hud-team-away');
    const scoreEl = document.getElementById('hud-score-display');

    if (homeTeamEl) homeTeamEl.innerText = this.isHost ? this.localPlayerName : this.remotePlayerName;
    if (awayTeamEl) awayTeamEl.innerText = this.isHost ? this.remotePlayerName : this.localPlayerName;
    if (scoreEl) scoreEl.innerText = `${this.score.host} - ${this.score.guest}`;
  }

  updateCoopScoreDisplay() {
    const homeTeamEl = document.getElementById('hud-team-home');
    const awayTeamEl = document.getElementById('hud-team-away');
    const scoreEl = document.getElementById('hud-score-display');

    if (homeTeamEl) homeTeamEl.innerText = "TAKIM";
    if (awayTeamEl) awayTeamEl.innerText = "GOL";
    if (scoreEl) scoreEl.innerText = `${this.coopScore.goals} / ${this.coopScore.attempts}`;
  }

  // OYUN BİTTİ EKRANLARI
  showOnlineGameOverModal(winner) {
    const isWinner = (winner === 'host' && this.isHost) || (winner === 'guest' && !this.isHost);
    const isDraw = (winner === 'draw');

    const modal = document.getElementById('online-result-modal');
    const title = document.getElementById('online-result-title');
    const text = document.getElementById('online-result-text');
    const score = document.getElementById('online-result-score');

    if (isDraw) {
      title.innerText = "🤝 DOSTLUK KAZANDI: BERABERE!";
      title.style.color = "#f1c40f";
      text.innerText = "Nefes kesen penaltı düellosu berabere bitti!";
    } else if (isWinner) {
      title.innerText = "🏆 ŞAMPİYON SENSİN! TEBRİKLER!";
      title.style.color = "#00ff88";
      text.innerText = `${this.remotePlayerName} karşısında sahadan zaferle ayrıldın!`;
      if (window.uiManager) window.uiManager.launchConfetti();
    } else {
      title.innerText = "🥈 MAÇ BİTTİ!";
      title.style.color = "#e74c3c";
      text.innerText = `Bu sefer ${this.remotePlayerName} galip geldi!`;
    }

    if (score) score.innerText = `${this.score.host} - ${this.score.guest}`;
    if (modal) modal.classList.remove('hidden');

    const btnRematch = document.getElementById('btn-online-rematch');
    if (btnRematch) {
      btnRematch.onclick = () => {
        window.location.reload();
      };
    }
  }

  showCoopGameOverModal(score) {
    const modal = document.getElementById('online-result-modal');
    const title = document.getElementById('online-result-title');
    const text = document.getElementById('online-result-text');
    const scoreEl = document.getElementById('online-result-score');

    const successRate = Math.round((score.goals / Math.max(1, score.attempts)) * 100);
    title.innerText = "🤝 EFSANE İKİLİ! HÜCUM TAMAMLANDI!";
    title.style.color = "#00ff88";
    if (scoreEl) scoreEl.innerText = `${score.goals} / ${score.attempts} GOL`;

    if (successRate >= 75) {
      text.innerText = `⭐⭐⭐ MÜTHİŞ UYUM! %${successRate} başarı oranıyla dünya çapında bir hücum tandemi oldunuz! Bot kaleciyi çaresiz bıraktınız!`;
    } else if (successRate >= 45) {
      text.innerText = `⭐⭐ HARİKA PERFORMANS! %${successRate} başarı oranıyla harika organizasyonlar yaptınız!`;
    } else {
      text.innerText = `⭐ İYİ MÜCADELE! %${successRate} başarı oranı. Bir dahaki sefere daha keskin vuruşlarla 90'ı avlayın!`;
    }

    if (window.uiManager && score.goals > 0) window.uiManager.launchConfetti();
    if (modal) modal.classList.remove('hidden');

    const btnRematch = document.getElementById('btn-online-rematch');
    if (btnRematch) {
      btnRematch.onclick = () => {
        window.location.reload();
      };
    }
  }

  // ==========================================================
  // CANLI MOD DEĞİŞTİRME METODLARI
  // ==========================================================
  toggleGameMode() {
    if (!this.isOnlineMatch) return;
    const nextMode = (this.gameMode === 'duel') ? 'coop' : 'duel';
    this.switchGameMode(nextMode, true);
  }

  switchGameMode(newMode, broadcast = true) {
    this.gameMode = newMode;
    this.currentRound = 1;
    this.score = { host: 0, guest: 0 };
    this.coopScore = { goals: 0, attempts: 0 };
    this.maxRounds = (this.gameMode === 'coop') ? 6 : 5;

    this.updateModeToggleBtnUI();

    if (broadcast) {
      this.send({
        type: 'switch_mode',
        mode: newMode
      });
    }

    const modeTitle = (newMode === 'coop') 
      ? "🤝 2 KİŞİLİK EŞLİ HÜCUM (BOT KALECİYE KARŞI)" 
      : "🧤 1v1 DÜELLO (FORVET VS KALECİ)";

    if (this.game) {
      this.game.showGoalBanner("🎮 MOD: " + modeTitle);
      this.setupCurrentRound();
    }
  }

  updateModeToggleBtnUI() {
    const btnToggle = document.getElementById('btn-online-mode-toggle');
    if (!btnToggle) return;

    if (!this.isOnlineMatch) {
      btnToggle.style.display = 'none';
      return;
    }

    btnToggle.style.display = 'inline-flex';
    if (this.gameMode === 'coop') {
      btnToggle.innerHTML = `🔄 MODU DEĞİŞTİR: 🧤 1v1 DÜELLO`;
      btnToggle.title = "Tıkla ve 1v1 Düello Moduna Geç (Forvet vs Kaleci)";
      btnToggle.className = "hud-btn online-mode-toggle-btn coop-active";
    } else {
      btnToggle.innerHTML = `🔄 MODU DEĞİŞTİR: 🤝 2 KİŞİLİK EŞLİ HÜCUM`;
      btnToggle.title = "Tıkla ve 2 Kişilik Eşli Hücum Moduna Geç (Bot Kaleciye Karşı)";
      btnToggle.className = "hud-btn online-mode-toggle-btn duel-active";
    }
  }

  toggleHostLobbyMode() {
    this.gameMode = (this.gameMode === 'duel') ? 'coop' : 'duel';
    this.updateHostWaitingModeUI();
    const modeCards = document.querySelectorAll('.online-mode-card');
    modeCards.forEach(c => {
      if (c.getAttribute('data-mode') === this.gameMode) {
        c.classList.add('selected');
      } else {
        c.classList.remove('selected');
      }
    });

    if (this.isHost && this.roomCode) {
      fetch(`${this.firebaseDbUrl}/rooms/${this.roomCode}/gameMode.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.gameMode)
      }).catch(() => {});
    }
  }

  updateHostWaitingModeUI() {
    const badge = document.getElementById('host-waiting-mode-badge');
    if (badge) {
      if (this.gameMode === 'coop') {
        badge.innerHTML = "🤝 2 KİŞİLİK EŞLİ HÜCUM (BOT KALECİ)";
        badge.style.color = "#00ff88";
      } else {
        badge.innerHTML = "🧤 1v1 DÜELLO (KALECİ & FORVET)";
        badge.style.color = "#00f2fe";
      }
    }
  }

  // ARAYÜZ GÜNCELLEMELERİ
  showHostWaitingUI(code) {
    const codeDisplay = document.getElementById('host-room-code-display');
    const waitingBox = document.getElementById('host-waiting-box');
    const initBox = document.getElementById('host-init-box');

    if (codeDisplay) codeDisplay.innerText = code;
    if (waitingBox) waitingBox.classList.remove('hidden');
    if (initBox) initBox.classList.add('hidden');

    this.updateHostWaitingModeUI();
    const modeName = (this.gameMode === 'coop') ? "2 Kişilik Eşli Hücum" : "1v1 Düello";
    this.updateStatusText(`[${modeName}] Oda Kodu #${code} hazır! Arkadaşın bekleniyor...`, "waiting");

    const shareUrl = `${window.location.origin}${window.location.pathname}?room=${code}`;
    const copyBtn = document.getElementById('btn-copy-room-link');
    if (copyBtn) {
      copyBtn.onclick = () => {
        navigator.clipboard.writeText(shareUrl).then(() => {
          copyBtn.innerText = "✅ LİNK KOPYALANDI!";
          setTimeout(() => { copyBtn.innerText = "📋 ODA LİNKİNİ KOPYALA"; }, 2000);
        }).catch(() => {
          copyBtn.innerText = `KOD: ${code}`;
        });
      };
    }
  }

  updateStatusText(msg, type = "normal") {
    const statusEl = document.getElementById('online-connection-status');
    if (!statusEl) return;
    statusEl.innerText = msg;
    statusEl.className = `online-status-badge status-${type}`;
  }
}

// Pencere kapanırken host odasını temizle
window.addEventListener('beforeunload', () => {
  if (window.onlineManager) {
    window.onlineManager.cleanup(true);
  }
});

window.onlineManager = new OnlineManager();
