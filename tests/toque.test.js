import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CONTROLES_TOQUE } from '../src/config/configuracao.js';
import { Mouse } from '../src/controllers/input/Mouse.js';

globalThis.window ??= new EventTarget();
const canvas = Object.assign(new EventTarget(), { width: 900, height: 500, getBoundingClientRect: () => ({ left: 0, top: 0, width: 900, height: 500 }) });

// Tocar no cenário mira e atira naquele ponto; o clique "falso" que o navegador cria depois é ignorado.
test('tocar no cenário mira e atira uma vez só', () => {
  assert.equal(CONTROLES_TOQUE.mirarTocandoNaTela, true);
  const mouse = new Mouse(canvas);
  try {
    const toque = { identifier: 1, clientX: 300, clientY: 200 };
    mouse._onTouchStart({ target: canvas, touches: [toque], changedTouches: [toque] });
    mouse.update();
    assert.equal(mouse.isDown, true);
    assert.equal(mouse.justClicked, true);
    assert.equal(mouse.x, 300); assert.equal(mouse.y, 200);
    mouse._onTouchEnd({ target: canvas, touches: [] });
    mouse._onMouseDown({ button: 0, clientX: 300, clientY: 200, target: canvas });
    mouse.update();
    assert.equal(mouse.justClicked, false, 'clique falso ignorado');
  } finally { mouse.destroy(); }
});

// Com a mira por toque desligada, tocar no cenário não atira, nem pelo clique "falso" que vem depois.
test('tocar no cenário não atira quando a mira por toque está desligada', () => {
  const original = CONTROLES_TOQUE.mirarTocandoNaTela; CONTROLES_TOQUE.mirarTocandoNaTela = false;
  const mouse = new Mouse(canvas);
  try {
    const toque = { identifier: 1, clientX: 300, clientY: 200 };
    mouse._onTouchStart({ target: canvas, touches: [toque], changedTouches: [toque] });
    assert.equal(mouse.isDown, false);
    mouse._onMouseDown({ button: 0, clientX: 300, clientY: 200, target: canvas });
    mouse.update();
    assert.equal(mouse.isDown, false);
    assert.equal(mouse.justClicked, false);
  } finally { mouse.destroy(); CONTROLES_TOQUE.mirarTocandoNaTela = original; }
});

// O mouse de verdade (sem toque antes) continua atirando normalmente.
test('clique de mouse sem toque continua funcionando', () => {
  const mouse = new Mouse(canvas);
  try {
    mouse._onMouseDown({ button: 0, clientX: 300, clientY: 200, target: canvas });
    mouse.update();
    assert.equal(mouse.justClicked, true);
  } finally { mouse.destroy(); }
});

// A tela tem um botão PULAR ligado à ação de pulo.
test('controles de toque têm botão de pulo', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(html, /data-touch-action="JUMP"[^>]*>PULAR</);
  assert.match(html, /data-touch-action="SHOOT"[^>]*>ATIRAR</);
});
