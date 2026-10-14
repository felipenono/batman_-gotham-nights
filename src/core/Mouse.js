import { Viewport } from './Viewport.js';
/**
 * @file Mouse.js
 * Mouse position tracking and click detection scaled accurately to the canvas.
 */

export class Mouse {
  /**
   * @param {HTMLCanvasElement} canvas
   */
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

    window.addEventListener('mousemove', this._onMouseMove);
    window.addEventListener('mousedown', this._onMouseDown);
    window.addEventListener('mouseup', this._onMouseUp);
    window.addEventListener('blur', this._onBlur);
    globalThis.document?.addEventListener('visibilitychange', this._onBlur);
    window.addEventListener('touchcancel', this._onBlur);
    window.addEventListener('touchstart', this._onTouchStart, { passive: false });
    window.addEventListener('touchmove', this._onTouchMove, { passive: false });
    window.addEventListener('touchend', this._onTouchEnd);
    canvas.addEventListener('contextmenu', this._onContextMenu);
  }

  _updateCoordinates(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;

    const point = this.viewport.toGame((clientX - rect.left) * scaleX,
      (clientY - rect.top) * scaleY, this.canvas.width, this.canvas.height);
    this.x = point.x; this.y = point.y;
  }

  _onMouseMove(e) {
    this.hasMoved = true;
    this._updateCoordinates(e.clientX, e.clientY);
  }

  _onMouseDown(e) {
    if (e.button !== 0 || this.isDown || e.target?.closest?.('button')) return;
    const rect = this.canvas.getBoundingClientRect();
    if (e.clientX < rect.left || e.clientY < rect.top || e.clientX >= rect.left + rect.width || e.clientY >= rect.top + rect.height) return;
    this.hasMoved = true;
    this._updateCoordinates(e.clientX, e.clientY);
    this.isDown = true;
    this._clickedBuffer = true;
  }

  _onMouseUp(e) {
    if (e.button === 0) this.isDown = false;
  }

  _onBlur() {
    this.isDown = false;
    this.justClicked = false;
    this._clickedBuffer = false;
  }

  _onTouchStart(e) {
    if (this.isDown || e.target?.closest?.('button')) return;
    if (e.touches && e.touches.length > 0) {
      const t = e.touches[0];
      this.hasMoved = true;
      this._updateCoordinates(t.clientX, t.clientY);
      this.isDown = true;
      this._clickedBuffer = true;
    }
  }

  _onTouchMove(e) {
    if (e.touches && e.touches.length > 0) {
      const t = e.touches[0];
      this.hasMoved = true;
      this._updateCoordinates(t.clientX, t.clientY);
    }
  }

  _onTouchEnd(e) {
    this.isDown = false;
  }

  _onContextMenu(e) {
    e.preventDefault();
  }

  /**
   * Call once per frame to flush click buffer and update world coordinates.
   * @param {number} cameraX
   * @param {number} cameraY
   */
  update(cameraX = 0, cameraY = 0) {
    this.justClicked = this._clickedBuffer;
    this._clickedBuffer = false;
    this.worldX = this.x + cameraX;
    this.worldY = this.y + cameraY;
  }

  destroy() {
    window.removeEventListener('mousemove', this._onMouseMove);
    window.removeEventListener('mousedown', this._onMouseDown);
    window.removeEventListener('mouseup', this._onMouseUp);
    window.removeEventListener('blur', this._onBlur);
    globalThis.document?.removeEventListener('visibilitychange', this._onBlur);
    window.removeEventListener('touchcancel', this._onBlur);
    window.removeEventListener('touchstart', this._onTouchStart);
    window.removeEventListener('touchmove', this._onTouchMove);
    window.removeEventListener('touchend', this._onTouchEnd);
    this.canvas.removeEventListener('contextmenu', this._onContextMenu);
  }
}
