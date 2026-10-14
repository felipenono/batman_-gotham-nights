/**
 * @file HarleyQuinn.js
 * Level 2 Boss — acrobatic jester with oversized mallet, pop-gun, triple-bullet spreads, and cartwheel dashes.
 */

import { Character } from '../Character.js';
import { Bullet } from '../projectiles/Bullet.js';
import { Mallet } from '../projectiles/Mallet.js';

export class HarleyQuinn extends Character {
  /**
   * @param {Object} options
   * @param {number} options.x
   * @param {number} options.y
   */
  constructor({ x = 700, y = 300 } = {}) {
    super({ x, y, w: 38, h: 72, maxHp: 120 });
    this.spriteKey = 'harley_quinn';

    this.scoreType = 'HarleyQuinn';
    this.name = 'Arlequina';
    this.isBoss = true;

    this.bulletCooldown = 75;
    this.malletCooldown = 200;
    this.cartwheelCooldown = 320;
    this.isCartwheeling = false;
    this.cartwheelTimer = 0;
    this.cartwheelAngle = 0;

    this.speed = 2.4;
    this.acrobatTime = 0;
  }

  /**
   * AI behavior: bullet shots (triple-shot when HP < 50%), mallet throws, and cartwheels.
   * @param {Object} player - Batman reference
   * @param {Array} projectilesOut - Projectile container
   */
  updateAI(player, projectilesOut, onSpecial = null, playSfx = null) {
    if (!this.alive || !player || !player.alive) return;

    const dx = player.x - this.x;
    if (!this.isCartwheeling) {
      this.facing = dx >= 0 ? 1 : -1;
    }

    if (this.hurtFlash > 0 && !this.isCartwheeling) return;

    // Cartwheel active state
    if (this.isCartwheeling) {
      this.vx = this.facing * 6;
      this.cartwheelAngle += 0.35;
      this.cartwheelTimer--;
      if (this.cartwheelTimer <= 0) {
        this.isCartwheeling = false;
        this.vx = 0;
      }
      return;
    }

    // Normal movement: agile bouncing hop
    if (Math.abs(dx) > 190) {
      this.vx = this.facing * this.speed;
    } else {
      this.vx = 0;
    }

    // 1. Cartwheel Dash trigger
    this.cartwheelCooldown--;
    if (this.cartwheelCooldown <= 0 && Math.abs(dx) > 100) {
      this.cartwheelCooldown = 320 + Math.floor(Math.random() * 60);
      this.isCartwheeling = true;
      this.cartwheelTimer = 35;
      this.cartwheelAngle = 0;
      return;
    }

    // 2. Firearm attack
    this.bulletCooldown--;
    if (this.bulletCooldown <= 0) {
      this.bulletCooldown = 60 + Math.floor(Math.random() * 30);
      this.shootGuns(player, projectilesOut, playSfx);
    }

    // 3. Mallet toss
    this.malletCooldown--;
    if (this.malletCooldown <= 0) {
      this.malletCooldown = 180 + Math.floor(Math.random() * 60);
      this.throwMallet(player, projectilesOut, playSfx);
    }
  }

  shootGuns(player, projectilesOut, playSfx = null) {
    this.attackTimer = 16;
    this.isAttacking = true;

    if (typeof playSfx === 'function') {
      playSfx('gunshot');
    }

    const originX = this.x + this.w / 2 + this.facing * 18;
    const originY = this.y + 26;

    const isEnraged = this.hpRatio < 0.5;

    if (isEnraged) {
      // Triple bullet spread
      projectilesOut.push(new Bullet(originX, originY, this.facing * 8, -1.8));
      projectilesOut.push(new Bullet(originX, originY, this.facing * 8, 0));
      projectilesOut.push(new Bullet(originX, originY, this.facing * 8, 1.8));
    } else {
      // Single rapid bullet
      projectilesOut.push(new Bullet(originX, originY, this.facing * 8.5, 0));
    }
  }

  throwMallet(player, projectilesOut, playSfx = null) {
    this.attackTimer = 22;
    this.isAttacking = true;

    if (typeof playSfx === 'function') {
      playSfx('throw');
    }

    const originX = this.x + this.w / 2 + this.facing * 20;
    const originY = this.y + 20;

    const dx = player.x - originX;
    const vx = Math.sign(dx) * 7;
    const vy = -5;

    // Fast arcing heavy projectile
    projectilesOut.push(new Mallet(originX, originY, vx, vy));
  }

  update(dt = 1, world = null) {
    super.update(dt, world);
    this.acrobatTime += 0.2 * dt;
  }

  /**
   * Procedural drawing matching the reference image:
   * Red and black jester cowl with bells, white face, domino mask, split diamond outfit,
   * oversized wooden mallet, pistol.
   * @param {CanvasRenderingContext2D} ctx
   */
  draw(ctx) {
    this.drawSprite(ctx);
  }
}
