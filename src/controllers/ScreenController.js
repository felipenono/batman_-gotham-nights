import { PauseView } from '../views/screens/PauseView.js';
// Este arquivo cuida de montar e desmontar a interface de cada estado.
// ===== DEPENDÊNCIAS E CONFIGURAÇÕES =====
import { MenuController } from "./screens/MenuController.js";
import { EndGameController } from "./screens/EndGameController.js";
import { GameState } from "../models/GameState.js";
/** Coordena o ciclo de vida das interfaces; cada cena cuida dos próprios elementos. */
// ===== COMPORTAMENTO =====
export class ScreenController {
  // Recebe as dependências e prepara o estado inicial deste componente.
  constructor(game, raiz) {
    this.pauseView = new PauseView();
    this.game = game;
    this.root = raiz;
    this.previous = "";
    this.revision = 0;
    this.menu = new MenuController(game, raiz);
    this.end = new EndGameController(raiz, {
      sound: game.soundManager,
      goTo: (name, dados) => game.sceneManager.goTo(name, dados),
      isTransitioning: () => Boolean(game.sceneManager.transition)
    });
    this.active = null;
    this.resultData = {};
  }
  getPresentation() {
    return {
      menu: { view: this.menu.view, state: this.menu.getViewState() },
      end: { view: this.end.view, state: this.end.getViewState() }
    };
  }
  get activeAudio() {
    return this.active?.audio ?? null;
  }
  setResult(result, dados) {
    this.result = result;
    this.resultData = dados;
    this.revision++;
  }
  // Recebe a atualização atual e avança o estado, sem redesenhar a tela.
  update() {
    const state = this.game.state, chave = `${state}:${this.revision}`;
    if (chave === this.previous) return;
    this.previous = chave;
    this.active?.unmount();
    this.active = null;
    const visible = [
      GameState.MENU,
      GameState.GAME_OVER,
      GameState.VICTORY,
      GameState.PAUSED
    ].includes(state);
    this.root?.classList.toggle("pause-screen", state === GameState.PAUSED);
    if (this.root) {
      this.root.hidden = !visible;
      this.root.replaceChildren();
    }
    if (state === GameState.PAUSED && this.root) {
      this.montarPausa();
    } else if (state === GameState.MENU) {
      this.active = this.menu;
      this.menu.mount();
    } else if ([GameState.GAME_OVER, GameState.VICTORY].includes(state)) {
      const result = state === GameState.VICTORY ? "victory" : "defeat";
      this.active = this.end;
      this.end.mount(result, this.resultData);
    }
  }
  // A pausa usa o mesmo tema, mas não precisa de uma nova cena de jogo.
  montarPausa() {
    this.pauseView.mount(this.root, () => this.game.togglePause());
  }
}

export { ScreenController as ScreenUI };
