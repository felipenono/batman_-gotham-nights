import { UmbrellaBurst } from './UmbrellaBurst.js';
import { PROJECTILE } from '../../utils/constants.js';

// Reuses bounded steering, while specializing appearance, fuse and blast damage.
export class PenguinBomb extends UmbrellaBurst {
  constructor(x,y,vx,vy,target=null) {
    super(x,y,vx,vy,target);
    this.w=20;this.h=26;this.speed=PROJECTILE.PENGUIN_BOMB_SPEED;
    this.lifetime=PROJECTILE.PENGUIN_BOMB_FUSE;
    this.exploded=false;this.explodeTimer=0;this.explodeRadius=10;this.damageApplied=false;
  }
  update(dt=1,world=null) {
    if(!this.alive)return;
    if(this.exploded) {
      this.explodeTimer+=dt;
      this.explodeRadius=Math.min(PROJECTILE.PENGUIN_BOMB_RADIUS,10+this.explodeTimer*3);
      this.w=this.h=this.explodeRadius*2;
      this.x=this.blastX-this.explodeRadius;this.y=this.blastY-this.explodeRadius;
      if(this.explodeTimer>=PROJECTILE.PENGUIN_BOMB_BLAST_FRAMES)this.alive=false;
      return;
    }
    super.update(dt,world);
    if(this.lifetime<=0){this.alive=true;this.detonate();return;}
    if(world?.platforms?.some(p=>p.alive&&this.intersects(p)))this.detonate();
    if(this.target?.alive&&!this.target.intangible&&this.intersects(this.target))this.detonate();
  }
  detonate() {
    if(this.exploded||!this.alive)return;
    this.blastX=this.x+this.w/2;this.blastY=this.y+this.h/2;
    this.exploded=true;this.vx=this.vy=0;
    this.w=this.h=this.explodeRadius*2;this.x=this.blastX-this.explodeRadius;this.y=this.blastY-this.explodeRadius;
  }
  intersects(other) {
    if(!this.exploded)return super.intersects(other);
    if(!this.alive||!other?.alive)return false;
    const x=Math.max(other.x,Math.min(this.blastX,other.x+other.w));
    const y=Math.max(other.y,Math.min(this.blastY,other.y+other.h));
    return Math.hypot(x-this.blastX,y-this.blastY)<this.explodeRadius;
  }
  draw(ctx) {
    if(!this.alive)return;
    ctx.save();ctx.translate(this.x+this.w/2,this.y+this.h/2);
    if(this.exploded){
      ctx.globalAlpha=1-this.explodeTimer/PROJECTILE.PENGUIN_BOMB_BLAST_FRAMES;
      ctx.fillStyle='#f97316';ctx.beginPath();ctx.arc(0,0,this.explodeRadius,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#fde68a';ctx.beginPath();ctx.arc(0,0,this.explodeRadius*0.58,0,Math.PI*2);ctx.fill();
    }else{
      ctx.rotate(Math.sin(this.pulse)*0.08);
      ctx.fillStyle='#f59e0b';ctx.fillRect(-9,9,7,4);ctx.fillRect(2,9,7,4);
      ctx.fillStyle='#111827';ctx.strokeStyle='#64748b';ctx.lineWidth=1;
      ctx.beginPath();ctx.ellipse(0,0,9,12,0,0,Math.PI*2);ctx.fill();ctx.stroke();
      ctx.fillStyle='#e2e8f0';ctx.beginPath();ctx.ellipse(0,3,5.5,7,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#f8fafc';ctx.fillRect(-5,-7,3,3);ctx.fillRect(2,-7,3,3);
      ctx.fillStyle='#f59e0b';ctx.beginPath();ctx.moveTo(-3,-3);ctx.lineTo(3,-3);ctx.lineTo(0,1);ctx.closePath();ctx.fill();
      ctx.fillStyle='#be123c';ctx.fillRect(-4,1,8,3);
      ctx.fillStyle=this.lifetime<30?'#f43f5e':'#fbbf24';ctx.fillRect(-2,-15,4,4);
    }
    ctx.restore();
  }
}
