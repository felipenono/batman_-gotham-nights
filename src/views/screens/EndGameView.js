import { LOBBY, assetURL } from '../../config/configuracao.js';
import { GothamBackdrop } from '../scenes/GothamBackdrop.js';
import { criarResultadoHTML } from '../ui/ResultMarkup.js';
import { loadLogo, escapeHTML } from '../ui/ScreenElements.js';

export class EndGameView {
  constructor() {this.backgrounds=new Map();this.counters=[];}
  prepareBackground(result,profile) {
    if (!this.backgrounds.has(result)) {
      this.backgrounds.set(result, new GothamBackdrop({
        ...profile.background,
        weather: {
          fogColor: LOBBY.endScreens.colors.fog,
          rainColor: LOBBY.endScreens.colors.rain,
          ...profile.background.weather
        }
      }));
    }
    this.backdrop = this.backgrounds.get(result);

  }
  mount(state) {
    this.aplicarEstilos(state);
    state.root.innerHTML=criarResultadoHTML(state.result,state.data,state.profile,state.buttons,state.audio.volume,this.scoreSummary(state));
    loadLogo(state.root);
    this.counters=[...state.root.querySelectorAll('[data-count]')];
    this.updateCounters(state);this.carregarSkin(state);
  }
  aplicarEstilos(state) {
    const result=state.result;

    const configuracao = LOBBY.endScreens;
    const profile = state.profile;
    state.root.classList.add("lobby", "end-screen", `end-${result}`);
    state.root.style.setProperty("--lobby-accent", profile.accent);
    state.root.style.setProperty("--lobby-text", configuracao.colors.text);
    state.root.style.setProperty("--lobby-pulse", `${LOBBY.motion.pulse}ms`);
    state.root.style.setProperty("--result-accent", profile.accent);
    state.root.style.setProperty("--result-glow", profile.glow);
    state.root.style.setProperty("--result-entrance", `${configuracao.titleEntrance}ms`);
    for (const [chave, cor] of Object.entries(configuracao.colors)) state.root.style.setProperty(`--result-${chave}`, cor);

  }
  carregarSkin(state) {

    const configuracao = LOBBY.endScreens;
    const skinPath = state.data.skin.image || configuracao.assets.skinPlaceholder;
    if (configuracao.features.skinPreview && skinPath) {
      const imagem = state.root.querySelector(".skin-image");
      imagem.onload = () => {
        imagem.hidden = false;
      };
      imagem.onerror = () => {
        imagem.hidden = true;
      };
      imagem.src = assetURL(skinPath);
    }

  }
  scoreSummary(state) {

    if (!state.data.scoring) return "";
    const labels = LOBBY.scoring.labels;
    const row = (label, detail, valor) => `<div><dt>${escapeHTML(label)}<small>${escapeHTML(detail)}</small></dt><dd data-count="${valor}">${valor.toLocaleString("pt-BR")}</dd></div>`;
    const detail = (category) => {
      const groups = new Map();
      for (const entry of state.data.breakdown.filter((item) => item.category === category)) groups.set(entry.unitPoints, (groups.get(entry.unitPoints) ?? 0) + entry.count);
      return [...groups].map(([points, count]) => `${count} × ${points.toLocaleString("pt-BR")}`).join(" + ") || "0";
    };
    let rows = row(labels.mobs, detail("mob"), state.data.mobPoints) + row(labels.bosses, detail("boss"), state.data.bossPoints);
    if (state.result === "victory") rows += row(labels.bonus, "", state.data.timeBonus);
    const previous = Math.max(0, state.data.bonusTotal - state.data.timeBonus);
    if (previous) rows += row(labels.previousBonus, "", previous);
    return `<dl class="result-breakdown">${rows}</dl>`;

  }
  updateCounters(state) {

    const progress = state.reduced || state.result !== "victory" ? 1 : Math.min(1, state.time / LOBBY.scoring.countDuration);
    const eased = 1 - (1 - progress) ** 3;
    for (const node of this.counters ?? []) {
      const text = Math.floor(Number(node.dataset.count) * eased).toLocaleString("pt-BR");
      if (node.textContent !== text) node.textContent = text;
    }

  }

  draw(contexto, largura, altura, state) {
    const aspect = state.root?.clientHeight ? state.root.clientWidth / state.root.clientHeight : null;
    state.backdrop.draw(contexto, largura, altura, state.time, state.pointer, state.reduced, aspect);
    const particles = state.profile.particles, segundos = state.reduced ? 0 : state.time / 1000;
    contexto.save();
    contexto.globalCompositeOperation = "lighter";
    contexto.fillStyle = LOBBY.endScreens.colors.sparkle;
    for (let indiceItem = 0; indiceItem < particles.count; indiceItem++) {
      const progress = (indiceItem * 0.618034 + segundos * particles.speed) % 1;
      const posicaoX = ((indiceItem * 0.381966 + Math.sin(segundos * 0.2 + indiceItem) * 0.008) % 1 + 1) % 1;
      contexto.globalAlpha = Math.sin(progress * Math.PI) * particles.opacity;
      contexto.fillRect(posicaoX * largura, (1 - progress) * altura, 0.7 + indiceItem % 2, 0.7 + indiceItem % 2);
    }
    contexto.restore();

  }
  unmount(state) {
    this.counters=[];    if (!state.root) return;
    state.root.classList.remove("lobby", "end-screen", "end-defeat", "end-victory");
    for (const property of [
      "--lobby-accent",
      "--lobby-text",
      "--lobby-pulse"
    ]) state.root.style.removeProperty(property);
    state.root.onpointermove = null;

  }
}
