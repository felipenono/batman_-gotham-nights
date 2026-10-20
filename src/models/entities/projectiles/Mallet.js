// Movimento e colisão da marreta.

// ===== DEPENDÊNCIAS E CONFIGURAÇÕES =====
import { Projectile } from "./Projectile.js";
// ===== COMPORTAMENTO =====
export class Mallet extends Projectile {
  // Recebe as dependências e prepara o estado inicial deste componente.
  constructor(posicaoX, posicaoY, velocidadeX, velocidadeY) {
    super({
      x: posicaoX,
      y: posicaoY,
      vx: velocidadeX,
      vy: velocidadeY,
      w: 28,
      h: 28,
      damage: 1,
      lifetime: 100,
      owner: "villain"
    });
  }
  // Recebe a atualização atual e avança o estado, sem redesenhar a tela.
  update(passoTempo = 1, mundo = null) {
    this.vy += 0.16 * passoTempo;
    super.update(passoTempo, mundo);
  }

}
