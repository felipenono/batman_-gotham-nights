// Este arquivo cuida de mover e desenhar as balas.
import { APARENCIA } from "../../../config/configuracao.js";

// ===== DEPENDÊNCIAS E CONFIGURAÇÕES =====
const estiloVisual = APARENCIA.Bullet;
// ===== COMPORTAMENTO =====
export function drawBullet(contexto) {
    if (!this.alive) return;
    contexto.save();
    contexto.translate(this.x + this.w / 2, this.y + this.h / 2);
    contexto.rotate(Math.atan2(this.vy, this.vx));
    const grad = contexto.createLinearGradient(-14, 0, 8, 0);
    grad.addColorStop(0, estiloVisual.gradiente1);
    grad.addColorStop(0.5, estiloVisual.gradiente2);
    grad.addColorStop(1, estiloVisual.gradiente3);
    contexto.fillStyle = grad;
    contexto.fillRect(-12, -2, 14, 4);
    contexto.shadowColor = estiloVisual.brilho4;
    contexto.shadowBlur = 6;
    contexto.fillStyle = estiloVisual.preenchimento5;
    contexto.beginPath();
    contexto.roundRect(-2, -3, 10, 6, 3);
    contexto.fill();
    contexto.shadowBlur = 0;
    contexto.fillStyle = estiloVisual.preenchimento6;
    contexto.beginPath();
    contexto.arc(6, 0, 2, 0, Math.PI * 2);
    contexto.fill();
    contexto.restore();

}
