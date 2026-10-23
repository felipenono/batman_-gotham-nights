import { EntityRenderer } from '../src/views/renderers/EntityRenderer.js';
// Este arquivo compara desenhos com registros da versão anterior à refatoração.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { Level1Background } from "../src/views/world/Level1Background.js";
import { Level2Background } from "../src/views/world/Level2Background.js";
import { Level3Background } from "../src/views/world/Level3Background.js";
import { Platform } from "../src/models/entities/Platform.js";
import { SPRITE_ART } from "../src/views/sprites/SpriteRenderer.js";
import { criarRegistroCanvas, usarSemente, poseDeTeste } from "./render-support.js";

const referencias = JSON.parse(readFileSync(new URL("./render-baseline.json", import.meta.url), "utf8"));

// Compara ordem, coordenadas e estilos; não substitui a inspeção dos pixels no navegador.
function conferirDesenho(chave, desenhar) {
  const restaurarSorteios = usarSemente();
  try {
    const { contexto, operacoes } = criarRegistroCanvas();
    desenhar(contexto);
    const assinatura = createHash("sha256").update(JSON.stringify(operacoes)).digest("hex");
    assert.equal(assinatura, referencias[chave], chave);
  } finally {
    restaurarSorteios();
  }
}

for (const Fundo of [Level1Background, Level2Background, Level3Background]) {
  for (const tempo of [0, 60]) {
    const chave = `${Fundo.name}:${tempo}`;
    test(`preserva o desenho de ${chave}`, () => conferirDesenho(chave, contexto => {
      const fundo = new Fundo(1100, 500);
      fundo.update(tempo);
      fundo.draw(contexto, { renderX: 137, renderY: 0 });
    }));
  }
}

for (const tema of ["rooftop", "ac_unit", "pipe", "casino", "asylum"]) {
  test(`preserva a plataforma ${tema}`, () => conferirDesenho(`Platform:${tema}`, contexto => {
    new EntityRenderer().draw(contexto, new Platform({ x: 140, y: 220, w: 160, h: 24, theme: tema }));
  }));
}

for (const [nome, arte] of Object.entries(SPRITE_ART)) {
  test(`preserva o personagem ${nome}`, () => conferirDesenho(`Sprite:${nome}`, contexto => {
    arte.paint.call(poseDeTeste, contexto);
  }));
}

test('cassino centraliza os losangos na altura e distribui margens iguais',()=>{
 for(const [w,h] of [[150,18],[240,24],[1100,60]]){
  const {contexto,operacoes}=criarRegistroCanvas();
  new EntityRenderer().draw(contexto,new Platform({x:75,y:200,w,h,theme:'casino'}));
  const tops=operacoes.filter(op=>op[0]==='moveTo');
  const centers=operacoes.filter(op=>op[0]==='lineTo').filter((_,index)=>index%3===0);
  assert.ok(tops.length>0);
  assert.ok(Math.abs((tops[0][1]-75)-(75+w-tops.at(-1)[1]))<1e-9);
  for(const center of centers)assert.equal(center[2],200+(h+1)/2);
 }
});

test('fase 2 nao desenha mais a placa nem o texto do letreiro',()=>{
 const {contexto,operacoes}=criarRegistroCanvas();new Level2Background(1100,500).draw(contexto);
 assert.ok(!operacoes.some(op=>op[0]==='fillText'&&String(op[1]).includes('ICEBERG')));
 assert.ok(!operacoes.some(op=>op[0]==='fillRect'&&op[1]===410&&op[2]===30&&op[3]===280&&op[4]===40));
});
