// Este arquivo cuida de controlar a Arlequina e suas acrobacias.
// ===== DEPENDÊNCIAS E CONFIGURAÇÕES =====
import { Character } from "../Character.js";
import { Bullet } from "../projectiles/Bullet.js";
import { Mallet } from "../projectiles/Mallet.js";
// ===== COMPORTAMENTO =====
export class HarleyQuinn extends Character {
  // Recebe as dependências e prepara o estado inicial deste componente.
  constructor({ x: posicaoX = 700, y: posicaoY = 300 } = {}) {
    super({
      x: posicaoX,
      y: posicaoY,
      w: 38,
      h: 72,
      maxHp: 120
    });
    this.spriteKey = "harley_quinn";
    this.scoreType = "HarleyQuinn";
    this.name = "Arlequina";
    this.isBoss = true;
    this.bulletCooldown = 75;
    this.malletCooldown = 200;
    this.cartwheelCooldown = 320;
    this.isCartwheeling = false;
    this.cartwheelTimer = 0;
    this.cartwheelAngle = 0;
    this.speed = 2.4;
    this.acrobatTime = 0;
  }
  // Recebe o estado da partida e decide o próximo movimento ou ataque.
  updateAI(jogador, projectilesOut, onSpecial = null, playSfx = null) {
    if (!this.alive || !jogador || !jogador.alive) return;
    const dx = jogador.x - this.x;
    if (!this.isCartwheeling) {
      this.facing = dx >= 0 ? 1 : -1;
    }
    if (this.hurtFlash > 0 && !this.isCartwheeling) return;
    if (this.isCartwheeling) {
      this.vx = this.facing * 6;
      this.cartwheelAngle += 0.35;
      this.cartwheelTimer--;
      if (this.cartwheelTimer <= 0) {
        this.isCartwheeling = false;
        this.vx = 0;
      }
      return;
    }
    if (Math.abs(dx) > 190) {
      this.vx = this.facing * this.speed;
    } else {
      this.vx = 0;
    }
    this.cartwheelCooldown--;
    if (this.cartwheelCooldown <= 0 && Math.abs(dx) > 100) {
      this.cartwheelCooldown = 320 + Math.floor(Math.random() * 60);
      this.isCartwheeling = true;
      this.cartwheelTimer = 35;
      this.cartwheelAngle = 0;
      return;
    }
    this.bulletCooldown--;
    if (this.bulletCooldown <= 0) {
      this.bulletCooldown = 60 + Math.floor(Math.random() * 30);
      this.shootGuns(jogador, projectilesOut, playSfx);
    }
    this.malletCooldown--;
    if (this.malletCooldown <= 0) {
      this.malletCooldown = 180 + Math.floor(Math.random() * 60);
      this.throwMallet(jogador, projectilesOut, playSfx);
    }
  }
  shootGuns(jogador, projectilesOut, playSfx = null) {
    this.attackTimer = 16;
    this.isAttacking = true;
    if (typeof playSfx === "function") {
      playSfx("gunshot");
    }
    const originX = this.x + this.w / 2 + this.facing * 18;
    const originY = this.y + 26;
    const isEnraged = this.hpRatio < 0.5;
    if (isEnraged) {
      projectilesOut.push(new Bullet(originX, originY, this.facing * 8, -1.8));
      projectilesOut.push(new Bullet(originX, originY, this.facing * 8, 0));
      projectilesOut.push(new Bullet(originX, originY, this.facing * 8, 1.8));
    } else {
      projectilesOut.push(new Bullet(originX, originY, this.facing * 8.5, 0));
    }
  }
  throwMallet(jogador, projectilesOut, playSfx = null) {
    this.attackTimer = 22;
    this.isAttacking = true;
    if (typeof playSfx === "function") {
      playSfx("throw");
    }
    const originX = this.x + this.w / 2 + this.facing * 20;
    const originY = this.y + 20;
    const dx = jogador.x - originX;
    const velocidadeX = Math.sign(dx) * 7;
    const velocidadeY = -5;
    projectilesOut.push(new Mallet(originX, originY, velocidadeX, velocidadeY));
  }
  // Recebe a atualização atual e avança o estado, sem redesenhar a tela.
  update(passoTempo = 1, mundo = null) {
    super.update(passoTempo, mundo);
    this.acrobatTime += 0.2 * passoTempo;
  }

}
