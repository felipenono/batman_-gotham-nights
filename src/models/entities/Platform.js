// Geometria e tema das plataformas; a View cuida do desenho.

// ===== DEPENDÊNCIAS E CONFIGURAÇÕES =====
import { Entity } from "./Entity.js";
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

}
