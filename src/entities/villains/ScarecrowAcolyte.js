import { Scarecrow } from './Scarecrow.js';
export class ScarecrowAcolyte extends Scarecrow {
  constructor(options){super(options); this.scoreType = 'ScarecrowAcolyte';this.name='Acólito do medo';this.isBoss=false;this.w=34;this.h=72;this.hp=this.maxHp=20;this.variantColor='#84cc16';this.smokeCooldown=130;}
  updateAI(player,shots,playSfx){
    if(!this.alive||!player?.alive)return;
    const dx=player.x-this.x;this.facing=dx>=0?1:-1;
    this.vx=Math.abs(dx)>250?this.facing*0.9:0;
    if(--this.smokeCooldown<=0){this.castFearSmoke(player,shots,playSfx);this.smokeCooldown=170;}
  }
}
