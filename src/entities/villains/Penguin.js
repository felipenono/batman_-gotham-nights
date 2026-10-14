// Este arquivo cuida de controlar os ataques do Pinguim.
// ===== DEPENDÊNCIAS E CONFIGURAÇÕES =====
import { Character } from "../Character.js";
import { PROJECTILE } from "../../config/configuracao.js";
import { PenguinBomb } from "../projectiles/PenguinBomb.js";
// ===== COMPORTAMENTO =====
export class Penguin extends Character {
  // Recebe as dependências e prepara o estado inicial deste componente.
  constructor({ x: posicaoX = 600, y: posicaoY = 320 } = {}) {
    super({
      x: posicaoX,
      y: posicaoY,
      w: 40,
      h: 60,
      maxHp: 25
    });
    this.spriteKey = "penguin";
    this.scoreType = "Penguin";
    this.name = "Pinguim";
    this.shootCooldown = 120 + Math.floor(Math.random() * 60);
    this.speed = 1.3;
    this.waddleTime = 0;
  }
  // Recebe o estado da partida e decide o próximo movimento ou ataque.
  updateAI(jogador, projectilesOut, playSfx = null) {
    if (!this.alive || !jogador || !jogador.alive) return;
    const dx = jogador.x - this.x;
    this.facing = dx >= 0 ? 1 : -1;
    if (this.hurtFlash > 0) return;
    if (Math.abs(dx) > 160) {
      this.vx = this.facing * this.speed;
    } else {
      this.vx = 0;
    }
    this.shootCooldown--;
    if (this.shootCooldown <= 0) {
      this.shootCooldown = 120 + Math.floor(Math.random() * 60);
      this.firePenguin(jogador, projectilesOut, playSfx);
    }
  }
  firePenguin(jogador, projectilesOut, playSfx = null) {
    this.attackTimer = 18;
    this.isAttacking = true;
    if (typeof playSfx === "function") {
      playSfx("umbrella_shot");
    }
    const originX = this.x + this.w / 2 + this.facing * 28;
    const originY = this.y + 30;
    const dx = jogador.x + jogador.w / 2 - originX;
    const dy = jogador.y + jogador.h / 2 - originY;
    const length = Math.hypot(dx, dy) || 1;
    projectilesOut.push(new PenguinBomb(originX, originY, dx / length * PROJECTILE.PENGUIN_BOMB_SPEED, dy / length * PROJECTILE.PENGUIN_BOMB_SPEED, jogador));
  }
  // Recebe a atualização atual e avança o estado, sem redesenhar a tela.
  update(passoTempo = 1, mundo = null) {
    super.update(passoTempo, mundo);
    this.waddleTime += 0.2 * passoTempo;
  }
  // Recebe o contexto 2D e desenha o estado atual sem avançar o tempo.
  draw(contexto) {
    this.drawSprite(contexto);
  }
}
