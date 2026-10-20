// Este arquivo cuida de resolver ataques, danos e partículas.
import { APARENCIA } from "../../config/configuracao.js";
const estiloVisual = APARENCIA.CombatSystem;

// ===== DEPENDÊNCIAS E CONFIGURAÇÕES =====
// ===== COMPORTAMENTO =====
export function drawCombat(contexto, canvasWidth = 900, canvasHeight = 500) {
    contexto.save();
    for (const elemento of this.particles) {
      contexto.globalAlpha = elemento.alpha;
      contexto.fillStyle = elemento.color;
      contexto.beginPath();
      contexto.arc(elemento.x, elemento.y, elemento.size, 0, Math.PI * 2);
      contexto.fill();
    }
    contexto.restore();
    if (this.redFlashAlpha > 0.01) {
      contexto.save();
      contexto.fillStyle = `rgba(239, 68, 68, ${this.redFlashAlpha})`;
      contexto.fillRect(0, 0, canvasWidth, canvasHeight);
      contexto.restore();
    }

}
