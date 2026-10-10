/**
 * @file MusicComposer.js
 * Procedural musical score generator inspired by Danny Elfman and The Dark Knight.
 * Synthesizes multi-track gothic orchestral arrangements via Web Audio API.
 */

export class MusicComposer {
  /**
   * Schedules notes for a single 16th-note step across all instruments.
   * @param {string} track - 'rooftops' | 'boss' | 'menu'
   * @param {number} time - AudioContext timestamp
   * @param {number} step - Current step index (0-63)
   * @param {AudioContext} ctx
   * @param {AudioNode} destination - BGM gain bus
   */
  static scheduleStep(track, time, step, ctx, destination) {
    if (!ctx || !destination) return;
    const bar = Math.floor(step / 16);
    const stepInBar = step % 16;

    if (track === 'rooftops') {
      MusicComposer._playRooftopsTheme(time, step, bar, stepInBar, ctx, destination);
    } else if (track === 'boss') {
      MusicComposer._playBossTheme(time, step, bar, stepInBar, ctx, destination);
    } else if (track === 'menu') {
      MusicComposer._playMenuTheme(time, step, bar, stepInBar, ctx, destination);
    }
  }

  // --- 1. BATMAN GOTHAM ROOFTOPS THEME ---
  // D Minor driving gothic ostinato with iconic brass motif and cathedral bells
  static _playRooftopsTheme(time, step, bar, stepInBar, ctx, destination) {
    // A. Driving Bassline: D2 sixteenths with accents
    const bassNotes = [
      73.42, 73.42, 73.42, 73.42, // D2
      73.42, 73.42, 73.42, 73.42,
      58.27, 58.27, 58.27, 58.27, // Bb1
      65.41, 65.41, 69.30, 73.42, // C2 -> C#2 -> D2
    ];
    const bassFreq = bassNotes[stepInBar];
    const isAccent = stepInBar % 4 === 0;
    MusicComposer.playBass(time, bassFreq, 0.12, isAccent ? 0.28 : 0.15, ctx, destination);

    // B. Orchestral Percussion: Timpani & Snares
    if (stepInBar === 0 || stepInBar === 6 || stepInBar === 10) {
      MusicComposer.playTimpani(time, 80, 0.22, ctx, destination);
    }
    if (stepInBar === 4 || stepInBar === 12) {
      MusicComposer.playSnare(time, 0.14, ctx, destination);
    }
    if (stepInBar % 2 === 0) {
      MusicComposer.playHihat(time, 0.05, ctx, destination);
    }

    // C. Iconic Batman Brass Motif: D3 -> F3 -> D3 -> C#3 -> D3
    if (bar === 1 || bar === 3) {
      if (stepInBar === 0) MusicComposer.playBrass(time, 146.83, 0.45, 0.28, ctx, destination); // D3
      if (stepInBar === 4) MusicComposer.playBrass(time, 174.61, 0.35, 0.28, ctx, destination); // F3
      if (stepInBar === 7) MusicComposer.playBrass(time, 146.83, 0.35, 0.28, ctx, destination); // D3
      if (stepInBar === 10) MusicComposer.playBrass(time, 138.59, 0.35, 0.28, ctx, destination); // C#3
      if (stepInBar === 12) MusicComposer.playBrass(time, 146.83, 0.65, 0.28, ctx, destination); // D3
    }

    // D. Cathedral Bells
    if (stepInBar === 0 && bar % 2 === 0) {
      MusicComposer.playBell(time, 440, 0.8, 0.16, ctx, destination); // A4
    }
  }

  // --- 2. BOSS THEME ---
  // High-intensity driving battle march with sharp brass stabs and rapid drums
  static _playBossTheme(time, step, bar, stepInBar, ctx, destination) {
    const bassFreq = (bar % 2 === 0) ? 65.41 : 73.42;
    MusicComposer.playBass(time, bassFreq, 0.1, 0.35, ctx, destination);

    if (stepInBar % 2 === 0) {
      MusicComposer.playTimpani(time, 90, 0.3, ctx, destination);
    }
    if (stepInBar % 4 === 2) {
      MusicComposer.playSnare(time, 0.25, ctx, destination);
    }

    // Piercing gothic brass stabs
    if (stepInBar === 0 || stepInBar === 3 || stepInBar === 6 || stepInBar === 10 || stepInBar === 14) {
      const stabFreq = (stepInBar === 6) ? 220.0 : 174.61;
      MusicComposer.playBrass(time, stabFreq, 0.18, 0.4, ctx, destination);
    }
  }

  // --- 3. MENU THEME ---
  // Brooding ambient dark chord progression with gothic chimes
  static _playMenuTheme(time, step, bar, stepInBar, ctx, destination) {
    if (stepInBar === 0) {
      const chords = [146.83, 116.54, 130.81, 138.59]; // D3, Bb2, C3, C#3
      MusicComposer.playPad(time, chords[bar % chords.length], 2.2, 0.18, ctx, destination);
      MusicComposer.playBell(time, chords[bar % chords.length] * 2, 1.4, 0.15, ctx, destination);
      MusicComposer.playTimpani(time, 65, 0.2, ctx, destination);
    }
  }

  // --- INSTRUMENT SYNTHESIZERS ---

  static playBass(time, freq, duration, gainAmount, ctx, dest) {
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, time);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, time);
      filter.frequency.exponentialRampToValueAtTime(120, time + duration);

      gain.gain.setValueAtTime(gainAmount, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(dest);

      osc.start(time);
      osc.stop(time + duration);
    } catch {}
  }

  static playBrass(time, freq, duration, gainAmount, ctx, dest) {
    try {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc1.type = 'sawtooth';
      osc2.type = 'square';
      osc1.frequency.setValueAtTime(freq, time);
      osc2.frequency.setValueAtTime(freq * 1.006, time); // Detuned for orchestral width

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(900, time);
      filter.frequency.exponentialRampToValueAtTime(450, time + duration);

      gain.gain.setValueAtTime(0.01, time);
      gain.gain.linearRampToValueAtTime(gainAmount, time + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(dest);

      osc1.start(time);
      osc2.start(time);
      osc1.stop(time + duration);
      osc2.stop(time + duration);
    } catch {}
  }

  static playBell(time, freq, duration, gainAmount, ctx, dest) {
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);

      gain.gain.setValueAtTime(gainAmount, time);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

      osc.connect(gain);
      gain.connect(dest);

      osc.start(time);
      osc.stop(time + duration);
    } catch {}
  }

  static playTimpani(time, freq, gainAmount, ctx, dest) {
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq * 1.6, time);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.7, time + 0.25);

      gain.gain.setValueAtTime(gainAmount, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.28);

      osc.connect(gain);
      gain.connect(dest);

      osc.start(time);
      osc.stop(time + 0.28);
    } catch {}
  }

  static playSnare(time, gainAmount, ctx, dest) {
    try {
      const bufferSize = ctx.sampleRate * 0.1;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(800, time);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(gainAmount, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(dest);

      noise.start(time);
      noise.stop(time + 0.1);
    } catch {}
  }

  static playHihat(time, gainAmount, ctx, dest) {
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(8000, time);

      gain.gain.setValueAtTime(gainAmount, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);

      osc.connect(gain);
      gain.connect(dest);

      osc.start(time);
      osc.stop(time + 0.04);
    } catch {}
  }

  static playPad(time, freq, duration, gainAmount, ctx, dest) {
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, time);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(350, time);

      gain.gain.setValueAtTime(0.001, time);
      gain.gain.linearRampToValueAtTime(gainAmount, time + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(dest);

      osc.start(time);
      osc.stop(time + duration);
    } catch {}
  }
}
