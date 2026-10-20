// Este arquivo cuida de controlar o Espantalho e seus ataques de medo.
// ===== DEPENDÊNCIAS E CONFIGURAÇÕES =====
import { Character } from "../Character.js";
import { FearSmoke } from "../projectiles/FearSmoke.js";
import { GasBomb } from "../projectiles/GasBomb.js";
// ===== COMPORTAMENTO =====
export class Scarecrow extends Character {
  // Recebe as dependências e prepara o estado inicial deste componente.
  constructor({ x: posicaoX = 700, y: posicaoY = 260 } = {}) {
    // [POO - Herança]: Dimensões imponentes (60x110) e 100 HP para batalha de chefe
    super({
      x: posicaoX,
      y: posicaoY,
      w: 60,
      h: 110,
      maxHp: 100
    });
    this.spriteKey = "scarecrow";
    this.scoreType = "Scarecrow";
    this.name = "Espantalho";
    this.isBoss = true;
    // Fala tocada quando ele entra na arena (ver AUDIO_CONFIG.VOZES).
    this.introVoice = "scarecrow_intro";
    this.smokeCooldown = 110;
    this.bombCooldown = 190;
    this.auraTimer = 1200;
    // Cinemática de passos e patrulha
    this.floatCycle = 0;
    this.patrolTimer = 90;
    this.patrolDirection = -1;
    this.jumpCooldown = 90;
    this.speed = 1.2;
    this.arenaWidth = 1100;
    this.wallEscapeTimer = 0;
  }
  // Recebe o estado da partida e decide o próximo movimento ou ataque.
  updateAI(jogador, projectilesOut, onFearAura, playSfx = null) {
    if (!this.alive || !jogador || !jogador.alive) return;
    const dx = jogador.x - this.x;
    this.facing = dx >= 0 ? 1 : -1;
    if (this.hurtFlash > 0) {
      this.vx = 0;
      return;
    }
    if (--this.patrolTimer <= 0) {
      this.patrolDirection *= -1;
      this.patrolTimer = 90;
    }
    this.vx = Math.abs(dx) > 220 ? this.facing * this.speed : Math.abs(dx) < 120 ? -this.facing * this.speed : this.patrolDirection * 0.8;
    if (this.x < 16 && this.vx < 0) {
      this.wallEscapeTimer = 45;
      this.wallEscapeDirection = 1;
    }
    if (this.x + this.w > this.arenaWidth - 16 && this.vx > 0) {
      this.wallEscapeTimer = 45;
      this.wallEscapeDirection = -1;
    }
    if (this.wallEscapeTimer > 0) {
      this.vx = this.wallEscapeDirection * this.speed;
      this.wallEscapeTimer--;
    }
    if (--this.jumpCooldown <= 0 && this.onGround && jogador.y + jogador.h < this.y + this.h - 45) {
      this.vy = -11;
      this.jumpCooldown = 120;
    }
    this.auraTimer--;
    if (this.auraTimer <= 0) {
      this.auraTimer = 1200;
      if (typeof playSfx === "function") {
        playSfx("fear_drone");
      }
      if (typeof onFearAura === "function") {
        onFearAura(180);
      }
      this.hurtFlash = 5;
    }
    this.smokeCooldown--;
    if (this.smokeCooldown <= 0) {
      this.smokeCooldown = 90 + Math.floor(Math.random() * 60);
      this.castFearSmoke(jogador, projectilesOut, playSfx);
    }
    this.bombCooldown--;
    if (this.bombCooldown <= 0) {
      this.bombCooldown = 180 + Math.floor(Math.random() * 60);
      this.throwGasBomb(jogador, projectilesOut, playSfx);
    }
  }
  castFearSmoke(jogador, projectilesOut, playSfx = null) {
    this.attackTimer = 20;
    this.isAttacking = true;
    if (typeof playSfx === "function") {
      playSfx("gas_hiss");
    }
    const originX = this.x + this.w / 2 + this.facing * 25;
    const originY = this.y + 40;
    const dx = jogador.x - originX;
    const dy = jogador.y - originY;
    const dist = Math.hypot(dx, dy) || 1;
    const velocidadeX = dx / dist * 2.2;
    const velocidadeY = dy / dist * 1.5;
    projectilesOut.push(new FearSmoke(originX, originY, velocidadeX, velocidadeY));
  }
  throwGasBomb(jogador, projectilesOut, playSfx = null) {
    this.attackTimer = 25;
    this.isAttacking = true;
    if (typeof playSfx === "function") {
      playSfx("gas_bomb");
    }
    const originX = this.x + this.w / 2 + this.facing * 20;
    const originY = this.y + 35;
    const dx = jogador.x - originX;
    const velocidadeX = Math.sign(dx) * (5 + Math.random() * 2);
    const velocidadeY = -7 - Math.random() * 2.5;
    projectilesOut.push(new GasBomb(originX, originY, velocidadeX, velocidadeY));
  }
  // Recebe a atualização atual e avança o estado, sem redesenhar a tela.
  update(passoTempo = 1, mundo = null) {
    this.arenaWidth = mundo?.width || this.arenaWidth;
    super.update(passoTempo, mundo);
    this.floatCycle += 0.05 * passoTempo;
  }

}
