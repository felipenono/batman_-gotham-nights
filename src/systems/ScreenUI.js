// Este arquivo cuida de montar e desmontar a interface de cada estado.
// ===== DEPENDÊNCIAS E CONFIGURAÇÕES =====
import { MenuScene } from "../scenes/MenuScene.js";
import { EndGameScene } from "../scenes/EndGameScene.js";
import { GameState } from "../core/GameState.js";
import { LOBBY } from "../config/configuracao.js";
import { escapeHTML } from "../ui/ScreenElements.js";
/** Coordena o ciclo de vida das interfaces; cada cena cuida dos próprios elementos. */
// ===== COMPORTAMENTO =====
export class ScreenUI {
  // Recebe as dependências e prepara o estado inicial deste componente.
  constructor(game, raiz) {
    this.game = game;
    this.root = raiz;
    this.previous = "";
    this.revision = 0;
    this.menu = new MenuScene(game, raiz);
    this.end = new EndGameScene(raiz, {
      sound: game.soundManager,
      goTo: (name, dados) => game.sceneManager.goTo(name, dados),
      isTransitioning: () => Boolean(game.sceneManager.transition)
    });
    this.active = null;
    this.resultData = {};
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
    const configuracao = LOBBY.scoring;
    this.root.style.setProperty("--score-font", configuracao.font);
    for (const [chave, valor] of Object.entries(configuracao.colors)) this.root.style.setProperty(`--score-${chave}`, valor);
    this.root.innerHTML = `<div class="pause-panel"><h1>${escapeHTML(configuracao.labels.paused)}</h1><button>${escapeHTML(configuracao.labels.resume)}</button><p>${escapeHTML(configuracao.labels.resumeHint)}</p></div>`;
    const botao = this.root.querySelector("button");
    botao.onclick = () => this.game.togglePause();
    botao.focus();
  }
}
