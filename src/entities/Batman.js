// Este arquivo cuida de controlar movimento, saltos, ataques e vidas do jogador.
// ===== DEPENDÊNCIAS E CONFIGURAÇÕES =====
import { Character } from "./Character.js";
import { Batarang } from "./projectiles/Batarang.js";
import { GAME, PROJECTILE } from "../config/configuracao.js";
// ===== COMPORTAMENTO =====
export class Batman extends Character {
  // Recebe as dependências e prepara o estado inicial deste componente.
  constructor({ x: posicaoX = 100, y: posicaoY = 300 } = {}) {
    // [POO - Herança]: Superconstrutor repassa dimensões e HP por vida
    super({
      x: posicaoX,
      y: posicaoY,
      w: 42,
      h: 72,
      maxHp: GAME.BATMAN_HP_PER_LIFE
    });
    this.spriteKey = "batman";
    this.lives = GAME.LIVES;
    this.speed = 4.2;
    this.jumpForce = -13.5;
    this.jumpBufferTimer = 0;
    this.coyoteTimer = 0;
    this.shootCooldown = 0;
    this.spawnPoint = {
      x: posicaoX,
      y: posicaoY
    };
    this.intangibleTimer = 0;
    this.fearTimer = 0;
    // [POO - Estados Internos de Animação Gráfica]
    this.animTime = 0;
    this.throwAnimTimer = 0;
  }
  applyFear(durationFrames = 180) {
    this.fearTimer = durationFrames;
  }
  // Recebe o dano e informa se ele foi aplicado neste momento.
  takeDamage(amount = 1) {
    if (this.intangible || this.invulnerable > 0 || this.lives <= 0) return false;
    this.hp -= amount;
    this.hurtFlash = 12;
    this.invulnerable = 60;
    if (this.hp <= 0) {
      this.loseLife();
    }
    return true;
  }
  /**
  * [POO - ENCAPSULAMENTO DE REGRAS DE VIDA]
  * Reduz o contador de vidas do Batman. Se ainda possuir vidas, renasce; senão, morre.
  */
  get intangible() {
    return this.deathTimer > 0 || this.intangibleTimer > 0;
  }
  loseLife() {
    if (this.deathTimer > 0 || this.lives <= 0) return;
    this.lives--;
    this.deathTimer = GAME.DEATH_ANIMATION_FRAMES;
    this.vx = 0;
    this.vy = 0;
    this.invulnerable = GAME.RESPAWN_INTANGIBLE_FRAMES;
  }
  /**
  * [POO - MÉTODO DE REPOSICIONAMENTO ESPACIAL]
  * Teleporta o Batman com segurança de volta ao spawnPoint com janela de invulnerabilidade.
  */
  respawn() {
    this.alive = true;
    this.onGround = false;
    this.jumpBufferTimer = this.coyoteTimer = 0;
    this.x = this.spawnPoint.x;
    this.y = this.spawnPoint.y;
    this.vx = 0;
    this.vy = 0;
    this.intangibleTimer = GAME.RESPAWN_INTANGIBLE_FRAMES;
    this.invulnerable = GAME.RESPAWN_INTANGIBLE_FRAMES;
    this.hurtFlash = 0;
    if (this.hp <= 0) {
      this.hp = GAME.BATMAN_HP_PER_LIFE;
    }
  }
  /**
  * [POO - MÉTODO DE RESTAURAÇÃO COMPLETA]
  * Reinicia totalmente o estado interno do Batman para novos jogos (Restart).
  */
  resetFull() {
    this.onGround = false;
    this.jumpBufferTimer = this.coyoteTimer = 0;
    this.deathTimer = 0;
    this.intangibleTimer = 0;
    this.alive = true;
    this.lives = GAME.LIVES;
    this.hp = GAME.BATMAN_HP_PER_LIFE;
    this.x = this.spawnPoint.x;
    this.y = this.spawnPoint.y;
    this.vx = 0;
    this.vy = 0;
    this.invulnerable = 60;
    this.hurtFlash = 0;
    this.fearTimer = 0;
    this.shootCooldown = 0;
  }
  handleInput(input, mouse, projectilesOut, createBatarang) {
    if (!this.alive || this.deathTimer > 0) return;
    if (this.inputResetVersion !== input.resetVersion) {
      this.inputResetVersion = input.resetVersion;
      this.jumpBufferTimer = this.coyoteTimer = 0;
    }
    // Etapa 1: Inversão de controles caso sob efeito do medo
    const inverted = this.fearTimer > 0;
    const moveLeftKey = inverted ? input.isDown("RIGHT") : input.isDown("LEFT");
    const moveRightKey = inverted ? input.isDown("LEFT") : input.isDown("RIGHT");
    // Etapa 2: Cinemática horizontal
    if (moveLeftKey && !moveRightKey) {
      this.vx = -this.speed;
      this.facing = -1;
    } else if (moveRightKey && !moveLeftKey) {
      this.vx = this.speed;
      this.facing = 1;
    } else {
      this.vx = 0;
    }
    this.coyoteTimer = this.onGround ? GAME.COYOTE_FRAMES : Math.max(0, this.coyoteTimer - 1);
    this.jumpBufferTimer = input.justPressed("JUMP") ? GAME.JUMP_BUFFER_FRAMES : Math.max(0, this.jumpBufferTimer - 1);
    if (this.jumpBufferTimer > 0 && this.coyoteTimer > 0) {
      this.jumpBufferTimer = 0;
      this.coyoteTimer = 0;
      this.vy = this.jumpForce;
      this.onGround = false;
    }
    // Etapa 4: Disparo do Batarang (Único ataque do Batman)
    const isMouseFiring = mouse.justClicked;
    const isKeyFiring = input.justPressed("SHOOT");
    const wantsToShoot = isMouseFiring || isKeyFiring;
    if (wantsToShoot && this.shootCooldown <= 0) {
      this.throwBatarang(mouse, isMouseFiring, projectilesOut, createBatarang);
    }
  }
  /**
  * [POO - DELEGAÇÃO E FÁBRICA DE PROJÉTEIS]
  * Calcula o vetor balístico e instancia um novo Batarang.
  */
  throwBatarang(mouse, isMouseFiring, projectilesOut, createBatarang) {
    if (!this.alive || this.shootCooldown > 0 || Batarang.available(projectilesOut) === 0) return;
    this.shootCooldown = PROJECTILE.BATARANG_COOLDOWN;
    this.throwAnimTimer = 10;
    const originX = this.x + this.w / 2 + this.facing * 16;
    const originY = this.y + 26;
    let velocidadeX = this.facing * PROJECTILE.BATARANG_SPEED;
    let velocidadeY = 0;
    // Se o disparo foi feito via mouse/toque, calcula vetor em direção ao alvo
    if (mouse.hasMoved) {
      const dx = mouse.worldX - originX;
      const dy = mouse.worldY - originY;
      const dist = Math.hypot(dx, dy);
      if (dist > 15) {
        velocidadeX = dx / dist * PROJECTILE.BATARANG_SPEED;
        velocidadeY = dy / dist * PROJECTILE.BATARANG_SPEED;
        this.facing = velocidadeX >= 0 ? 1 : -1;
      }
    }
    // Instanciação polimórfica via fábrica injetada
    const batarang = createBatarang(originX, originY, velocidadeX, velocidadeY);
    projectilesOut.push(batarang);
  }
  // Recebe a atualização atual e avança o estado, sem redesenhar a tela.
  update(passoTempo = 1, mundo = null) {
    super.update(passoTempo, mundo);
    if (this.deathTimer > 0) {
      this.deathTimer = Math.max(0, this.deathTimer - passoTempo);
      if (this.deathTimer === 0) {
        if (this.lives > 0) {
          this.hp = GAME.BATMAN_HP_PER_LIFE;
          this.respawn();
        } else {
          this.hp = 0;
          this.alive = false;
        }
      }
      return;
    }
    if (this.intangibleTimer > 0) this.intangibleTimer = Math.max(0, this.intangibleTimer - passoTempo);
    this.animTime += passoTempo * 0.15;
    if (this.shootCooldown > 0) this.shootCooldown -= passoTempo;
    if (this.throwAnimTimer > 0) this.throwAnimTimer -= passoTempo;
    if (this.fearTimer > 0) this.fearTimer -= passoTempo;
  }
  // Recebe o contexto 2D e desenha o estado atual sem avançar o tempo.
  draw(contexto) {
    this.drawSprite(contexto);
  }
}
