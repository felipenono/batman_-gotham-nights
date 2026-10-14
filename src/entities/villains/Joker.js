// Este arquivo cuida de controlar os ataques do Coringa comum.
// ===== DEPENDÊNCIAS E CONFIGURAÇÕES =====
import { Character } from "../Character.js";
import { JokerTeeth } from "../projectiles/JokerTeeth.js";
// ===== COMPORTAMENTO =====
export class Joker extends Character {
  // Recebe as dependências e prepara o estado inicial deste componente.
  constructor({ x: posicaoX = 600, y: posicaoY = 300 } = {}) {
    // [POO - Herança]: Dimensões (34x70) e 10 HP (derrotado com 1 batarang direto)
    super({
      x: posicaoX,
      y: posicaoY,
      w: 34,
      h: 70,
      maxHp: 10
    });
    this.spriteKey = "joker";
    this.shootCooldown = 75 + Math.floor(Math.random() * 60);
    this.scoreType = "Joker";
    this.name = "Coringa";
    this.speed = 1.6;
    this.wobble = 0;
  }
  // Recebe o estado da partida e decide o próximo movimento ou ataque.
  updateAI(jogador, projectilesOut, playSfx = null) {
    if (!this.alive || !jogador || !jogador.alive) return;
    // Etapa 1: Orientação frontal em direção ao alvo
    const dx = jogador.x - this.x;
    this.facing = dx >= 0 ? 1 : -1;
    // Etapa 2: Interrupção temporária caso esteja atordoado por dano recente
    if (this.hurtFlash > 0) return;
    // Etapa 3: Perseguição no plano horizontal
    if (Math.abs(dx) > 15) {
      this.vx = this.facing * this.speed;
    } else {
      this.vx = 0;
    }
    // Etapa 4: Ciclo de arremesso balístico de dentaduras
    this.shootCooldown--;
    if (this.shootCooldown <= 0) {
      this.shootCooldown = 75 + Math.floor(Math.random() * 60);
      this.throwTeeth(jogador, projectilesOut, playSfx);
    }
  }
  throwTeeth(jogador, projectilesOut, playSfx = null) {
    this.attackTimer = 15;
    this.isAttacking = true;
    if (typeof playSfx === "function") {
      if (Math.random() > 0.45) {
        playSfx("joker_laugh");
      } else {
        playSfx("teeth_chatter");
      }
    }
    const originX = this.x + this.w / 2 + this.facing * 14;
    const originY = this.y + 24;
    const targetX = jogador.x + jogador.w / 2;
    const targetY = jogador.y + jogador.h / 2;
    const dx = targetX - originX;
    const dy = targetY - originY;
    const flightTime = Math.max(30, Math.min(60, Math.abs(dx) / 5.5));
    const velocidadeX = dx / flightTime;
    const velocidadeY = (dy - 0.5 * 0.25 * flightTime * flightTime) / flightTime;
    projectilesOut.push(new JokerTeeth(originX, originY, velocidadeX, velocidadeY));
  }
  // Recebe a atualização atual e avança o estado, sem redesenhar a tela.
  update(passoTempo = 1, mundo = null) {
    super.update(passoTempo, mundo);
    this.wobble += 0.15 * passoTempo;
  }
  // Recebe o contexto 2D e desenha o estado atual sem avançar o tempo.
  draw(contexto) {
    this.drawSprite(contexto);
  }
}
