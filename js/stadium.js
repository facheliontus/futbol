// ==========================================================
// 3D STADYUM VE SAHA ORTAMI (stadium.js)
// Three.js r128 ile gerçekçi futbol sahası, kale, ağlar ve tribünler
// ==========================================================

class Stadium {
  constructor(scene) {
    this.scene = scene;
    this.goalWidth = 7.32;   // Standart FIFA kale genişliği (m)
    this.goalHeight = 2.44;  // Standart FIFA kale yüksekliği (m)
    this.goalDepth = 2.2;    // Kale derinliği (m)
    this.goalZ = 0;          // Kale çizgisi Z koordinatı
    this.netMesh = null;
    this.ledBoards = [];

    this.createPitch();
    this.createGoal();
    this.createStands();
    this.createLights();
    this.createBanners();
    this.createSkyline();
    this.createFloodlightTowers();
    this.createCrowdFlashes();
  }

  // Çim Sahayı ve Saha Çizgilerini Oluştur
  createPitch() {
    // Prosedürel Çizgili Çim Dokusu
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Koyu ve açık yeşil şeritler
    const stripeCount = 16;
    const stripeHeight = 512 / stripeCount;
    for (let i = 0; i < stripeCount; i++) {
      ctx.fillStyle = (i % 2 === 0) ? '#2e7d32' : '#388e3c';
      ctx.fillRect(0, i * stripeHeight, 512, stripeHeight);
    }
    // İnce çim gürültüsü
    for (let i = 0; i < 4000; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)';
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
    }

    const grassTexture = new THREE.CanvasTexture(canvas);
    grassTexture.wrapS = THREE.RepeatWrapping;
    grassTexture.wrapT = THREE.RepeatWrapping;
    grassTexture.repeat.set(4, 8);

    const pitchGeo = new THREE.PlaneGeometry(70, 110);
    const pitchMat = new THREE.MeshStandardMaterial({
      map: grassTexture,
      roughness: 0.85,
      metalness: 0.1
    });

    const pitch = new THREE.Mesh(pitchGeo, pitchMat);
    pitch.rotation.x = -Math.PI / 2;
    pitch.position.set(0, 0, 25);
    pitch.receiveShadow = true;
    this.scene.add(pitch);

    // Beyaz Saha Çizgileri
    this.createPitchLines();
  }

  createPitchLines() {
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const lineWidth = 0.12;

    // Kale Çizgisi (Goal line)
    const goalLine = new THREE.Mesh(new THREE.PlaneGeometry(64, lineWidth), lineMat);
    goalLine.rotation.x = -Math.PI / 2;
    goalLine.position.set(0, 0.01, this.goalZ);
    this.scene.add(goalLine);

    // Ceza Sahası (Penalty Box: 40.3m x 16.5m)
    const boxW = 40.32;
    const boxD = 16.5;

    // Ceza sahası ön çizgisi
    const pBoxFront = new THREE.Mesh(new THREE.PlaneGeometry(boxW, lineWidth), lineMat);
    pBoxFront.rotation.x = -Math.PI / 2;
    pBoxFront.position.set(0, 0.01, this.goalZ + boxD);
    this.scene.add(pBoxFront);

    // Ceza sahası yan çizgileri
    const pBoxLeft = new THREE.Mesh(new THREE.PlaneGeometry(lineWidth, boxD), lineMat);
    pBoxLeft.rotation.x = -Math.PI / 2;
    pBoxLeft.position.set(-boxW / 2, 0.01, this.goalZ + boxD / 2);
    this.scene.add(pBoxLeft);

    const pBoxRight = new THREE.Mesh(new THREE.PlaneGeometry(lineWidth, boxD), lineMat);
    pBoxRight.rotation.x = -Math.PI / 2;
    pBoxRight.position.set(boxW / 2, 0.01, this.goalZ + boxD / 2);
    this.scene.add(pBoxRight);

    // 6 Pas (Altıpas: 18.32m x 5.5m)
    const sixW = 18.32;
    const sixD = 5.5;
    const sixFront = new THREE.Mesh(new THREE.PlaneGeometry(sixW, lineWidth), lineMat);
    sixFront.rotation.x = -Math.PI / 2;
    sixFront.position.set(0, 0.01, this.goalZ + sixD);
    this.scene.add(sixFront);

    const sixLeft = new THREE.Mesh(new THREE.PlaneGeometry(lineWidth, sixD), lineMat);
    sixLeft.rotation.x = -Math.PI / 2;
    sixLeft.position.set(-sixW / 2, 0.01, this.goalZ + sixD / 2);
    this.scene.add(sixLeft);

    const sixRight = new THREE.Mesh(new THREE.PlaneGeometry(lineWidth, sixD), lineMat);
    sixRight.rotation.x = -Math.PI / 2;
    sixRight.position.set(sixW / 2, 0.01, this.goalZ + sixD / 2);
    this.scene.add(sixRight);

    // Penaltı Noktası (11 metre)
    const penSpotGeo = new THREE.CircleGeometry(0.22, 16);
    const penSpot = new THREE.Mesh(penSpotGeo, lineMat);
    penSpot.rotation.x = -Math.PI / 2;
    penSpot.position.set(0, 0.02, this.goalZ + 11);
    this.scene.add(penSpot);

    // Ceza Yayı (Penalty Arc - D)
    const arcCurve = new THREE.EllipseCurve(0, 0, 9.15, 9.15, 0.65, Math.PI - 0.65, false, 0);
    const arcPoints = arcCurve.getPoints(32);
    const arcGeo = new THREE.BufferGeometry().setFromPoints(arcPoints);
    const arcLine = new THREE.Line(arcGeo, new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 }));
    arcLine.rotation.x = -Math.PI / 2;
    arcLine.position.set(0, 0.02, this.goalZ + 11);
    this.scene.add(arcLine);
  }

  // 3D KALE DİREKLERİ VE ESNEYEN AĞ
  createGoal() {
    const postRadius = 0.07;
    const postMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.25,
      metalness: 0.6
    });

    const halfW = this.goalWidth / 2;
    const h = this.goalHeight;

    // Sol Direk
    const leftPostGeo = new THREE.CylinderGeometry(postRadius, postRadius, h, 16);
    const leftPost = new THREE.Mesh(leftPostGeo, postMat);
    leftPost.position.set(-halfW, h / 2, this.goalZ);
    leftPost.castShadow = true;
    this.scene.add(leftPost);

    // Sağ Direk
    const rightPostGeo = new THREE.CylinderGeometry(postRadius, postRadius, h, 16);
    const rightPost = new THREE.Mesh(rightPostGeo, postMat);
    rightPost.position.set(halfW, h / 2, this.goalZ);
    rightPost.castShadow = true;
    this.scene.add(rightPost);

    // Üst Üst Direk (Crossbar)
    const crossbarGeo = new THREE.CylinderGeometry(postRadius, postRadius, this.goalWidth + postRadius * 2, 16);
    const crossbar = new THREE.Mesh(crossbarGeo, postMat);
    crossbar.rotation.z = Math.PI / 2;
    crossbar.position.set(0, h, this.goalZ);
    crossbar.castShadow = true;
    this.scene.add(crossbar);

    // Arka Destek Demirleri
    const supportMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.7 });
    const backBarGeo = new THREE.CylinderGeometry(0.04, 0.04, this.goalDepth, 8);
    
    // Sol üst arka demir
    const leftTopBar = new THREE.Mesh(backBarGeo, supportMat);
    leftTopBar.rotation.x = Math.PI / 2;
    leftTopBar.position.set(-halfW, h, this.goalZ - this.goalDepth / 2);
    this.scene.add(leftTopBar);

    // Sağ üst arka demir
    const rightTopBar = new THREE.Mesh(backBarGeo, supportMat);
    rightTopBar.rotation.x = Math.PI / 2;
    rightTopBar.position.set(halfW, h, this.goalZ - this.goalDepth / 2);
    this.scene.add(rightTopBar);

    // Zemin arka demiri
    const groundBackGeo = new THREE.CylinderGeometry(0.04, 0.04, this.goalWidth, 8);
    const groundBack = new THREE.Mesh(groundBackGeo, supportMat);
    groundBack.rotation.z = Math.PI / 2;
    groundBack.position.set(0, 0.04, this.goalZ - this.goalDepth);
    this.scene.add(groundBack);

    // SOL & SAĞ 90 KÖŞE EKLEM PARÇALARI (Cast Elbow Joint Flanges)
    const elbowJointMat = new THREE.MeshStandardMaterial({
      color: 0xeeeeee,
      roughness: 0.2,
      metalness: 0.75
    });
    const elbowGeo = new THREE.SphereGeometry(postRadius * 1.22, 16, 16);

    // Sol 90 Köşe Eklem Manşonu
    const leftElbow = new THREE.Mesh(elbowGeo, elbowJointMat);
    leftElbow.position.set(-halfW, h, this.goalZ);
    this.scene.add(leftElbow);

    // Sağ 90 Köşe Eklem Manşonu
    const rightElbow = new THREE.Mesh(elbowGeo, elbowJointMat);
    rightElbow.position.set(halfW, h, this.goalZ);
    this.scene.add(rightElbow);

    // ZEMİN ANKRAJLARI & KİLİT FLANŞLARI (Turf Anchoring Brackets & Pins)
    const anchorMat = new THREE.MeshStandardMaterial({
      color: 0x222222,
      roughness: 0.5,
      metalness: 0.8
    });
    const anchorBaseGeo = new THREE.CylinderGeometry(postRadius * 1.55, postRadius * 1.75, 0.08, 16);
    const boltGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.04, 6);

    // Sol Direk Zemin Ankrajı
    const leftAnchor = new THREE.Mesh(anchorBaseGeo, anchorMat);
    leftAnchor.position.set(-halfW, 0.04, this.goalZ);
    this.scene.add(leftAnchor);
    const leftBolt = new THREE.Mesh(boltGeo, elbowJointMat);
    leftBolt.position.set(-halfW, 0.09, this.goalZ + 0.08);
    this.scene.add(leftBolt);

    // Sağ Direk Zemin Ankrajı
    const rightAnchor = new THREE.Mesh(anchorBaseGeo, anchorMat);
    rightAnchor.position.set(halfW, 0.04, this.goalZ);
    this.scene.add(rightAnchor);
    const rightBolt = new THREE.Mesh(boltGeo, elbowJointMat);
    rightBolt.position.set(halfW, 0.09, this.goalZ + 0.08);
    this.scene.add(rightBolt);

    // Arka Zemin Sabitleme Kazıkları
    const rearAnchorL = new THREE.Mesh(anchorBaseGeo, anchorMat);
    rearAnchorL.position.set(-halfW, 0.03, this.goalZ - this.goalDepth);
    this.scene.add(rearAnchorL);
    const rearAnchorR = new THREE.Mesh(anchorBaseGeo, anchorMat);
    rearAnchorR.position.set(halfW, 0.03, this.goalZ - this.goalDepth);
    this.scene.add(rearAnchorR);

    // KALE AĞI (File Dokusu)
    const netCanvas = document.createElement('canvas');
    netCanvas.width = 128;
    netCanvas.height = 128;
    const nctx = netCanvas.getContext('2d');
    nctx.fillStyle = 'rgba(0,0,0,0)';
    nctx.clearRect(0, 0, 128, 128);
    nctx.strokeStyle = 'rgba(240, 240, 240, 0.85)';
    nctx.lineWidth = 3;

    // Kareli file deseni
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
    netTexture.repeat.set(12, 6);

    const netMat = new THREE.MeshStandardMaterial({
      map: netTexture,
      transparent: true,
      opacity: 0.8,
      roughness: 0.9,
      side: THREE.DoubleSide
    });

    // Arka Ağ
    const backNetGeo = new THREE.PlaneGeometry(this.goalWidth, h);
    const backNet = new THREE.Mesh(backNetGeo, netMat);
    backNet.position.set(0, h / 2, this.goalZ - this.goalDepth);
    this.scene.add(backNet);

    // Üst Ağ (Tavan)
    const topNetGeo = new THREE.PlaneGeometry(this.goalWidth, this.goalDepth);
    const topNet = new THREE.Mesh(topNetGeo, netMat);
    topNet.rotation.x = Math.PI / 2;
    topNet.position.set(0, h, this.goalZ - this.goalDepth / 2);
    this.scene.add(topNet);

    // Sol Yan Ağ
    const sideNetGeo = new THREE.PlaneGeometry(this.goalDepth, h);
    const leftSideNet = new THREE.Mesh(sideNetGeo, netMat);
    leftSideNet.rotation.y = Math.PI / 2;
    leftSideNet.position.set(-halfW, h / 2, this.goalZ - this.goalDepth / 2);
    this.scene.add(leftSideNet);

    // Sağ Yan Ağ
    const rightSideNet = new THREE.Mesh(sideNetGeo, netMat);
    rightSideNet.rotation.y = -Math.PI / 2;
    rightSideNet.position.set(halfW, h / 2, this.goalZ - this.goalDepth / 2);
    this.scene.add(rightSideNet);

    this.netMesh = backNet;
  }

  // TRİBÜNLER VE TARAFTAR KALABALIĞI
  createStands() {
    // Kale arkası büyük tribün
    const standGeo = new THREE.BoxGeometry(70, 18, 22);
    const standMat = new THREE.MeshStandardMaterial({
      color: 0x1a252f,
      roughness: 0.9
    });

    const northStand = new THREE.Mesh(standGeo, standMat);
    northStand.position.set(0, 9, -20);
    this.scene.add(northStand);

    // Taraftar Kalabalığı Dokusu (Renkli benekler & taraftar etkisi)
    const crowdCanvas = document.createElement('canvas');
    crowdCanvas.width = 512;
    crowdCanvas.height = 256;
    const cctx = crowdCanvas.getContext('2d');
    cctx.fillStyle = '#111827';
    cctx.fillRect(0, 0, 512, 256);

    const colors = ['#e74c3c', '#f1c40f', '#3498db', '#ffffff', '#2ecc71', '#9b59b6'];
    for (let i = 0; i < 3000; i++) {
      cctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
      cctx.beginPath();
      cctx.arc(Math.random() * 512, Math.random() * 256, 1.8 + Math.random() * 1.5, 0, Math.PI * 2);
      cctx.fill();
    }

    const crowdTexture = new THREE.CanvasTexture(crowdCanvas);
    const crowdMat = new THREE.MeshBasicMaterial({ map: crowdTexture });

    const crowdPlane = new THREE.Mesh(new THREE.PlaneGeometry(68, 16), crowdMat);
    crowdPlane.position.set(0, 9, -9.5);
    this.scene.add(crowdPlane);

    // Yan Tribünler (Doğu & Batı)
    const sideStandGeo = new THREE.BoxGeometry(20, 18, 90);
    const westStand = new THREE.Mesh(sideStandGeo, standMat);
    westStand.position.set(-45, 9, 25);
    this.scene.add(westStand);

    const eastStand = new THREE.Mesh(sideStandGeo, standMat);
    eastStand.position.set(45, 9, 25);
    this.scene.add(eastStand);
  }

  // REKLAM LED PANOLARI (Saha Kenarı & Kale Arkası - FitBULLK Markalı Hareketli LED)
  createBanners() {
    this.bannerCanvas = document.createElement('canvas');
    this.bannerCanvas.width = 2048;
    this.bannerCanvas.height = 256;
    this.bctx = this.bannerCanvas.getContext('2d');

    // İlk çizim (Görsel yüklenene kadar anında görünen profesyonel LED tasarım)
    this.drawBannerTexture(null);

    // FitBULLK Boğa Logosunu Yükle
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

    // 1. Kale Arkası Büyük LED Reklam Panosu
    const backBanner = new THREE.Mesh(new THREE.PlaneGeometry(54, 1.45), bannerMat);
    backBanner.position.set(0, 0.72, -4.6);
    this.scene.add(backBanner);

    // Pano Üst Neon Çerçeve Çizgisi (Kırmızı Kor Işıma)
    const topTrimMat = new THREE.MeshBasicMaterial({ color: 0xff1744 });
    const topTrim = new THREE.Mesh(new THREE.BoxGeometry(54.2, 0.05, 0.08), topTrimMat);
    topTrim.position.set(0, 1.45, -4.59);
    this.scene.add(topTrim);

    // 2. Sol Saha Kenarı LED Panosu (Doğu Çizgisi)
    const leftBanner = new THREE.Mesh(new THREE.PlaneGeometry(85, 1.45), bannerMat);
    leftBanner.position.set(-33, 0.72, 30);
    leftBanner.rotation.y = Math.PI / 2;
    this.scene.add(leftBanner);

    // 3. Sağ Saha Kenarı LED Panosu (Batı Çizgisi)
    const rightBanner = new THREE.Mesh(new THREE.PlaneGeometry(85, 1.45), bannerMat);
    rightBanner.position.set(33, 0.72, 30);
    rightBanner.rotation.y = -Math.PI / 2;
    this.scene.add(rightBanner);

    this.ledBoards = [backBanner, leftBanner, rightBanner];
  }

  // FitBULLK Logo ve Tipografisini LED Canvas'a Çiz
  drawBannerTexture(logoImg = null) {
    const ctx = this.bctx;
    if (!ctx) return;

    // Koyu Karbon LED Panel Zemin
    ctx.fillStyle = '#080b12';
    ctx.fillRect(0, 0, 2048, 256);

    // İnce LED Matris Noktaları (Stadyum ekranı ızgarası)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    for (let x = 0; x < 2048; x += 8) {
      ctx.fillRect(x, 0, 2, 256);
    }
    for (let y = 0; y < 256; y += 8) {
      ctx.fillRect(0, y, 2048, 2);
    }

    // Üst ve Alt Kırmızı/Altın LED Neon Kenarlık
    ctx.fillStyle = '#ff1744';
    ctx.fillRect(0, 0, 2048, 6);
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(0, 250, 2048, 6);

    // 2 Tekrar Eden Ana FitBULLK Bloğu (1024px aralıkla)
    for (let block = 0; block < 2; block++) {
      const offsetX = block * 1024;

      // 1. Logo Çizimi
      if (logoImg && logoImg.complete && logoImg.naturalWidth > 0) {
        ctx.save();
        // Kırmızı ışıma efekti
        ctx.shadowColor = '#ff1744';
        ctx.shadowBlur = 20;
        ctx.drawImage(logoImg, offsetX + 35, 28, 200, 200);
        ctx.restore();
      } else {
        // Yedek şık boğa amblemi
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

      // 2. "FitBULLK" Tipografisi
      ctx.save();
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';

      // "Fit" (Parlak Beyaz / Buz Mavisi)
      ctx.font = '900 86px "Segoe UI", "Impact", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0, 242, 254, 0.7)';
      ctx.shadowBlur = 12;
      ctx.fillText('Fit', offsetX + 255, 138);

      const fitW = ctx.measureText('Fit').width;

      // "BULL" (Ateş Kırmızısı & Neon Kor)
      ctx.fillStyle = '#ff1744';
      ctx.shadowColor = '#ff1744';
      ctx.shadowBlur = 26;
      ctx.fillText('BULL', offsetX + 255 + fitW, 138);

      const bullW = ctx.measureText('BULL').width;

      // "K" (Elektrik Sarısı / Altın)
      ctx.fillStyle = '#ffd700';
      ctx.shadowColor = '#ffd700';
      ctx.shadowBlur = 22;
      ctx.fillText('K', offsetX + 255 + fitW + bullW, 138);

      ctx.shadowBlur = 0;

      // Slogan / Alt Başlık
      ctx.font = 'bold 22px "Segoe UI", sans-serif';
      ctx.fillStyle = '#e2e8f0';
      ctx.fillText('⚡ SUPREME ATHLETIC POWER & NUTRITION ⚡', offsetX + 260, 185);

      // 3. LED Dinamik Enerji Okları (>>>)
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
    // Genel stadyum ortam ışığı
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(ambientLight);

    // Ana projektör ışığı (Gölge üreten sert ışık)
    const mainLight = new THREE.DirectionalLight(0xffffff, 0.9);
    mainLight.position.set(15, 35, 30);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 1024;
    mainLight.shadow.mapSize.height = 1024;
    mainLight.shadow.bias = -0.0005;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 100;
    mainLight.shadow.camera.left = -25;
    mainLight.shadow.camera.right = 25;
    mainLight.shadow.camera.top = 25;
    mainLight.shadow.camera.bottom = -25;
    this.scene.add(mainLight);

    // Kale aydınlatması için dolgu ışığı
    const goalFillLight = new THREE.PointLight(0xe0f7fa, 0.6, 30);
    goalFillLight.position.set(0, 8, 4);
    this.scene.add(goalFillLight);
  }

  // STADYUM ARKASI GECE ŞEHİR SİLÜETİ (Metropolitan Skyline & Skyscrapers)
  createSkyline() {
    const skylineGroup = new THREE.Group();

    // Gece bina pencereleri dokusu (PBR Procedural Night Windows)
    const winCanvas = document.createElement('canvas');
    winCanvas.width = 256;
    winCanvas.height = 512;
    const wctx = winCanvas.getContext('2d');
    wctx.fillStyle = '#080d1a';
    wctx.fillRect(0, 0, 256, 512);

    const windowColors = ['#fef08a', '#38bdf8', '#fbbf24', '#ffffff', '#0ea5e9'];
    for (let y = 10; y < 500; y += 12) {
      for (let x = 10; x < 246; x += 14) {
        if (Math.random() > 0.45) {
          wctx.fillStyle = windowColors[Math.floor(Math.random() * windowColors.length)];
          wctx.globalAlpha = 0.5 + Math.random() * 0.5;
          wctx.fillRect(x, y, 7, 7);
        }
      }
    }
    wctx.globalAlpha = 1.0;

    const winTex = new THREE.CanvasTexture(winCanvas);
    winTex.wrapS = THREE.RepeatWrapping;
    winTex.wrapT = THREE.RepeatWrapping;

    const buildingMat = new THREE.MeshBasicMaterial({ map: winTex });
    const beaconMat = new THREE.MeshBasicMaterial({ color: 0xff1744 });

    // 1. Kuzey Kale Arkası Gökdelenleri (Z: -48 to -65)
    for (let i = -6; i <= 6; i++) {
      const bWidth = 10 + Math.random() * 8;
      const bDepth = 10 + Math.random() * 8;
      const bHeight = 35 + Math.random() * 45;
      const bX = i * 14 + (Math.random() - 0.5) * 4;
      const bZ = -52 - (Math.abs(i) * 3) - Math.random() * 10;

      const bGeo = new THREE.BoxGeometry(bWidth, bHeight, bDepth);
      const bMesh = new THREE.Mesh(bGeo, buildingMat);
      bMesh.position.set(bX, bHeight / 2 - 2, bZ);
      skylineGroup.add(bMesh);

      // Çatı Kırmızı Uçak Uyarı İkaz Işığı (Aviation Beacon)
      const beaconGeo = new THREE.SphereGeometry(0.65, 8, 8);
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.position.set(bX, bHeight - 1.5, bZ);
      skylineGroup.add(beacon);
    }

    // 2. Doğu & Batı Yan Tribün Arkası Gökdelenleri
    [-68, 68].forEach(sideX => {
      for (let j = -2; j <= 5; j++) {
        const bWidth = 12 + Math.random() * 6;
        const bHeight = 28 + Math.random() * 38;
        const bDepth = 12 + Math.random() * 8;
        const bZ = j * 16 + (Math.random() - 0.5) * 5;

        const bGeo = new THREE.BoxGeometry(bWidth, bHeight, bDepth);
        const bMesh = new THREE.Mesh(bGeo, buildingMat);
        bMesh.position.set(sideX, bHeight / 2 - 2, bZ);
        skylineGroup.add(bMesh);
      }
    });

    this.scene.add(skylineGroup);
  }

  // 4 KÖŞE PROJEKTÖR DİREKLERİ & IŞIK HUZMESİ KONİLERİ (Volumetric Floodlight Towers)
  createFloodlightTowers() {
    const towerMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.3 });
    const lampMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0xe0f7fa,
      transparent: true,
      opacity: 0.08,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    const towerPositions = [
      { x: -38, z: -10, rotY: -Math.PI / 4 },
      { x: 38, z: -10, rotY: Math.PI / 4 },
      { x: -38, z: 62, rotY: -Math.PI * 0.75 },
      { x: 38, z: 62, rotY: Math.PI * 0.75 }
    ];

    towerPositions.forEach(t => {
      const towerGroup = new THREE.Group();
      towerGroup.position.set(t.x, 0, t.z);

      // Ana Çelik Kafes Kolon
      const poleGeo = new THREE.CylinderGeometry(0.4, 0.75, 26, 8);
      const pole = new THREE.Mesh(poleGeo, towerMat);
      pole.position.y = 13;
      towerGroup.add(pole);

      // Üst Projektör Paneli
      const headGeo = new THREE.BoxGeometry(4.5, 3.2, 0.6);
      const head = new THREE.Mesh(headGeo, towerMat);
      head.position.set(0, 26, 0);
      head.rotation.y = t.rotY;
      head.rotation.x = 0.35; // Sahaya doğru eğik
      towerGroup.add(head);

      // Projektör Lambaları (Parlak Beyaz Işık Matrisi)
      for (let lx = -1.6; lx <= 1.6; lx += 0.8) {
        for (let ly = -1.0; ly <= 1.0; ly += 0.7) {
          const bulb = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.5), lampMat);
          bulb.position.set(lx, 26 + ly, 0.32);
          bulb.rotation.y = t.rotY;
          bulb.rotation.x = 0.35;
          towerGroup.add(bulb);
        }
      }

      // Hacimsel Işık Huzmesi Konisi (Volumetric Light Beam)
      const coneGeo = new THREE.ConeGeometry(18, 42, 16, 1, true);
      const cone = new THREE.Mesh(coneGeo, beamMat);
      cone.position.set(0, 14, 12);
      cone.rotation.x = -Math.PI / 3;
      cone.rotation.y = t.rotY;
      towerGroup.add(cone);

      this.scene.add(towerGroup);
    });
  }

  // TARAFTAR FLAŞ PATLAMALARI (Photographer & Crowd Flashbulbs)
  createCrowdFlashes() {
    this.flashMeshes = [];
    const flashMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 });

    for (let i = 0; i < 18; i++) {
      const flashMesh = new THREE.Mesh(new THREE.SphereGeometry(0.35, 6, 6), flashMat.clone());
      const standChoice = Math.random();
      if (standChoice < 0.5) {
        // Kuzey Kale Arkası Tribünü
        flashMesh.position.set((Math.random() - 0.5) * 58, 4 + Math.random() * 10, -9.2);
      } else if (standChoice < 0.75) {
        // Sol Tribün
        flashMesh.position.set(-34, 4 + Math.random() * 10, Math.random() * 50);
      } else {
        // Sağ Tribün
        flashMesh.position.set(34, 4 + Math.random() * 10, Math.random() * 50);
      }
      this.scene.add(flashMesh);
      this.flashMeshes.push(flashMesh);
    }
  }

  // Ağ Sarsılma Efekti (Gol olduğunda ağ arkaya doğru esner)
  animateNetImpact() {
    if (!this.netMesh) return;
    const startZ = this.goalZ - this.goalDepth;
    let t = 0;
    const interval = setInterval(() => {
      t += 0.15;
      this.netMesh.position.z = startZ - Math.sin(t * 3) * Math.exp(-t * 0.8) * 0.45;
      if (t > 3) {
        clearInterval(interval);
        this.netMesh.position.z = startZ;
      }
    }, 20);
  }

  // Her Kare Güncelleme: LED Reklam ve Taraftar Flaşları
  update(dt) {
    if (this.bannerTex) {
      this.bannerTex.offset.x -= dt * 0.12; // Sürekli pürüzsüz akan LED şerit
    }

    // Rastgele taraftar kamera flaşları (Crowd Flash Bulbs)
    if (this.flashMeshes && this.flashMeshes.length > 0) {
      if (Math.random() < 0.08) {
        const randMesh = this.flashMeshes[Math.floor(Math.random() * this.flashMeshes.length)];
        randMesh.material.opacity = 1.0;
        setTimeout(() => {
          if (randMesh && randMesh.material) randMesh.material.opacity = 0;
        }, 60);
      }
    }
  }
}

window.Stadium = Stadium;
