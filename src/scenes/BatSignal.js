// Este arquivo cuida de preparar e desenhar a lua, a silhueta e a luz do Bat-Sinal.
// ===== DEPENDÊNCIAS E CONFIGURAÇÕES =====
import { LOBBY, assetURL } from "../config/configuracao.js";
const clamp = (valor) => Math.max(0, Math.min(1, valor));
const smoothstep = (valor) => {
  const fracao = clamp(valor);
  return fracao * fracao * (3 - 2 * fracao);
};
const rgba = (hex, opacidade) => {
  const valor = Number.parseInt(hex.slice(1), 16);
  return `rgba(${valor >> 16},${valor >> 8 & 255},${valor & 255},${opacidade})`;
};
/** Remove somente o fundo claro, ou conserva o alfa de uma imagem transparente.
* Os pixels da própria logo definem o contorno: nenhuma forma é redesenhada.
* Executado no carregamento, nunca no loop de renderização.
*/
export function prepareSilhouette(pixels, largura, altura, background = "auto", contrast = 12) {
  const transparent = background === "transparent" || background === "auto" && pixels.some((valor, indice) => indice % 4 === 3 && valor < 255);
  let left = largura, top = altura, right = -1, bottom = -1;
  for (let posicaoY = 0; posicaoY < altura; posicaoY++) {
    for (let posicaoX = 0; posicaoX < largura; posicaoX++) {
      const indiceItem = (posicaoY * largura + posicaoX) * 4;
      if (!transparent) {
        // Replica o contraste/inversão da logo, conservando bordas suavizadas.
        const luminance = (pixels[indiceItem] + pixels[indiceItem + 1] + pixels[indiceItem + 2]) / (3 * 255);
        pixels[indiceItem + 3] = Math.round(pixels[indiceItem + 3] * (1 - clamp((luminance - 0.5) * contrast + 0.5)));
      }
      pixels[indiceItem] = pixels[indiceItem + 1] = pixels[indiceItem + 2] = 0;
      if (pixels[indiceItem + 3] > 0) {
        left = Math.min(left, posicaoX);
        right = Math.max(right, posicaoX);
        top = Math.min(top, posicaoY);
        bottom = Math.max(bottom, posicaoY);
      }
    }
  }
  return right < left ? null : {
    x: left,
    y: top,
    width: right - left + 1,
    height: bottom - top + 1
  };
}
/** Área que continua visível quando o CSS object-fit: cover recorta o canvas. */
export function visibleSky(largura, altura, screenAspect = null) {
  if (!screenAspect || !Number.isFinite(screenAspect)) return {
    x: 0,
    y: 0,
    width: largura,
    height: altura
  };
  const stageAspect = LOBBY.base.width / LOBBY.base.height;
  const visibleWidth = largura * Math.min(1, screenAspect / stageAspect);
  const visibleHeight = altura * Math.min(1, stageAspect / screenAspect);
  return {
    x: (largura - visibleWidth) / 2,
    y: (altura - visibleHeight) / 2,
    width: visibleWidth,
    height: visibleHeight
  };
}
/** Um único centro determina lua, halo e símbolo, em qualquer tamanho de desenho. */
export function moonLayout(largura, altura, configuracao = LOBBY.batSignal, screenAspect = null) {
  const escala = Math.min(largura / LOBBY.base.width, altura / LOBBY.base.height);
  const sky = visibleSky(largura, altura, screenAspect);
  const narrow = screenAspect !== null && screenAspect < 1;
  return {
    x: sky.x + sky.width * (narrow ? configuracao.moon.narrowX : configuracao.moon.x),
    y: sky.y + sky.height * (narrow ? configuracao.moon.narrowY : configuracao.moon.y),
    radius: configuracao.moon.radius * escala * (narrow ? configuracao.moon.narrowScale : 1)
  };
}
export function symbolBounds(moon, aspect, escala = LOBBY.batSignal.symbolScale) {
  // Inscreve a caixa no círculo: funciona também para logos altas ou quadradas.
  const diagonal = moon.radius * 2 * escala;
  const altura = diagonal / Math.sqrt(aspect * aspect + 1);
  const largura = altura * aspect;
  return {
    x: moon.x - largura / 2,
    y: moon.y - altura / 2,
    width: largura,
    height: altura
  };
}
/** Bat-Sinal 2D: pequenos sprites em cache, composição aditiva e partículas limitadas.
* O cenário fornece só a posição do refletor. Não há câmera 3D, perspectiva ou shaders.
*/
// ===== COMPORTAMENTO =====
export class BatSignal {
  // Recebe as dependências e prepara o estado inicial deste componente.
  constructor(configuracao = LOBBY.batSignal) {
    this.config = configuracao;
    this.enteredAt = 0;
    this.mask = null;
    this.logoPath = null;
    this.textures = null;
    this.loadLogo();
  }
  enter(tempo = 0) {
    this.enteredAt = tempo;
    this.loadLogo();
  }
  loadLogo() {
    const path = assetURL(LOBBY.assets.logo);
    if (this.logoPath === path || typeof Image === "undefined") return;
    this.logoPath = path;
    this.mask = null;
    const imagem = new Image();
    imagem.onload = () => {
      if (this.logoPath !== path) return;
      try {
        const size = Math.min(1, this.config.maskMaxSize / Math.max(imagem.naturalWidth, imagem.naturalHeight));
        const canvas = this.createCanvas(Math.max(1, Math.round(imagem.naturalWidth * size)), Math.max(1, Math.round(imagem.naturalHeight * size)));
        if (!canvas) return;
        const contexto = canvas.getContext("2d", { willReadFrequently: true });
        contexto.drawImage(imagem, 0, 0, canvas.width, canvas.height);
        const dados = contexto.getImageData(0, 0, canvas.width, canvas.height);
        const limites = prepareSilhouette(dados.data, canvas.width, canvas.height, this.config.logoBackground, this.config.maskContrast);
        if (!limites) return;
        contexto.putImageData(dados, 0, 0);
        this.mask = {
          canvas,
          ...limites
        };
      } catch {
        // Arquivo inválido ou canvas indisponível: usa o placeholder existente.
        this.mask = null;
      }
    };
    imagem.onerror = () => {
      if (this.logoPath === path) this.mask = null;
    };
    imagem.src = path;
  }
  createCanvas(largura, altura) {
    if (!globalThis.document?.createElement) return null;
    const canvas = document.createElement("canvas");
    canvas.width = largura;
    canvas.height = altura;
    return canvas;
  }
  /** Lua plana com crateras, halo e feixe são preparados uma vez, em baixa resolução. */
  prepareTextures() {
    if (this.textures) return;
    const parametrosLocais = this.config, size = parametrosLocais.textureSize;
    const moon = this.createCanvas(size, size);
    const halo = this.createCanvas(size, size);
    const beam = this.createCanvas(size, size * 2);
    if (!moon || !halo || !beam) return;
    const contextoLua = moon.getContext("2d"), center = size / 2;
    contextoLua.fillStyle = parametrosLocais.colors.moon;
    contextoLua.beginPath();
    contextoLua.arc(center, center, center - 1, 0, Math.PI * 2);
    contextoLua.fill();
    contextoLua.save();
    contextoLua.clip();
    contextoLua.fillStyle = parametrosLocais.colors.crater;
    contextoLua.globalAlpha = parametrosLocais.moon.craterOpacity;
    // Manchas discretas, sem modelar uma esfera ou aplicar iluminação volumétrica.
    for (let indiceItem = 0; indiceItem < 17; indiceItem++) {
      const posicaoX = (indiceItem * 71 + 31) % 251 / 251 * size;
      const posicaoY = (indiceItem * 113 + 59) % 251 / 251 * size;
      contextoLua.beginPath();
      contextoLua.ellipse(posicaoX, posicaoY, size * (0.025 + indiceItem % 4 * 0.012), size * (0.02 + indiceItem % 3 * 0.015), 0, 0, Math.PI * 2);
      contextoLua.fill();
    }
    contextoLua.restore();
    const contextoHalo = halo.getContext("2d");
    const glow = contextoHalo.createRadialGradient(center, center, 0, center, center, center);
    glow.addColorStop(0, rgba(parametrosLocais.colors.halo, 0.7));
    glow.addColorStop(0.3, rgba(parametrosLocais.colors.halo, 0.3));
    glow.addColorStop(0.65, rgba(parametrosLocais.colors.halo, 0.08));
    glow.addColorStop(1, rgba(parametrosLocais.colors.halo, 0));
    contextoHalo.fillStyle = glow;
    contextoHalo.fillRect(0, 0, size, size);
    const contextoFeixe = beam.getContext("2d"), imagem = contextoFeixe.createImageData(beam.width, beam.height);
    const cor = Number.parseInt(parametrosLocais.colors.beam.slice(1), 16);
    // Alfa acompanha as laterais inclinadas do cone: sem bordas duras ou blur caro.
    for (let posicaoY = 0; posicaoY < beam.height; posicaoY++) {
      const progress = 1 - posicaoY / (beam.height - 1);
      const half = (0.018 + progress * 0.982) * beam.width / 2;
      for (let posicaoX = 0; posicaoX < beam.width; posicaoX++) {
        const indice = (posicaoY * beam.width + posicaoX) * 4;
        const edge = clamp(1 - Math.abs(posicaoX - beam.width / 2) / half);
        imagem.data[indice] = cor >> 16;
        imagem.data[indice + 1] = cor >> 8 & 255;
        imagem.data[indice + 2] = cor & 255;
        imagem.data[indice + 3] = Math.round(255 * Math.pow(edge, parametrosLocais.beamEdgeSoftness) * (0.45 + progress * 0.55));
      }
    }
    contextoFeixe.putImageData(imagem, 0, 0);
    this.textures = {
      moon,
      halo,
      beam
    };
  }
  intensity(tempo, reduced = false) {
    const parametrosLocais = this.config;
    const fade = smoothstep((tempo - this.enteredAt) / Math.max(1, parametrosLocais.fadeIn));
    const phase = tempo / 1000 * parametrosLocais.flickerSpeed * Math.PI * 2;
    const wave = reduced ? 0 : Math.sin(phase) * 0.7 + Math.sin(phase * 1.73) * 0.3;
    return {
      fade,
      light: clamp(parametrosLocais.intensity * fade * (1 + parametrosLocais.flickerAmount * wave))
    };
  }
  drawSky(contexto, largura, altura, tempo, origem, reduced = false, screenAspect = null) {
    this.prepareTextures();
    const textures = this.textures;
    if (!textures) return;
    const parametrosLocais = this.config, moon = moonLayout(largura, altura, parametrosLocais, screenAspect);
    const { fade, light } = this.intensity(tempo, reduced);
    const radius = moon.radius;
    contexto.save();
    contexto.imageSmoothingEnabled = true;
    contexto.drawImage(textures.moon, moon.x - radius, moon.y - radius, radius * 2, radius * 2);
    contexto.globalCompositeOperation = "lighter";
    contexto.globalAlpha = light * parametrosLocais.glowIntensity;
    const haloRadius = radius * parametrosLocais.haloRadius;
    contexto.drawImage(textures.halo, moon.x - haloRadius, moon.y - haloRadius, haloRadius * 2, haloRadius * 2);
    this.drawBeam(contexto, moon, origem, tempo, light, reduced);
    // A silhueta é preta sólida; o flicker afeta a luz, nunca clareia o símbolo.
    contexto.globalCompositeOperation = "source-over";
    contexto.globalAlpha = fade;
    const mask = this.mask;
    const box = symbolBounds(moon, mask ? mask.width / mask.height : 2.8, parametrosLocais.symbolScale);
    if (mask) {
      contexto.drawImage(mask.canvas, mask.x, mask.y, mask.width, mask.height, box.x, box.y, box.width, box.height);
    } else {
      contexto.fillStyle = parametrosLocais.colors.symbol;
      contexto.beginPath();
      parametrosLocais.placeholder.forEach(([posicaoX, posicaoY], indiceItem) => contexto[indiceItem ? "lineTo" : "moveTo"](box.x + posicaoX * box.width, box.y + posicaoY * box.height));
      contexto.closePath();
      contexto.fill();
    }
    contexto.restore();
  }
  drawBeam(contexto, moon, origem, tempo, light, reduced) {
    const parametrosLocais = this.config;
    const dx = moon.x - origem.x, dy = moon.y - origem.y;
    const length = Math.hypot(dx, dy), largura = moon.radius * parametrosLocais.beamWidth;
    const escala = moon.radius / parametrosLocais.moon.radius;
    if (length < 1) return;
    contexto.save();
    contexto.translate(origem.x, origem.y);
    contexto.rotate(Math.atan2(dx, -dy));
    contexto.globalAlpha = light * parametrosLocais.beamOpacity;
    contexto.drawImage(this.textures.beam, -largura / 2, -length, largura, length);
    contexto.beginPath();
    contexto.moveTo(-parametrosLocais.sourceWidth * escala / 2, 0);
    contexto.lineTo(-largura / 2, -length);
    contexto.lineTo(largura / 2, -length);
    contexto.lineTo(parametrosLocais.sourceWidth * escala / 2, 0);
    contexto.closePath();
    contexto.clip();
    const segundos = reduced ? 0 : tempo / 1000;
    for (let indiceItem = 0; indiceItem < 3; indiceItem++) {
      const progress = ((indiceItem + 0.35) / 3 + segundos * parametrosLocais.mistSpeed) % 1;
      const posicaoX = Math.sin(indiceItem * 2.1 + segundos * 0.12) * largura * progress * 0.24;
      contexto.globalAlpha = light * parametrosLocais.mistOpacity * Math.sin(progress * Math.PI);
      contexto.drawImage(this.textures.halo, posicaoX - largura * 0.6, -length * progress - 34 * escala, largura * 1.2, 68 * escala);
    }
    contexto.fillStyle = parametrosLocais.colors.dust;
    for (let indiceItem = 0; indiceItem < parametrosLocais.dustCount; indiceItem++) {
      const progress = (indiceItem * 0.618034 + segundos * parametrosLocais.dustSpeed) % 1;
      const posicaoX = Math.sin(indiceItem * 2.4 + segundos * 0.1) * largura * progress * 0.36;
      contexto.globalAlpha = light * parametrosLocais.dustOpacity * Math.sin(progress * Math.PI);
      contexto.beginPath();
      contexto.arc(posicaoX, -length * progress, (0.8 + indiceItem % 3 * 0.35) * escala, 0, Math.PI * 2);
      contexto.fill();
    }
    contexto.restore();
  }
  /** Contorno no plano dos prédios, desenhado dentro do mesmo parallax da camada. */
  drawRim(contexto, building, top, sourceX, tempo, reduced) {
    const parametrosLocais = this.config;
    const distance = Math.abs(building.x + building.width / 2 - sourceX);
    const proximity = clamp(1 - distance / parametrosLocais.rimDistance);
    if (!proximity) return;
    contexto.save();
    contexto.globalCompositeOperation = "lighter";
    contexto.globalAlpha = this.intensity(tempo, reduced).light * parametrosLocais.rimIntensity * proximity;
    contexto.strokeStyle = parametrosLocais.colors.rim;
    contexto.lineWidth = 1.5;
    contexto.beginPath();
    contexto.moveTo(building.x, top + 38);
    contexto.lineTo(building.x, top);
    contexto.lineTo(building.x + building.width * 0.18, top);
    contexto.lineTo(building.x + building.width * 0.18, top - 12);
    contexto.lineTo(building.x + building.width * 0.82, top - 12);
    contexto.lineTo(building.x + building.width * 0.82, top);
    contexto.lineTo(building.x + building.width, top);
    contexto.stroke();
    contexto.restore();
  }
  drawReflector(contexto, origem, moon, tempo, reduced) {
    const parametrosLocais = this.config;
    contexto.save();
    contexto.strokeStyle = parametrosLocais.colors.fixtureEdge;
    contexto.lineWidth = 3;
    contexto.beginPath();
    contexto.moveTo(origem.x, origem.y + 3);
    contexto.lineTo(origem.x, origem.y + 14);
    contexto.stroke();
    contexto.translate(origem.x, origem.y);
    contexto.rotate(Math.atan2(moon.x - origem.x, origem.y - moon.y));
    contexto.fillStyle = parametrosLocais.colors.fixture;
    contexto.fillRect(-9, -4, 18, 9);
    contexto.strokeStyle = parametrosLocais.colors.fixtureEdge;
    contexto.lineWidth = 1;
    contexto.strokeRect(-9, -4, 18, 9);
    contexto.globalCompositeOperation = "lighter";
    contexto.globalAlpha = this.intensity(tempo, reduced).light;
    contexto.fillStyle = parametrosLocais.colors.beam;
    contexto.fillRect(-parametrosLocais.sourceWidth / 2, -5, parametrosLocais.sourceWidth, 2);
    contexto.restore();
  }
}
