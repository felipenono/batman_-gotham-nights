// Este arquivo cuida de preparar e desenhar a lua, a silhueta e a luz do Bat-Sinal.
// ===== DEPENDÊNCIAS E CONFIGURAÇÕES =====
import { LOBBY, assetURL } from "../../config/configuracao.js";
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
  /** Lua com crateras, halo, borda luminosa, feixe e névoa do feixe: preparados uma vez, em baixa resolução. */
  prepareTextures() {
    if (this.textures) return;
    const parametrosLocais = this.config, size = parametrosLocais.textureSize;
    const moon = this.createCanvas(size, size);
    const halo = this.createCanvas(size, size);
    const rim = this.createCanvas(size, size);
    const beam = this.createCanvas(size, size * 2);
    const mist = this.createCanvas(size, size / 2);
    if (!moon || !halo || !rim || !beam || !mist) return;
    const center = size / 2, cores = parametrosLocais.colors;
    // Lua: disco plano, um pouco mais escuro na borda (sem volume 3D), com crateras discretas.
    const contextoLua = moon.getContext("2d");
    const superficie = contextoLua.createRadialGradient(center, center, 0, center, center, center);
    superficie.addColorStop(0, cores.moon);
    superficie.addColorStop(0.8, cores.moon);
    superficie.addColorStop(1, cores.moonEdge);
    contextoLua.fillStyle = superficie;
    contextoLua.beginPath();
    contextoLua.arc(center, center, center - 1, 0, Math.PI * 2);
    contextoLua.fill();
    contextoLua.save();
    contextoLua.clip();
    contextoLua.fillStyle = cores.crater;
    contextoLua.globalAlpha = parametrosLocais.moon.craterOpacity;
    for (let indiceItem = 0; indiceItem < 17; indiceItem++) {
      const posicaoX = (indiceItem * 71 + 31) % 251 / 251 * size;
      const posicaoY = (indiceItem * 113 + 59) % 251 / 251 * size;
      contextoLua.beginPath();
      contextoLua.ellipse(posicaoX, posicaoY, size * (0.025 + indiceItem % 4 * 0.012), size * (0.02 + indiceItem % 3 * 0.015), 0, 0, Math.PI * 2);
      contextoLua.fill();
    }
    contextoLua.restore();
    // Halo: queda suave e longa da luz branco-amarelada (o centro fica escondido atrás da lua).
    const contextoHalo = halo.getContext("2d");
    const glow = contextoHalo.createRadialGradient(center, center, 0, center, center, center);
    [[0, 0.5], [0.2, 0.36], [0.38, 0.17], [0.55, 0.07], [0.75, 0.02], [1, 0]].forEach(([parada, alfa]) => glow.addColorStop(parada, rgba(cores.halo, alfa)));
    contextoHalo.fillStyle = glow;
    contextoHalo.fillRect(0, 0, size, size);
    // Borda luminosa: um anel estreito logo fora do disco, que separa a superfície da lua do halo.
    const contextoBorda = rim.getContext("2d");
    // A textura cobre 1,6 raio: o anel começa dentro do disco (0,9 raio), é mais forte
    // exatamente na borda (1 raio) e some até 1,6 raio. Assim não sobra faixa escura em volta.
    const anel = contextoBorda.createRadialGradient(center, center, center * 0.9 / 1.6, center, center, center);
    anel.addColorStop(0, rgba(cores.halo, 0));
    anel.addColorStop(0.14, rgba(cores.halo, 0.6));
    anel.addColorStop(0.4, rgba(cores.halo, 0.18));
    anel.addColorStop(1, rgba(cores.halo, 0));
    contextoBorda.fillStyle = anel;
    contextoBorda.fillRect(0, 0, size, size);
    // Feixe: o alfa acompanha as laterais inclinadas do cone e some devagar nas bordas.
    const contextoFeixe = beam.getContext("2d"), imagem = contextoFeixe.createImageData(beam.width, beam.height);
    const cor = Number.parseInt(cores.beam.slice(1), 16);
    for (let posicaoY = 0; posicaoY < beam.height; posicaoY++) {
      const progress = 1 - posicaoY / (beam.height - 1);
      const half = (0.018 + progress * 0.982) * beam.width / 2;
      // Perto do refletor a luz é mais concentrada; perto da lua, mais espalhada (mas ainda chega lá).
      const longitudinal = 0.78 + (1 - progress) * 0.22;
      for (let posicaoX = 0; posicaoX < beam.width; posicaoX++) {
        const indice = (posicaoY * beam.width + posicaoX) * 4;
        // Miolo uniforme; só a parte externa (beamEdgeSoftness da meia-largura) esmaece.
        const edge = clamp(1 - Math.abs(posicaoX - beam.width / 2) / half);
        const borda = smoothstep(edge / Math.max(0.01, parametrosLocais.beamEdgeSoftness));
        imagem.data[indice] = cor >> 16;
        imagem.data[indice + 1] = cor >> 8 & 255;
        imagem.data[indice + 2] = cor & 255;
        imagem.data[indice + 3] = Math.round(255 * borda * longitudinal);
      }
    }
    contextoFeixe.putImageData(imagem, 0, 0);
    // Névoa do feixe: mancha alongada e muito fraca, na cor do próprio feixe (nunca cinza).
    const contextoNevoa = mist.getContext("2d");
    contextoNevoa.translate(size / 2, size / 4);
    contextoNevoa.scale(1, 0.5);
    const nevoa = contextoNevoa.createRadialGradient(0, 0, 0, 0, 0, size / 2);
    nevoa.addColorStop(0, rgba(cores.beam, 0.5));
    nevoa.addColorStop(1, rgba(cores.beam, 0));
    contextoNevoa.fillStyle = nevoa;
    contextoNevoa.fillRect(-size / 2, -size / 2, size, size);
    this.textures = { moon, halo, rim, beam, mist };
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
  /**
   * Bat-Sinal no céu do lobby e das telas finais. Uma única lua (centro e raio) define
   * halo, disco, símbolo e o fim do feixe; a origem do feixe é a lente do refletor.
   * Devolve a lua usada, para o refletor apontar para o mesmo lugar.
   */
  drawSky(contexto, largura, altura, tempo, origem, reduced = false, screenAspect = null, moon = moonLayout(largura, altura, this.config, screenAspect), lente = undefined) {
    this.prepareTextures();
    if (!this.textures) return moon;
    const { fade, light } = this.intensity(tempo, reduced);
    this.drawHalo(contexto, moon, light);
    this.drawBeam(contexto, moon, origem, tempo, light, reduced, undefined, lente);
    this.drawMoon(contexto, moon, fade, light);
    return moon;
  }
  // Halo atrás da lua, em composição aditiva.
  drawHalo(contexto, moon, light) {
    this.prepareTextures();
    if (!this.textures) return;
    const raioHalo = moon.radius * this.config.haloRadius;
    contexto.save();
    contexto.imageSmoothingEnabled = true;
    contexto.globalCompositeOperation = "lighter";
    contexto.globalAlpha = clamp(light * this.config.glowIntensity);
    contexto.drawImage(this.textures.halo, moon.x - raioHalo, moon.y - raioHalo, raioHalo * 2, raioHalo * 2);
    contexto.restore();
  }
  // Disco com textura, borda luminosa fina e a silhueta preta da logo no centro.
  drawMoon(contexto, moon, fade, light) {
    this.prepareTextures();
    if (!this.textures) return;
    const parametrosLocais = this.config, radius = moon.radius;
    contexto.save();
    contexto.imageSmoothingEnabled = true;
    contexto.drawImage(this.textures.moon, moon.x - radius, moon.y - radius, radius * 2, radius * 2);
    contexto.globalCompositeOperation = "lighter";
    contexto.globalAlpha = clamp(light * parametrosLocais.rimGlow);
    const raioBorda = radius * 1.6;
    contexto.drawImage(this.textures.rim, moon.x - raioBorda, moon.y - raioBorda, raioBorda * 2, raioBorda * 2);
    // A silhueta é preta sólida; a oscilação afeta a luz, nunca clareia o símbolo.
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
  // Ponto exato da lente: a frente do refletor, já girado na direção do centro da lua.
  lensPoint(origem, moon, escala = moon.radius / this.config.moon.radius) {
    const dx = moon.x - origem.x, dy = moon.y - origem.y;
    const distancia = Math.hypot(dx, dy) || 1;
    const avanco = this.config.lensOffset * escala;
    return { x: origem.x + dx / distancia * avanco, y: origem.y + dy / distancia * avanco };
  }
  /**
   * Feixe da lente até o CENTRO da lua; no fim, a largura é a do círculo iluminado.
   * Não é desenhado sobre o disco (recorte), para não lavar a textura da lua.
   */
  drawBeam(contexto, moon, origem, tempo, light, reduced, escala = moon.radius / this.config.moon.radius, lente = this.lensPoint(origem, moon, escala)) {
    this.prepareTextures();
    if (!this.textures) return;
    const parametrosLocais = this.config;
    const dx = moon.x - lente.x, dy = moon.y - lente.y;
    const length = Math.hypot(dx, dy), largura = moon.radius * parametrosLocais.beamWidth;
    if (length < 1) return;
    contexto.save();
    contexto.imageSmoothingEnabled = true;
    // Recorte: tudo menos o disco da lua.
    contexto.beginPath();
    contexto.rect(lente.x - length * 4, lente.y - length * 4, length * 8, length * 8);
    contexto.arc(moon.x, moon.y, moon.radius * 0.97, 0, Math.PI * 2);
    contexto.clip("evenodd");
    contexto.translate(lente.x, lente.y);
    contexto.rotate(Math.atan2(dx, -dy));
    contexto.globalCompositeOperation = "lighter";
    contexto.globalAlpha = clamp(light * parametrosLocais.beamOpacity);
    contexto.drawImage(this.textures.beam, -largura / 2, -length, largura, length);
    // Névoa e poeira só dentro do cone.
    contexto.beginPath();
    contexto.moveTo(-parametrosLocais.sourceWidth * escala / 2, 0);
    contexto.lineTo(-largura / 2, -length);
    contexto.lineTo(largura / 2, -length);
    contexto.lineTo(parametrosLocais.sourceWidth * escala / 2, 0);
    contexto.closePath();
    contexto.clip();
    const segundos = reduced ? 0 : tempo / 1000;
    for (let indiceItem = 0; indiceItem < parametrosLocais.mistCount; indiceItem++) {
      const progress = ((indiceItem + 0.5) / parametrosLocais.mistCount + segundos * parametrosLocais.mistSpeed) % 1;
      const larguraNevoa = largura * (0.35 + progress * 0.7);
      contexto.globalAlpha = clamp(light * parametrosLocais.mistOpacity * Math.sin(progress * Math.PI));
      contexto.drawImage(this.textures.mist, -larguraNevoa / 2, -length * progress - larguraNevoa * 0.18, larguraNevoa, larguraNevoa * 0.36);
    }
    contexto.fillStyle = parametrosLocais.colors.dust;
    for (let indiceItem = 0; indiceItem < parametrosLocais.dustCount; indiceItem++) {
      const progress = (indiceItem * 0.618034 + segundos * parametrosLocais.dustSpeed) % 1;
      const posicaoX = Math.sin(indiceItem * 2.4 + segundos * 0.1) * largura * progress * 0.36;
      contexto.globalAlpha = clamp(light * parametrosLocais.dustOpacity * Math.sin(progress * Math.PI));
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
  // Refletor girado para o centro da mesma lua do feixe; a faixa clara é a lente (origem do feixe).
  drawReflector(contexto, origem, moon, tempo, reduced, escala = 1) {
    const parametrosLocais = this.config;
    contexto.save();
    contexto.translate(origem.x, origem.y);
    contexto.scale(escala, escala);
    contexto.strokeStyle = parametrosLocais.colors.fixtureEdge;
    contexto.lineWidth = 3;
    contexto.beginPath();
    contexto.moveTo(0, 3);
    contexto.lineTo(0, 14);
    contexto.stroke();
    contexto.rotate(Math.atan2(moon.x - origem.x, origem.y - moon.y));
    contexto.fillStyle = parametrosLocais.colors.fixture;
    contexto.fillRect(-9, -4, 18, 9);
    contexto.strokeStyle = parametrosLocais.colors.fixtureEdge;
    contexto.lineWidth = 1;
    contexto.strokeRect(-9, -4, 18, 9);
    contexto.globalCompositeOperation = "lighter";
    contexto.globalAlpha = this.intensity(tempo, reduced).light;
    contexto.fillStyle = parametrosLocais.colors.beam;
    contexto.fillRect(-parametrosLocais.sourceWidth / 2, -parametrosLocais.lensOffset, parametrosLocais.sourceWidth, 2);
    contexto.restore();
  }
}
