// Este arquivo cuida de desenhar a alternativa vetorial de two_face.
import { APARENCIA } from "../../../config/configuracao.js";
const estiloVisual = APARENCIA.two_face;

// ===== DEPENDÊNCIAS E CONFIGURAÇÕES =====
export const two_face = {
  width: 40,
  height: 80,
  // Desenha a alternativa vetorial quando a imagem do personagem não está disponível.
  paint(contexto) {
    if (!this.alive) return;
    contexto.save();
    contexto.translate(this.x + this.w / 2, this.y + this.h);
    contexto.scale(this.facing, 1);
    const isWalking = Math.abs(this.vx) > 0.2;
    const legOffset = isWalking ? Math.sin(this.stride * 3) * 8 : 0;
    const breathe = Math.sin(this.stride * 1.5) * 1.5;
    contexto.fillStyle = estiloVisual.preenchimento1;
    contexto.fillRect(-14 - legOffset * 0.4, -26, 11, 16);
    contexto.fillStyle = estiloVisual.preenchimento2;
    contexto.fillRect(-16 - legOffset * 0.4, -10, 13, 10);
    contexto.fillStyle = estiloVisual.preenchimento3;
    contexto.fillRect(3 + legOffset * 0.4, -26, 11, 16);
    contexto.fillStyle = estiloVisual.preenchimento4;
    contexto.fillRect(2 + legOffset * 0.4, -10, 14, 10);
    const torsoY = -56 + breathe;
    contexto.fillStyle = estiloVisual.preenchimento5;
    contexto.fillRect(-16, torsoY + 8, 16, 26);
    contexto.fillStyle = estiloVisual.preenchimento3;
    contexto.fillRect(0, torsoY + 8, 16, 26);
    contexto.fillStyle = estiloVisual.preenchimento7;
    contexto.fillRect(-4, torsoY + 8, 8, 14);
    contexto.fillStyle = estiloVisual.preenchimento8;
    contexto.fillRect(-4, torsoY + 10, 4, 14);
    contexto.fillStyle = estiloVisual.preenchimento9;
    contexto.fillRect(0, torsoY + 10, 4, 14);
    contexto.fillStyle = estiloVisual.preenchimento1;
    contexto.fillRect(-20, torsoY + 8, 6, 18);
    contexto.fillStyle = estiloVisual.preenchimento3;
    if (this.isAttacking) {
      contexto.fillRect(8, torsoY + 10, 16, 6);
      contexto.fillStyle = estiloVisual.preenchimento12;
      contexto.fillRect(20, torsoY + 8, 12, 6);
      contexto.fillRect(20, torsoY + 14, 4, 6);
      contexto.fillStyle = estiloVisual.preenchimento13;
      contexto.fillRect(32, torsoY + 9, 4, 4);
    } else {
      contexto.fillRect(10, torsoY + 8, 7, 18);
      contexto.fillStyle = estiloVisual.preenchimento12;
      contexto.fillRect(10, torsoY + 24, 7, 6);
    }
    const headY = torsoY - 18;
    contexto.fillStyle = estiloVisual.preenchimento15;
    contexto.beginPath();
    contexto.arc(0, headY + 8, 12, Math.PI * 0.5, Math.PI * 1.5, false);
    contexto.fill();
    contexto.fillStyle = estiloVisual.preenchimento16;
    contexto.beginPath();
    contexto.arc(0, headY + 8, 12, Math.PI * 1.5, Math.PI * 0.5, false);
    contexto.fill();
    contexto.fillStyle = estiloVisual.preenchimento17;
    contexto.beginPath();
    contexto.arc(-1, headY - 1, 11, Math.PI * 0.7, Math.PI * 1.5, false);
    contexto.fill();
    contexto.fillStyle = estiloVisual.preenchimento2;
    contexto.beginPath();
    contexto.arc(2, headY - 1, 12, Math.PI * 1.5, Math.PI * 0.3, false);
    contexto.fill();
    contexto.fillStyle = estiloVisual.preenchimento8;
    contexto.fillRect(-8, headY + 6, 4, 3);
    contexto.fillStyle = estiloVisual.preenchimento17;
    contexto.fillRect(-9, headY + 3, 6, 2);
    contexto.fillStyle = estiloVisual.preenchimento21;
    contexto.beginPath();
    contexto.arc(6, headY + 7, 4.5, 0, Math.PI * 2);
    contexto.fill();
    contexto.fillStyle = estiloVisual.preenchimento5;
    contexto.beginPath();
    contexto.arc(6, headY + 7, 1.8, 0, Math.PI * 2);
    contexto.fill();
    contexto.strokeStyle = estiloVisual.contorno23;
    contexto.lineWidth = 1.2;
    contexto.beginPath();
    contexto.moveTo(-6, headY + 15);
    contexto.lineTo(0, headY + 15);
    contexto.stroke();
    contexto.fillStyle = estiloVisual.preenchimento5;
    contexto.fillRect(1, headY + 13, 8, 4);
    contexto.strokeStyle = estiloVisual.contorno25;
    contexto.lineWidth = 0.8;
    contexto.strokeRect(1, headY + 13, 8, 4);
    if (this.coinFlipping) {
      const flipY = headY - 24 - Math.sin(this.coinFlipTimer / 35 * Math.PI) * 16;
      contexto.shadowColor = estiloVisual.brilho26;
      contexto.shadowBlur = 8;
      contexto.fillStyle = estiloVisual.preenchimento13;
      contexto.beginPath();
      contexto.arc(0, flipY, 7, 0, Math.PI * 2);
      contexto.fill();
      contexto.shadowBlur = 0;
      contexto.fillStyle = this.nextAttackIsBullets ? estiloVisual.gradiente28 : estiloVisual.preenchimento9;
      contexto.font = estiloVisual.fonte1;
      contexto.textAlign = "center";
      contexto.textBaseline = "middle";
      contexto.fillText(this.nextAttackIsBullets ? "C" : "R", 0, flipY);
    }
    if (this.hurtFlash > 0) {
      contexto.fillStyle = estiloVisual.preenchimento30;
      contexto.beginPath();
      contexto.roundRect(-22, -80, 44, 80, 5);
      contexto.fill();
    }
    contexto.restore();
  }
};
