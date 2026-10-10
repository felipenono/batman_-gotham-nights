/**
 * ============================================================================
 * @file Physics.js
 * @category POO - Sistema Desacoplado (Single Responsibility Principle - SRP)
 * ============================================================================
 * CONCEITOS DE PROGRAMAÇÃO ORIENTADA A OBJETOS (POO):
 * 
 * 1. SEPARAÇÃO DE RESPONSABILIDADES (Single Responsibility Principle - SRP):
 *    Em vez de cada personagem calcular sua própria gravidade e colisões com solo,
 *    a classe Physics centraliza o modelo matemático do ambiente.
 * 
 * 2. ACOPLAMENTO FRACO (Loose Coupling):
 *    Physics não precisa saber se o objeto é Batman, Joker ou Scarecrow; ela apenas
 *    requer que o objeto seja uma instância com a interface de Entity (x, y, vx, vy, bounds).
 * 
 * 3. COMPOSIÇÃO:
 *    A classe Game compõe uma instância de Physics para processar todos os atores.
 * ============================================================================
 */

import { GAME } from '../utils/constants.js';

export class Physics {
  /**
   * CONSTRUTOR:
   * Define as forças fundamentais constantes do universo do jogo.
   *
   * @param {number} gravity - Aceleração gravitacional (pixels/frame²)
   */
  constructor(gravity = GAME.GRAVITY) {
    this.gravity = gravity;
  }

  /**
   * Applies gravity, resolves platform and world boundary collisions for an entity.
   * @param {Entity} entity
   * @param {Array<Platform>} platforms
   * @param {number} worldWidth
   * @param {number} worldHeight
   * @param {number} dt
   */
  update(entity, platforms = [], worldWidth = 900, worldHeight = 500, dt = 1) {
    if (!entity || !entity.alive) return;

    // Apply gravity
    entity.vy += this.gravity * dt;

    // Terminal velocity clamp
    if (entity.vy > 14) entity.vy = 14;

    const prevY = entity.y;

    // Tentative position integration
    entity.x += entity.vx * dt;
    entity.y += entity.vy * dt;

    entity.onGround = false;

    // Platform collision resolution
    for (const plat of platforms) {
      if (!plat.alive) continue;

      const pBounds = plat.bounds;
      const eLeft = entity.x;
      const eRight = entity.x + entity.w;
      const eBottom = entity.y + entity.h;
      const prevBottom = prevY + entity.h;

      // Check horizontal overlap
      if (eRight > pBounds.left && eLeft < pBounds.right) {
        if (plat.oneWay) {
          // One-way platform: only land if falling through top
          if (entity.vy >= 0 && prevBottom <= pBounds.top + 6 && eBottom >= pBounds.top) {
            entity.y = pBounds.top - entity.h;
            entity.vy = 0;
            entity.onGround = true;
          }
        } else {
          // Solid platform
          if (entity.vy >= 0 && prevBottom <= pBounds.top + 8 && eBottom >= pBounds.top) {
            entity.y = pBounds.top - entity.h;
            entity.vy = 0;
            entity.onGround = true;
          } else if (entity.vy < 0 && prevY >= pBounds.bottom - 4 && entity.y <= pBounds.bottom) {
            // Bumped head
            entity.y = pBounds.bottom;
            entity.vy = 0;
          }
        }
      }
    }

    // World floor failsafe
    const groundFloor = worldHeight - 60;
    if (entity.y + entity.h >= groundFloor) {
      entity.y = groundFloor - entity.h;
      entity.vy = 0;
      entity.onGround = true;
    }

    // World horizontal bounds clamping
    if (entity.x < 0) {
      entity.x = 0;
      entity.vx = 0;
    } else if (entity.x + entity.w > worldWidth) {
      entity.x = worldWidth - entity.w;
      entity.vx = 0;
    }
  }
}
