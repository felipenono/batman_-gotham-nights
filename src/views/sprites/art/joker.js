// Este arquivo cuida de desenhar a alternativa vetorial de joker.
import { APARENCIA } from "../../../config/configuracao.js";
const estiloVisual = APARENCIA.joker;

// ===== DEPENDÊNCIAS E CONFIGURAÇÕES =====
export const joker = {
  width: 34,
  height: 70,
  // Desenha a alternativa vetorial quando a imagem do personagem não está disponível.
  paint(contexto) {
    if (!this.alive) return;
    contexto.save();
    contexto.translate(this.x + this.w / 2, this.y + this.h);
    contexto.scale(this.facing, 1);
    const isWalking = Math.abs(this.vx) > 0.2;
    const legOffset = isWalking ? Math.sin(this.wobble * 3) * 8 : 0;
    const breathe = Math.sin(this.wobble) * 1.5;
    contexto.fillStyle = estiloVisual.preenchimento1;
    contexto.fillRect(-12 - legOffset * 0.4, -22, 9, 14);
    contexto.fillRect(3 + legOffset * 0.4, -22, 9, 14);
    contexto.fillStyle = estiloVisual.preenchimento2;
    contexto.fillRect(-15 - legOffset * 0.4, -8, 12, 8);
    contexto.fillRect(3 + legOffset * 0.4, -8, 13, 8);
    const torsoY = -48 + breathe;
    contexto.fillStyle = estiloVisual.preenchimento3;
    contexto.beginPath();
    contexto.roundRect(-14, torsoY + 10, 28, 20, 3);
    contexto.fill();
    contexto.fillStyle = estiloVisual.preenchimento1;
    contexto.beginPath();
    contexto.moveTo(-12, torsoY + 22);
    contexto.lineTo(-16, torsoY + 34);
    contexto.lineTo(-8, torsoY + 28);
    contexto.fill();
    contexto.fillStyle = estiloVisual.preenchimento5;
    contexto.fillRect(-8, torsoY + 12, 16, 16);
    contexto.fillStyle = estiloVisual.preenchimento6;
    contexto.beginPath();
    contexto.moveTo(-6, torsoY + 12);
    contexto.lineTo(0, torsoY + 18);
    contexto.lineTo(6, torsoY + 12);
    contexto.fill();
    contexto.fillStyle = estiloVisual.preenchimento7;
    contexto.beginPath();
    contexto.moveTo(-6, torsoY + 11);
    contexto.lineTo(0, torsoY + 13);
    contexto.lineTo(-6, torsoY + 15);
    contexto.moveTo(6, torsoY + 11);
    contexto.lineTo(0, torsoY + 13);
    contexto.lineTo(6, torsoY + 15);
    contexto.fill();
    contexto.fillStyle = estiloVisual.preenchimento8;
    contexto.beginPath();
    contexto.arc(-10, torsoY + 15, 3, 0, Math.PI * 2);
    contexto.fill();
    contexto.fillStyle = estiloVisual.preenchimento3;
    if (this.isAttacking) {
      contexto.fillRect(6, torsoY + 11, 16, 6);
      contexto.fillStyle = estiloVisual.preenchimento10;
      contexto.fillRect(18, torsoY + 10, 7, 8);
    } else {
      contexto.fillRect(9, torsoY + 12, 7, 16);
      contexto.fillStyle = estiloVisual.preenchimento10;
      contexto.fillRect(9, torsoY + 24, 7, 6);
    }
    const headY = torsoY - 14;
    contexto.fillStyle = estiloVisual.preenchimento10;
    contexto.beginPath();
    contexto.roundRect(-10, headY, 20, 22, 6);
    contexto.fill();
    contexto.fillStyle = estiloVisual.preenchimento13;
    contexto.beginPath();
    contexto.moveTo(-13, headY + 6);
    contexto.quadraticCurveTo(-14, headY - 8, -6, headY - 10);
    contexto.lineTo(-2, headY - 14);
    contexto.lineTo(4, headY - 9);
    contexto.lineTo(10, headY - 12);
    contexto.quadraticCurveTo(14, headY - 6, 12, headY + 6);
    contexto.lineTo(8, headY + 2);
    contexto.lineTo(-10, headY + 2);
    contexto.closePath();
    contexto.fill();
    contexto.fillStyle = estiloVisual.preenchimento14;
    contexto.fillRect(-7, headY + 6, 5, 4);
    contexto.fillRect(2, headY + 6, 5, 4);
    contexto.fillStyle = estiloVisual.preenchimento15;
    contexto.fillRect(-6, headY + 7, 3, 2);
    contexto.fillRect(3, headY + 7, 3, 2);
    contexto.fillStyle = estiloVisual.preenchimento2;
    contexto.fillRect(-5, headY + 7, 1.5, 2);
    contexto.fillRect(4, headY + 7, 1.5, 2);
    contexto.strokeStyle = estiloVisual.preenchimento7;
    contexto.lineWidth = 2.5;
    contexto.beginPath();
    contexto.arc(0, headY + 12, 8, 0.1 * Math.PI, 0.9 * Math.PI, false);
    contexto.stroke();
    contexto.fillStyle = estiloVisual.preenchimento18;
    contexto.fillRect(-5, headY + 14, 10, 3);
    contexto.strokeStyle = estiloVisual.preenchimento7;
    contexto.lineWidth = 0.8;
    contexto.beginPath();
    for (let fracao = -4; fracao <= 4; fracao += 2) {
      contexto.moveTo(fracao, headY + 14);
      contexto.lineTo(fracao, headY + 17);
    }
    contexto.stroke();
    if (this.hurtFlash > 0) {
      contexto.fillStyle = estiloVisual.preenchimento20;
      contexto.beginPath();
      contexto.roundRect(-16, -72, 32, 72, 4);
      contexto.fill();
    }
    if (this.hp < this.maxHp) {
      contexto.fillStyle = estiloVisual.preenchimento2;
      contexto.fillRect(-16, -80, 32, 5);
      contexto.fillStyle = estiloVisual.preenchimento22;
      contexto.fillRect(-16, -80, 32 * this.hpRatio, 5);
      contexto.strokeStyle = estiloVisual.contorno23;
      contexto.lineWidth = 0.8;
      contexto.strokeRect(-16, -80, 32, 5);
    }
    contexto.restore();
  }
};
