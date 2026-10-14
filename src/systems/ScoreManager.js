import { LOBBY } from '../config/lobby.js';

const natural = value => Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;

/** Placar independente de entidades e cenas. Recebe apenas eventos e tempo ativo. */
export class ScoreManager {
  constructor({ config = LOBBY.scoring, storage } = {}) {
    this.config = config;
    try { this.storage = storage === undefined ? globalThis.localStorage : storage; } catch { this.storage = null; }
    this.bestScore = 0;
    try { this.bestScore = natural(Number(this.storage?.getItem(config.storageKey))); } catch { /* Modo privado: recorde em memória. */ }
    this.reiniciar();
  }
  reiniciar() {
    this.score = 0; this.mobs = 0; this.bosses = 0; this.mobPoints = 0; this.bossPoints = 0;
    this.bonusTotal = 0; this.timeBonus = 0; this.elapsedSeconds = 0; this.levelIndex = 1;
    this.running = false; this.paused = false; this.finished = false; this.pulse = 0;
    this.newRecord = false; this.recordAtStart = this.bestScore;
    this.players = [0, 0]; this.entries = new Map();
  }
  iniciarFase(levelIndex = 1) {
    this.levelIndex = levelIndex; this.elapsedSeconds = 0; this.timeBonus = 0;
    this.running = true; this.paused = false; this.finished = false;
  }
  pausar(value = true) { this.paused = value; }
  pararCronometro() { this.running = false; }
  atualizar(seconds) {
    if (!this.running || this.paused || !Number.isFinite(seconds) || seconds <= 0) return;
    this.elapsedSeconds += seconds;
    this.pulse = Math.max(0, this.pulse - seconds * 1000);
  }
  // Ponto de extensão: combo, itens ou dano poderão transformar o valor aqui.
  aplicarModificadores(points, context) { return points; }
  adicionar(category, type, playerIndex = 0) {
    if (!this.running || this.paused || this.finished) return 0;
    const base = natural(this.config[`${category}Types`][type] ?? this.config[category]);
    const points = natural(this.aplicarModificadores(base, { category, type, playerIndex }));
    const key = `${category}:${type}:${points}`;
    const entry = this.entries.get(key) ?? { category, type, count: 0, unitPoints: points, points: 0 };
    entry.count++; entry.points += points; this.entries.set(key, entry);
    if (category === 'mob') { this.mobs++; this.mobPoints += points; }
    else { this.bosses++; this.bossPoints += points; }
    this.creditar(points, playerIndex);
    return points;
  }
  adicionarPontosMob(type = 'default', playerIndex = 0) { return this.adicionar('mob', type, playerIndex); }
  adicionarPontosChefao(type = 'default', playerIndex = 0) { return this.adicionar('boss', type, playerIndex); }
  creditar(points, playerIndex = 0) {
    this.score += points; this.players[playerIndex === 1 ? 1 : 0] += points;
    if (points > 0) this.pulse = this.config.pulseDuration;
    this.newRecord = this.score > this.recordAtStart;
    if (this.score > this.bestScore) {
      this.bestScore = this.score;
      try { this.storage?.setItem(this.config.storageKey, String(this.bestScore)); } catch { /* Sem armazenamento: a partida continua. */ }
    }
  }
  calcularBonusTempo(seconds = this.elapsedSeconds) {
    // Remove apenas o erro numérico acumulado pelo passo fixo (ex.: 90.00000000001).
    const time = Number.isFinite(seconds) ? Math.max(0, Math.round(seconds * 1e6) / 1e6) : Infinity;
    return natural([...this.config.timeBonuses].sort((a,b) => a.seconds-b.seconds).find(tier => time <= tier.seconds)?.points);
  }
  finalizarFase() {
    if (!this.finished) {
      this.timeBonus = this.calcularBonusTempo(); this.bonusTotal += this.timeBonus;
      this.creditar(this.timeBonus); this.finished = true; this.running = false;
    }
    return this.dados();
  }
  finalizarDerrota() { this.running = false; this.finished = true; return this.dados(); }
  dados() {
    return { score: this.score, bestScore: this.bestScore, elapsedSeconds: this.elapsedSeconds,
      levelIndex: this.levelIndex, mobs: this.mobs, bosses: this.bosses, mobPoints: this.mobPoints,
      bossPoints: this.bossPoints, timeBonus: this.timeBonus, bonusTotal: this.bonusTotal,
      newRecord: this.newRecord, demo: false, scoring: true,
      breakdown: [...this.entries.values()].map(entry => ({ ...entry })),
      players: this.players.map((score, index) => ({ name: `${LOBBY.endScreens.labels.player} ${index + 1}`, score })),
    };
  }
}
