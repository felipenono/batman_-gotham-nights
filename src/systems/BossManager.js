// Este arquivo cuida de controlar a sequência de chefões e suas apresentações.
import { APARENCIA } from "../config/configuracao.js";

// ===== DEPENDÊNCIAS E CONFIGURAÇÕES =====
import { JokerBoss } from "../entities/villains/JokerBoss.js";
import { GAME } from "../config/configuracao.js";
import { Scarecrow } from "../entities/villains/Scarecrow.js";
import { HarleyQuinn } from "../entities/villains/HarleyQuinn.js";
import { TwoFace } from "../entities/villains/TwoFace.js";
const estiloVisual = APARENCIA.BossManager;
// ===== COMPORTAMENTO =====
export class BossManager {
  // Recebe as dependências e prepara o estado inicial deste componente.
  constructor() {
    this.boss = null;
    this.bossSpawned = false;
    this.bossDefeated = false;
    this.deathTimer = GAME.DEATH_ANIMATION_FRAMES;
    this.bossIndex = 0;
    this.bossTypes = [];
    this.introTimer = 0;
  }
  /**
  * [POO - RESET DE ESTADO / LIMPEZA DE CICLO]
  * Zera as variáveis de controle para transição de estágios ou reinício de jogo.
  */
  reset() {
    this.deathTimer = GAME.DEATH_ANIMATION_FRAMES;
    this.bossIndex = 0;
    this.bossTypes = [];
    this.boss = null;
    this.bossSpawned = false;
    this.bossDefeated = false;
    this.introTimer = 0;
  }
  spawnBoss(levelConfig, worldWidth = 900, worldHeight = 500) {
    if (this.bossSpawned) return;
    this.bossTypes = levelConfig.bosses || [levelConfig.boss];
    this.bossIndex = 0;
    this.worldWidth = worldWidth;
    this.worldHeight = worldHeight;
    this._spawnCurrentBoss();
  }
  _spawnCurrentBoss() {
    const factories = {
      Joker: JokerBoss,
      Scarecrow,
      HarleyQuinn,
      TwoFace
    };
    const Boss = factories[this.bossTypes[this.bossIndex]] || Scarecrow;
    this.boss = new Boss({
      x: this.worldWidth - 140,
      y: this.worldHeight - 170
    });
    this.bossSpawned = true;
    this.bossDefeated = false;
    this.deathTimer = GAME.DEATH_ANIMATION_FRAMES;
    this.introTimer = 100;
  }
  // Recebe a atualização atual e avança o estado, sem redesenhar a tela.
  update(onBossDefeated, onBossChanged = null) {
    if (this.introTimer > 0) this.introTimer--;
    if (this.boss && !this.boss.alive && !this.bossDefeated) {
      if (this.deathTimer-- > 0) return;
      if (this.bossIndex + 1 < this.bossTypes.length) {
        this.bossIndex++;
        this._spawnCurrentBoss();
        if (onBossChanged) onBossChanged(this.boss);
        return;
      }
      this.bossDefeated = true;
      if (onBossDefeated) {
        onBossDefeated(this.boss);
      }
    }
  }
  drawIntro(contexto, canvasWidth = 900, canvasHeight = 500) {
    if (this.introTimer <= 0 || !this.boss) return;
    contexto.save();
    const opacidade = Math.min(1, this.introTimer / 30);
    contexto.globalAlpha = opacidade;
    contexto.fillStyle = estiloVisual.preenchimento1;
    contexto.fillRect(0, canvasHeight / 2 - 45, canvasWidth, 90);
    contexto.strokeStyle = estiloVisual.contorno2;
    contexto.lineWidth = 2.5;
    contexto.beginPath();
    contexto.moveTo(0, canvasHeight / 2 - 45);
    contexto.lineTo(canvasWidth, canvasHeight / 2 - 45);
    contexto.moveTo(0, canvasHeight / 2 + 45);
    contexto.lineTo(canvasWidth, canvasHeight / 2 + 45);
    contexto.stroke();
    contexto.textAlign = "center";
    contexto.textBaseline = "middle";
    contexto.font = estiloVisual.fonte1;
    contexto.fillStyle = estiloVisual.preenchimento3;
    contexto.shadowColor = estiloVisual.brilho4;
    contexto.shadowBlur = 10;
    contexto.fillText(`ATENÇÃO: ${this.boss.name.toUpperCase()} CHEGOU!`, canvasWidth / 2, canvasHeight / 2);
    contexto.restore();
  }
}
