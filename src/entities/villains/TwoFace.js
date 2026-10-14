/**
 * @file TwoFace.js
 * Harvey Dent — Level 3 Boss with split duality aesthetics, coin flip telegraphs, and twin-bullet spreads.
 */

import { Character } from '../Character.js';
import { Bullet } from '../projectiles/Bullet.js';
import { Coin } from '../projectiles/Coin.js';

export class TwoFace extends Character {
  /**
   * @param {Object} options
   * @param {number} options.x
   * @param {number} options.y
   */
  constructor({ x = 700, y = 290 } = {}) {
    super({ x, y, w: 40, h: 80, maxHp: 150 });
    this.spriteKey = 'two_face';

    this.scoreType = 'TwoFace';
    this.name = 'Duas-Caras';
    this.isBoss = true;

    this.attackCycleTimer = 110;
    this.coinFlipping = false;
    this.coinFlipTimer = 0;
    this.nextAttackIsBullets = true;

    this.speed = 1.8;
    this.stride = 0;
  }

  /**
   * AI behavior: coin flip telegraph, followed by bullets or bouncing coins.
   * @param {Object} player - Batman reference
   * @param {Array} projectilesOut - Projectile container
   */
  updateAI(player, projectilesOut, onSpecial = null, playSfx = null) {
    if (!this.alive || !player || !player.alive) return;

    const dx = player.x - this.x;
    this.facing = dx >= 0 ? 1 : -1;

    if (this.hurtFlash > 0) return;

    // Movement: steady ruthless pacing
    if (!this.coinFlipping && Math.abs(dx) > 170) {
      this.vx = this.facing * this.speed;
    } else {
      this.vx = 0;
    }

    // Attack orchestration
    if (this.coinFlipping) {
      this.coinFlipTimer--;
      if (this.coinFlipTimer <= 0) {
        this.coinFlipping = false;
        this.executeDecidedAttack(player, projectilesOut, playSfx);
      }
      return;
    }

    this.attackCycleTimer--;
    if (this.attackCycleTimer <= 0) {
      this.attackCycleTimer = 120 + Math.floor(Math.random() * 45);
      // Initiate Coin Flip telegraph
      this.coinFlipping = true;
      this.coinFlipTimer = 35; // ~0.6 second flip animation
      this.nextAttackIsBullets = Math.random() > 0.5; // heads = bullets, tails = coins
      if (typeof playSfx === 'function') {
        playSfx('coin_ping');
      }
    }
  }

  executeDecidedAttack(player, projectilesOut, playSfx = null) {
    this.attackTimer = 18;
    this.isAttacking = true;

    const originX = this.x + this.w / 2 + this.facing * 20;
    const originY = this.y + 30;
    const isEnraged = this.hpRatio < 0.5;

    if (this.nextAttackIsBullets) {
      // HEADS: Gunfire
      if (typeof playSfx === 'function') {
        playSfx('gunshot');
      }
      if (isEnraged) {
        // V-pattern dual bullets
        projectilesOut.push(new Bullet(originX, originY, this.facing * 8.5, -1.5));
        projectilesOut.push(new Bullet(originX, originY, this.facing * 8.5, 1.5));
      } else {
        projectilesOut.push(new Bullet(originX, originY, this.facing * 9, 0));
      }
    } else {
      // TAILS: Bouncing Coins
      if (typeof playSfx === 'function') {
        playSfx('throw');
      }
      const dx = player.x - originX;
      const vx = Math.sign(dx) * (6 + Math.random() * 2);
      projectilesOut.push(new Coin(originX, originY, vx, -6));
      if (isEnraged) {
        projectilesOut.push(new Coin(originX, originY, vx * 0.75, -8));
      }
    }
  }

  update(dt = 1, world = null) {
    super.update(dt, world);
    this.stride += 0.18 * dt;
  }

  /**
   * Procedural drawing matching reference image:
   * Left side normal (brown hair, handsome skin, white suit),
   * Right side scarred (cyan/white hair, purple/raw skin, black/red suit),
   * Gun in hand, spinning coin overhead during flip.
   * @param {CanvasRenderingContext2D} ctx
   */
  draw(ctx) {
    this.drawSprite(ctx);
  }
}
