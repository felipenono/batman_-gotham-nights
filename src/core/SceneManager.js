import { LOBBY } from '../config/lobby.js';
import { GameState } from './GameState.js';

/** Transporta dados entre cenas e realiza a troca uma única vez, sob a cortina preta. */
export class SceneManager {
  constructor(game) {
    this.game = game;
    this.scenes = new Map([
      ['GameScene', () => game.restartGame()],
      ['RetryScene', data => game.restartGame(data.levelIndex)],
      ['MenuScene', () => { game.state = GameState.MENU; }],
      ['EndGameScene', ({result, data}) => {
        game.screenUI.setResult(result, data);
        game.state = result === 'victory' ? GameState.VICTORY : GameState.GAME_OVER;
      }],
    ]);
    this.transition = null;
    this.overlay = globalThis.document?.getElementById('scene-transition');
  }
  register(name, enter) { this.scenes.set(name, enter); }
  goTo(name = LOBBY.targetScene, data = {}) {
    if (this.transition || !this.scenes.has(name)) return false;
    const fromResult = [GameState.GAME_OVER, GameState.VICTORY].includes(this.game.state);
    const duration = name === 'EndGameScene' || fromResult ? LOBBY.endScreens.transition : LOBBY.motion.transition;
    const audio = this.game.screenUI?.activeAudio ?? (this.game.state == null ? this.game.screenUI?.menu?.audio : null);
    this.transition = { name, data, audio, duration, elapsed: 0, switched: false };
    if (audio) audio.fadeOut();
    else this.game.soundManager?.fadeBgmVolume?.(0, duration);
    return true;
  }
  update(ms) {
    const t = this.transition;
    if (!t) return;
    t.elapsed += ms;
    const progress = Math.min(2, t.elapsed / t.duration);
    if (this.overlay) this.overlay.style.opacity = String(progress <= 1 ? progress : 2 - progress);
    if (progress >= 1 && !t.switched) {
      t.switched = true;
      t.audio?.leave();
      if (!t.audio) this.game.soundManager?.setTrack(null);
      this.scenes.get(t.name)(t.data);
      this.game.input._onBlur(); this.game.mouse._onBlur();
      this.game.screenUI?.update?.();
    }
    if (progress >= 2) this.transition = null;
  }
}
