// Este arquivo cuida de especializar o capanga do Duas-Caras.
import { APARENCIA } from "../../../config/configuracao.js";

// ===== DEPENDÊNCIAS E CONFIGURAÇÕES =====
import { TwoFace } from "./TwoFace.js";
const estiloVisual = APARENCIA.TwoFaceEnforcer;
// ===== COMPORTAMENTO =====
export class TwoFaceEnforcer extends TwoFace {
  // Recebe as dependências e prepara o estado inicial deste componente.
  constructor(opcoes) {
    super(opcoes);
    this.scoreType = "TwoFaceEnforcer";
    this.name = "Agente do Duas-Caras";
    this.isBoss = false;
    this.w = 34;
    this.h = 68;
    this.hp = this.maxHp = 20;
    this.variantColor = estiloVisual.gradiente1;
    this.speed = 1.1;
    this.attackCycleTimer = 160;
  }
  // Recebe o estado da partida e decide o próximo movimento ou ataque.
  updateAI(jogador, shots, playSfx) {
    super.updateAI(jogador, shots, null, playSfx);
  }
}
