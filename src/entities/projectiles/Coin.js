/**
 * @file Coin.js
 * Two-Face's double-headed scarred silver dollar that arcs and bounces once.
 */

import { Projectile } from './Projectile.js';

export class Coin extends Projectile {
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
      w: 18,
      h: 18,
      vx,
      vy,
      damage: 1,
      lifetime: 180,
      owner: 'villain',
    });
    this.gravity = 0.28;
    this.bounces = 0;
    this.maxBounces = 1;
    this.flipAngle = 0;
  }

  update(dt = 1, world = null) {
    this.vy += this.gravity * dt;
    this.flipAngle += 0.35 * dt;

    super.update(dt, world);

    // Bounce on floor
    if (this.y > 430 && this.bounces < this.maxBounces) {
      this.y = 430;
      this.vy = -Math.abs(this.vy) * 0.65;
      this.bounces++;
    }
  }

  /**
   * Procedural drawing of vertically spinning Two-Face silver dollar with scarred side.
   * @param {CanvasRenderingContext2D} ctx
   */
  draw(ctx) {
    if (!this.alive) return;

    ctx.save();
    ctx.translate(this.x + this.w / 2, this.y + this.h / 2);

    const scaleX = Math.cos(this.flipAngle);
    ctx.scale(scaleX, 1);

    const isScarredSide = Math.sin(this.flipAngle) > 0;

    // Glowing coin rim
    ctx.shadowColor = '#cbd5e1';
    ctx.shadowBlur = 4;

    // Coin face
    ctx.fillStyle = isScarredSide ? '#475569' : '#e2e8f0';
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.fill();

    // Inner rim
    ctx.shadowBlur = 0;
    ctx.strokeStyle = isScarredSide ? '#1e293b' : '#94a3b8';
    ctx.lineWidth = 1;
    ctx.stroke();

    if (isScarredSide) {
      // Scratched X marks on scarred coin side
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-5, -5); ctx.lineTo(5, 5);
      ctx.moveTo(-5, 5); ctx.lineTo(5, -5);
      ctx.stroke();
    } else {
      // Pristine profile silhouette
      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.arc(0, -1, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}
