/**
 * @file Bullet.js
 * High-velocity firearm projectile used by Harley Quinn and Two-Face.
 */

import { Projectile } from './Projectile.js';
import { PROJECTILE } from '../../utils/constants.js';

export class Bullet extends Projectile {
  /**
   * @param {number} x
   * @param {number} y
   * @param {number} vx
   * @param {number} vy
   */
  constructor(x, y, vx, vy) {
    super({
      x,
      y,
      w: 16,
      h: 8,
      vx,
      vy,
      damage: 1,
      lifetime: 180,
      owner: 'villain',
    });
    this.speed = PROJECTILE.BULLET_SPEED;
  }

  /**
   * Procedural drawing of spinning brass bullet with smoke tracer.
   * @param {CanvasRenderingContext2D} ctx
   */
  draw(ctx) {
    if (!this.alive) return;

    ctx.save();
    ctx.translate(this.x + this.w / 2, this.y + this.h / 2);
    ctx.rotate(Math.atan2(this.vy, this.vx));

    // Muzzle smoke / fire tracer
    const grad = ctx.createLinearGradient(-14, 0, 8, 0);
    grad.addColorStop(0, 'rgba(239, 68, 68, 0)');
    grad.addColorStop(0.5, 'rgba(249, 115, 22, 0.6)');
    grad.addColorStop(1, 'rgba(251, 191, 36, 1)');
    ctx.fillStyle = grad;
    ctx.fillRect(-12, -2, 14, 4);

    // Glowing bullet slug
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 6;
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.roundRect(-2, -3, 10, 6, 3);
    ctx.fill();

    // Hot tip
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(6, 0, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
