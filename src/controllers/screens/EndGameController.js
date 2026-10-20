import { EndGameView } from '../../views/screens/EndGameView.js';
// Este arquivo cuida de coordenar a tela compartilhada de vitória e derrota.
// ===== DEPENDÊNCIAS E CONFIGURAÇÕES =====
import { ScreenAudioControls } from "../ui/ScreenAudioControls.js";
import { LOBBY } from "../../config/configuracao.js";
import { ScreenAudioManager } from "../../views/audio/ScreenAudioManager.js";
import { ScreenNavigation } from "../ui/ScreenNavigation.js";
import { normalizeResultData } from "../../models/results/resultData.js";
import { formatPlayTime } from "../../views/ui/formatPlayTime.js";
// Mantém os imports existentes enquanto os consumidores migram para os utilitários.
export { normalizeResultData, formatPlayTime };
/** Cena base de vitória/derrota. Recebe dados e serviços explicitamente por parâmetros. */
// ===== COMPORTAMENTO =====
export class EndGameController {
  // Recebe as dependências e prepara o estado inicial deste componente.
  constructor(raiz, { sound, goTo, isTransitioning }) {
    this.view = new EndGameView();
    this.root = raiz;
    this.sound = sound;
    this.goTo = goTo;
    this.isTransitioning = isTransitioning;
    this.audio = new ScreenAudioManager(sound);
    this.backgrounds = this.view.backgrounds;
    this.time = 0;
    this.pointer = 0;
    this.reduced = globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    this.prepare("defeat", {});
  }
  // ===== PREPARAÇÃO E MONTAGEM =====
  prepare(result, dados) {
    const profile = LOBBY.endScreens.screens[result];
    if (!profile) throw new Error(`Resultado desconhecido: ${result}`);
    this.result = result;
    this.profile = profile;
    this.data = normalizeResultData(dados);
    this.view.prepareBackground(result,profile);
    this.backdrop = this.view.backdrop;
    this.time = 0;
    this.pointer = 0;
    this.backdrop.batSignal.enter(0);
    this.buttons = profile.buttons.map((botao) => ({
      ...botao,
      enabled: botao.id === "next" ? LOBBY.endScreens.features.nextLevel || botao.enabled : botao.enabled
    }));
  }
  // Recebe o resultado da partida e conecta apenas os recursos usados por esta tela.
  // Prepara os elementos e eventos usados enquanto esta tela estiver aberta.
  mount(result, dados) {
    this.prepare(result, dados);
    this.audio.configure(this.profile.audio);
    this.audio.enter();
    if (!this.root) return;
    const profile = this.profile;
    this.view.mount(this.getViewState());
    this.prepararInteracao();
    this.root.querySelector("h1").focus({ preventScroll: true });
    this.sound.playSfx(profile.audio.cue);
    this.syncAudio();
  }
  prepararInteracao() {
    const labels = LOBBY.endScreens.labels;
    this.navigation = new ScreenNavigation(this.root, {
      activate: (id) => this.activate(id),
      blocked: () => this.blocked(),
      gesture: () => this.audio.unlock(),
      back: () => this.activate("menu")
    });
    this.navigation.mount();
    this.controlesAudio = new ScreenAudioControls(this.root, this.audio, this.sound, labels);
    this.root.onpointermove = (evento) => {
      const box = this.root.getBoundingClientRect();
      this.pointer = (evento.clientX - box.left) / Math.max(1, box.width) * 2 - 1;
    };
  }
  // ===== PONTUAÇÃO E AÇÕES =====
  getViewState() {
    return {
      root: this.root, backdrop: this.backdrop,
      time: this.time, pointer: this.pointer, reduced: this.reduced,
      profile: this.profile, result: this.result, data: this.data,
      buttons: this.buttons, audio: { volume: this.audio.volume }
    };
  }
  blocked() {
    return this.isTransitioning() || this.time < LOBBY.endScreens.inputDelay;
  }
  /** Agrupa valores iguais, mantendo a conta correta quando cada tipo vale pontos diferentes. */
  scoreSummary() { return this.view.scoreSummary(this.getViewState()); }
  updateCounters() { return this.view.updateCounters(this.getViewState()); }
  activate(id) {
    const botao = this.buttons.find((item) => item.id === id);
    if (!botao?.enabled || this.blocked()) return false;
    this.audio.unlock();
    const destinoAudio = id === "next" ? LOBBY.endScreens.nextScene : botao.scene;
    const accepted = this.goTo(destinoAudio, {
      ...this.data,
      nextLevelIndex: this.data.levelIndex + 1
    });
    if (accepted) this.audio.playClick();
    return accepted;
  }
  syncAudio() {
    this.controlesAudio?.atualizar();
  }
  // ===== ATUALIZAÇÃO E SAÍDA =====
  // Recebe a atualização atual e avança o estado, sem redesenhar a tela.
  update(milissegundos) {
    this.time += milissegundos;
    this.audio.update(milissegundos);
    this.navigation?.update(milissegundos);
    this.syncAudio();
    this.updateCounters();
  }
  // Libera os eventos e recursos ativos desta visita à tela.
  unmount() {
    this.navigation?.destroy();
    this.navigation = null;
    this.audio.leave();
    this.controlesAudio?.destroy();
    this.controlesAudio = null;
    this.view.unmount(this.getViewState());
  }
}

export { EndGameController as EndGameScene };
