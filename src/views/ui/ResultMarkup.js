// Este arquivo cuida de montar o HTML dos resultados.
// ===== DEPENDÊNCIAS E CONFIGURAÇÕES =====
import { LOBBY } from "../../config/configuracao.js";
import { LOCK_ICON, SOUND_ICON, logoMarkup, escapeHTML } from "./ScreenElements.js";
import { formatPlayTime } from "./formatPlayTime.js";
// Recebe os dados da cena e devolve a estrutura visual original.
export function criarResultadoHTML(result, dados, profile, botoes, volume, resumo) {
  const configuracao = LOBBY.endScreens;
  const labels = configuracao.labels;
  const number = (valor) => valor.toLocaleString("pt-BR");
  const stat = (label, valor, count) => `<div class="result-stat"><dt>${escapeHTML(label)}</dt><dd ${count === undefined ? "" : `data-count="${count}"`}>${escapeHTML(valor)}</dd></div>`;
  return `
      <header class="result-top"><span>${escapeHTML(labels.report)}</span><span>${escapeHTML(labels.city)}</span></header>
      <div class="result-content">
        ${logoMarkup(labels.logo)}
        <p class="result-eyebrow">${escapeHTML(profile.eyebrow)}</p>
        <h1 class="result-title" tabindex="-1">${escapeHTML(profile.title)}</h1>
        <p class="result-description">${escapeHTML(profile.description)}</p>
        <div class="result-divider" aria-hidden="true"><span>◆</span></div>
        <dl class="result-stats">${stat(labels.score, number(dados.score), dados.score)}${stat(labels.bestScore, number(dados.bestScore), dados.bestScore)}${stat(LOBBY.scoring.labels.time, formatPlayTime(dados.elapsedSeconds))}</dl>
        <p class="result-record" ${dados.newRecord ? "" : "hidden"}>${escapeHTML(LOBBY.scoring.labels.record)}</p>
        ${resumo}
        <p class="result-demo" ${dados.demo ? "" : "hidden"}>${escapeHTML(labels.demo)}</p>
        <div class="result-medals" ${result === "victory" ? "" : "hidden"} aria-disabled="true"><span aria-hidden="true">☆ ☆ ☆</span>${escapeHTML(labels.medals)} · ${escapeHTML(labels.soon)}</div>
        <section class="result-team" ${configuracao.features.twoPlayers ? "" : "hidden"} aria-label="${escapeHTML(labels.players)}">${criarJogadoresHTML(dados.players, labels)}</section>
        <aside class="result-skin" ${configuracao.features.skinPreview ? "" : "hidden"}><img class="skin-image" alt="" hidden><span>${escapeHTML(labels.skin)}</span><strong>${escapeHTML(dados.skin.name || labels.skinPlaceholder)}</strong></aside>
        <nav class="result-actions" aria-label="${escapeHTML(labels.report)}">${botoes.map((botao, indice) => criarBotaoResultado(botao, indice, labels)).join("")}</nav>
        <p class="menu-navigation"><kbd>↑</kbd><kbd>↓</kbd> ${escapeHTML(labels.navigation)} <span></span><kbd>ENTER</kbd> ${escapeHTML(labels.select)} <span></span><kbd>ESC</kbd> MENU</p>
      </div>
      <footer class="result-bottom"><span>${escapeHTML(profile.footer)}</span><div class="audio-controls"><span class="audio-caption"></span><input aria-label="${escapeHTML(labels.volume)}" type="range" min="0" max="1" step="0.01" value="${volume}"><button class="mute-button" aria-label="${escapeHTML(labels.mute)}" aria-pressed="false">${SOUND_ICON}</button></div></footer><div class="lobby-grain" aria-hidden="true"></div>`;
}
// Prepara os dois lugares sem ativar o recurso de cooperação.
function criarJogadoresHTML(jogadores, textos) {
  return [0, 1].map((indice) => {
    const jogador = jogadores[indice] ?? {
      name: textos.player + " " + (indice + 1),
      score: 0
    };
    return `<div><span>${escapeHTML(jogador.name)}</span><strong>${jogador.score.toLocaleString("pt-BR")}</strong></div>`;
  }).join("");
}
// Mantém o mesmo ícone e os mesmos atributos para cada ação disponível.
function criarBotaoResultado(botao, indice, labels) {
  let icone = LOCK_ICON;
  if (botao.enabled) icone = indice === 0 ? "↻" : "←";
  return `<button class="lobby-button ${indice === 0 ? "primary" : ""}" data-result-action="${botao.id}" ${botao.enabled ? "" : "disabled"}><span class="menu-icon">${icone}</span><span class="menu-label">${escapeHTML(botao.label)}<small>${escapeHTML(botao.id === "next" && botao.enabled ? labels.nextReady : botao.detail)}</small></span><span class="menu-end">${botao.enabled ? "↵" : LOCK_ICON}</span></button>`;
}
