// Este arquivo cuida de controlar a fumaça de medo.
import { APARENCIA } from "../../../config/configuracao.js";

// ===== DEPENDÊNCIAS E CONFIGURAÇÕES =====
const estiloVisual = APARENCIA.FearSmoke;
// ===== COMPORTAMENTO =====
export function drawFearSmoke(contexto) {
    if (!this.alive) return;
    contexto.save();
    contexto.translate(this.x + this.w / 2, this.y + this.h / 2);
    const radius = 14 + Math.sin(this.pulse) * 3;
    contexto.shadowColor = estiloVisual.brilho1;
    contexto.shadowBlur = 10;
    contexto.fillStyle = estiloVisual.preenchimento2;
    contexto.beginPath();
    contexto.arc(0, 0, radius + 4, 0, Math.PI * 2);
    contexto.fill();
    contexto.shadowBlur = 0;
    contexto.fillStyle = estiloVisual.preenchimento3;
    const puffs = 5;
    for (let indiceItem = 0; indiceItem < puffs; indiceItem++) {
      const angulo = indiceItem * (Math.PI * 2 / puffs) + this.pulse;
      const px = Math.cos(angulo) * (radius * 0.55);
      const py = Math.sin(angulo) * (radius * 0.55);
      contexto.beginPath();
      contexto.arc(px, py, radius * 0.48, 0, Math.PI * 2);
      contexto.fill();
    }
    contexto.fillStyle = estiloVisual.preenchimento4;
    contexto.beginPath();
    contexto.arc(0, 0, radius * 0.4, 0, Math.PI * 2);
    contexto.fill();
    contexto.fillStyle = estiloVisual.preenchimento5;
    contexto.beginPath();
    contexto.arc(-4, -2, 1.8, 0, Math.PI * 2);
    contexto.arc(4, -2, 1.8, 0, Math.PI * 2);
    contexto.fill();
    contexto.restore();

}
