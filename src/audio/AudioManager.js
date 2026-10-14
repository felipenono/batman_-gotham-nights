// Este arquivo cuida de coordenar o contexto de áudio, os volumes e o sequenciador.
// ===== DEPENDÊNCIAS E CONFIGURAÇÕES =====
import { AUDIO_CONFIG } from "../config/configuracao.js";
import { LOBBY } from "../config/configuracao.js";
import { MusicComposer } from "./MusicComposer.js";
import { SoundEffects } from "./SoundEffects.js";
// ===== COMPORTAMENTO =====
export class AudioManager {
  /**
  * CONSTRUTOR:
  * Inicializa barramentos e configura o desbloqueio por gesto do usuário.
  */
  // Recebe as dependências e prepara o estado inicial deste componente.
  constructor() {
    this.encerrado = false;
    this.ctx = null;
    this.masterGain = null;
    this.bgmGain = null;
    this.sfxGain = null;
    this.isMuted = false;
    this.masterVolume = AUDIO_CONFIG.VOLUMES.MASTER;
    this.currentTrack = null;
    this.step = 0;
    this.tempo = AUDIO_CONFIG.TEMPOS.ROOFTOPS;
    this.musicTimer = null;
    this.nextNoteTime = 0;
    this._initContext = this._initContext.bind(this);
    this._scheduler = this._scheduler.bind(this);
    window.addEventListener("keydown", this._initContext, { once: true });
    window.addEventListener("mousedown", this._initContext, { once: true });
    window.addEventListener("touchstart", this._initContext, { once: true });
  }
  _initContext() {
    if (this.encerrado) return;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.masterVolume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.setValueAtTime(AUDIO_CONFIG.VOLUMES.BGM, this.ctx.currentTime);
      this.bgmGain.connect(this.masterGain);
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(AUDIO_CONFIG.VOLUMES.SFX, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);
      this.nextNoteTime = this.ctx.currentTime + 0.1;
      this._startScheduler();
    } else if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }
  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.masterVolume, this.ctx.currentTime);
    }
    return this.isMuted;
  }
  setTrack(trilha, { deferContext = false } = {}) {
    if (this.currentTrack === trilha) return;
    this.currentTrack = trilha;
    this.step = 0;
    if (trilha === "boss") {
      this.tempo = AUDIO_CONFIG.TEMPOS.BOSS;
    } else if (trilha === "rooftops") {
      this.tempo = AUDIO_CONFIG.TEMPOS.ROOFTOPS;
    } else if (trilha === "menu") {
      this.tempo = AUDIO_CONFIG.TEMPOS.MENU;
    } else if (LOBBY.endScreens.screens[trilha]) {
      this.tempo = LOBBY.endScreens.screens[trilha].audio.tempo;
    }
    if (!this.ctx && !deferContext) {
      this._initContext();
    }
  }
  playSfx(tipo) {
    if (!this.ctx || this.isMuted) return;
    SoundEffects.play(tipo, this.ctx, this.sfxGain);
  }
  _startScheduler() {
    if (this.musicTimer) clearInterval(this.musicTimer);
    this.musicTimer = setInterval(this._scheduler, 25);
  }
  _scheduler() {
    if (!this.ctx || this.isMuted || !this.currentTrack) return;
    this.nextNoteTime = Math.max(this.nextNoteTime, this.ctx.currentTime);
    const scheduleAheadTime = 0.12;
    while (this.nextNoteTime < this.ctx.currentTime + scheduleAheadTime) {
      MusicComposer.scheduleStep(this.currentTrack, this.nextNoteTime, this.step, this.ctx, this.bgmGain);
      const secondsPerBeat = 60 / this.tempo;
      const secondsPer16th = secondsPerBeat / 4;
      this.nextNoteTime += secondsPer16th;
      this.step = (this.step + 1) % 64;
    }
  }
  setMasterVolume(val) {
    this.masterVolume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, val)), this.ctx.currentTime);
    }
  }
  setBgmVolume(val) {
    if (this.bgmGain && this.ctx) {
      this.bgmGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.bgmGain.gain.setValueAtTime(Math.max(0, Math.min(1, val)), this.ctx.currentTime);
    }
  }
  /** Fade da trilha da partida antes de trocar para uma tela de resultado. */
  fadeBgmVolume(valor, duracao) {
    if (!this.bgmGain || !this.ctx) return;
    const ganho = this.bgmGain.gain, instanteAtual = this.ctx.currentTime;
    ganho.cancelScheduledValues(instanteAtual);
    ganho.setValueAtTime(ganho.value, instanteAtual);
    ganho.linearRampToValueAtTime(valor, instanteAtual + duracao / 1000);
  }
  setSfxVolume(val) {
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(Math.max(0, Math.min(1, val)), this.ctx.currentTime);
    }
  }
  // Encerra os recursos desta instância para não deixar eventos ativos.
  destroy() {
    // Um gesto posterior não pode recriar o contexto de um gerenciador descartado.
    this.encerrado = true;
    window.removeEventListener("keydown", this._initContext);
    window.removeEventListener("mousedown", this._initContext);
    window.removeEventListener("touchstart", this._initContext);
    if (this.musicTimer) clearInterval(this.musicTimer);
    this.musicTimer = null;
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
  }
}
