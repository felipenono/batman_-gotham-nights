import { GAME } from '../utils/constants.js';

// Rendering and pointer input share the same uniform transform.
export class Viewport {
  constructor(width = GAME.WIDTH, height = GAME.HEIGHT) {
    this.width = width;
    this.height = height;
  }

  fit(renderWidth, renderHeight) {
    const scale = Math.min(renderWidth / this.width, renderHeight / this.height);
    return { scale, x: (renderWidth - this.width * scale) / 2,
      y: (renderHeight - this.height * scale) / 2 };
  }

  toGame(x, y, renderWidth, renderHeight) {
    const view = this.fit(renderWidth, renderHeight);
    return { x: (x - view.x) / view.scale, y: (y - view.y) / view.scale };
  }
}
