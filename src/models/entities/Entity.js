// Este arquivo cuida de definir posição, tamanho e colisão dos objetos do jogo.
// ===== DEPENDÊNCIAS E CONFIGURAÇÕES =====
// ===== COMPORTAMENTO =====
export class Entity {
  // Recebe as dependências e prepara o estado inicial deste componente.
  constructor({ x: posicaoX = 0, y: posicaoY = 0, w: larguraObjeto = 32, h: alturaObjeto = 32 } = {}) {
    // [POO - Atributos de Posição e Dimensão]
    this.x = posicaoX;
    this.y = posicaoY;
    this.w = larguraObjeto;
    this.h = alturaObjeto;
    // [POO - Atributos de Cinemática / Física]
    this.vx = 0;
    this.vy = 0;
    this.alive = true;
  }
  /**
  * [POO - ENCAPSULAMENTO / GETTER COMPUTADO]
  * Fornece acesso somente-leitura aos limites da caixa delimitadora (Bounding Box AABB).
  * O mundo exterior não precisa calcular coordenadas manuais, o objeto encapsula esse cálculo.
  *
  * @returns {{ left: number, right: number, top: number, bottom: number }}
  */
  get bounds() {
    return {
      left: this.x,
      right: this.x + this.w,
      top: this.y,
      bottom: this.y + this.h
    };
  }
  intersects(other) {
    if (!other || !other.alive || !this.alive) return false;
    const elementoAnterior = this.bounds;
    const elementoAtual = other.bounds;
    return elementoAnterior.left < elementoAtual.right && elementoAnterior.right > elementoAtual.left && elementoAnterior.top < elementoAtual.bottom && elementoAnterior.bottom > elementoAtual.top;
  }
  // Recebe a atualização atual e avança o estado, sem redesenhar a tela.
  update(passoTempo = 1, mundo = null) {
    this.x += this.vx * passoTempo;
    this.y += this.vy * passoTempo;
  }

}
