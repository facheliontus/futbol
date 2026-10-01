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
  }

  // Çim Sahayı ve Saha Çizgilerini Oluştur
  createPitch() {
    // Prosedürel Çizgili Çim Dokusu (Canlı Stadyum Çimi)
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Koyu ve açık canlı stadyum yeşili şeritler
    const stripeCount = 16;
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
    grassTexture.repeat.set(4, 8);

    const pitchGeo = new THREE.PlaneGeometry(70, 110);
    const pitchMat = new THREE.MeshStandardMaterial({
      map: grassTexture,
      color: 0x55bb59,
      roughness: 0.6,
      metalness: 0.05
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

      // "K" (Temiz Beyaz / Buz Işıltısı - Sarı Kaldırıldı)
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0, 242, 254, 0.9)';
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
    this.ambientLight = new THREE.AmbientLight(0xffffff, 1.15);
    this.scene.add(this.ambientLight);

    // Ana projektör ışığı (Gölge üreten sert ışık)
    this.mainLight = new THREE.DirectionalLight(0xffffff, 1.25);
    this.mainLight.position.set(15, 35, 30);
    this.mainLight.castShadow = true;
    this.mainLight.shadow.mapSize.width = 2048;
    this.mainLight.shadow.mapSize.height = 2048;
    this.mainLight.shadow.camera.near = 0.5;
    this.mainLight.shadow.camera.far = 120;
    this.mainLight.shadow.camera.left = -35;
    this.mainLight.shadow.camera.right = 35;
    this.mainLight.shadow.camera.top = 35;
    this.mainLight.shadow.camera.bottom = -35;
    this.scene.add(this.mainLight);

    // 4 Köşe Stadyum Projektör Kuleleri (Gerçek Maç Aydınlatması)
    const floodlightPositions = [
      [-30, 26, -6],
      [30, 26, -6],
      [-30, 26, 55],
      [30, 26, 55]
    ];
    floodlightPositions.forEach(([x, y, z]) => {
      const flood = new THREE.DirectionalLight(0xffffff, 0.65);
      flood.position.set(x, y, z);
      this.scene.add(flood);
    });

    // Kale aydınlatması için dolgu ışığı
    const goalFillLight = new THREE.PointLight(0xe0f7fa, 0.8, 35);
    goalFillLight.position.set(0, 8, 4);
    this.scene.add(goalFillLight);
  }

  // SAHA & HAVA DURUMU SİSTEMİ (Gündüz, Gece, Yağmurlu, Karlı)
  setWeather(weather = 'night') {
    this.weather = weather;
    if (weather === 'day') {
      if (this.scene) this.scene.background = new THREE.Color(0x5ca0f2);
      if (this.scene && this.scene.fog) this.scene.fog.color = new THREE.Color(0x5ca0f2);
      if (this.mainLight) this.mainLight.intensity = 1.4;
      if (this.ambientLight) this.ambientLight.intensity = 1.2;
    } else if (weather === 'rain') {
      if (this.scene) this.scene.background = new THREE.Color(0x1e272e);
      if (this.scene && this.scene.fog) this.scene.fog.color = new THREE.Color(0x1e272e);
      if (this.mainLight) this.mainLight.intensity = 0.95;
      if (this.ambientLight) this.ambientLight.intensity = 0.85;
    } else if (weather === 'snow') {
      if (this.scene) this.scene.background = new THREE.Color(0xd2dae2);
      if (this.scene && this.scene.fog) this.scene.fog.color = new THREE.Color(0xd2dae2);
      if (this.mainLight) this.mainLight.intensity = 1.25;
      if (this.ambientLight) this.ambientLight.intensity = 1.1;
    } else {
      // Gece (Projektörler)
      if (this.scene) this.scene.background = new THREE.Color(0x060913);
      if (this.scene && this.scene.fog) this.scene.fog.color = new THREE.Color(0x060913);
      if (this.mainLight) this.mainLight.intensity = 1.25;
      if (this.ambientLight) this.ambientLight.intensity = 1.15;
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

  // Her Kare LED Reklam Panosu Kayan Akış Animasyonu
  update(dt) {
    if (this.bannerTex) {
      this.bannerTex.offset.x -= dt * 0.12; // Sürekli pürüzsüz sağdan sola akan LED şerit
    }
  }
}

window.Stadium = Stadium;
