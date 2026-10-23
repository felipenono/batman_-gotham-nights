import { LevelView } from '../src/views/world/LevelView.js';
import { PlayerController } from '../src/controllers/input/PlayerController.js';
const playerController = new PlayerController();
import test from 'node:test';
import assert from 'node:assert/strict';
import { Input } from '../src/controllers/input/Input.js';
import { Mouse } from '../src/controllers/input/Mouse.js';
import { Camera } from '../src/models/world/Camera.js';
import { Game } from '../src/controllers/GameController.js';
import { Batman } from '../src/models/entities/Batman.js';
import { Batarang } from '../src/models/entities/projectiles/Batarang.js';
import { UmbrellaBurst } from '../src/models/entities/projectiles/UmbrellaBurst.js';
import { Penguin } from '../src/models/entities/villains/Penguin.js';
import { Level } from '../src/models/world/Level.js';
import { Physics } from '../src/models/services/Physics.js';
import { CombatSystem } from '../src/models/services/CombatSystem.js';
import { Spawner } from '../src/models/services/Spawner.js';
import { HUD } from '../src/views/HUD.js';
import { GAME, KEYS, LEVELS, PROJECTILE } from '../src/config/constants.js';
import { CONTROLES_TOQUE } from '../src/config/configuracao.js';

globalThis.window = new EventTarget();
const canvas = new EventTarget();
Object.assign(canvas, {width:900, height:500, getBoundingClientRect: () => ({left:10, top:20, width:450, height:250})});
const key = (key, repeat = false) => ({key, repeat, preventDefault(){}});
const click = (button = 0) => ({button, clientX:300, clientY:150});
const factory = (...args) => new Batarang(...args);

function controls() {
  const input = new Input(), mouse = new Mouse(canvas), player = new Batman(), shots = [];
  const frame = () => {input.update(); mouse.update(100, 10); playerController.handleInput(player,input, mouse, shots, factory); player.update();};
  return {input, mouse, player, shots, frame, destroy() {input.destroy(); mouse.destroy();}};
}

test('held left mouse fires five shots 0.1s apart and repeats after a one-second reload', () => {
  const c=controls();try {
    c.mouse._onMouseDown(click(2));c.frame();assert.equal(c.shots.length,0);
    c.mouse._onMouseDown(click());const frames=[];
    for(let frame=0;frame<109;frame++){const before=c.shots.length;c.frame();if(c.shots.length>before)frames.push(frame);}
    assert.deepEqual(frames,[0,6,12,18,24,84,90,96,102,108]);
    c.mouse._onMouseUp(click());for(let frame=0;frame<60;frame++)c.frame();
    assert.equal(c.shots.length,10);assert.equal(c.player.batarangsRemaining,5);
    c.mouse._onMouseDown(click());c.frame();assert.equal(c.shots.length,11);
    assert.ok(c.shots[0].vx>0&&c.shots[0].vy<0);assert.equal(c.mouse.worldX,680);
  }finally{c.destroy();}
});

test('every attack binding ignores keyboard repeat and hold, including after blur', () => {
  for(const binding of KEYS.SHOOT) {
    const c = controls();
    c.input._onKeyDown(key(binding)); c.frame();
    for(let i=0;i<200;i++) {c.input._onKeyDown(key(binding, true)); c.frame();}
    assert.equal(c.shots.length, 1, binding);
    c.input._onBlur(); c.input._onKeyDown(key(binding, true)); c.frame();
    assert.equal(c.shots.length, 1);
    c.input._onKeyUp(key(binding)); c.input._onKeyDown(key(binding)); c.frame();
    assert.equal(c.shots.length, 2);
    c.destroy();
  }
});

test('five fast manual shots exhaust ammo; destroyed projectiles do not refill or queue shots', () => {
  const c=controls();try {
    for(let i=0;i<5;i++){
      c.input._onKeyDown(key('x'));c.frame();c.input._onKeyUp(key('x'));
      for(let j=0;j<5;j++)c.frame();
    }
    assert.equal(c.player.batarangsRemaining,0);assert.equal(c.shots.length,5);
    c.input._onKeyDown(key('x'));c.frame();assert.equal(c.shots.length,5);
    c.shots[0].alive=false;c.shots.push(new UmbrellaBurst(0,0,8,0));
    for(let i=0;i<49;i++)c.frame();assert.equal(c.player.batarangsRemaining,0);
    for(let i=0;i<5;i++)c.frame();assert.equal(c.player.batarangsRemaining,5);assert.equal(c.shots.length,6);
    c.input._onKeyUp(key('x'));c.input._onKeyDown(key('x'));c.frame();assert.equal(c.player.batarangsRemaining,4);
  }finally{c.destroy();}
});

test('a partial load replenishes completely one second after the most recent shot',()=>{
  const p=new Batman(),shots=[];p.throwBatarang({},false,shots,factory);p.update(6);
  p.throwBatarang({},false,shots,factory);assert.equal(p.batarangsRemaining,3);
  p.update(59);assert.equal(p.batarangsRemaining,3);p.update();assert.equal(p.batarangsRemaining,5);
  assert.ok(shots.every(shot=>shot.alive));p.throwBatarang({},false,shots,factory);
  p.resetFull();assert.equal(p.batarangsRemaining,5);assert.equal(p.batarangReloadTimer,0);
});

test('cooldown rejects rather than queues clicks; blur clears pending input; a short tap survives until update', () => {
  const c = controls();
  c.mouse._onMouseDown(click()); c.mouse._onMouseUp(click()); c.frame();
  c.mouse._onMouseDown(click()); c.mouse._onMouseUp(click()); c.frame();
  for(let i=0;i<30;i++) c.frame();
  assert.equal(c.shots.length, 1);
  c.mouse._onMouseDown(click()); c.mouse._onBlur(); c.frame();
  assert.equal(c.shots.length, 1);
  c.destroy();
});

test('enemy hits, boss hits and projectile expiry do not change stored ammo', () => {
  const combat=new CombatSystem(),player=new Batman({x:0,y:0});player.batarangsRemaining=2;
  for(const bossMode of [false,true]){
    const foe=new Penguin({x:300,y:300});foe.isBoss=bossMode;
    const shots=Array.from({length:5},()=>new Batarang(300,300,0,0));
    combat.update(player,bossMode?[]:[foe],bossMode?foe:null,shots);
    assert.equal(player.batarangsRemaining,2);
  }
  const expired=new Batarang(0,0,1,0);expired.update(140);assert.equal(expired.alive,false);
  assert.equal(player.batarangsRemaining,2);
});

test('Penguin projectiles in phases 2 and 3 follow a moving target with bounded turn and constant speed', () => {
  for(const config of [LEVELS.LEVEL_2, LEVELS.LEVEL_3]) {
    const spawner = new Spawner(); spawner.initLevel(config);
    const enemies = []; spawner.spawnWave(enemies,1100,500);
    const target = new Batman({x:600,y:100});
    const shots = []; enemies.find(e=>e instanceof Penguin).firePenguin(target,shots);
    const p = shots[0]; assert.equal(p.target,target);
    let prior = Math.atan2(p.vy,p.vx);
    for(let i=0;i<PROJECTILE.UMBRELLA_TRACKING_FRAMES;i++) {
      target.y -= 1;
      p.update();
      const heading = Math.atan2(p.vy,p.vx);
      const turn = Math.atan2(Math.sin(heading-prior),Math.cos(heading-prior));
      assert.ok(Math.abs(turn)<=PROJECTILE.UMBRELLA_TURN_RATE+1e-10);
      assert.ok(Math.abs(Math.hypot(p.vx,p.vy)-PROJECTILE.PENGUIN_BOMB_SPEED)<1e-10);
      prior = heading;
    }
    assert.notEqual(p.vy,0);
    const velocity = [p.vx,p.vy]; target.x = -1000; target.y = 900;
    p.update(20); assert.deepEqual([p.vx,p.vy],velocity);
  }
});

test('homing tolerates missing/dead target, angle wrap and fractional tracking time', () => {
  const target = {x:-1000,y:-1,w:0,h:0,alive:true};
  const p = new UmbrellaBurst(0,0,-8,0.001,target);
  p.update(); assert.ok(p.vx<0);
  p.trackingRemaining=0.25; target.y=1000;
  const before=Math.atan2(p.vy,p.vx); p.update(2);
  const delta=Math.atan2(Math.sin(Math.atan2(p.vy,p.vx)-before),Math.cos(Math.atan2(p.vy,p.vx)-before));
  assert.ok(Math.abs(delta)<=PROJECTILE.UMBRELLA_TURN_RATE*0.25+1e-10);
  target.alive=false; const v=[p.vx,p.vy]; p.update(); assert.deepEqual([p.vx,p.vy],v);
  assert.doesNotThrow(()=>new UmbrellaBurst(0,0,8,0).update());
});

// Canvas command recorder captures actual transforms used by the renderers.
function context() {
  const calls=[], stack=[]; let tx=0,ty=0;
  const target={calls, save(){stack.push([tx,ty]);},restore(){[tx,ty]=stack.pop();},
    translate(x,y){tx+=x;ty+=y;calls.push(['translate',x,y]);},
    fillRect(x,y,w,h){calls.push(['fillRect',x+tx,y+ty,w,h]);},
    fillText(text,x,y){calls.push(['text',text,x+tx,y+ty]);},
    createRadialGradient(...args){calls.push(['radial',...args,tx,ty]);return {addColorStop(){}};},
    createLinearGradient(){return {addColorStop(){}};}};
  return new Proxy(target,{get(o,k){return k in o?o[k]:(...args)=>calls.push([k,...args]);}});
}

test('all phases retain landing collisions and render platforms at the same camera offset as actors', () => {
  for(const config of Object.values(LEVELS)) {
    const level=new Level(config), physics=new Physics(), player=new Batman({x:450,y:50});
    for(let i=0;i<90;i++) {physics.update(player,level.platforms,level.width,level.height);player.update();}
    const surface=level.platforms.find(p=>Math.abs(p.y-player.y-player.h)<0.001);
    assert.ok(surface); assert.ok(player.onGround);
    const camera=new Camera(); camera.setBounds(level.width,level.height);camera.follow(player);
    for(let i=0;i<160;i++)camera.update();
    const saved=[camera.x,camera.y]; camera.update(); assert.deepEqual([camera.x,camera.y],saved);
    camera.shakeOffsetX=3;camera.shakeOffsetY=-2;
    const ctx=context(); new LevelView(level).draw(ctx,camera);
    assert.ok(ctx.calls.some(c=>c[0]==='fillRect'&&c[1]===surface.x-camera.renderX&&c[2]===surface.y-camera.renderY));
    const oldX=player.x;player.vx=4.2;
    physics.update(player,level.platforms,level.width,level.height);player.update();
    assert.ok(Math.abs(player.x-oldX-4.2)<1e-9,'one physics integration per update');
  }
});

test('Batman inicia as tres fases centralizado, apoiado e sem deslocamento herdado da camera', () => {
  const game = new Game(Object.assign(canvas, { getContext: () => context() }));
  try {
    for (const level of [1, 2, 3]) {
      game.camera.x = 200; game.camera.y = 100;
      game.camera.shake(8, 12); game.camera.shakeOffsetX = 7; game.camera.shakeOffsetY = -3;
      game.initLevel(level);
      const player = game.player;
      assert.equal(player.x + player.w / 2 - game.camera.renderX, game.width / 2);
      const platform = game.currentLevel.platforms.find(p => p.y === player.y + player.h && p.x <= player.x && p.x + p.w >= player.x + player.w);
      assert.ok(platform);
      assert.ok(Math.abs(player.y + player.h / 2 - game.height / 2) < 50);
      assert.equal(player.onGround, true);
      game.physics.update(player, game.currentLevel.platforms, game.currentLevel.width, game.currentLevel.height);
      assert.equal(player.y + player.h, platform.y);
      game.camera.update();
      assert.equal(player.x + player.w / 2 - game.camera.renderX, game.width / 2);
      assert.equal(game.camera.shakeTimer, 0);
      assert.deepEqual(player.spawnPoint, game.currentLevel.spawnPoint);
    }
  } finally { game.destroy(); }
});

test('stationary architecture stays still while rain, fog and light timers advance', () => {
  for(const config of Object.values(LEVELS)) {
    const level=new Level(config), bg=new LevelView(level).background;
    const camera={renderX:80,renderY:0};
    const a=context(); bg.draw(a,camera);
    for(let i=0;i<30;i++)bg.update();
    const b=context(); bg.draw(b,camera);
    // Solid geometry rectangles are independent of time-based environmental animation.
    assert.deepEqual(a.calls.filter(c=>c[0]==='fillRect'),b.calls.filter(c=>c[0]==='fillRect'));
    if(bg.rainDrops) assert.ok(bg.rainDrops.some(d=>d.y!==0));
    const moved=context();bg.draw(moved,{renderX:160,renderY:0});
    assert.notDeepEqual(a.calls,moved.calls);
  }
});

test('phase 3 halos and surface reflections only exist for enabled, lit fixtures', () => {
  const level=new Level(LEVELS.LEVEL_3), view=new LevelView(level), bg=view.background;
  bg.flickerTimer=0;
  for(const l of bg.lights)l.enabled=false;
  const off=context();view.draw(off,{renderX:120,renderY:3});
  assert.equal(off.calls.filter(c=>c[0]==='radial').length,0);
  const light=bg.lights[0];light.enabled=true;
  const on=context();view.draw(on,{renderX:120,renderY:3});
  const gradients=on.calls.filter(c=>c[0]==='radial'); assert.equal(gradients.length,2);
  assert.equal(gradients[0][1]+gradients[0][7],light.x-120);
  assert.equal(gradients[1][7],light.x-120);
  light.x=510;
  const moved=context();view.draw(moved,{renderX:160,renderY:0});
  const reflection=moved.calls.filter(c=>c[0]==='radial')[1];
  assert.equal(reflection[7],350); assert.equal(reflection[8],163,'reflection on first platform under lamp');
  bg.flickerTimer=Math.PI/2/0.4;
  assert.equal(bg.lightIntensity(light),0);
  const flickered=context();view.draw(flickered,{renderX:0,renderY:0});
  assert.equal(flickered.calls.filter(c=>c[0]==='radial').length,0);
});

test('HUD shows remaining batarangs', () => {
  const ctx=context();HUD.draw(ctx,new Batman(),LEVELS.LEVEL_1,0,null,900,500,false,2);
  assert.ok(ctx.calls.some(c=>c[0]==='text'&&c[1]==='BATARANGUES: 2/5'));
});

test('real game auto fire pauses reload with the game and clears held mouse on pause',()=>{
  const game=new Game(Object.assign(canvas,{getContext:()=>context()}));try{
    game.restartGame();game.spawner.timer=10000;let fired=0;
    game.playSound=type=>{if(type==='throw')fired++;};game.mouse._onMouseDown(click());
    for(let i=0;i<25;i++)game._update(1);
    assert.equal(fired,5);assert.equal(game.player.batarangsRemaining,0);
    const remaining=game.player.batarangReloadTimer;game.togglePause();for(let i=0;i<90;i++)game._update(1);
    assert.equal(game.player.batarangReloadTimer,remaining);game.togglePause();
    for(let i=0;i<60;i++)game._update(1);assert.equal(fired,5);assert.equal(game.player.batarangsRemaining,5);
    game.mouse._onMouseDown(click());game._update(1);assert.equal(fired,6);
  }finally{game.destroy();}
});

import {TouchControls} from '../src/controllers/input/TouchControls.js';

test('controles virtuais combinam movimento, pulo e rajadas sem repetir pulo ao segurar',()=>{
 const c=controls();try{
  c.player.onGround=true;c.mouse.hasMoved=true;c.mouse.worldX=-500;c.mouse.worldY=900;
  c.input.setVirtualAction('RIGHT',true);c.input.setVirtualAction('JUMP',true);c.input.setVirtualAction('SHOOT',true);
  c.frame();assert.equal(c.player.vx,c.player.speed);assert.equal(c.player.vy,c.player.jumpForce);
  assert.equal(c.shots.length,1);assert.equal(c.shots[0].vy,0);assert.ok(c.shots[0].vx>0);
  c.player.vy=-2;c.frame();assert.equal(c.player.vy,-2);
  for(let frame=0;frame<23;frame++)c.frame();assert.equal(c.shots.length,5);
  c.input.setVirtualAction('RIGHT',false);c.input.setVirtualAction('SHOOT',false);c.frame();assert.equal(c.player.vx,0);
 }finally{c.destroy();}
});

test('cada dedo e independente e cancelamento, pausa e blur liberam as acoes virtuais',()=>{
 const input=new Input();const game={input,state:'PLAYING',sceneManager:{transition:null}};
 const controls=new TouchControls(game,null);
 const classes=()=>({add(){},remove(){}});
 const button={dataset:{touchAction:'LEFT'},classList:classes(),setPointerCapture(){}};
 const press=id=>controls.press({pointerId:id,button:0,target:{closest:()=>button},preventDefault(){}});
 try{
  press(1);press(2);assert.equal(input.isDown('LEFT'),true);
  controls.release({pointerId:1});assert.equal(input.isDown('LEFT'),true);
  controls.release({pointerId:2});assert.equal(input.isDown('LEFT'),false);
  press(3);game.state='PAUSED';controls.update();assert.equal(input.isDown('LEFT'),false);
  game.state='PLAYING';controls.update();press(4);window.dispatchEvent(new Event('blur'));assert.equal(input.isDown('LEFT'),false);assert.equal(controls.pointers.size,0);
 }finally{controls.destroy();input.destroy();}
});

test('um toque curto no pulo virtual e preservado ate o proximo quadro',()=>{
 const c=controls();try{
  c.player.onGround=true;c.input.setVirtualAction('JUMP',true);c.input.setVirtualAction('JUMP',false);c.frame();
  assert.equal(c.player.vy,c.player.jumpForce);assert.equal(c.input.isDown('JUMP'),false);
 }finally{c.destroy();}
});

test('toques nos botoes nao movem mira nem interrompem o dedo que mira no canvas',()=>{
 // Este teste vale para o modo de mirar tocando na tela (CONTROLES_TOQUE.mirarTocandoNaTela).
 const original=CONTROLES_TOQUE.mirarTocandoNaTela;CONTROLES_TOQUE.mirarTocandoNaTela=true;
 const c=controls();try{
  const virtual={closest:()=>true};c.mouse.x=12;c.mouse.y=34;
  c.mouse._onTouchStart({target:virtual,touches:[{clientX:80,clientY:90}]});assert.equal(c.mouse.isDown,false);
  const touch={identifier:2,clientX:200,clientY:130};c.mouse._onTouchStart({target:canvas,touches:[touch],changedTouches:[touch]});
  const aim=[c.mouse.x,c.mouse.y];c.mouse._onTouchMove({target:virtual,touches:[{identifier:1,clientX:30,clientY:40},touch]});
  assert.deepEqual([c.mouse.x,c.mouse.y],aim);
  c.mouse._onTouchEnd({target:virtual,touches:[touch]});assert.equal(c.mouse.isDown,true);
  c.mouse._onTouchEnd({target:canvas,touches:[]});assert.equal(c.mouse.isDown,false);
 }finally{c.destroy();CONTROLES_TOQUE.mirarTocandoNaTela=original;}
});
