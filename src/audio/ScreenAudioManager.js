// Este arquivo cuida de controlar músicas de menu, alternativas e fades.
// ===== DEPENDÊNCIAS E CONFIGURAÇÕES =====
import { AUDIO_CONFIG, LOBBY, assetURL } from "../config/configuracao.js";
// ===== COMPORTAMENTO =====
export class ScreenAudioManager {
  // Recebe as dependências e prepara o estado inicial deste componente.
  constructor(somCompartilhado, perfil = {}) {
    this.shared = somCompartilhado;
    this.volume = LOBBY.audio.volume;
    this.gain = 0;
    this.active = false;
    this.generation = 0;
    this.configure(perfil);
    if (typeof Audio !== "undefined") {
      this.click = new Audio(assetURL(LOBBY.assets.click));
      this.click.preload = "none";
    }
  }
  // ===== PREPARAÇÃO E ENTRADA =====
  // Recebe o perfil da tela e invalida pedidos de reprodução da tela anterior.
  configure(perfil = {}) {
    this.music?.pause();
    this.generation += 1;
    this.pending = false;
    this.profile = {
      music: LOBBY.assets.music,
      fallbackTrack: "menu",
      gain: 1,
      ...LOBBY.audio,
      ...perfil
    };
    this.failed = false;
    this.music = this.criarMusica();
  }
  criarMusica() {
    if (typeof Audio === "undefined") return null;
    const musica = new Audio(assetURL(this.profile.music));
    musica.loop = true;
    musica.preload = "none";
    musica.addEventListener("error", () => {
      if (this.music !== musica) return;
      this.failed = true;
      if (this.active) this.shared.setTrack(this.profile.fallbackTrack, { deferContext: true });
    });
    return musica;
  }
  enter() {
    this.generation += 1;
    this.active = true;
    this.started = false;
    this.ending = false;
    if (!this.shared.screenVolumeInitialized) {
      this.shared.setMasterVolume(this.volume);
      this.shared.screenVolumeInitialized = true;
    }
    this.volume = this.shared.masterVolume ?? this.volume;
    this.gain = 0;
    this.iniciarFade(0, 1, this.profile.fadeIn);
    this.shared.setTrack(this.profile.fallbackTrack, { deferContext: true });
    this.apply();
    // A primeira visita precisa de um gesto; depois de jogar, o áudio já está liberado.
    if (this.shared.ctx?.state === "running") this.unlock();
  }
  // Recebe um gesto do usuário e tenta iniciar o arquivo sem bloquear a interface.
  unlock() {
    if (!this.active || this.ending) return;
    if (!this.started) {
      this.started = true;
      this.gain = 0;
      this.iniciarFade(0, 1, this.profile.fadeIn);
      this.apply();
    }
    this.shared._initContext();
    this.shared.ctx?.resume()?.catch(() => {});
    this.tentarReproduzirMusica();
  }
  tentarReproduzirMusica() {
    if (!this.music || this.failed || !this.music.paused || this.pending) return;
    const musica = this.music;
    const geracao = this.generation;
    this.pending = true;
    musica.play().then(() => {
      // Um pedido antigo pode terminar depois da troca de tela; ele não deve substituir a nova trilha.
      if (this.active && this.generation === geracao && musica === this.music) {
        this.shared.setTrack(null);
      } else {
        musica.pause();
      }
    }).catch(() => {
      // O navegador pode recusar a reprodução. A trilha sintetizada permanece disponível.
    }).finally(() => {
      if (this.generation === geracao) this.pending = false;
    });
  }
  // ===== TRANSIÇÕES E VOLUME =====
  iniciarFade(inicio, destino, duracao) {
    this.fade = {
      from: inicio,
      to: destino,
      elapsed: 0,
      duration: duracao
    };
  }
  fadeOut() {
    this.ending = true;
    this.iniciarFade(this.gain, 0, this.profile.fadeOut);
  }
  atualizarFade(milissegundos) {
    if (!this.fade) return;
    this.fade.elapsed += milissegundos;
    const progresso = Math.min(1, this.fade.elapsed / Math.max(1, this.fade.duration));
    this.gain = this.fade.from + (this.fade.to - this.fade.from) * progresso;
    if (progresso === 1) this.fade = null;
  }
  // Recebe a atualização atual e avança o estado, sem redesenhar a tela.
  update(milissegundos) {
    if (!this.active) return;
    this.atualizarFade(milissegundos);
    this.volume = this.shared.masterVolume ?? this.volume;
    this.apply();
  }
  apply() {
    if (this.music) {
      const volume = this.volume * this.gain * this.profile.gain;
      this.music.volume = this.shared.isMuted ? 0 : Math.min(1, volume);
    }
    if (this.active) {
      this.shared.setBgmVolume(AUDIO_CONFIG.VOLUMES.BGM * this.gain * this.profile.gain);
    }
  }
  setVolume(valor) {
    this.volume = Math.max(0, Math.min(1, valor));
    this.shared.setMasterVolume(this.volume);
    this.apply();
  }
  // ===== EFEITOS E SAÍDA =====
  playClick() {
    if (this.shared.isMuted) return;
    if (!this.click) {
      this.shared.playSfx("throw");
      return;
    }
    this.click.volume = this.volume * LOBBY.audio.effects;
    this.click.currentTime = 0;
    this.click.play().catch(() => {
      if (this.active) this.shared.playSfx("throw");
    });
  }
  leave() {
    if (!this.active) return;
    this.active = false;
    this.generation += 1;
    this.pending = false;
    this.fade = null;
    this.music?.pause();
    this.shared.setBgmVolume(AUDIO_CONFIG.VOLUMES.BGM);
  }
  // Encerra os recursos desta instância para não deixar eventos ativos.
  destroy() {
    this.leave();
    this.music?.pause();
    this.click?.pause();
    this.music = null;
    this.click = null;
  }
}
