import { Projectile } from './Projectile.js';
export class Mallet extends Projectile {
  constructor(x,y,vx,vy){super({x,y,vx,vy,w:28,h:28,damage:1,lifetime:100,owner:'villain'});}
  update(dt=1,world=null){this.vy+=0.16*dt;super.update(dt,world);}
  draw(ctx){if(!this.alive)return;ctx.save();ctx.translate(this.x+14,this.y+14);ctx.rotate(this.spin);
    ctx.fillStyle='#92400e';ctx.fillRect(-2,-3,4,23);ctx.fillStyle='#991b1b';ctx.fillRect(-13,-13,26,14);
    ctx.fillStyle='#e2e8f0';ctx.fillRect(-13,-13,4,14);ctx.fillRect(9,-13,4,14);ctx.restore();}
}
