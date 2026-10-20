// Este arquivo cuida de desenhar os telhados e o céu de Gotham.
import { APARENCIA } from "../../config/configuracao.js";

// ===== DEPENDÊNCIAS E CONFIGURAÇÕES =====
import { LIGHTING } from "../../config/configuracao.js";
import { Background } from "./Background.js";
const estiloVisual = APARENCIA.Level1Background;
// ===== COMPORTAMENTO =====
export class Level1Background extends Background {
  // Recebe as dependências e prepara o estado inicial deste componente.
  constructor(largura = 900, altura = 500) {
    super(largura, altura);
    this.rainDrops = [];
    for (let indiceItem = 0; indiceItem < 120; indiceItem++) {
      this.rainDrops.push({
        x: Math.random() * largura,
        y: Math.random() * altura,
        len: 12 + Math.random() * 10,
        speed: 14 + Math.random() * 6
      });
    }
    this.lightningTimer = 300;
    this.lightningAlpha = 0;
    this.signalAngle = 0;
    this.buildings = [];
    let curX = 0;
    while (curX < largura + 400) {
      const bw = 40 + Math.random() * 60;
      const bh = 140 + Math.random() * 180;
      this.buildings.push({
        x: curX,
        w: bw,
        h: bh
      });
      curX += bw + Math.random() * 15;
    }
  }
  // Recebe a atualização atual e avança o estado, sem redesenhar a tela.
  update(passoTempo = 1, cameraDoJogo = null) {
    this.signalAngle += 0.015 * passoTempo;
    for (const drop of this.rainDrops) {
      drop.y += drop.speed * passoTempo;
      drop.x -= 2.5 * passoTempo;
      if (drop.y > this.height) {
        drop.y = -20;
        drop.x = Math.random() * (this.width + 100);
      }
    }
    this.lightningTimer -= passoTempo;
    if (this.lightningTimer <= 0) {
      this.lightningTimer = 400 + Math.random() * 300;
      this.lightningAlpha = 0.2;
    }
    if (this.lightningAlpha > 0) {
      this.lightningAlpha -= 0.08 * passoTempo;
      if (this.lightningAlpha < 0) this.lightningAlpha = 0;
    }
  }
  // Recebe o contexto 2D e desenha o estado atual sem avançar o tempo.
  draw(contexto, cameraDoJogo = null) {
    const camX = cameraDoJogo ? cameraDoJogo.renderX : 0;
    contexto.save();
    this.desenharCeu(contexto, cameraDoJogo, camX);
    this.desenharSinalNasNuvens(contexto, cameraDoJogo, camX);
    this.desenharPredios(contexto, cameraDoJogo, camX);
    this.desenharTelhados(contexto, cameraDoJogo, camX);
    this.desenharChuva(contexto, cameraDoJogo, camX);
    if (this.lightningAlpha > 0.01) {
      contexto.fillStyle = `rgba(241, 245, 249, ${this.lightningAlpha})`;
      contexto.fillRect(0, 0, this.width, this.height);
    }
    contexto.restore();
  }
  // Desenha esta camada na posição original da composição.
  desenharCeu(contexto, cameraDoJogo, camX) {
    const skyGrad = contexto.createLinearGradient(0, 0, 0, this.height);
    skyGrad.addColorStop(0, estiloVisual.gradiente1);
    skyGrad.addColorStop(0.5, estiloVisual.gradiente2);
    skyGrad.addColorStop(1, estiloVisual.gradiente3);
    contexto.fillStyle = skyGrad;
    contexto.fillRect(0, 0, this.width, this.height);
  }
  // Desenha esta camada na posição original da composição.
  desenharSinalNasNuvens(contexto, cameraDoJogo, camX) {
    contexto.save();
    const targetCloudX = 410 - camX * 0.12;
    const targetCloudY = 130;
    const signalOriginX = 725 - camX * 0.25;
    const signalOriginY = this.height - 75;
    this.desenharNuvens(contexto, targetCloudX, targetCloudY, signalOriginX, signalOriginY);
    this.desenharFeixe(contexto, targetCloudX, targetCloudY, signalOriginX, signalOriginY);
    this.desenharRefletor(contexto, targetCloudX, targetCloudY, signalOriginX, signalOriginY);
    contexto.save();
    contexto.globalAlpha *= LIGHTING.INTENSITY;
    contexto.translate(targetCloudX, targetCloudY);
    contexto.shadowColor = estiloVisual.brilho4;
    contexto.shadowBlur = 28;
    const ovalGrad = contexto.createRadialGradient(0, 0, 12, 0, 0, 116);
    ovalGrad.addColorStop(0, estiloVisual.gradiente5);
    ovalGrad.addColorStop(0.28, estiloVisual.gradiente6);
    ovalGrad.addColorStop(0.65, estiloVisual.gradiente7);
    ovalGrad.addColorStop(0.88, estiloVisual.gradiente8);
    ovalGrad.addColorStop(0.97, estiloVisual.gradiente9);
    ovalGrad.addColorStop(1, estiloVisual.gradiente10);
    contexto.fillStyle = ovalGrad;
    contexto.beginPath();
    contexto.ellipse(0, 0, 114, 66, 0, 0, Math.PI * 2);
    contexto.fill();
    contexto.strokeStyle = estiloVisual.contorno11;
    contexto.lineWidth = 3;
    contexto.stroke();
    contexto.shadowBlur = 0;
    contexto.fillStyle = estiloVisual.preenchimento12;
    contexto.beginPath();
    contexto.moveTo(0, -13);
    contexto.lineTo(-4, -27);
    contexto.lineTo(-9, -17);
    contexto.bezierCurveTo(-32, -22, -60, -32, -88, -26);
    contexto.bezierCurveTo(-97, -12, -93, 7, -80, 17);
    contexto.bezierCurveTo(-73, 7, -60, 7, -49, 21);
    contexto.bezierCurveTo(-41, 10, -28, 10, -16, 23);
    contexto.bezierCurveTo(-8, 19, -4, 28, 0, 36);
    contexto.bezierCurveTo(4, 28, 8, 19, 16, 23);
    contexto.bezierCurveTo(28, 10, 41, 10, 49, 21);
    contexto.bezierCurveTo(60, 7, 73, 7, 80, 17);
    contexto.bezierCurveTo(93, 7, 97, -12, 88, -26);
    contexto.bezierCurveTo(60, -32, 32, -22, 9, -17);
    contexto.lineTo(4, -27);
    contexto.lineTo(0, -13);
    contexto.closePath();
    contexto.fill();
    contexto.restore();
    contexto.restore();
  }
  // Desenha esta camada na posição original da composição.
  desenharPredios(contexto, cameraDoJogo, camX) {
    // 3. Distant Gotham Skyline with Parallax
    const parallaxSkyline = camX * 0.25;
    contexto.fillStyle = estiloVisual.preenchimento13;
    for (const elementoAtual of this.buildings) {
      const bx = elementoAtual.x - parallaxSkyline;
      const by = this.height - elementoAtual.h;
      contexto.fillRect(bx, by, elementoAtual.w, elementoAtual.h);
      contexto.fillStyle = estiloVisual.preenchimento14;
      for (let wy = by + 12; wy < this.height - 20; wy += 22) {
        for (let wx = elementoAtual.x + 6; wx < elementoAtual.x + elementoAtual.w - 10; wx += 14) {
          if (Math.sin(wx * 11 + wy * 17) > 0.35) {
            contexto.fillRect(wx - parallaxSkyline, wy, 4, 6);
          }
        }
      }
      contexto.fillStyle = estiloVisual.preenchimento13;
    }
  }
  // Desenha esta camada na posição original da composição.
  desenharTelhados(contexto, cameraDoJogo, camX) {
    const parallaxMid = camX * 0.55;
    contexto.fillStyle = estiloVisual.preenchimento16;
    contexto.fillRect(0 - parallaxMid, this.height - 80, this.width * 2, 80);
  }
  // Desenha esta camada na posição original da composição.
  desenharChuva(contexto, cameraDoJogo, camX) {
    contexto.strokeStyle = estiloVisual.contorno17;
    contexto.lineWidth = 1.2;
    for (const drop of this.rainDrops) {
      contexto.beginPath();
      contexto.moveTo(drop.x, drop.y);
      contexto.lineTo(drop.x - 4, drop.y + drop.len);
      contexto.stroke();
    }
  }
  desenharNuvens(contexto, targetCloudX, targetCloudY, signalOriginX, signalOriginY) {
    contexto.save();
    contexto.fillStyle = estiloVisual.preenchimento18;
    contexto.beginPath();
    contexto.ellipse(targetCloudX, targetCloudY, 190, 82, 0, 0, Math.PI * 2);
    contexto.fill();
    contexto.fillStyle = estiloVisual.preenchimento19;
    contexto.beginPath();
    contexto.ellipse(targetCloudX - 50, targetCloudY - 18, 130, 56, 0, 0, Math.PI * 2);
    contexto.ellipse(targetCloudX + 55, targetCloudY + 12, 140, 60, 0, 0, Math.PI * 2);
    contexto.fill();
    contexto.fillStyle = estiloVisual.preenchimento20;
    contexto.beginPath();
    contexto.ellipse(targetCloudX - 85, targetCloudY + 22, 95, 38, 0, 0, Math.PI * 2);
    contexto.ellipse(targetCloudX + 90, targetCloudY - 22, 100, 42, 0, 0, Math.PI * 2);
    contexto.fill();
    contexto.restore();
  }
  desenharFeixe(contexto, targetCloudX, targetCloudY, signalOriginX, signalOriginY) {
    contexto.save();
    contexto.globalAlpha *= LIGHTING.INTENSITY;
    const beamGrad = contexto.createLinearGradient(signalOriginX, signalOriginY, targetCloudX, targetCloudY);
    beamGrad.addColorStop(0, estiloVisual.gradiente21);
    beamGrad.addColorStop(0.12, estiloVisual.gradiente22);
    beamGrad.addColorStop(0.45, estiloVisual.gradiente23);
    beamGrad.addColorStop(0.85, estiloVisual.gradiente24);
    beamGrad.addColorStop(1, estiloVisual.gradiente25);
    contexto.fillStyle = beamGrad;
    contexto.beginPath();
    contexto.moveTo(signalOriginX - 8, signalOriginY);
    contexto.lineTo(targetCloudX - 110, targetCloudY + 25);
    contexto.lineTo(targetCloudX + 105, targetCloudY + 45);
    contexto.lineTo(signalOriginX + 8, signalOriginY);
    contexto.closePath();
    contexto.fill();
    contexto.shadowColor = estiloVisual.brilho26;
    contexto.shadowBlur = 18;
    contexto.fill();
    contexto.restore();
  }
  desenharRefletor(contexto, targetCloudX, targetCloudY, signalOriginX, signalOriginY) {
    contexto.save();
    contexto.fillStyle = estiloVisual.preenchimento27;
    contexto.beginPath();
    contexto.moveTo(signalOriginX - 14, signalOriginY + 16);
    contexto.lineTo(signalOriginX, signalOriginY + 4);
    contexto.lineTo(signalOriginX + 14, signalOriginY + 16);
    contexto.lineTo(signalOriginX + 10, signalOriginY + 16);
    contexto.lineTo(signalOriginX, signalOriginY + 6);
    contexto.lineTo(signalOriginX - 10, signalOriginY + 16);
    contexto.closePath();
    contexto.fill();
    contexto.fillStyle = estiloVisual.preenchimento28;
    contexto.fillRect(signalOriginX - 10, signalOriginY + 2, 20, 5);
    contexto.fillStyle = estiloVisual.preenchimento29;
    contexto.beginPath();
    contexto.roundRect(signalOriginX - 8, signalOriginY - 5, 16, 12, 3);
    contexto.fill();
    contexto.globalAlpha *= LIGHTING.INTENSITY;
    contexto.fillStyle = estiloVisual.gradiente5;
    contexto.shadowColor = estiloVisual.gradiente8;
    contexto.shadowBlur = 16;
    contexto.beginPath();
    contexto.arc(signalOriginX - 2, signalOriginY - 2, 6, 0, Math.PI * 2);
    contexto.fill();
    contexto.restore();
  }
}
