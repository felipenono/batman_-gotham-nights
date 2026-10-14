import test from 'node:test';
import assert from 'node:assert/strict';
import { BatSignal, moonLayout, symbolBounds, prepareSilhouette, visibleSky } from '../src/scenes/BatSignal.js';
import { LOBBY, assetURL } from '../src/config/lobby.js';

test('lua e silhueta compartilham o centro em paisagem, retrato e ultrawide', () => {
  for (const [width, height] of [[1920,1080],[1280,720],[390,844],[2560,1080],[900,500]]) {
    const moon = moonLayout(width, height);
    assert.equal(moon.x, width * LOBBY.batSignal.moon.x);
    assert.equal(moon.y, height * LOBBY.batSignal.moon.y);
    for (const aspect of [0.6, 1, 2.8, 5]) {
      const box = symbolBounds(moon, aspect);
      assert.ok(Math.abs(box.x + box.width / 2 - moon.x) < 1e-9);
      assert.ok(Math.abs(box.y + box.height / 2 - moon.y) < 1e-9);
      assert.ok(Math.hypot(box.width, box.height) <= moon.radius * 2);
      assert.ok(Math.abs(box.width / box.height - aspect) < 1e-9);
    }
  }
});

test('o recorte cover do celular conserva lua e centro do símbolo dentro do céu visível', () => {
  const aspect = 390 / 844;
  const sky = visibleSky(1920, 1080, aspect);
  const moon = moonLayout(1920, 1080, LOBBY.batSignal, aspect);
  const box = symbolBounds(moon, 2.8);
  assert.ok(moon.x - moon.radius > sky.x);
  assert.ok(moon.x + moon.radius < sky.x + sky.width);
  assert.ok(moon.y - moon.radius > sky.y);
  assert.equal(box.x + box.width / 2, moon.x);
  assert.equal(box.y + box.height / 2, moon.y);
});

test('a máscara de imagem opaca remove o fundo, preserva o recorte e usa preto sólido', () => {
  const pixels = new Uint8ClampedArray([
    255,255,255,255, 230,230,230,255, 255,255,255,255,
    255,255,255,255, 0,0,0,255, 20,20,20,255,
  ]);
  const bounds = prepareSilhouette(pixels, 3, 2);
  assert.deepEqual(bounds, {x:1,y:1,width:2,height:1});
  assert.deepEqual([...pixels].filter((_,i)=>i%4===3), [0,0,0,0,255,255]);
  assert.ok([...pixels].filter((_,i)=>i%4!==3).every(value=>value===0));
});

test('PNG transparente conserva alfa e vazios internos, independentemente da cor', () => {
  const pixels = new Uint8ClampedArray([
    255,255,255,0, 240,210,80,255, 255,255,255,80,
    0,0,0,255, 0,0,0,0, 240,210,80,255,
  ]);
  const alphas = [...pixels].filter((_,i)=>i%4===3);
  prepareSilhouette(pixels, 3, 2);
  assert.deepEqual([...pixels].filter((_,i)=>i%4===3), alphas);
  assert.ok([...pixels].filter((_,i)=>i%4!==3).every(value=>value===0));
  assert.equal(prepareSilhouette(new Uint8ClampedArray([255,255,255,255]), 1, 1), null);
});

test('fade reinicia na entrada e flicker permanece suave e limitado', () => {
  const signal = new BatSignal();
  signal.enter(10000);
  assert.equal(signal.intensity(10000).light, 0);
  assert.ok(signal.intensity(11200).light > 0);
  const { intensity, flickerAmount } = LOBBY.batSignal;
  let previous = signal.intensity(12400).light;
  for (let t = 12400; t < 72400; t += 16) {
    const light = signal.intensity(t).light;
    assert.ok(light >= intensity * (1 - flickerAmount) && light <= intensity * (1 + flickerAmount));
    assert.ok(Math.abs(light - previous) < 0.005);
    previous = light;
  }
  assert.equal(signal.intensity(20000, true).light, intensity);
  signal.enter(80000);
  assert.equal(signal.intensity(80000).light, 0);
});

test('carregamento aponta para a mesma constante da logo e falha sem quebrar o sinal', () => {
  const OriginalImage = globalThis.Image;
  const originalPath = LOBBY.assets.logo;
  const images = [];
  globalThis.Image = class { constructor() { images.push(this); } };
  try {
    const signal = new BatSignal();
    assert.equal(images[0].src, assetURL(LOBBY.assets.logo));
    images[0].onerror();
    assert.equal(signal.mask, null);
    signal.enter(); assert.equal(images.length, 1, 'não recarrega o mesmo asset a cada entrada');
    LOBBY.assets.logo = 'assets/images/nova-logo.png';
    signal.enter(); assert.equal(images[1].src, assetURL(LOBBY.assets.logo));
    images[1].onerror(); assert.equal(signal.mask, null);
    assert.doesNotThrow(() => signal.intensity(5000));
  } finally {
    LOBBY.assets.logo = originalPath;
    if (OriginalImage === undefined) delete globalThis.Image;
    else globalThis.Image = OriginalImage;
  }
});
