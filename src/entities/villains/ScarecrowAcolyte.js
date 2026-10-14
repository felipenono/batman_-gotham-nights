// Este arquivo cuida de especializar o inimigo de gás.
import { APARENCIA } from "../../config/configuracao.js";

// ===== DEPENDÊNCIAS E CONFIGURAÇÕES =====
import { Scarecrow } from "./Scarecrow.js";
const estiloVisual = APARENCIA.ScarecrowAcolyte;
// ===== COMPORTAMENTO =====
export class ScarecrowAcolyte extends Scarecrow {
  // Recebe as dependências e prepara o estado inicial deste componente.
  constructor(opcoes) {
    super(opcoes);
    this.scoreType = "ScarecrowAcolyte";
    this.name = "Acólito do medo";
    this.isBoss = false;
    this.w = 34;
    this.h = 72;
    this.hp = this.maxHp = 20;
    this.variantColor = estiloVisual.gradiente1;
    this.smokeCooldown = 130;
  }
  // Recebe o estado da partida e decide o próximo movimento ou ataque.
  updateAI(jogador, shots, playSfx) {
    if (!this.alive || !jogador?.alive) return;
    const dx = jogador.x - this.x;
    this.facing = dx >= 0 ? 1 : -1;
    this.vx = Math.abs(dx) > 250 ? this.facing * 0.9 : 0;
    if (--this.smokeCooldown <= 0) {
      this.castFearSmoke(jogador, shots, playSfx);
      this.smokeCooldown = 170;
    }
  }
}
