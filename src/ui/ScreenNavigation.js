// Este arquivo cuida de controlar teclado e controle nas telas finais.
// ===== DEPENDÊNCIAS E CONFIGURAÇÕES =====
import { LOBBY } from "../config/configuracao.js";
import { controleConectado, direcaoDoControle } from "./GamepadInput.js";
// ===== COMPORTAMENTO =====
export class ScreenNavigation {
  // Recebe as dependências e prepara o estado inicial deste componente.
  constructor(raiz, { activate, blocked, gesture, back }) {
    this.root = raiz;
    this.activate = activate;
    this.blocked = blocked;
    this.gesture = gesture;
    this.back = back;
    this.time = 0;
    this.nextMove = 0;
    this.padReady = false;
    this.padPressed = false;
    this.key = this.tratarTecla.bind(this);
    this.click = this.tratarClique.bind(this);
    this.pointer = () => this.gesture();
  }
  // ===== EVENTOS E TECLADO =====
  // Prepara os elementos e eventos usados enquanto esta tela estiver aberta.
  mount() {
    window.addEventListener("keydown", this.key);
    window.addEventListener("pointerdown", this.pointer);
    this.root.addEventListener("click", this.click);
  }
  tratarTecla(evento) {
    this.gesture();
    if (this.blocked() || evento.repeat) return;
    if (evento.target?.tagName === "INPUT") return;
    const setas = [
      "ArrowUp",
      "ArrowLeft",
      "ArrowDown",
      "ArrowRight"
    ];
    if (setas.includes(evento.key)) {
      evento.preventDefault();
      const voltar = ["ArrowUp", "ArrowLeft"].includes(evento.key);
      this.move(voltar ? -1 : 1);
    } else if (evento.key === "Escape") {
      evento.preventDefault();
      this.back();
    } else if (["Enter", " "].includes(evento.key) && !evento.target?.closest?.("button")) {
      evento.preventDefault();
      this.buttons()[0]?.click();
    }
  }
  tratarClique(evento) {
    const botao = evento.target.closest("[data-result-action]");
    if (!botao || botao.disabled || this.blocked()) return;
    this.activate(botao.dataset.resultAction);
  }
  buttons() {
    return [...this.root.querySelectorAll("[data-result-action]:not(:disabled)")];
  }
  // Recebe -1 ou 1 e move o foco, circulando apenas entre opções habilitadas.
  move(direcao) {
    const botoes = this.buttons();
    if (!botoes.length) return;
    const indiceAtual = botoes.indexOf(document.activeElement);
    let proximoIndice;
    if (indiceAtual < 0) {
      proximoIndice = direcao > 0 ? 0 : botoes.length - 1;
    } else {
      proximoIndice = (indiceAtual + direcao + botoes.length) % botoes.length;
    }
    botoes[proximoIndice].focus();
  }
  // ===== CONTROLE =====
  // Recebe a atualização atual e avança o estado, sem redesenhar a tela.
  update(milissegundos) {
    this.time += milissegundos;
    const controle = controleConectado();
    if (!controle) {
      this.padReady = false;
      this.padPressed = false;
      return;
    }
    const pressionado = Boolean(controle.buttons[0]?.pressed || controle.buttons[9]?.pressed);
    // Um botão segurado na partida deve ser solto antes de confirmar a tela recém-aberta.
    if (!pressionado) this.padReady = true;
    if (!this.blocked()) this.navegarComControle(controle, pressionado);
    this.padPressed = pressionado;
  }
  navegarComControle(controle, pressionado) {
    const direcao = direcaoDoControle(controle);
    if (direcao && this.time >= this.nextMove) {
      this.move(direcao);
      this.nextMove = this.time + LOBBY.motion.gamepadRepeat;
    }
    if (this.padReady && pressionado && !this.padPressed) {
      const selecionado = this.root.querySelector("[data-result-action]:focus:not(:disabled)");
      const botao = selecionado ?? this.buttons()[0];
      botao?.click();
    }
  }
  // ===== SAÍDA =====
  // Encerra os recursos desta instância para não deixar eventos ativos.
  destroy() {
    window.removeEventListener("keydown", this.key);
    window.removeEventListener("pointerdown", this.pointer);
    this.root.removeEventListener("click", this.click);
  }
}
