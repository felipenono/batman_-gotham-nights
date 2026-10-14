/**
 * @file Penguin.js
 * Oswald Cobblepot grunt — short, aristocratic mobster firing purple energy pellets from his umbrella.
 */

import { Character } from '../Character.js';
import { PROJECTILE } from '../../utils/constants.js';
import { PenguinBomb } from '../projectiles/PenguinBomb.js';

export class Penguin extends Character {
  /**
   * @param {Object} options
   * @param {number} options.x
   * @param {number} options.y
   */
  constructor({ x = 600, y = 320 } = {}) {
    super({ x, y, w: 40, h: 60, maxHp: 25 });
    this.spriteKey = 'penguin';

    this.name = 'Pinguim';
    this.shootCooldown = 120 + Math.floor(Math.random() * 60);
    this.speed = 1.3;
    this.waddleTime = 0;
  }

  /**
   * AI cycle: waddle into range and fire umbrella energy beam.
   * @param {Object} player - Batman reference
   * @param {Array} projectilesOut - Projectile container
   */
  updateAI(player, projectilesOut, playSfx = null) {
    if (!this.alive || !player || !player.alive) return;

    // Face player
    const dx = player.x - this.x;
    this.facing = dx >= 0 ? 1 : -1;

    if (this.hurtFlash > 0) return;

    // Distance control
    if (Math.abs(dx) > 160) {
      this.vx = this.facing * this.speed;
    } else {
      this.vx = 0;
    }

    this.shootCooldown--;
    if (this.shootCooldown <= 0) {
      this.shootCooldown = 120 + Math.floor(Math.random() * 60);
      this.firePenguin(player, projectilesOut, playSfx);
    }
  }

  firePenguin(player, projectilesOut, playSfx = null) {
    this.attackTimer = 18;
    this.isAttacking = true;

    if (typeof playSfx === 'function') {
      playSfx('umbrella_shot');
    }

    const originX = this.x + this.w / 2 + this.facing * 28;
    const originY = this.y + 30;

    const dx = player.x + player.w / 2 - originX;
    const dy = player.y + player.h / 2 - originY;
    const length = Math.hypot(dx, dy) || 1;
    projectilesOut.push(new PenguinBomb(originX, originY,
      dx / length * PROJECTILE.PENGUIN_BOMB_SPEED,
      dy / length * PROJECTILE.PENGUIN_BOMB_SPEED, player));
  }

  update(dt = 1, world = null) {
    super.update(dt, world);
    this.waddleTime += 0.2 * dt;
  }

  /**
   * Procedural drawing matching reference:
   * Short & rotund, top hat with purple ribbon, monocle, sharp nose, tailcoat, red bow tie, umbrella.
   * @param {CanvasRenderingContext2D} ctx
   */
  draw(ctx) {
    this.drawSprite(ctx);
  }
}
