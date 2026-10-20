import { LOBBY } from '../../config/configuracao.js';
import { escapeHTML } from '../ui/ScreenElements.js';

export class PauseView {
  mount(root,onResume) {
    const configuracao = LOBBY.scoring;
    root.style.setProperty("--score-font", configuracao.font);
    for (const [chave, valor] of Object.entries(configuracao.colors)) root.style.setProperty(`--score-${chave}`, valor);
    root.innerHTML = `<div class="pause-panel"><h1>${escapeHTML(configuracao.labels.paused)}</h1><button>${escapeHTML(configuracao.labels.resume)}</button><p>${escapeHTML(configuracao.labels.resumeHint)}</p></div>`;
    const botao = root.querySelector("button");
    botao.onclick = onResume;
    botao.focus();

  }
}
