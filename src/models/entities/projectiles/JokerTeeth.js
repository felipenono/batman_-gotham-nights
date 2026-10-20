// Este arquivo cuida de controlar os dentes saltitantes.

// ===== DEPENDÊNCIAS E CONFIGURAÇÕES =====
import { Projectile } from "./Projectile.js";
// ===== COMPORTAMENTO =====
export class JokerTeeth extends Projectile {
  // Recebe as dependências e prepara o estado inicial deste componente.
  constructor(posicaoX, posicaoY, velocidadeX, velocidadeY) {
    super({
      x: posicaoX,
      y: posicaoY,
      w: 24,
      h: 20,
      vx: velocidadeX,
      vy: velocidadeY,
      damage: 1,
      lifetime: 200,
      owner: "villain"
    });
    this.gravity = 0.25;
    this.chatterAngle = 0;
  }
  // Recebe a atualização atual e avança o estado, sem redesenhar a tela.
  update(passoTempo = 1, mundo = null) {
    this.vy += this.gravity * passoTempo;
    super.update(passoTempo, mundo);
    this.chatterAngle += 0.35 * passoTempo;
    if (this.y >= 420) {
      this.y = 420;
      this.vy = -3.5;
    }
  }

}
