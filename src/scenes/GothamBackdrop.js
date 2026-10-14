import { LOBBY } from '../config/lobby.js';
import { BatSignal, moonLayout, visibleSky } from './BatSignal.js';

/** Cenário vetorial determinístico: sem imagens obrigatórias ou sorteio por quadro. */
export class GothamBackdrop {
  constructor() {
    let seed = 27;
    const random = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    this.layers = [0, 1, 2].map(layer => {
      const buildings = [];
      for (let x = -100; x < 2100;) {
        const width = 45 + random() * (85 - layer * 12);
        const height = 80 + random() * (260 + layer * 65);
        buildings.push({ x, width, height, spire: random() > 0.55, seed: random() * 100 });
        x += width + 5;
      }
      return buildings;
    });
    this.batSignal = new BatSignal();
    this.reflectorBuilding = null;
    this.screenAspect = undefined;
  }
  draw(ctx, width, height, time, pointer = 0, reduced = false, screenAspect = null) {
    const c = LOBBY.colors;
    ctx.save();
    ctx.scale(width / LOBBY.base.width, height / LOBBY.base.height);
    const sky = ctx.createLinearGradient(0, 0, 0, 1080);
    sky.addColorStop(0, c.sky); sky.addColorStop(0.75, c.horizon); sky.addColorStop(1, c.near);
    ctx.fillStyle = sky; ctx.fillRect(0, 0, 1920, 1080);
    const offsets = this.layers.map((_, layer) => reduced ? 0 : Math.sin(time / 14000) * (layer + 1) * 5 + pointer * (layer + 1) * LOBBY.motion.parallax);
    if (!this.reflectorBuilding || this.screenAspect !== screenAspect) {
      // Seleciona uma vez por redimensionamento; o refletor permanece no mesmo prédio.
      const visible = visibleSky(LOBBY.base.width, LOBBY.base.height, screenAspect);
      const target = visible.x + visible.width * LOBBY.batSignal.sourceX;
      this.reflectorBuilding = this.layers[2].filter(building => !building.spire).reduce((nearest, building) =>
        Math.abs(building.x + building.width / 2 - target) < Math.abs(nearest.x + nearest.width / 2 - target) ? building : nearest);
      this.screenAspect = screenAspect;
    }
    const roof = this.reflectorBuilding;
    const source = { x: roof.x + roof.width / 2 + offsets[2], y: 895 + 2 * 95 - roof.height - 26 };
    this.layers.forEach((buildings, layer) => {
      const offset = offsets[layer];
      const ground = 895 + layer * 95;
      if (layer === 2) {
        // Luz à frente da cidade distante e atrás da camada do refletor.
        // Só a origem acompanha o parallax; lua e símbolo compartilham o centro.
        // Desfaz a escala desigual do cenário para conservar o círculo da lua.
        ctx.save(); ctx.scale(LOBBY.base.width / width, LOBBY.base.height / height);
        this.batSignal.drawSky(ctx, width, height, time, {
          x: source.x * width / LOBBY.base.width,
          y: source.y * height / LOBBY.base.height,
        }, reduced, screenAspect);
        ctx.restore();
      }
      ctx.save(); ctx.translate(offset, 0);
      for (const b of buildings) {
        const top = ground - b.height;
        ctx.fillStyle = [c.far, c.middle, c.near][layer];
        ctx.fillRect(b.x, top, b.width, 1100 - top);
        ctx.fillRect(b.x + b.width * 0.18, top - 12, b.width * 0.64, 16);
        if (b.spire) {
          ctx.fillRect(b.x + b.width / 2, top - 60, 3, 60);
          ctx.beginPath(); ctx.moveTo(b.x + 8, top); ctx.lineTo(b.x + b.width / 2, top - 32); ctx.lineTo(b.x + b.width - 8, top); ctx.fill();
          ctx.fillStyle = '#d2926c80'; ctx.fillRect(b.x + b.width / 2, top - 61, 3, 3);
        }
        for (let y = top + 22; y < ground; y += 23) {
          for (let x = b.x + 12; x < b.x + b.width - 8; x += 14) {
            if (Math.sin(x * 7 + y * 13 + b.seed) < 0.35) continue;
            ctx.fillStyle = layer === 2 ? '#b6b78d24' : '#c6b98c45';
            ctx.fillRect(x, y, 3, 7);
          }
        }
        if (layer === 2) this.batSignal.drawRim(ctx, b, top, source.x - offset, time, reduced);
      }
      ctx.restore();
      const drift = reduced ? 0 : Math.sin(time / LOBBY.motion.fog * Math.PI * 2 + layer) * 24;
      const fog = ctx.createLinearGradient(0, ground - 180 + drift, 0, ground + 30 + drift);
      fog.addColorStop(0, '#8fa9bc00'); fog.addColorStop(0.6, '#8fa9bc0e'); fog.addColorStop(1, '#8fa9bc00');
      ctx.fillStyle = fog; ctx.fillRect(0, ground - 180, 1920, 230);
    });
    this.batSignal.drawReflector(ctx, source, moonLayout(LOBBY.base.width, LOBBY.base.height, LOBBY.batSignal, screenAspect), time, reduced);
    if (!reduced) {
      ctx.strokeStyle = '#c0d7e414'; ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i < 100; i++) {
        const x = (i * 139 + time * 0.018) % 2000;
        const y = (i * 97 + time * 0.5) % 1080;
        ctx.moveTo(x, y); ctx.lineTo(x - 7, y + 24);
      }
      ctx.stroke();
    }
    const vignette = ctx.createRadialGradient(960, 420, 100, 960, 450, 1100);
    vignette.addColorStop(0, '#04080d22'); vignette.addColorStop(1, '#02050be8');
    ctx.fillStyle = vignette; ctx.fillRect(0, 0, 1920, 1080);
    ctx.restore();
  }
}
