// Este arquivo cuida de manter a mesma escala para desenho e apontamento.
// ===== DEPENDÊNCIAS E CONFIGURAÇÕES =====
import { GAME } from "../config/configuracao.js";
// ===== COMPORTAMENTO =====
export class Viewport {
  // Recebe as dependências e prepara o estado inicial deste componente.
  constructor(largura = GAME.WIDTH, altura = GAME.HEIGHT) {
    this.width = largura;
    this.height = altura;
  }
  fit(renderWidth, renderHeight) {
    const escala = Math.min(renderWidth / this.width, renderHeight / this.height);
    return {
      scale: escala,
      x: (renderWidth - this.width * escala) / 2,
      y: (renderHeight - this.height * escala) / 2
    };
  }
  toGame(posicaoX, posicaoY, renderWidth, renderHeight) {
    const view = this.fit(renderWidth, renderHeight);
    if (!Number.isFinite(view.scale) || view.scale <= 0) return {
      x: 0,
      y: 0
    };
    return {
      x: (posicaoX - view.x) / view.scale,
      y: (posicaoY - view.y) / view.scale
    };
  }
}
