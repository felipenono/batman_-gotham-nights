/**
 * ============================================================================
 * @file Background.js
 * @category POO - Superclasse Abstrata de Cenários (Template Pattern & Polymorphism)
 * ============================================================================
 * CONCEITOS DE PROGRAMAÇÃO ORIENTADA A OBJETOS (POO):
 * 
 * 1. ABSTRAÇÃO DE CENÁRIOS PARALAXE:
 *    Define a interface padrão de dimensões (width, height) e ciclo de vida
 *    gráfico (update, draw) para qualquer fundo de fase.
 * 
 * 2. POLIMORFISMO (Polymorphism):
 *    Permite que o motor do jogo (Level.js) trate todos os fundos de forma homogênea
 *    chamando background.draw(ctx, camera), enquanto cada subclasse concreta
 *    desenha seu próprio espetáculo visual:
 *    - Level1Background: Noite chuvosa em Gotham, raios e Bat-Sinal luminoso.
 *    - Level2Background: Cassino Iceberg Lounge com lustres e neon.
 *    - Level3Background: Asilo Arkham com celas góticas e névoa verde.
 * ============================================================================
 */

export class Background {
  /**
   * CONSTRUTOR:
   * Inicializa as dimensões espaciais do plano de fundo.
   *
   * @param {number} width - Largura da viewport ou do estágio
   * @param {number} height - Altura da viewport ou do estágio
   */
  constructor(width = 900, height = 500) {
    this.width = width;
    this.height = height;
  }

  /**
   * [POO - MÉTODO POLIMÓRFICO DE ATUALIZAÇÃO]
   * Atualiza efeitos climáticos procedurais (chuva, raios, névoa, luzes).
   *
   * @param {number} dt - Delta time
   * @param {Camera} camera - Câmera para cálculo de paralaxe
   */
  update(dt = 1, camera = null) {
    // Sobrescrito pelas subclasses
  }

  /**
   * [POO - MÉTODO POLIMÓRFICO DE DESENHO]
   * Renderiza camadas em diferentes velocidades de paralaxe (céu, skyline, silhuetas).
   *
   * @param {CanvasRenderingContext2D} ctx - Contexto 2D do Canvas
   * @param {Camera} camera - Câmera para deslocamento relativo
   */
  draw(ctx, camera = null) {
    // Sobrescrito pelas subclasses
  }
}
