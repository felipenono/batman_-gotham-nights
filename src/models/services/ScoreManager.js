// Este arquivo cuida de registrar pontos, tempo ativo e recordes.
// ===== DEPENDÊNCIAS E CONFIGURAÇÕES =====
import { LOBBY } from "../../config/configuracao.js";
// ===== VALIDAÇÃO E ARMAZENAMENTO =====
// Recebe um valor e devolve um inteiro positivo ou zero, inclusive para dados inválidos.
function converterParaInteiroPositivo(valor) {
  if (!Number.isFinite(valor)) return 0;
  return Math.max(0, Math.floor(valor));
}
function escolherArmazenamento(armazenamento) {
  try {
    if (armazenamento === undefined) return globalThis.localStorage;
    return armazenamento;
  } catch {
    // Alguns navegadores bloqueiam até mesmo o acesso à propriedade localStorage.
    return null;
  }
}
// ===== COMPORTAMENTO =====
export class ScoreManager {
  // Recebe configuração e armazenamento opcionais, sem depender das cenas do jogo.
  // Recebe as dependências e prepara o estado inicial deste componente.
  constructor({ config: configuracao = LOBBY.scoring, storage } = {}) {
    this.config = configuracao;
    this.storage = escolherArmazenamento(storage);
    this.bestScore = this.lerRecorde();
    this.reiniciar();
  }
  lerRecorde() {
    try {
      const valorSalvo = this.storage?.getItem(this.config.storageKey);
      return converterParaInteiroPositivo(Number(valorSalvo));
    } catch {
      return 0;
    }
  }
  salvarRecorde() {
    try {
      this.storage?.setItem(this.config.storageKey, String(this.bestScore));
    } catch {}
  }
  // ===== PARTIDA E CRONÔMETRO =====
  // Limpa uma campanha, preservando o recorde já carregado ou conquistado.
  reiniciar() {
    // Estes campos públicos mantêm os nomes usados pelo HUD e pelas integrações existentes.
    this.score = 0;
    this.mobs = 0;
    this.bosses = 0;
    this.mobPoints = 0;
    this.bossPoints = 0;
    this.bonusTotal = 0;
    this.timeBonus = 0;
    this.elapsedSeconds = 0;
    this.levelIndex = 1;
    this.running = false;
    this.paused = false;
    this.finished = false;
    this.pulse = 0;
    this.newRecord = false;
    this.recordAtStart = this.bestScore;
    this.players = [0, 0];
    this.entries = new Map();
  }
  // Inicia o relógio da fase, mantendo os pontos das fases anteriores.
  iniciarFase(numeroDaFase = 1) {
    this.levelIndex = numeroDaFase;
    this.elapsedSeconds = 0;
    this.timeBonus = 0;
    this.running = true;
    this.paused = false;
    this.finished = false;
  }
  pausar(devePausar = true) {
    this.paused = devePausar;
  }
  pararCronometro() {
    this.running = false;
  }
  // Recebe segundos de jogo ativo; pausas e valores inválidos não avançam o relógio.
  atualizar(segundos) {
    if (!this.running || this.paused) return;
    if (!Number.isFinite(segundos) || segundos <= 0) return;
    this.elapsedSeconds += segundos;
    this.pulse = Math.max(0, this.pulse - segundos * 1000);
  }
  // ===== PONTOS POR ABATE =====
  // Ponto de extensão: no futuro, o contexto permitirá aplicar combos ou itens.
  aplicarModificadores(pontos, contexto) {
    return pontos;
  }
  // Recebe um evento de morte e devolve os pontos concedidos, sem conhecer o inimigo.
  adicionar(categoria, tipo, indiceDoJogador = 0) {
    if (!this.running || this.paused || this.finished) return 0;
    const valoresPorTipo = this.config[`${categoria}Types`];
    const valorBase = valoresPorTipo[tipo] ?? this.config[categoria];
    const contexto = {
      category: categoria,
      type: tipo,
      playerIndex: indiceDoJogador
    };
    const pontosBase = converterParaInteiroPositivo(valorBase);
    const pontos = converterParaInteiroPositivo(this.aplicarModificadores(pontosBase, contexto));
    this.registrarAbate(categoria, tipo, pontos);
    this.creditar(pontos, indiceDoJogador);
    return pontos;
  }
  registrarAbate(categoria, tipo, pontos) {
    const chave = `${categoria}:${tipo}:${pontos}`;
    let registro = this.entries.get(chave);
    if (!registro) {
      registro = {
        category: categoria,
        type: tipo,
        count: 0,
        unitPoints: pontos,
        points: 0
      };
      this.entries.set(chave, registro);
    }
    registro.count += 1;
    registro.points += pontos;
    if (categoria === "mob") {
      this.mobs += 1;
      this.mobPoints += pontos;
    } else {
      this.bosses += 1;
      this.bossPoints += pontos;
    }
  }
  adicionarPontosMob(tipo = "default", indiceDoJogador = 0) {
    return this.adicionar("mob", tipo, indiceDoJogador);
  }
  adicionarPontosChefao(tipo = "default", indiceDoJogador = 0) {
    return this.adicionar("boss", tipo, indiceDoJogador);
  }
  // Soma pontos ao total e ao jogador correspondente, atualizando o recorde imediatamente.
  creditar(pontos, indiceDoJogador = 0) {
    const jogador = indiceDoJogador === 1 ? 1 : 0;
    this.score += pontos;
    this.players[jogador] += pontos;
    if (pontos > 0) this.pulse = this.config.pulseDuration;
    this.newRecord = this.score > this.recordAtStart;
    if (this.score > this.bestScore) {
      this.bestScore = this.score;
      this.salvarRecorde();
    }
  }
  // ===== CONCLUSÃO E DADOS PARA A INTERFACE =====
  // Recebe segundos e escolhe a menor faixa que inclui esse tempo, mesmo fora de ordem.
  calcularBonusTempo(segundos = this.elapsedSeconds) {
    let tempo = Infinity;
    if (Number.isFinite(segundos)) {
      tempo = Math.max(0, Math.round(segundos * 1000000) / 1000000);
    }
    let faixaEscolhida = null;
    for (const faixa of this.config.timeBonuses) {
      if (tempo > faixa.seconds) continue;
      if (faixaEscolhida === null || faixa.seconds < faixaEscolhida.seconds) {
        faixaEscolhida = faixa;
      }
    }
    return converterParaInteiroPositivo(faixaEscolhida?.points);
  }
  // Encerra uma fase vencida. Chamadas repetidas não concedem bônus novamente.
  finalizarFase() {
    if (!this.finished) {
      this.timeBonus = this.calcularBonusTempo();
      this.bonusTotal += this.timeBonus;
      this.creditar(this.timeBonus);
      this.finished = true;
      this.running = false;
    }
    return this.dados();
  }
  finalizarDerrota() {
    this.running = false;
    this.finished = true;
    return this.dados();
  }
  // Devolve uma cópia do resumo; a tela final não consegue alterar os registros internos.
  dados() {
    return {
      score: this.score,
      bestScore: this.bestScore,
      elapsedSeconds: this.elapsedSeconds,
      levelIndex: this.levelIndex,
      mobs: this.mobs,
      bosses: this.bosses,
      mobPoints: this.mobPoints,
      bossPoints: this.bossPoints,
      timeBonus: this.timeBonus,
      bonusTotal: this.bonusTotal,
      newRecord: this.newRecord,
      demo: false,
      scoring: true,
      breakdown: [...this.entries.values()].map((registro) => ({ ...registro })),
      players: this.players.map((pontos, indice) => ({
        name: `${LOBBY.endScreens.labels.player} ${indice + 1}`,
        score: pontos
      }))
    };
  }
}
