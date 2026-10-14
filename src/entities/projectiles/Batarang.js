import { drawBatarang } from '../../utils/batSymbols.js';
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
      w: 24,
      h: 11,
      vx,
      vy,
      damage: PROJECTILE.BATARANG_DAMAGE,
      lifetime: 140,
      owner: 'batman', // Autoria do jogador
    });

    // Taxa de giro angular acelerada
    this.spinSpeed = 0.45;
  }

  static available(projectiles) {
    const active = projectiles.filter(p => p instanceof Batarang && p.owner === 'batman' && p.alive).length;
    return Math.max(0, PROJECTILE.BATARANG_MAX_ACTIVE - active);
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

    drawBatarang(ctx);
    ctx.restore();
  }
}
