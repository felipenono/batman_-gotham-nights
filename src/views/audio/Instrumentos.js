// Este arquivo cuida de sintetizar os instrumentos das trilhas.
// ===== DEPENDÊNCIAS E CONFIGURAÇÕES =====
// ===== COMPORTAMENTO =====
export class Instrumentos {
  static playBass(tempo, frequencia, duracao, gainAmount, contexto, destino) {
    try {
      const oscilador = contexto.createOscillator();
      const ganho = contexto.createGain();
      const filtro = contexto.createBiquadFilter();
      oscilador.type = "sawtooth";
      oscilador.frequency.setValueAtTime(frequencia, tempo);
      filtro.type = "lowpass";
      filtro.frequency.setValueAtTime(320, tempo);
      filtro.frequency.exponentialRampToValueAtTime(120, tempo + duracao);
      ganho.gain.setValueAtTime(gainAmount, tempo);
      ganho.gain.exponentialRampToValueAtTime(0.001, tempo + duracao);
      oscilador.connect(filtro);
      filtro.connect(ganho);
      ganho.connect(destino);
      oscilador.start(tempo);
      oscilador.stop(tempo + duracao);
    } catch {}
  }
  static playBrass(tempo, frequencia, duracao, gainAmount, contexto, destino) {
    try {
      const osciladorPrincipal = contexto.createOscillator();
      const osciladorSecundario = contexto.createOscillator();
      const ganho = contexto.createGain();
      const filtro = contexto.createBiquadFilter();
      osciladorPrincipal.type = "sawtooth";
      osciladorSecundario.type = "square";
      osciladorPrincipal.frequency.setValueAtTime(frequencia, tempo);
      osciladorSecundario.frequency.setValueAtTime(frequencia * 1.006, tempo);
      filtro.type = "lowpass";
      filtro.frequency.setValueAtTime(900, tempo);
      filtro.frequency.exponentialRampToValueAtTime(450, tempo + duracao);
      ganho.gain.setValueAtTime(0.01, tempo);
      ganho.gain.linearRampToValueAtTime(gainAmount, tempo + 0.04);
      ganho.gain.exponentialRampToValueAtTime(0.001, tempo + duracao);
      osciladorPrincipal.connect(filtro);
      osciladorSecundario.connect(filtro);
      filtro.connect(ganho);
      ganho.connect(destino);
      osciladorPrincipal.start(tempo);
      osciladorSecundario.start(tempo);
      osciladorPrincipal.stop(tempo + duracao);
      osciladorSecundario.stop(tempo + duracao);
    } catch {}
  }
  static playBell(tempo, frequencia, duracao, gainAmount, contexto, destino) {
    try {
      const oscilador = contexto.createOscillator();
      const ganho = contexto.createGain();
      oscilador.type = "sine";
      oscilador.frequency.setValueAtTime(frequencia, tempo);
      ganho.gain.setValueAtTime(gainAmount, tempo);
      ganho.gain.exponentialRampToValueAtTime(0.0001, tempo + duracao);
      oscilador.connect(ganho);
      ganho.connect(destino);
      oscilador.start(tempo);
      oscilador.stop(tempo + duracao);
    } catch {}
  }
  static playTimpani(tempo, frequencia, gainAmount, contexto, destino) {
    try {
      const oscilador = contexto.createOscillator();
      const ganho = contexto.createGain();
      oscilador.type = "sine";
      oscilador.frequency.setValueAtTime(frequencia * 1.6, tempo);
      oscilador.frequency.exponentialRampToValueAtTime(frequencia * 0.7, tempo + 0.25);
      ganho.gain.setValueAtTime(gainAmount, tempo);
      ganho.gain.exponentialRampToValueAtTime(0.001, tempo + 0.28);
      oscilador.connect(ganho);
      ganho.connect(destino);
      oscilador.start(tempo);
      oscilador.stop(tempo + 0.28);
    } catch {}
  }
  static playSnare(tempo, gainAmount, contexto, destino) {
    try {
      const bufferSize = contexto.sampleRate * 0.1;
      const buffer = contexto.createBuffer(1, bufferSize, contexto.sampleRate);
      const dados = buffer.getChannelData(0);
      for (let indiceItem = 0; indiceItem < bufferSize; indiceItem++) dados[indiceItem] = Math.random() * 2 - 1;
      const noise = contexto.createBufferSource();
      noise.buffer = buffer;
      const filtro = contexto.createBiquadFilter();
      filtro.type = "highpass";
      filtro.frequency.setValueAtTime(800, tempo);
      const ganho = contexto.createGain();
      ganho.gain.setValueAtTime(gainAmount, tempo);
      ganho.gain.exponentialRampToValueAtTime(0.001, tempo + 0.1);
      noise.connect(filtro);
      filtro.connect(ganho);
      ganho.connect(destino);
      noise.start(tempo);
      noise.stop(tempo + 0.1);
    } catch {}
  }
  static playHihat(tempo, gainAmount, contexto, destino) {
    try {
      const oscilador = contexto.createOscillator();
      const ganho = contexto.createGain();
      oscilador.type = "triangle";
      oscilador.frequency.setValueAtTime(8000, tempo);
      ganho.gain.setValueAtTime(gainAmount, tempo);
      ganho.gain.exponentialRampToValueAtTime(0.001, tempo + 0.04);
      oscilador.connect(ganho);
      ganho.connect(destino);
      oscilador.start(tempo);
      oscilador.stop(tempo + 0.04);
    } catch {}
  }
  static playPad(tempo, frequencia, duracao, gainAmount, contexto, destino) {
    try {
      const oscilador = contexto.createOscillator();
      const ganho = contexto.createGain();
      const filtro = contexto.createBiquadFilter();
      oscilador.type = "sawtooth";
      oscilador.frequency.setValueAtTime(frequencia, tempo);
      filtro.type = "lowpass";
      filtro.frequency.setValueAtTime(350, tempo);
      ganho.gain.setValueAtTime(0.001, tempo);
      ganho.gain.linearRampToValueAtTime(gainAmount, tempo + 0.4);
      ganho.gain.exponentialRampToValueAtTime(0.001, tempo + duracao);
      oscilador.connect(filtro);
      filtro.connect(ganho);
      ganho.connect(destino);
      oscilador.start(tempo);
      oscilador.stop(tempo + duracao);
    } catch {}
  }
}
