// Este arquivo cuida de controlar a bomba e a expansão da nuvem de gás.
import { APARENCIA } from "../../config/configuracao.js";

// ===== DEPENDÊNCIAS E CONFIGURAÇÕES =====
import { Projectile } from "./Projectile.js";
const estiloVisual = APARENCIA.GasBomb;
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
  // Recebe o contexto 2D e desenha o estado atual sem avançar o tempo.
  draw(contexto) {
    if (!this.alive) return;
    contexto.save();
    contexto.translate(this.x + this.w / 2, this.y + this.h / 2);
    if (this.exploded) {
      contexto.shadowColor = estiloVisual.brilho1;
      contexto.shadowBlur = 12;
      contexto.fillStyle = `rgba(163, 230, 53, ${Math.max(0, 1 - this.explodeTimer / 25)})`;
      contexto.beginPath();
      contexto.arc(0, 0, this.explodeRadius, 0, Math.PI * 2);
      contexto.fill();
      contexto.fillStyle = `rgba(77, 124, 15, ${Math.max(0, 0.8 - this.explodeTimer / 30)})`;
      contexto.beginPath();
      contexto.arc(0, 0, this.explodeRadius * 0.65, 0, Math.PI * 2);
      contexto.fill();
    } else {
      contexto.rotate(this.spin);
      contexto.fillStyle = estiloVisual.preenchimento2;
      contexto.beginPath();
      contexto.roundRect(-9, -9, 18, 18, 5);
      contexto.fill();
      contexto.strokeStyle = estiloVisual.contorno3;
      contexto.lineWidth = 1.8;
      contexto.beginPath();
      contexto.moveTo(-9, 0);
      contexto.lineTo(9, 0);
      contexto.moveTo(0, -9);
      contexto.lineTo(0, 9);
      contexto.stroke();
      contexto.strokeStyle = estiloVisual.contorno4;
      contexto.lineWidth = 2;
      contexto.beginPath();
      contexto.moveTo(0, -9);
      contexto.quadraticCurveTo(4, -14, 2, -18);
      contexto.stroke();
      contexto.fillStyle = estiloVisual.preenchimento5;
      contexto.shadowColor = estiloVisual.preenchimento5;
      contexto.shadowBlur = 6;
      contexto.beginPath();
      contexto.arc(2, -18, 3, 0, Math.PI * 2);
      contexto.fill();
    }
    contexto.restore();
  }
}
