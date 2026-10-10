/**
 * ============================================================================
 * @file Projectile.js
 * @category POO - Superclasse Abstrata de Projéteis (Hierarquia de Disparos)
 * ============================================================================
 * CONCEITOS DE PROGRAMAÇÃO ORIENTADA A OBJETOS (POO):
 * 
 * 1. HERANÇA (Inheritance):
 *    Subclasse direta de Entity. Herda a posição (x, y) e capacidade de teste
 *    de colisão retangular AABB (bounds, intersects).
 * 
 * 2. ENCAPSULAMENTO (Encapsulation):
 *    Agrupa propriedades intrínsecas a qualquer projétil:
 *    - 'damage': quantidade de vida que subtrai do alvo.
 *    - 'lifetime': temporizador de autodestruição para liberação de memória.
 *    - 'owner': etiqueta de procedência ('batman' ou 'villain') para filtrar
 *      colisões amigáveis no sistema de combate (CombatSystem).
 * 
 * 3. POLIMORFISMO (Polymorphism):
 *    Fornece a base de deslocamento e rotação spin que é estendida por subclasses
 *    como Batarang (giro dourado), JokerTeeth (salto balístico) e GasBomb (parábola).
 * ============================================================================
 */

import { Entity } from '../Entity.js';

export class Projectile extends Entity {
  /**
   * CONSTRUTOR:
   * Inicializa o projétil balístico repassando caixa delimitadora para a superclasse.
   *
   * @param {Object} options - Parâmetros do projétil
   * @param {number} options.x - Posição X de nascimento
   * @param {number} options.y - Posição Y de nascimento
   * @param {number} options.w - Largura do projétil
   * @param {number} options.h - Altura do projétil
   * @param {number} options.vx - Velocidade horizontal
   * @param {number} options.vy - Velocidade vertical
   * @param {number} [options.damage=10] - Dano infligido ao colidir
   * @param {number} [options.lifetime=180] - Tempo de vida em quadros (3s a 60fps)
   * @param {string} [options.owner=null] - Origem do disparo: 'batman' | 'villain'
   */
  constructor({
    x = 0,
    y = 0,
    w = 16,
    h = 16,
    vx = 0,
    vy = 0,
    damage = 10,
    lifetime = 180,
    owner = null,
  } = {}) {
    // [POO - Herança]: Inicialização na superclasse Entity
    super({ x, y, w, h });

    // [POO - Atributos de Cinemática e Combate]
    this.vx = vx;
    this.vy = vy;
    this.damage = damage;
    this.lifetime = lifetime;
    this.owner = owner;

    // [POO - Atributos de Rotação Visual]
    this.spin = 0;
    this.spinSpeed = 0.3;
  }

  /**
   * [POO - POLIMORFISMO: SOBRESCRITA DO MÉTODO update]
   * Executa a translação no espaço, rotaciona o ângulo e decrementa o ciclo de vida.
   * Quando o lifetime esgota, altera o estado interno (alive = false) para reciclagem.
   *
   * @param {number} dt - Delta time
   * @param {Object} world - Contexto do cenário
   */
  update(dt = 1, world = null) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.spin += this.spinSpeed * dt;
    this.lifetime -= dt;

    if (this.lifetime <= 0) {
      this.alive = false;
    }
  }
}
