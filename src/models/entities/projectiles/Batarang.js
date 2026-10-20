// Este arquivo cuida de controlar o batarangue e seu limite de lançamentos.
// ===== DEPENDÊNCIAS E CONFIGURAÇÕES =====
import { Projectile } from "./Projectile.js";
import { PROJECTILE } from "../../../config/configuracao.js";
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

}
