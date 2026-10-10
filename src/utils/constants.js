/**
 * @file constants.js
 * Game-wide constants, configurations, and keybindings for Batman: Gotham Nights.
 */

export const GAME = {
  WIDTH: 900,
  HEIGHT: 500,
  GRAVITY: 0.6,
  SPAWN_INTERVAL: 300,
  LIVES: 5,
  BATMAN_HP_PER_LIFE: 3,
};

export const PROJECTILE = {
  BATARANG_SPEED: 10,
  BATARANG_DAMAGE: 10,
  BATARANG_COOLDOWN: 12,
  BULLET_SPEED: 8,
  TEETH_SPEED: 6,
  SMOKE_SPEED: 1.5,
  COIN_SPEED: 7,
  UMBRELLA_SPEED: 8,
  PENGUIN_BOMB_SPEED: 5,
  GAS_BOMB_SPEED: 6,
};

export const LEVELS = {
  LEVEL_1: {
    id: 1,
    name: 'GOTHAM ROOFTOPS',
    subtitle: 'Nightfall over Gotham',
    commonEnemy: 'Joker',
    boss: 'Scarecrow',
    killThreshold: 10,
    background: 'Level1Background',
  },
  LEVEL_2: {
    id: 2,
    name: 'ICEBERG LOUNGE',
    subtitle: "Cobblepot's High Stakes Club",
    commonEnemy: 'Penguin',
    boss: 'HarleyQuinn',
    killThreshold: 15,
    background: 'Level2Background',
  },
  LEVEL_3: {
    id: 3,
    name: 'ARKHAM ASYLUM',
    subtitle: 'Maximum Security Containment',
    commonEnemy: 'Penguin',
    boss: 'TwoFace',
    killThreshold: 10,
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
