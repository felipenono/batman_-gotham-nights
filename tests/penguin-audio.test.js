import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { AUDIO_CONFIG, LEVELS } from '../src/config/configuracao.js';
import { CombatSystem } from '../src/models/services/CombatSystem.js';
import { Penguin } from '../src/models/entities/villains/Penguin.js';
import { Joker } from '../src/models/entities/villains/Joker.js';
import { Batarang } from '../src/models/entities/projectiles/Batarang.js';
import { AudioManager } from '../src/views/audio/AudioManager.js';
import { GameController } from '../src/controllers/GameController.js';

const reactions = AUDIO_CONFIG.GRUPOS_VOZES.penguin_hurt;

function shot(target) {
  const projectile = new Batarang(target.x, target.y, 0, 0);
  projectile.intersects = candidate => candidate === target;
  return projectile;
}

test('sete reações distintas do Pinguim têm arquivos MP3 registrados', () => {
  assert.equal(reactions.length, 7);
  assert.equal(new Set(reactions).size, 7);
  for (const name of reactions) {
    const file = AUDIO_CONFIG.VOZES[name].arquivo;
    assert.match(file, /\.mp3$/);
    const bytes = readFileSync(new URL('../public/' + file, import.meta.url));
    // MP3 começa com a etiqueta ID3 ou direto com um quadro de áudio (0xFFEx).
    const temId3 = bytes.subarray(0, 3).toString() === 'ID3';
    const temQuadro = bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0;
    assert.ok(temId3 || temQuadro, `${file} não é um MP3 válido`);
  }
});

test('cada dano confirmado emite um evento, incluindo o golpe fatal, sem repetir o projétil', () => {
  const events = [];
  const combat = new CombatSystem({ onEnemyDamaged: enemy => events.push(enemy) });
  const penguin = new Penguin();
  penguin.hp = 2;
  const first = shot(penguin);
  first.damage = 1;
  combat.update(null, [penguin], null, [first]);
  combat.update(null, [penguin], null, [first]);
  assert.equal(penguin.hp, 1);
  assert.deepEqual(events, [penguin]);
  const fatal = shot(penguin);
  combat.update(null, [penguin], null, [fatal]);
  combat.update(null, [penguin], null, [shot(penguin)]);
  assert.equal(penguin.alive, false);
  assert.deepEqual(events, [penguin, penguin]);
});

test('invulnerabilidade e disparo sem impacto não emitem reação de dano', () => {
  const events = [];
  const combat = new CombatSystem({ onEnemyDamaged: enemy => events.push(enemy) });
  const penguin = new Penguin();
  penguin.invulnerable = 20;
  combat.update(null, [penguin], null, [shot(penguin)]);
  penguin.invulnerable = 0;
  const miss = shot(penguin);
  miss.intersects = () => false;
  combat.update(null, [penguin], null, [miss]);
  assert.equal(penguin.hp, penguin.maxHp);
  assert.deepEqual(events, []);
});

// Cria um AudioManager falso com relógio controlado pelo teste.
function audioFalso(duracao = 2) {
  const audio = Object.create(AudioManager.prototype);
  audio.ctx = { currentTime: 0 };
  audio.isMuted = false;
  audio.encerrado = false;
  audio.liberaGrupo = new Map();
  audio.ultimaVozDoGrupo = new Map();
  audio.tocadas = [];
  audio.playVoice = name => { audio.tocadas.push(name); return Promise.resolve(duracao); };
  return audio;
}

test('sorteio pode alcançar os sete áudios, não repete em seguida e respeita mudo, contexto bloqueado e descarte', async () => {
  const audio = audioFalso(1);
  const intervalo = AUDIO_CONFIG.INTERVALO_GRUPOS.penguin_hurt;
  let semente = 0;
  for (let i = 0; i < 60; i++) {
    semente = (semente + 0.37) % 1;
    assert.ok(audio.playRandomVoice('penguin_hurt', () => semente));
    await new Promise(pronto => setImmediate(pronto));
    audio.ctx.currentTime += 1 + intervalo; // espera a voz terminar + a pausa
  }
  assert.equal(new Set(audio.tocadas).size, 7);
  audio.tocadas.forEach((name, index) => {
    if (index > 0) assert.notEqual(name, audio.tocadas[index - 1]);
  });
  const total = audio.tocadas.length;
  audio.isMuted = true;
  audio.playRandomVoice('penguin_hurt');
  audio.isMuted = false;
  const ctx = audio.ctx;
  audio.ctx = null;
  audio.playRandomVoice('penguin_hurt');
  audio.ctx = ctx;
  audio.encerrado = true;
  audio.playRandomVoice('penguin_hurt');
  audio.encerrado = false;
  audio.playRandomVoice(undefined);
  assert.equal(audio.tocadas.length, total);
});

test('nova reação do Pinguim espera a anterior terminar mais a pausa configurada', async () => {
  const audio = audioFalso(2);
  const intervalo = AUDIO_CONFIG.INTERVALO_GRUPOS.penguin_hurt;
  assert.ok(audio.playRandomVoice('penguin_hurt'));
  // Dois danos no mesmo instante: o segundo não toca.
  assert.equal(audio.playRandomVoice('penguin_hurt'), undefined);
  await new Promise(pronto => setImmediate(pronto));
  audio.ctx.currentTime = 2 + intervalo - 0.01;
  assert.equal(audio.playRandomVoice('penguin_hurt'), undefined);
  audio.ctx.currentTime = 2 + intervalo;
  assert.ok(audio.playRandomVoice('penguin_hurt'));
  assert.equal(audio.tocadas.length, 2);
});

test('reação que não tocou libera o grupo na hora', async () => {
  const audio = audioFalso(null); // null = a voz não chegou a tocar
  assert.ok(audio.playRandomVoice('penguin_hurt'));
  await new Promise(pronto => setImmediate(pronto));
  assert.ok(audio.playRandomVoice('penguin_hurt'));
});

test('áudios são carregados uma vez e a reprodução utiliza o canal de efeitos', async () => {
  const oldFetch = globalThis.fetch;
  const audio = Object.create(AudioManager.prototype);
  const decoded = { duration: 1 };
  const gain = { gain: {}, connect() {} };
  const source = { connect: target => assert.equal(target, gain), start() { this.started = true; } };
  audio.ctx = { decodeAudioData: async () => decoded, createBufferSource: () => source, createGain: () => gain };
  audio.sfxGain = {};
  gain.connect = target => assert.equal(target, audio.sfxGain);
  audio.vozes = new Map();
  audio.isMuted = false;
  let loads = 0;
  globalThis.fetch = async () => {
    loads++;
    return { ok: true, arrayBuffer: async () => new ArrayBuffer(1) };
  };
  try {
    const first = audio._carregarVoz(reactions[0]);
    assert.equal(audio._carregarVoz(reactions[0]), first);
    await first;
    audio.playVoice(reactions[0]);
    await Promise.resolve();
    assert.equal(loads, 1);
    assert.equal(source.buffer, decoded);
    assert.equal(source.started, true);
    assert.equal(gain.gain.value, AUDIO_CONFIG.VOZES[reactions[0]].volume);
  } finally {
    globalThis.fetch = oldFetch;
  }
});

test('controller encaminha danos do Pinguim comum e de elite nas fases 2 e 3', () => {
  const oldWindow = globalThis.window;
  globalThis.window = new EventTarget();
  const canvas = Object.assign(new EventTarget(), {
    getContext: () => ({}),
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 1920, height: 1080 })
  });
  const game = new GameController(canvas);
  const groups = [];
  game.soundManager.playRandomVoice = group => { if (group) groups.push(group); };
  try {
    for (const phase of [2, 3]) {
      game.restartGame(phase);
      game.spawner.initLevel(LEVELS['LEVEL_' + phase]);
      game.spawner.spawnWave(game.enemies, game.currentLevel.width, game.currentLevel.height);
      const penguin = game.enemies.find(enemy => enemy instanceof Penguin);
      assert.ok(penguin);
      if (phase === 3) assert.equal(penguin.scoreType, 'PenguinElite');
      game.projectiles = [shot(penguin)];
      game.resolverCombate();
    }
    const joker = new Joker();
    game.combat.update(null, [joker], null, [shot(joker)]);
    assert.deepEqual(groups, ['penguin_hurt', 'penguin_hurt']);
  } finally {
    game.destroy();
    globalThis.window = oldWindow;
  }
});
