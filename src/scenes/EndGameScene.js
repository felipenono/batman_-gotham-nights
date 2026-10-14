import { LOBBY, assetURL } from '../config/lobby.js';
import { ScreenAudioManager } from '../audio/ScreenAudioManager.js';
import { GothamBackdrop } from './GothamBackdrop.js';
import { ScreenNavigation } from '../ui/ScreenNavigation.js';
import { LOCK_ICON, SOUND_ICON, logoMarkup, loadLogo, escapeHTML } from '../ui/ScreenElements.js';

const finite = (value, fallback) => Number.isFinite(value) ? Math.max(0, Math.floor(value)) : fallback;

/** Copia os dados recebidos; a tela não consulta jogador, placar ou relógio globais. */
export function normalizeResultData(data = {}) {
  const demo = LOBBY.endScreens.demo;
  return {
    score: finite(data.score, demo.score), bestScore: finite(data.bestScore, demo.bestScore),
    elapsedSeconds: finite(data.elapsedSeconds, demo.elapsedSeconds),
    levelIndex: Math.max(1, finite(data.levelIndex, demo.levelIndex)),
    demo: data.demo ?? !['score','bestScore','elapsedSeconds'].every(key => Number.isFinite(data[key])),
    players: (Array.isArray(data.players) ? data.players : []).slice(0, 2).map((player, index) => ({
      name: String(player?.name ?? `${LOBBY.endScreens.labels.player} ${index + 1}`),
      score: finite(player?.score, 0),
    })),
    skin: { name: String(data.skin?.name ?? ''), image: String(data.skin?.image ?? '') },
  };
}
export function formatPlayTime(seconds) {
  const total = finite(seconds, 0), minutes = Math.floor(total / 60), remainder = total % 60;
  return minutes >= 60 ? `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2,'0')}:${String(remainder).padStart(2,'0')}` : `${String(minutes).padStart(2,'0')}:${String(remainder).padStart(2,'0')}`;
}

/** Cena base de vitória/derrota. Recebe dados e serviços explicitamente por parâmetros. */
export class EndGameScene {
  constructor(root, { sound, goTo, isTransitioning }) {
    this.root = root; this.sound = sound; this.goTo = goTo; this.isTransitioning = isTransitioning;
    this.audio = new ScreenAudioManager(sound);
    this.backgrounds = new Map();
    this.time = 0; this.pointer = 0;
    this.reduced = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    this.prepare('defeat', {});
  }
  prepare(result, data) {
    const profile = LOBBY.endScreens.screens[result];
    if (!profile) throw new Error(`Resultado desconhecido: ${result}`);
    this.result = result; this.profile = profile; this.data = normalizeResultData(data);
    if (!this.backgrounds.has(result)) {
      this.backgrounds.set(result, new GothamBackdrop({ ...profile.background,
        weather: { fogColor: LOBBY.endScreens.colors.fog, rainColor: LOBBY.endScreens.colors.rain, ...profile.background.weather } }));
    }
    this.backdrop = this.backgrounds.get(result);
    this.time = 0; this.pointer = 0; this.backdrop.batSignal.enter(0);
    this.buttons = profile.buttons.map(button => ({ ...button,
      enabled: button.id === 'next' ? LOBBY.endScreens.features.nextLevel || button.enabled : button.enabled,
    }));
  }
  mount(result, data) {
    this.prepare(result, data);
    this.audio.configure(this.profile.audio);
    this.audio.enter();
    if (!this.root) return;
    const config = LOBBY.endScreens, labels = config.labels, profile = this.profile;
    this.root.classList.add('lobby', 'end-screen', `end-${result}`);
    this.root.style.setProperty('--lobby-accent', profile.accent);
    this.root.style.setProperty('--lobby-text', config.colors.text);
    this.root.style.setProperty('--lobby-pulse', `${LOBBY.motion.pulse}ms`);
    this.root.style.setProperty('--result-accent', profile.accent);
    this.root.style.setProperty('--result-glow', profile.glow);
    this.root.style.setProperty('--result-entrance', `${config.titleEntrance}ms`);
    for (const [key, color] of Object.entries(config.colors)) this.root.style.setProperty(`--result-${key}`, color);
    const number = value => value.toLocaleString('pt-BR');
    const stat = (label, value) => `<div class="result-stat"><dt>${escapeHTML(label)}</dt><dd>${escapeHTML(value)}</dd></div>`;
    this.root.innerHTML = `
      <header class="result-top"><span>${escapeHTML(labels.report)}</span><span>${escapeHTML(labels.city)}</span></header>
      <div class="result-content">
        ${logoMarkup(labels.logo)}
        <p class="result-eyebrow">${escapeHTML(profile.eyebrow)}</p>
        <h1 class="result-title" tabindex="-1">${escapeHTML(profile.title)}</h1>
        <p class="result-description">${escapeHTML(profile.description)}</p>
        <div class="result-divider" aria-hidden="true"><span>◆</span></div>
        <dl class="result-stats">${stat(labels.score,number(this.data.score))}${stat(labels.bestScore,number(this.data.bestScore))}${stat(labels.time,formatPlayTime(this.data.elapsedSeconds))}</dl>
        <p class="result-demo" ${this.data.demo ? '' : 'hidden'}>${escapeHTML(labels.demo)}</p>
        <div class="result-medals" ${result === 'victory' ? '' : 'hidden'} aria-disabled="true"><span aria-hidden="true">☆ ☆ ☆</span>${escapeHTML(labels.medals)} · ${escapeHTML(labels.soon)}</div>
        <section class="result-team" ${config.features.twoPlayers ? '' : 'hidden'} aria-label="${escapeHTML(labels.players)}">${[0,1].map(index => {
          const player = this.data.players[index] ?? { name: `${labels.player} ${index + 1}`, score: 0 };
          return `<div><span>${escapeHTML(player.name)}</span><strong>${number(player.score)}</strong></div>`;
        }).join('')}</section>
        <aside class="result-skin" ${config.features.skinPreview ? '' : 'hidden'}><img class="skin-image" alt="" hidden><span>${escapeHTML(labels.skin)}</span><strong>${escapeHTML(this.data.skin.name || labels.skinPlaceholder)}</strong></aside>
        <nav class="result-actions" aria-label="${escapeHTML(labels.report)}">${this.buttons.map((button,index) => `<button class="lobby-button ${index === 0 ? 'primary' : ''}" data-result-action="${button.id}" ${button.enabled ? '' : 'disabled'}><span class="menu-icon">${button.enabled ? (index === 0 ? '↻' : '←') : LOCK_ICON}</span><span class="menu-label">${escapeHTML(button.label)}<small>${escapeHTML(button.id === 'next' && button.enabled ? labels.nextReady : button.detail)}</small></span><span class="menu-end">${button.enabled ? '↵' : LOCK_ICON}</span></button>`).join('')}</nav>
        <p class="menu-navigation"><kbd>↑</kbd><kbd>↓</kbd> ${escapeHTML(labels.navigation)} <span></span><kbd>ENTER</kbd> ${escapeHTML(labels.select)} <span></span><kbd>ESC</kbd> MENU</p>
      </div>
      <footer class="result-bottom"><span>${escapeHTML(profile.footer)}</span><div class="audio-controls"><span class="audio-caption"></span><input aria-label="${escapeHTML(labels.volume)}" type="range" min="0" max="1" step="0.01" value="${this.audio.volume}"><button class="mute-button" aria-label="${escapeHTML(labels.mute)}" aria-pressed="false">${SOUND_ICON}</button></div></footer><div class="lobby-grain" aria-hidden="true"></div>`;
    loadLogo(this.root);
    const skinPath = this.data.skin.image || config.assets.skinPlaceholder;
    if (config.features.skinPreview && skinPath) {
      const image = this.root.querySelector('.skin-image');
      image.onload = () => { image.hidden = false; };
      image.onerror = () => { image.hidden = true; };
      image.src = assetURL(skinPath);
    }
    this.navigation = new ScreenNavigation(this.root, {
      activate: id => this.activate(id), blocked: () => this.blocked(),
      gesture: () => this.audio.unlock(), back: () => this.activate('menu'),
    });
    this.navigation.mount();
    this.root.querySelector('.mute-button').onclick = () => { this.audio.unlock(); this.sound.toggleMute(); this.syncAudio(); };
    this.root.querySelector('input').oninput = event => { this.audio.unlock(); this.audio.setVolume(Number(event.target.value)); };
    this.root.onpointermove = event => {
      const box = this.root.getBoundingClientRect(); this.pointer = (event.clientX - box.left) / Math.max(1,box.width) * 2 - 1;
    };
    this.root.querySelector('h1').focus({ preventScroll: true });
    this.sound.playSfx(profile.audio.cue);
    this.syncAudio();
  }
  blocked() { return this.isTransitioning() || this.time < LOBBY.endScreens.inputDelay; }
  activate(id) {
    const button = this.buttons.find(item => item.id === id);
    if (!button?.enabled || this.blocked()) return false;
    this.audio.unlock();
    const destination = id === 'next' ? LOBBY.endScreens.nextScene : button.scene;
    const accepted = this.goTo(destination, { ...this.data, nextLevelIndex: this.data.levelIndex + 1 });
    if (accepted) this.audio.playClick();
    return accepted;
  }
  syncAudio() {
    const button = this.root?.querySelector('.mute-button');
    if (!button) return;
    const labels = LOBBY.endScreens.labels;
    button.setAttribute('aria-pressed', String(this.sound.isMuted));
    button.setAttribute('aria-label', this.sound.isMuted ? labels.unmute : labels.mute);
    this.root.querySelector('.audio-caption').textContent = this.sound.isMuted ? labels.muted : labels.music;
  }
  update(ms) {
    this.time += ms; this.audio.update(ms); this.navigation?.update(ms); this.syncAudio();
  }
  draw(ctx, width, height) {
    const aspect = this.root?.clientHeight ? this.root.clientWidth / this.root.clientHeight : null;
    this.backdrop.draw(ctx, width, height, this.time, this.pointer, this.reduced, aspect);
    const particles = this.profile.particles, seconds = this.reduced ? 0 : this.time / 1000;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = LOBBY.endScreens.colors.sparkle;
    for (let i = 0; i < particles.count; i++) {
      const progress = (i * 0.618034 + seconds * particles.speed) % 1;
      const x = ((i * 0.381966 + Math.sin(seconds * 0.2 + i) * 0.008) % 1 + 1) % 1;
      ctx.globalAlpha = Math.sin(progress * Math.PI) * particles.opacity;
      ctx.fillRect(x * width, (1 - progress) * height, 0.7 + i % 2, 0.7 + i % 2);
    }
    ctx.restore();
  }
  unmount() {
    this.navigation?.destroy(); this.navigation = null; this.audio.leave();
    if (!this.root) return;
    this.root.classList.remove('lobby','end-screen','end-defeat','end-victory');
    for (const property of ['--lobby-accent','--lobby-text','--lobby-pulse']) this.root.style.removeProperty(property);
    this.root.onpointermove = null;
  }
}
