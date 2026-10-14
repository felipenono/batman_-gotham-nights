// Este arquivo cuida de montar o HTML do lobby.
// ===== DEPENDÊNCIAS E CONFIGURAÇÕES =====
import { LOBBY } from "../config/configuracao.js";
import { LOCK_ICON as lock, SOUND_ICON as speaker, logoMarkup } from "./ScreenElements.js";
// Recebe o volume atual e devolve o menu com os botões configurados.
export function criarMenuHTML(volume) {
  return `
      <header class="lobby-top"><a class="studio-mark" href="#" aria-label="${LOBBY.textosMenu.marcaAcessivel}"><span class="brand-square">${LOBBY.textosMenu.selo}</span><span>${LOBBY.textosMenu.marcaLinha1}<br><b>${LOBBY.textosMenu.marcaLinha2}</b></span></a><span class="edition">${LOBBY.textosMenu.genero} <i></i> ${LOBBY.textosMenu.edicao}</span></header>
      <div class="lobby-content">${logoMarkup()}
      <p class="lobby-kicker">${LOBBY.textosMenu.chamada}</p><h1 class="lobby-title">${LOBBY.textosMenu.titulo}<span>${LOBBY.textosMenu.subtitulo}</span></h1>
      <p class="lobby-description">${LOBBY.textosMenu.descricao}</p>
      <nav class="lobby-menu" aria-label="${LOBBY.textosMenu.menu}">${LOBBY.buttons.map(criarBotaoMenu).join("")}</nav>
      <p class="menu-navigation"><kbd>↑</kbd><kbd>↓</kbd> ${LOBBY.textosMenu.navegar} <span></span><kbd>ENTER</kbd> ${LOBBY.textosMenu.selecionar}</p></div>
      <footer class="lobby-bottom"><div class="city-status"><i></i> ${LOBBY.textosMenu.cidade} <span>•</span> ${LOBBY.textosMenu.horario} <small>${LOBBY.textosMenu.rodape}</small></div><div class="audio-controls"><span class="audio-caption">${LOBBY.menuLabels.music}</span><input aria-label="${LOBBY.textosMenu.volume}" type="range" min="0" max="1" step="0.01" value="${volume}"><button class="mute-button" aria-label="${LOBBY.menuLabels.mute}" aria-pressed="false">${speaker}</button></div></footer><div class="lobby-grain" aria-hidden="true"></div>`;
}
// Recebe um botão configurado e mantém sua aparência e estado de bloqueio.
function criarBotaoMenu(botao, indice) {
  return `<button class="lobby-button ${indice === 0 ? "primary" : ""}" data-menu-id="${botao.id}" ${botao.enabled ? "" : "disabled"}><span class="menu-icon">${botao.enabled ? "▶" : lock}</span><span class="menu-label">${botao.label}<small>${botao.detail}</small></span><span class="menu-end">${botao.enabled ? "↵" : lock}</span></button>`;
}
