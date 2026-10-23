// Este arquivo cuida de validar e copiar dados dos resultados.
// ===== DEPENDÊNCIAS E CONFIGURAÇÕES =====
import { LOBBY } from "../../config/configuracao.js";
// ===== VALIDAÇÃO DOS CAMPOS =====
function inteiroOuPadrao(valor, padrao) {
  if (!Number.isFinite(valor)) return padrao;
  return Math.max(0, Math.floor(valor));
}
function copiarAbates(registros) {
  if (!Array.isArray(registros)) return [];
  return registros.filter((registro) => registro != null).map((registro) => ({
    category: registro.category === "boss" ? "boss" : "mob",
    type: String(registro.type ?? ""),
    count: inteiroOuPadrao(registro.count, 0),
    unitPoints: inteiroOuPadrao(registro.unitPoints, 0),
    points: inteiroOuPadrao(registro.points, 0)
  }));
}
function copiarJogadores(jogadores) {
  if (!Array.isArray(jogadores)) return [];
  return jogadores.slice(0, 2).map((jogador, indice) => ({
    name: String(jogador?.name ?? `${LOBBY.endScreens.labels.player} ${indice + 1}`),
    score: inteiroOuPadrao(jogador?.score, 0)
  }));
}
function copiarPontuacao(dados) {
  return {
    scoring: Boolean(dados.scoring),
    newRecord: Boolean(dados.newRecord),
    mobs: inteiroOuPadrao(dados.mobs, 0),
    bosses: inteiroOuPadrao(dados.bosses, 0),
    mobPoints: inteiroOuPadrao(dados.mobPoints, 0),
    bossPoints: inteiroOuPadrao(dados.bossPoints, 0),
    timeBonus: inteiroOuPadrao(dados.timeBonus, 0),
    bonusTotal: inteiroOuPadrao(dados.bonusTotal, 0),
    breakdown: copiarAbates(dados.breakdown)
  };
}
// ===== DADOS PÚBLICOS =====
// Recebe os dados da partida e devolve uma cópia independente para a tela.
export function normalizeResultData(dados = {}) {
  dados = dados ?? {};
  const exemplo = LOBBY.endScreens.demo;
  const camposObrigatorios = [
    "score",
    "bestScore",
    "elapsedSeconds"
  ];
  const dadosCompletos = camposObrigatorios.every((campo) => Number.isFinite(dados[campo]));
  return {
    score: inteiroOuPadrao(dados.score, exemplo.score),
    bestScore: inteiroOuPadrao(dados.bestScore, exemplo.bestScore),
    elapsedSeconds: inteiroOuPadrao(dados.elapsedSeconds, exemplo.elapsedSeconds),
    totalElapsedSeconds: inteiroOuPadrao(dados.totalElapsedSeconds, inteiroOuPadrao(dados.elapsedSeconds, exemplo.elapsedSeconds)),
    levelIndex: Math.max(1, inteiroOuPadrao(dados.levelIndex, exemplo.levelIndex)),
    demo: dados.demo ?? !dadosCompletos,
    ...copiarPontuacao(dados),
    players: copiarJogadores(dados.players),
    skin: {
      name: String(dados.skin?.name ?? ""),
      image: String(dados.skin?.image ?? "")
    }
  };
}
