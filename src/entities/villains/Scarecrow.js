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
 *    - updateAI() implementa rotinas de hover (levitação senoidal) e disparo duplo.
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
   * @param {number} options.y - Posição Y de levitação
   */
  constructor({ x = 700, y = 260 } = {}) {
    // [POO - Herança]: Dimensões imponentes (60x110) e 100 HP para batalha de chefe
    super({ x, y, w: 60, h: 110, maxHp: 100 });

    // [POO - Encapsulamento de Atributos de Chefe]
    this.name = 'Scarecrow';
    this.isBoss = true;      // Sinalizador polimórfico de chefe

    // Temporizadores de ataques encapsulados
    this.smokeCooldown = 110;
    this.bombCooldown = 190;
    this.auraTimer = 1200;   // 20 segundos (1200 frames a 60fps)
    this.auraActive = false;

    // Cinemática de levitação sobrenatural
    this.floatCycle = 0;
    this.hoverBaseY = y;
    this.speed = 1.2;
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

    // Menacing slow hover movement
    this.x += Math.sin(this.floatCycle * 0.8) * 0.8;
    this.y = this.hoverBaseY + Math.sin(this.floatCycle * 1.5) * 8;

    if (this.hurtFlash > 0) return;

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
    if (!this.alive) return;

    ctx.save();
    ctx.translate(this.x + this.w / 2, this.y + this.h);
    ctx.scale(this.facing, 1);

    const hoverSway = Math.sin(this.floatCycle * 2) * 2;

    // --- TATTERED ROBE & HEM ---
    const robeBaseY = -18;
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.moveTo(-22, robeBaseY - 50);
    ctx.lineTo(22, robeBaseY - 50);
    ctx.lineTo(26, robeBaseY);
    // Jagged tattered hem
    ctx.lineTo(18, robeBaseY - 6);
    ctx.lineTo(10, robeBaseY + 2);
    ctx.lineTo(0, robeBaseY - 4);
    ctx.lineTo(-10, robeBaseY + 2);
    ctx.lineTo(-18, robeBaseY - 6);
    ctx.lineTo(-26, robeBaseY);
    ctx.closePath();
    ctx.fill();

    // Robe shading & patches
    ctx.fillStyle = '#92400e';
    ctx.fillRect(-14, robeBaseY - 40, 10, 12);
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 1;
    ctx.strokeRect(-14, robeBaseY - 40, 10, 12);

    // Dark boots underneath
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(-14, -14, 10, 14);
    ctx.fillRect(4, -14, 10, 14);

    // --- ROPE BELT ---
    const beltY = robeBaseY - 44;
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(-20, beltY);
    ctx.lineTo(20, beltY);
    ctx.stroke();

    // Hanging rope knot
    ctx.beginPath();
    ctx.moveTo(4, beltY);
    ctx.lineTo(6, beltY + 16);
    ctx.stroke();

    // --- CHEST & SLEEVES ---
    // Left & Right tattered arms
    ctx.fillStyle = '#854d0e';
    if (this.isAttacking) {
      // Extended claw-like casting arm
      ctx.fillRect(14, beltY - 24, 28, 12);
      // Straw poking out from sleeve
      ctx.fillStyle = '#fde047';
      ctx.fillRect(38, beltY - 26, 6, 3);
      ctx.fillRect(40, beltY - 14, 8, 3);
      // Hypodermic syringe glove fingers
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(42, beltY - 22, 6, 2);
      ctx.fillRect(42, beltY - 18, 6, 2);
      ctx.fillRect(42, beltY - 14, 6, 2);
    } else {
      ctx.fillRect(16, beltY - 24, 12, 28);
      // Straw needle fingers
      ctx.fillStyle = '#fde047';
      ctx.fillRect(18, beltY + 4, 3, 8);
      ctx.fillRect(22, beltY + 4, 3, 8);
    }

    // --- BURLAP SACK MASK & HEAD ---
    const headY = beltY - 34;

    // Burlap head sack
    ctx.fillStyle = '#a16207';
    ctx.beginPath();
    ctx.roundRect(-16, headY - 10, 32, 34, 10);
    ctx.fill();

    // Stitched X eyes matching reference
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 2.4;
    // Left X eye
    ctx.beginPath();
    ctx.moveTo(-11, headY - 4); ctx.lineTo(-5, headY + 2);
    ctx.moveTo(-5, headY - 4); ctx.lineTo(-11, headY + 2);
    ctx.stroke();

    // Right X eye
    ctx.beginPath();
    ctx.moveTo(5, headY - 4); ctx.lineTo(11, headY + 2);
    ctx.moveTo(11, headY - 4); ctx.lineTo(5, headY + 2);
    ctx.stroke();

    // Stitched grinning mouth
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-12, headY + 14);
    ctx.lineTo(12, headY + 14);
    ctx.stroke();

    // Cross-stitches across mouth line
    for (let s = -10; s <= 10; s += 4) {
      ctx.beginPath();
      ctx.moveTo(s, headY + 11);
      ctx.lineTo(s, headY + 17);
      ctx.stroke();
    }

    // --- WIDE-BRIM STRAW HAT ---
    const hatY = headY - 14;

    // Straw poking out under hat
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(-22, hatY + 6, 6, 3);
    ctx.fillRect(18, hatY + 6, 5, 3);

    // Wide hat brim
    ctx.fillStyle = '#713f12';
    ctx.beginPath();
    ctx.ellipse(0, hatY + 4, 32, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Hat crown (tall pointed ragged cone)
    ctx.beginPath();
    ctx.moveTo(-16, hatY + 4);
    ctx.lineTo(-4, hatY - 26);
    ctx.lineTo(6, hatY - 24);
    ctx.lineTo(16, hatY + 4);
    ctx.closePath();
    ctx.fill();

    // Hat rope band
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-15, hatY + 2);
    ctx.lineTo(15, hatY + 2);
    ctx.stroke();

    // Hurt flash
    if (this.hurtFlash > 0) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.beginPath();
      ctx.roundRect(-24, -110, 48, 110, 6);
      ctx.fill();
    }

    ctx.restore();
  }
}
