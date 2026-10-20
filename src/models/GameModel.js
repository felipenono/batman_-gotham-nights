import { GAME } from '../config/configuracao.js';
import { GameState } from './GameState.js';
import { Camera } from './world/Camera.js';
import { Physics } from './services/Physics.js';
import { CombatSystem } from './services/CombatSystem.js';
import { Spawner } from './services/Spawner.js';
import { BossManager } from './services/BossManager.js';
import { LevelManager } from './services/LevelManager.js';
import { ScoreManager } from './services/ScoreManager.js';

export class GameModel {
  constructor({ onSound = null, onEnemyDamaged = null } = {}) {
    this.width = GAME.WIDTH;
    this.height = GAME.HEIGHT;
    this.state = GameState.MENU;
    this.player = null;
    this.enemies = [];
    this.projectiles = [];
    this.deathEffects = [];
    this.currentLevel = null;

    this.camera = new Camera(this.width, this.height);
    this.physics = new Physics(GAME.GRAVITY);
    // O modelo emite o evento; o controller escolhe como reproduzir o som.
    this.combat = new CombatSystem({ camera: this.camera, onSound, onEnemyDamaged });
    this.spawner = new Spawner();
    this.bossManager = new BossManager();
    this.levelManager = new LevelManager();
    this.scoreManager = new ScoreManager();
  }
}
