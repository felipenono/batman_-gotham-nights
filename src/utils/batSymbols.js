import { drawAsset } from '../assets/sprites/referenceSprites.js';
import { LOGO_GOLD } from './constants.js';

// Shared sprite for the weapon and life icons.
export function drawBatarang(ctx, x=0, y=0, size=1, active=true) {
  ctx.save();ctx.translate(x,y);ctx.scale(size,size);
  const color = active ? size < 1 ? '#d8b344' : null : '#475569';
  if (drawAsset(ctx,'batarang',24,11,color)) { ctx.restore(); return; }
  ctx.fillStyle=active?'#fbbf24':'#334155';ctx.strokeStyle=active?'#fef3c7':'#475569';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(0,-3);ctx.lineTo(4,-6);ctx.lineTo(5,-1);
  ctx.lineTo(15,-8);ctx.lineTo(11,1);ctx.lineTo(5,3);ctx.lineTo(0,6);
  ctx.lineTo(-5,3);ctx.lineTo(-11,1);ctx.lineTo(-15,-8);ctx.lineTo(-5,-1);ctx.lineTo(-4,-6);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle=active?'#1e293b':'#0f172a';ctx.fillRect(-2,-1,4,3);ctx.restore();
}

export function drawBatCrest(ctx,x,y,width=360) {
  ctx.save();ctx.translate(x,y);
  // The supplied normal bat symbol replaces the old oval logo.
  // A narrow yellow rim uses exactly half of the original yellow RGB values.
  if (drawAsset(ctx,'bat_logo',width,width*0.52,LOGO_GOLD)) {
    drawAsset(ctx,'bat_logo',width*0.94,width*0.52*0.94,'#000000');
    ctx.restore();return;
  }
  ctx.restore();
  ctx.save();ctx.translate(x,y);ctx.scale(width/200,width/200);
  ctx.fillStyle=LOGO_GOLD;ctx.beginPath();
  ctx.ellipse(0,0,100,52,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#080b12';ctx.beginPath();ctx.moveTo(0,-14);
  ctx.lineTo(-5,-29);ctx.lineTo(-10,-18);
  ctx.bezierCurveTo(-35,-22,-64,-37,-86,-24);
  ctx.bezierCurveTo(-94,-6,-84,10,-76,21);
  ctx.quadraticCurveTo(-57,4,-45,23);ctx.quadraticCurveTo(-28,10,-15,27);
  ctx.lineTo(0,39);ctx.lineTo(15,27);ctx.quadraticCurveTo(28,10,45,23);
  ctx.quadraticCurveTo(57,4,76,21);ctx.bezierCurveTo(84,10,94,-6,86,-24);
  ctx.bezierCurveTo(64,-37,35,-22,10,-18);ctx.lineTo(5,-29);ctx.closePath();ctx.fill();ctx.restore();
}
