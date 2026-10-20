// Este arquivo cuida de controlar a fumaça de medo.

// ===== DEPENDÊNCIAS E CONFIGURAÇÕES =====
import { Projectile } from "./Projectile.js";
// ===== COMPORTAMENTO =====
export class FearSmoke extends Projectile {
  // Recebe as dependências e prepara o estado inicial deste componente.
  constructor(posicaoX, posicaoY, velocidadeX, velocidadeY) {
    super({
      x: posicaoX,
      y: posicaoY,
      w: 30,
      h: 30,
      vx: velocidadeX,
      vy: velocidadeY,
      damage: 1,
      lifetime: 240,
      owner: "villain"
    });
    this.pulse = Math.random() * Math.PI * 2;
    this.drift = 0;
  }
  // Recebe a atualização atual e avança o estado, sem redesenhar a tela.
  update(passoTempo = 1, mundo = null) {
    this.pulse += 0.08 * passoTempo;
    this.drift += 0.04 * passoTempo;
    this.y += Math.sin(this.drift) * 0.8 * passoTempo;
    super.update(passoTempo, mundo);
  }

}
