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
        hintEl.innerHTML = `🎯 <b>NİŞAN & ŞUT:</b> Fareyle basılı tutup sürükle, bırak! | [Q / E / Tekerlek] ile Kavis ver | [R] Tekrar Vur`;
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

    this.playerModels.clearAll();

    // Bot Kaleci Oluştur (Yüksek Performanslı AI Kaleci)
    this.playerModels.createGoalkeeper(0x27ae60);

    // Varsa Baraj Kur
    if (scen.hasWall) {
      const wallX = scen.passerPos.x * 0.4;
      const wallZ = (scen.passerPos.z + 0) * 0.65;
      this.playerModels.createWall(new THREE.Vector3(wallX, 0.11, wallZ), 3, 0x34495e);
    }

    // Pasör Modelini Oluştur
    const passerPos = new THREE.Vector3(scen.passerPos.x, scen.passerPos.y, scen.passerPos.z);
    this.playerModels.createKicker(passerPos, 0xe74c3c, 10);

    // Şutör / Bitirici Modelini Oluştur
    const shooterPos = new THREE.Vector3(scen.shooterPos.x, scen.shooterPos.y, scen.shooterPos.z);
    const shooterLabel = (myRole === 'shooter') ? 'SEN (VOLE / ŞUT)' : 'ARKADAŞIN (VOLE / ŞUT)';
    this.playerModels.createTeammate(shooterPos, 0xe74c3c, 9, shooterLabel);

    // Topu Pasörün Ayağına Koy
    this.ball.reset(passerPos);

    if (this.gkReticleGroup) this.gkReticleGroup.visible = false;

    // Kamera ve HUD Rol Ayarları
    const fBar = document.querySelector('.falso-control-bar');
    if (fBar) fBar.style.display = 'flex';

    const hintEl = document.getElementById('hud-control-hint');
    if (myRole === 'passer') {
      this.camera.position.set(passerPos.x * 0.9, passerPos.y + 2.2, passerPos.z + 4.5);
      this.camera.lookAt(shooterPos.x * 0.5, 1.2, (shooterPos.z + 0) * 0.5);
      if (hintEl) {
        hintEl.innerHTML = `🎯 <b>ORTA / PAS VER:</b> Fareyle ceza sahasındaki arkadaşına doğru çekip bırak! | [Q/E] Kavis`;
      }
    } else {
      this.camera.position.set(shooterPos.x * 0.5, 2.5, shooterPos.z + 5.2);
      this.camera.lookAt(0, 1.2, 0);
      if (hintEl) {
        hintEl.innerHTML = `👀 <b>BEKLE:</b> Arkadaşın orta açıyor... Top sana ulaştığında kaleye voleyi yapıştır!`;
      }
    }
  }

  // CO-OP PASI GÖNDER (Pasör Ekranı)
  triggerCoopPass(targetPos, flightDuration, arcHeight, curl) {
    if (this.shotCooldown) return;
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
  }

  // CO-OP PASINI AL (Şutör Ekranı)
  receiveCoopPass(data) {
    this.shotCooldown = false;
    this.coopState = 'passing';

    const targetPos = new THREE.Vector3(data.targetPos.x, data.targetPos.y, data.targetPos.z);
    this.playerModels.triggerKickAnimation(() => {
      this.ball.passTo(targetPos, data.flightDuration || 1.15, data.arcHeight || 2.0, data.curl || 0, () => {
        this.onCoopPassArrived();
      });
    });

    // Top havadayken şutörün nişan almasını etkinleştir (Vole zamanlama penceresi)
    setTimeout(() => {
      if (this.coopRole === 'shooter') {
        this.coopState = 'ready_to_shoot';
        this.showGoalBanner("💥 TOP GELİYOR! GELİŞİNE KALEYE VOLEYİ ÇAK!");
        const hintEl = document.getElementById('hud-control-hint');
        if (hintEl) {
          hintEl.innerHTML = `💥 <b>GELİŞİNE VOLE VUR:</b> Fareyle kaleye doğru çekip bırak!`;
        }
      }
    }, 400);
  }

  // PAS YERİNE ULAŞTIĞINDA
  onCoopPassArrived() {
    if (this.coopRole === 'shooter' && this.coopState !== 'shot_taken') {
      this.coopState = 'ready_to_shoot';
    }
  }

  // CO-OP ŞUTU / VOLEYİ ÇEK (Şutör Ekranı)
  triggerCoopShot(dirX, dirY, power, curl) {
    if (this.coopState === 'shot_taken') return;
    this.coopState = 'shot_taken';
    this.shotCooldown = true;

    const targetX = dirX * 4.6;
    const targetY = dirY * 2.5;

    this.clearAimLine();

    this.playerModels.triggerTeammateKickAnimation(() => {
      this.ball.shoot(dirX, dirY, power, curl);
      this.updateSpeedHUD(power);

      if (window.onlineManager) {
        window.onlineManager.sendCoopShot(dirX, dirY, power, curl);
      }

      // Bot Kaleci Uçuşu
      const flightDuration = (this.ball.position.z / power);
      setTimeout(() => {
        this.playerModels.triggerGoalkeeperDive(targetX, targetY, 0, flightDuration * 0.95);
      }, 200);
    });
  }

  // CO-OP ŞUTUNU AL (Pasör Ekranı)
  receiveCoopShot(data) {
    this.coopState = 'shot_taken';
    const targetX = data.dirX * 4.6;
    const targetY = data.dirY * 2.5;

    this.playerModels.triggerTeammateKickAnimation(() => {
      this.ball.shoot(data.dirX, data.dirY, data.power, data.curl);
      this.updateSpeedHUD(data.power);

      const flightDuration = (this.ball.position.z / data.power);
      setTimeout(() => {
        this.playerModels.triggerGoalkeeperDive(targetX, targetY, 0, flightDuration * 0.95);
      }, 200);
    });
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

  // FARE KONTROLLERİ VE NİŞAN ALMA
  initInputs() {
    const canvas = this.renderer.domElement;

    // MOUSE DOWN: Nişan almaya başla
    canvas.addEventListener('mousedown', (e) => {
      if (this.isCoopMatch) {
        if (this.coopRole === 'passer' && this.coopState === 'waiting_pass') {
          this.isAiming = true;
          this.aimStart.x = e.clientX;
          this.aimStart.y = e.clientY;
          this.aimCurrent.x = e.clientX;
          this.aimCurrent.y = e.clientY;
          return;
        } else if (this.coopRole === 'shooter' && this.coopState === 'ready_to_shoot') {
          this.isAiming = true;
          this.aimStart.x = e.clientX;
          this.aimStart.y = e.clientY;
          this.aimCurrent.x = e.clientX;
          this.aimCurrent.y = e.clientY;
          return;
        }
        return;
      }

      if (this.career.player && this.career.player.position === 'GK') {
        // Kaleci modunda tıklama = Uçarak Kurtarış Hamlesi (Dive)
        this.handleGoalkeeperDiveAction();
        return;
      }

      if (this.shotCooldown) return;
      this.isAiming = true;
      this.aimStart.x = e.clientX;
      this.aimStart.y = e.clientY;
      this.aimCurrent.x = e.clientX;
      this.aimCurrent.y = e.clientY;
    });

    // MOUSE MOVE: Nişan çizgisini güncelle veya Kaleciyi hareket ettir
    window.addEventListener('mousemove', (e) => {
      // Kaleci modunda: Fare ile kaleciyi ve eldivenleri hem yatayda hem dikeyde hareket ettir
      if (this.career.player && this.career.player.position === 'GK') {
        const xNorm = (e.clientX / window.innerWidth) * 2 - 1; // -1 (sol) ile +1 (sağ) arası
        const yNorm = THREE.MathUtils.clamp(1.0 - (e.clientY / window.innerHeight), 0, 1); // 0 (yer) ile 1.0 (90/çatal) arası
        this.gkMouseX = xNorm;
        this.gkMouseY = yNorm;
        this.playerModels.setGoalkeeperManualPosition(this.gkMouseX, this.gkMouseY, false);

        // 3D Eldiven Nişangahını fareye göre anlık güncelle
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

      if (!this.isAiming) return;
      this.aimCurrent.x = e.clientX;
      this.aimCurrent.y = e.clientY;
      this.updateAimTrajectory();
    });

    // MOUSE UP: Şutu veya Pası Gönder!
    window.addEventListener('mouseup', (e) => {
      if (!this.isAiming) return;
      this.isAiming = false;
      this.clearAimLine();

      const dx = this.aimCurrent.x - this.aimStart.x;
      const dy = this.aimStart.y - this.aimCurrent.y;

      // Minimum sürükleme eşiği (15px)
      if (Math.hypot(dx, dy) < 15) return;

      if (this.isCoopMatch) {
        if (this.coopRole === 'passer' && this.coopState === 'waiting_pass') {
          const scen = this.coopScenario;
          const targetPos = new THREE.Vector3(scen.shooterPos.x, scen.shooterPos.y, scen.shooterPos.z);
          this.triggerCoopPass(targetPos, scen.flightDuration, scen.arcHeight, this.currentFalso || scen.curl);
        } else if (this.coopRole === 'shooter' && this.coopState === 'ready_to_shoot') {
          const dragY = Math.abs(dy);
          const dirX = THREE.MathUtils.clamp(dx / 85, -1.6, 1.6);
          const dirY = THREE.MathUtils.clamp(0.2 + (dragY / 65), 0.25, 2.2);
          const dragDistance = Math.hypot(dx, dragY);
          const power = THREE.MathUtils.clamp(23 + (dragDistance / 14), 24, 34);
          this.triggerCoopShot(dirX, dirY, power, this.currentFalso);
        }
        return;
      }

      this.executePlayerShot(dx, dy);
    });

    // KLAVYE KONTROLLERİ (Q/E Falso, W/A/S/D Kaleci, Space, R Tekrar Vur, F Tam Ekran)
    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyF') {
        this.toggleFullscreen();
      }
      if (e.code === 'KeyR') {
        this.retryCurrentScenario();
      }
      if (e.code === 'KeyQ') {
        // Sola falso ver
        this.adjustFalso(-0.25);
      }
      if (e.code === 'KeyE') {
        // Sağa falso ver
        this.adjustFalso(0.25);
      }
      if (e.code === 'Space') {
        if (this.career.player && this.career.player.position === 'GK') {
          this.handleGoalkeeperDiveAction();
        }
      }
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') {
        if (this.career.player && this.career.player.position === 'GK') {
          this.gkMouseX = Math.max(-1, (this.gkMouseX || 0) - 0.25);
          this.playerModels.setGoalkeeperManualPosition(this.gkMouseX, this.gkMouseY || 0.5, false);
          if (this.gkReticleGroup) {
            this.gkReticleGroup.position.x = this.gkMouseX * 3.4;
          }
        } else {
          this.adjustFalso(-0.2);
        }
      }
      if (e.code === 'KeyD' || e.code === 'ArrowRight') {
        if (this.career.player && this.career.player.position === 'GK') {
          this.gkMouseX = Math.min(1, (this.gkMouseX || 0) + 0.25);
          this.playerModels.setGoalkeeperManualPosition(this.gkMouseX, this.gkMouseY || 0.5, false);
          if (this.gkReticleGroup) {
            this.gkReticleGroup.position.x = this.gkMouseX * 3.4;
          }
        } else {
          this.adjustFalso(0.2);
        }
      }
      if (e.code === 'KeyW' || e.code === 'ArrowUp') {
        if (this.career.player && this.career.player.position === 'GK') {
          this.gkMouseY = Math.min(1.0, (this.gkMouseY || 0.5) + 0.2);
          this.playerModels.setGoalkeeperManualPosition(this.gkMouseX || 0, this.gkMouseY, false);
          if (this.gkReticleGroup) {
            this.gkReticleGroup.position.y = 0.25 + this.gkMouseY * 2.15;
          }
        }
      }
      if (e.code === 'KeyS' || e.code === 'ArrowDown') {
        if (this.career.player && this.career.player.position === 'GK') {
          this.gkMouseY = Math.max(0.0, (this.gkMouseY || 0.5) - 0.2);
          this.playerModels.setGoalkeeperManualPosition(this.gkMouseX || 0, this.gkMouseY, false);
          if (this.gkReticleGroup) {
            this.gkReticleGroup.position.y = 0.25 + this.gkMouseY * 2.15;
          }
        }
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
    if (this.shotCooldown) return;
    this.shotCooldown = true;

    const dragY = Math.abs(dy);
    // Yatay yön (Sınırsız serbestlik)
    const dirX = THREE.MathUtils.clamp(dx / 85, -1.6, 1.6);
    // Yükseklik (Yerden direk üstüne kadar serbest)
    const dirY = THREE.MathUtils.clamp(0.2 + (dragY / 65), 0.25, 2.2);

    const targetX = dirX * 4.6;
    const targetY = dirY * 2.5;

    // Güç hesaplama
    const dragDistance = Math.hypot(dx, dragY);
    const power = THREE.MathUtils.clamp(22 + (dragDistance / 14), 23, 34);

    // KULLANICININ BELİRLEDİĞİ GERÇEK FALSO (100% öngörülebilir)
    const curl = this.currentFalso;

    if (this.crosshair) this.crosshair.material.opacity = 0;

    // Asla takılı kalmaması için güvenlik zamanlayıcısı (4 saniye)
    clearTimeout(this.shotSafetyTimer);
    this.shotSafetyTimer = setTimeout(() => {
      if (this.shotCooldown) {
        this.advanceScenarioAfterDelay(400);
      }
    }, 4200);

    // Oyuncu şut animasyonu tetikle
    this.playerModels.triggerKickAnimation(() => {
      this.ball.shoot(dirX, dirY, power, curl);
      this.updateSpeedHUD(power);

      // Online modda şut parametrelerini rakibe aktar!
      if (window.onlineManager && window.onlineManager.isOnlineMatch) {
        window.onlineManager.sendShot(dirX, dirY, power, curl);
      }

      if (this.currentScenario.type === 'freekick') {
        this.playerModels.triggerWallJump();
      }

      // Kaleci AI zıplama (Sadece tek oyunculu modda çalışır, online modda kaleciyi rakip yönetir!)
      if (!window.onlineManager || !window.onlineManager.isOnlineMatch) {
        const flightDuration = this.currentScenario.distance / power;
        setTimeout(() => {
          this.playerModels.triggerGoalkeeperDive(targetX, targetY, 0, flightDuration * 0.95);
        }, 260);
      }
    });
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

      // Şut atıldıktan sonra forvet kamerasının topu takip etmesi
      if (this.career.player && this.career.player.position !== 'GK') {
        this.setCameraFollowBall();
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
