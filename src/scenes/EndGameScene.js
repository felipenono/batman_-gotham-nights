// Este arquivo cuida de coordenar a tela compartilhada de vitória e derrota.
// ===== DEPENDÊNCIAS E CONFIGURAÇÕES =====
import { criarResultadoHTML } from "../ui/ResultMarkup.js";
import { ScreenAudioControls } from "../ui/ScreenAudioControls.js";
import { LOBBY, assetURL } from "../config/configuracao.js";
import { ScreenAudioManager } from "../audio/ScreenAudioManager.js";
import { GothamBackdrop } from "./GothamBackdrop.js";
import { ScreenNavigation } from "../ui/ScreenNavigation.js";
import { loadLogo, escapeHTML } from "../ui/ScreenElements.js";
import { normalizeResultData } from "../utils/resultData.js";
import { formatPlayTime } from "../utils/formatPlayTime.js";
// Mantém os imports existentes enquanto os consumidores migram para os utilitários.
export { normalizeResultData, formatPlayTime };
/** Cena base de vitória/derrota. Recebe dados e serviços explicitamente por parâmetros. */
// ===== COMPORTAMENTO =====
export class EndGameScene {
  // Recebe as dependências e prepara o estado inicial deste componente.
  constructor(raiz, { sound, goTo, isTransitioning }) {
    this.root = raiz;
    this.sound = sound;
    this.goTo = goTo;
    this.isTransitioning = isTransitioning;
    this.audio = new ScreenAudioManager(sound);
    this.backgrounds = new Map();
    this.time = 0;
    this.pointer = 0;
    this.reduced = globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    this.prepare("defeat", {});
  }
  // ===== PREPARAÇÃO E MONTAGEM =====
  prepare(result, dados) {
    const profile = LOBBY.endScreens.screens[result];
    if (!profile) throw new Error(`Resultado desconhecido: ${result}`);
    this.result = result;
    this.profile = profile;
    this.data = normalizeResultData(dados);
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
    this.time = 0;
    this.pointer = 0;
    this.backdrop.batSignal.enter(0);
    this.buttons = profile.buttons.map((botao) => ({
      ...botao,
      enabled: botao.id === "next" ? LOBBY.endScreens.features.nextLevel || botao.enabled : botao.enabled
    }));
  }
  // Recebe o resultado da partida e conecta apenas os recursos usados por esta tela.
  // Prepara os elementos e eventos usados enquanto esta tela estiver aberta.
  mount(result, dados) {
    this.prepare(result, dados);
    this.audio.configure(this.profile.audio);
    this.audio.enter();
    if (!this.root) return;
    const profile = this.profile;
    this.aplicarEstilos(result);
    this.root.innerHTML = criarResultadoHTML(result, this.data, profile, this.buttons, this.audio.volume, this.scoreSummary());
    loadLogo(this.root);
    this.counters = [...this.root.querySelectorAll("[data-count]")];
    this.updateCounters();
    this.carregarSkin();
    this.prepararInteracao();
    this.root.querySelector("h1").focus({ preventScroll: true });
    this.sound.playSfx(profile.audio.cue);
    this.syncAudio();
  }
  // Aplica somente os valores visuais já definidos na configuração.
  aplicarEstilos(result) {
    const configuracao = LOBBY.endScreens;
    const profile = this.profile;
    this.root.classList.add("lobby", "end-screen", `end-${result}`);
    this.root.style.setProperty("--lobby-accent", profile.accent);
    this.root.style.setProperty("--lobby-text", configuracao.colors.text);
    this.root.style.setProperty("--lobby-pulse", `${LOBBY.motion.pulse}ms`);
    this.root.style.setProperty("--result-accent", profile.accent);
    this.root.style.setProperty("--result-glow", profile.glow);
    this.root.style.setProperty("--result-entrance", `${configuracao.titleEntrance}ms`);
    for (const [chave, cor] of Object.entries(configuracao.colors)) this.root.style.setProperty(`--result-${chave}`, cor);
  }
  carregarSkin() {
    const configuracao = LOBBY.endScreens;
    const skinPath = this.data.skin.image || configuracao.assets.skinPlaceholder;
    if (configuracao.features.skinPreview && skinPath) {
      const imagem = this.root.querySelector(".skin-image");
      imagem.onload = () => {
        imagem.hidden = false;
      };
      imagem.onerror = () => {
        imagem.hidden = true;
      };
      imagem.src = assetURL(skinPath);
    }
  }
  prepararInteracao() {
    const labels = LOBBY.endScreens.labels;
    this.navigation = new ScreenNavigation(this.root, {
      activate: (id) => this.activate(id),
      blocked: () => this.blocked(),
      gesture: () => this.audio.unlock(),
      back: () => this.activate("menu")
    });
    this.navigation.mount();
    this.controlesAudio = new ScreenAudioControls(this.root, this.audio, this.sound, labels);
    this.root.onpointermove = (evento) => {
      const box = this.root.getBoundingClientRect();
      this.pointer = (evento.clientX - box.left) / Math.max(1, box.width) * 2 - 1;
    };
  }
  // ===== PONTUAÇÃO E AÇÕES =====
  blocked() {
    return this.isTransitioning() || this.time < LOBBY.endScreens.inputDelay;
  }
  /** Agrupa valores iguais, mantendo a conta correta quando cada tipo vale pontos diferentes. */
  scoreSummary() {
    if (!this.data.scoring) return "";
    const labels = LOBBY.scoring.labels;
    const row = (label, detail, valor) => `<div><dt>${escapeHTML(label)}<small>${escapeHTML(detail)}</small></dt><dd data-count="${valor}">${valor.toLocaleString("pt-BR")}</dd></div>`;
    const detail = (category) => {
      const groups = new Map();
      for (const entry of this.data.breakdown.filter((item) => item.category === category)) groups.set(entry.unitPoints, (groups.get(entry.unitPoints) ?? 0) + entry.count);
      return [...groups].map(([points, count]) => `${count} × ${points.toLocaleString("pt-BR")}`).join(" + ") || "0";
    };
    let rows = row(labels.mobs, detail("mob"), this.data.mobPoints) + row(labels.bosses, detail("boss"), this.data.bossPoints);
    if (this.result === "victory") rows += row(labels.bonus, "", this.data.timeBonus);
    const previous = Math.max(0, this.data.bonusTotal - this.data.timeBonus);
    if (previous) rows += row(labels.previousBonus, "", previous);
    return `<dl class="result-breakdown">${rows}</dl>`;
  }
  updateCounters() {
    const progress = this.reduced || this.result !== "victory" ? 1 : Math.min(1, this.time / LOBBY.scoring.countDuration);
    const eased = 1 - (1 - progress) ** 3;
    for (const node of this.counters ?? []) {
      const text = Math.floor(Number(node.dataset.count) * eased).toLocaleString("pt-BR");
      if (node.textContent !== text) node.textContent = text;
    }
  }
  activate(id) {
    const botao = this.buttons.find((item) => item.id === id);
    if (!botao?.enabled || this.blocked()) return false;
    this.audio.unlock();
    const destinoAudio = id === "next" ? LOBBY.endScreens.nextScene : botao.scene;
    const accepted = this.goTo(destinoAudio, {
      ...this.data,
      nextLevelIndex: this.data.levelIndex + 1
    });
    if (accepted) this.audio.playClick();
    return accepted;
  }
  syncAudio() {
    this.controlesAudio?.atualizar();
  }
  // ===== ATUALIZAÇÃO, DESENHO E SAÍDA =====
  // Recebe a atualização atual e avança o estado, sem redesenhar a tela.
  update(milissegundos) {
    this.time += milissegundos;
    this.audio.update(milissegundos);
    this.navigation?.update(milissegundos);
    this.syncAudio();
    this.updateCounters();
  }
  // Recebe o contexto 2D e desenha o estado atual sem avançar o tempo.
  draw(contexto, largura, altura) {
    const aspect = this.root?.clientHeight ? this.root.clientWidth / this.root.clientHeight : null;
    this.backdrop.draw(contexto, largura, altura, this.time, this.pointer, this.reduced, aspect);
    const particles = this.profile.particles, segundos = this.reduced ? 0 : this.time / 1000;
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
  // Libera os eventos e recursos ativos desta visita à tela.
  unmount() {
    this.navigation?.destroy();
    this.navigation = null;
    this.audio.leave();
    this.controlesAudio?.destroy();
    this.controlesAudio = null;
    this.counters = [];
    if (!this.root) return;
    this.root.classList.remove("lobby", "end-screen", "end-defeat", "end-victory");
    for (const property of [
      "--lobby-accent",
      "--lobby-text",
      "--lobby-pulse"
    ]) this.root.style.removeProperty(property);
    this.root.onpointermove = null;
  }
}
