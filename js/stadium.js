// ==========================================================
// 3D STADYUM VE SAHA ORTAMI (stadium.js)
// Çift Kaleli (Away Goal Z=-38, Home Goal Z=+38) Arcade Stadyumu
// ==========================================================

class Stadium {
  constructor(scene) {
    this.scene = scene;
    this.goalWidth = 7.32;   // Standart FIFA kale genişliği (m)
    this.goalHeight = 2.44;  // Standart FIFA kale yüksekliği (m)
    this.goalDepth = 2.2;    // Kale derinliği (m)
    
    // İKİ KALE KOORDİNATI (ÇİFT KALE)
    this.goalAwayZ = -38;    // Kullanıcının gol atacağı karşı kale
    this.goalHomeZ = 38;     // Kullanıcının savunduğu kendi kalesi
    this.goalZ = -38;        // Geriye dönük uyumluluk için varsayılan kale çizgisi

    this.awayNetMesh = null;
    this.homeNetMesh = null;
    this.netMesh = null;     // Geriye dönük uyumluluk
    this.ledBoards = [];

    this.createPitch();
    this.createBothGoals();
    this.createStands();
    this.createLights();
    this.createBanners();
  }

  // Çim Sahayı ve Saha Çizgilerini Oluştur (Merkez: 0, 0, 0)
  createPitch() {
    // Prosedürel Canlı Çizgili Çim Dokusu
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Koyu ve açık canlı stadyum yeşili şeritler
    const stripeCount = 18;
    const stripeHeight = 512 / stripeCount;
    for (let i = 0; i < stripeCount; i++) {
      ctx.fillStyle = (i % 2 === 0) ? '#2e7d32' : '#3da342';
      ctx.fillRect(0, i * stripeHeight, 512, stripeHeight);
    }
    // İnce çim gürültüsü
    for (let i = 0; i < 4000; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)';
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
    }

    const grassTexture = new THREE.CanvasTexture(canvas);
    grassTexture.wrapS = THREE.RepeatWrapping;
    grassTexture.wrapT = THREE.RepeatWrapping;
    grassTexture.repeat.set(4, 10);

    const pitchGeo = new THREE.PlaneGeometry(68, 102);
    const pitchMat = new THREE.MeshStandardMaterial({
      map: grassTexture,
      color: 0x55bb59,
      roughness: 0.6,
      metalness: 0.05
    });

    const pitch = new THREE.Mesh(pitchGeo, pitchMat);
    pitch.rotation.x = -Math.PI / 2;
    pitch.position.set(0, 0, 0); // Tam merkezde
    pitch.receiveShadow = true;
    this.scene.add(pitch);

    // Beyaz Saha Çizgileri
    this.createPitchLines();
  }

  // Simetrik Çift Kale Saha Çizgileri
  createPitchLines() {
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const lineWidth = 0.12;
    const pitchHalfW = 26; // X: -26 ile +26 (52m en)
    const pitchHalfL = 38; // Z: -38 ile +38 (76m boy)

    // 1. Dış Taç Çizgileri (Sol & Sağ)
    const leftTouchline = new THREE.Mesh(new THREE.PlaneGeometry(lineWidth, pitchHalfL * 2), lineMat);
    leftTouchline.rotation.x = -Math.PI / 2;
    leftTouchline.position.set(-pitchHalfW, 0.01, 0);
    this.scene.add(leftTouchline);

    const rightTouchline = new THREE.Mesh(new THREE.PlaneGeometry(lineWidth, pitchHalfL * 2), lineMat);
    rightTouchline.rotation.x = -Math.PI / 2;
    rightTouchline.position.set(pitchHalfW, 0.01, 0);
    this.scene.add(rightTouchline);

    // 2. Kale Çizgileri (Away & Home)
    const awayGoalLine = new THREE.Mesh(new THREE.PlaneGeometry(pitchHalfW * 2, lineWidth), lineMat);
    awayGoalLine.rotation.x = -Math.PI / 2;
    awayGoalLine.position.set(0, 0.01, this.goalAwayZ);
    this.scene.add(awayGoalLine);

    const homeGoalLine = new THREE.Mesh(new THREE.PlaneGeometry(pitchHalfW * 2, lineWidth), lineMat);
    homeGoalLine.rotation.x = -Math.PI / 2;
    homeGoalLine.position.set(0, 0.01, this.goalHomeZ);
    this.scene.add(homeGoalLine);

    // 3. Orta Saha Çizgisi (Z = 0)
    const centerLine = new THREE.Mesh(new THREE.PlaneGeometry(pitchHalfW * 2, lineWidth), lineMat);
    centerLine.rotation.x = -Math.PI / 2;
    centerLine.position.set(0, 0.01, 0);
    this.scene.add(centerLine);

    // 4. Orta Saha Yuvarlağı (Radius 7.0m)
    const circleCurve = new THREE.EllipseCurve(0, 0, 7.0, 7.0, 0, Math.PI * 2, false, 0);
    const circlePoints = circleCurve.getPoints(64);
    const circleGeo = new THREE.BufferGeometry().setFromPoints(circlePoints);
    const centerCircle = new THREE.Line(circleGeo, new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 }));
    centerCircle.rotation.x = -Math.PI / 2;
    centerCircle.position.set(0, 0.015, 0);
    this.scene.add(centerCircle);

    // 5. Santra Noktası
    const centerSpot = new THREE.Mesh(new THREE.CircleGeometry(0.24, 16), lineMat);
    centerSpot.rotation.x = -Math.PI / 2;
    centerSpot.position.set(0, 0.02, 0);
    this.scene.add(centerSpot);

    // 6. İki Kalede Ceza Sahaları ve Altıpaslar
    this.createPenaltyArea(this.goalAwayZ, 1, lineMat, lineWidth); // Away (+Z yönünde içeri)
    this.createPenaltyArea(this.goalHomeZ, -1, lineMat, lineWidth); // Home (-Z yönünde içeri)
  }

  // Ceza Sahası Çizim Yardımcısı
  createPenaltyArea(goalZ, dirZ, lineMat, lineWidth) {
    const boxW = 34.0;
    const boxD = 14.5;
    const sixW = 16.0;
    const sixD = 5.0;

    // Ceza sahası ön çizgisi
    const pBoxFront = new THREE.Mesh(new THREE.PlaneGeometry(boxW, lineWidth), lineMat);
    pBoxFront.rotation.x = -Math.PI / 2;
    pBoxFront.position.set(0, 0.01, goalZ + (boxD * dirZ));
    this.scene.add(pBoxFront);

    // Ceza sahası yan çizgileri
    const pBoxLeft = new THREE.Mesh(new THREE.PlaneGeometry(lineWidth, boxD), lineMat);
    pBoxLeft.rotation.x = -Math.PI / 2;
    pBoxLeft.position.set(-boxW / 2, 0.01, goalZ + (boxD / 2 * dirZ));
    this.scene.add(pBoxLeft);

    const pBoxRight = new THREE.Mesh(new THREE.PlaneGeometry(lineWidth, boxD), lineMat);
    pBoxRight.rotation.x = -Math.PI / 2;
    pBoxRight.position.set(boxW / 2, 0.01, goalZ + (boxD / 2 * dirZ));
    this.scene.add(pBoxRight);

    // Altıpas ön çizgisi
    const sixFront = new THREE.Mesh(new THREE.PlaneGeometry(sixW, lineWidth), lineMat);
    sixFront.rotation.x = -Math.PI / 2;
    sixFront.position.set(0, 0.01, goalZ + (sixD * dirZ));
    this.scene.add(sixFront);

    // Altıpas yan çizgileri
    const sixLeft = new THREE.Mesh(new THREE.PlaneGeometry(lineWidth, sixD), lineMat);
    sixLeft.rotation.x = -Math.PI / 2;
    sixLeft.position.set(-sixW / 2, 0.01, goalZ + (sixD / 2 * dirZ));
    this.scene.add(sixLeft);

    const sixRight = new THREE.Mesh(new THREE.PlaneGeometry(lineWidth, sixD), lineMat);
    sixRight.rotation.x = -Math.PI / 2;
    sixRight.position.set(sixW / 2, 0.01, goalZ + (sixD / 2 * dirZ));
    this.scene.add(sixRight);

    // Penaltı Noktası (10 metre)
    const penSpot = new THREE.Mesh(new THREE.CircleGeometry(0.20, 16), lineMat);
    penSpot.rotation.x = -Math.PI / 2;
    penSpot.position.set(0, 0.02, goalZ + (10 * dirZ));
    this.scene.add(penSpot);
  }

  // 3D KALE DİREKLERİ VE ESNEYEN AĞLAR (ÇİFT KALE)
  createBothGoals() {
    this.awayNetMesh = this.buildGoalStructure(this.goalAwayZ, -1); // Dışarı doğru (-Z) derinlik
    this.homeNetMesh = this.buildGoalStructure(this.goalHomeZ, 1);   // Dışarı doğru (+Z) derinlik
    this.netMesh = this.awayNetMesh; // Geriye dönük uyumluluk
  }

  buildGoalStructure(goalZ, depthDir) {
    const postRadius = 0.07;
    const postMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.25,
      metalness: 0.6
    });

    const halfW = this.goalWidth / 2;
    const h = this.goalHeight;
    const d = this.goalDepth * depthDir;

    // Sol Direk
    const leftPostGeo = new THREE.CylinderGeometry(postRadius, postRadius, h, 16);
    const leftPost = new THREE.Mesh(leftPostGeo, postMat);
    leftPost.position.set(-halfW, h / 2, goalZ);
    leftPost.castShadow = true;
    this.scene.add(leftPost);

    // Sağ Direk
    const rightPostGeo = new THREE.CylinderGeometry(postRadius, postRadius, h, 16);
    const rightPost = new THREE.Mesh(rightPostGeo, postMat);
    rightPost.position.set(halfW, h / 2, goalZ);
    rightPost.castShadow = true;
    this.scene.add(rightPost);

    // Üst Direk (Crossbar)
    const crossbarGeo = new THREE.CylinderGeometry(postRadius, postRadius, this.goalWidth + postRadius * 2, 16);
    const crossbar = new THREE.Mesh(crossbarGeo, postMat);
    crossbar.rotation.z = Math.PI / 2;
    crossbar.position.set(0, h, goalZ);
    crossbar.castShadow = true;
    this.scene.add(crossbar);

    // Arka Destek Demirleri
    const supportMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.7 });
    const backBarGeo = new THREE.CylinderGeometry(0.04, 0.04, this.goalDepth, 8);
    
    // Sol üst arka demir
    const leftTopBar = new THREE.Mesh(backBarGeo, supportMat);
    leftTopBar.rotation.x = Math.PI / 2;
    leftTopBar.position.set(-halfW, h, goalZ + d / 2);
    this.scene.add(leftTopBar);

    // Sağ üst arka demir
    const rightTopBar = new THREE.Mesh(backBarGeo, supportMat);
    rightTopBar.rotation.x = Math.PI / 2;
    rightTopBar.position.set(halfW, h, goalZ + d / 2);
    this.scene.add(rightTopBar);

    // Zemin arka demiri
    const groundBackGeo = new THREE.CylinderGeometry(0.04, 0.04, this.goalWidth, 8);
    const groundBack = new THREE.Mesh(groundBackGeo, supportMat);
    groundBack.rotation.z = Math.PI / 2;
    groundBack.position.set(0, 0.04, goalZ + d);
    this.scene.add(groundBack);

    // KALE AĞI (File Dokusu)
    const netCanvas = document.createElement('canvas');
    netCanvas.width = 128;
    netCanvas.height = 128;
    const nctx = netCanvas.getContext('2d');
    nctx.clearRect(0, 0, 128, 128);
    nctx.strokeStyle = 'rgba(240, 240, 240, 0.85)';
    nctx.lineWidth = 3;

    const step = 16;
    for (let x = 0; x <= 128; x += step) {
      nctx.beginPath();
      nctx.moveTo(x, 0);
      nctx.lineTo(x, 128);
      nctx.stroke();
    }
    for (let y = 0; y <= 128; y += step) {
      nctx.beginPath();
      nctx.moveTo(0, y);
      nctx.lineTo(128, y);
      nctx.stroke();
    }

    const netTexture = new THREE.CanvasTexture(netCanvas);
    netTexture.wrapS = THREE.RepeatWrapping;
    netTexture.wrapT = THREE.RepeatWrapping;
    netTexture.repeat.set(10, 5);

    const netMat = new THREE.MeshStandardMaterial({
      map: netTexture,
      transparent: true,
      opacity: 0.85,
      roughness: 0.9,
      side: THREE.DoubleSide
    });

    // Arka Ağ
    const backNetGeo = new THREE.PlaneGeometry(this.goalWidth, h);
    const backNet = new THREE.Mesh(backNetGeo, netMat);
    backNet.position.set(0, h / 2, goalZ + d);
    this.scene.add(backNet);

    // Üst Ağ (Tavan)
    const topNetGeo = new THREE.PlaneGeometry(this.goalWidth, this.goalDepth);
    const topNet = new THREE.Mesh(topNetGeo, netMat);
    topNet.rotation.x = Math.PI / 2;
    topNet.position.set(0, h, goalZ + d / 2);
    this.scene.add(topNet);

    // Sol Yan Ağ
    const sideNetGeo = new THREE.PlaneGeometry(this.goalDepth, h);
    const leftSideNet = new THREE.Mesh(sideNetGeo, netMat);
    leftSideNet.rotation.y = Math.PI / 2;
    leftSideNet.position.set(-halfW, h / 2, goalZ + d / 2);
    this.scene.add(leftSideNet);

    // Sağ Yan Ağ
    const rightSideNet = new THREE.Mesh(sideNetGeo, netMat);
    rightSideNet.rotation.y = -Math.PI / 2;
    rightSideNet.position.set(halfW, h / 2, goalZ + d / 2);
    this.scene.add(rightSideNet);

    return backNet;
  }

  // TRİBÜNLER VE TARAFTAR KALABALIĞI (4 Kenar)
  createStands() {
    const standMat = new THREE.MeshStandardMaterial({
      color: 0x1a252f,
      roughness: 0.9
    });

    // Taraftar Kalabalığı Dokusu
    const crowdCanvas = document.createElement('canvas');
    crowdCanvas.width = 512;
    crowdCanvas.height = 256;
    const cctx = crowdCanvas.getContext('2d');
    cctx.fillStyle = '#111827';
    cctx.fillRect(0, 0, 512, 256);

    const colors = ['#e74c3c', '#f1c40f', '#3498db', '#ffffff', '#2ecc71', '#9b59b6'];
    for (let i = 0; i < 3500; i++) {
      cctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
      cctx.beginPath();
      cctx.arc(Math.random() * 512, Math.random() * 256, 1.8 + Math.random() * 1.5, 0, Math.PI * 2);
      cctx.fill();
    }

    const crowdTexture = new THREE.CanvasTexture(crowdCanvas);
    const crowdMat = new THREE.MeshBasicMaterial({ map: crowdTexture });

    // 1. Kuzey Tribünü (Away Kale Arkası: Z = -50)
    const northStand = new THREE.Mesh(new THREE.BoxGeometry(68, 18, 16), standMat);
    northStand.position.set(0, 9, -52);
    this.scene.add(northStand);

    const northCrowd = new THREE.Mesh(new THREE.PlaneGeometry(66, 15), crowdMat);
    northCrowd.position.set(0, 9, -43.8);
    this.scene.add(northCrowd);

    // 2. Güney Tribünü (Home Kale Arkası: Z = +50)
    const southStand = new THREE.Mesh(new THREE.BoxGeometry(68, 18, 16), standMat);
    southStand.position.set(0, 9, 52);
    this.scene.add(southStand);

    const southCrowd = new THREE.Mesh(new THREE.PlaneGeometry(66, 15), crowdMat);
    southCrowd.rotation.y = Math.PI;
    southCrowd.position.set(0, 9, 43.8);
    this.scene.add(southCrowd);

    // 3. Batı & Doğu Yan Tribünler (X = ±38)
    const sideStandGeo = new THREE.BoxGeometry(18, 18, 96);
    const westStand = new THREE.Mesh(sideStandGeo, standMat);
    westStand.position.set(-42, 9, 0);
    this.scene.add(westStand);

    const westCrowd = new THREE.Mesh(new THREE.PlaneGeometry(94, 15), crowdMat);
    westCrowd.rotation.y = Math.PI / 2;
    westCrowd.position.set(-32.8, 9, 0);
    this.scene.add(westCrowd);

    const eastStand = new THREE.Mesh(sideStandGeo, standMat);
    eastStand.position.set(42, 9, 0);
    this.scene.add(eastStand);

    const eastCrowd = new THREE.Mesh(new THREE.PlaneGeometry(94, 15), crowdMat);
    eastCrowd.rotation.y = -Math.PI / 2;
    eastCrowd.position.set(32.8, 9, 0);
    this.scene.add(eastCrowd);
  }

  // REKLAM LED PANOLARI (Saha Kenarları ve Kale Arkaları)
  createBanners() {
    this.bannerCanvas = document.createElement('canvas');
    this.bannerCanvas.width = 2048;
    this.bannerCanvas.height = 256;
    this.bctx = this.bannerCanvas.getContext('2d');

    this.drawBannerTexture(null);

    const logoImg = new Image();
    logoImg.crossOrigin = 'anonymous';
    logoImg.src = 'assets/fitbullk.png';
    logoImg.onload = () => {
      this.drawBannerTexture(logoImg);
      if (this.bannerTex) this.bannerTex.needsUpdate = true;
    };

    this.bannerTex = new THREE.CanvasTexture(this.bannerCanvas);
    this.bannerTex.wrapS = THREE.RepeatWrapping;
    this.bannerTex.wrapT = THREE.RepeatWrapping;
    this.bannerTex.repeat.set(3, 1);

    const bannerMat = new THREE.MeshBasicMaterial({
      map: this.bannerTex,
      side: THREE.DoubleSide
    });

    // 1. Sol Saha Kenarı LED Panosu (X = -28.5)
    const leftBanner = new THREE.Mesh(new THREE.PlaneGeometry(80, 1.45), bannerMat);
    leftBanner.position.set(-28.5, 0.72, 0);
    leftBanner.rotation.y = Math.PI / 2;
    this.scene.add(leftBanner);

    // 2. Sağ Saha Kenarı LED Panosu (X = +28.5)
    const rightBanner = new THREE.Mesh(new THREE.PlaneGeometry(80, 1.45), bannerMat);
    rightBanner.position.set(28.5, 0.72, 0);
    rightBanner.rotation.y = -Math.PI / 2;
    this.scene.add(rightBanner);

    // 3. Away Kale Arkası LED Panosu (Z = -43)
    const awayBackBanner = new THREE.Mesh(new THREE.PlaneGeometry(54, 1.45), bannerMat);
    awayBackBanner.position.set(0, 0.72, -43);
    this.scene.add(awayBackBanner);

    // 4. Home Kale Arkası LED Panosu (Z = +43)
    const homeBackBanner = new THREE.Mesh(new THREE.PlaneGeometry(54, 1.45), bannerMat);
    homeBackBanner.rotation.y = Math.PI;
    homeBackBanner.position.set(0, 0.72, 43);
    this.scene.add(homeBackBanner);

    this.ledBoards = [leftBanner, rightBanner, awayBackBanner, homeBackBanner];
  }

  // FitBULLK Logo ve Tipografisini LED Canvas'a Çiz (K harfi temiz buz beyazı/cyan)
  drawBannerTexture(logoImg = null) {
    const ctx = this.bctx;
    if (!ctx) return;

    ctx.fillStyle = '#080b12';
    ctx.fillRect(0, 0, 2048, 256);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    for (let x = 0; x < 2048; x += 8) ctx.fillRect(x, 0, 2, 256);
    for (let y = 0; y < 256; y += 8) ctx.fillRect(0, y, 2048, 2);

    ctx.fillStyle = '#ff1744';
    ctx.fillRect(0, 0, 2048, 6);
    ctx.fillStyle = '#00f2fe';
    ctx.fillRect(0, 250, 2048, 6);

    for (let block = 0; block < 2; block++) {
      const offsetX = block * 1024;

      if (logoImg && logoImg.complete && logoImg.naturalWidth > 0) {
        ctx.save();
        ctx.shadowColor = '#ff1744';
        ctx.shadowBlur = 20;
        ctx.drawImage(logoImg, offsetX + 35, 28, 200, 200);
        ctx.restore();
      } else {
        ctx.save();
        ctx.fillStyle = '#ff1744';
        ctx.beginPath();
        ctx.arc(offsetX + 135, 128, 85, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 64px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🐂', offsetX + 135, 130);
        ctx.restore();
      }

      ctx.save();
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';

      // "Fit" (Parlak Beyaz)
      ctx.font = '900 86px "Segoe UI", "Impact", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0, 242, 254, 0.7)';
      ctx.shadowBlur = 12;
      ctx.fillText('Fit', offsetX + 255, 138);

      const fitW = ctx.measureText('Fit').width;

      // "BULL" (Ateş Kırmızısı)
      ctx.fillStyle = '#ff1744';
      ctx.shadowColor = '#ff1744';
      ctx.shadowBlur = 26;
      ctx.fillText('BULL', offsetX + 255 + fitW, 138);

      const bullW = ctx.measureText('BULL').width;

      // "K" (Temiz Beyaz - Sarı Değil!)
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0, 242, 254, 0.9)';
      ctx.shadowBlur = 22;
      ctx.fillText('K', offsetX + 255 + fitW + bullW, 138);

      ctx.shadowBlur = 0;

      ctx.font = 'bold 22px "Segoe UI", sans-serif';
      ctx.fillStyle = '#e2e8f0';
      ctx.fillText('⚡ SUPREME ATHLETIC POWER & NUTRITION ⚡', offsetX + 260, 185);

      ctx.font = '900 52px sans-serif';
      ctx.fillStyle = '#ff1744';
      ctx.shadowColor = '#ff1744';
      ctx.shadowBlur = 18;
      ctx.fillText('>>>', offsetX + 870, 138);

      ctx.restore();
    }
  }

  // IŞIKLANDIRMA (Stadyum Projektörleri)
  createLights() {
    this.ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    this.scene.add(this.ambientLight);

    this.mainLight = new THREE.DirectionalLight(0xffffff, 1.3);
    this.mainLight.position.set(20, 38, 0);
    this.mainLight.castShadow = true;
    this.mainLight.shadow.mapSize.width = 2048;
    this.mainLight.shadow.mapSize.height = 2048;
    this.mainLight.shadow.camera.near = 0.5;
    this.mainLight.shadow.camera.far = 140;
    this.mainLight.shadow.camera.left = -40;
    this.mainLight.shadow.camera.right = 40;
    this.mainLight.shadow.camera.top = 45;
    this.mainLight.shadow.camera.bottom = -45;
    this.scene.add(this.mainLight);

    // 4 Köşe Stadyum Projektör Kuleleri
    const floodlightPositions = [
      [-30, 26, -42],
      [30, 26, -42],
      [-30, 26, 42],
      [30, 26, 42]
    ];
    floodlightPositions.forEach(([x, y, z]) => {
      const flood = new THREE.DirectionalLight(0xffffff, 0.7);
      flood.position.set(x, y, z);
      this.scene.add(flood);
    });
  }

  // SAHA & HAVA DURUMU SİSTEMİ
  setWeather(weather = 'night') {
    this.weather = weather;
    if (weather === 'day') {
      if (this.scene) this.scene.background = new THREE.Color(0x5ca0f2);
      if (this.scene && this.scene.fog) this.scene.fog.color = new THREE.Color(0x5ca0f2);
      if (this.mainLight) this.mainLight.intensity = 1.4;
      if (this.ambientLight) this.ambientLight.intensity = 1.2;
    } else {
      if (this.scene) this.scene.background = new THREE.Color(0x060913);
      if (this.scene && this.scene.fog) this.scene.fog.color = new THREE.Color(0x060913);
      if (this.mainLight) this.mainLight.intensity = 1.3;
      if (this.ambientLight) this.ambientLight.intensity = 1.2;
    }
  }

  // Ağ Sarsılma Efekti (Gol olduğunda ağ arkaya doğru esner)
  animateNetImpact(goalType = 'away') {
    const net = (goalType === 'home') ? this.homeNetMesh : this.awayNetMesh;
    if (!net) return;
    const startZ = net.position.z;
    const dir = (goalType === 'home') ? 1 : -1;
    let t = 0;
    const interval = setInterval(() => {
      t += 0.15;
      net.position.z = startZ + dir * Math.sin(t * 3) * Math.exp(-t * 0.8) * 0.45;
      if (t > 3) {
        clearInterval(interval);
        net.position.z = startZ;
      }
    }, 20);
  }

  update(dt) {
    if (this.bannerTex) {
      this.bannerTex.offset.x -= dt * 0.12;
    }
  }
}

window.Stadium = Stadium;
