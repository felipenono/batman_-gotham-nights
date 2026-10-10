/**
 * ============================================================================
 * @file Character.js
 * @category POO - Subclasse Abstrata Intermediária (Especialização de Entity)
 * ============================================================================
 * CONCEITOS DE PROGRAMAÇÃO ORIENTADA A OBJETOS (POO):
 * 
 * 1. HERANÇA (Inheritance):
 *    Estende a superclasse "Entity" usando a palavra-chave 'extends'.
 *    Herda automaticamente x, y, w, h, vx, vy, bounds e intersects.
 * 
 * 2. ENCAPSULAMENTO (Encapsulation):
 *    Gerencia o ciclo biológico do personagem: pontos de vida (hp, maxHp),
 *    estados transitórios (invulnerable, hurtFlash, onGround, isAttacking).
 *    O dano é aplicado de forma controlada através do método takeDamage().
 * 
 * 3. POLIMORFISMO (Polymorphism):
 *    Especializa o método update() chamando super.update(dt) para manter a
 *    física cinemática da superclasse enquanto adiciona temporizadores biológicos.
 * ============================================================================
 */

import { Entity } from './Entity.js';

export class Character extends Entity {
  /**
   * CONSTRUTOR:
   * Invoca super() para repassar geometria à superclasse Entity e inicializa
   * atributos biológicos e de animação.
   *
   * @param {Object} options - Parâmetros de inicialização
   * @param {number} options.x - Posição X inicial
   * @param {number} options.y - Posição Y inicial
   * @param {number} options.w - Largura corporal
   * @param {number} options.h - Altura corporal
   * @param {number} options.maxHp - Pontos de vida máximos
   */
  constructor({ x = 0, y = 0, w = 36, h = 64, maxHp = 100 } = {}) {
    // [POO - Herança]: Chama o construtor da superclasse Entity
    super({ x, y, w, h });

    // [POO - Atributos de Vida / Saúde (Encapsulamento)]
    this.maxHp = maxHp;
    this.hp = maxHp;

    // [POO - Atributos de Orientação e Estados Visuais]
    this.facing = 1;        // Direção: 1 = direita, -1 = esquerda
    this.hurtFlash = 0;     // Temporizador de feedback visual de impacto
    this.invulnerable = 0;  // Temporizador de imunidade transitória após sofrer dano
    this.onGround = false;  // Flag de contato com plataformas terrestres
    this.walkCycle = 0;     // Contador senoidal para animação de passos
    this.isAttacking = false;// Flag de postura de combate
    this.attackTimer = 0;   // Temporizador de animação do ataque
    this.isBoss = false;    // Diferencia chefes de capangas comuns na hierarquia
  }

  /**
   * [POO - ENCAPSULAMENTO E REGRAS DE NEGÓCIO: RECEBIMENTO DE DANO]
   * Aplica dano de forma segura, evitando alterações arbitrárias diretas no hp.
   * Avalia regras de imunidade e dispara a morte biológica se hp <= 0.
   *
   * @param {number} amount - Quantidade de dano sofrido
   * @returns {boolean} True se o golpe penetrou as defesas e causou dano real
   */
  takeDamage(amount) {
    // Guarda de integridade: personagens mortos ou em invulnerabilidade ignoram dano
    if (!this.alive) return false;
    if (this.invulnerable > 0) return false;

    // Redução do estado interno de saúde
    this.hp -= amount;
    this.hurtFlash = 10; // Sinaliza à camada gráfica para piscar em branco/vermelho

    // Regra polimórfica: chefes recebem janela curta de invulnerabilidade
    if (this.isBoss) {
      this.invulnerable = 6;
    } else {
      this.invulnerable = 0; // Inimigos normais tomam todo golpe sem descartar acertos
    }

    // Transição de estado para morte se HP esgotar
    if (this.hp <= 0) {
      this.hp = 0;
      this.alive = false;
    }
    return true;
  }

  /**
   * [POO - ENCAPSULAMENTO / GETTER COMPUTADO DE PORCENTAGEM DE VIDA]
   * Retorna a fração normalizada (0.0 a 1.0) para barras de vida (HUD).
   *
   * @returns {number} Fração entre 0 e 1
   */
  get hpRatio() {
    return Math.max(0, Math.min(1, this.hp / this.maxHp));
  }

  /**
   * [POO - POLIMORFISMO: SOBRESCRITA COM REUSO (super.update)]
   * Atualiza a cinemática física da superclasse Entity e processa os temporizadores
   * vitais de invulnerabilidade, flash e ciclos de marcha.
   *
   * @param {number} dt - Delta time
   * @param {Object} world - Contexto do cenário
   */
  update(dt = 1, world = null) {
    // Executa a translação da superclasse (this.x += this.vx * dt)
    super.update(dt, world);

    // Decrementa contadores de estados temporais
    if (this.hurtFlash > 0) this.hurtFlash--;
    if (this.invulnerable > 0) this.invulnerable--;
    if (this.attackTimer > 0) {
      this.attackTimer--;
      if (this.attackTimer === 0) this.isAttacking = false;
    }

    // Atualiza ciclo de caminhada apenas se estiver em solo e em movimento
    if (Math.abs(this.vx) > 0.1 && this.onGround) {
      this.walkCycle += 0.2 * dt;
    } else {
      this.walkCycle = 0;
    }
  }
}
