/**
 * @file SoundEffects.js
 * Procedural Web Audio sound effects collection for Batman and all rogue gallery villains.
 * Modify parameters here or in AudioConfig.js to customize individual sounds.
 */

import { AUDIO_CONFIG } from './AudioConfig.js';

export class SoundEffects {
  /**
   * Main sound dispatcher.
   * @param {string} type
   * @param {AudioContext} ctx
   * @param {AudioNode} outputNode
   */
  static play(type, ctx, outputNode) {
    if (!ctx || !outputNode) return;
    const now = ctx.currentTime;
    const cfg = AUDIO_CONFIG.SFX;

    switch (type) {
      // 1. BATMAN SFX
      case 'throw':
        SoundEffects.playThrow(ctx, outputNode, now, cfg.BATARANG_THROW);
        break;

      case 'hit':
      case 'enemy_hit':
        SoundEffects.playEnemyHit(ctx, outputNode, now, cfg.ENEMY_HIT);
        break;

      case 'batman_hit':
        SoundEffects.playBatmanHit(ctx, outputNode, now, cfg.BATMAN_HIT);
        break;

      case 'kill':
        SoundEffects.playKill(ctx, outputNode, now, cfg.ENEMY_KILL);
        break;

      // 2. JOKER SFX
      case 'joker_laugh':
        SoundEffects.playJokerLaugh(ctx, outputNode, now, cfg.JOKER_LAUGH);
        break;

      case 'teeth_chatter':
        SoundEffects.playTeethChatter(ctx, outputNode, now, cfg.TEETH_CHATTER);
        break;

      // 3. SCARECROW SFX
      case 'gas_hiss':
        SoundEffects.playGasHiss(ctx, outputNode, now, cfg.SCARECROW_GAS);
        break;

      case 'fear_drone':
        SoundEffects.playFearDrone(ctx, outputNode, now, cfg.FEAR_DRONE);
        break;

      case 'gas_bomb':
        SoundEffects.playGasBomb(ctx, outputNode, now, cfg.GAS_BOMB);
        break;

      // 4. PENGUIN SFX
      case 'umbrella_shot':
        SoundEffects.playUmbrellaShot(ctx, outputNode, now, cfg.PENGUIN_UMBRELLA);
        break;

      // 5. HARLEY QUINN & TWO-FACE SFX
      case 'gunshot':
        SoundEffects.playGunshot(ctx, outputNode, now, cfg.GUNSHOT);
        break;

      case 'coin_ping':
        SoundEffects.playCoinPing(ctx, outputNode, now, cfg.COIN_PING);
        break;

      // 6. STAGE FANFARES
      case 'boss_enter':
        SoundEffects.playBossEnter(ctx, outputNode, now);
        break;

      case 'gameover':
        SoundEffects.playGameOver(ctx, outputNode, now);
        break;

      case 'victory':
        SoundEffects.playVictory(ctx, outputNode, now);
        break;
    }
  }

  // --- BATMAN BATARANG THROW ---
  static playThrow(ctx, output, now, cfg) {
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(cfg.startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(cfg.endFreq, now + cfg.duration);
      gain.gain.setValueAtTime(cfg.volume, now);
      gain.gain.linearRampToValueAtTime(0.01, now + cfg.duration);
      osc.connect(gain);
      gain.connect(output);
      osc.start(now);
      osc.stop(now + cfg.duration);
    } catch {}
  }

  // --- BATMAN DAMAGE HIT ---
  static playBatmanHit(ctx, output, now, cfg) {
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(cfg.startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(cfg.endFreq, now + cfg.duration);
      gain.gain.setValueAtTime(cfg.volume, now);
      gain.gain.linearRampToValueAtTime(0.01, now + cfg.duration);
      osc.connect(gain);
      gain.connect(output);
      osc.start(now);
      osc.stop(now + cfg.duration);
    } catch {}
  }

  // --- ENEMY DAMAGE HIT ---
  static playEnemyHit(ctx, output, now, cfg) {
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(cfg.startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(cfg.endFreq, now + cfg.duration);
      gain.gain.setValueAtTime(cfg.volume, now);
      gain.gain.linearRampToValueAtTime(0.01, now + cfg.duration);
      osc.connect(gain);
      gain.connect(output);
      osc.start(now);
      osc.stop(now + cfg.duration);
    } catch {}
  }

  // --- ENEMY DEFEAT EXPLOSION ---
  static playKill(ctx, output, now, cfg) {
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(cfg.startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(cfg.endFreq, now + cfg.duration);
      gain.gain.setValueAtTime(cfg.volume, now);
      gain.gain.linearRampToValueAtTime(0.01, now + cfg.duration);
      osc.connect(gain);
      gain.connect(output);
      osc.start(now);
      osc.stop(now + cfg.duration);
    } catch {}
  }

  // --- JOKER LAUGHTER ---
  static playJokerLaugh(ctx, output, now, cfg) {
    try {
      cfg.notes.forEach((freq, idx) => {
        const t = now + idx * cfg.noteInterval;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(cfg.volume, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + cfg.noteDuration);
        osc.connect(gain);
        gain.connect(output);
        osc.start(t);
        osc.stop(t + cfg.noteDuration);
      });
    } catch {}
  }

  // --- JOKER WIND-UP TEETH CHATTER ---
  static playTeethChatter(ctx, output, now, cfg) {
    try {
      for (let i = 0; i < cfg.clicks; i++) {
        const t = now + i * 0.05;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(cfg.baseFreq + i * 60, t);
        gain.gain.setValueAtTime(cfg.volume, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.03);
        osc.connect(gain);
        gain.connect(output);
        osc.start(t);
        osc.stop(t + 0.03);
      }
    } catch {}
  }

  // --- SCARECROW FEAR TOXIN HISS ---
  static playGasHiss(ctx, output, now, cfg) {
    try {
      const bufferSize = ctx.sampleRate * cfg.duration;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(cfg.filterFreq, now);
      filter.Q.setValueAtTime(3.5, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(cfg.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + cfg.duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(output);
      noise.start(now);
      noise.stop(now + cfg.duration);
    } catch {}
  }

  // --- SCARECROW FEAR AURA DRONE ---
  static playFearDrone(ctx, output, now, cfg) {
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(cfg.startFreq, now);
      osc.frequency.linearRampToValueAtTime(cfg.peakFreq, now + cfg.duration * 0.4);
      osc.frequency.linearRampToValueAtTime(cfg.endFreq, now + cfg.duration);
      gain.gain.setValueAtTime(cfg.volume, now);
      gain.gain.linearRampToValueAtTime(0.01, now + cfg.duration);
      osc.connect(gain);
      gain.connect(output);
      osc.start(now);
      osc.stop(now + cfg.duration);
    } catch {}
  }

  // --- SCARECROW GAS BOMB EXPLOSION ---
  static playGasBomb(ctx, output, now, cfg) {
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(cfg.startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(cfg.endFreq, now + cfg.duration);
      gain.gain.setValueAtTime(cfg.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + cfg.duration);
      osc.connect(gain);
      gain.connect(output);
      osc.start(now);
      osc.stop(now + cfg.duration);
    } catch {}
  }

  // --- PENGUIN TRICK UMBRELLA BLAST ---
  static playUmbrellaShot(ctx, output, now, cfg) {
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(cfg.startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(cfg.endFreq, now + cfg.duration);
      gain.gain.setValueAtTime(cfg.volume, now);
      gain.gain.linearRampToValueAtTime(0.01, now + cfg.duration);
      osc.connect(gain);
      gain.connect(output);
      osc.start(now);
      osc.stop(now + cfg.duration);
    } catch {}
  }

  // --- HARLEY QUINN & TWO-FACE GUNSHOT ---
  static playGunshot(ctx, output, now, cfg) {
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(cfg.startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(cfg.endFreq, now + cfg.duration);
      gain.gain.setValueAtTime(cfg.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + cfg.duration);
      osc.connect(gain);
      gain.connect(output);
      osc.start(now);
      osc.stop(now + cfg.duration);
    } catch {}
  }

  // --- TWO-FACE SCARRED COIN PING ---
  static playCoinPing(ctx, output, now, cfg) {
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(cfg.freq1, now);
      osc.frequency.setValueAtTime(cfg.freq2, now + 0.08);
      gain.gain.setValueAtTime(cfg.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + cfg.duration);
      osc.connect(gain);
      gain.connect(output);
      osc.start(now);
      osc.stop(now + cfg.duration);
    } catch {}
  }

  // --- BOSS ENTRANCE ALARM ---
  static playBossEnter(ctx, output, now) {
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(80, now);
      osc.frequency.linearRampToValueAtTime(160, now + 0.45);
      gain.gain.setValueAtTime(0.38, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.45);
      osc.connect(gain);
      gain.connect(output);
      osc.start(now);
      osc.stop(now + 0.45);
    } catch {}
  }

  // --- GAME OVER DIRGE ---
  static playGameOver(ctx, output, now) {
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.85);
      gain.gain.setValueAtTime(0.42, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.85);
      osc.connect(gain);
      gain.connect(output);
      osc.start(now);
      osc.stop(now + 0.85);
    } catch {}
  }

  // --- VICTORY FANFARE ---
  static playVictory(ctx, output, now) {
    try {
      const notes = [
        { f: 293.66, t: 0 },    // D4
        { f: 369.99, t: 0.15 }, // F#4
        { f: 440.00, t: 0.30 }, // A4
        { f: 587.33, t: 0.45 }, // D5
      ];
      notes.forEach(({ f, t }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now + t);
        gain.gain.setValueAtTime(0.35, now + t);
        gain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.6);
        osc.connect(gain);
        gain.connect(output);
        osc.start(now + t);
        osc.stop(now + t + 0.6);
      });
    } catch {}
  }
}
