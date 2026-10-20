// Este arquivo cuida de controlar a bomba e a expansão da nuvem de gás.
import { APARENCIA } from "../../../config/configuracao.js";

// ===== DEPENDÊNCIAS E CONFIGURAÇÕES =====
const estiloVisual = APARENCIA.GasBomb;
// ===== COMPORTAMENTO =====
export function drawGasBomb(contexto) {
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
