// ==========================================================
// TOP FİZİĞİ, FALSO (MAGNUS ETKİSİ) VE ÇARPIŞMALAR (physics.js)
// ==========================================================

class BallPhysics {
  constructor(scene) {
    this.scene = scene;
    this.radius = 0.22; // FIFA 5 numara top yarıçapı
    this.mass = 0.43;   // kg

    // Fizik Sabitleri
    this.gravity = -9.81;
    this.dragCoeff = 0.010; // Hava sürtünmesi
    this.magnusCoeff = 0.009; // Falso kuvvet çarpanı
    this.bounceCoeff = 0.65; // Yerden sekme katsayısı

    // Durum Değişkenleri
    this.position = new THREE.Vector3(0, this.radius, 11);
    this.prevPosition = new THREE.Vector3(0, this.radius, 11);
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.spin = new THREE.Vector3(0, 0, 0); // x: topspin/dip, y: side curl (falso), z: roll
    this.isMoving = false;
    this.isTrivela = false;
    this.preferredFoot = 'R';
    this.hasScored = false;
    this.hasHitPost = false;
    this.hasBeenSaved = false;
    this.hasHitWall = false;
    this.hasTriggeredEnd = false;

    // 3D Nesneler
    this.mesh = null;
    this.shadow = null;
    this.trail = [];
    this.trailMeshes = [];
    this.vortexMeshes = [];

    this.createBall();
  }

  createBall() {
    // FIFA QUALITY PRO - Aerodinamik Altın & Cyan Panelli Resmi Maç Topu Dokusu
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // 1. Zemin: Parlak Saf Futbol Beyazı
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 1024, 512);

    // İnce mikroskobik deri pütür dokusu
    ctx.fillStyle = 'rgba(235, 240, 245, 0.5)';
    for (let i = 0; i < 600; i++) {
      const rx = Math.random() * 1024;
      const ry = Math.random() * 512;
      ctx.fillRect(rx, ry, 2, 2);
    }

    // 2. Aerodinamik Altın & Elektrik Cyan Kıvrımlı Paneller (FIFA Pro Deseni)
    const drawCurvedPanel = (cx, cy, scale, angle) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      ctx.scale(scale, scale);

      // Dış Altın Kavis
      ctx.beginPath();
      ctx.moveTo(-60, -40);
      ctx.bezierCurveTo(-20, -90, 40, -85, 75, -30);
      ctx.bezierCurveTo(90, 15, 60, 70, 10, 80);
      ctx.bezierCurveTo(-45, 85, -85, 30, -60, -40);
      ctx.fillStyle = '#ffd700'; // Parlak Altın
      ctx.fill();

      // İç Elektrik Cyan Aerodinamik Kanat
      ctx.beginPath();
      ctx.moveTo(-45, -25);
      ctx.bezierCurveTo(-15, -65, 30, -60, 55, -20);
      ctx.bezierCurveTo(68, 10, 45, 50, 8, 60);
      ctx.bezierCurveTo(-30, 62, -60, 22, -45, -25);
      ctx.fillStyle = '#00f2fe'; // Elektrik Cyan
      ctx.fill();

      // Gece Mavisi Kontrast Çekirdek
      ctx.beginPath();
      ctx.arc(5, 5, 20, 0, Math.PI * 2);
      ctx.fillStyle = '#0a192f';
      ctx.fill();

      // İnce altın yıldız parıltısı
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(5, 5, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    // 8 Ana Aerodinamik Kanat Dağılımı
    const panelCoords = [
      [128, 128, 1.1, 0.4],
      [384, 128, 1.1, -0.6],
      [640, 128, 1.1, 0.8],
      [896, 128, 1.1, -0.2],
      [128, 384, 1.1, -0.5],
      [384, 384, 1.1, 0.7],
      [640, 384, 1.1, -0.4],
      [896, 384, 1.1, 0.5]
    ];
    panelCoords.forEach(([x, y, sc, a]) => drawCurvedPanel(x, y, sc, a));

    // 3. FIFA QUALITY PRO Resmi Onay Damgası
    const drawFifaBadge = (x, y) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.fillStyle = 'rgba(10, 25, 47, 0.9)';
      if (ctx.roundRect) ctx.roundRect(-55, -28, 110, 56, 8);
      else ctx.rect(-55, -28, 110, 56);
      ctx.fill();
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 15px "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText("FIFA", 0, -8);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px "Segoe UI", sans-serif';
      ctx.fillText("QUALITY PRO", 0, 8);
      ctx.fillStyle = '#00f2fe';
      ctx.font = '7px sans-serif';
      ctx.fillText("2026 OFFICIAL MATCH", 0, 20);
      ctx.restore();
    };
    drawFifaBadge(256, 256);
    drawFifaBadge(768, 256);

    // 4. Termal Yapıştırma Dikiş Olukları (Thermal Bonded Seams)
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 3;
    for (let x = 0; x <= 1024; x += 128) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.bezierCurveTo(x + 30, 170, x - 30, 340, x, 512);
      ctx.stroke();
    }

    const ballTexture = new THREE.CanvasTexture(canvas);
    ballTexture.wrapS = THREE.RepeatWrapping;
    ballTexture.wrapT = THREE.ClampToEdgeWrapping;

    const geo = new THREE.SphereGeometry(this.radius, 32, 32);
    const mat = new THREE.MeshStandardMaterial({
      map: ballTexture,
      roughness: 0.22,
      metalness: 0.16
    });

    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.castShadow = true;
    this.mesh.position.copy(this.position);
    this.scene.add(this.mesh);

    // Zemin Gölgesi
    const shadowGeo = new THREE.CircleGeometry(this.radius * 1.15, 20);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.45
    });
    this.shadow = new THREE.Mesh(shadowGeo, shadowMat);
    this.shadow.rotation.x = -Math.PI / 2;
    this.shadow.position.set(this.position.x, 0.015, this.position.z);
    this.scene.add(this.shadow);

    // Normal Trail parçacıkları havuzu
    for (let i = 0; i < 20; i++) {
      const tGeo = new THREE.SphereGeometry(this.radius * 0.4, 8, 8);
      const tMat = new THREE.MeshBasicMaterial({
        color: 0x00f2fe,
        transparent: true,
        opacity: 0
      });
      const tMesh = new THREE.Mesh(tGeo, tMat);
      this.scene.add(tMesh);
      this.trailMeshes.push(tMesh);
    }

    // Trivela Kasırga Burgusu (Spiral Vortex Trail) Parçacıkları
    this.vortexMeshes = [];
    for (let i = 0; i < 24; i++) {
      const vGeo = new THREE.RingGeometry(0.06, 0.24, 12);
      const vMat = new THREE.MeshBasicMaterial({
        color: (i % 2 === 0) ? 0xffd700 : 0x00f2fe,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0,
        depthWrite: false
      });
      const vMesh = new THREE.Mesh(vGeo, vMat);
      this.scene.add(vMesh);
      this.vortexMeshes.push(vMesh);
    }
  }

  // Topu Belirli Bir Konuma Sıfırla
  reset(pos = new THREE.Vector3(0, this.radius, 11)) {
    this.position.copy(pos);
    this.prevPosition.copy(pos);
    this.velocity.set(0, 0, 0);
    this.spin.set(0, 0, 0);
    this.isMoving = false;
    this.isTrivela = false;
    this.hasScored = false;
    this.hasHitPost = false;
    this.hasBeenSaved = false;
    this.hasHitWall = false;
    this.hasTriggeredEnd = false;

    this.isPass = false;
    this.onPassArrival = null;

    this.mesh.position.copy(this.position);
    this.mesh.rotation.set(0, 0, 0);
    this.shadow.position.set(this.position.x, 0.015, this.position.z);
    this.shadow.scale.set(1, 1, 1);

    this.trail = [];
    this.trailMeshes.forEach(m => m.material.opacity = 0);
    if (this.vortexMeshes) this.vortexMeshes.forEach(m => m.material.opacity = 0);
  }

  // TOPU YUMUŞATARAK STOP ETME (First Touch / Top Tutma)
  cushionTrap(receiverPos) {
    this.isMoving = false;
    this.isPass = false;
    this.velocity.set(0, 0, 0);
    this.spin.set(0, 0, 0);
    this.position.set(receiverPos.x, this.radius, receiverPos.z);
    if (this.mesh) this.mesh.position.copy(this.position);
    if (this.shadow) this.shadow.position.set(this.position.x, 0.015, this.position.z);
    this.trail = [];
    this.trailMeshes.forEach(m => m.material.opacity = 0);
  }

  // PAS / ORTA ATEŞLEME (Co-op 2 Kişilik Eşli Hücum İçin)
  passTo(targetPos, flightDuration = 1.1, arcHeight = 1.8, curl = 0, onArrival = null) {
    this.isPass = true;
    this.onPassArrival = onArrival;
    this.passTargetPos = targetPos.clone();

    const toTarget = new THREE.Vector3(
      targetPos.x - this.position.x,
      targetPos.y - this.position.y,
      targetPos.z - this.position.z
    );

    this.curveAccelX = curl * 10.5;

    // Hedefe tam iniş için ilk hız:
    const vx = toTarget.x / flightDuration - (0.5 * this.curveAccelX * flightDuration);
    let vy = (toTarget.y - this.position.y - 0.5 * this.gravity * flightDuration * flightDuration) / flightDuration;
    if (arcHeight > 0) {
      vy += arcHeight * 1.5;
    }
    const vz = toTarget.z / flightDuration;

    this.velocity.set(vx, vy, vz);
    this.flightTime = flightDuration;
    this.elapsedFlight = 0;

    this.spin.set(8, curl * 20, 0);

    this.isMoving = true;
    this.hasScored = false;
    this.hasHitPost = false;
    this.hasBeenSaved = false;
    this.hasHitWall = false;
    this.hasTriggeredEnd = false;

    if (window.gameSound) {
      window.gameSound.playKick(0.75);
    }
  }

  // ŞUT ATEŞLEME (Gelişmiş Trivela, Roberto Carlos Falso ve Füze Şut Fiziği)
  shoot(dirX, dirY, power = 25, curl = 0, isTrivela = false, preferredFoot = 'R', shotType = 'curve') {
    this.isPass = false;
    this.onPassArrival = null;
    this.isTrivela = isTrivela;
    this.preferredFoot = preferredFoot;
    this.shotType = shotType;

    // Hedef nokta: Tam olarak nişan alınan koordinat
    const targetX = dirX * 4.6;
    const targetY = dirY * 2.5;
    const targetZ = 0; // Kale çizgisi

    // Kaleye olan mesafe ve uçuş süresi (T)
    const toTarget = new THREE.Vector3(targetX - this.position.x, targetY - this.position.y, targetZ - this.position.z);
    const distance = toTarget.length();
    const flightTime = distance / power;

    // Falso İvmesi (X ekseninde çekiş):
    if (isTrivela) {
      // Trivela: Dış ayakla topu kamçılayarak daha sert ve late-swerve kavis üretir
      this.curveAccelX = curl * 13.5;
    } else if (shotType === 'power') {
      // Füze / Sert üst vuruş: Düşük kavis, yüksek hız ve knuckleball rotası
      this.curveAccelX = curl * 4.8;
    } else {
      // Standart kavis / plase
      this.curveAccelX = curl * 10.5;
    }

    // Hedefe oturması için ilk fırlatma açısı:
    // Trivela vuruşunda top dışa doğru açılı başlar (outward slice), sonra muz gibi 90'a kırılır!
    const offsetFactor = isTrivela ? 0.65 : 0.5;
    const vx = (targetX - this.position.x) / flightTime - (offsetFactor * this.curveAccelX * flightTime);

    // Baraj üzerinden aşırtma ve çatala dalış (Dipping Arc):
    let vy = (targetY - this.position.y - 0.5 * this.gravity * flightTime * flightTime) / flightTime;
    if (dirY > 0.45) {
      vy += (dirY - 0.45) * (shotType === 'power' ? 1.8 : 2.5);
    }

    const vz = toTarget.z / flightTime;

    this.velocity.set(vx, vy, vz);
    this.flightTime = flightTime;
    this.elapsedFlight = 0;

    // Topun dönüş hızı (Görsel ve fiziksel spin)
    if (isTrivela) {
      this.spin.set(
        16, // Topspin / ani düşüş
        curl * 38, // Yoğun yanal burgu
        (preferredFoot === 'R' ? 26 : -26) // Dış ayak eksenel burgusu
      );
    } else if (shotType === 'power') {
      this.spin.set(
        22, // Sert topspin
        curl * 10,
        0
      );
    } else {
      this.spin.set(
        (dirY > 0.5) ? 15 : 0,
        curl * 20,
        0
      );
    }

    this.isMoving = true;
    this.hasScored = false;
    this.hasHitPost = false;
    this.hasBeenSaved = false;
    this.hasHitWall = false;
    this.hasTriggeredEnd = false;

    if (window.gameSound) {
      if (isTrivela) {
        window.gameSound.playTrivelaWhip(power / 24);
      } else if (shotType === 'power') {
        window.gameSound.playPowerStrike(power / 24);
      } else {
        window.gameSound.playKick(power / 26);
      }
    }
  }

  // FİZİK GÜNCELLEMESİ (Her Kare Çağrılır)
  update(dt, stadium, playerModels, onGoal, onMiss, onSave, onPostHit, onWallHit, onStopped) {
    if (!this.isMoving) return;
    this.elapsedFlight += dt;

    // Co-op Pas Varış / İniş Kontrolü
    if (this.isPass && this.elapsedFlight >= this.flightTime) {
      this.isPass = false;
      if (this.onPassArrival) {
        const cb = this.onPassArrival;
        this.onPassArrival = null;
        cb();
      }
    }

    // 1. GERÇEK FALSO İVMESİ (Magnus Etkisi & Trivela Late-Swerve Fiziği)
    if (this.isTrivela) {
      // Trivela Late-Swerve: Uçuşun son yarısında havanın burguyla etkileşimi katlanarak artar (muz kavis)
      const p = Math.min(1.0, this.elapsedFlight / (this.flightTime || 1.0));
      const lateSwerveMultiplier = (p > 0.3) ? (1.0 + Math.pow((p - 0.3) / 0.7, 1.8) * 1.8) : 0.6;
      this.velocity.x += (this.curveAccelX * lateSwerveMultiplier) * dt;

      // Trivela çatal dalışı (Topspin Dip)
      if (p > 0.5) {
        this.velocity.y -= (6.5 * (p - 0.5)) * dt;
      }
    } else {
      this.velocity.x += this.curveAccelX * dt;
      if (this.spin.x > 0 && this.position.z < 12) {
        this.velocity.y -= (this.spin.x * 0.35) * dt;
      }
    }

    // 2. Yerçekimi ve Hava Sürtünmesi
    this.velocity.y += this.gravity * dt;
    this.velocity.multiplyScalar(1 - this.dragCoeff * dt);

    // 3. Konum Güncellemesi (Önceki konumu sakla)
    this.prevPosition.copy(this.position);
    this.position.addScaledVector(this.velocity, dt);

    // 4. Top Kendi Etrafında Dönüşü (Görsel Animasyon)
    this.mesh.rotation.x += this.velocity.z * dt * 3.5;
    this.mesh.rotation.y += this.spin.y * dt * 0.8;
    this.mesh.rotation.z -= this.velocity.x * dt * 3.5;

    // 5. Zemin Çarpışması (Sekme ve Yuvarlanma)
    if (this.position.y <= this.radius) {
      this.position.y = this.radius;
      if (Math.abs(this.velocity.y) > 0.8) {
        this.velocity.y = -this.velocity.y * this.bounceCoeff;
        this.velocity.x *= 0.85;
        this.velocity.z *= 0.85;
      } else {
        this.velocity.y = 0;
        this.velocity.multiplyScalar(0.95);
        if (this.velocity.lengthSq() < 0.15) {
          this.isMoving = false;
          if (!this.hasTriggeredEnd) {
            this.hasTriggeredEnd = true;
            if (onStopped) onStopped();
            else if (onMiss) onMiss();
          }
        }
      }
    }

    this.mesh.position.copy(this.position);

    // Gölge Boyutu ve Konumu
    this.shadow.position.x = this.position.x;
    this.shadow.position.z = this.position.z;
    const heightFactor = Math.max(0.1, 1 - (this.position.y / 7));
    this.shadow.scale.set(heightFactor, heightFactor, 1);
    this.shadow.material.opacity = 0.45 * heightFactor;

    // 6. Trail (Kuyruk İzi) Güncelle
    this.updateTrail();

    // 7. BARAJ ÇARPIŞMA KONTROLÜ
    if (playerModels && playerModels.wall.length > 0 && !this.hasScored && !this.hasHitWall) {
      for (const def of playerModels.wall) {
        const defPos = def.group.position;
        const distXZ = Math.hypot(this.position.x - defPos.x, this.position.z - defPos.z);
        const currentDefHeight = def.group.position.y + 1.85;

        if (distXZ < 0.38 && this.position.y >= def.group.position.y && this.position.y <= currentDefHeight) {
          this.hasHitWall = true;
          this.velocity.x += (Math.random() - 0.5) * 5;
          this.velocity.z = Math.abs(this.velocity.z) * 0.35 + 2.0;
          this.velocity.y = Math.abs(this.velocity.y) * 0.4 + 2.0;
          if (window.gameSound) window.gameSound.playKick(0.6);
          if (onWallHit) onWallHit();

          setTimeout(() => {
            if (!this.hasScored && !this.hasTriggeredEnd) {
              this.hasTriggeredEnd = true;
              if (onMiss) onMiss();
            }
          }, 1500);
          break;
        }
      }
    }

    // 8. KALECİ ELDİVENİ / VÜCUDU / KURTARIŞ ÇARPIŞMASI (TOP ASLA İÇİNDEN GEÇMEZ)
    if (playerModels && !this.hasBeenSaved && !this.hasScored) {
      const gkBounds = playerModels.getGoalkeeperGlovesBounds();
      if (gkBounds) {
        const dLeft = this.position.distanceTo(gkBounds.leftGlove);
        const dRight = this.position.distanceTo(gkBounds.rightGlove);
        const dMid = gkBounds.glovesMid ? this.position.distanceTo(gkBounds.glovesMid) : 999;
        const dBody = this.position.distanceTo(gkBounds.bodyCenter);

        const isHuman = !!gkBounds.isPlayerGK;
        const isDiving = !!gkBounds.isDiving;
        const gloveThreshold = isHuman ? (isDiving ? 1.05 : 0.85) : 0.42;
        const bodyThreshold = isHuman ? (isDiving ? 1.15 : 0.90) : 0.55;

        let isSaved = false;

        // 1. Noktasal mesafe kontrolü (Eldivenler, orta nokta ve gövde)
        if (dLeft < gloveThreshold || dRight < gloveThreshold || dMid < gloveThreshold || (dBody < bodyThreshold && this.position.z < 1.4)) {
          isSaved = true;
        }

        // 2. Sürekli Çarpışma Testi (CCD): Top kaleci düzlemini geçerken kalecinin kapsama alanına girdi mi?
        if (!isSaved && gkBounds.coverageBox) {
          const box = gkBounds.coverageBox;
          const zGK = 0.4;
          const crossedZ = (this.prevPosition.z >= (zGK - 0.25) && this.position.z <= (zGK + 0.65)) ||
                           (this.position.z >= box.minZ && this.position.z <= box.maxZ);

          if (crossedZ) {
            const dz = this.position.z - this.prevPosition.z;
            let checkX = this.position.x;
            let checkY = this.position.y;
            if (Math.abs(dz) > 0.001) {
              const alpha = THREE.MathUtils.clamp((zGK - this.prevPosition.z) / dz, 0, 1);
              checkX = this.prevPosition.x + alpha * (this.position.x - this.prevPosition.x);
              checkY = this.prevPosition.y + alpha * (this.position.y - this.prevPosition.y);
            }

            if (checkX >= box.minX && checkX <= box.maxX && checkY >= box.minY && checkY <= box.maxY) {
              isSaved = true;
            }
          }
        }

        if (isSaved) {
          this.hasBeenSaved = true;
          this.hasTriggeredEnd = true;

          // TOP KALECİNİN İÇİNDEN ASLA GEÇMEZ: Topu kalecinin önüne sabitle!
          this.position.z = Math.max(0.48, this.position.z);
          this.mesh.position.copy(this.position);

          // Topu öne sahaya doğru ve yana sertçe çel
          const deflectDirX = (this.position.x >= (gkBounds.bodyCenter ? gkBounds.bodyCenter.x : 0)) ? 1 : -1;
          this.velocity.x = deflectDirX * (Math.random() * 4 + 4);
          this.velocity.y = Math.abs(this.velocity.y) * 0.4 + 3.2;
          this.velocity.z = Math.abs(this.velocity.z) * 0.65 + 4.5; // Sahaya doğru fırlar!

          if (window.gameSound) window.gameSound.playSave();
          if (onSave) onSave();
        }
      }
    }

    // 9. DİREKLER VE ÜST DİREK ÇARPIŞMASI (Gerçekçi 7cm Yarıçap)
    if (!this.hasHitPost && stadium) {
      const halfW = stadium.goalWidth / 2;
      const h = stadium.goalHeight;
      const postR = 0.07; // Gerçek FIFA direk yarıçapı

      if (Math.abs(this.position.z - stadium.goalZ) < 0.28) {
        // Sol direk kontrolü
        const dLeftPost = Math.hypot(this.position.x - (-halfW), this.position.z - stadium.goalZ);
        if (dLeftPost < postR + this.radius && this.position.y <= h) {
          this.hasHitPost = true;
          this.velocity.x = Math.abs(this.velocity.x) * 1.1 + 2;
          this.velocity.z = Math.abs(this.velocity.z) * 0.8 + 1;
          if (window.gameSound) window.gameSound.playCrossbar();
          if (onPostHit) onPostHit();

          setTimeout(() => {
            if (!this.hasScored && !this.hasTriggeredEnd) {
              this.hasTriggeredEnd = true;
              if (onMiss) onMiss();
            }
          }, 1400);
        }

        // Sağ direk kontrolü
        const dRightPost = Math.hypot(this.position.x - halfW, this.position.z - stadium.goalZ);
        if (dRightPost < postR + this.radius && this.position.y <= h) {
          this.hasHitPost = true;
          this.velocity.x = -Math.abs(this.velocity.x) * 1.1 - 2;
          this.velocity.z = Math.abs(this.velocity.z) * 0.8 + 1;
          if (window.gameSound) window.gameSound.playCrossbar();
          if (onPostHit) onPostHit();

          setTimeout(() => {
            if (!this.hasScored && !this.hasTriggeredEnd) {
              this.hasTriggeredEnd = true;
              if (onMiss) onMiss();
            }
          }, 1400);
        }

        // Üst direk kontrolü (Crossbar)
        if (Math.abs(this.position.x) <= halfW && Math.abs(this.position.y - h) < postR + this.radius) {
          this.hasHitPost = true;
          this.velocity.y = -Math.abs(this.velocity.y) * 0.85;
          this.velocity.z = Math.abs(this.velocity.z) * 0.7 + 1;
          if (window.gameSound) window.gameSound.playCrossbar();
          if (onPostHit) onPostHit();

          setTimeout(() => {
            if (!this.hasScored && !this.hasTriggeredEnd) {
              this.hasTriggeredEnd = true;
              if (onMiss) onMiss();
            }
          }, 1400);
        }
      }
    }

    // 10. GOL TESPİTİ (Kale Çizgisini Geçme)
    if (!this.hasScored && !this.hasBeenSaved && stadium) {
      const halfW = stadium.goalWidth / 2;
      const h = stadium.goalHeight;

      if (this.position.z <= stadium.goalZ && this.position.z >= stadium.goalZ - stadium.goalDepth) {
        if (Math.abs(this.position.x) < halfW - 0.05 && this.position.y < h - 0.05 && this.position.y > 0) {
          this.hasScored = true;
          this.hasTriggeredEnd = true;
          stadium.animateNetImpact();
          this.velocity.multiplyScalar(0.2); // Filede dur
          if (window.gameSound) {
            window.gameSound.playNet();
            window.gameSound.playWhistle(true);
            window.gameSound.playGoalCheer();
          }
          if (onGoal) onGoal();
        }
      }
    }

    // 11. OUT / KAÇAN TOP TESPİTİ (Kale arkasına düşme)
    if (!this.hasScored && !this.hasBeenSaved && !this.hasTriggeredEnd && this.position.z < -1.5) {
      this.hasTriggeredEnd = true;
      this.isMoving = false;
      if (window.gameSound) window.gameSound.playCrowdMiss();
      if (onMiss) onMiss();
    }
  }

  updateTrail() {
    this.trail.unshift(this.position.clone());
    if (this.trail.length > this.trailMeshes.length) {
      this.trail.pop();
    }

    this.trail.forEach((pos, idx) => {
      const m = this.trailMeshes[idx];
      m.position.copy(pos);
      m.material.opacity = Math.max(0, 0.6 - (idx / this.trailMeshes.length) * 0.6);
      const scale = 1 - (idx / this.trailMeshes.length) * 0.6;
      m.scale.set(scale, scale, scale);
    });

    if (this.isTrivela) {
      this.updateTrivelaVortex();
    } else if (this.vortexMeshes) {
      this.vortexMeshes.forEach(m => m.material.opacity = 0);
    }
  }

  // TRİVELA KASIRGA BURGUSU (Spiral Vortex Particle Trail)
  updateTrivelaVortex() {
    if (!this.vortexMeshes || this.vortexMeshes.length === 0) return;
    const time = this.elapsedFlight * 22;

    this.vortexMeshes.forEach((mesh, idx) => {
      const offsetT = (idx / this.vortexMeshes.length);
      const angle = time - offsetT * Math.PI * 4;
      const radius = 0.28 + offsetT * 0.26;
      const backDist = offsetT * 1.8;

      mesh.position.set(
        this.position.x + Math.cos(angle) * radius,
        this.position.y + Math.sin(angle) * radius,
        this.position.z + backDist
      );
      mesh.rotation.z = angle;
      mesh.rotation.x = Math.PI / 2;
      mesh.material.opacity = Math.max(0, (1 - offsetT) * 0.75);
      const s = 1.0 - offsetT * 0.45;
      mesh.scale.set(s, s, s);
    });
  }
}

window.BallPhysics = BallPhysics;
