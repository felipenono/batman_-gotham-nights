// Este arquivo cuida de desenhar as informações da partida sem alterar seus dados.
import { APARENCIA } from "../config/configuracao.js";

// ===== DEPENDÊNCIAS E CONFIGURAÇÕES =====
import { drawBatarang } from "./renderers/batSymbols.js";
import { PROJECTILE } from "../config/configuracao.js";
import { LOBBY } from "../config/configuracao.js";
import { formatPlayTime } from "./ui/formatPlayTime.js";
const estiloVisual = APARENCIA.HUD;
const preferenciaMovimento = globalThis.matchMedia?.("(prefers-reduced-motion: reduce)");
// ===== COMPORTAMENTO =====
export class HUD {
  static drawBatIcon(contexto, posicaoX, posicaoY, active = true) {
    drawBatarang(contexto, posicaoX, posicaoY, 0.7, active);
  }
  // Recebe o contexto 2D e desenha o estado atual sem avançar o tempo.
  static draw(contexto, jogador, levelConfig, killsInLevel = 0, chefe = null, largura = 900, altura = 500, isMuted = false, batarangsAvailable = PROJECTILE.BATARANG_MAX_ACTIVE, score = null) {
    if (!jogador) return;
    contexto.save();
    contexto.fillStyle = estiloVisual.preenchimento1;
    contexto.fillRect(12, 5, 225, 83);
    contexto.fillRect(largura - 225, 5, 213, 83);
    HUD.desenharJogador(contexto, jogador, batarangsAvailable);
    HUD.desenharFase(contexto, levelConfig, killsInLevel, largura);
    HUD.desenharChefe(contexto, chefe, largura);
    HUD.desenharMedo(contexto, jogador, largura);
    HUD.desenharEstadoDoAudio(contexto, isMuted, largura);
    HUD.desenharPontuacao(contexto, score, largura);
    contexto.restore();
  }
  static desenharJogador(contexto, jogador, batarangsAvailable) {
    contexto.font = estiloVisual.fonte1;
    contexto.fillStyle = estiloVisual.preenchimento2;
    contexto.textAlign = "left";
    contexto.fillText(estiloVisual.texto1, 22, 22);
    for (let indiceItem = 0; indiceItem < 5; indiceItem++) {
      const isLit = indiceItem < jogador.lives;
      HUD.drawBatIcon(contexto, 80 + indiceItem * 26, 18, isLit);
    }
    contexto.fillStyle = estiloVisual.preenchimento3;
    contexto.fillText(estiloVisual.texto2, 22, 42);
    for (let alturaObjeto = 0; alturaObjeto < 3; alturaObjeto++) {
      const activePip = alturaObjeto < jogador.hp;
      contexto.fillStyle = activePip ? estiloVisual.gradiente4 : estiloVisual.gradiente5;
      contexto.fillRect(80 + alturaObjeto * 24, 32, 18, 10);
      contexto.strokeStyle = activePip ? estiloVisual.gradiente6 : estiloVisual.gradiente7;
      contexto.lineWidth = 1.2;
      contexto.strokeRect(80 + alturaObjeto * 24, 32, 18, 10);
    }
    contexto.fillStyle = batarangsAvailable > 0 ? estiloVisual.gradiente8 : estiloVisual.preenchimento2;
    contexto.font = estiloVisual.fonte2;
    contexto.fillText(`BATARANGUES: ${batarangsAvailable}/${PROJECTILE.BATARANG_MAX_ACTIVE}`, 22, 62);
    contexto.fillStyle = estiloVisual.preenchimento10;
    contexto.fillText(jogador.shootCooldown > 0 ? "RECARGA: " + (jogador.shootCooldown / 60).toFixed(1).replace(".", ",") + " s" : batarangsAvailable > 0 ? "PRONTO PARA LANÇAR" : "LIMITE ATINGIDO", 22, 79);
  }
  static desenharFase(contexto, levelConfig, killsInLevel, largura) {
    contexto.textAlign = "right";
    contexto.font = estiloVisual.fonte3;
    contexto.fillStyle = estiloVisual.preenchimento11;
    contexto.shadowColor = estiloVisual.brilho12;
    contexto.shadowBlur = 6;
    contexto.fillText(`FASE ${levelConfig.id} / 3`, largura - 24, 25);
    contexto.shadowBlur = 0;
    contexto.font = estiloVisual.fonte2;
    contexto.fillStyle = estiloVisual.preenchimento10;
    contexto.fillText(levelConfig.name, largura - 24, 42);
    const threshold = levelConfig.killThreshold;
    const kills = Math.min(killsInLevel, threshold);
    contexto.font = estiloVisual.fonte5;
    contexto.fillStyle = kills >= threshold ? estiloVisual.gradiente14 : estiloVisual.gradiente15;
    contexto.fillText(kills >= threshold ? "CHEFE EM COMBATE!" : `DERROTADOS: ${kills} / ${threshold}`, largura - 24, 58);
  }
  static desenharChefe(contexto, chefe, largura) {
    if (chefe && chefe.alive) {
      const barWidth = 360;
      const barHeight = 16;
      const barX = largura / 2 - barWidth / 2;
      const barY = 24;
      contexto.textAlign = "center";
      contexto.font = estiloVisual.fonte6;
      contexto.fillStyle = estiloVisual.preenchimento16;
      contexto.shadowColor = estiloVisual.brilho17;
      contexto.shadowBlur = 8;
      contexto.fillText(`☠  ${chefe.name.toUpperCase()}  ☠`, largura / 2, barY - 7);
      contexto.shadowBlur = 0;
      contexto.fillStyle = estiloVisual.preenchimento18;
      contexto.fillRect(barX - 3, barY - 3, barWidth + 6, barHeight + 6);
      contexto.strokeStyle = estiloVisual.contorno19;
      contexto.lineWidth = 2.5;
      contexto.strokeRect(barX - 3, barY - 3, barWidth + 6, barHeight + 6);
      const hpGrad = contexto.createLinearGradient(barX, barY, barX + barWidth, barY);
      hpGrad.addColorStop(0, estiloVisual.brilho17);
      hpGrad.addColorStop(0.5, estiloVisual.gradiente21);
      hpGrad.addColorStop(1, estiloVisual.contorno19);
      contexto.fillStyle = hpGrad;
      const fillW = Math.max(0, barWidth * chefe.hpRatio);
      contexto.fillRect(barX, barY, fillW, barHeight);
      contexto.font = estiloVisual.fonte7;
      contexto.fillStyle = estiloVisual.preenchimento23;
      contexto.fillText(`${Math.ceil(chefe.hp)} / ${chefe.maxHp}`, largura / 2, barY + 12);
    }
  }
  static desenharMedo(contexto, jogador, largura) {
    if (jogador.fearTimer > 0) {
      contexto.textAlign = "center";
      contexto.font = estiloVisual.fonte8;
      contexto.fillStyle = estiloVisual.gradiente14;
      contexto.shadowColor = estiloVisual.brilho25;
      contexto.shadowBlur = 8;
      contexto.fillText(estiloVisual.texto3, largura / 2, 70);
    }
  }
  static desenharEstadoDoAudio(contexto, isMuted, largura) {
    contexto.textAlign = "right";
    contexto.font = estiloVisual.fonte9;
    contexto.fillStyle = isMuted ? estiloVisual.preenchimento16 : estiloVisual.gradiente4;
    contexto.shadowBlur = 0;
    contexto.fillText(isMuted ? "🔇 [M] SEM SOM" : "🔊 [M] SOM LIGADO", largura - 24, 76);
  }
  static desenharPontuacao(contexto, score, largura) {
    if (score) {
      const configuracao = LOBBY.scoring, reduced = preferenciaMovimento?.matches;
      contexto.shadowBlur = 0;
      contexto.fillStyle = configuracao.colors.panel;
      contexto.fillRect(largura - 225, 91, 213, 63);
      contexto.textAlign = "right";
      contexto.fillStyle = configuracao.colors.muted;
      contexto.font = `10px ${configuracao.font}`;
      contexto.fillText(`${configuracao.labels.time}  ${formatPlayTime(score.elapsedSeconds)}`, largura - 24, 128);
      contexto.fillText(configuracao.labels.pauseHint, largura - 24, 144);
      contexto.save();
      contexto.translate(largura - 24, 111);
      const escala = 1 + (reduced ? 0 : configuracao.pulseScale * score.pulse / configuracao.pulseDuration);
      contexto.scale(escala, escala);
      contexto.fillStyle = configuracao.colors.accent;
      contexto.font = `18px ${configuracao.font}`;
      contexto.fillText(`${configuracao.labels.score}  ${score.score.toLocaleString("pt-BR")}`, 0, 0);
      contexto.restore();
    }
  }
}
