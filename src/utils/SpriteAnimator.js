import { prepareReferenceSprites, drawReference } from '../assets/sprites/referenceSprites.js';
import { batman } from '../assets/sprites/batman.js';
import { joker } from '../assets/sprites/joker.js';
import { penguin } from '../assets/sprites/penguin.js';
import { scarecrow } from '../assets/sprites/scarecrow.js';
import { harley_quinn } from '../assets/sprites/harley_quinn.js';
import { two_face } from '../assets/sprites/two_face.js';

export const SPRITE_ART = {batman,joker,penguin,scarecrow,harley_quinn,two_face};
export const SPRITE_ACTIONS = Object.freeze({idle:8,walk:12,jump:4,attack:6,hurt:4,death:10});
export const SPRITE_NAMES = Object.keys(SPRITE_ART).flatMap(name=>Object.keys(SPRITE_ACTIONS).map(action=>`${name}_${action}`));
const cache = new Map();
const SIZE=256, ANCHOR_X=128, ANCHOR_Y=160, RESOLUTION=2;

// Transparent frames share a fixed foot anchor and scale; drawing never advances time.
export function spriteFrame(key, action, frame) {
  const id=`${key}_${action}_${frame}`;
  if(cache.has(id))return cache.get(id);
  if(!globalThis.document)return null;
  const art=SPRITE_ART[key];if(!art)return null;
  const canvas=document.createElement('canvas');canvas.width=canvas.height=SIZE*RESOLUTION;
  const ctx=canvas.getContext('2d');ctx.scale(RESOLUTION,RESOLUTION);
  const t=frame/SPRITE_ACTIONS[action],phase=t*Math.PI*2;
  const walking=action==='walk',attacking=action==='attack';
  const pose={x:ANCHOR_X-art.width/2,y:ANCHOR_Y-art.height,w:art.width,h:art.height,
    alive:true,facing:1,vx:walking?2:0,vy:0,onGround:action!=='jump',
    isAttacking:attacking,throwAnimTimer:attacking?10:0,hurtFlash:0,
    invulnerable:0,fearTimer:0,hp:100,maxHp:100,hpRatio:1,coinFlipping:false,
    animTime:phase/(walking?6:2),wobble:phase/3,waddleTime:phase/3,
    floatCycle:phase/2,acrobatTime:phase/4,stride:phase/3};
  ctx.translate(ANCHOR_X,ANCHOR_Y);
  if(action==='death') {
    const collapse=Math.min(1,frame/7);ctx.rotate(collapse*Math.PI/2);ctx.scale(1,1-collapse*0.15);
  } else if(action==='hurt') {
    ctx.rotate(-Math.sin(t*Math.PI)*0.10);ctx.filter='sepia(0.3) saturate(1.6)';
  } else if(action==='jump') {const stretch=Math.sin(t*Math.PI*2)*0.025;ctx.scale(1.04-stretch,0.96+stretch);}
  else if(attacking) {ctx.rotate(Math.sin(t*Math.PI)*0.04);}
  ctx.translate(-ANCHOR_X,-ANCHOR_Y);
  ctx.save();ctx.translate(ANCHOR_X,ANCHOR_Y);
  const rendered = drawReference(ctx,key,art.height,phase,action);
  ctx.restore();
  if(!rendered)art.paint.call(pose,ctx);
  if(cache.size >= 64)cache.delete(cache.keys().next().value);
  cache.set(id,canvas);return canvas;
}

export async function loadSprites() {
  await prepareReferenceSprites();
  cache.clear();
  for(const key of Object.keys(SPRITE_ART))for(const [action,count] of Object.entries(SPRITE_ACTIONS))
    spriteFrame(key,action,0);
}

export class SpriteAnimator {
  constructor(){this.state='idle';this.time=0;this.previous=null;this.blend=1;}
  update(actor,dt=1) {
    const next=actor.deathTimer>0||!actor.alive?'death':actor.hurtFlash>0?'hurt':
      actor.throwAnimTimer>0||actor.attackTimer>0?'attack':
      !actor.onGround&&Math.abs(actor.vy)>0.5?'jump':Math.abs(actor.vx)>0.2?'walk':'idle';
    if(next!==this.state){this.previous={state:this.state,frame:this.frame};this.state=next;this.time=0;this.blend=0;}
    else this.time+=dt;
    this.blend=Math.min(1,this.blend+dt/3);
  }
  get frame(){const n=SPRITE_ACTIONS[this.state];const f=Math.floor(this.time/(this.state==='death'?3:5));return this.state==='death'?Math.min(n-1,f):f%n;}
  draw(ctx,actor) {
    const art=SPRITE_ART[actor.spriteKey];if(!art)return;
    const scale=actor.h/art.height;
    ctx.save();ctx.translate(Math.round(actor.x+actor.w/2),Math.round(actor.y+actor.h));
    ctx.scale((actor.facing||1)*scale,scale);
    if(actor.isCartwheeling){ctx.translate(0,-art.height/2);ctx.rotate(actor.cartwheelAngle||0);ctx.translate(0,art.height/2);}
    const alpha=actor.invulnerable>0&&actor.deathTimer<=0?0.65:1;
    const draw=(state,frame,opacity)=>{const image=spriteFrame(actor.spriteKey,state,frame);if(!image)return;
      ctx.globalAlpha=alpha*opacity;ctx.drawImage(image,-ANCHOR_X,-ANCHOR_Y,SIZE,SIZE);};
    if(this.previous&&this.blend<1)draw(this.previous.state,this.previous.frame,1-this.blend);
    draw(this.state,this.frame,this.blend);
    ctx.restore();
    if(actor.alive && !actor.isBoss && actor.spriteKey!=='batman' && actor.hp<actor.maxHp){
      ctx.save();ctx.fillStyle='#0f172a';ctx.fillRect(actor.x+actor.w/2-16,actor.y-12,32,5);
      ctx.fillStyle='#ef4444';ctx.fillRect(actor.x+actor.w/2-16,actor.y-12,32*actor.hpRatio,5);ctx.restore();
    }
    if(actor.coinFlipping&&actor.alive){
      ctx.save();ctx.fillStyle='#facc15';ctx.beginPath();ctx.ellipse(actor.x+actor.w/2,actor.y-14,5,7,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#171717';ctx.font='bold 8px sans-serif';ctx.textAlign='center';ctx.fillText(actor.nextAttackIsBullets?'C':'R',actor.x+actor.w/2,actor.y-11);ctx.restore();
    }
    if(actor.variantColor&&actor.alive){ctx.save();ctx.fillStyle=actor.variantColor;ctx.fillRect(actor.x+actor.w/2-6,actor.y+actor.h*0.42,12,3);ctx.restore();}
  }
}
