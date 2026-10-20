// Este arquivo cuida de coordenar a partida e seus sistemas.
import { APARENCIA } from "../config/configuracao.js";

// ===== DEPENDÊNCIAS E CONFIGURAÇÕES =====
import { SceneManager } from "./SceneManager.js";
import { Viewport } from "./Viewport.js";
import { GAME } from "../config/configuracao.js";
import { GameState } from "./GameState.js";
import { Input } from "./Input.js";
import { Mouse } from "./Mouse.js";
import { Camera } from "./Camera.js";
import { Batman } from "../entities/Batman.js";
import { Batarang } from "../entities/projectiles/Batarang.js";
import { Physics } from "../systems/Physics.js";
import { CombatSystem } from "../systems/CombatSystem.js";
import { Spawner } from "../systems/Spawner.js";
import { BossManager } from "../systems/BossManager.js";
import { LevelManager } from "../systems/LevelManager.js";
import { AudioManager } from "../audio/AudioManager.js";
import { HUD } from "../systems/HUD.js";
import { ScreenUI } from "../systems/ScreenUI.js";
import { LOBBY } from "../config/configuracao.js";
import { normalizeResultData } from "../utils/resultData.js";
import { ScoreManager } from "../systems/ScoreManager.js";
const estiloVisual = APARENCIA.Game;
// ===== COMPORTAMENTO =====
export class Game {
  // Recebe as dependências e prepara o estado inicial deste componente.
  constructor(canvas) {
    this.executando = false;
    this.encerrado = false;
    this.quadroAgendado = null;
    this.canvas = canvas;
    canvas.width = GAME.RENDER_WIDTH;
    canvas.height = GAME.RENDER_HEIGHT;
    this.viewport = new Viewport();
    this.ctx = canvas.getContext("2d");
    this.width = GAME.WIDTH;
    this.height = GAME.HEIGHT;
    // [POO - Máquina de Estados]
    this.state = GameState.MENU;
    this.lastTime = 0;
    this.accumulatedTime = 0;
    this.fixedStep = 1000 / 60;
    // [POO - Composição]: Agregação de subsistemas especializados
    this.soundManager = new AudioManager();
    this.input = new Input();
    this.mouse = new Mouse(canvas);
    this.camera = new Camera(this.width, this.height);
    this.physics = new Physics(GAME.GRAVITY);
    this.combat = new CombatSystem({
      camera: this.camera,
      soundManager: this.soundManager
    });
    this.spawner = new Spawner();
    this.bossManager = new BossManager();
    this.levelManager = new LevelManager();
    this.scoreManager = new ScoreManager();
    // [POO - Coleções de Modelos / Entidades Polimórficas]
    this.player = null;
    this.enemies = [];
    this.projectiles = [];
    this.deathEffects = [];
    this.screenUI = new ScreenUI(this, globalThis.document?.getElementById("screen-ui"));
    this.sceneManager = new SceneManager(this);
    this.currentLevel = null;
    this.menuAnimTime = 0;
    this.gameOverCooldown = 0;
    this._loop = this._loop.bind(this);
    this.restartGame = this.restartGame.bind(this);
  }
  playSound(tipo) {
    if (this.soundManager) {
      this.soundManager.playSfx(tipo);
    }
  }
  start() {
    if (this.executando || this.encerrado) return;
    this.executando = true;
    this.lastTime = performance.now();
    this.screenUI.update();
    this.quadroAgendado = requestAnimationFrame(this._loop);
  }
  restartGame(levelIndex = 1) {
    // Derrota pode retomar a fase atual; uma nova campanha continua começando na fase 1.
    levelIndex = Number.isInteger(levelIndex) ? Math.max(1, Math.min(this.levelManager.totalLevels, levelIndex)) : 1;
    this.deathEffects = [];
    this.input._onBlur();
    this.mouse._onBlur();
    this.gameOverCooldown = 0;
    this.player = null;
    this.enemies = [];
    this.projectiles = [];
    this.spawner.totalKills = 0;
    this.levelManager.currentLevelIndex = levelIndex;
    this.levelManager.transitionTimer = 0;
    this.bossManager.reset();
    this.scoreManager.reiniciar();
    this.initLevel(levelIndex);
    this.soundManager.setTrack("rooftops");
    this.state = GameState.PLAYING;
  }
  showEndScreen(result, dados = {}) {
    if (!LOBBY.endScreens.screens[result]) throw new Error(`Resultado desconhecido: ${result}`);
    if (this.sceneManager.transition) return false;
    const score = result === "victory" ? this.scoreManager.finalizarFase() : this.scoreManager.finalizarDerrota();
    const payload = normalizeResultData({
      ...score,
      levelIndex: this.levelManager.currentLevelIndex,
      ...dados
    });
    return this.sceneManager.goTo("EndGameScene", {
      result,
      data: payload
    });
  }
  togglePause() {
    if (this.sceneManager.transition || ![GameState.PLAYING, GameState.PAUSED].includes(this.state)) return;
    const paused = this.state === GameState.PLAYING;
    this.state = paused ? GameState.PAUSED : GameState.PLAYING;
    this.scoreManager.pausar(paused);
    this.input._onBlur();
    this.mouse._onBlur();
    this.screenUI.update();
  }
  initLevel(levelIndex = 1) {
    this.currentLevel = this.levelManager.loadLevel(levelIndex);
    this.scoreManager.iniciarFase(levelIndex);
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
    if (!this.executando) return;
    const elapsed = timestamp - this.lastTime;
    this.lastTime = timestamp;
    this.accumulatedTime += Math.min(elapsed, 100);
    while (this.accumulatedTime >= this.fixedStep) {
      this._update(1);
      this.accumulatedTime -= this.fixedStep;
    }
    this.screenUI.update();
    this._render();
    this.quadroAgendado = requestAnimationFrame(this._loop);
  }
  _update(passoTempo) {
    this.input.update();
    this.mouse.update(this.camera.renderX, this.camera.renderY);
    this.menuAnimTime += passoTempo * 0.05;
    this.sceneManager.update(passoTempo * 1000 / 60);
    if (this.input.isKeyJustPressed("m") || this.input.isKeyJustPressed("M")) {
      this.soundManager.toggleMute();
    }
    // Congela o mundo durante a cortina, sem interromper áudio e animações das telas.
    if (this.sceneManager.transition && [GameState.PLAYING, GameState.LEVEL_TRANSITION].includes(this.state)) return;
    if (this.input.isKeyJustPressed("Escape") || this.input.isKeyJustPressed("p")) {
      if ([GameState.PLAYING, GameState.PAUSED].includes(this.state)) {
        this.togglePause();
        return;
      }
    }
    switch (this.state) {
      case GameState.MENU:
        this.screenUI.menu.update(passoTempo * 1000 / 60);
        break;
      case GameState.PLAYING:
        this._updatePlaying(passoTempo);
        break;
      case GameState.LEVEL_TRANSITION:
        this.levelManager.updateTransition();
        break;
      case GameState.GAME_OVER:
      case GameState.VICTORY:
        this.gameOverCooldown = Math.max(0, this.gameOverCooldown - passoTempo);
        this.screenUI.end.update(passoTempo * 1000 / 60);
        break;
    }
  }
  // ===== ATUALIZAÇÃO DA PARTIDA =====
  // Mantém a ordem original: jogador, ondas, chefe, inimigos, projéteis e colisões.
  _updatePlaying(passoTempo) {
    this.scoreManager.atualizar(passoTempo / 60);
    this.atualizarAnimacoesDeMorte(passoTempo);
    this.atualizarJogador(passoTempo);
    if (this.encerrarSeDerrotado()) return;
    this.atualizarOndas();
    this.atualizarChefe(passoTempo);
    this.verificarConclusaoDaFase();
    if (this.sceneManager.transition || this.state !== GameState.PLAYING) return;
    this.atualizarInimigos(passoTempo);
    this.atualizarProjeteis(passoTempo);
    this.resolverCombate();
    if (this.encerrarSeDerrotado()) return;
    this.currentLevel.update(passoTempo, this.camera);
    this.camera.update();
  }
  atualizarAnimacoesDeMorte(passoTempo) {
    for (const efeito of this.deathEffects) {
      efeito.remaining -= passoTempo;
      efeito.actor.animator.update(efeito.actor, passoTempo);
    }
    this.deathEffects = this.deathEffects.filter((efeito) => efeito.remaining > 0);
  }
  encerrarSeDerrotado() {
    if (this.player.alive) return false;
    this.showEndScreen("defeat");
    return true;
  }
  atualizarJogador(passoTempo) {
    this.player.handleInput(this.input, this.mouse, this.projectiles, (posicaoX, posicaoY, velocidadeX, velocidadeY) => {
      this.playSound("throw");
      return new Batarang(posicaoX, posicaoY, velocidadeX, velocidadeY);
    });
    this.physics.update(this.player, this.currentLevel.platforms, this.currentLevel.width, this.currentLevel.height, passoTempo);
    this.player.update(passoTempo, this.currentLevel);
  }
  atualizarOndas() {
    const bossIsPresent = this.bossManager.boss && this.bossManager.boss.alive;
    this.spawner.update(this.enemies, this.currentLevel.width, this.currentLevel.height, bossIsPresent);
    if (this.spawner.thresholdReached && !this.bossManager.bossSpawned) {
      this.bossManager.spawnBoss(this.levelManager.currentLevelConfig, this.currentLevel.width, this.currentLevel.height);
      this.soundManager.setTrack("boss");
      this.camera.shake(12, 20);
      this.playSound("boss_enter");
      this.tocarFalaDoChefe(this.bossManager.boss);
    }
  }
  atualizarChefe(passoTempo) {
    if (this.bossManager.boss && this.bossManager.boss.alive) {
      const chefe = this.bossManager.boss;
      chefe.updateAI(this.player, this.projectiles, (fearDuration) => {
        this.player.applyFear(fearDuration);
        this.camera.shake(8, 16);
      }, (sfxType) => this.playSound(sfxType));
      chefe.update(passoTempo, this.currentLevel);
      this.physics.update(chefe, this.currentLevel.platforms, this.currentLevel.width, this.currentLevel.height, passoTempo);
    }
  }
  verificarConclusaoDaFase() {
    this.bossManager.update((defeatedBoss) => {
      this.scoreManager.finalizarFase();
      this.playSound("kill");
      this.camera.shake(14, 25);
      const nextAction = this.levelManager.triggerLevelComplete(() => {
        this.initLevel(this.levelManager.currentLevelIndex);
        this.soundManager.setTrack("rooftops");
        this.state = GameState.PLAYING;
      });
      if (nextAction === "VICTORY") {
        this.showEndScreen("victory");
      } else {
        this.state = GameState.LEVEL_TRANSITION;
      }
    }, (novoChefe) => {
      this.projectiles = [];
      this.enemies = [];
      this.camera.shake(8, 12);
      this.playSound("boss_enter");
      this.tocarFalaDoChefe(novoChefe);
    });
  }
  // Se o chefão tiver uma fala de entrada (ex.: Espantalho), toca o MP3 dela.
  tocarFalaDoChefe(chefe) {
    if (chefe?.introVoice) this.soundManager.playVoice(chefe.introVoice);
  }
  atualizarInimigos(passoTempo) {
    for (let indiceItem = this.enemies.length - 1; indiceItem >= 0; indiceItem--) {
      const enemy = this.enemies[indiceItem];
      if (!enemy.alive) {
        this.enemies.splice(indiceItem, 1);
        continue;
      }
      enemy.updateAI(this.player, this.projectiles, (sfxType) => this.playSound(sfxType));
      enemy.update(passoTempo, this.currentLevel);
      this.physics.update(enemy, this.currentLevel.platforms, this.currentLevel.width, this.currentLevel.height, passoTempo);
    }
  }
  atualizarProjeteis(passoTempo) {
    for (let indiceItem = this.projectiles.length - 1; indiceItem >= 0; indiceItem--) {
      const elemento = this.projectiles[indiceItem];
      elemento.update(passoTempo, this.currentLevel);
      if (!elemento.alive || elemento.x < -100 || elemento.x > this.currentLevel.width + 100 || elemento.y < -100 || elemento.y > this.height + 100) {
        this.projectiles.splice(indiceItem, 1);
      }
    }
  }
  resolverCombate() {
    this.combat.update(this.player, this.enemies, this.bossManager.boss, this.projectiles, (inimigo) => this.registrarAbate(inimigo));
  }
  // Recebe uma morte confirmada; pontua uma vez e prepara a animação de saída.
  registrarAbate(deadFoe) {
    // O evento de morte do combate ocorre uma única vez, inclusive para chefes intermediários.
    if (deadFoe.isBoss) this.scoreManager.adicionarPontosChefao(deadFoe.scoreType);
    else this.scoreManager.adicionarPontosMob(deadFoe.scoreType);
    if (deadFoe.isBoss && this.bossManager.bossIndex + 1 >= this.bossManager.bossTypes.length) {
      // Para o relógio no golpe final, antes da animação de morte do chefe.
      this.scoreManager.pararCronometro();
    }
    this.deathEffects.push({
      actor: deadFoe,
      remaining: GAME.DEATH_ANIMATION_FRAMES
    });
    // O CombatSystem já reproduziu o som deste abate.
    if (!deadFoe.isBoss) {
      this.spawner.recordKill();
    }
  }
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
    this.currentLevel.draw(this.ctx, this.camera);
    this.ctx.save();
    this.ctx.translate(-camX, -camY);
    for (const effect of this.deathEffects) effect.actor.draw(this.ctx);
    for (const enemy of this.enemies) {
      if (enemy.alive) enemy.draw(this.ctx);
    }
    if (this.bossManager.boss?.alive) {
      this.bossManager.boss.draw(this.ctx);
    }
    this.player.draw(this.ctx);
    for (const elemento of this.projectiles) {
      elemento.draw(this.ctx);
    }
    this.combat.draw(this.ctx, this.width, this.height);
    this.ctx.restore();
    this.bossManager.drawIntro(this.ctx, this.width, this.height);
    HUD.draw(this.ctx, this.player, this.levelManager.currentLevelConfig, this.spawner.killsInLevel, this.bossManager.boss, this.width, this.height, this.soundManager ? this.soundManager.isMuted : false, Batarang.available(this.projectiles), this.scoreManager);
  }
  _renderMenu() {
    this.screenUI.menu.draw(this.ctx, this.width, this.height);
  }
  _renderLevelTransition() {
    this.levelManager.drawTransition(this.ctx, this.width, this.height);
  }
  _renderGameOver() {
    this.screenUI.end.draw(this.ctx, this.width, this.height);
  }
  _renderVictory() {
    this.screenUI.end.draw(this.ctx, this.width, this.height);
  }
  // Encerra a instância inteira; trocar de cena continua usando apenas mount/unmount.
  // Encerra os recursos desta instância para não deixar eventos ativos.
  destroy() {
    this.executando = false;
    this.encerrado = true;
    if (this.quadroAgendado !== null) globalThis.cancelAnimationFrame?.(this.quadroAgendado);
    this.quadroAgendado = null;
    this.screenUI.active?.unmount();
    this.screenUI.menu.audio.destroy();
    this.screenUI.end.audio.destroy();
    this.screenUI.end.backgrounds.clear();
    this.screenUI.root?.replaceChildren();
    this.input.destroy();
    this.mouse.destroy();
    this.soundManager.destroy();
    this.enemies = [];
    this.projectiles = [];
    this.deathEffects = [];
    this.combat.particles = [];
  }
}
