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

    this.name = 'Two-Face';
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
    if (!this.alive) return;

    ctx.save();
    ctx.translate(this.x + this.w / 2, this.y + this.h);
    ctx.scale(this.facing, 1);

    const isWalking = Math.abs(this.vx) > 0.2;
    const legOffset = isWalking ? Math.sin(this.stride * 3) * 8 : 0;
    const breathe = Math.sin(this.stride * 1.5) * 1.5;

    // --- LEGS & SHOES (Split Black / White) ---
    // Left leg (Clean White trousers)
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(-14 - legOffset * 0.4, -26, 11, 16);
    // Left shoe (White dress shoe)
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(-16 - legOffset * 0.4, -10, 13, 10);

    // Right leg (Charcoal / Black trousers)
    ctx.fillStyle = '#18181b';
    ctx.fillRect(3 + legOffset * 0.4, -26, 11, 16);
    // Right shoe (Black charred shoe)
    ctx.fillStyle = '#09090b';
    ctx.fillRect(2 + legOffset * 0.4, -10, 14, 10);

    // --- TORSO (Split Suit: Clean White on Left, Black on Right) ---
    const torsoY = -56 + breathe;

    // Clean white half
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-16, torsoY + 8, 16, 26);
    // Charred black half
    ctx.fillStyle = '#18181b';
    ctx.fillRect(0, torsoY + 8, 16, 26);

    // White shirt center
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(-4, torsoY + 8, 8, 14);

    // Split necktie: blue left, burned red right
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(-4, torsoY + 10, 4, 14);
    ctx.fillStyle = '#b91c1c';
    ctx.fillRect(0, torsoY + 10, 4, 14);

    // --- ARMS & WEAPONS ---
    // Left arm (White sleeve)
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(-20, torsoY + 8, 6, 18);

    // Right arm (Pistol hand)
    ctx.fillStyle = '#18181b';
    if (this.isAttacking) {
      ctx.fillRect(8, torsoY + 10, 16, 6);
      // Heavy automatic pistol
      ctx.fillStyle = '#64748b';
      ctx.fillRect(20, torsoY + 8, 12, 6);
      ctx.fillRect(20, torsoY + 14, 4, 6);
      // Muzzle flash
      ctx.fillStyle = '#facc15';
      ctx.fillRect(32, torsoY + 9, 4, 4);
    } else {
      ctx.fillRect(10, torsoY + 8, 7, 18);
      // Pistol lowered
      ctx.fillStyle = '#64748b';
      ctx.fillRect(10, torsoY + 24, 7, 6);
    }

    // --- HEAD & SPLIT DUALITY FACE ---
    const headY = torsoY - 18;

    // Left side: Handsome clean skin
    ctx.fillStyle = '#fbcfe8';
    ctx.beginPath();
    ctx.arc(0, headY + 8, 12, Math.PI * 0.5, Math.PI * 1.5, false);
    ctx.fill();

    // Right side: Scarred acid-burned purple/raw muscle
    ctx.fillStyle = '#701a75';
    ctx.beginPath();
    ctx.arc(0, headY + 8, 12, Math.PI * 1.5, Math.PI * 0.5, false);
    ctx.fill();

    // Left hair: Neat combed brown
    ctx.fillStyle = '#5c2b16';
    ctx.beginPath();
    ctx.arc(-1, headY - 1, 11, Math.PI * 0.7, Math.PI * 1.5, false);
    ctx.fill();

    // Right hair: Wild singed white / teal hair
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.arc(2, headY - 1, 12, Math.PI * 1.5, Math.PI * 0.3, false);
    ctx.fill();

    // Left eye: Handsome blue eye with neat eyebrow
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(-8, headY + 6, 4, 3);
    ctx.fillStyle = '#5c2b16';
    ctx.fillRect(-9, headY + 3, 6, 2);

    // Right eye: Wide crazy exposed red socket with pinhole pupil
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(6, headY + 7, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(6, headY + 7, 1.8, 0, Math.PI * 2);
    ctx.fill();

    // Split mouth: Straight lip left, twisted snarling teeth right
    ctx.strokeStyle = '#9d174d';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-6, headY + 15);
    ctx.lineTo(0, headY + 15);
    ctx.stroke();

    // Exposed snarling teeth right
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(1, headY + 13, 8, 4);
    ctx.strokeStyle = '#4c0519';
    ctx.lineWidth = 0.8;
    ctx.strokeRect(1, headY + 13, 8, 4);

    // --- COIN FLIP TELEGRAPH OVERHEAD ---
    if (this.coinFlipping) {
      const flipY = headY - 24 - Math.sin((this.coinFlipTimer / 35) * Math.PI) * 16;
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 8;
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(0, flipY, 7, 0, Math.PI * 2);
      ctx.fill();

      // Coin text / symbol
      ctx.shadowBlur = 0;
      ctx.fillStyle = this.nextAttackIsBullets ? '#1e293b' : '#b91c1c';
      ctx.font = 'bold 8px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.nextAttackIsBullets ? 'H' : 'T', 0, flipY);
    }

    // Hurt flash
    if (this.hurtFlash > 0) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.beginPath();
      ctx.roundRect(-22, -80, 44, 80, 5);
      ctx.fill();
    }

    ctx.restore();
  }
}
