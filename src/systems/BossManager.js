/**
 * ============================================================================
 * @file BossManager.js
 * @category POO - Gerenciador de Encontros de Chefes (Lifecycle Coordinator & Factory)
 * ============================================================================
 * CONCEITOS DE PROGRAMAÇÃO ORIENTADA A OBJETOS (POO):
 * 
 * 1. GERENCIADOR DE CICLO DE VIDA (Lifecycle Coordinator):
 *    Coordena a entrada em cena, temporizador de introdução ("WARNING: BOSS HAS ENTERED"),
 *    rastreamento de vida e detecção de derrota do arqui-inimigo ativo.
 * 
 * 2. PADRÃO FACTORY METHOD (Fábrica de Chefes):
 *    O método spawnBoss() instancia a subclasse polimórfica correspondente ao estágio
 *    (Scarecrow para o nível 1, Harley Quinn para o 2, Two-Face para o 3).
 * 
 * 3. ENCAPSULAMENTO DE ESTADO DO CHEFE:
 *    Isola a instância do chefe ativo (this.boss) e fornece métodos seguros
 *    de reset e consulta.
 * ============================================================================
 */

import { Scarecrow } from '../entities/villains/Scarecrow.js';
import { HarleyQuinn } from '../entities/villains/HarleyQuinn.js';
import { TwoFace } from '../entities/villains/TwoFace.js';

export class BossManager {
  /**
   * CONSTRUTOR:
   * Inicializa o estado de monitoramento de encontros de chefes.
   */
  constructor() {
    this.boss = null;          // Instância polimórfica do chefe ativo (Character)
    this.bossSpawned = false;  // Flag de surgimento
    this.bossDefeated = false; // Flag de derrota confirmada
    this.introTimer = 0;       // Temporizador da faixa de aviso dramático
  }

  /**
   * [POO - RESET DE ESTADO / LIMPEZA DE CICLO]
   * Zera as variáveis de controle para transição de estágios ou reinício de jogo.
   */
  reset() {
    this.boss = null;
    this.bossSpawned = false;
    this.bossDefeated = false;
    this.introTimer = 0;
  }

  /**
   * [POO - FÁBRICA POLIMÓRFICA (FACTORY METHOD)]
   * Cria o chefe correto baseado na configuração do estágio.
   *
   * @param {Object} levelConfig - Configuração da fase ativa
   * @param {number} worldWidth - Largura do mundo para posicionamento
   * @param {number} worldHeight - Altura do mundo para posicionamento
   */
  spawnBoss(levelConfig, worldWidth = 900, worldHeight = 500) {
    if (this.bossSpawned) return;

    this.bossSpawned = true;
    this.bossDefeated = false;
    this.introTimer = 100; // 100 frames (~1.6s) de banner de alerta na tela

    const spawnX = worldWidth - 140;
    const spawnY = worldHeight - 170;

    // Seleção polimórfica da subclasse concreta
    switch (levelConfig.boss) {
      case 'Scarecrow':
        this.boss = new Scarecrow({ x: spawnX, y: spawnY - 20 });
        break;
      case 'HarleyQuinn':
        this.boss = new HarleyQuinn({ x: spawnX, y: spawnY });
        break;
      case 'TwoFace':
        this.boss = new TwoFace({ x: spawnX, y: spawnY });
        break;
      default:
        this.boss = new Scarecrow({ x: spawnX, y: spawnY });
    }
  }

  /**
   * Updates boss status and checks for defeat.
   * @param {Function} onBossDefeated
   */
  update(onBossDefeated) {
    if (this.introTimer > 0) this.introTimer--;

    if (this.boss && !this.boss.alive && !this.bossDefeated) {
      this.bossDefeated = true;
      if (onBossDefeated) {
        onBossDefeated(this.boss);
      }
    }
  }

  /**
   * Renders the dramatic "A MIGHTY FOE APPEARS!" Cuphead-style boss splash when entering.
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} canvasWidth
   * @param {number} canvasHeight
   */
  drawIntro(ctx, canvasWidth = 900, canvasHeight = 500) {
    if (this.introTimer <= 0 || !this.boss) return;

    ctx.save();
    const alpha = Math.min(1, this.introTimer / 30);
    ctx.globalAlpha = alpha;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fillRect(0, canvasHeight / 2 - 45, canvasWidth, 90);

    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, canvasHeight / 2 - 45); ctx.lineTo(canvasWidth, canvasHeight / 2 - 45);
    ctx.moveTo(0, canvasHeight / 2 + 45); ctx.lineTo(canvasWidth, canvasHeight / 2 + 45);
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '900 28px "Arial Black", Impact, sans-serif';
    ctx.fillStyle = '#fef08a';
    ctx.shadowColor = '#dc2626';
    ctx.shadowBlur = 10;
    ctx.fillText(`WARNING: ${this.boss.name.toUpperCase()} HAS ENTERED!`, canvasWidth / 2, canvasHeight / 2);

    ctx.restore();
  }
}
