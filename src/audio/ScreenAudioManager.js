import { AUDIO_CONFIG } from './AudioConfig.js';
import { LOBBY, assetURL } from '../config/lobby.js';

/** Áudio de telas: loop opcional, fallback, fades e volume compartilhado com a partida. */
export class ScreenAudioManager {
  constructor(shared, profile = {}) {
    this.shared = shared;
    this.volume = LOBBY.audio.volume;
    this.gain = 0;
    this.active = false;
    this.generation = 0;
    this.configure(profile);
    if (typeof Audio !== 'undefined') {
      this.click = new Audio(assetURL(LOBBY.assets.click));
      this.click.preload = 'none';
    }
  }
  configure(profile = {}) {
    this.music?.pause();
    this.generation++;
    this.pending = false;
    this.profile = { music: LOBBY.assets.music, fallbackTrack: 'menu', gain: 1, ...LOBBY.audio, ...profile };
    this.failed = false;
    this.music = typeof Audio === 'undefined' ? null : new Audio(assetURL(this.profile.music));
    if (this.music) {
      const media = this.music;
      media.loop = true; media.preload = 'none';
      media.addEventListener('error', () => {
        if (this.music !== media) return;
        this.failed = true;
        if (this.active) this.shared.setTrack(this.profile.fallbackTrack, { deferContext: true });
      });
    }
  }
  enter() {
    this.generation++;
    this.active = true; this.started = false; this.ending = false;
    if (!this.shared.screenVolumeInitialized) {
      this.shared.setMasterVolume(this.volume);
      this.shared.screenVolumeInitialized = true;
    }
    this.volume = this.shared.masterVolume ?? this.volume;
    this.gain = 0;
    this.fade = { from: 0, to: 1, elapsed: 0, duration: this.profile.fadeIn };
    this.shared.setTrack(this.profile.fallbackTrack, { deferContext: true });
    this.apply();
    // Após uma partida, o áudio já está liberado. Sem gesto anterior, aguarda interação.
    if (this.shared.ctx?.state === 'running') this.unlock();
  }
  unlock() {
    if (!this.active || this.ending) return;
    if (!this.started) {
      this.started = true; this.gain = 0;
      this.fade = { from: 0, to: 1, elapsed: 0, duration: this.profile.fadeIn };
      this.apply();
    }
    this.shared._initContext();
    this.shared.ctx?.resume()?.catch(() => {});
    if (this.music && !this.failed && this.music.paused && !this.pending) {
      const media = this.music, generation = this.generation;
      this.pending = true;
      media.play().then(() => {
        if (this.active && this.generation === generation && media === this.music) this.shared.setTrack(null);
        else media.pause();
      }).catch(() => {}).finally(() => { if (this.generation === generation) this.pending = false; });
    }
  }
  fadeOut() {
    this.ending = true;
    this.fade = { from: this.gain, to: 0, elapsed: 0, duration: this.profile.fadeOut };
  }
  update(ms) {
    if (!this.active) return;
    if (this.fade) {
      this.fade.elapsed += ms;
      const t = Math.min(1, this.fade.elapsed / Math.max(1, this.fade.duration));
      this.gain = this.fade.from + (this.fade.to - this.fade.from) * t;
      if (t === 1) this.fade = null;
    }
    this.volume = this.shared.masterVolume ?? this.volume;
    this.apply();
  }
  apply() {
    if (this.music) this.music.volume = this.shared.isMuted ? 0 : Math.min(1, this.volume * this.gain * this.profile.gain);
    if (this.active) this.shared.setBgmVolume(AUDIO_CONFIG.VOLUMES.BGM * this.gain * this.profile.gain);
  }
  setVolume(value) {
    this.volume = Math.max(0, Math.min(1, value));
    this.shared.setMasterVolume(this.volume); this.apply();
  }
  playClick() {
    if (this.shared.isMuted) return;
    if (this.click) {
      this.click.volume = this.volume * LOBBY.audio.effects;
      this.click.currentTime = 0;
      this.click.play().catch(() => { if (this.active) this.shared.playSfx('throw'); });
    } else this.shared.playSfx('throw');
  }
  leave() {
    if (!this.active) return;
    this.active = false; this.generation++; this.pending = false; this.fade = null;
    this.music?.pause();
    this.shared.setBgmVolume(AUDIO_CONFIG.VOLUMES.BGM);
  }
}
