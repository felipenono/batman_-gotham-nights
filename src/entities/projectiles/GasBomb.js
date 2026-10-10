/**
 * @file GasBomb.js
 * Scarecrow's explosive burlap canister that arcs and bursts into a toxic fear cloud.
 */

import { Projectile } from './Projectile.js';

export class GasBomb extends Projectile {
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
      lifetime: 130,
      owner: 'villain',
    });
    this.gravity = 0.28;
    this.exploded = false;
    this.explodeTimer = 0;
    this.explodeRadius = 10;
  }

  update(dt = 1, world = null) {
    if (this.exploded) {
      this.explodeTimer += dt;
      this.explodeRadius += 1.8 * dt;
      this.w = this.explodeRadius * 2;
      this.h = this.explodeRadius * 2;
      this.x -= 0.9 * dt;
      this.y -= 0.9 * dt;
      if (this.explodeTimer >= 25) {
        this.alive = false;
      }
      return;
    }

    this.vy += this.gravity * dt;
    super.update(dt, world);

    // Explode if hitting ground level or low altitude
    if (this.y > 440) {
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
   * Procedural drawing of burlap bomb or toxic gas explosion blast.
   * @param {CanvasRenderingContext2D} ctx
   */
  draw(ctx) {
    if (!this.alive) return;

    ctx.save();
    ctx.translate(this.x + this.w / 2, this.y + this.h / 2);

    if (this.exploded) {
      // Detonating poison blast cloud
      ctx.shadowColor = '#65a30d';
      ctx.shadowBlur = 12;
      ctx.fillStyle = `rgba(163, 230, 53, ${Math.max(0, 1 - this.explodeTimer / 25)})`;
      ctx.beginPath();
      ctx.arc(0, 0, this.explodeRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = `rgba(77, 124, 15, ${Math.max(0, 0.8 - this.explodeTimer / 30)})`;
      ctx.beginPath();
      ctx.arc(0, 0, this.explodeRadius * 0.65, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Burlap canister in flight
      ctx.rotate(this.spin);

      // Burlap pouch body
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.roundRect(-9, -9, 18, 18, 5);
      ctx.fill();

      // Twine cross-straps
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(-9, 0); ctx.lineTo(9, 0);
      ctx.moveTo(0, -9); ctx.lineTo(0, 9);
      ctx.stroke();

      // Fuse with spark
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -9);
      ctx.quadraticCurveTo(4, -14, 2, -18);
      ctx.stroke();

      // Burning fuse spark
      ctx.fillStyle = '#f97316';
      ctx.shadowColor = '#f97316';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(2, -18, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}
