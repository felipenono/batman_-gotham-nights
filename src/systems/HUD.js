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

export class HUD {
  /**
   * [POO - MÉTODO ESTÁTICO DE DESENHO VETORIAL]
   * Renderiza os ícones de vida do morcego.
   */
  static drawBatIcon(ctx, x, y, active = true) {
    ctx.save();
    ctx.translate(x, y);

    if (active) {
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 6;
      ctx.fillStyle = '#fbbf24';
    } else {
      ctx.fillStyle = '#334155';
    }

    ctx.beginPath();
    ctx.moveTo(0, 4);
    ctx.lineTo(6, 2);
    ctx.lineTo(11, -5);
    ctx.lineTo(5, -2);
    ctx.lineTo(2, -6);
    ctx.lineTo(0, -3);
    ctx.lineTo(-2, -6);
    ctx.lineTo(-5, -2);
    ctx.lineTo(-11, -5);
    ctx.lineTo(-6, 2);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
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
  static draw(ctx, player, levelConfig, killsInLevel = 0, boss = null, width = 900, height = 500, isMuted = false) {
    if (!player) return;

    ctx.save();

    // 1. TOP-LEFT: 5 BAT-LIVES
    ctx.font = '900 13px "Arial Black", sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'left';
    ctx.fillText('LIVES', 22, 22);

    for (let i = 0; i < 5; i++) {
      const isLit = i < player.lives;
      HUD.drawBatIcon(ctx, 80 + i * 26, 18, isLit);
    }

    // HP PIPS (3 mini armor bars for current life)
    ctx.fillStyle = '#64748b';
    ctx.fillText('HEALTH', 22, 42);

    for (let h = 0; h < 3; h++) {
      const activePip = h < player.hp;
      ctx.fillStyle = activePip ? '#22c55e' : '#1e293b';
      ctx.fillRect(80 + h * 24, 32, 18, 10);

      ctx.strokeStyle = activePip ? '#86efac' : '#334155';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(80 + h * 24, 32, 18, 10);
    }

    // 2. TOP-RIGHT: LEVEL INDICATOR & WAVE KILL PROGRESS
    ctx.textAlign = 'right';
    ctx.font = '900 16px "Arial Black", sans-serif';
    ctx.fillStyle = '#fef08a';
    ctx.shadowColor = '#ca8a04';
    ctx.shadowBlur = 6;
    ctx.fillText(`LEVEL ${levelConfig.id} / 3`, width - 24, 25);
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
      kills >= threshold ? 'BOSS ENGAGED!' : `DEFEATED: ${kills} / ${threshold}`,
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
      ctx.fillText('⚠ FEAR TOXIN ACTIVE: CONTROLS REVERSED! ⚠', width / 2, 70);
    }

    // Audio status indicator
    ctx.textAlign = 'right';
    ctx.font = '700 11px monospace';
    ctx.fillStyle = isMuted ? '#ef4444' : '#22c55e';
    ctx.shadowBlur = 0;
    ctx.fillText(isMuted ? '🔇 [M] MUTED' : '🔊 [M] SOUND ON', width - 24, 76);

    ctx.restore();
  }
}
