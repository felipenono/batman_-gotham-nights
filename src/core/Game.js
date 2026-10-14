import { Viewport } from './Viewport.js';
/**
 * ============================================================================
 * @file Game.js
 * @category POO - Padrão Fachada (Façade Pattern & Game Loop Orchestrator)
 * ============================================================================
 * CONCEITOS DE PROGRAMAÇÃO ORIENTADA A OBJETOS (POO):
 * 
 * 1. PADRÃO FAÇADE (Fachada):
 *    Game atua como a interface unificada de alto nível para toda a complexidade
 *    do motor de jogo. O ponto de entrada main.js apenas interage com a classe Game.
 * 
 * 2. COMPOSIÇÃO DE OBJETOS (Object Composition):
 *    Em vez de concentrar toda a lógica em uma classe gigante, Game compõe
 *    múltiplos subsistemas especializados e independentes:
 *    - Physics: cinemática e colisões com pisos.
 *    - CombatSystem: resolução de dano e partículas.
 *    - Spawner: controle de hordas e abates.
 *    - BossManager: ciclo de vida dos chefes.
 *    - LevelManager: carregamento de fases e transições.
 *    - AudioManager: trilha sonora orquestral e efeitos sonoros.
 *    - Camera: transformações espaciais 2D e screen shake.
 *    - Input & Mouse: captura e abstração de hardware.
 * 
 * 3. PADRÃO GAME LOOP COM TEMPO FIXO (Fixed Timestep):
 *    Garante física determinística e independente da taxa de atualização do monitor
 *    (60 updates por segundo calculados em delta acumulado).
 * ============================================================================
 */

import { GAME } from '../utils/constants.js';
import { GameState } from './GameState.js';
import { Input } from './Input.js';
import { Mouse } from './Mouse.js';
import { Camera } from './Camera.js';
import { Batman } from '../entities/Batman.js';
import { Batarang } from '../entities/projectiles/Batarang.js';
import { Physics } from '../systems/Physics.js';
import { CombatSystem } from '../systems/CombatSystem.js';
import { Spawner } from '../systems/Spawner.js';
import { BossManager } from '../systems/BossManager.js';
import { LevelManager } from '../systems/LevelManager.js';
import { AudioManager } from '../audio/AudioManager.js';
import { HUD } from '../systems/HUD.js';
import { ScreenUI } from '../systems/ScreenUI.js';
import { drawBatCrest } from '../utils/batSymbols.js';

export class Game {
  /**
   * CONSTRUTOR:
   * Instancia e compõe todos os subsistemas essenciais do jogo.
   *
   * @param {HTMLCanvasElement} canvas - Elemento canvas HTML montado no DOM
   */
  constructor(canvas) {
    this.canvas = canvas;
    canvas.width = GAME.RENDER_WIDTH;
    canvas.height = GAME.RENDER_HEIGHT;
    this.viewport = new Viewport();
    this.ctx = canvas.getContext('2d');
    this.width = GAME.WIDTH;
    this.height = GAME.HEIGHT;

    // [POO - Máquina de Estados]
    this.state = GameState.MENU;
    this.lastTime = 0;
    this.accumulatedTime = 0;
    this.fixedStep = 1000 / 60; // 60 updates por segundo

    // [POO - Composição]: Agregação de subsistemas especializados
    this.soundManager = new AudioManager();
    this.input = new Input();
    this.mouse = new Mouse(canvas);
    this.camera = new Camera(this.width, this.height);
    this.physics = new Physics(GAME.GRAVITY);
    this.combat = new CombatSystem({ camera: this.camera, soundManager: this.soundManager });
    this.spawner = new Spawner();
    this.bossManager = new BossManager();
    this.levelManager = new LevelManager();

    // [POO - Coleções de Modelos / Entidades Polimórficas]
    this.player = null;          // Instância de Batman (Character)
    this.enemies = [];           // Array de instâncias polimórficas de Character (Joker, Penguin)
    this.projectiles = [];       // Array de instâncias polimórficas de Projectile (Batarang, Teeth, etc.)
    this.deathEffects = [];
    this.screenUI = new ScreenUI(this, globalThis.document?.getElementById('screen-ui'));
    this.currentLevel = null;    // Instância de Level (Mundo e plataformas)

    // Menu and screen timers
    this.menuAnimTime = 0;
    this.gameOverCooldown = 0;

    // Bindings
    this._loop = this._loop.bind(this);
    this.restartGame = this.restartGame.bind(this);
  }

  playSound(type) {
    if (this.soundManager) {
      this.soundManager.playSfx(type);
    }
  }

  /**
   * Starts the initial game loop.
   */
  start() {
    this.lastTime = performance.now();
    this.soundManager.setTrack('menu');
    requestAnimationFrame(this._loop);
  }

  restartGame() {
    this.deathEffects = [];
    this.input._onBlur();this.mouse._onBlur();
    this.gameOverCooldown = 0;
    this.player = null;
    this.enemies = [];
    this.projectiles = [];
    this.spawner.totalKills = 0;
    this.levelManager.currentLevelIndex = 1;
    this.levelManager.transitionTimer = 0;
    this.bossManager.reset();
    this.initLevel(1);
    this.soundManager.setTrack('rooftops');
    this.state = GameState.PLAYING;
  }

  initLevel(levelIndex = 1) {
    this.currentLevel = this.levelManager.loadLevel(levelIndex);
    this.camera.setBounds(this.currentLevel.width, this.currentLevel.height);

    if (!this.player) {
      this.player = new Batman(this.currentLevel.spawnPoint);
    } else {
      this.player.spawnPoint = { ...this.currentLevel.spawnPoint };
      this.player.resetFull();
    }
    this.camera.follow(this.player);

    this.enemies = [];
    this.projectiles = [];
    this.bossManager.reset();
    this.spawner.initLevel(this.levelManager.currentLevelConfig);
  }

  _loop(timestamp) {
    const elapsed = timestamp - this.lastTime;
    this.lastTime = timestamp;
    this.accumulatedTime += Math.min(elapsed, 100);

    while (this.accumulatedTime >= this.fixedStep) {
      this._update(1);
      this.accumulatedTime -= this.fixedStep;
    }

    this._render();
    this.screenUI.update();
    requestAnimationFrame(this._loop);
  }

  _update(dt) {
    this.input.update();
    this.mouse.update(this.camera.renderX, this.camera.renderY);
    this.menuAnimTime += dt * 0.05;

    // Toggle audio mute with M key
    if (this.input.isKeyJustPressed('m') || this.input.isKeyJustPressed('M')) {
      this.soundManager.toggleMute();
    }

    switch (this.state) {
      case GameState.MENU:
        if (
          this.input.justPressed('START') ||
          this.input.isKeyJustPressed(' ') ||
          this.input.isKeyJustPressed('Enter') ||
          this.mouse.justClicked
        ) {
          this.restartGame();
        }
        break;

      case GameState.PLAYING:
        this._updatePlaying(dt);
        break;

      case GameState.LEVEL_TRANSITION:
        this.levelManager.updateTransition();
        break;

      case GameState.GAME_OVER:
      case GameState.VICTORY:
        if (this.gameOverCooldown > 0) { this.gameOverCooldown -= dt; break; }
        if (this.input.isKeyJustPressed('Escape')) {
          this.state = GameState.MENU; this.soundManager.setTrack('menu');
        } else if (this.input.justPressed('START')) this.restartGame();
        break;
    }
  }

  _updatePlaying(dt) {
    for (const effect of this.deathEffects) { effect.remaining -= dt; effect.actor.animator.update(effect.actor, dt); }
    this.deathEffects = this.deathEffects.filter(effect => effect.remaining > 0);
    // 1. Player input & movement
    this.player.handleInput(this.input, this.mouse, this.projectiles, (x, y, vx, vy) => {
      this.playSound('throw');
      return new Batarang(x, y, vx, vy);
    });

    // 2. Physics & collisions on player
    this.physics.update(
      this.player,
      this.currentLevel.platforms,
      this.currentLevel.width,
      this.currentLevel.height,
      dt
    );

    // 3. Update player timers (cooldowns, invulnerability, anims)
    this.player.update(dt, this.currentLevel);

    // Check player game over
    if (!this.player.alive) {
      this.state = GameState.GAME_OVER;
      this.gameOverCooldown = 20; // 20 frames delay to show game over screen before accepting restart
      this.soundManager.setTrack(null);
      this.playSound('gameover');
      return;
    }

    // 3. Spawner & wave progress
    const bossIsPresent = this.bossManager.boss && this.bossManager.boss.alive;
    this.spawner.update(this.enemies, this.currentLevel.width, this.currentLevel.height, bossIsPresent);

    // Trigger Boss when threshold is reached
    if (this.spawner.thresholdReached && !this.bossManager.bossSpawned) {
      this.bossManager.spawnBoss(
        this.levelManager.currentLevelConfig,
        this.currentLevel.width,
        this.currentLevel.height
      );
      this.soundManager.setTrack('boss');
      this.camera.shake(12, 20);
      this.playSound('boss_enter');
    }

    // 4. Update Boss AI and lifecycle
    if (this.bossManager.boss && this.bossManager.boss.alive) {
      const boss = this.bossManager.boss;
      boss.updateAI(
        this.player,
        this.projectiles,
        (fearDuration) => {
          this.player.applyFear(fearDuration);
          this.camera.shake(8, 16);
        },
        (sfxType) => this.playSound(sfxType)
      );
      boss.update(dt, this.currentLevel);
      this.physics.update(
        boss,
        this.currentLevel.platforms,
        this.currentLevel.width,
        this.currentLevel.height,
        dt
      );
    }

    // Check Boss Defeat
    this.bossManager.update((defeatedBoss) => {
      this.playSound('kill');
      this.camera.shake(14, 25);

      const nextAction = this.levelManager.triggerLevelComplete(() => {
        this.initLevel(this.levelManager.currentLevelIndex);
        this.soundManager.setTrack('rooftops');
        this.state = GameState.PLAYING;
      });

      if (nextAction === 'VICTORY') {
        this.state = GameState.VICTORY;
        this.soundManager.setTrack(null);
        this.playSound('victory');
      } else {
        this.state = GameState.LEVEL_TRANSITION;
      }
    }, () => {
      this.projectiles = [];
      this.enemies = [];
      this.camera.shake(8, 12);
      this.playSound('boss_enter');
    });

    // 5. Update Common Enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      if (!enemy.alive) {
        this.enemies.splice(i, 1);
        continue;
      }
      enemy.updateAI(this.player, this.projectiles, (sfxType) => this.playSound(sfxType));
      enemy.update(dt, this.currentLevel);
      this.physics.update(
        enemy,
        this.currentLevel.platforms,
        this.currentLevel.width,
        this.currentLevel.height,
        dt
      );
    }

    // 6. Update Projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.update(dt, this.currentLevel);
      if (!p.alive || p.x < -100 || p.x > this.currentLevel.width + 100 || p.y < -100 || p.y > this.height + 100) {
        this.projectiles.splice(i, 1);
      }
    }

    // 7. Combat collision resolution
    this.combat.update(
      this.player,
      this.enemies,
      this.bossManager.boss,
      this.projectiles,
      (deadFoe) => {
        this.deathEffects.push({actor:deadFoe,remaining:GAME.DEATH_ANIMATION_FRAMES});
        this.playSound('kill');
        if (!deadFoe.isBoss) {
          this.spawner.recordKill();
        }
      }
    );

    // 8. World & camera
    this.currentLevel.update(dt, this.camera);
    this.camera.update();
  }

  _render() {
    const view = this.viewport.fit(this.canvas.width, this.canvas.height);
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.fillStyle = '#03060c';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.setTransform(view.scale, 0, 0, view.scale, view.x, view.y);
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.save();
    this.ctx.beginPath();this.ctx.rect(0,0,this.width,this.height);this.ctx.clip();

    switch (this.state) {
      case GameState.MENU:
        this._renderMenu();
        break;

      case GameState.PLAYING:
        this._renderPlaying();
        break;

      case GameState.LEVEL_TRANSITION:
        this._renderLevelTransition();
        break;

      case GameState.GAME_OVER:
        this._renderGameOver();
        break;

      case GameState.VICTORY:
        this._renderVictory();
        break;
    }
    this.ctx.restore();
  }

  _renderPlaying() {
    const camX = this.camera.renderX;
    const camY = this.camera.renderY;

    // Draw parallax background
    this.currentLevel.draw(this.ctx, this.camera);

    // Apply Camera transform for world objects
    this.ctx.save();
    this.ctx.translate(-camX, -camY);

    for (const effect of this.deathEffects) effect.actor.draw(this.ctx);

    // Common enemies
    for (const enemy of this.enemies) {
      if (enemy.alive) enemy.draw(this.ctx);
    }

    // Boss
    if (this.bossManager.boss?.alive) {
      this.bossManager.boss.draw(this.ctx);
    }

    // Player
    this.player.draw(this.ctx);

    // Projectiles
    for (const p of this.projectiles) {
      p.draw(this.ctx);
    }

    // Particles and combat effects
    this.combat.draw(this.ctx, this.width, this.height);

    this.ctx.restore();

    // Screen-space UI
    this.bossManager.drawIntro(this.ctx, this.width, this.height);

    // Cuphead-style HUD
    HUD.draw(
      this.ctx,
      this.player,
      this.levelManager.currentLevelConfig,
      this.spawner.killsInLevel,
      this.bossManager.boss,
      this.width,
      this.height,
      this.soundManager ? this.soundManager.isMuted : false,
      Batarang.available(this.projectiles)
    );
  }

  _renderMenu() {
    const ctx = this.ctx;
    ctx.fillStyle = '#080d17'; ctx.fillRect(0, 0, this.width, this.height);
    drawBatCrest(ctx, this.width / 2, 160, 350);
  }

  _renderLevelTransition() { this.levelManager.drawTransition(this.ctx, this.width, this.height); }

  _renderGameOver() {
    this.ctx.fillStyle = '#120a10'; this.ctx.fillRect(0, 0, this.width, this.height);
    drawBatCrest(this.ctx, this.width / 2, 105, 160);
  }

  _renderVictory() {
    this.ctx.fillStyle = '#08151c'; this.ctx.fillRect(0, 0, this.width, this.height);
    drawBatCrest(this.ctx, this.width / 2, 105, 160);
  }
}
