// Este arquivo cuida de guardar as teclas pressionadas em cada atualização.
// ===== DEPENDÊNCIAS E CONFIGURAÇÕES =====
const normalizeKey = (chave) => chave === "Spacebar" ? " " : chave.length === 1 ? chave.toLowerCase() : chave;
import { KEYS } from "../../config/configuracao.js";
// ===== COMPORTAMENTO =====
export class Input {
  /**
  * CONSTRUTOR:
  * Inicializa os conjuntos (Sets) de monitoramento de teclas e conecta os ouvintes do DOM.
  */
  // Recebe as dependências e prepara o estado inicial deste componente.
  constructor() {
    this.keysDown = new Set();
    this.keysPressedThisFrame = new Set();
    this._keyDownBuffer = new Set();
    this.resetVersion = 0;
    this.virtualActions = new Set();
    this.virtualPressed = new Set();
    this.virtualBuffer = new Set();
    this._onKeyDown = this._onKeyDown.bind(this);
    this._onKeyUp = this._onKeyUp.bind(this);
    this._onBlur = this._onBlur.bind(this);
    window.addEventListener("keydown", this._onKeyDown);
    window.addEventListener("keyup", this._onKeyUp);
    window.addEventListener("blur", this._onBlur);
    globalThis.document?.addEventListener("visibilitychange", this._onBlur);
  }
  _onKeyDown(eventoRecebido) {
    if (eventoRecebido.target?.closest?.("button") && ["Enter", " "].includes(eventoRecebido.key)) return;
    if ([
      "ArrowUp",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      " ",
      "Spacebar"
    ].includes(eventoRecebido.key)) {
      eventoRecebido.preventDefault();
    }
    if (eventoRecebido.repeat) return;
    const chave = eventoRecebido.code?.startsWith("Key") ? eventoRecebido.code.slice(3).toLowerCase() : normalizeKey(eventoRecebido.key);
    if (!this.keysDown.has(normalizeKey(chave))) this._keyDownBuffer.add(chave);
    this.keysDown.add(chave);
  }
  _onKeyUp(eventoRecebido) {
    const chave = eventoRecebido.code?.startsWith("Key") ? eventoRecebido.code.slice(3).toLowerCase() : normalizeKey(eventoRecebido.key);
    this.keysDown.delete(chave);
  }
  _onBlur() {
    this.resetVersion++;
    this.virtualActions.clear();
    this.virtualPressed.clear();
    this.virtualBuffer.clear();
    this.keysDown.clear();
    this._keyDownBuffer.clear();
    this.keysPressedThisFrame.clear();
  }
  // Recebe a atualização atual e avança o estado, sem redesenhar a tela.
  update() {
    this.virtualPressed = new Set(this.virtualBuffer);
    this.virtualBuffer.clear();
    this.keysPressedThisFrame.clear();
    for (const tecla of this._keyDownBuffer) this.keysPressedThisFrame.add(tecla);
    this._keyDownBuffer.clear();
  }
  setVirtualAction(acao, pressed) {
    if (!KEYS[acao]) return;
    if (pressed) {
      if (!this.virtualActions.has(acao)) this.virtualBuffer.add(acao);
      this.virtualActions.add(acao);
    } else this.virtualActions.delete(acao);
  }
  isVirtualDown(acao) {
    return this.virtualActions.has(acao);
  }
  isDown(acao) {
    if (this.isVirtualDown(acao)) return true;
    const list = KEYS[acao];
    if (!list) return false;
    for (const chave of list) {
      if (this.keysDown.has(chave)) return true;
    }
    return false;
  }
  justPressed(acao) {
    if (this.virtualPressed.has(acao)) return true;
    const list = KEYS[acao];
    if (!list) return false;
    for (const chave of list) {
      if (this.keysPressedThisFrame.has(normalizeKey(chave))) return true;
    }
    return false;
  }
  isKeyJustPressed(keyName) {
    return this.keysPressedThisFrame.has(normalizeKey(keyName));
  }
  get anyKeyPressed() {
    return this.keysPressedThisFrame.size > 0;
  }
  get anyKeyDown() {
    return this.keysDown.size > 0;
  }
  // Encerra os recursos desta instância para não deixar eventos ativos.
  destroy() {
    window.removeEventListener("keydown", this._onKeyDown);
    window.removeEventListener("keyup", this._onKeyUp);
    window.removeEventListener("blur", this._onBlur);
    globalThis.document?.removeEventListener("visibilitychange", this._onBlur);
  }
}
