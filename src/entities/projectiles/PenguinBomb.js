/**
 * @file PenguinBomb.js
 * Cobblepot's wind-up explosive penguin minion that waddles forward and detonates.
 */

import { Projectile } from './Projectile.js';

export class PenguinBomb extends Projectile {
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
      w: 22,
      h: 22,
      vx,
      vy,
      damage: 1,
      lifetime: 140,
      owner: 'villain',
    });
    this.gravity = 0.26;
    this.waddle = 0;
    this.exploded = false;
    this.explodeTimer = 0;
    this.explodeRadius = 8;
  }

  update(dt = 1, world = null) {
    if (this.exploded) {
      this.explodeTimer += dt;
      this.explodeRadius += 2 * dt;
      this.w = this.explodeRadius * 2;
      this.h = this.explodeRadius * 2;
      this.x -= 1 * dt;
      this.y -= 1 * dt;
      if (this.explodeTimer >= 22) {
        this.alive = false;
      }
      return;
    }

    this.vy += this.gravity * dt;
    this.waddle += 0.3 * dt;
    super.update(dt, world);

    // Detonate on floor
    if (this.y > 430) {
      this.detonate();
    }
  }

  detonate() {
    if (this.exploded) return;
    this.exploded = true;
    this.vx = 0;
    this.vy = 0;
  }

  /**
   * Procedural drawing of miniature mechanical penguin with ticking fuse.
   * @param {CanvasRenderingContext2D} ctx
   */
  draw(ctx) {
    if (!this.alive) return;

    ctx.save();
    ctx.translate(this.x + this.w / 2, this.y + this.h / 2);

    if (this.exploded) {
      // Explosion fiery blast
      ctx.shadowColor = '#f97316';
      ctx.shadowBlur = 12;
      ctx.fillStyle = `rgba(239, 68, 68, ${Math.max(0, 1 - this.explodeTimer / 22)})`;
      ctx.beginPath();
      ctx.arc(0, 0, this.explodeRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = `rgba(251, 191, 36, ${Math.max(0, 0.9 - this.explodeTimer / 25)})`;
      ctx.beginPath();
      ctx.arc(0, 0, this.explodeRadius * 0.6, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.rotate(Math.sin(this.waddle) * 0.15);

      // Body (egg shaped mechanical penguin)
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.ellipse(0, 0, 8, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      // White belly
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.ellipse(0, 2, 5, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Mini red bow tie
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-3, -4, 6, 2);

      // Yellow beak
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(-2, -6);
      ctx.lineTo(2, -6);
      ctx.lineTo(0, -3);
      ctx.closePath();
      ctx.fill();

      // Ticking fuse on head
      ctx.strokeStyle = '#92400e';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, -10);
      ctx.lineTo(2, -14);
      ctx.stroke();

      // Red flashing beacon
      ctx.fillStyle = Math.floor(this.waddle * 4) % 2 === 0 ? '#ef4444' : '#fbbf24';
      ctx.beginPath();
      ctx.arc(2, -14, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}
