import { LIGHTING } from '../utils/constants.js';
/**
 * @file Level2Background.js
 * Iceberg Lounge: Opulent art deco casino with chandeliers, velvet drapes, neon signage, and marble reflections.
 */

import { Background } from './Background.js';

export class Level2Background extends Background {
  constructor(width = 900, height = 500) {
    super(width, height);
    this.lightPulse = 0;
    this.spotlightAngle = 0;
  }

  update(dt = 1, camera = null) {
    this.lightPulse += 0.05 * dt;
    this.spotlightAngle += 0.02 * dt;
  }

  draw(ctx, camera = null) {

    ctx.save();
    ctx.translate(-(camera?.renderX ?? 0), -(camera?.renderY ?? 0));

    // 1. Velvet Wall Gradient
    const wallGrad = ctx.createLinearGradient(0, 0, 0, this.height);
    wallGrad.addColorStop(0, '#1e112a');
    wallGrad.addColorStop(0.5, '#3b0764');
    wallGrad.addColorStop(1, '#0f051d');
    ctx.fillStyle = wallGrad;
    ctx.fillRect(0, 0, this.width, this.height);

    // 2. Art Deco Wall Panels & Arches
    const panelStep = 180;
    ctx.strokeStyle = '#581c87';
    ctx.lineWidth = 3;
    for (let x = 0; x < this.width + 200; x += panelStep) {
      ctx.strokeRect(x, 40, panelStep - 30, 320);
      // Gold inner arch
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(x + (panelStep - 30) / 2, 120, 45, Math.PI, 0, false);
      ctx.lineTo(x + (panelStep - 30) / 2 + 45, 340);
      ctx.lineTo(x + (panelStep - 30) / 2 - 45, 340);
      ctx.closePath();
      ctx.stroke();
    }

    // 3. Luxurious Swagged Velvet Curtains at top
    ctx.fillStyle = '#831843';
    for (let cx = 0; cx < this.width + 120; cx += 160) {
      ctx.beginPath();
      ctx.arc(cx, 0, 95, 0, Math.PI, false);
      ctx.fill();

      // Gold fringe along curtains
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(cx, 0, 95, 0, Math.PI, false);
      ctx.stroke();
    }

    // 4. NEON "SALÃO ICEBERG" SIGN
    ctx.save();
    ctx.globalAlpha *= LIGHTING.INTENSITY;
    const neonX = this.width / 2;
    const neonY = 80;

    // Glowing cyan/pink neon frame
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 8;
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 3;
    ctx.strokeRect(neonX - 160, neonY - 30, 320, 56);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '900 24px "Arial Black", sans-serif';
    ctx.fillStyle = '#bae6fd';
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 6;
    ctx.fillText('SALÃO ICEBERG', neonX, neonY);

    // Neon martini glass icon
    ctx.strokeStyle = '#f472b6';
    ctx.shadowColor = '#ec4899';
    ctx.shadowBlur = 8;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(neonX + 125, neonY - 14);
    ctx.lineTo(neonX + 145, neonY - 14);
    ctx.lineTo(neonX + 135, neonY + 2);
    ctx.closePath();
    ctx.moveTo(neonX + 135, neonY + 2);
    ctx.lineTo(neonX + 135, neonY + 12);
    ctx.moveTo(neonX + 127, neonY + 12);
    ctx.lineTo(neonX + 143, neonY + 12);
    ctx.stroke();
    ctx.restore();

    // 5. Crystal Chandeliers
    const chandX = [180, 720];
    for (const cx of chandX) {
      ctx.save();
      // Chain
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, 0); ctx.lineTo(cx, 60);
      ctx.stroke();

      ctx.globalAlpha *= LIGHTING.INTENSITY;
      // Tier 1
      ctx.fillStyle = '#fef08a';
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.ellipse(cx, 66, 32, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Crystals hanging
      ctx.fillStyle = '#ffffff';
      for (let i = -24; i <= 24; i += 8) {
        ctx.fillRect(cx + i, 68, 2, 14);
      }
      ctx.restore();
    }

    // 6. Polished Black & Gold Marble Floor with Light Reflection
    const floorY = this.height - 65;
    const floorGrad = ctx.createLinearGradient(0, floorY, 0, this.height);
    floorGrad.addColorStop(0, '#180d2b');
    floorGrad.addColorStop(0.2, '#090514');
    floorGrad.addColorStop(1, '#000000');
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, floorY, this.width, 65);

    // Gold diamond tiles on floor
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 1;
    for (let x = 0; x < this.width + 120; x += 80) {
      ctx.beginPath();
      ctx.moveTo(x, floorY);
      ctx.lineTo(x + 40, this.height);
      ctx.stroke();
    }

    // Spotlights sweeping floor
    ctx.save();
    const spotX = this.width / 2 + Math.sin(this.spotlightAngle) * 220;
    const spotGrad = ctx.createRadialGradient(spotX, floorY, 20, spotX, floorY, 180);
    spotGrad.addColorStop(0, 'rgba(168, 85, 247, 0.15)');
    spotGrad.addColorStop(1, 'rgba(168, 85, 247, 0)');
    ctx.fillStyle = spotGrad;
    ctx.fillRect(0, floorY - 80, this.width, 145);
    ctx.restore();

    ctx.restore();
  }
}
