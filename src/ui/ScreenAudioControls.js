// Este arquivo cuida de compartilhar os controles de volume e mudo.
// ===== DEPENDÊNCIAS E CONFIGURAÇÕES =====
// ===== COMPORTAMENTO =====
export class ScreenAudioControls {
  // Recebe as dependências e prepara o estado inicial deste componente.
  constructor(raiz, audio, som, textos) {
    this.audio = audio;
    this.som = som;
    this.textos = textos;
    this.botao = raiz.querySelector(".mute-button");
    this.legenda = raiz.querySelector(".audio-caption");
    this.volume = raiz.querySelector("input");
    this.ultimoEstado = null;
    this.alternarMudo = () => {
      audio.unlock();
      som.toggleMute();
      this.atualizar();
    };
    this.ajustarVolume = (evento) => {
      audio.unlock();
      audio.setVolume(Number(evento.target.value));
    };
    this.botao.addEventListener("click", this.alternarMudo);
    this.volume.addEventListener("input", this.ajustarVolume);
  }
  // Só modifica o HTML quando o estado muda; os fades continuam no gerenciador de áudio.
  atualizar() {
    const silenciado = this.som.isMuted;
    if (this.ultimoEstado === silenciado) return;
    this.ultimoEstado = silenciado;
    this.botao.setAttribute("aria-pressed", String(silenciado));
    this.botao.setAttribute("aria-label", silenciado ? this.textos.unmute : this.textos.mute);
    this.legenda.textContent = silenciado ? this.textos.muted : this.textos.music;
  }
  // Encerra os recursos desta instância para não deixar eventos ativos.
  destroy() {
    this.botao.removeEventListener("click", this.alternarMudo);
    this.volume.removeEventListener("input", this.ajustarVolume);
  }
}
