import { TwoFace } from './TwoFace.js';
export class TwoFaceEnforcer extends TwoFace {
  constructor(options){super(options); this.scoreType = 'TwoFaceEnforcer';this.name='Agente do Duas-Caras';this.isBoss=false;this.w=34;this.h=68;this.hp=this.maxHp=20;this.variantColor='#38bdf8';this.speed=1.1;this.attackCycleTimer=160;}
  updateAI(player,shots,playSfx){super.updateAI(player,shots,null,playSfx);}
}
