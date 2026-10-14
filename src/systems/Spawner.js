import { ScarecrowAcolyte } from '../entities/villains/ScarecrowAcolyte.js';
import { HarleyThug } from '../entities/villains/HarleyThug.js';
import { TwoFaceEnforcer } from '../entities/villains/TwoFaceEnforcer.js';
/**
 * ============================================================================
 * @file Spawner.js
 * @category POO - Gerenciador de Ondas & Fábrica de Inimigos (Factory / Spawner Pattern)
 * ============================================================================
 * CONCEITOS DE PROGRAMAÇÃO ORIENTADA A OBJETOS (POO):
 * 
 * 1. ENCAPSULAMENTO DE PROGRESSÃO DE ESTÁGIO:
 *    Mantém o estado da contagem de baixas da fase (killsInLevel) e globais (totalKills).
 *    Expõe um Getter computado 'thresholdReached' que informa se o jogador já
 *    eliminou os 10 inimigos necessários para liberar o chefe da fase.
 * 
 * 2. PADRÃO FÁBRICA (Factory Pattern):
 *    No método spawnWave(), decide polimorficamente qual classe de inimigo instanciar
 *    (new Joker() ou new Penguin()) baseado na configuração do nível atual.
 * ============================================================================
 */

import { Joker } from '../entities/villains/Joker.js';
import { Penguin } from '../entities/villains/Penguin.js';

export class Spawner {
  /**
   * CONSTRUTOR:
   * Inicializa contadores de tempo e métricas de abates.
   */
  constructor() {
    this.timer = 0;                  // Contador regressivo para a próxima onda
    this.interval = 300;             // Intervalo padrão de 5 segundos (300 frames a 60fps)
    this.killsInLevel = 0;           // Abates no estágio corrente
    this.totalKills = 0;             // Abates acumulados em toda a campanha
    this.currentLevelConfig = null;  // Configuração ativa do nível
  }

  /**
   * [POO - ENCAPSULAMENTO: MÉTODO DE INICIALIZAÇÃO DE ESTÁGIO]
   * Configura o spawner para o estágio carregado.
   *
   * @param {Object} levelConfig - Objeto de configuração da fase
   */
  initLevel(levelConfig) {
    this.currentLevelConfig = levelConfig;
    this.killsInLevel = 0;
    this.timer = 60; // Pausa de 1 segundo antes da primeira onda
    this.interval = levelConfig.id === 3 ? 360 : 300;
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

  /**
   * Updates wave spawn timer and instantiates enemies.
   * @param {Array<Character>} enemiesList
   * @param {number} worldWidth
   * @param {number} worldHeight
   * @param {boolean} bossActive
   */
  update(enemiesList, worldWidth = 900, worldHeight = 500, bossActive = false) {
    if (this.thresholdReached || bossActive || !this.currentLevelConfig) {
      return;
    }

    // Limit maximum active common enemies on screen
    const maxActive = this.currentLevelConfig.id === 3 ? 4 : 5;
    const activeCount = enemiesList.filter((e) => e.alive).length;
    if (activeCount >= maxActive) return;

    this.timer--;
    if (this.timer <= 0) {
      this.timer = this.interval;
      this.spawnWave(enemiesList, worldWidth, worldHeight);
    }
  }

  spawnWave(enemiesList, worldWidth, worldHeight) {
    const maxActive = this.currentLevelConfig.id === 3 ? 4 : 5;
    const waveSize = Math.min(this.currentLevelConfig.id === 3 ? 2 : 3, maxActive-enemiesList.filter(e=>e.alive).length);
    const roster=this.currentLevelConfig.enemyRoster;
    const factories={Joker, Penguin, ScarecrowAcolyte, HarleyThug, TwoFaceEnforcer, PenguinElite:Penguin};

    for (let i = 0; i < waveSize; i++) {
      const spawnFromRight = Math.random() > 0.4;
      const x = spawnFromRight ? worldWidth - 60 - i * 50 : 40 + i * 50;
      const y = worldHeight - 140;

      const type=roster[i % roster.length];
      const enemy=new factories[type]({x,y});
      if(type==='PenguinElite'){enemy.name='Pinguim de contenção';enemy.variantColor='#38bdf8';enemy.hp=enemy.maxHp=30;enemy.speed=1.6;}

      if (enemy) {
        enemiesList.push(enemy);
      }
    }
  }
}
