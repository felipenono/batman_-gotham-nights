import { LOBBY } from '../config/lobby.js';

/** Navegação de uma lista de botões nativos; eventos são removidos ao sair da tela. */
export class ScreenNavigation {
  constructor(root, { activate, blocked, gesture, back }) {
    this.root = root;
    this.activate = activate; this.blocked = blocked; this.gesture = gesture; this.back = back;
    this.time = 0; this.nextMove = 0; this.padReady = false; this.padPressed = false;
    this.key = event => {
      this.gesture();
      if (this.blocked() || event.repeat) return;
      if (event.target?.tagName === 'INPUT') return;
      if (['ArrowUp','ArrowLeft','ArrowDown','ArrowRight'].includes(event.key)) {
        event.preventDefault(); this.move(['ArrowUp','ArrowLeft'].includes(event.key) ? -1 : 1);
      } else if (event.key === 'Escape') {
        event.preventDefault(); this.back();
      } else if (['Enter',' '].includes(event.key) && !event.target?.closest?.('button')) {
        event.preventDefault(); this.buttons()[0]?.click();
      }
    };
    this.click = event => {
      const button = event.target.closest('[data-result-action]');
      if (button && !button.disabled && !this.blocked()) this.activate(button.dataset.resultAction);
    };
    this.pointer = () => this.gesture();
  }
  mount() {
    window.addEventListener('keydown', this.key);
    window.addEventListener('pointerdown', this.pointer);
    this.root.addEventListener('click', this.click);
  }
  buttons() { return [...this.root.querySelectorAll('[data-result-action]:not(:disabled)')]; }
  move(direction) {
    const buttons = this.buttons();
    if (!buttons.length) return;
    const index = buttons.indexOf(document.activeElement);
    buttons[index < 0 ? (direction > 0 ? 0 : buttons.length - 1) : (index + direction + buttons.length) % buttons.length].focus();
  }
  update(ms) {
    this.time += ms;
    const pad = globalThis.navigator?.getGamepads?.()?.find(item => item?.connected);
    if (!pad) { this.padReady = false; this.padPressed = false; return; }
    const pressed = Boolean(pad.buttons[0]?.pressed || pad.buttons[9]?.pressed);
    // Um botão segurado durante a partida não pode confirmar a tela recém-aberta.
    if (!pressed) this.padReady = true;
    const axis = pad.axes?.[1] ?? 0;
    const direction = pad.buttons[12]?.pressed || axis < -LOBBY.motion.stickThreshold ? -1 : pad.buttons[13]?.pressed || axis > LOBBY.motion.stickThreshold ? 1 : 0;
    if (!this.blocked()) {
      if (direction && this.time >= this.nextMove) {
        this.move(direction); this.nextMove = this.time + LOBBY.motion.gamepadRepeat;
      }
      if (this.padReady && pressed && !this.padPressed) {
        const button = this.root.querySelector('[data-result-action]:focus:not(:disabled)') ?? this.buttons()[0];
        button?.click();
      }
    }
    this.padPressed = pressed;
  }
  destroy() {
    window.removeEventListener('keydown', this.key);
    window.removeEventListener('pointerdown', this.pointer);
    this.root.removeEventListener('click', this.click);
  }
}
