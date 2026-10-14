/**
 * ============================================================================
 * @file Scarecrow.js
 * @category POO - Subclasse de Chefe (Especialização de Character / Boss Pattern)
 * ============================================================================
 * CONCEITOS DE PROGRAMAÇÃO ORIENTADA A OBJETOS (POO):
 * 
 * 1. HERANÇA E ESPECIALIZAÇÃO DE CHEFE:
 *    Scarecrow herda de Character, mas sinaliza 'isBoss = true'.
 *    Graças a essa propriedade, o método takeDamage() polimórfico confere
 *    janelas de invulnerabilidade e aciona barra de vida dedicada no HUD.
 * 
 * 2. ENCAPSULAMENTO DE ESTADOS DE COMBATE:
 *    Encapsula o controle de três armas distintas:
 *    - 'smokeCooldown': nuvens tóxicas flutuantes (FearSmoke).
 *    - 'bombCooldown': cápsulas explosivas em arco parabólico (GasBomb).
 *    - 'auraTimer': ciclo de 20 segundos para ativar a aura de histeria coletiva
 *      que inverte os controles do Batman.
 * 
 * 3. POLIMORFISMO DE IA E DESENHO:
 *    - updateAI() implementa perseguição, patrulha, saltos e disparo duplo.
 *    - draw() desenha a máscara de juta costurada, olhos luminosos e névoa tóxica.
 * ============================================================================
 */

import { Character } from '../Character.js';
import { FearSmoke } from '../projectiles/FearSmoke.js';
import { GasBomb } from '../projectiles/GasBomb.js';

export class Scarecrow extends Character {
  /**
   * CONSTRUTOR:
   * Instancia o Dr. Jonathan Crane como Chefe do Estágio 1.
   *
   * @param {Object} options
   * @param {number} options.x - Posição X de entrada
   * @param {number} options.y - Posição Y de entrada
   */
  constructor({ x = 700, y = 260 } = {}) {
    // [POO - Herança]: Dimensões imponentes (60x110) e 100 HP para batalha de chefe
    super({ x, y, w: 60, h: 110, maxHp: 100 });
    this.spriteKey = 'scarecrow';

    // [POO - Encapsulamento de Atributos de Chefe]
    this.scoreType = 'Scarecrow';
    this.name = 'Espantalho';
    this.isBoss = true;      // Sinalizador polimórfico de chefe

    // Temporizadores de ataques encapsulados
    this.smokeCooldown = 110;
    this.bombCooldown = 190;
    this.auraTimer = 1200;   // 20 segundos (1200 frames a 60fps)
    this.auraActive = false;

    // Cinemática de passos e patrulha
    this.floatCycle = 0;
    this.patrolTimer = 90;
    this.patrolDirection = -1;
    this.jumpCooldown = 90;
    this.speed = 1.2;
    this.arenaWidth = 1100;
    this.wallEscapeTimer = 0;
  }

  /**
   * AI cycle managing FearSmoke, GasBombs, and the 20-second Fear Aura.
   * @param {Object} player - Batman reference
   * @param {Array} projectilesOut - Projectiles container
   * @param {Function} onFearAura - Callback to trigger Batman fear inversion
   */
  updateAI(player, projectilesOut, onFearAura, playSfx = null) {
    if (!this.alive || !player || !player.alive) return;

    // Face player
    const dx = player.x - this.x;
    this.facing = dx >= 0 ? 1 : -1;

    // Velocity feeds Physics and the walk animator; do not overwrite world position.
    if (this.hurtFlash > 0) { this.vx = 0; return; }
    if (--this.patrolTimer <= 0) { this.patrolDirection *= -1; this.patrolTimer = 90; }
    this.vx = Math.abs(dx) > 220 ? this.facing * this.speed :
      Math.abs(dx) < 120 ? -this.facing * this.speed : this.patrolDirection * 0.8;
    if (this.x < 16 && this.vx < 0) { this.wallEscapeTimer = 45; this.wallEscapeDirection = 1; }
    if (this.x + this.w > this.arenaWidth - 16 && this.vx > 0) { this.wallEscapeTimer = 45; this.wallEscapeDirection = -1; }
    if (this.wallEscapeTimer > 0) { this.vx = this.wallEscapeDirection * this.speed; this.wallEscapeTimer--; }
    if (--this.jumpCooldown <= 0 && this.onGround && player.y + player.h < this.y + this.h - 45) {
      this.vy = -11;
      this.jumpCooldown = 120;
    }

    // 1. Fear Aura special attack every 20 seconds
    this.auraTimer--;
    if (this.auraTimer <= 0) {
      this.auraTimer = 1200;
      if (typeof playSfx === 'function') {
        playSfx('fear_drone');
      }
      if (typeof onFearAura === 'function') {
        onFearAura(180); // 3 seconds control inversion
      }
      this.hurtFlash = 5;
    }

    // 2. Fear Smoke attack
    this.smokeCooldown--;
    if (this.smokeCooldown <= 0) {
      this.smokeCooldown = 90 + Math.floor(Math.random() * 60);
      this.castFearSmoke(player, projectilesOut, playSfx);
    }

    // 3. Gas Bomb attack
    this.bombCooldown--;
    if (this.bombCooldown <= 0) {
      this.bombCooldown = 180 + Math.floor(Math.random() * 60);
      this.throwGasBomb(player, projectilesOut, playSfx);
    }
  }

  castFearSmoke(player, projectilesOut, playSfx = null) {
    this.attackTimer = 20;
    this.isAttacking = true;

    if (typeof playSfx === 'function') {
      playSfx('gas_hiss');
    }

    const originX = this.x + this.w / 2 + this.facing * 25;
    const originY = this.y + 40;

    const dx = player.x - originX;
    const dy = player.y - originY;
    const dist = Math.hypot(dx, dy) || 1;

    const vx = (dx / dist) * 2.2;
    const vy = (dy / dist) * 1.5;

    projectilesOut.push(new FearSmoke(originX, originY, vx, vy));
  }

  throwGasBomb(player, projectilesOut, playSfx = null) {
    this.attackTimer = 25;
    this.isAttacking = true;

    if (typeof playSfx === 'function') {
      playSfx('gas_bomb');
    }

    const originX = this.x + this.w / 2 + this.facing * 20;
    const originY = this.y + 35;

    const dx = player.x - originX;
    const vx = Math.sign(dx) * (5 + Math.random() * 2);
    const vy = -7 - Math.random() * 2.5;

    projectilesOut.push(new GasBomb(originX, originY, vx, vy));
  }

  update(dt = 1, world = null) {
    this.arenaWidth = world?.width || this.arenaWidth;
    super.update(dt, world);
    this.floatCycle += 0.05 * dt;
  }

  /**
   * Procedural drawing matching the reference image:
   * Burlap sack mask with stitched X eyes and stitched mouth, wide-brim straw hat,
   * brown tattered robe, rope belt, dark boots.
   * @param {CanvasRenderingContext2D} ctx
   */
  draw(ctx) {
    this.drawSprite(ctx);
  }
}
