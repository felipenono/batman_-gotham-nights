import test from 'node:test';
import assert from 'node:assert/strict';
import { GAME, LEVELS } from '../src/config/configuracao.js';
import { Spawner } from '../src/models/services/Spawner.js';
import { Scarecrow } from '../src/models/entities/villains/Scarecrow.js';
import { TwoFaceEnforcer } from '../src/models/entities/villains/TwoFaceEnforcer.js';
import { Batman } from '../src/models/entities/Batman.js';

// Capangas nunca nascem a menos de GAME.SPAWN_SAFE_DISTANCE do Batman.
test('capangas nascem longe do Batman', () => {
  for (const config of [LEVELS.LEVEL_1, LEVELS.LEVEL_2, LEVELS.LEVEL_3]) {
    for (const centroBatman of [60, 120, 550, 980, 1060]) {
      for (let r = 0; r < 50; r++) {
        const spawner = new Spawner(); spawner.initLevel(config); const inimigos = [];
        spawner.spawnWave(inimigos, 1100, 500, centroBatman);
        for (const inimigo of inimigos) {
          assert.ok(Math.abs(inimigo.x + 17 - centroBatman) >= GAME.SPAWN_SAFE_DISTANCE, `x=${inimigo.x} Batman=${centroBatman}`);
        }
      }
    }
  }
});

// Sem a posição do Batman, o sorteio continua como antes (usado pelos testes antigos).
test('spawnWave sem a posição do Batman mantém o comportamento original', () => {
  const spawner = new Spawner(); spawner.initLevel(LEVELS.LEVEL_1); const inimigos = [];
  spawner.spawnWave(inimigos, 1100, 500);
  assert.equal(inimigos.length, 3);
});

// O Agente do Duas-Caras entra em fúria com metade da vida (2 tiros em leque).
test('Agente do Duas-Caras entra em fúria com metade da vida', () => {
  const agente = new TwoFaceEnforcer({ x: 500, y: 300 }); const alvo = new Batman({ x: 300, y: 300 });
  agente.takeDamage(10); assert.equal(agente.hpRatio, 0.5);
  agente.nextAttackIsBullets = true; const tiros = [];
  agente.executeDecidedAttack(alvo, tiros);
  assert.equal(tiros.length, 2);
});

// A primeira aura do medo do Espantalho vem mais cedo.
test('primeira aura do Espantalho sai no tempo configurado', () => {
  assert.equal(GAME.SCARECROW_FIRST_AURA_FRAMES, 420);
  const chefe = new Scarecrow({ x: 800, y: 330 }); const alvo = new Batman({ x: 300, y: 368 });
  let aura = null;
  for (let q = 1; q <= 1300 && aura === null; q++) chefe.updateAI(alvo, [], () => { aura = q; });
  assert.equal(aura, GAME.SCARECROW_FIRST_AURA_FRAMES);
});
