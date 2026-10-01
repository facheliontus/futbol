// ==========================================================
// ONLINE ÇOK OYUNCULU ODA SİSTEMİ (online.js)
// 1v1 Düello (Forvet vs Kaleci) & 2 Kişilik Eşli Hücum (Co-op vs Bot Kaleci)
// WebRTC & PeerJS ile Sıfır Sunucu Maliyeti, Ultra Düşük Gecikme
// Vercel üzerinde %100 sorunsuz çalışır!
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

class OnlineManager {
  constructor() {
    this.peer = null;
    this.conn = null;
    this.isHost = false;
    this.roomCode = null;
    this.connected = false;
    this.isOnlineMatch = false;

    // Oyun Modu: 'duel' (1v1) veya 'coop' (2 Kişilik Eşli Hücum)
    this.gameMode = 'duel';

    // Online Maç Durumu
    this.myRole = 'striker'; // duel için: 'striker'/'goalkeeper', coop için: 'passer'/'shooter'
    this.localPlayerName = 'Oyuncu 1';
    this.remotePlayerName = 'Oyuncu 2';
    this.currentRound = 1;
    this.maxRounds = 5;
    this.score = { host: 0, guest: 0 };
    this.coopScore = { goals: 0, attempts: 0 };
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

    // Seçili modu arayüzden al
    const coopCard = document.querySelector('.online-mode-card[data-mode="coop"]');
    if (coopCard && coopCard.classList.contains('selected')) {
      this.gameMode = 'coop';
      this.myRole = 'passer';
      this.maxRounds = 6;
    } else {
      this.gameMode = 'duel';
      this.myRole = 'striker';
      this.maxRounds = 5;
    }

    const peerId = this.getPeerIdFromCode(this.roomCode);
    this.updateStatusText("Peer ağına bağlanılıyor...", "waiting");

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

    this.localPlayerName = playerName || 'Misafir';
    this.roomCode = code.trim().toUpperCase();
    this.isHost = false;
    const targetPeerId = this.getPeerIdFromCode(this.roomCode);

    this.updateStatusText(`Odaya bağlanılıyor: ${this.roomCode}...`, "waiting");

    if (this.peer) this.peer.destroy();

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

      // İsim ve Oyun Modu Bilgisini Gönder
      this.send({
        type: 'handshake',
        name: this.localPlayerName,
        isHost: this.isHost,
        gameMode: this.gameMode
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
      alert("Arkadaşınız oyundan ayrıldı veya bağlantı koptu!");
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
        if (!this.isHost && data.gameMode) {
          this.gameMode = data.gameMode;
          this.maxRounds = (this.gameMode === 'coop') ? 6 : 5;
        }
        break;

      // 1v1 DÜELLO VERİLERİ
      case 'gk_position':
        if (this.myRole === 'striker' && this.game && this.game.playerModels) {
          this.game.playerModels.setGoalkeeperManualPosition(data.xRatio, data.yRatio !== undefined ? data.yRatio : 0.5, data.isDiving);
        }
        break;

      case 'striker_shot':
        if (this.myRole === 'goalkeeper' && this.game && this.game.ball) {
          this.game.playerModels.triggerKickAnimation(() => {
            this.game.ball.shoot(data.dirX, data.dirY, data.power, data.curl);
            this.game.updateSpeedHUD(data.power);
          });
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

      // CO-OP 2 KİŞİLİK EŞLİ HÜCUM VERİLERİ
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

  // ONLINE MAÇI BAŞLAT
  startOnlineMatch() {
    const modalEl = document.getElementById('online-modal');
    if (modalEl) modalEl.classList.add('hidden');

    this.currentRound = 1;
    this.score = { host: 0, guest: 0 };
    this.coopScore = { goals: 0, attempts: 0 };
    this.maxRounds = (this.gameMode === 'coop') ? 6 : 5;

    this.setupCurrentRound();
  }

  // Tur Senaryosunu Kur
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
    this.game.career.player.position = isStriker ? 'ST' : 'GK';
    this.game.setupScenario(scenario);
  }

  // CO-OP EŞLİ HÜCUM SENARYOSU
  setupCoopCurrentRound() {
    const scenIdx = (this.currentRound - 1) % COOP_SCENARIOS.length;
    const scen = COOP_SCENARIOS[scenIdx];

    // Tek turlarda Host pasör, Çift turlarda Guest pasör
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

  // Co-op Veri Gönderimleri
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

  sendCoopShot(dirX, dirY, power, curl) {
    if (this.isOnlineMatch && this.gameMode === 'coop') {
      this.send({
        type: 'coop_shot',
        dirX: dirX,
        dirY: dirY,
        power: power,
        curl: curl
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

  // 1v1 Tur Sonucunu Bildir
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

  // ARAYÜZ GÜNCELLEMELERİ
  showHostWaitingUI(code) {
    document.getElementById('host-room-code-display').innerText = code;
    document.getElementById('host-waiting-box').classList.remove('hidden');
    document.getElementById('host-init-box').classList.add('hidden');
    const modeName = (this.gameMode === 'coop') ? "2 Kişilik Eşli Hücum" : "1v1 Düello";
    this.updateStatusText(`[${modeName}] Oda Kodu hazır! Arkadaşın bekleniyor...`, "waiting");

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
