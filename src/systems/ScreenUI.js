import { MenuScene } from '../scenes/MenuScene.js';
import { EndGameScene } from '../scenes/EndGameScene.js';
import { GameState } from '../core/GameState.js';
import { LOBBY } from '../config/lobby.js';
import { escapeHTML } from '../ui/ScreenElements.js';

/** Coordena o ciclo de vida das interfaces; cada cena cuida dos próprios elementos. */
export class ScreenUI {
  constructor(game, root) {
    this.game = game; this.root = root; this.previous = ''; this.revision = 0;
    this.menu = new MenuScene(game, root);
    this.end = new EndGameScene(root, {
      sound: game.soundManager,
      goTo: (name, data) => game.sceneManager.goTo(name, data),
      isTransitioning: () => Boolean(game.sceneManager.transition),
    });
    this.active = null;
    this.resultData = {};
  }
  get activeAudio() { return this.active?.audio ?? null; }
  setResult(result, data) {
    this.result = result; this.resultData = data; this.revision++;
  }
  update() {
    const state = this.game.state, key = `${state}:${this.revision}`;
    if (key === this.previous) return;
    this.previous = key;
    this.active?.unmount(); this.active = null;
    const visible = [GameState.MENU, GameState.GAME_OVER, GameState.VICTORY, GameState.PAUSED].includes(state);
    this.root?.classList.toggle('pause-screen', state === GameState.PAUSED);
    if (this.root) { this.root.hidden = !visible; this.root.replaceChildren(); }
    if (state === GameState.PAUSED && this.root) {
      const config = LOBBY.scoring;
      this.root.style.setProperty('--score-font', config.font);
      for (const [key, value] of Object.entries(config.colors)) this.root.style.setProperty(`--score-${key}`, value);
      this.root.innerHTML = `<div class="pause-panel"><h1>${escapeHTML(config.labels.paused)}</h1><button>${escapeHTML(config.labels.resume)}</button><p>${escapeHTML(config.labels.resumeHint)}</p></div>`;
      const button = this.root.querySelector('button');
      button.onclick = () => this.game.togglePause(); button.focus();
    } else if (state === GameState.MENU) {
      this.active = this.menu; this.menu.mount();
    } else if ([GameState.GAME_OVER, GameState.VICTORY].includes(state)) {
      const result = state === GameState.VICTORY ? 'victory' : 'defeat';
      this.active = this.end; this.end.mount(result, this.resultData);
    }
  }
}
