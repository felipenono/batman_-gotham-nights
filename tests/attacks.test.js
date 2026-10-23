import { AnimationState } from '../src/models/AnimationState.js';
import {Platform} from '../src/models/entities/Platform.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {Batman} from '../src/models/entities/Batman.js';
import {Penguin} from '../src/models/entities/villains/Penguin.js';
import {PenguinBomb} from '../src/models/entities/projectiles/PenguinBomb.js';
import {Batarang} from '../src/models/entities/projectiles/Batarang.js';
import {CombatSystem} from '../src/models/services/CombatSystem.js';
import {Spawner} from '../src/models/services/Spawner.js';
import {SPRITE_NAMES} from '../src/views/sprites/SpriteRenderer.js';
import {GAME,PROJECTILE,LEVELS} from '../src/config/constants.js';

test('batarang allows the next shot after exactly 6 frames and discards rejected clicks',()=>{
 const p=new Batman(),shots=[],factory=(...args)=>new Batarang(...args);
 p.throwBatarang({},false,shots,factory);
 for(let i=0;i<5;i++)p.update();
 p.throwBatarang({},false,shots,factory);assert.equal(shots.length,1);
 p.update();assert.equal(p.shootCooldown,0);assert.equal(shots.length,1);
 p.throwBatarang({},false,shots,factory);assert.equal(shots.length,2);
});
test('Penguin launches toward targets in every quadrant',()=>{
 const p=new Penguin({x:400,y:200});
 for(const [x,y] of [[0,0],[900,0],[0,500],[900,500]]){
  const shots=[];p.firePenguin(new Batman({x,y}),shots);
  assert.ok(shots[0] instanceof PenguinBomb);
  assert.equal(Math.sign(shots[0].vx),Math.sign(x-400));
  assert.equal(Math.sign(shots[0].vy),Math.sign(y-200));
 }
});
test('penguin fuse detonates but platforms are traversed; blast stays centered and expires',()=>{
 const p=new PenguinBomb(200,200,0,0);p.update(PROJECTILE.PENGUIN_BOMB_FUSE);
 assert.ok(p.exploded&&p.alive);const origin=[p.blastX,p.blastY];
 p.update(12);assert.equal(p.explodeRadius,PROJECTILE.PENGUIN_BOMB_RADIUS);
 assert.deepEqual([p.x+p.w/2,p.y+p.h/2],origin);
 p.update(12);assert.equal(p.alive,false);
 const q=new PenguinBomb(200,200,0,0);
 q.update(1,{platforms:[new Platform({x:190,y:210,w:60,h:20})]});assert.equal(q.exploded,false);
});
test('one explosion damages only once and respects circular blast edges',()=>{
 const p=new Batman({x:200,y:200}),bomb=new PenguinBomb(205,205,0,0),combat=new CombatSystem();
 combat.update(p,[],null,[bomb]);assert.equal(p.hp,2);assert.ok(bomb.exploded);
 p.invulnerable=0;combat.update(p,[],null,[bomb]);assert.equal(p.hp,2);
 bomb.update(12);assert.equal(bomb.intersects({x:bomb.blastX+45,y:bomb.blastY+45,w:5,h:5,alive:true}),false);
});
test('death animation, one second intangible respawn, and final death',()=>{
 const p=new Batman(),combat=new CombatSystem();p.takeDamage(3);
 assert.equal(p.lives,4);assert.ok(p.intangible);
 for(let i=0;i<GAME.DEATH_ANIMATION_FRAMES;i++)p.update();
 assert.equal(p.intangibleTimer,60);assert.equal(p.hp,3);
 const bomb=new PenguinBomb(p.x,p.y,0,0);
 for(let i=0;i<60;i++){
  combat.update(p,[new Penguin({x:p.x,y:p.y})],null,[bomb]);
  assert.equal(p.hp,3);assert.ok(bomb.alive&&!bomb.exploded);p.update();
 }
 assert.equal(p.intangible,false);assert.equal(p.takeDamage(1),true);
 p.invulnerable=0;p.lives=1;p.takeDamage(3);
 for(let i=0;i<30;i++)p.update();assert.equal(p.alive,false);
});
test('every phase has two themed enemy types with executable attacks',()=>{
 const player=new Batman({x:450,y:100});
 for(const config of Object.values(LEVELS)){
  const spawner=new Spawner();spawner.initLevel(config);const enemies=[],shots=[];
  spawner.spawnWave(enemies,1100,500);
  assert.equal(new Set(enemies.map(e=>e.spriteKey)).size,2);
  for(let i=0;i<400;i++)for(const enemy of enemies)enemy.updateAI(player,shots,()=>{});
  assert.ok(shots.length>0);assert.ok(enemies.every(e=>!e.isBoss));
 }
});
test('named sprite states transition without drawing-driven updates and death does not loop',()=>{
 assert.equal(SPRITE_NAMES.length,36);assert.ok(SPRITE_NAMES.includes('batman_walk'));
 const a=new AnimationState(),actor={alive:true,onGround:true,vx:2,vy:0};
 a.update(actor);assert.equal(a.state,'walk');
 actor.throwAnimTimer=5;a.update(actor);assert.equal(a.state,'attack');
 actor.hurtFlash=5;a.update(actor);assert.equal(a.state,'hurt');
 actor.alive=false;for(let i=0;i<100;i++)a.update(actor);assert.equal(a.state,'death');assert.equal(a.frame,9);
});

// Mira nas fases avancadas: verifica trajetorias, nao apenas a direcao inicial.
import {HarleyQuinn} from '../src/models/entities/villains/HarleyQuinn.js';
import {HarleyThug} from '../src/models/entities/villains/HarleyThug.js';
import {TwoFace} from '../src/models/entities/villains/TwoFace.js';
import {TwoFaceEnforcer} from '../src/models/entities/villains/TwoFaceEnforcer.js';
import {BossManager} from '../src/models/services/BossManager.js';

test('tiros e arremessos da fase 2 e 3 alcancam Batman acima e abaixo dos dois lados',()=>{
 for(const Enemy of [HarleyQuinn,HarleyThug,TwoFace,TwoFaceEnforcer]) {
  for(const [x,y] of [[120,70],[750,70],[120,350],[750,350]]) {
   const enemy=new Enemy({x:400,y:210}),target=new Batman({x,y});
   enemy.facing=x<400?-1:1;
   for(const kind of ['bullet','arc']) {
    const shots=[];
    if(enemy instanceof HarleyQuinn) {
     if(kind==='bullet')enemy.shootGuns(target,shots);else enemy.throwMallet(target,shots);
    } else {enemy.nextAttackIsBullets=kind==='bullet';enemy.executeDecidedAttack(target,shots);}
    const shot=shots[0];let hit=false;
    const world={platforms:[new Platform({x:0,y:180,w:1100,h:24})]};
    for(let frame=0;frame<100&&shot.alive;frame++){shot.update(1,world);if(shot.intersects(target)){hit=true;break;}}
    assert.ok(hit,Enemy.name+' '+kind+' target '+x+','+y);
   }
  }
 }
});

test('projeteis do Batman e dos inimigos atravessam plataformas em movimento',()=>{
 const world={platforms:[new Platform({x:150,y:200,w:100,h:24})]};
 const shots=[new Batarang(180,170,0,6),new PenguinBomb(180,170,0,5)];
 for(const shot of shots){for(let i=0;i<14;i++)shot.update(1,world);assert.ok(shot.y>224);assert.ok(shot.alive);assert.ok(!shot.exploded);}
});

test('pressao das ondas cresce 1,5x a cada fase',()=>{
 const configs=Object.values(LEVELS);
 for(const [index,config] of configs.entries()) {
  const spawner=new Spawner();spawner.initLevel(config);
  assert.equal(spawner.interval,300/(1.5**index));assert.equal(spawner.maxActive,Math.round(5*(1.5**index)));
  const enemies=[];for(let i=0;i<20;i++)spawner.spawnWave(enemies,1100,500);
  assert.equal(enemies.length,spawner.maxActive);
 }
 const phases=configs.map(config=>{const spawner=new Spawner();spawner.initLevel(config);let waves=0;
  spawner.spawnWave=()=>waves++;for(let i=0;i<600;i++)spawner.update([],1100,500);return waves;});
 assert.deepEqual(phases,[2,3,5]);
});

test('chefes das fases 2 e 3 usam a cadencia configurada sem alterar dano ou HP',()=>{
 for(const config of [LEVELS.LEVEL_2,LEVELS.LEVEL_3]){
  const manager=new BossManager();manager.spawnBoss(config,1100,500);
  assert.equal(manager.boss.attackRate,config.difficulty);
  const boss=manager.boss,target=new Batman({x:100,y:100}),shots=[];
  if(boss instanceof HarleyQuinn){boss.bulletCooldown=8;boss.updateAI(target,shots);assert.equal(boss.bulletCooldown,6.5);}
  else {boss.attackCycleTimer=8;boss.updateAI(target,shots);assert.equal(boss.attackCycleTimer,5.75);}
 }
});
