// Este arquivo cuida de desenhar cada tema de plataforma.
import { APARENCIA } from "../config/configuracao.js";

// ===== DEPENDÊNCIAS E CONFIGURAÇÕES =====
import { Entity } from "./Entity.js";
const estiloVisual = APARENCIA.Platform;
// ===== COMPORTAMENTO =====
export class Platform extends Entity {
  // Recebe as dependências e prepara o estado inicial deste componente.
  constructor({ x: posicaoX, y: posicaoY, w: larguraObjeto, h: alturaObjeto, theme = "rooftop", oneWay = false }) {
    super({
      x: posicaoX,
      y: posicaoY,
      w: larguraObjeto,
      h: alturaObjeto
    });
    this.theme = theme;
    this.oneWay = oneWay;
  }
  // Recebe o contexto 2D e desenha o estado atual sem avançar o tempo.
  draw(contexto) {
    contexto.save();
    if (this.theme === "rooftop") {
      this.desenharTelhado(contexto);
    } else if (this.theme === "ac_unit") {
      this.desenharVentilacao(contexto);
    } else if (this.theme === "pipe") {
      this.desenharCano(contexto);
    } else if (this.theme === "casino") {
      this.desenharCassino(contexto);
    } else if (this.theme === "asylum") {
      this.desenharAsilo(contexto);
    }
    contexto.restore();
  }
  desenharTelhado(contexto) {
    const grad = contexto.createLinearGradient(this.x, this.y, this.x, this.y + this.h);
    grad.addColorStop(0, estiloVisual.gradiente1);
    grad.addColorStop(0.15, estiloVisual.gradiente2);
    grad.addColorStop(1, estiloVisual.gradiente3);
    contexto.fillStyle = grad;
    contexto.fillRect(this.x, this.y, this.w, this.h);
    contexto.fillStyle = estiloVisual.preenchimento4;
    contexto.fillRect(this.x, this.y, this.w, 3);
    contexto.strokeStyle = estiloVisual.gradiente3;
    contexto.lineWidth = 1;
    const passo = 40;
    for (let px = this.x; px < this.x + this.w; px += passo) {
      contexto.beginPath();
      contexto.moveTo(px, this.y + 4);
      contexto.lineTo(px, this.y + this.h);
      contexto.stroke();
    }
  }
  desenharVentilacao(contexto) {
    contexto.fillStyle = estiloVisual.preenchimento6;
    contexto.fillRect(this.x, this.y, this.w, this.h);
    contexto.fillStyle = estiloVisual.gradiente1;
    contexto.fillRect(this.x + 3, this.y + 3, this.w - 6, this.h - 6);
    contexto.fillStyle = estiloVisual.gradiente2;
    for (let velocidadeY = this.y + 6; velocidadeY < this.y + this.h - 6; velocidadeY += 5) {
      contexto.fillRect(this.x + 6, velocidadeY, this.w - 12, 2);
    }
    contexto.fillStyle = estiloVisual.preenchimento9;
    contexto.fillRect(this.x, this.y, this.w, 2);
  }
  desenharCano(contexto) {
    const pipeGrad = contexto.createLinearGradient(this.x, this.y, this.x, this.y + this.h);
    pipeGrad.addColorStop(0, estiloVisual.preenchimento9);
    pipeGrad.addColorStop(0.3, estiloVisual.gradiente11);
    pipeGrad.addColorStop(0.7, estiloVisual.preenchimento4);
    pipeGrad.addColorStop(1, estiloVisual.gradiente1);
    contexto.fillStyle = pipeGrad;
    contexto.beginPath();
    contexto.roundRect(this.x, this.y, this.w, this.h, 4);
    contexto.fill();
    contexto.fillStyle = estiloVisual.gradiente2;
    for (let px = this.x + 15; px < this.x + this.w; px += 35) {
      contexto.fillRect(px, this.y, 4, this.h);
    }
  }
  desenharCassino(contexto) {
    const grad = contexto.createLinearGradient(this.x, this.y, this.x, this.y + this.h);
    grad.addColorStop(0, estiloVisual.gradiente15);
    grad.addColorStop(0.4, estiloVisual.gradiente16);
    grad.addColorStop(1, estiloVisual.gradiente17);
    contexto.fillStyle = grad;
    contexto.fillRect(this.x, this.y, this.w, this.h);
    contexto.fillStyle = estiloVisual.preenchimento18;
    contexto.fillRect(this.x, this.y, this.w, 4);
    contexto.fillRect(this.x, this.y + this.h - 3, this.w, 3);
    contexto.fillStyle = estiloVisual.preenchimento19;
    for (let px = this.x + 20; px < this.x + this.w - 20; px += 40) {
      contexto.beginPath();
      contexto.moveTo(px, this.y + 6);
      contexto.lineTo(px + 4, this.y + 11);
      contexto.lineTo(px, this.y + 16);
      contexto.lineTo(px - 4, this.y + 11);
      contexto.closePath();
      contexto.fill();
    }
  }
  desenharAsilo(contexto) {
    const grad = contexto.createLinearGradient(this.x, this.y, this.x, this.y + this.h);
    grad.addColorStop(0, estiloVisual.gradiente20);
    grad.addColorStop(0.5, estiloVisual.gradiente21);
    grad.addColorStop(1, estiloVisual.gradiente22);
    contexto.fillStyle = grad;
    contexto.fillRect(this.x, this.y, this.w, this.h);
    contexto.fillStyle = estiloVisual.preenchimento23;
    contexto.fillRect(this.x, this.y, this.w, 3);
    contexto.strokeStyle = estiloVisual.contorno24;
    contexto.lineWidth = 2;
    for (let px = this.x + 12; px < this.x + this.w; px += 24) {
      contexto.beginPath();
      contexto.moveTo(px, this.y + 3);
      contexto.lineTo(px, this.y + this.h);
      contexto.stroke();
      contexto.fillStyle = estiloVisual.preenchimento25;
      contexto.beginPath();
      contexto.arc(px, this.y + 7, 2, 0, Math.PI * 2);
      contexto.fill();
    }
  }
}
