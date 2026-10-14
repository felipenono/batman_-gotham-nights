/**
 * @file LevelManager.js
 * Controls stage sequencing, level data loading, and seamless 2-second animated transitions.
 */

import { LEVELS } from '../utils/constants.js';
import { Level } from '../world/Level.js';

export class LevelManager {
  /**
   * @param {Object} options
   * @param {Function} options.onStateChange
   */
  constructor({ onStateChange = null } = {}) {
    this.currentLevelIndex = 1;
    this.totalLevels = 3;
    this.currentLevel = null;
    this.currentLevelConfig = LEVELS.LEVEL_1;
    this.transitionTimer = 0;
    this.transitionDuration = 120; // 2 seconds at 60fps
    this.onStateChange = onStateChange;
  }

  /**
   * Initializes or loads stage by index (1, 2, 3).
   * @param {number} levelIndex
   * @returns {Level}
   */
  loadLevel(levelIndex = 1) {
    this.currentLevelIndex = levelIndex;
    const configKey = `LEVEL_${levelIndex}`;
    this.currentLevelConfig = LEVELS[configKey] || LEVELS.LEVEL_1;
    this.currentLevel = new Level(this.currentLevelConfig);
    return this.currentLevel;
  }

  /**
   * Triggers transition to next stage or victory if final boss cleared.
   * @param {Function} onTransitionComplete
   * @returns {'NEXT_LEVEL' | 'VICTORY'}
   */
  triggerLevelComplete(onTransitionComplete) {
    if (this.currentLevelIndex >= this.totalLevels) {
      return 'VICTORY';
    }

    this.transitionTimer = this.transitionDuration;
    this.nextLevelIndex = this.currentLevelIndex + 1;
    this.onTransitionComplete = onTransitionComplete;
    return 'NEXT_LEVEL';
  }

  /**
   * Updates transition timer countdown.
   */
  updateTransition() {
    if (this.transitionTimer > 0) {
      this.transitionTimer--;
      if (this.transitionTimer <= 0) {
        this.loadLevel(this.nextLevelIndex);
        if (this.onTransitionComplete) {
          this.onTransitionComplete();
          this.onTransitionComplete = null;
        }
      }
    }
  }

  /**
   * Renders the stylish Cuphead-style black fade transition banner.
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} width
   * @param {number} height
   */
  drawTransition(ctx, width = 900, height = 500) {
    if (this.transitionTimer <= 0) return;

    const nextConfig = LEVELS[`LEVEL_${this.nextLevelIndex}`] || this.currentLevelConfig;

    ctx.save();
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, width, height);

    // Decorative art deco gold frame
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 3;
    ctx.strokeRect(30, 30, width - 60, height - 60);
    ctx.strokeStyle = '#854d0e';
    ctx.lineWidth = 1;
    ctx.strokeRect(36, 36, width - 72, height - 72);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Subtitle
    ctx.font = '700 16px "Courier New", monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.letterSpacing = '0px';
    ctx.fillText('FASE CONCLUÍDA — PRÓXIMA MISSÃO', width / 2, height / 2 - 40);

    // Main Stage Title
    ctx.font = '900 28px "Arial Black", Impact, sans-serif';
    ctx.fillStyle = '#fef08a';
    ctx.shadowColor = '#ca8a04';
    ctx.shadowBlur = 15;
    ctx.fillText(`FASE ${this.nextLevelIndex} — ${nextConfig.name}`, width / 2, height / 2);

    // Subtitle description
    ctx.shadowBlur = 0;
    ctx.font = '600 18px "Trebuchet MS", sans-serif';
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText(`"${nextConfig.subtitle || ''}"`, width / 2, height / 2 + 42);

    ctx.restore();
  }
}
