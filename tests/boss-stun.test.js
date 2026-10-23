import test from 'node:test';
import assert from 'node:assert/strict';
import { GAME } from '../src/config/configuracao.js';
import { Penguin } from '../src/models/entities/villains/Penguin.js';

// Chefões ficam atordoados por menos tempo; inimigos comuns continuam com 10 quadros.
test('boss hurt stun uses GAME.BOSS_HURT_STUN_FRAMES and mobs keep 10 frames', () => {
  const chefe = new Penguin({ x: 0, y: 0 }); chefe.isBoss = true;
  const mob = new Penguin({ x: 0, y: 0 });
  chefe.takeDamage(1); mob.takeDamage(1);
  assert.equal(chefe.hurtFlash, GAME.BOSS_HURT_STUN_FRAMES);
  assert.equal(GAME.BOSS_HURT_STUN_FRAMES, 3);
  assert.equal(mob.hurtFlash, 10);
});

// A vida dos chefões é multiplicada por GAME.BOSS_HP_MULTIPLIER ao nascerem.
test('chefões nascem com a vida multiplicada pela configuração', async () => {
  const { BossManager } = await import('../src/models/services/BossManager.js');
  const { LEVELS } = await import('../src/config/configuracao.js');
  assert.equal(GAME.BOSS_HP_MULTIPLIER, 1.5);
  const esperado = { JokerBoss: 180, Scarecrow: 150, HarleyQuinn: 180, TwoFace: 225 };
  for (const config of [LEVELS.LEVEL_1, LEVELS.LEVEL_2, LEVELS.LEVEL_3]) {
    const manager = new BossManager(); manager.spawnBoss(config, 1100, 500);
    const tipos = config.bosses || [config.boss];
    for (let i = 0; i < tipos.length; i++) {
      const chefe = manager.boss;
      assert.equal(chefe.maxHp, esperado[chefe.constructor.name], chefe.constructor.name);
      assert.equal(chefe.hp, chefe.maxHp);
      if (i + 1 < tipos.length) { chefe.alive = false; manager.deathTimer = 0; manager.update(() => {}, () => {}); }
    }
  }
});

// A Fase 3 pede 15 abates antes do chefe (antes eram 10).
test('meta da Fase 3 é de 15 abates', async () => {
  const { LEVELS } = await import('../src/config/configuracao.js');
  assert.deepEqual([LEVELS.LEVEL_1.killThreshold, LEVELS.LEVEL_2.killThreshold, LEVELS.LEVEL_3.killThreshold], [10, 15, 15]);
});
