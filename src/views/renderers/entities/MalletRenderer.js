// Este arquivo cuida de mover e desenhar a marreta.
import { APARENCIA } from "../../../config/configuracao.js";

// ===== DEPENDÊNCIAS E CONFIGURAÇÕES =====
const estiloVisual = APARENCIA.Mallet;
// ===== COMPORTAMENTO =====
export function drawMallet(contexto) {
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
