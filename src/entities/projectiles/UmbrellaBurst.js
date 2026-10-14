// Este arquivo cuida de compartilhar a perseguição dos projéteis do Pinguim.
import { APARENCIA } from "../../config/configuracao.js";

// ===== DEPENDÊNCIAS E CONFIGURAÇÕES =====
import { Projectile } from "./Projectile.js";
import { PROJECTILE } from "../../config/configuracao.js";
const estiloVisual = APARENCIA.UmbrellaBurst;
// ===== COMPORTAMENTO =====
export class UmbrellaBurst extends Projectile {
  // Recebe as dependências e prepara o estado inicial deste componente.
  constructor(posicaoX, posicaoY, velocidadeX, velocidadeY, alvo = null) {
    super({
      x: posicaoX,
      y: posicaoY,
      w: 20,
      h: 12,
      vx: velocidadeX,
      vy: velocidadeY,
      damage: 1,
      lifetime: 150,
      owner: "villain"
    });
    this.speed = PROJECTILE.UMBRELLA_SPEED;
    this.pulse = 0;
    this.target = alvo;
    this.trackingRemaining = PROJECTILE.UMBRELLA_TRACKING_FRAMES;
  }
  // Recebe a atualização atual e avança o estado, sem redesenhar a tela.
  update(passoTempo = 1, mundo = null) {
    if (!this.alive) return;
    if (this.trackingRemaining > 0 && this.target?.alive) {
      const dx = this.target.x + this.target.w / 2 - (this.x + this.w / 2);
      const dy = this.target.y + this.target.h / 2 - (this.y + this.h / 2);
      if (Math.hypot(dx, dy) > 0.001) {
        const heading = Math.atan2(this.vy, this.vx);
        const difference = Math.atan2(Math.sin(Math.atan2(dy, dx) - heading), Math.cos(Math.atan2(dy, dx) - heading));
        const maxTurn = PROJECTILE.UMBRELLA_TURN_RATE * Math.min(passoTempo, this.trackingRemaining);
        const angulo = heading + Math.max(-maxTurn, Math.min(maxTurn, difference));
        const velocidade = Math.hypot(this.vx, this.vy) || this.speed;
        this.vx = Math.cos(angulo) * velocidade;
        this.vy = Math.sin(angulo) * velocidade;
      }
    }
    this.trackingRemaining = Math.max(0, this.trackingRemaining - passoTempo);
    this.pulse += 0.25 * passoTempo;
    super.update(passoTempo, mundo);
  }
  // Recebe o contexto 2D e desenha o estado atual sem avançar o tempo.
  draw(contexto) {
    if (!this.alive) return;
    contexto.save();
    contexto.translate(this.x + this.w / 2, this.y + this.h / 2);
    contexto.rotate(Math.atan2(this.vy, this.vx));
    contexto.shadowColor = estiloVisual.brilho1;
    contexto.shadowBlur = 10;
    contexto.fillStyle = estiloVisual.preenchimento2;
    contexto.beginPath();
    contexto.ellipse(0, 0, 12, 6, 0, 0, Math.PI * 2);
    contexto.fill();
    contexto.fillStyle = estiloVisual.preenchimento3;
    contexto.beginPath();
    contexto.ellipse(1, 0, 8, 3.5, 0, 0, Math.PI * 2);
    contexto.fill();
    contexto.shadowBlur = 0;
    contexto.fillStyle = estiloVisual.preenchimento4;
    contexto.beginPath();
    contexto.ellipse(3, 0, 4, 2, 0, 0, Math.PI * 2);
    contexto.fill();
    contexto.strokeStyle = estiloVisual.contorno5;
    contexto.lineWidth = 1.5;
    contexto.beginPath();
    contexto.moveTo(-10, 0);
    contexto.lineTo(-16, Math.sin(this.pulse * 2) * 4);
    contexto.lineTo(-22, -Math.sin(this.pulse * 2) * 3);
    contexto.stroke();
    contexto.restore();
  }
}
