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

    // Vuruş Ayağı, Şut Tipi ve Dinamik Kamera Modu
    this.currentFoot = 'R'; // 'R' (Sağ Ayak), 'L' (Sol Ayak)
    this.shotType = 'curve'; // 'curve' (İç Ayak / Plase), 'power' (Sert Üst / Füze), 'trivela' (Trivela 🌪️ Dış Ayak)
    this.cameraMode = 'behind'; // 'behind' (Omuz Üstü Pro), 'broadcast' (TV Yayın), 'trivela_cam' (Trivela Takip), 'action' (Saha İçi)

    // Nişan Alma Eğrisi Çizgisi ve 3D Hedef Nişangahı
    this.aimLine = null;
    this.crosshair = null;

    // Gamepad (HTML5 Gamepad API) & Konsol İkonografi Durumu
    this.hasGamepad = false;
    this.activeGamepadIndex = 0;
    this.aimX = 0;
    this.aimY = 1.2;
    this.shotPowerCharge = 0;
    this.lastGpButtons = {};

    // Turnuva Maçı Bayrakları
    this.isTournamentMatch = false;
    this.tournamentStageTitle = '';

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

    // 3. Renderer (Mac/Retina ekranlarda donmayı önleyen optimize 1.25 DPR)
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
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

  // KALECİ Mİ KONTROLÜ (Kariyer veya Online 1v1)
  isHumanGoalkeeper() {
    if (this.career && this.career.player && this.career.player.position === 'GK') return true;
    if (window.onlineManager && window.onlineManager.isOnlineMatch && window.onlineManager.myRole === 'goalkeeper') return true;
    return false;
  }

  // KAMERA KONUMLARI (4 Dinamik Kamera Modu)
  setCameraBehindBall() {
    if (!this.ball) return;
    this.cameraYaw = 0;
    this.cameraPitch = 0.22;
    const bPos = this.ball.position;
    // Top ile kale (0, 0, 0) arasındaki doğrultuyu hesapla, topun gerisine yerleş
    const dirX = bPos.x;
    const dirZ = bPos.z;
    const len = Math.hypot(dirX, dirZ) || 1;
    const normX = dirX / len;
    const normZ = dirZ / len;

    const shoulderOffset = (this.currentFoot === 'R') ? -0.55 : 0.55;

    if (this.cameraMode === 'broadcast') {
      // TV Canlı Yayın Kamerası (Tribün yüksek yayın açısı)
      this.camera.position.set(bPos.x + 11.5, 7.8, bPos.z + 8.5);
      this.camera.lookAt(0, 1.2, bPos.z * 0.35);
    } else if (this.cameraMode === 'trivela_cam') {
      // Trivela & Kavis Takip Kamerası (Topun dış kavisini ve falso kıvrılışını sinematik alttan takip eder)
      const sideOffset = (this.currentFoot === 'R') ? -1.8 : 1.8;
      this.camera.position.set(bPos.x + sideOffset, 0.75, bPos.z + 3.6);
      this.camera.lookAt(0, 1.4, 0);
    } else if (this.cameraMode === 'action') {
      // Saha İçi Aksiyon Kamerası
      this.camera.position.set(bPos.x, 1.4, bPos.z + 3.2);
      this.camera.lookAt(0, 1.25, 0);
    } else {
      // Omuz Üstü Pro Kamera (Varsayılan - Seçilen vuruş ayağının arkasından hedefi tam gösterir)
      this.camera.position.set(bPos.x + normX * 4.2 + shoulderOffset, bPos.y + 1.85, bPos.z + normZ * 4.2);
      this.camera.lookAt(0, 1.2, 0);
    }

    if (this.gkReticleGroup) this.gkReticleGroup.visible = false;
  }

  setCameraGoalkeeperView() {
    // Kaleci Modu: Kalenin üstünden ve arkasından geniş, ferah yayın açısı (FIFA Be-A-Pro Kamera)
    this.camera.position.set(0, 2.6, -3.4);
    this.camera.lookAt(0, 1.1, 14);
    if (this.gkReticleGroup) this.gkReticleGroup.visible = true;
  }

  setCameraFollowBall() {
    if (!this.ball) return;
    const bPos = this.ball.position;

    if (this.cameraMode === 'broadcast') {
      this.camera.position.lerp(new THREE.Vector3(bPos.x * 0.5 + 9.5, 7.2, bPos.z * 0.6 + 6.0), 0.08);
      this.camera.lookAt(bPos.x, Math.max(1.0, bPos.y), bPos.z * 0.3);
    } else if (this.cameraMode === 'trivela_cam') {
      // Trivela kavisini alttan sinematik takip
      const sideOffset = (this.currentFoot === 'R') ? -1.2 : 1.2;
      this.camera.position.lerp(new THREE.Vector3(bPos.x * 0.7 + sideOffset, Math.max(0.65, bPos.y * 0.5 + 0.4), bPos.z + 4.2), 0.12);
      this.camera.lookAt(bPos.x, Math.max(1.2, bPos.y), 0);
    } else if (this.cameraMode === 'action') {
      this.camera.position.lerp(new THREE.Vector3(bPos.x * 0.4, Math.max(1.2, bPos.y + 0.8), bPos.z + 3.2), 0.12);
      this.camera.lookAt(bPos.x, Math.max(1.0, bPos.y), 0);
    } else {
      // Omuz üstü takip
      this.camera.position.lerp(new THREE.Vector3(bPos.x * 0.4, bPos.y + 2.4, bPos.z + 4.6), 0.1);
      this.camera.lookAt(bPos.x, Math.max(1.0, bPos.y), 0);
    }
  }

  // AYAK DEĞİŞTİR (Sağ / Sol)
  toggleFoot() {
    this.currentFoot = (this.currentFoot === 'R') ? 'L' : 'R';
    if (this.career && this.career.player) {
      this.career.setPreferredFoot(this.currentFoot);
    }
    this.repositionKickerStance();
    if (!this.isHumanGoalkeeper() && !this.isCoopMatch) {
      this.setCameraBehindBall();
    }
    this.updateHUDControls();
    this.updateFalsoDisplay();
  }

  // ŞUT TİPİ DEĞİŞTİR (Plase / Füze / Trivela)
  toggleShotType() {
    if (this.shotType === 'curve') {
      this.shotType = 'power';
    } else if (this.shotType === 'power') {
      this.shotType = 'trivela';
    } else {
      this.shotType = 'curve';
    }
    this.updateHUDControls();
    this.updateFalsoDisplay();
  }

  // KAMERA AÇISI DEĞİŞTİR (4 Dinamik Kamera)
  cycleCamera() {
    if (this.cameraMode === 'behind') {
      this.cameraMode = 'broadcast';
    } else if (this.cameraMode === 'broadcast') {
      this.cameraMode = 'trivela_cam';
    } else if (this.cameraMode === 'trivela_cam') {
      this.cameraMode = 'action';
    } else {
      this.cameraMode = 'behind';
    }
    if (!this.isHumanGoalkeeper() && !this.isCoopMatch) {
      this.setCameraBehindBall();
    }
    this.updateHUDControls();
  }

  // TRİVELA AKTİF Mİ? (Dış Ayak Kavis Kontrolü)
  isTrivelaActive() {
    if (this.shotType === 'trivela') return true;
    // Otomatik Trivela tespiti: Sağ ayakla sağa kavis veya sol ayakla sola kavis
    if (this.currentFoot === 'R' && this.currentFalso > 0.15) return true;
    if (this.currentFoot === 'L' && this.currentFalso < -0.15) return true;
    return false;
  }

  // FORVETİN VURUŞ DURUŞUNU SEÇİLEN AYAĞA GÖRE AYARLA
  repositionKickerStance() {
    if (!this.playerModels || !this.playerModels.kicker || !this.ball) return;
    const bPos = this.ball.position;
    const footOffsetX = (this.currentFoot === 'R') ? -0.65 : 0.65;
    this.playerModels.kicker.group.position.copy(kickerPos);
    const stanceAngle = Math.atan2(-kickerPos.x, -kickerPos.z);
    this.playerModels.kicker.group.rotation.set(0, stanceAngle, 0);
  }

  // HUD KONTROL BUTONLARINI GÜNCELLE
  updateHUDControls() {
    const footBtn = document.getElementById('btn-toggle-foot');
    if (footBtn) {
      footBtn.innerHTML = (this.currentFoot === 'R') ? '🦶 AYAK: SAĞ (T)' : '🦶 AYAK: SOL (T)';
      footBtn.style.borderColor = (this.currentFoot === 'R') ? '#00f2fe' : '#f1c40f';
    }

    const shotBtn = document.getElementById('btn-toggle-shottype');
    if (shotBtn) {
      if (this.shotType === 'trivela' || this.isTrivelaActive()) {
        shotBtn.innerHTML = '🌪️ TRİVELA (DIŞ) (G)';
        shotBtn.style.borderColor = '#00ff88';
        shotBtn.style.color = '#00ff88';
      } else if (this.shotType === 'power') {
        shotBtn.innerHTML = '⚡ FÜZE / SERT (G)';
        shotBtn.style.borderColor = '#ff3366';
        shotBtn.style.color = '#ff3366';
      } else {
        shotBtn.innerHTML = '🎯 PLASE / İÇ (G)';
        shotBtn.style.borderColor = '#00f2fe';
        shotBtn.style.color = '#00f2fe';
      }
    }

    const camBtn = document.getElementById('btn-cycle-camera');
    if (camBtn) {
      let camName = 'OMUZ ÜSTÜ (C)';
      if (this.cameraMode === 'broadcast') camName = 'TV YAYIN (C)';
      else if (this.cameraMode === 'trivela_cam') camName = 'TRİVELA CAM (C)';
      else if (this.cameraMode === 'action') camName = 'AKSİYON (C)';
      camBtn.innerHTML = `🎥 ${camName}`;
    }

    // Cüzdan Bakiyesi Güncelle
    const walletEl = document.getElementById('hud-wallet-balance');
    if (walletEl && this.career && this.career.player) {
      walletEl.innerText = '€' + (this.career.player.money || 0).toLocaleString('tr-TR');
    }
  }

  // YENİ POZİSYON / SENARYO YÜKLE (FRİKİK VE PENALTI SET-PIECE)
  setupScenario(scenario) {
    this.isCoopMatch = false;
    this.currentScenario = scenario;
    this.shotCooldown = false;
    this.timeScale = 1.0;

    this.playerModels.clearAll();

    const isGK = this.isHumanGoalkeeper();
    const club = this.career.getCurrentClub();
    const clubColor = parseInt(club.colors.primary.replace('#', '0x')) || 0xe74c3c;

    if (this.career && this.career.player && this.career.player.preferredFoot) {
      this.currentFoot = this.career.player.preferredFoot;
    }

    // HUD Başlıklarını ve Canlı Skor Tablosunu Güncelle
    document.getElementById('hud-scenario-title').innerText = scenario.title;
    document.getElementById('hud-scenario-desc').innerText = scenario.desc;
    document.getElementById('hud-match-distance').innerText = scenario.distance + ' Metre';

    const match = this.career.currentMatch;
    if (match) {
      const hTeamEl = document.getElementById('hud-team-home');
      if (hTeamEl) hTeamEl.innerText = match.homeTeam.toUpperCase();
      const aTeamEl = document.getElementById('hud-team-away');
      if (aTeamEl) aTeamEl.innerText = match.awayTeam.toUpperCase();
      const scoreEl = document.getElementById('hud-score-display');
      if (scoreEl) scoreEl.innerText = `${match.matchScoreHome} - ${match.matchScoreAway}`;
    }

    // Senaryo Koordinatları (spotX ve distance desteği)
    let spotX = (scenario.spotX !== undefined) ? scenario.spotX : (scenario.type === 'freekick' ? (Math.random() - 0.5) * 8 : 0);
    if (scenario.type === 'penalty') spotX = 0;
    const distance = scenario.distance || (scenario.type === 'penalty' ? 11 : 23);

    const ballPos = new THREE.Vector3(spotX, this.ball.radius, distance);
    this.ball.reset(ballPos);

    // Mağazadan kuşanılan top stilini uygula
    if (this.career && this.career.player && this.career.player.equippedBall) {
      this.ball.setBallStyle(this.career.player.equippedBall);
    }

    // Kuşanılan kozmetik modelleri
    const cosmetics = {
      hair: (this.career && this.career.player) ? this.career.player.equippedHair : 'hair_fade',
      boot: (this.career && this.career.player) ? this.career.player.equippedBoot : 'boot_copa',
      kit: (this.career && this.career.player) ? this.career.player.equippedKit : 'kit_club',
      gloves: (this.career && this.career.player) ? this.career.player.equippedGloves : 'gloves_standard'
    };

    if (isGK) {
      // OYUNCU KALECİ İSE:
      this.gkMouseX = 0;
      this.gkMouseY = 0.5;
      this.setCameraGoalkeeperView();

      // Kaleciyi oluştur (Kullanıcının forması ve eldivenleri)
      this.playerModels.createGoalkeeper(clubColor, cosmetics.gloves, cosmetics.kit);

      // Rakip Forveti Topun arkasına koy
      const footOffsetX = (this.currentFoot === 'R') ? -0.65 : 0.65;
      const kickerPos = new THREE.Vector3(spotX + footOffsetX, 0.11, distance + 1.85);
      this.playerModels.createKicker(kickerPos, 0xe74c3c, 9, 'RAKİP FORVET', this.currentFoot, cosmetics);

      // Baraj (Penaltı değilse) - Kalenin içine kesinlikle girmez (min z: 5.8m)
      if (scenario.type === 'freekick' || scenario.wall) {
        const wallCount = scenario.wall || 4;
        const wallZ = Math.max(5.8, distance - 9.15);
        const wallX = spotX * 0.65;
        this.playerModels.createWall(new THREE.Vector3(wallX, 0.11, wallZ), wallCount, 0x34495e, ballPos);
      }

      if (this.gkReticleGroup) {
        this.gkReticleGroup.visible = true;
        this.gkReticleGroup.position.set(0, 1.25, 0.4);
      }

      this.updateControlHint();
      const fBar = document.querySelector('.falso-control-bar');
      if (fBar) fBar.style.display = 'none';

      // Rakip AI Şut Hazırlığı (Online değilse)
      if (!window.onlineManager || !window.onlineManager.isOnlineMatch) {
        setTimeout(() => {
          if (this.currentScenario === scenario) {
            this.executeAIShot(ballPos, distance);
          }
        }, 1600);
      }
    } else {
      // OYUNCU FORVET İSE (ŞUT ÇEKEN):
      this.playerModels.createGoalkeeper(0x27ae60, 'gloves_standard', 'kit_club');
      this.playerModels.clearDefenders();

      // Oyuncumuz seçilen vuruş ayağına göre topun sol-arka ya da sağ-arkasında durur
      const footOffsetX = (this.currentFoot === 'R') ? -0.65 : 0.65;
      const kickerPos = new THREE.Vector3(spotX + footOffsetX, 0.11, distance + 1.85);
      this.playerModels.createKicker(
        kickerPos,
        clubColor,
        this.career.player.jerseyNumber || 10,
        this.career.player.name || 'STAR',
        this.currentFoot,
        cosmetics
      );

      // Baraj kur (Penaltı hariç) - Kesinlikle kalenin içine girmez (min z: 5.8m)
      if (scenario.type === 'freekick' || scenario.wall) {
        const wallCount = scenario.wall || (distance >= 28 ? 5 : 4);
        const wallZ = Math.max(5.8, distance - 9.15);
        const wallX = spotX * 0.65;
        this.playerModels.createWall(new THREE.Vector3(wallX, 0.11, wallZ), wallCount, 0x34495e, ballPos);
      }

      this.hasBallPossession = true;
      this.setCameraBehindBall();

      if (this.gkReticleGroup) {
        this.gkReticleGroup.visible = false;
      }

      this.updateControlHint();
      const fBar = document.querySelector('.falso-control-bar');
      if (fBar) fBar.style.display = 'flex';

      this.updateHUDControls();
      this.updateFalsoDisplay();
    }
  }

  // KUŞANILAN KOZMETİKLERİ CANLI SAHNEDE GÜNCELLE
  applyCosmetics() {
    if (!this.career || !this.career.player) return;
    if (this.ball && this.career.player.equippedBall) {
      this.ball.setBallStyle(this.career.player.equippedBall);
    }
    if (this.currentScenario && !this.isCoopMatch) {
      this.setupScenario(this.currentScenario);
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

    this.updateControlHint();
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
    // Duran top (Frikik ve Penaltı) modunda oyuncu her zaman topun başında hazır durur
    if (!this.isCoopMatch) {
      return { canKick: true, dist: 0.5, type: 'ground' };
    }

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

  // AI DEFANS OYUNCULARI (Deparla Pres, Araya Girme & Kademe)
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
        // 2. Stoper kademede kaleyi ve ceza sahası merkezini kapatır
        desiredTarget.x = THREE.MathUtils.lerp(targetPos.x, 0, 0.45);
        desiredTarget.z = THREE.MathUtils.clamp(targetPos.z - 3.2, 5.5, 25);
      } else if (index === 2) {
        // 3. Stoper kanattan sıkıştırır
        desiredTarget.x = THREE.MathUtils.clamp(targetPos.x + 2.8, -18, 18);
        desiredTarget.z = THREE.MathUtils.clamp(targetPos.z - 1.2, 5, 28);
      }

      const dx = desiredTarget.x - dPos.x;
      const dz = desiredTarget.z - dPos.z;
      const dist = Math.hypot(dx, dz);

      // Agresif Deparla Pres Hızı: Uzaktayken 7.6 m/s, yaklaşınca 5.2 m/s
      const defSpeed = (dist > 2.5) ? 7.6 : 5.2;

      if (dist > 1.25) {
        const moveDirX = dx / dist;
        const moveDirZ = dz / dist;
        dPos.x += moveDirX * defSpeed * dt;
        dPos.z += moveDirZ * defSpeed * dt;

        dPos.x = THREE.MathUtils.clamp(dPos.x, -24, 24);
        dPos.z = THREE.MathUtils.clamp(dPos.z, 2.5, 36);

        const angle = Math.atan2(moveDirX, moveDirZ);
        def.group.rotation.y = THREE.MathUtils.lerp(def.group.rotation.y, angle, 0.2);

        this.playerModels.updateRunningAnimation(def, true, (dist > 2.5), dt);
      } else {
        this.playerModels.updateRunningAnimation(def, false, false, dt);
        if (this.hasBallPossession && !def.isTackling && ballCarrier && !this.shotCooldown) {
          this.handleDefenderTackle(def, ballCarrier);
        }
      }
    });
  }

  // DEFANS MÜDAHALESİ & FAUL SİSTEMİ (Hakem Düdüğü, Sarı Kart & Serbest Vuruş)
  handleDefenderTackle(def, ballCarrier) {
    if (def.isTackling) return;
    def.isTackling = true;

    // Kayarak müdahale animasyonu
    if (def.rightLegGroup) def.rightLegGroup.rotation.x = -1.35;
    if (def.bodyGroup) def.bodyGroup.rotation.x = 0.65;

    setTimeout(() => {
      if (def.rightLegGroup) def.rightLegGroup.rotation.x = 0;
      if (def.bodyGroup) def.bodyGroup.rotation.x = 0;
      def.isTackling = false;
    }, 700);

    const dist = def.group.position.distanceTo(ballCarrier.group.position);
    if (dist < 1.65 && this.hasBallPossession && !this.shotCooldown) {
      // FAUL KONTROLÜ:
      // 1. Oyuncu çalım atıyorsa (isSkillMoving) stoper geç kalıp oyuncuyu yere indirir -> %100 FAUL!
      // 2. Normal kayarak müdahalede %52 ihtimalle faul düdüğü çalar!
      const isFoul = this.isSkillMoving || (Math.random() < 0.52);

      if (isFoul) {
        this.triggerFoulSequence(def, ballCarrier);
      } else {
        // Temiz Müdahale: Topu kapar
        this.hasBallPossession = false;
        this.showGoalBanner("⚠️ DEFANS TOPA DOKUNDU! TOP BOŞTA! (Hemen Kap veya Şut Çek!)");

        const tackleDirX = (Math.random() - 0.5) * 5;
        const tackleDirZ = 5 + Math.random() * 5;
        this.ball.velocity.set(tackleDirX, 1.4, tackleDirZ);
        this.ball.isMoving = true;
      }
    }
  }

  // GERÇEKÇİ HAKEM DÜDÜĞÜ SESİ (Web Audio API Synthesizer)
  playRefereeWhistle() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!this.audioCtx) this.audioCtx = new AudioCtx();
      if (this.audioCtx.state === 'suspended') this.audioCtx.resume();

      const now = this.audioCtx.currentTime;

      const chirp = (startTime, duration, f1, f2) => {
        const osc1 = this.audioCtx.createOscillator();
        const osc2 = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        // 32 Hz vibrato trill
        const lfo = this.audioCtx.createOscillator();
        const lfoGain = this.audioCtx.createGain();
        lfo.frequency.value = 32;
        lfoGain.gain.value = 45;
        lfo.connect(osc1.frequency);
        lfo.connect(osc2.frequency);

        osc1.type = 'sine';
        osc2.type = 'triangle';
        osc1.frequency.setValueAtTime(f1, startTime);
        osc2.frequency.setValueAtTime(f2, startTime);

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.24, startTime + 0.02);
        gain.gain.setValueAtTime(0.24, startTime + duration - 0.03);
        gain.gain.linearRampToValueAtTime(0, startTime + duration);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.audioCtx.destination);

        lfo.start(startTime);
        osc1.start(startTime);
        osc2.start(startTime);
        lfo.stop(startTime + duration);
        osc1.stop(startTime + duration);
        osc2.stop(startTime + duration);
      };

      // Gerçekçi iki darbeli hakem düdüğü: "tit - TWEET!"
      chirp(now, 0.1, 2600, 2800);
      chirp(now + 0.14, 0.48, 2750, 2950);
    } catch (e) {
      console.warn("Hakem düdüğü çalınamadı:", e);
    }
  }

  // FAUL DÜDÜĞÜ, SARI KART VE SERBEST VURUŞ / PENALTI KURULUMU
  triggerFoulSequence(def, ballCarrier) {
    this.hasBallPossession = false;
    this.shotCooldown = true;

    // 1. Hakem Düdüğü Sesi (Web Audio API)
    this.playRefereeWhistle();

    // 2. Oyuncu Düşme Animasyonu
    const pGroup = ballCarrier.group;
    const foulSpot = pGroup.position.clone();

    if (ballCarrier.bodyGroup) ballCarrier.bodyGroup.rotation.x = -0.7;
    pGroup.position.y = 0.25;

    // 3. Defans Suçluluk Reaksiyonu (Elleri Kaldırma)
    if (def.leftArmGroup) def.leftArmGroup.rotation.x = 2.4;
    if (def.rightArmGroup) def.rightArmGroup.rotation.x = 2.4;

    // Defans üstünde Sarı Kart Rozeti
    if (def.labelSprite) {
      const cardCanvas = document.createElement('canvas');
      cardCanvas.width = 256;
      cardCanvas.height = 64;
      const cctx = cardCanvas.getContext('2d');
      cctx.fillStyle = '#f1c40f'; // Sarı kart
      if (cctx.roundRect) cctx.roundRect(4, 4, 248, 56, 12);
      else cctx.rect(4, 4, 248, 56);
      cctx.fill();
      cctx.fillStyle = '#000000';
      cctx.font = 'bold 26px "Segoe UI", sans-serif';
      cctx.textAlign = 'center';
      cctx.textBaseline = 'middle';
      cctx.fillText("🟨 SARI KART & FAUL!", 128, 32);
      def.labelSprite.material.map = new THREE.CanvasTexture(cardCanvas);
      def.labelSprite.material.needsUpdate = true;
    }

    // 4. Ceza sahası içi mi (Penaltı mı?)
    const isInsideBox = (foulSpot.z <= 16.5 && Math.abs(foulSpot.x) <= 11);

    if (isInsideBox) {
      this.showGoalBanner("🚨 PENALTI! HAKEM BEYAZ NOKTAYI GÖSTERDİ!");
    } else {
      const distToGoal = Math.round(foulSpot.z);
      this.showGoalBanner(`🟨 DÜÜÜÜT! FAUL! Hakem Sarı Kartı Çıkardı! (${distToGoal}m Tehlikeli Serbest Vuruş)`);
    }

    // Slow-motion sinematik an
    this.timeScale = 0.25;

    // 1.2 saniye sonra Serbest Vuruş / Penaltı Kurulumu
    setTimeout(() => {
      this.timeScale = 1.0;

      // Oyuncuyu ayağa kaldır
      if (ballCarrier.bodyGroup) ballCarrier.bodyGroup.rotation.x = 0;
      pGroup.position.y = 0.11;

      // Tüm açık oyun defanslarını temizle ve baraj kur
      this.playerModels.clearDefenders();

      if (isInsideBox) {
        // Penaltı noktasına geç
        const penSpot = new THREE.Vector3(0, this.ball.radius, 11);
        this.ball.reset(penSpot);
        pGroup.position.set(0, 0.11, 13.5);
        pGroup.rotation.y = Math.PI;
        this.setCameraBehindBall();
        this.showGoalBanner("⚽ PENALTI KULLANILIYOR! Köşeye sert vur!");
      } else {
        // Serbest vuruş noktasına topu koy
        const freeKickBallPos = new THREE.Vector3(foulSpot.x, this.ball.radius, foulSpot.z);
        this.ball.reset(freeKickBallPos);

        // Kicker topun 1.8m gerisinde durur
        pGroup.position.set(foulSpot.x, 0.11, foulSpot.z + 1.8);
        pGroup.rotation.y = Math.PI;

        // Baraj kur (Top ile kale arasında, 9.15m ileride)
        const wallZ = Math.max(5.5, foulSpot.z - 9.15);
        const wallX = foulSpot.x * 0.7;
        this.playerModels.createWall(new THREE.Vector3(wallX, 0.11, wallZ), 4, 0x1e3a8a);

        // Kamerayı topun arkasına yerleştir
        this.cameraYaw = 0;
        this.cameraPitch = 0.22;
        this.camera.position.set(freeKickBallPos.x, freeKickBallPos.y + 1.8, freeKickBallPos.z + 4.5);
        this.camera.lookAt(0, 1.2, 0);

        this.showGoalBanner("🎯 SERBEST VURUŞ! Barajın üstünden kalenin 90'ına falsola!");
      }

      const hintEl = document.getElementById('hud-control-hint');
      if (hintEl) {
        hintEl.innerHTML = `🎯 <b>SERBEST VURUŞ:</b> Fareyle sol tık basılı tutup çekerek nişan al, bırak! | [Q / E / Tekerlek] Falso Ver`;
      }

      this.hasBallPossession = false;
      this.shotCooldown = false;
    }, 1200);
  }

  // FARE KONTROLLERİ VE NİŞAN ALMA
  initInputs() {
    const canvas = this.renderer.domElement;

    // MOUSE DOWN: Nişan almaya başla veya Kaleci hamlesi
    canvas.addEventListener('mousedown', (e) => {
      if (this.isHumanGoalkeeper()) {
        this.handleGoalkeeperDiveAction();
        return;
      }

      if (this.shotCooldown) return;

      // Top ayağımızda değilse şut çekmeye izin verme
      const kickCheck = this.isBallInKickRange();
      if (!kickCheck.canKick) {
        this.showGoalBanner("⚠️ TOP AYAKTA DEĞİL!");
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
      if (this.isHumanGoalkeeper()) {
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

      // Fareyi sağa/sola/yukarı/aşağı hareket ettirince kamera serbestçe döner
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

    // KLAVYE KONTROLLERİ (Kaleci: A, D, Space, S, W | Forvet: Q, E, R, F)
    window.addEventListener('keydown', (e) => {
      if (this.keys.hasOwnProperty(e.code)) {
        this.keys[e.code] = true;
      }

      // 🧤 İNSAN KALECİ KLAVYE HAMLELERİ (A: Sol Alt | D: Sağ Alt | A+Space: Sol Üst | D+Space: Sağ Üst | Space: Zıpla | S: Yere Kapan)
      if (this.isHumanGoalkeeper()) {
        const isSpaceDown = this.keys.Space || e.code === 'Space';
        const isD = (e.code === 'KeyD' || e.code === 'ArrowRight');
        const isA = (e.code === 'KeyA' || e.code === 'ArrowLeft');
        const isS = (e.code === 'KeyS' || e.code === 'ArrowDown');
        const isW = (e.code === 'KeyW' || e.code === 'ArrowUp');

        if (isD) {
          if (isSpaceDown) {
            this.executeHumanGKDive(1.0, 0.92, 'dive_high_right');
          } else {
            this.executeHumanGKDive(1.0, 0.15, 'dive_low_right');
          }
          return;
        }

        if (isA) {
          if (isSpaceDown) {
            this.executeHumanGKDive(-1.0, 0.92, 'dive_high_left');
          } else {
            this.executeHumanGKDive(-1.0, 0.15, 'dive_low_left');
          }
          return;
        }

        if (e.code === 'Space') {
          if (this.keys.KeyD || this.keys.ArrowRight) {
            this.executeHumanGKDive(1.0, 0.92, 'dive_high_right');
          } else if (this.keys.KeyA || this.keys.ArrowLeft) {
            this.executeHumanGKDive(-1.0, 0.92, 'dive_high_left');
          } else {
            this.executeHumanGKDive(0.0, 0.95, 'dive_high_center');
          }
          return;
        }

        if (isS) {
          this.executeHumanGKDive(0.0, 0.12, 'dive_low_center');
          return;
        }

        if (isW) {
          this.executeHumanGKDive(0.0, 0.95, 'dive_high_center');
          return;
        }
      }

      if (e.code === 'KeyF') {
        this.toggleFullscreen();
      }
      if (e.code === 'KeyR') {
        this.retryCurrentScenario();
      }
      if (e.code === 'KeyT') {
        this.toggleFoot();
      }
      if (e.code === 'KeyG') {
        this.toggleShotType();
      }
      if (e.code === 'KeyC') {
        if (!this.isCoopMatch) {
          this.cycleCamera();
        }
      }
      if (e.code === 'KeyQ') {
        this.adjustFalso(-0.25);
      }
      if (e.code === 'KeyE') {
        this.adjustFalso(0.25);
      }
      if (e.code === 'Space' || e.code === 'KeyX') {
        if (this.isCoopMatch) {
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

    // Vuruş Ayağı, Şut Tipi ve Kamera Arayüz Butonları
    const btnFoot = document.getElementById('btn-toggle-foot');
    if (btnFoot) btnFoot.addEventListener('click', () => this.toggleFoot());
    const btnShot = document.getElementById('btn-toggle-shottype');
    if (btnShot) btnShot.addEventListener('click', () => this.toggleShotType());
    const btnCam = document.getElementById('btn-cycle-camera');
    if (btnCam) btnCam.addEventListener('click', () => this.cycleCamera());

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

    // Gamepad (HTML5 Gamepad API) Olay Dinleyicileri
    window.addEventListener('gamepadconnected', (e) => {
      this.hasGamepad = true;
      this.activeGamepadIndex = e.gamepad.index;
      this.showGoalBanner(`🎮 OYUN KOLU BAĞLANDI: ${e.gamepad.id.split('(')[0]}`);
      this.updateControlHint();
    });

    window.addEventListener('gamepaddisconnected', () => {
      this.hasGamepad = false;
      this.showGoalBanner("🎮 OYUN KOLU BAĞLANTISI KESİLDİ");
      this.updateControlHint();
    });
  }

  // FALSO AYARLAMA
  adjustFalso(delta) {
    this.setFalso(this.currentFalso + delta);
  }

  setFalso(val) {
    this.currentFalso = THREE.MathUtils.clamp(Math.round(val * 10) / 10, -1.2, 1.2);
    this.updateHUDControls();
    this.updateFalsoDisplay();
    if (this.isAiming) {
      this.updateAimTrajectory();
    }
  }

  updateFalsoDisplay() {
    const textEl = document.getElementById('falso-value-text');
    if (!textEl) return;
    const f = this.currentFalso;
    const isTrivela = this.isTrivelaActive();

    if (isTrivela) {
      const footLabel = (this.currentFoot === 'R') ? 'SAĞ DIŞ (TRİVELA) [QUARESMA]' : 'SOL DIŞ (TRİVELA) [MODRIC]';
      textEl.innerText = `🌪️ ${footLabel} (%${Math.round(Math.abs(f) * 100 || 80)})`;
      textEl.style.color = "#00ff88";
      textEl.style.textShadow = "0 0 12px rgba(0, 255, 136, 0.85)";
    } else if (this.shotType === 'power') {
      textEl.innerText = `⚡ SERT ÜST VURUŞ / FÜZE (DÜZ MERKEZ)`;
      textEl.style.color = "#ff3366";
      textEl.style.textShadow = "0 0 12px rgba(255, 51, 102, 0.85)";
    } else if (Math.abs(f) < 0.05) {
      textEl.innerText = "DÜZ VURUŞ (FALSO YOK)";
      textEl.style.color = "#cbd5e1";
      textEl.style.textShadow = "none";
    } else if (f < 0) {
      textEl.innerText = `⟲ SOLA KAVİS (%${Math.round(Math.abs(f) * 100)}) [ROBERTO CARLOS]`;
      textEl.style.color = "#00f2fe";
      textEl.style.textShadow = "none";
    } else {
      textEl.innerText = `SAĞA KAVİS (%${Math.round(f * 100)}) [BECKHAM] ⟳`;
      textEl.style.color = "#f1c40f";
      textEl.style.textShadow = "none";
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

    // Ekipman (Krampon & Top) Stat Güçlendirmeleri
    const bonusStats = (this.career && typeof this.career.getPlayerBonusStats === 'function')
      ? this.career.getPlayerBonusStats()
      : { shotPower: 0, curve: 0, ballSpeed: 0, trivela: 0 };

    const powerBonus = (bonusStats.shotPower || 0) + (bonusStats.ballSpeed || 0) * 0.5;
    const curveBonus = (bonusStats.curve || 0) + (bonusStats.trivela || 0) * 0.6;
    const powerMultiplier = 1 + (powerBonus / 100);
    const curlMultiplier = 1 + (curveBonus / 100);

    const basePower = 22 + (dragDistance / 14);
    const power = THREE.MathUtils.clamp(basePower * powerMultiplier, 23, 44);
    const curl = this.currentFalso * curlMultiplier;
    const isTrivela = this.isTrivelaActive();

    if (this.crosshair) this.crosshair.material.opacity = 0;

    clearTimeout(this.shotSafetyTimer);
    this.shotSafetyTimer = setTimeout(() => {
      if (this.shotCooldown) {
        this.advanceScenarioAfterDelay(400);
      }
    }, 4200);

    const animCallback = () => {
      this.ball.shoot(dirX, dirY, power, curl, isTrivela, this.currentFoot, this.shotType);
      this.updateSpeedHUD(power);

      if (window.onlineManager && window.onlineManager.isOnlineMatch) {
        window.onlineManager.sendShot(dirX, dirY, power, curl, isTrivela, this.currentFoot, this.shotType);
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
    } else if (isTrivela) {
      this.playerModels.triggerTrivelaAnimation(animCallback, null, this.currentFoot);
    } else {
      this.playerModels.triggerKickAnimation(animCallback, null, this.currentFoot);
    }
  }

  // KALECİ DALIŞ / UÇUŞ HAMLESİ (Fare Tıklaması)
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

  // KALECİ KLAVYE DALIŞ / UÇUŞ HAMLESİ (A, D, Space, S, W)
  executeHumanGKDive(xRatio, yRatio, diveType) {
    if (!this.playerModels || !this.playerModels.goalkeeper) return;
    this.gkMouseX = xRatio;
    this.gkMouseY = yRatio;

    // 1. Kaleci dalış hamlesi ve çarpışma kutusu tetiklemesi
    this.playerModels.setGoalkeeperManualPosition(xRatio, yRatio, true);

    // 2. 3D Reticle hedefi
    if (this.gkReticleGroup) {
      const targetX = xRatio * 3.4;
      const targetY = 0.25 + yRatio * 2.15;
      this.gkReticleGroup.position.set(targetX, targetY, 0.4);
    }

    // 3. Online senkronizasyon (Rakibe uçuşu anında ilet)
    if (window.onlineManager && window.onlineManager.isOnlineMatch) {
      window.onlineManager.sendGoalkeeperMove(xRatio, yRatio, true);
    }

    // 4. Ses efekti
    if (window.gameSound) window.gameSound.playSave();

    // 5. Görsel bildirim bannerı
    let bannerMsg = "🧤 KALECİ HAMLESİ!";
    if (diveType === 'dive_high_right') bannerMsg = "🧤 [D + SPACE] SAĞ ÜSTE 90'A UÇTUN!";
    else if (diveType === 'dive_low_right') bannerMsg = "🧤 [D] SAĞ ALTA YERE ATLADIN!";
    else if (diveType === 'dive_high_left') bannerMsg = "🧤 [A + SPACE] SOL ÜSTE 90'A UÇTUN!";
    else if (diveType === 'dive_low_left') bannerMsg = "🧤 [A] SOL ALTA YERE ATLADIN!";
    else if (diveType === 'dive_high_center') bannerMsg = "🧤 [SPACE] ORTAYA YÜKSELDİN!";
    else if (diveType === 'dive_low_center') bannerMsg = "🧤 [S] YERE KAPANIP KAPATTIN!";
    this.showGoalBanner(bannerMsg);
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

    const isTrivela = this.isTrivelaActive();

    // Nişan alırken forvetin gövdesi ve yüzü doğrudan hedefe döner
    if (this.playerModels && this.playerModels.kicker && this.playerModels.kicker.group) {
      const aimAngle = Math.atan2(targetX - this.playerModels.kicker.group.position.x, 0 - this.playerModels.kicker.group.position.z);
      this.playerModels.kicker.group.rotation.set(0, aimAngle, 0);
    }

    // 3D Nişangahı hedef noktasına taşı ve göster
    if (this.crosshair) {
      this.crosshair.position.set(targetX, Math.max(0.1, targetY), 0.04);
      this.crosshair.material.opacity = 0.9;
      if (isTrivela) {
        this.crosshair.material.color.setHex(0x00ff88);
      } else if (this.shotType === 'power') {
        this.crosshair.material.color.setHex(0xff3366);
      } else if (Math.abs(this.currentFalso) > 0.1) {
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
    if (isTrivela) {
      this.aimLine.material.color.setHex(0x00ff88);
    } else if (this.shotType === 'power') {
      this.aimLine.material.color.setHex(0xff3366);
    } else if (Math.abs(this.currentFalso) > 0.1) {
      this.aimLine.material.color.setHex(0xf1c40f);
    } else {
      this.aimLine.material.color.setHex(0x00f2fe);
    }
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
    this.timeScale = 0.45; // Çatala girdiğinde slow-mo

    // Online Maç Bildirimi
    if (window.onlineManager && window.onlineManager.isOnlineMatch) {
      this.showGoalBanner("GOOOOOL! HARİKA VURUŞ!");
      if (this.isCoopMatch) {
        window.onlineManager.reportCoopOutcome('goal');
      } else {
        window.onlineManager.reportOutcome('goal');
      }
      return;
    }

    if (this.isHumanGoalkeeper()) {
      // Kaleciysek gol yedik!
      if (this.career.currentMatch) {
        this.career.currentMatch.matchScoreAway++;
      }
      this.showGoalBanner("GOL YEDİN! RAKİP 90'A ASTI!");
    } else {
      // Forvetsek gol attık!
      this.showGoalBanner("GOOOOOL! HARİKA VURUŞ!");
      if (window.uiManager && window.uiManager.launchConfetti) {
        window.uiManager.launchConfetti();
      }
      this.career.recordScenarioSuccess('goal');
    }

    const match = this.career.currentMatch;
    if (match) {
      const scoreEl = document.getElementById('hud-score-display');
      if (scoreEl) scoreEl.innerText = `${match.matchScoreHome} - ${match.matchScoreAway}`;
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

    if (this.isHumanGoalkeeper()) {
      this.showGoalBanner("İNANILMAZ KURTARIŞ! DEVLEŞTİN!");
      this.career.recordScenarioSuccess('save');
    } else {
      this.showGoalBanner("KALECİ ÇIKARDI! KORNER!");
      const oppGoal = this.career.triggerOpponentGoalCheck();
      if (oppGoal) {
        setTimeout(() => {
          this.showGoalBanner(`⚠️ ${oppGoal.rival.toUpperCase()} GOLÜ ATTI! [${oppGoal.homeScore} - ${oppGoal.awayScore}]`);
          const scoreEl = document.getElementById('hud-score-display');
          if (scoreEl) scoreEl.innerText = `${oppGoal.homeScore} - ${oppGoal.awayScore}`;
        }, 900);
      }
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

    if (this.isHumanGoalkeeper()) {
      this.showGoalBanner("TOP DIŞARIDA! BAŞARILI SAVUNMA!");
      this.career.recordScenarioSuccess('save');
    } else {
      this.showGoalBanner("TOP AZ FARKLA AUTTA!");
      const oppGoal = this.career.triggerOpponentGoalCheck();
      if (oppGoal) {
        setTimeout(() => {
          this.showGoalBanner(`⚠️ ${oppGoal.rival.toUpperCase()} KONTRA ATAKTA GOL ATTI! [${oppGoal.homeScore} - ${oppGoal.awayScore}]`);
          const scoreEl = document.getElementById('hud-score-display');
          if (scoreEl) scoreEl.innerText = `${oppGoal.homeScore} - ${oppGoal.awayScore}`;
        }, 900);
      }
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

    if (this.isTournamentMatch) {
      this.isTournamentMatch = false;
      const tournRes = this.career.recordTournamentMatchResult(
        this.career.currentMatch.matchScoreHome,
        this.career.currentMatch.matchScoreAway
      );
      const { summary } = this.career.finishMatch(true);
      summary.isTournament = true;
      summary.tournResult = tournRes;
      window.uiManager.showMatchSummaryModal(summary, false);
      return;
    }

    const { summary, isSeasonEnd } = this.career.finishMatch(false);
    window.uiManager.showMatchSummaryModal(summary, isSeasonEnd);
  }

  // TURNUVA MAÇINI BAŞLAT
  startTournamentMatch(oppName, stageTitle) {
    this.isTournamentMatch = true;
    this.tournamentStageTitle = stageTitle;
    const tourn = this.career.getTournamentData();
    let userTeamName = 'Türkiye 🇹🇷';
    if (tourn.type === 'international') {
      const uTeam = tourn.teams.find(t => t.isUserTeam) || tourn.teams[0];
      userTeamName = `${uTeam.name} ${uTeam.flag}`;
    } else {
      const curClub = this.career.getCurrentClub();
      userTeamName = `${curClub.name} ${curClub.badge}`;
    }

    const match = this.career.generateTournamentMatch(userTeamName, oppName, stageTitle);
    
    document.getElementById('hud-team-home').innerText = match.homeTeam;
    document.getElementById('hud-team-away').innerText = match.awayTeam;
    document.getElementById('hud-score-display').innerText = '0 - 0';

    if (window.gameSound) window.gameSound.playWhistle(false);

    const firstScenario = match.scenarios[0];
    this.setupScenario(firstScenario);
  }

  // KENNEY & KONSOL İKONOGRAFİ GÜNCELLEMESİ
  updateControlHint() {
    const hintEl = document.getElementById('hud-control-hint');
    if (!hintEl) return;

    if (this.hasGamepad) {
      if (this.isHumanGoalkeeper()) {
        hintEl.innerHTML = `🎮 <span class="gamepad-badge btn-a">A</span> Sol Alt | <span class="gamepad-badge btn-b">B</span> Sağ Alt | <span class="gamepad-badge btn-x">X</span> Refleks | 🕹️ Sol Analog Eldiven Pozisyonu`;
      } else if (this.isCoopMatch) {
        hintEl.innerHTML = `🎮 🕹️ Sol Analog Koş | <span class="gamepad-badge btn-a">A</span> Pas | <span class="gamepad-badge btn-x">X</span> Şut | <span class="gamepad-badge btn-b">B</span> Çalım | <span class="gamepad-badge btn-trigger">RT</span> Depar`;
      } else {
        hintEl.innerHTML = `🎮 <span class="gamepad-badge btn-x">X</span> / <span class="gamepad-badge btn-trigger">RT</span> Basılı Tut & Bırak (Şut) | 🕹️ Sol Analog Nişan | <span class="gamepad-badge btn-trigger">LB/RB</span> Falso | <span class="gamepad-badge btn-y">Y</span> Kamera`;
      }
    } else {
      if (this.isHumanGoalkeeper()) {
        hintEl.innerHTML = `🧤 <b>KALECİ:</b> <kbd>A</kbd> Sol Alt | <kbd>D</kbd> Sağ Alt | <kbd>A</kbd>+<kbd>Space</kbd> Sol Üst | <kbd>D</kbd>+<kbd>Space</kbd> Sağ Üst | <kbd>Space</kbd> Zıpla | 🖱️ Refleks`;
      } else if (this.isCoopMatch) {
        hintEl.innerHTML = `🏃 <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> Koş | <kbd>Shift</kbd> Depar | 👟 <kbd>E</kbd>/<kbd>V</kbd> Çalım | 🎯 <kbd>Space</kbd>/<kbd>X</kbd> Pas | ⚽ 🖱️ Şut`;
      } else {
        hintEl.innerHTML = `⚽ <b>FRİKİK / PENALTI:</b> Fareyle sol tık basılı tutup çekerek nişan al, bırak! | <kbd>T</kbd> Ayak | <kbd>G</kbd> Vuruş Tipi | <kbd>C</kbd> Kamera | <kbd>Q</kbd>/<kbd>E</kbd> Falso`;
      }
    }
  }

  // GAMEPAD GİRDİLERİNİ TARA & İŞLE (HTML5 Gamepad API)
  pollGamepad(dt) {
    if (!navigator.getGamepads) return;
    const gamepads = navigator.getGamepads();
    const gp = gamepads[this.activeGamepadIndex] || gamepads[0];
    if (!gp) return;

    if (!this.hasGamepad) {
      this.hasGamepad = true;
      this.updateControlHint();
    }

    const deadzone = 0.22;
    const axisX = Math.abs(gp.axes[0]) > deadzone ? gp.axes[0] : 0;
    const axisY = Math.abs(gp.axes[1]) > deadzone ? gp.axes[1] : 0;

    if (this.isCoopMatch) {
      this.keys['KeyA'] = axisX < -0.3;
      this.keys['KeyD'] = axisX > 0.3;
      this.keys['KeyW'] = axisY < -0.3;
      this.keys['KeyS'] = axisY > 0.3;
    } else if (this.isHumanGoalkeeper()) {
      if (axisX !== 0 || axisY !== 0) {
        this.gkMouseX = THREE.MathUtils.clamp((this.gkMouseX || 0) + axisX * dt * 2.5, -1, 1);
        this.gkMouseY = THREE.MathUtils.clamp((this.gkMouseY || 0.5) - axisY * dt * 2.5, 0, 1);
        this.playerModels.setGoalkeeperManualPosition(this.gkMouseX, this.gkMouseY, false);
        if (this.gkReticleGroup) {
          const targetX = this.gkMouseX * 3.4;
          const targetY = 0.25 + this.gkMouseY * 2.15;
          this.gkReticleGroup.position.set(targetX, targetY, 0.4);
        }
      }
    } else {
      if (!this.shotCooldown && (axisX !== 0 || axisY !== 0)) {
        this.aimX = THREE.MathUtils.clamp(this.aimX + axisX * dt * 5.0, -3.5, 3.5);
        this.aimY = THREE.MathUtils.clamp(this.aimY - axisY * dt * 3.5, 0.2, 2.4);
        if (this.crosshair) {
          this.crosshair.position.set(this.aimX, this.aimY, 0.05);
          this.crosshair.material.opacity = 0.85;
        }
      }
    }

    const btnA = gp.buttons[0]?.pressed;
    const btnB = gp.buttons[1]?.pressed;
    const btnX = gp.buttons[2]?.pressed;
    const btnY = gp.buttons[3]?.pressed;
    const btnLB = gp.buttons[4]?.pressed;
    const btnRB = gp.buttons[5]?.pressed;
    const btnRT = gp.buttons[7]?.pressed;

    if (btnY && !this.lastGpButtons.btnY) {
      this.cycleCamera();
    }
    if (btnLB && !this.lastGpButtons.btnLB) {
      this.adjustFalso(-0.3);
    }
    if (btnRB && !this.lastGpButtons.btnRB) {
      this.adjustFalso(0.3);
    }

    if (this.isHumanGoalkeeper()) {
      if (btnA && !this.lastGpButtons.btnA) {
        this.performGoalkeeperDive(-1, 0.45, 'Sol Alt');
      } else if (btnB && !this.lastGpButtons.btnB) {
        this.performGoalkeeperDive(1, 0.45, 'Sağ Alt');
      } else if (btnX && !this.lastGpButtons.btnX) {
        this.handleGoalkeeperDiveAction();
      }
    } else if (this.isCoopMatch) {
      if (btnA && !this.lastGpButtons.btnA) {
        if (this.triggerCoopPass && this.hasBallPossession) {
          const target = this.myRole === 'host' ? new THREE.Vector3(0, 0, 11) : new THREE.Vector3(0, 0, 18);
          this.triggerCoopPass(target, 0.85, 1.8, 0);
        }
      } else if (btnX && !this.lastGpButtons.btnX) {
        this.triggerCoopShot(0, 1.2, 28, this.currentFalso);
      }
    } else {
      if ((btnX || btnRT) && !this.shotCooldown) {
        this.shotPowerCharge = Math.min(1.0, this.shotPowerCharge + dt * 1.6);
      } else if (!btnX && !btnRT && (this.lastGpButtons.btnX || this.lastGpButtons.btnRT) && !this.shotCooldown) {
        const pwrRatio = Math.max(0.35, this.shotPowerCharge);
        this.executeGamepadShot(pwrRatio);
        this.shotPowerCharge = 0;
      }
    }

    this.lastGpButtons = { btnA, btnB, btnX, btnY, btnLB, btnRB, btnRT };
  }

  // GAMEPAD İLE ŞUT ÇEKME
  executeGamepadShot(powerRatio = 0.7) {
    const kickCheck = this.isBallInKickRange();
    if (!kickCheck.canKick) {
      this.showGoalBanner("⚠️ TOP AYAKTA DEĞİL!");
      return;
    }

    if (this.shotCooldown) return;
    this.shotCooldown = true;
    this.hasBallPossession = false;

    const dirX = THREE.MathUtils.clamp((this.aimX || 0) / 3.2, -1.6, 1.6);
    const dirY = THREE.MathUtils.clamp((this.aimY || 1.2) / 1.8, 0.25, 2.2);
    const targetX = dirX * 4.6;
    const targetY = dirY * 2.5;

    const bonusStats = (this.career && typeof this.career.getPlayerBonusStats === 'function')
      ? this.career.getPlayerBonusStats()
      : { shotPower: 0, curve: 0, ballSpeed: 0, trivela: 0 };

    const powerBonus = (bonusStats.shotPower || 0) + (bonusStats.ballSpeed || 0) * 0.5;
    const curveBonus = (bonusStats.curve || 0) + (bonusStats.trivela || 0) * 0.6;
    const powerMult = 1 + (powerBonus / 100);
    const curlMultiplier = 1 + (curveBonus / 100);

    const basePower = 24 + powerRatio * 16;
    const power = THREE.MathUtils.clamp(basePower * powerMult, 23, 44);
    const curl = this.currentFalso * curlMultiplier;
    const isTrivela = this.isTrivelaActive();

    if (this.crosshair) this.crosshair.material.opacity = 0;

    clearTimeout(this.shotSafetyTimer);
    this.shotSafetyTimer = setTimeout(() => {
      if (this.shotCooldown) {
        this.advanceScenarioAfterDelay(400);
      }
    }, 4200);

    const animCallback = () => {
      this.ball.shoot(dirX, dirY, power, curl, isTrivela, this.currentFoot, this.shotType);
      this.updateSpeedHUD(power);

      if (window.onlineManager && window.onlineManager.isOnlineMatch) {
        window.onlineManager.sendShot(dirX, dirY, power, curl, isTrivela, this.currentFoot, this.shotType);
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
    } else if (isTrivela) {
      this.playerModels.triggerTrivelaAnimation(animCallback, null, this.currentFoot);
    } else {
      this.playerModels.triggerKickAnimation(animCallback, null, this.currentFoot);
    }
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

  applyCosmetics() {
    if (!this.career || !this.career.player) return;
    if (this.ball && this.career.player.equippedBall) {
      this.ball.setBallStyle(this.career.player.equippedBall);
    }
    if (this.currentScenario) {
      this.setupScenario(this.currentScenario);
    }
  }

  onResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
  }

  // ANA RENDER DÖNGÜSÜ (60-120 FPS)
  animate() {
    requestAnimationFrame(() => this.animate());

    const now = performance.now();
    let dt = (now - this.lastTime) / 1000;
    this.lastTime = now;

    // Ani fps düşüşlerinde patlamayı önlemek için dt'yi sınırla
    dt = Math.min(dt, 0.1) * this.timeScale;

    // Gamepad (HTML5 Gamepad API) kontrollerini tara
    if (this.pollGamepad) {
      this.pollGamepad(dt);
    }

    // Yalnızca Co-op 2 Kişilik Eşli Hücum modunda serbest hareket ve defanslar çalışır
    if (this.isCoopMatch) {
      this.updatePlayerMovement(dt);
      this.updateDefenders(dt);
    }

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

      // Şut atıldıktan sonra topu takip et (Forvet açısı)
      if (!this.isHumanGoalkeeper()) {
        this.setCameraFollowBall();
      }
    } else {
      if (this.isCoopMatch && !this.isHumanGoalkeeper()) {
        this.updateFollowCamera(dt);
      }
    }

    // Kaleci modunda dinamik yayın kamerası: Kalecinin yana hareketini yumuşakça takip eder
    if (this.isHumanGoalkeeper()) {
      const targetCamX = (this.gkMouseX || 0) * 0.75;
      this.camera.position.x = THREE.MathUtils.lerp(this.camera.position.x, targetCamX, 0.08);
      this.camera.position.y = 2.6;
      this.camera.position.z = -3.4;
      this.camera.lookAt((this.gkMouseX || 0) * 0.3, 1.1, 14);
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
