// Este arquivo cuida de acompanhar o personagem e controlar o tremor da tela.
// ===== DEPENDÊNCIAS E CONFIGURAÇÕES =====
// ===== COMPORTAMENTO =====
export class Camera {
  // Recebe as dependências e prepara o estado inicial deste componente.
  constructor(largura = 900, altura = 500) {
    this.x = 0;
    this.y = 0;
    this.width = largura;
    this.height = altura;
    this.worldWidth = largura;
    this.worldHeight = altura;
    this.lerpSpeed = 0.12;
    this.target = null;
    // Screen shake parameters
    this.shakeIntensity = 0;
    this.shakeDuration = 0;
    this.shakeTimer = 0;
    this.shakeOffsetX = 0;
    this.shakeOffsetY = 0;
  }
  follow(alvo) {
    this.target = alvo;
  }
  setBounds(worldWidth, worldHeight) {
    this.worldWidth = Math.max(worldWidth, this.width);
    this.worldHeight = Math.max(worldHeight, this.height);
  }
  shake(intensity = 8, duracao = 12) {
    this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
    this.shakeDuration = Math.max(this.shakeDuration, duracao);
    this.shakeTimer = this.shakeDuration;
  }
  // Recebe a atualização atual e avança o estado, sem redesenhar a tela.
  update() {
    if (this.target) {
      const targetCenterX = this.target.x + (this.target.w || 0) / 2;
      const targetCenterY = this.target.y + (this.target.h || 0) / 2;
      const desiredX = Math.max(0, Math.min(targetCenterX - this.width / 2, this.worldWidth - this.width));
      const desiredY = Math.max(0, Math.min(targetCenterY - this.height / 2, this.worldHeight - this.height));
      this.x += (desiredX - this.x) * this.lerpSpeed;
      this.y += (desiredY - this.y) * this.lerpSpeed;
      if (Math.abs(desiredX - this.x) < 0.01) this.x = desiredX;
      if (Math.abs(desiredY - this.y) < 0.01) this.y = desiredY;
    }
    this.x = Math.max(0, Math.min(this.x, this.worldWidth - this.width));
    this.y = Math.max(0, Math.min(this.y, this.worldHeight - this.height));
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
  get renderX() {
    return Math.round(this.x + this.shakeOffsetX);
  }
  get renderY() {
    return Math.round(this.y + this.shakeOffsetY);
  }
}
