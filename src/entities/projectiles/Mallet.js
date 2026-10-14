// Este arquivo cuida de mover e desenhar a marreta.
import { APARENCIA } from "../../config/configuracao.js";

// ===== DEPENDÊNCIAS E CONFIGURAÇÕES =====
import { Projectile } from "./Projectile.js";
const estiloVisual = APARENCIA.Mallet;
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
  // Recebe o contexto 2D e desenha o estado atual sem avançar o tempo.
  draw(contexto) {
    if (!this.alive) return;
    contexto.save();
    contexto.translate(this.x + 14, this.y + 14);
    contexto.rotate(this.spin);
    contexto.fillStyle = estiloVisual.preenchimento1;
    contexto.fillRect(-2, -3, 4, 23);
    contexto.fillStyle = estiloVisual.preenchimento2;
    contexto.fillRect(-13, -13, 26, 14);
    contexto.fillStyle = estiloVisual.preenchimento3;
    contexto.fillRect(-13, -13, 4, 14);
    contexto.fillRect(9, -13, 4, 14);
    contexto.restore();
  }
}
