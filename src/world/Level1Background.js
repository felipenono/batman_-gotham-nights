import { LIGHTING } from '../utils/constants.js';
/**
 * @file Level1Background.js
 * Gotham Rooftops: Dark rainy night, thunder flashes, skyline silhouette, and glowing Bat-Signal.
 */

import { Background } from './Background.js';

export class Level1Background extends Background {
  constructor(width = 900, height = 500) {
    super(width, height);

    this.rainDrops = [];
    for (let i = 0; i < 120; i++) {
      this.rainDrops.push({
        x: Math.random() * width,
        y: Math.random() * height,
        len: 12 + Math.random() * 10,
        speed: 14 + Math.random() * 6,
      });
    }

    this.lightningTimer = 300;
    this.lightningAlpha = 0;
    this.signalAngle = 0;

    // Distant buildings data
    this.buildings = [];
    let curX = 0;
    while (curX < width + 400) {
      const bw = 40 + Math.random() * 60;
      const bh = 140 + Math.random() * 180;
      this.buildings.push({ x: curX, w: bw, h: bh });
      curX += bw + (Math.random() * 15);
    }
  }

  update(dt = 1, camera = null) {
    this.signalAngle += 0.015 * dt;

    // Rain simulation
    for (const drop of this.rainDrops) {
      drop.y += drop.speed * dt;
      drop.x -= 2.5 * dt;
      if (drop.y > this.height) {
        drop.y = -20;
        drop.x = Math.random() * (this.width + 100);
      }
    }

    // Thunder flashes
    this.lightningTimer -= dt;
    if (this.lightningTimer <= 0) {
      this.lightningTimer = 400 + Math.random() * 300;
      this.lightningAlpha = 0.2;
    }
    if (this.lightningAlpha > 0) {
      this.lightningAlpha -= 0.08 * dt;
      if (this.lightningAlpha < 0) this.lightningAlpha = 0;
    }
  }

  draw(ctx, camera = null) {
    const camX = camera ? camera.renderX : 0;

    ctx.save();

    // 1. Night Sky Gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, this.height);
    skyGrad.addColorStop(0, '#020617');
    skyGrad.addColorStop(0.5, '#0b132b');
    skyGrad.addColorStop(1, '#1c2541');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, this.width, this.height);

    // 2. THE BAT-SIGNAL on clouds (matches reference image)
    ctx.save();
    const targetCloudX = 410 - camX * 0.12;
    const targetCloudY = 130;
    const signalOriginX = 725 - camX * 0.25;
    const signalOriginY = this.height - 75;

    // A. Dark textured cloud bank behind the signal
    ctx.save();
    ctx.fillStyle = '#0b0f19';
    ctx.beginPath();
    ctx.ellipse(targetCloudX, targetCloudY, 190, 82, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#161f30';
    ctx.beginPath();
    ctx.ellipse(targetCloudX - 50, targetCloudY - 18, 130, 56, 0, 0, Math.PI * 2);
    ctx.ellipse(targetCloudX + 55, targetCloudY + 12, 140, 60, 0, 0, Math.PI * 2);
    ctx.fill();

    // Dark turbulent cloud wisps
    ctx.fillStyle = '#0d1525';
    ctx.beginPath();
    ctx.ellipse(targetCloudX - 85, targetCloudY + 22, 95, 38, 0, 0, Math.PI * 2);
    ctx.ellipse(targetCloudX + 90, targetCloudY - 22, 100, 42, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // B. Searchlight Volumetric Beam (projected from rooftop up into the cloud bank)
    ctx.save();
    ctx.globalAlpha *= LIGHTING.INTENSITY;
    const beamGrad = ctx.createLinearGradient(
      signalOriginX,
      signalOriginY,
      targetCloudX,
      targetCloudY
    );
    beamGrad.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
    beamGrad.addColorStop(0.12, 'rgba(254, 240, 138, 0.55)');
    beamGrad.addColorStop(0.45, 'rgba(250, 204, 21, 0.25)');
    beamGrad.addColorStop(0.85, 'rgba(253, 224, 71, 0.35)');
    beamGrad.addColorStop(1, 'rgba(254, 249, 195, 0.5)');

    ctx.fillStyle = beamGrad;
    ctx.beginPath();
    // Origin at projector housing
    ctx.moveTo(signalOriginX - 8, signalOriginY);
    // Expanding up-left to encompass the projected illuminated oval on clouds
    ctx.lineTo(targetCloudX - 110, targetCloudY + 25);
    ctx.lineTo(targetCloudX + 105, targetCloudY + 45);
    ctx.lineTo(signalOriginX + 8, signalOriginY);
    ctx.closePath();
    ctx.fill();

    // Soft volumetric outer halo
    ctx.shadowColor = 'rgba(254, 240, 138, 0.3)';
    ctx.shadowBlur = 18;
    ctx.fill();
    ctx.restore();

    // C. Searchlight Projector on the Rooftop (detailed apparatus)
    ctx.save();
    // Heavy industrial tripod base
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(signalOriginX - 14, signalOriginY + 16);
    ctx.lineTo(signalOriginX, signalOriginY + 4);
    ctx.lineTo(signalOriginX + 14, signalOriginY + 16);
    ctx.lineTo(signalOriginX + 10, signalOriginY + 16);
    ctx.lineTo(signalOriginX, signalOriginY + 6);
    ctx.lineTo(signalOriginX - 10, signalOriginY + 16);
    ctx.closePath();
    ctx.fill();

    // Swivel mount yoke
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(signalOriginX - 10, signalOriginY + 2, 20, 5);

    // Angled projector barrel drum
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.roundRect(signalOriginX - 8, signalOriginY - 5, 16, 12, 3);
    ctx.fill();

    ctx.globalAlpha *= LIGHTING.INTENSITY;
    // Glowing front projector lens glint
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.arc(signalOriginX - 2, signalOriginY - 2, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // D. Luminous Projected Golden-Ivory Spotlight on Clouds
    ctx.save();
    ctx.globalAlpha *= LIGHTING.INTENSITY;
    ctx.translate(targetCloudX, targetCloudY);

    // Atmospheric warm golden halo
    ctx.shadowColor = 'rgba(250, 204, 21, 0.75)';
    ctx.shadowBlur = 28;

    // Glowing radiant spotlight oval (white hot core -> rich golden-amber halo)
    const ovalGrad = ctx.createRadialGradient(0, 0, 12, 0, 0, 116);
    ovalGrad.addColorStop(0, '#ffffff');
    ovalGrad.addColorStop(0.28, '#fef9c3');
    ovalGrad.addColorStop(0.65, '#fef08a');
    ovalGrad.addColorStop(0.88, '#facc15');
    ovalGrad.addColorStop(0.97, '#eab308');
    ovalGrad.addColorStop(1, 'rgba(202, 138, 4, 0.2)');

    ctx.fillStyle = ovalGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, 114, 66, 0, 0, Math.PI * 2);
    ctx.fill();

    // Bright illuminated rim
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 3;
    ctx.stroke();

    // E. Iconic Classic Bat Silhouette (deep jet-black shadow projected inside the light)
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#060a12'; // Deepest midnight black matching reference

    ctx.beginPath();
    // Head notch between ears
    ctx.moveTo(0, -13);
    // Left ear
    ctx.lineTo(-4, -27);
    ctx.lineTo(-9, -17);
    // Left top wing arch
    ctx.bezierCurveTo(-32, -22, -60, -32, -88, -26);
    // Left outer wing tip
    ctx.bezierCurveTo(-97, -12, -93, 7, -80, 17);
    // Left outer scallop
    ctx.bezierCurveTo(-73, 7, -60, 7, -49, 21);
    // Left middle scallop
    ctx.bezierCurveTo(-41, 10, -28, 10, -16, 23);
    // Center tail point
    ctx.bezierCurveTo(-8, 19, -4, 28, 0, 36);
    // Right middle scallop
    ctx.bezierCurveTo(4, 28, 8, 19, 16, 23);
    ctx.bezierCurveTo(28, 10, 41, 10, 49, 21);
    // Right outer scallop
    ctx.bezierCurveTo(60, 7, 73, 7, 80, 17);
    // Right outer wing tip
    ctx.bezierCurveTo(93, 7, 97, -12, 88, -26);
    // Right top wing arch back to head
    ctx.bezierCurveTo(60, -32, 32, -22, 9, -17);
    // Right ear
    ctx.lineTo(4, -27);
    ctx.lineTo(0, -13);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
    ctx.restore();

    // 3. Distant Gotham Skyline with Parallax
    const parallaxSkyline = camX * 0.25;
    ctx.fillStyle = '#090d16';
    for (const b of this.buildings) {
      const bx = b.x - parallaxSkyline;
      const by = this.height - b.h;
      ctx.fillRect(bx, by, b.w, b.h);

      // Lit yellow windows
      ctx.fillStyle = 'rgba(254, 240, 138, 0.45)';
      for (let wy = by + 12; wy < this.height - 20; wy += 22) {
        for (let wx = b.x + 6; wx < b.x + b.w - 10; wx += 14) {
          if ((Math.sin(wx * 11 + wy * 17) > 0.35)) {
            ctx.fillRect(wx - parallaxSkyline, wy, 4, 6);
          }
        }
      }
      ctx.fillStyle = '#090d16';
    }

    // 4. Midground Silhouetted Industrial Pipes & Rooftops
    const parallaxMid = camX * 0.55;
    ctx.fillStyle = '#111827';
    ctx.fillRect(0 - parallaxMid, this.height - 80, this.width * 2, 80);

    // 5. Rain Streaks
    ctx.strokeStyle = 'rgba(147, 197, 253, 0.4)';
    ctx.lineWidth = 1.2;
    for (const drop of this.rainDrops) {
      ctx.beginPath();
      ctx.moveTo(drop.x, drop.y);
      ctx.lineTo(drop.x - 4, drop.y + drop.len);
      ctx.stroke();
    }

    // 6. Lightning Flash
    if (this.lightningAlpha > 0.01) {
      ctx.fillStyle = `rgba(241, 245, 249, ${this.lightningAlpha})`;
      ctx.fillRect(0, 0, this.width, this.height);
    }

    ctx.restore();
  }
}
