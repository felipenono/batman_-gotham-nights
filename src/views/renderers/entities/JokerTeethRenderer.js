// Este arquivo cuida de controlar os dentes saltitantes.
import { APARENCIA } from "../../../config/configuracao.js";

// ===== DEPENDÊNCIAS E CONFIGURAÇÕES =====
const estiloVisual = APARENCIA.JokerTeeth;
// ===== COMPORTAMENTO =====
export function drawJokerTeeth(contexto) {
    if (!this.alive) return;
    contexto.save();
    contexto.translate(this.x + this.w / 2, this.y + this.h / 2);
    contexto.scale(this.vx >= 0 ? 1 : -1, 1);
    const jawOpen = Math.sin(this.chatterAngle) * 3;
    contexto.fillStyle = estiloVisual.preenchimento1;
    contexto.fillRect(-14, -3, 5, 2);
    contexto.beginPath();
    contexto.arc(-15, -2, 4, 0, Math.PI * 2);
    contexto.fill();
    contexto.fillStyle = estiloVisual.preenchimento2;
    contexto.beginPath();
    contexto.ellipse(0, -5 - jawOpen, 10, 5, 0, 0, Math.PI * 2);
    contexto.fill();
    contexto.fillStyle = estiloVisual.preenchimento3;
    for (let indiceItem = -7; indiceItem <= 7; indiceItem += 3.5) {
      contexto.beginPath();
      contexto.moveTo(indiceItem - 1.5, -4 - jawOpen);
      contexto.lineTo(indiceItem, 0 - jawOpen);
      contexto.lineTo(indiceItem + 1.5, -4 - jawOpen);
      contexto.fill();
    }
    contexto.fillStyle = estiloVisual.preenchimento4;
    contexto.beginPath();
    contexto.ellipse(0, 5 + jawOpen, 10, 5, 0, 0, Math.PI * 2);
    contexto.fill();
    contexto.fillStyle = estiloVisual.preenchimento3;
    for (let indiceItem = -7; indiceItem <= 7; indiceItem += 3.5) {
      contexto.beginPath();
      contexto.moveTo(indiceItem - 1.5, 4 + jawOpen);
      contexto.lineTo(indiceItem, 0 + jawOpen);
      contexto.lineTo(indiceItem + 1.5, 4 + jawOpen);
      contexto.fill();
    }
    contexto.fillStyle = estiloVisual.preenchimento6;
    contexto.beginPath();
    contexto.arc(3, jawOpen, 1.5, 0, Math.PI * 2);
    contexto.fill();
    contexto.restore();

}
