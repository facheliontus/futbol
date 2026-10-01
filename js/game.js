// ==========================================================
// ANA OYUN DÖNGÜSÜ VE KONTROLLER (game.js)
// ==========================================================

class Game {
  constructor() {
    this.container = document.getElementById('game-canvas-container');
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    // Three.js Temelleri
    this.scene = null;
    this.camera = null;
    this.renderer = null;

    // Alt Modüller
    this.stadium = null;
    this.ball = null;
    this.playerModels = null;
    this.career = window.careerManager;

    // Kontrol ve Nişan Durumu
    this.isAiming = false;
    this.aimStart = { x: 0, y: 0 };
    this.aimCurrent = { x: 0, y: 0 };
    this.shotCooldown = false;
    this.currentScenario = null;
    this.gkMouseX = 0; // Kaleci modu için fare x oranı (-1 ile +1)
    this.currentFalso = 0; // -1.2 (sola) ile +1.2 (sağa)

    // Co-op 2 Kişilik Eşli Hücum Durumu
    this.isCoopMatch = false;
    this.coopRole = 'passer'; // 'passer' veya 'shooter'
    this.coopScenario = null;
    this.coopState = 'waiting_pass'; // 'waiting_pass', 'passing', 'ready_to_shoot', 'shot_taken'
    this.hasBallPossession = false;

    // 360 Serbest Kamera ve Çalım (FIFA / PES Tarzı)
    this.cameraYaw = 0; // Yatay kamera açısı
    this.cameraPitch = 0.22; // Dikey açı
    this.cameraDistance = 6.8;
    this.isSkillMoving = false;
    this.skillMoveCooldown = false;
    this.lastMouseX = null;
    this.lastMouseY = null;

    // Klavye Hareket Tuşları (WASD & Ok Tuşları & Depar)
    this.keys = {
      KeyW: false,
      KeyA: false,
      KeyS: false,
      KeyD: false,
      ArrowUp: false,
      ArrowLeft: false,
      ArrowDown: false,
      ArrowRight: false,
      ShiftLeft: false,
      ShiftRight: false
    };

    // Zaman ve Döngü
    this.lastTime = performance.now();
    this.timeScale = 1.0; // Slow-motion efekti için

    // Nişan Alma Eğrisi Çizgisi ve 3D Hedef Nişangahı
    this.aimLine = null;
    this.crosshair = null;

    this.initThree();
    this.initInputs();
  }

  initThree() {
    // 1. Sahne
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a1424);
    this.scene.fog = new THREE.FogExp2(0x0a1424, 0.012);

    // 2. Kamera
    this.camera = new THREE.PerspectiveCamera(55, this.width / this.height, 0.1, 200);
    this.setCameraBehindBall();

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.container.appendChild(this.renderer.domElement);

    // 4. Modülleri Başlat
    this.stadium = new Stadium(this.scene);
    this.ball = new BallPhysics(this.scene);
    this.playerModels = new PlayerModels(this.scene);

    // 5. Nişan Hattı Görseli
    const lineGeo = new THREE.BufferGeometry();
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x00f2fe,
      linewidth: 3,
      transparent: true,
      opacity: 0.8
    });
    this.aimLine = new THREE.Line(lineGeo, lineMat);
    this.scene.add(this.aimLine);

    // 6. 3D Hedef Nişangah Halkası (Hedefin tam yerini gösterir)
    const crossGeo = new THREE.RingGeometry(0.24, 0.32, 24);
    const crossMat = new THREE.MeshBasicMaterial({
      color: 0x00f2fe,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0
    });
    this.crosshair = new THREE.Mesh(crossGeo, crossMat);
    this.crosshair.position.set(0, 1.2, 0.05);
    this.scene.add(this.crosshair);

    // 7. Kaleci Eldiven Hedef Göstergesi (Kaleci Modunda Fareyi Takip Eden 3D Reticle)
    this.gkReticleGroup = new THREE.Group();
    const reticleRingMat = new THREE.MeshBasicMaterial({
      color: 0x00ff88,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
      depthTest: false
    });
    const leftRing = new THREE.Mesh(new THREE.RingGeometry(0.18, 0.25, 24), reticleRingMat);
    leftRing.position.set(-0.35, 0, 0);
    const rightRing = new THREE.Mesh(new THREE.RingGeometry(0.18, 0.25, 24), reticleRingMat);
    rightRing.position.set(0.35, 0, 0);
    const centerDot = new THREE.Mesh(new THREE.CircleGeometry(0.06, 16), new THREE.MeshBasicMaterial({
      color: 0x00f2fe,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
      depthTest: false
    }));
    this.gkReticleGroup.add(leftRing);
    this.gkReticleGroup.add(rightRing);
    this.gkReticleGroup.add(centerDot);
    this.gkReticleGroup.position.set(0, 1.2, 0.4);
    this.gkReticleGroup.visible = false;
    this.scene.add(this.gkReticleGroup);

    // Resize Dinleyicisi
    window.addEventListener('resize', () => this.onResize());

    // Animasyon Döngüsünü Başlat
    this.animate();
  }

  // KAMERA KONUMLARI
  setCameraBehindBall() {
    if (!this.ball) return;
    this.cameraYaw = 0;
    this.cameraPitch = 0.22;
    const bPos = this.ball.position;
    this.camera.position.set(bPos.x, bPos.y + 1.8, bPos.z + 4.2);
    this.camera.lookAt(0, 1.2, 0);
    if (this.gkReticleGroup) this.gkReticleGroup.visible = false;
  }

  setCameraGoalkeeperView() {
    // Kaleci Modu: Kalenin üstünden ve arkasından geniş, ferah yayın açısı (FIFA Be-A-Pro Kamera)
    // Kaleyi, direkleri, barajı ve şut çeken forveti mükemmel panoramik açıyla görür
    this.camera.position.set(0, 2.6, -3.4);
    this.camera.lookAt(0, 1.1, 14);
    if (this.gkReticleGroup) this.gkReticleGroup.visible = true;
  }

  setCameraFollowBall() {
    if (!this.ball) return;
    const bPos = this.ball.position;
    this.camera.position.lerp(new THREE.Vector3(bPos.x * 0.4, bPos.y + 2.5, bPos.z + 4.8), 0.1);
    this.camera.lookAt(bPos.x, Math.max(1.0, bPos.y), 0);
  }

  // YENİ POZİSYON / SENARYO YÜKLE
  setupScenario(scenario) {
    this.isCoopMatch = false;
    this.currentScenario = scenario;
    this.shotCooldown = false;
    this.timeScale = 1.0;

    this.playerModels.clearAll();

    const isGK = this.career.player.position === 'GK';
    const club = this.career.getCurrentClub();
    const clubColor = parseInt(club.colors.primary.replace('#', '0x')) || 0xe74c3c;

    // HUD Başlıklarını Güncelle
    document.getElementById('hud-scenario-title').innerText = scenario.title;
    document.getElementById('hud-scenario-desc').innerText = scenario.desc;
    document.getElementById('hud-match-distance').innerText = scenario.distance + ' Metre';

    // Top Başlangıç Konumu
    let ballPos = new THREE.Vector3(0, this.ball.radius, scenario.distance);

    if (scenario.type === 'freekick') {
      // Hafif çapraz açı varyasyonu
      const angleOffset = (Math.random() - 0.5) * 6;
      ballPos.x = angleOffset;
      this.ball.reset(ballPos);

      // Baraj kur (Top ile kale arasında)
      this.playerModels.createWall(ballPos, 4, 0x34495e);
    } else if (scenario.type === 'penalty') {
      ballPos.set(0, this.ball.radius, 11);
      this.ball.reset(ballPos);
      // Penaltıda baraj yok
      this.playerModels.wall.forEach(def => this.scene.remove(def.group));
      this.playerModels.wall = [];
    } else if (scenario.type === 'pass_shoot') {
      ballPos.set(4, this.ball.radius, 20);
      this.ball.reset(ballPos);
      this.playerModels.createWall(ballPos, 3, 0x34495e);
    }

    if (isGK) {
      // OYUNCU KALECİ İSE:
      this.gkMouseX = 0;
      this.gkMouseY = 0.5;
      this.setCameraGoalkeeperView();
      // Kaleciyi oluştur (Kullanıcının forması)
      this.playerModels.createGoalkeeper(clubColor);
      // Rakip Forveti Topun Başına Koy
      this.playerModels.createKicker(ballPos, 0xe74c3c, 9);

      if (this.gkReticleGroup) {
        this.gkReticleGroup.visible = true;
        this.gkReticleGroup.position.set(0, 1.25, 0.4);
      }

      const hintEl = document.getElementById('hud-control-hint');
      if (hintEl) {
        hintEl.innerHTML = `🧤 <b>KALECİ KONTROLÜ:</b> Fareyle eldivenleri yönlendir (Sağ/Sol/Yukarı/Aşağı) | [Sol Tık / Boşluk] Uçarak Kurtar | [A / D] Yana Adımla`;
      }
      const fBar = document.querySelector('.falso-control-bar');
      if (fBar) fBar.style.display = 'none';

      // Rakip AI Şut Hazırlığı (Yalnızca tek oyunculu modda çalışır, online modda rakip şut çeker)
      if (!window.onlineManager || !window.onlineManager.isOnlineMatch) {
        setTimeout(() => {
          if (this.currentScenario === scenario) {
            this.executeAIShot(ballPos, scenario.distance);
          }
        }, 1600);
      }
    } else {
      // OYUNCU FORVET VEYA ORTA SAHA İSE:
      this.setCameraBehindBall();
      // Kaleci AI oluştur
      this.playerModels.createGoalkeeper(0x27ae60);
      // Kendi oyuncumuzu topun başına koy
      this.playerModels.createKicker(ballPos, clubColor, this.career.player.jerseyNumber);

      if (this.gkReticleGroup) {
        this.gkReticleGroup.visible = false;
      }

      const hintEl = document.getElementById('hud-control-hint');
      if (hintEl) {
        hintEl.innerHTML = `🎯 <b>KONTROLLER:</b> [WASD] Serbest Koş | [Shift] Depar | ⚡ [E / V] Çalım | 🔄 [Fare] Kamerayı Çevir | 💣 [Sol Tık] Şut Çek | [Q / Tekerlek] Falso`;
      }
      const fBar = document.querySelector('.falso-control-bar');
      if (fBar) fBar.style.display = 'flex';
    }
  }

  // CO-OP 2 KİŞİLİK EŞLİ HÜCUM SENARYOSU KUR
  setupCoopScenario(scen, myRole) {
    this.isCoopMatch = true;
    this.coopRole = myRole; // 'passer' veya 'shooter'
    this.coopScenario = scen;
    this.coopState = 'waiting_pass';
    this.shotCooldown = false;
    this.timeScale = 1.0;
    this.hasBallPossession = (myRole === 'passer');

    this.playerModels.clearAll();

    // Bot Kaleci Oluştur (Yüksek Performanslı AI Kaleci)
    this.playerModels.createGoalkeeper(0x27ae60);

    // Varsa Baraj Kur
    if (scen.hasWall) {
      const wallX = scen.passerPos.x * 0.4;
      const wallZ = (scen.passerPos.z + 0) * 0.65;
      this.playerModels.createWall(new THREE.Vector3(wallX, 0.11, wallZ), 3, 0x34495e);
    }

    const passerPos = new THREE.Vector3(scen.passerPos.x, scen.passerPos.y, scen.passerPos.z);
    const shooterPos = new THREE.Vector3(scen.shooterPos.x, scen.shooterPos.y, scen.shooterPos.z);

    const club = this.career.getCurrentClub();
    const myColor = parseInt(club.colors.primary.replace('#', '0x')) || 0xe74c3c;

    if (myRole === 'passer') {
      // Pasör sensin: kicker senin karakterin (passerPos), teammate arkadaşın (shooterPos)
      this.playerModels.createKicker(passerPos, myColor, this.career.player.jerseyNumber || 10);
      this.playerModels.createTeammate(shooterPos, myColor, 9, 'ARKADAŞIN (FORVET)');
      this.ball.reset(new THREE.Vector3(passerPos.x, this.ball.radius, passerPos.z));
      this.hasBallPossession = true;
      this.showGoalBanner("⚽ TOP SENDE! WASD İLE POZİSYON AL, BOŞLUK VEYA FAREYLE PAS AT!");
    } else {
      // Şutör sensin: kicker senin karakterin (shooterPos), teammate pasör arkadaşın (passerPos)
      this.playerModels.createKicker(shooterPos, myColor, this.career.player.jerseyNumber || 9);
      this.playerModels.createTeammate(passerPos, myColor, 10, 'ARKADAŞIN (PASÖR)');
      this.ball.reset(new THREE.Vector3(passerPos.x, this.ball.radius, passerPos.z));
      this.hasBallPossession = false;
      this.showGoalBanner("🏃 ARKADAŞIN PAS AÇIYOR! WASD İLE CEZA SAHASINDA BOŞA KAÇ!");
    }

    // Rakip AI Defans Oyuncuları (2 Adet Stoper)
    const def1Pos = new THREE.Vector3(-3.4, 0.11, 14.5);
    const def2Pos = new THREE.Vector3(3.4, 0.11, 16.5);
    this.playerModels.createDefenders([def1Pos, def2Pos], 0x1e3a8a);

    if (this.gkReticleGroup) this.gkReticleGroup.visible = false;

    const fBar = document.querySelector('.falso-control-bar');
    if (fBar) fBar.style.display = 'flex';

    const hintEl = document.getElementById('hud-control-hint');
    if (hintEl) {
      hintEl.innerHTML = `🏃 <b>WASD:</b> Koş | [Shift] Depar | ⚡ <b>[E/V]:</b> Çalım At | 🎯 <b>[Boşluk/X]:</b> Pas Ver | 💣 <b>Fare:</b> Şut Çek | 🔄 <b>Fare:</b> Kamerayı Çevir`;
    }
  }

  // CO-OP PASI GÖNDER (Pasör Ekranı)
  triggerCoopPass(targetPos, flightDuration, arcHeight, curl) {
    if (this.shotCooldown) return;
    this.hasBallPossession = false;
    this.shotCooldown = true;
    this.coopState = 'passing';

    this.playerModels.triggerKickAnimation(() => {
      this.ball.passTo(targetPos, flightDuration, arcHeight, curl, () => {
        this.onCoopPassArrived();
      });
      if (window.onlineManager) {
        window.onlineManager.sendCoopPass(targetPos, 25, curl, arcHeight, flightDuration);
      }
    });

    setTimeout(() => {
      this.shotCooldown = false;
    }, 900);
  }

  // CO-OP PASINI AL (Şutör Ekranı)
  receiveCoopPass(data) {
    this.shotCooldown = false;
    this.coopState = 'passing';
    this.hasBallPossession = false;

    const targetPos = new THREE.Vector3(data.targetPos.x, data.targetPos.y, data.targetPos.z);
    this.playerModels.triggerTeammateKickAnimation(() => {
      this.ball.passTo(targetPos, data.flightDuration || 1.15, data.arcHeight || 2.0, data.curl || 0, () => {
        this.onCoopPassArrived();
      });
    });

    this.showGoalBanner("💥 TOP GELİYOR! WASD İLE KARŞILA VE KALEYE VOLEYİ ÇAK!");
  }

  // PAS YERİNE ULAŞTIĞINDA
  onCoopPassArrived() {
    this.coopState = 'ready_to_shoot';
    const kickCheck = this.isBallInKickRange();
    if (kickCheck.canKick) {
      this.hasBallPossession = true;
      this.showGoalBanner("💥 TOP AYAKTA! KALEYE ŞUT ÇEK!");
    }
  }

  // CO-OP ŞUTU / VOLEYİ ÇEK (Şutör Ekranı)
  triggerCoopShot(dirX, dirY, power, curl) {
    const kickCheck = this.isBallInKickRange();
    if (!kickCheck.canKick) {
      this.showGoalBanner("⚠️ TOP AYAKTA DEĞİL! (" + Math.round(kickCheck.dist) + "m Uzakta - WASD ile Koş)");
      return;
    }

    if (this.coopState === 'shot_taken') return;
    this.coopState = 'shot_taken';
    this.shotCooldown = true;
    this.hasBallPossession = false;

    const targetX = dirX * 4.6;
    const targetY = dirY * 2.5;

    this.clearAimLine();

    const animCallback = () => {
      this.ball.shoot(dirX, dirY, power, curl);
      this.updateSpeedHUD(power);

      if (window.onlineManager) {
        window.onlineManager.sendCoopShot(dirX, dirY, power, curl, kickCheck.type);
      }

      // Bot Kaleci Uçuşu
      const flightDuration = (this.ball.position.z / power);
      setTimeout(() => {
        this.playerModels.triggerGoalkeeperDive(targetX, targetY, 0, flightDuration * 0.95);
      }, 200);
    };

    if (kickCheck.type === 'volley') {
      this.playerModels.triggerVolleyAnimation(animCallback);
    } else if (kickCheck.type === 'header') {
      this.playerModels.triggerHeaderAnimation(animCallback);
    } else {
      this.playerModels.triggerKickAnimation(animCallback);
    }
  }

  // CO-OP ŞUTUNU AL (Pasör Ekranı)
  receiveCoopShot(data) {
    this.coopState = 'shot_taken';
    this.hasBallPossession = false;
    const targetX = data.dirX * 4.6;
    const targetY = data.dirY * 2.5;

    const animCallback = () => {
      this.ball.shoot(data.dirX, data.dirY, data.power, data.curl);
      this.updateSpeedHUD(data.power);

      const flightDuration = (this.ball.position.z / data.power);
      setTimeout(() => {
        this.playerModels.triggerGoalkeeperDive(targetX, targetY, 0, flightDuration * 0.95);
      }, 200);
    };

    if (data.shotType === 'volley') {
      this.playerModels.triggerVolleyAnimation(animCallback, this.playerModels.teammate);
    } else if (data.shotType === 'header') {
      this.playerModels.triggerHeaderAnimation(animCallback, this.playerModels.teammate);
    } else {
      this.playerModels.triggerTeammateKickAnimation(animCallback);
    }
  }

  // RAKİP AI ŞUT ÇEKME (Kaleci Modunda)
  executeAIShot(ballPos, distance) {
    if (this.shotCooldown) return;
    this.shotCooldown = true;

    // AI Hedefi: Köşelere veya 90'a rastgele yönelir
    const targetSides = [-0.85, -0.65, 0.65, 0.85, 0.2];
    const dirX = targetSides[Math.floor(Math.random() * targetSides.length)];
    const dirY = 0.5 + Math.random() * 0.8; // Havadan veya 90'dan
    const power = 24 + Math.random() * 6;   // 85 - 110 km/h
    const curl = (Math.random() - 0.5) * 0.8;

    // Güvenlik zamanlayıcısı
    clearTimeout(this.shotSafetyTimer);
    this.shotSafetyTimer = setTimeout(() => {
      if (this.shotCooldown) {
        this.advanceScenarioAfterDelay(500);
      }
    }, 4500);

    this.playerModels.triggerKickAnimation(() => {
      this.ball.shoot(dirX, dirY, power, curl);
      this.updateSpeedHUD(power);
      if (this.currentScenario.type === 'freekick') {
        this.playerModels.triggerWallJump();
      }
    });
  }

  // TOP AYAKTA MI / VURUŞ ALANINDA MI KONTROLÜ
  isBallInKickRange() {
    if (!this.ball || !this.playerModels || !this.playerModels.kicker) {
      return { canKick: false, dist: 99, type: 'too_far' };
    }
    const pPos = this.playerModels.kicker.group.position;
    const bPos = this.ball.position;
    const hDist = Math.hypot(pPos.x - bPos.x, pPos.z - bPos.z);
    const vDist = bPos.y;

    // Ayak mesafesi (yerden veya alçaktan)
    if (hDist <= 2.2 && vDist <= 1.3) {
      return { canKick: true, dist: hDist, type: 'ground' };
    }
    // Gelişine Vole mesafesi (havadan gelen toplar)
    if (hDist <= 2.6 && vDist > 0.4 && vDist <= 2.0) {
      return { canKick: true, dist: hDist, type: 'volley' };
    }
    // Kafa vuruşu mesafesi (yüksek orta)
    if (hDist <= 2.0 && vDist > 1.6 && vDist <= 2.7) {
      return { canKick: true, dist: hDist, type: 'header' };
    }

    return { canKick: false, dist: hDist, type: 'too_far' };
  }

  // TEK TUŞLA ARKADAŞA ADRESE TESLİM PAS (Boşluk / X / C Tuşu)
  handleQuickPassAction() {
    if (this.shotCooldown) return;

    const kickCheck = this.isBallInKickRange();
    if (!kickCheck.canKick) {
      this.showGoalBanner("⚠️ TOP AYAKTA DEĞİL! Pas atamazsın, önce topa doğru koş (WASD)");
      return;
    }

    this.hasBallPossession = false;

    // Takım arkadaşının anlık pozisyonunu al
    let targetPos = new THREE.Vector3(0, 0, 14);
    if (this.playerModels && this.playerModels.teammate) {
      targetPos = this.playerModels.teammate.group.position.clone();
      // Arkadaşın koşuyorsa koşu yoluna doğru at (araya pas)
      const forwardX = Math.sin(this.playerModels.teammate.group.rotation.y);
      const forwardZ = Math.cos(this.playerModels.teammate.group.rotation.y);
      targetPos.x += forwardX * 1.6;
      targetPos.z += forwardZ * 1.6;
    }

    const pPos = this.playerModels.kicker.group.position;
    const dist = Math.hypot(targetPos.x - pPos.x, targetPos.z - pPos.z);
    const flightDuration = Math.max(0.75, dist / 22);
    const arcHeight = (dist > 15) ? 2.6 : 0.35;
    const curl = this.currentFalso;

    this.showGoalBanner("🎯 PAS ATILDI! Arkadaşın topa doğru koşuyor!");
    this.triggerCoopPass(targetPos, flightDuration, arcHeight, curl);
  }

  // WASD / OK TUŞLARI İLE SERBEST KOŞMA & TOP KONTROLÜ
  updatePlayerMovement(dt) {
    if (!this.playerModels || !this.playerModels.kicker) return;
    if (this.career.player && this.career.player.position === 'GK') return;

    const kicker = this.playerModels.kicker;
    const pGroup = kicker.group;

    let forwardInput = (this.keys.KeyW || this.keys.ArrowUp ? 1 : 0) - (this.keys.KeyS || this.keys.ArrowDown ? 1 : 0);
    let strafeInput = (this.keys.KeyD || this.keys.ArrowRight ? 1 : 0) - (this.keys.KeyA || this.keys.ArrowLeft ? 1 : 0);

    const isMoving = (forwardInput !== 0 || strafeInput !== 0);
    const isSprinting = (this.keys.ShiftLeft || this.keys.ShiftRight);
    const moveSpeed = isSprinting ? 9.8 : 6.4; // m/s

    if (isMoving && !kicker.isKicking && !this.isSkillMoving) {
      const len = Math.hypot(strafeInput, forwardInput);
      const normStrafe = strafeInput / len;
      const normForward = forwardInput / len;

      // Kameranın baktığı açıya (cameraYaw) göre yön hesaplama (FIFA / PES Tarzı 3D Kontrol)
      const camYaw = this.cameraYaw || 0;
      const camForwardX = -Math.sin(camYaw);
      const camForwardZ = -Math.cos(camYaw);
      const camRightX = Math.cos(camYaw);
      const camRightZ = -Math.sin(camYaw);

      const moveX = camRightX * normStrafe + camForwardX * normForward;
      const moveZ = camRightZ * normStrafe + camForwardZ * normForward;

      pGroup.position.x += moveX * moveSpeed * dt;
      pGroup.position.z += moveZ * moveSpeed * dt;

      // Sınırlar (Ceza sahası ve çevresi)
      pGroup.position.x = THREE.MathUtils.clamp(pGroup.position.x, -26, 26);
      pGroup.position.z = THREE.MathUtils.clamp(pGroup.position.z, 2.0, 42);

      // Hareket yönüne doğru yumuşak dönüş
      const targetAngle = Math.atan2(moveX, moveZ);
      pGroup.rotation.y = THREE.MathUtils.lerp(pGroup.rotation.y, targetAngle, 0.25);
    } else if (!kicker.isKicking && !this.isSkillMoving) {
      if (this.ball) {
        const angleToGoal = Math.atan2(-pGroup.position.x, -pGroup.position.z);
        pGroup.rotation.y = THREE.MathUtils.lerp(pGroup.rotation.y, angleToGoal, 0.08);
      }
    }

    // Bacak & kol koşu animasyonu
    this.playerModels.updateRunningAnimation(kicker, isMoving, isSprinting, dt);

    // TOP KONTROLÜ & İLK DOKUNUŞLA STOP ETME (FIRST TOUCH CUSHION TRAP)
    if (!this.hasBallPossession && this.ball) {
      const bPos = this.ball.position;
      const hDist = Math.hypot(pGroup.position.x - bPos.x, pGroup.position.z - bPos.z);
      const vDist = bPos.y;

      // Top oyuncuya 2.2 metre yaklaştıysa ve havada çok yüksekte değilse (2.2m altı) stop et ve ayağa al!
      if (hDist < 2.2 && vDist < 2.2) {
        const ballSpeed = this.ball.velocity ? this.ball.velocity.length() : 0;
        if (ballSpeed < 32) { // 32 m/s altındaki pasları ve gelen topları yumuşakça kontrol et
          this.ball.cushionTrap(pGroup.position);
          this.hasBallPossession = true;
          this.coopState = 'ready_to_shoot';
          this.showGoalBanner("⚽ HARİKA STOP! TOP AYAKTA! [ŞUT VEYA PAS AT]");
        }
      }
    }

    // Top ayaktaysa oyuncunun önünde taşı (Dribling)
    if (this.hasBallPossession && this.ball && !this.ball.isMoving && !this.isSkillMoving) {
      const forwardX = Math.sin(pGroup.rotation.y);
      const forwardZ = Math.cos(pGroup.rotation.y);
      this.ball.position.x = pGroup.position.x + forwardX * 0.48;
      this.ball.position.z = pGroup.position.z + forwardZ * 0.48;
      this.ball.position.y = this.ball.radius;
      this.ball.mesh.position.copy(this.ball.position);
      this.ball.shadow.position.set(this.ball.position.x, 0.015, this.ball.position.z);
      if (isMoving) {
        this.ball.mesh.rotation.x += dt * moveSpeed * 3;
      }
    }

    // Vuruş alanı halkasını güncelle
    const kickCheck = this.isBallInKickRange();
    this.playerModels.updateKickZone(pGroup.position, kickCheck.canKick, kickCheck.type);

    // Online senkronizasyon (Konumu arkadaşına ilet)
    if (window.onlineManager && window.onlineManager.isOnlineMatch) {
      window.onlineManager.throttleSendPlayerPos(
        pGroup.position,
        pGroup.rotation.y,
        isMoving,
        isSprinting,
        this.hasBallPossession
      );
    }
  }

  // OYUNCUYU TAKİP EDEN SERBEST 360 KAMERA (Fare ile Orbit)
  updateFollowCamera(dt) {
    if (!this.playerModels || !this.playerModels.kicker) return;
    const pPos = this.playerModels.kicker.group.position;

    const dist = this.cameraDistance || 6.8;
    const yaw = this.cameraYaw || 0;
    const pitch = this.cameraPitch || 0.22;

    const horizontalDist = dist * Math.cos(pitch);
    const camY = pPos.y + 1.8 + dist * Math.sin(pitch);
    const camX = pPos.x + Math.sin(yaw) * horizontalDist;
    const camZ = pPos.z + Math.cos(yaw) * horizontalDist;

    this.camera.position.lerp(new THREE.Vector3(camX, Math.max(1.2, camY), camZ), 0.14);

    const lookTarget = new THREE.Vector3(
      pPos.x - Math.sin(yaw) * 1.5,
      pPos.y + 1.25,
      pPos.z - Math.cos(yaw) * 1.5
    );
    this.camera.lookAt(lookTarget);
  }

  // ÇALIM ATMA / MAKAS / VÜCUT ÇALIMI (E / V Tuşu)
  executeSkillMove() {
    if (this.isSkillMoving || this.skillMoveCooldown) return;
    if (!this.playerModels || !this.playerModels.kicker) return;

    this.isSkillMoving = true;
    this.skillMoveCooldown = true;

    const kicker = this.playerModels.kicker;
    const pGroup = kicker.group;

    this.showGoalBanner("⚡ BİLEK ÇALIMI! (Step-Over Feint)");

    const forwardX = Math.sin(pGroup.rotation.y);
    const forwardZ = Math.cos(pGroup.rotation.y);
    const rightX = Math.cos(pGroup.rotation.y);
    const rightZ = -Math.sin(pGroup.rotation.y);

    let step = 0;
    const skillInterval = setInterval(() => {
      step++;
      const sideOffset = Math.sin(step * 0.8) * 0.22;
      pGroup.position.x += (forwardX * 0.42 + rightX * sideOffset);
      pGroup.position.z += (forwardZ * 0.42 + rightZ * sideOffset);

      if (kicker.bodyGroup) {
        kicker.bodyGroup.rotation.z = Math.sin(step * 0.8) * 0.28;
      }
      if (kicker.rightLegGroup && kicker.leftLegGroup) {
        kicker.rightLegGroup.rotation.x = Math.sin(step) * 0.6;
        kicker.leftLegGroup.rotation.x = -Math.sin(step) * 0.6;
      }

      if (this.hasBallPossession && this.ball) {
        this.ball.position.x = pGroup.position.x + forwardX * 0.5 + rightX * (sideOffset * 0.5);
        this.ball.position.z = pGroup.position.z + forwardZ * 0.5 + rightZ * (sideOffset * 0.5);
        this.ball.mesh.position.copy(this.ball.position);
        this.ball.shadow.position.set(this.ball.position.x, 0.015, this.ball.position.z);
      }

      if (step >= 8) {
        clearInterval(skillInterval);
        this.isSkillMoving = false;
        if (kicker.bodyGroup) kicker.bodyGroup.rotation.z = 0;

        // Yakındaki AI defansları sersemlet (stun)
        if (this.playerModels && this.playerModels.defenders) {
          this.playerModels.defenders.forEach(def => {
            const dist = pGroup.position.distanceTo(def.group.position);
            if (dist < 3.5) {
              def.stunTimer = 1.6;
              def.isTackling = false;
              if (def.bodyGroup) def.bodyGroup.rotation.z = 0.35;
            }
          });
        }
      }
    }, 40);

    setTimeout(() => {
      this.skillMoveCooldown = false;
    }, 1100);
  }

  // AI DEFANS OYUNCULARI (Pres & Müdahale)
  updateDefenders(dt) {
    if (!this.playerModels || !this.playerModels.defenders || this.playerModels.defenders.length === 0) return;
    if (!this.ball) return;

    const ballPos = this.ball.position;
    const kicker = this.playerModels.kicker;

    let targetPos = ballPos;
    let ballCarrier = null;

    if (this.hasBallPossession && kicker) {
      targetPos = kicker.group.position;
      ballCarrier = kicker;
    }

    this.playerModels.defenders.forEach((def, index) => {
      if (!def.group) return;

      // Sersemleme (çalım yeme durumu)
      if (def.stunTimer && def.stunTimer > 0) {
        def.stunTimer -= dt;
        if (def.stunTimer <= 0 && def.bodyGroup) {
          def.bodyGroup.rotation.z = 0;
        }
        return;
      }

      const dPos = def.group.position;
      let desiredTarget = targetPos.clone();
      if (index === 1) {
        desiredTarget.x = THREE.MathUtils.lerp(targetPos.x, 0, 0.45);
        desiredTarget.z = THREE.MathUtils.clamp(targetPos.z - 2.5, 6, 25);
      }

      const dx = desiredTarget.x - dPos.x;
      const dz = desiredTarget.z - dPos.z;
      const dist = Math.hypot(dx, dz);

      const defSpeed = 4.2; // m/s

      if (dist > 1.15) {
        const moveDirX = dx / dist;
        const moveDirZ = dz / dist;
        dPos.x += moveDirX * defSpeed * dt;
        dPos.z += moveDirZ * defSpeed * dt;

        dPos.x = THREE.MathUtils.clamp(dPos.x, -22, 22);
        dPos.z = THREE.MathUtils.clamp(dPos.z, 2.5, 34);

        const angle = Math.atan2(moveDirX, moveDirZ);
        def.group.rotation.y = THREE.MathUtils.lerp(def.group.rotation.y, angle, 0.15);

        this.playerModels.updateRunningAnimation(def, true, false, dt);
      } else {
        this.playerModels.updateRunningAnimation(def, false, false, dt);
        if (this.hasBallPossession && !this.isSkillMoving && !def.isTackling && ballCarrier) {
          this.handleDefenderTackle(def, ballCarrier);
        }
      }
    });
  }

  // DEFANS MÜDAHALESİ (Ayak Uzatma / Top Kapma)
  handleDefenderTackle(def, ballCarrier) {
    def.isTackling = true;
    if (def.rightLegGroup) {
      def.rightLegGroup.rotation.x = -1.1;
    }

    setTimeout(() => {
      if (def.rightLegGroup) def.rightLegGroup.rotation.x = 0;
      def.isTackling = false;
    }, 600);

    const dist = def.group.position.distanceTo(ballCarrier.group.position);
    if (dist < 1.4 && this.hasBallPossession && !this.isSkillMoving) {
      this.hasBallPossession = false;
      this.showGoalBanner("⚠️ DEFANS ARAYA GİRDİ! TOPU KAPTIRDIN! (Çalım At [E/V] veya Pas Ver)");

      const tackleDirX = (Math.random() - 0.5) * 4;
      const tackleDirZ = 5 + Math.random() * 4;
      this.ball.velocity.set(tackleDirX, 1.2, tackleDirZ);
      this.ball.isMoving = true;
    }
  }

  // FARE KONTROLLERİ VE NİŞAN ALMA
  initInputs() {
    const canvas = this.renderer.domElement;

    // MOUSE DOWN: Nişan almaya başla
    canvas.addEventListener('mousedown', (e) => {
      if (this.career.player && this.career.player.position === 'GK') {
        this.handleGoalkeeperDiveAction();
        return;
      }

      if (this.shotCooldown) return;

      // Top ayağımızda değilse şut çekmeye izin verme
      const kickCheck = this.isBallInKickRange();
      if (!kickCheck.canKick) {
        this.showGoalBanner("⚠️ TOP AYAKTA DEĞİL! (" + Math.round(kickCheck.dist) + "m Uzakta - WASD ile Koş)");
        return;
      }

      this.isAiming = true;
      this.aimStart.x = e.clientX;
      this.aimStart.y = e.clientY;
      this.aimCurrent.x = e.clientX;
      this.aimCurrent.y = e.clientY;
    });

    // MOUSE MOVE: Nişan çizgisini güncelle veya Kaleciyi hareket ettir
    window.addEventListener('mousemove', (e) => {
      if (this.career.player && this.career.player.position === 'GK') {
        const xNorm = (e.clientX / window.innerWidth) * 2 - 1;
        const yNorm = THREE.MathUtils.clamp(1.0 - (e.clientY / window.innerHeight), 0, 1);
        this.gkMouseX = xNorm;
        this.gkMouseY = yNorm;
        this.playerModels.setGoalkeeperManualPosition(this.gkMouseX, this.gkMouseY, false);

        if (this.gkReticleGroup) {
          const targetX = xNorm * 3.4;
          const targetY = 0.25 + yNorm * 2.15;
          this.gkReticleGroup.position.set(targetX, targetY, 0.4);
        }

        if (window.onlineManager && window.onlineManager.isOnlineMatch) {
          window.onlineManager.sendGoalkeeperMove(this.gkMouseX, this.gkMouseY, false);
        }
        return;
      }

      if (this.isAiming) {
        this.aimCurrent.x = e.clientX;
        this.aimCurrent.y = e.clientY;
        this.updateAimTrajectory();
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
        return;
      }

      // Fareyi sağa/sola/yukarı/aşağı hareket ettirince kamera serbestçe 360 döner (FIFA/PES Orbit Kamera)
      if (this.lastMouseX !== null && this.lastMouseY !== null) {
        const dx = e.clientX - this.lastMouseX;
        const dy = e.clientY - this.lastMouseY;
        if (Math.abs(dx) < 150 && Math.abs(dy) < 150) {
          this.cameraYaw -= dx * 0.0038;
          this.cameraPitch = THREE.MathUtils.clamp(this.cameraPitch + dy * 0.0024, -0.15, 0.65);
        }
      }
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
      this.lastMouseX = null;
      this.lastMouseY = null;
    });

    // MOUSE UP: Şutu Gönder!
    window.addEventListener('mouseup', (e) => {
      this.lastMouseX = null;
      this.lastMouseY = null;

      if (!this.isAiming) return;
      this.isAiming = false;
      this.clearAimLine();

      const dx = this.aimCurrent.x - this.aimStart.x;
      const dy = this.aimStart.y - this.aimCurrent.y;

      if (Math.hypot(dx, dy) < 15) return;

      if (this.isCoopMatch) {
        const dragY = Math.abs(dy);
        const dirX = THREE.MathUtils.clamp(dx / 85, -1.6, 1.6);
        const dirY = THREE.MathUtils.clamp(0.2 + (dragY / 65), 0.25, 2.2);
        const dragDistance = Math.hypot(dx, dragY);
        const power = THREE.MathUtils.clamp(23 + (dragDistance / 14), 24, 34);
        this.triggerCoopShot(dirX, dirY, power, this.currentFalso);
        return;
      }

      this.executePlayerShot(dx, dy);
    });

    // KLAVYE KONTROLLERİ (WASD Koşma, Shift Depar, Boşluk Pas, E/V Çalım, Q Falso, R Tekrar, F Tam Ekran)
    window.addEventListener('keydown', (e) => {
      if (this.keys.hasOwnProperty(e.code)) {
        this.keys[e.code] = true;
      }

      if (e.code === 'KeyF') {
        this.toggleFullscreen();
      }
      if (e.code === 'KeyR') {
        this.retryCurrentScenario();
      }
      if (e.code === 'KeyQ') {
        this.adjustFalso(-0.25);
      }
      if (e.code === 'KeyV' || (e.code === 'KeyE' && (this.hasBallPossession || this.keys.KeyW || this.keys.KeyA || this.keys.KeyS || this.keys.KeyD))) {
        this.executeSkillMove();
      } else if (e.code === 'KeyE') {
        this.adjustFalso(0.25);
      }
      if (e.code === 'Space' || e.code === 'KeyX' || e.code === 'KeyC') {
        if (this.career.player && this.career.player.position === 'GK') {
          this.handleGoalkeeperDiveAction();
        } else {
          this.handleQuickPassAction();
        }
      }
    });

    window.addEventListener('keyup', (e) => {
      if (this.keys.hasOwnProperty(e.code)) {
        this.keys[e.code] = false;
      }
    });

    // MOUSE WHEEL İLE HIZLI FALSO AYARI
    window.addEventListener('wheel', (e) => {
      this.adjustFalso(e.deltaY > 0 ? 0.2 : -0.2);
    }, { passive: true });

    // Falso Arayüz Butonları Bağlantısı
    const fLeft = document.getElementById('btn-falso-left');
    if (fLeft) fLeft.addEventListener('click', () => this.adjustFalso(-0.3));
    const fRight = document.getElementById('btn-falso-right');
    if (fRight) fRight.addEventListener('click', () => this.adjustFalso(0.3));
    const fReset = document.getElementById('btn-falso-reset');
    if (fReset) fReset.addEventListener('click', () => this.setFalso(0));

    // Tam Ekran Butonu Bağlantısı
    const fsBtn = document.getElementById('btn-fullscreen');
    if (fsBtn) {
      fsBtn.addEventListener('click', () => this.toggleFullscreen());
    }

    // Yeniden Vur Butonu Bağlantısı
    const retryBtn = document.getElementById('btn-retry-shot');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => this.retryCurrentScenario());
    }
  }

  // FALSO AYARLAMA
  adjustFalso(delta) {
    this.setFalso(this.currentFalso + delta);
  }

  setFalso(val) {
    this.currentFalso = THREE.MathUtils.clamp(Math.round(val * 10) / 10, -1.2, 1.2);
    this.updateFalsoDisplay();
    if (this.isAiming) {
      this.updateAimTrajectory();
    }
  }

  updateFalsoDisplay() {
    const textEl = document.getElementById('falso-value-text');
    if (!textEl) return;
    const f = this.currentFalso;
    if (Math.abs(f) < 0.05) {
      textEl.innerText = "DÜZ VURUŞ (FALSO YOK)";
      textEl.style.color = "#cbd5e1";
    } else if (f < 0) {
      textEl.innerText = `⟲ SOLA KAVİS (%${Math.round(Math.abs(f) * 100)}) [ROBERTO CARLOS]`;
      textEl.style.color = "#00f2fe";
    } else {
      textEl.innerText = `SAĞA KAVİS (%${Math.round(f * 100)}) [BECKHAM] ⟳`;
      textEl.style.color = "#f1c40f";
    }
  }

  // AYNI POZİSYONU ANINDA TEKRAR DENE (R Tuşu)
  retryCurrentScenario() {
    if (!this.currentScenario) return;
    clearTimeout(this.shotSafetyTimer);
    this.shotCooldown = false;
    this.setupScenario(this.currentScenario);
    this.showGoalBanner("POZİSYON SIFIRLANDI - VUR!");
  }

  // OYUNCU ŞUTUNU HESAPLA VE ÇEK
  executePlayerShot(dx, dy) {
    const kickCheck = this.isBallInKickRange();
    if (!kickCheck.canKick) {
      this.showGoalBanner("⚠️ TOP AYAKTA DEĞİL! (" + Math.round(kickCheck.dist) + "m Uzakta - WASD ile Koş)");
      return;
    }

    if (this.shotCooldown) return;
    this.shotCooldown = true;
    this.hasBallPossession = false;

    const dragY = Math.abs(dy);
    const dirX = THREE.MathUtils.clamp(dx / 85, -1.6, 1.6);
    const dirY = THREE.MathUtils.clamp(0.2 + (dragY / 65), 0.25, 2.2);

    const targetX = dirX * 4.6;
    const targetY = dirY * 2.5;

    const dragDistance = Math.hypot(dx, dragY);
    const power = THREE.MathUtils.clamp(22 + (dragDistance / 14), 23, 34);
    const curl = this.currentFalso;

    if (this.crosshair) this.crosshair.material.opacity = 0;

    clearTimeout(this.shotSafetyTimer);
    this.shotSafetyTimer = setTimeout(() => {
      if (this.shotCooldown) {
        this.advanceScenarioAfterDelay(400);
      }
    }, 4200);

    const animCallback = () => {
      this.ball.shoot(dirX, dirY, power, curl);
      this.updateSpeedHUD(power);

      if (window.onlineManager && window.onlineManager.isOnlineMatch) {
        window.onlineManager.sendShot(dirX, dirY, power, curl);
      }

      if (this.currentScenario && this.currentScenario.type === 'freekick') {
        this.playerModels.triggerWallJump();
      }

      if (!window.onlineManager || !window.onlineManager.isOnlineMatch) {
        const flightDuration = (this.currentScenario ? this.currentScenario.distance : 20) / power;
        setTimeout(() => {
          this.playerModels.triggerGoalkeeperDive(targetX, targetY, 0, flightDuration * 0.95);
        }, 260);
      }
    };

    if (kickCheck.type === 'volley') {
      this.playerModels.triggerVolleyAnimation(animCallback);
    } else if (kickCheck.type === 'header') {
      this.playerModels.triggerHeaderAnimation(animCallback);
    } else {
      this.playerModels.triggerKickAnimation(animCallback);
    }
  }

  // KALECİ DALIŞ / UÇUŞ HAMLESİ
  handleGoalkeeperDiveAction() {
    if (!this.playerModels.goalkeeper) return;
    this.playerModels.setGoalkeeperManualPosition(this.gkMouseX || 0, this.gkMouseY || 0.5, true);
    if (this.gkReticleGroup) {
      const targetX = (this.gkMouseX || 0) * 3.4;
      const targetY = 0.25 + (this.gkMouseY || 0.5) * 2.15;
      this.gkReticleGroup.position.set(targetX, targetY, 0.4);
    }
    if (window.onlineManager && window.onlineManager.isOnlineMatch) {
      window.onlineManager.sendGoalkeeperMove(this.gkMouseX || 0, this.gkMouseY || 0.5, true);
    }
    if (window.gameSound) window.gameSound.playSave();
  }

  // NİŞAN ÇİZGİSİNİ VE 3D NİŞANGAHI ÇİZ (Tamamen Serbest Sınırlar ve Gerçek Kavis)
  updateAimTrajectory() {
    const dx = this.aimCurrent.x - this.aimStart.x;
    const dy = this.aimStart.y - this.aimCurrent.y;
    const dragY = Math.abs(dy);
    if (Math.hypot(dx, dragY) < 15) {
      this.clearAimLine();
      return;
    }

    const bPos = this.ball.position;

    // Co-op Pasör Nişanı (Arkadaşına Doğru Kavisli Pas Çizgisi)
    if (this.isCoopMatch && this.coopRole === 'passer' && this.coopScenario) {
      const sPos = this.coopScenario.shooterPos;
      const targetX = sPos.x;
      const targetY = sPos.y + 0.3;
      const targetZ = sPos.z;

      if (this.crosshair) {
        this.crosshair.position.set(targetX, targetY, targetZ);
        this.crosshair.material.opacity = 0.9;
        this.crosshair.material.color.setHex(0x00ff88);
      }

      const points = [];
      const steps = 25;
      const arcApex = this.coopScenario.arcHeight || 2.2;
      for (let i = 0; i <= steps; i++) {
        const tNorm = i / steps;
        const px = THREE.MathUtils.lerp(bPos.x, targetX, tNorm);
        const py = THREE.MathUtils.lerp(bPos.y, targetY, tNorm) + Math.sin(tNorm * Math.PI) * arcApex;
        const pz = THREE.MathUtils.lerp(bPos.z, targetZ, tNorm);
        points.push(new THREE.Vector3(px, py, pz));
      }
      this.aimLine.geometry.setFromPoints(points);
      this.aimLine.material.opacity = 0.9;
      return;
    }

    const dirX = THREE.MathUtils.clamp(dx / 85, -1.6, 1.6);
    const dirY = THREE.MathUtils.clamp(0.2 + (dragY / 65), 0.25, 2.2);

    // Hedef noktası: Kalenin dışına, direklerin yanına/üstüne tamamen serbestçe çıkar!
    const targetX = dirX * 4.6;
    const targetY = dirY * 2.5;
    const targetZ = 0;

    // 3D Nişangahı hedef noktasına taşı ve göster
    if (this.crosshair) {
      this.crosshair.position.set(targetX, Math.max(0.1, targetY), 0.04);
      this.crosshair.material.opacity = 0.9;
      if (Math.abs(this.currentFalso) > 0.1) {
        this.crosshair.material.color.setHex(0xf1c40f);
      } else {
        this.crosshair.material.color.setHex(0x00f2fe);
      }
    }

    const toTarget = new THREE.Vector3(targetX - bPos.x, targetY - bPos.y, targetZ - bPos.z);
    const flightTime = toTarget.length() / 26;
    const curveAccelX = this.currentFalso * 10.5;

    const points = [];
    const steps = 30;

    // Baraj üzerinden aşırtma yüksekliği (görsel yay)
    const arcApex = (dirY > 0.45) ? 1.2 + (dirY - 0.45) * 1.6 : 0.4;

    for (let i = 0; i <= steps; i++) {
      const tNorm = i / steps;
      const t = tNorm * flightTime;

      // Fizik motorundaki hareket denklemiyle 1'e 1 özdeş kavis:
      const px = THREE.MathUtils.lerp(bPos.x, targetX, tNorm) - (0.5 * curveAccelX * t * (flightTime - t));
      const py = THREE.MathUtils.lerp(bPos.y, targetY, tNorm) + Math.sin(tNorm * Math.PI) * arcApex;
      const pz = THREE.MathUtils.lerp(bPos.z, targetZ, tNorm);
      points.push(new THREE.Vector3(px, py, pz));
    }

    this.aimLine.geometry.setFromPoints(points);
    this.aimLine.material.opacity = 0.9;
  }

  clearAimLine() {
    this.aimLine.geometry.setFromPoints([]);
    this.aimLine.material.opacity = 0;
    if (this.crosshair) this.crosshair.material.opacity = 0;
  }

  updateSpeedHUD(power) {
    const kmh = Math.round(power * 3.6);
    const speedEl = document.getElementById('hud-shot-speed');
    if (speedEl) speedEl.innerText = kmh + ' km/h';
  }

  // GOL OLDUĞUNDA
  onGoalScored() {
    this.showGoalBanner("GOOOOOL! HARİKA VURUŞ!");
    this.timeScale = 0.45; // Çatala girdiğinde slow-mo

    if (window.uiManager && window.uiManager.launchConfetti) {
      window.uiManager.launchConfetti();
    }

    // Online Maç Bildirimi
    if (window.onlineManager && window.onlineManager.isOnlineMatch) {
      if (this.isCoopMatch) {
        window.onlineManager.reportCoopOutcome('goal');
      } else {
        window.onlineManager.reportOutcome('goal');
      }
      return;
    }

    if (this.career.player.position !== 'GK') {
      this.career.recordScenarioSuccess('goal');
    }

    this.advanceScenarioAfterDelay(2600);
  }

  // KURTARIŞ YAPILDIĞINDA
  onBallSaved() {
    if (window.onlineManager && window.onlineManager.isOnlineMatch) {
      this.showGoalBanner("BOT KALECİ ÇIKARDI! HARİKA REFLEKS!");
      if (this.isCoopMatch) {
        window.onlineManager.reportCoopOutcome('save');
      } else {
        window.onlineManager.reportOutcome('save');
      }
      return;
    }

    if (this.career.player.position === 'GK') {
      this.showGoalBanner("İNANILMAZ KURTARIŞ! DEVLEŞTİN!");
      this.career.recordScenarioSuccess('save');
    } else {
      this.showGoalBanner("KALECİ ÇIKARDI! KORNER!");
    }
    this.advanceScenarioAfterDelay(2200);
  }

  // DİREKTEN DÖNDÜĞÜNDE
  onPostHit() {
    this.showGoalBanner("DİREKTEN DÖNDÜ! İNANILMAZ!");
  }

  // BARAJA ÇARPTIĞINDA
  onWallHit() {
    this.showGoalBanner("BARAJA TAKILDI! SAVUNMA GEÇİT VERMEDİ!");
  }

  // TOP ZEMİNDE DURDUĞUNDA
  onBallStopped() {
    if (window.onlineManager && window.onlineManager.isOnlineMatch) {
      this.showGoalBanner("POZİSYON TAMAMLANDI!");
      if (this.isCoopMatch) {
        window.onlineManager.reportCoopOutcome('miss');
      } else {
        window.onlineManager.reportOutcome('miss');
      }
      return;
    }

    this.showGoalBanner("POZİSYON TAMAMLANDI!");
    this.advanceScenarioAfterDelay(1000);
  }

  // AUT / KAÇTIĞINDA
  onBallMissed() {
    if (window.onlineManager && window.onlineManager.isOnlineMatch) {
      this.showGoalBanner("TOP DIŞARIDA! AUT!");
      if (this.isCoopMatch) {
        window.onlineManager.reportCoopOutcome('miss');
      } else {
        window.onlineManager.reportOutcome('miss');
      }
      return;
    }

    if (this.career.player.position === 'GK') {
      this.showGoalBanner("TOP DIŞARIDA! BAŞARILI SAVUNMA!");
      this.career.recordScenarioSuccess('save');
    } else {
      this.showGoalBanner("TOP AZ FARKLA AUTTA!");
    }
    this.advanceScenarioAfterDelay(2000);
  }

  // BİLDİRİM BANNERI GÖSTER
  showGoalBanner(text) {
    const banner = document.getElementById('goal-celebration-banner');
    if (!banner) return;
    banner.innerText = text;
    banner.classList.add('active');
    setTimeout(() => {
      banner.classList.remove('active');
    }, 2200);
  }

  // SONRAKİ POZİSYONA YA DA MAÇ SONUNA GEÇ
  advanceScenarioAfterDelay(delay) {
    clearTimeout(this.advanceTimer);
    clearTimeout(this.shotSafetyTimer);
    this.advanceTimer = setTimeout(() => {
      const match = this.career.currentMatch;
      if (!match) return;

      match.currentScenarioIdx++;
      if (match.currentScenarioIdx < match.scenarios.length) {
        // Sonraki pozisyon
        const nextScen = match.scenarios[match.currentScenarioIdx];
        this.setupScenario(nextScen);
      } else {
        // MAÇ BİTTİ!
        this.onMatchFinished();
      }
    }, delay);
  }

  // MAÇ BİTTİĞİNDE
  onMatchFinished() {
    clearTimeout(this.advanceTimer);
    clearTimeout(this.shotSafetyTimer);
    const { summary, isSeasonEnd } = this.career.finishMatch();
    window.uiManager.showMatchSummaryModal(summary, isSeasonEnd);
  }

  // SEZON BİTTİĞİNDE TRANSFER TEKLİFLERİNİ AÇ
  onSeasonFinished() {
    const transferData = this.career.generateTransferOffers();
    window.uiManager.showTransferMarketModal(transferData);
  }

  // TAM EKRAN AÇ / KAPA
  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.warn("Tam ekran hatası:", err);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  onResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
  }

  // ANA RENDER DÖNGÜSÜ (60-120 FPS)
  animate() {
    requestAnimationFrame(() => this.animate());

    const now = performance.now();
    let dt = (now - this.lastTime) / 1000;
    this.lastTime = now;

    // Ani fps düşüşlerinde patlamayı önlemek için dt'yi sınırla
    dt = Math.min(dt, 0.1) * this.timeScale;

    // WASD ile Oyuncu Koşma & Top Kontrolü (Dribling)
    this.updatePlayerMovement(dt);

    // AI Defans Oyuncuları (Pres & Müdahale)
    this.updateDefenders(dt);

    // Top Fiziğini Güncelle
    if (this.ball && this.ball.isMoving) {
      this.ball.update(
        dt,
        this.stadium,
        this.playerModels,
        () => this.onGoalScored(),
        () => this.onBallMissed(),
        () => this.onBallSaved(),
        () => this.onPostHit(),
        () => this.onWallHit(),
        () => this.onBallStopped()
      );

      // Şut atıldıktan sonra topu takip et
      if (this.career.player && this.career.player.position !== 'GK') {
        this.setCameraFollowBall();
      }
    } else {
      // Top serbest veya ayaktayken oyuncuyu takip eden dinamik 3. şahıs kamera
      if (this.career.player && this.career.player.position !== 'GK') {
        this.updateFollowCamera(dt);
      }
    }

    // Kaleci modunda dinamik yayın kamerası: Kalecinin yana hareketini yumuşakça takip eder
    if (this.career.player && this.career.player.position === 'GK') {
      const targetCamX = (this.gkMouseX || 0) * 0.65;
      this.camera.position.x = THREE.MathUtils.lerp(this.camera.position.x, targetCamX, 0.08);
      this.camera.position.y = 2.6;
      this.camera.position.z = -3.4;
      this.camera.lookAt((this.gkMouseX || 0) * 0.25, 1.1, 14);
    }

    // Kaleci Idle Salınımı
    if (this.playerModels) {
      this.playerModels.updateIdle(now / 1000);
    }

    // Stadyum LED Reklam Panoları Kayan Akış Animasyonu
    if (this.stadium) {
      this.stadium.update(dt);
    }

    this.renderer.render(this.scene, this.camera);
  }
}

window.Game = Game;
