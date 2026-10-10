/**
 * ============================================================================
 * @file Entity.js
 * @category POO - Superclasse Base (Abstração & Herança)
 * ============================================================================
 * CONCEITOS DE PROGRAMAÇÃO ORIENTADA A OBJETOS (POO):
 * 
 * 1. ABSTRAÇÃO (Abstraction):
 *    Define o contrato e os atributos fundamentais comuns a qualquer objeto que
 *    exista fisicamente no espaço 2D do jogo (Batman, inimigos, tiros, plataformas).
 * 
 * 2. HERANÇA (Inheritance):
 *    Serve como a raiz da hierarquia de classes. Todas as classes do jogo
 *    (Character, Platform, Projectile) herdam direta ou indiretamente de Entity.
 * 
 * 3. POLIMORFISMO (Polymorphism):
 *    Fornece métodos genéricos como update() e draw() que são sobrescritos
 *    (override) pelas subclasses com comportamentos específicos.
 * ============================================================================
 */

export class Entity {
  /**
   * CONSTRUTOR:
   * Inicializa o estado fundamental do objeto no espaço bidimensional.
   *
   * ATRIBUTOS (Propriedades de Instância):
   * @param {Object} options - Objeto de configuração
   * @param {number} options.x - Posição horizontal no plano cartesiano (em pixels)
   * @param {number} options.y - Posição vertical no plano cartesiano (em pixels)
   * @param {number} options.w - Largura (width) da caixa de colisão
   * @param {number} options.h - Altura (height) da caixa de colisão
   */
  constructor({ x = 0, y = 0, w = 32, h = 32 } = {}) {
    // [POO - Atributos de Posição e Dimensão]
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;

    // [POO - Atributos de Cinemática / Física]
    this.vx = 0; // Velocidade horizontal (pixels por frame)
    this.vy = 0; // Velocidade vertical (gravidade/salto)

    // [POO - Atributo de Ciclo de Vida]
    this.alive = true; // Controla se o objeto está ativo no mundo
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
      bottom: this.y + this.h,
    };
  }

  /**
   * [POO - MÉTODO DE COMPORTAMENTO / INTERAÇÃO ENTRE OBJETOS]
   * Testa a colisão entre esta instância e outra entidade usando o algoritmo AABB.
   * Demonstra colaboração de objetos onde cada entidade fornece sua própria fronteira.
   *
   * @param {Entity} other - Outra instância de Entity para teste de colisão
   * @returns {boolean} True se houver sobreposição espacial
   */
  intersects(other) {
    if (!other || !other.alive || !this.alive) return false;
    const a = this.bounds;
    const b = other.bounds;

    return (
      a.left < b.right &&
      a.right > b.left &&
      a.top < b.bottom &&
      a.bottom > b.top
    );
  }

  /**
   * [POO - POLIMORFISMO / MÉTODO DE ATUALIZAÇÃO CINEMÁTICA]
   * Atualiza a posição da entidade somando suas velocidades vetoriais.
   * Pode ser estendido ou sobrescrito por classes filhas via super.update(dt).
   *
   * @param {number} dt - Multiplicador de tempo delta (normalmente 1 a 60fps)
   * @param {Object} world - Contexto opcional do mundo
   */
  update(dt = 1, world = null) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
  }

  /**
   * [POO - MÉTODO ABSTRATO / CONTRATO DE RENDERIZAÇÃO]
   * Método intencionalmente vazio na superclasse. Cada subclasse é obrigada a
   * implementar seu próprio algoritmo de renderização visual no contexto do Canvas.
   *
   * @param {CanvasRenderingContext2D} ctx - Contexto gráfico 2D
   */
  draw(ctx) {
    // Implementação polimórfica realizada pelas subclasses (Batman, Joker, etc.)
  }
}
