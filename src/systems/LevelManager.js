// Este arquivo cuida de controlar a sequência e as transições das fases.
import { APARENCIA } from "../config/configuracao.js";

// ===== DEPENDÊNCIAS E CONFIGURAÇÕES =====
import { LEVELS } from "../config/configuracao.js";
import { Level } from "../world/Level.js";
const estiloVisual = APARENCIA.LevelManager;
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
  drawTransition(contexto, largura = 900, altura = 500) {
    if (this.transitionTimer <= 0) return;
    const nextConfig = LEVELS[`LEVEL_${this.nextLevelIndex}`] || this.currentLevelConfig;
    contexto.save();
    contexto.fillStyle = estiloVisual.preenchimento1;
    contexto.fillRect(0, 0, largura, altura);
    contexto.strokeStyle = estiloVisual.contorno2;
    contexto.lineWidth = 3;
    contexto.strokeRect(30, 30, largura - 60, altura - 60);
    contexto.strokeStyle = estiloVisual.contorno3;
    contexto.lineWidth = 1;
    contexto.strokeRect(36, 36, largura - 72, altura - 72);
    contexto.textAlign = "center";
    contexto.textBaseline = "middle";
    contexto.font = estiloVisual.fonte1;
    contexto.fillStyle = estiloVisual.preenchimento4;
    contexto.letterSpacing = "0px";
    contexto.fillText(estiloVisual.texto1, largura / 2, altura / 2 - 40);
    contexto.font = estiloVisual.fonte2;
    contexto.fillStyle = estiloVisual.preenchimento5;
    contexto.shadowColor = estiloVisual.brilho6;
    contexto.shadowBlur = 15;
    contexto.fillText(`FASE ${this.nextLevelIndex} — ${nextConfig.name}`, largura / 2, altura / 2);
    contexto.shadowBlur = 0;
    contexto.font = estiloVisual.fonte3;
    contexto.fillStyle = estiloVisual.preenchimento7;
    contexto.fillText(`"${nextConfig.subtitle || ""}"`, largura / 2, altura / 2 + 42);
    contexto.restore();
  }
}
