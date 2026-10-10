/**
 * @file Level3Background.js
 * Arkham Asylum Interior: Gothic stone asylum, glowing inmate cells, flickering tubes, gargoyles, creeping green fog.
 */

import { Background } from './Background.js';

export class Level3Background extends Background {
  constructor(width = 900, height = 500) {
    super(width, height);
    this.flickerTimer = 0;
    this.fogTime = 0;
  }

  update(dt = 1, camera = null) {
    this.fogTime += 0.03 * dt;
    this.flickerTimer += dt;
  }

  draw(ctx, camera = null) {
    const camX = camera ? camera.renderX : 0;

    ctx.save();

    // 1. Dark Gothic Stone Wall Base
    const stoneGrad = ctx.createLinearGradient(0, 0, 0, this.height);
    stoneGrad.addColorStop(0, '#09090b');
    stoneGrad.addColorStop(0.5, '#18181b');
    stoneGrad.addColorStop(1, '#052e16'); // greenish undertone
    ctx.fillStyle = stoneGrad;
    ctx.fillRect(0, 0, this.width, this.height);

    // 2. Stone Brick Patterns
    ctx.strokeStyle = '#27272a';
    ctx.lineWidth = 1;
    for (let y = 30; y < this.height - 80; y += 35) {
      ctx.beginPath();
      ctx.moveTo(0, y); ctx.lineTo(this.width, y);
      ctx.stroke();

      const offset = (y % 70 === 0) ? 0 : 35;
      for (let x = -camX * 0.2 + offset; x < this.width + 100; x += 70) {
        ctx.beginPath();
        ctx.moveTo(x, y); ctx.lineTo(x, y + 35);
        ctx.stroke();
      }
    }

    // 3. Asylum Cell Bars with glowing prisoner eyes
    const cellStep = 180;
    for (let cx = -camX * 0.35 + 40; cx < this.width + 120; cx += cellStep) {
      // Dark cell recess
      ctx.fillStyle = '#050508';
      ctx.fillRect(cx, 80, 110, 220);

      // Glowing red / yellow inmate eyes lurking in darkness
      ctx.fillStyle = (Math.sin(cx * 3) > 0) ? '#ef4444' : '#eab308';
      ctx.beginPath();
      ctx.arc(cx + 45, 170, 2.5, 0, Math.PI * 2);
      ctx.arc(cx + 55, 170, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Heavy Iron Cell Bars
      ctx.strokeStyle = '#52525b';
      ctx.lineWidth = 4;
      for (let bx = cx + 8; bx < cx + 110; bx += 18) {
        ctx.beginPath();
        ctx.moveTo(bx, 80);
        ctx.lineTo(bx, 300);
        ctx.stroke();
      }

      // Cell Arch top
      ctx.fillStyle = '#27272a';
      ctx.beginPath();
      ctx.arc(cx + 55, 80, 55, Math.PI, 0, false);
      ctx.fill();
    }

    // 4. Stone Gargoyle Statues on pillars
    const pillars = [120 - camX * 0.45, 780 - camX * 0.45];
    for (const px of pillars) {
      // Pillar shaft
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(px - 20, 120, 40, this.height - 180);

      // Gargoyle perched atop pillar
      ctx.fillStyle = '#292524';
      ctx.beginPath();
      // Body
      ctx.ellipse(px, 110, 16, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      // Wings
      ctx.beginPath();
      ctx.moveTo(px - 14, 110); ctx.lineTo(px - 32, 85); ctx.lineTo(px - 12, 100);
      ctx.moveTo(px + 14, 110); ctx.lineTo(px + 32, 85); ctx.lineTo(px + 12, 100);
      ctx.fill();
      // Red glowing eyes on gargoyle
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(px - 5, 107, 3, 2);
      ctx.fillRect(px + 2, 107, 3, 2);
    }

    // 5. Flickering Industrial Fluorescent Ceiling Tubes
    const isFlickering = Math.sin(this.flickerTimer * 0.4) > 0.85;
    const lightAlpha = isFlickering ? 0.2 : 0.85;

    ctx.save();
    const tubes = [260 - camX * 0.3, 640 - camX * 0.3];
    for (const tx of tubes) {
      ctx.strokeStyle = '#27272a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(tx, 0); ctx.lineTo(tx, 45);
      ctx.stroke();

      // Tube glass
      ctx.shadowColor = '#86efac';
      ctx.shadowBlur = isFlickering ? 4 : 14;
      ctx.fillStyle = `rgba(240, 253, 244, ${lightAlpha})`;
      ctx.fillRect(tx - 35, 45, 70, 6);

      // Cast light beam downward
      const coneGrad = ctx.createRadialGradient(tx, 50, 10, tx, 250, 220);
      coneGrad.addColorStop(0, `rgba(134, 239, 172, ${lightAlpha * 0.25})`);
      coneGrad.addColorStop(1, 'rgba(134, 239, 172, 0)');
      ctx.fillStyle = coneGrad;
      ctx.beginPath();
      ctx.moveTo(tx - 35, 51);
      ctx.lineTo(tx + 35, 51);
      ctx.lineTo(tx + 120, 380);
      ctx.lineTo(tx - 120, 380);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // 6. Creeping Toxic Green Fog in lower half
    ctx.save();
    const fogBaseY = this.height - 120;
    const fogGrad = ctx.createLinearGradient(0, fogBaseY - 60, 0, this.height);
    fogGrad.addColorStop(0, 'rgba(34, 197, 94, 0)');
    fogGrad.addColorStop(0.5, 'rgba(22, 101, 52, 0.45)');
    fogGrad.addColorStop(1, 'rgba(20, 83, 45, 0.85)');
    ctx.fillStyle = fogGrad;
    ctx.fillRect(0, fogBaseY - 60, this.width, 180);

    // Dynamic swirling fog blobs
    ctx.fillStyle = 'rgba(74, 222, 128, 0.18)';
    for (let fx = 0; fx < this.width + 100; fx += 140) {
      const fy = fogBaseY + Math.sin(this.fogTime * 2 + fx) * 16;
      ctx.beginPath();
      ctx.ellipse(fx, fy, 90, 30, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    ctx.restore();
  }
}
