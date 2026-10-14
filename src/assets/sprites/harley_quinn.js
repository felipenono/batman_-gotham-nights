// Este arquivo cuida de desenhar a alternativa vetorial de harley_quinn.
import { APARENCIA } from "../../config/configuracao.js";
const estiloVisual = APARENCIA.harley_quinn;

// ===== DEPENDÊNCIAS E CONFIGURAÇÕES =====
export const harley_quinn = {
  width: 38,
  height: 72,
  // Desenha a alternativa vetorial quando a imagem do personagem não está disponível.
  paint(contexto) {
    if (!this.alive) return;
    contexto.save();
    contexto.translate(this.x + this.w / 2, this.y + this.h);
    if (this.isCartwheeling) {
      contexto.rotate(this.cartwheelAngle);
    } else {
      contexto.scale(this.facing, 1);
    }
    const isMoving = Math.abs(this.vx) > 0.2;
    const legOffset = isMoving ? Math.sin(this.acrobatTime * 4) * 8 : 0;
    const bounce = Math.sin(this.acrobatTime * 2) * 1.5;
    contexto.fillStyle = estiloVisual.preenchimento1;
    contexto.fillRect(-12 - legOffset * 0.4, -22, 9, 14);
    contexto.fillStyle = estiloVisual.preenchimento2;
    contexto.fillRect(-14 - legOffset * 0.4, -8, 11, 8);
    contexto.fillStyle = estiloVisual.preenchimento3;
    contexto.beginPath();
    contexto.arc(-13 - legOffset * 0.4, -8, 2.5, 0, Math.PI * 2);
    contexto.fill();
    contexto.fillStyle = estiloVisual.preenchimento2;
    contexto.fillRect(3 + legOffset * 0.4, -22, 9, 14);
    contexto.fillStyle = estiloVisual.preenchimento1;
    contexto.fillRect(3 + legOffset * 0.4, -8, 12, 8);
    contexto.fillStyle = estiloVisual.preenchimento3;
    contexto.beginPath();
    contexto.arc(14 + legOffset * 0.4, -8, 2.5, 0, Math.PI * 2);
    contexto.fill();
    const torsoY = -48 + bounce;
    contexto.fillStyle = estiloVisual.preenchimento1;
    contexto.fillRect(-14, torsoY + 8, 14, 22);
    contexto.fillStyle = estiloVisual.preenchimento2;
    contexto.fillRect(0, torsoY + 8, 14, 22);
    contexto.fillStyle = estiloVisual.preenchimento2;
    contexto.beginPath();
    contexto.moveTo(-7, torsoY + 11);
    contexto.lineTo(-3, torsoY + 16);
    contexto.lineTo(-7, torsoY + 21);
    contexto.lineTo(-11, torsoY + 16);
    contexto.closePath();
    contexto.fill();
    contexto.fillStyle = estiloVisual.preenchimento1;
    contexto.beginPath();
    contexto.moveTo(7, torsoY + 11);
    contexto.lineTo(11, torsoY + 16);
    contexto.lineTo(7, torsoY + 21);
    contexto.lineTo(3, torsoY + 16);
    contexto.closePath();
    contexto.fill();
    contexto.fillStyle = estiloVisual.preenchimento11;
    for (let parametrosLocais = -14; parametrosLocais <= 10; parametrosLocais += 6) {
      contexto.beginPath();
      contexto.arc(parametrosLocais + 3, torsoY + 8, 3.5, 0, Math.PI * 2);
      contexto.fill();
    }
    contexto.fillStyle = estiloVisual.preenchimento1;
    if (this.isAttacking) {
      contexto.fillRect(6, torsoY + 10, 16, 5);
      contexto.fillStyle = estiloVisual.preenchimento13;
      contexto.fillRect(20, torsoY + 7, 9, 6);
      contexto.fillRect(19, torsoY + 13, 3, 5);
      contexto.fillStyle = estiloVisual.preenchimento14;
      contexto.fillRect(29, torsoY + 8, 3, 4);
    } else {
      contexto.fillRect(8, torsoY + 10, 6, 16);
      contexto.fillStyle = estiloVisual.preenchimento15;
      contexto.fillRect(-16, torsoY - 8, 4, 30);
      contexto.fillStyle = estiloVisual.preenchimento16;
      contexto.fillRect(-24, torsoY - 20, 20, 14);
      contexto.strokeStyle = estiloVisual.contorno17;
      contexto.lineWidth = 1.5;
      contexto.strokeRect(-24, torsoY - 20, 20, 14);
    }
    const headY = torsoY - 14;
    contexto.fillStyle = estiloVisual.preenchimento11;
    contexto.beginPath();
    contexto.roundRect(-9, headY + 2, 18, 18, 5);
    contexto.fill();
    contexto.fillStyle = estiloVisual.preenchimento2;
    contexto.beginPath();
    contexto.roundRect(-8, headY + 5, 16, 6, 2);
    contexto.fill();
    contexto.fillStyle = estiloVisual.preenchimento20;
    contexto.fillRect(-5, headY + 6, 3, 3);
    contexto.fillRect(3, headY + 6, 3, 3);
    contexto.strokeStyle = estiloVisual.preenchimento1;
    contexto.lineWidth = 1.6;
    contexto.beginPath();
    contexto.arc(0, headY + 13, 5, 0.1 * Math.PI, 0.9 * Math.PI);
    contexto.stroke();
    contexto.fillStyle = estiloVisual.preenchimento1;
    contexto.beginPath();
    contexto.moveTo(-8, headY + 4);
    contexto.quadraticCurveTo(-16, headY - 12, -22, headY - 2);
    contexto.lineTo(-14, headY - 1);
    contexto.closePath();
    contexto.fill();
    contexto.fillStyle = estiloVisual.preenchimento3;
    contexto.beginPath();
    contexto.arc(-22, headY - 2, 3, 0, Math.PI * 2);
    contexto.fill();
    contexto.fillStyle = estiloVisual.preenchimento2;
    contexto.beginPath();
    contexto.moveTo(8, headY + 4);
    contexto.quadraticCurveTo(16, headY - 12, 22, headY - 2);
    contexto.lineTo(14, headY - 1);
    contexto.closePath();
    contexto.fill();
    contexto.fillStyle = estiloVisual.preenchimento3;
    contexto.beginPath();
    contexto.arc(22, headY - 2, 3, 0, Math.PI * 2);
    contexto.fill();
    contexto.fillStyle = estiloVisual.preenchimento26;
    contexto.fillRect(-6, headY + 2, 5, 3);
    contexto.fillRect(1, headY + 2, 5, 3);
    if (this.hurtFlash > 0) {
      contexto.fillStyle = estiloVisual.preenchimento27;
      contexto.beginPath();
      contexto.roundRect(-20, -72, 40, 72, 5);
      contexto.fill();
    }
    contexto.restore();
  }
};
