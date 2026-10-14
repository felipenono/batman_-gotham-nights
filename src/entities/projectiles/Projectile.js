// Este arquivo cuida de compartilhar movimento e duração dos projéteis.
// ===== DEPENDÊNCIAS E CONFIGURAÇÕES =====
import { Entity } from "../Entity.js";
// ===== COMPORTAMENTO =====
export class Projectile extends Entity {
  // Recebe as dependências e prepara o estado inicial deste componente.
  constructor({ x: posicaoX = 0, y: posicaoY = 0, w: larguraObjeto = 16, h: alturaObjeto = 16, vx: velocidadeX = 0, vy: velocidadeY = 0, damage = 10, lifetime = 180, owner = null } = {}) {
    // [POO - Herança]: Inicialização na superclasse Entity
    super({
      x: posicaoX,
      y: posicaoY,
      w: larguraObjeto,
      h: alturaObjeto
    });
    // [POO - Atributos de Cinemática e Combate]
    this.vx = velocidadeX;
    this.vy = velocidadeY;
    this.damage = damage;
    this.lifetime = lifetime;
    this.owner = owner;
    // [POO - Atributos de Rotação Visual]
    this.spin = 0;
    this.spinSpeed = 0.3;
  }
  // Recebe a atualização atual e avança o estado, sem redesenhar a tela.
  update(passoTempo = 1, mundo = null) {
    this.x += this.vx * passoTempo;
    this.y += this.vy * passoTempo;
    this.spin += this.spinSpeed * passoTempo;
    this.lifetime -= passoTempo;
    if (this.lifetime <= 0) {
      this.alive = false;
    }
  }
}
