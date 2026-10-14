/**
 * ============================================================================
 * @file HUD.js
 * @category POO - Camada de Visualização Estática (View Layer / Static Utility Class)
 * ============================================================================
 * CONCEITOS DE PROGRAMAÇÃO ORIENTADA A OBJETOS (POO):
 * 
 * 1. CLASSE UTILITÁRIA COM MÉTODOS ESTÁTICOS (Static Utility Pattern):
 *    A classe HUD não precisa ser instanciada com 'new HUD()'. Ela funciona como um
 *    módulo de funções puras estáticas (static methods), centralizando a renderização
 *    da interface (UI) no topo da tela do jogo.
 * 
 * 2. DESACOPLAMENTO MODEL-VIEW (Leitura Pura / Encapsulamento):
 *    O HUD recebe os objetos de modelo (Batman, Boss, LevelConfig) como parâmetros,
 *    lê seus estados através de getters públicos (ex: player.lives, boss.hpRatio)
 *    sem jamais modificar o estado interno dessas entidades.
 * ============================================================================
 */

import { drawBatarang } from '../utils/batSymbols.js';
import { PROJECTILE } from '../utils/constants.js';
import { LOBBY } from '../config/lobby.js';
import { formatPlayTime } from '../scenes/EndGameScene.js';

export class HUD {
  /**
   * [POO - MÉTODO ESTÁTICO DE DESENHO VETORIAL]
   * Renderiza os ícones de vida do morcego.
   */
  static drawBatIcon(ctx, x, y, active = true) {
    drawBatarang(ctx,x,y,0.7,active);
  }

  /**
   * Main HUD render method.
   * @param {CanvasRenderingContext2D} ctx
   * @param {Batman} player
   * @param {Object} levelConfig
   * @param {number} killsInLevel
   * @param {Character} boss
   * @param {number} width
   * @param {number} height
   */
  static draw(ctx, player, levelConfig, killsInLevel = 0, boss = null, width = 900, height = 500, isMuted = false, batarangsAvailable = PROJECTILE.BATARANG_MAX_ACTIVE, score = null) {
    if (!player) return;

    ctx.save();
    // Preserve readability over bright chandeliers and moving scenery.
    ctx.fillStyle = 'rgba(5, 10, 20, 0.82)';
    ctx.fillRect(12, 5, 225, 83);
    ctx.fillRect(width - 225, 5, 213, 83);

    // 1. TOP-LEFT: 5 BAT-LIVES
    ctx.font = '900 11px "Arial Black", sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'left';
    ctx.fillText('VIDAS', 22, 22);

    for (let i = 0; i < 5; i++) {
      const isLit = i < player.lives;
      HUD.drawBatIcon(ctx, 80 + i * 26, 18, isLit);
    }

    // HP PIPS (3 mini armor bars for current life)
    ctx.fillStyle = '#64748b';
    ctx.fillText('SAÚDE', 22, 42);

    for (let h = 0; h < 3; h++) {
      const activePip = h < player.hp;
      ctx.fillStyle = activePip ? '#22c55e' : '#1e293b';
      ctx.fillRect(80 + h * 24, 32, 18, 10);

      ctx.strokeStyle = activePip ? '#86efac' : '#334155';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(80 + h * 24, 32, 18, 10);
    }

    ctx.fillStyle = batarangsAvailable > 0 ? '#fbbf24' : '#94a3b8';
    ctx.font = '700 12px monospace';
    ctx.fillText(`BATARANGUES: ${batarangsAvailable}/${PROJECTILE.BATARANG_MAX_ACTIVE}`, 22, 62);

    ctx.fillStyle = '#cbd5e1';
    ctx.fillText(player.shootCooldown > 0 ? 'RECARGA: ' + (player.shootCooldown / 60).toFixed(1).replace('.', ',') + ' s' : batarangsAvailable > 0 ? 'PRONTO PARA LANÇAR' : 'LIMITE ATINGIDO',22,79);
    // 2. TOP-RIGHT: LEVEL INDICATOR & WAVE KILL PROGRESS
    ctx.textAlign = 'right';
    ctx.font = '900 16px "Arial Black", sans-serif';
    ctx.fillStyle = '#fef08a';
    ctx.shadowColor = '#ca8a04';
    ctx.shadowBlur = 6;
    ctx.fillText(`FASE ${levelConfig.id} / 3`, width - 24, 25);
    ctx.shadowBlur = 0;

    ctx.font = '700 12px monospace';
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText(levelConfig.name, width - 24, 42);

    // KILL COUNTER PROGRESS
    const threshold = levelConfig.killThreshold;
    const kills = Math.min(killsInLevel, threshold);
    ctx.font = '800 12px "Courier New", monospace';
    ctx.fillStyle = kills >= threshold ? '#4ade80' : '#f59e0b';
    ctx.fillText(
      kills >= threshold ? 'CHEFE EM COMBATE!' : `DERROTADOS: ${kills} / ${threshold}`,
      width - 24,
      58
    );

    // 3. TOP-CENTER: BOSS HEALTH BAR (Only shown when Boss is active)
    if (boss && boss.alive) {
      const barWidth = 360;
      const barHeight = 16;
      const barX = width / 2 - barWidth / 2;
      const barY = 24;

      // Boss Name & Skull
      ctx.textAlign = 'center';
      ctx.font = '900 15px "Arial Black", Impact, sans-serif';
      ctx.fillStyle = '#ef4444';
      ctx.shadowColor = '#dc2626';
      ctx.shadowBlur = 8;
      ctx.fillText(`☠  ${boss.name.toUpperCase()}  ☠`, width / 2, barY - 7);
      ctx.shadowBlur = 0;

      // Frame background
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(barX - 3, barY - 3, barWidth + 6, barHeight + 6);

      // Gold ornate border
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(barX - 3, barY - 3, barWidth + 6, barHeight + 6);

      // HP bar fill gradient
      const hpGrad = ctx.createLinearGradient(barX, barY, barX + barWidth, barY);
      hpGrad.addColorStop(0, '#dc2626');
      hpGrad.addColorStop(0.5, '#ea580c');
      hpGrad.addColorStop(1, '#eab308');

      ctx.fillStyle = hpGrad;
      const fillW = Math.max(0, barWidth * boss.hpRatio);
      ctx.fillRect(barX, barY, fillW, barHeight);

      // Numeric percentage overlay
      ctx.font = '800 11px monospace';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`${Math.ceil(boss.hp)} / ${boss.maxHp}`, width / 2, barY + 12);
    }

    // Scarecrow fear toxin warning overlay
    if (player.fearTimer > 0) {
      ctx.textAlign = 'center';
      ctx.font = '900 14px "Arial Black", sans-serif';
      ctx.fillStyle = '#4ade80';
      ctx.shadowColor = '#16a34a';
      ctx.shadowBlur = 8;
      ctx.fillText('⚠ GÁS DO MEDO: CONTROLES INVERTIDOS! ⚠', width / 2, 70);
    }

    // Audio status indicator
    ctx.textAlign = 'right';
    ctx.font = '700 11px monospace';
    ctx.fillStyle = isMuted ? '#ef4444' : '#22c55e';
    ctx.shadowBlur = 0;
    ctx.fillText(isMuted ? '🔇 [M] SEM SOM' : '🔊 [M] SOM LIGADO', width - 24, 76);

    if (score) {
      const config = LOBBY.scoring, reduced = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      ctx.shadowBlur = 0; ctx.fillStyle = config.colors.panel;
      ctx.fillRect(width - 225, 91, 213, 63);
      ctx.textAlign = 'right'; ctx.fillStyle = config.colors.muted; ctx.font = `10px ${config.font}`;
      ctx.fillText(`${config.labels.time}  ${formatPlayTime(score.elapsedSeconds)}`, width - 24, 128);
      ctx.fillText(config.labels.pauseHint, width - 24, 144);
      ctx.save(); ctx.translate(width - 24, 111);
      const scale = 1 + (reduced ? 0 : config.pulseScale * score.pulse / config.pulseDuration);
      ctx.scale(scale, scale); ctx.fillStyle = config.colors.accent; ctx.font = `18px ${config.font}`;
      ctx.fillText(`${config.labels.score}  ${score.score.toLocaleString('pt-BR')}`, 0, 0); ctx.restore();
    }
    ctx.restore();
  }
}
