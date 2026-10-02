// ==========================================================
// 3D ATLETİK OYUNCULAR, KRAMPONLAR, KALECİ VE TRİVELA SİSTEMİ (player.js)
// ==========================================================

class PlayerModels {
  constructor(scene) {
    this.scene = scene;
    this.goalkeeper = null;
    this.wall = [];
    this.kicker = null;
    this.passer = null;
    this.teammate = null;
    this.defenders = [];

    this.gkDefaultPos = new THREE.Vector3(0, 0, 0.4);
    this.isDiving = false;
    this.lastDiveXRatio = 0;
    this.lastDiveYRatio = 0.5;
    this.isPlayerGK = false;
    this._gkResetTimer = null;
  }

  // ==========================================================
  // 1. GERÇEKÇİ 3D KRAMPON (Boot: Saya, Bağcık, Çiviler & Trivela Çizgisi)
  // ==========================================================
  createBoot(isLeft = false, bootColor = 0x111827, accentColor = 0x00f2fe) {
    const bootGroup = new THREE.Group();
    const bootMat = new THREE.MeshStandardMaterial({
      color: bootColor,
      roughness: 0.35,
      metalness: 0.25
    });
    const accentMat = new THREE.MeshStandardMaterial({
      color: accentColor,
      roughness: 0.2,
      metalness: 0.7
    });
    const laceMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7 });
    const studMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.25, metalness: 0.85 });

    // 1. Saya / Gövde (Curved Ergonomic Boot Upper)
    const upperGeo = new THREE.BoxGeometry(0.125, 0.09, 0.25);
    const upper = new THREE.Mesh(upperGeo, bootMat);
    upper.position.set(0, 0.045, 0.04);
    upper.castShadow = true;
    bootGroup.add(upper);

    // Kavisli burun ucu (Toe Box)
    const toeGeo = new THREE.CylinderGeometry(0.062, 0.062, 0.12, 14);
    const toe = new THREE.Mesh(toeGeo, bootMat);
    toe.rotation.x = Math.PI / 2;
    toe.position.set(0, 0.04, 0.14);
    toe.castShadow = true;
    bootGroup.add(toe);

    // 2. Bağcıklar ve Dil (Laces & Tongue)
    const laceGeo = new THREE.BoxGeometry(0.065, 0.015, 0.11);
    const laces = new THREE.Mesh(laceGeo, laceMat);
    laces.position.set(0, 0.095, 0.05);
    bootGroup.add(laces);

    // 3. Krampon Taban Plakası (Outsole Plate)
    const soleGeo = new THREE.BoxGeometry(0.13, 0.018, 0.26);
    const sole = new THREE.Mesh(soleGeo, accentMat);
    sole.position.set(0, 0.009, 0.04);
    bootGroup.add(sole);

    // 4. Krampon Çivileri (Molded Studs / Cleats)
    const studGeo = new THREE.CylinderGeometry(0.011, 0.007, 0.026, 8);
    const studCoords = [
      [-0.04, 0.13], [0.04, 0.13],
      [-0.04, 0.07], [0.04, 0.07],
      [-0.04, 0.00], [0.04, 0.00],
      [-0.04, -0.06], [0.04, -0.06]
    ];
    studCoords.forEach(([sx, sz]) => {
      const stud = new THREE.Mesh(studGeo, studMat);
      stud.position.set(sx, -0.012, sz);
      bootGroup.add(stud);
    });

    // 5. TRİVELA DIŞ AYAK ÇİZGİSİ (Lateral Outside Strike Zone)
    // Dış ayak vuruş yüzeyini vurgulayan neon oluklu şerit
    const trivelaLineGeo = new THREE.BoxGeometry(0.018, 0.032, 0.16);
    const trivelaLine = new THREE.Mesh(trivelaLineGeo, accentMat);
    const sideX = isLeft ? -0.065 : 0.065;
    trivelaLine.position.set(sideX, 0.05, 0.065);
    bootGroup.add(trivelaLine);

    return bootGroup;
  }

  // ==========================================================
  // 2. ANATOMİK DETAYLI ATLETİK KAFA (Face, Eyes, Nose, Hair, Headband)
  // ==========================================================
  createAthleticHead(skinColorHex = 0xffdbac, hairColorHex = 0x1a1a1a, hasHeadband = true, headbandHex = 0xffffff) {
    const headGroup = new THREE.Group();
    const skinMat = new THREE.MeshStandardMaterial({ color: skinColorHex, roughness: 0.65 });
    const hairMat = new THREE.MeshStandardMaterial({ color: hairColorHex, roughness: 0.85 });
    const whiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
    const browMat = new THREE.MeshBasicMaterial({ color: 0x111111 });

    // Kafatası & Çene
    const cranium = new THREE.Mesh(new THREE.SphereGeometry(0.175, 18, 18), skinMat);
    cranium.scale.set(1.0, 1.14, 1.05);
    cranium.castShadow = true;
    headGroup.add(cranium);

    const jaw = new THREE.Mesh(new THREE.BoxGeometry(0.155, 0.09, 0.13), skinMat);
    jaw.position.set(0, -0.11, 0.04);
    headGroup.add(jaw);

    // Kulaklar
    const earGeo = new THREE.BoxGeometry(0.035, 0.075, 0.045);
    const lEar = new THREE.Mesh(earGeo, skinMat);
    lEar.position.set(-0.185, -0.01, 0);
    headGroup.add(lEar);
    const rEar = new THREE.Mesh(earGeo, skinMat);
    rEar.position.set(0.185, -0.01, 0);
    headGroup.add(rEar);

    // Burun
    const noseGeo = new THREE.ConeGeometry(0.025, 0.06, 6);
    const nose = new THREE.Mesh(noseGeo, skinMat);
    nose.rotation.x = Math.PI / 2;
    nose.position.set(0, 0.01, 0.185);
    headGroup.add(nose);

    // Gözler & İris
    const eyeGeo = new THREE.SphereGeometry(0.024, 8, 8);
    const pupilGeo = new THREE.SphereGeometry(0.013, 8, 8);

    const lEye = new THREE.Mesh(eyeGeo, whiteMat);
    lEye.position.set(-0.058, 0.035, 0.165);
    const lPupil = new THREE.Mesh(pupilGeo, pupilMat);
    lPupil.position.set(-0.058, 0.035, 0.184);
    headGroup.add(lEye);
    headGroup.add(lPupil);

    const rEye = new THREE.Mesh(eyeGeo, whiteMat);
    rEye.position.set(0.058, 0.035, 0.165);
    const rPupil = new THREE.Mesh(pupilGeo, pupilMat);
    rPupil.position.set(0.058, 0.035, 0.184);
    headGroup.add(rEye);
    headGroup.add(rPupil);

    // Kaşlar
    const browGeo = new THREE.BoxGeometry(0.06, 0.012, 0.02);
    const lBrow = new THREE.Mesh(browGeo, browMat);
    lBrow.position.set(-0.06, 0.07, 0.175);
    lBrow.rotation.z = 0.08;
    headGroup.add(lBrow);
    const rBrow = new THREE.Mesh(browGeo, browMat);
    rBrow.position.set(0.06, 0.07, 0.175);
    rBrow.rotation.z = -0.08;
    headGroup.add(rBrow);

    // Modern Saç Modeli (Fade / Textured Top)
    const hair = new THREE.Mesh(
      new THREE.SphereGeometry(0.185, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.48),
      hairMat
    );
    hair.position.set(0, 0.045, -0.01);
    headGroup.add(hair);

    // Sporcu Kafa Bandı (Headband / Bandana)
    if (hasHeadband) {
      const bandMat = new THREE.MeshStandardMaterial({ color: headbandHex, roughness: 0.6 });
      const band = new THREE.Mesh(new THREE.CylinderGeometry(0.185, 0.185, 0.035, 20), bandMat);
      band.position.set(0, 0.08, 0);
      headGroup.add(band);
    }

    // Boyun (Neck)
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 0.16, 12), skinMat);
    neck.position.set(0, -0.21, 0);
    headGroup.add(neck);

    return headGroup;
  }

  // ==========================================================
  // 3. V-TAPER ATLETİK GÖVDE & HD FORMA CANVAS DOKUSU
  // ==========================================================
  createAthleticTorso(jerseyColorHex, number = 10, name = 'YILDIZ', isGK = false) {
    const torsoGroup = new THREE.Group();

    // 512x512 Yüksek Çözünürlüklü Forma Dokusu
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    const primaryColor = '#' + new THREE.Color(jerseyColorHex).getHexString();
    ctx.fillStyle = primaryColor;
    ctx.fillRect(0, 0, 512, 512);

    // Nefes alan mikroskobik spor kumaş dokusu
    ctx.fillStyle = 'rgba(0, 0, 0, 0.06)';
    for (let y = 0; y < 512; y += 8) {
      ctx.fillRect(0, y, 512, 4);
    }

    if (isGK) {
      // Kaleci geometrik dinamik koruma desenleri
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.beginPath();
      ctx.moveTo(100, 0);
      ctx.lineTo(412, 0);
      ctx.lineTo(350, 256);
      ctx.lineTo(162, 256);
      ctx.fill();
    }

    // Ön Yüz Detayları: Kulüp Arması ve Sponsor Banner
    ctx.save();
    // Sol göğüste şık kulüp arması
    ctx.fillStyle = '#f1c40f'; // Altın çerçeve
    ctx.beginPath();
    ctx.arc(140, 110, 32, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0a1424';
    ctx.beginPath();
    ctx.arc(140, 110, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText("⚽", 140, 118);

    // Göğüste Dinamik Sponsor Logosu
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 32px "Segoe UI", sans-serif';
    ctx.fillText("PRO FOOTBALL", 256, 195);
    ctx.fillStyle = '#00f2fe';
    ctx.font = 'bold 16px "Segoe UI", sans-serif';
    ctx.fillText("— ULTRA 3D EDITION —", 256, 225);
    ctx.restore();

    // Arka Yüz Detayları: Oyuncu İsmi ve Büyük Forma Numarası
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 38px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(name.toUpperCase(), 256, 330);

    // Forma Numarası (Gölge efektli)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.font = '900 132px "Segoe UI", sans-serif';
    ctx.fillText(number.toString(), 262, 432);

    ctx.fillStyle = '#ffffff';
    ctx.fillText(number.toString(), 256, 426);
    ctx.restore();

    const jerseyTex = new THREE.CanvasTexture(canvas);

    // Atletik V-Taper Göğüs ve Omuz Kas Yapısı
    const upperChestGeo = new THREE.BoxGeometry(0.56, 0.38, 0.28);
    const upperChestMat = new THREE.MeshStandardMaterial({
      map: jerseyTex,
      roughness: 0.5,
      metalness: 0.15
    });
    const upperChest = new THREE.Mesh(upperChestGeo, upperChestMat);
    upperChest.position.y = 1.34;
    upperChest.castShadow = true;
    torsoGroup.add(upperChest);

    // Omuz Başları (Deltoid Caps)
    const deltoidGeo = new THREE.SphereGeometry(0.09, 12, 12);
    const deltoidMat = new THREE.MeshStandardMaterial({ color: jerseyColorHex, roughness: 0.5 });
    const lDelt = new THREE.Mesh(deltoidGeo, deltoidMat);
    lDelt.position.set(-0.30, 1.45, 0);
    torsoGroup.add(lDelt);
    const rDelt = new THREE.Mesh(deltoidGeo, deltoidMat);
    rDelt.position.set(0.30, 1.45, 0);
    torsoGroup.add(rDelt);

    // Daralan Bel / Karın (Tapered Waist)
    const waistGeo = new THREE.CylinderGeometry(0.24, 0.21, 0.28, 14);
    const waist = new THREE.Mesh(waistGeo, upperChestMat);
    waist.position.y = 1.04;
    waist.castShadow = true;
    torsoGroup.add(waist);

    return { group: torsoGroup, mainMesh: upperChest };
  }

  // ==========================================================
  // 4. ATLETİK BACAK, ÇİZGİLİ TOZLUK VE 3D KRAMPON
  // ==========================================================
  createAthleticLeg(isLeft = true, skinColorHex = 0xffdbac, sockColorHex = 0xffffff, stripeColorHex = 0xe74c3c, bootColorHex = 0x111827, bootAccentHex = 0x00f2fe) {
    const legGroup = new THREE.Group();
    const hipX = isLeft ? -0.17 : 0.17;
    legGroup.position.set(hipX, 0.75, 0);

    const skinMat = new THREE.MeshStandardMaterial({ color: skinColorHex, roughness: 0.65 });
    const sockMat = new THREE.MeshStandardMaterial({ color: sockColorHex, roughness: 0.75 });
    const stripeMat = new THREE.MeshStandardMaterial({ color: stripeColorHex, roughness: 0.6 });

    // Üst Uyluk Kası (Thigh)
    const thighGeo = new THREE.CylinderGeometry(0.095, 0.082, 0.36, 12);
    const thigh = new THREE.Mesh(thighGeo, skinMat);
    thigh.position.y = -0.18;
    thigh.castShadow = true;
    legGroup.add(thigh);

    // Diz Kapağı (Knee Cap)
    const kneeGeo = new THREE.SphereGeometry(0.074, 10, 10);
    const knee = new THREE.Mesh(kneeGeo, skinMat);
    knee.position.set(0, -0.36, 0.015);
    legGroup.add(knee);

    // Alt Bacak ve Çizgili Tozluk (Striped Compression Sock)
    const calfGeo = new THREE.CylinderGeometry(0.082, 0.072, 0.38, 12);
    const calf = new THREE.Mesh(calfGeo, sockMat);
    calf.position.y = -0.56;
    calf.castShadow = true;
    legGroup.add(calf);

    // Tozluk Üst Çift Çizgisi
    const stripe1 = new THREE.Mesh(new THREE.CylinderGeometry(0.084, 0.084, 0.028, 12), stripeMat);
    stripe1.position.y = -0.42;
    legGroup.add(stripe1);
    const stripe2 = new THREE.Mesh(new THREE.CylinderGeometry(0.084, 0.084, 0.024, 12), stripeMat);
    stripe2.position.y = -0.47;
    legGroup.add(stripe2);

    // 3D Detaylı Krampon
    const boot = this.createBoot(isLeft, bootColorHex, bootAccentHex);
    boot.position.set(0, -0.74, 0.04);
    legGroup.add(boot);

    return legGroup;
  }

  // ==========================================================
  // 5. KALECİ ELDİVENİ (4mm German Latex, Dolgulu Yumruk Alanı)
  // ==========================================================
  createGoalkeeperGlove(isLeft = true, gloveColorHex = 0x00ff88) {
    const gloveGroup = new THREE.Group();
    const palmMat = new THREE.MeshStandardMaterial({
      color: gloveColorHex, // Neon kavrayıcı latex
      roughness: 0.3,
      metalness: 0.15
    });
    const backhandMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a, // Siyah darbe emici dolgu
      roughness: 0.5,
      metalness: 0.4
    });
    const strapMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 });

    // Avuç içi ve Gövde
    const palmGeo = new THREE.BoxGeometry(0.15, 0.15, 0.09);
    const palm = new THREE.Mesh(palmGeo, palmMat);
    palm.castShadow = true;
    gloveGroup.add(palm);

    // Arka El Koruma Dolgusu
    const padGeo = new THREE.BoxGeometry(0.14, 0.13, 0.04);
    const pad = new THREE.Mesh(padGeo, backhandMat);
    pad.position.set(0, 0, -0.05);
    gloveGroup.add(pad);

    // Başparmak Koruması
    const thumbGeo = new THREE.BoxGeometry(0.045, 0.08, 0.06);
    const thumb = new THREE.Mesh(thumbGeo, palmMat);
    const thumbX = isLeft ? 0.085 : -0.085;
    thumb.position.set(thumbX, 0.02, 0.02);
    gloveGroup.add(thumb);

    // Bilek Bandı (Wrist Strap)
    const strapGeo = new THREE.CylinderGeometry(0.078, 0.078, 0.05, 12);
    const strap = new THREE.Mesh(strapGeo, strapMat);
    strap.position.y = 0.09;
    gloveGroup.add(strap);

    return gloveGroup;
  }

  // ==========================================================
  // KALECİ 3D MODELİ OLUŞTURMA (Modern Atletik Kaleci)
  // ==========================================================
  createGoalkeeper(colorHex = 0xf39c12) {
    if (this.goalkeeper) {
      this.scene.remove(this.goalkeeper.group);
      this.goalkeeper = null;
    }

    const group = new THREE.Group();

    // 1. Atletik V-Taper Torso (Kaleci Forması)
    const torsoData = this.createAthleticTorso(colorHex, 1, 'KALECİ', true);
    group.add(torsoData.group);

    // 2. Anatomik Kafa & Saç Bandı
    const head = this.createAthleticHead(0xffdbac, 0x2c1d11, true, 0x111111);
    head.position.y = 1.74;
    group.add(head);

    // 3. Kaleci Şortu
    const shortsMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8 });
    const shorts = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.32, 0.28), shortsMat);
    shorts.position.y = 0.86;
    shorts.castShadow = true;
    group.add(shorts);

    // 4. Bacaklar, Çizgili Tozluklar ve Kramponlar
    const leftLeg = this.createAthleticLeg(true, 0xffdbac, 0x111111, colorHex, 0x111827, 0x00ff88);
    const rightLeg = this.createAthleticLeg(false, 0xffdbac, 0x111111, colorHex, 0x111827, 0x00ff88);
    group.add(leftLeg);
    group.add(rightLeg);

    // 5. Kollar ve Dolgulu Kaleci Eldivenleri
    const armMat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.5 });
    const armGeo = new THREE.CylinderGeometry(0.075, 0.065, 0.48, 12);

    // Sol Kol
    const leftArmGroup = new THREE.Group();
    leftArmGroup.position.set(-0.34, 1.45, 0);
    const lArm = new THREE.Mesh(armGeo, armMat);
    lArm.position.y = -0.22;
    leftArmGroup.add(lArm);
    const leftGlove = this.createGoalkeeperGlove(true, 0x00ff88);
    leftGlove.position.y = -0.52;
    leftArmGroup.add(leftGlove);
    group.add(leftArmGroup);

    // Sağ Kol
    const rightArmGroup = new THREE.Group();
    rightArmGroup.position.set(0.34, 1.45, 0);
    const rArm = new THREE.Mesh(armGeo, armMat);
    rArm.position.y = -0.22;
    rightArmGroup.add(rArm);
    const rightGlove = this.createGoalkeeperGlove(false, 0x00ff88);
    rightGlove.position.y = -0.52;
    rightArmGroup.add(rightGlove);
    group.add(rightArmGroup);

    group.position.copy(this.gkDefaultPos);
    this.scene.add(group);

    this.goalkeeper = {
      group: group,
      torso: torsoData.group,
      head: head,
      leftArm: leftArmGroup,
      rightArm: rightArmGroup,
      leftGlove: leftGlove,
      rightGlove: rightGlove,
      initialY: 0,
      diveTimer: 0,
      state: 'idle'
    };

    return this.goalkeeper;
  }

  // ==========================================================
  // ŞUT ÇEKEN FORVET OYUNCUSU (Modern Atletik Forvet Modeli)
  // ==========================================================
  createKicker(ballPos, jerseyColorHex = 0xe74c3c, number = 10, name = 'YILDIZ', preferredFoot = 'R') {
    if (this.kicker) {
      this.scene.remove(this.kicker.group);
      this.kicker = null;
    }

    const group = new THREE.Group();

    // 1. Atletik V-Taper Torso & HD Forma
    const torsoData = this.createAthleticTorso(jerseyColorHex, number, name, false);
    group.add(torsoData.group);

    // 2. Anatomik Detaylı Kafa, Yüz ve Bandana
    const head = this.createAthleticHead(0xffdbac, 0x111111, true, 0xffffff);
    head.position.y = 1.74;
    group.add(head);

    // 3. Atletik Şort
    const shortsMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8 });
    const shorts = new THREE.Mesh(new THREE.BoxGeometry(0.50, 0.32, 0.27), shortsMat);
    shorts.position.y = 0.86;
    shorts.castShadow = true;
    group.add(shorts);

    // 4. Bacaklar, Çizgili Tozluklar ve Trivela Çizgili Kramponlar
    const bootAccent = (preferredFoot === 'R') ? 0x00f2fe : 0xffd700;
    const leftLeg = this.createAthleticLeg(true, 0xffdbac, 0xffffff, jerseyColorHex, 0x111827, bootAccent);
    const rightLeg = this.createAthleticLeg(false, 0xffdbac, 0xffffff, jerseyColorHex, 0x111827, bootAccent);
    group.add(leftLeg);
    group.add(rightLeg);

    // 5. Kollar
    const armMat = new THREE.MeshStandardMaterial({ color: jerseyColorHex, roughness: 0.5 });
    const armGeo = new THREE.CylinderGeometry(0.07, 0.06, 0.52, 10);

    const leftArmGroup = new THREE.Group();
    leftArmGroup.position.set(-0.34, 1.45, 0);
    const lArm = new THREE.Mesh(armGeo, armMat);
    lArm.position.y = -0.24;
    leftArmGroup.add(lArm);
    group.add(leftArmGroup);

    const rightArmGroup = new THREE.Group();
    rightArmGroup.position.set(0.34, 1.45, 0);
    const rArm = new THREE.Mesh(armGeo, armMat);
    rArm.position.y = -0.24;
    rightArmGroup.add(rArm);
    group.add(rightArmGroup);

    // Baş Üstünde Oyuncu İsim Etiketi
    const labelCanvas = document.createElement('canvas');
    labelCanvas.width = 256;
    labelCanvas.height = 64;
    const lctx = labelCanvas.getContext('2d');
    lctx.fillStyle = 'rgba(0, 242, 254, 0.85)';
    if (lctx.roundRect) lctx.roundRect(4, 4, 248, 56, 12);
    else lctx.rect(4, 4, 248, 56);
    lctx.fill();
    lctx.fillStyle = '#0a1424';
    lctx.font = 'bold 24px "Segoe UI", sans-serif';
    lctx.textAlign = 'center';
    lctx.textBaseline = 'middle';
    const footText = preferredFoot === 'R' ? 'SAĞ AYAK' : 'SOL AYAK';
    lctx.fillText(`${name} (${footText})`, 128, 32);
    const labelTex = new THREE.CanvasTexture(labelCanvas);
    const labelSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: labelTex, transparent: true }));
    labelSprite.position.set(0, 2.3, 0);
    labelSprite.scale.set(1.4, 0.35, 1);
    group.add(labelSprite);

    // Ayak seçimine göre doğal duruş konumu:
    // Sağ ayaklı vurucu topun hafif sol arkasında durur; sol ayaklı sağ arkasında durur
    const stanceOffsetX = (preferredFoot === 'R') ? -0.65 : 0.65;
    group.position.set(ballPos.x + stanceOffsetX, 0.11, ballPos.z + 1.85);
    group.lookAt(0, 0, 0);

    this.scene.add(group);
    this.kicker = {
      group: group,
      torso: torsoData.group,
      head: head,
      leftLegGroup: leftLeg,
      rightLegGroup: rightLeg,
      leftArmGroup: leftArmGroup,
      rightArmGroup: rightArmGroup,
      labelSprite: labelSprite,
      preferredFoot: preferredFoot,
      isKicking: false,
      runCycle: 0
    };

    this.createKickZoneIndicator();
    return this.kicker;
  }

  // ==========================================================
  // AYAK SEÇİMİNE GÖRE STANDART ŞUT ANİMASYONU (Plase / Sert Üst)
  // ==========================================================
  triggerKickAnimation(onImpactCallback, targetChar = null, preferredFoot = 'R') {
    const char = targetChar || this.kicker;
    if (!char) return;
    char.isKicking = true;

    const isRight = (preferredFoot === 'R');
    const kickLeg = isRight ? char.rightLegGroup : char.leftLegGroup;
    const plantLeg = isRight ? char.leftLegGroup : char.rightLegGroup;
    const oppositeArm = isRight ? char.leftArmGroup : char.rightArmGroup;

    let t = 0;
    const animInterval = setInterval(() => {
      t += 0.08;

      if (t < 0.38) {
        // Geriye gerilme (Wind-up)
        const p = t / 0.38;
        kickLeg.rotation.x = -Math.sin(p * (Math.PI / 2)) * 1.25;
        plantLeg.rotation.x = 0.2 * p;
        oppositeArm.rotation.x = 0.7 * p;
      } else if (t < 0.68) {
        // Topa doğru patlama ve vuruş
        const progress = (t - 0.38) / 0.30;
        kickLeg.rotation.x = -1.25 + (progress * 2.65);
        plantLeg.rotation.x = 0.2 * (1 - progress);
        if (progress >= 0.5 && onImpactCallback) {
          onImpactCallback();
          onImpactCallback = null;
        }
      } else if (t < 1.0) {
        // Takip salınımı (Follow-through)
        const progress = (t - 0.68) / 0.32;
        kickLeg.rotation.x = 1.4 * (1 - progress);
        oppositeArm.rotation.x = 0.7 * (1 - progress);
      } else {
        clearInterval(animInterval);
        kickLeg.rotation.x = 0;
        plantLeg.rotation.x = 0;
        oppositeArm.rotation.x = 0;
        char.isKicking = false;
      }
    }, 20);
  }

  // ==========================================================
  // QUARESMA / MODRIC İKONİK TRİVELA ANİMASYONU (Dış Ayak Kamçısı)
  // ==========================================================
  triggerTrivelaAnimation(onImpactCallback, targetChar = null, preferredFoot = 'R') {
    const char = targetChar || this.kicker;
    if (!char) return;
    char.isKicking = true;

    const isRight = (preferredFoot === 'R');
    const kickLeg = isRight ? char.rightLegGroup : char.leftLegGroup;
    const plantLeg = isRight ? char.leftLegGroup : char.rightLegGroup;
    const balanceArm = isRight ? char.leftArmGroup : char.rightArmGroup;

    const startRotZ = char.group.rotation.z;
    let t = 0;

    const animInterval = setInterval(() => {
      t += 0.075;

      if (t < 0.4) {
        // 1. Destek ayağı açılı basılır, gövde aksi yöne yatar (Trivela Lean)
        const p = t / 0.4;
        const leanAngle = isRight ? 0.42 : -0.42;
        char.group.rotation.z = startRotZ + (leanAngle * p);

        // Vuran bacak arkaya ve dışa doğru gerilir
        kickLeg.rotation.x = -Math.sin(p * (Math.PI / 2)) * 1.35;
        kickLeg.rotation.y = isRight ? -0.35 * p : 0.35 * p;
        kickLeg.rotation.z = isRight ? -0.28 * p : 0.28 * p;

        // Denge kolu havalanır
        balanceArm.rotation.x = 0.9 * p;
        balanceArm.rotation.z = isRight ? -0.5 * p : 0.5 * p;
      } else if (t < 0.7) {
        // 2. Dış yüzeyle topu kamçılayarak geçiş (The Trivela Whip Stroke)
        const p = (t - 0.4) / 0.3;
        kickLeg.rotation.x = -1.35 + (p * 2.85);
        kickLeg.rotation.y = isRight ? -0.35 + (p * 0.7) : 0.35 - (p * 0.7);
        kickLeg.rotation.z = isRight ? -0.28 + (p * 0.5) : 0.28 - (p * 0.5);

        // Tam temas anı
        if (p >= 0.5 && onImpactCallback) {
          onImpactCallback();
          onImpactCallback = null;
        }
      } else if (t < 1.05) {
        // 3. Takip salınımı ve gövdenin toparlanması
        const p = (t - 0.7) / 0.35;
        const leanAngle = isRight ? 0.42 : -0.42;
        char.group.rotation.z = startRotZ + leanAngle * (1 - p);
        kickLeg.rotation.x = 1.5 * (1 - p);
        kickLeg.rotation.y = 0;
        kickLeg.rotation.z = 0;
        balanceArm.rotation.x = 0.9 * (1 - p);
        balanceArm.rotation.z = 0;
      } else {
        clearInterval(animInterval);
        char.group.rotation.z = startRotZ;
        kickLeg.rotation.set(0, 0, 0);
        plantLeg.rotation.set(0, 0, 0);
        balanceArm.rotation.set(0, 0, 0);
        char.isKicking = false;
      }
    }, 20);
  }

  // VOLE ANİMASYONU
  triggerVolleyAnimation(onImpactCallback, targetChar = null) {
    const char = targetChar || this.kicker;
    if (!char) return;
    char.isKicking = true;

    let t = 0;
    const interval = setInterval(() => {
      t += 0.07;
      if (t < 0.4) {
        char.group.position.y = 0.11 + Math.sin(t / 0.4 * (Math.PI / 2)) * 0.65;
        char.rightLegGroup.rotation.x = -1.4;
      } else if (t < 0.75) {
        const p = (t - 0.4) / 0.35;
        char.rightLegGroup.rotation.x = -1.4 + (p * 2.8);
        if (p >= 0.5 && onImpactCallback) {
          onImpactCallback();
          onImpactCallback = null;
        }
      } else if (t < 1.05) {
        const p = (t - 0.75) / 0.3;
        char.group.position.y = 0.11 + 0.65 * (1 - p);
        char.rightLegGroup.rotation.x = 1.4 * (1 - p);
      } else {
        clearInterval(interval);
        char.group.position.y = 0.11;
        char.rightLegGroup.rotation.x = 0;
        char.isKicking = false;
      }
    }, 20);
  }

  // KAFA VURUŞU ANİMASYONU
  triggerHeaderAnimation(onImpactCallback, targetChar = null) {
    const char = targetChar || this.kicker;
    if (!char) return;
    char.isKicking = true;

    let t = 0;
    const interval = setInterval(() => {
      t += 0.08;
      if (t < 0.5) {
        char.group.position.y = 0.11 + Math.sin(t / 0.5 * (Math.PI / 2)) * 0.75;
        char.head.rotation.x = -0.35;
      } else if (t < 0.75) {
        char.head.rotation.x = 0.55;
        if (onImpactCallback) {
          onImpactCallback();
          onImpactCallback = null;
        }
      } else if (t < 1.05) {
        const p = (t - 0.75) / 0.3;
        char.group.position.y = 0.11 + 0.75 * (1 - p);
        char.head.rotation.x = 0.55 * (1 - p);
      } else {
        clearInterval(interval);
        char.group.position.y = 0.11;
        char.head.rotation.x = 0;
        char.isKicking = false;
      }
    }, 20);
  }

  // ==========================================================
  // SAVUNMA BARAJI OLUŞTURMA (Modern Atletik Baraj)
  // ==========================================================
  createWall(ballPos, count = 4, jerseyColorHex = 0x2980b9) {
    this.wall.forEach(def => this.scene.remove(def.group));
    this.wall = [];

    const dirToGoal = new THREE.Vector3(0, 0, 0).sub(ballPos).normalize();
    const wallCenter = ballPos.clone().add(dirToGoal.clone().multiplyScalar(9.15));
    const perpDir = new THREE.Vector3(-dirToGoal.z, 0, dirToGoal.x).normalize();

    for (let i = 0; i < count; i++) {
      const defGroup = new THREE.Group();
      const offset = (i - (count - 1) / 2) * 0.76;
      const pos = wallCenter.clone().add(perpDir.clone().multiplyScalar(offset));

      const torsoData = this.createAthleticTorso(jerseyColorHex, i + 3, 'BARAJ', false);
      defGroup.add(torsoData.group);

      const head = this.createAthleticHead(0xe0ac69, 0x111111, false);
      head.position.y = 1.74;
      defGroup.add(head);

      const shortsMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 });
      const shorts = new THREE.Mesh(new THREE.BoxGeometry(0.50, 0.32, 0.27), shortsMat);
      shorts.position.y = 0.86;
      defGroup.add(shorts);

      const lLeg = this.createAthleticLeg(true, 0xe0ac69, jerseyColorHex, 0xffffff, 0x111827, 0xf1c40f);
      const rLeg = this.createAthleticLeg(false, 0xe0ac69, jerseyColorHex, 0xffffff, 0x111827, 0xf1c40f);
      defGroup.add(lLeg);
      defGroup.add(rLeg);

      // Baraj oyuncuları kasıklarını korur (Kollar önde)
      const armMat = new THREE.MeshStandardMaterial({ color: jerseyColorHex, roughness: 0.5 });
      const armGeo = new THREE.CylinderGeometry(0.065, 0.055, 0.48, 10);
      const lArm = new THREE.Mesh(armGeo, armMat);
      lArm.position.set(-0.16, 1.05, 0.16);
      lArm.rotation.set(0.6, 0.3, -0.4);
      defGroup.add(lArm);
      const rArm = new THREE.Mesh(armGeo, armMat);
      rArm.position.set(0.16, 1.05, 0.16);
      rArm.rotation.set(0.6, -0.3, 0.4);
      defGroup.add(rArm);

      defGroup.position.copy(pos);
      defGroup.lookAt(ballPos.x, defGroup.position.y, ballPos.z);

      this.scene.add(defGroup);
      this.wall.push({
        group: defGroup,
        baseY: 0,
        jumpOffset: 0
      });
    }
  }

  // BARAJIN ZIPLAMA ANİMASYONU
  triggerWallJump() {
    let t = 0;
    const interval = setInterval(() => {
      t += 0.08;
      const jumpY = Math.sin(t * Math.PI) * 0.72;
      this.wall.forEach(def => {
        def.group.position.y = Math.max(0, jumpY);
      });
      if (t >= 1) {
        clearInterval(interval);
        this.wall.forEach(def => { def.group.position.y = 0; });
      }
    }, 25);
  }

  // ==========================================================
  // KALECİ AI DALIŞ & UÇUŞ ANİMASYONU
  // ==========================================================
  triggerGoalkeeperDive(targetX, targetY, targetZ, travelTime = 0.8) {
    if (!this.goalkeeper) return;
    this.isDiving = true;
    this.goalkeeper.state = 'diving';

    const startPos = this.goalkeeper.group.position.clone();
    const clampedTargetX = THREE.MathUtils.clamp(targetX * 0.65, -2.1, 2.1);
    const clampedTargetY = THREE.MathUtils.clamp(targetY * 0.8, 0.4, 1.95);

    let startTime = performance.now();
    const duration = Math.max(0.75, travelTime) * 1000;

    const diveLoop = () => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(1, elapsed / duration);
      const ease = 1 - (1 - progress) * (1 - progress);

      this.goalkeeper.group.position.x = THREE.MathUtils.lerp(startPos.x, clampedTargetX, ease);
      this.goalkeeper.group.position.y = THREE.MathUtils.lerp(0, clampedTargetY, Math.sin(progress * Math.PI));

      const rollAngle = (clampedTargetX > 0 ? -1 : 1) * Math.sin(progress * Math.PI) * 1.0;
      this.goalkeeper.group.rotation.z = rollAngle;

      if (this.goalkeeper.leftArm && this.goalkeeper.rightArm) {
        this.goalkeeper.leftArm.rotation.z = (clampedTargetX < 0 ? -1.5 : 0.4);
        this.goalkeeper.rightArm.rotation.z = (clampedTargetX > 0 ? 1.5 : -0.4);
      }

      if (progress < 1) {
        requestAnimationFrame(diveLoop);
      } else {
        setTimeout(() => {
          this.resetGoalkeeper();
        }, 1200);
      }
    };

    requestAnimationFrame(diveLoop);
  }

  // ==========================================================
  // İNSAN KALECİ KONTROLÜ (A/D ile yere, Space+A/D ile 90'a uçuş)
  // ==========================================================
  setGoalkeeperManualPosition(xRatio, yRatio = 0.5, isDivingAction = false) {
    if (!this.goalkeeper) return;
    this.isPlayerGK = true;
    this.lastDiveXRatio = xRatio;
    this.lastDiveYRatio = yRatio;

    const targetX = xRatio * 3.35;

    if (isDivingAction) {
      this.isDiving = true;
      this.goalkeeper.state = 'diving';

      if (xRatio !== 0) {
        if (yRatio >= 0.5) {
          // ÜSTE UÇUŞ (90'a uçuş)
          const targetY = 1.70;
          this.goalkeeper.group.position.x = THREE.MathUtils.lerp(this.goalkeeper.group.position.x, targetX, 0.55);
          this.goalkeeper.group.position.y = THREE.MathUtils.lerp(this.goalkeeper.group.position.y, targetY, 0.55);
          this.goalkeeper.group.rotation.z = THREE.MathUtils.lerp(this.goalkeeper.group.rotation.z, -Math.sign(xRatio) * 1.15, 0.5);

          if (this.goalkeeper.leftArm && this.goalkeeper.rightArm) {
            this.goalkeeper.leftArm.rotation.z = (xRatio < 0 ? -1.85 : 0.6);
            this.goalkeeper.rightArm.rotation.z = (xRatio > 0 ? 1.85 : -0.6);
            this.goalkeeper.leftArm.rotation.x = -0.4;
            this.goalkeeper.rightArm.rotation.x = -0.4;
          }
        } else {
          // ALTA / YERE DALIŞ
          const targetY = 0.22;
          this.goalkeeper.group.position.x = THREE.MathUtils.lerp(this.goalkeeper.group.position.x, targetX, 0.6);
          this.goalkeeper.group.position.y = THREE.MathUtils.lerp(this.goalkeeper.group.position.y, targetY, 0.6);
          this.goalkeeper.group.rotation.z = THREE.MathUtils.lerp(this.goalkeeper.group.rotation.z, -Math.sign(xRatio) * 1.35, 0.55);

          if (this.goalkeeper.leftArm && this.goalkeeper.rightArm) {
            this.goalkeeper.leftArm.rotation.z = (xRatio < 0 ? -1.65 : 0.3);
            this.goalkeeper.rightArm.rotation.z = (xRatio > 0 ? 1.65 : -0.3);
            this.goalkeeper.leftArm.rotation.x = 0.65;
            this.goalkeeper.rightArm.rotation.x = 0.65;
          }
        }
      } else {
        if (yRatio >= 0.5) {
          this.goalkeeper.group.position.y = THREE.MathUtils.lerp(this.goalkeeper.group.position.y, 1.85, 0.55);
          this.goalkeeper.group.rotation.z = 0;
          if (this.goalkeeper.leftArm && this.goalkeeper.rightArm) {
            this.goalkeeper.leftArm.rotation.z = Math.PI - 0.2;
            this.goalkeeper.rightArm.rotation.z = -Math.PI + 0.2;
          }
        } else {
          this.goalkeeper.group.position.y = THREE.MathUtils.lerp(this.goalkeeper.group.position.y, 0.15, 0.6);
          this.goalkeeper.group.rotation.z = 0;
          if (this.goalkeeper.leftArm && this.goalkeeper.rightArm) {
            this.goalkeeper.leftArm.rotation.z = 0.3;
            this.goalkeeper.rightArm.rotation.z = -0.3;
          }
        }
      }

      clearTimeout(this._gkResetTimer);
      this._gkResetTimer = setTimeout(() => {
        this.resetGoalkeeper();
      }, 1100);
    } else {
      this.goalkeeper.group.position.x = THREE.MathUtils.lerp(this.goalkeeper.group.position.x, targetX, 0.35);
      const baseHeight = (yRatio > 0.65) ? (yRatio - 0.65) * 0.8 : 0;
      this.goalkeeper.group.position.y = THREE.MathUtils.lerp(this.goalkeeper.group.position.y, baseHeight, 0.25);
      this.goalkeeper.group.rotation.z = THREE.MathUtils.lerp(this.goalkeeper.group.rotation.z, -xRatio * 0.2, 0.2);

      if (this.goalkeeper.leftArm && this.goalkeeper.rightArm) {
        if (yRatio > 0.6) {
          this.goalkeeper.leftArm.rotation.z = Math.PI - 0.4 + (xRatio * 0.3);
          this.goalkeeper.rightArm.rotation.z = -Math.PI + 0.4 + (xRatio * 0.3);
        } else if (yRatio < 0.35) {
          this.goalkeeper.leftArm.rotation.z = 0.2 + (xRatio * 0.4);
          this.goalkeeper.rightArm.rotation.z = -0.2 + (xRatio * 0.4);
        } else {
          this.goalkeeper.leftArm.rotation.z = 0.8 + (xRatio * 0.5);
          this.goalkeeper.rightArm.rotation.z = -0.8 + (xRatio * 0.5);
        }
      }
    }
  }

  resetGoalkeeper() {
    if (!this.goalkeeper) return;
    this.goalkeeper.group.position.copy(this.gkDefaultPos);
    this.goalkeeper.group.rotation.set(0, 0, 0);
    this.goalkeeper.leftArm.rotation.set(0, 0, 0);
    this.goalkeeper.rightArm.rotation.set(0, 0, 0);
    this.isDiving = false;
    this.goalkeeper.state = 'idle';
  }

  // Çarpışma Kutusu (Top Kalecinin İçinden Geçmesin)
  getGoalkeeperGlovesBounds() {
    if (!this.goalkeeper) return null;
    const leftPos = new THREE.Vector3();
    const rightPos = new THREE.Vector3();
    this.goalkeeper.leftGlove.getWorldPosition(leftPos);
    this.goalkeeper.rightGlove.getWorldPosition(rightPos);

    const glovesMid = leftPos.clone().add(rightPos).multiplyScalar(0.5);
    const bodyCenter = this.goalkeeper.group.position.clone().add(new THREE.Vector3(0, 1.05, 0));

    const gkX = this.goalkeeper.group.position.x;
    const gkY = this.goalkeeper.group.position.y;

    let minX = gkX - 0.85;
    let maxX = gkX + 0.85;
    let minY = Math.max(0, gkY - 0.35);
    let maxY = gkY + 2.05;

    if (this.isDiving || this.goalkeeper.state === 'diving') {
      if (this.lastDiveXRatio > 0) {
        minX = Math.min(minX, gkX - 0.5);
        maxX = Math.max(maxX, gkX + 1.45);
      } else if (this.lastDiveXRatio < 0) {
        minX = Math.min(minX, gkX - 1.45);
        maxX = Math.max(maxX, gkX + 0.5);
      }

      if (this.lastDiveYRatio > 0.45) {
        maxY = Math.max(maxY, 2.5);
      } else {
        minY = 0;
        maxY = Math.max(maxY, 1.4);
      }
    }

    return {
      leftGlove: leftPos,
      rightGlove: rightPos,
      glovesMid: glovesMid,
      bodyCenter: bodyCenter,
      coverageBox: { minX, maxX, minY, maxY, minZ: -0.25, maxZ: 1.15 },
      isPlayerGK: this.isPlayerGK,
      isDiving: this.isDiving || this.goalkeeper.state === 'diving'
    };
  }

  updateIdle(time) {
    if (this.goalkeeper && !this.isDiving) {
      this.goalkeeper.group.position.y = Math.abs(Math.sin(time * 5)) * 0.05;
    }
  }

  // ==========================================================
  // CO-OP VE DEFANS YARDIMCILARI
  // ==========================================================
  createTeammate(pos, jerseyColorHex = 0x3498db, number = 9, labelText = 'PARTNER') {
    if (this.teammate) {
      this.scene.remove(this.teammate.group);
      this.teammate = null;
    }

    const group = new THREE.Group();
    const torsoData = this.createAthleticTorso(jerseyColorHex, number, labelText, false);
    group.add(torsoData.group);

    const head = this.createAthleticHead(0xffdbac, 0xe67e22, true, 0x3498db);
    head.position.y = 1.74;
    group.add(head);

    const shortsMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8 });
    const shorts = new THREE.Mesh(new THREE.BoxGeometry(0.50, 0.32, 0.27), shortsMat);
    shorts.position.y = 0.86;
    group.add(shorts);

    const lLeg = this.createAthleticLeg(true, 0xffdbac, 0xffffff, jerseyColorHex, 0x111827, 0x00ff88);
    const rLeg = this.createAthleticLeg(false, 0xffdbac, 0xffffff, jerseyColorHex, 0x111827, 0x00ff88);
    group.add(lLeg);
    group.add(rLeg);

    group.position.copy(pos);
    group.lookAt(0, 0, 0);
    this.scene.add(group);

    this.teammate = {
      group: group,
      torso: torsoData.group,
      head: head,
      leftLegGroup: lLeg,
      rightLegGroup: rLeg,
      isKicking: false,
      runCycle: 0
    };
    return this.teammate;
  }

  triggerTeammateKickAnimation(onImpactCallback) {
    this.triggerKickAnimation(onImpactCallback, this.teammate, 'R');
  }

  createKickZoneIndicator() {
    if (this.kickZoneRing) {
      this.scene.remove(this.kickZoneRing);
      this.scene.remove(this.kickZoneAura);
    }

    const ringGeo = new THREE.RingGeometry(1.6, 1.85, 32);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00f2fe,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.75
    });
    this.kickZoneRing = new THREE.Mesh(ringGeo, ringMat);
    this.kickZoneRing.position.set(0, 0.03, 0);
    this.scene.add(this.kickZoneRing);

    const auraGeo = new THREE.CircleGeometry(1.6, 32);
    auraGeo.rotateX(-Math.PI / 2);
    const auraMat = new THREE.MeshBasicMaterial({
      color: 0x00ff88,
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide
    });
    this.kickZoneAura = new THREE.Mesh(auraGeo, auraMat);
    this.kickZoneAura.position.set(0, 0.02, 0);
    this.scene.add(this.kickZoneAura);
  }

  updateKickZone(pos, canKick, kickType) {
    if (!this.kickZoneRing) return;
    this.kickZoneRing.position.set(pos.x, 0.03, pos.z);
    this.kickZoneAura.position.set(pos.x, 0.02, pos.z);
  }

  updateRunningAnimation(char, isMoving, isSprinting, dt) {
    if (!char || !char.leftLegGroup || !char.rightLegGroup) return;
    if (isMoving && !char.isKicking) {
      char.runCycle = (char.runCycle || 0) + dt * (isSprinting ? 14 : 9.5);
      const angle = Math.sin(char.runCycle) * (isSprinting ? 0.85 : 0.6);
      char.leftLegGroup.rotation.x = angle;
      char.rightLegGroup.rotation.x = -angle;
    } else if (!char.isKicking) {
      char.leftLegGroup.rotation.x = THREE.MathUtils.lerp(char.leftLegGroup.rotation.x, 0, 0.2);
      char.rightLegGroup.rotation.x = THREE.MathUtils.lerp(char.rightLegGroup.rotation.x, 0, 0.2);
    }
  }

  createDefenders(positions, colorHex = 0x1e3a8a) {
    this.clearDefenders();
    positions.forEach((pos, idx) => {
      const def = this.createSingleDefender(pos, colorHex, idx + 4, `STOPER #${idx + 4}`);
      this.defenders.push(def);
    });
  }

  clearDefenders() {
    if (this.defenders) {
      this.defenders.forEach(d => {
        if (d.group) this.scene.remove(d.group);
      });
    }
    this.defenders = [];
  }

  createSingleDefender(pos, jerseyColorHex = 0x1e3a8a, number = 4, labelText = 'DEFANS') {
    const group = new THREE.Group();
    const torsoData = this.createAthleticTorso(jerseyColorHex, number, labelText, false);
    group.add(torsoData.group);

    const head = this.createAthleticHead(0xe0ac69, 0x111111, false);
    head.position.y = 1.74;
    group.add(head);

    const shortsMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 });
    const shorts = new THREE.Mesh(new THREE.BoxGeometry(0.50, 0.32, 0.27), shortsMat);
    shorts.position.y = 0.86;
    group.add(shorts);

    const lLeg = this.createAthleticLeg(true, 0xe0ac69, jerseyColorHex, 0xffffff, 0x111827, 0xe74c3c);
    const rLeg = this.createAthleticLeg(false, 0xe0ac69, jerseyColorHex, 0xffffff, 0x111827, 0xe74c3c);
    group.add(lLeg);
    group.add(rLeg);

    group.position.copy(pos);
    group.lookAt(pos.x, 0, pos.z + 10);
    this.scene.add(group);

    return {
      group: group,
      torso: torsoData.group,
      bodyGroup: torsoData.group,
      head: head,
      leftLegGroup: lLeg,
      rightLegGroup: rLeg,
      runCycle: 0
    };
  }

  clearAll() {
    if (this.goalkeeper) this.scene.remove(this.goalkeeper.group);
    if (this.kicker) {
      this.scene.remove(this.kicker.group);
      this.kicker = null;
    }
    if (this.teammate) {
      this.scene.remove(this.teammate.group);
      this.teammate = null;
    }
    if (this.kickZoneRing) {
      this.scene.remove(this.kickZoneRing);
      this.kickZoneRing = null;
    }
    if (this.kickZoneAura) {
      this.scene.remove(this.kickZoneAura);
      this.kickZoneAura = null;
    }
    this.clearDefenders();
    this.wall.forEach(def => this.scene.remove(def.group));
    this.wall = [];
  }
}

window.PlayerModels = PlayerModels;
