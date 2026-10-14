// Este arquivo cuida de converter cliques e toques em coordenadas do jogo.
// ===== DEPENDÊNCIAS E CONFIGURAÇÕES =====
import { Viewport } from "./Viewport.js";
// ===== COMPORTAMENTO =====
export class Mouse {
  // Recebe as dependências e prepara o estado inicial deste componente.
  constructor(canvas) {
    this.canvas = canvas;
    this.viewport = new Viewport();
    this.x = 0;
    this.y = 0;
    this.worldX = 0;
    this.worldY = 0;
    this.isDown = false;
    this.justClicked = false;
    this._clickedBuffer = false;
    this.hasMoved = false;
    this._onMouseMove = this._onMouseMove.bind(this);
    this._onMouseDown = this._onMouseDown.bind(this);
    this._onMouseUp = this._onMouseUp.bind(this);
    this._onTouchStart = this._onTouchStart.bind(this);
    this._onTouchMove = this._onTouchMove.bind(this);
    this._onTouchEnd = this._onTouchEnd.bind(this);
    this._onContextMenu = this._onContextMenu.bind(this);
    this._onBlur = this._onBlur.bind(this);
    window.addEventListener("mousemove", this._onMouseMove);
    window.addEventListener("mousedown", this._onMouseDown);
    window.addEventListener("mouseup", this._onMouseUp);
    window.addEventListener("blur", this._onBlur);
    globalThis.document?.addEventListener("visibilitychange", this._onBlur);
    window.addEventListener("touchcancel", this._onBlur);
    window.addEventListener("touchstart", this._onTouchStart, { passive: false });
    window.addEventListener("touchmove", this._onTouchMove, { passive: false });
    window.addEventListener("touchend", this._onTouchEnd);
    canvas.addEventListener("contextmenu", this._onContextMenu);
  }
  _updateCoordinates(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    const point = this.viewport.toGame((clientX - rect.left) * scaleX, (clientY - rect.top) * scaleY, this.canvas.width, this.canvas.height);
    this.x = point.x;
    this.y = point.y;
  }
  _onMouseMove(eventoRecebido) {
    this.hasMoved = true;
    this._updateCoordinates(eventoRecebido.clientX, eventoRecebido.clientY);
  }
  _onMouseDown(eventoRecebido) {
    if (eventoRecebido.button !== 0 || this.isDown || eventoRecebido.target?.closest?.("button")) return;
    const rect = this.canvas.getBoundingClientRect();
    if (eventoRecebido.clientX < rect.left || eventoRecebido.clientY < rect.top || eventoRecebido.clientX >= rect.left + rect.width || eventoRecebido.clientY >= rect.top + rect.height) return;
    this.hasMoved = true;
    this._updateCoordinates(eventoRecebido.clientX, eventoRecebido.clientY);
    this.isDown = true;
    this._clickedBuffer = true;
  }
  _onMouseUp(eventoRecebido) {
    if (eventoRecebido.button === 0) this.isDown = false;
  }
  _onBlur() {
    this.isDown = false;
    this.justClicked = false;
    this._clickedBuffer = false;
  }
  _onTouchStart(eventoRecebido) {
    if (this.isDown || eventoRecebido.target?.closest?.("button")) return;
    if (eventoRecebido.touches && eventoRecebido.touches.length > 0) {
      const fracao = eventoRecebido.touches[0];
      this.hasMoved = true;
      this._updateCoordinates(fracao.clientX, fracao.clientY);
      this.isDown = true;
      this._clickedBuffer = true;
    }
  }
  _onTouchMove(eventoRecebido) {
    if (eventoRecebido.touches && eventoRecebido.touches.length > 0) {
      const fracao = eventoRecebido.touches[0];
      this.hasMoved = true;
      this._updateCoordinates(fracao.clientX, fracao.clientY);
    }
  }
  _onTouchEnd(eventoRecebido) {
    this.isDown = false;
  }
  _onContextMenu(eventoRecebido) {
    eventoRecebido.preventDefault();
  }
  // Recebe a atualização atual e avança o estado, sem redesenhar a tela.
  update(cameraX = 0, cameraY = 0) {
    this.justClicked = this._clickedBuffer;
    this._clickedBuffer = false;
    this.worldX = this.x + cameraX;
    this.worldY = this.y + cameraY;
  }
  // Encerra os recursos desta instância para não deixar eventos ativos.
  destroy() {
    window.removeEventListener("mousemove", this._onMouseMove);
    window.removeEventListener("mousedown", this._onMouseDown);
    window.removeEventListener("mouseup", this._onMouseUp);
    window.removeEventListener("blur", this._onBlur);
    globalThis.document?.removeEventListener("visibilitychange", this._onBlur);
    window.removeEventListener("touchcancel", this._onBlur);
    window.removeEventListener("touchstart", this._onTouchStart);
    window.removeEventListener("touchmove", this._onTouchMove);
    window.removeEventListener("touchend", this._onTouchEnd);
    this.canvas.removeEventListener("contextmenu", this._onContextMenu);
  }
}
