/**
 * ============================================================================
 * @file Level.js
 * @category POO - Composição de Cenário & Builder (Composite / Builder Pattern)
 * ============================================================================
 * CONCEITOS DE PROGRAMAÇÃO ORIENTADA A OBJETOS (POO):
 * 
 * 1. COMPOSIÇÃO DE OBJETOS (Composite Pattern):
 *    A classe Level não herda de Entity nem de Background; ela COMPÕE:
 *    - Uma instância de Background (polimórfica: Level1, Level2 ou Level3).
 *    - Uma coleção de entidades Platform (cada uma com sua colisão e tema).
 *    - O ponto de surgimento (spawnPoint) para o herói.
 * 
 * 2. PADRÃO BUILDER / MONTADOR DE AMBIENTES:
 *    Os métodos privados _setupBackground() e _buildPlatforms() constroem a
 *    arquitetura física e atmosférica específica de cada nível de Gotham City.
 * ============================================================================
 */

import { Platform } from '../entities/Platform.js';
import { Level1Background } from './Level1Background.js';
import { Level2Background } from './Level2Background.js';
import { Level3Background } from './Level3Background.js';

export class Level {
  /**
   * CONSTRUTOR:
   * Constrói o mundo do estágio com base no objeto de configuração.
   *
   * @param {Object} config - Configuração da fase vinda de LEVELS
   */
  constructor(config) {
    this.config = config;
    this.width = 1100;
    this.height = 500;
    this.platforms = [];                  // Coleção de superfícies sólidas e semissólidas
    this.spawnPoint = { x: 80, y: 340 };  // Ponto de entrada do Batman

    this._setupBackground();
    this._buildPlatforms();
  }

  _setupBackground() {
    switch (this.config.background) {
      case 'Level1Background':
        this.background = new Level1Background(this.width, this.height);
        break;
      case 'Level2Background':
        this.background = new Level2Background(this.width, this.height);
        break;
      case 'Level3Background':
        this.background = new Level3Background(this.width, this.height);
        break;
      default:
        this.background = new Level1Background(this.width, this.height);
    }
  }

  _buildPlatforms() {
    const groundFloorY = this.height - 60;

    if (this.config.id === 1) {
      // LEVEL 1: GOTHAM ROOFTOPS
      // Solid rooftop base
      this.platforms.push(
        new Platform({ x: 0, y: groundFloorY, w: this.width, h: 60, theme: 'rooftop', oneWay: false })
      );

      // Left rooftop AC Unit platform
      this.platforms.push(
        new Platform({ x: 140, y: 340, w: 130, h: 24, theme: 'ac_unit', oneWay: true })
      );

      // Center elevated vantage rooftop slab
      this.platforms.push(
        new Platform({ x: 380, y: 260, w: 220, h: 26, theme: 'rooftop', oneWay: true })
      );

      // Right heavy industrial steam pipe
      this.platforms.push(
        new Platform({ x: 720, y: 330, w: 160, h: 22, theme: 'pipe', oneWay: true })
      );

      // High sniper pipe ledge
      this.platforms.push(
        new Platform({ x: 500, y: 160, w: 140, h: 18, theme: 'pipe', oneWay: true })
      );
    } else if (this.config.id === 2) {
      // LEVEL 2: ICEBERG LOUNGE
      // Polished casino ground
      this.platforms.push(
        new Platform({ x: 0, y: groundFloorY, w: this.width, h: 60, theme: 'casino', oneWay: false })
      );

      // Left VIP Lounge balcony
      this.platforms.push(
        new Platform({ x: 120, y: 330, w: 170, h: 22, theme: 'casino', oneWay: true })
      );

      // Central High-Roller Stage
      this.platforms.push(
        new Platform({ x: 390, y: 240, w: 240, h: 24, theme: 'casino', oneWay: true })
      );

      // Right Bar Mezzanine
      this.platforms.push(
        new Platform({ x: 740, y: 320, w: 180, h: 22, theme: 'casino', oneWay: true })
      );

      // Top Chandelier catwalk
      this.platforms.push(
        new Platform({ x: 440, y: 150, w: 150, h: 18, theme: 'casino', oneWay: true })
      );
    } else if (this.config.id === 3) {
      // LEVEL 3: ARKHAM ASYLUM
      // Damp asylum floor
      this.platforms.push(
        new Platform({ x: 0, y: groundFloorY, w: this.width, h: 60, theme: 'asylum', oneWay: false })
      );

      // Left isolation cell ledge
      this.platforms.push(
        new Platform({ x: 110, y: 340, w: 160, h: 22, theme: 'asylum', oneWay: true })
      );

      // Central reinforced guard bridge
      this.platforms.push(
        new Platform({ x: 370, y: 250, w: 250, h: 24, theme: 'asylum', oneWay: true })
      );

      // Right cell block catwalk
      this.platforms.push(
        new Platform({ x: 730, y: 330, w: 170, h: 22, theme: 'asylum', oneWay: true })
      );

      // Upper containment catwalk
      this.platforms.push(
        new Platform({ x: 420, y: 160, w: 160, h: 20, theme: 'asylum', oneWay: true })
      );
    }
  }

  update(dt = 1, camera = null) {
    if (this.background) {
      this.background.update(dt, camera);
    }
  }

  draw(ctx, camera = null) {
    if (this.background) {
      this.background.draw(ctx, camera);
    }

    // Platforms share the exact world transform used by characters and projectiles.
    ctx.save();
    ctx.translate(-(camera?.renderX ?? 0), -(camera?.renderY ?? 0));
    for (const plat of this.platforms) {
      plat.draw(ctx);
    }
    this.background?.drawSurfaceLighting?.(ctx, this.platforms);
    ctx.restore();
  }
}
