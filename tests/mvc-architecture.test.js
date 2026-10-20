import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { GameModel } from '../src/models/GameModel.js';
import { GameController } from '../src/controllers/GameController.js';
import { EntityRenderer } from '../src/views/renderers/EntityRenderer.js';
import { Platform } from '../src/models/entities/Platform.js';
import { Batarang } from '../src/models/entities/projectiles/Batarang.js';
import { criarRegistroCanvas } from './render-support.js';

const root = path.resolve(import.meta.dirname,'../src');
function sources(directory) {
  return readdirSync(directory,{withFileTypes:true}).flatMap(entry=>{
    const file=path.join(directory,entry.name);
    return entry.isDirectory()?sources(file):file.endsWith('.js')?[file]:[];
  });
}
function imports(file) {
  return [...readFileSync(file,'utf8').matchAll(/(?:from\s*|import\s*\()['"]([^'"]+)['"]/g)]
    .map(match=>path.resolve(path.dirname(file),match[1]));
}

test('models depend only on models/config and contain no DOM or Canvas rendering',()=>{
  for(const file of sources(path.join(root,'models'))) {
    for(const dependency of imports(file)) {
      assert.ok(dependency.startsWith(path.join(root,'models')+path.sep)||dependency.startsWith(path.join(root,'config')+path.sep),file+' -> '+dependency);
    }
    const code=readFileSync(file,'utf8').replace(/\/\*[\s\S]*?\*\//g,'').replace(/^\s*\/\/.*$/gm,'');
    assert.doesNotMatch(code,/\b(?:window|document)\s*[?.]/,file);
    assert.doesNotMatch(code,/\b(?:getContext|addEventListener|fillRect|drawImage)\s*\(/,file);
    assert.doesNotMatch(code,/^\s*draw(?:Sprite)?\s*\(/m,file);
  }
});

test('views do not import controllers',()=>{
  for(const file of sources(path.join(root,'views')))
    for(const dependency of imports(file))assert.ok(!dependency.startsWith(path.join(root,'controllers')+path.sep),file);
});

test('game model and collision rules work without browser globals',()=>{
  const previousWindow=globalThis.window,previousDocument=globalThis.document;
  try {
    delete globalThis.window;delete globalThis.document;
    const model=new GameModel();const level=model.levelManager.loadLevel(1);
    model.spawner.initLevel(level.config);model.spawner.spawnWave(model.enemies,level.width,level.height);
    assert.ok(model.enemies.length>0);assert.equal(model.state,'MENU');
    const body=model.enemies[0];body.x=450;body.y=10;
    for(let i=0;i<100;i++)model.physics.update(body,level.platforms,level.width,level.height);
    assert.equal(body.onGround,true);
  } finally {globalThis.window=previousWindow;globalThis.document=previousDocument;}
});

test('rendering consumes model data without advancing physics, score or animation',()=>{
  const previous=globalThis.window;globalThis.window=new EventTarget();
  const {contexto}=criarRegistroCanvas();
  const canvas=Object.assign(new EventTarget(),{getContext:()=>contexto,getBoundingClientRect:()=>({left:0,top:0,width:1920,height:1080})});
  const controller=new GameController(canvas);
  try {
    controller.restartGame(3);controller.projectiles=[new Batarang(200,100,3,1)];
    const snapshot=()=>JSON.stringify({state:controller.model.state,
      player:{x:controller.player.x,y:controller.player.y,hp:controller.player.hp,cooldown:controller.player.shootCooldown,animation:controller.player.animator.time},
      projectiles:controller.projectiles.map(p=>({x:p.x,y:p.y,life:p.lifetime})),
      score:controller.scoreManager.score,time:controller.scoreManager.elapsedSeconds});
    const before=snapshot();controller._render();controller._render();assert.equal(snapshot(),before);
    controller._update(1);assert.notEqual(snapshot(),before);
  } finally {controller.destroy();globalThis.window=previous;}
});

test('entity view keeps inherited platform rendering out of the model',()=>{
  class ExtendedPlatform extends Platform {}
  const platform=new ExtendedPlatform({x:100,y:220,w:160,h:24});
  const {contexto,operacoes}=criarRegistroCanvas();new EntityRenderer().draw(contexto,platform);
  assert.equal(platform.draw,undefined);assert.ok(operacoes.some(operation=>operation[0]==='fillRect'));
  assert.deepEqual([platform.x,platform.y,platform.w,platform.h],[100,220,160,24]);
});
