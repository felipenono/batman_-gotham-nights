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
      this.coinFlipTimer -= this.attackRate ?? 1;
      if (this.coinFlipTimer <= 0) {
        this.coinFlipping = false;
        this.executeDecidedAttack(jogador, projectilesOut, playSfx);
      }
      return;
    }
    this.attackCycleTimer -= this.attackRate ?? 1;
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
    const targetX = jogador.x + jogador.w / 2;
    const targetY = jogador.y + jogador.h / 2;
    if (this.nextAttackIsBullets) {
      if (typeof playSfx === "function") playSfx("gunshot");
      const angle = Math.atan2(targetY - (originY + 4), targetX - (originX + 8));
      const speed = isEnraged ? 8.5 : 9;
      for (const offset of isEnraged ? [-0.16, 0.16] : [0]) {
        projectilesOut.push(new Bullet(originX, originY, Math.cos(angle + offset) * speed, Math.sin(angle + offset) * speed));
      }
    } else {
      if (typeof playSfx === "function") playSfx("throw");
      const dx = targetX - (originX + 9);
      const dy = targetY - (originY + 9);
      const flightTime = Math.max(12, Math.min(60, Math.round(Math.abs(dx) / 7)));
      for (const time of isEnraged ? [flightTime, flightTime + 10] : [flightTime]) {
        projectilesOut.push(new Coin(originX, originY, dx / time, dy / time - 0.28 * (time + 1) / 2));
      }
    }
  }
  // Recebe a atualização atual e avança o estado, sem redesenhar a tela.
  update(passoTempo = 1, mundo = null) {
    super.update(passoTempo, mundo);
    this.stride += 0.18 * passoTempo;
  }

}
