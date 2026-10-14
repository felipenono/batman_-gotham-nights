/**
 * @file main.js
 * Application entry point: initializes canvas, viewport scaling, and starts game loop.
 */

import { loadSprites } from './utils/SpriteAnimator.js';
import { Game } from './core/Game.js';
import { GAME } from './utils/constants.js';

window.addEventListener('DOMContentLoaded', async () => {
  let canvas = document.getElementById('game-canvas');

  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'game-canvas';
    document.body.appendChild(canvas);
  }

  canvas.width = GAME.RENDER_WIDTH;
  canvas.height = GAME.RENDER_HEIGHT;

  await loadSprites();
  const game = new Game(canvas);
  game.start();

  // Expose to window for debugging if needed
  window.__batmanGame = game;
});
