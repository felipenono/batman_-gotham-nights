// Este arquivo cuida de controlar os dentes saltitantes.
import { APARENCIA } from "../../config/configuracao.js";

// ===== DEPENDÊNCIAS E CONFIGURAÇÕES =====
import { Projectile } from "./Projectile.js";
const estiloVisual = APARENCIA.JokerTeeth;
// ===== COMPORTAMENTO =====
export class JokerTeeth extends Projectile {
  // Recebe as dependências e prepara o estado inicial deste componente.
  constructor(posicaoX, posicaoY, velocidadeX, velocidadeY) {
    super({
      x: posicaoX,
      y: posicaoY,
      w: 24,
      h: 20,
      vx: velocidadeX,
      vy: velocidadeY,
      damage: 1,
      lifetime: 200,
      owner: "villain"
    });
    this.gravity = 0.25;
    this.chatterAngle = 0;
  }
  // Recebe a atualização atual e avança o estado, sem redesenhar a tela.
  update(passoTempo = 1, mundo = null) {
    this.vy += this.gravity * passoTempo;
    super.update(passoTempo, mundo);
    this.chatterAngle += 0.35 * passoTempo;
    if (this.y >= 420) {
      this.y = 420;
      this.vy = -3.5;
    }
  }
  // Recebe o contexto 2D e desenha o estado atual sem avançar o tempo.
  draw(contexto) {
    if (!this.alive) return;
    contexto.save();
    contexto.translate(this.x + this.w / 2, this.y + this.h / 2);
    contexto.scale(this.vx >= 0 ? 1 : -1, 1);
    const jawOpen = Math.sin(this.chatterAngle) * 3;
    contexto.fillStyle = estiloVisual.preenchimento1;
    contexto.fillRect(-14, -3, 5, 2);
    contexto.beginPath();
    contexto.arc(-15, -2, 4, 0, Math.PI * 2);
    contexto.fill();
    contexto.fillStyle = estiloVisual.preenchimento2;
    contexto.beginPath();
    contexto.ellipse(0, -5 - jawOpen, 10, 5, 0, 0, Math.PI * 2);
    contexto.fill();
    contexto.fillStyle = estiloVisual.preenchimento3;
    for (let indiceItem = -7; indiceItem <= 7; indiceItem += 3.5) {
      contexto.beginPath();
      contexto.moveTo(indiceItem - 1.5, -4 - jawOpen);
      contexto.lineTo(indiceItem, 0 - jawOpen);
      contexto.lineTo(indiceItem + 1.5, -4 - jawOpen);
      contexto.fill();
    }
    contexto.fillStyle = estiloVisual.preenchimento4;
    contexto.beginPath();
    contexto.ellipse(0, 5 + jawOpen, 10, 5, 0, 0, Math.PI * 2);
    contexto.fill();
    contexto.fillStyle = estiloVisual.preenchimento3;
    for (let indiceItem = -7; indiceItem <= 7; indiceItem += 3.5) {
      contexto.beginPath();
      contexto.moveTo(indiceItem - 1.5, 4 + jawOpen);
      contexto.lineTo(indiceItem, 0 + jawOpen);
      contexto.lineTo(indiceItem + 1.5, 4 + jawOpen);
      contexto.fill();
    }
    contexto.fillStyle = estiloVisual.preenchimento6;
    contexto.beginPath();
    contexto.arc(3, jawOpen, 1.5, 0, Math.PI * 2);
    contexto.fill();
    contexto.restore();
  }
}
