class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private vuvuzelaNode: OscillatorNode | null = null;
  private vuvuzelaGain: GainNode | null = null;
  private vuvuzelaActive: boolean = false;

  private initCtx() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.vuvuzelaActive) {
      this.stopVuvuzela();
    }
  }

  public getMuted() {
    return this.isMuted;
  }

  // Ref whistle (two sharp piercing oscillators: ~2800Hz and ~3100Hz with trill)
  public playWhistle(isTriple: boolean = false) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const bursts = isTriple ? 3 : 2;
    for (let i = 0; i < bursts; i++) {
      const startTime = this.ctx.currentTime + i * 0.18;
      const duration = i === bursts - 1 && isTriple ? 0.4 : 0.12;

      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'triangle';
      osc2.type = 'sine';

      // Trill modulation
      const mod = this.ctx.createOscillator();
      const modGain = this.ctx.createGain();
      mod.frequency.setValueAtTime(35, startTime);
      modGain.gain.setValueAtTime(40, startTime);

      osc1.frequency.setValueAtTime(2800, startTime);
      osc2.frequency.setValueAtTime(3120, startTime);

      mod.connect(modGain);
      modGain.connect(osc1.frequency);
      modGain.connect(osc2.frequency);

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.25, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      mod.start(startTime);
      osc1.start(startTime);
      osc2.start(startTime);

      mod.stop(startTime + duration);
      osc1.stop(startTime + duration);
      osc2.stop(startTime + duration);
    }
  }

  // Comedic Kick / Bonk sound
  public playKick(powerRatio: number = 0.5) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = powerRatio > 0.8 ? 'sawtooth' : 'triangle';
    const startFreq = 160 + powerRatio * 220;
    osc.frequency.setValueAtTime(startFreq, t);
    osc.frequency.exponentialRampToValueAtTime(35, t + 0.15);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.2);

    // If overpowered kick, add humorous laser/ricochet zap!
    if (powerRatio > 0.85) {
      const zap = this.ctx.createOscillator();
      const zapGain = this.ctx.createGain();
      zap.type = 'sawtooth';
      zap.frequency.setValueAtTime(1200, t);
      zap.frequency.exponentialRampToValueAtTime(100, t + 0.25);
      zapGain.gain.setValueAtTime(0.15, t);
      zapGain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      zap.connect(zapGain);
      zapGain.connect(this.ctx.destination);
      zap.start(t);
      zap.stop(t + 0.26);
    }
  }

  // Neymar / Slide whistle (hilarious slide down or goofy cartoon wobble)
  public playSlide() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(700, t);
    osc.frequency.exponentialRampToValueAtTime(180, t + 0.35);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.36);
  }

  // Neymar screaming / flopping funny high pitch wobbler
  public playNeymarRoll() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    // Vibrato
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.frequency.setValueAtTime(12, t);
    lfoGain.gain.setValueAtTime(150, t);

    osc.frequency.setValueAtTime(800, t);
    osc.frequency.linearRampToValueAtTime(1100, t + 0.4);

    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.45);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    lfo.start(t);
    osc.start(t);
    lfo.stop(t + 0.46);
    osc.stop(t + 0.46);
  }

  // Foul / slip crash sound
  public playFoul() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(280, t);
    osc.frequency.exponentialRampToValueAtTime(50, t + 0.3);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.32);
  }

  // Goal celebration: Stadium Air Horn (BZZZT-BZZZT-BZZZZZZT!) + Fanfare
  public playGoalCelebration() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // Air horn blasts
    const blasts = [0, 0.22, 0.45, 0.75];
    const lens = [0.15, 0.15, 0.18, 0.6];

    blasts.forEach((offset, idx) => {
      const startTime = t + offset;
      const duration = lens[idx];
      const hornFreqs = [233, 294, 349]; // B-flat major triad air horn chord

      hornFreqs.forEach(freq => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.12, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + duration);
      });
    });

    // Whistle right after
    setTimeout(() => this.playWhistle(true), 1200);
  }

  // Tragic Fail Trombone (Wah wah wah waaaaaah)
  public playFail() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const notes = [
      { f: 311.13, d: 0.35 }, // Eb4
      { f: 293.66, d: 0.35 }, // D4
      { f: 277.18, d: 0.35 }, // C#4
      { f: 261.63, d: 0.75 }, // C4 sliding down
    ];

    let currentOffset = 0;
    notes.forEach((note, idx) => {
      const startTime = t + currentOffset;
      const duration = note.d;
      currentOffset += duration + 0.05;

      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(note.f, startTime);
      if (idx === 3) {
        osc.frequency.linearRampToValueAtTime(note.f - 40, startTime + duration);
      }

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.18, startTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    });
  }

  // Cash Register / Microtransaction Ka-Ching
  public playKaChing() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Bell 1
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(1400, t);
    gain1.gain.setValueAtTime(0.3, t);
    gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    osc1.connect(gain1);
    gain1.connect(this.ctx.destination);
    osc1.start(t);
    osc1.stop(t + 0.45);

    // Bell 2 higher
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(2093, t + 0.1);
    gain2.gain.setValueAtTime(0.3, t + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.7);
    osc2.connect(gain2);
    gain2.connect(this.ctx.destination);
    osc2.start(t + 0.1);
    osc2.stop(t + 0.75);
  }

  // Ultimate Scam Pack Opening Fanfare
  public playPackFanfare() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Fanfare arpeggio: C4, E4, G4, C5 (triumph)
    const melody = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
    melody.forEach((freq, idx) => {
      const startTime = t + idx * 0.12;
      const duration = idx === melody.length - 1 ? 1.0 : 0.18;

      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.2, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(startTime);
      osc.stop(startTime + duration);
    });
  }

  // Toggle South Africa 2010 Vuvuzela Drone
  public toggleVuvuzela(enable?: boolean) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const target = enable !== undefined ? enable : !this.vuvuzelaActive;

    if (target && !this.vuvuzelaActive) {
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(235, this.ctx.currentTime); // Bb3 vuvuzela base

        // Pitch wobble
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        lfo.frequency.setValueAtTime(6, this.ctx.currentTime);
        lfoGain.gain.setValueAtTime(7, this.ctx.currentTime);
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        lfo.start();

        gain.gain.setValueAtTime(0.08, this.ctx.currentTime);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();

        this.vuvuzelaNode = osc;
        this.vuvuzelaGain = gain;
        this.vuvuzelaActive = true;
      } catch (e) {
        console.error('Vuvuzela failed', e);
      }
    } else if (!target && this.vuvuzelaActive) {
      this.stopVuvuzela();
    }
  }

  public stopVuvuzela() {
    if (this.vuvuzelaNode && this.vuvuzelaGain && this.ctx) {
      try {
        this.vuvuzelaGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);
        setTimeout(() => {
          this.vuvuzelaNode?.stop();
          this.vuvuzelaNode?.disconnect();
          this.vuvuzelaNode = null;
          this.vuvuzelaGain = null;
          this.vuvuzelaActive = false;
        }, 120);
      } catch (e) {
        this.vuvuzelaActive = false;
      }
    } else {
      this.vuvuzelaActive = false;
    }
  }

  public isVuvuzelaOn() {
    return this.vuvuzelaActive;
  }

  // Dog barking sound synthesis
  public playDogBark() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    [0, 0.18].forEach(delay => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(450, t + delay);
      osc.frequency.exponentialRampToValueAtTime(140, t + delay + 0.12);

      gain.gain.setValueAtTime(0.28, t + delay);
      gain.gain.exponentialRampToValueAtTime(0.01, t + delay + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t + delay);
      osc.stop(t + delay + 0.13);
    });
  }

  // Brawl punch / crash sound
  public playPunch() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.15);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.16);
  }

  // Math correct answer chime (bright ascending triad)
  public playCorrect() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.08);

      gain.gain.setValueAtTime(0, t + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.25, t + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.08 + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + idx * 0.08);
      osc.stop(t + idx * 0.08 + 0.36);
    });
  }

  // Math wrong answer buzz
  public playWrong() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.linearRampToValueAtTime(100, t + 0.25);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.3);
  }

  // Combo streak fanfare
  public playComboStreak() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const freqs = [440, 554.37, 659.25, 880, 1108.73];
    freqs.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.06);

      gain.gain.setValueAtTime(0, t + idx * 0.06);
      gain.gain.linearRampToValueAtTime(0.2, t + idx * 0.06 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.06 + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + idx * 0.06);
      osc.stop(t + idx * 0.06 + 0.42);
    });
  }

  // Voice commentary disabled per user request
  public speakCommentary(_text: string) {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const soundEngine = new SoundEngine();
