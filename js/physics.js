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
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.spin = new THREE.Vector3(0, 0, 0); // x: topspin/dip, y: side curl (falso), z: roll
    this.isMoving = false;
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

    this.createBall();
  }

  createBall() {
    // Klasik Futbol Topu Dokusu (Pentagon & Hexagon Doku)
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, 512, 256);

    // Siyah beşgenler
    ctx.fillStyle = '#0f172a';
    const drawPentagon = (cx, cy, r) => {
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = (i * 2 * Math.PI / 5) - Math.PI / 2;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
    };

    // Doku üzerine futbol panelleri dağıt
    const spots = [
      [64, 64], [192, 64], [320, 64], [448, 64],
      [128, 160], [256, 160], [384, 160], [512, 160],
      [64, 240], [192, 240], [320, 240], [448, 240]
    ];
    spots.forEach(([x, y]) => drawPentagon(x, y, 24));

    // Dikiş çizgileri
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    for (let x = 0; x < 512; x += 64) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + 32, 256);
      ctx.stroke();
    }

    const ballTexture = new THREE.CanvasTexture(canvas);

    const geo = new THREE.SphereGeometry(this.radius, 32, 32);
    const mat = new THREE.MeshStandardMaterial({
      map: ballTexture,
      roughness: 0.35,
      metalness: 0.15
    });

    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.castShadow = true;
    this.mesh.position.copy(this.position);
    this.scene.add(this.mesh);

    // Zemin Gölgesi
    const shadowGeo = new THREE.CircleGeometry(this.radius * 1.1, 16);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.4
    });
    this.shadow = new THREE.Mesh(shadowGeo, shadowMat);
    this.shadow.rotation.x = -Math.PI / 2;
    this.shadow.position.set(this.position.x, 0.015, this.position.z);
    this.scene.add(this.shadow);

    // Trail parçacıkları havuzu
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
  }

  // Topu Belirli Bir Konuma Sıfırla
  reset(pos = new THREE.Vector3(0, this.radius, 11)) {
    this.position.copy(pos);
    this.velocity.set(0, 0, 0);
    this.spin.set(0, 0, 0);
    this.isMoving = false;
    this.hasScored = false;
    this.hasHitPost = false;
    this.hasBeenSaved = false;
    this.hasHitWall = false;
    this.hasTriggeredEnd = false;

    this.mesh.position.copy(this.position);
    this.mesh.rotation.set(0, 0, 0);
    this.shadow.position.set(this.position.x, 0.015, this.position.z);
    this.shadow.scale.set(1, 1, 1);

    this.trail = [];
    this.trailMeshes.forEach(m => m.material.opacity = 0);
  }

  // ŞUT ATEŞLEME (Gelişmiş Roberto Carlos / Beckham Falso Fiziği)
  shoot(dirX, dirY, power = 25, curl = 0) {
    // dirX: -1.5 ile +1.5 arası (Kalenin dışına ve köşelere serbestçe nişan)
    // dirY: 0.1 (Yerden) ile 2.2 (Direk üstü ve 90'a aşırtma)
    // power: 20 - 34 m/s (~72 - 122 km/h)
    // curl: -1.0 (SOLA KAVİS) ile +1.0 (SAĞA KAVİS)

    // Hedef nokta: Tam olarak nişan alınan koordinat
    const targetX = dirX * 4.6;
    const targetY = dirY * 2.5;
    const targetZ = 0; // Kale çizgisi

    // Kaleye olan mesafe ve uçuş süresi (T)
    const toTarget = new THREE.Vector3(targetX - this.position.x, targetY - this.position.y, targetZ - this.position.z);
    const distance = toTarget.length();
    const flightTime = distance / power;

    // Falso İvmesi (X ekseninde çekiş):
    // curl < 0 (Sola Kavis): İvme sola doğru negatif (sol kaleye çeker)
    // curl > 0 (Sağa Kavis): İvme sağa doğru pozitif (sağ kaleye çeker)
    this.curveAccelX = curl * 10.5;

    // Hedefe tam oturması için ilk fırlatma açısı (Offset launch):
    // Top barajın dışından başlatılır ve falso ile hedefe kıvrılır!
    const vx = (targetX - this.position.x) / flightTime - (0.5 * this.curveAccelX * flightTime);

    // Baraj üzerinden aşırtma ve çatala dalış (Dipping Arc):
    let vy = (targetY - this.position.y - 0.5 * this.gravity * flightTime * flightTime) / flightTime;
    if (dirY > 0.45) {
      vy += (dirY - 0.45) * 2.5; // Baraj üzerinden yükselme itişi
    }

    const vz = toTarget.z / flightTime;

    this.velocity.set(vx, vy, vz);
    this.flightTime = flightTime;
    this.elapsedFlight = 0;

    // Topun dönüş hızı (Görsel ve fiziksel spin)
    this.spin.set(
      (dirY > 0.5) ? 15 : 0, // Topspin
      curl * 20,            // Yanal falso dönüşü
      0
    );

    this.isMoving = true;
    this.hasScored = false;
    this.hasHitPost = false;
    this.hasBeenSaved = false;
    this.hasHitWall = false;
    this.hasTriggeredEnd = false;

    if (window.gameSound) {
      window.gameSound.playKick(power / 26);
    }
  }

  // FİZİK GÜNCELLEMESİ (Her Kare Çağrılır)
  update(dt, stadium, playerModels, onGoal, onMiss, onSave, onPostHit, onWallHit, onStopped) {
    if (!this.isMoving) return;
    this.elapsedFlight += dt;

    // 1. GERÇEK FALSO İVMESİ (Kullanıcı sola dediyse top sola, sağa dediyse sağa kıvrılır)
    this.velocity.x += this.curveAccelX * dt;

    // Topspin ile kaleye yaklaşırken aniden aşağı düşüş (Dip)
    if (this.spin.x > 0 && this.position.z < 12) {
      this.velocity.y -= (this.spin.x * 0.35) * dt;
    }

    // 2. Yerçekimi ve Hava Sürtünmesi
    this.velocity.y += this.gravity * dt;
    this.velocity.multiplyScalar(1 - this.dragCoeff * dt);

    // 3. Konum Güncellemesi
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

    // 8. KALECİ ELDİVENİ / KURTARIŞ ÇARPIŞMASI (Adil ve Gerçekçi Boyut)
    if (playerModels && !this.hasBeenSaved && !this.hasScored) {
      const gkBounds = playerModels.getGoalkeeperGlovesBounds();
      if (gkBounds) {
        const dLeft = this.position.distanceTo(gkBounds.leftGlove);
        const dRight = this.position.distanceTo(gkBounds.rightGlove);
        const dBody = this.position.distanceTo(gkBounds.bodyCenter);

        // Adil temas yarıçapı: eldiven 0.28m, gövde 0.42m
        if (dLeft < 0.28 || dRight < 0.28 || (dBody < 0.42 && this.position.z < 1.0)) {
          this.hasBeenSaved = true;
          this.hasTriggeredEnd = true;
          this.velocity.x += (Math.random() - 0.5) * 7;
          this.velocity.y = Math.abs(this.velocity.y) * 0.4 + 3;
          this.velocity.z = Math.abs(this.velocity.z) * 0.6 + 2.0;
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
    if (!this.hasScored && stadium) {
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
  }
}

window.BallPhysics = BallPhysics;
