// Este arquivo cuida de desenhar o cassino e sua iluminação.
import { APARENCIA } from "../config/configuracao.js";

// ===== DEPENDÊNCIAS E CONFIGURAÇÕES =====
import { LIGHTING } from "../config/configuracao.js";
import { Background } from "./Background.js";
const estiloVisual = APARENCIA.Level2Background;
// ===== COMPORTAMENTO =====
export class Level2Background extends Background {
  // Recebe as dependências e prepara o estado inicial deste componente.
  constructor(largura = 900, altura = 500) {
    super(largura, altura);
    this.spotlightAngle = 0;
  }
  // Recebe a atualização atual e avança o estado, sem redesenhar a tela.
  update(passoTempo = 1, cameraDoJogo = null) {
    this.spotlightAngle += 0.02 * passoTempo;
  }
  // Recebe o contexto 2D e desenha o estado atual sem avançar o tempo.
  draw(contexto, cameraDoJogo = null) {
    contexto.save();
    contexto.translate(-(cameraDoJogo?.renderX ?? 0), -(cameraDoJogo?.renderY ?? 0));
    this.desenharParede(contexto);
    this.desenharArcos(contexto);
    this.desenharCortinas(contexto);
    this.desenharLetreiro(contexto);
    this.desenharLustres(contexto);
    const floorY = this.height - 65;
    const floorGrad = contexto.createLinearGradient(0, floorY, 0, this.height);
    floorGrad.addColorStop(0, estiloVisual.gradiente1);
    floorGrad.addColorStop(0.2, estiloVisual.gradiente2);
    floorGrad.addColorStop(1, estiloVisual.gradiente3);
    contexto.fillStyle = floorGrad;
    contexto.fillRect(0, floorY, this.width, 65);
    contexto.strokeStyle = estiloVisual.contorno4;
    contexto.lineWidth = 1;
    for (let posicaoX = 0; posicaoX < this.width + 120; posicaoX += 80) {
      contexto.beginPath();
      contexto.moveTo(posicaoX, floorY);
      contexto.lineTo(posicaoX + 40, this.height);
      contexto.stroke();
    }
    contexto.save();
    const spotX = this.width / 2 + Math.sin(this.spotlightAngle) * 220;
    const spotGrad = contexto.createRadialGradient(spotX, floorY, 20, spotX, floorY, 180);
    spotGrad.addColorStop(0, estiloVisual.gradiente5);
    spotGrad.addColorStop(1, estiloVisual.gradiente6);
    contexto.fillStyle = spotGrad;
    contexto.fillRect(0, floorY - 80, this.width, 145);
    contexto.restore();
    contexto.restore();
  }
  // Desenha esta camada na posição original da composição.
  desenharParede(contexto) {
    const wallGrad = contexto.createLinearGradient(0, 0, 0, this.height);
    wallGrad.addColorStop(0, estiloVisual.gradiente7);
    wallGrad.addColorStop(0.5, estiloVisual.gradiente8);
    wallGrad.addColorStop(1, estiloVisual.gradiente9);
    contexto.fillStyle = wallGrad;
    contexto.fillRect(0, 0, this.width, this.height);
  }
  // Desenha esta camada na posição original da composição.
  desenharArcos(contexto) {
    const panelStep = 180;
    contexto.strokeStyle = estiloVisual.contorno10;
    contexto.lineWidth = 3;
    for (let posicaoX = 0; posicaoX < this.width + 200; posicaoX += panelStep) {
      contexto.strokeRect(posicaoX, 40, panelStep - 30, 320);
      contexto.strokeStyle = estiloVisual.contorno11;
      contexto.lineWidth = 1;
      contexto.beginPath();
      contexto.arc(posicaoX + (panelStep - 30) / 2, 120, 45, Math.PI, 0, false);
      contexto.lineTo(posicaoX + (panelStep - 30) / 2 + 45, 340);
      contexto.lineTo(posicaoX + (panelStep - 30) / 2 - 45, 340);
      contexto.closePath();
      contexto.stroke();
    }
  }
  // Desenha esta camada na posição original da composição.
  desenharCortinas(contexto) {
    contexto.fillStyle = estiloVisual.preenchimento12;
    for (let cx = 0; cx < this.width + 120; cx += 160) {
      contexto.beginPath();
      contexto.arc(cx, 0, 95, 0, Math.PI, false);
      contexto.fill();
      contexto.strokeStyle = estiloVisual.contorno13;
      contexto.lineWidth = 2.5;
      contexto.beginPath();
      contexto.arc(cx, 0, 95, 0, Math.PI, false);
      contexto.stroke();
    }
  }
  // Desenha esta camada na posição original da composição.
  desenharLetreiro(contexto) {
    // 4. NEON "SALÃO ICEBERG" SIGN
    contexto.save();
    contexto.globalAlpha *= LIGHTING.INTENSITY;
    const neonX = this.width / 2;
    const neonY = 80;
    contexto.shadowColor = estiloVisual.brilho14;
    contexto.shadowBlur = 8;
    contexto.strokeStyle = estiloVisual.contorno15;
    contexto.lineWidth = 3;
    contexto.strokeRect(neonX - 160, neonY - 30, 320, 56);
    contexto.textAlign = "center";
    contexto.textBaseline = "middle";
    contexto.font = estiloVisual.fonte1;
    contexto.fillStyle = estiloVisual.preenchimento16;
    contexto.shadowColor = estiloVisual.brilho14;
    contexto.shadowBlur = 6;
    contexto.fillText(estiloVisual.texto1, neonX, neonY);
    contexto.strokeStyle = estiloVisual.contorno18;
    contexto.shadowColor = estiloVisual.brilho19;
    contexto.shadowBlur = 8;
    contexto.lineWidth = 2;
    contexto.beginPath();
    contexto.moveTo(neonX + 125, neonY - 14);
    contexto.lineTo(neonX + 145, neonY - 14);
    contexto.lineTo(neonX + 135, neonY + 2);
    contexto.closePath();
    contexto.moveTo(neonX + 135, neonY + 2);
    contexto.lineTo(neonX + 135, neonY + 12);
    contexto.moveTo(neonX + 127, neonY + 12);
    contexto.lineTo(neonX + 143, neonY + 12);
    contexto.stroke();
    contexto.restore();
  }
  // Desenha esta camada na posição original da composição.
  desenharLustres(contexto) {
    const chandX = [180, 720];
    for (const cx of chandX) {
      contexto.save();
      contexto.strokeStyle = estiloVisual.contorno13;
      contexto.lineWidth = 2;
      contexto.beginPath();
      contexto.moveTo(cx, 0);
      contexto.lineTo(cx, 60);
      contexto.stroke();
      contexto.globalAlpha *= LIGHTING.INTENSITY;
      contexto.fillStyle = estiloVisual.preenchimento21;
      contexto.shadowColor = estiloVisual.brilho22;
      contexto.shadowBlur = 12;
      contexto.beginPath();
      contexto.ellipse(cx, 66, 32, 8, 0, 0, Math.PI * 2);
      contexto.fill();
      contexto.fillStyle = estiloVisual.preenchimento23;
      for (let indiceItem = -24; indiceItem <= 24; indiceItem += 8) {
        contexto.fillRect(cx + indiceItem, 68, 2, 14);
      }
      contexto.restore();
    }
  }
}
