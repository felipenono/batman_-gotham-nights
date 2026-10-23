import test from 'node:test';
import assert from 'node:assert/strict';
import { Input } from '../src/controllers/input/Input.js';
import { TouchControls } from '../src/controllers/input/TouchControls.js';

globalThis.window = new EventTarget();

function element(dataset = {}) {
  const el = new EventTarget();
  const classes = new Set(), properties = new Map(), attributes = new Map(), captures = new Set();
  return Object.assign(el, {
    dataset, hidden: false,
    classList: { add: value => classes.add(value), remove: value => classes.delete(value) },
    style: { setProperty: (key, value) => properties.set(key, value), getPropertyValue: key => properties.get(key) },
    setAttribute: (key, value) => attributes.set(key, value), getAttribute: key => attributes.get(key),
    getBoundingClientRect: () => ({ left: 10, top: 20, width: 100, height: 100 }),
    setPointerCapture: id => captures.add(id), hasPointerCapture: id => captures.has(id), releasePointerCapture: id => captures.delete(id)
  });
}

const pointer = (id, target, x = 60, y = 70) => ({ pointerId: id, button: 0, target: { closest: () => target }, clientX: x, clientY: y, preventDefault() {} });

test('joystick muda de direcao pelo arraste, tem centro neutro e limita o alcance visual', () => {
  const input = new Input(), game = { input, state: 'PLAYING' }, control = new TouchControls(game, null), stick = element();
  try {
    control.press(pointer(1, stick));
    assert.equal(input.isDown('LEFT'), false);
    assert.equal(input.isDown('RIGHT'), false);
    control.move(pointer(1, stick, 20, 70));
    assert.equal(input.isDown('LEFT'), true);
    control.move(pointer(1, stick, 1000, -1000));
    assert.equal(input.isDown('LEFT'), false);
    assert.equal(input.isDown('RIGHT'), true);
    assert.ok(Math.hypot(parseFloat(stick.style.getPropertyValue('--stick-x')), parseFloat(stick.style.getPropertyValue('--stick-y'))) <= 29.00001);
    control.move(pointer(1, stick, 61, 70));
    assert.equal(input.isDown('RIGHT'), false);
    control.release({ pointerId: 1 });
    assert.equal(stick.style.getPropertyValue('--stick-x'), '0px');
    assert.equal(stick.hasPointerCapture(1), false);
  } finally { control.destroy(); input.destroy(); }
});

test('outro dedo nao toma o joystick e soltar/cancelar nao interrompe o tiro independente', () => {
  const input = new Input(), game = { input, state: 'PLAYING' }, control = new TouchControls(game, null), stick = element(), fire = element({ touchAction: 'SHOOT' });
  try {
    control.press(pointer(1, stick, 95));
    control.press(pointer(2, fire));
    control.press(pointer(3, stick, 20));
    assert.equal(control.pointers.has(3), false);
    control.release({ pointerId: 3 });
    assert.equal(input.isDown('RIGHT'), true);
    control.release({ pointerId: 1 });
    assert.equal(input.isDown('RIGHT'), false);
    assert.equal(input.isDown('SHOOT'), true);
    control.press(pointer(4, stick, 20));
    game.state = 'PAUSED'; control.update();
    assert.equal(input.isDown('LEFT'), false);
    assert.equal(input.isDown('SHOOT'), false);
    assert.equal(control.pointers.size, 0);
    assert.equal(stick.style.getPropertyValue('--stick-x'), '0px');
    game.state = 'PLAYING'; control.update();
    control.press(pointer(5, stick, 95));
    window.dispatchEvent(new Event('blur'));
    assert.equal(input.isDown('RIGHT'), false);
    assert.equal(stick.style.getPropertyValue('--stick-x'), '0px');
  } finally { control.destroy(); input.destroy(); }
});

test('joystick pula para cima e na diagonal, sem repetir ao segurar, e preserva o tiro', () => {
  const input = new Input(), game = { input, state: 'PLAYING' }, control = new TouchControls(game, null), stick = element(), fire = element({ touchAction: 'SHOOT' });
  try {
    control.press(pointer(1, stick));
    control.press(pointer(2, fire));
    control.move(pointer(1, stick, 60, 30)); input.update();
    assert.equal(input.justPressed('JUMP'), true);
    assert.equal(input.isDown('LEFT'), false);
    assert.equal(input.isDown('RIGHT'), false);
    input.update(); control.move(pointer(1, stick, 60, 20)); input.update();
    assert.equal(input.justPressed('JUMP'), false);
    control.move(pointer(1, stick, 95, 30)); input.update();
    assert.equal(input.isDown('RIGHT'), true);
    assert.equal(input.isDown('JUMP'), true);
    assert.equal(input.justPressed('JUMP'), false);
    assert.equal(input.isDown('SHOOT'), true);
    control.move(pointer(1, stick)); input.update();
    assert.equal(input.isDown('RIGHT'), false);
    assert.equal(input.isDown('JUMP'), false);
    control.move(pointer(1, stick, 20, 30)); input.update();
    assert.equal(input.isDown('LEFT'), true);
    assert.equal(input.justPressed('JUMP'), true);
    control.release({ pointerId: 1 });
    assert.equal(input.isDown('LEFT'), false);
    assert.equal(input.isDown('JUMP'), false);
    assert.equal(input.isDown('SHOOT'), true);
  } finally { control.destroy(); input.destroy(); }
});

test('tela cheia entra, sai, acompanha a saida externa e informa indisponibilidade sem travar', async () => {
  const originalDocument = globalThis.document;
  const doc = new EventTarget(), button = element(), status = element();
  doc.getElementById = id => id === 'fullscreen-button' ? button : status;
  let entered = 0, exited = 0;
  doc.documentElement = { requestFullscreen() { assert.equal(this, doc.documentElement); entered++; doc.fullscreenElement = this; doc.dispatchEvent(new Event('fullscreenchange')); } };
  doc.exitFullscreen = function () { assert.equal(this, doc); exited++; doc.fullscreenElement = null; doc.dispatchEvent(new Event('fullscreenchange')); };
  globalThis.document = doc;
  const input = new Input(), control = new TouchControls({ input, state: 'PLAYING' }, null);
  try {
    await control.toggleFullscreen();
    assert.equal(entered, 1); assert.equal(button.getAttribute('aria-pressed'), 'true');
    await control.toggleFullscreen();
    assert.equal(exited, 1); assert.equal(button.getAttribute('aria-pressed'), 'false');
    await control.toggleFullscreen(); doc.fullscreenElement = null; doc.dispatchEvent(new Event('fullscreenchange'));
    assert.equal(button.getAttribute('aria-label'), 'Entrar em tela cheia');
    doc.documentElement.requestFullscreen = () => Promise.reject(new Error('Not allowed'));
    await control.toggleFullscreen();
    assert.equal(status.hidden, false); assert.match(status.textContent, /não permite tela cheia/);
    delete doc.documentElement.requestFullscreen;
    await control.toggleFullscreen();
    assert.equal(status.hidden, false);
  } finally { control.destroy(); input.destroy(); globalThis.document = originalDocument; }
});

test('gestos de zoom sao bloqueados no toque sem impedir movimento de um dedo; destroy remove bloqueio', () => {
  const originalDocument = globalThis.document, doc = new EventTarget();
  doc.getElementById = () => null; globalThis.document = doc;
  const input = new Input(), control = new TouchControls({ input, state: 'PLAYING' }, null);
  const gesture = (type, count) => { const event = new Event(type, { cancelable: true }); if (count !== undefined) event.touches = Array(count).fill({}); doc.dispatchEvent(event); return event.defaultPrevented; };
  try {
    control.media = { matches: true };
    assert.equal(gesture('gesturestart'), true);
    assert.equal(gesture('gesturechange'), true);
    assert.equal(gesture('dblclick'), true);
    assert.equal(gesture('touchmove', 2), true);
    assert.equal(gesture('touchmove', 1), false);
    control.media.matches = false;
    assert.equal(gesture('dblclick'), false);
    control.destroy();
    assert.equal(gesture('gesturestart'), false);
  } finally { control.destroy(); input.destroy(); globalThis.document = originalDocument; }
});
