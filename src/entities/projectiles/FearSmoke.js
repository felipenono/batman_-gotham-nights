// Este arquivo cuida de controlar a fumaça de medo.
import { APARENCIA } from "../../config/configuracao.js";

// ===== DEPENDÊNCIAS E CONFIGURAÇÕES =====
import { Projectile } from "./Projectile.js";
const estiloVisual = APARENCIA.FearSmoke;
// ===== COMPORTAMENTO =====
export class FearSmoke extends Projectile {
  // Recebe as dependências e prepara o estado inicial deste componente.
  constructor(posicaoX, posicaoY, velocidadeX, velocidadeY) {
    super({
      x: posicaoX,
      y: posicaoY,
      w: 30,
      h: 30,
      vx: velocidadeX,
      vy: velocidadeY,
      damage: 1,
      lifetime: 240,
      owner: "villain"
    });
    this.pulse = Math.random() * Math.PI * 2;
    this.drift = 0;
  }
  // Recebe a atualização atual e avança o estado, sem redesenhar a tela.
  update(passoTempo = 1, mundo = null) {
    this.pulse += 0.08 * passoTempo;
    this.drift += 0.04 * passoTempo;
    this.y += Math.sin(this.drift) * 0.8 * passoTempo;
    super.update(passoTempo, mundo);
  }
  // Recebe o contexto 2D e desenha o estado atual sem avançar o tempo.
  draw(contexto) {
    if (!this.alive) return;
    contexto.save();
    contexto.translate(this.x + this.w / 2, this.y + this.h / 2);
    const radius = 14 + Math.sin(this.pulse) * 3;
    contexto.shadowColor = estiloVisual.brilho1;
    contexto.shadowBlur = 10;
    contexto.fillStyle = estiloVisual.preenchimento2;
    contexto.beginPath();
    contexto.arc(0, 0, radius + 4, 0, Math.PI * 2);
    contexto.fill();
    contexto.shadowBlur = 0;
    contexto.fillStyle = estiloVisual.preenchimento3;
    const puffs = 5;
    for (let indiceItem = 0; indiceItem < puffs; indiceItem++) {
      const angulo = indiceItem * (Math.PI * 2 / puffs) + this.pulse;
      const px = Math.cos(angulo) * (radius * 0.55);
      const py = Math.sin(angulo) * (radius * 0.55);
      contexto.beginPath();
      contexto.arc(px, py, radius * 0.48, 0, Math.PI * 2);
      contexto.fill();
    }
    contexto.fillStyle = estiloVisual.preenchimento4;
    contexto.beginPath();
    contexto.arc(0, 0, radius * 0.4, 0, Math.PI * 2);
    contexto.fill();
    contexto.fillStyle = estiloVisual.preenchimento5;
    contexto.beginPath();
    contexto.arc(-4, -2, 1.8, 0, Math.PI * 2);
    contexto.arc(4, -2, 1.8, 0, Math.PI * 2);
    contexto.fill();
    contexto.restore();
  }
}
