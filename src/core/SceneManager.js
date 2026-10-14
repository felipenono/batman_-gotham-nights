// Este arquivo cuida de trocar as cenas durante o fade.
// ===== DEPENDÊNCIAS E CONFIGURAÇÕES =====
import { LOBBY } from "../config/configuracao.js";
import { GameState } from "./GameState.js";
/** Transporta dados entre cenas e realiza a troca uma única vez, sob a cortina preta. */
// ===== COMPORTAMENTO =====
export class SceneManager {
  // Recebe as dependências e prepara o estado inicial deste componente.
  constructor(game) {
    this.game = game;
    this.scenes = new Map([
      ["GameScene", () => game.restartGame()],
      ["RetryScene", (dados) => game.restartGame(dados.levelIndex)],
      ["MenuScene", () => {
        game.state = GameState.MENU;
      }],
      ["EndGameScene", ({ result, data: dados }) => {
        game.screenUI.setResult(result, dados);
        game.state = result === "victory" ? GameState.VICTORY : GameState.GAME_OVER;
      }]
    ]);
    this.transition = null;
    this.overlay = globalThis.document?.getElementById("scene-transition");
  }
  register(name, enter) {
    this.scenes.set(name, enter);
  }
  goTo(name = LOBBY.targetScene, dados = {}) {
    if (this.transition || !this.scenes.has(name)) return false;
    const fromResult = [GameState.GAME_OVER, GameState.VICTORY].includes(this.game.state);
    const duracao = name === "EndGameScene" || fromResult ? LOBBY.endScreens.transition : LOBBY.motion.transition;
    const audio = this.game.screenUI?.activeAudio ?? (this.game.state == null ? this.game.screenUI?.menu?.audio : null);
    this.transition = {
      name,
      data: dados,
      audio,
      duration: duracao,
      elapsed: 0,
      switched: false
    };
    if (audio) audio.fadeOut();
    else this.game.soundManager?.fadeBgmVolume?.(0, duracao);
    return true;
  }
  // Recebe a atualização atual e avança o estado, sem redesenhar a tela.
  update(milissegundos) {
    const transicaoAtual = this.transition;
    if (!transicaoAtual) return;
    transicaoAtual.elapsed += milissegundos;
    const progress = Math.min(2, transicaoAtual.elapsed / transicaoAtual.duration);
    if (this.overlay) this.overlay.style.opacity = String(progress <= 1 ? progress : 2 - progress);
    if (progress >= 1 && !transicaoAtual.switched) {
      transicaoAtual.switched = true;
      transicaoAtual.audio?.leave();
      if (!transicaoAtual.audio) this.game.soundManager?.setTrack(null);
      this.scenes.get(transicaoAtual.name)(transicaoAtual.data);
      this.game.input._onBlur();
      this.game.mouse._onBlur();
      this.game.screenUI?.update?.();
    }
    if (progress >= 2) this.transition = null;
  }
}
