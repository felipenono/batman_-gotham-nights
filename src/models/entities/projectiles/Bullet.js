// Movimento e colisão das balas.

// ===== DEPENDÊNCIAS E CONFIGURAÇÕES =====
import { Projectile } from "./Projectile.js";
import { PROJECTILE } from "../../../config/configuracao.js";
// ===== COMPORTAMENTO =====
export class Bullet extends Projectile {
  // Recebe as dependências e prepara o estado inicial deste componente.
  constructor(posicaoX, posicaoY, velocidadeX, velocidadeY) {
    super({
      x: posicaoX,
      y: posicaoY,
      w: 16,
      h: 8,
      vx: velocidadeX,
      vy: velocidadeY,
      damage: 1,
      lifetime: 180,
      owner: "villain"
    });
    this.speed = PROJECTILE.BULLET_SPEED;
  }

}
