// Este arquivo cuida de controlar as moedas lançadas.

// ===== DEPENDÊNCIAS E CONFIGURAÇÕES =====
import { Projectile } from "./Projectile.js";
// ===== COMPORTAMENTO =====
export class Coin extends Projectile {
  // Recebe as dependências e prepara o estado inicial deste componente.
  constructor(posicaoX, posicaoY, velocidadeX, velocidadeY) {
    super({
      x: posicaoX,
      y: posicaoY,
      w: 18,
      h: 18,
      vx: velocidadeX,
      vy: velocidadeY,
      damage: 1,
      lifetime: 180,
      owner: "villain"
    });
    this.gravity = 0.28;
    this.bounces = 0;
    this.maxBounces = 1;
    this.flipAngle = 0;
  }
  // Recebe a atualização atual e avança o estado, sem redesenhar a tela.
  update(passoTempo = 1, mundo = null) {
    this.vy += this.gravity * passoTempo;
    this.flipAngle += 0.35 * passoTempo;
    super.update(passoTempo, mundo);
    if (this.y > 430 && this.bounces < this.maxBounces) {
      this.y = 430;
      this.vy = -Math.abs(this.vy) * 0.65;
      this.bounces++;
    }
  }

}
