/**
 * @file main.js
 * Application entry point: initializes canvas, viewport scaling, and starts game loop.
 */

import { Game } from './core/Game.js';
import { GAME } from './utils/constants.js';

window.addEventListener('DOMContentLoaded', () => {
  let canvas = document.getElementById('game-canvas');

  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'game-canvas';
    document.body.appendChild(canvas);
  }

  canvas.width = GAME.WIDTH;
  canvas.height = GAME.HEIGHT;

  const game = new Game(canvas);
  game.start();

  // Fail-safe direct canvas click listener for Menu & Game Over
  canvas.addEventListener('click', () => {
    if (game.state === 'GAME_OVER' || game.state === 'VICTORY') {
      if (game.gameOverCooldown <= 0) {
        game.restartGame();
      }
    } else if (game.state === 'MENU') {
      game.restartGame();
    }
  });

  // Expose to window for debugging if needed
  window.__batmanGame = game;
});
