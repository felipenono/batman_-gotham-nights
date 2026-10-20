// Este arquivo cuida de compartilhar a perseguição dos projéteis do Pinguim.
import { APARENCIA } from "../../../config/configuracao.js";

// ===== DEPENDÊNCIAS E CONFIGURAÇÕES =====
const estiloVisual = APARENCIA.UmbrellaBurst;
// ===== COMPORTAMENTO =====
export function drawUmbrellaBurst(contexto) {
    if (!this.alive) return;
    contexto.save();
    contexto.translate(this.x + this.w / 2, this.y + this.h / 2);
    contexto.rotate(Math.atan2(this.vy, this.vx));
    contexto.shadowColor = estiloVisual.brilho1;
    contexto.shadowBlur = 10;
    contexto.fillStyle = estiloVisual.preenchimento2;
    contexto.beginPath();
    contexto.ellipse(0, 0, 12, 6, 0, 0, Math.PI * 2);
    contexto.fill();
    contexto.fillStyle = estiloVisual.preenchimento3;
    contexto.beginPath();
    contexto.ellipse(1, 0, 8, 3.5, 0, 0, Math.PI * 2);
    contexto.fill();
    contexto.shadowBlur = 0;
    contexto.fillStyle = estiloVisual.preenchimento4;
    contexto.beginPath();
    contexto.ellipse(3, 0, 4, 2, 0, 0, Math.PI * 2);
    contexto.fill();
    contexto.strokeStyle = estiloVisual.contorno5;
    contexto.lineWidth = 1.5;
    contexto.beginPath();
    contexto.moveTo(-10, 0);
    contexto.lineTo(-16, Math.sin(this.pulse * 2) * 4);
    contexto.lineTo(-22, -Math.sin(this.pulse * 2) * 3);
    contexto.stroke();
    contexto.restore();

}
