// Este arquivo cuida de controlar a sequência de chefões e suas apresentações.
import { APARENCIA } from "../../config/configuracao.js";

// ===== DEPENDÊNCIAS E CONFIGURAÇÕES =====
const estiloVisual = APARENCIA.BossManager;
// ===== COMPORTAMENTO =====
export function drawBossIntro(contexto, canvasWidth = 900, canvasHeight = 500) {
    if (this.introTimer <= 0 || !this.boss) return;
    contexto.save();
    const opacidade = Math.min(1, this.introTimer / 30);
    contexto.globalAlpha = opacidade;
    contexto.fillStyle = estiloVisual.preenchimento1;
    contexto.fillRect(0, canvasHeight / 2 - 45, canvasWidth, 90);
    contexto.strokeStyle = estiloVisual.contorno2;
    contexto.lineWidth = 2.5;
    contexto.beginPath();
    contexto.moveTo(0, canvasHeight / 2 - 45);
    contexto.lineTo(canvasWidth, canvasHeight / 2 - 45);
    contexto.moveTo(0, canvasHeight / 2 + 45);
    contexto.lineTo(canvasWidth, canvasHeight / 2 + 45);
    contexto.stroke();
    contexto.textAlign = "center";
    contexto.textBaseline = "middle";
    contexto.font = estiloVisual.fonte1;
    contexto.fillStyle = estiloVisual.preenchimento3;
    contexto.shadowColor = estiloVisual.brilho4;
    contexto.shadowBlur = 10;
    contexto.fillText(`ATENÇÃO: ${this.boss.name.toUpperCase()} CHEGOU!`, canvasWidth / 2, canvasHeight / 2);
    contexto.restore();

}
