// Este arquivo cuida de desenhar a alternativa vetorial de scarecrow.
import { APARENCIA } from "../../../config/configuracao.js";
const estiloVisual = APARENCIA.scarecrow;

// ===== DEPENDÊNCIAS E CONFIGURAÇÕES =====
export const scarecrow = {
  width: 60,
  height: 110,
  // Desenha a alternativa vetorial quando a imagem do personagem não está disponível.
  paint(contexto) {
    if (!this.alive) return;
    contexto.save();
    contexto.translate(this.x + this.w / 2, this.y + this.h);
    contexto.scale(this.facing, 1);
    const hoverSway = Math.sin(this.floatCycle * 2) * 2;
    const robeBaseY = -18;
    contexto.fillStyle = estiloVisual.preenchimento1;
    contexto.beginPath();
    contexto.moveTo(-22, robeBaseY - 50);
    contexto.lineTo(22, robeBaseY - 50);
    contexto.lineTo(26, robeBaseY);
    contexto.lineTo(18, robeBaseY - 6);
    contexto.lineTo(10, robeBaseY + 2);
    contexto.lineTo(0, robeBaseY - 4);
    contexto.lineTo(-10, robeBaseY + 2);
    contexto.lineTo(-18, robeBaseY - 6);
    contexto.lineTo(-26, robeBaseY);
    contexto.closePath();
    contexto.fill();
    contexto.fillStyle = estiloVisual.preenchimento2;
    contexto.fillRect(-14, robeBaseY - 40, 10, 12);
    contexto.strokeStyle = estiloVisual.contorno3;
    contexto.lineWidth = 1;
    contexto.strokeRect(-14, robeBaseY - 40, 10, 12);
    contexto.fillStyle = estiloVisual.preenchimento4;
    contexto.fillRect(-14, -14, 10, 14);
    contexto.fillRect(4, -14, 10, 14);
    const beltY = robeBaseY - 44;
    contexto.strokeStyle = estiloVisual.contorno5;
    contexto.lineWidth = 3.5;
    contexto.beginPath();
    contexto.moveTo(-20, beltY);
    contexto.lineTo(20, beltY);
    contexto.stroke();
    contexto.beginPath();
    contexto.moveTo(4, beltY);
    contexto.lineTo(6, beltY + 16);
    contexto.stroke();
    contexto.fillStyle = estiloVisual.preenchimento6;
    if (this.isAttacking) {
      contexto.fillRect(14, beltY - 24, 28, 12);
      contexto.fillStyle = estiloVisual.preenchimento7;
      contexto.fillRect(38, beltY - 26, 6, 3);
      contexto.fillRect(40, beltY - 14, 8, 3);
      contexto.fillStyle = estiloVisual.preenchimento8;
      contexto.fillRect(42, beltY - 22, 6, 2);
      contexto.fillRect(42, beltY - 18, 6, 2);
      contexto.fillRect(42, beltY - 14, 6, 2);
    } else {
      contexto.fillRect(16, beltY - 24, 12, 28);
      contexto.fillStyle = estiloVisual.preenchimento7;
      contexto.fillRect(18, beltY + 4, 3, 8);
      contexto.fillRect(22, beltY + 4, 3, 8);
    }
    const headY = beltY - 34;
    contexto.fillStyle = estiloVisual.preenchimento10;
    contexto.beginPath();
    contexto.roundRect(-16, headY - 10, 32, 34, 10);
    contexto.fill();
    contexto.strokeStyle = estiloVisual.contorno3;
    contexto.lineWidth = 2.4;
    contexto.beginPath();
    contexto.moveTo(-11, headY - 4);
    contexto.lineTo(-5, headY + 2);
    contexto.moveTo(-5, headY - 4);
    contexto.lineTo(-11, headY + 2);
    contexto.stroke();
    contexto.beginPath();
    contexto.moveTo(5, headY - 4);
    contexto.lineTo(11, headY + 2);
    contexto.moveTo(11, headY - 4);
    contexto.lineTo(5, headY + 2);
    contexto.stroke();
    contexto.lineWidth = 2;
    contexto.beginPath();
    contexto.moveTo(-12, headY + 14);
    contexto.lineTo(12, headY + 14);
    contexto.stroke();
    for (let escalaLocal = -10; escalaLocal <= 10; escalaLocal += 4) {
      contexto.beginPath();
      contexto.moveTo(escalaLocal, headY + 11);
      contexto.lineTo(escalaLocal, headY + 17);
      contexto.stroke();
    }
    const hatY = headY - 14;
    contexto.fillStyle = estiloVisual.preenchimento12;
    contexto.fillRect(-22, hatY + 6, 6, 3);
    contexto.fillRect(18, hatY + 6, 5, 3);
    contexto.fillStyle = estiloVisual.preenchimento13;
    contexto.beginPath();
    contexto.ellipse(0, hatY + 4, 32, 7, 0, 0, Math.PI * 2);
    contexto.fill();
    contexto.beginPath();
    contexto.moveTo(-16, hatY + 4);
    contexto.lineTo(-4, hatY - 26);
    contexto.lineTo(6, hatY - 24);
    contexto.lineTo(16, hatY + 4);
    contexto.closePath();
    contexto.fill();
    contexto.strokeStyle = estiloVisual.contorno5;
    contexto.lineWidth = 3;
    contexto.beginPath();
    contexto.moveTo(-15, hatY + 2);
    contexto.lineTo(15, hatY + 2);
    contexto.stroke();
    if (this.hurtFlash > 0) {
      contexto.fillStyle = estiloVisual.preenchimento15;
      contexto.beginPath();
      contexto.roundRect(-24, -110, 48, 110, 6);
      contexto.fill();
    }
    contexto.restore();
  }
};
