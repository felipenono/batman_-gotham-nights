// Este arquivo cuida de controlar a bomba perseguidora e sua explosão.
import { APARENCIA } from "../../config/configuracao.js";

// ===== DEPENDÊNCIAS E CONFIGURAÇÕES =====
import { UmbrellaBurst } from "./UmbrellaBurst.js";
import { PROJECTILE } from "../../config/configuracao.js";
const estiloVisual = APARENCIA.PenguinBomb;
// ===== COMPORTAMENTO =====
export class PenguinBomb extends UmbrellaBurst {
  // Recebe as dependências e prepara o estado inicial deste componente.
  constructor(posicaoX, posicaoY, velocidadeX, velocidadeY, alvo = null) {
    super(posicaoX, posicaoY, velocidadeX, velocidadeY, alvo);
    this.w = 20;
    this.h = 26;
    this.speed = PROJECTILE.PENGUIN_BOMB_SPEED;
    this.lifetime = PROJECTILE.PENGUIN_BOMB_FUSE;
    this.exploded = false;
    this.explodeTimer = 0;
    this.explodeRadius = 10;
    this.damageApplied = false;
  }
  // Recebe a atualização atual e avança o estado, sem redesenhar a tela.
  update(passoTempo = 1, mundo = null) {
    if (!this.alive) return;
    if (this.exploded) {
      this.explodeTimer += passoTempo;
      this.explodeRadius = Math.min(PROJECTILE.PENGUIN_BOMB_RADIUS, 10 + this.explodeTimer * 3);
      this.w = this.h = this.explodeRadius * 2;
      this.x = this.blastX - this.explodeRadius;
      this.y = this.blastY - this.explodeRadius;
      if (this.explodeTimer >= PROJECTILE.PENGUIN_BOMB_BLAST_FRAMES) this.alive = false;
      return;
    }
    super.update(passoTempo, mundo);
    if (this.lifetime <= 0) {
      this.alive = true;
      this.detonate();
      return;
    }
    if (mundo?.platforms?.some((elemento) => elemento.alive && this.intersects(elemento))) this.detonate();
    if (this.target?.alive && !this.target.intangible && this.intersects(this.target)) this.detonate();
  }
  detonate() {
    if (this.exploded || !this.alive) return;
    this.blastX = this.x + this.w / 2;
    this.blastY = this.y + this.h / 2;
    this.exploded = true;
    this.vx = this.vy = 0;
    this.w = this.h = this.explodeRadius * 2;
    this.x = this.blastX - this.explodeRadius;
    this.y = this.blastY - this.explodeRadius;
  }
  intersects(other) {
    if (!this.exploded) return super.intersects(other);
    if (!this.alive || !other?.alive) return false;
    const posicaoX = Math.max(other.x, Math.min(this.blastX, other.x + other.w));
    const posicaoY = Math.max(other.y, Math.min(this.blastY, other.y + other.h));
    return Math.hypot(posicaoX - this.blastX, posicaoY - this.blastY) < this.explodeRadius;
  }
  // Recebe o contexto 2D e desenha o estado atual sem avançar o tempo.
  draw(contexto) {
    if (!this.alive) return;
    contexto.save();
    contexto.translate(this.x + this.w / 2, this.y + this.h / 2);
    if (this.exploded) {
      contexto.globalAlpha = 1 - this.explodeTimer / PROJECTILE.PENGUIN_BOMB_BLAST_FRAMES;
      contexto.fillStyle = estiloVisual.preenchimento1;
      contexto.beginPath();
      contexto.arc(0, 0, this.explodeRadius, 0, Math.PI * 2);
      contexto.fill();
      contexto.fillStyle = estiloVisual.preenchimento2;
      contexto.beginPath();
      contexto.arc(0, 0, this.explodeRadius * 0.58, 0, Math.PI * 2);
      contexto.fill();
    } else {
      contexto.rotate(Math.sin(this.pulse) * 0.08);
      contexto.fillStyle = estiloVisual.preenchimento3;
      contexto.fillRect(-9, 9, 7, 4);
      contexto.fillRect(2, 9, 7, 4);
      contexto.fillStyle = estiloVisual.preenchimento4;
      contexto.strokeStyle = estiloVisual.contorno5;
      contexto.lineWidth = 1;
      contexto.beginPath();
      contexto.ellipse(0, 0, 9, 12, 0, 0, Math.PI * 2);
      contexto.fill();
      contexto.stroke();
      contexto.fillStyle = estiloVisual.preenchimento6;
      contexto.beginPath();
      contexto.ellipse(0, 3, 5.5, 7, 0, 0, Math.PI * 2);
      contexto.fill();
      contexto.fillStyle = estiloVisual.preenchimento7;
      contexto.fillRect(-5, -7, 3, 3);
      contexto.fillRect(2, -7, 3, 3);
      contexto.fillStyle = estiloVisual.preenchimento3;
      contexto.beginPath();
      contexto.moveTo(-3, -3);
      contexto.lineTo(3, -3);
      contexto.lineTo(0, 1);
      contexto.closePath();
      contexto.fill();
      contexto.fillStyle = estiloVisual.preenchimento9;
      contexto.fillRect(-4, 1, 8, 3);
      contexto.fillStyle = this.lifetime < 30 ? estiloVisual.gradiente10 : estiloVisual.gradiente11;
      contexto.fillRect(-2, -15, 4, 4);
    }
    contexto.restore();
  }
}
