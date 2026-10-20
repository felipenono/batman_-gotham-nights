import { ANIMACAO } from '../config/configuracao.js';
export const SPRITE_ACTIONS = Object.freeze(ANIMACAO.quadros);
export class AnimationState {
  // Recebe as dependências e prepara o estado inicial deste componente.
  constructor() {
    this.state = "idle";
    this.time = 0;
    this.previous = null;
    this.blend = 1;
  }
  // Recebe a atualização atual e avança o estado, sem redesenhar a tela.
  update(actor, passoTempo = 1) {
    const next = this.escolherAnimacao(actor);
    if (next !== this.state) {
      this.previous = {
        state: this.state,
        frame: this.frame
      };
      this.state = next;
      this.time = 0;
      this.blend = 0;
    } else this.time += passoTempo;
    this.blend = Math.min(1, this.blend + passoTempo / 3);
  }
  // A prioridade é importante: morte e dano interrompem os movimentos comuns.
  escolherAnimacao(personagem) {
    if (personagem.deathTimer > 0 || !personagem.alive) return "death";
    if (personagem.hurtFlash > 0) return "hurt";
    if (personagem.throwAnimTimer > 0 || personagem.attackTimer > 0) return "attack";
    if (!personagem.onGround && Math.abs(personagem.vy) > 0.5) return "jump";
    if (Math.abs(personagem.vx) > 0.2) return "walk";
    return "idle";
  }
  get frame() {
    const quantidade = SPRITE_ACTIONS[this.state];
    const valorQuadro = Math.floor(this.time / (this.state === "death" ? 3 : 5));
    return this.state === "death" ? Math.min(quantidade - 1, valorQuadro) : valorQuadro % quantidade;
  }
}
