/**
 * ============================================================================
 * @file CombatSystem.js
 * @category POO - Sistema Mediador de Combate (Mediator Pattern & SRP)
 * ============================================================================
 * CONCEITOS DE PROGRAMAÇÃO ORIENTADA A OBJETOS (POO):
 * 
 * 1. PADRÃO MEDIADOR (Mediator Pattern):
 *    Em vez de os projéteis conhecerem todos os inimigos, ou os inimigos conhecerem
 *    o Batman, o CombatSystem atua como árbitro central. Ele recebe as listas de
 *    entidades, avalia intersecções AABB e despacha os danos correspondentes.
 * 
 * 2. SEPARAÇÃO DE RESPONSABILIDADES (SRP):
 *    Gerencia exclusivamente efeitos de impacto: partículas de faíscas, fumaça de morte,
 *    screen shake da câmera e flash avermelhado de dano na tela.
 * 
 * 3. INVERSÃO DE CONTROLE (Callbacks / Observer):
 *    Notifica o jogo externo quando um inimigo morre através do callback onEnemyKilled(enemy).
 * ============================================================================
 */

export class CombatSystem {
  /**
   * CONSTRUTOR:
   * Inicializa o subsistema de combate com injeção de dependências de câmera e áudio.
   *
   * @param {Object} options
   * @param {Object} [options.camera=null] - Referência à câmera para aplicar screen shake
   * @param {Object} [options.soundManager=null] - Referência para reprodução de áudio
   */
  constructor({ camera = null, soundManager = null } = {}) {
    this.camera = camera;
    this.soundManager = soundManager;
    this.particles = [];
    this.redFlashAlpha = 0;
  }

  /**
   * Spawns hit spark particles at impact coordinate.
   */
  createHitSpark(x, y, color = '#fbbf24') {
    const count = 8;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 4;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 3,
        color,
        alpha: 1,
        decay: 0.05 + Math.random() * 0.04,
      });
    }
  }

  /**
   * Spawns cartoon explosion particles on enemy death.
   */
  createDeathExplosion(x, y) {
    const count = 20;
    const colors = ['#f59e0b', '#ef4444', '#fbbf24', '#ffffff', '#7c3aed'];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 6;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 4 + Math.random() * 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        decay: 0.03 + Math.random() * 0.02,
      });
    }
  }

  /**
   * Resolves all combat collisions for the frame.
   * @param {Batman} player
   * @param {Array<Character>} enemies
   * @param {Character} boss
   * @param {Array<Projectile>} projectiles
   * @param {Function} onEnemyKilled
   */
  update(player, enemies = [], boss = null, projectiles = [], onEnemyKilled = null) {
    if (this.redFlashAlpha > 0) {
      this.redFlashAlpha -= 0.06;
      if (this.redFlashAlpha < 0) this.redFlashAlpha = 0;
    }

    // 1. Batman Batarangs vs Enemies / Boss
    for (const proj of projectiles) {
      if (!proj.alive || proj.owner !== 'batman') continue;

      // Check vs normal enemies
      for (const enemy of enemies) {
        if (!enemy.alive) continue;
        if (proj.intersects(enemy)) {
          proj.alive = false;
          this.createHitSpark(proj.x, proj.y, '#facc15');
          if (this.soundManager) this.soundManager.playSfx('hit');
          const wasAlive = enemy.alive;
          enemy.takeDamage(proj.damage);
          if (wasAlive && !enemy.alive) {
            this.createDeathExplosion(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2);
            if (this.soundManager) this.soundManager.playSfx('kill');
            if (onEnemyKilled) onEnemyKilled(enemy);
          }
          break;
        }
      }

      // Check vs active Boss
      if (proj.alive && boss && boss.alive) {
        if (proj.intersects(boss)) {
          proj.alive = false;
          this.createHitSpark(proj.x, proj.y, '#f59e0b');
          if (this.soundManager) this.soundManager.playSfx('hit');
          const wasAlive = boss.alive;
          boss.takeDamage(proj.damage);
          if (wasAlive && !boss.alive) {
            this.createDeathExplosion(boss.x + boss.w / 2, boss.y + boss.h / 2);
            if (this.soundManager) this.soundManager.playSfx('kill');
            if (onEnemyKilled) onEnemyKilled(boss);
          }
        }
      }
    }

    // 2. Villain Projectiles vs Batman
    for (const proj of projectiles) {
      if (!proj.alive || proj.owner !== 'villain') continue;

      if (player && player.alive && !player.intangible && proj.intersects(player)) {
        if (typeof proj.detonate === 'function') {
          proj.detonate();
          if (proj.damageApplied) continue;
          proj.damageApplied = true;
        }
        if (!proj.exploded) proj.alive = false;
        this.createHitSpark(player.x + player.w / 2, player.y + player.h / 2, '#ef4444');
        const damaged = player.takeDamage(proj.damage || 1);
        if (damaged) {
          this.onPlayerDamaged();
        }
      }
    }

    // 3. Enemy Body Contact with Batman
    if (player && player.alive && !player.intangible && player.invulnerable <= 0) {
      const allHostiles = [...enemies, boss].filter((e) => e && e.alive);
      for (const foe of allHostiles) {
        if (foe.intersects(player)) {
          const damaged = player.takeDamage(1);
          if (damaged) {
            this.createHitSpark(player.x + player.w / 2, player.y + player.h / 2, '#ef4444');
            this.onPlayerDamaged();
          }
          break;
        }
      }
    }

    // 4. Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;
      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  onPlayerDamaged() {
    this.redFlashAlpha = 0.45;
    if (this.soundManager) {
      this.soundManager.playSfx('batman_hit');
    }
    if (this.camera) {
      this.camera.shake(9, 14);
    }
  }

  /**
   * Draws combat particles and screen flash overlays.
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} canvasWidth
   * @param {number} canvasHeight
   */
  draw(ctx, canvasWidth = 900, canvasHeight = 500) {
    ctx.save();
    for (const p of this.particles) {
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Red damage flash overlay
    if (this.redFlashAlpha > 0.01) {
      ctx.save();
      ctx.fillStyle = `rgba(239, 68, 68, ${this.redFlashAlpha})`;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      ctx.restore();
    }
  }
}
