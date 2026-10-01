// ==========================================================
// ONLINE ÇOK OYUNCULU ODA SİSTEMİ (online.js)
// WebRTC & PeerJS ile Sıfır Sunucu Maliyeti, Ultra Düşük Gecikme
// Vercel üzerinde %100 sorunsuz çalışır!
// ==========================================================

class OnlineManager {
  constructor() {
    this.peer = null;
    this.conn = null;
    this.isHost = false;
    this.roomCode = null;
    this.connected = false;
    this.isOnlineMatch = false;

    // Online Maç Durumu
    this.myRole = 'striker'; // 'striker' (şut çeken) veya 'goalkeeper' (kaleci)
    this.localPlayerName = 'Oyuncu 1';
    this.remotePlayerName = 'Rakip';
    this.currentRound = 1;
    this.maxRounds = 5;
    this.score = { host: 0, guest: 0 };
    this.game = null;

    // URL parametresinden otomatik oda kodu kontrolü (örn: ?room=8472)
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
          const modalEl = document.getElementById('online-modal');
          if (modalEl) modalEl.classList.remove('hidden');
        }, 300);
      }
    } catch (e) {
      console.warn("URL Parametresi okunamadı:", e);
    }
  }

  // 4 Haneli Oda Kodu Üret (Örn: 7492)
  generateRoomCode() {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  getPeerIdFromCode(code) {
    return `fc3d-duel-${code.trim().toUpperCase()}`;
  }

  // 1. ODA OLUŞTUR (HOST)
  createRoom(playerName) {
    this.localPlayerName = playerName || 'Ev Sahibi';
    this.roomCode = this.generateRoomCode();
    this.isHost = true;
    this.myRole = 'striker'; // Host ilk turda şut çeker
    const peerId = this.getPeerIdFromCode(this.roomCode);

    this.updateStatusText("Peer ağına bağlanılıyor...", "waiting");

    // PeerJS Bağlantısı (Güvenilir açık bulut sinyalleme sunucusu)
    if (this.peer) this.peer.destroy();

    this.peer = new Peer(peerId, {
      debug: 1,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      }
    });

    this.peer.on('open', (id) => {
      console.log('Host Peer hazır:', id);
      this.showHostWaitingUI(this.roomCode);
    });

    this.peer.on('connection', (conn) => {
      this.conn = conn;
      this.setupConnectionHandlers();
    });

    this.peer.on('error', (err) => {
      console.error('Peer hatası:', err);
      if (err.type === 'unavailable-id') {
        // Kod çakışması olursa yeni kod dene
        this.createRoom(playerName);
      } else {
        this.updateStatusText("Bağlantı hatası: " + err.type, "error");
      }
    });
  }

  // 2. ODAYA KATIL (GUEST)
  joinRoom(code, playerName) {
    if (!code || code.length < 3) {
      alert("Lütfen geçerli bir 4 haneli oda kodu girin!");
      return;
    }

    this.localPlayerName = playerName || 'Deplasman';
    this.roomCode = code.trim().toUpperCase();
    this.isHost = false;
    this.myRole = 'goalkeeper'; // Misafir ilk turda kaleci olur
    const targetPeerId = this.getPeerIdFromCode(this.roomCode);

    this.updateStatusText(`Odaya bağlanılıyor: ${this.roomCode}...`, "waiting");

    if (this.peer) this.peer.destroy();

    // Misafir rastgele peer ID ile bağlanır
    this.peer = new Peer({
      debug: 1,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      }
    });

    this.peer.on('open', () => {
      console.log('Misafir Peer açıldı, bağlanılıyor:', targetPeerId);
      this.conn = this.peer.connect(targetPeerId, { reliable: true });
      this.setupConnectionHandlers();
    });

    this.peer.on('error', (err) => {
      console.error('Katılma hatası:', err);
      this.updateStatusText("Odaya bağlanılamadı. Kodu kontrol edin!", "error");
    });
  }

  // WebRTC P2P Bağlantı Olayları
  setupConnectionHandlers() {
    this.conn.on('open', () => {
      this.connected = true;
      this.isOnlineMatch = true;
      console.log('Online P2P Bağlantısı Kuruldu!');

      // İsim takası yap
      this.send({
        type: 'handshake',
        name: this.localPlayerName,
        isHost: this.isHost
      });

      this.updateStatusText("RAKİP BAĞLANDI! MAÇ BAŞLIYOR...", "success");

      setTimeout(() => {
        this.startOnlineMatch();
      }, 1200);
    });

    this.conn.on('data', (data) => {
      this.handleIncomingData(data);
    });

    this.conn.on('close', () => {
      this.connected = false;
      this.isOnlineMatch = false;
      alert("Rakip oyundan ayrıldı veya bağlantı koptu!");
      window.location.reload();
    });
  }

  // Veri Gönder
  send(payload) {
    if (this.conn && this.conn.open) {
      this.conn.send(payload);
    }
  }

  // Gelen Veriyi İşle
  handleIncomingData(data) {
    switch (data.type) {
      case 'handshake':
        this.remotePlayerName = data.name;
        break;

      case 'gk_position':
        // Kaleci fare hareketini gerçek zamanlı senkronize et
        if (this.myRole === 'striker' && this.game && this.game.playerModels) {
          this.game.playerModels.setGoalkeeperManualPosition(data.xRatio, data.isDiving);
        }
        break;

      case 'striker_shot':
        // Rakip şut çektiğinde topu ateşle
        if (this.myRole === 'goalkeeper' && this.game && this.game.ball) {
          this.game.playerModels.triggerKickAnimation(() => {
            this.game.ball.shoot(data.dirX, data.dirY, data.power, data.curl);
            this.game.updateSpeedHUD(data.power);
          });
        }
        break;

      case 'round_result':
        // Tur sonucu (gol / kurtarış)
        this.applyRoundOutcome(data.outcome, data.scorer);
        break;

      case 'role_swap':
        // Rol değişimi
        this.currentRound = data.round;
        this.myRole = (this.myRole === 'striker') ? 'goalkeeper' : 'striker';
        this.setupCurrentRound();
        break;

      case 'match_end':
        this.showOnlineGameOverModal(data.winner);
        break;
    }
  }

  // ONLINE MAÇI BAŞLAT
  startOnlineMatch() {
    // Online menüsünü gizle
    const modalEl = document.getElementById('online-modal');
    if (modalEl) modalEl.classList.add('hidden');

    this.currentRound = 1;
    this.score = { host: 0, guest: 0 };

    this.setupCurrentRound();
  }

  // Tur Senaryosunu Kur
  setupCurrentRound() {
    if (!this.game) return;

    const isStriker = (this.myRole === 'striker');
    const roleText = isStriker ? "⚡ ŞUT ÇEKEN (FORVET)" : "🧤 KALEYİ KORU (KALECİ)";
    
    // Skorboard ve Başlıkları Güncelle
    const scenario = {
      type: (this.currentRound % 2 === 1) ? 'freekick' : 'penalty',
      title: `ONLINE DÜELLO - TUR ${this.currentRound}/${this.maxRounds}`,
      desc: isStriker ? `Top senin elinde! Kaleciyi avla!` : `Rakip topun başında! Köşeyi kapat ve uç!`,
      distance: (this.currentRound % 2 === 1) ? 23 : 11
    };

    // HUD'da rolleri ve online skoru göster
    this.updateOnlineHUD(scenario, roleText);

    // Kendi kariyer mevkini geçici olarak ayarla
    this.game.career.player.position = isStriker ? 'ST' : 'GK';
    this.game.setupScenario(scenario);
  }

  // Kaleci fare pozisyonunu rakibe canlı akıt (60 FPS)
  sendGoalkeeperMove(xRatio, isDiving = false) {
    if (this.isOnlineMatch && this.myRole === 'goalkeeper') {
      this.send({
        type: 'gk_position',
        xRatio: xRatio,
        isDiving: isDiving
      });
    }
  }

  // Şut parametrelerini rakibe gönder
  sendShot(dirX, dirY, power, curl) {
    if (this.isOnlineMatch && this.myRole === 'striker') {
      this.send({
        type: 'striker_shot',
        dirX: dirX,
        dirY: dirY,
        power: power,
        curl: curl
      });
    }
  }

  // Tur Sonucunu Bildir (Gol / Kaçtı / Kurtarıldı)
  reportOutcome(outcome) {
    if (!this.isOnlineMatch) return;

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

    // Turu tamamla ve rol değiştir
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
          // MAÇ BİTTİ
          let winner = 'draw';
          if (this.score.host > this.score.guest) winner = 'host';
          else if (this.score.guest > this.score.host) winner = 'guest';

          this.send({ type: 'match_end', winner: winner });
          this.showOnlineGameOverModal(winner);
        }
      }
    }, 2400);
  }

  updateOnlineHUD(scenario, roleText) {
    const titleEl = document.getElementById('hud-scenario-title');
    const descEl = document.getElementById('hud-scenario-desc');
    const distEl = document.getElementById('hud-match-distance');

    if (titleEl) titleEl.innerText = scenario.title;
    if (descEl) descEl.innerHTML = `<b style="color: #00f2fe;">${roleText}</b> - ${scenario.desc}`;
    if (distEl) distEl.innerText = scenario.distance + 'm';

    this.updateOnlineScoreDisplay();
  }

  updateOnlineScoreDisplay() {
    const homeTeamEl = document.getElementById('hud-team-home');
    const awayTeamEl = document.getElementById('hud-team-away');
    const scoreEl = document.getElementById('hud-score-display');

    if (homeTeamEl) homeTeamEl.innerText = this.isHost ? this.localPlayerName : this.remotePlayerName;
    if (awayTeamEl) awayTeamEl.innerText = this.isHost ? this.remotePlayerName : this.localPlayerName;
    if (scoreEl) scoreEl.innerText = `${this.score.host} - ${this.score.guest}`;
  }

  // OYUN BİTTİ EKRANI
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

  // ARAYÜZ GÜNCELLEMELERİ
  showHostWaitingUI(code) {
    document.getElementById('host-room-code-display').innerText = code;
    document.getElementById('host-waiting-box').classList.remove('hidden');
    document.getElementById('host-init-box').classList.add('hidden');
    this.updateStatusText("Oda Kodu hazır! Arkadaşın bekleniyor...", "waiting");

    // Paylaşım linki oluştur (Vercel veya yerel alan adı ile)
    const shareUrl = `${window.location.origin}${window.location.pathname}?room=${code}`;
    const copyBtn = document.getElementById('btn-copy-room-link');
    if (copyBtn) {
      copyBtn.onclick = () => {
        navigator.clipboard.writeText(shareUrl).then(() => {
          copyBtn.innerText = "✅ LİNK KOPYALANDI!";
          setTimeout(() => { copyBtn.innerText = "📋 ODA LİNKİNİ KOPYALA"; }, 2000);
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

window.onlineManager = new OnlineManager();
