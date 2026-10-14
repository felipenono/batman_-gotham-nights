// Este arquivo cuida de aplicar gravidade e resolver contatos com plataformas.
// ===== DEPENDÊNCIAS E CONFIGURAÇÕES =====
import { GAME } from "../config/configuracao.js";
// ===== COMPORTAMENTO =====
export class Physics {
  // Recebe as dependências e prepara o estado inicial deste componente.
  constructor(gravity = GAME.GRAVITY) {
    this.gravity = gravity;
  }
  // Recebe a atualização atual e avança o estado, sem redesenhar a tela.
  update(entity, platforms = [], worldWidth = 900, worldHeight = 500, passoTempo = 1) {
    if (!entity || !entity.alive || entity.deathTimer > 0) return;
    entity.vy += this.gravity * passoTempo;
    if (entity.vy > 14) entity.vy = 14;
    const prevY = entity.y;
    entity.x += entity.vx * passoTempo;
    entity.y += entity.vy * passoTempo;
    entity.onGround = false;
    for (const plat of platforms) {
      if (!plat.alive) continue;
      const pBounds = plat.bounds;
      const eLeft = entity.x;
      const eRight = entity.x + entity.w;
      const eBottom = entity.y + entity.h;
      const prevBottom = prevY + entity.h;
      if (eRight > pBounds.left && eLeft < pBounds.right) {
        if (plat.oneWay) {
          if (entity.vy >= 0 && prevBottom <= pBounds.top + 6 && eBottom >= pBounds.top) {
            entity.y = pBounds.top - entity.h;
            entity.vy = 0;
            entity.onGround = true;
          }
        } else {
          if (entity.vy >= 0 && prevBottom <= pBounds.top + 8 && eBottom >= pBounds.top) {
            entity.y = pBounds.top - entity.h;
            entity.vy = 0;
            entity.onGround = true;
          } else if (entity.vy < 0 && prevY >= pBounds.bottom - 4 && entity.y <= pBounds.bottom) {
            entity.y = pBounds.bottom;
            entity.vy = 0;
          }
        }
      }
    }
    const groundFloor = worldHeight - 60;
    if (entity.y + entity.h >= groundFloor) {
      entity.y = groundFloor - entity.h;
      entity.vy = 0;
      entity.onGround = true;
    }
    if (entity.x < 0) {
      entity.x = 0;
      entity.vx = 0;
    } else if (entity.x + entity.w > worldWidth) {
      entity.x = worldWidth - entity.w;
      entity.vx = 0;
    }
  }
}
