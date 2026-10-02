// ==========================================================
// SES MOTORU (Web Audio API Synthesizer)
// Sıfır harici dosya bağımlılığı, anında yüklenme, 100% güvenilirlik
// ==========================================================

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
      this.initialized = true;
    } catch (e) {
      console.warn("AudioContext başlatılamadı:", e);
    }
  }

  ensureContext() {
    if (!this.initialized) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  // ŞUT / TOPA VURUŞ SESİ (3 KATMANLI SES MİMARİSİ: SUB-BASS + DERİ TOKADI + HAVA HIZI)
  playKick(power = 1) {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const clampedPower = Math.min(Math.max(power, 0.7), 1.6);
    
    // KATMAN 1: Derin Sub-Bass Göğüs Vuruşu (55Hz -> 28Hz)
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(65 * clampedPower, now);
    subOsc.frequency.exponentialRampToValueAtTime(26, now + 0.18);
    subGain.gain.setValueAtTime(0.95 * clampedPower, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);
    subOsc.connect(subGain);
    subGain.connect(this.ctx.destination);
    subOsc.start(now);
    subOsc.stop(now + 0.28);

    // KATMAN 2: Krampon & Deri Temas Tokadı (Orta Frekans Tranzient)
    const snapOsc = this.ctx.createOscillator();
    const snapGain = this.ctx.createGain();
    snapOsc.type = 'triangle';
    snapOsc.frequency.setValueAtTime(240 * clampedPower, now);
    snapOsc.frequency.exponentialRampToValueAtTime(45, now + 0.12);
    snapGain.gain.setValueAtTime(0.8 * clampedPower, now);
    snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
    snapOsc.connect(snapGain);
    snapGain.connect(this.ctx.destination);
    snapOsc.start(now);
    snapOsc.stop(now + 0.16);

    // KATMAN 3: Havanın Sıkışması ve Kumaş Sürtünme Hışırtısı (Cloth / Air Burst)
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.09);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, now);
    filter.frequency.exponentialRampToValueAtTime(400, now + 0.08);
    filter.Q.value = 2.5;

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.7 * clampedPower, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);

    noise.start(now);
  }

  // TRİVELA KAMÇILAMA & DÖNÜŞ SESİ (Ricardo Quaresma Dış Ayak Dilimi)
  playTrivelaWhip(power = 1) {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // 1. Dış Ayak Darbesi (Tok, elastik deri vuruşu)
    const kickOsc = this.ctx.createOscillator();
    const kickGain = this.ctx.createGain();
    kickOsc.type = 'sine';
    kickOsc.frequency.setValueAtTime(180 * power, now);
    kickOsc.frequency.exponentialRampToValueAtTime(38, now + 0.14);
    kickGain.gain.setValueAtTime(0.95 * Math.min(power, 1.2), now);
    kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    kickOsc.connect(kickGain);
    kickGain.connect(this.ctx.destination);
    kickOsc.start(now);
    kickOsc.stop(now + 0.24);

    // 2. Havayı Yaran Kamçı Hışırtısı (Whip Swoosh - Sweep Bandpass Filter)
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.32);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1);
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 4.2;
    // Frekans süpürmesi: 700Hz -> 3200Hz -> 600Hz (kamçılama rüzgarı)
    filter.frequency.setValueAtTime(700, now);
    filter.frequency.exponentialRampToValueAtTime(3400, now + 0.08);
    filter.frequency.exponentialRampToValueAtTime(450, now + 0.3);

    const whipGain = this.ctx.createGain();
    whipGain.gain.setValueAtTime(0.001, now);
    whipGain.gain.linearRampToValueAtTime(0.75 * power, now + 0.04);
    whipGain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

    noise.connect(filter);
    filter.connect(whipGain);
    whipGain.connect(this.ctx.destination);
    noise.start(now);

    // 3. Yüksek Frekanslı Burgu Harmonik Islığı (Late-Swerve Magnus Whistle)
    const spinOsc = this.ctx.createOscillator();
    const spinGain = this.ctx.createGain();
    spinOsc.type = 'triangle';
    spinOsc.frequency.setValueAtTime(420, now + 0.02);
    spinOsc.frequency.linearRampToValueAtTime(880, now + 0.12);
    spinOsc.frequency.linearRampToValueAtTime(260, now + 0.28);
    spinGain.gain.setValueAtTime(0.001, now + 0.02);
    spinGain.gain.linearRampToValueAtTime(0.22, now + 0.08);
    spinGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
    spinOsc.connect(spinGain);
    spinGain.connect(this.ctx.destination);
    spinOsc.start(now + 0.02);
    spinOsc.stop(now + 0.3);
  }

  // FÜZE / SERT ÜST VURUŞ SESİ (Patlama ve Derin Sub-Bass)
  playPowerStrike(power = 1.2) {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(190 * power, now);
    osc.frequency.exponentialRampToValueAtTime(24, now + 0.25);
    gain.gain.setValueAtTime(1.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.32);

    this.playKick(power);
  }

  // HAKEM DÜDÜĞÜ (İki frekanslı gerçekçi düdük titreşimi)
  playWhistle(isDouble = true) {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const playSingleWhistle = (startTime, duration) => {
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';

      // Gerçek düdük harmonikleri: 2750Hz ve 3000Hz (aralarındaki vuru farkı titreşim yaratır)
      osc1.frequency.setValueAtTime(2780, startTime);
      osc2.frequency.setValueAtTime(3010, startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.28, startTime + 0.03);
      gain.gain.setValueAtTime(0.28, startTime + duration - 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(startTime);
      osc2.start(startTime);
      osc1.stop(startTime + duration);
      osc2.stop(startTime + duration);
    };

    const now = this.ctx.currentTime;
    playSingleWhistle(now, 0.18);
    if (isDouble) {
      playSingleWhistle(now + 0.24, 0.35);
    }
  }

  // DİREĞE ÇARPMA SESİ (Metalik Çınlama)
  playCrossbar() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const freqs = [380, 720, 1140, 1920];

    freqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      const amp = 0.4 / (idx + 1);
      gain.gain.setValueAtTime(amp, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.75);
    });
  }

  // AĞLARA GİRME SESİ (File Hışırtısı)
  playNet() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const dur = 0.4;
    const bufferSize = this.ctx.sampleRate * dur;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.linearRampToValueAtTime(350, now + dur);
    filter.Q.value = 2;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(now);
  }

  // TARAFTAR GOL COŞKUSU (Büyük Stadyum Uğultusu ve Alkış)
  playGoalCheer() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const dur = 2.8;

    // Gürültü dalgası
    const bufferSize = this.ctx.sampleRate * dur;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1);
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(500, now);
    filter.frequency.linearRampToValueAtTime(1400, now + 0.6);
    filter.frequency.linearRampToValueAtTime(600, now + dur);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.65, now + 0.4);
    gain.gain.setValueAtTime(0.65, now + 1.8);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(now);
  }

  // KAÇAN FIRSAT / AH ÇEKME SESİ
  playCrowdMiss() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const dur = 1.2;

    const bufferSize = this.ctx.sampleRate * dur;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1);
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(700, now);
    filter.frequency.exponentialRampToValueAtTime(300, now + dur);
    filter.Q.value = 3;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(now);
  }

  // KALECİ KURTARIŞ SESİ (Eldiven Tokadı)
  playSave() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.12);

    gain.gain.setValueAtTime(0.7, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.18);
  }

  // PAS SESİ (Hafif Top Tıkırtısı)
  playPass() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.09);

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  // MEMNUN SEYİRCİ & ALKIŞ UĞULTUSU (Başarılı Pas, Çalım veya Kritik Kurtarışta)
  playPleasedCrowd() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const dur = 1.6;

    const bufferSize = Math.floor(this.ctx.sampleRate * dur);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.5;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(650, now);
    filter.frequency.linearRampToValueAtTime(1100, now + 0.5);
    filter.frequency.exponentialRampToValueAtTime(450, now + dur);
    filter.Q.value = 1.8;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.4, now + 0.3);
    gain.gain.setValueAtTime(0.4, now + 0.9);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(now);
  }

  // KUPA ŞAMPİYONLUK FANFARI (Turnuva Zaferi / Büyük Kupa Kaldırma Marşı)
  playTrophyFanfare() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Görkemli Pirinç Üflemeli Majör Akor Notasyonları: C4, E4, G4, C5
    const notes = [
      { f: 261.63, start: 0.00, dur: 0.25 }, // Do
      { f: 329.63, start: 0.22, dur: 0.25 }, // Mi
      { f: 392.00, start: 0.44, dur: 0.35 }, // Sol
      { f: 523.25, start: 0.75, dur: 1.10 }, // Yüksek Do (Uzun Zafer Sesi)
      { f: 659.25, start: 0.90, dur: 0.95 }  // Yüksek Mi (Harmonik Zirve)
    ];

    notes.forEach(n => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.f, now + n.start);

      gain.gain.setValueAtTime(0.001, now + n.start);
      gain.gain.linearRampToValueAtTime(0.35, now + n.start + 0.05);
      gain.gain.setValueAtTime(0.35, now + n.start + n.dur - 0.1);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + n.start + n.dur);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + n.start);
      osc.stop(now + n.start + n.dur + 0.05);
    });

    // Arkadan büyük şampiyonluk alkışı
    setTimeout(() => {
      this.playGoalCheer();
    }, 400);
  }
}

// Global ses nesnesi
window.gameSound = new SoundEngine();
