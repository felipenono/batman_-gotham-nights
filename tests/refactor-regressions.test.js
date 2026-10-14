// Este arquivo verifica as correções autorizadas na primeira parte da refatoração.
import test from 'node:test';
import assert from 'node:assert/strict';
import { GasBomb } from '../src/entities/projectiles/GasBomb.js';
import { Spawner } from '../src/systems/Spawner.js';
import { ScoreManager } from '../src/systems/ScoreManager.js';
import { LOBBY, LEVELS } from '../src/config/configuracao.js';
import { Game } from '../src/core/Game.js';
import { Joker } from '../src/entities/villains/Joker.js';
import { Batarang } from '../src/entities/projectiles/Batarang.js';
import { Character } from '../src/entities/Character.js';
import { Viewport } from '../src/core/Viewport.js';
import { normalizeResultData } from '../src/utils/resultData.js';

test('dados incompletos e dimensões nulas não produzem divisões inválidas', () => {
  assert.equal(new Character({ maxHp: 0 }).hpRatio, 0);
  assert.deepEqual(new Viewport().toGame(20, 30, 0, 0), { x: 0, y: 0 });
  assert.equal(normalizeResultData(null).demo, true);
  assert.deepEqual(normalizeResultData({ breakdown: [null, undefined] }).breakdown, []);
});

test('iniciar duas vezes mantém um único loop e encerrar cancela o quadro pendente', () => {
  const janelaAnterior = globalThis.window;
  const agendarAnterior = globalThis.requestAnimationFrame;
  const cancelarAnterior = globalThis.cancelAnimationFrame;
  globalThis.window = new EventTarget();
  const agendados = [];
  const cancelados = [];
  globalThis.requestAnimationFrame = funcao => { agendados.push(funcao); return agendados.length; };
  globalThis.cancelAnimationFrame = id => cancelados.push(id);
  const canvas = Object.assign(new EventTarget(), {
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 1920, height: 1080 }),
    getContext: () => ({}),
  });
  let jogo;
  try {
    jogo = new Game(canvas);
    jogo.start();
    jogo.start();
    assert.equal(agendados.length, 1);
    jogo.destroy();
    jogo.destroy();
    jogo.start();
    assert.deepEqual(cancelados, [1]);
    assert.equal(agendados.length, 1);
    assert.equal(jogo.executando, false);
  } finally {
    jogo?.destroy();
    globalThis.window = janelaAnterior;
    globalThis.requestAnimationFrame = agendarAnterior;
    globalThis.cancelAnimationFrame = cancelarAnterior;
  }
});

test('a nuvem de gás expande mantendo o centro do impacto', () => {
  const bomba = new GasBomb(100, 100, 0, 0);
  const centroX = bomba.x + bomba.w / 2;
  const centroY = bomba.y + bomba.h / 2;
  bomba.detonate();
  for (let quadro = 0; quadro < 20; quadro++) {
    bomba.update(1);
    assert.ok(Math.abs(bomba.x + bomba.w / 2 - centroX) < 1e-9);
    assert.ok(Math.abs(bomba.y + bomba.h / 2 - centroY) < 1e-9);
  }
});

test('Pinguim de elite recebe a pontuação configurada para sua variante', () => {
  const gerador = new Spawner();
  gerador.initLevel(LEVELS.LEVEL_3);
  const inimigos = [];
  gerador.spawnWave(inimigos, 1100, 500);
  const elite = inimigos.find(inimigo => inimigo.scoreType === 'PenguinElite');
  assert.ok(elite);
  const placar = new ScoreManager({
    config: { ...LOBBY.scoring, mobTypes: { Penguin: 100, PenguinElite: 200 } },
    storage: null,
  });
  placar.iniciarFase();
  assert.equal(placar.adicionarPontosMob(elite.scoreType), 200);
});

test('faixas fora de ordem não alteram o bônus nem a configuração recebida', () => {
  const faixas = [{ seconds: Infinity, points: 100 }, { seconds: 180, points: 500 }, { seconds: 90, points: 1000 }];
  const placar = new ScoreManager({ config: { ...LOBBY.scoring, timeBonuses: faixas }, storage: null });
  assert.equal(placar.calcularBonusTempo(90), 1000);
  assert.equal(placar.calcularBonusTempo(100), 500);
  assert.equal(faixas[0].seconds, Infinity);
});

test('um abate comum reproduz o efeito sonoro uma única vez', () => {
  const janelaAnterior = globalThis.window;
  globalThis.window = new EventTarget();
  const canvas = Object.assign(new EventTarget(), {
    width: 1920, height: 1080,
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 1920, height: 1080 }),
    getContext: () => ({}),
  });
  const jogo = new Game(canvas);
  try {
    jogo.restartGame();
    const sons = [];
    jogo.soundManager.playSfx = tipo => sons.push(tipo);
    const inimigo = new Joker({ x: 400, y: 400 });
    inimigo.hp = 1;
    inimigo.updateAI = () => {};
    const tiro = new Batarang(400, 400, 0, 0);
    tiro.intersects = alvo => alvo === inimigo;
    jogo.enemies = [inimigo];
    jogo.projectiles = [tiro];
    jogo._update(1);
    assert.equal(sons.filter(tipo => tipo === 'kill').length, 1);
  } finally {
    jogo.input.destroy();
    jogo.mouse.destroy();
    jogo.soundManager.destroy();
    globalThis.window = janelaAnterior;
  }
});

test('imagem ausente não impede carregar as referências disponíveis', async () => {
  const documentoAnterior = globalThis.document;
  const imagemAnterior = globalThis.Image;
  const { prepareReferenceSprites, drawAsset } = await import('../src/assets/sprites/referenceSprites.js?teste-falha');
  globalThis.Image = class {
    naturalWidth = 1;
    naturalHeight = 1;
    async decode() {
      if (!this.src.endsWith('batarang_reference.png')) throw new Error('Imagem ausente');
    }
  };
  globalThis.document = {
    createElement: () => ({ getContext: () => ({
      drawImage() {}, putImageData() {},
      getImageData: () => ({ data: new Uint8ClampedArray([0, 0, 0, 255]) }),
    }) }),
  };
  try {
    await assert.doesNotReject(prepareReferenceSprites());
    assert.equal(drawAsset({ drawImage() {} }, 'batarang', 20, 20), true);
    assert.equal(drawAsset({}, 'bat_logo', 20, 20), false);
  } finally {
    globalThis.document = documentoAnterior;
    globalThis.Image = imagemAnterior;
  }
});
