// Este arquivo cuida de controlar o Duas-Caras e a escolha de ataques.
// ===== DEPENDÊNCIAS E CONFIGURAÇÕES =====
import { Character } from "../Character.js";
import { Bullet } from "../projectiles/Bullet.js";
import { Coin } from "../projectiles/Coin.js";
// ===== COMPORTAMENTO =====
export class TwoFace extends Character {
  // Recebe as dependências e prepara o estado inicial deste componente.
  constructor({ x: posicaoX = 700, y: posicaoY = 290 } = {}) {
    super({
      x: posicaoX,
      y: posicaoY,
      w: 40,
      h: 80,
      maxHp: 150
    });
    this.spriteKey = "two_face";
    this.scoreType = "TwoFace";
    this.name = "Duas-Caras";
    this.isBoss = true;
    this.attackCycleTimer = 110;
    this.coinFlipping = false;
    this.coinFlipTimer = 0;
    this.nextAttackIsBullets = true;
    this.speed = 1.8;
    this.stride = 0;
  }
  // Recebe o estado da partida e decide o próximo movimento ou ataque.
  updateAI(jogador, projectilesOut, onSpecial = null, playSfx = null) {
    if (!this.alive || !jogador || !jogador.alive) return;
    const dx = jogador.x - this.x;
    this.facing = dx >= 0 ? 1 : -1;
    if (this.hurtFlash > 0) return;
    if (!this.coinFlipping && Math.abs(dx) > 170) {
      this.vx = this.facing * this.speed;
    } else {
      this.vx = 0;
    }
    if (this.coinFlipping) {
      this.coinFlipTimer--;
      if (this.coinFlipTimer <= 0) {
        this.coinFlipping = false;
        this.executeDecidedAttack(jogador, projectilesOut, playSfx);
      }
      return;
    }
    this.attackCycleTimer--;
    if (this.attackCycleTimer <= 0) {
      this.attackCycleTimer = 120 + Math.floor(Math.random() * 45);
      this.coinFlipping = true;
      this.coinFlipTimer = 35;
      this.nextAttackIsBullets = Math.random() > 0.5;
      if (typeof playSfx === "function") {
        playSfx("coin_ping");
      }
    }
  }
  executeDecidedAttack(jogador, projectilesOut, playSfx = null) {
    this.attackTimer = 18;
    this.isAttacking = true;
    const originX = this.x + this.w / 2 + this.facing * 20;
    const originY = this.y + 30;
    const isEnraged = this.hpRatio < 0.5;
    if (this.nextAttackIsBullets) {
      if (typeof playSfx === "function") {
        playSfx("gunshot");
      }
      if (isEnraged) {
        projectilesOut.push(new Bullet(originX, originY, this.facing * 8.5, -1.5));
        projectilesOut.push(new Bullet(originX, originY, this.facing * 8.5, 1.5));
      } else {
        projectilesOut.push(new Bullet(originX, originY, this.facing * 9, 0));
      }
    } else {
      if (typeof playSfx === "function") {
        playSfx("throw");
      }
      const dx = jogador.x - originX;
      const velocidadeX = Math.sign(dx) * (6 + Math.random() * 2);
      projectilesOut.push(new Coin(originX, originY, velocidadeX, -6));
      if (isEnraged) {
        projectilesOut.push(new Coin(originX, originY, velocidadeX * 0.75, -8));
      }
    }
  }
  // Recebe a atualização atual e avança o estado, sem redesenhar a tela.
  update(passoTempo = 1, mundo = null) {
    super.update(passoTempo, mundo);
    this.stride += 0.18 * passoTempo;
  }
  // Recebe o contexto 2D e desenha o estado atual sem avançar o tempo.
  draw(contexto) {
    this.drawSprite(contexto);
  }
}
