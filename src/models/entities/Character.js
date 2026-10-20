// Este arquivo cuida de compartilhar vida, dano e animação entre personagens.
// ===== DEPENDÊNCIAS E CONFIGURAÇÕES =====
import { Entity } from "./Entity.js";
import { AnimationState } from '../AnimationState.js';
// ===== COMPORTAMENTO =====
export class Character extends Entity {
  // Recebe as dependências e prepara o estado inicial deste componente.
  constructor({ x: posicaoX = 0, y: posicaoY = 0, w: larguraObjeto = 36, h: alturaObjeto = 64, maxHp = 100 } = {}) {
    // [POO - Herança]: Chama o construtor da superclasse Entity
    super({
      x: posicaoX,
      y: posicaoY,
      w: larguraObjeto,
      h: alturaObjeto
    });
    // [POO - Atributos de Vida / Saúde (Encapsulamento)]
    this.animator = new AnimationState();
    this.deathTimer = 0;
    this.maxHp = maxHp;
    this.hp = maxHp;
    // [POO - Atributos de Orientação e Estados Visuais]
    this.facing = 1;
    this.hurtFlash = 0;
    this.invulnerable = 0;
    this.onGround = false;
    this.walkCycle = 0;
    this.isAttacking = false;
    this.attackTimer = 0;
    this.isBoss = false;
  }
  // Recebe o dano e informa se ele foi aplicado neste momento.
  takeDamage(amount) {
    if (!this.alive) return false;
    if (this.invulnerable > 0) return false;
    // Redução do estado interno de saúde
    this.hp -= amount;
    this.hurtFlash = 10;
    // Regra polimórfica: chefes recebem janela curta de invulnerabilidade
    if (this.isBoss) {
      this.invulnerable = 6;
    } else {
      this.invulnerable = 0;
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
    if (!Number.isFinite(this.maxHp) || this.maxHp <= 0) return 0;
    return Math.max(0, Math.min(1, this.hp / this.maxHp));
  }

  // Recebe a atualização atual e avança o estado, sem redesenhar a tela.
  update(passoTempo = 1, mundo = null) {
    this.animator.update(this, passoTempo);
    if (this.hurtFlash > 0) this.hurtFlash--;
    if (this.invulnerable > 0) this.invulnerable--;
    if (this.attackTimer > 0) {
      this.attackTimer--;
      if (this.attackTimer === 0) this.isAttacking = false;
    }
    // Atualiza ciclo de caminhada apenas se estiver em solo e em movimento
    if (Math.abs(this.vx) > 0.1 && this.onGround) {
      this.walkCycle += 0.2 * passoTempo;
    } else {
      this.walkCycle = 0;
    }
  }
}
