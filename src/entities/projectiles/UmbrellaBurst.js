/**
 * @file UmbrellaBurst.js
 * Penguin's trick umbrella blast — high-velocity purple energy bolt.
 */

import { Projectile } from './Projectile.js';
import { PROJECTILE } from '../../utils/constants.js';

export class UmbrellaBurst extends Projectile {
  /**
   * @param {number} x
   * @param {number} y
   * @param {number} vx
   * @param {number} vy
   */
  constructor(x, y, vx, vy, target = null) {
    super({
      x,
      y,
      w: 20,
      h: 12,
      vx,
      vy,
      damage: 1,
      lifetime: 150,
      owner: 'villain',
    });
    this.speed = PROJECTILE.UMBRELLA_SPEED;
    this.pulse = 0;
    this.target = target;
    this.trackingRemaining = PROJECTILE.UMBRELLA_TRACKING_FRAMES;
  }

  update(dt = 1, world = null) {
    if (!this.alive) return;
    if (this.trackingRemaining > 0 && this.target?.alive) {
      const dx = this.target.x + this.target.w / 2 - (this.x + this.w / 2);
      const dy = this.target.y + this.target.h / 2 - (this.y + this.h / 2);
      if (Math.hypot(dx, dy) > 0.001) {
        const heading = Math.atan2(this.vy, this.vx);
        const difference = Math.atan2(Math.sin(Math.atan2(dy, dx) - heading), Math.cos(Math.atan2(dy, dx) - heading));
        const maxTurn = PROJECTILE.UMBRELLA_TURN_RATE * Math.min(dt, this.trackingRemaining);
        const angle = heading + Math.max(-maxTurn, Math.min(maxTurn, difference));
        const speed = Math.hypot(this.vx, this.vy) || this.speed;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
      }
    }
    this.trackingRemaining = Math.max(0, this.trackingRemaining - dt);
    this.pulse += 0.25 * dt;
    super.update(dt, world);
  }

  /**
   * Procedural drawing of Penguin's energized purple umbrella beam pellet.
   * @param {CanvasRenderingContext2D} ctx
   */
  draw(ctx) {
    if (!this.alive) return;

    ctx.save();
    ctx.translate(this.x + this.w / 2, this.y + this.h / 2);
    ctx.rotate(Math.atan2(this.vy, this.vx));

    // Radiant violet glow
    ctx.shadowColor = '#c084fc';
    ctx.shadowBlur = 10;

    // Outer plasma ellipse
    ctx.fillStyle = '#9333ea';
    ctx.beginPath();
    ctx.ellipse(0, 0, 12, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Hot magenta inner core
    ctx.fillStyle = '#f472b6';
    ctx.beginPath();
    ctx.ellipse(1, 0, 8, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Intense white center
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(3, 0, 4, 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Electric sparks behind pellet
    ctx.strokeStyle = '#e879f9';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-10, 0);
    ctx.lineTo(-16, Math.sin(this.pulse * 2) * 4);
    ctx.lineTo(-22, -Math.sin(this.pulse * 2) * 3);
    ctx.stroke();

    ctx.restore();
  }
}
