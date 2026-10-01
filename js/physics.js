// ==========================================================
// TOP FİZİĞİ, ÇİFT KALE GOL VE ÇARPIŞMALAR (physics.js)
// Away Goal Z=-38 & Home Goal Z=+38 Destekli Arcade Top Motoru
// ==========================================================

const BALL_STATE = {
  FREE: 'FREE',
  CONTROLLED: 'CONTROLLED',
  PASSING: 'PASSING',
  SHOOTING: 'SHOOTING',
  LOOSE: 'LOOSE',
  GOAL: 'GOAL'
};

class BallPhysics {
  constructor(scene) {
    this.scene = scene;
    this.radius = 0.22; // FIFA 5 numara top yarıçapı
    this.mass = 0.43;   // kg
    this.maxSpeed = 38.0; // Maksimum top hızı (m/s)

    // Fizik Sabitleri
    this.gravity = -9.81;
    this.dragCoeff = 0.010;
    this.magnusCoeff = 0.009;
    this.bounceCoeff = 0.65;

    // Durum Değişkenleri
    this.state = BALL_STATE.FREE;
    this.position = new THREE.Vector3(0, this.radius, 0);
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.spin = new THREE.Vector3(0, 0, 0);
    this.isMoving = false;
    this.hasScored = false;
    this.hasHitPost = false;
    this.hasBeenSaved = false;
    this.hasHitWall = false;
    this.hasTriggeredEnd = false;
    this.owner = null;

    // 3D Nesneler
    this.mesh = null;
    this.shadow = null;
    this.trail = [];
    this.trailMeshes = [];

    this.createBall();
  }

  createBall() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, 512, 256);

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

    const spots = [
      [64, 64], [192, 64], [320, 64], [448, 64],
      [128, 160], [256, 160], [384, 160], [512, 160],
      [64, 240], [192, 240], [320, 240], [448, 240]
    ];
    spots.forEach(([x, y]) => drawPentagon(x, y, 24));

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

  // Topu Belirli Bir Konuma Sıfırla (Varsayılan Santra: 0, 0.22, 0)
  reset(pos = new THREE.Vector3(0, this.radius, 0)) {
    this.position.copy(pos);
    this.position.y = Math.max(this.radius, this.position.y);
    this.velocity.set(0, 0, 0);
    this.spin.set(0, 0, 0);
    this.state = BALL_STATE.FREE;
    this.isMoving = false;
    this.hasScored = false;
    this.hasHitPost = false;
    this.hasBeenSaved = false;
    this.hasHitWall = false;
    this.hasTriggeredEnd = false;
    this.owner = null;

    this.isPass = false;
    this.onPassArrival = null;

    if (this.mesh) {
      this.mesh.position.copy(this.position);
      this.mesh.rotation.set(0, 0, 0);
    }
    if (this.shadow) {
      this.shadow.position.set(this.position.x, 0.015, this.position.z);
      this.shadow.scale.set(1, 1, 1);
    }

    this.trail = [];
    this.trailMeshes.forEach(m => m.material.opacity = 0);
  }

  // PAS / ORTA ATEŞLEME
  passTo(targetPos, flightDuration = 0.85, arcHeight = 0.2, curl = 0, onArrival = null) {
    this.state = BALL_STATE.PASSING;
    this.isPass = true;
    this.owner = null;
    this.onPassArrival = onArrival;
    this.passTargetPos = targetPos.clone();

    const toTarget = new THREE.Vector3(
      targetPos.x - this.position.x,
      targetPos.y - this.position.y,
      targetPos.z - this.position.z
    );

    this.curveAccelX = curl * 10.5;

    const vx = toTarget.x / flightDuration - (0.5 * this.curveAccelX * flightDuration);
    let vy = (toTarget.y - this.position.y - 0.5 * this.gravity * flightDuration * flightDuration) / flightDuration;
    if (arcHeight > 0) {
      vy += arcHeight * 1.5;
    }
    const vz = toTarget.z / flightDuration;

    this.velocity.set(vx, vy, vz);
    if (this.velocity.length() > this.maxSpeed) {
      this.velocity.setLength(this.maxSpeed);
    }
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

  // ŞUT ATEŞLEME (targetZ: -38 Away kalesi veya +38 Home kalesi)
  shoot(dirX, dirY, power = 26, curl = 0, targetZ = -38) {
    this.state = BALL_STATE.SHOOTING;
    this.isPass = false;
    this.owner = null;
    this.onPassArrival = null;

    // Hedef X ve Y
    const targetX = dirX * 3.8;
    const targetY = Math.min(2.4, Math.max(0.1, dirY * 2.2));

    const toTarget = new THREE.Vector3(targetX - this.position.x, targetY - this.position.y, targetZ - this.position.z);
    const distance = toTarget.length();
    const flightTime = Math.max(0.4, distance / power);

    this.curveAccelX = curl * 10.5;

    const vx = (targetX - this.position.x) / flightTime - (0.5 * this.curveAccelX * flightTime);
    let vy = (targetY - this.position.y - 0.5 * this.gravity * flightTime * flightTime) / flightTime;
    if (dirY > 0.45) {
      vy += (dirY - 0.45) * 1.8;
    }
    const vz = toTarget.z / flightTime;

    this.velocity.set(vx, vy, vz);
    if (this.velocity.length() > this.maxSpeed) {
      this.velocity.setLength(this.maxSpeed);
    }
    this.flightTime = flightTime;
    this.elapsedFlight = 0;

    this.spin.set(
      (dirY > 0.5) ? 14 : 0,
      curl * 20,
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

  // FİZİK GÜNCELLEMESİ (Her Kare)
  update(dt, stadium, playerModels, onGoal, onMiss, onSave, onPostHit, onWallHit, onStopped) {
    if (!this.isMoving) return;
    dt = Math.min(dt, 0.05);
    this.elapsedFlight += dt;

    // Pas Varış Kontrolü
    if (this.isPass && this.elapsedFlight >= this.flightTime) {
      this.isPass = false;
      this.state = BALL_STATE.LOOSE;
      if (this.onPassArrival) {
        const cb = this.onPassArrival;
        this.onPassArrival = null;
        cb();
      }
    }

    // 1. Falso ve İvme
    this.velocity.x += (this.curveAccelX || 0) * dt;

    // 2. Yerçekimi ve Sürtünme
    this.velocity.y += this.gravity * dt;
    this.velocity.multiplyScalar(1 - this.dragCoeff * dt);

    if (this.velocity.length() > this.maxSpeed) {
      this.velocity.setLength(this.maxSpeed);
    }

    // 3. Konum Güncellemesi
    this.position.addScaledVector(this.velocity, dt);

    // 4. Dönüş Görseli
    if (this.mesh) {
      this.mesh.rotation.x += this.velocity.z * dt * 3.5;
      this.mesh.rotation.y += this.spin.y * dt * 0.8;
      this.mesh.rotation.z -= this.velocity.x * dt * 3.5;
    }

    // 5. Zemin Çarpışması
    if (this.position.y <= this.radius) {
      this.position.y = this.radius;
      if (Math.abs(this.velocity.y) > 0.8) {
        this.velocity.y = -this.velocity.y * this.bounceCoeff;
        this.velocity.x *= 0.85;
        this.velocity.z *= 0.85;
        this.state = BALL_STATE.LOOSE;
      } else {
        this.velocity.y = 0;
        this.velocity.multiplyScalar(0.94);
        if (this.velocity.lengthSq() < 0.15) {
          this.isMoving = false;
          this.state = BALL_STATE.FREE;
          if (!this.hasTriggeredEnd) {
            this.hasTriggeredEnd = true;
            if (onStopped) onStopped();
            else if (onMiss) onMiss();
          }
        }
      }
    }
    this.position.y = Math.max(this.radius, this.position.y);

    if (this.mesh) this.mesh.position.copy(this.position);

    // Zemin Gölgesi
    if (this.shadow) {
      this.shadow.position.x = this.position.x;
      this.shadow.position.z = this.position.z;
      const heightFactor = Math.max(0.1, 1 - (this.position.y / 7));
      this.shadow.scale.set(heightFactor, heightFactor, 1);
      this.shadow.material.opacity = 0.45 * heightFactor;
    }

    // Trail Kuyruk
    this.updateTrail();

    const goalAwayZ = stadium ? (stadium.goalAwayZ || -38) : -38;
    const goalHomeZ = stadium ? (stadium.goalHomeZ || 38) : 38;
    const halfW = 3.66;
    const goalH = 2.44;
    const postR = 0.08;

    // 6. DİREK ÇARPIŞMALARI (Her iki kalede)
    if (!this.hasHitPost) {
      [goalAwayZ, goalHomeZ].forEach(gZ => {
        if (Math.abs(this.position.z - gZ) < 0.28) {
          // Sol & Sağ Direk
          if ((Math.hypot(this.position.x - (-halfW), this.position.z - gZ) < postR + this.radius ||
               Math.hypot(this.position.x - halfW, this.position.z - gZ) < postR + this.radius) &&
               this.position.y <= goalH) {
            this.hasHitPost = true;
            this.velocity.x *= -0.9;
            this.velocity.z *= -0.7;
            if (window.gameSound) window.gameSound.playCrossbar();
            if (onPostHit) onPostHit();
          }
          // Üst Direk
          if (Math.abs(this.position.x) <= halfW && Math.abs(this.position.y - goalH) < postR + this.radius) {
            this.hasHitPost = true;
            this.velocity.y = -Math.abs(this.velocity.y) * 0.85;
            this.velocity.z *= -0.7;
            if (window.gameSound) window.gameSound.playCrossbar();
            if (onPostHit) onPostHit();
          }
        }
      });
    }

    // 7. GOL TESPİTİ (Away & Home Çift Kale)
    if (!this.hasScored && !this.hasBeenSaved) {
      // Away Kale (Z <= -38): Kullanıcı Gol Attı!
      if (this.position.z <= goalAwayZ && this.position.z >= goalAwayZ - 2.4) {
        if (Math.abs(this.position.x) < halfW - 0.05 && this.position.y < goalH - 0.05 && this.position.y > 0) {
          this.hasScored = true;
          this.hasTriggeredEnd = true;
          this.state = BALL_STATE.GOAL;
          if (stadium?.animateNetImpact) stadium.animateNetImpact('away');
          this.velocity.multiplyScalar(0.2); // Filede sönümlen
          if (window.gameSound) {
            window.gameSound.playNet();
            window.gameSound.playWhistle(true);
            window.gameSound.playGoalCheer();
          }
          if (onGoal) onGoal('home');
          return;
        }
      }

      // Home Kale (Z >= 38): Rakip Gol Attı!
      if (this.position.z >= goalHomeZ && this.position.z <= goalHomeZ + 2.4) {
        if (Math.abs(this.position.x) < halfW - 0.05 && this.position.y < goalH - 0.05 && this.position.y > 0) {
          this.hasScored = true;
          this.hasTriggeredEnd = true;
          this.state = BALL_STATE.GOAL;
          if (stadium?.animateNetImpact) stadium.animateNetImpact('home');
          this.velocity.multiplyScalar(0.2);
          if (window.gameSound) {
            window.gameSound.playNet();
            window.gameSound.playWhistle(true);
            window.gameSound.playGoalCheer();
          }
          if (onGoal) onGoal('away');
          return;
        }
      }
    }

    // 8. SAHA DIŞI (AUT / KAÇTI) TESPİTİ
    if (!this.hasScored && !this.hasTriggeredEnd) {
      if (this.position.z < goalAwayZ - 3.5 || this.position.z > goalHomeZ + 3.5) {
        this.hasTriggeredEnd = true;
        this.isMoving = false;
        if (window.gameSound) window.gameSound.playCrowdMiss();
        if (onMiss) onMiss();
      }
    }

    // 9. TAÇ ÇİZGİSİ YANSIMASI / SINIR KORUMASI (X = ±27.5)
    if (Math.abs(this.position.x) > 27.5) {
      this.position.x = Math.sign(this.position.x) * 27.4;
      this.velocity.x = -this.velocity.x * 0.5; // Reklam panosundan sekme
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
