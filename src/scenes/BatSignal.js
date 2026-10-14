import { LOBBY, assetURL } from '../config/lobby.js';

const clamp = value => Math.max(0, Math.min(1, value));
const smoothstep = value => { const t = clamp(value); return t * t * (3 - 2 * t); };
const rgba = (hex, alpha) => {
  const value = Number.parseInt(hex.slice(1), 16);
  return `rgba(${value >> 16},${(value >> 8) & 255},${value & 255},${alpha})`;
};

/** Remove somente o fundo claro, ou conserva o alfa de uma imagem transparente.
 * Os pixels da própria logo definem o contorno: nenhuma forma é redesenhada.
 * Executado no carregamento, nunca no loop de renderização.
 */
export function prepareSilhouette(pixels, width, height, background = 'auto', contrast = 12) {
  const transparent = background === 'transparent' || (background === 'auto' &&
    pixels.some((value, index) => index % 4 === 3 && value < 255));
  let left = width, top = height, right = -1, bottom = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      if (!transparent) {
        // Replica o contraste/inversão da logo, conservando bordas suavizadas.
        const luminance = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / (3 * 255);
        pixels[i + 3] = Math.round(pixels[i + 3] * (1 - clamp((luminance - 0.5) * contrast + 0.5)));
      }
      pixels[i] = pixels[i + 1] = pixels[i + 2] = 0;
      if (pixels[i + 3] > 0) {
        left = Math.min(left, x); right = Math.max(right, x);
        top = Math.min(top, y); bottom = Math.max(bottom, y);
      }
    }
  }
  return right < left ? null : { x: left, y: top, width: right - left + 1, height: bottom - top + 1 };
}

/** Área que continua visível quando o CSS object-fit: cover recorta o canvas. */
export function visibleSky(width, height, screenAspect = null) {
  if (!screenAspect || !Number.isFinite(screenAspect)) return { x: 0, y: 0, width, height };
  const stageAspect = LOBBY.base.width / LOBBY.base.height;
  const visibleWidth = width * Math.min(1, screenAspect / stageAspect);
  const visibleHeight = height * Math.min(1, stageAspect / screenAspect);
  return { x: (width - visibleWidth) / 2, y: (height - visibleHeight) / 2, width: visibleWidth, height: visibleHeight };
}

/** Um único centro determina lua, halo e símbolo, em qualquer tamanho de desenho. */
export function moonLayout(width, height, config = LOBBY.batSignal, screenAspect = null) {
  const scale = Math.min(width / LOBBY.base.width, height / LOBBY.base.height);
  const sky = visibleSky(width, height, screenAspect);
  const narrow = screenAspect !== null && screenAspect < 1;
  return {
    x: sky.x + sky.width * (narrow ? config.moon.narrowX : config.moon.x),
    y: sky.y + sky.height * (narrow ? config.moon.narrowY : config.moon.y),
    radius: config.moon.radius * scale * (narrow ? config.moon.narrowScale : 1),
  };
}

export function symbolBounds(moon, aspect, scale = LOBBY.batSignal.symbolScale) {
  // Inscreve a caixa no círculo: funciona também para logos altas ou quadradas.
  const diagonal = moon.radius * 2 * scale;
  const height = diagonal / Math.sqrt(aspect * aspect + 1);
  const width = height * aspect;
  return { x: moon.x - width / 2, y: moon.y - height / 2, width, height };
}

/** Bat-Sinal 2D: pequenos sprites em cache, composição aditiva e partículas limitadas.
 * O cenário fornece só a posição do refletor. Não há câmera 3D, perspectiva ou shaders.
 */
export class BatSignal {
  constructor(config = LOBBY.batSignal) {
    this.config = config;
    this.enteredAt = 0;
    this.mask = null;
    this.logoPath = null;
    this.textures = null;
    this.loadLogo();
  }

  enter(time = 0) {
    this.enteredAt = time;
    this.loadLogo(); // Só recarrega se a constante do caminho tiver mudado.
  }

  loadLogo() {
    const path = assetURL(LOBBY.assets.logo);
    if (this.logoPath === path || typeof Image === 'undefined') return;
    this.logoPath = path;
    this.mask = null;
    const image = new Image();
    image.onload = () => {
      if (this.logoPath !== path) return;
      try {
        const size = Math.min(1, this.config.maskMaxSize / Math.max(image.naturalWidth, image.naturalHeight));
        const canvas = this.createCanvas(Math.max(1, Math.round(image.naturalWidth * size)), Math.max(1, Math.round(image.naturalHeight * size)));
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const bounds = prepareSilhouette(data.data, canvas.width, canvas.height, this.config.logoBackground, this.config.maskContrast);
        if (!bounds) return;
        ctx.putImageData(data, 0, 0);
        this.mask = { canvas, ...bounds };
      } catch {
        // Arquivo inválido ou canvas indisponível: usa o placeholder existente.
        this.mask = null;
      }
    };
    image.onerror = () => { if (this.logoPath === path) this.mask = null; };
    image.src = path;
  }

  createCanvas(width, height) {
    if (!globalThis.document?.createElement) return null;
    const canvas = document.createElement('canvas');
    canvas.width = width; canvas.height = height;
    return canvas;
  }

  /** Lua plana com crateras, halo e feixe são preparados uma vez, em baixa resolução. */
  prepareTextures() {
    if (this.textures) return;
    const c = this.config, size = c.textureSize;
    const moon = this.createCanvas(size, size);
    const halo = this.createCanvas(size, size);
    const beam = this.createCanvas(size, size * 2);
    if (!moon || !halo || !beam) return;
    const m = moon.getContext('2d'), center = size / 2;
    m.fillStyle = c.colors.moon;
    m.beginPath(); m.arc(center, center, center - 1, 0, Math.PI * 2); m.fill();
    m.save(); m.clip();
    m.fillStyle = c.colors.crater; m.globalAlpha = c.moon.craterOpacity;
    // Manchas discretas, sem modelar uma esfera ou aplicar iluminação volumétrica.
    for (let i = 0; i < 17; i++) {
      const x = ((i * 71 + 31) % 251) / 251 * size;
      const y = ((i * 113 + 59) % 251) / 251 * size;
      m.beginPath(); m.ellipse(x, y, size * (0.025 + i % 4 * 0.012), size * (0.02 + i % 3 * 0.015), 0, 0, Math.PI * 2); m.fill();
    }
    m.restore();
    const h = halo.getContext('2d');
    const glow = h.createRadialGradient(center, center, 0, center, center, center);
    glow.addColorStop(0, rgba(c.colors.halo, 0.7));
    glow.addColorStop(0.3, rgba(c.colors.halo, 0.3));
    glow.addColorStop(0.65, rgba(c.colors.halo, 0.08));
    glow.addColorStop(1, rgba(c.colors.halo, 0));
    h.fillStyle = glow; h.fillRect(0, 0, size, size);
    const b = beam.getContext('2d'), image = b.createImageData(beam.width, beam.height);
    const color = Number.parseInt(c.colors.beam.slice(1), 16);
    // Alfa acompanha as laterais inclinadas do cone: sem bordas duras ou blur caro.
    for (let y = 0; y < beam.height; y++) {
      const progress = 1 - y / (beam.height - 1);
      const half = (0.018 + progress * 0.982) * beam.width / 2;
      for (let x = 0; x < beam.width; x++) {
        const index = (y * beam.width + x) * 4;
        const edge = clamp(1 - Math.abs(x - beam.width / 2) / half);
        image.data[index] = color >> 16;
        image.data[index + 1] = (color >> 8) & 255;
        image.data[index + 2] = color & 255;
        image.data[index + 3] = Math.round(255 * Math.pow(edge, c.beamEdgeSoftness) * (0.45 + progress * 0.55));
      }
    }
    b.putImageData(image, 0, 0);
    this.textures = { moon, halo, beam };
  }

  intensity(time, reduced = false) {
    const c = this.config;
    const fade = smoothstep((time - this.enteredAt) / Math.max(1, c.fadeIn));
    const phase = time / 1000 * c.flickerSpeed * Math.PI * 2;
    const wave = reduced ? 0 : Math.sin(phase) * 0.7 + Math.sin(phase * 1.73) * 0.3;
    return { fade, light: clamp(c.intensity * fade * (1 + c.flickerAmount * wave)) };
  }

  drawSky(ctx, width, height, time, source, reduced = false, screenAspect = null) {
    this.prepareTextures();
    const textures = this.textures;
    if (!textures) return;
    const c = this.config, moon = moonLayout(width, height, c, screenAspect);
    const { fade, light } = this.intensity(time, reduced);
    const radius = moon.radius;
    ctx.save(); ctx.imageSmoothingEnabled = true;
    ctx.drawImage(textures.moon, moon.x - radius, moon.y - radius, radius * 2, radius * 2);
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = light * c.glowIntensity;
    const haloRadius = radius * c.haloRadius;
    ctx.drawImage(textures.halo, moon.x - haloRadius, moon.y - haloRadius, haloRadius * 2, haloRadius * 2);
    this.drawBeam(ctx, moon, source, time, light, reduced);
    // A silhueta é preta sólida; o flicker afeta a luz, nunca clareia o símbolo.
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = fade;
    const mask = this.mask;
    const box = symbolBounds(moon, mask ? mask.width / mask.height : 2.8, c.symbolScale);
    if (mask) {
      ctx.drawImage(mask.canvas, mask.x, mask.y, mask.width, mask.height, box.x, box.y, box.width, box.height);
    } else {
      ctx.fillStyle = c.colors.symbol;
      ctx.beginPath();
      c.placeholder.forEach(([x, y], i) => ctx[i ? 'lineTo' : 'moveTo'](box.x + x * box.width, box.y + y * box.height));
      ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }

  drawBeam(ctx, moon, source, time, light, reduced) {
    const c = this.config;
    const dx = moon.x - source.x, dy = moon.y - source.y;
    const length = Math.hypot(dx, dy), width = moon.radius * c.beamWidth;
    const scale = moon.radius / c.moon.radius;
    if (length < 1) return;
    ctx.save(); ctx.translate(source.x, source.y); ctx.rotate(Math.atan2(dx, -dy));
    ctx.globalAlpha = light * c.beamOpacity;
    ctx.drawImage(this.textures.beam, -width / 2, -length, width, length);
    ctx.beginPath(); ctx.moveTo(-c.sourceWidth * scale / 2, 0); ctx.lineTo(-width / 2, -length);
    ctx.lineTo(width / 2, -length); ctx.lineTo(c.sourceWidth * scale / 2, 0); ctx.closePath(); ctx.clip();
    const seconds = reduced ? 0 : time / 1000;
    for (let i = 0; i < 3; i++) {
      const progress = ((i + 0.35) / 3 + seconds * c.mistSpeed) % 1;
      const x = Math.sin(i * 2.1 + seconds * 0.12) * width * progress * 0.24;
      ctx.globalAlpha = light * c.mistOpacity * Math.sin(progress * Math.PI);
      ctx.drawImage(this.textures.halo, x - width * 0.6, -length * progress - 34 * scale, width * 1.2, 68 * scale);
    }
    ctx.fillStyle = c.colors.dust;
    for (let i = 0; i < c.dustCount; i++) {
      const progress = (i * 0.618034 + seconds * c.dustSpeed) % 1;
      const x = Math.sin(i * 2.4 + seconds * 0.1) * width * progress * 0.36;
      ctx.globalAlpha = light * c.dustOpacity * Math.sin(progress * Math.PI);
      ctx.beginPath(); ctx.arc(x, -length * progress, (0.8 + i % 3 * 0.35) * scale, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  /** Contorno no plano dos prédios, desenhado dentro do mesmo parallax da camada. */
  drawRim(ctx, building, top, sourceX, time, reduced) {
    const c = this.config;
    const distance = Math.abs(building.x + building.width / 2 - sourceX);
    const proximity = clamp(1 - distance / c.rimDistance);
    if (!proximity) return;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = this.intensity(time, reduced).light * c.rimIntensity * proximity;
    ctx.strokeStyle = c.colors.rim; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(building.x, top + 38); ctx.lineTo(building.x, top);
    ctx.lineTo(building.x + building.width * 0.18, top);
    ctx.lineTo(building.x + building.width * 0.18, top - 12);
    ctx.lineTo(building.x + building.width * 0.82, top - 12);
    ctx.lineTo(building.x + building.width * 0.82, top);
    ctx.lineTo(building.x + building.width, top); ctx.stroke(); ctx.restore();
  }

  drawReflector(ctx, source, moon, time, reduced) {
    const c = this.config;
    ctx.save(); ctx.strokeStyle = c.colors.fixtureEdge; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(source.x, source.y + 3); ctx.lineTo(source.x, source.y + 14); ctx.stroke();
    ctx.translate(source.x, source.y); ctx.rotate(Math.atan2(moon.x - source.x, source.y - moon.y));
    ctx.fillStyle = c.colors.fixture; ctx.fillRect(-9, -4, 18, 9);
    ctx.strokeStyle = c.colors.fixtureEdge; ctx.lineWidth = 1; ctx.strokeRect(-9, -4, 18, 9);
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = this.intensity(time, reduced).light;
    ctx.fillStyle = c.colors.beam; ctx.fillRect(-c.sourceWidth / 2, -5, c.sourceWidth, 2);
    ctx.restore();
  }
}
