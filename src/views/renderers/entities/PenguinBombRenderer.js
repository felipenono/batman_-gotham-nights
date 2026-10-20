// Este arquivo cuida de controlar a bomba perseguidora e sua explosão.
import { APARENCIA } from "../../../config/configuracao.js";

// ===== DEPENDÊNCIAS E CONFIGURAÇÕES =====
import { PROJECTILE } from "../../../config/configuracao.js";
const estiloVisual = APARENCIA.PenguinBomb;
// ===== COMPORTAMENTO =====
export function drawPenguinBomb(contexto) {
    if (!this.alive) return;
    contexto.save();
    contexto.translate(this.x + this.w / 2, this.y + this.h / 2);
    if (this.exploded) {
      contexto.globalAlpha = 1 - this.explodeTimer / PROJECTILE.PENGUIN_BOMB_BLAST_FRAMES;
      contexto.fillStyle = estiloVisual.preenchimento1;
      contexto.beginPath();
      contexto.arc(0, 0, this.explodeRadius, 0, Math.PI * 2);
      contexto.fill();
      contexto.fillStyle = estiloVisual.preenchimento2;
      contexto.beginPath();
      contexto.arc(0, 0, this.explodeRadius * 0.58, 0, Math.PI * 2);
      contexto.fill();
    } else {
      contexto.rotate(Math.sin(this.pulse) * 0.08);
      contexto.fillStyle = estiloVisual.preenchimento3;
      contexto.fillRect(-9, 9, 7, 4);
      contexto.fillRect(2, 9, 7, 4);
      contexto.fillStyle = estiloVisual.preenchimento4;
      contexto.strokeStyle = estiloVisual.contorno5;
      contexto.lineWidth = 1;
      contexto.beginPath();
      contexto.ellipse(0, 0, 9, 12, 0, 0, Math.PI * 2);
      contexto.fill();
      contexto.stroke();
      contexto.fillStyle = estiloVisual.preenchimento6;
      contexto.beginPath();
      contexto.ellipse(0, 3, 5.5, 7, 0, 0, Math.PI * 2);
      contexto.fill();
      contexto.fillStyle = estiloVisual.preenchimento7;
      contexto.fillRect(-5, -7, 3, 3);
      contexto.fillRect(2, -7, 3, 3);
      contexto.fillStyle = estiloVisual.preenchimento3;
      contexto.beginPath();
      contexto.moveTo(-3, -3);
      contexto.lineTo(3, -3);
      contexto.lineTo(0, 1);
      contexto.closePath();
      contexto.fill();
      contexto.fillStyle = estiloVisual.preenchimento9;
      contexto.fillRect(-4, 1, 8, 3);
      contexto.fillStyle = this.lifetime < 30 ? estiloVisual.gradiente10 : estiloVisual.gradiente11;
      contexto.fillRect(-2, -15, 4, 4);
    }
    contexto.restore();

}
