// Este arquivo cuida de selecionar e reutilizar quadros das animações.
import { APARENCIA, LUZ_PERSONAGENS } from "../../config/configuracao.js";

// ===== DEPENDÊNCIAS E CONFIGURAÇÕES =====
import { ANIMACAO } from "../../config/configuracao.js";
import { prepareReferenceSprites, drawReference } from "./referenceSprites.js";
import { batman } from "./art/batman.js";
import { joker } from "./art/joker.js";
import { penguin } from "./art/penguin.js";
import { scarecrow } from "./art/scarecrow.js";
import { harley_quinn } from "./art/harley_quinn.js";
import { two_face } from "./art/two_face.js";
const estiloVisual = APARENCIA.SpriteAnimator;
export const SPRITE_ART = {
  batman,
  joker,
  penguin,
  scarecrow,
  harley_quinn,
  two_face
};
export const SPRITE_ACTIONS = Object.freeze(ANIMACAO.quadros);
// Capangas usam a própria imagem, mas o tamanho base e o desenho de reserva (se a imagem
// não carregar) vêm do chefe do mesmo tema.
const BASE_DOS_CAPANGAS = {
  capanga_palhaco: "joker",
  acolito_saco: "scarecrow",
  mafioso_chapeu: "penguin",
  capanga_taco: "harley_quinn",
  agente_fedora: "two_face"
};
function arteDe(chave) {
  return SPRITE_ART[chave] ?? SPRITE_ART[BASE_DOS_CAPANGAS[chave]];
}
export const SPRITE_NAMES = Object.keys(SPRITE_ART).flatMap((name) => Object.keys(SPRITE_ACTIONS).map((acao) => `${name}_${acao}`));
const cache = new Map();
const SIZE = ANIMACAO.tamanho, ANCHOR_X = ANIMACAO.ancoraX, ANCHOR_Y = ANIMACAO.ancoraY, RESOLUTION = ANIMACAO.resolucao;
export function spriteFrame(chave, acao, quadro) {
  const id = `${chave}_${acao}_${quadro}_${idDaLuz}`;
  if (cache.has(id)) return cache.get(id);
  if (!globalThis.document) return null;
  const art = arteDe(chave);
  if (!art) return null;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = SIZE * RESOLUTION;
  const contexto = canvas.getContext("2d");
  contexto.scale(RESOLUTION, RESOLUTION);
  const fracao = quadro / SPRITE_ACTIONS[acao], phase = fracao * Math.PI * 2;
  const walking = acao === "walk", attacking = acao === "attack";
  const pose = {
    x: ANCHOR_X - art.width / 2,
    y: ANCHOR_Y - art.height,
    w: art.width,
    h: art.height,
    alive: true,
    facing: 1,
    vx: walking ? 2 : 0,
    vy: 0,
    onGround: acao !== "jump",
    isAttacking: attacking,
    throwAnimTimer: attacking ? 10 : 0,
    hurtFlash: 0,
    invulnerable: 0,
    fearTimer: 0,
    hp: 100,
    maxHp: 100,
    hpRatio: 1,
    coinFlipping: false,
    animTime: phase / (walking ? 6 : 2),
    wobble: phase / 3,
    waddleTime: phase / 3,
    floatCycle: phase / 2,
    acrobatTime: phase / 4,
    stride: phase / 3
  };
  contexto.translate(ANCHOR_X, ANCHOR_Y);
  if (acao === "death") {
    const collapse = Math.min(1, quadro / 7);
    contexto.rotate(collapse * Math.PI / 2);
    contexto.scale(1, 1 - collapse * 0.15);
  } else if (acao === "hurt") {
    contexto.rotate(-Math.sin(fracao * Math.PI) * 0.1);
    contexto.filter = "sepia(0.3) saturate(1.6)";
  } else if (acao === "jump") {
    const stretch = Math.sin(fracao * Math.PI * 2) * 0.025;
    contexto.scale(1.04 - stretch, 0.96 + stretch);
  } else if (attacking) {
    contexto.rotate(Math.sin(fracao * Math.PI) * 0.04);
  }
  contexto.translate(-ANCHOR_X, -ANCHOR_Y);
  contexto.save();
  contexto.translate(ANCHOR_X, ANCHOR_Y);
  const rendered = drawReference(contexto, chave, art.height, phase, acao);
  contexto.restore();
  if (!rendered) art.paint.call(pose, contexto);
  aplicarLuz(canvas);
  if (cache.size >= ANIMACAO.limiteCache) cache.delete(cache.keys().next().value);
  cache.set(id, canvas);
  return canvas;
}
export async function loadSprites() {
  await prepareReferenceSprites();
  cache.clear();
  for (const chave of Object.keys(SPRITE_ART)) for (const acao of Object.keys(SPRITE_ACTIONS)) spriteFrame(chave, acao, 0);
}
// ===== LUZ DA FASE =====
// A tela informa a fase atual antes de desenhar os personagens (null = sem efeito, como no menu).
// A luz é aplicada uma única vez em cada quadro guardado (o custo por tela não muda).
let luzDaFase = null;
let idDaLuz = "sem-luz";
export function definirLuzDosPersonagens(idDaFase) {
  luzDaFase = LUZ_PERSONAGENS.ativo ? LUZ_PERSONAGENS.fases[idDaFase] ?? null : null;
  idDaLuz = luzDaFase ? `fase${idDaFase}` : "sem-luz";
}
// Uma única tela de rascunho, reaproveitada por todos os personagens (não guarda cópias por fase).
let rascunho = null;
function telaDeRascunho(largura, altura) {
  if (!globalThis.document) return null;
  if (!rascunho) rascunho = document.createElement("canvas");
  if (rascunho.width !== largura || rascunho.height !== altura) {
    rascunho.width = largura;
    rascunho.height = altura;
  }
  return rascunho;
}
// Pinta a imagem inteira com uma cor, só onde o sprite existe (silhueta ou tom).
function pintarSobre(imagem, cor, modo) {
  const tela = telaDeRascunho(imagem.width, imagem.height);
  if (!tela) return null;
  const contexto = tela.getContext("2d");
  contexto.globalCompositeOperation = "source-over";
  contexto.clearRect(0, 0, tela.width, tela.height);
  contexto.drawImage(imagem, 0, 0);
  contexto.globalCompositeOperation = modo;
  contexto.fillStyle = cor;
  contexto.fillRect(0, 0, tela.width, tela.height);
  contexto.globalCompositeOperation = "source-over";
  return tela;
}
// Junta, no próprio quadro: contorno de luz (silhueta clara um pouco acima, atrás do sprite)
// e o tom da fase por cima do sprite.
function aplicarLuz(canvas) {
  if (!luzDaFase) return;
  const original = document.createElement("canvas");
  original.width = canvas.width;
  original.height = canvas.height;
  original.getContext("2d").drawImage(canvas, 0, 0);
  const contexto = canvas.getContext("2d");
  contexto.save();
  contexto.setTransform(1, 0, 0, 1, 0, 0);
  contexto.filter = "none";
  contexto.globalAlpha = 1;
  contexto.clearRect(0, 0, canvas.width, canvas.height);
  const deslocamento = Math.round(LUZ_PERSONAGENS.deslocamentoContorno * RESOLUTION);
  const silhueta = pintarSobre(original, luzDaFase.contorno, "source-in");
  if (silhueta) contexto.drawImage(silhueta, 0, -deslocamento);
  const comTom = pintarSobre(original, luzDaFase.tom, "source-atop");
  contexto.drawImage(comTom ?? original, 0, 0);
  contexto.restore();
}
// Sombra oval sob os pés, apenas com o personagem no chão.
function desenharSombra(contexto, actor) {
  const sombra = LUZ_PERSONAGENS.sombra;
  if (!luzDaFase || !sombra.ativo || !actor.onGround || !actor.alive) return;
  contexto.save();
  contexto.fillStyle = sombra.cor;
  contexto.beginPath();
  contexto.ellipse(actor.x + actor.w / 2, actor.y + actor.h - 1, actor.w * sombra.largura / 2, sombra.altura / 2, 0, 0, Math.PI * 2);
  contexto.fill();
  contexto.restore();
}
// ===== COMPORTAMENTO =====
export class SpriteRenderer {
  draw(contexto, actor) { return paintCharacter.call(actor.animator, contexto, actor); }
}
function paintCharacter(contexto, actor) {
    const art = arteDe(actor.spriteKey);
    if (!art) return;
    const escala = actor.h / art.height;
    desenharSombra(contexto, actor);
    contexto.save();
    contexto.translate(Math.round(actor.x + actor.w / 2), Math.round(actor.y + actor.h));
    contexto.scale((actor.facing || 1) * escala, escala);
    if (actor.isCartwheeling) {
      contexto.translate(0, -art.height / 2);
      contexto.rotate(actor.cartwheelAngle || 0);
      contexto.translate(0, art.height / 2);
    }
    const opacidade = actor.invulnerable > 0 && actor.deathTimer <= 0 ? 0.65 : 1;
    const draw = (state, quadro, opacity) => {
      const imagem = spriteFrame(actor.spriteKey, state, quadro);
      if (!imagem) return;
      contexto.globalAlpha = opacidade * opacity;
      contexto.drawImage(imagem, -ANCHOR_X, -ANCHOR_Y, SIZE, SIZE);
    };
    if (this.previous && this.blend < 1) draw(this.previous.state, this.previous.frame, 1 - this.blend);
    draw(this.state, this.frame, this.blend);
    contexto.restore();
    if (actor.alive && !actor.isBoss && actor.spriteKey !== "batman" && actor.hp < actor.maxHp) {
      contexto.save();
      contexto.fillStyle = estiloVisual.preenchimento1;
      contexto.fillRect(actor.x + actor.w / 2 - 16, actor.y - 12, 32, 5);
      contexto.fillStyle = estiloVisual.preenchimento2;
      contexto.fillRect(actor.x + actor.w / 2 - 16, actor.y - 12, 32 * actor.hpRatio, 5);
      contexto.restore();
    }
    if (actor.coinFlipping && actor.alive) {
      contexto.save();
      contexto.fillStyle = estiloVisual.preenchimento3;
      contexto.beginPath();
      contexto.ellipse(actor.x + actor.w / 2, actor.y - 14, 5, 7, 0, 0, Math.PI * 2);
      contexto.fill();
      contexto.fillStyle = estiloVisual.preenchimento4;
      contexto.font = estiloVisual.fonte1;
      contexto.textAlign = "center";
      contexto.fillText(actor.nextAttackIsBullets ? "C" : "R", actor.x + actor.w / 2, actor.y - 11);
      contexto.restore();
    }
    if (actor.variantColor && actor.alive) {
      contexto.save();
      contexto.fillStyle = actor.variantColor;
      contexto.fillRect(actor.x + actor.w / 2 - 6, actor.y + actor.h * 0.42, 12, 3);
      contexto.restore();
    }

}
