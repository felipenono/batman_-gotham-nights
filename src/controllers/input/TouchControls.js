import { GameState } from '../../models/GameState.js';

// Cada dedo controla uma acao independente, sem simular teclado ou mover a mira.
export class TouchControls {
  constructor(game, root = globalThis.document?.getElementById('touch-controls')) {
    this.game = game;
    this.root = root;
    this.fullscreenButton = globalThis.document?.getElementById('fullscreen-button');
    this.fullscreenStatus = globalThis.document?.getElementById('fullscreen-status');
    this.pointers = new Map();
    this.listeners = [];
    this.previous = null;
    this.media = globalThis.matchMedia?.('(any-pointer: coarse)');
    this.listen(root, 'pointerdown', event => this.press(event));
    this.listen(root, 'pointermove', event => this.move(event));
    for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) this.listen(root, type, event => this.release(event));
    this.listen(root, 'contextmenu', event => event.preventDefault());
    this.listen(root, 'click', event => {
      if (event.target.closest?.('[data-touch-pause]')) { event.preventDefault(); this.game.togglePause(); this.update(); }
    });
    this.listen(globalThis.window, 'blur', () => this.clear());
    this.listen(globalThis.document, 'visibilitychange', () => this.clear());
    this.listen(this.media, 'change', () => { this.clear(); this.previous = null; this.update(); });
    this.listen(this.fullscreenButton, 'click', () => this.toggleFullscreen());
    for (const type of ['fullscreenchange', 'webkitfullscreenchange']) this.listen(globalThis.document, type, () => { this.clear(); this.updateFullscreen(); });
    // Impede zoom por pinca/toque duplo sem cancelar os eventos dos botoes.
    for (const type of ['gesturestart', 'gesturechange', 'dblclick']) this.listen(globalThis.document, type, event => {
      if (this.media?.matches) event.preventDefault();
    }, { passive: false });
    this.listen(globalThis.document, 'touchmove', event => {
      if (this.media?.matches && event.touches?.length > 1) event.preventDefault();
    }, { passive: false });
    this.updateFullscreen();
    this.update();
  }
  listen(target, type, callback, options) {
    target?.addEventListener?.(type, callback, options);
    this.listeners.push(() => target?.removeEventListener?.(type, callback, options));
  }
  press(event) {
    const button = event.target.closest?.('[data-touch-action], [data-touch-joystick]');
    if (!button || button.disabled || this.game.state !== GameState.PLAYING || this.game.sceneManager?.transition || event.button > 0) return;
    const joystick = button.dataset.touchAction === undefined;
    if (joystick && [...this.pointers.values()].some(item => item.joystick)) return;
    event.preventDefault();
    const action = joystick ? null : button.dataset.touchAction;
    this.pointers.set(event.pointerId, { action, button, joystick });
    button.setPointerCapture?.(event.pointerId);
    button.classList.add('is-pressed');
    if (joystick) this.move(event);
    else this.syncAction(action);
  }
  syncAction(action) {
    if (action) this.game.input.setVirtualAction(action, [...this.pointers.values()].some(item => item.action === action || (action === 'JUMP' && item.jump)));
  }
  move(event) {
    const pointer = this.pointers.get(event.pointerId);
    if (!pointer?.joystick) return;
    event.preventDefault();
    const rect = pointer.button.getBoundingClientRect();
    const radius = rect.width * .29;
    if (!radius) return;
    let x = event.clientX - rect.left - rect.width / 2;
    let y = event.clientY - rect.top - rect.height / 2;
    const distance = Math.hypot(x, y);
    if (distance > radius) { x *= radius / distance; y *= radius / distance; }
    pointer.button.style.setProperty('--stick-x', `${x}px`);
    pointer.button.style.setProperty('--stick-y', `${y}px`);
    pointer.action = Math.abs(x) > radius * .24 ? (x < 0 ? 'LEFT' : 'RIGHT') : null;
    pointer.jump = y < -radius * .45;
    this.syncAction('LEFT');
    this.syncAction('RIGHT');
    this.syncAction('JUMP');
  }
  release(event) {
    const pointer = this.pointers.get(event.pointerId);
    if (!pointer) return;
    this.pointers.delete(event.pointerId);
    this.syncAction(pointer.action);
    if (pointer.joystick) {
      this.syncAction('JUMP');
      pointer.button.style.setProperty('--stick-x', '0px');
      pointer.button.style.setProperty('--stick-y', '0px');
    }
    if (![...this.pointers.values()].some(item => item.action === pointer.action)) {
      pointer.button.classList.remove('is-pressed');
    }
    if (pointer.button.hasPointerCapture?.(event.pointerId)) pointer.button.releasePointerCapture(event.pointerId);
  }
  clear() {
    for (const pointerId of [...this.pointers.keys()]) this.release({ pointerId });
    // Descarta pulos/toques pendentes ao pausar ou perder o foco.
    this.game.input.virtualBuffer.clear();
    this.game.input.virtualPressed.clear();
  }
  update() {
    const state = this.game.state;
    const coarse = this.media?.matches ?? false;
    const transitioning = Boolean(this.game.sceneManager?.transition);
    const key = state + ':' + coarse + ':' + transitioning;
    if (key === this.previous) return;
    this.previous = key;
    this.clear();
    if (this.fullscreenButton) this.fullscreenButton.hidden = !coarse;
    if (!this.root) return;
    this.root.hidden = !coarse || transitioning || ![GameState.PLAYING, GameState.PAUSED].includes(state);
    this.root.querySelectorAll('[data-touch-action]').forEach(button => { button.disabled = state !== GameState.PLAYING; });
    const pause = this.root.querySelector('[data-touch-pause]');
    if (pause) {
      pause.textContent = state === GameState.PAUSED ? '▶' : 'II';
      pause.setAttribute('aria-label', state === GameState.PAUSED ? 'Continuar jogo' : 'Pausar jogo');
    }
  }
  updateFullscreen() {
    if (!this.fullscreenButton) return;
    const fullscreen = Boolean(globalThis.document?.fullscreenElement || globalThis.document?.webkitFullscreenElement);
    const label = fullscreen ? 'Sair da tela cheia' : 'Entrar em tela cheia';
    this.fullscreenButton.setAttribute('aria-pressed', String(fullscreen));
    this.fullscreenButton.setAttribute('aria-label', label);
    this.fullscreenButton.title = label;
    if (this.fullscreenStatus) this.fullscreenStatus.hidden = true;
  }
  async toggleFullscreen() {
    this.clear();
    const doc = globalThis.document;
    try {
      if (doc.fullscreenElement || doc.webkitFullscreenElement) {
        const exit = doc.exitFullscreen || doc.webkitExitFullscreen;
        if (!exit) throw new Error('Fullscreen unavailable');
        await exit.call(doc);
      } else {
        const element = doc.documentElement;
        const request = element.requestFullscreen || element.webkitRequestFullscreen;
        if (!request) throw new Error('Fullscreen unavailable');
        await request.call(element);
      }
      this.updateFullscreen();
    } catch {
      if (this.fullscreenStatus) {
        this.fullscreenStatus.textContent = 'Este navegador não permite tela cheia. No iPhone, abra pelo Safari e use Compartilhar → Adicionar à Tela de Início.';
        this.fullscreenStatus.hidden = false;
      }
    }
  }
  destroy() {
    this.clear();
    for (const remove of this.listeners) remove();
    this.listeners = [];
    if (this.root) this.root.hidden = true;
    if (this.fullscreenButton) this.fullscreenButton.hidden = true;
    if (this.fullscreenStatus) this.fullscreenStatus.hidden = true;
  }
}
