// Este arquivo cuida de compartilhar a perseguição dos projéteis do Pinguim.

// ===== DEPENDÊNCIAS E CONFIGURAÇÕES =====
import { Projectile } from "./Projectile.js";
import { PROJECTILE } from "../../../config/configuracao.js";
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

}
