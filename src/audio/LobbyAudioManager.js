import { AUDIO_CONFIG } from './AudioConfig.js';
import { LOBBY, assetURL } from '../config/lobby.js';

/** Música externa opcional com fallback sintetizado e um único volume global. */
export class LobbyAudioManager {
  constructor(shared) {
    this.shared = shared;
    this.volume = LOBBY.audio.volume;
    this.active = false;
    this.gain = 0;
    this.music = null;
    if (typeof Audio !== 'undefined') {
      this.music = new Audio(assetURL(LOBBY.assets.music));
      this.music.loop = true;
      this.music.preload = 'none';
      this.music.addEventListener('error', () => {
        this.failed = true;
        if (this.active) this.shared.setTrack('menu', { deferContext: true });
      });
      this.click = new Audio(assetURL(LOBBY.assets.click));
      this.click.preload = 'none';
    }
  }
  enter() {
    this.active = true;
    this.started = false;
    this.shared.setMasterVolume(this.volume);
    this.gain = 0;
    this.fade = { from: 0, to: 1, elapsed: 0, duration: LOBBY.audio.fadeIn };
    this.shared.setTrack('menu');
    this.apply();
  }
  // Chamado por gesto real; o navegador pode bloquear reprodução automática.
  unlock() {
    if (this.active && !this.started) {
      this.started = true;
      this.gain = 0;
      this.fade = { from: 0, to: 1, elapsed: 0, duration: LOBBY.audio.fadeIn };
      this.apply();
    }
    this.shared._initContext();
    this.shared.ctx?.resume()?.catch(() => {});
    if (this.active && this.music && !this.failed && this.music.paused) {
      this.music.play().then(() => {
        if (this.active) this.shared.setTrack(null);
        else this.music.pause();
      }).catch(() => {});
    }
  }
  fadeOut() {
    this.fade = { from: this.gain, to: 0, elapsed: 0, duration: LOBBY.audio.fadeOut };
  }
  update(ms) {
    if (this.fade) {
      this.fade.elapsed += ms;
      const t = Math.min(1, this.fade.elapsed / this.fade.duration);
      this.gain = this.fade.from + (this.fade.to - this.fade.from) * t;
      if (t === 1) this.fade = null;
    }
    this.apply();
  }
  apply() {
    if (this.music) this.music.volume = this.shared.isMuted ? 0 : this.volume * this.gain;
    if (this.active) this.shared.setBgmVolume(AUDIO_CONFIG.VOLUMES.BGM * this.gain);
  }
  setVolume(value) {
    this.volume = Math.max(0, Math.min(1, value));
    this.shared.setMasterVolume(this.volume);
    this.apply();
  }
  playClick() {
    if (this.shared.isMuted) return;
    if (this.click) {
      this.click.volume = this.volume * LOBBY.audio.effects;
      this.click.currentTime = 0;
      this.click.play().catch(() => this.shared.playSfx('throw'));
    } else this.shared.playSfx('throw');
  }
  leave() {
    this.active = false;
    this.music?.pause();
    this.shared.setBgmVolume(AUDIO_CONFIG.VOLUMES.BGM);
  }
}
