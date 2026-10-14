// Este arquivo cuida de controlar as moedas lançadas.
import { APARENCIA } from "../../config/configuracao.js";

// ===== DEPENDÊNCIAS E CONFIGURAÇÕES =====
import { Projectile } from "./Projectile.js";
const estiloVisual = APARENCIA.Coin;
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
  // Recebe o contexto 2D e desenha o estado atual sem avançar o tempo.
  draw(contexto) {
    if (!this.alive) return;
    contexto.save();
    contexto.translate(this.x + this.w / 2, this.y + this.h / 2);
    const scaleX = Math.cos(this.flipAngle);
    contexto.scale(scaleX, 1);
    const isScarredSide = Math.sin(this.flipAngle) > 0;
    contexto.shadowColor = estiloVisual.brilho1;
    contexto.shadowBlur = 4;
    contexto.fillStyle = isScarredSide ? estiloVisual.gradiente2 : estiloVisual.gradiente3;
    contexto.beginPath();
    contexto.arc(0, 0, 8, 0, Math.PI * 2);
    contexto.fill();
    contexto.shadowBlur = 0;
    contexto.strokeStyle = isScarredSide ? estiloVisual.gradiente4 : estiloVisual.gradiente5;
    contexto.lineWidth = 1;
    contexto.stroke();
    if (isScarredSide) {
      contexto.strokeStyle = estiloVisual.contorno6;
      contexto.lineWidth = 1.2;
      contexto.beginPath();
      contexto.moveTo(-5, -5);
      contexto.lineTo(5, 5);
      contexto.moveTo(-5, 5);
      contexto.lineTo(5, -5);
      contexto.stroke();
    } else {
      contexto.fillStyle = estiloVisual.preenchimento7;
      contexto.beginPath();
      contexto.arc(0, -1, 3, 0, Math.PI * 2);
      contexto.fill();
    }
    contexto.restore();
  }
}
