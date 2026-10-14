/**
 * @file constants.js
 * Game-wide constants, configurations, and keybindings for Batman: Gotham Nights.
 */

export const GAME = {
  WIDTH: 900,
  RENDER_WIDTH: 1920,
  RENDER_HEIGHT: 1080,
  JUMP_BUFFER_FRAMES: 6,
  COYOTE_FRAMES: 6,
  HEIGHT: 500,
  GRAVITY: 0.6,
  SPAWN_INTERVAL: 300,
  LIVES: 5,
  BATMAN_HP_PER_LIFE: 3,
  RESPAWN_INTANGIBLE_FRAMES: 60,
  DEATH_ANIMATION_FRAMES: 30,
};

export const PROJECTILE = {
  BATARANG_SPEED: 10,
  BATARANG_DAMAGE: 10,
  BATARANG_COOLDOWN: 30,
  BATARANG_MAX_ACTIVE: 5,
  BULLET_SPEED: 8,
  TEETH_SPEED: 6,
  SMOKE_SPEED: 1.5,
  COIN_SPEED: 7,
  UMBRELLA_SPEED: 8,
  UMBRELLA_TURN_RATE: 0.035, // radians per fixed update (about 2 degrees)
  UMBRELLA_TRACKING_FRAMES: 60, // one second at 60 updates/s
  PENGUIN_BOMB_SPEED: 5,
  PENGUIN_BOMB_FUSE: 120,
  PENGUIN_BOMB_RADIUS: 46,
  PENGUIN_BOMB_BLAST_FRAMES: 24,
  GAS_BOMB_SPEED: 6,
};

export const LEVELS = {
  LEVEL_1: {
    id: 1,
    name: 'TELHADOS DE GOTHAM',
    subtitle: 'Anoitecer em Gotham',
    commonEnemy: 'Joker',
    enemyRoster: ['Joker', 'ScarecrowAcolyte'],
    boss: 'Scarecrow',
    bosses: ['Joker', 'Scarecrow'],
    killThreshold: 10,
    background: 'Level1Background',
  },
  LEVEL_2: {
    id: 2,
    name: 'SALÃO ICEBERG',
    subtitle: "O clube de apostas de Cobblepot",
    commonEnemy: 'Penguin',
    enemyRoster: ['Penguin', 'HarleyThug'],
    boss: 'HarleyQuinn',
    killThreshold: 15,
    background: 'Level2Background',
  },
  LEVEL_3: {
    id: 3,
    name: 'ASILO ARKHAM',
    subtitle: 'Contenção de segurança máxima',
    commonEnemy: 'Penguin',
    boss: 'TwoFace',
    killThreshold: 10,
    enemyRoster: ['TwoFaceEnforcer', 'PenguinElite'],
    background: 'Level3Background',
  },
};

export const KEYS = {
  LEFT: ['ArrowLeft', 'a', 'A'],
  RIGHT: ['ArrowRight', 'd', 'D'],
  JUMP: ['ArrowUp', 'w', 'W', ' '],
  SHOOT: ['x', 'X', 'z', 'Z', 'c', 'C', 'v', 'V', 'j', 'J', 'k', 'K', 'f', 'F', 'q', 'Q', 'e', 'E', 'Control', 'Shift'],
  START: [' ', 'Enter'],
};

export const LIGHTING = { INTENSITY: 0.45 };
export const LOGO_GOLD = '#695525'; // Half of the previous yellow RGB values.
