import { MenuScene } from '../scenes/MenuScene.js';
import { EndGameScene } from '../scenes/EndGameScene.js';
import { GameState } from '../core/GameState.js';

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
    const visible = [GameState.MENU, GameState.GAME_OVER, GameState.VICTORY].includes(state);
    if (this.root) { this.root.hidden = !visible; this.root.replaceChildren(); }
    if (state === GameState.MENU) {
      this.active = this.menu; this.menu.mount();
    } else if ([GameState.GAME_OVER, GameState.VICTORY].includes(state)) {
      const result = state === GameState.VICTORY ? 'victory' : 'defeat';
      this.active = this.end; this.end.mount(result, this.resultData);
    }
  }
}
