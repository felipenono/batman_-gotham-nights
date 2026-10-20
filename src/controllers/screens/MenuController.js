import { MenuView } from '../../views/screens/MenuView.js';
// Este arquivo cuida de coordenar as opções e o cenário do lobby.
// ===== DEPENDÊNCIAS E CONFIGURAÇÕES =====
import { controleConectado, direcaoDoControle } from "../input/GamepadInput.js";
import { LOBBY } from "../../config/configuracao.js";
import { LobbyAudioManager } from "../../views/audio/LobbyAudioManager.js";
import { ScreenAudioControls } from "../ui/ScreenAudioControls.js";
/** UI acessível em HTML; o canvas desenha exclusivamente o cenário. */
// ===== COMPORTAMENTO =====
export class MenuController {
  // Recebe as dependências e prepara o estado inicial deste componente.
  constructor(game, raiz) {
    this.view = new MenuView();
    this.game = game;
    this.root = raiz;
    this.audio = new LobbyAudioManager(game.soundManager);
    this.backdrop = this.view.backdrop;
    this.time = 0;
    this.pointer = 0;
    this.padPressed = false;
    this.nextPadMove = 0;
    this.reduced = globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    this.onKey = this.onKey.bind(this);
  }
  // ===== ENTRADA E SAÍDA =====
  // Prepara o cenário, monta o HTML e conecta os eventos desta visita ao lobby.
  // Prepara os elementos e eventos usados enquanto esta tela estiver aberta.
  mount() {
    if (!this.root) return;
    this.view.mount(this.root,this.audio.volume,this.time);
    this.root.querySelectorAll("[data-menu-id]").forEach((botao) => {
      botao.addEventListener("click", () => this.activate(botao.dataset.menuId));
    });
    this.root.querySelector(".studio-mark").addEventListener("click", (eventoRecebido) => eventoRecebido.preventDefault());
    this.controlesAudio = new ScreenAudioControls(this.root, this.audio, this.game.soundManager, LOBBY.menuLabels);
    this.root.onpointermove = (eventoRecebido) => {
      this.pointer = (eventoRecebido.clientX / innerWidth - 0.5) * 2;
    };
    this.unlock = () => this.audio.unlock();
    window.addEventListener("pointerdown", this.unlock);
    window.addEventListener("keydown", this.onKey);
    this.audio.enter();
    this.root.querySelector("input").value = this.audio.volume;
    this.syncAudio();
  }
  // Libera os eventos e recursos ativos desta visita à tela.
  unmount() {
    if (!this.root) return;
    this.controlesAudio?.destroy();
    this.controlesAudio = null;
    this.audio.leave();
    this.view.unmount(this.root);
    this.root.onpointermove = null;
    window.removeEventListener("pointerdown", this.unlock);
    window.removeEventListener("keydown", this.onKey);
  }
  getViewState() {
    return {
      root: this.root, backdrop: this.backdrop,
      time: this.time, pointer: this.pointer, reduced: this.reduced
    };
  }
  syncAudio() {
    this.controlesAudio?.atualizar();
    this.audio.apply();
  }
  // ===== OPÇÕES E NAVEGAÇÃO =====
  activate(id) {
    const item = LOBBY.buttons.find((elementoAtual) => elementoAtual.id === id);
    if (!item?.enabled || this.game.sceneManager.transition) return;
    this.audio.unlock();
    const accepted = item.action ? item.action(this.game) !== false : this.game.sceneManager.goTo(item.id === "start" ? LOBBY.targetScene : item.scene);
    if (accepted) this.audio.playClick();
  }
  move(direction) {
    const botoes = [...this.root?.querySelectorAll("[data-menu-id]:not(:disabled)") ?? []];
    if (!botoes.length) return;
    const current = botoes.indexOf(document.activeElement);
    botoes[(current + direction + botoes.length) % botoes.length].focus();
  }
  onKey(eventoRecebido) {
    this.audio.unlock();
    if (eventoRecebido.repeat || this.game.sceneManager.transition) return;
    if ([
      "ArrowUp",
      "ArrowLeft",
      "ArrowDown",
      "ArrowRight"
    ].includes(eventoRecebido.key) && eventoRecebido.target?.tagName !== "INPUT") {
      eventoRecebido.preventDefault();
      this.move(["ArrowUp", "ArrowLeft"].includes(eventoRecebido.key) ? -1 : 1);
    }
    if (["Enter", " "].includes(eventoRecebido.key) && !eventoRecebido.target?.closest?.("button, input, a")) {
      eventoRecebido.preventDefault();
      this.root?.querySelector("[data-menu-id]:not(:disabled)")?.click();
    }
  }
  // ===== ATUALIZAÇÃO =====
  // Recebe a atualização atual e avança o estado, sem redesenhar a tela.
  update(milissegundos) {
    this.time += milissegundos;
    this.audio.update(milissegundos);
    this.syncAudio();
    // A API de controle funciona com D-pad, analógico, A e Start (borda de pressão).
    const pad = controleConectado();
    if (!pad) {
      this.padPressed = false;
      return;
    }
    const direction = direcaoDoControle(pad);
    if (direction && this.time > this.nextPadMove) {
      this.move(direction);
      this.nextPadMove = this.time + LOBBY.motion.gamepadRepeat;
    }
    const pressed = pad.buttons[0]?.pressed || pad.buttons[9]?.pressed;
    if (pressed && !this.padPressed) {
      const focused = this.root?.querySelector("[data-menu-id]:focus");
      (focused ?? this.root?.querySelector("[data-menu-id]:not(:disabled)"))?.click();
    }
    this.padPressed = pressed;
  }
}

export { MenuController as MenuScene };
