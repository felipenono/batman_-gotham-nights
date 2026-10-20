import { GameModel } from '../models/GameModel.js';
import { GameView } from '../views/GameView.js';
import { PlayerController } from './input/PlayerController.js';
// Este arquivo cuida de coordenar a partida e seus sistemas.

// ===== DEPENDÊNCIAS E CONFIGURAÇÕES =====
import { SceneController } from "./SceneController.js";
import { Viewport } from "../views/Viewport.js";
import { GAME } from "../config/configuracao.js";
import { GameState } from "../models/GameState.js";
import { Input } from "./input/Input.js";
import { Mouse } from "./input/Mouse.js";
import { Batman } from "../models/entities/Batman.js";
import { Batarang } from "../models/entities/projectiles/Batarang.js";
import { AudioManager } from "../views/audio/AudioManager.js";
import { ScreenController } from "./ScreenController.js";
import { LOBBY } from "../config/configuracao.js";
import { normalizeResultData } from "../models/results/resultData.js";
// ===== COMPORTAMENTO =====
export class GameController {
  // Recebe as dependências e prepara o estado inicial deste componente.
  constructor(canvas) {
    this.executando = false;
    this.encerrado = false;
    this.quadroAgendado = null;
    this.model = new GameModel({
      onSound: type => this.playSound(type),
      onEnemyDamaged: enemy => this.soundManager.playRandomVoice(enemy.hurtVoiceGroup)
    });
    this.canvas = canvas;
    canvas.width = GAME.RENDER_WIDTH;
    canvas.height = GAME.RENDER_HEIGHT;
    this.viewport = new Viewport();
    this.view = new GameView(canvas, this.viewport);
    this.ctx = this.view.ctx;
    this.playerController = new PlayerController();
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

    // [POO - Coleções de Modelos / Entidades Polimórficas]
    this.player = null;
    this.enemies = [];
    this.projectiles = [];
    this.deathEffects = [];
    this.screenUI = new ScreenController(this, globalThis.document?.getElementById("screen-ui"));
    this.sceneManager = new SceneController(this);
    this.currentLevel = null;
    this.menuAnimTime = 0;
    this.gameOverCooldown = 0;
    this._loop = this._loop.bind(this);
    this.restartGame = this.restartGame.bind(this);
  }
  get width() { return this.model.width; }
  set width(value) { this.model.width = value; }
  get height() { return this.model.height; }
  set height(value) { this.model.height = value; }
  get state() { return this.model.state; }
  set state(value) { this.model.state = value; }
  get camera() { return this.model.camera; }
  set camera(value) { this.model.camera = value; }
  get physics() { return this.model.physics; }
  set physics(value) { this.model.physics = value; }
  get combat() { return this.model.combat; }
  set combat(value) { this.model.combat = value; }
  get spawner() { return this.model.spawner; }
  set spawner(value) { this.model.spawner = value; }
  get bossManager() { return this.model.bossManager; }
  set bossManager(value) { this.model.bossManager = value; }
  get levelManager() { return this.model.levelManager; }
  set levelManager(value) { this.model.levelManager = value; }
  get scoreManager() { return this.model.scoreManager; }
  set scoreManager(value) { this.model.scoreManager = value; }
  get player() { return this.model.player; }
  set player(value) { this.model.player = value; }
  get enemies() { return this.model.enemies; }
  set enemies(value) { this.model.enemies = value; }
  get projectiles() { return this.model.projectiles; }
  set projectiles(value) { this.model.projectiles = value; }
  get deathEffects() { return this.model.deathEffects; }
  set deathEffects(value) { this.model.deathEffects = value; }
  get currentLevel() { return this.model.currentLevel; }
  set currentLevel(value) { this.model.currentLevel = value; }
  _render() {
    this.view.render(this.model, this.screenUI.getPresentation(), this.soundManager.isMuted);
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
    this.view.setLevel(this.currentLevel);
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
    this.view.level.update(passoTempo, this.camera);
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
    this.playerController.handleInput(this.player, this.input, this.mouse, this.projectiles, (posicaoX, posicaoY, velocidadeX, velocidadeY) => {
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

export { GameController as Game };
