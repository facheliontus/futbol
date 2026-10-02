// ==========================================================
// 3D ATLETİK OYUNCULAR, KRAMPONLAR, KALECİ VE TRİVELA SİSTEMİ (player.js)
// Gerçekçi Pro Kaleci & Atletik Futbolcu Modelleri, Anatomik Kas Hatları,
// 4mm German Latex 5 Parmaklı Kaleci Eldiveni, Dirseklik, Çizgili Tozluk & Kramponlar
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
    this.kickZoneRing = null;
    this.kickZoneAura = null;
  }

  // ==========================================================
  // 1. GERÇEKÇİ 3D KRAMPON (Boot: Ergonomik Saya, Bağcık, Çiviler & Trivela Çizgisi)
  // ==========================================================
  createBoot(isLeft = false, bootColor = 0x111827, accentColor = 0x00f2fe, bootStyle = 'boot_copa') {
    const bootGroup = new THREE.Group();

    // Mağazadan seçilen krampon stiline göre renk ve materyal
    let finalBootColor = bootColor;
    let finalAccentColor = accentColor;
    let isMetallic = false;

    if (bootStyle === 'boot_predator') {
      finalBootColor = 0x111111;
      finalAccentColor = 0xff3366; // Neon Kırmızı
    } else if (bootStyle === 'boot_mercurial') {
      finalBootColor = 0x00f2fe; // Elektrik Cyan
      finalAccentColor = 0xff007f; // Neon Pembe
    } else if (bootStyle === 'boot_phantom') {
      finalBootColor = 0x1a1a1a;
      finalAccentColor = 0xffd700; // 24K Altın
      isMetallic = true;
    } else if (bootStyle === 'boot_diamond') {
      finalBootColor = 0xf0fdf4; // Kristal Elmas
      finalAccentColor = 0x38bdf8;
      isMetallic = true;
    }

    const bootMat = new THREE.MeshStandardMaterial({
      color: finalBootColor,
      roughness: isMetallic ? 0.2 : 0.35,
      metalness: isMetallic ? 0.75 : 0.25
    });
    const accentMat = new THREE.MeshStandardMaterial({
      color: finalAccentColor,
      roughness: 0.2,
      metalness: 0.7
    });
    const laceMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7 });
    const studMat = new THREE.MeshStandardMaterial({ color: isMetallic ? 0xffd700 : 0xd4af37, roughness: 0.25, metalness: 0.85 });

    // 1. Saya / Gövde (Ergonomik Kavisli Krampon Gövdesi)
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
  createAthleticHead(skinColorHex = 0xffdbac, hairColorHex = 0x1a1a1a, hasHeadband = true, headbandHex = 0xffffff, hairStyle = 'hair_fade') {
    const headGroup = new THREE.Group();
    const skinMat = new THREE.MeshStandardMaterial({ color: skinColorHex, roughness: 0.65 });

    let finalHairColor = hairColorHex;
    let actualHasHeadband = hasHeadband;
    let actualHeadbandColor = headbandHex;

    if (hairStyle === 'hair_platinum') {
      finalHairColor = 0xfef08a; // Platin Sarı
    } else if (hairStyle === 'hair_buzz') {
      finalHairColor = 0x222222;
      actualHasHeadband = false;
    } else if (hairStyle === 'hair_samurai') {
      finalHairColor = 0x111111;
      actualHasHeadband = true;
      actualHeadbandColor = 0xe67e22; // Samuray Turuncu Bandı
    } else if (hairStyle === 'hair_afro') {
      finalHairColor = 0x1a110a;
      actualHasHeadband = false;
    } else if (hairStyle === 'hair_goldcrown') {
      finalHairColor = 0xf1c40f;
      actualHasHeadband = false;
    }

    const hairMat = new THREE.MeshStandardMaterial({ color: finalHairColor, roughness: 0.85 });
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

    // Saç Tasarımı
    if (hairStyle === 'hair_afro') {
      const afro = new THREE.Mesh(new THREE.SphereGeometry(0.23, 16, 16), hairMat);
      afro.position.set(0, 0.08, -0.02);
      headGroup.add(afro);
    } else if (hairStyle === 'hair_buzz') {
      const buzz = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.42), hairMat);
      buzz.position.set(0, 0.045, -0.01);
      headGroup.add(buzz);
    } else if (hairStyle === 'hair_samurai') {
      const hairBase = new THREE.Mesh(new THREE.SphereGeometry(0.185, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.46), hairMat);
      hairBase.position.set(0, 0.045, -0.01);
      headGroup.add(hairBase);
      // Samuray Topuzu
      const topBun = new THREE.Mesh(new THREE.SphereGeometry(0.065, 12, 12), hairMat);
      topBun.position.set(0, 0.22, -0.08);
      headGroup.add(topBun);
    } else if (hairStyle === 'hair_goldcrown') {
      const hair = new THREE.Mesh(new THREE.SphereGeometry(0.185, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.48), hairMat);
      hair.position.set(0, 0.045, -0.01);
      headGroup.add(hair);
      // Altın Taç
      const crownMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.85, roughness: 0.2 });
      const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.16, 0.05, 16), crownMat);
      crown.position.set(0, 0.19, 0);
      headGroup.add(crown);
    } else {
      // Standart Fade
      const hair = new THREE.Mesh(new THREE.SphereGeometry(0.185, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.48), hairMat);
      hair.position.set(0, 0.045, -0.01);
      headGroup.add(hair);
    }

    // Sporcu Kafa Bandı (Headband / Bandana)
    if (actualHasHeadband) {
      const bandMat = new THREE.MeshStandardMaterial({ color: actualHeadbandColor, roughness: 0.6 });
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
  // 3. V-TAPER ATLETİK GÖVDE & HD FORMA DOKUSU (ÖN VE ARKA AYRI)
  // Kaleci için Özel Yüksek Görünürlüklü Neon Shard Forması
  // ==========================================================
  createAthleticTorso(jerseyColorHex, number = 10, name = 'YILDIZ', isGK = false, kitStyle = 'kit_club') {
    const torsoGroup = new THREE.Group();

    let basePrimary = '#' + new THREE.Color(jerseyColorHex).getHexString();
    let sponsorText = isGK ? "SAFE HANDS" : "PRO FOOTBALL";
    let subText = isGK ? "★ PRO GOALKEEPER ★" : "— ULTRA 3D EDITION —";
    let isSpecialKit = false;

    if (isGK) {
      basePrimary = '#00ff88'; // Parlak Neon Yeşil Kaleci Rengi
    } else if (kitStyle === 'kit_blackgold') {
      basePrimary = '#0d1117'; // Gece Siyahı
      isSpecialKit = true;
    } else if (kitStyle === 'kit_cyber') {
      basePrimary = '#070d18'; // Cyber Koyu
      sponsorText = "CYBER STRIKE 2050";
      subText = "⚡ QUANTUM SPEED ⚡";
      isSpecialKit = true;
    } else if (kitStyle === 'kit_retro') {
      basePrimary = '#b81414';
      sponsorText = "VINTAGE CLASSIC";
      subText = "★ 1990 HERITAGE ★";
      isSpecialKit = true;
    }

    // 1. ÖN YÜZ DOKUSU (512x512 Ultra Net Çözünürlük)
    const frontCanvas = document.createElement('canvas');
    frontCanvas.width = 512;
    frontCanvas.height = 512;
    const fctx = frontCanvas.getContext('2d');
    fctx.fillStyle = basePrimary;
    fctx.fillRect(0, 0, 512, 512);

    if (isGK) {
      // Kaleciye Özel Dinamik Geometrik Kamuflaj / Shard Deseni
      fctx.fillStyle = 'rgba(0, 242, 254, 0.35)';
      for (let i = 0; i < 8; i++) {
        fctx.beginPath();
        fctx.moveTo(i * 64, 0);
        fctx.lineTo(i * 64 + 40, 512);
        fctx.lineTo(i * 64 + 75, 512);
        fctx.lineTo(i * 64 + 35, 0);
        fctx.fill();
      }
      fctx.fillStyle = 'rgba(15, 23, 42, 0.25)';
      for (let i = 0; i < 512; i += 16) {
        fctx.fillRect(0, i, 512, 4);
      }
    } else if (kitStyle === 'kit_retro') {
      fctx.fillStyle = '#ffffff';
      for (let x = 40; x < 512; x += 110) {
        fctx.fillRect(x, 0, 52, 512);
      }
    } else if (kitStyle === 'kit_blackgold') {
      fctx.fillStyle = 'rgba(241, 196, 15, 0.18)';
      fctx.fillRect(200, 0, 112, 512);
    } else {
      // Modern Sporcu Nefes Alan Mikro-Petek Kumaş Dokusu
      fctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      for (let y = 0; y < 512; y += 10) {
        fctx.fillRect(0, y, 512, 4);
      }
    }

    // Yaka & V-Neck Detayı
    fctx.fillStyle = isGK ? '#0a1424' : '#ffffff';
    fctx.beginPath();
    fctx.moveTo(216, 0);
    fctx.lineTo(296, 0);
    fctx.lineTo(256, 75);
    fctx.closePath();
    fctx.fill();

    // Sol Göğüste Kulüp / Kaleci Arması
    const crestColor = isGK ? '#0a1424' : (isSpecialKit ? '#f1c40f' : '#ffffff');
    fctx.fillStyle = crestColor;
    fctx.beginPath();
    fctx.arc(130, 130, 42, 0, Math.PI * 2);
    fctx.fill();
    fctx.fillStyle = '#0a1424';
    fctx.beginPath();
    fctx.arc(130, 130, 36, 0, Math.PI * 2);
    fctx.fill();
    fctx.fillStyle = isGK ? '#00ff88' : '#f1c40f';
    fctx.font = 'bold 34px "Segoe UI", sans-serif';
    fctx.textAlign = 'center';
    fctx.textBaseline = 'middle';
    fctx.fillText(isGK ? "🧤" : "⚽", 130, 132);

    // Göğüs Sponsor Bannerı
    fctx.fillStyle = isGK ? '#0a1424' : ((kitStyle === 'kit_blackgold') ? '#f1c40f' : ((kitStyle === 'kit_cyber') ? '#00f2fe' : '#ffffff'));
    fctx.font = '900 42px "Segoe UI", sans-serif';
    fctx.textAlign = 'center';
    fctx.fillText(sponsorText, 256, 290);
    fctx.fillStyle = isGK ? '#0f172a' : ((kitStyle === 'kit_cyber') ? '#ff007f' : '#cbd5e1');
    fctx.font = 'bold 20px "Segoe UI", sans-serif';
    fctx.fillText(subText, 256, 338);

    // 2. ARKA YÜZ DOKUSU (Oyuncu İsmi ve Büyük Forma Numarası)
    const backCanvas = document.createElement('canvas');
    backCanvas.width = 512;
    backCanvas.height = 512;
    const bctx = backCanvas.getContext('2d');
    bctx.fillStyle = basePrimary;
    bctx.fillRect(0, 0, 512, 512);

    if (isGK) {
      bctx.fillStyle = 'rgba(15, 23, 42, 0.2)';
      for (let i = 0; i < 512; i += 16) {
        bctx.fillRect(0, i, 512, 4);
      }
    } else if (kitStyle === 'kit_retro') {
      bctx.fillStyle = '#ffffff';
      for (let x = 40; x < 512; x += 110) {
        bctx.fillRect(x, 0, 52, 512);
      }
    }

    // Oyuncu İsmi
    bctx.fillStyle = isGK ? '#0a1424' : ((kitStyle === 'kit_blackgold') ? '#f1c40f' : '#ffffff');
    bctx.font = '900 44px "Segoe UI", sans-serif';
    bctx.textAlign = 'center';
    bctx.fillText(name.toUpperCase(), 256, 120);

    // Büyük Forma Numarası (Gölge ve 3D Kontur Efektli)
    bctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    bctx.font = '900 210px "Segoe UI", sans-serif';
    bctx.fillText(number.toString(), 262, 345);

    bctx.fillStyle = isGK ? '#0a1424' : ((kitStyle === 'kit_blackgold') ? '#f1c40f' : '#ffffff');
    bctx.fillText(number.toString(), 256, 340);

    const frontTex = new THREE.CanvasTexture(frontCanvas);
    const backTex = new THREE.CanvasTexture(backCanvas);

    const sideMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(basePrimary),
      roughness: 0.5,
      metalness: 0.15
    });
    const frontMat = new THREE.MeshStandardMaterial({ map: frontTex, roughness: 0.5, metalness: 0.15 });
    const backMat = new THREE.MeshStandardMaterial({ map: backTex, roughness: 0.5, metalness: 0.15 });

    // Üst Göğüs Plakası (V-Taper Geniş Göğüs)
    const upperChestGeo = new THREE.BoxGeometry(0.56, 0.38, 0.28);
    const chestMaterials = [sideMat, sideMat, sideMat, sideMat, frontMat, backMat];
    const upperChest = new THREE.Mesh(upperChestGeo, chestMaterials);
    upperChest.position.y = 1.34;
    upperChest.castShadow = true;
    torsoGroup.add(upperChest);

    // Omuz Başları (Deltoid Caps)
    const deltoidGeo = new THREE.SphereGeometry(0.095, 14, 14);
    const lDelt = new THREE.Mesh(deltoidGeo, sideMat);
    lDelt.position.set(-0.30, 1.45, 0);
    torsoGroup.add(lDelt);
    const rDelt = new THREE.Mesh(deltoidGeo, sideMat);
    rDelt.position.set(0.30, 1.45, 0);
    torsoGroup.add(rDelt);

    // Daralan Atletik Karın / Bel (Tapered Waist)
    const waistGeo = new THREE.CylinderGeometry(0.24, 0.21, 0.28, 14);
    const waist = new THREE.Mesh(waistGeo, sideMat);
    waist.position.y = 1.04;
    waist.castShadow = true;
    torsoGroup.add(waist);

    return { group: torsoGroup, mainMesh: upperChest };
  }

  // ==========================================================
  // 4. ATLETİK BACAK, ÇİZGİLİ TOZLUK, AYAK BİLEK BANDAJI & 3D KRAMPON
  // ==========================================================
  createAthleticLeg(isLeft = true, skinColorHex = 0xffdbac, sockColorHex = 0xffffff, stripeColorHex = 0xe74c3c, bootColorHex = 0x111827, bootAccentHex = 0x00f2fe, bootStyle = 'boot_copa') {
    const legGroup = new THREE.Group();
    const hipX = isLeft ? -0.17 : 0.17;
    legGroup.position.set(hipX, 0.75, 0);

    const skinMat = new THREE.MeshStandardMaterial({ color: skinColorHex, roughness: 0.65 });
    const sockMat = new THREE.MeshStandardMaterial({ color: sockColorHex, roughness: 0.75 });
    const stripeMat = new THREE.MeshStandardMaterial({ color: stripeColorHex, roughness: 0.6 });
    const tapeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.85 }); // Beyaz bilek bandajı

    // Üst Uyluk / Kuadriseps Kası (Thigh)
    const thighGeo = new THREE.CylinderGeometry(0.098, 0.082, 0.36, 14);
    const thigh = new THREE.Mesh(thighGeo, skinMat);
    thigh.position.y = -0.18;
    thigh.castShadow = true;
    legGroup.add(thigh);

    // Diz Kapağı (Anatomik Patella)
    const kneeGeo = new THREE.SphereGeometry(0.076, 12, 12);
    const knee = new THREE.Mesh(kneeGeo, skinMat);
    knee.position.set(0, -0.36, 0.018);
    legGroup.add(knee);

    // Alt Bacak ve Çizgili Tozluk (Gastroknemius Kalf Kası)
    const calfGeo = new THREE.CylinderGeometry(0.085, 0.072, 0.38, 14);
    const calf = new THREE.Mesh(calfGeo, sockMat);
    calf.position.y = -0.56;
    calf.castShadow = true;
    legGroup.add(calf);

    // Tozluk Çift Çizgisi
    const stripe1 = new THREE.Mesh(new THREE.CylinderGeometry(0.087, 0.087, 0.028, 14), stripeMat);
    stripe1.position.y = -0.42;
    legGroup.add(stripe1);
    const stripe2 = new THREE.Mesh(new THREE.CylinderGeometry(0.087, 0.087, 0.024, 14), stripeMat);
    stripe2.position.y = -0.47;
    legGroup.add(stripe2);

    // Modern Profesyonel Ayak Bileği Beyaz Bandajı (Bellingham / Neymar Ankle Grip Tape)
    const ankleTape = new THREE.Mesh(new THREE.CylinderGeometry(0.076, 0.076, 0.055, 14), tapeMat);
    ankleTape.position.y = -0.68;
    legGroup.add(ankleTape);

    // 3D Detaylı Krampon
    const boot = this.createBoot(isLeft, bootColorHex, bootAccentHex, bootStyle);
    boot.position.set(0, -0.74, 0.04);
    legGroup.add(boot);

    return legGroup;
  }

  // ==========================================================
  // 5. PROFESYONEL KALECİ ELDİVENİ (4mm German Latex, 5 Eklemli Parmak,
  //    Kabartmalı Yumruk Bölgesi / Punch Zone ve Neopren Bilek Bandı)
  // ==========================================================
  createGoalkeeperGlove(isLeft = true, gloveColorHex = 0x00ff88, gloveStyle = 'gloves_standard') {
    const gloveGroup = new THREE.Group();

    let palmColor = gloveColorHex;
    let punchColor = 0x00f2fe;
    let backColor = 0x0f172a;
    let strapColor = 0xffffff;
    let isMetallicGlove = false;

    if (gloveStyle === 'gloves_predator_pro') {
      palmColor = 0xff1744;
      punchColor = 0x111111;
      backColor = 0x111111;
      strapColor = 0xff1744;
    } else if (gloveStyle === 'gloves_vapor_grip') {
      palmColor = 0xf97316;
      punchColor = 0xffffff;
      backColor = 0x1e293b;
      strapColor = 0xf97316;
    } else if (gloveStyle === 'gloves_reusch_attrakt') {
      palmColor = 0x38bdf8;
      punchColor = 0x0284c7;
      backColor = 0x0f172a;
      strapColor = 0x38bdf8;
    } else if (gloveStyle === 'gloves_titan_gold') {
      palmColor = 0xf1c40f;
      punchColor = 0xffd700;
      backColor = 0x1a1a1a;
      strapColor = 0xf1c40f;
      isMetallicGlove = true;
    } else if (gloveStyle === 'gloves_cyber_reflex') {
      palmColor = 0x00ff88;
      punchColor = 0x00f2fe;
      backColor = 0x050510;
      strapColor = 0x00ff88;
      isMetallicGlove = true;
    }

    // 4mm German Contact Latex (Yüksek sürtünmeli kavrama yüzeyi)
    const latexPalmMat = new THREE.MeshStandardMaterial({
      color: palmColor,
      roughness: isMetallicGlove ? 0.2 : 0.25,
      metalness: isMetallicGlove ? 0.65 : 0.15
    });

    // Arka El Koruyucu Plaka & Silikon Punch Zone
    const backhandMat = new THREE.MeshStandardMaterial({
      color: backColor,
      roughness: 0.45,
      metalness: 0.35
    });
    const punchZoneMat = new THREE.MeshStandardMaterial({
      color: punchColor,
      roughness: 0.2,
      metalness: 0.6
    });
    const strapMat = new THREE.MeshStandardMaterial({
      color: strapColor,
      roughness: 0.6
    });

    // 1. Ana Avuç İçi Lateks Taban (Palm Base)
    const palmGeo = new THREE.BoxGeometry(0.14, 0.14, 0.065);
    const palm = new THREE.Mesh(palmGeo, latexPalmMat);
    palm.castShadow = true;
    gloveGroup.add(palm);

    // 2. Arka El Koruyucu Ped & Kabartmalı Yumruk Alanı (Punch Zone)
    const backGeo = new THREE.BoxGeometry(0.13, 0.13, 0.035);
    const back = new THREE.Mesh(backGeo, backhandMat);
    back.position.set(0, 0, -0.04);
    gloveGroup.add(back);

    // 3D Silikon Punch Ridges (Topu yumruklama kanalları)
    for (let r = -0.04; r <= 0.04; r += 0.025) {
      const ridgeGeo = new THREE.BoxGeometry(0.11, 0.012, 0.015);
      const ridge = new THREE.Mesh(ridgeGeo, punchZoneMat);
      ridge.position.set(0, r, -0.06);
      gloveGroup.add(ridge);
    }

    // 3. DÖRT AYRI ANATOMİK PARMAK (İşaret, Orta, Yüzük, Serçe - Roll Finger Cut)
    const fingerWidth = 0.026;
    const fingerThickness = 0.045;
    const fingerSpacing = 0.031;
    const fingerHeights = [0.082, 0.095, 0.088, 0.074]; // Serçe, Yüzük, Orta, İşaret

    fingerHeights.forEach((fHeight, fIdx) => {
      const fX = (fIdx - 1.5) * fingerSpacing;
      // Lateks parmak silindiri
      const fGeo = new THREE.CylinderGeometry(fingerWidth / 2, fingerWidth / 2, fHeight, 10);
      const finger = new THREE.Mesh(fGeo, latexPalmMat);
      finger.position.set(fX, 0.07 + fHeight / 2, 0.005);
      gloveGroup.add(finger);

      // Parmak ucu kubbesi (Fingertip dome)
      const capGeo = new THREE.SphereGeometry(fingerWidth / 2, 8, 8);
      const cap = new THREE.Mesh(capGeo, latexPalmMat);
      cap.position.set(fX, 0.07 + fHeight, 0.005);
      gloveGroup.add(cap);
    });

    // 4. BAŞ PARMAK (Lateks Kaplı Eğimli Başparmak)
    const thumbGeo = new THREE.BoxGeometry(0.045, 0.085, 0.05);
    const thumb = new THREE.Mesh(thumbGeo, latexPalmMat);
    const thumbX = isLeft ? 0.085 : -0.085;
    thumb.position.set(thumbX, 0.02, 0.02);
    thumb.rotation.z = isLeft ? -0.35 : 0.35;
    gloveGroup.add(thumb);

    // 5. NEOPREN BİLEKLİK & ÇİFT SARMALLI AYARLANABİLİR BANT (Wrist Bandage)
    const wristGeo = new THREE.CylinderGeometry(0.078, 0.078, 0.065, 14);
    const wrist = new THREE.Mesh(wristGeo, strapMat);
    wrist.position.y = -0.095;
    gloveGroup.add(wrist);

    return gloveGroup;
  }

  // ==========================================================
  // KALECİ 3D MODELİ OLUŞTURMA (Modern Atletik Dev Kaleci - 1.96m Heybetli Duruş)
  // ==========================================================
  createGoalkeeper(colorHex = 0x00ff88, gloveStyle = null, kitStyle = 'kit_club') {
    if (this.goalkeeper) {
      this.scene.remove(this.goalkeeper.group);
      this.goalkeeper = null;
    }

    const activeGloveStyle = gloveStyle || ((window.careerManager && window.careerManager.player) ? window.careerManager.player.equippedGloves : 'gloves_standard');

    const group = new THREE.Group();
    const visualGroup = new THREE.Group();
    // Kaleci daha uzun boylu ve geniş kanat açıklığına sahiptir (Courtois / Neuer oranı)
    visualGroup.scale.set(1.05, 1.06, 1.05);
    group.add(visualGroup);

    // 1. Atletik V-Taper Torso (Kaleci Forması)
    const torsoData = this.createAthleticTorso(colorHex, 1, 'KALECİ', true, kitStyle);
    visualGroup.add(torsoData.group);

    // 2. Anatomik Kafa & Saç Bandı
    const head = this.createAthleticHead(0xffdbac, 0x2c1d11, true, 0x111111, 'hair_fade');
    head.position.y = 1.74;
    visualGroup.add(head);

    // 3. Kaleci Şortu & Yan Darbe Koruyucu Pedler (Hip Crash Pads)
    const shortsMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 });
    const padMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 });

    const shorts = new THREE.Mesh(new THREE.BoxGeometry(0.53, 0.32, 0.28), shortsMat);
    shorts.position.y = 0.86;
    shorts.castShadow = true;
    visualGroup.add(shorts);

    // Kalça Darbe Yastıkları
    const lHipPad = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.18, 0.16), padMat);
    lHipPad.position.set(-0.275, 0.86, 0);
    visualGroup.add(lHipPad);
    const rHipPad = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.18, 0.16), padMat);
    rHipPad.position.set(0.275, 0.86, 0);
    visualGroup.add(rHipPad);

    // 4. Bacaklar, Çizgili Tozluklar ve Kramponlar
    const leftLeg = this.createAthleticLeg(true, 0xffdbac, 0x0f172a, colorHex, 0x111827, 0x00ff88);
    const rightLeg = this.createAthleticLeg(false, 0xffdbac, 0x0f172a, colorHex, 0x111827, 0x00ff88);
    visualGroup.add(leftLeg);
    visualGroup.add(rightLeg);

    // 5. Uzun Kollu Forma & Dirsek Koruyucu Pedler (Elbow Pads)
    const armMat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.5 });
    const armGeo = new THREE.CylinderGeometry(0.076, 0.066, 0.52, 14);
    const elbowPadGeo = new THREE.BoxGeometry(0.09, 0.11, 0.07);

    // Sol Kol
    const leftArmGroup = new THREE.Group();
    leftArmGroup.position.set(-0.35, 1.45, 0);
    const lArm = new THREE.Mesh(armGeo, armMat);
    lArm.position.y = -0.24;
    leftArmGroup.add(lArm);

    // Dirseklik
    const lElbow = new THREE.Mesh(elbowPadGeo, padMat);
    lElbow.position.set(0, -0.24, -0.03);
    leftArmGroup.add(lElbow);

    const leftGlove = this.createGoalkeeperGlove(true, 0x00ff88, activeGloveStyle);
    leftGlove.position.y = -0.55;
    leftArmGroup.add(leftGlove);
    visualGroup.add(leftArmGroup);

    // Sağ Kol
    const rightArmGroup = new THREE.Group();
    rightArmGroup.position.set(0.35, 1.45, 0);
    const rArm = new THREE.Mesh(armGeo, armMat);
    rArm.position.y = -0.24;
    rightArmGroup.add(rArm);

    const rElbow = new THREE.Mesh(elbowPadGeo, padMat);
    rElbow.position.set(0, -0.24, -0.03);
    rightArmGroup.add(rElbow);

    const rightGlove = this.createGoalkeeperGlove(false, 0x00ff88, activeGloveStyle);
    rightGlove.position.y = -0.55;
    rightArmGroup.add(rightGlove);
    visualGroup.add(rightArmGroup);

    // ==========================================================
    // DOĞAL KALECİ HAZIR DURUŞU (Natural Goalkeeper Ready Stance)
    // Kaleci dimdik durmaz! Dizler hafif kırık, gövde öne eğik, kollar açık ve hazır!
    // ==========================================================
    torsoData.group.rotation.x = 0.18; // Gövde topa doğru hafif eğik
    head.rotation.x = -0.15; // Baş topa kilitli

    leftLeg.rotation.x = -0.12; // Dizler kırık
    rightLeg.rotation.x = -0.12;

    leftArmGroup.rotation.set(0.42, 0, -0.45); // Kollar iki yana açık, avuçlar önde
    rightArmGroup.rotation.set(0.42, 0, 0.45);

    group.position.copy(this.gkDefaultPos);
    group.lookAt(0, 0.11, 20); // Forvete doğru bak
    this.scene.add(group);

    this.goalkeeper = {
      group: group,
      visualGroup: visualGroup,
      torso: torsoData.group,
      head: head,
      leftLeg: leftLeg,
      rightLeg: rightLeg,
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
  createKicker(kickerPos, jerseyColorHex = 0xe74c3c, number = 10, name = 'YILDIZ', preferredFoot = 'R', cosmetics = {}) {
    if (this.kicker) {
      this.scene.remove(this.kicker.group);
      this.kicker = null;
    }

    const hairStyle = cosmetics.hair || 'hair_fade';
    const bootStyle = cosmetics.boot || 'boot_copa';
    const kitStyle = cosmetics.kit || 'kit_club';

    const group = new THREE.Group();
    const visualGroup = new THREE.Group();
    group.add(visualGroup);

    // 1. Atletik V-Taper Torso & HD Forma
    const torsoData = this.createAthleticTorso(jerseyColorHex, number, name, false, kitStyle);
    visualGroup.add(torsoData.group);

    // 2. Anatomik Detaylı Kafa, Yüz ve Saç
    const head = this.createAthleticHead(0xffdbac, 0x111111, true, 0xffffff, hairStyle);
    head.position.y = 1.74;
    visualGroup.add(head);

    // 3. Atletik Şort
    const shortsMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8 });
    const shorts = new THREE.Mesh(new THREE.BoxGeometry(0.50, 0.32, 0.27), shortsMat);
    shorts.position.y = 0.86;
    shorts.castShadow = true;
    visualGroup.add(shorts);

    // 4. Bacaklar, Çizgili Tozluklar ve Özel Kramponlar
    const bootAccent = (preferredFoot === 'R') ? 0x00f2fe : 0xffd700;
    const leftLeg = this.createAthleticLeg(true, 0xffdbac, 0xffffff, jerseyColorHex, 0x111827, bootAccent, bootStyle);
    const rightLeg = this.createAthleticLeg(false, 0xffdbac, 0xffffff, jerseyColorHex, 0x111827, bootAccent, bootStyle);
    visualGroup.add(leftLeg);
    visualGroup.add(rightLeg);

    // 5. Kollar & Sporcu Bilekliği
    const armMat = new THREE.MeshStandardMaterial({ color: jerseyColorHex, roughness: 0.5 });
    const wristbandMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 });
    const armGeo = new THREE.CylinderGeometry(0.07, 0.06, 0.52, 10);

    const leftArmGroup = new THREE.Group();
    leftArmGroup.position.set(-0.34, 1.45, 0);
    const lArm = new THREE.Mesh(armGeo, armMat);
    lArm.position.y = -0.24;
    leftArmGroup.add(lArm);
    visualGroup.add(leftArmGroup);

    const rightArmGroup = new THREE.Group();
    rightArmGroup.position.set(0.34, 1.45, 0);
    const rArm = new THREE.Mesh(armGeo, armMat);
    rArm.position.y = -0.24;
    rightArmGroup.add(rArm);

    // Sağ Bilekte Havlu Sporcu Bandajı
    const rWristband = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.068, 0.07, 12), wristbandMat);
    rWristband.position.y = -0.42;
    rightArmGroup.add(rWristband);
    visualGroup.add(rightArmGroup);

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

    group.position.copy(kickerPos);
    // KALEYE DOĞRU BAK (Yüzü kaleye, sırtı arkadaki kameraya bakar!)
    const initAngle = Math.atan2(-kickerPos.x, -kickerPos.z);
    group.rotation.set(0, initAngle, 0);

    this.scene.add(group);
    this.kicker = {
      group: group,
      visualGroup: visualGroup,
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
    if (!char) {
      if (typeof onImpactCallback === 'function') onImpactCallback();
      return;
    }
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
        if (progress >= 0.45 && onImpactCallback) {
          try { onImpactCallback(); } catch(err) { console.error("Kick callback error:", err); }
          onImpactCallback = null;
        }
      } else if (t < 1.0) {
        // Takip salınımı (Follow-through)
        const progress = (t - 0.68) / 0.32;
        kickLeg.rotation.x = 1.4 * (1 - progress);
        oppositeArm.rotation.x = 0.7 * (1 - progress);
      } else {
        clearInterval(animInterval);
        if (onImpactCallback) {
          try { onImpactCallback(); } catch(err) { console.error("Kick safety callback:", err); }
          onImpactCallback = null;
        }
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
  triggerTrivelaAnimation(arg1, arg2, arg3) {
    let onImpactCallback = null;
    let targetChar = null;
    let preferredFoot = 'R';

    if (typeof arg1 === 'function') {
      onImpactCallback = arg1;
      targetChar = arg2 || null;
      preferredFoot = arg3 || 'R';
    } else if (typeof arg2 === 'function') {
      preferredFoot = arg1 || 'R';
      onImpactCallback = arg2;
      targetChar = arg3 || null;
    } else {
      preferredFoot = arg1 || 'R';
      targetChar = arg2 || null;
      onImpactCallback = (typeof arg3 === 'function') ? arg3 : null;
    }

    const char = targetChar || this.kicker;
    if (!char) {
      if (typeof onImpactCallback === 'function') onImpactCallback();
      return;
    }
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
        if (p >= 0.45 && onImpactCallback) {
          try { onImpactCallback(); } catch(err) { console.error("Trivela onImpact error:", err); }
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
        if (onImpactCallback) {
          try { onImpactCallback(); } catch(err) { console.error("Trivela safety callback:", err); }
          onImpactCallback = null;
        }
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
    if (!char) {
      if (typeof onImpactCallback === 'function') onImpactCallback();
      return;
    }
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
        if (p >= 0.45 && onImpactCallback) {
          try { onImpactCallback(); } catch(e) {}
          onImpactCallback = null;
        }
      } else if (t < 1.05) {
        const p = (t - 0.75) / 0.3;
        char.group.position.y = 0.11 + 0.65 * (1 - p);
        char.rightLegGroup.rotation.x = 1.4 * (1 - p);
      } else {
        clearInterval(interval);
        if (onImpactCallback) {
          try { onImpactCallback(); } catch(e) {}
          onImpactCallback = null;
        }
        char.group.position.y = 0.11;
        char.rightLegGroup.rotation.x = 0;
        char.isKicking = false;
      }
    }, 20);
  }

  // KAFA VURUŞU ANİMASYONU
  triggerHeaderAnimation(onImpactCallback, targetChar = null) {
    const char = targetChar || this.kicker;
    if (!char) {
      if (typeof onImpactCallback === 'function') onImpactCallback();
      return;
    }
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
          try { onImpactCallback(); } catch(e) {}
          onImpactCallback = null;
        }
      } else if (t < 1.05) {
        const p = (t - 0.75) / 0.3;
        char.group.position.y = 0.11 + 0.75 * (1 - p);
        char.head.rotation.x = 0.55 * (1 - p);
      } else {
        clearInterval(interval);
        if (onImpactCallback) {
          try { onImpactCallback(); } catch(e) {}
          onImpactCallback = null;
        }
        char.group.position.y = 0.11;
        char.head.rotation.x = 0;
        char.isKicking = false;
      }
    }, 20);
  }

  // ==========================================================
  // SAVUNMA BARAJI OLUŞTURMA (Modern Atletik Baraj)
  // ==========================================================
  createWall(wallPos, count = 4, jerseyColorHex = 0x2980b9, ballPos = null) {
    this.wall.forEach(def => this.scene.remove(def.group));
    this.wall = [];

    const wallZ = Math.max(5.8, wallPos.z || 12);
    const wallX = wallPos.x || 0;
    const wallCenter = new THREE.Vector3(wallX, 0.11, wallZ);

    const dirToGoal = new THREE.Vector3(0, 0, 0).sub(wallCenter).normalize();
    const perpDir = new THREE.Vector3(-dirToGoal.z, 0, dirToGoal.x).normalize();
    const lookTarget = ballPos ? ballPos : new THREE.Vector3(wallX, 0.11, wallZ + 9.15);

    for (let i = 0; i < count; i++) {
      const defGroup = new THREE.Group();
      const visualGroup = new THREE.Group();
      defGroup.add(visualGroup);

      const offset = (i - (count - 1) / 2) * 0.76;
      const pos = wallCenter.clone().add(perpDir.clone().multiplyScalar(offset));

      const torsoData = this.createAthleticTorso(jerseyColorHex, i + 3, 'BARAJ', false);
      visualGroup.add(torsoData.group);

      const head = this.createAthleticHead(0xe0ac69, 0x111111, false);
      head.position.y = 1.74;
      visualGroup.add(head);

      const shortsMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 });
      const shorts = new THREE.Mesh(new THREE.BoxGeometry(0.50, 0.32, 0.27), shortsMat);
      shorts.position.y = 0.86;
      shorts.castShadow = true;
      visualGroup.add(shorts);

      const lLeg = this.createAthleticLeg(true, 0xe0ac69, jerseyColorHex, 0xffffff, 0x111827, 0xf1c40f);
      const rLeg = this.createAthleticLeg(false, 0xe0ac69, jerseyColorHex, 0xffffff, 0x111827, 0xf1c40f);
      visualGroup.add(lLeg);
      visualGroup.add(rLeg);

      // Baraj oyuncuları kasıklarını korur
      const armMat = new THREE.MeshStandardMaterial({ color: jerseyColorHex, roughness: 0.5 });
      const armGeo = new THREE.CylinderGeometry(0.065, 0.055, 0.48, 10);
      const lArm = new THREE.Mesh(armGeo, armMat);
      lArm.position.set(-0.16, 1.05, 0.16);
      lArm.rotation.set(0.6, 0.3, -0.4);
      visualGroup.add(lArm);
      const rArm = new THREE.Mesh(armGeo, armMat);
      rArm.position.set(0.16, 1.05, 0.16);
      rArm.rotation.set(0.6, -0.3, 0.4);
      visualGroup.add(rArm);

      defGroup.position.copy(pos);
      const wallAngle = Math.atan2(lookTarget.x - pos.x, lookTarget.z - pos.z);
      defGroup.rotation.set(0, wallAngle, 0);

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
  // KALECİ AI DALIŞ & UÇUŞ ANİMASYONU (Gelişmiş 90 Uçuşu & Yerden Kapanma)
  // ==========================================================
  triggerGoalkeeperDive(targetX, targetY, targetZ, travelTime = 0.8) {
    if (!this.goalkeeper) return;
    this.isDiving = true;
    this.goalkeeper.state = 'diving';

    const startPos = this.goalkeeper.group.position.clone();
    const clampedTargetX = THREE.MathUtils.clamp(targetX * 0.72, -2.3, 2.3);
    const clampedTargetY = THREE.MathUtils.clamp(targetY * 0.85, 0.35, 2.15);

    let startTime = performance.now();
    const duration = Math.max(0.72, travelTime) * 1000;

    const diveLoop = () => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(1, elapsed / duration);
      const ease = 1 - (1 - progress) * (1 - progress);

      this.goalkeeper.group.position.x = THREE.MathUtils.lerp(startPos.x, clampedTargetX, ease);
      this.goalkeeper.group.position.y = THREE.MathUtils.lerp(0, clampedTargetY, Math.sin(progress * Math.PI));

      const isFlyingHigh = (clampedTargetY > 1.35);
      const rollAngle = (clampedTargetX > 0 ? -1 : 1) * Math.sin(progress * Math.PI) * (isFlyingHigh ? 1.25 : 1.45);
      this.goalkeeper.group.rotation.z = rollAngle;

      if (this.goalkeeper.leftArm && this.goalkeeper.rightArm) {
        if (clampedTargetX < 0) {
          this.goalkeeper.leftArm.rotation.set(-0.2, 0, -1.8);
          this.goalkeeper.rightArm.rotation.set(-0.2, 0, 0.4);
        } else {
          this.goalkeeper.rightArm.rotation.set(-0.2, 0, 1.8);
          this.goalkeeper.leftArm.rotation.set(-0.2, 0, -0.4);
        }
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
  // MANUEL KALECİ KONTROLÜ (İnsan Kaleci Refleks & Uçuş)
  // ==========================================================
  setGoalkeeperManualPosition(xRatio, yRatio, isAction = false) {
    if (!this.goalkeeper) return;
    this.isPlayerGK = true;

    const targetX = xRatio * 3.2;

    if (isAction) {
      this.isDiving = true;
      this.goalkeeper.state = 'diving';
      this.lastDiveXRatio = xRatio;
      this.lastDiveYRatio = yRatio;

      if (Math.abs(xRatio) > 0.15) {
        if (yRatio >= 0.45) {
          // 90'a Uçuş (Top Corner Flying Dive)
          const targetY = 1.75;
          this.goalkeeper.group.position.x = THREE.MathUtils.lerp(this.goalkeeper.group.position.x, targetX, 0.55);
          this.goalkeeper.group.position.y = THREE.MathUtils.lerp(this.goalkeeper.group.position.y, targetY, 0.55);
          this.goalkeeper.group.rotation.z = THREE.MathUtils.lerp(this.goalkeeper.group.rotation.z, -Math.sign(xRatio) * 1.25, 0.5);

          if (this.goalkeeper.leftArm && this.goalkeeper.rightArm) {
            this.goalkeeper.leftArm.rotation.z = (xRatio < 0 ? -1.95 : 0.6);
            this.goalkeeper.rightArm.rotation.z = (xRatio > 0 ? 1.95 : -0.6);
            this.goalkeeper.leftArm.rotation.x = -0.3;
            this.goalkeeper.rightArm.rotation.x = -0.3;
          }
        } else {
          // Yerden Köşeye Kapanma (Low Corner Smother)
          const targetY = 0.22;
          this.goalkeeper.group.position.x = THREE.MathUtils.lerp(this.goalkeeper.group.position.x, targetX, 0.6);
          this.goalkeeper.group.position.y = THREE.MathUtils.lerp(this.goalkeeper.group.position.y, targetY, 0.6);
          this.goalkeeper.group.rotation.z = THREE.MathUtils.lerp(this.goalkeeper.group.rotation.z, -Math.sign(xRatio) * 1.45, 0.55);

          if (this.goalkeeper.leftArm && this.goalkeeper.rightArm) {
            this.goalkeeper.leftArm.rotation.z = (xRatio < 0 ? -1.75 : 0.3);
            this.goalkeeper.rightArm.rotation.z = (xRatio > 0 ? 1.75 : -0.3);
            this.goalkeeper.leftArm.rotation.x = 0.65;
            this.goalkeeper.rightArm.rotation.x = 0.65;
          }
        }
      } else {
        // Ortaya gelen şutlarda zıplama veya yere çökme
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
      // Hareket halindeyken açı kapatma
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
          // Hazır bekleme açısı
          this.goalkeeper.leftArm.rotation.z = -0.45 + (xRatio * 0.3);
          this.goalkeeper.rightArm.rotation.z = 0.45 + (xRatio * 0.3);
        }
      }
    }
  }

  // Kaleciyi Doğal Hazır Bekleme Duruşuna Döndür
  resetGoalkeeper() {
    if (!this.goalkeeper) return;
    this.goalkeeper.group.position.copy(this.gkDefaultPos);
    this.goalkeeper.group.rotation.set(0, 0, 0);

    // Doğal hazır duruş kollarını geri yükle
    if (this.goalkeeper.leftArm && this.goalkeeper.rightArm) {
      this.goalkeeper.leftArm.rotation.set(0.42, 0, -0.45);
      this.goalkeeper.rightArm.rotation.set(0.42, 0, 0.45);
    }
    if (this.goalkeeper.torso) {
      this.goalkeeper.torso.rotation.x = 0.18;
    }

    this.isDiving = false;
    this.goalkeeper.state = 'idle';
  }

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

  // ==========================================================
  // CANLI GERÇEKÇİ ANİMASYON DÖNGÜSÜ (Canlı Nefes, Parmak Ucu Sekmesi & Baş Takibi)
  // ==========================================================
  updateIdle(time) {
    // 1. KALECİ CANLI BEKLEME HAREKETLERİ (Gerçek Maç İçi Parmak Ucu Yaylanması)
    if (this.goalkeeper && !this.isDiving && this.goalkeeper.state === 'idle') {
      // Ayak parmak uçlarında ritmik sekme (Pre-jump bounce)
      const gkHop = Math.abs(Math.sin(time * 6.5)) * 0.038;
      this.goalkeeper.group.position.y = gkHop;

      // Göğüs nefes alma ve hazır kolların mikro salınımı
      if (this.goalkeeper.torso) {
        this.goalkeeper.torso.rotation.x = 0.18 + Math.sin(time * 3.5) * 0.025;
      }
      if (this.goalkeeper.leftArm && this.goalkeeper.rightArm) {
        this.goalkeeper.leftArm.rotation.z = -0.45 + Math.sin(time * 6.5) * 0.04;
        this.goalkeeper.rightArm.rotation.z = 0.45 - Math.sin(time * 6.5) * 0.04;
      }

      // Topa doğru baş odaklanması
      if (this.goalkeeper.head) {
        this.goalkeeper.head.rotation.y = Math.sin(time * 1.5) * 0.05;
      }
    }

    // 2. FORVET CANLI BEKLEME HAREKETLERİ (Nefes Alma ve Konsantrasyon)
    if (this.kicker && !this.kicker.isKicking) {
      const breath = Math.sin(time * 2.8) * 0.015;
      if (this.kicker.torso) {
        this.kicker.torso.position.y = breath;
      }
      if (this.kicker.head) {
        this.kicker.head.rotation.x = -0.05 + breath * 0.8;
      }
      if (this.kicker.leftArmGroup && this.kicker.rightArmGroup) {
        this.kicker.leftArmGroup.rotation.x = Math.sin(time * 2.8) * 0.06;
        this.kicker.rightArmGroup.rotation.x = -Math.sin(time * 2.8) * 0.06;
      }
    }

    // 3. SAVUNMA BARAJI DİRİ BEKLEME HAREKETİ
    if (this.wall && this.wall.length > 0) {
      this.wall.forEach((def, dIdx) => {
        if (def.group) {
          const shift = Math.sin(time * 2.5 + dIdx * 0.7) * 0.012;
          def.group.position.y = Math.max(0, shift);
        }
      });
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
    const visualGroup = new THREE.Group();
    group.add(visualGroup);

    const torsoData = this.createAthleticTorso(jerseyColorHex, number, labelText, false);
    visualGroup.add(torsoData.group);

    const head = this.createAthleticHead(0xffdbac, 0xe67e22, true, 0x3498db);
    head.position.y = 1.74;
    visualGroup.add(head);

    const shortsMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8 });
    const shorts = new THREE.Mesh(new THREE.BoxGeometry(0.50, 0.32, 0.27), shortsMat);
    shorts.position.y = 0.86;
    shorts.castShadow = true;
    visualGroup.add(shorts);

    const lLeg = this.createAthleticLeg(true, 0xffdbac, 0xffffff, jerseyColorHex, 0x111827, 0x00ff88);
    const rLeg = this.createAthleticLeg(false, 0xffdbac, 0xffffff, jerseyColorHex, 0x111827, 0x00ff88);
    visualGroup.add(lLeg);
    visualGroup.add(rLeg);

    group.position.copy(pos);
    group.lookAt(0, 0.11, 0);
    this.scene.add(group);

    this.teammate = {
      group: group,
      visualGroup: visualGroup,
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
      this.kickZoneRing = null;
    }
    if (this.kickZoneAura) {
      this.scene.remove(this.kickZoneAura);
      this.kickZoneAura = null;
    }

    const ringGeo = new THREE.RingGeometry(1.6, 1.85, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00f2fe,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.55
    });
    this.kickZoneRing = new THREE.Mesh(ringGeo, ringMat);
    this.kickZoneRing.rotation.x = Math.PI / 2;
    this.kickZoneRing.position.y = 0.02;
    this.scene.add(this.kickZoneRing);

    const auraGeo = new THREE.CircleGeometry(1.6, 32);
    const auraMat = new THREE.MeshBasicMaterial({
      color: 0x00f2fe,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.12
    });
    this.kickZoneAura = new THREE.Mesh(auraGeo, auraMat);
    this.kickZoneAura.rotation.x = Math.PI / 2;
    this.kickZoneAura.position.y = 0.015;
    this.scene.add(this.kickZoneAura);
  }

  updateKickZone(playerPos, canKick, kickType) {
    if (!this.kickZoneRing || !this.kickZoneAura) return;
    this.kickZoneRing.position.x = playerPos.x;
    this.kickZoneRing.position.z = playerPos.z;
    this.kickZoneAura.position.x = playerPos.x;
    this.kickZoneAura.position.z = playerPos.z;

    if (canKick) {
      const color = kickType === 'volley' ? 0xff00ff : (kickType === 'header' ? 0xf1c40f : 0x00ff88);
      this.kickZoneRing.material.color.setHex(color);
      this.kickZoneAura.material.color.setHex(color);
      this.kickZoneRing.material.opacity = 0.9;
      this.kickZoneAura.material.opacity = 0.28;
    } else {
      this.kickZoneRing.material.color.setHex(0x00f2fe);
      this.kickZoneAura.material.color.setHex(0x00f2fe);
      this.kickZoneRing.material.opacity = 0.4;
      this.kickZoneAura.material.opacity = 0.08;
    }
  }

  updateRunningAnimation(char, isMoving, isSprinting, dt) {
    if (!char || !char.leftLegGroup || !char.rightLegGroup) return;
    if (char.isKicking) return;

    if (isMoving) {
      const runFreq = isSprinting ? 14 : 9;
      char.runCycle = (char.runCycle || 0) + dt * runFreq;
      const swing = Math.sin(char.runCycle) * (isSprinting ? 0.85 : 0.55);

      char.leftLegGroup.rotation.x = swing;
      char.rightLegGroup.rotation.x = -swing;

      if (char.leftArmGroup && char.rightArmGroup) {
        char.leftArmGroup.rotation.x = -swing * 0.75;
        char.rightArmGroup.rotation.x = swing * 0.75;
      }
    } else {
      char.leftLegGroup.rotation.x = THREE.MathUtils.lerp(char.leftLegGroup.rotation.x, 0, 0.2);
      char.rightLegGroup.rotation.x = THREE.MathUtils.lerp(char.rightLegGroup.rotation.x, 0, 0.2);
      if (char.leftArmGroup && char.rightArmGroup) {
        char.leftArmGroup.rotation.x = THREE.MathUtils.lerp(char.leftArmGroup.rotation.x, 0, 0.2);
        char.rightArmGroup.rotation.x = THREE.MathUtils.lerp(char.rightArmGroup.rotation.x, 0, 0.2);
      }
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
    const visualGroup = new THREE.Group();
    group.add(visualGroup);

    const torsoData = this.createAthleticTorso(jerseyColorHex, number, labelText, false);
    visualGroup.add(torsoData.group);

    const head = this.createAthleticHead(0xe0ac69, 0x111111, false);
    head.position.y = 1.74;
    visualGroup.add(head);

    const shortsMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 });
    const shorts = new THREE.Mesh(new THREE.BoxGeometry(0.50, 0.32, 0.27), shortsMat);
    shorts.position.y = 0.86;
    shorts.castShadow = true;
    visualGroup.add(shorts);

    const lLeg = this.createAthleticLeg(true, 0xe0ac69, jerseyColorHex, 0xffffff, 0x111827, 0xe74c3c);
    const rLeg = this.createAthleticLeg(false, 0xe0ac69, jerseyColorHex, 0xffffff, 0x111827, 0xe74c3c);
    visualGroup.add(lLeg);
    visualGroup.add(rLeg);

    group.position.copy(pos);
    group.rotation.set(0, 0, 0);
    this.scene.add(group);

    return {
      group: group,
      visualGroup: visualGroup,
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
