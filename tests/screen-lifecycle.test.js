// Este arquivo confere o descarte de eventos e a sincronização dos controles compartilhados.
import test from 'node:test';
import assert from 'node:assert/strict';
import { AudioManager } from '../src/audio/AudioManager.js';
import { ScreenAudioControls } from '../src/ui/ScreenAudioControls.js';
import { LOBBY } from '../src/config/configuracao.js';

test('descartar áudio remove os gestos pendentes e impede recriar o contexto', () => {
  const janelaAnterior = globalThis.window;
  const janela = new EventTarget();
  let criacoes = 0;
  janela.AudioContext = class { constructor() { criacoes += 1; } };
  globalThis.window = janela;
  try {
    const audio = new AudioManager();
    audio.destroy();
    for (const tipo of ['keydown', 'mousedown', 'touchstart']) janela.dispatchEvent(new Event(tipo));
    audio._initContext();
    assert.equal(criacoes, 0);
    assert.equal(audio.musicTimer, null);
  } finally {
    globalThis.window = janelaAnterior;
  }
});

test('controles refletem mudo externo, ajustam volume e removem eventos ao sair', () => {
  const botao = new EventTarget();
  const atributos = new Map();
  let alteracoes = 0;
  botao.setAttribute = (nome, valor) => { atributos.set(nome, valor); alteracoes += 1; };
  const entrada = new EventTarget();
  entrada.value = '0.25';
  const legenda = { textContent: '' };
  const elementos = { '.mute-button': botao, '.audio-caption': legenda, input: entrada };
  const raiz = { querySelector: seletor => elementos[seletor] };
  const audio = { unlock() {}, setVolume(valor) { this.volume = valor; } };
  const som = { isMuted: false, toggleMute() { this.isMuted = !this.isMuted; } };
  const controles = new ScreenAudioControls(raiz, audio, som, LOBBY.menuLabels);
  controles.atualizar();
  controles.atualizar();
  assert.equal(alteracoes, 2, 'não reescreve atributos sem mudança de estado');
  som.isMuted = true;
  controles.atualizar();
  assert.equal(atributos.get('aria-pressed'), 'true');
  assert.equal(legenda.textContent, LOBBY.menuLabels.muted);
  entrada.dispatchEvent(new Event('input'));
  assert.equal(audio.volume, 0.25);
  botao.dispatchEvent(new Event('click'));
  assert.equal(som.isMuted, false);
  controles.destroy();
  botao.dispatchEvent(new Event('click'));
  assert.equal(som.isMuted, false);
});
