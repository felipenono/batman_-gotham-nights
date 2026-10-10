/**
 * @file Camera.js
 * 2D viewport camera with smooth target following and decaying screen shake.
 */

export class Camera {
  /**
   * @param {number} width - Viewport width
   * @param {number} height - Viewport height
   */
  constructor(width = 900, height = 500) {
    this.x = 0;
    this.y = 0;
    this.width = width;
    this.height = height;

    this.worldWidth = width;
    this.worldHeight = height;

    this.lerpSpeed = 0.12;
    this.target = null;

    // Screen shake parameters
    this.shakeIntensity = 0;
    this.shakeDuration = 0;
    this.shakeTimer = 0;
    this.shakeOffsetX = 0;
    this.shakeOffsetY = 0;
  }

  /**
   * Set target entity to track.
   * @param {Object} target
   */
  follow(target) {
    this.target = target;
  }

  /**
   * Set world limits for boundary clamping.
   * @param {number} worldWidth
   * @param {number} worldHeight
   */
  setBounds(worldWidth, worldHeight) {
    this.worldWidth = Math.max(worldWidth, this.width);
    this.worldHeight = Math.max(worldHeight, this.height);
  }

  /**
   * Triggers a screen shake effect.
   * @param {number} intensity - Magnitude in pixels (default 8)
   * @param {number} duration - Duration in frames (default 12)
   */
  shake(intensity = 8, duration = 12) {
    this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
    this.shakeDuration = Math.max(this.shakeDuration, duration);
    this.shakeTimer = this.shakeDuration;
  }

  /**
   * Updates camera position and calculates active screen shake.
   */
  update() {
    if (this.target) {
      const targetCenterX = this.target.x + (this.target.w || 0) / 2;
      const targetCenterY = this.target.y + (this.target.h || 0) / 2;

      const desiredX = targetCenterX - this.width / 2;
      const desiredY = targetCenterY - this.height / 2;

      this.x += (desiredX - this.x) * this.lerpSpeed;
      this.y += (desiredY - this.y) * this.lerpSpeed;
    }

    // Clamp camera within world boundaries
    this.x = Math.max(0, Math.min(this.x, this.worldWidth - this.width));
    this.y = Math.max(0, Math.min(this.y, this.worldHeight - this.height));

    // Calculate decaying screen shake
    if (this.shakeTimer > 0) {
      const progress = this.shakeTimer / this.shakeDuration;
      const currentIntensity = this.shakeIntensity * progress;
      this.shakeOffsetX = (Math.random() * 2 - 1) * currentIntensity;
      this.shakeOffsetY = (Math.random() * 2 - 1) * currentIntensity;
      this.shakeTimer--;
      if (this.shakeTimer <= 0) {
        this.shakeIntensity = 0;
        this.shakeDuration = 0;
        this.shakeOffsetX = 0;
        this.shakeOffsetY = 0;
      }
    } else {
      this.shakeOffsetX = 0;
      this.shakeOffsetY = 0;
    }
  }

  /**
   * Current effective rendering offset.
   */
  get renderX() {
    return Math.round(this.x + this.shakeOffsetX);
  }

  get renderY() {
    return Math.round(this.y + this.shakeOffsetY);
  }
}
