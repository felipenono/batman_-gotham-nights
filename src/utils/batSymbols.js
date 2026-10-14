// Este arquivo cuida de desenhar o batarangue e os ícones de vida.
import { APARENCIA } from "../config/configuracao.js";

// ===== DEPENDÊNCIAS E CONFIGURAÇÕES =====
import { drawAsset } from "../assets/sprites/referenceSprites.js";
const estiloVisual = APARENCIA.batSymbols;
export function drawBatarang(contexto, posicaoX = 0, posicaoY = 0, size = 1, active = true) {
  contexto.save();
  contexto.translate(posicaoX, posicaoY);
  contexto.scale(size, size);
  const cor = active ? size < 1 ? estiloVisual.gradiente1 : null : estiloVisual.gradiente2;
  if (drawAsset(contexto, "batarang", 24, 11, cor)) {
    contexto.restore();
    return;
  }
  contexto.fillStyle = active ? estiloVisual.gradiente3 : estiloVisual.gradiente4;
  contexto.strokeStyle = active ? estiloVisual.gradiente5 : estiloVisual.gradiente2;
  contexto.lineWidth = 1;
  contexto.beginPath();
  contexto.moveTo(0, -3);
  contexto.lineTo(4, -6);
  contexto.lineTo(5, -1);
  contexto.lineTo(15, -8);
  contexto.lineTo(11, 1);
  contexto.lineTo(5, 3);
  contexto.lineTo(0, 6);
  contexto.lineTo(-5, 3);
  contexto.lineTo(-11, 1);
  contexto.lineTo(-15, -8);
  contexto.lineTo(-5, -1);
  contexto.lineTo(-4, -6);
  contexto.closePath();
  contexto.fill();
  contexto.stroke();
  contexto.fillStyle = active ? estiloVisual.gradiente7 : estiloVisual.gradiente8;
  contexto.fillRect(-2, -1, 4, 3);
  contexto.restore();
}
