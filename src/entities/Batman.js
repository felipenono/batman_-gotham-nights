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

    // [POO - Atributos de Estado do Jogador]
    this.lives = GAME.LIVES;              // Vidas globais (ícones de morcego no HUD)
    this.speed = 4.2;                     // Velocidade de deslocamento horizontal
    this.jumpForce = -13.5;               // Força de impulso vertical do salto
    this.shootCooldown = 0;               // Temporizador de recarga do batarang
    this.spawnPoint = { x, y };           // Ponto de reaparecimento seguro no estágio

    // [POO - Encapsulamento de Efeitos de Status / Debuff]
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
    if (this.invulnerable > 0 || this.lives <= 0) return false;

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
  loseLife() {
    this.lives--;
    if (this.lives > 0) {
      this.hp = GAME.BATMAN_HP_PER_LIFE;
      this.respawn();
    } else {
      this.hp = 0;
      this.alive = false;
    }
  }

  /**
   * [POO - MÉTODO DE REPOSICIONAMENTO ESPACIAL]
   * Teleporta o Batman com segurança de volta ao spawnPoint com janela de invulnerabilidade.
   */
  respawn() {
    this.alive = true;
    this.x = this.spawnPoint.x;
    this.y = this.spawnPoint.y;
    this.vx = 0;
    this.vy = 0;
    this.invulnerable = 60;
    this.hurtFlash = 15;
    if (this.hp <= 0) {
      this.hp = GAME.BATMAN_HP_PER_LIFE;
    }
  }

  /**
   * [POO - MÉTODO DE RESTAURAÇÃO COMPLETA]
   * Reinicia totalmente o estado interno do Batman para novos jogos (Restart).
   */
  resetFull() {
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
    if (!this.alive) return;

    // Etapa 1: Inversão de controles caso sob efeito do medo
    const inverted = this.fearTimer > 0;
    const moveLeftKey = inverted ? input.isDown('RIGHT') : input.isDown('LEFT');
    const moveRightKey = inverted ? input.isDown('LEFT') : input.isDown('RIGHT');

    // Etapa 2: Cinemática horizontal
    if (moveLeftKey) {
      this.vx = -this.speed;
      this.facing = -1;
    } else if (moveRightKey) {
      this.vx = this.speed;
      this.facing = 1;
    } else {
      this.vx *= 0.7; // Fricção de desaceleração suave
      if (Math.abs(this.vx) < 0.2) this.vx = 0;
    }

    // Etapa 3: Pulo (Jump)
    if (input.justPressed('JUMP') && this.onGround) {
      this.vy = this.jumpForce;
      this.onGround = false;
    }

    // Etapa 4: Disparo do Batarang (Único ataque do Batman)
    const isMouseFiring = mouse.isDown || mouse.justClicked;
    const isKeyFiring = input.isDown('SHOOT') || input.justPressed('SHOOT');
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
    this.shootCooldown = PROJECTILE.BATARANG_COOLDOWN;
    this.throwAnimTimer = 10;

    const originX = this.x + this.w / 2 + this.facing * 16;
    const originY = this.y + 26;

    let vx = this.facing * PROJECTILE.BATARANG_SPEED;
    let vy = 0;

    // Se o disparo foi feito via mouse/toque, calcula vetor em direção ao alvo
    if (isMouseFiring && mouse.hasMoved) {
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
    if (!this.alive) return;

    // Blink effect while invulnerable
    if (this.invulnerable > 0 && Math.floor(this.invulnerable / 4) % 2 === 0) {
      return;
    }

    ctx.save();
    ctx.translate(this.x + this.w / 2, this.y + this.h);
    ctx.scale(this.facing, 1);

    const isRunning = Math.abs(this.vx) > 0.5 && this.onGround;
    const isJumping = !this.onGround;
    const isThrowing = this.throwAnimTimer > 0;
    const breathe = Math.sin(this.animTime * 2) * 1.5;

    // --- CAPE (Drawn behind body) ---
    ctx.save();
    ctx.fillStyle = '#11161d';
    ctx.beginPath();
    const capeShoulderX = -10;
    const capeShoulderY = -54 + breathe;
    ctx.moveTo(capeShoulderX, capeShoulderY);

    if (isJumping) {
      // Wide gliding bat-wing cape
      const wingFlare = Math.sin(this.animTime * 4) * 6;
      ctx.quadraticCurveTo(-45 - wingFlare, -30, -55, 4);
      ctx.lineTo(-40, 0);
      ctx.lineTo(-28, 6);
      ctx.lineTo(-15, 2);
      ctx.lineTo(8, -50 + breathe);
    } else {
      // Flowing dynamic trailing cape
      const wave = Math.sin(this.animTime * 4 - this.vx * 0.4) * 6;
      const trail = -this.vx * 3.5;
      ctx.quadraticCurveTo(-26 + trail, -25 + breathe, -32 + trail + wave, 2);
      ctx.lineTo(-24 + trail * 0.8, -2);
      ctx.lineTo(-14 + trail * 0.5, 3);
      ctx.lineTo(-2, -2);
      ctx.lineTo(8, -52 + breathe);
    }
    ctx.closePath();
    ctx.fill();

    // Cape inner shading
    ctx.strokeStyle = '#1d2430';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    // --- LEGS & BOOTS ---
    const legOffset = isRunning ? Math.sin(this.animTime * 6) * 10 : 0;

    // Left (back) Leg
    ctx.fillStyle = '#21262d';
    ctx.fillRect(-14 - legOffset * 0.5, -24, 9, 14);
    // Left Boot (black armored)
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(-15 - legOffset * 0.6, -10, 10, 10);
    // Boot sole
    ctx.fillStyle = '#161b22';
    ctx.fillRect(-16 - legOffset * 0.6, -2, 12, 3);

    // Right (front) Leg
    ctx.fillStyle = '#2d333b';
    ctx.fillRect(4 + legOffset * 0.5, -24, 9, 14);
    // Right Boot
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(4 + legOffset * 0.6, -10, 11, 10);
    // Boot sole
    ctx.fillStyle = '#161b22';
    ctx.fillRect(3 + legOffset * 0.6, -2, 13, 3);

    // --- TORSO & CHEST ARMOR ---
    const torsoY = -52 + breathe;

    // Under-suit dark base
    ctx.fillStyle = '#1f242c';
    ctx.beginPath();
    ctx.roundRect(-16, torsoY + 12, 32, 22, 3);
    ctx.fill();

    // Armored chest plates (lighter metallic graphite)
    const chestGrad = ctx.createLinearGradient(-15, torsoY, 15, torsoY + 22);
    chestGrad.addColorStop(0, '#4b5563');
    chestGrad.addColorStop(1, '#374151');
    ctx.fillStyle = chestGrad;

    // Pectoral armor plates
    ctx.beginPath();
    ctx.moveTo(-15, torsoY + 8);
    ctx.lineTo(0, torsoY + 11);
    ctx.lineTo(15, torsoY + 8);
    ctx.lineTo(14, torsoY + 20);
    ctx.lineTo(0, torsoY + 22);
    ctx.lineTo(-14, torsoY + 20);
    ctx.closePath();
    ctx.fill();

    // Armor seam lines
    ctx.strokeStyle = '#1e232a';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(0, torsoY + 8);
    ctx.lineTo(0, torsoY + 22);
    ctx.stroke();

    // BAT-SYMBOL (Chest emblem)
    ctx.fillStyle = '#0d1117';
    ctx.beginPath();
    const symY = torsoY + 13;
    ctx.moveTo(0, symY + 4); // center bottom point
    ctx.lineTo(5, symY + 1);
    ctx.lineTo(9, symY - 3);
    ctx.lineTo(5, symY - 1);
    ctx.lineTo(2, symY - 4); // right ear
    ctx.lineTo(1, symY - 2);
    ctx.lineTo(-1, symY - 2);
    ctx.lineTo(-2, symY - 4); // left ear
    ctx.lineTo(-5, symY - 1);
    ctx.lineTo(-9, symY - 3);
    ctx.lineTo(-5, symY + 1);
    ctx.closePath();
    ctx.fill();

    // --- UTILITY BELT ---
    const beltY = torsoY + 22;
    ctx.fillStyle = '#d97706'; // Golden amber
    ctx.fillRect(-15, beltY, 30, 6);

    // Belt buckle
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(-4, beltY - 1, 8, 8);
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-2, beltY + 1, 4, 4);

    // Utility pouches
    ctx.fillStyle = '#b45309';
    ctx.fillRect(-14, beltY + 1, 4, 5);
    ctx.fillRect(-9, beltY + 1, 4, 5);
    ctx.fillRect(5, beltY + 1, 4, 5);
    ctx.fillRect(10, beltY + 1, 4, 5);

    // --- ARMS & GAUNTLETS WITH THREE FINS ---
    // Back Arm
    ctx.fillStyle = '#1f242c';
    ctx.fillRect(-18, torsoY + 8, 6, 16);
    // Back gauntlet
    ctx.fillStyle = '#111827';
    ctx.fillRect(-20, torsoY + 18, 7, 10);
    // Back fins
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(-20, torsoY + 19); ctx.lineTo(-24, torsoY + 21); ctx.lineTo(-20, torsoY + 22);
    ctx.moveTo(-20, torsoY + 22); ctx.lineTo(-24, torsoY + 24); ctx.lineTo(-20, torsoY + 25);
    ctx.moveTo(-20, torsoY + 25); ctx.lineTo(-24, torsoY + 27); ctx.lineTo(-20, torsoY + 28);
    ctx.fill();

    // Front Arm (Throwing or idle)
    ctx.fillStyle = '#374151';
    if (isThrowing) {
      // Extended throwing arm
      ctx.fillRect(8, torsoY + 8, 18, 6);
      ctx.fillStyle = '#111827';
      ctx.fillRect(20, torsoY + 7, 10, 8); // gauntlet
      // 3 Gauntlet fins
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(22, torsoY + 15); ctx.lineTo(20, torsoY + 19); ctx.lineTo(24, torsoY + 15);
      ctx.moveTo(25, torsoY + 15); ctx.lineTo(23, torsoY + 19); ctx.lineTo(27, torsoY + 15);
      ctx.moveTo(28, torsoY + 15); ctx.lineTo(26, torsoY + 19); ctx.lineTo(30, torsoY + 15);
      ctx.fill();
    } else {
      // Resting/combat stance arm
      ctx.fillRect(11, torsoY + 8, 7, 16);
      ctx.fillStyle = '#111827';
      ctx.fillRect(11, torsoY + 18, 8, 10);
      // 3 Gauntlet fins protruding behind forearm
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(11, torsoY + 19); ctx.lineTo(7, torsoY + 21); ctx.lineTo(11, torsoY + 22);
      ctx.moveTo(11, torsoY + 22); ctx.lineTo(7, torsoY + 24); ctx.lineTo(11, torsoY + 25);
      ctx.moveTo(11, torsoY + 25); ctx.lineTo(7, torsoY + 27); ctx.lineTo(11, torsoY + 28);
      ctx.fill();
    }

    // --- COWL & HEAD ---
    const headY = torsoY - 14;

    // Neck
    ctx.fillStyle = '#111827';
    ctx.fillRect(-6, headY + 10, 12, 6);

    // Cowl dome
    ctx.fillStyle = '#111827';
    ctx.beginPath();
    ctx.arc(0, headY + 4, 11, Math.PI, 0, false);
    ctx.lineTo(11, headY + 11);
    ctx.lineTo(-11, headY + 11);
    ctx.closePath();
    ctx.fill();

    // Short triangular bat-ears matching reference
    ctx.beginPath();
    // Left ear
    ctx.moveTo(-10, headY + 2);
    ctx.lineTo(-12, headY - 10);
    ctx.lineTo(-6, headY - 1);
    // Right ear
    ctx.moveTo(6, headY - 1);
    ctx.lineTo(12, headY - 10);
    ctx.lineTo(10, headY + 2);
    ctx.closePath();
    ctx.fill();

    // Jaw / mouth opening (stubborn determined chin)
    ctx.fillStyle = '#f5d0b0';
    ctx.beginPath();
    ctx.moveTo(-5, headY + 7);
    ctx.lineTo(5, headY + 7);
    ctx.lineTo(4, headY + 12);
    ctx.lineTo(-4, headY + 12);
    ctx.closePath();
    ctx.fill();

    // Mouth line
    ctx.strokeStyle = '#92400e';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-2, headY + 10);
    ctx.lineTo(3, headY + 10);
    ctx.stroke();

    // White glowing almond-shaped cowl eyes
    ctx.fillStyle = '#f8fafc';
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 6;

    // Left eye slit
    ctx.beginPath();
    ctx.moveTo(-7, headY + 3);
    ctx.lineTo(-2, headY + 4);
    ctx.lineTo(-6, headY + 6);
    ctx.closePath();
    ctx.fill();

    // Right eye slit
    ctx.beginPath();
    ctx.moveTo(2, headY + 4);
    ctx.lineTo(7, headY + 3);
    ctx.lineTo(6, headY + 6);
    ctx.closePath();
    ctx.fill();

    ctx.shadowBlur = 0;

    // Hurt flash white overlay
    if (this.hurtFlash > 0) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.beginPath();
      ctx.roundRect(-20, -74, 40, 74, 6);
      ctx.fill();
    }

    // Fear aura greenish toxic indicator
    if (this.fearTimer > 0) {
      ctx.strokeStyle = 'rgba(74, 222, 128, 0.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, -36, 32 + Math.sin(this.animTime * 10) * 3, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }
}
