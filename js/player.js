// ==========================================================
// 3D OYUNCULAR, KALECİ VE BARAJ SİSTEMİ (player.js)
// ==========================================================

class PlayerModels {
  constructor(scene) {
    this.scene = scene;
    this.goalkeeper = null;
    this.wall = [];
    this.kicker = null;
    this.passer = null;
    this.defenders = [];

    this.gkDefaultPos = new THREE.Vector3(0, 0, 0.4);
    this.isDiving = false;
    this.gkDiveVelocity = new THREE.Vector3();
  }

  // KALECİ 3D MODELİ OLUŞTURMA
  createGoalkeeper(colorHex = 0xf39c12) {
    if (this.goalkeeper) {
      this.scene.remove(this.goalkeeper.group);
    }

    const group = new THREE.Group();

    // Kaleci Materyalleri
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xffdbac, roughness: 0.7 });
    const jerseyMat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.6 });
    const shortsMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8 });
    const gloveMat = new THREE.MeshStandardMaterial({ color: 0x00ff88, roughness: 0.4, metalness: 0.2 });
    const socksMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 });
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x2c1d11, roughness: 0.9 });

    // Gövde (Torso)
    const torsoGeo = new THREE.BoxGeometry(0.55, 0.65, 0.28);
    const torso = new THREE.Mesh(torsoGeo, jerseyMat);
    torso.position.y = 1.25;
    torso.castShadow = true;
    group.add(torso);

    // Kafa & Saç
    const headGeo = new THREE.SphereGeometry(0.18, 16, 16);
    const head = new THREE.Mesh(headGeo, skinMat);
    head.position.y = 1.72;
    head.castShadow = true;
    group.add(head);

    const hairGeo = new THREE.SphereGeometry(0.19, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.45);
    const hair = new THREE.Mesh(hairGeo, hairMat);
    hair.position.y = 1.75;
    group.add(hair);

    // Şort (Pelvis / Shorts)
    const shortsGeo = new THREE.BoxGeometry(0.5, 0.35, 0.26);
    const shorts = new THREE.Mesh(shortsGeo, shortsMat);
    shorts.position.y = 0.85;
    shorts.castShadow = true;
    group.add(shorts);

    // Bacaklar
    const legGeo = new THREE.CylinderGeometry(0.09, 0.08, 0.7, 12);
    
    const leftLeg = new THREE.Mesh(legGeo, socksMat);
    leftLeg.position.set(-0.16, 0.42, 0);
    leftLeg.castShadow = true;
    group.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeo, socksMat);
    rightLeg.position.set(0.16, 0.42, 0);
    rightLeg.castShadow = true;
    group.add(rightLeg);

    // Kollar ve Eldivenler (Dinamik hareket için ayrı nesneler)
    const armGeo = new THREE.CylinderGeometry(0.07, 0.06, 0.55, 12);
    const gloveGeo = new THREE.BoxGeometry(0.16, 0.16, 0.12);

    // Sol Kol
    const leftArmGroup = new THREE.Group();
    leftArmGroup.position.set(-0.35, 1.45, 0);
    const leftArm = new THREE.Mesh(armGeo, jerseyMat);
    leftArm.position.y = -0.25;
    leftArmGroup.add(leftArm);
    const leftGlove = new THREE.Mesh(gloveGeo, gloveMat);
    leftGlove.position.y = -0.55;
    leftArmGroup.add(leftGlove);
    group.add(leftArmGroup);

    // Sağ Kol
    const rightArmGroup = new THREE.Group();
    rightArmGroup.position.set(0.35, 1.45, 0);
    const rightArm = new THREE.Mesh(armGeo, jerseyMat);
    rightArm.position.y = -0.25;
    rightArmGroup.add(rightArm);
    const rightGlove = new THREE.Mesh(gloveGeo, gloveMat);
    rightGlove.position.y = -0.55;
    rightArmGroup.add(rightGlove);
    group.add(rightArmGroup);

    group.position.copy(this.gkDefaultPos);
    this.scene.add(group);

    this.goalkeeper = {
      group: group,
      torso: torso,
      head: head,
      leftArm: leftArmGroup,
      rightArm: rightArmGroup,
      leftGlove: leftGlove,
      rightGlove: rightGlove,
      initialY: 0,
      diveTimer: 0,
      state: 'idle' // 'idle', 'diving', 'saved', 'conceded'
    };

    return this.goalkeeper;
  }

  // SAVUNMA BARAJI OLUŞTURMA (Freekick Wall)
  createWall(ballPos, count = 4, jerseyColorHex = 0x2980b9) {
    // Önceki barajı temizle
    this.wall.forEach(def => this.scene.remove(def.group));
    this.wall = [];

    // Baraj top ile kale arasında 9.15m uzaklıkta kurulur
    const dirToGoal = new THREE.Vector3(0, 0, 0).sub(ballPos).normalize();
    const wallCenter = ballPos.clone().add(dirToGoal.clone().multiplyScalar(9.15));
    // Kaleye paralel sağa-sola yayılma vektörü
    const perpDir = new THREE.Vector3(-dirToGoal.z, 0, dirToGoal.x).normalize();

    const skinMat = new THREE.MeshStandardMaterial({ color: 0xe0ac69 });
    const jerseyMat = new THREE.MeshStandardMaterial({ color: jerseyColorHex });
    const shortsMat = new THREE.MeshStandardMaterial({ color: 0xffffff });

    for (let i = 0; i < count; i++) {
      const defGroup = new THREE.Group();
      const offset = (i - (count - 1) / 2) * 0.75;
      const pos = wallCenter.clone().add(perpDir.clone().multiplyScalar(offset));

      // Gövde
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.65, 0.25), jerseyMat);
      body.position.y = 1.25;
      body.castShadow = true;
      defGroup.add(body);

      // Kafa
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.17, 12, 12), skinMat);
      head.position.y = 1.7;
      defGroup.add(head);

      // Şort
      const shorts = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.35, 0.24), shortsMat);
      shorts.position.y = 0.85;
      defGroup.add(shorts);

      // Bacaklar
      const legGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.7, 8);
      const lLeg = new THREE.Mesh(legGeo, skinMat);
      lLeg.position.set(-0.15, 0.42, 0);
      defGroup.add(lLeg);
      const rLeg = new THREE.Mesh(legGeo, skinMat);
      rLeg.position.set(0.15, 0.42, 0);
      defGroup.add(rLeg);

      defGroup.position.copy(pos);
      // Topa doğru dönsün
      defGroup.lookAt(ballPos.x, defGroup.position.y, ballPos.z);

      this.scene.add(defGroup);
      this.wall.push({
        group: defGroup,
        baseY: 0,
        jumpOffset: 0
      });
    }
  }

  // ŞUT ÇEKEN FORVET OYUNCUSU (Kicker Rig - Koşma ve Şut Eklemleri)
  createKicker(ballPos, jerseyColorHex = 0xe74c3c, number = 10) {
    if (this.kicker) {
      this.scene.remove(this.kicker.group);
      this.kicker = null;
    }

    const group = new THREE.Group();

    // Özel forma numaralı gövde dokusu
    const numCanvas = document.createElement('canvas');
    numCanvas.width = 128;
    numCanvas.height = 128;
    const nctx = numCanvas.getContext('2d');
    nctx.fillStyle = '#' + new THREE.Color(jerseyColorHex).getHexString();
    nctx.fillRect(0, 0, 128, 128);
    nctx.fillStyle = '#ffffff';
    nctx.font = 'bold 64px "Segoe UI", sans-serif';
    nctx.textAlign = 'center';
    nctx.textBaseline = 'middle';
    nctx.fillText(number.toString(), 64, 64);
    const numTex = new THREE.CanvasTexture(numCanvas);

    const frontMat = new THREE.MeshStandardMaterial({ color: jerseyColorHex, roughness: 0.6 });
    const backMat = new THREE.MeshStandardMaterial({ map: numTex, roughness: 0.6 });
    const torsoMats = [frontMat, frontMat, frontMat, frontMat, backMat, backMat];

    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.65, 0.28), torsoMats);
    torso.position.y = 1.25;
    torso.castShadow = true;
    group.add(torso);

    const skinMat = new THREE.MeshStandardMaterial({ color: 0xffdbac, roughness: 0.7 });
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 14, 14), skinMat);
    head.position.y = 1.72;
    head.castShadow = true;
    group.add(head);

    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.19, 14, 8, 0, Math.PI * 2, 0, Math.PI * 0.45),
      new THREE.MeshStandardMaterial({ color: 0x1a1a1a }));
    hair.position.y = 1.75;
    group.add(hair);

    const shorts = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.35, 0.26),
      new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.8 }));
    shorts.position.y = 0.85;
    group.add(shorts);

    const legMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 });

    // Sol Bacak Eklemi (Kalça Mafsalı y = 0.75)
    const leftLegGroup = new THREE.Group();
    leftLegGroup.position.set(-0.16, 0.75, 0);
    const leftLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.7, 10), legMat);
    leftLeg.position.y = -0.35;
    leftLeg.castShadow = true;
    leftLegGroup.add(leftLeg);
    group.add(leftLegGroup);

    // Sağ Bacak Eklemi (Kalça Mafsalı y = 0.75)
    const rightLegGroup = new THREE.Group();
    rightLegGroup.position.set(0.16, 0.75, 0);
    const rightLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.7, 10), legMat);
    rightLeg.position.y = -0.35;
    rightLeg.castShadow = true;
    rightLegGroup.add(rightLeg);
    group.add(rightLegGroup);

    // Kollar (Omuz Mafsalları y = 1.45)
    const armGeo = new THREE.CylinderGeometry(0.07, 0.06, 0.55, 10);
    
    const leftArmGroup = new THREE.Group();
    leftArmGroup.position.set(-0.35, 1.45, 0);
    const lArm = new THREE.Mesh(armGeo, frontMat);
    lArm.position.y = -0.25;
    leftArmGroup.add(lArm);
    group.add(leftArmGroup);

    const rightArmGroup = new THREE.Group();
    rightArmGroup.position.set(0.35, 1.45, 0);
    const rArm = new THREE.Mesh(armGeo, frontMat);
    rArm.position.y = -0.25;
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
    lctx.font = 'bold 26px "Segoe UI", sans-serif';
    lctx.textAlign = 'center';
    lctx.textBaseline = 'middle';
    lctx.fillText('SEN (WASD Koş)', 128, 32);
    const labelTex = new THREE.CanvasTexture(labelCanvas);
    const labelSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: labelTex, transparent: true }));
    labelSprite.position.set(0, 2.3, 0);
    labelSprite.scale.set(1.4, 0.35, 1);
    group.add(labelSprite);

    group.position.set(ballPos.x - 0.4, 0, ballPos.z + 1.8);
    group.lookAt(0, 0, 0);

    this.scene.add(group);
    this.kicker = {
      group: group,
      torso: torso,
      head: head,
      hair: hair,
      leftLegGroup: leftLegGroup,
      rightLegGroup: rightLegGroup,
      leftArmGroup: leftArmGroup,
      rightArmGroup: rightArmGroup,
      labelSprite: labelSprite,
      isKicking: false,
      runCycle: 0
    };

    this.createKickZoneIndicator();
    return this.kicker;
  }

  // AYAK ALTI 3D TOP KONTROL VE VURUŞ ALANI HALKASI
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

    if (canKick) {
      if (kickType === 'volley') {
        this.kickZoneRing.material.color.setHex(0xff3838); // Vole için alev kırmızı/turuncu
        this.kickZoneAura.material.color.setHex(0xff3838);
        this.kickZoneAura.material.opacity = 0.35;
      } else {
        this.kickZoneRing.material.color.setHex(0x00ff88); // Top ayaktayken neon yeşil
        this.kickZoneAura.material.color.setHex(0x00ff88);
        this.kickZoneAura.material.opacity = 0.25;
      }
      this.kickZoneRing.scale.set(1.08, 1.08, 1.08);
    } else {
      this.kickZoneRing.material.color.setHex(0x00f2fe); // Koşarken neon mavi
      this.kickZoneAura.material.color.setHex(0x00f2fe);
      this.kickZoneAura.material.opacity = 0.08;
      this.kickZoneRing.scale.set(1.0, 1.0, 1.0);
    }
  }

  // KOŞMA ANİMASYONU (Bacak ve kol salınımları)
  updateRunningAnimation(char, isMoving, isSprinting, dt = 0.016) {
    if (!char || char.isKicking) return;

    if (isMoving) {
      const runSpeed = isSprinting ? 16 : 11;
      const legAmp = isSprinting ? 0.95 : 0.65;
      const armAmp = isSprinting ? 0.8 : 0.5;

      char.runCycle = (char.runCycle || 0) + dt * runSpeed;
      const t = char.runCycle;

      // Bacak salınımları (Koşu ritmi)
      char.leftLegGroup.rotation.x = Math.sin(t) * legAmp;
      char.rightLegGroup.rotation.x = -Math.sin(t) * legAmp;

      // Kol salınımları (Bacakların tersi)
      char.leftArmGroup.rotation.x = -Math.sin(t) * armAmp;
      char.rightArmGroup.rotation.x = Math.sin(t) * armAmp;

      // Gövde sekmesi
      char.torso.position.y = 1.25 + Math.abs(Math.sin(t * 2)) * 0.05;
      char.head.position.y = 1.72 + Math.abs(Math.sin(t * 2)) * 0.05;
      if (char.hair) char.hair.position.y = 1.75 + Math.abs(Math.sin(t * 2)) * 0.05;
    } else {
      // Dururken nötr idle pozisyonuna yumuşakça dön
      char.runCycle = 0;
      char.leftLegGroup.rotation.x = THREE.MathUtils.lerp(char.leftLegGroup.rotation.x, 0, 0.2);
      char.rightLegGroup.rotation.x = THREE.MathUtils.lerp(char.rightLegGroup.rotation.x, 0, 0.2);
      char.leftArmGroup.rotation.x = THREE.MathUtils.lerp(char.leftArmGroup.rotation.x, 0, 0.2);
      char.rightArmGroup.rotation.x = THREE.MathUtils.lerp(char.rightArmGroup.rotation.x, 0, 0.2);
      char.torso.position.y = THREE.MathUtils.lerp(char.torso.position.y, 1.25, 0.2);
      char.head.position.y = THREE.MathUtils.lerp(char.head.position.y, 1.72, 0.2);
      if (char.hair) char.hair.position.y = THREE.MathUtils.lerp(char.hair.position.y, 1.75, 0.2);
    }
  }

  // ŞUT ANİMASYONU (Geriye gerilme ve topa sert vuruş)
  triggerKickAnimation(onImpactCallback, targetChar = null) {
    const char = targetChar || this.kicker;
    if (!char) return;
    char.isKicking = true;

    let t = 0;
    const animInterval = setInterval(() => {
      t += 0.08;

      if (t < 0.4) {
        char.rightLegGroup.rotation.x = -Math.sin(t / 0.4 * (Math.PI / 2)) * 1.2;
      } else if (t < 0.7) {
        const progress = (t - 0.4) / 0.3;
        char.rightLegGroup.rotation.x = -1.2 + (progress * 2.5);
        if (progress >= 0.5 && onImpactCallback) {
          onImpactCallback();
          onImpactCallback = null;
        }
      } else if (t < 1.0) {
        const progress = (t - 0.7) / 0.3;
        char.rightLegGroup.rotation.x = 1.3 * (1 - progress);
      } else {
        clearInterval(animInterval);
        char.rightLegGroup.rotation.x = 0;
        char.isKicking = false;
      }
    }, 20);
  }

  // VOLE ANİMASYONU (Havaya zıplayıp vole savurma)
  triggerVolleyAnimation(onImpactCallback, targetChar = null) {
    const char = targetChar || this.kicker;
    if (!char) return;
    char.isKicking = true;

    let t = 0;
    const interval = setInterval(() => {
      t += 0.07;
      if (t < 0.4) {
        char.group.position.y = Math.sin(t / 0.4 * (Math.PI / 2)) * 0.65;
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
        char.group.position.y = 0.65 * (1 - p);
        char.rightLegGroup.rotation.x = 1.4 * (1 - p);
      } else {
        clearInterval(interval);
        char.group.position.y = 0;
        char.rightLegGroup.rotation.x = 0;
        char.isKicking = false;
      }
    }, 20);
  }

  // KAFA VURUŞU ANİMASYONU (Havaya yükselme ve kafa atma)
  triggerHeaderAnimation(onImpactCallback, targetChar = null) {
    const char = targetChar || this.kicker;
    if (!char) return;
    char.isKicking = true;

    let t = 0;
    const interval = setInterval(() => {
      t += 0.08;
      if (t < 0.5) {
        char.group.position.y = Math.sin(t / 0.5 * (Math.PI / 2)) * 0.75;
        char.head.rotation.x = -0.35;
      } else if (t < 0.75) {
        char.head.rotation.x = 0.55;
        if (onImpactCallback) {
          onImpactCallback();
          onImpactCallback = null;
        }
      } else if (t < 1.05) {
        const p = (t - 0.75) / 0.3;
        char.group.position.y = 0.75 * (1 - p);
        char.head.rotation.x = 0.55 * (1 - p);
      } else {
        clearInterval(interval);
        char.group.position.y = 0;
        char.head.rotation.x = 0;
        char.isKicking = false;
      }
    }, 20);
  }

  // TAKIM ARKADAŞI MODELİ (Co-op 2 Kişilik Hücum Modu İçin)
  createTeammate(pos, jerseyColorHex = 0x3498db, number = 9, labelText = 'PARTNER') {
    if (this.teammate) {
      this.scene.remove(this.teammate.group);
      this.teammate = null;
    }

    const group = new THREE.Group();

    // Özel forma numaralı gövde
    const numCanvas = document.createElement('canvas');
    numCanvas.width = 128;
    numCanvas.height = 128;
    const nctx = numCanvas.getContext('2d');
    nctx.fillStyle = '#' + new THREE.Color(jerseyColorHex).getHexString();
    nctx.fillRect(0, 0, 128, 128);
    nctx.fillStyle = '#ffffff';
    nctx.font = 'bold 64px "Segoe UI", sans-serif';
    nctx.textAlign = 'center';
    nctx.textBaseline = 'middle';
    nctx.fillText(number.toString(), 64, 64);
    const numTex = new THREE.CanvasTexture(numCanvas);

    const frontMat = new THREE.MeshStandardMaterial({ color: jerseyColorHex, roughness: 0.6 });
    const backMat = new THREE.MeshStandardMaterial({ map: numTex, roughness: 0.6 });
    const torsoMats = [frontMat, frontMat, frontMat, frontMat, backMat, backMat];

    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.65, 0.28), torsoMats);
    torso.position.y = 1.25;
    torso.castShadow = true;
    group.add(torso);

    const skinMat = new THREE.MeshStandardMaterial({ color: 0xffdbac, roughness: 0.7 });
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 14, 14), skinMat);
    head.position.y = 1.72;
    head.castShadow = true;
    group.add(head);

    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.19, 14, 8, 0, Math.PI * 2, 0, Math.PI * 0.45),
      new THREE.MeshStandardMaterial({ color: 0xe67e22 }));
    hair.position.y = 1.75;
    group.add(hair);

    const shorts = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.35, 0.26),
      new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8 }));
    shorts.position.y = 0.85;
    group.add(shorts);

    const legMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 });

    // Sol Bacak Eklemi (y = 0.75)
    const leftLegGroup = new THREE.Group();
    leftLegGroup.position.set(-0.16, 0.75, 0);
    const leftLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.7, 10), legMat);
    leftLeg.position.y = -0.35;
    leftLeg.castShadow = true;
    leftLegGroup.add(leftLeg);
    group.add(leftLegGroup);

    // Sağ Bacak Eklemi (y = 0.75)
    const rightLegGroup = new THREE.Group();
    rightLegGroup.position.set(0.16, 0.75, 0);
    const rightLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.7, 10), legMat);
    rightLeg.position.y = -0.35;
    rightLeg.castShadow = true;
    rightLegGroup.add(rightLeg);
    group.add(rightLegGroup);

    // Kollar (y = 1.45)
    const armGeo = new THREE.CylinderGeometry(0.07, 0.06, 0.55, 10);
    const leftArmGroup = new THREE.Group();
    leftArmGroup.position.set(-0.35, 1.45, 0);
    const lArm = new THREE.Mesh(armGeo, frontMat);
    lArm.position.y = -0.25;
    leftArmGroup.add(lArm);
    group.add(leftArmGroup);

    const rightArmGroup = new THREE.Group();
    rightArmGroup.position.set(0.35, 1.45, 0);
    const rArm = new THREE.Mesh(armGeo, frontMat);
    rArm.position.y = -0.25;
    rightArmGroup.add(rArm);
    group.add(rightArmGroup);

    // Baş Üstünde 3D İsim/Rol Bilgisi
    const labelCanvas = document.createElement('canvas');
    labelCanvas.width = 256;
    labelCanvas.height = 64;
    const lctx = labelCanvas.getContext('2d');
    lctx.fillStyle = 'rgba(0, 255, 136, 0.9)';
    if (lctx.roundRect) lctx.roundRect(4, 4, 248, 56, 12);
    else lctx.rect(4, 4, 248, 56);
    lctx.fill();
    lctx.fillStyle = '#0a1424';
    lctx.font = 'bold 26px "Segoe UI", sans-serif';
    lctx.textAlign = 'center';
    lctx.textBaseline = 'middle';
    lctx.fillText(labelText, 128, 32);
    const labelTex = new THREE.CanvasTexture(labelCanvas);
    const labelSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: labelTex, transparent: true }));
    labelSprite.position.set(0, 2.3, 0);
    labelSprite.scale.set(1.4, 0.35, 1);
    group.add(labelSprite);

    group.position.copy(pos);
    group.lookAt(0, 0, 0);

    this.scene.add(group);
    this.teammate = {
      group: group,
      torso: torso,
      head: head,
      hair: hair,
      leftLegGroup: leftLegGroup,
      rightLegGroup: rightLegGroup,
      leftArmGroup: leftArmGroup,
      rightArmGroup: rightArmGroup,
      labelSprite: labelSprite,
      isKicking: false,
      runCycle: 0
    };

    return this.teammate;
  }

  // TAKIM ARKADAŞI VURUŞ ANİMASYONU
  triggerTeammateKickAnimation(onImpactCallback) {
    this.triggerKickAnimation(onImpactCallback, this.teammate);
  }

  // BARAJIN ZIPLAMA ANİMASYONU
  triggerWallJump() {
    let t = 0;
    const interval = setInterval(() => {
      t += 0.08;
      const jumpY = Math.sin(t * Math.PI) * 0.7; // 70cm baraj sıçraması
      this.wall.forEach(def => {
        def.group.position.y = Math.max(0, jumpY);
      });
      if (t >= 1) {
        clearInterval(interval);
        this.wall.forEach(def => { def.group.position.y = 0; });
      }
    }, 25);
  }

  // KALECİ ZIPLAMA / UÇMA ANİMASYONU (AI Goalkeeper Dive)
  triggerGoalkeeperDive(targetX, targetY, targetZ, travelTime = 0.8) {
    if (!this.goalkeeper) return;
    this.isDiving = true;
    this.goalkeeper.state = 'diving';

    const startPos = this.goalkeeper.group.position.clone();
    // Kalecinin insanüstü değil, gerçekçi bir uzanma mesafesi olsun (max 2.1m)
    // Böylece köşelere ve 90'a giden harika şutlar kesinlikle GOL olur!
    const clampedTargetX = THREE.MathUtils.clamp(targetX * 0.65, -2.1, 2.1);
    const clampedTargetY = THREE.MathUtils.clamp(targetY * 0.8, 0.4, 1.95);

    let startTime = performance.now();
    const duration = Math.max(0.75, travelTime) * 1000;

    const diveLoop = () => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(1, elapsed / duration);

      // Yumuşatılmış eğri (easeOutQuad)
      const ease = 1 - (1 - progress) * (1 - progress);

      // Konum güncelle
      this.goalkeeper.group.position.x = THREE.MathUtils.lerp(startPos.x, clampedTargetX, ease);
      this.goalkeeper.group.position.y = THREE.MathUtils.lerp(0, clampedTargetY, Math.sin(progress * Math.PI));

      // Vücut yatma açısı (Uçuş yönüne göre yana eğilme)
      const rollAngle = (clampedTargetX > 0 ? -1 : 1) * Math.sin(progress * Math.PI) * 1.0;
      this.goalkeeper.group.rotation.z = rollAngle;

      // Kolları uzat
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

  // OYUNCUNUN KONTROL ETTİĞİ KALECİ (Kaleci Mevkisinde Oynarken - 2D X ve Y Kontrolü)
  setGoalkeeperManualPosition(xRatio, yRatio = 0.5, isDivingAction = false) {
    if (!this.goalkeeper) return;
    this.isPlayerGK = true;

    // xRatio: -1.0 (Sol direk) ile +1.0 (Sağ direk)
    // yRatio: 0.0 (Zemin) ile 1.0 (Üst direk / 90)
    const targetX = xRatio * 3.4;
    this.goalkeeper.group.position.x = THREE.MathUtils.lerp(this.goalkeeper.group.position.x, targetX, 0.35);

    // Kolların ve eldivenlerin fareye göre 3D uzanması:
    if (this.goalkeeper.leftArm && this.goalkeeper.rightArm) {
      if (yRatio > 0.6) {
        // Yüksek toplarda kollar yukarı ve 90 köşelerine açılır
        this.goalkeeper.leftArm.rotation.z = Math.PI - 0.4 + (xRatio * 0.3);
        this.goalkeeper.rightArm.rotation.z = -Math.PI + 0.4 + (xRatio * 0.3);
        this.goalkeeper.leftArm.rotation.x = -0.3;
        this.goalkeeper.rightArm.rotation.x = -0.3;
      } else if (yRatio < 0.35) {
        // Alçak ve yerden gelen şutlarda kollar aşağı uzanır
        this.goalkeeper.leftArm.rotation.z = 0.2 + (xRatio * 0.4);
        this.goalkeeper.rightArm.rotation.z = -0.2 + (xRatio * 0.4);
        this.goalkeeper.leftArm.rotation.x = 0.5;
        this.goalkeeper.rightArm.rotation.x = 0.5;
      } else {
        // Orta seviye dengeli kurtarış duruşu
        this.goalkeeper.leftArm.rotation.z = 0.8 + (xRatio * 0.5);
        this.goalkeeper.rightArm.rotation.z = -0.8 + (xRatio * 0.5);
        this.goalkeeper.leftArm.rotation.x = 0;
        this.goalkeeper.rightArm.rotation.x = 0;
      }
    }

    if (isDivingAction) {
      // Uçuş hamlesi: Vücut açıyla havaya fırlar ve yana eğilir
      const jumpHeight = Math.max(0.7, yRatio * 1.8);
      this.goalkeeper.group.position.y = THREE.MathUtils.lerp(this.goalkeeper.group.position.y, jumpHeight, 0.4);
      this.goalkeeper.group.rotation.z = THREE.MathUtils.lerp(this.goalkeeper.group.rotation.z, -xRatio * 1.1, 0.35);
    } else {
      // Ayakta duruş (Hafif yaylanma ve hazır bekleme)
      const baseHeight = (yRatio > 0.65) ? (yRatio - 0.65) * 0.8 : 0;
      this.goalkeeper.group.position.y = THREE.MathUtils.lerp(this.goalkeeper.group.position.y, baseHeight, 0.25);
      this.goalkeeper.group.rotation.z = THREE.MathUtils.lerp(this.goalkeeper.group.rotation.z, -xRatio * 0.2, 0.2);
    }
  }

  // Kaleciyi Başlangıç Konumuna Getir
  resetGoalkeeper() {
    if (!this.goalkeeper) return;
    this.goalkeeper.group.position.copy(this.gkDefaultPos);
    this.goalkeeper.group.rotation.set(0, 0, 0);
    this.goalkeeper.leftArm.rotation.set(0, 0, 0);
    this.goalkeeper.rightArm.rotation.set(0, 0, 0);
    this.isDiving = false;
    this.goalkeeper.state = 'idle';
  }

  // Kaleci Eldivenlerinin Dünya Koordinatları (Top Çarpışma Tespiti İçin)
  getGoalkeeperGlovesBounds() {
    if (!this.goalkeeper) return null;
    const leftPos = new THREE.Vector3();
    const rightPos = new THREE.Vector3();
    this.goalkeeper.leftGlove.getWorldPosition(leftPos);
    this.goalkeeper.rightGlove.getWorldPosition(rightPos);

    // İki eldivenin orta noktası
    const glovesMid = leftPos.clone().add(rightPos).multiplyScalar(0.5);

    return {
      leftGlove: leftPos,
      rightGlove: rightPos,
      glovesMid: glovesMid,
      bodyCenter: this.goalkeeper.group.position.clone().add(new THREE.Vector3(0, 1.1, 0)),
      isPlayerGK: this.isPlayerGK
    };
  }

  // Her Kare Kaleci Hafif Salınım (Idle Breathing)
  updateIdle(time) {
    if (this.goalkeeper && !this.isDiving) {
      // Kaleci yaylanarak bekler (parmak ucunda zıplama)
      this.goalkeeper.group.position.y = Math.abs(Math.sin(time * 5)) * 0.06;
    }
  }

  // ==========================================================
  // RAKİP DEFANS OYUNCULARI (AI Stoperler & Pres Sistemi)
  // ==========================================================
  createDefenders(positions, colorHex = 0x1e3a8a) {
    this.clearDefenders();
    positions.forEach((pos, idx) => {
      const def = this.createSingleDefender(pos, colorHex, idx + 4, `RAKİP STOPER #${idx + 4}`);
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

  createSingleDefender(pos, jerseyColorHex = 0x1e3a8a, number = 4, labelText = 'RAKİP DEFANS') {
    const group = new THREE.Group();

    const numCanvas = document.createElement('canvas');
    numCanvas.width = 128;
    numCanvas.height = 128;
    const nctx = numCanvas.getContext('2d');
    nctx.fillStyle = '#' + new THREE.Color(jerseyColorHex).getHexString();
    nctx.fillRect(0, 0, 128, 128);
    nctx.fillStyle = '#ffffff';
    nctx.font = 'bold 64px "Segoe UI", sans-serif';
    nctx.textAlign = 'center';
    nctx.textBaseline = 'middle';
    nctx.fillText(number.toString(), 64, 64);
    const numTex = new THREE.CanvasTexture(numCanvas);

    const frontMat = new THREE.MeshStandardMaterial({ color: jerseyColorHex, roughness: 0.6 });
    const backMat = new THREE.MeshStandardMaterial({ map: numTex, roughness: 0.6 });
    const torsoMats = [frontMat, frontMat, frontMat, frontMat, backMat, backMat];

    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.66, 0.28), torsoMats);
    torso.position.y = 1.25;
    torso.castShadow = true;
    group.add(torso);

    const skinMat = new THREE.MeshStandardMaterial({ color: 0xe0ac69, roughness: 0.7 });
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 14, 14), skinMat);
    head.position.y = 1.72;
    head.castShadow = true;
    group.add(head);

    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.19, 14, 8, 0, Math.PI * 2, 0, Math.PI * 0.45),
      new THREE.MeshStandardMaterial({ color: 0x111111 }));
    hair.position.y = 1.75;
    group.add(hair);

    const shorts = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.35, 0.26),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 }));
    shorts.position.y = 0.85;
    group.add(shorts);

    const legMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.8 });

    // Sol Bacak Eklemi
    const leftLegGroup = new THREE.Group();
    leftLegGroup.position.set(-0.16, 0.75, 0);
    const leftLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.7, 10), legMat);
    leftLeg.position.y = -0.35;
    leftLeg.castShadow = true;
    leftLegGroup.add(leftLeg);
    group.add(leftLegGroup);

    // Sağ Bacak Eklemi
    const rightLegGroup = new THREE.Group();
    rightLegGroup.position.set(0.16, 0.75, 0);
    const rightLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.7, 10), legMat);
    rightLeg.position.y = -0.35;
    rightLeg.castShadow = true;
    rightLegGroup.add(rightLeg);
    group.add(rightLegGroup);

    // Kollar
    const armGeo = new THREE.CylinderGeometry(0.07, 0.06, 0.55, 10);
    const leftArmGroup = new THREE.Group();
    leftArmGroup.position.set(-0.35, 1.45, 0);
    const lArm = new THREE.Mesh(armGeo, frontMat);
    lArm.position.y = -0.25;
    leftArmGroup.add(lArm);
    group.add(leftArmGroup);

    const rightArmGroup = new THREE.Group();
    rightArmGroup.position.set(0.35, 1.45, 0);
    const rArm = new THREE.Mesh(armGeo, frontMat);
    rArm.position.y = -0.25;
    rightArmGroup.add(rArm);
    group.add(rightArmGroup);

    // Baş Üstünde Kırmızı Defans Rozeti
    const labelCanvas = document.createElement('canvas');
    labelCanvas.width = 256;
    labelCanvas.height = 64;
    const lctx = labelCanvas.getContext('2d');
    lctx.fillStyle = 'rgba(231, 76, 60, 0.9)';
    if (lctx.roundRect) lctx.roundRect(4, 4, 248, 56, 12);
    else lctx.rect(4, 4, 248, 56);
    lctx.fill();
    lctx.fillStyle = '#ffffff';
    lctx.font = 'bold 24px "Segoe UI", sans-serif';
    lctx.textAlign = 'center';
    lctx.textBaseline = 'middle';
    lctx.fillText(labelText, 128, 32);
    const labelTex = new THREE.CanvasTexture(labelCanvas);
    const labelSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: labelTex, transparent: true }));
    labelSprite.position.set(0, 2.3, 0);
    labelSprite.scale.set(1.4, 0.35, 1);
    group.add(labelSprite);

    group.position.copy(pos);
    group.lookAt(pos.x, 0, pos.z + 10);

    this.scene.add(group);
    return {
      group: group,
      torso: torso,
      head: head,
      hair: hair,
      leftLegGroup: leftLegGroup,
      rightLegGroup: rightLegGroup,
      leftArmGroup: leftArmGroup,
      rightArmGroup: rightArmGroup,
      labelSprite: labelSprite,
      basePos: pos.clone(),
      state: 'idle',
      beatenTimer: 0,
      tackleCooldown: 0,
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
