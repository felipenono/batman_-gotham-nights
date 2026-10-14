import { HarleyQuinn } from './HarleyQuinn.js';
export class HarleyThug extends HarleyQuinn {
  constructor(options){super(options);this.name='Capanga da Arlequina';this.isBoss=false;this.w=32;this.h=62;this.hp=this.maxHp=20;this.variantColor='#f43f5e';this.malletCooldown=150;}
  updateAI(player,shots,playSfx){
    if(!this.alive||!player?.alive)return;
    const dx=player.x-this.x;this.facing=dx>=0?1:-1;this.vx=Math.abs(dx)>140?this.facing*1.8:0;
    if(--this.malletCooldown<=0){this.throwMallet(player,shots,playSfx);if(this.onGround)this.vy=-8;this.malletCooldown=180;}
  }
}
