import test from 'node:test';
import assert from 'node:assert/strict';
import { BatSignal, moonLayout, symbolBounds, prepareSilhouette, visibleSky } from '../src/views/scenes/BatSignal.js';
import { LOBBY, assetURL } from '../src/config/lobby.js';
import { GothamBackdrop } from '../src/views/scenes/GothamBackdrop.js';
import { CENARIOS } from '../src/config/configuracao.js';
import { Level1Background } from '../src/views/world/Level1Background.js';

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

// A lente fica sobre a reta refletor -> centro da lua, e o feixe, o refletor e a lua usam a MESMA lua.
test('refletor, lente, feixe, lua e símbolo saem da mesma referência em qualquer tamanho', () => {
  const contexto = new Proxy({ globalAlpha: 1 }, { get: (alvo, chave) => chave in alvo ? alvo[chave] : () => ({ addColorStop() {} }), set: (alvo, chave, valor) => { alvo[chave] = valor; return true; } });
  for (const [largura, altura, aspecto] of [[900, 500, 16 / 9], [1920, 1080, 16 / 9], [900, 500, 390 / 844], [900, 500, 2560 / 1080]]) {
    const cenario = new GothamBackdrop();
    const sinal = cenario.batSignal, chamadas = {};
    for (const nome of ['drawBeam', 'drawMoon', 'drawHalo', 'drawReflector']) {
      const original = sinal[nome].bind(sinal);
      sinal[nome] = (...argumentos) => { chamadas[nome] = argumentos; return original(...argumentos); };
    }
    cenario.draw(contexto, largura, altura, 5000, 0, true, aspecto);
    const lua = moonLayout(largura, altura, sinal.config, aspecto);
    assert.deepEqual(chamadas.drawMoon[1], lua, 'lua e símbolo no centro calculado');
    assert.deepEqual(chamadas.drawHalo[1], lua, 'halo no mesmo centro');
    assert.deepEqual(chamadas.drawBeam[1], lua, 'feixe termina no centro da lua');
    // O refletor (na escala base) mira a mesma lua, só convertida de unidade.
    const luaBase = chamadas.drawReflector[2];
    assert.ok(Math.abs(luaBase.x * largura / LOBBY.base.width - lua.x) < 1e-9);
    assert.ok(Math.abs(luaBase.y * altura / LOBBY.base.height - lua.y) < 1e-9);
    // A lente do feixe é a frente do refletor, sobre a reta até o centro da lua.
    const origemBase = chamadas.drawReflector[1], lente = chamadas.drawBeam[7];
    const esperada = sinal.lensPoint(origemBase, luaBase, 1);
    assert.ok(Math.abs(esperada.x * largura / LOBBY.base.width - lente.x) < 1e-9);
    assert.ok(Math.abs(esperada.y * altura / LOBBY.base.height - lente.y) < 1e-9);
    const origem = chamadas.drawBeam[2];
    const cruzado = (lente.x - origem.x) * (lua.y - origem.y) - (lente.y - origem.y) * (lua.x - origem.x);
    assert.ok(Math.abs(cruzado) < 1e-6 * Math.hypot(lua.x - origem.x, lua.y - origem.y) * LOBBY.batSignal.lensOffset, 'lente alinhada ao feixe');
  }
});

test('na Fase 1 a lua acompanha a câmera e o feixe e o refletor apontam para ela', () => {
  const fundo = new Level1Background(1100, 500), sinal = fundo.layoutDoSinal(200);
  assert.equal(sinal.x, CENARIOS.fase1.sinal.x - 200 * CENARIOS.fase1.parallax.sinal);
  assert.equal(sinal.y, CENARIOS.fase1.sinal.y);
  assert.equal(sinal.radius, CENARIOS.fase1.sinal.raio);
  // A lua não encosta na plataforma mais alta da fase (y = 160), para não apagar sua borda de pisar.
  assert.ok(sinal.y + sinal.radius < 160);
});
