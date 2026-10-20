// Este arquivo cuida de controlar as moedas lançadas.
import { APARENCIA } from "../../../config/configuracao.js";

// ===== DEPENDÊNCIAS E CONFIGURAÇÕES =====
const estiloVisual = APARENCIA.Coin;
// ===== COMPORTAMENTO =====
export function drawCoin(contexto) {
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
