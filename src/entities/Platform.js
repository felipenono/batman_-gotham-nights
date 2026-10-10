/**
 * ============================================================================
 * @file Platform.js
 * @category POO - Subclasse Estática (Especialização de Superfície de Colisão)
 * ============================================================================
 * CONCEITOS DE PROGRAMAÇÃO ORIENTADA A OBJETOS (POO):
 * 
 * 1. HERANÇA (Inheritance):
 *    Platform estende Entity para usufruir da mesma interface espacial
 *    (x, y, w, h, bounds e intersects).
 * 
 * 2. ENCAPSULAMENTO (Encapsulation):
 *    Armazena características da superfície como 'oneWay' (plataforma semissólida
 *    que permite atravessar por baixo e pousar por cima) e 'theme' (estilo visual).
 * 
 * 3. POLIMORFISMO (Polymorphism):
 *    Sobrescreve o método abstrato draw() de Entity para pintar diferentes
 *    materiais arquitetônicos (concreto, dutos de ar, mármore do cassino, grades do asilo).
 * ============================================================================
 */

import { Entity } from './Entity.js';

export class Platform extends Entity {
  /**
   * CONSTRUTOR:
   * Inicializa uma superfície estática no mundo.
   *
   * @param {Object} options - Propriedades da plataforma
   * @param {number} options.x - Coordenada X
   * @param {number} options.y - Coordenada Y
   * @param {number} options.w - Largura horizontal
   * @param {number} options.h - Espessura vertical
   * @param {string} options.theme - Tema gráfico: 'rooftop' | 'casino' | 'asylum' | 'pipe' | 'ac_unit'
   * @param {boolean} options.oneWay - Define se é plataforma permeável por baixo
   */
  constructor({ x, y, w, h, theme = 'rooftop', oneWay = false }) {
    super({ x, y, w, h });
    this.theme = theme;
    this.oneWay = oneWay;
  }

  /**
   * Procedural drawing for each level theme.
   * @param {CanvasRenderingContext2D} ctx
   */
  draw(ctx) {
    ctx.save();

    if (this.theme === 'rooftop') {
      // Dark gothic brick / concrete slab with wet reflective top
      const grad = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.h);
      grad.addColorStop(0, '#334155');
      grad.addColorStop(0.15, '#1e293b');
      grad.addColorStop(1, '#0f172a');
      ctx.fillStyle = grad;
      ctx.fillRect(this.x, this.y, this.w, this.h);

      // Top reflective wet edge
      ctx.fillStyle = '#64748b';
      ctx.fillRect(this.x, this.y, this.w, 3);

      // Brick seams
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1;
      const step = 40;
      for (let px = this.x; px < this.x + this.w; px += step) {
        ctx.beginPath();
        ctx.moveTo(px, this.y + 4);
        ctx.lineTo(px, this.y + this.h);
        ctx.stroke();
      }
    } else if (this.theme === 'ac_unit') {
      // Industrial rooftop AC ventilation unit
      ctx.fillStyle = '#475569';
      ctx.fillRect(this.x, this.y, this.w, this.h);
      ctx.fillStyle = '#334155';
      ctx.fillRect(this.x + 3, this.y + 3, this.w - 6, this.h - 6);

      // Vent slats
      ctx.fillStyle = '#1e293b';
      for (let vy = this.y + 6; vy < this.y + this.h - 6; vy += 5) {
        ctx.fillRect(this.x + 6, vy, this.w - 12, 2);
      }
      // Top metallic edge
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(this.x, this.y, this.w, 2);
    } else if (this.theme === 'pipe') {
      // Cylindrical industrial rooftop pipe
      const pipeGrad = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.h);
      pipeGrad.addColorStop(0, '#94a3b8');
      pipeGrad.addColorStop(0.3, '#cbd5e1');
      pipeGrad.addColorStop(0.7, '#64748b');
      pipeGrad.addColorStop(1, '#334155');
      ctx.fillStyle = pipeGrad;
      ctx.beginPath();
      ctx.roundRect(this.x, this.y, this.w, this.h, 4);
      ctx.fill();

      // Pipe rings
      ctx.fillStyle = '#1e293b';
      for (let px = this.x + 15; px < this.x + this.w; px += 35) {
        ctx.fillRect(px, this.y, 4, this.h);
      }
    } else if (this.theme === 'casino') {
      // Iceberg Lounge: Polished mahogany with Art Deco gold trim
      const grad = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.h);
      grad.addColorStop(0, '#451a03');
      grad.addColorStop(0.4, '#78350f');
      grad.addColorStop(1, '#291003');
      ctx.fillStyle = grad;
      ctx.fillRect(this.x, this.y, this.w, this.h);

      // Art Deco gold inlay border
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(this.x, this.y, this.w, 4);
      ctx.fillRect(this.x, this.y + this.h - 3, this.w, 3);

      // Diamond pattern inlays
      ctx.fillStyle = '#fef08a';
      for (let px = this.x + 20; px < this.x + this.w - 20; px += 40) {
        ctx.beginPath();
        ctx.moveTo(px, this.y + 6);
        ctx.lineTo(px + 4, this.y + 11);
        ctx.lineTo(px, this.y + 16);
        ctx.lineTo(px - 4, this.y + 11);
        ctx.closePath();
        ctx.fill();
      }
    } else if (this.theme === 'asylum') {
      // Arkham Asylum: Rusted iron cage grating / gothic stone
      const grad = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.h);
      grad.addColorStop(0, '#27272a');
      grad.addColorStop(0.5, '#18181b');
      grad.addColorStop(1, '#09090b');
      ctx.fillStyle = grad;
      ctx.fillRect(this.x, this.y, this.w, this.h);

      // Rusted steel grate edge
      ctx.fillStyle = '#713f12';
      ctx.fillRect(this.x, this.y, this.w, 3);

      // Crossbars & bolts
      ctx.strokeStyle = '#3f3f46';
      ctx.lineWidth = 2;
      for (let px = this.x + 12; px < this.x + this.w; px += 24) {
        ctx.beginPath();
        ctx.moveTo(px, this.y + 3);
        ctx.lineTo(px, this.y + this.h);
        ctx.stroke();

        // Rivets
        ctx.fillStyle = '#a1a1aa';
        ctx.beginPath();
        ctx.arc(px, this.y + 7, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }
}
