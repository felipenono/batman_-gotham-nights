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

import { GAME, KEYS } from '../utils/constants.js';
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

export class Game {
  /**
   * CONSTRUTOR:
   * Instancia e compõe todos os subsistemas essenciais do jogo.
   *
   * @param {HTMLCanvasElement} canvas - Elemento canvas HTML montado no DOM
   */
  constructor(canvas) {
    this.canvas = canvas;
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
        if (this.gameOverCooldown > 0) {
          this.gameOverCooldown -= dt;
          break;
        }
        if (
          this.input.anyKeyPressed ||
          this.mouse.justClicked ||
          this.mouse.isDown ||
          this.input.isKeyJustPressed('Enter') ||
          this.input.justPressed('START') ||
          this.input.isKeyJustPressed(' ') ||
          this.input.isKeyJustPressed('r') ||
          this.input.isKeyJustPressed('R') ||
          this.input.isKeyJustPressed('x') ||
          this.input.isKeyJustPressed('X') ||
          this.input.isKeyJustPressed('z') ||
          this.input.isKeyJustPressed('Z')
        ) {
          this.restartGame();
        }
        break;
    }
  }

  _updatePlaying(dt) {
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
    this.ctx.clearRect(0, 0, this.width, this.height);

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
  }

  _renderPlaying() {
    const camX = this.camera.renderX;
    const camY = this.camera.renderY;

    // Draw parallax background
    this.currentLevel.draw(this.ctx, this.camera);

    // Apply Camera transform for world objects
    this.ctx.save();
    this.ctx.translate(-camX, -camY);

    // Common enemies
    for (const enemy of this.enemies) {
      enemy.draw(this.ctx);
    }

    // Boss
    if (this.bossManager.boss) {
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
      this.soundManager ? this.soundManager.isMuted : false
    );
  }

  _renderMenu() {
    // Gothic animated title screen
    const grad = this.ctx.createLinearGradient(0, 0, 0, this.height);
    grad.addColorStop(0, '#020617');
    grad.addColorStop(0.5, '#0f172a');
    grad.addColorStop(1, '#1e1b4b');
    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Giant Bat-Symbol in center background
    this.ctx.save();
    this.ctx.translate(this.width / 2, this.height / 2 - 30);
    this.ctx.scale(8, 8);
    this.ctx.fillStyle = '#0f172a';
    this.ctx.shadowColor = '#facc15';
    this.ctx.shadowBlur = 25;
    this.ctx.beginPath();
    this.ctx.moveTo(0, 5);
    this.ctx.lineTo(8, 2);
    this.ctx.lineTo(14, -6);
    this.ctx.lineTo(6, -2);
    this.ctx.lineTo(2, -7);
    this.ctx.lineTo(0, -4);
    this.ctx.lineTo(-2, -7);
    this.ctx.lineTo(-6, -2);
    this.ctx.lineTo(-14, -6);
    this.ctx.lineTo(-8, 2);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.restore();

    // Vintage Cuphead Gotham Nights title typography
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    this.ctx.font = '900 44px "Arial Black", Impact, sans-serif';
    this.ctx.fillStyle = '#fef08a';
    this.ctx.shadowColor = '#ca8a04';
    this.ctx.shadowBlur = 16;
    this.ctx.fillText('BATMAN: GOTHAM NIGHTS', this.width / 2, this.height / 2 - 40);

    this.ctx.shadowBlur = 0;
    this.ctx.font = '700 18px "Courier New", monospace';
    this.ctx.fillStyle = '#94a3b8';
    this.ctx.letterSpacing = '3px';
    this.ctx.fillText('A CUPHEAD-STYLE 2D BOSS-RUSH PLATFORMER', this.width / 2, this.height / 2 + 10);

    // Press SPACE to start (pulsing)
    const pulse = Math.sin(this.menuAnimTime * 4) * 0.5 + 0.5;
    this.ctx.font = '900 20px "Arial Black", sans-serif';
    this.ctx.fillStyle = pulse > 0.4 ? '#fbbf24' : '#e2e8f0';
    this.ctx.shadowColor = '#f59e0b';
    this.ctx.shadowBlur = pulse * 10;
    this.ctx.fillText('PRESS SPACE TO START', this.width / 2, this.height / 2 + 80);

    // Controls hints footer
    this.ctx.shadowBlur = 0;
    this.ctx.font = '600 14px sans-serif';
    this.ctx.fillStyle = '#64748b';
    this.ctx.fillText('A / D or ARROWS: Move   •   W / SPACE: Jump   •   MOUSE CLICK / X: Batarang (Hold for Rapid Fire)', this.width / 2, this.height - 35);
  }

  _renderLevelTransition() {
    this.levelManager.drawTransition(this.ctx, this.width, this.height);
  }

  _renderGameOver() {
    // Red dark vignette
    this.ctx.fillStyle = '#090306';
    this.ctx.fillRect(0, 0, this.width, this.height);

    const radGrad = this.ctx.createRadialGradient(
      this.width / 2,
      this.height / 2,
      80,
      this.width / 2,
      this.height / 2,
      360
    );
    radGrad.addColorStop(0, 'rgba(153, 27, 27, 0.45)');
    radGrad.addColorStop(1, 'rgba(0, 0, 0, 0.95)');
    this.ctx.fillStyle = radGrad;
    this.ctx.fillRect(0, 0, this.width, this.height);

    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    // Large GAME OVER in white with red glow
    this.ctx.font = '900 60px "Arial Black", Impact, sans-serif';
    this.ctx.fillStyle = '#ffffff';
    this.ctx.shadowColor = '#ef4444';
    this.ctx.shadowBlur = 24;
    this.ctx.fillText('GAME OVER', this.width / 2, this.height / 2 - 50);

    this.ctx.shadowBlur = 0;
    this.ctx.font = '700 20px "Courier New", monospace';
    this.ctx.fillStyle = '#f87171';
    this.ctx.fillText(`TOTAL KILLS: ${this.spawner.totalKills}`, this.width / 2, this.height / 2 + 10);

    // Interactive arcade restart button box
    const btnW = 380;
    const btnH = 50;
    const btnX = this.width / 2 - btnW / 2;
    const btnY = this.height / 2 + 55;

    const pulse = Math.sin(this.menuAnimTime * 5) * 0.5 + 0.5;
    this.ctx.fillStyle = '#1e1b4b';
    this.ctx.strokeStyle = pulse > 0.4 ? '#facc15' : '#eab308';
    this.ctx.lineWidth = 2.5;
    this.ctx.shadowColor = '#f59e0b';
    this.ctx.shadowBlur = pulse * 14;

    this.ctx.beginPath();
    this.ctx.roundRect(btnX, btnY, btnW, btnH, 8);
    this.ctx.fill();
    this.ctx.stroke();

    this.ctx.font = '900 17px "Arial Black", sans-serif';
    this.ctx.fillStyle = pulse > 0.4 ? '#fef08a' : '#ffffff';
    this.ctx.shadowBlur = 0;
    this.ctx.fillText('CLICK OR PRESS ANY KEY TO RESTART', this.width / 2, btnY + btnH / 2);
  }

  _renderVictory() {
    // Bat-Signal glowing in triumph
    this.ctx.fillStyle = '#020617';
    this.ctx.fillRect(0, 0, this.width, this.height);

    const skyGrad = this.ctx.createRadialGradient(
      this.width / 2,
      this.height / 2 - 30,
      30,
      this.width / 2,
      this.height / 2 - 30,
      300
    );
    skyGrad.addColorStop(0, 'rgba(254, 240, 138, 0.55)');
    skyGrad.addColorStop(0.5, 'rgba(234, 179, 8, 0.15)');
    skyGrad.addColorStop(1, 'rgba(2, 6, 23, 0)');
    this.ctx.fillStyle = skyGrad;
    this.ctx.fillRect(0, 0, this.width, this.height);

    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    this.ctx.font = '900 56px "Arial Black", Impact, sans-serif';
    this.ctx.fillStyle = '#fef08a';
    this.ctx.shadowColor = '#ca8a04';
    this.ctx.shadowBlur = 25;
    this.ctx.fillText('GOTHAM IS SAFE', this.width / 2, this.height / 2 - 50);

    this.ctx.shadowBlur = 0;
    this.ctx.font = '700 20px "Trebuchet MS", sans-serif';
    this.ctx.fillStyle = '#cbd5e1';
    this.ctx.fillText(
      `All Rogues Apprehended • Total Villains Defeated: ${this.spawner.totalKills}`,
      this.width / 2,
      this.height / 2 + 15
    );

    this.ctx.font = '900 18px "Arial Black", sans-serif';
    this.ctx.fillStyle = '#facc15';
    this.ctx.fillText('PRESS ENTER, SPACE OR CLICK TO PLAY AGAIN', this.width / 2, this.height / 2 + 75);
  }
}
