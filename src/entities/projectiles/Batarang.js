// Este arquivo cuida de controlar o batarangue e seu limite de lançamentos.
// ===== DEPENDÊNCIAS E CONFIGURAÇÕES =====
import { drawBatarang } from "../../utils/batSymbols.js";
import { Projectile } from "./Projectile.js";
import { PROJECTILE } from "../../config/configuracao.js";
// ===== COMPORTAMENTO =====
export class Batarang extends Projectile {
  // Recebe as dependências e prepara o estado inicial deste componente.
  constructor(posicaoX, posicaoY, velocidadeX, velocidadeY) {
    // [POO - Herança]: Passa a configuração fixa para a superclasse Projectile
    super({
      x: posicaoX,
      y: posicaoY,
      w: 24,
      h: 11,
      vx: velocidadeX,
      vy: velocidadeY,
      damage: PROJECTILE.BATARANG_DAMAGE,
      lifetime: 140,
      owner: "batman"
    });
    this.spinSpeed = 0.45;
  }
  static available(projeteis) {
    const active = projeteis.filter((elemento) => elemento instanceof Batarang && elemento.owner === "batman" && elemento.alive).length;
    return Math.max(0, PROJECTILE.BATARANG_MAX_ACTIVE - active);
  }
  // Recebe o contexto 2D e desenha o estado atual sem avançar o tempo.
  draw(contexto) {
    if (!this.alive) return;
    contexto.save();
    contexto.translate(this.x + this.w / 2, this.y + this.h / 2);
    contexto.rotate(this.spin);
    drawBatarang(contexto);
    contexto.restore();
  }
}
