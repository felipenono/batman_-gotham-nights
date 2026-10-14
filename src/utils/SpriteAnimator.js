// Este arquivo cuida de selecionar e reutilizar quadros das animações.
import { APARENCIA } from "../config/configuracao.js";

// ===== DEPENDÊNCIAS E CONFIGURAÇÕES =====
import { ANIMACAO } from "../config/configuracao.js";
import { prepareReferenceSprites, drawReference } from "../assets/sprites/referenceSprites.js";
import { batman } from "../assets/sprites/batman.js";
import { joker } from "../assets/sprites/joker.js";
import { penguin } from "../assets/sprites/penguin.js";
import { scarecrow } from "../assets/sprites/scarecrow.js";
import { harley_quinn } from "../assets/sprites/harley_quinn.js";
import { two_face } from "../assets/sprites/two_face.js";
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
export const SPRITE_NAMES = Object.keys(SPRITE_ART).flatMap((name) => Object.keys(SPRITE_ACTIONS).map((acao) => `${name}_${acao}`));
const cache = new Map();
const SIZE = ANIMACAO.tamanho, ANCHOR_X = ANIMACAO.ancoraX, ANCHOR_Y = ANIMACAO.ancoraY, RESOLUTION = ANIMACAO.resolucao;
export function spriteFrame(chave, acao, quadro) {
  const id = `${chave}_${acao}_${quadro}`;
  if (cache.has(id)) return cache.get(id);
  if (!globalThis.document) return null;
  const art = SPRITE_ART[chave];
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
  if (cache.size >= ANIMACAO.limiteCache) cache.delete(cache.keys().next().value);
  cache.set(id, canvas);
  return canvas;
}
export async function loadSprites() {
  await prepareReferenceSprites();
  cache.clear();
  for (const chave of Object.keys(SPRITE_ART)) for (const acao of Object.keys(SPRITE_ACTIONS)) spriteFrame(chave, acao, 0);
}
// ===== COMPORTAMENTO =====
export class SpriteAnimator {
  // Recebe as dependências e prepara o estado inicial deste componente.
  constructor() {
    this.state = "idle";
    this.time = 0;
    this.previous = null;
    this.blend = 1;
  }
  // Recebe a atualização atual e avança o estado, sem redesenhar a tela.
  update(actor, passoTempo = 1) {
    const next = this.escolherAnimacao(actor);
    if (next !== this.state) {
      this.previous = {
        state: this.state,
        frame: this.frame
      };
      this.state = next;
      this.time = 0;
      this.blend = 0;
    } else this.time += passoTempo;
    this.blend = Math.min(1, this.blend + passoTempo / 3);
  }
  // A prioridade é importante: morte e dano interrompem os movimentos comuns.
  escolherAnimacao(personagem) {
    if (personagem.deathTimer > 0 || !personagem.alive) return "death";
    if (personagem.hurtFlash > 0) return "hurt";
    if (personagem.throwAnimTimer > 0 || personagem.attackTimer > 0) return "attack";
    if (!personagem.onGround && Math.abs(personagem.vy) > 0.5) return "jump";
    if (Math.abs(personagem.vx) > 0.2) return "walk";
    return "idle";
  }
  get frame() {
    const quantidade = SPRITE_ACTIONS[this.state];
    const valorQuadro = Math.floor(this.time / (this.state === "death" ? 3 : 5));
    return this.state === "death" ? Math.min(quantidade - 1, valorQuadro) : valorQuadro % quantidade;
  }
  // Recebe o contexto 2D e desenha o estado atual sem avançar o tempo.
  draw(contexto, actor) {
    const art = SPRITE_ART[actor.spriteKey];
    if (!art) return;
    const escala = actor.h / art.height;
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
}
