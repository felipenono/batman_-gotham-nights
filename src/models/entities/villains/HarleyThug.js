// Este arquivo cuida de especializar o capanga da Arlequina.
import { APARENCIA } from "../../../config/configuracao.js";

// ===== DEPENDÊNCIAS E CONFIGURAÇÕES =====
import { HarleyQuinn } from "./HarleyQuinn.js";
const estiloVisual = APARENCIA.HarleyThug;
// ===== COMPORTAMENTO =====
export class HarleyThug extends HarleyQuinn {
  // Recebe as dependências e prepara o estado inicial deste componente.
  constructor(opcoes) {
    super(opcoes);
    this.scoreType = "HarleyThug";
    this.name = "Capanga da Arlequina";
    this.isBoss = false;
    this.w = 32;
    this.h = 62;
    this.hp = this.maxHp = 20;
    this.variantColor = estiloVisual.gradiente1;
    this.malletCooldown = 150;
  }
  // Recebe o estado da partida e decide o próximo movimento ou ataque.
  updateAI(jogador, shots, playSfx) {
    if (!this.alive || !jogador?.alive) return;
    const dx = jogador.x - this.x;
    this.facing = dx >= 0 ? 1 : -1;
    this.vx = Math.abs(dx) > 140 ? this.facing * 1.8 : 0;
    if (--this.malletCooldown <= 0) {
      this.throwMallet(jogador, shots, playSfx);
      if (this.onGround) this.vy = -8;
      this.malletCooldown = 180;
    }
  }
}
