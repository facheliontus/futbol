// ==========================================================
// 3D ARCADE FUTBOL MAÇ MOTORU (matchEngine.js)
// Hızlı, Akıcı, Çift Kaleli (Away Z=-38, Home Z=+38) Arcade Oynanış
// ==========================================================

const MATCH_STATE = {
  PRE_MATCH: 'PRE_MATCH',
  PLAYING: 'PLAYING',
  GOAL: 'GOAL',
  RESTART: 'RESTART',
  FULL_TIME: 'FULL_TIME'
};

const PLAYER_STATE = {
  IDLE: 'IDLE',
  RUN: 'RUN',
  SPRINT: 'SPRINT',
  TACKLE: 'TACKLE',
  SHOOT: 'SHOOT'
};

class MatchEngine {
  constructor() {
    this.isActive = false;
    this.isPaused = false;
    this.state = MATCH_STATE.PLAYING;
    this.mode = 'quick';

    // Skor ve Süre
    this.homeTeam = null;
    this.awayTeam = null;
    this.homeScore = 0;
    this.awayScore = 0;
    this.matchTime = 0;
    this.matchDuration = 180; // 3 dakikalık maç
    this.half = 1;

    // Oyuncular
    this.homePlayers = [];
    this.awayPlayers = [];
    this.activePlayerIndex = 0; // Kullanıcı kontrolündeki santrfor
    this.ballCarrier = null;     // Topu süren oyuncu (kullanıcı, takım arkadaşı veya rakip)
    this.tackleCooldown = 0;     // Müdahale bekleme süresi

    // Tuş Kontrolleri
    this.keys = {
      KeyW: false, KeyA: false, KeyS: false, KeyD: false,
      ArrowUp: false, ArrowLeft: false, ArrowDown: false, ArrowRight: false,
      ShiftLeft: false, ShiftRight: false,
      Space: false, KeyE: false, KeyR: false, KeyQ: false, KeyC: false
    };

    // Şut Güç Barı
    this.isChargingShot = false;
    this.shotPower = 0;
    this.shotChargeSpeed = 120; // Hızlı şut dolumu

    // Kamera ve Ses
    this.cameraMode = 'broadcast'; // 'broadcast', 'tactical', 'player'
    this.audioCtx = null;
    this.bannerTimer = null;
    this.restartTimer = null;

    this.initInputs();
  }

  // 1. KLAVYE GİRDİLERİ (ANINDA TEPKİ & SIFIR GECİKME)
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

      // [Q] Oyuncu Değiştir
      if (e.code === 'KeyQ') {
        this.switchActivePlayer();
      }

      // [Space] Şut Barını Doldurmaya Başla
      if (e.code === 'Space' && !e.repeat) {
        if (this.isUserBallCarrier()) {
          this.isChargingShot = true;
          this.shotPower = 0;
        }
      }

      // [E] Yerden Pas Ver (Kontrolü hemen arkadaşa aktar)
      if (e.code === 'KeyE') {
        if (this.isUserBallCarrier()) {
          this.executePass();
        }
      }

      // [R] Koşu Yoluna Ara Pas
      if (e.code === 'KeyR') {
        if (this.isUserBallCarrier()) {
          this.executeThroughBall();
        }
      }

      // [C] Çalım / Kayarak Müdahale
      if (e.code === 'KeyC') {
        this.executeSkillOrTackle();
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

    // PENCERE ODAK KAYBINDA TUŞLARI HEMEN SIFIRLA (TAKILMA VE KAYMAYI KESİNLİKLE ÖNLER)
    window.addEventListener('blur', () => this.resetKeys());
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.resetKeys();
    });
  }

  resetKeys() {
    for (const k in this.keys) {
      this.keys[k] = false;
    }
    this.isChargingShot = false;
    this.shotPower = 0;
    this.updateHUDPower(0);

    // Aktif oyuncunun hızını derhal sıfırla (Buzda kaymayı önler)
    const userP = this.homePlayers[this.activePlayerIndex];
    if (userP && userP.velocity) {
      userP.velocity.set(0, 0, 0);
    }
  }

  // Kullanıcı topa sahip mi?
  isUserBallCarrier() {
    const userP = this.homePlayers[this.activePlayerIndex];
    return this.ballCarrier === userP;
  }

  // 2. YENİ ARCADE MAÇ BAŞLAT
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
    this.matchDuration = settings.duration || 180;
    this.tackleCooldown = 0;

    if (window.platformManager) {
      window.platformManager.showView('game');
    }

    this.setupMatchHUD();

    if (window.gameInstance) {
      const g = window.gameInstance;
      this.clearPlayers(g.scene);
      if (g.playerModels) g.playerModels.clearAll();
      this.spawnArcadeTeams(g);
      this.resetToKickoff(g);
    }

    this.playWhistle();
    this.showMatchBanner(`⚽ MAÇ BAŞLADI: ${this.homeTeam.name} vs ${this.awayTeam.name}`);
  }

  // Sahadaki önceki modelleri temizle
  clearPlayers(scene) {
    [...this.homePlayers, ...this.awayPlayers].forEach(p => {
      if (p && p.group && scene) {
        scene.remove(p.group);
      }
    });
    this.homePlayers = [];
    this.awayPlayers = [];
  }

  // HUD Arayüzünü Güncelle
  setupMatchHUD() {
    const homeEl = document.getElementById('hud-team-home');
    const awayEl = document.getElementById('hud-team-away');
    const scoreEl = document.getElementById('hud-score-display');
    const clockEl = document.getElementById('hud-match-distance');

    if (homeEl) homeEl.innerText = `${this.homeTeam.logo} ${this.homeTeam.name.toUpperCase()}`;
    if (awayEl) awayEl.innerText = `${this.awayTeam.logo} ${this.awayTeam.name.toUpperCase()}`;
    if (scoreEl) scoreEl.innerText = `${this.homeScore} - ${this.awayScore}`;
    if (clockEl) clockEl.innerText = '1. YARI 00:00';

    const hintEl = document.getElementById('hud-control-hint');
    if (hintEl) {
      hintEl.innerHTML = `🎮 <b>ARCADE KONTROLLER:</b> [WASD] Koş | [Shift] Depar | [E] Pas | [Space] Şut (Basılı Tut) | [Q] Adam Değiştir | [C] Çalım/Müdahale`;
    }

    const p = this.homePlayers[this.activePlayerIndex];
    if (p) {
      const nameEl = document.getElementById('hud-player-name');
      const posEl = document.getElementById('hud-player-pos');
      const numBadge = document.getElementById('hud-jersey-badge');
      const clubEl = document.getElementById('hud-club-name');

      if (nameEl) nameEl.innerText = `${p.name}`;
      if (posEl) posEl.innerText = `⚡ ${p.role}`;
      if (numBadge) numBadge.innerText = `#${p.num}`;
      if (clubEl) clubEl.innerText = `${this.homeTeam.logo} ${this.homeTeam.name}`;
    }
  }

  // 3. ARCADE KADROLARI OLUŞTUR (4v4 Yüksek Tempolu Maç)
  spawnArcadeTeams(game) {
    this.homePlayers = [];
    this.awayPlayers = [];

    const homeColor = typeof this.homeTeam.color === 'number' ? this.homeTeam.color : parseInt(String(this.homeTeam.color).replace('#', '0x')) || 0xb81414;
    const awayColor = typeof this.awayTeam.color === 'number' ? this.awayTeam.color : parseInt(String(this.awayTeam.color).replace('#', '0x')) || 0x0c2461;

    // EV SAHİBİ TAKIM (Hücum Yönü: -Z Away Kalesine doğru)
    const homeConfig = [
      { role: 'ST', x: 0, z: 1.5, num: 9, name: 'Santrfor Osimhen', speed: 9.8 },
      { role: 'LW', x: -8, z: 8.0, num: 10, name: 'Sol Kanat Sara', speed: 8.6 },
      { role: 'RW', x: 8, z: 8.0, num: 7, name: 'Sağ Kanat Barış', speed: 8.6 },
      { role: 'GK', x: 0, z: 36.5, num: 1, name: 'Kaleci Muslera', speed: 7.0 }
    ];

    homeConfig.forEach((cfg, idx) => {
      let p;
      if (cfg.role === 'GK') {
        p = game.playerModels.createGoalkeeper(0xf39c12);
        p.group.position.set(cfg.x, 0.11, cfg.z);
        p.group.lookAt(0, 0, -38);
      } else {
        p = game.playerModels.createSingleDefender(new THREE.Vector3(cfg.x, 0.11, cfg.z), homeColor, cfg.num, cfg.name);
      }
      p.team = 'home';
      p.role = cfg.role;
      p.name = cfg.name;
      p.num = cfg.num;
      p.speed = cfg.speed;
      p.stamina = 100;
      p.velocity = new THREE.Vector3(0, 0, 0);
      p.basePos = new THREE.Vector3(cfg.x, 0.11, cfg.z);
      this.homePlayers.push(p);
    });

    this.activePlayerIndex = 0; // Osimhen aktif

    // DEPLASMAN TAKIMI (3 Defans + 1 Kaleci - Kullanıcıya Karşı Agresif Pres)
    const awayConfig = [
      { role: 'DEF', x: 0, z: -8.0, num: 4, name: 'Pres Stoper Djiku', speed: 8.8 },
      { role: 'DEF', x: -7, z: -18.0, num: 3, name: 'Sol Stoper Becao', speed: 8.2 },
      { role: 'DEF', x: 7, z: -18.0, num: 2, name: 'Sağ Stoper Fred', speed: 8.2 },
      { role: 'GK', x: 0, z: -36.5, num: 1, name: 'Rakip GK Livakovic', speed: 7.0 }
    ];

    awayConfig.forEach((cfg) => {
      let p;
      if (cfg.role === 'GK') {
        p = game.playerModels.createSingleDefender(new THREE.Vector3(cfg.x, 0.11, cfg.z), 0x27ae60, cfg.num, 'GK');
        p.group.lookAt(0, 0, 38);
      } else {
        p = game.playerModels.createSingleDefender(new THREE.Vector3(cfg.x, 0.11, cfg.z), awayColor, cfg.num, cfg.name);
      }
      p.team = 'away';
      p.role = cfg.role;
      p.name = cfg.name;
      p.num = cfg.num;
      p.speed = cfg.speed;
      p.stamina = 100;
      p.velocity = new THREE.Vector3(0, 0, 0);
      p.basePos = new THREE.Vector3(cfg.x, 0.11, cfg.z);
      this.awayPlayers.push(p);
    });
  }

  // 4. SANTRADAN TEMİZ BAŞLAMA (KICKOFF)
  resetToKickoff(game) {
    if (!game) return;

    // Oyuncuları başlangıç konumlarına döndür
    this.homePlayers.forEach(p => {
      if (p && p.group) {
        p.group.position.copy(p.basePos);
        p.group.lookAt(p.basePos.x, 0, -38);
        if (p.velocity) p.velocity.set(0, 0, 0);
      }
    });

    this.awayPlayers.forEach(p => {
      if (p && p.group) {
        p.group.position.copy(p.basePos);
        p.group.lookAt(p.basePos.x, 0, 38);
        if (p.velocity) p.velocity.set(0, 0, 0);
      }
    });

    // Topu santra noktasına koy ve kullanıcıya ver
    if (game.ball) {
      game.ball.reset(new THREE.Vector3(0, game.ball.radius, 0.6));
      this.activePlayerIndex = 0;
      this.ballCarrier = this.homePlayers[0];
      game.hasBallPossession = true;
    }

    this.tackleCooldown = 1.0; // Santrada anında top çalınmasını önle
    this.state = MATCH_STATE.PLAYING;
    this.setupMatchHUD();
  }

  // 5. OYUNCU DEĞİŞTİRME ([Q] Tuşu)
  switchActivePlayer() {
    if (!window.gameInstance || !window.gameInstance.ball) return;
    const bPos = window.gameInstance.ball.position;

    let nearestIdx = 0;
    let minDist = 999;

    // Kaleci hariç (0, 1, 2) topa en yakın takım arkadaşını seç
    for (let i = 0; i < 3; i++) {
      const p = this.homePlayers[i];
      if (p && p.group && i !== this.activePlayerIndex) {
        const d = p.group.position.distanceTo(bPos);
        if (d < minDist) {
          minDist = d;
          nearestIdx = i;
        }
      }
    }

    this.activePlayerIndex = nearestIdx;
    this.setupMatchHUD();
  }

  // 6. ŞUT, PAS VE ÇALIM EYLEMLERİ
  executeShot(powerPct) {
    if (!window.gameInstance || !window.gameInstance.ball) return;
    const userP = this.homePlayers[this.activePlayerIndex];
    if (!userP) return;

    this.playKickSound();

    const pPos = userP.group.position;
    let dirX = (this.keys.KeyA || this.keys.ArrowLeft) ? -0.85 : 
               (this.keys.KeyD || this.keys.ArrowRight) ? 0.85 : (-pPos.x * 0.1);
    let dirY = 0.35 + (powerPct / 100) * 1.5;
    let speed = 22 + (powerPct / 100) * 14;

    // Away Kalesine (-38) doğru roket şut
    window.gameInstance.ball.shoot(dirX, dirY, speed, 0, -38);
    this.ballCarrier = null;
    window.gameInstance.hasBallPossession = false;

    this.showMatchBanner("💣 HARİKA ŞUT KALEYE GİDİYOR!");

    // Rakip kaleci uçuş hamlesi
    const awayGK = this.awayPlayers[3];
    if (awayGK && awayGK.group) {
      setTimeout(() => {
        awayGK.group.position.x = THREE.MathUtils.clamp(dirX * 3.0, -3.2, 3.2);
      }, 150);
    }
  }

  executePass() {
    if (!window.gameInstance || !window.gameInstance.ball) return;
    const userP = this.homePlayers[this.activePlayerIndex];
    if (!userP) return;

    // En uygun pas arkadaşını bul
    let target = null;
    let bestDist = 999;
    this.homePlayers.forEach((p, idx) => {
      if (idx !== this.activePlayerIndex && p.role !== 'GK') {
        const d = userP.group.position.distanceTo(p.group.position);
        if (d < bestDist) {
          bestDist = d;
          target = p;
        }
      }
    });

    if (!target) target = this.homePlayers[1];

    this.playKickSound();
    const targetPos = target.group.position.clone();
    const dist = userP.group.position.distanceTo(targetPos);
    const flightTime = Math.max(0.4, dist / 22);

    window.gameInstance.ball.passTo(targetPos, flightTime, 0.15, 0, () => {
      const newIdx = this.homePlayers.indexOf(target);
      if (newIdx >= 0) {
        this.activePlayerIndex = newIdx;
        this.ballCarrier = target;
        window.gameInstance.hasBallPossession = true;
        this.setupMatchHUD();
      }
    });

    this.ballCarrier = null;
    window.gameInstance.hasBallPossession = false;
    this.showMatchBanner("🎯 ADRESE PAS!");
  }

  executeThroughBall() {
    if (!window.gameInstance || !window.gameInstance.ball) return;
    const userP = this.homePlayers[this.activePlayerIndex];
    if (!userP) return;

    let target = null;
    this.homePlayers.forEach((p, idx) => {
      if (idx !== this.activePlayerIndex && p.role !== 'GK') {
        target = p;
      }
    });
    if (!target) target = this.homePlayers[1];

    this.playKickSound();
    const runAheadPos = target.group.position.clone();
    runAheadPos.z -= 5.5; // Kaleye doğru koşu yoluna at
    runAheadPos.x += (Math.random() - 0.5) * 2;

    const flightTime = 0.75;
    window.gameInstance.ball.passTo(runAheadPos, flightTime, 0.2, 0, () => {
      const newIdx = this.homePlayers.indexOf(target);
      if (newIdx >= 0) {
        this.activePlayerIndex = newIdx;
        this.ballCarrier = target;
        window.gameInstance.hasBallPossession = true;
        this.setupMatchHUD();
      }
    });

    this.ballCarrier = null;
    window.gameInstance.hasBallPossession = false;
    this.showMatchBanner("⚡ ARA PASI!");
  }

  executeSkillOrTackle() {
    const userP = this.homePlayers[this.activePlayerIndex];
    if (!userP) return;

    if (this.isUserBallCarrier()) {
      // Çalım: Hızlı ivmelenme hamlesi
      const fwd = new THREE.Vector3(0, 0, -1);
      userP.group.position.addScaledVector(fwd, 1.4);
      this.showMatchBanner("⚡ SERİ ÇALIM!");
    } else {
      // Kayarak Müdahale: Topa hamle yap
      if (userP.rightLegGroup) userP.rightLegGroup.rotation.x = -1.3;
      setTimeout(() => { if (userP.rightLegGroup) userP.rightLegGroup.rotation.x = 0; }, 350);

      if (window.gameInstance?.ball) {
        const d = userP.group.position.distanceTo(window.gameInstance.ball.position);
        if (d < 2.0) {
          this.ballCarrier = userP;
          window.gameInstance.hasBallPossession = true;
          this.playKickSound();
          this.showMatchBanner("🛡️ MÜKEMMEL TOP KAPMA!");
        }
      }
    }
  }

  // 7. ANA GÜNCELLEME DÖNGÜSÜ
  update(dt, game) {
    if (!this.isActive || this.isPaused) return;
    dt = Math.min(dt, 0.05);

    if (this.tackleCooldown > 0) {
      this.tackleCooldown -= dt;
    }

    // 1. Maç Saati
    this.matchTime += dt;
    const progress = Math.min(1.0, this.matchTime / this.matchDuration);
    const virtualMin = Math.floor(progress * 90);
    const virtualSec = Math.floor((progress * 90 * 60) % 60);

    const clockEl = document.getElementById('hud-match-distance');
    if (clockEl) {
      const halfName = this.half === 1 ? '1. YARI' : '2. YARI';
      clockEl.innerText = `${halfName} ${String(virtualMin).padStart(2, '0')}:${String(virtualSec).padStart(2, '0')}`;
    }

    if (virtualMin >= 45 && this.half === 1) {
      this.half = 2;
      this.showMatchBanner("⏸️ İLK YARI SONUCU! 2. Yarı Başlıyor...");
      this.playWhistle();
    } else if (virtualMin >= 90) {
      this.endMatch();
      return;
    }

    // 2. Şut Barı
    if (this.isChargingShot) {
      this.shotPower = Math.min(100, this.shotPower + this.shotChargeSpeed * dt);
      this.updateHUDPower(this.shotPower);
    }

    // 3. Kullanıcı Hareketi (ANINDA DURUŞ - ZERO ICE SKATING)
    this.updateUserMovement(dt, game);

    // 4. Takım Arkadaşları AI
    this.updateTeammates(dt, game);

    // 5. Agresif Rakip AI (Pres & Karşı Atak)
    this.updateOpponents(dt, game);

    // 6. Kaleciler AI
    this.updateGoalkeepers(dt, game);

    // 7. Top Sürme (Ball Carrier takibi)
    this.updateBallCarrier(game);

    // 8. Kamera
    this.updateCamera(dt, game);
  }

  // KULLANICI HAREKETİ (WASD bırakılınca anında durur!)
  updateUserMovement(dt, game) {
    const p = this.homePlayers[this.activePlayerIndex];
    if (!p || !p.group) return;

    let moveX = (this.keys.KeyD || this.keys.ArrowRight ? 1 : 0) - (this.keys.KeyA || this.keys.ArrowLeft ? 1 : 0);
    let moveZ = (this.keys.KeyS || this.keys.ArrowDown ? 1 : 0) - (this.keys.KeyW || this.keys.ArrowUp ? 1 : 0);

    const isMoving = (moveX !== 0 || moveZ !== 0);
    const isSprint = (this.keys.ShiftLeft || this.keys.ShiftRight);

    if (!isMoving) {
      // ANINDA DURUŞ: Hız sıfırlanır, kayma yok!
      p.velocity.set(0, 0, 0);
      if (game.playerModels) game.playerModels.updateRunningAnimation(p, false, false, dt);
      return;
    }

    const len = Math.hypot(moveX, moveZ);
    const speed = isSprint ? (p.speed * 1.25) : p.speed;
    p.velocity.set((moveX / len) * speed, 0, (moveZ / len) * speed);

    p.group.position.addScaledVector(p.velocity, dt);

    // Saha Sınırları
    p.group.position.x = THREE.MathUtils.clamp(p.group.position.x, -25, 25);
    p.group.position.z = THREE.MathUtils.clamp(p.group.position.z, -36.5, 36.5);

    // Yüzünü hareket yönüne çevir
    const targetAngle = Math.atan2(p.velocity.x, p.velocity.z);
    p.group.rotation.y = THREE.MathUtils.lerp(p.group.rotation.y, targetAngle, 0.25);

    if (game.playerModels) {
      game.playerModels.updateRunningAnimation(p, true, isSprint, dt);
    }
  }

  // TAKIM ARKADAŞLARI AI (Hücumda yayılma)
  updateTeammates(dt, game) {
    if (!game.ball) return;
    const bPos = game.ball.position;

    this.homePlayers.forEach((p, idx) => {
      if (idx === this.activePlayerIndex || p.role === 'GK') return;

      // Topun ilerisine, sol ve sağ kanada yayıl
      let targetZ = Math.max(-32, bPos.z - 6.0);
      let targetX = (idx === 1) ? -12 : 12;

      const dx = targetX - p.group.position.x;
      const dz = targetZ - p.group.position.z;
      const dist = Math.hypot(dx, dz);

      if (dist > 1.2) {
        const speed = 6.8;
        p.group.position.x += (dx / dist) * speed * dt;
        p.group.position.z += (dz / dist) * speed * dt;
        p.group.rotation.y = THREE.MathUtils.lerp(p.group.rotation.y, Math.atan2(dx, dz), 0.15);
        if (game.playerModels) game.playerModels.updateRunningAnimation(p, true, false, dt);
      } else {
        p.group.lookAt(bPos.x, 0, bPos.z);
        if (game.playerModels) game.playerModels.updateRunningAnimation(p, false, false, dt);
      }
    });
  }

  // RAKİP TAKIM AI (AGRESİF PRES, TOP ÇALMA VE KARŞI ATAN ÇİFT KALE)
  updateOpponents(dt, game) {
    if (!game.ball) return;
    const bPos = game.ball.position;

    // 1. Oyuncu: Djiku doğrudan topa pres yapar
    const presser = this.awayPlayers[0];
    if (presser && presser.group) {
      const dx = bPos.x - presser.group.position.x;
      const dz = bPos.z - presser.group.position.z;
      const dist = Math.hypot(dx, dz);

      if (this.ballCarrier && this.ballCarrier.team === 'away') {
        // Rakip topu kaptı! Home Kalesine (+38) doğru hücum et!
        presser.group.position.z += 7.8 * dt;
        presser.group.lookAt(0, 0, 38);
        if (game.playerModels) game.playerModels.updateRunningAnimation(presser, true, true, dt);

        // 22m yakına gelince Home Kalesine şut çek!
        if (presser.group.position.z > 16.0) {
          this.executeOpponentShot(presser, game);
        }
      } else {
        // Top kullanıcıda veya boşta: Agresif pres yap!
        const pressSpeed = 8.4;
        if (dist > 1.05) {
          presser.group.position.x += (dx / dist) * pressSpeed * dt;
          presser.group.position.z += (dz / dist) * pressSpeed * dt;
          presser.group.rotation.y = THREE.MathUtils.lerp(presser.group.rotation.y, Math.atan2(dx, dz), 0.2);
          if (game.playerModels) game.playerModels.updateRunningAnimation(presser, true, true, dt);
        } else {
          // Topu çalma hamlesi
          if (game.playerModels) game.playerModels.updateRunningAnimation(presser, false, false, dt);
          if (this.isUserBallCarrier() && this.tackleCooldown <= 0) {
            this.ballCarrier = presser;
            this.tackleCooldown = 1.2;
            this.playKickSound();
            this.showMatchBanner("⚠️ RAKİP TOPU KAPTI! DİKKAT SAVUN!");
          }
        }
      }
    }

    // 2. ve 3. Oyuncular: Ceza sahası önünde kademe kurar
    for (let i = 1; i <= 2; i++) {
      const def = this.awayPlayers[i];
      if (!def || !def.group) continue;

      let targetX = (i === 1 ? -8 : 8) + (bPos.x * 0.3);
      let targetZ = Math.min(-14, bPos.z - 8);

      const dx = targetX - def.group.position.x;
      const dz = targetZ - def.group.position.z;
      const dist = Math.hypot(dx, dz);

      if (dist > 1.2) {
        def.group.position.x += (dx / dist) * 5.6 * dt;
        def.group.position.z += (dz / dist) * 5.6 * dt;
        def.group.rotation.y = THREE.MathUtils.lerp(def.group.rotation.y, Math.atan2(dx, dz), 0.15);
        if (game.playerModels) game.playerModels.updateRunningAnimation(def, true, false, dt);
      } else {
        def.group.lookAt(bPos.x, 0, bPos.z);
        if (game.playerModels) game.playerModels.updateRunningAnimation(def, false, false, dt);
      }
    }
  }

  // Rakip forvet Home kalesine şut çeker
  executeOpponentShot(shooter, game) {
    this.playKickSound();
    const dirX = (Math.random() - 0.5) * 1.2;
    const dirY = 0.4 + Math.random() * 0.8;
    const speed = 24.0;

    game.ball.shoot(dirX, dirY, speed, 0, 38); // +38 Home kalesine
    this.ballCarrier = null;
    game.hasBallPossession = false;
    this.showMatchBanner("🚨 RAKİP KALEMİZE ŞUT ÇEKTİ!");

    // Muslera kurtarışa uçar
    const homeGK = this.homePlayers[3];
    if (homeGK && homeGK.group) {
      setTimeout(() => {
        homeGK.group.position.x = THREE.MathUtils.clamp(dirX * 2.8, -3.2, 3.2);
      }, 140);
    }
  }

  // KALECİLER AI
  updateGoalkeepers(dt, game) {
    if (!game.ball) return;
    const bPos = game.ball.position;

    // Away Kaleci (Z = -36.5)
    const awayGK = this.awayPlayers[3];
    if (awayGK && awayGK.group) {
      const targetX = THREE.MathUtils.clamp(bPos.x * 0.72, -3.2, 3.2);
      awayGK.group.position.x = THREE.MathUtils.lerp(awayGK.group.position.x, targetX, 0.14);
      awayGK.group.position.z = -36.5;
      awayGK.group.lookAt(bPos.x, 0, bPos.z);
    }

    // Home Kaleci Muslera (Z = 36.5)
    const homeGK = this.homePlayers[3];
    if (homeGK && homeGK.group) {
      const targetX = THREE.MathUtils.clamp(bPos.x * 0.72, -3.2, 3.2);
      homeGK.group.position.x = THREE.MathUtils.lerp(homeGK.group.position.x, targetX, 0.14);
      homeGK.group.position.z = 36.5;
      homeGK.group.lookAt(bPos.x, 0, bPos.z);
    }
  }

  // TOP SÜRME (BALL CARRIER)
  updateBallCarrier(game) {
    if (!game.ball || game.ball.isMoving) return;

    if (this.ballCarrier && this.ballCarrier.group) {
      const p = this.ballCarrier;
      const angle = p.group.rotation.y;
      const forwardX = Math.sin(angle);
      const forwardZ = Math.cos(angle);

      game.ball.position.set(
        p.group.position.x + forwardX * 0.58,
        game.ball.radius,
        p.group.position.z + forwardZ * 0.58
      );
      if (game.ball.mesh) game.ball.mesh.position.copy(game.ball.position);
      if (game.ball.shadow) game.ball.shadow.position.set(game.ball.position.x, 0.015, game.ball.position.z);
    }
  }

  // DİNAMİK TV / ARCADE KAMERASI
  updateCamera(dt, game) {
    if (!game.ball || !game.camera) return;
    const bPos = game.ball.position;

    if (this.cameraMode === 'player') {
      const userP = this.homePlayers[this.activePlayerIndex];
      if (userP && userP.group) {
        const pPos = userP.group.position;
        game.camera.position.lerp(new THREE.Vector3(pPos.x, 5.0, pPos.z + 8.0), 0.1);
        game.camera.lookAt(pPos.x, 1.2, pPos.z - 10);
      }
    } else {
      // Broadcast TV Kamerası
      const targetCamX = bPos.x * 0.35;
      const targetCamY = 16.5;
      const targetCamZ = bPos.z + 18.0;
      game.camera.position.lerp(new THREE.Vector3(targetCamX, targetCamY, targetCamZ), 0.09);
      game.camera.lookAt(bPos.x * 0.2, 0.8, bPos.z - 3.0);
    }
  }

  // 8. GOL OLDUĞUNDA (ÇİFT KALE)
  onGoalScored(scoringTeam = 'home') {
    if (this.state === MATCH_STATE.GOAL) return;
    this.state = MATCH_STATE.GOAL;

    if (scoringTeam === 'home') {
      this.homeScore++;
      const scorer = this.homePlayers[this.activePlayerIndex]?.name || 'Victor Osimhen';
      this.showMatchBanner(`⚽ GOOOOOOL! ${this.homeTeam.name.toUpperCase()}!\n${scorer} harika bir gol attı!`);
    } else {
      this.awayScore++;
      this.showMatchBanner(`⚽ GOOOL! ${this.awayTeam.name.toUpperCase()} golü buldu!`);
    }

    this.playWhistle();
    this.playGoalCheer();

    const scoreEl = document.getElementById('hud-score-display');
    if (scoreEl) scoreEl.innerText = `${this.homeScore} - ${this.awayScore}`;

    // 1.8 saniye sonra santradan devam et
    clearTimeout(this.restartTimer);
    this.restartTimer = setTimeout(() => {
      if (window.gameInstance) {
        this.resetToKickoff(window.gameInstance);
      }
    }, 1800);
  }

  // 9. MAÇ SONU
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
      if (ratingEl) ratingEl.innerText = this.homeScore > this.awayScore ? '9.2 (Galibiyet)' : '7.0';
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
