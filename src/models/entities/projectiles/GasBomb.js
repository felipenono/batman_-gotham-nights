// Este arquivo cuida de controlar a bomba e a expansão da nuvem de gás.

// ===== DEPENDÊNCIAS E CONFIGURAÇÕES =====
import { Projectile } from "./Projectile.js";
// ===== COMPORTAMENTO =====
export class GasBomb extends Projectile {
  // Recebe as dependências e prepara o estado inicial deste componente.
  constructor(posicaoX, posicaoY, velocidadeX, velocidadeY) {
    super({
      x: posicaoX,
      y: posicaoY,
      w: 22,
      h: 22,
      vx: velocidadeX,
      vy: velocidadeY,
      damage: 1,
      lifetime: 130,
      owner: "villain"
    });
    this.gravity = 0.28;
    this.exploded = false;
    this.explodeTimer = 0;
    this.explodeRadius = 10;
  }
  // Recebe a atualização atual e avança o estado, sem redesenhar a tela.
  update(passoTempo = 1, mundo = null) {
    if (this.exploded) {
      const centroX = this.x + this.w / 2;
      const centroY = this.y + this.h / 2;
      this.explodeTimer += passoTempo;
      this.explodeRadius += 1.8 * passoTempo;
      this.w = this.explodeRadius * 2;
      this.h = this.explodeRadius * 2;
      // A nuvem aumenta ao redor do impacto, sem deslocar sua área de dano.
      this.x = centroX - this.explodeRadius;
      this.y = centroY - this.explodeRadius;
      if (this.explodeTimer >= 25) {
        this.alive = false;
      }
      return;
    }
    this.vy += this.gravity * passoTempo;
    super.update(passoTempo, mundo);
    if (this.y > 440) {
      this.detonate();
    }
  }
  detonate() {
    if (this.exploded) return;
    this.exploded = true;
    this.vx = 0;
    this.vy = 0;
  }

}
