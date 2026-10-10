/**
 * @file FearSmoke.js
 * Scarecrow's fear toxin cloud that drifts eerily towards Batman.
 */

import { Projectile } from './Projectile.js';

export class FearSmoke extends Projectile {
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
      w: 30,
      h: 30,
      vx,
      vy,
      damage: 1,
      lifetime: 240,
      owner: 'villain',
    });
    this.pulse = Math.random() * Math.PI * 2;
    this.drift = 0;
  }

  update(dt = 1, world = null) {
    this.pulse += 0.08 * dt;
    this.drift += 0.04 * dt;
    // Slight wavy vertical drift
    this.y += Math.sin(this.drift) * 0.8 * dt;
    super.update(dt, world);
  }

  /**
   * Procedural drawing of pulsing toxic fear cloud with inner skull motif.
   * @param {CanvasRenderingContext2D} ctx
   */
  draw(ctx) {
    if (!this.alive) return;

    ctx.save();
    ctx.translate(this.x + this.w / 2, this.y + this.h / 2);

    const radius = 14 + Math.sin(this.pulse) * 3;

    // Glowing sickly green/yellow gas outer haze
    ctx.shadowColor = '#84cc16';
    ctx.shadowBlur = 10;
    ctx.fillStyle = 'rgba(163, 230, 53, 0.35)';
    ctx.beginPath();
    ctx.arc(0, 0, radius + 4, 0, Math.PI * 2);
    ctx.fill();

    // Dense swirling smoke puffs
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(101, 163, 13, 0.75)';
    const puffs = 5;
    for (let i = 0; i < puffs; i++) {
      const angle = (i * ((Math.PI * 2) / puffs)) + this.pulse;
      const px = Math.cos(angle) * (radius * 0.55);
      const py = Math.sin(angle) * (radius * 0.55);
      ctx.beginPath();
      ctx.arc(px, py, radius * 0.48, 0, Math.PI * 2);
      ctx.fill();
    }

    // Core ominous dark smoke
    ctx.fillStyle = 'rgba(54, 83, 20, 0.85)';
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Subtle sinister glowing yellow eyes in the smoke
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(-4, -2, 1.8, 0, Math.PI * 2);
    ctx.arc(4, -2, 1.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
