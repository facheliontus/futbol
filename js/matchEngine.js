// ==========================================================
// 3D FUTBOL MAÇ MOTORU & GERÇEK ZAMANLI OYNANIŞ (matchEngine.js)
// FIFA / PES Tarzı 3D Maç, Akıcı Hareket, AI Takım, Şut Barı, Pas ve Turnuva Sistemi
// ==========================================================

const MATCH_STATE = {
  PRE_MATCH: 'PRE_MATCH',
  KICKOFF: 'KICKOFF',
  PLAYING: 'PLAYING',
  GOAL: 'GOAL',
  CELEBRATION: 'CELEBRATION',
  RESTART: 'RESTART',
  HALF_TIME: 'HALF_TIME',
  SECOND_HALF: 'SECOND_HALF',
  FULL_TIME: 'FULL_TIME',
  OUT_OF_BOUNDS: 'OUT_OF_BOUNDS'
};

const PLAYER_STATE = {
  IDLE: 'IDLE',
  RUN: 'RUN',
  SPRINT: 'SPRINT',
  CONTROL_BALL: 'CONTROL_BALL',
  PASS: 'PASS',
  SHOOT: 'SHOOT',
  TACKLE: 'TACKLE',
  RECOVER: 'RECOVER'
};

class MatchEngine {
  constructor() {
    this.isActive = false;
    this.isPaused = false;
    this.state = MATCH_STATE.PLAYING;
    this.mode = 'quick'; // 'quick', 'career', 'tournament', 'training'
    
    // Takım ve Maç Verileri
    this.homeTeam = null;
    this.awayTeam = null;
    this.homeScore = 0;
    this.awayScore = 0;
    this.matchTime = 0; // Saniye cinsinden
    this.matchDuration = 180; // 3 dakikalık maç (90 sanal dakikaya yayılır)
    this.half = 1; // 1: 1. Yarı, 2: 2. Yarı
    this.difficulty = 'normal'; // 'easy', 'normal', 'hard', 'legend'

    // Oyuncular
    this.homePlayers = [];
    this.awayPlayers = [];
    this.activePlayerIndex = 5; // Santrfor seçili
    this.ballCarrier = null; // Top ayağında olan oyuncu nesnesi
    this.lastTouchTeam = 'home';

    // Kontroller & Girdiler
    this.keys = {
      KeyW: false, KeyA: false, KeyS: false, KeyD: false,
      ArrowUp: false, ArrowLeft: false, ArrowDown: false, ArrowRight: false,
      ShiftLeft: false, ShiftRight: false,
      Space: false, KeyE: false, KeyR: false, KeyF: false, KeyQ: false, KeyC: false
    };

    // Şut Güç Barı
    this.isChargingShot = false;
    this.shotPower = 0; // 0 - 100
    this.shotChargeSpeed = 95; // %/sn

    // İstatistikler
    this.stats = {
      homeShots: 0, awayShots: 0,
      homeShotsOnTarget: 0, awayShotsOnTarget: 0,
      homePossessionTime: 0, awayPossessionTime: 0,
      homePasses: 0, awayPasses: 0,
      homeFouls: 0, awayFouls: 0,
      scorers: []
    };

    // Ses ve Kamera
    this.cameraMode = 'broadcast'; // 'broadcast', 'tactical', 'player'
    this.audioCtx = null;
    this.bannerTimer = null;
    this.restartTimer = null;

    this.initInputs();
  }

  // 1. KLAVYE VE KONTROL DİNLEYİCİLERİ
  initInputs() {
    window.addEventListener('keydown', (e) => {
      if (!this.isActive) return;

      if (e.code === 'Escape') {
        this.togglePause();
        return;
      }

      if (this.isPaused) return;

      if (this.keys.hasOwnProperty(e.code)) {
        this.keys[e.code] = true;
      }

      // [Q] Oyuncu Değiştir: Topa en yakın saha içi takım arkadaşına geç
      if (e.code === 'KeyQ') {
        this.switchActivePlayer();
      }

      // [Space] Şut Gücü Doldurmaya Başla
      if (e.code === 'Space' && !e.repeat) {
        if (this.isBallAtUserFeet()) {
          this.isChargingShot = true;
          this.shotPower = 0;
        }
      }

      // [E] Yerden Pas Ver
      if (e.code === 'KeyE') {
        if (this.isBallAtUserFeet()) {
          this.executePass(false);
        }
      }

      // [R] Ara Pas Ver
      if (e.code === 'KeyR') {
        if (this.isBallAtUserFeet()) {
          this.executePass(true);
        }
      }

      // [F] Yüksekten Orta Aç
      if (e.code === 'KeyF') {
        if (this.isBallAtUserFeet()) {
          this.executeCross();
        }
      }

      // [C] Çalım veya Müdahale / Top Koruma
      if (e.code === 'KeyC') {
        this.executeTackleOrSkill();
      }
    });

    window.addEventListener('keyup', (e) => {
      if (!this.isActive) return;

      if (this.keys.hasOwnProperty(e.code)) {
        this.keys[e.code] = false;
      }

      // [Space] Bırakıldığında Şut Çek
      if (e.code === 'Space' && this.isChargingShot) {
        this.isChargingShot = false;
        this.executeShot(this.shotPower);
        this.shotPower = 0;
        this.updateHUDPower(0);
      }
    });

    // Pencere odak kaybettiğinde veya sekme değiştiğinde tuşları sıfırla (Takılmayı tamamen önler)
    window.addEventListener('blur', () => this.resetKeys());
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.resetKeys();
    });
  }

  resetKeys() {
    for (const k in this.keys) {
      this.keys[k] = false;
    }
    if (this.isChargingShot) {
      this.isChargingShot = false;
      this.shotPower = 0;
      this.updateHUDPower(0);
    }
  }

  // 2. YENİ 3D MAÇ BAŞLAT (Quick Match / Kariyer / Turnuva)
  launchMatch(homeTeamData, awayTeamData, mode = 'quick', settings = {}) {
    this.isActive = true;
    this.isPaused = false;
    this.state = MATCH_STATE.PLAYING;
    this.mode = mode;
    this.homeTeam = homeTeamData || { name: 'Galatasaray', short: 'GS', logo: '🦁', color: 0xb81414 };
    this.awayTeam = awayTeamData || { name: 'Fenerbahçe', short: 'FB', logo: '🐦', color: 0x0c2461 };
    this.homeScore = 0;
    this.awayScore = 0;
    this.matchTime = 0;
    this.half = 1;
    this.difficulty = settings.difficulty || 'normal';
    this.matchDuration = settings.duration || 180;
    this.lastTouchTeam = 'home';

    // Platformu 3D Oyun görünümüne al
    if (window.platformManager) {
      window.platformManager.showView('game');
    }

    // Oyun HUD'ını Maç Formatına Güncelle
    this.setupMatchHUD();

    // 3D Sahneyi Temizle ve Takımları Yerleştir
    if (window.gameInstance) {
      const g = window.gameInstance;
      g.playerModels.clearAll();
      this.spawnTeams(g);
      this.resetBallToCenter(g);
    }

    this.playWhistle();
    this.showMatchBanner(`⚽ MAÇ BAŞLADI: ${this.homeTeam.name} vs ${this.awayTeam.name}`);
  }

  // HUD Arayüzünü Güncelle
  setupMatchHUD() {
    const homeEl = document.getElementById('hud-team-home');
    const awayEl = document.getElementById('hud-team-away');
    const scoreEl = document.getElementById('hud-score-display');
    const clockEl = document.getElementById('hud-match-distance');

    if (homeEl) homeEl.innerText = `${this.homeTeam.logo} ${this.homeTeam.name.toUpperCase()}`;
    if (awayEl) awayEl.innerText = `${this.awayTeam.logo} ${this.awayTeam.name.toUpperCase()}`;
    if (scoreEl) scoreEl.innerText = '0 - 0';
    if (clockEl) clockEl.innerText = '1. YARI 00:00';

    const hintEl = document.getElementById('hud-control-hint');
    if (hintEl) {
      hintEl.innerHTML = `🎮 <b>KONTROLLER:</b> [WASD] Koş | [Shift] Depar | [E] Pas | [R] Ara Pas | [F] Orta | [Space] Şut | [Q] Adam Değiştir | [C] Çalım/Kayma | [ESC] Duraklat`;
    }

    const p = this.homePlayers[this.activePlayerIndex];
    const nameEl = document.getElementById('hud-player-name');
    if (nameEl && p) nameEl.innerText = `${p.name} (#${p.num})`;
  }

  // 3. SAHAYA TAKIMLARI VE OYUNCULARI DİZ (6v6 Yüksek Tempolu Maç)
  spawnTeams(game) {
    this.homePlayers = [];
    this.awayPlayers = [];

    const homeColor = typeof this.homeTeam.color === 'number' ? this.homeTeam.color : parseInt(String(this.homeTeam.color).replace('#', '0x')) || 0xb81414;
    const awayColor = typeof this.awayTeam.color === 'number' ? this.awayTeam.color : parseInt(String(this.awayTeam.color).replace('#', '0x')) || 0x0c2461;

    // Ev Sahibi Takım Oyuncuları (Hücum yönü: +Z'den -Z'ye kaleye doğru)
    const homePositions = [
      { role: 'GK', x: 0, z: 46.5, num: 1, name: 'Kaleci Muslera' },
      { role: 'DEF', x: -8.5, z: 32, num: 4, name: 'Stoper Abdülkerim' },
      { role: 'DEF', x: 8.5, z: 32, num: 5, name: 'Stoper Davinson' },
      { role: 'MID', x: -6.5, z: 20, num: 8, name: 'Orta Saha Torreira' },
      { role: 'MID', x: 6.5, z: 20, num: 10, name: 'Orta Saha Sara' },
      { role: 'ATT', x: 0, z: 8.5, num: 9, name: 'Santrfor Osimhen' }
    ];

    homePositions.forEach((posData, idx) => {
      let p;
      if (posData.role === 'GK') {
        p = game.playerModels.createGoalkeeper(homeColor);
        p.group.position.set(posData.x, 0.11, posData.z);
        p.group.lookAt(0, 0, 0);
      } else {
        p = game.playerModels.createSingleDefender(new THREE.Vector3(posData.x, 0.11, posData.z), homeColor, posData.num, posData.name);
      }
      p.team = 'home';
      p.role = posData.role;
      p.name = posData.name;
      p.num = posData.num;
      p.isUserControlled = (idx === 5); // Başlangıçta forvet kullanıcıda
      p.speed = (posData.role === 'ATT') ? 9.6 : 8.2;
      p.stamina = 100;
      p.velocity = new THREE.Vector3(0, 0, 0);
      p.state = PLAYER_STATE.IDLE;
      p.basePos = new THREE.Vector3(posData.x, 0.11, posData.z);
      this.homePlayers.push(p);
    });

    this.activePlayerIndex = 5; // Santrfor seçili

    // Deplasman Takımı (Rakip AI - Z=0 kalesini savunur, +Z kalesine hücum eder)
    const awayPositions = [
      { role: 'GK', x: 0, z: 1.2, num: 1, name: 'Rakip GK Livakovic' },
      { role: 'DEF', x: -7.5, z: 11, num: 3, name: 'Rakip Defans Djiku' },
      { role: 'DEF', x: 7.5, z: 11, num: 2, name: 'Rakip Defans Becao' },
      { role: 'MID', x: -5.5, z: 23, num: 6, name: 'Rakip Orta Fred' },
      { role: 'MID', x: 5.5, z: 23, num: 7, name: 'Rakip Orta Szymanski' },
      { role: 'ATT', x: 0, z: 34, num: 11, name: 'Rakip Forvet Dzeko' }
    ];

    awayPositions.forEach((posData) => {
      let p;
      if (posData.role === 'GK') {
        p = game.playerModels.createSingleDefender(new THREE.Vector3(posData.x, 0.11, posData.z), 0x27ae60, posData.num, 'GK');
        p.group.position.set(posData.x, 0.11, posData.z);
        p.group.lookAt(0, 0, 50);
      } else {
        p = game.playerModels.createSingleDefender(new THREE.Vector3(posData.x, 0.11, posData.z), awayColor, posData.num, posData.name);
      }
      p.team = 'away';
      p.role = posData.role;
      p.name = posData.name;
      p.num = posData.num;
      p.isUserControlled = false;
      p.speed = 8.4;
      p.stamina = 100;
      p.velocity = new THREE.Vector3(0, 0, 0);
      p.state = PLAYER_STATE.IDLE;
      p.basePos = new THREE.Vector3(posData.x, 0.11, posData.z);
      this.awayPlayers.push(p);
    });
  }

  // Topu Santraya Yerleştir
  resetBallToCenter(game) {
    if (!game.ball) return;
    const centerPos = new THREE.Vector3(0, game.ball.radius, 20);
    game.ball.reset(centerPos);
    this.ballCarrier = this.homePlayers[this.activePlayerIndex];
    game.hasBallPossession = true;
    this.lastTouchTeam = 'home';
  }

  // 4. KULLANICI OYUNCU DEĞİŞTİRME ([Q] Tuşu)
  switchActivePlayer() {
    if (!window.gameInstance || !window.gameInstance.ball) return;
    const bPos = window.gameInstance.ball.position;

    let nearestIdx = 1;
    let minDist = 999;

    // Kaleci hariç topa en yakın takım arkadaşını bul
    for (let i = 1; i < this.homePlayers.length; i++) {
      const p = this.homePlayers[i];
      if (p.group) {
        const d = p.group.position.distanceTo(bPos);
        if (d < minDist && i !== this.activePlayerIndex) {
          minDist = d;
          nearestIdx = i;
        }
      }
    }

    if (this.homePlayers[this.activePlayerIndex]) {
      this.homePlayers[this.activePlayerIndex].isUserControlled = false;
    }

    this.activePlayerIndex = nearestIdx;
    this.homePlayers[this.activePlayerIndex].isUserControlled = true;

    // Altındaki göstergeyi güncelle
    if (window.gameInstance.playerModels) {
      window.gameInstance.playerModels.updateKickZone(
        this.homePlayers[this.activePlayerIndex].group.position,
        true,
        'active'
      );
    }

    // HUD'da aktif oyuncu adını göster
    const p = this.homePlayers[this.activePlayerIndex];
    const nameEl = document.getElementById('hud-player-name');
    if (nameEl) nameEl.innerText = `${p.name} (#${p.num})`;
  }

  // Kullanıcı oyuncusunun ayağında mı?
  isBallAtUserFeet() {
    if (!window.gameInstance || !window.gameInstance.ball) return false;
    const activeP = this.homePlayers[this.activePlayerIndex];
    if (!activeP || !activeP.group) return false;

    const dist = activeP.group.position.distanceTo(window.gameInstance.ball.position);
    return dist < 1.75;
  }

  // 5. ŞUT VE PAS EYLEMLERİ
  executeShot(powerPct) {
    if (!window.gameInstance || !window.gameInstance.ball) return;
    const activeP = this.homePlayers[this.activePlayerIndex];
    if (!activeP) return;

    this.stats.homeShots++;
    this.playKickSound();
    this.lastTouchTeam = 'home';

    const pPos = activeP.group.position;
    // Rakip kaleye doğru yön hesapla (Z: 0 hedef kale)
    let dirX = -pPos.x * 0.12;
    let dirY = 0.35 + (powerPct / 100) * 1.6;
    let speed = 22 + (powerPct / 100) * 14; // 22 - 36 m/s

    // WASD / Yön tuşları ile şut yönü verme
    if (this.keys.KeyA || this.keys.ArrowLeft) dirX = -1.15;
    if (this.keys.KeyD || this.keys.ArrowRight) dirX = 1.15;

    window.gameInstance.ball.shoot(dirX, dirY, speed, 0);
    this.ballCarrier = null;
    window.gameInstance.hasBallPossession = false;

    this.showMatchBanner("💣 SERT ŞUT ÇEKİLDİ!");

    // Rakip kaleci uçuşu
    const awayGK = this.awayPlayers[0];
    if (awayGK && awayGK.group) {
      setTimeout(() => {
        if (window.gameInstance?.playerModels?.triggerGoalkeeperDive) {
          window.gameInstance.playerModels.triggerGoalkeeperDive(dirX * 3.2, dirY * 1.5, 0, 0.7);
        } else {
          awayGK.group.position.x = dirX * 2.2;
        }
      }, 160);
    }
  }

  executePass(isThroughBall = false) {
    if (!window.gameInstance || !window.gameInstance.ball) return;
    const activeP = this.homePlayers[this.activePlayerIndex];
    if (!activeP) return;

    // En uygun pas arkadaşını bul
    let targetPlayer = null;
    let bestScore = -999;

    this.homePlayers.forEach((p, idx) => {
      if (idx !== this.activePlayerIndex && p.role !== 'GK') {
        const dist = activeP.group.position.distanceTo(p.group.position);
        if (dist > 3.5 && dist < 36) {
          // İleri doğru olanlara öncelik ver
          const score = (activeP.group.position.z - p.group.position.z) * 1.2 + (32 - dist) * 0.6;
          if (score > bestScore) {
            bestScore = score;
            targetPlayer = p;
          }
        }
      }
    });

    if (!targetPlayer) targetPlayer = this.homePlayers[1];

    this.stats.homePasses++;
    this.playKickSound();
    this.lastTouchTeam = 'home';

    const targetPos = targetPlayer.group.position.clone();
    if (isThroughBall) {
      targetPos.z -= 4.0; // Koşu yoluna ara pas
      targetPos.x += (Math.random() - 0.5) * 1.5;
    }

    const dist = activeP.group.position.distanceTo(targetPos);
    const flightTime = Math.max(0.55, dist / 23);

    window.gameInstance.ball.passTo(targetPos, flightTime, 0.18, 0, () => {
      // Pas yerine vardığında kontrolü o arkadaşa geçir
      const newIdx = this.homePlayers.indexOf(targetPlayer);
      if (newIdx >= 0) {
        this.activePlayerIndex = newIdx;
        this.ballCarrier = targetPlayer;
        window.gameInstance.hasBallPossession = true;
        this.setupMatchHUD();
      }
    });

    this.ballCarrier = null;
    window.gameInstance.hasBallPossession = false;
    this.showMatchBanner(isThroughBall ? "⚡ ADRESE TESLİM ARA PASI!" : "🎯 YERDEN PAS!");
  }

  executeCross() {
    if (!window.gameInstance || !window.gameInstance.ball) return;
    const activeP = this.homePlayers[this.activePlayerIndex];
    if (!activeP) return;

    // Ceza sahası merkezine yüksek orta
    const targetPos = new THREE.Vector3(0, 0.11, 8.5);
    this.playKickSound();
    this.lastTouchTeam = 'home';

    window.gameInstance.ball.passTo(targetPos, 1.25, 3.6, 0.2, () => {
      // Ceza alanında top kontrolü
    });

    this.ballCarrier = null;
    window.gameInstance.hasBallPossession = false;
    this.showMatchBanner("🚀 CEZA SAHASINA KAVİSLİ ORTA!");
  }

  executeTackleOrSkill() {
    const activeP = this.homePlayers[this.activePlayerIndex];
    if (!activeP) return;

    if (this.isBallAtUserFeet()) {
      // Çalım & Top Koruma
      activeP.state = PLAYER_STATE.CONTROL_BALL;
      if (activeP.rightLegGroup) activeP.rightLegGroup.rotation.x = -1.2;
      setTimeout(() => { if (activeP.rightLegGroup) activeP.rightLegGroup.rotation.x = 0; }, 350);
      this.showMatchBanner("⚡ MAKAS ÇALIMI!");
    } else {
      // Kayarak Müdahale
      activeP.state = PLAYER_STATE.TACKLE;
      if (activeP.rightLegGroup) activeP.rightLegGroup.rotation.x = -1.4;
      setTimeout(() => { 
        if (activeP.rightLegGroup) activeP.rightLegGroup.rotation.x = 0; 
        activeP.state = PLAYER_STATE.RECOVER;
      }, 450);

      // Yakındaki topu dürt
      if (window.gameInstance?.ball) {
        const d = activeP.group.position.distanceTo(window.gameInstance.ball.position);
        if (d < 2.0) {
          window.gameInstance.ball.velocity.set((Math.random() - 0.5) * 6, 1.5, -6);
          window.gameInstance.ball.isMoving = true;
          this.playKickSound();
          this.showMatchBanner("🛡️ BAŞARILI KAYARAK MÜDAHALE!");
        }
      }
    }
  }

  // 6. OYUNCU-OYUNCU ÇARPIŞMA VE AYRIŞTIRMA SİSTEMİ (İç İçe Geçmeyi Kesin Önler)
  separatePlayers() {
    const all = [...this.homePlayers, ...this.awayPlayers];
    const minDistance = 0.94; // İki oyuncu arası asgari fiziksel mesafe

    for (let i = 0; i < all.length; i++) {
      const p1 = all[i];
      if (!p1 || !p1.group) continue;
      for (let j = i + 1; j < all.length; j++) {
        const p2 = all[j];
        if (!p2 || !p2.group) continue;

        const dx = p1.group.position.x - p2.group.position.x;
        const dz = p1.group.position.z - p2.group.position.z;
        const distSq = dx * dx + dz * dz;

        if (distSq < minDistance * minDistance && distSq > 0.0001) {
          const dist = Math.sqrt(distSq);
          const overlap = (minDistance - dist) * 0.5;
          const nx = dx / dist;
          const nz = dz / dist;

          p1.group.position.x += nx * overlap;
          p1.group.position.z += nz * overlap;

          p2.group.position.x -= nx * overlap;
          p2.group.position.z -= nz * overlap;
        }
      }
    }
  }

  // 7. ANA DÖNGÜ GÜNCELLEMESİ (Her karede çağrılır)
  update(dt, game) {
    if (!this.isActive || this.isPaused) return;
    dt = Math.min(dt, 0.05); // Güvenli dt sınırı (stutter ve patlamayı önler)

    // 1. Maç Süresi ve Skorbord Saati (00:00 -> 90:00)
    this.matchTime += dt;
    const progress = Math.min(1.0, this.matchTime / this.matchDuration);
    const virtualMinute = Math.floor(progress * 90);
    const virtualSeconds = Math.floor((progress * 90 * 60) % 60);

    const clockEl = document.getElementById('hud-match-distance');
    if (clockEl) {
      const halfText = this.half === 1 ? '1. YARI' : '2. YARI';
      clockEl.innerText = `${halfText} ${String(virtualMinute).padStart(2, '0')}:${String(virtualSeconds).padStart(2, '0')}`;
    }

    // Devre Arası ve Maç Bitişi Kontrolü
    if (virtualMinute >= 45 && this.half === 1) {
      this.half = 2;
      this.showMatchBanner("⏸️ İLK YARI SONA ERDİ! 2. Yarı Başlıyor...");
      this.playWhistle();
    } else if (virtualMinute >= 90) {
      this.endMatch();
      return;
    }

    // 2. Şut Güç Barı Doldurma
    if (this.isChargingShot) {
      this.shotPower = Math.min(100, this.shotPower + this.shotChargeSpeed * dt);
      this.updateHUDPower(this.shotPower);
    }

    // 3. Kullanıcı Aktif Oyuncusunu Hareket Ettir (İvme, Sürtünme, Depar ve Dayanıklılık)
    this.updateUserPlayerMovement(dt, game);

    // 4. Takım Arkadaşları AI (Boş alanlara koşu & taktiksel yayılım)
    this.updateTeammateAI(dt, game);

    // 5. Rakip Takım AI (Pres, alan savunması, top kapma ve şut)
    this.updateOpponentAI(dt, game);

    // 6. Kaleci AI (Pozisyon alma & kurtarış dalışı)
    this.updateGoalkeeperAI(dt, game);

    // 7. Oyuncu-Oyuncu Çarpışma Ayrıştırması
    this.separatePlayers();

    // 8. Taç / Aut / Saha Sınırları Kontrolü
    this.checkOutOfBounds(game);

    // 9. Dinamik Yayın Kamerası (TV Broadcast Camera)
    this.updateBroadcastCamera(dt, game);

    // 10. 2D Mini Radar Çizimi
    this.drawRadar(game);
  }

  // KULLANICI OYUNCU HAREKET FİZİĞİ (Girdi -> İvme -> Hız -> Sürtünme -> Konum)
  updateUserPlayerMovement(dt, game) {
    const p = this.homePlayers[this.activePlayerIndex];
    if (!p || !p.group) return;

    if (!p.velocity) p.velocity = new THREE.Vector3();
    if (typeof p.stamina !== 'number') p.stamina = 100;

    let moveX = (this.keys.KeyD || this.keys.ArrowRight ? 1 : 0) - (this.keys.KeyA || this.keys.ArrowLeft ? 1 : 0);
    let moveZ = (this.keys.KeyS || this.keys.ArrowDown ? 1 : 0) - (this.keys.KeyW || this.keys.ArrowUp ? 1 : 0);

    const isMoving = (moveX !== 0 || moveZ !== 0);
    const wantsSprint = (this.keys.ShiftLeft || this.keys.ShiftRight);
    const canSprint = wantsSprint && p.stamina > 15;

    // Dayanıklılık (Stamina) Tüketimi ve Yenilenmesi
    if (isMoving && canSprint) {
      p.stamina = Math.max(0, p.stamina - 22 * dt);
    } else {
      p.stamina = Math.min(100, p.stamina + 14 * dt);
    }

    const maxSpeed = canSprint ? 9.6 : 6.6;
    const targetVel = new THREE.Vector3(0, 0, 0);

    if (isMoving) {
      const len = Math.hypot(moveX, moveZ);
      targetVel.set((moveX / len) * maxSpeed, 0, (moveZ / len) * maxSpeed);
    }

    // Yumuşak İvmelenme ve Yavaşlama
    const accelRate = isMoving ? 16.0 : 20.0;
    p.velocity.lerp(targetVel, Math.min(1.0, accelRate * dt));

    p.group.position.addScaledVector(p.velocity, dt);

    // Saha sınırları
    p.group.position.x = THREE.MathUtils.clamp(p.group.position.x, -28.5, 28.5);
    p.group.position.z = THREE.MathUtils.clamp(p.group.position.z, 0.5, 48);

    // Yumuşak yönelme (Titremesiz rotasyon)
    if (p.velocity.lengthSq() > 0.08) {
      const targetAngle = Math.atan2(p.velocity.x, p.velocity.z);
      p.group.rotation.y = THREE.MathUtils.lerp(p.group.rotation.y, targetAngle, Math.min(1.0, 14.0 * dt));
    }

    // Durum Belirleme
    if (!isMoving && p.velocity.lengthSq() < 0.1) {
      p.state = PLAYER_STATE.IDLE;
    } else if (canSprint) {
      p.state = PLAYER_STATE.SPRINT;
    } else {
      p.state = PLAYER_STATE.RUN;
    }

    // Top ayaktaysa topu önünde taşı (Dribbling)
    if (this.isBallAtUserFeet() && game.ball && !game.ball.isMoving) {
      p.state = PLAYER_STATE.CONTROL_BALL;
      this.lastTouchTeam = 'home';
      const forwardX = Math.sin(p.group.rotation.y);
      const forwardZ = Math.cos(p.group.rotation.y);
      game.ball.position.set(
        p.group.position.x + forwardX * 0.55,
        game.ball.radius,
        p.group.position.z + forwardZ * 0.55
      );
      if (game.ball.mesh) game.ball.mesh.position.copy(game.ball.position);
      if (game.ball.shadow) game.ball.shadow.position.set(game.ball.position.x, 0.015, game.ball.position.z);
    }

    if (game.playerModels) {
      const curSpeed = p.velocity.length();
      game.playerModels.updateRunningAnimation(p, curSpeed > 0.4, canSprint, dt);
      game.playerModels.updateKickZone(p.group.position, true, 'active');
    }
  }

  // TAKIM ARKADAŞLARI AI (Hücumda Boş Alan Arama & Savunmada Kademe)
  updateTeammateAI(dt, game) {
    if (!game.ball) return;
    const bPos = game.ball.position;

    this.homePlayers.forEach((p, idx) => {
      if (idx === this.activePlayerIndex || p.role === 'GK') return;

      if (!p.velocity) p.velocity = new THREE.Vector3();

      // Topun konumuna göre takım halinde ileri çıkma veya geriye çekilme
      let targetZ = p.basePos.z;
      let targetX = p.basePos.x;

      if (p.role === 'ATT') {
        // Santrfor ceza alanına koşu yapar
        targetZ = Math.max(5.5, bPos.z - 7.0);
        targetX = THREE.MathUtils.clamp(bPos.x * 0.6, -10, 10);
      } else if (p.role === 'MID') {
        // Orta sahalar pas opsiyonu oluşturur
        targetZ = Math.max(12, bPos.z + 4.5);
        targetX = p.basePos.x + (bPos.x * 0.3);
      } else if (p.role === 'DEF') {
        // Defans kademesi
        targetZ = Math.min(42, Math.max(26, bPos.z + 14));
      }

      const dx = targetX - p.group.position.x;
      const dz = targetZ - p.group.position.z;
      const dist = Math.hypot(dx, dz);

      if (dist > 1.2) {
        const speed = 5.2;
        p.group.position.x += (dx / dist) * speed * dt;
        p.group.position.z += (dz / dist) * speed * dt;
        p.group.rotation.y = THREE.MathUtils.lerp(p.group.rotation.y, Math.atan2(dx, dz), 0.1);
        if (game.playerModels) game.playerModels.updateRunningAnimation(p, true, false, dt);
      } else {
        // Hedefe bak
        p.group.lookAt(p.group.position.x, 0, 0);
        if (game.playerModels) game.playerModels.updateRunningAnimation(p, false, false, dt);
      }
    });
  }

  // RAKİP TAKIM AI (Pres, Müdahale, Top Çalma ve Karşı Hücum)
  updateOpponentAI(dt, game) {
    if (!game.ball) return;
    const bPos = game.ball.position;

    // Topa en yakın rakip pres yapsın
    let nearestOpponent = null;
    let minDist = 999;

    this.awayPlayers.forEach((p) => {
      if (p.role === 'GK') return;
      const d = p.group.position.distanceTo(bPos);
      if (d < minDist) {
        minDist = d;
        nearestOpponent = p;
      }
    });

    this.awayPlayers.forEach((p) => {
      if (p.role === 'GK') return;

      if (p === nearestOpponent) {
        // 1. En yakın oyuncu agresif pres yapar
        const dx = bPos.x - p.group.position.x;
        const dz = bPos.z - p.group.position.z;
        const dist = Math.hypot(dx, dz);

        const pressSpeed = (this.difficulty === 'legend') ? 9.2 : 7.6;

        if (dist > 1.1) {
          p.group.position.x += (dx / dist) * pressSpeed * dt;
          p.group.position.z += (dz / dist) * pressSpeed * dt;
          p.group.rotation.y = THREE.MathUtils.lerp(p.group.rotation.y, Math.atan2(dx, dz), 0.15);
          if (game.playerModels) game.playerModels.updateRunningAnimation(p, true, true, dt);
        } else {
          // Top çalma hamlesi
          if (game.playerModels) game.playerModels.updateRunningAnimation(p, false, false, dt);

          if (this.isBallAtUserFeet() && Math.random() < 0.04) {
            // Topu araya girip uzaklaştır
            game.ball.velocity.set((Math.random() - 0.5) * 8, 1.8, 12);
            game.ball.isMoving = true;
            this.lastTouchTeam = 'away';
            this.playKickSound();
            this.showMatchBanner("⚠️ RAKİP ARAYA GİRİP TOPU KAPTI!");
          }
        }
      } else {
        // 2. Diğer rakipler alan savunması ve pas arası yapar
        let targetZ = p.basePos.z + (bPos.z * 0.4);
        let targetX = p.basePos.x;

        const dx = targetX - p.group.position.x;
        const dz = targetZ - p.group.position.z;
        const dist = Math.hypot(dx, dz);

        if (dist > 1.5) {
          p.group.position.x += (dx / dist) * 4.8 * dt;
          p.group.position.z += (dz / dist) * 4.8 * dt;
          p.group.rotation.y = THREE.MathUtils.lerp(p.group.rotation.y, Math.atan2(dx, dz), 0.1);
          if (game.playerModels) game.playerModels.updateRunningAnimation(p, true, false, dt);
        } else {
          p.group.lookAt(bPos.x, 0, bPos.z);
          if (game.playerModels) game.playerModels.updateRunningAnimation(p, false, false, dt);
        }
      }
    });
  }

  // KALECİ AI (Pozisyon Alma ve Kurtarış Hamleleri)
  updateGoalkeeperAI(dt, game) {
    if (!game.ball) return;
    const bPos = game.ball.position;

    // Rakip Kaleci (Z: 1.2 civarında kaleyi korur)
    const awayGK = this.awayPlayers[0];
    if (awayGK && awayGK.group) {
      // Topun X koordinatına göre kaleyi kapat
      const targetX = THREE.MathUtils.clamp(bPos.x * 0.72, -3.2, 3.2);
      awayGK.group.position.x = THREE.MathUtils.lerp(awayGK.group.position.x, targetX, 0.12);
      awayGK.group.position.z = 1.2;
      awayGK.group.lookAt(bPos.x, 0, bPos.z);
    }

    // Ev Sahibi Kaleci (Z: 46.5 civarında kendi kalesini korur)
    const homeGK = this.homePlayers[0];
    if (homeGK && homeGK.group) {
      const targetX = THREE.MathUtils.clamp(bPos.x * 0.72, -3.2, 3.2);
      homeGK.group.position.x = THREE.MathUtils.lerp(homeGK.group.position.x, targetX, 0.12);
      homeGK.group.position.z = 46.5;
      homeGK.group.lookAt(bPos.x, 0, bPos.z);
    }
  }

  // TAÇ / AUT / KALE VURUŞU KONTROLÜ
  checkOutOfBounds(game) {
    if (!game.ball) return;
    const bPos = game.ball.position;

    // Taç Çizgileri: X < -30 veya X > 30
    if (Math.abs(bPos.x) > 31.0 && !game.ball.hasScored) {
      game.ball.isMoving = false;
      this.playWhistle();
      this.showMatchBanner("🚩 TAÇ ATIŞI!");
      setTimeout(() => {
        game.ball.reset(new THREE.Vector3(Math.sign(bPos.x) * 28, game.ball.radius, THREE.MathUtils.clamp(bPos.z, 2, 45)));
      }, 1200);
    }
  }

  toggleCamera() {
    const modes = ['broadcast', 'tactical', 'player'];
    const curIdx = modes.indexOf(this.cameraMode);
    this.cameraMode = modes[(curIdx + 1) % modes.length];
    const btn = document.getElementById('btn-camera-toggle');
    if (btn) {
      const titles = { broadcast: '🎥 TV YAYIN', tactical: '🦅 KUŞBAKIŞI', player: '👤 OYUNCU TAKİP' };
      btn.innerText = titles[this.cameraMode] || '🎥 KAMERA';
    }
  }

  // Dinamik TV Yayın Kamerası (Topu Yumuşakça Takip Eder)
  updateBroadcastCamera(dt, game) {
    if (!game.ball || !game.camera) return;
    const bPos = game.ball.position;

    if (this.cameraMode === 'tactical') {
      // Kuşbakışı Taktik Açı
      game.camera.position.lerp(new THREE.Vector3(bPos.x * 0.25, 34, bPos.z + 10), 0.08);
      game.camera.lookAt(bPos.x * 0.25, 0, bPos.z);
    } else if (this.cameraMode === 'player') {
      // Dinamik Oyuncu Takip Açısı (Be-A-Pro)
      const p = this.homePlayers[this.activePlayerIndex];
      if (p && p.group) {
        const pPos = p.group.position;
        game.camera.position.lerp(new THREE.Vector3(pPos.x, pPos.y + 4.2, pPos.z + 7.5), 0.1);
        game.camera.lookAt(pPos.x, pPos.y + 1.2, pPos.z - 8);
      }
    } else {
      // TV Yayın Kamerası (Varsayılan broadcast)
      const targetCamX = bPos.x * 0.45;
      const targetCamY = 16.5;
      const targetCamZ = bPos.z + 18.5;
      game.camera.position.lerp(new THREE.Vector3(targetCamX, targetCamY, targetCamZ), 0.08);
      game.camera.lookAt(bPos.x * 0.3, 1.2, bPos.z - 3);
    }
  }

  // 2D Mini Saha Radarı
  drawRadar(game) {
    const canvas = document.getElementById('match-radar-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Saha zemin ve çizgileri
    ctx.fillStyle = 'rgba(8, 14, 28, 0.85)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'rgba(0, 242, 254, 0.4)';
    ctx.lineWidth = 1;
    ctx.strokeRect(3, 3, canvas.width - 6, canvas.height - 6);

    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 3);
    ctx.lineTo(canvas.width / 2, canvas.height - 3);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 10, 0, Math.PI * 2);
    ctx.stroke();

    // Saha Koordinatları: X: -30..30, Z: -5..50
    const toRx = (wx) => 3 + ((wx + 30) / 60) * (canvas.width - 6);
    const toRy = (wz) => 3 + ((wz + 5) / 55) * (canvas.height - 6);

    // Ev sahibi oyuncuları (Mavi/Sarı aktif)
    this.homePlayers.forEach((p, idx) => {
      if (!p || !p.group) return;
      ctx.fillStyle = (idx === this.activePlayerIndex) ? '#ffff00' : '#00f2fe';
      ctx.beginPath();
      ctx.arc(toRx(p.group.position.x), toRy(p.group.position.z), (idx === this.activePlayerIndex) ? 3.5 : 2.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Rakip oyuncuları (Kırmızı)
    this.awayPlayers.forEach((p) => {
      if (!p || !p.group) return;
      ctx.fillStyle = '#ff4757';
      ctx.beginPath();
      ctx.arc(toRx(p.group.position.x), toRy(p.group.position.z), 2.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Top (Beyaz parıldayan)
    if (game.ball) {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(toRx(game.ball.position.x), toRy(game.ball.position.z), 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 8. GOL OLDUĞUNDA ÇAĞRILIR
  onGoalScored(scoringTeam = 'home') {
    if (scoringTeam === 'home') {
      this.homeScore++;
      const scorer = this.homePlayers[this.activePlayerIndex]?.name || 'Victor Osimhen';
      this.showMatchBanner(`⚽ GOOOOOL! ${this.homeTeam.name.toUpperCase()}!\n${scorer} fileleri havalandırdı!`);
    } else {
      this.awayScore++;
      this.showMatchBanner(`⚽ GOOOL! ${this.awayTeam.name.toUpperCase()} golü attı!`);
    }

    this.playWhistle();
    this.playGoalCheer();

    // Skorbordu güncelle
    const scoreEl = document.getElementById('hud-score-display');
    if (scoreEl) scoreEl.innerText = `${this.homeScore} - ${this.awayScore}`;

    // 2 saniye sonra santraya dön
    setTimeout(() => {
      if (window.gameInstance) {
        this.resetBallToCenter(window.gameInstance);
      }
    }, 2200);
  }

  // 9. MAÇ BİTTİĞİNDE (FULL TIME)
  endMatch() {
    this.isActive = false;
    this.playWhistle();

    const summaryModal = document.getElementById('match-summary-modal');
    if (summaryModal) {
      const titleEl = document.getElementById('summary-title');
      const scoreEl = document.getElementById('summary-score');
      const goalsEl = document.getElementById('sum-goals');
      const ratingEl = document.getElementById('sum-rating');

      if (titleEl) titleEl.innerText = 'MAÇ SONUCU (FULL TIME)';
      if (scoreEl) scoreEl.innerText = `${this.homeTeam.name} ${this.homeScore} - ${this.awayScore} ${this.awayTeam.name}`;
      if (goalsEl) goalsEl.innerText = this.homeScore;
      if (ratingEl) ratingEl.innerText = this.homeScore > this.awayScore ? '8.8 (Galibiyet)' : '7.0';
      summaryModal.style.display = 'flex';
      summaryModal.classList.remove('hidden');
      summaryModal.classList.add('active');
    }
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    this.showMatchBanner(this.isPaused ? "⏸️ OYUN DURAKLATILDI" : "▶️ DEVAM EDİYOR");
  }

  updateHUDPower(power) {
    const statVal = document.getElementById('hud-shot-speed');
    if (statVal) {
      if (power > 0) {
        const bars = Math.round(power / 20);
        statVal.innerHTML = `<span style="color:#00f2fe;">${'█'.repeat(bars)}${'░'.repeat(5 - bars)} %${Math.round(power)}</span>`;
      } else {
        statVal.innerText = '0 km/h';
      }
    }
  }

  showMatchBanner(text) {
    const banner = document.getElementById('goal-celebration-banner');
    if (!banner) return;
    banner.innerText = text;
    banner.style.display = 'block';
    clearTimeout(this.bannerTimer);
    this.bannerTimer = setTimeout(() => {
      banner.style.display = 'none';
    }, 2400);
  }

  // SES EFEKTLERİ SENTEZLEYİCİSİ
  playWhistle() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!this.audioCtx) this.audioCtx = new AudioCtx();
      if (this.audioCtx.state === 'suspended') this.audioCtx.resume();

      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(2800, now);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.35);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } catch(e){}
  }

  playKickSound() {
    try {
      if (!this.audioCtx) return;
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.12);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.12);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    } catch(e){}
  }

  playGoalCheer() {
    try {
      if (!this.audioCtx) return;
      const now = this.audioCtx.currentTime;
      const bufferSize = this.audioCtx.sampleRate * 1.5;
      const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

      const noise = this.audioCtx.createBufferSource();
      noise.buffer = buffer;
      const gain = this.audioCtx.createGain();
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.linearRampToValueAtTime(0, now + 1.5);
      noise.connect(gain);
      gain.connect(this.audioCtx.destination);
      noise.start(now);
    } catch(e){}
  }
}

window.matchEngine = new MatchEngine();
