/**
 * ============================================================================
 * @file Batman.js
 * @category POO - Subclasse Concreta (Especialização do Jogador)
 * ============================================================================
 * CONCEITOS DE PROGRAMAÇÃO ORIENTADA A OBJETOS (POO):
 * 
 * 1. HERANÇA (Inheritance):
 *    Batman 'é-um' (is-a) Character, que por sua vez 'é-uma' Entity.
 *    Cadeia de herança: Entity -> Character -> Batman.
 *    Herda propriedades espaciais (x, y, w, h), físicas (vx, vy), e biológicas (hp).
 * 
 * 2. ENCAPSULAMENTO (Encapsulation):
 *    Mantém o estado exclusivo do herói: vidas restantes (lives), força de salto,
 *    recarga do batarang (shootCooldown), ponto de renascimento seguro (spawnPoint)
 *    e imunidade transitória.
 * 
 * 3. POLIMORFISMO (Polymorphism):
 *    - Sobrescreve takeDamage() para implementar o sistema de perda de vidas e renascimento.
 *    - Sobrescreve update() para gerenciar recarga de projéteis e temporizadores de medo.
 *    - Sobrescreve draw() para renderizar a armadura de Arkham, capa ondulante e máscara.
 * 
 * 4. INJEÇÃO DE DEPENDÊNCIA (Dependency Injection / Inversão de Controle):
 *    handleInput() recebe abstrações de entrada (input, mouse) e uma fábrica
 *    (createBatarang), desacoplando Batman da criação rígida de projéteis.
 * ============================================================================
 */

import { Character } from './Character.js';
import { Batarang } from './projectiles/Batarang.js';
import { GAME, PROJECTILE } from '../utils/constants.js';

export class Batman extends Character {
  /**
   * CONSTRUTOR:
   * Inicializa o Cavaleiro das Trevas configurando a caixa de colisão da armadura (42x72)
   * e os parâmetros específicos do jogador.
   *
   * @param {Object} options - Opções de inicialização
   * @param {number} options.x - Posição X de spawn
   * @param {number} options.y - Posição Y de spawn
   */
  constructor({ x = 100, y = 300 } = {}) {
    // [POO - Herança]: Superconstrutor repassa dimensões e HP por vida
    super({ x, y, w: 42, h: 72, maxHp: GAME.BATMAN_HP_PER_LIFE });
    this.spriteKey = 'batman';

    // [POO - Atributos de Estado do Jogador]
    this.lives = GAME.LIVES;              // Vidas globais (ícones de morcego no HUD)
    this.speed = 4.2;                     // Velocidade de deslocamento horizontal
    this.jumpForce = -13.5;               // Força de impulso vertical do salto
    this.jumpBufferTimer = 0;
    this.coyoteTimer = 0;
    this.shootCooldown = 0;               // Temporizador de recarga do batarang
    this.spawnPoint = { x, y };           // Ponto de reaparecimento seguro no estágio

    // [POO - Encapsulamento de Efeitos de Status / Debuff]
    this.intangibleTimer = 0;
    this.fearTimer = 0;                   // Temporizador de inversão de controles pelo gás do medo

    // [POO - Estados Internos de Animação Gráfica]
    this.animTime = 0;                    // Contador contínuo para respiração e capa
    this.throwAnimTimer = 0;              // Temporizador da pose de arremesso do batarang
  }

  /**
   * [POO - MÉTODO DE ALTERAÇÃO DE ESTADO / DEBUFF]
   * Aplica o efeito do gás do Espantalho, invertendo os comandos direcionais.
   *
   * @param {number} durationFrames - Duração em quadros de animação
   */
  applyFear(durationFrames = 180) {
    this.fearTimer = durationFrames;
  }

  /**
   * [POO - POLIMORFISMO: SOBRESCRITA DO MÉTODO takeDamage]
   * Diferente dos inimigos, o dano no Batman opera em 2 níveis:
   * 1. Consome pips de armadura (HP por vida).
   * 2. Quando HP chega a 0, consome uma Vida (loseLife) e aciona respawn.
   *
   * @param {number} amount - Quantidade de dano sofrido
   * @returns {boolean} True se o golpe atingiu o Batman
   */
  takeDamage(amount = 1) {
    if (this.intangible || this.invulnerable > 0 || this.lives <= 0) return false;

    this.hp -= amount;
    this.hurtFlash = 12;
    this.invulnerable = 60; // 60 frames (1 segundo) de imunidade pós-golpe

    if (this.hp <= 0) {
      this.loseLife();
    }
    return true;
  }

  /**
   * [POO - ENCAPSULAMENTO DE REGRAS DE VIDA]
   * Reduz o contador de vidas do Batman. Se ainda possuir vidas, renasce; senão, morre.
   */
  get intangible() { return this.deathTimer > 0 || this.intangibleTimer > 0; }

  loseLife() {
    if (this.deathTimer > 0 || this.lives <= 0) return;
    this.lives--;
    this.deathTimer = GAME.DEATH_ANIMATION_FRAMES;
    this.vx = 0; this.vy = 0;
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

  /**
   * [POO - ACOPLAMENTO FRACO E INJEÇÃO DE DEPENDÊNCIAS]
   * Processa a entrada do jogador de forma desacoplada dos periféricos de hardware.
   *
   * @param {Object} input - Instância da classe Input (Teclado)
   * @param {Object} mouse - Instância da classe Mouse (Cursor/Toque)
   * @param {Array} projectilesOut - Coleção receptora de projéteis
   * @param {Function} createBatarang - Função fábrica (Factory Callback)
   */
  handleInput(input, mouse, projectilesOut, createBatarang) {
    if (!this.alive || this.deathTimer > 0) return;
    if (this.inputResetVersion !== input.resetVersion) {
      this.inputResetVersion = input.resetVersion;
      this.jumpBufferTimer = this.coyoteTimer = 0;
    }

    // Etapa 1: Inversão de controles caso sob efeito do medo
    const inverted = this.fearTimer > 0;
    const moveLeftKey = inverted ? input.isDown('RIGHT') : input.isDown('LEFT');
    const moveRightKey = inverted ? input.isDown('LEFT') : input.isDown('RIGHT');

    // Etapa 2: Cinemática horizontal
    if (moveLeftKey && !moveRightKey) {
      this.vx = -this.speed;
      this.facing = -1;
    } else if (moveRightKey && !moveLeftKey) {
      this.vx = this.speed;
      this.facing = 1;
    } else {
      this.vx = 0; // Release stops movement in the next fixed update.
    }

    // Etapa 3: Pulo (Jump)
    this.coyoteTimer = this.onGround ? GAME.COYOTE_FRAMES : Math.max(0,this.coyoteTimer-1);
    this.jumpBufferTimer = input.justPressed('JUMP') ? GAME.JUMP_BUFFER_FRAMES : Math.max(0,this.jumpBufferTimer-1);
    if (this.jumpBufferTimer > 0 && this.coyoteTimer > 0) {
      this.jumpBufferTimer = 0;
      this.coyoteTimer = 0;
      this.vy = this.jumpForce;
      this.onGround = false;
    }

    // Etapa 4: Disparo do Batarang (Único ataque do Batman)
    const isMouseFiring = mouse.justClicked;
    const isKeyFiring = input.justPressed('SHOOT');
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
    // Rejected presses expire in this update; there is no queued shot.
    if (!this.alive || this.shootCooldown > 0 || Batarang.available(projectilesOut) === 0) return;
    this.shootCooldown = PROJECTILE.BATARANG_COOLDOWN;
    this.throwAnimTimer = 10;

    const originX = this.x + this.w / 2 + this.facing * 16;
    const originY = this.y + 26;

    let vx = this.facing * PROJECTILE.BATARANG_SPEED;
    let vy = 0;

    // Se o disparo foi feito via mouse/toque, calcula vetor em direção ao alvo
    if (mouse.hasMoved) {
      const dx = mouse.worldX - originX;
      const dy = mouse.worldY - originY;
      const dist = Math.hypot(dx, dy);

      if (dist > 15) {
        vx = (dx / dist) * PROJECTILE.BATARANG_SPEED;
        vy = (dy / dist) * PROJECTILE.BATARANG_SPEED;
        this.facing = vx >= 0 ? 1 : -1;
      }
    }

    // Instanciação polimórfica via fábrica injetada
    const batarang = createBatarang(originX, originY, vx, vy);
    projectilesOut.push(batarang);
  }

  /**
   * [POO - POLIMORFISMO: SOBRESCRITA DO MÉTODO update]
   * Executa a cinemática física da superclasse e atualiza temporizadores do Batman.
   *
   * @param {number} dt - Delta time
   * @param {Object} world - Contexto do cenário
   */
  update(dt = 1, world = null) {
    super.update(dt, world);
    if (this.deathTimer > 0) {
      this.deathTimer = Math.max(0, this.deathTimer - dt);
      if (this.deathTimer === 0) {
        if (this.lives > 0) { this.hp = GAME.BATMAN_HP_PER_LIFE; this.respawn(); }
        else { this.hp = 0; this.alive = false; }
      }
      return;
    }
    if (this.intangibleTimer > 0) this.intangibleTimer = Math.max(0, this.intangibleTimer - dt);

    this.animTime += dt * 0.15;
    if (this.shootCooldown > 0) this.shootCooldown -= dt;
    if (this.throwAnimTimer > 0) this.throwAnimTimer -= dt;
    if (this.fearTimer > 0) this.fearTimer -= dt;
  }

  /**
   * Procedural rendering of Batman with armored plates, glowing eyes, cape, belt.
   * @param {CanvasRenderingContext2D} ctx
   */
  draw(ctx) {
    this.drawSprite(ctx);
  }
}
