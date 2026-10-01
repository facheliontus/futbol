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

  // ŞUT ÇEKEN FORVET OYUNCUSU (Kicker Rig)
  createKicker(ballPos, jerseyColorHex = 0xe74c3c, number = 10) {
    if (this.kicker) {
      this.scene.remove(this.kicker.group);
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

    const frontMat = new THREE.MeshStandardMaterial({ color: jerseyColorHex });
    const backMat = new THREE.MeshStandardMaterial({ map: numTex });
    // Kutu yüzleri: sağ, sol, üst, alt, ön, arka
    const torsoMats = [frontMat, frontMat, frontMat, frontMat, backMat, backMat];

    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.65, 0.28), torsoMats);
    torso.position.y = 1.25;
    torso.castShadow = true;
    group.add(torso);

    const skinMat = new THREE.MeshStandardMaterial({ color: 0xffdbac });
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 14, 14), skinMat);
    head.position.y = 1.72;
    head.castShadow = true;
    group.add(head);

    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.19, 14, 8, 0, Math.PI * 2, 0, Math.PI * 0.45),
      new THREE.MeshStandardMaterial({ color: 0x1a1a1a }));
    hair.position.y = 1.75;
    group.add(hair);

    const shorts = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.35, 0.26),
      new THREE.MeshStandardMaterial({ color: 0x222222 }));
    shorts.position.y = 0.85;
    group.add(shorts);

    // Sağ Vuruş Bacağı (Şut animasyonu için mafsallı grup)
    const legMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const leftLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.7, 10), legMat);
    leftLeg.position.set(-0.16, 0.42, 0);
    group.add(leftLeg);

    const rightLegGroup = new THREE.Group();
    rightLegGroup.position.set(0.16, 0.75, 0);
    const rightLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.7, 10), legMat);
    rightLeg.position.y = -0.35;
    rightLegGroup.add(rightLeg);
    group.add(rightLegGroup);

    // Kollar
    const armGeo = new THREE.CylinderGeometry(0.07, 0.06, 0.55, 10);
    const lArm = new THREE.Mesh(armGeo, frontMat);
    lArm.position.set(-0.35, 1.2, 0);
    lArm.rotation.z = 0.3;
    group.add(lArm);

    const rArm = new THREE.Mesh(armGeo, frontMat);
    rArm.position.set(0.35, 1.2, 0);
    rArm.rotation.z = -0.3;
    group.add(rArm);

    // Topun 1.8m gerisinde durur
    group.position.set(ballPos.x - 0.4, 0, ballPos.z + 1.8);
    group.lookAt(0, 0, 0);

    this.scene.add(group);
    this.kicker = {
      group: group,
      rightLegGroup: rightLegGroup,
      isKicking: false
    };

    return this.kicker;
  }

  // ŞUT ANİMASYONU (Geriye gerilme ve topa sert vuruş)
  triggerKickAnimation(onImpactCallback) {
    if (!this.kicker) return;
    this.kicker.isKicking = true;

    const startPos = this.kicker.group.position.clone();
    let t = 0;

    const animInterval = setInterval(() => {
      t += 0.08;

      if (t < 0.4) {
        // Geriye açılma (Backswing)
        this.kicker.rightLegGroup.rotation.x = -Math.sin(t / 0.4 * (Math.PI / 2)) * 1.1;
      } else if (t < 0.7) {
        // İleriye sert savurma (Follow through & Impact)
        const progress = (t - 0.4) / 0.3;
        this.kicker.rightLegGroup.rotation.x = -1.1 + (progress * 2.3);
        
        // Tam vuruş anı
        if (progress >= 0.5 && onImpactCallback) {
          onImpactCallback();
          onImpactCallback = null;
        }
      } else if (t < 1.0) {
        // Normal duruşa geri dönme
        const progress = (t - 0.7) / 0.3;
        this.kicker.rightLegGroup.rotation.x = 1.2 * (1 - progress);
      } else {
        clearInterval(animInterval);
        this.kicker.rightLegGroup.rotation.x = 0;
        this.kicker.isKicking = false;
      }
    }, 20);
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

  // OYUNCUNUN KONTROL ETTİĞİ KALECİ (Kaleci Mevkisinde Oynarken)
  setGoalkeeperManualPosition(xRatio, isDivingAction = false) {
    if (!this.goalkeeper) return;
    // xRatio: -1 (Sol köşe) ile +1 (Sağ köşe) arası
    const targetX = xRatio * 3.3;
    this.goalkeeper.group.position.x = THREE.MathUtils.lerp(this.goalkeeper.group.position.x, targetX, 0.25);

    if (isDivingAction) {
      this.goalkeeper.group.position.y = THREE.MathUtils.lerp(this.goalkeeper.group.position.y, 1.4, 0.3);
      this.goalkeeper.group.rotation.z = -xRatio * 0.9;
    } else {
      this.goalkeeper.group.position.y = 0;
      this.goalkeeper.group.rotation.z = 0;
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

    return {
      leftGlove: leftPos,
      rightGlove: rightPos,
      bodyCenter: this.goalkeeper.group.position.clone().add(new THREE.Vector3(0, 1.1, 0)),
      radius: 0.75 // Kalecinin uzanma & kurtarma etki alanı yarıçapı (m)
    };
  }

  // Her Kare Kaleci Hafif Salınım (Idle Breathing)
  updateIdle(time) {
    if (this.goalkeeper && !this.isDiving) {
      // Kaleci yaylanarak bekler (parmak ucunda zıplama)
      this.goalkeeper.group.position.y = Math.abs(Math.sin(time * 5)) * 0.06;
    }
  }

  clearAll() {
    if (this.goalkeeper) this.scene.remove(this.goalkeeper.group);
    if (this.kicker) this.scene.remove(this.kicker.group);
    this.wall.forEach(def => this.scene.remove(def.group));
    this.wall = [];
  }
}

window.PlayerModels = PlayerModels;
