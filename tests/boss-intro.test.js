import test from 'node:test';
import assert from 'node:assert/strict';
import { GAME } from '../src/config/configuracao.js';
import { Game } from '../src/controllers/GameController.js';
import { Batarang } from '../src/models/entities/projectiles/Batarang.js';

globalThis.window ??= new EventTarget();
const close = (game) => { game.input.destroy(); game.mouse.destroy(); game.soundManager.destroy(); game.touchControls?.destroy?.(); };
const makeGame = () => new Game(Object.assign(new EventTarget(), { width: 1920, height: 1080, getBoundingClientRect: () => ({ left: 0, top: 0, width: 1920, height: 1080 }), getContext: () => ({}) }));

// Durante a faixa de apresentação o chefão não ataca e não recebe dano; depois volta ao normal.
test('chefe não age nem recebe dano durante a faixa de apresentação', () => {
  assert.equal(GAME.BOSS_INTRO_PAUSES_AI, true);
  for (const fase of [1, 2, 3]) {
    const game = makeGame();
    try {
      game.restartGame(fase); game.spawner.update = () => {}; game.player.invulnerable = 1e6;
      game.bossManager.spawnBoss(game.levelManager.currentLevelConfig, game.currentLevel.width, game.height);
      const chefe = game.bossManager.boss; let chamadasIA = 0; const ia = chefe.updateAI.bind(chefe);
      chefe.updateAI = (...a) => { chamadasIA++; return ia(...a); };
      const vidaInicial = chefe.hp;
      const tiro = new Batarang(0, 0, 0, 0); tiro.intersects = (alvo) => alvo === chefe; game.projectiles = [tiro];
      game._update(1);
      assert.equal(chefe.hp, vidaInicial, 'sem dano durante a faixa');
      while (game.bossManager.introTimer > 0) game._update(1);
      assert.equal(chamadasIA, 0, 'sem IA durante a faixa');
      game._update(1);
      assert.ok(chamadasIA > 0, 'IA volta depois da faixa');
      chefe.invulnerable = 0; const tiro2 = new Batarang(0, 0, 0, 0); tiro2.intersects = (alvo) => alvo === chefe; game.projectiles = [tiro2];
      game._update(1);
      assert.ok(chefe.hp < vidaInicial, 'recebe dano depois da faixa');
    } finally { close(game); }
  }
});

// Ao chegar o chefe, os capangas e ataques inimigos somem; batarangues e pontuação não mudam.
test('entrada do chefe limpa capangas e ataques inimigos sem dar pontos', async () => {
  assert.equal(GAME.BOSS_INTRO_CLEARS_FIELD, true);
  const { Joker } = await import('../src/models/entities/villains/Joker.js');
  const { Bullet } = await import('../src/models/entities/projectiles/Bullet.js');
  for (const fase of [1, 2, 3]) {
    const game = makeGame();
    try {
      game.restartGame(fase); game.player.invulnerable = 1e6;
      game.enemies = [new Joker({ x: 900, y: 360 }), new Joker({ x: 950, y: 360 })];
      const tiroInimigo = new Bullet(800, 300, -1, 0);
      const batarangue = new Batarang(300, 100, 1, 0);
      game.projectiles = [tiroInimigo, batarangue];
      const pontos = game.scoreManager.score;
      game.spawner.killsInLevel = game.levelManager.currentLevelConfig.killThreshold;
      game._update(1);
      assert.ok(game.bossManager.boss, 'chefe nasceu');
      assert.equal(game.enemies.length, 0, 'capangas removidos');
      assert.ok(!game.projectiles.includes(tiroInimigo), 'ataque inimigo removido');
      assert.ok(game.projectiles.includes(batarangue), 'batarangue continua');
      assert.equal(game.scoreManager.score, pontos, 'sem pontos extras');
    } finally { close(game); }
  }
});

// O giro da moeda do Duas-Caras dura 35 quadros mesmo na Fase 3, enquanto o ciclo de ataque continua acelerado.
test('aviso da moeda do Duas-Caras não acelera com a dificuldade da fase', async () => {
  assert.equal(GAME.BOSS_TELEGRAPH_FIXED_SPEED, true);
  const { TwoFace } = await import('../src/models/entities/villains/TwoFace.js');
  const { Batman } = await import('../src/models/entities/Batman.js');
  const chefe = new TwoFace({ x: 500, y: 300 }); chefe.attackRate = 2.25;
  const alvo = new Batman({ x: 400, y: 300 }); const tiros = [];
  chefe.attackCycleTimer = 1; chefe.updateAI(alvo, tiros);
  assert.equal(chefe.coinFlipping, true);
  let quadros = 0;
  while (chefe.coinFlipping && quadros < 100) { chefe.updateAI(alvo, tiros); quadros++; }
  assert.equal(quadros, 35);
  assert.ok(tiros.length > 0, 'ataque sai depois do aviso');
});
