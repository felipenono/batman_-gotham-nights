/**
 * ============================================================================
 * @file Input.js
 * @category POO - Camada de Abstração de Hardware (Encapsulamento de Teclado)
 * ============================================================================
 * CONCEITOS DE PROGRAMAÇÃO ORIENTADA A OBJETOS (POO):
 * 
 * 1. ABSTRAÇÃO DE HARDWARE (Hardware Abstraction Layer):
 *    Isola o resto do jogo das APIs de eventos do DOM (keydown/keyup).
 *    Os componentes do jogo consultam ações semânticas abstratas ('JUMP', 'SHOOT')
 *    em vez de códigos de tecla brutos ('ArrowUp', 'KeyX').
 * 
 * 2. ENCAPSULAMENTO DE ESTADO TEMPORAL:
 *    Mantém conjuntos de teclas privadas ('_keyDownBuffer', 'keysDown') e sincroniza
 *    com o loop do jogo no método update(), distinguindo cliques contínuos (isDown)
 *    de toques instantâneos no frame (justPressed / anyKeyPressed).
 * ============================================================================
 */

import { KEYS } from '../utils/constants.js';

export class Input {
  /**
   * CONSTRUTOR:
   * Inicializa os conjuntos (Sets) de monitoramento de teclas e conecta os ouvintes do DOM.
   */
  constructor() {
    this.keysDown = new Set();
    this.keysPressedThisFrame = new Set();
    this._keyDownBuffer = new Set();

    this._onKeyDown = this._onKeyDown.bind(this);
    this._onKeyUp = this._onKeyUp.bind(this);
    this._onBlur = this._onBlur.bind(this);

    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
    window.addEventListener('blur', this._onBlur);
  }

  _onKeyDown(e) {
    // Prevent scrolling and default actions for gameplay keys
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'Spacebar'].includes(e.key)) {
      e.preventDefault();
    }
    if (!this.keysDown.has(e.key)) {
      this._keyDownBuffer.add(e.key);
    }
    this.keysDown.add(e.key);
  }

  _onKeyUp(e) {
    this.keysDown.delete(e.key);
  }

  _onBlur() {
    this.keysDown.clear();
    this._keyDownBuffer.clear();
    this.keysPressedThisFrame.clear();
  }

  /**
   * Called once at the beginning of each frame update.
   */
  update() {
    this.keysPressedThisFrame = new Set(this._keyDownBuffer);
    this._keyDownBuffer.clear();
  }

  /**
   * Checks if any key mapped to the given action is currently held down.
   * @param {string} action - Action key name from KEYS constants (e.g. 'LEFT', 'JUMP')
   * @returns {boolean}
   */
  isDown(action) {
    const list = KEYS[action];
    if (!list) return false;
    for (const key of list) {
      if (this.keysDown.has(key)) return true;
    }
    return false;
  }

  /**
   * Checks if any key mapped to the given action was pressed this current frame.
   * @param {string} action - Action key name from KEYS constants
   * @returns {boolean}
   */
  justPressed(action) {
    const list = KEYS[action];
    if (!list) return false;
    for (const key of list) {
      if (this.keysPressedThisFrame.has(key)) return true;
    }
    return false;
  }

  /**
   * Direct key check for special keys (e.g., 'Escape', 'Enter').
   * @param {string} keyName
   * @returns {boolean}
   */
  isKeyJustPressed(keyName) {
    return this.keysPressedThisFrame.has(keyName);
  }

  /**
   * Returns true if ANY key was pressed this frame.
   * @returns {boolean}
   */
  get anyKeyPressed() {
    return this.keysPressedThisFrame.size > 0;
  }

  /**
   * Returns true if ANY key is held down.
   * @returns {boolean}
   */
  get anyKeyDown() {
    return this.keysDown.size > 0;
  }

  destroy() {
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup', this._onKeyUp);
    window.removeEventListener('blur', this._onBlur);
  }
}
