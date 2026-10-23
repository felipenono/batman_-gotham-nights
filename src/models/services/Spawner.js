// Este arquivo cuida de criar as ondas e contar os abates de cada fase.
import { APARENCIA } from "../../config/configuracao.js";

// ===== DEPENDÊNCIAS E CONFIGURAÇÕES =====
import { ScarecrowAcolyte } from "../entities/villains/ScarecrowAcolyte.js";
import { HarleyThug } from "../entities/villains/HarleyThug.js";
import { TwoFaceEnforcer } from "../entities/villains/TwoFaceEnforcer.js";
import { Joker } from "../entities/villains/Joker.js";
import { Penguin } from "../entities/villains/Penguin.js";
const estiloVisual = APARENCIA.Spawner;
const TIPOS_DE_INIMIGO = {
  Joker,
  Penguin,
  ScarecrowAcolyte,
  HarleyThug,
  TwoFaceEnforcer,
  PenguinElite: Penguin
};
// ===== COMPORTAMENTO =====
export class Spawner {
  /**
  * CONSTRUTOR:
  * Inicializa contadores de tempo e métricas de abates.
  */
  // Recebe as dependências e prepara o estado inicial deste componente.
  constructor() {
    this.timer = 0;
    this.interval = 300;
    this.killsInLevel = 0;
    this.totalKills = 0;
    this.currentLevelConfig = null;
  }
  initLevel(levelConfig) {
    this.currentLevelConfig = levelConfig;
    this.killsInLevel = 0;
    this.timer = 60;
    const difficulty = levelConfig.difficulty ?? 1;
    this.interval = 300 / difficulty;
    this.maxActive = Math.round(5 * difficulty);
    this.timer = 60 / difficulty;
  }
  /**
  * [POO - GETTER COMPUTADO / REGRA DE NEGÓCIO DO CHEFE]
  * Retorna true assim que a cota de 10 inimigos eliminados for atingida.
  *
  * @returns {boolean} True se a meta do estágio foi batida
  */
  get thresholdReached() {
    if (!this.currentLevelConfig) return false;
    return this.killsInLevel >= this.currentLevelConfig.killThreshold;
  }
  /**
  * [POO - MÉTODO MUTADOR DE ESTADO]
  * Registra a eliminação confirmada de um capanga.
  */
  recordKill() {
    this.killsInLevel++;
    this.totalKills++;
  }
  // Recebe a atualização atual e avança o estado, sem redesenhar a tela.
  update(enemiesList, worldWidth = 900, worldHeight = 500, bossActive = false) {
    if (this.thresholdReached || bossActive || !this.currentLevelConfig) {
      return;
    }
    const maxActive = this.maxActive;
    const activeCount = this.contarInimigosAtivos(enemiesList);
    if (activeCount >= maxActive) return;
    this.timer--;
    if (this.timer <= 0) {
      this.timer += this.interval;
      this.spawnWave(enemiesList, worldWidth, worldHeight);
    }
  }
  contarInimigosAtivos(inimigos) {
    let quantidade = 0;
    for (const inimigo of inimigos) {
      if (inimigo.alive) quantidade += 1;
    }
    return quantidade;
  }
  spawnWave(enemiesList, worldWidth, worldHeight) {
    const maxActive = this.maxActive;
    const waveSize = Math.min(3, maxActive - this.contarInimigosAtivos(enemiesList));
    const roster = this.currentLevelConfig.enemyRoster;
    for (let indiceItem = 0; indiceItem < waveSize; indiceItem++) {
      const spawnFromRight = Math.random() > 0.4;
      const posicaoX = spawnFromRight ? worldWidth - 60 - indiceItem * 50 : 40 + indiceItem * 50;
      const posicaoY = worldHeight - 140;
      const tipo = roster[indiceItem % roster.length];
      const inimigo = new TIPOS_DE_INIMIGO[tipo]({
        x: posicaoX,
        y: posicaoY
      });
      // A variante precisa do próprio identificador para aceitar pontos por tipo.
      inimigo.scoreType = tipo;
      if (tipo === "PenguinElite") {
        inimigo.name = "Pinguim de contenção";
        inimigo.variantColor = estiloVisual.gradiente1;
        inimigo.hp = inimigo.maxHp = 30;
        inimigo.speed = 1.6;
      }
      if (inimigo) {
        enemiesList.push(inimigo);
      }
    }
  }
}
