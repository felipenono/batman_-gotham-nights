// Este arquivo cuida de desenhar Arkham e seus reflexos de luz.
import { APARENCIA } from "../config/configuracao.js";

// ===== DEPENDÊNCIAS E CONFIGURAÇÕES =====
import { LIGHTING } from "../config/configuracao.js";
import { Background } from "./Background.js";
const estiloVisual = APARENCIA.Level3Background;
// ===== COMPORTAMENTO =====
export class Level3Background extends Background {
  // Recebe as dependências e prepara o estado inicial deste componente.
  constructor(largura = 900, altura = 500) {
    super(largura, altura);
    this.flickerTimer = 0;
    this.fogTime = 0;
    this.lights = [{
      x: 260,
      y: 45,
      width: 70,
      enabled: true,
      phase: 0
    }, {
      x: 640,
      y: 45,
      width: 70,
      enabled: true,
      phase: 1.7
    }];
  }
  // Recebe a atualização atual e avança o estado, sem redesenhar a tela.
  update(passoTempo = 1, cameraDoJogo = null) {
    this.fogTime += 0.03 * passoTempo;
    this.flickerTimer += passoTempo;
  }
  // Recebe o contexto 2D e desenha o estado atual sem avançar o tempo.
  draw(contexto, cameraDoJogo = null) {
    contexto.save();
    contexto.translate(-(cameraDoJogo?.renderX ?? 0), -(cameraDoJogo?.renderY ?? 0));
    this.desenharParede(contexto);
    this.desenharTijolos(contexto);
    this.desenharCelas(contexto);
    this.desenharGargulas(contexto);
    this.desenharLampadas(contexto);
    contexto.save();
    const fogBaseY = this.height - 120;
    const fogGrad = contexto.createLinearGradient(0, fogBaseY - 60, 0, this.height);
    fogGrad.addColorStop(0, estiloVisual.gradiente1);
    fogGrad.addColorStop(0.5, estiloVisual.gradiente2);
    fogGrad.addColorStop(1, estiloVisual.gradiente3);
    contexto.fillStyle = fogGrad;
    contexto.fillRect(0, fogBaseY - 60, this.width, 180);
    contexto.fillStyle = estiloVisual.preenchimento4;
    for (let fx = 0; fx < this.width + 100; fx += 140) {
      const fy = fogBaseY + Math.sin(this.fogTime * 2 + fx) * 16;
      contexto.beginPath();
      contexto.ellipse(fx, fy, 90, 30, 0, 0, Math.PI * 2);
      contexto.fill();
    }
    contexto.restore();
    contexto.restore();
  }
  lightIntensity(light) {
    if (!light.enabled || Math.sin(this.flickerTimer * 0.4 + light.phase) > 0.85) return 0;
    return 0.85 * LIGHTING.INTENSITY;
  }
  // Called after platforms, in the same world transform as the colliders.
  drawSurfaceLighting(contexto, platforms) {
    for (const light of this.lights) {
      const intensity = this.lightIntensity(light);
      if (intensity === 0) continue;
      let surface = null;
      for (const plataforma of platforms) {
        if (!plataforma.alive || plataforma.y <= light.y) continue;
        if (light.x < plataforma.x || light.x > plataforma.x + plataforma.w) continue;
        if (!surface || plataforma.y < surface.y) surface = plataforma;
      }
      if (!surface) continue;
      contexto.save();
      contexto.beginPath();
      contexto.rect(surface.x, surface.y, surface.w, surface.h);
      contexto.clip();
      contexto.translate(light.x, surface.y + 3);
      contexto.scale(1, 0.15);
      const reflection = contexto.createRadialGradient(0, 0, 2, 0, 0, 65);
      reflection.addColorStop(0, `rgba(134, 239, 172, ${intensity * 0.35})`);
      reflection.addColorStop(1, estiloVisual.gradiente5);
      contexto.fillStyle = reflection;
      contexto.fillRect(-65, -65, 130, 130);
      contexto.restore();
    }
  }
  // Desenha esta camada na posição original da composição.
  desenharParede(contexto) {
    const stoneGrad = contexto.createLinearGradient(0, 0, 0, this.height);
    stoneGrad.addColorStop(0, estiloVisual.gradiente6);
    stoneGrad.addColorStop(0.5, estiloVisual.gradiente7);
    stoneGrad.addColorStop(1, estiloVisual.gradiente8);
    contexto.fillStyle = stoneGrad;
    contexto.fillRect(0, 0, this.width, this.height);
  }
  // Desenha esta camada na posição original da composição.
  desenharTijolos(contexto) {
    contexto.strokeStyle = estiloVisual.contorno9;
    contexto.lineWidth = 1;
    for (let posicaoY = 30; posicaoY < this.height - 80; posicaoY += 35) {
      contexto.beginPath();
      contexto.moveTo(0, posicaoY);
      contexto.lineTo(this.width, posicaoY);
      contexto.stroke();
      const deslocamento = posicaoY % 70 === 0 ? 0 : 35;
      for (let posicaoX = 0 + deslocamento; posicaoX < this.width + 100; posicaoX += 70) {
        contexto.beginPath();
        contexto.moveTo(posicaoX, posicaoY);
        contexto.lineTo(posicaoX, posicaoY + 35);
        contexto.stroke();
      }
    }
  }
  // Desenha esta camada na posição original da composição.
  desenharCelas(contexto) {
    const cellStep = 180;
    for (let cx = 0 + 40; cx < this.width + 120; cx += cellStep) {
      contexto.fillStyle = estiloVisual.preenchimento10;
      contexto.fillRect(cx, 80, 110, 220);
      contexto.fillStyle = Math.sin(cx * 3) > 0 ? estiloVisual.gradiente11 : estiloVisual.gradiente12;
      contexto.beginPath();
      contexto.arc(cx + 45, 170, 2.5, 0, Math.PI * 2);
      contexto.arc(cx + 55, 170, 2.5, 0, Math.PI * 2);
      contexto.fill();
      contexto.strokeStyle = estiloVisual.contorno13;
      contexto.lineWidth = 4;
      for (let bx = cx + 8; bx < cx + 110; bx += 18) {
        contexto.beginPath();
        contexto.moveTo(bx, 80);
        contexto.lineTo(bx, 300);
        contexto.stroke();
      }
      contexto.fillStyle = estiloVisual.contorno9;
      contexto.beginPath();
      contexto.arc(cx + 55, 80, 55, Math.PI, 0, false);
      contexto.fill();
    }
  }
  // Desenha esta camada na posição original da composição.
  desenharGargulas(contexto) {
    const pillars = [120, 780];
    for (const px of pillars) {
      contexto.fillStyle = estiloVisual.preenchimento15;
      contexto.fillRect(px - 20, 120, 40, this.height - 180);
      contexto.fillStyle = estiloVisual.preenchimento16;
      contexto.beginPath();
      contexto.ellipse(px, 110, 16, 14, 0, 0, Math.PI * 2);
      contexto.fill();
      contexto.beginPath();
      contexto.moveTo(px - 14, 110);
      contexto.lineTo(px - 32, 85);
      contexto.lineTo(px - 12, 100);
      contexto.moveTo(px + 14, 110);
      contexto.lineTo(px + 32, 85);
      contexto.lineTo(px + 12, 100);
      contexto.fill();
      contexto.fillStyle = estiloVisual.preenchimento17;
      contexto.fillRect(px - 5, 107, 3, 2);
      contexto.fillRect(px + 2, 107, 3, 2);
    }
  }
  // Desenha esta camada na posição original da composição.
  desenharLampadas(contexto) {
    contexto.save();
    for (const light of this.lights) {
      const tx = light.x;
      const lightAlpha = this.lightIntensity(light);
      contexto.strokeStyle = estiloVisual.contorno9;
      contexto.lineWidth = 2;
      contexto.beginPath();
      contexto.moveTo(tx, 0);
      contexto.lineTo(tx, light.y);
      contexto.stroke();
      contexto.shadowColor = estiloVisual.brilho19;
      contexto.shadowBlur = lightAlpha > 0 ? 7 : 0;
      contexto.fillStyle = lightAlpha > 0 ? `rgba(240, 253, 244, ${lightAlpha})` : estiloVisual.gradiente20;
      contexto.fillRect(tx - light.width / 2, light.y, light.width, 6);
      contexto.shadowBlur = 0;
      if (lightAlpha === 0) continue;
      const coneGrad = contexto.createRadialGradient(tx, light.y + 6, 5, tx, light.y + 6, 180);
      coneGrad.addColorStop(0, `rgba(134, 239, 172, ${lightAlpha * 0.25})`);
      coneGrad.addColorStop(1, estiloVisual.gradiente5);
      contexto.fillStyle = coneGrad;
      contexto.beginPath();
      contexto.moveTo(tx - light.width / 2, light.y + 6);
      contexto.lineTo(tx + light.width / 2, light.y + 6);
      contexto.lineTo(tx + 90, light.y + 180);
      contexto.lineTo(tx - 90, light.y + 180);
      contexto.closePath();
      contexto.fill();
    }
    contexto.restore();
  }
}
