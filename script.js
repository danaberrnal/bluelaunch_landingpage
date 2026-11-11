/**
 * BLUE LAUNCH - ROCKET TEC SINALOA | PROYECTO FINAL F1025
 * Banda sonora emocional cinematográfica, Simulador de Despegue y Paracaídas (WOW),
 * Efectos 3D Tilt, Túnel de Viento y Despiece Técnico.
 */

// ============================================================================
// 1. STARFIELD CON METEORITOS Y POLVO ESTELAR INTERACTIVO
// ============================================================================
class CosmicStarfield {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.stars = [];
    this.shootingStars = [];
    this.stardust = [];
    this.numStars = 220;
    this.mouseX = 0;
    this.mouseY = 0;

    this.init();
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('mousemove', (e) => {
      this.mouseX = (e.clientX - window.innerWidth / 2) * 0.04;
      this.mouseY = (e.clientY - window.innerHeight / 2) * 0.04;

      // Generar partículas de polvo estelar al mover el cursor
      if (Math.random() > 0.4) {
        this.stardust.push({
          x: e.clientX,
          y: e.clientY,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5,
          size: Math.random() * 2.5 + 1,
          color: Math.random() > 0.5 ? '#D4AF37' : '#38BDF8',
          life: 1.0
        });
      }
    });

    // Crear estrellas fugaces cada cierto tiempo
    setInterval(() => {
      if (Math.random() > 0.3) {
        this.spawnShootingStar();
      }
    }, 3500);
  }

  init() {
    this.resize();
    this.stars = [];
    for (let i = 0; i < this.numStars; i++) {
      this.stars.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 0.3 + 0.08,
        opacity: Math.random() * 0.8 + 0.2,
        twinkleSpeed: Math.random() * 0.03 + 0.01,
        color: Math.random() > 0.8 ? '#D4AF37' : (Math.random() > 0.6 ? '#38BDF8' : '#FFFFFF')
      });
    }
    this.animate();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  spawnShootingStar() {
    this.shootingStars.push({
      x: Math.random() * this.canvas.width * 0.8,
      y: Math.random() * this.canvas.height * 0.4,
      length: Math.random() * 100 + 60,
      speed: Math.random() * 12 + 10,
      angle: Math.PI / 4 + (Math.random() - 0.5) * 0.2,
      opacity: 1.0
    });
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 1. Estrellas de fondo
    for (let s of this.stars) {
      s.y -= s.speed;
      if (s.y < 0) {
        s.y = this.canvas.height;
        s.x = Math.random() * this.canvas.width;
      }

      s.opacity += Math.sin(Date.now() * s.twinkleSpeed) * 0.015;
      s.opacity = Math.max(0.1, Math.min(1, s.opacity));

      const drawX = s.x + this.mouseX * s.speed;
      const drawY = s.y + this.mouseY * s.speed;

      this.ctx.beginPath();
      this.ctx.arc(drawX, drawY, s.size, 0, Math.PI * 2);
      this.ctx.fillStyle = s.color;
      this.ctx.globalAlpha = s.opacity;
      if (s.size > 1.6) {
        this.ctx.shadowBlur = 8;
        this.ctx.shadowColor = s.color;
      }
      this.ctx.fill();
    }
    this.ctx.shadowBlur = 0;

    // 2. Estrellas fugaces (Meteoritos)
    for (let i = this.shootingStars.length - 1; i >= 0; i--) {
      const ss = this.shootingStars[i];
      ss.x += Math.cos(ss.angle) * ss.speed;
      ss.y += Math.sin(ss.angle) * ss.speed;
      ss.opacity -= 0.018;

      if (ss.opacity <= 0) {
        this.shootingStars.splice(i, 1);
        continue;
      }

      const tailX = ss.x - Math.cos(ss.angle) * ss.length;
      const tailY = ss.y - Math.sin(ss.angle) * ss.length;

      const grad = this.ctx.createLinearGradient(tailX, tailY, ss.x, ss.y);
      grad.addColorStop(0, 'rgba(212, 175, 55, 0)');
      grad.addColorStop(0.7, 'rgba(212, 175, 55, 0.4)');
      grad.addColorStop(1, `rgba(255, 255, 255, ${ss.opacity})`);

      this.ctx.beginPath();
      this.ctx.moveTo(tailX, tailY);
      this.ctx.lineTo(ss.x, ss.y);
      this.ctx.strokeStyle = grad;
      this.ctx.lineWidth = 2.5;
      this.ctx.globalAlpha = ss.opacity;
      this.ctx.stroke();
    }

    // 3. Polvo estelar interactivo del cursor
    for (let i = this.stardust.length - 1; i >= 0; i--) {
      const p = this.stardust[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.02;

      if (p.life <= 0) {
        this.stardust.splice(i, 1);
        continue;
      }

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.life * 0.7;
      this.ctx.fill();
    }

    this.ctx.globalAlpha = 1;
    requestAnimationFrame(() => this.animate());
  }
}

// ============================================================================
// 2. BANDA SONORA EMOCIONAL DE PELÍCULA ESPACIAL (WEB AUDIO API)
//    Estilo Hans Zimmer (Interstellar / First Man / Apollo 13)
// ============================================================================
class EmotionalCinemaAudio {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.masterGain = null;
    this.analyser = null;
    this.visualizerCanvas = document.getElementById('audio-visualizer');
    this.visualizerCtx = this.visualizerCanvas ? this.visualizerCanvas.getContext('2d') : null;
    this.activeNodes = [];
    this.sequenceTimer = null;
    this.volume = 0.55;
    this.chordIndex = 0;

    // Progresión de acordes emotivos (D menor - Bb Mayor - F Mayor - C Mayor)
    this.chords = [
      { name: 'Dm9', root: 73.42, notes: [146.83, 220.0, 261.63, 329.63, 440.0] },      // D3, A3, C4, E4, A4
      { name: 'Bbmaj7', root: 58.27, notes: [116.54, 174.61, 233.08, 293.66, 349.23] },  // Bb2, F3, Bb3, D4, F4
      { name: 'Fsus2', root: 87.31, notes: [174.61, 261.63, 349.23, 392.00, 523.25] },   // F3, C4, F4, G4, C5
      { name: 'C/E', root: 65.41, notes: [130.81, 196.00, 261.63, 329.63, 392.00] }      // C3, G3, C4, E4, G4
    ];

    this.initVisualizer();
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);

      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 64;

      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggle() {
    this.init();
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, parseFloat(val)));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
  }

  start() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.chordIndex = 0;
    this.playChordCycle();
  }

  playChordCycle() {
    if (!this.isPlaying || !this.ctx) return;

    const chord = this.chords[this.chordIndex];
    const duration = 4.8; // Duración de cada acorde en segundos
    const now = this.ctx.currentTime;

    // 1. Sub-Bajo Cinematográfico Cálido
    const bassOsc = this.ctx.createOscillator();
    const bassGain = this.ctx.createGain();
    const bassFilter = this.ctx.createBiquadFilter();

    bassOsc.type = 'triangle';
    bassOsc.frequency.setValueAtTime(chord.root, now);

    bassFilter.type = 'lowpass';
    bassFilter.frequency.setValueAtTime(140, now);

    bassGain.gain.setValueAtTime(0.001, now);
    bassGain.gain.linearRampToValueAtTime(0.24, now + 1.2);
    bassGain.gain.setValueAtTime(0.24, now + duration - 1.0);
    bassGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    bassOsc.connect(bassFilter);
    bassFilter.connect(bassGain);
    bassGain.connect(this.masterGain);

    bassOsc.start(now);
    bassOsc.stop(now + duration + 0.1);
    this.activeNodes.push(bassOsc, bassGain, bassFilter);

    // 2. Colchón de Órgano / Cuerdas Espaciales (Interstellar Pipe Swell)
    chord.notes.forEach((freq, idx) => {
      const padOsc = this.ctx.createOscillator();
      const padGain = this.ctx.createGain();
      const padFilter = this.ctx.createBiquadFilter();

      padOsc.type = idx % 2 === 0 ? 'sine' : 'sawtooth';
      // Ligero detune para efecto orquestal
      padOsc.frequency.setValueAtTime(freq + (Math.random() - 0.5) * 1.2, now);

      padFilter.type = 'lowpass';
      padFilter.frequency.setValueAtTime(280, now);
      padFilter.frequency.linearRampToValueAtTime(520, now + duration * 0.5);
      padFilter.frequency.linearRampToValueAtTime(280, now + duration);

      padGain.gain.setValueAtTime(0.001, now);
      padGain.gain.linearRampToValueAtTime(0.065, now + 1.5);
      padGain.gain.setValueAtTime(0.065, now + duration - 0.8);
      padGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      padOsc.connect(padFilter);
      padFilter.connect(padGain);
      padGain.connect(this.masterGain);

      padOsc.start(now);
      padOsc.stop(now + duration + 0.1);
      this.activeNodes.push(padOsc, padGain, padFilter);
    });

    // 3. Arpegio Emocional de Piano / Celesta Espacial
    const arpNotes = [...chord.notes, chord.notes[1] * 2, chord.notes[2] * 2];
    const stepTime = duration / arpNotes.length;
    arpNotes.forEach((noteFreq, i) => {
      const noteTime = now + i * stepTime;
      const arpOsc = this.ctx.createOscillator();
      const arpGain = this.ctx.createGain();

      arpOsc.type = 'sine';
      arpOsc.frequency.setValueAtTime(noteFreq, noteTime);

      arpGain.gain.setValueAtTime(0.001, noteTime);
      arpGain.gain.exponentialRampToValueAtTime(0.045, noteTime + 0.08);
      arpGain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 1.5);

      arpOsc.connect(arpGain);
      arpGain.connect(this.masterGain);

      arpOsc.start(noteTime);
      arpOsc.stop(noteTime + 1.6);
      this.activeNodes.push(arpOsc, arpGain);
    });

    // Avanzar al siguiente acorde
    this.chordIndex = (this.chordIndex + 1) % this.chords.length;
    this.sequenceTimer = setTimeout(() => {
      this.playChordCycle();
    }, (duration - 0.3) * 1000);
  }

  stop() {
    this.isPlaying = false;
    clearTimeout(this.sequenceTimer);
    this.activeNodes.forEach(n => {
      try {
        if (n.stop) n.stop();
        if (n.disconnect) n.disconnect();
      } catch (e) {}
    });
    this.activeNodes = [];
  }

  // Sonido de Beep de Telemetría
  playBeep(frequency = 950, duration = 0.12) {
    this.init();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  // Sonido de Pop de Apertura de Paracaídas (Eyección)
  playParachutePop() {
    this.init();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(60, this.ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.18);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.18);
  }

  // Rugido de Motor de Cohete a Escala
  playRocketBurn() {
    this.init();
    const bufferSize = this.ctx.sampleRate * 2.5;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1);
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(250, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.8);
    filter.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 2.5);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.35, this.ctx.currentTime + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 2.5);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start();
  }

  playClick() {
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch(e) {}
  }

  initVisualizer() {
    if (!this.visualizerCanvas || !this.visualizerCtx) return;
    const draw = () => {
      requestAnimationFrame(draw);
      this.visualizerCtx.clearRect(0, 0, this.visualizerCanvas.width, this.visualizerCanvas.height);

      const numBars = 5;
      const barWidth = 6;
      const gap = 3;

      if (!this.isPlaying || !this.analyser) {
        this.visualizerCtx.fillStyle = 'rgba(212, 175, 55, 0.3)';
        for (let i = 0; i < numBars; i++) {
          this.visualizerCtx.fillRect(i * (barWidth + gap), 14, barWidth, 3);
        }
        return;
      }

      const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      this.analyser.getByteFrequencyData(dataArray);

      this.visualizerCtx.fillStyle = '#D4AF37';
      for (let i = 0; i < numBars; i++) {
        const val = dataArray[i * 2] || 0;
        const barHeight = Math.max(3, (val / 255) * this.visualizerCanvas.height);
        const y = this.visualizerCanvas.height - barHeight;
        this.visualizerCtx.fillRect(i * (barWidth + gap), y, barWidth, barHeight);
      }
    };
    draw();
  }
}

const emotionalAudio = new EmotionalCinemaAudio();

// ============================================================================
// 3. EFECTO WOW: 3D TILT CARDS CON REFLEJO HOLOGRÁFICO
// ============================================================================
function init3DTiltCards() {
  const cards = document.querySelectorAll('.tilt-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -9; // Max 9 deg
      const rotateY = ((x - centerX) / centerX) * 9;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
  });
}

// ============================================================================
// 4. SIMULADOR WOW DE DESPEGUE, APOGEO Y PARACAÍDAS DEL COHETE PEQUEÑO
// ============================================================================
class SmallRocketLaunchSimulator {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    // Controls
    this.motorSelect = document.getElementById('sim-motor-class');
    this.massSlider = document.getElementById('sim-rocket-mass');
    this.massVal = document.getElementById('val-rocket-mass');
    this.chuteSlider = document.getElementById('sim-chute-size');
    this.chuteVal = document.getElementById('val-chute-size');

    // Telemetry Elements
    this.telAlt = document.getElementById('tel-wow-alt');
    this.telVel = document.getElementById('tel-wow-vel');
    this.telAcc = document.getElementById('tel-wow-acc');
    this.telTime = document.getElementById('tel-wow-time');
    this.hudPhase = document.getElementById('sim-hud-phase');
    this.hudAlt = document.getElementById('sim-hud-alt');

    this.btnLaunch = document.getElementById('btn-wow-launch');
    this.btnReset = document.getElementById('btn-wow-reset');

    // State
    this.state = 'PAD'; // 'PAD', 'BOOST', 'COAST', 'APOGEE', 'DESCENT', 'LANDED'
    this.altitude = 0; // meters
    this.velocity = 0; // m/s
    this.acceleration = 0; // m/s^2
    this.flightTime = 0; // s
    this.maxAltitude = 0;
    this.particles = [];
    this.smokePuffs = [];
    this.parachuteAngle = 0;

    this.bind();
    this.draw();
  }

  bind() {
    if (this.massSlider && this.massVal) {
      this.massSlider.addEventListener('input', () => {
        this.massVal.textContent = `${this.massSlider.value} g`;
      });
    }

    if (this.chuteSlider && this.chuteVal) {
      this.chuteSlider.addEventListener('input', () => {
        this.chuteVal.textContent = `${this.chuteSlider.value} cm`;
      });
    }

    if (this.btnLaunch) {
      this.btnLaunch.addEventListener('click', () => {
        emotionalAudio.playClick();
        if (this.state === 'PAD' || this.state === 'LANDED') {
          this.launch();
        }
      });
    }

    if (this.btnReset) {
      this.btnReset.addEventListener('click', () => {
        emotionalAudio.playClick();
        this.reset();
      });
    }
  }

  launch() {
    this.state = 'BOOST';
    this.altitude = 0;
    this.velocity = 0;
    this.acceleration = 0;
    this.flightTime = 0;
    this.maxAltitude = 0;
    this.particles = [];
    this.smokePuffs = [];

    if (this.btnLaunch) {
      this.btnLaunch.disabled = true;
      this.btnLaunch.innerHTML = '🚀 ¡EN VUELO!';
    }

    // Sonido de encendido del motor
    emotionalAudio.playRocketBurn();
    this.lastTime = performance.now();
    this.loop();
  }

  reset() {
    this.state = 'PAD';
    this.altitude = 0;
    this.velocity = 0;
    this.acceleration = 0;
    this.flightTime = 0;
    this.particles = [];
    this.smokePuffs = [];

    if (this.btnLaunch) {
      this.btnLaunch.disabled = false;
      this.btnLaunch.innerHTML = '🚀 Despegar Cohete Pequeño';
    }

    this.updateHUD();
    this.draw();
  }

  loop() {
    if (this.state === 'LANDED') return;

    const now = performance.now();
    const dt = Math.min((now - (this.lastTime || now)) / 1000, 0.05);
    this.lastTime = now;

    this.updatePhysics(dt);
    this.draw();
    this.updateHUD();

    requestAnimationFrame(() => this.loop());
  }

  updatePhysics(dt) {
    this.flightTime += dt;

    // Configuración según motor elegido
    // Clase D: Empuje medio 14 N durante 1.8 s
    // Clase E: Empuje medio 24 N durante 2.3 s
    const motorType = this.motorSelect ? this.motorSelect.value : 'D';
    const burnDuration = motorType === 'E' ? 2.3 : 1.8;
    const averageThrust = motorType === 'E' ? 24 : 14;

    const totalMassKg = parseFloat(this.massSlider ? this.massSlider.value : 380) / 1000;
    const g = 9.81;

    let thrust = 0;
    if (this.flightTime <= burnDuration) {
      this.state = 'BOOST';
      thrust = averageThrust;

      // Partículas intensas de fuego y humo
      for (let i = 0; i < 4; i++) {
        this.particles.push({
          x: (Math.random() - 0.5) * 8,
          y: Math.random() * 6,
          vx: (Math.random() - 0.5) * 15,
          vy: Math.random() * 60 + 30,
          size: Math.random() * 8 + 4,
          life: 1.0,
          color: Math.random() > 0.4 ? '#f59e0b' : '#ef4444'
        });
      }
    } else if (this.velocity > 0) {
      this.state = 'COAST';
      thrust = 0;
    } else if (this.state === 'COAST' && this.velocity <= 0) {
      // ¡ALCANZÓ EL APOGEO! ACTIVAR PARACAÍDAS
      this.state = 'APOGEE';
      this.maxAltitude = this.altitude;
      emotionalAudio.playParachutePop();

      // Nube de humo de eyección pirotécnica
      for (let i = 0; i < 20; i++) {
        this.smokePuffs.push({
          x: (Math.random() - 0.5) * 20,
          y: (Math.random() - 0.5) * 20,
          vx: (Math.random() - 0.5) * 30,
          vy: (Math.random() - 0.5) * 30,
          size: Math.random() * 12 + 6,
          life: 1.0
        });
      }

      setTimeout(() => {
        if (this.state === 'APOGEE') this.state = 'DESCENT';
      }, 350);
    }

    // Fuerzas aerodinámicas
    // En descenso con paracaídas: F_arrastre = 0.5 * rho * v^2 * Cd_paracaidas * Area
    const chuteDiameterM = parseFloat(this.chuteSlider ? this.chuteSlider.value : 45) / 100;
    const chuteArea = Math.PI * Math.pow(chuteDiameterM / 2, 2);
    const Cd = (this.state === 'DESCENT' || this.state === 'APOGEE') ? 1.5 : 0.35;
    const effectiveArea = (this.state === 'DESCENT' || this.state === 'APOGEE') ? chuteArea : 0.002;

    const rho = 1.2; // kg/m^3
    const dragForce = 0.5 * rho * Math.pow(this.velocity, 2) * Cd * effectiveArea * Math.sign(this.velocity);
    const weightForce = totalMassKg * g;

    const netForce = thrust - dragForce - weightForce;
    this.acceleration = netForce / totalMassKg;

    // Si ya está descendiendo con paracaídas, velocidad terminal controlada
    if (this.state === 'DESCENT') {
      const terminalVelocity = -Math.sqrt((2 * weightForce) / (rho * Cd * effectiveArea));
      this.velocity += (terminalVelocity - this.velocity) * 4 * dt;
    } else {
      this.velocity += this.acceleration * dt;
    }

    this.altitude += this.velocity * dt;

    if (this.altitude > this.maxAltitude) {
      this.maxAltitude = this.altitude;
    }

    // Aterrizaje
    if (this.altitude <= 0 && this.flightTime > 1.0) {
      this.altitude = 0;
      this.velocity = 0;
      this.acceleration = 0;
      this.state = 'LANDED';
      emotionalAudio.playBeep(1200, 0.3);

      if (this.btnLaunch) {
        this.btnLaunch.disabled = false;
        this.btnLaunch.innerHTML = '🔄 Lanzar Nuevamente';
      }
    }

    // Actualizar partículas
    for (let p of this.particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.size += dt * 10;
      p.life -= dt * 2.5;
    }
    this.particles = this.particles.filter(p => p.life > 0);

    for (let s of this.smokePuffs) {
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.size += dt * 12;
      s.life -= dt * 1.5;
    }
    this.smokePuffs = this.smokePuffs.filter(s => s.life > 0);

    this.parachuteAngle = Math.sin(this.flightTime * 3) * 0.15;
  }

  updateHUD() {
    if (this.telAlt) this.telAlt.textContent = `${this.altitude.toFixed(1)} m`;
    if (this.telVel) this.telVel.textContent = `${this.velocity.toFixed(1)} m/s`;
    if (this.telAcc) this.telAcc.textContent = `${(this.acceleration / 9.81).toFixed(1)} g`;
    if (this.telTime) this.telTime.textContent = `${this.flightTime.toFixed(1)} s`;

    if (this.hudAlt) this.hudAlt.textContent = `ALT: ${this.altitude.toFixed(1)}m (MAX: ${this.maxAltitude.toFixed(1)}m)`;

    if (this.hudPhase) {
      const phases = {
        'PAD': 'EN PLATAFORMA (ESPERA)',
        'BOOST': '🔥 FASE DE EMPUJE (MOTOR ACTIVO)',
        'COAST': '🚀 VUELO INERCIAL (SUBIENDO)',
        'APOGEE': '⭐ APOGEO (EYECCIÓN)',
        'DESCENT': '🪂 DESCENSO CON PARACAÍDAS',
        'LANDED': '✅ RECUPERADO CON ÉXITO'
      };
      this.hudPhase.textContent = phases[this.state] || this.state;
    }
  }

  draw() {
    const w = this.canvas.width = this.canvas.parentElement.clientWidth;
    const h = this.canvas.height = 480;

    // Cielo diurno con transición de altitud (Cielo azul despejado de campo de pruebas)
    const skyGrad = this.ctx.createLinearGradient(0, 0, 0, h);
    if (this.altitude < 100) {
      skyGrad.addColorStop(0, '#1a365d');
      skyGrad.addColorStop(0.7, '#2b6cb0');
      skyGrad.addColorStop(1, '#63b3ed');
    } else {
      skyGrad.addColorStop(0, '#0c1a30');
      skyGrad.addColorStop(0.8, '#1a365d');
      skyGrad.addColorStop(1, '#2b6cb0');
    }
    this.ctx.fillStyle = skyGrad;
    this.ctx.fillRect(0, 0, w, h);

    // Suelo / Pasto de la zona de lanzamiento
    const groundHeight = 70;
    const groundY = h - groundHeight;

    // Desplazamiento de cámara: si el cohete sube, el suelo baja
    const camOffset = Math.min(this.altitude * 1.5, 300);

    // Dibujar suelo
    this.ctx.fillStyle = '#22543d';
    this.ctx.fillRect(0, groundY + camOffset, w, groundHeight + 200);

    // Línea de horizonte de pasto
    this.ctx.fillStyle = '#276749';
    this.ctx.fillRect(0, groundY + camOffset, w, 8);

    // Torre / Riel de lanzamiento
    const padX = w / 2;
    const padBaseY = groundY + camOffset;

    this.ctx.strokeStyle = '#D4AF37';
    this.ctx.lineWidth = 2.5;
    this.ctx.beginPath();
    this.ctx.moveTo(padX, padBaseY);
    this.ctx.lineTo(padX, padBaseY - 80);
    this.ctx.stroke();

    // Base trípode
    this.ctx.beginPath();
    this.ctx.moveTo(padX - 25, padBaseY);
    this.ctx.lineTo(padX, padBaseY - 15);
    this.ctx.lineTo(padX + 25, padBaseY);
    this.ctx.stroke();

    // Posición del cohete en pantalla
    // Cohete sube en pantalla hasta la mitad, luego la cámara lo sigue
    let rocketDrawY = padBaseY - 30;
    if (this.altitude < 150) {
      rocketDrawY = padBaseY - 30 - this.altitude * 1.6;
    } else {
      rocketDrawY = h / 2 - 40;
    }

    // Partículas de escape en el suelo
    for (let p of this.particles) {
      this.ctx.beginPath();
      this.ctx.arc(padX + p.x, rocketDrawY + 35 + p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.life * 0.8;
      this.ctx.fill();
    }

    // Humo de eyección
    for (let s of this.smokePuffs) {
      this.ctx.beginPath();
      this.ctx.arc(padX + s.x, rocketDrawY + s.y, s.size, 0, Math.PI * 2);
      this.ctx.fillStyle = '#CBD5E1';
      this.ctx.globalAlpha = s.life * 0.7;
      this.ctx.fill();
    }
    this.ctx.globalAlpha = 1;

    // DIBUJAR COHETE PEQUEÑO BLUE LAUNCH
    this.ctx.save();
    this.ctx.translate(padX, rocketDrawY);

    if (this.state === 'DESCENT') {
      this.ctx.rotate(this.parachuteAngle);

      // PARACAÍDAS DESPLEGADO (WOW)
      // Cúpula semiesférica de nylon ripstop naranja y oro
      this.ctx.save();
      this.ctx.translate(0, -65);

      // Cúpula
      this.ctx.beginPath();
      this.ctx.arc(0, 0, 36, Math.PI, 0);
      this.ctx.fillStyle = '#F59E0B';
      this.ctx.fill();
      this.ctx.lineWidth = 2;
      this.ctx.strokeStyle = '#D4AF37';
      this.ctx.stroke();

      // Franjas de color en la cúpula
      this.ctx.beginPath();
      this.ctx.arc(0, 0, 36, Math.PI * 1.25, Math.PI * 1.75);
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.fill();

      // Cuerdas de suspensión (Shroud lines)
      this.ctx.strokeStyle = '#FFFFFF';
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.moveTo(-36, 0);
      this.ctx.lineTo(0, 45);
      this.ctx.moveTo(-18, 0);
      this.ctx.lineTo(0, 45);
      this.ctx.moveTo(18, 0);
      this.ctx.lineTo(0, 45);
      this.ctx.moveTo(36, 0);
      this.ctx.lineTo(0, 45);
      this.ctx.stroke();
      this.ctx.restore();
    }

    // Cuerpo del Cohete a Escala
    // Fuselaje cilíndrico
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.strokeStyle = '#0D183E';
    this.ctx.lineWidth = 1.5;
    this.ctx.fillRect(-7, -20, 14, 50);
    this.ctx.strokeRect(-7, -20, 14, 50);

    // Franja Azul Profundo oficial
    this.ctx.fillStyle = '#0D183E';
    this.ctx.fillRect(-7, -5, 14, 12);

    // Ojiva dorada (Nose Cone)
    this.ctx.fillStyle = '#D4AF37';
    this.ctx.beginPath();
    this.ctx.moveTo(-7, -20);
    this.ctx.quadraticCurveTo(0, -42, 0, -42);
    this.ctx.quadraticCurveTo(0, -42, 7, -20);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();

    // Aletas estabilizadoras
    this.ctx.fillStyle = '#0D183E';
    // Aleta izquierda
    this.ctx.beginPath();
    this.ctx.moveTo(-7, 18);
    this.ctx.lineTo(-18, 32);
    this.ctx.lineTo(-7, 28);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();

    // Aleta derecha
    this.ctx.beginPath();
    this.ctx.moveTo(7, 18);
    this.ctx.lineTo(18, 32);
    this.ctx.lineTo(7, 28);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();

    // Tobera / Motor
    this.ctx.fillStyle = '#475569';
    this.ctx.fillRect(-4, 30, 8, 5);

    // Llama activa si está en fase BOOST
    if (this.state === 'BOOST') {
      const flameH = 20 + Math.random() * 15;
      this.ctx.beginPath();
      this.ctx.moveTo(-5, 35);
      this.ctx.lineTo(0, 35 + flameH);
      this.ctx.lineTo(5, 35);
      this.ctx.fillStyle = '#f59e0b';
      this.ctx.shadowBlur = 15;
      this.ctx.shadowColor = '#f59e0b';
      this.ctx.fill();

      this.ctx.beginPath();
      this.ctx.moveTo(-2, 35);
      this.ctx.lineTo(0, 35 + flameH * 0.6);
      this.ctx.lineTo(2, 35);
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fill();
      this.ctx.shadowBlur = 0;
    }

    this.ctx.restore();
  }
}

// ============================================================================
// 5. TÚNEL DE VIENTO INTERACTIVO (AERODYNAMICS WOW)
// ============================================================================
class AerodynamicWindTunnel {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    this.speedSlider = document.getElementById('wt-speed');
    this.speedVal = document.getElementById('val-wt-speed');
    this.angleSlider = document.getElementById('wt-angle');
    this.angleVal = document.getElementById('val-wt-angle');

    this.streamlines = [];
    this.numLines = 45;

    this.init();
    this.bind();
  }

  init() {
    this.resize();
    this.streamlines = [];
    for (let i = 0; i < this.numLines; i++) {
      this.streamlines.push({
        x: Math.random() * this.canvas.width,
        y: (i / this.numLines) * this.canvas.height,
        baseY: (i / this.numLines) * this.canvas.height,
        speed: Math.random() * 2 + 4,
        length: Math.random() * 35 + 20
      });
    }
    this.animate();
  }

  resize() {
    this.canvas.width = this.canvas.parentElement.clientWidth;
    this.canvas.height = 360;
  }

  bind() {
    if (this.speedSlider && this.speedVal) {
      this.speedSlider.addEventListener('input', () => {
        this.speedVal.textContent = `${this.speedSlider.value} m/s`;
      });
    }
    if (this.angleSlider && this.angleVal) {
      this.angleSlider.addEventListener('input', () => {
        this.angleVal.textContent = `${this.angleSlider.value}°`;
      });
    }
    window.addEventListener('resize', () => this.resize());
  }

  animate() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    const windSpeedMul = parseFloat(this.speedSlider ? this.speedSlider.value : 20) / 10;
    const angleDeg = parseFloat(this.angleSlider ? this.angleSlider.value : 0);
    const angleRad = (angleDeg * Math.PI) / 180;

    this.ctx.fillStyle = '#060A1A';
    this.ctx.fillRect(0, 0, w, h);

    const rocketX = w / 2;
    const rocketY = h / 2;

    // Dibujar líneas de corriente
    for (let line of this.streamlines) {
      line.x += line.speed * windSpeedMul;
      if (line.x > w) {
        line.x = 0;
      }

      // Desviación aerodinámica alrededor del cohete
      const dx = line.x - rocketX;
      const distY = line.baseY - rocketY;
      let curveOffset = 0;

      // Si está cerca del cohete, la línea de flujo se curva
      if (Math.abs(dx) < 90 && Math.abs(distY) < 55) {
        const factor = (1 - Math.abs(dx) / 90);
        curveOffset = Math.sign(distY || 1) * factor * 22;
      }

      const drawY = line.baseY + curveOffset;

      this.ctx.beginPath();
      this.ctx.moveTo(line.x - line.length, drawY);
      this.ctx.lineTo(line.x, drawY);

      // Color de presión aerodinámica
      const isHighPressure = Math.abs(dx) < 60 && Math.abs(distY) < 30;
      this.ctx.strokeStyle = isHighPressure ? '#F59E0B' : '#38BDF8';
      this.ctx.lineWidth = isHighPressure ? 2 : 1.2;
      this.ctx.globalAlpha = 0.65;
      this.ctx.stroke();
    }
    this.ctx.globalAlpha = 1;

    // Dibujar Cohete en el Túnel con ángulo de ataque
    this.ctx.save();
    this.ctx.translate(rocketX, rocketY);
    this.ctx.rotate(-Math.PI / 2 + angleRad); // Horizontal en túnel

    // Fuselaje
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.strokeStyle = '#D4AF37';
    this.ctx.lineWidth = 1.5;
    this.ctx.fillRect(-10, -35, 20, 70);
    this.ctx.strokeRect(-10, -35, 20, 70);

    // Ojiva
    this.ctx.fillStyle = '#D4AF37';
    this.ctx.beginPath();
    this.ctx.moveTo(-10, -35);
    this.ctx.quadraticCurveTo(0, -65, 0, -65);
    this.ctx.quadraticCurveTo(0, -65, 10, -35);
    this.ctx.closePath();
    this.ctx.fill();

    // Aletas
    this.ctx.fillStyle = '#0D183E';
    this.ctx.beginPath();
    this.ctx.moveTo(-10, 15);
    this.ctx.lineTo(-26, 35);
    this.ctx.lineTo(-10, 30);
    this.ctx.closePath();
    this.ctx.fill();

    this.ctx.beginPath();
    this.ctx.moveTo(10, 15);
    this.ctx.lineTo(26, 35);
    this.ctx.lineTo(10, 30);
    this.ctx.closePath();
    this.ctx.fill();

    this.ctx.restore();

    requestAnimationFrame(() => this.animate());
  }
}

// ============================================================================
// 6. DESPIECE EXPLOSIVO DEL COHETE (EXPLODED VIEW INSPECTOR)
// ============================================================================
class ExplodedRocketInspector {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.exploded = true;
    this.btnToggle = document.getElementById('btn-toggle-exploded');
    this.selectedPart = 'all';

    this.parts = document.querySelectorAll('.part-item');
    this.bind();
    this.draw();
  }

  bind() {
    if (this.btnToggle) {
      this.btnToggle.addEventListener('click', () => {
        emotionalAudio.playClick();
        this.exploded = !this.exploded;
        this.btnToggle.textContent = this.exploded ? '🔧 Modo Ensamblado' : '💥 Modo Despiece (Exploded)';
        this.draw();
      });
    }

    this.parts.forEach(p => {
      p.addEventListener('click', () => {
        emotionalAudio.playClick();
        this.parts.forEach(item => item.classList.remove('active'));
        p.classList.add('active');
        this.selectedPart = p.getAttribute('data-part');
        this.draw();
      });
    });
  }

  draw() {
    const w = this.canvas.width = this.canvas.parentElement.clientWidth;
    const h = this.canvas.height = 440;

    this.ctx.clearRect(0, 0, w, h);

    const centerX = w / 2;
    // Si está explotado, los componentes se separan verticalmente
    const gap = this.exploded ? 55 : 0;
    let currentY = 70;

    // 1. Ojiva
    this.drawNoseCone(centerX, currentY, this.selectedPart === 'nose');
    currentY += 45 + gap;

    // 2. Bahía de Aviónica & Altímetro
    this.drawAvionics(centerX, currentY, this.selectedPart === 'avionics');
    currentY += 40 + gap;

    // 3. Paracaídas
    this.drawParachutePack(centerX, currentY, this.selectedPart === 'parachute');
    currentY += 40 + gap;

    // 4. Fuselaje
    this.drawFuselage(centerX, currentY, this.selectedPart === 'body');
    currentY += 60 + gap;

    // 5. Motor y Aletas
    this.drawEngineFins(centerX, currentY, this.selectedPart === 'motor' || this.selectedPart === 'fins');
  }

  drawNoseCone(x, y, active) {
    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.fillStyle = active ? '#F5D77F' : '#D4AF37';
    this.ctx.strokeStyle = active ? '#FFFFFF' : '#AA820A';
    this.ctx.lineWidth = active ? 3 : 1.5;
    this.ctx.beginPath();
    this.ctx.moveTo(-16, 20);
    this.ctx.quadraticCurveTo(0, -25, 0, -25);
    this.ctx.quadraticCurveTo(0, -25, 16, 20);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();

    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = '11px monospace';
    this.ctx.textAlign = 'left';
    this.ctx.fillText('1. Ojiva Aerodinámica', 35, 5);
    this.ctx.restore();
  }

  drawAvionics(x, y, active) {
    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.fillStyle = active ? '#38BDF8' : '#1E3A8A';
    this.ctx.strokeStyle = '#D4AF37';
    this.ctx.lineWidth = active ? 2.5 : 1;
    this.ctx.fillRect(-16, -15, 32, 30);
    this.ctx.strokeRect(-16, -15, 32, 30);

    // Chip icon
    this.ctx.fillStyle = '#F5D77F';
    this.ctx.fillRect(-6, -6, 12, 12);

    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = '11px monospace';
    this.ctx.textAlign = 'left';
    this.ctx.fillText('2. Bahía de Altímetro & IMU', 35, 3);
    this.ctx.restore();
  }

  drawParachutePack(x, y, active) {
    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.fillStyle = active ? '#F97316' : '#EA580C';
    this.ctx.strokeStyle = '#FFFFFF';
    this.ctx.lineWidth = active ? 2.5 : 1;
    this.ctx.beginPath();
    this.ctx.roundRect(-15, -15, 30, 30, 6);
    this.ctx.fill();
    this.ctx.stroke();

    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = '11px monospace';
    this.ctx.textAlign = 'left';
    this.ctx.fillText('3. Paracaídas Ripstop 45cm', 35, 3);
    this.ctx.restore();
  }

  drawFuselage(x, y, active) {
    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.fillStyle = active ? '#F8FAFC' : '#E2E8F0';
    this.ctx.strokeStyle = '#0D183E';
    this.ctx.lineWidth = active ? 2.5 : 1.5;
    this.ctx.fillRect(-16, -30, 32, 60);
    this.ctx.strokeRect(-16, -30, 32, 60);

    // Blue Launch Stripe
    this.ctx.fillStyle = '#0D183E';
    this.ctx.fillRect(-16, -8, 32, 16);

    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = '11px monospace';
    this.ctx.textAlign = 'left';
    this.ctx.fillText('4. Fuselaje de Fibra (50mm)', 35, 3);
    this.ctx.restore();
  }

  drawEngineFins(x, y, active) {
    this.ctx.save();
    this.ctx.translate(x, y);

    // Aletas
    this.ctx.fillStyle = '#0D183E';
    this.ctx.strokeStyle = '#D4AF37';
    this.ctx.lineWidth = 1.5;
    this.ctx.beginPath();
    this.ctx.moveTo(-16, -10);
    this.ctx.lineTo(-38, 25);
    this.ctx.lineTo(-16, 20);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.moveTo(16, -10);
    this.ctx.lineTo(38, 25);
    this.ctx.lineTo(16, 20);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();

    // Tubo del motor
    this.ctx.fillStyle = active ? '#AA820A' : '#713F12';
    this.ctx.fillRect(-12, -20, 24, 45);

    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = '11px monospace';
    this.ctx.textAlign = 'left';
    this.ctx.fillText('5. Motor Clase D/E & Aletas', 45, 3);
    this.ctx.restore();
  }
}

// ============================================================================
// 7. TEMPORIZADOR DE CUENTA REGRESIVA AL 30 DE NOVIEMBRE DE 2026
// ============================================================================
class MissionCountdown {
  constructor() {
    this.targetDate = new Date(2026, 10, 30, 23, 59, 59).getTime(); // 30 Noviembre 2026
    this.daysEl = document.getElementById('cd-days');
    this.hoursEl = document.getElementById('cd-hours');
    this.minsEl = document.getElementById('cd-mins');
    this.secsEl = document.getElementById('cd-secs');
    this.launchBtn = document.getElementById('btn-launch-sequence');
    this.hudBanner = document.getElementById('launch-hud-banner');

    this.init();
  }

  init() {
    this.update();
    setInterval(() => this.update(), 1000);

    if (this.launchBtn) {
      this.launchBtn.addEventListener('click', () => this.startSequence());
    }
  }

  update() {
    const now = new Date().getTime();
    const distance = this.targetDate - now;

    if (distance <= 0) {
      if (this.daysEl) this.daysEl.textContent = '00';
      if (this.hoursEl) this.hoursEl.textContent = '00';
      if (this.minsEl) this.minsEl.textContent = '00';
      if (this.secsEl) this.secsEl.textContent = '00';
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    if (this.daysEl) this.daysEl.textContent = String(days).padStart(2, '0');
    if (this.hoursEl) this.hoursEl.textContent = String(hours).padStart(2, '0');
    if (this.minsEl) this.minsEl.textContent = String(minutes).padStart(2, '0');
    if (this.secsEl) this.secsEl.textContent = String(seconds).padStart(2, '0');
  }

  startSequence() {
    this.launchBtn.disabled = true;
    let count = 10;
    if (this.hudBanner) {
      this.hudBanner.style.display = 'block';
      this.hudBanner.innerHTML = `[CONTROL DE MISIÓN] INICIANDO SECUENCIA T-${count}s...`;
    }

    const interval = setInterval(() => {
      count--;
      if (count > 0) {
        const freq = count <= 3 ? 1250 : 880;
        emotionalAudio.playBeep(freq, 0.12);
        if (this.hudBanner) {
          this.hudBanner.innerHTML = `[CONTROL DE MISIÓN] T-MINUS <strong>${count}</strong>... ${count <= 3 ? '¡LISTO PARA IGNICIÓN!' : 'CIRCUITOS NOMINALES'}`;
        }
      } else {
        clearInterval(interval);
        emotionalAudio.playBeep(1760, 0.35);
        setTimeout(() => emotionalAudio.playRocketBurn(), 100);

        if (this.hudBanner) {
          this.hudBanner.innerHTML = `<span style="color:#10B981; font-weight:bold;">🚀 ¡T-0: DESPEGUE DEL COHETE BLUE LAUNCH!</span> ASCENSO VERTICAL ESTABLE.`;
        }

        // Simular despegue en el simulador si está disponible
        const wowSimBtn = document.getElementById('btn-wow-launch');
        if (wowSimBtn) wowSimBtn.click();

        setTimeout(() => {
          this.launchBtn.disabled = false;
          if (this.hudBanner) this.hudBanner.style.display = 'none';
        }, 6000);
      }
    }, 1000);
  }
}

// ============================================================================
// 8. MODALS & GENERAL HANDLERS
// ============================================================================
function initModals() {
  const modals = document.querySelectorAll('.modal-backdrop');
  const closeBtns = document.querySelectorAll('.modal-close-btn');

  closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      emotionalAudio.playClick();
      modals.forEach(m => m.classList.remove('open'));
    });
  });

  modals.forEach(m => {
    m.addEventListener('click', (e) => {
      if (e.target === m) {
        emotionalAudio.playClick();
        m.classList.remove('open');
      }
    });
  });

  const zipBtn = document.getElementById('btn-download-zip');
  const zipModal = document.getElementById('zip-modal');
  if (zipBtn && zipModal) {
    zipBtn.addEventListener('click', () => {
      emotionalAudio.playClick();
      zipModal.classList.add('open');
    });
  }

  const reportBtn = document.getElementById('btn-view-report');
  const reportModal = document.getElementById('report-modal');
  if (reportBtn && reportModal) {
    reportBtn.addEventListener('click', () => {
      emotionalAudio.playClick();
      reportModal.classList.add('open');
    });
  }
}

// ============================================================================
// INICIALIZACIÓN GENERAL
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
  new CosmicStarfield('starfield-canvas');
  init3DTiltCards();
  new SmallRocketLaunchSimulator('rocket-launch-canvas');
  new AerodynamicWindTunnel('windtunnel-canvas');
  new ExplodedRocketInspector('exploded-canvas');
  new MissionCountdown();
  initModals();

  // Control de Música Emocional
  const musicBtn = document.getElementById('btn-toggle-music');
  const volumeSlider = document.getElementById('audio-volume');

  if (musicBtn) {
    musicBtn.addEventListener('click', () => {
      const isPlaying = emotionalAudio.toggle();
      musicBtn.innerHTML = isPlaying ? '⏸ Pausar Música' : '▶ Música Espacial';
      if (isPlaying) {
        musicBtn.classList.add('btn-gold');
      } else {
        musicBtn.classList.remove('btn-gold');
      }
    });
  }

  if (volumeSlider) {
    volumeSlider.addEventListener('input', (e) => {
      emotionalAudio.setVolume(e.target.value);
    });
  }
});
