import { APARENCIA } from '../config/configuracao.js';
import { GameState } from '../models/GameState.js';
import { HUD } from './HUD.js';
import { LevelView } from './world/LevelView.js';
import { EntityRenderer } from './renderers/EntityRenderer.js';
import { drawCombat } from './renderers/CombatRenderer.js';
import { drawBossIntro } from './renderers/BossIntroRenderer.js';
import { drawLevelTransition } from './renderers/LevelTransitionRenderer.js';
const estiloVisual = APARENCIA.Game;

export class GameView {
  constructor(canvas, viewport) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.viewport = viewport;
    this.entities = new EntityRenderer();
  }
  setLevel(model) {
    this.level = new LevelView(model, this.entities);
  }
  render(model, screens, isMuted) {
    this.model = model;
    this.screens = screens;
    this.isMuted = isMuted;
    this._render();
  }
  get state() { return this.model.state; }
  get camera() { return this.model.camera; }
  get combat() { return this.model.combat; }
  get spawner() { return this.model.spawner; }
  get bossManager() { return this.model.bossManager; }
  get levelManager() { return this.model.levelManager; }
  get scoreManager() { return this.model.scoreManager; }
  get player() { return this.model.player; }
  get enemies() { return this.model.enemies; }
  get projectiles() { return this.model.projectiles; }
  get deathEffects() { return this.model.deathEffects; }
  get currentLevel() { return this.model.currentLevel; }
  get width() { return this.model.width; }
  get height() { return this.model.height; }
  _render() {
    const view = this.viewport.fit(this.canvas.width, this.canvas.height);
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.fillStyle = estiloVisual.preenchimento1;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.setTransform(view.scale, 0, 0, view.scale, view.x, view.y);
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.rect(0, 0, this.width, this.height);
    this.ctx.clip();
    switch (this.state) {
      case GameState.MENU:
        this._renderMenu();
        break;
      case GameState.PLAYING:
      case GameState.PAUSED:
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
    this.level.draw(this.ctx, this.camera);
    this.ctx.save();
    this.ctx.translate(-camX, -camY);
    for (const effect of this.deathEffects) this.entities.draw(this.ctx, effect.actor);
    for (const enemy of this.enemies) {
      if (enemy.alive) this.entities.draw(this.ctx, enemy);
    }
    if (this.bossManager.boss?.alive) {
      this.entities.draw(this.ctx, this.bossManager.boss);
    }
    this.entities.draw(this.ctx, this.player);
    for (const elemento of this.projectiles) {
      this.entities.draw(this.ctx, elemento);
    }
    drawCombat.call(this.combat, this.ctx, this.width, this.height);
    this.ctx.restore();
    drawBossIntro.call(this.bossManager, this.ctx, this.width, this.height);
    HUD.draw(this.ctx, this.player, this.levelManager.currentLevelConfig, this.spawner.killsInLevel, this.bossManager.boss, this.width, this.height, this.isMuted, this.player.batarangsRemaining, this.scoreManager);
  }
  _renderMenu() {
    this.screens.menu.view.draw(this.ctx, this.width, this.height, this.screens.menu.state);
  }
  _renderLevelTransition() {
    drawLevelTransition.call(this.levelManager, this.ctx, this.width, this.height);
  }
  _renderGameOver() {
    this.screens.end.view.draw(this.ctx, this.width, this.height, this.screens.end.state);
  }
  _renderVictory() {
    this.screens.end.view.draw(this.ctx, this.width, this.height, this.screens.end.state);
  }
}
