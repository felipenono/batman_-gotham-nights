// Este arquivo cuida de resolver ataques, danos e partículas.
import { APARENCIA } from "../config/configuracao.js";
const estiloVisual = APARENCIA.CombatSystem;

// ===== DEPENDÊNCIAS E CONFIGURAÇÕES =====
// ===== COMPORTAMENTO =====
export class CombatSystem {
  // Recebe as dependências e prepara o estado inicial deste componente.
  constructor({ camera: cameraDoJogo = null, soundManager = null } = {}) {
    this.camera = cameraDoJogo;
    this.soundManager = soundManager;
    this.particles = [];
    this.redFlashAlpha = 0;
  }
  createHitSpark(posicaoX, posicaoY, color = estiloVisual.gradiente1) {
    const count = 8;
    for (let indiceItem = 0; indiceItem < count; indiceItem++) {
      const angulo = Math.random() * Math.PI * 2;
      const velocidade = 2 + Math.random() * 4;
      this.particles.push({
        x: posicaoX,
        y: posicaoY,
        vx: Math.cos(angulo) * velocidade,
        vy: Math.sin(angulo) * velocidade,
        size: 2 + Math.random() * 3,
        color,
        alpha: 1,
        decay: 0.05 + Math.random() * 0.04
      });
    }
  }
  createDeathExplosion(posicaoX, posicaoY) {
    const count = 20;
    const cores = [
      estiloVisual.gradiente2,
      estiloVisual.gradiente3,
      estiloVisual.gradiente1,
      estiloVisual.gradiente5,
      estiloVisual.gradiente6
    ];
    for (let indiceItem = 0; indiceItem < count; indiceItem++) {
      const angulo = Math.random() * Math.PI * 2;
      const velocidade = 3 + Math.random() * 6;
      this.particles.push({
        x: posicaoX,
        y: posicaoY,
        vx: Math.cos(angulo) * velocidade,
        vy: Math.sin(angulo) * velocidade,
        size: 4 + Math.random() * 6,
        color: cores[Math.floor(Math.random() * cores.length)],
        alpha: 1,
        decay: 0.03 + Math.random() * 0.02
      });
    }
  }
  // Recebe a atualização atual e avança o estado, sem redesenhar a tela.
  update(jogador, inimigos = [], chefe = null, projeteis = [], onEnemyKilled = null) {
    if (this.redFlashAlpha > 0) {
      this.redFlashAlpha -= 0.06;
      if (this.redFlashAlpha < 0) this.redFlashAlpha = 0;
    }
    this.resolverBatarangues(inimigos, chefe, projeteis, onEnemyKilled);
    this.resolverAtaquesAoJogador(jogador, projeteis);
    this.resolverContato(jogador, inimigos, chefe);
    this.atualizarParticulas();
  }
  // Cada batarangue atinge no máximo um alvo, priorizando a ordem original dos inimigos.
  resolverBatarangues(inimigos, chefe, projeteis, onEnemyKilled) {
    for (const projetil of projeteis) {
      if (!projetil.alive || projetil.owner !== "batman") continue;
      for (const inimigo of inimigos) {
        if (!inimigo.alive || !projetil.intersects(inimigo)) continue;
        this.aplicarAcerto(projetil, inimigo, estiloVisual.gradiente7, onEnemyKilled);
        break;
      }
      if (projetil.alive && chefe?.alive && projetil.intersects(chefe)) {
        this.aplicarAcerto(projetil, chefe, estiloVisual.gradiente2, onEnemyKilled);
      }
    }
  }
  aplicarAcerto(projetil, alvo, cor, aoDerrotar) {
    projetil.alive = false;
    this.createHitSpark(projetil.x, projetil.y, cor);
    this.soundManager?.playSfx("hit");
    const estavaVivo = alvo.alive;
    alvo.takeDamage(projetil.damage);
    if (!estavaVivo || alvo.alive) return;
    this.createDeathExplosion(alvo.x + alvo.w / 2, alvo.y + alvo.h / 2);
    this.soundManager?.playSfx("kill");
    if (aoDerrotar) aoDerrotar(alvo);
  }
  resolverAtaquesAoJogador(jogador, projeteis) {
    for (const projetilAtual of projeteis) {
      if (!projetilAtual.alive || projetilAtual.owner !== "villain") continue;
      if (jogador && jogador.alive && !jogador.intangible && projetilAtual.intersects(jogador)) {
        if (typeof projetilAtual.detonate === "function") {
          projetilAtual.detonate();
          if (projetilAtual.damageApplied) continue;
          projetilAtual.damageApplied = true;
        }
        if (!projetilAtual.exploded) projetilAtual.alive = false;
        this.createHitSpark(jogador.x + jogador.w / 2, jogador.y + jogador.h / 2, estiloVisual.gradiente3);
        const damaged = jogador.takeDamage(projetilAtual.damage || 1);
        if (damaged) {
          this.onPlayerDamaged();
        }
      }
    }
  }
  resolverContato(jogador, inimigos, chefe) {
    if (jogador && jogador.alive && !jogador.intangible && jogador.invulnerable <= 0) {
      const allHostiles = [...inimigos, chefe].filter((eventoRecebido) => eventoRecebido && eventoRecebido.alive);
      for (const foe of allHostiles) {
        if (foe.intersects(jogador)) {
          const damaged = jogador.takeDamage(1);
          if (damaged) {
            this.createHitSpark(jogador.x + jogador.w / 2, jogador.y + jogador.h / 2, estiloVisual.gradiente3);
            this.onPlayerDamaged();
          }
          break;
        }
      }
    }
  }
  atualizarParticulas() {
    for (let indiceItem = this.particles.length - 1; indiceItem >= 0; indiceItem--) {
      const elemento = this.particles[indiceItem];
      elemento.x += elemento.vx;
      elemento.y += elemento.vy;
      elemento.alpha -= elemento.decay;
      if (elemento.alpha <= 0) {
        this.particles.splice(indiceItem, 1);
      }
    }
  }
  onPlayerDamaged() {
    this.redFlashAlpha = 0.45;
    if (this.soundManager) {
      this.soundManager.playSfx("batman_hit");
    }
    if (this.camera) {
      this.camera.shake(9, 14);
    }
  }
  // Recebe o contexto 2D e desenha o estado atual sem avançar o tempo.
  draw(contexto, canvasWidth = 900, canvasHeight = 500) {
    contexto.save();
    for (const elemento of this.particles) {
      contexto.globalAlpha = elemento.alpha;
      contexto.fillStyle = elemento.color;
      contexto.beginPath();
      contexto.arc(elemento.x, elemento.y, elemento.size, 0, Math.PI * 2);
      contexto.fill();
    }
    contexto.restore();
    if (this.redFlashAlpha > 0.01) {
      contexto.save();
      contexto.fillStyle = `rgba(239, 68, 68, ${this.redFlashAlpha})`;
      contexto.fillRect(0, 0, canvasWidth, canvasHeight);
      contexto.restore();
    }
  }
}
