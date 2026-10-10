/**
 * ============================================================================
 * @file Joker.js
 * @category POO - Subclasse Concreta de Inimigo (Especialização de Character)
 * ============================================================================
 * CONCEITOS DE PROGRAMAÇÃO ORIENTADA A OBJETOS (POO):
 * 
 * 1. HERANÇA (Inheritance):
 *    Joker herda todas as características fundamentais de Character
 *    (posições, caixas de colisão, hp, estados de dano, translação).
 * 
 * 2. ENCAPSULAMENTO DE COMPORTAMENTO E IA:
 *    Mantém seus próprios temporizadores de ataque (shootCooldown),
 *    velocidade de perseguição (speed) e ciclo de oscilação visual (wobble).
 * 
 * 3. POLIMORFISMO (Polymorphism):
 *    - Implementa o método updateAI() exclusivo para calcular trajetórias
 *      balísticas em direção ao Batman e disparar dentaduras mecânicas.
 *    - Sobrescreve draw() para desenhar a silhueta clássica do Príncipe Palhaço do Crime.
 * ============================================================================
 */

import { Character } from '../Character.js';
import { JokerTeeth } from '../projectiles/JokerTeeth.js';

export class Joker extends Character {
  /**
   * CONSTRUTOR:
   * Inicializa o Coringa como inimigo comum do Estágio 1 (Rooftops).
   *
   * @param {Object} options
   * @param {number} options.x - Posição X de surgimento
   * @param {number} options.y - Posição Y de surgimento
   */
  constructor({ x = 600, y = 300 } = {}) {
    // [POO - Herança]: Dimensões (34x70) e 10 HP (derrotado com 1 batarang direto)
    super({ x, y, w: 34, h: 70, maxHp: 10 });

    // [POO - Atributos de Inteligência Artificial e Marcha]
    this.shootCooldown = 75 + Math.floor(Math.random() * 60);
    this.name = 'Joker';
    this.speed = 1.6;        // Velocidade de marcha em direção ao jogador
    this.patrolTimer = 0;
    this.wobble = 0;         // Ciclo senoidal para oscilação cômica ao caminhar
  }

  /**
   * [POO - POLIMORFISMO: MÉTODO DE INTELIGÊNCIA ARTIFICIAL (IA)]
   * Avalia a distância até o Batman, ajusta a orientação e arremessa dentes mecânicos.
   *
   * @param {Character} player - Instância do Batman
   * @param {Array<Projectile>} projectilesOut - Coleção para emissão de novos projéteis
   * @param {Function} [playSfx=null] - Callback para reprodução de efeitos sonoros
   */
  updateAI(player, projectilesOut, playSfx = null) {
    if (!this.alive || !player || !player.alive) return;

    // Etapa 1: Orientação frontal em direção ao alvo
    const dx = player.x - this.x;
    this.facing = dx >= 0 ? 1 : -1;

    // Etapa 2: Interrupção temporária caso esteja atordoado por dano recente
    if (this.hurtFlash > 0) return;

    // Etapa 3: Perseguição no plano horizontal
    if (Math.abs(dx) > 15) {
      this.vx = this.facing * this.speed;
    } else {
      this.vx = 0;
    }

    // Etapa 4: Ciclo de arremesso balístico de dentaduras
    this.shootCooldown--;
    if (this.shootCooldown <= 0) {
      this.shootCooldown = 75 + Math.floor(Math.random() * 60);
      this.throwTeeth(player, projectilesOut, playSfx);
    }
  }

  throwTeeth(player, projectilesOut, playSfx = null) {
    this.attackTimer = 15;
    this.isAttacking = true;

    if (typeof playSfx === 'function') {
      if (Math.random() > 0.45) {
        playSfx('joker_laugh');
      } else {
        playSfx('teeth_chatter');
      }
    }

    const originX = this.x + this.w / 2 + this.facing * 14;
    const originY = this.y + 24;

    const targetX = player.x + player.w / 2;
    const targetY = player.y + player.h / 2;
    const dx = targetX - originX;
    const dy = targetY - originY;

    // Accurate ballistic trajectory aimed right at Batman
    const flightTime = Math.max(30, Math.min(60, Math.abs(dx) / 5.5));
    const vx = dx / flightTime;
    const vy = (dy - 0.5 * 0.25 * flightTime * flightTime) / flightTime;

    projectilesOut.push(new JokerTeeth(originX, originY, vx, vy));
  }

  update(dt = 1, world = null) {
    super.update(dt, world);
    this.wobble += 0.15 * dt;
  }

  /**
   * Procedural drawing matching the reference image:
   * Green messy hair, white face, red smile with teeth, purple suit, green/orange vest.
   * @param {CanvasRenderingContext2D} ctx
   */
  draw(ctx) {
    if (!this.alive) return;

    ctx.save();
    ctx.translate(this.x + this.w / 2, this.y + this.h);
    ctx.scale(this.facing, 1);

    const isWalking = Math.abs(this.vx) > 0.2;
    const legOffset = isWalking ? Math.sin(this.wobble * 3) * 8 : 0;
    const breathe = Math.sin(this.wobble) * 1.5;

    // --- LEGS & SHOES ---
    // Dark purple trousers
    ctx.fillStyle = '#581c87';
    ctx.fillRect(-12 - legOffset * 0.4, -22, 9, 14);
    ctx.fillRect(3 + legOffset * 0.4, -22, 9, 14);

    // Pointy black dress shoes
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-15 - legOffset * 0.4, -8, 12, 8);
    ctx.fillRect(3 + legOffset * 0.4, -8, 13, 8);

    // --- TORSO ---
    const torsoY = -48 + breathe;

    // Purple tailcoat
    ctx.fillStyle = '#6b21a8';
    ctx.beginPath();
    ctx.roundRect(-14, torsoY + 10, 28, 20, 3);
    ctx.fill();

    // Tailcoat tails behind
    ctx.fillStyle = '#581c87';
    ctx.beginPath();
    ctx.moveTo(-12, torsoY + 22);
    ctx.lineTo(-16, torsoY + 34);
    ctx.lineTo(-8, torsoY + 28);
    ctx.fill();

    // Bright orange/yellow vest
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(-8, torsoY + 12, 16, 16);

    // Emerald green shirt collar
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.moveTo(-6, torsoY + 12);
    ctx.lineTo(0, torsoY + 18);
    ctx.lineTo(6, torsoY + 12);
    ctx.fill();

    // Red bow tie
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.moveTo(-6, torsoY + 11);
    ctx.lineTo(0, torsoY + 13);
    ctx.lineTo(-6, torsoY + 15);
    ctx.moveTo(6, torsoY + 11);
    ctx.lineTo(0, torsoY + 13);
    ctx.lineTo(6, torsoY + 15);
    ctx.fill();

    // White flower on lapel
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(-10, torsoY + 15, 3, 0, Math.PI * 2);
    ctx.fill();

    // --- ARMS ---
    ctx.fillStyle = '#6b21a8';
    if (this.isAttacking) {
      // Throwing arm extended forward
      ctx.fillRect(6, torsoY + 11, 16, 6);
      ctx.fillStyle = '#f8fafc'; // White glove
      ctx.fillRect(18, torsoY + 10, 7, 8);
    } else {
      ctx.fillRect(9, torsoY + 12, 7, 16);
      ctx.fillStyle = '#f8fafc'; // White glove
      ctx.fillRect(9, torsoY + 24, 7, 6);
    }

    // --- HEAD & FACE ---
    const headY = torsoY - 14;

    // Pale white face
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.roundRect(-10, headY, 20, 22, 6);
    ctx.fill();

    // Wild messy neon green hair
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.moveTo(-13, headY + 6);
    ctx.quadraticCurveTo(-14, headY - 8, -6, headY - 10);
    ctx.lineTo(-2, headY - 14);
    ctx.lineTo(4, headY - 9);
    ctx.lineTo(10, headY - 12);
    ctx.quadraticCurveTo(14, headY - 6, 12, headY + 6);
    ctx.lineTo(8, headY + 2);
    ctx.lineTo(-10, headY + 2);
    ctx.closePath();
    ctx.fill();

    // Yellowish sinister eyes with purple dark circles
    ctx.fillStyle = '#a855f7'; // Purple bags
    ctx.fillRect(-7, headY + 6, 5, 4);
    ctx.fillRect(2, headY + 6, 5, 4);

    ctx.fillStyle = '#fef08a'; // Yellow irises
    ctx.fillRect(-6, headY + 7, 3, 2);
    ctx.fillRect(3, headY + 7, 3, 2);

    ctx.fillStyle = '#0f172a'; // Pupils
    ctx.fillRect(-5, headY + 7, 1.5, 2);
    ctx.fillRect(4, headY + 7, 1.5, 2);

    // Exaggerated red painted smile
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, headY + 12, 8, 0.1 * Math.PI, 0.9 * Math.PI, false);
    ctx.stroke();

    // Visible sharp teeth grin
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-5, headY + 14, 10, 3);
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    for (let t = -4; t <= 4; t += 2) {
      ctx.moveTo(t, headY + 14);
      ctx.lineTo(t, headY + 17);
    }
    ctx.stroke();

    // Hurt flash
    if (this.hurtFlash > 0) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.beginPath();
      ctx.roundRect(-16, -72, 32, 72, 4);
      ctx.fill();
    }

    // Mini overhead health bar when damaged
    if (this.hp < this.maxHp) {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-16, -80, 32, 5);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-16, -80, 32 * this.hpRatio, 5);
      ctx.strokeStyle = '#f87171';
      ctx.lineWidth = 0.8;
      ctx.strokeRect(-16, -80, 32, 5);
    }

    ctx.restore();
  }
}
