/**
 * @file JokerTeeth.js
 * Joker's wind-up chattering teeth that bounce along an arc towards Batman.
 */

import { Projectile } from './Projectile.js';

export class JokerTeeth extends Projectile {
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
      w: 24,
      h: 20,
      vx,
      vy,
      damage: 1,
      lifetime: 200,
      owner: 'villain',
    });
    this.gravity = 0.25;
    this.chatterAngle = 0;
  }

  update(dt = 1, world = null) {
    this.vy += this.gravity * dt;
    super.update(dt, world);
    this.chatterAngle += 0.35 * dt;

    // Bounce and hop along the ground level
    if (this.y >= 420) {
      this.y = 420;
      this.vy = -3.5;
    }
  }

  /**
   * Procedural drawing of wind-up teeth with chattering jaws and wind-up key.
   * @param {CanvasRenderingContext2D} ctx
   */
  draw(ctx) {
    if (!this.alive) return;

    ctx.save();
    ctx.translate(this.x + this.w / 2, this.y + this.h / 2);
    ctx.scale(this.vx >= 0 ? 1 : -1, 1);

    const jawOpen = Math.sin(this.chatterAngle) * 3;

    // Wind-up key at the back
    ctx.fillStyle = '#facc15';
    ctx.fillRect(-14, -3, 5, 2);
    ctx.beginPath();
    ctx.arc(-15, -2, 4, 0, Math.PI * 2);
    ctx.fill();

    // Upper red gum
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.ellipse(0, -5 - jawOpen, 10, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Upper sharp white teeth
    ctx.fillStyle = '#ffffff';
    for (let i = -7; i <= 7; i += 3.5) {
      ctx.beginPath();
      ctx.moveTo(i - 1.5, -4 - jawOpen);
      ctx.lineTo(i, 0 - jawOpen);
      ctx.lineTo(i + 1.5, -4 - jawOpen);
      ctx.fill();
    }

    // Lower red gum
    ctx.fillStyle = '#b91c1c';
    ctx.beginPath();
    ctx.ellipse(0, 5 + jawOpen, 10, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Lower sharp white teeth
    ctx.fillStyle = '#ffffff';
    for (let i = -7; i <= 7; i += 3.5) {
      ctx.beginPath();
      ctx.moveTo(i - 1.5, 4 + jawOpen);
      ctx.lineTo(i, 0 + jawOpen);
      ctx.lineTo(i + 1.5, 4 + jawOpen);
      ctx.fill();
    }

    // Green toxic slobber drops
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(3, jawOpen, 1.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
