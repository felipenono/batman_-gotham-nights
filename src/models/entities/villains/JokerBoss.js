// Este arquivo cuida de controlar o Coringa como chefe.
// ===== DEPENDÊNCIAS E CONFIGURAÇÕES =====
import { Joker } from "./Joker.js";
import { JokerTeeth } from "../projectiles/JokerTeeth.js";
import { GasBomb } from "../projectiles/GasBomb.js";
// ===== COMPORTAMENTO =====
export class JokerBoss extends Joker {
  // Recebe as dependências e prepara o estado inicial deste componente.
  constructor(opcoes) {
    super(opcoes);
    this.scoreType = "JokerBoss";
    this.isBoss = true;
    this.w = 52;
    this.h = 94;
    this.hp = this.maxHp = 120;
    this.speed = 2;
    this.shootCooldown = 70;
    this.bombCooldown = 180;
    this.jumpCooldown = 120;
    this.arenaWidth = 1100;
    this.wallEscapeTimer = 0;
  }
  // Recebe o estado da partida e decide o próximo movimento ou ataque.
  updateAI(jogador, shots, onFearAura, playSfx = null) {
    if (!this.alive || !jogador?.alive) return;
    const dx = jogador.x + jogador.w / 2 - this.x - this.w / 2;
    this.facing = dx >= 0 ? 1 : -1;
    if (this.hurtFlash > 0) {
      this.vx = 0;
      return;
    }
    this.vx = Math.abs(dx) > 180 ? this.facing * this.speed : Math.abs(dx) < 100 ? -this.facing * this.speed : 0;
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
    if (--this.jumpCooldown <= 0 && this.onGround) {
      this.vy = -9;
      this.jumpCooldown = 150;
    }
    if (--this.shootCooldown <= 0) {
      this.throwTeeth(jogador, shots, playSfx);
      this.shootCooldown = this.hpRatio < 0.5 ? 70 : 100;
    }
    if (--this.bombCooldown <= 0) {
      this.attackTimer = 24;
      this.isAttacking = true;
      shots.push(new GasBomb(this.x + this.w / 2, this.y + 24, this.facing * 4.5, -7));
      this.bombCooldown = 210;
      if (typeof playSfx === "function") playSfx("joker_laugh");
    }
  }
  throwTeeth(jogador, shots, playSfx) {
    super.throwTeeth(jogador, shots, playSfx);
    if (this.hpRatio >= 0.5) return;
    const shot = shots[shots.length - 1];
    shots.push(new JokerTeeth(shot.x, shot.y, shot.vx - 0.9, shot.vy - 1));
    shots.push(new JokerTeeth(shot.x, shot.y, shot.vx + 0.9, shot.vy - 1));
  }
  // Recebe a atualização atual e avança o estado, sem redesenhar a tela.
  update(passoTempo = 1, mundo = null) {
    this.arenaWidth = mundo?.width || this.arenaWidth;
    super.update(passoTempo, mundo);
  }
}
