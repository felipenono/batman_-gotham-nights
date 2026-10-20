// Este arquivo cuida de carregar, recortar e recolorir as imagens de referência.
// ===== DEPENDÊNCIAS E CONFIGURAÇÕES =====
export const REFERENCE_URLS = {
  joker: new URL("../../assets/sprites/joker_reference.png", import.meta.url).href,
  batman: new URL("../../assets/sprites/batman_reference.png", import.meta.url).href,
  penguin: new URL("../../assets/sprites/penguin_reference.png", import.meta.url).href,
  scarecrow: new URL("../../assets/sprites/scarecrow_reference.png", import.meta.url).href,
  two_face: new URL("../../assets/sprites/two_face_reference.png", import.meta.url).href,
  harley_quinn: new URL("../../assets/sprites/harley_quinn_reference.png", import.meta.url).href
};
export const ART_ASSET_URLS = {
  batarang: new URL("../../assets/sprites/batarang_reference.png", import.meta.url).href,
  bat_logo: new URL("../../assets/sprites/bat_logo_reference.png", import.meta.url).href
};
const references = new Map();
const tinted = new Map();
let loading;
export function maskBackdrop(dados, width, height) {
  const visited = new Uint8Array(width * height);
  const queue = new Int32Array(width * height);
  let head = 0, tail = 0;
  const add = (pixel) => {
    if (visited[pixel]) return;
    visited[pixel] = 1;
    const indiceItem = pixel * 4;
    if (dados[indiceItem + 3] === 0 || Math.min(dados[indiceItem], dados[indiceItem + 1], dados[indiceItem + 2]) >= 235 && Math.max(dados[indiceItem], dados[indiceItem + 1], dados[indiceItem + 2]) - Math.min(dados[indiceItem], dados[indiceItem + 1], dados[indiceItem + 2]) < 16) {
      queue[tail++] = pixel;
    }
  };
  for (let posicaoX = 0; posicaoX < width; posicaoX++) {
    add(posicaoX);
    add((height - 1) * width + posicaoX);
  }
  for (let posicaoY = 0; posicaoY < height; posicaoY++) {
    add(posicaoY * width);
    add(posicaoY * width + width - 1);
  }
  while (head < tail) {
    const elemento = queue[head++], posicaoX = elemento % width, posicaoY = Math.floor(elemento / width);
    dados[elemento * 4 + 3] = 0;
    if (posicaoX > 0) add(elemento - 1);
    if (posicaoX < width - 1) add(elemento + 1);
    if (posicaoY > 0) add(elemento - width);
    if (posicaoY < height - 1) add(elemento + width);
  }
}
// ===== CARREGAMENTO E RECORTE =====
// Recebe pixels já sem fundo e encontra a região ocupada pela imagem.
function encontrarRecorte(pixels, largura, altura) {
  let esquerda = largura;
  let topo = altura;
  let direita = -1;
  let base = -1;
  for (let linha = 0; linha < altura; linha++) {
    for (let coluna = 0; coluna < largura; coluna++) {
      const indiceAlpha = (linha * largura + coluna) * 4 + 3;
      if (pixels.data[indiceAlpha] === 0) continue;
      esquerda = Math.min(esquerda, coluna);
      direita = Math.max(direita, coluna);
      topo = Math.min(topo, linha);
      base = Math.max(base, linha);
    }
  }
  if (direita < esquerda || base < topo) return null;
  return {
    left: esquerda,
    top: topo,
    width: direita - esquerda + 1,
    height: base - topo + 1
  };
}
// Prepara uma imagem uma única vez. Uma falha deixa o desenho alternativo disponível.
async function carregarReferencia(chave, caminho) {
  try {
    const imagem = new Image();
    imagem.src = caminho;
    await imagem.decode();
    const canvas = document.createElement("canvas");
    canvas.width = imagem.naturalWidth;
    canvas.height = imagem.naturalHeight;
    const contexto = canvas.getContext("2d", { willReadFrequently: true });
    contexto.drawImage(imagem, 0, 0);
    const pixels = contexto.getImageData(0, 0, canvas.width, canvas.height);
    maskBackdrop(pixels.data, canvas.width, canvas.height);
    contexto.putImageData(pixels, 0, 0);
    const recorte = encontrarRecorte(pixels, canvas.width, canvas.height);
    if (recorte) references.set(chave, {
      canvas,
      ...recorte
    });
  } catch {}
}
// Reutiliza a mesma promessa para evitar carregar os arquivos mais de uma vez.
export function prepareReferenceSprites() {
  if (!globalThis.document) return Promise.resolve();
  if (!loading) {
    const arquivos = {
      ...REFERENCE_URLS,
      ...ART_ASSET_URLS
    };
    const carregamentos = Object.entries(arquivos).map(([chave, caminho]) => {
      return carregarReferencia(chave, caminho);
    });
    loading = Promise.all(carregamentos);
  }
  return loading;
}
export function drawReference(ctx, key, height, phase, acao) {
  const image = references.get(key);
  if (!image) return false;
  const width = height * image.width / image.height;
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  if (acao === "idle") ctx.scale(1, 1 + Math.sin(phase) * 0.012);
  if (acao === "walk") {
    ctx.rotate(Math.sin(phase) * 0.045);
    const stride = Math.sin(phase);
    const cut = Math.floor(image.height * 0.72);
    const legHeight = image.height - cut;
    const bodyHeight = height * cut / image.height;
    const footHeight = height - bodyHeight;
    const split = Math.floor(image.width / 2);
    ctx.drawImage(image.canvas, image.left, image.top, image.width, cut + 2, -width / 2, -height, width, bodyHeight + height * 2 / image.height);
    for (let side = 0; side < 2; side++) {
      const sx = side === 0 ? 0 : split;
      const sw = side === 0 ? split : image.width - split;
      const passo = stride * (side === 0 ? 1 : -1);
      ctx.drawImage(image.canvas, image.left + sx, image.top + cut, sw, legHeight, -width / 2 + width * sx / image.width + passo * height * 0.022, -footHeight - Math.max(0, passo) * height * 0.028, width * sw / image.width, footHeight);
    }
    ctx.restore();
    return true;
  }
  if (acao === "attack") {
    ctx.translate(Math.sin(phase / 2) * 5, 0);
    ctx.rotate(Math.sin(phase / 2) * 0.055);
  }
  ctx.drawImage(image.canvas, image.left, image.top, image.width, image.height, -width / 2, -height, width, height);
  ctx.restore();
  return true;
}
export function drawAsset(ctx, key, maxWidth, maxHeight, cor = null) {
  const asset = references.get(key);
  if (!asset) return false;
  let origem = asset.canvas;
  let left = asset.left, top = asset.top;
  if (cor) {
    const id = key + cor;
    if (!tinted.has(id)) {
      const canvas = document.createElement("canvas");
      canvas.width = asset.width;
      canvas.height = asset.height;
      const paint = canvas.getContext("2d");
      paint.drawImage(origem, left, top, asset.width, asset.height, 0, 0, asset.width, asset.height);
      paint.globalCompositeOperation = "source-in";
      paint.fillStyle = cor;
      paint.fillRect(0, 0, canvas.width, canvas.height);
      tinted.set(id, canvas);
    }
    origem = tinted.get(id);
    left = top = 0;
  }
  const escala = Math.min(maxWidth / asset.width, maxHeight / asset.height);
  const width = asset.width * escala, height = asset.height * escala;
  ctx.drawImage(origem, left, top, asset.width, asset.height, -width / 2, -height / 2, width, height);
  return true;
}
