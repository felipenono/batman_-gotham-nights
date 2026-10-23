import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { CAPANGAS, LEVELS } from '../src/config/configuracao.js';
import { Spawner } from '../src/models/services/Spawner.js';
import { MOB_REFERENCE_URLS } from '../src/views/sprites/referenceSprites.js';
import { BossManager } from '../src/models/services/BossManager.js';
import { Game } from '../src/controllers/GameController.js';

globalThis.window ??= new EventTarget();
const close = (game) => { game.input.destroy(); game.mouse.destroy(); game.soundManager.destroy(); game.touchControls?.destroy?.(); };
const makeGame = () => new Game(Object.assign(new EventTarget(), { width: 1920, height: 1080, getBoundingClientRect: () => ({ left: 0, top: 0, width: 1920, height: 1080 }), getContext: () => ({}) }));

// Cada capanga recebe o visual próprio; os chefes continuam com o deles.
test('capangas usam o visual próprio e os chefes não mudam', () => {
  for (const config of [LEVELS.LEVEL_1, LEVELS.LEVEL_2, LEVELS.LEVEL_3]) {
    const spawner = new Spawner(); spawner.initLevel(config); const inimigos = [];
    spawner.spawnWave(inimigos, 1100, 500);
    for (const inimigo of inimigos) assert.equal(inimigo.spriteKey, CAPANGAS.visual[inimigo.scoreType], inimigo.scoreType);
    const chefes = new BossManager(); chefes.spawnBoss(config, 1100, 500);
    assert.ok(['joker', 'scarecrow', 'harley_quinn', 'two_face'].includes(chefes.boss.spriteKey));
  }
});

// As imagens dos capangas existem e são PNG com transparência.
test('imagens dos capangas existem e têm transparência', () => {
  for (const [chave, url] of Object.entries(MOB_REFERENCE_URLS)) {
    const caminho = new URL(url); assert.ok(existsSync(caminho), chave);
    const bytes = readFileSync(caminho);
    assert.equal(bytes.subarray(1, 4).toString(), 'PNG', chave); assert.equal(bytes[25], 6, chave);
  }
});

// Reforços: só abaixo de metade da vida do chefe, 1 a cada intervalo, no máximo maximoVivos.
test('reforços chegam a cada intervalo com o chefe abaixo da metade da vida', () => {
  const regras = CAPANGAS.reforcos; assert.equal(regras.intervalo, 150);
  for (const fase of [1, 2, 3]) {
    const game = makeGame();
    try {
      game.restartGame(fase); game.player.invulnerable = 1e9;
      game.spawner.killsInLevel = game.levelManager.currentLevelConfig.killThreshold;
      game._update(1);
      const chefe = game.bossManager.boss; chefe.updateAI = () => {};
      game.bossManager.introTimer = 0;
      for (let i = 0; i < 600; i++) game._update(1);
      assert.equal(game.enemies.length, 0, 'sem reforços com o chefe acima da metade');
      chefe.hp = Math.floor(chefe.maxHp * 0.4);
      for (let i = 0; i < regras.intervalo - 1; i++) game._update(1);
      assert.equal(game.enemies.length, 0, 'ainda não deu o intervalo');
      game._update(1); game._update(1);
      assert.equal(game.enemies.length, 1, 'primeiro reforço');
      assert.equal(game.enemies[0].isReinforcement, true);
      for (let i = 0; i < regras.intervalo * 5; i++) { game._update(1); for (const e of game.enemies) e.updateAI = () => {}; }
      assert.equal(game.enemies.filter((e) => e.alive).length, regras.maximoVivos, 'limite de vivos');
    } finally { close(game); }
  }
});
