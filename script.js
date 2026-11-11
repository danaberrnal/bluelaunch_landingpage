/**
 * BLUE LAUNCH - ROCKET TEC SINALOA | PROYECTO FINAL F1025
 * Sistema interactivo, Web Audio Synth, Simulador de Física y Telemetría.
 */

// ============================================================================
// 1. STARFIELD BACKGROUND (CANVAS)
// ============================================================================
class Starfield {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.stars = [];
    this.numStars = 220;
    this.mouseX = 0;
    this.mouseY = 0;
    this.targetMouseX = 0;
    this.targetMouseY = 0;

    this.init();
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('mousemove', (e) => {
      this.targetMouseX = (e.clientX - window.innerWidth / 2) * 0.05;
      this.targetMouseY = (e.clientY - window.innerHeight / 2) * 0.05;
    });
  }

  init() {
    this.resize();
    this.stars = [];
    for (let i = 0; i < this.numStars; i++) {
      this.stars.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: Math.random() * 2 + 0.4,
        speed: Math.random() * 0.4 + 0.1,
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

  animate() {
    this.mouseX += (this.targetMouseX - this.mouseX) * 0.05;
    this.mouseY += (this.targetMouseY - this.mouseY) * 0.05;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

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
      this.ctx.shadowBlur = s.size > 1.5 ? 8 : 0;
      this.ctx.shadowColor = s.color;
      this.ctx.fill();
    }

    this.ctx.globalAlpha = 1;
    this.ctx.shadowBlur = 0;
    requestAnimationFrame(() => this.animate());
  }
}

// ============================================================================
// 2. WEB AUDIO ENGINE (AMBIENT SPACE MUSIC & MISSION SFX)
// ============================================================================
class SpaceAudioEngine {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.masterGain = null;
    this.analyser = null;
    this.visualizerCanvas = document.getElementById('audio-visualizer');
    this.visualizerCtx = this.visualizerCanvas ? this.visualizerCanvas.getContext('2d') : null;
    this.nodes = [];
    this.arpeggioTimer = null;
    this.volume = 0.5;

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

  toggleMusic() {
    this.init();
    if (this.isPlaying) {
      this.stopAmbient();
      return false;
    } else {
      this.startAmbient();
      return true;
    }
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, parseFloat(val)));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
  }

  startAmbient() {
    if (this.isPlaying) return;
    this.isPlaying = true;

    // 1. Sub-Bass Cosmic Drone (55 Hz - A1 / 73.4 Hz - D2)
    const baseFreqs = [55, 73.4, 110];
    baseFreqs.forEach(freq => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(160, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      this.nodes.push(osc, gain, filter);
    });

    // 2. Warm Pad Chord (D Minor: D3, F3, A3, C4, E4)
    const padNotes = [146.83, 174.61, 220.00, 261.63, 329.63];
    padNotes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const panner = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
      const filter = this.ctx.createBiquadFilter();

      osc.type = idx % 2 === 0 ? 'sine' : 'sawtooth';
      osc.frequency.setValueAtTime(freq + (Math.random() - 0.5) * 1.5, this.ctx.currentTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(350, this.ctx.currentTime);
      filter.Q.setValueAtTime(2, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.06, this.ctx.currentTime);

      osc.connect(filter);
      filter.connect(gain);
      if (panner) {
        panner.pan.setValueAtTime((idx - 2) * 0.4, this.ctx.currentTime);
        gain.connect(panner);
        panner.connect(this.masterGain);
        this.nodes.push(panner);
      } else {
        gain.connect(this.masterGain);
      }

      osc.start();
      this.nodes.push(osc, gain, filter);
    });

    // 3. Subtle Cosmic Wind (Filtered Pink Noise)
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      output[i] = (b0 + b1 + b2) * 0.05;
    }
    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(320, this.ctx.currentTime);
    noiseFilter.Q.setValueAtTime(3, this.ctx.currentTime);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.04, this.ctx.currentTime);

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    noiseSource.start();
    this.nodes.push(noiseSource, noiseFilter, noiseGain);

    // 4. Procedural Celestial Arpeggiator (Pentatonic Twinkles)
    const scale = [440, 523.25, 587.33, 659.25, 783.99, 880, 1046.5];
    const playArpNote = () => {
      if (!this.isPlaying || !this.ctx) return;
      const noteFreq = scale[Math.floor(Math.random() * scale.length)];
      const osc = this.ctx.createOscillator();
      const noteGain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(noteFreq, this.ctx.currentTime);

      noteGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      noteGain.gain.exponentialRampToValueAtTime(0.05, this.ctx.currentTime + 0.1);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 1.8);

      osc.connect(noteGain);
      noteGain.connect(this.masterGain);

      osc.start();
      osc.stop(this.ctx.currentTime + 2.0);

      this.arpeggioTimer = setTimeout(playArpNote, 800 + Math.random() * 1600);
    };

    playArpNote();
  }

  stopAmbient() {
    this.isPlaying = false;
    clearTimeout(this.arpeggioTimer);
    this.nodes.forEach(node => {
      try {
        if (node.stop) node.stop();
        if (node.disconnect) node.disconnect();
      } catch (e) {}
    });
    this.nodes = [];
  }

  // Countdown Beep (Precision Telemetry)
  playBeep(frequency = 880, duration = 0.15) {
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

  // Rocket Ignition Sound (Sub-bass rumble + noise blast)
  playIgnitionSound() {
    this.init();
    // 1. Noise blast
    const bufferSize = this.ctx.sampleRate * 3;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1);
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(180, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 1.2);
    filter.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 3.0);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.4, this.ctx.currentTime + 0.6);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 3.0);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start();

    // 2. Sub Rumble Oscillator
    const rumble = this.ctx.createOscillator();
    const rumbleGain = this.ctx.createGain();
    rumble.type = 'sawtooth';
    rumble.frequency.setValueAtTime(45, this.ctx.currentTime);
    rumble.frequency.exponentialRampToValueAtTime(75, this.ctx.currentTime + 1.0);
    rumble.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 3.0);

    rumbleGain.gain.setValueAtTime(0.01, this.ctx.currentTime);
    rumbleGain.gain.linearRampToValueAtTime(0.3, this.ctx.currentTime + 0.4);
    rumbleGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 3.0);

    rumble.connect(rumbleGain);
    rumbleGain.connect(this.ctx.destination);
    rumble.start();
    rumble.stop(this.ctx.currentTime + 3.0);
  }

  // UI Telemetry Click
  playClick() {
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch(e) {}
  }

  // Audio Visualizer Canvas
  initVisualizer() {
    if (!this.visualizerCanvas || !this.visualizerCtx) return;
    const draw = () => {
      requestAnimationFrame(draw);
      this.visualizerCtx.clearRect(0, 0, this.visualizerCanvas.width, this.visualizerCanvas.height);

      const numBars = 5;
      const barWidth = 6;
      const gap = 3;

      if (!this.isPlaying || !this.analyser) {
        // Idle bars
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

// Global Audio Engine Instance
const spaceAudio = new SpaceAudioEngine();

// ============================================================================
// 3. COUNTDOWN TIMER & LAUNCH SEQUENCE (T-10s)
// ============================================================================
class CountdownTimer {
  constructor() {
    // Target date: 30 de Noviembre 2026, 23:59:59 (Fin de Noviembre)
    this.targetDate = new Date(2026, 10, 30, 23, 59, 59).getTime(); // Month is 0-indexed: 10 = November
    this.daysEl = document.getElementById('cd-days');
    this.hoursEl = document.getElementById('cd-hours');
    this.minsEl = document.getElementById('cd-mins');
    this.secsEl = document.getElementById('cd-secs');
    this.launchBtn = document.getElementById('btn-launch-sequence');
    this.launchHud = document.getElementById('launch-hud-banner');

    this.isLaunching = false;
    this.init();
  }

  init() {
    this.update();
    setInterval(() => this.update(), 1000);

    if (this.launchBtn) {
      this.launchBtn.addEventListener('click', () => this.startLaunchSequence());
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

  startLaunchSequence() {
    if (this.isLaunching) return;
    this.isLaunching = true;
    spaceAudio.playClick();

    if (this.launchBtn) {
      this.launchBtn.disabled = true;
      this.launchBtn.innerHTML = '<span class="pulse-dot"></span> SECUENCIA EN PROGRESO...';
    }

    let count = 10;
    if (this.launchHud) {
      this.launchHud.style.display = 'block';
      this.launchHud.innerHTML = `<span style="color:#D4AF37;">[CONTROL DE MISIÓN F1025]</span> INICIANDO SECUENCIA T-${count}s...`;
    }

    const interval = setInterval(() => {
      count--;
      if (count > 0) {
        // Telemetry beep: pitch goes up on T-3, T-2, T-1
        const freq = count <= 3 ? 1200 : 880;
        spaceAudio.playBeep(freq, 0.12);
        if (this.launchHud) {
          this.launchHud.innerHTML = `<span style="color:#D4AF37;">[CONTROL DE MISIÓN]</span> T-MINUS <strong>${count}</strong> SEGUNDOS... ${count <= 3 ? '¡PRESURIZACIÓN MÁXIMA!' : 'REVISIÓN DE SISTEMAS NOMINAL'}`;
        }
      } else {
        clearInterval(interval);
        // T-0: Ignition!
        spaceAudio.playBeep(1760, 0.4);
        setTimeout(() => spaceAudio.playIgnitionSound(), 100);

        if (this.launchHud) {
          this.launchHud.innerHTML = `<span style="color:#10B981; font-weight:bold;">🚀 ¡T-0: IGNICIÓN Y DESPEGUE EXITOSO!</span> COHETE BLUE LAUNCH EN ASCENSO SUBORBITAL.`;
        }

        // Screen shake effect
        document.body.style.animation = 'screenShake 0.6s ease-in-out';
        setTimeout(() => {
          document.body.style.animation = '';
        }, 700);

        // Reset button after 6 seconds
        setTimeout(() => {
          this.isLaunching = false;
          if (this.launchBtn) {
            this.launchBtn.disabled = false;
            this.launchBtn.innerHTML = '🚀 Simular Secuencia de Despegue (T-10s)';
          }
          if (this.launchHud) {
            this.launchHud.style.display = 'none';
          }
        }, 6000);
      }
    }, 1000);
  }
}

// ============================================================================
// 4. ROCKET FLIGHT & PHYSICS SIMULATOR (F1025)
// ============================================================================
class RocketPhysicsSimulator {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    // UI Input Controls
    this.thrustSlider = document.getElementById('sim-thrust');
    this.dryMassSlider = document.getElementById('sim-dry-mass');
    this.fuelMassSlider = document.getElementById('sim-fuel-mass');
    this.flowRateSlider = document.getElementById('sim-flow-rate');
    this.dragSlider = document.getElementById('sim-drag-coef');
    this.gravitySelect = document.getElementById('sim-gravity');

    // Value Labels
    this.thrustVal = document.getElementById('val-thrust');
    this.dryMassVal = document.getElementById('val-dry-mass');
    this.fuelMassVal = document.getElementById('val-fuel-mass');
    this.flowRateVal = document.getElementById('val-flow-rate');
    this.dragVal = document.getElementById('val-drag-coef');

    // Telemetry Displays
    this.telAlt = document.getElementById('tel-altitude');
    this.telVel = document.getElementById('tel-velocity');
    this.telAcc = document.getElementById('tel-acceleration');
    this.telFuel = document.getElementById('tel-fuel');
    this.telMaxAlt = document.getElementById('tel-max-alt');
    this.telDeltaV = document.getElementById('tel-delta-v');

    // Action Buttons
    this.btnLaunch = document.getElementById('btn-sim-launch');
    this.btnReset = document.getElementById('btn-sim-reset');

    // Simulation State
    this.running = false;
    this.altitude = 0; // meters
    this.velocity = 0; // m/s
    this.acceleration = 0; // m/s^2
    this.fuelRemaining = 0; // kg
    this.maxAltitude = 0; // meters
    this.time = 0; // seconds
    this.exhaustParticles = [];

    this.bindInputs();
    this.reset();
  }

  bindInputs() {
    const sync = () => {
      if (this.thrustVal && this.thrustSlider) this.thrustVal.textContent = `${Number(this.thrustSlider.value).toLocaleString()} N`;
      if (this.dryMassVal && this.dryMassSlider) this.dryMassVal.textContent = `${this.dryMassSlider.value} kg`;
      if (this.fuelMassVal && this.fuelMassSlider) this.fuelMassVal.textContent = `${this.fuelMassSlider.value} kg`;
      if (this.flowRateVal && this.flowRateSlider) this.flowRateVal.textContent = `${this.flowRateSlider.value} kg/s`;
      if (this.dragVal && this.dragSlider) this.dragVal.textContent = this.dragSlider.value;
      this.calculateTsiolkovsky();
    };

    [this.thrustSlider, this.dryMassSlider, this.fuelMassSlider, this.flowRateSlider, this.dragSlider, this.gravitySelect].forEach(input => {
      if (input) input.addEventListener('input', sync);
    });

    if (this.btnLaunch) {
      this.btnLaunch.addEventListener('click', () => {
        spaceAudio.playClick();
        if (!this.running) {
          this.launch();
        } else {
          this.pause();
        }
      });
    }

    if (this.btnReset) {
      this.btnReset.addEventListener('click', () => {
        spaceAudio.playClick();
        this.reset();
      });
    }

    sync();
  }

  calculateTsiolkovsky() {
    const T = parseFloat(this.thrustSlider.value);
    const m_dry = parseFloat(this.dryMassSlider.value);
    const m_fuel = parseFloat(this.fuelMassSlider.value);
    const m_dot = parseFloat(this.flowRateSlider.value);

    const m0 = m_dry + m_fuel;
    const mf = m_dry;
    const ve = T / m_dot; // Effective exhaust velocity: T = m_dot * ve
    const deltaV = ve * Math.log(m0 / mf);

    if (this.telDeltaV) {
      this.telDeltaV.textContent = `${Math.round(deltaV).toLocaleString()} m/s`;
    }
  }

  launch() {
    this.running = true;
    if (this.btnLaunch) {
      this.btnLaunch.textContent = '⏸ Pausar Simulación';
      this.btnLaunch.classList.remove('btn-gold');
      this.btnLaunch.classList.add('btn-outline');
    }
    spaceAudio.playIgnitionSound();
    this.lastTimestamp = performance.now();
    this.loop();
  }

  pause() {
    this.running = false;
    if (this.btnLaunch) {
      this.btnLaunch.textContent = '▶ Reanudar';
      this.btnLaunch.classList.remove('btn-outline');
      this.btnLaunch.classList.add('btn-gold');
    }
  }

  reset() {
    this.running = false;
    this.altitude = 0;
    this.velocity = 0;
    this.acceleration = 0;
    this.fuelRemaining = parseFloat(this.fuelMassSlider ? this.fuelMassSlider.value : 400);
    this.maxAltitude = 0;
    this.time = 0;
    this.exhaustParticles = [];

    if (this.btnLaunch) {
      this.btnLaunch.textContent = '🚀 Iniciar Simulación';
      this.btnLaunch.classList.remove('btn-outline');
      this.btnLaunch.classList.add('btn-gold');
    }

    this.updateTelemetry();
    this.draw();
  }

  loop() {
    if (!this.running) return;
    const now = performance.now();
    const dt = Math.min((now - (this.lastTimestamp || now)) / 1000, 0.05); // max 50ms step
    this.lastTimestamp = now;

    this.stepPhysics(dt * 2.0); // 2x simulation speed for engaging experience
    this.draw();
    this.updateTelemetry();

    requestAnimationFrame(() => this.loop());
  }

  stepPhysics(dt) {
    this.time += dt;

    const T_nominal = parseFloat(this.thrustSlider.value);
    const m_dry = parseFloat(this.dryMassSlider.value);
    const m_dot = parseFloat(this.flowRateSlider.value);
    const Cd = parseFloat(this.dragSlider.value);
    const g_planet = parseFloat(this.gravitySelect.value);

    // Fuel consumption
    let thrust = 0;
    if (this.fuelRemaining > 0) {
      const fuelBurned = m_dot * dt;
      this.fuelRemaining = Math.max(0, this.fuelRemaining - fuelBurned);
      thrust = T_nominal;

      // Spawn exhaust particles
      for (let i = 0; i < 4; i++) {
        this.exhaustParticles.push({
          x: (Math.random() - 0.5) * 12,
          y: Math.random() * 8,
          vx: (Math.random() - 0.5) * 20,
          vy: Math.random() * 60 + 40,
          size: Math.random() * 8 + 4,
          life: 1.0
        });
      }
    }

    const currentMass = m_dry + this.fuelRemaining;

    // Atmospheric Drag: Fd = 0.5 * rho * v^2 * Cd * Area
    // Barometric formula: rho(h) = 1.225 * exp(-h / 8500)
    const rho = 1.225 * Math.exp(-this.altitude / 8500);
    const area = 0.45; // m^2 cross section
    const drag = 0.5 * rho * Math.pow(this.velocity, 2) * Cd * area * Math.sign(this.velocity);

    // Gravity variation with altitude: g(h) = g0 * (RE / (RE + h))^2
    const RE = 6371000; // Earth radius in meters
    const g_effective = g_planet * Math.pow(RE / (RE + this.altitude), 2);
    const weight = currentMass * g_effective;

    // Second Law of Newton: F_net = Thrust - Drag - Weight
    const F_net = thrust - drag - weight;
    this.acceleration = F_net / currentMass;

    // Integration
    this.velocity += this.acceleration * dt;
    this.altitude += this.velocity * dt;

    if (this.altitude < 0) {
      this.altitude = 0;
      this.velocity = 0;
      this.acceleration = 0;
      if (this.fuelRemaining <= 0) {
        this.running = false;
        if (this.btnLaunch) {
          this.btnLaunch.textContent = '🔄 Reiniciar Simulación';
          this.btnLaunch.classList.remove('btn-outline');
          this.btnLaunch.classList.add('btn-gold');
        }
      }
    }

    if (this.altitude > this.maxAltitude) {
      this.maxAltitude = this.altitude;
    }

    // Update particles
    for (let p of this.exhaustParticles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.size += dt * 8;
      p.life -= dt * 2.2;
    }
    this.exhaustParticles = this.exhaustParticles.filter(p => p.life > 0);
  }

  updateTelemetry() {
    if (this.telAlt) this.telAlt.textContent = this.altitude > 1000 ? `${(this.altitude / 1000).toFixed(2)} km` : `${Math.round(this.altitude)} m`;
    if (this.telVel) {
      const mach = (this.velocity / 340).toFixed(2);
      this.telVel.textContent = `${Math.round(this.velocity)} m/s (M${mach})`;
    }
    if (this.telAcc) {
      const g_force = (this.acceleration / 9.81).toFixed(2);
      this.telAcc.textContent = `${this.acceleration.toFixed(1)} m/s² (${g_force}g)`;
    }
    if (this.telFuel) {
      const initialFuel = parseFloat(this.fuelMassSlider ? this.fuelMassSlider.value : 400);
      const pct = Math.max(0, Math.round((this.fuelRemaining / initialFuel) * 100));
      this.telFuel.textContent = `${pct}% (${Math.round(this.fuelRemaining)} kg)`;
    }
    if (this.telMaxAlt) {
      this.telMaxAlt.textContent = this.maxAltitude > 1000 ? `${(this.maxAltitude / 1000).toFixed(2)} km` : `${Math.round(this.maxAltitude)} m`;
    }
  }

  draw() {
    const w = this.canvas.width = this.canvas.parentElement.clientWidth;
    const h = this.canvas.height = 380;

    // Atmospheric gradient based on altitude
    const altRatio = Math.min(1, this.altitude / 80000); // 80km space boundary
    const rTop = Math.round(7 * (1 - altRatio));
    const gTop = Math.round(11 * (1 - altRatio));
    const bTop = Math.round(25 * (1 - altRatio) + 10 * altRatio);
    const rBot = Math.round(17 * (1 - altRatio) + 7 * altRatio);
    const gBot = Math.round(30 * (1 - altRatio) + 11 * altRatio);
    const bBot = Math.round(79 * (1 - altRatio) + 25 * altRatio);

    const grad = this.ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, `rgb(${rTop}, ${gTop}, ${bTop})`);
    grad.addColorStop(1, `rgb(${rBot}, ${gBot}, ${bBot})`);
    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, 0, w, h);

    // Altitude lines
    this.ctx.strokeStyle = 'rgba(212, 175, 55, 0.15)';
    this.ctx.lineWidth = 1;
    for (let y = 50; y < h; y += 70) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(w, y);
      this.ctx.stroke();
    }

    // Ground platform when altitude is low
    const groundY = h - 25;
    if (this.altitude < 500) {
      const gOffset = (this.altitude / 500) * 120;
      this.ctx.fillStyle = '#1e293b';
      this.ctx.fillRect(0, groundY + gOffset, w, 60);
      this.ctx.fillStyle = '#D4AF37';
      this.ctx.fillRect(w / 2 - 40, groundY + gOffset, 80, 6);
    }

    // Rocket position on canvas (smooth visual framing)
    const rocketX = w / 2;
    // Visually ascends from groundY - 50 to middle of canvas
    const visualY = Math.max(120, groundY - 50 - Math.min(this.altitude * 0.4, 200));

    // Draw Exhaust Particles
    for (let p of this.exhaustParticles) {
      this.ctx.beginPath();
      this.ctx.arc(rocketX + p.x, visualY + 45 + p.y, p.size, 0, Math.PI * 2);
      const alpha = p.life * 0.8;
      this.ctx.fillStyle = p.life > 0.6 ? `rgba(254, 240, 138, ${alpha})` : (p.life > 0.3 ? `rgba(249, 115, 22, ${alpha})` : `rgba(148, 163, 184, ${alpha})`);
      this.ctx.fill();
    }

    // Draw Rocket Body
    this.ctx.save();
    this.ctx.translate(rocketX, visualY);

    // Body Tube
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.beginPath();
    this.ctx.roundRect(-10, -35, 20, 65, [10, 10, 2, 2]);
    this.ctx.fill();

    // Nose Cone (Gold)
    this.ctx.fillStyle = '#D4AF37';
    this.ctx.beginPath();
    this.ctx.moveTo(-10, -35);
    this.ctx.lineTo(0, -60);
    this.ctx.lineTo(10, -35);
    this.ctx.closePath();
    this.ctx.fill();

    // Blue Launch Accent Stripe
    this.ctx.fillStyle = '#0D183E';
    this.ctx.fillRect(-10, -10, 20, 14);

    // Circuit logo detail on rocket
    this.ctx.strokeStyle = '#D4AF37';
    this.ctx.lineWidth = 1.5;
    this.ctx.beginPath();
    this.ctx.moveTo(0, -8);
    this.ctx.lineTo(0, 0);
    this.ctx.stroke();

    // Fins (Titanium Blue/Gold)
    this.ctx.fillStyle = '#0D183E';
    this.ctx.beginPath();
    this.ctx.moveTo(-10, 15);
    this.ctx.lineTo(-24, 34);
    this.ctx.lineTo(-10, 30);
    this.ctx.closePath();
    this.ctx.fill();

    this.ctx.beginPath();
    this.ctx.moveTo(10, 15);
    this.ctx.lineTo(24, 34);
    this.ctx.lineTo(10, 30);
    this.ctx.closePath();
    this.ctx.fill();

    // Nozzle
    this.ctx.fillStyle = '#475569';
    this.ctx.beginPath();
    this.ctx.moveTo(-7, 30);
    this.ctx.lineTo(7, 30);
    this.ctx.lineTo(10, 42);
    this.ctx.lineTo(-10, 42);
    this.ctx.closePath();
    this.ctx.fill();

    // Active Engine Flame
    if (this.fuelRemaining > 0 && this.running) {
      const flameHeight = 25 + Math.random() * 20;
      this.ctx.beginPath();
      this.ctx.moveTo(-7, 42);
      this.ctx.lineTo(0, 42 + flameHeight);
      this.ctx.lineTo(7, 42);
      this.ctx.fillStyle = '#f59e0b';
      this.ctx.shadowBlur = 15;
      this.ctx.shadowColor = '#f59e0b';
      this.ctx.fill();

      // Inner blue core
      this.ctx.beginPath();
      this.ctx.moveTo(-3, 42);
      this.ctx.lineTo(0, 42 + flameHeight * 0.5);
      this.ctx.lineTo(3, 42);
      this.ctx.fillStyle = '#38bdf8';
      this.ctx.fill();
      this.ctx.shadowBlur = 0;
    }

    this.ctx.restore();
  }
}

// ============================================================================
// 5. ANATOMY HOTSPOTS & COMPONENT INSPECTOR
// ============================================================================
function initAnatomyExplorer() {
  const cards = document.querySelectorAll('.hotspot-card');
  const modal = document.getElementById('anatomy-modal');
  const modalTitle = document.getElementById('anatomy-modal-title');
  const modalBody = document.getElementById('anatomy-modal-body');

  cards.forEach(card => {
    card.addEventListener('click', () => {
      spaceAudio.playClick();
      cards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');

      const title = card.getAttribute('data-title');
      const specs = card.getAttribute('data-specs');
      const physics = card.getAttribute('data-physics');

      if (modal && modalTitle && modalBody) {
        modalTitle.textContent = title;
        modalBody.innerHTML = `
          <div style="margin-bottom: 1rem; color: #CBD5E1; font-size: 0.95rem;">
            <strong>Especificaciones Técnicas:</strong><br>${specs}
          </div>
          <div style="background: rgba(7, 11, 25, 0.8); padding: 1rem; border-radius: 0.5rem; border-left: 3px solid #D4AF37;">
            <strong style="color: #D4AF37;">Principio Físico F1025:</strong><br>${physics}
          </div>
        `;
        modal.classList.add('open');
      }
    });
  });
}

// ============================================================================
// 6. MISSION TERMINAL (COMMAND LINE INTERACTION)
// ============================================================================
function initMissionTerminal() {
  const input = document.getElementById('terminal-input');
  const body = document.getElementById('terminal-body');
  const buttons = document.querySelectorAll('.terminal-badge-btn');

  if (!input || !body) return;

  const appendLine = (text, isCommand = false, isError = false) => {
    const line = document.createElement('div');
    if (isCommand) {
      line.style.color = '#D4AF37';
      line.textContent = `> ${text}`;
    } else if (isError) {
      line.style.color = '#ef4444';
      line.textContent = text;
    } else {
      line.style.color = '#38bdf8';
      line.innerHTML = text;
    }
    body.appendChild(line);
    body.scrollTop = body.scrollHeight;
  };

  const handleCommand = (raw) => {
    const cmd = raw.trim().toLowerCase();
    if (!cmd) return;
    spaceAudio.playClick();
    appendLine(raw, true);

    switch (cmd) {
      case 'help':
        appendLine('Comandos disponibles: <code>status</code>, <code>telemetry</code>, <code>laws</code>, <code>launch</code>, <code>tsiolkovsky</code>, <code>team</code>, <code>audio</code>, <code>clear</code>');
        break;
      case 'status':
        appendLine('ESTADO DE LA MISIÓN: <span style="color:#10B981;">NOMINAL</span> | SISTEMA EN ESPERA | VENTANA DE LANZAMIENTO: FIN DE NOVIEMBRE 2026.');
        break;
      case 'telemetry':
        appendLine('TELEMETRÍA ACTUAL: Apogeo objetivo = 124.8 km | Presión Dinámica Max-Q = 32.4 kPa | Impulso Específico = 285 s | Masa inicial = 520 kg.');
        break;
      case 'laws':
        appendLine('FUNDAMENTOS F1025:<br>1. Inercia (1ª Ley Newton)<br>2. F_neta = dp/dt (2ª Ley masa variable)<br>3. Acción y Reacción (3ª Ley propulsiva)<br>4. Conservación del Momentum (Ecuación de Tsiolkovsky)<br>5. Conservación de la Energía (E_química = E_cinética + E_potencial + W_arrastre)');
        break;
      case 'tsiolkovsky':
        appendLine('ECUACIÓN DEL COHETE: &Delta;v = v_e &middot; ln(m_0 / m_f) = I_sp &middot; g_0 &middot; ln(m_0 / m_f). Para m0=520kg y mf=120kg con Isp=285s: &Delta;v = 2,790 m/s.');
        break;
      case 'launch':
        appendLine('Iniciando simulación de despegue...');
        const btnLaunchSeq = document.getElementById('btn-launch-sequence');
        if (btnLaunchSeq) btnLaunchSeq.click();
        break;
      case 'team':
        appendLine('EQUIPO BLUE LAUNCH (Rocket Tec Sinaloa):<br>- Dirección de Misión y Modelación F1025<br>- Ingeniería de Propulsión y Dinámica de Fluidos<br>- Telemetría, Sensores y Software de Control<br>- Análisis Estructural y Balística');
        break;
      case 'audio':
        const playing = spaceAudio.toggleMusic();
        appendLine(`Música espacial: ${playing ? '<span style="color:#10B981;">ACTIVADA</span>' : '<span style="color:#ef4444;">PAUSADA</span>'}`);
        break;
      case 'clear':
        body.innerHTML = '';
        break;
      default:
        appendLine(`Comando no reconocido: "${raw}". Escribe <code>help</code> para ver opciones.`, false, true);
    }
  };

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const val = input.value;
      input.value = '';
      handleCommand(val);
    }
  });

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const cmd = btn.getAttribute('data-cmd');
      if (cmd) handleCommand(cmd);
    });
  });
}

// ============================================================================
// 7. MODALS & GENERAL UI INTERACTIONS
// ============================================================================
function initModals() {
  const modals = document.querySelectorAll('.modal-backdrop');
  const closeBtns = document.querySelectorAll('.modal-close-btn');

  closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      spaceAudio.playClick();
      modals.forEach(m => m.classList.remove('open'));
    });
  });

  modals.forEach(m => {
    m.addEventListener('click', (e) => {
      if (e.target === m) {
        spaceAudio.playClick();
        m.classList.remove('open');
      }
    });
  });

  // Poster Modal Trigger
  const posterPreview = document.getElementById('poster-preview-btn');
  const posterModal = document.getElementById('poster-modal');
  if (posterPreview && posterModal) {
    posterPreview.addEventListener('click', () => {
      spaceAudio.playClick();
      posterModal.classList.add('open');
    });
  }

  // Report Modal Trigger
  const reportBtn = document.getElementById('btn-view-report');
  const reportModal = document.getElementById('report-modal');
  if (reportBtn && reportModal) {
    reportBtn.addEventListener('click', () => {
      spaceAudio.playClick();
      reportModal.classList.add('open');
    });
  }
}

// ============================================================================
// 8. INITIALIZATION ON DOM READY
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
  // 1. Starfield Background
  new Starfield('starfield-canvas');

  // 2. Countdown Timer
  new CountdownTimer();

  // 3. Rocket Simulator
  new RocketPhysicsSimulator('flight-canvas');

  // 4. Anatomy Explorer
  initAnatomyExplorer();

  // 5. Terminal Console
  initMissionTerminal();

  // 6. Modals
  initModals();

  
  // Zip Modal Trigger
  const zipBtn = document.getElementById('btn-download-zip');
  const zipModal = document.getElementById('zip-modal');
  if (zipBtn && zipModal) {
    zipBtn.addEventListener('click', () => {
      spaceAudio.playClick();
      zipModal.classList.add('open');
    });
  }

  // 7. Audio Controls
  const toggleMusicBtn = document.getElementById('btn-toggle-music');
  const volumeSlider = document.getElementById('audio-volume');

  if (toggleMusicBtn) {
    toggleMusicBtn.addEventListener('click', () => {
      const isPlaying = spaceAudio.toggleMusic();
      toggleMusicBtn.innerHTML = isPlaying ? '⏸ Pausar Música' : '▶ Música Espacial';
      if (isPlaying) {
        toggleMusicBtn.classList.remove('btn-outline');
        toggleMusicBtn.classList.add('btn-gold');
      } else {
        toggleMusicBtn.classList.remove('btn-gold');
        toggleMusicBtn.classList.add('btn-outline');
      }
    });
  }

  if (volumeSlider) {
    volumeSlider.addEventListener('input', (e) => {
      spaceAudio.setVolume(e.target.value);
    });
  }
});
