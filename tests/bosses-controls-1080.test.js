import test from 'node:test';
import assert from 'node:assert/strict';
import { Viewport } from '../src/core/Viewport.js';
import { Mouse } from '../src/core/Mouse.js';
import { Input } from '../src/core/Input.js';
import { Game } from '../src/core/Game.js';
import { Batman } from '../src/entities/Batman.js';
import { JokerBoss } from '../src/entities/villains/JokerBoss.js';
import { Scarecrow } from '../src/entities/villains/Scarecrow.js';
import { BossManager } from '../src/systems/BossManager.js';
import { Physics } from '../src/systems/Physics.js';
import { Level } from '../src/world/Level.js';
import { GAME, LEVELS, LIGHTING } from '../src/utils/constants.js';

globalThis.window = new EventTarget();
const key = (value, code='') => ({key:value,code,preventDefault(){}});
const canvas = () => Object.assign(new EventTarget(),{
 width:1920,height:1080,
 getBoundingClientRect:()=>({left:20,top:30,width:960,height:540}),
 getContext:()=>new Proxy({createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}})}, {get:(object,k)=>object[k]||(()=>{})}),
});

test('1080p uses uniform scale and mouse aim inverts the render transform at any CSS size',()=>{
 const viewport = new Viewport();
 for(const [w,h] of [[1920,1080],[1280,720],[900,500]]){
  const fit = viewport.fit(w,h);
  assert.ok(fit.x>=0&&fit.y>=0);
  const logical={x:325,y:175};
  const point=viewport.toGame(logical.x*fit.scale+fit.x,logical.y*fit.scale+fit.y,w,h);
  assert.ok(Math.abs(point.x-logical.x)<1e-9&&Math.abs(point.y-logical.y)<1e-9);
 }
 const mouse=new Mouse(canvas());mouse._onMouseMove({clientX:500,clientY:300});mouse.update(100,0);
 assert.ok(Math.abs(mouse.worldX-550)<1e-9);assert.ok(Math.abs(mouse.worldY-250)<1e-9);
 mouse._onMouseDown({button:0,clientX:3,clientY:5});mouse.update();assert.equal(mouse.justClicked,false);
 mouse.destroy();
});

test('movement releases immediately, including uppercase keydown and lowercase keyup',()=>{
 const input=new Input(),player=new Batman();const mouse={};
 input._onKeyDown(key('D','KeyD'));input.update();player.handleInput(input,mouse,[],()=>{});
 assert.equal(player.vx,player.speed);
 input._onKeyUp(key('d','KeyD'));input.update();player.handleInput(input,mouse,[],()=>{});
 assert.equal(player.vx,0);assert.equal(input.anyKeyDown,false);
 input._onKeyDown(key('a'));input._onKeyDown(key('d'));input.update();player.handleInput(input,mouse,[],()=>{});
 assert.equal(player.vx,0);input.destroy();
});

test('blur and visibility changes clear pending keys and mouse clicks',()=>{
 globalThis.document=Object.assign(new EventTarget(),{getElementById(){return null;}});
 const input=new Input(),mouse=new Mouse(canvas());
 input._onKeyDown(key('d'));mouse._onMouseDown({button:0,clientX:300,clientY:300});
 document.dispatchEvent(new Event('visibilitychange'));input.update();mouse.update();
 assert.equal(input.anyKeyDown,false);assert.equal(input.anyKeyPressed,false);assert.equal(mouse.justClicked,false);
 input.destroy();mouse.destroy();delete globalThis.document;
});

test('jump accepts a press shortly before landing and shortly after leaving a ledge, without double jump',()=>{
 const input=new Input(),p=new Batman(),mouse={};
 p.onGround=false;input._onKeyDown(key('w'));input.update();p.handleInput(input,mouse,[],()=>{});
 assert.equal(p.vy,0);input._onKeyUp(key('w'));input.update();p.onGround=true;
 p.handleInput(input,mouse,[],()=>{});assert.equal(p.vy,p.jumpForce);
 input._onKeyDown(key('w'));input.update();p.vy=-2;p.handleInput(input,mouse,[],()=>{});
 assert.equal(p.vy,-2,'a second press in flight must not jump again');
 input._onBlur();p.onGround=true;input.update();p.handleInput(input,mouse,[],()=>{});
 p.jumpBufferTimer=0;p.onGround=false;input._onKeyDown(key('w'));input.update();p.handleInput(input,mouse,[],()=>{});
 assert.equal(p.vy,p.jumpForce);input.destroy();
});

test('losing focus also discards a buffered jump before landing',()=>{
 const input=new Input(),p=new Batman();p.onGround=false;
 input._onKeyDown(key('w'));input.update();p.handleInput(input,{},[],()=>{});
 assert.ok(p.jumpBufferTimer>0);
 input._onBlur();input.update();p.onGround=true;p.handleInput(input,{},[],()=>{});
 assert.equal(p.vy,0);assert.equal(p.jumpBufferTimer,0);input.destroy();
});

test('Scarecrow moves through Physics, selects walking animation and retains floor collisions',()=>{
 const boss=new Scarecrow({x:700,y:330}),p=new Batman({x:150,y:368}),physics=new Physics(),level=new Level(LEVELS.LEVEL_1);
 const startX=boss.x;const states=new Set();
 for(let i=0;i<150;i++){
  boss.updateAI(p,[],()=>{},()=>{});physics.update(boss,level.platforms,level.width,level.height);boss.update();
  states.add(boss.animator.state);
 }
 assert.ok(boss.x<startX-60);assert.ok(states.has('walk'));assert.ok(boss.onGround);
 assert.ok(level.platforms.some(surface=>Math.abs(surface.y-boss.y-boss.h)<1e-8));
});

test('Coringa boss walks, attacks and hands the first phase to Scarecrow before completion',()=>{
 const manager=new BossManager();manager.spawnBoss(LEVELS.LEVEL_1,1100,500);
 assert.ok(manager.boss instanceof JokerBoss&&manager.boss.isBoss);
 const player=new Batman({x:100,y:350}),shots=[];manager.boss.onGround=true;
 for(let i=0;i<220;i++)manager.boss.updateAI(player,shots,null,()=>{});
 assert.ok(manager.boss.vx!==0&&shots.length>1);
 let complete=0,changes=0;manager.boss.alive=false;
 for(let i=0;i<31;i++)manager.update(()=>complete++,()=>changes++);
 assert.equal(complete,0);assert.equal(changes,1);assert.ok(manager.boss instanceof Scarecrow);
 manager.boss.alive=false;for(let i=0;i<31;i++)manager.update(()=>complete++);
 assert.equal(complete,1);manager.update(()=>complete++);assert.equal(complete,1);
});

test('real game completes all boss queues and three phase transitions at 1080p',()=>{
 const surface=canvas(),game=new Game(surface);game.restartGame();
 assert.equal(surface.width,GAME.RENDER_WIDTH);assert.equal(surface.height,GAME.RENDER_HEIGHT);
 game.player.invulnerable=100000;
 for(let stage=1;stage<=3;stage++){
  game.spawner.killsInLevel=game.levelManager.currentLevelConfig.killThreshold;
  game._update(1);
  for(const type of game.bossManager.bossTypes){
   assert.ok(game.bossManager.boss.alive,type);
   game.bossManager.boss.alive=false;for(let i=0;i<31;i++)game._update(1);
  }
  if(stage<3){assert.equal(game.state,'LEVEL_TRANSITION');while(game.state==='LEVEL_TRANSITION')game._update(1);}
 }
 assert.equal(game.state,'VICTORY');game.input.destroy();game.mouse.destroy();
});

test('soft illumination preserves lit fixtures and extinction',()=>{
 const level=new Level(LEVELS.LEVEL_3),bg=level.background,light=bg.lights[0];
 assert.ok(LIGHTING.INTENSITY<0.5&&bg.lightIntensity(light)<0.4);
 light.enabled=false;assert.equal(bg.lightIntensity(light),0);
});

test('bosses recover from arena edges instead of retreating into a wall',()=>{
 const physics=new Physics(),level=new Level(LEVELS.LEVEL_1),player=new Batman({x:70,y:368});
 for(const Boss of [Scarecrow,JokerBoss]) {
  const boss=new Boss({x:0,y:330});
  for(let i=0;i<30;i++) {boss.updateAI(player,[],()=>{},()=>{});physics.update(boss,level.platforms,1100,500);boss.update(1,level);}
  assert.ok(boss.x>30);assert.ok(boss.vx>0);
 }
});
