import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { LUZ_PERSONAGENS } from '../src/config/configuracao.js';
import { REFERENCE_URLS } from '../src/views/sprites/referenceSprites.js';

// Cada sprite existe e é um PNG com transparência (tipo de cor 6 = RGBA), sem fundo branco.
test('sprites dos personagens existem e têm transparência real', () => {
  for (const [chave, url] of Object.entries(REFERENCE_URLS)) {
    const caminho = new URL(url);
    assert.ok(existsSync(caminho), chave);
    const bytes = readFileSync(caminho);
    assert.equal(bytes.subarray(1, 4).toString(), 'PNG', chave);
    assert.equal(bytes[25], 6, `${chave} deve ser RGBA`);
  }
});

// A luz das fases está configurada para as 3 fases e pode ser desligada.
test('luz dos personagens tem tom e contorno para as 3 fases', () => {
  assert.equal(typeof LUZ_PERSONAGENS.ativo, 'boolean');
  for (const fase of [1, 2, 3]) {
    assert.match(LUZ_PERSONAGENS.fases[fase].tom, /^rgba\(/);
    assert.match(LUZ_PERSONAGENS.fases[fase].contorno, /^rgba\(/);
  }
});
