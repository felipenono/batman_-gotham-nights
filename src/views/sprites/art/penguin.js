// Este arquivo cuida de desenhar a alternativa vetorial de penguin.
import { APARENCIA } from "../../../config/configuracao.js";
const estiloVisual = APARENCIA.penguin;

// ===== DEPENDÊNCIAS E CONFIGURAÇÕES =====
export const penguin = {
  width: 40,
  height: 60,
  // Desenha a alternativa vetorial quando a imagem do personagem não está disponível.
  paint(contexto) {
    if (!this.alive) return;
    contexto.save();
    contexto.translate(this.x + this.w / 2, this.y + this.h);
    contexto.scale(this.facing, 1);
    const isWalking = Math.abs(this.vx) > 0.1;
    const waddleTilt = isWalking ? Math.sin(this.waddleTime * 3) * 0.12 : 0;
    contexto.rotate(waddleTilt);
    const legOffset = isWalking ? Math.sin(this.waddleTime * 3) * 6 : 0;
    contexto.fillStyle = estiloVisual.preenchimento1;
    contexto.fillRect(-12 - legOffset * 0.4, -14, 8, 8);
    contexto.fillRect(4 + legOffset * 0.4, -14, 8, 8);
    contexto.fillStyle = estiloVisual.preenchimento2;
    contexto.fillRect(-14 - legOffset * 0.4, -6, 11, 6);
    contexto.fillRect(3 + legOffset * 0.4, -6, 12, 6);
    const bodyY = -42;
    contexto.fillStyle = estiloVisual.preenchimento3;
    contexto.beginPath();
    contexto.ellipse(0, bodyY + 16, 18, 16, 0, 0, Math.PI * 2);
    contexto.fill();
    contexto.fillStyle = estiloVisual.preenchimento4;
    contexto.beginPath();
    contexto.moveTo(-16, bodyY + 16);
    contexto.lineTo(-22, bodyY + 34);
    contexto.lineTo(-10, bodyY + 28);
    contexto.fill();
    contexto.fillStyle = estiloVisual.preenchimento5;
    contexto.beginPath();
    contexto.ellipse(3, bodyY + 16, 12, 14, 0, 0, Math.PI * 2);
    contexto.fill();
    contexto.fillStyle = estiloVisual.preenchimento6;
    contexto.fillRect(3, bodyY + 10, 2, 2);
    contexto.fillRect(3, bodyY + 16, 2, 2);
    contexto.fillRect(3, bodyY + 22, 2, 2);
    contexto.fillStyle = estiloVisual.preenchimento7;
    contexto.beginPath();
    contexto.moveTo(0, bodyY + 4);
    contexto.lineTo(-4, bodyY + 2);
    contexto.lineTo(-4, bodyY + 6);
    contexto.moveTo(0, bodyY + 4);
    contexto.lineTo(4, bodyY + 2);
    contexto.lineTo(4, bodyY + 6);
    contexto.fill();
    const headY = bodyY - 10;
    contexto.fillStyle = estiloVisual.preenchimento8;
    contexto.beginPath();
    contexto.ellipse(2, headY + 4, 11, 10, 0, 0, Math.PI * 2);
    contexto.fill();
    contexto.fillStyle = estiloVisual.preenchimento9;
    contexto.beginPath();
    contexto.moveTo(8, headY + 2);
    contexto.lineTo(19, headY + 6);
    contexto.lineTo(8, headY + 8);
    contexto.closePath();
    contexto.fill();
    contexto.fillStyle = estiloVisual.preenchimento4;
    contexto.fillRect(0, headY + 1, 3, 2);
    contexto.strokeStyle = estiloVisual.contorno11;
    contexto.lineWidth = 1.6;
    contexto.beginPath();
    contexto.arc(6, headY + 2, 4.5, 0, Math.PI * 2);
    contexto.stroke();
    contexto.fillStyle = estiloVisual.preenchimento12;
    contexto.beginPath();
    contexto.arc(6, headY + 2, 3.8, 0, Math.PI * 2);
    contexto.fill();
    contexto.strokeStyle = estiloVisual.contorno11;
    contexto.lineWidth = 0.8;
    contexto.beginPath();
    contexto.moveTo(6, headY + 6);
    contexto.quadraticCurveTo(2, bodyY + 6, 2, bodyY + 10);
    contexto.stroke();
    contexto.fillStyle = estiloVisual.preenchimento14;
    contexto.fillRect(8, headY + 9, 8, 2);
    contexto.fillStyle = estiloVisual.preenchimento15;
    contexto.fillRect(16, headY + 9, 2, 2);
    const hatY = headY - 6;
    contexto.fillStyle = estiloVisual.preenchimento4;
    contexto.beginPath();
    contexto.ellipse(0, hatY, 18, 4, 0, 0, Math.PI * 2);
    contexto.fill();
    contexto.fillStyle = estiloVisual.preenchimento3;
    contexto.fillRect(-10, hatY - 20, 20, 20);
    contexto.fillStyle = estiloVisual.preenchimento18;
    contexto.fillRect(-10, hatY - 6, 20, 5);
    if (this.isAttacking) {
      contexto.strokeStyle = estiloVisual.contorno19;
      contexto.lineWidth = 3;
      contexto.beginPath();
      contexto.moveTo(10, bodyY + 14);
      contexto.lineTo(34, bodyY + 14);
      contexto.stroke();
      contexto.fillStyle = estiloVisual.preenchimento20;
      contexto.fillRect(34, bodyY + 12, 4, 4);
    } else {
      // Held as walking cane
      contexto.strokeStyle = estiloVisual.contorno19;
      contexto.lineWidth = 2.5;
      contexto.beginPath();
      contexto.moveTo(12, bodyY + 12);
      contexto.lineTo(16, bodyY + 36);
      contexto.stroke();
      contexto.beginPath();
      contexto.arc(10, bodyY + 12, 3, Math.PI, 0, false);
      contexto.stroke();
    }
    if (this.hurtFlash > 0) {
      contexto.fillStyle = estiloVisual.preenchimento22;
      contexto.beginPath();
      contexto.roundRect(-20, -60, 40, 60, 4);
      contexto.fill();
    }
    if (this.hp < this.maxHp) {
      contexto.fillStyle = estiloVisual.preenchimento4;
      contexto.fillRect(-16, -68, 32, 5);
      contexto.fillStyle = estiloVisual.preenchimento24;
      contexto.fillRect(-16, -68, 32 * this.hpRatio, 5);
      contexto.strokeStyle = estiloVisual.preenchimento15;
      contexto.lineWidth = 0.8;
      contexto.strokeRect(-16, -68, 32, 5);
    }
    contexto.restore();
  }
};
