import { LOBBY } from '../config/lobby.js';
import { LobbyAudioManager } from '../audio/LobbyAudioManager.js';
import { GothamBackdrop } from './GothamBackdrop.js';

import { LOCK_ICON as lock, SOUND_ICON as speaker, logoMarkup, loadLogo } from '../ui/ScreenElements.js';

/** UI acessível em HTML; o canvas desenha exclusivamente o cenário. */
export class MenuScene {
  constructor(game, root) {
    this.game = game;
    this.root = root;
    this.audio = new LobbyAudioManager(game.soundManager);
    this.backdrop = new GothamBackdrop();
    this.time = 0;
    this.pointer = 0;
    this.padPressed = false;
    this.nextPadMove = 0;
    this.reduced = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    this.onKey = this.onKey.bind(this);
  }
  mount() {
    if (!this.root) return;
    this.backdrop.batSignal.enter(this.time);
    document.documentElement.style.setProperty('--lobby-accent', LOBBY.colors.accent);
    document.documentElement.style.setProperty('--lobby-text', LOBBY.colors.text);
    document.documentElement.style.setProperty('--lobby-pulse', `${LOBBY.motion.pulse}ms`);
    document.documentElement.style.setProperty('--lobby-fog', `${LOBBY.motion.fog}ms`);
    this.root.classList.add('lobby');
    this.root.innerHTML = `
      <header class="lobby-top"><a class="studio-mark" href="#" aria-label="Batman: Noites de Gotham"><span class="brand-square">DC</span><span>GOTHAM<br><b>KNIGHTS</b></span></a><span class="edition">AÇÃO & SOBREVIVÊNCIA <i></i> EDIÇÃO NOTURNA</span></header>
      <div class="lobby-content">${logoMarkup()}
      <p class="lobby-kicker">QUANDO A CIDADE DORME</p><h1 class="lobby-title">BATMAN<span>NOITES DOS VILÕES</span></h1>
      <p class="lobby-description">A noite pertence aos que não têm medo.</p>
      <nav class="lobby-menu" aria-label="Menu principal">${LOBBY.buttons.map((b, i) => `<button class="lobby-button ${i === 0 ? 'primary' : ''}" data-menu-id="${b.id}" ${b.enabled ? '' : 'disabled'}><span class="menu-icon">${b.enabled ? '▶' : lock}</span><span class="menu-label">${b.label}<small>${b.detail}</small></span><span class="menu-end">${b.enabled ? '↵' : lock}</span></button>`).join('')}</nav>
      <p class="menu-navigation"><kbd>↑</kbd><kbd>↓</kbd> NAVEGAR <span></span><kbd>ENTER</kbd> SELECIONAR</p></div>
      <footer class="lobby-bottom"><div class="city-status"><i></i> GOTHAM CITY <span>•</span> 00:07 AM <small>A CIDADE PRECISA DE VOCÊ.</small></div><div class="audio-controls"><span class="audio-caption">TRILHA SONORA</span><input aria-label="Volume" type="range" min="0" max="1" step="0.01" value="${this.audio.volume}"><button class="mute-button" aria-label="Silenciar áudio" aria-pressed="false">${speaker}</button></div></footer><div class="lobby-grain" aria-hidden="true"></div>`;
    loadLogo(this.root);
    this.root.querySelectorAll('[data-menu-id]').forEach(button => {
      button.addEventListener('click', () => this.activate(button.dataset.menuId));
    });
    this.root.querySelector('.studio-mark').addEventListener('click', e => e.preventDefault());
    this.root.querySelector('.mute-button').addEventListener('click', () => {
      this.audio.unlock(); this.game.soundManager.toggleMute(); this.syncAudio();
    });
    this.root.querySelector('input').addEventListener('input', e => {
      this.audio.unlock(); this.audio.setVolume(Number(e.target.value));
    });
    this.root.onpointermove = e => { this.pointer = (e.clientX / innerWidth - 0.5) * 2; };
    this.unlock = () => this.audio.unlock();
    window.addEventListener('pointerdown', this.unlock);
    window.addEventListener('keydown', this.onKey);
    this.audio.enter();
    this.root.querySelector('input').value = this.audio.volume;
    this.syncAudio();
  }
  unmount() {
    if (!this.root) return;
    this.audio.leave();
    this.root.classList.remove('lobby');
    this.root.onpointermove = null;
    window.removeEventListener('pointerdown', this.unlock);
    window.removeEventListener('keydown', this.onKey);
  }
  syncAudio() {
    const button = this.root?.querySelector('.mute-button');
    if (!button) return;
    button.setAttribute('aria-pressed', String(this.game.soundManager.isMuted));
    button.setAttribute('aria-label', this.game.soundManager.isMuted ? 'Ativar áudio' : 'Silenciar áudio');
    this.root.querySelector('.audio-caption').textContent = this.game.soundManager.isMuted ? 'SOM DESLIGADO' : 'TRILHA SONORA';
    this.audio.apply();
  }
  activate(id) {
    const item = LOBBY.buttons.find(b => b.id === id);
    if (!item?.enabled || this.game.sceneManager.transition) return;
    this.audio.unlock();
    const accepted = item.action ? item.action(this.game) !== false : this.game.sceneManager.goTo(item.id === 'start' ? LOBBY.targetScene : item.scene);
    if (accepted) this.audio.playClick();
  }
  move(direction) {
    const buttons = [...(this.root?.querySelectorAll('[data-menu-id]:not(:disabled)') ?? [])];
    if (!buttons.length) return;
    const current = buttons.indexOf(document.activeElement);
    buttons[(current + direction + buttons.length) % buttons.length].focus();
  }
  onKey(e) {
    this.audio.unlock();
    if (e.repeat || this.game.sceneManager.transition) return;
    if (['ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight'].includes(e.key) && e.target?.tagName !== 'INPUT') {
      e.preventDefault(); this.move(['ArrowUp', 'ArrowLeft'].includes(e.key) ? -1 : 1);
    }
    if (['Enter', ' '].includes(e.key) && !e.target?.closest?.('button, input, a')) {
      e.preventDefault(); this.root?.querySelector('[data-menu-id]:not(:disabled)')?.click();
    }
  }
  update(ms) {
    this.time += ms;
    this.audio.update(ms);
    this.syncAudio();
    // A API de controle funciona com D-pad, analógico, A e Start (borda de pressão).
    const pad = globalThis.navigator?.getGamepads?.()?.find(p => p?.connected);
    if (!pad) { this.padPressed = false; return; }
    const direction = pad.buttons[12]?.pressed || pad.axes[1] < -LOBBY.motion.stickThreshold ? -1 : pad.buttons[13]?.pressed || pad.axes[1] > LOBBY.motion.stickThreshold ? 1 : 0;
    if (direction && this.time > this.nextPadMove) { this.move(direction); this.nextPadMove = this.time + LOBBY.motion.gamepadRepeat; }
    const pressed = pad.buttons[0]?.pressed || pad.buttons[9]?.pressed;
    if (pressed && !this.padPressed) {
      const focused = this.root?.querySelector('[data-menu-id]:focus');
      (focused ?? this.root?.querySelector('[data-menu-id]:not(:disabled)'))?.click();
    }
    this.padPressed = pressed;
  }
  draw(ctx, width, height) {
    const screenAspect = this.root?.clientHeight ? this.root.clientWidth / this.root.clientHeight : null;
    this.backdrop.draw(ctx, width, height, this.time, this.pointer, this.reduced, screenAspect);
  }
}

