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

test('sete reações distintas do Pinguim têm arquivos Ogg registrados', () => {
  assert.equal(reactions.length, 7);
  assert.equal(new Set(reactions).size, 7);
  for (const name of reactions) {
    const file = AUDIO_CONFIG.VOZES[name].arquivo;
    const bytes = readFileSync(new URL('../public/' + file, import.meta.url));
    assert.equal(bytes.subarray(0, 4).toString(), 'OggS');
    assert.ok(bytes.includes(Buffer.from('OpusHead')));
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

test('sorteio pode alcançar os sete áudios e respeita mudo, contexto bloqueado e descarte', () => {
  const audio = Object.create(AudioManager.prototype);
  audio.ctx = {};
  audio.isMuted = false;
  audio.encerrado = false;
  const selected = [];
  audio.playVoice = name => selected.push(name);
  reactions.forEach((name, index) => {
    assert.equal(audio.playRandomVoice('penguin_hurt', () => (index + 0.5) / reactions.length), name);
  });
  assert.deepEqual(selected, reactions);
  audio.isMuted = true;
  audio.playRandomVoice('penguin_hurt');
  audio.isMuted = false;
  audio.ctx = null;
  audio.playRandomVoice('penguin_hurt');
  audio.ctx = {};
  audio.encerrado = true;
  audio.playRandomVoice('penguin_hurt');
  audio.encerrado = false;
  audio.playRandomVoice(undefined);
  assert.equal(selected.length, 7);
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
