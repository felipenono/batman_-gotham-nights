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
    this.spriteKey = 'joker';

    // [POO - Atributos de Inteligência Artificial e Marcha]
    this.shootCooldown = 75 + Math.floor(Math.random() * 60);
    this.scoreType = 'Joker';
    this.name = 'Coringa';
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
    this.drawSprite(ctx);
  }
}
