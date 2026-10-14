// Este arquivo cuida de iniciar o canvas e carregar o jogo.
// ===== DEPENDÊNCIAS E CONFIGURAÇÕES =====
import { loadSprites } from "./utils/SpriteAnimator.js";
import { Game } from "./core/Game.js";
import { GAME } from "./config/configuracao.js";
window.addEventListener("DOMContentLoaded", async () => {
  let canvas = document.getElementById("game-canvas");
  if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.id = "game-canvas";
    document.body.appendChild(canvas);
  }
  canvas.width = GAME.RENDER_WIDTH;
  canvas.height = GAME.RENDER_HEIGHT;
  await loadSprites();
  const game = new Game(canvas);
  game.start();
  // A referência global só existe quando a depuração é solicitada na configuração.
  if (GAME.DEBUG) window.__batmanGame = game;
});
