/**
 * ============================================================================
 * @file Batarang.js
 * @category POO - Subclasse Concreta de Projétil (Especialização do Ataque do Jogador)
 * ============================================================================
 * CONCEITOS DE PROGRAMAÇÃO ORIENTADA A OBJETOS (POO):
 * 
 * 1. HERANÇA EM DOIS NÍVEIS (Multi-level Inheritance):
 *    Entity (geometria 2D) -> Projectile (física de disparos) -> Batarang (arma do herói).
 * 
 * 2. ENCAPSULAMENTO DE PROPRIEDADES FIXAS:
 *    Define via super() os atributos imutáveis do projétil:
 *    - Dimensões aerodinâmicas (22x14 pixels).
 *    - Dano configurado pelas constantes do sistema.
 *    - Autoria explícita 'batman' para proteção contra dano acidental no jogador.
 * 
 * 3. POLIMORFISMO (Polymorphism):
 *    Sobrescreve o método draw() para desenhar a geometria vetorial clássica do morcego
 *    rotacionando dinamicamente em alta velocidade (spinSpeed: 0.45 rad/frame).
 * ============================================================================
 */

import { Projectile } from './Projectile.js';
import { PROJECTILE } from '../../utils/constants.js';

export class Batarang extends Projectile {
  /**
   * CONSTRUTOR:
   * Instancia um batarang em movimento arremessado pelo Batman.
   *
   * @param {number} x - Posição horizontal de disparo
   * @param {number} y - Posição vertical de disparo
   * @param {number} vx - Componente horizontal do vetor velocidade
   * @param {number} vy - Componente vertical do vetor velocidade
   */
  constructor(x, y, vx, vy) {
    // [POO - Herança]: Passa a configuração fixa para a superclasse Projectile
    super({
      x,
      y,
      w: 22,
      h: 14,
      vx,
      vy,
      damage: PROJECTILE.BATARANG_DAMAGE,
      lifetime: 140,
      owner: 'batman', // Autoria do jogador
    });

    // Taxa de giro angular acelerada
    this.spinSpeed = 0.45;
  }

  /**
   * Procedural rendering of the spinning golden Batarang.
   * @param {CanvasRenderingContext2D} ctx
   */
  draw(ctx) {
    if (!this.alive) return;

    ctx.save();
    ctx.translate(this.x + this.w / 2, this.y + this.h / 2);
    ctx.rotate(this.spin);

    // Glowing yellow aura
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 8;

    // Outer Bat silhouette
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.moveTo(0, 4);
    ctx.lineTo(8, 2);
    ctx.lineTo(13, -7);
    ctx.lineTo(6, -3);
    ctx.lineTo(2, -7);
    ctx.lineTo(0, -4);
    ctx.lineTo(-2, -7);
    ctx.lineTo(-6, -3);
    ctx.lineTo(-13, -7);
    ctx.lineTo(-8, 2);
    ctx.closePath();
    ctx.fill();

    // Dark titanium inner core
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(0, -1, 3, 0, Math.PI * 2);
    ctx.fill();

    // Sharp beveled blade edge highlights
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.restore();
  }
}
