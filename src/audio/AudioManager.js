/**
 * ============================================================================
 * @file AudioManager.js
 * @category POO - Fachada de Áudio & Sequenciador (Audio Subsystem / Façade Pattern)
 * ============================================================================
 * CONCEITOS DE PROGRAMAÇÃO ORIENTADA A OBJETOS (POO):
 * 
 * 1. ENCAPSULAMENTO DE HARDWARE DE ÁUDIO (Web Audio API):
 *    Isola o AudioContext do navegador e a árvore de nós de ganho (Master, BGM, SFX).
 *    Os componentes do jogo apenas solicitam playSfx('nome') ou setTrack('nome'),
 *    sem precisar lidar com buffers, osciladores ou timestamps nativos.
 * 
 * 2. MODULARIDADE E SEPARAÇÃO DE PASTAS:
 *    Localizado na pasta independente 'src/audio/' para que parâmetros de volume,
 *    efeitos e partituras possam ser alterados facilmente sem impactar a física ou entidades.
 * 
 * 3. COMPOSIÇÃO:
 *    Colabora com AudioConfig (dados), SoundEffects (síntese) e MusicComposer (partituras).
 * ============================================================================
 */

import { AUDIO_CONFIG } from './AudioConfig.js';
import { MusicComposer } from './MusicComposer.js';
import { SoundEffects } from './SoundEffects.js';

export class AudioManager {
  /**
   * CONSTRUTOR:
   * Inicializa barramentos e configura o desbloqueio por gesto do usuário.
   */
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.bgmGain = null;
    this.sfxGain = null;
    this.isMuted = false;

    // Estados do Sequenciador Musical
    this.currentTrack = null; // 'menu' | 'rooftops' | 'boss'
    this.step = 0;
    this.tempo = AUDIO_CONFIG.TEMPOS.ROOFTOPS;
    this.musicTimer = null;
    this.nextNoteTime = 0;

    this._initContext = this._initContext.bind(this);
    this._scheduler = this._scheduler.bind(this);

    // Auto-unlock on first user gesture
    window.addEventListener('keydown', this._initContext, { once: true });
    window.addEventListener('mousedown', this._initContext, { once: true });
    window.addEventListener('touchstart', this._initContext, { once: true });
  }

  _initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();

      // Master Output
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(
        this.isMuted ? 0 : AUDIO_CONFIG.VOLUMES.MASTER,
        this.ctx.currentTime
      );
      this.masterGain.connect(this.ctx.destination);

      // Separate BGM bus
      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.setValueAtTime(AUDIO_CONFIG.VOLUMES.BGM, this.ctx.currentTime);
      this.bgmGain.connect(this.masterGain);

      // Separate SFX bus
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(AUDIO_CONFIG.VOLUMES.SFX, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      // Start music sequencer
      this.nextNoteTime = this.ctx.currentTime + 0.1;
      this._startScheduler();
    } else if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * Toggles mute state on/off.
   * @returns {boolean} Current mute state
   */
  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(
        this.isMuted ? 0 : AUDIO_CONFIG.VOLUMES.MASTER,
        this.ctx.currentTime
      );
    }
    return this.isMuted;
  }

  /**
   * Sets the active background soundtrack.
   * @param {'menu' | 'rooftops' | 'boss' | null} track
   */
  setTrack(track) {
    if (this.currentTrack === track) return;
    this.currentTrack = track;
    this.step = 0;

    if (track === 'boss') {
      this.tempo = AUDIO_CONFIG.TEMPOS.BOSS;
    } else if (track === 'rooftops') {
      this.tempo = AUDIO_CONFIG.TEMPOS.ROOFTOPS;
    } else if (track === 'menu') {
      this.tempo = AUDIO_CONFIG.TEMPOS.MENU;
    }

    if (!this.ctx) {
      this._initContext();
    }
  }

  /**
   * Dispatches a sound effect by name.
   * @param {string} type - 'throw' | 'hit' | 'batman_hit' | 'kill' | 'joker_laugh' | 'teeth_chatter' | etc.
   */
  playSfx(type) {
    if (!this.ctx || this.isMuted) return;
    SoundEffects.play(type, this.ctx, this.sfxGain);
  }

  _startScheduler() {
    if (this.musicTimer) clearInterval(this.musicTimer);
    this.musicTimer = setInterval(this._scheduler, 25);
  }

  _scheduler() {
    if (!this.ctx || this.isMuted || !this.currentTrack) return;

    const scheduleAheadTime = 0.12; // 120ms lookahead
    while (this.nextNoteTime < this.ctx.currentTime + scheduleAheadTime) {
      MusicComposer.scheduleStep(
        this.currentTrack,
        this.nextNoteTime,
        this.step,
        this.ctx,
        this.bgmGain
      );

      const secondsPerBeat = 60.0 / this.tempo;
      const secondsPer16th = secondsPerBeat / 4;
      this.nextNoteTime += secondsPer16th;
      this.step = (this.step + 1) % 64; // 4-bar loop
    }
  }

  // Volume setters for easy runtime balancing
  setMasterVolume(val) {
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, val)), this.ctx.currentTime);
    }
  }

  setBgmVolume(val) {
    if (this.bgmGain && this.ctx) {
      this.bgmGain.gain.setValueAtTime(Math.max(0, Math.min(1, val)), this.ctx.currentTime);
    }
  }

  setSfxVolume(val) {
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(Math.max(0, Math.min(1, val)), this.ctx.currentTime);
    }
  }

  destroy() {
    if (this.musicTimer) clearInterval(this.musicTimer);
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
  }
}
