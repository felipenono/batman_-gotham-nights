import { LOBBY } from '../config/lobby.js';

/** Registra destinos e realiza uma única troca no ponto preto da transição. */
export class SceneManager {
  constructor(game) {
    this.game = game;
    this.scenes = new Map([['GameScene', () => game.restartGame()]]);
    this.transition = null;
    this.overlay = globalThis.document?.getElementById('scene-transition');
  }
  register(name, enter) { this.scenes.set(name, enter); }
  goTo(name = LOBBY.targetScene) {
    if (this.transition || !this.scenes.has(name)) return false;
    this.transition = { name, elapsed: 0, switched: false };
    this.game.screenUI.menu.audio.fadeOut();
    return true;
  }
  update(ms) {
    const t = this.transition;
    if (!t) return;
    t.elapsed += ms;
    const progress = Math.min(2, t.elapsed / LOBBY.motion.transition);
    if (this.overlay) this.overlay.style.opacity = String(progress <= 1 ? progress : 2 - progress);
    if (progress >= 1 && !t.switched) {
      t.switched = true;
      this.game.screenUI.menu.audio.leave();
      this.scenes.get(t.name)();
      this.game.input._onBlur();
      this.game.mouse._onBlur();
    }
    if (progress >= 2) this.transition = null;
  }
}
