// Este arquivo cuida de controlar a sequência e as transições das fases.

// ===== DEPENDÊNCIAS E CONFIGURAÇÕES =====
import { LEVELS } from "../../config/configuracao.js";
import { Level } from "../world/Level.js";
// ===== COMPORTAMENTO =====
export class LevelManager {
  // Recebe as dependências e prepara o estado inicial deste componente.
  constructor({ onStateChange = null } = {}) {
    this.currentLevelIndex = 1;
    this.totalLevels = 3;
    this.currentLevel = null;
    this.currentLevelConfig = LEVELS.LEVEL_1;
    this.transitionTimer = 0;
    this.transitionDuration = 120;
    this.onStateChange = onStateChange;
  }
  loadLevel(levelIndex = 1) {
    this.currentLevelIndex = levelIndex;
    const configKey = `LEVEL_${levelIndex}`;
    this.currentLevelConfig = LEVELS[configKey] || LEVELS.LEVEL_1;
    this.currentLevel = new Level(this.currentLevelConfig);
    return this.currentLevel;
  }
  triggerLevelComplete(onTransitionComplete) {
    if (this.currentLevelIndex >= this.totalLevels) {
      return "VICTORY";
    }
    this.transitionTimer = this.transitionDuration;
    this.nextLevelIndex = this.currentLevelIndex + 1;
    this.onTransitionComplete = onTransitionComplete;
    return "NEXT_LEVEL";
  }
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

}
