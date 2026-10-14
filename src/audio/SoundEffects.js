// Este arquivo cuida de reproduzir os efeitos sonoros das ações.
// ===== DEPENDÊNCIAS E CONFIGURAÇÕES =====
import { AUDIO_CONFIG } from "../config/configuracao.js";
// ===== COMPORTAMENTO =====
export class SoundEffects {
  static play(tipo, contexto, noSaida) {
    if (!contexto || !noSaida) return;
    const instanteAtual = contexto.currentTime;
    const parametrosSom = AUDIO_CONFIG.SFX;
    switch (tipo) {
      case "throw":
        SoundEffects.playThrow(contexto, noSaida, instanteAtual, parametrosSom.BATARANG_THROW);
        break;
      case "hit":
      case "enemy_hit":
        SoundEffects.playEnemyHit(contexto, noSaida, instanteAtual, parametrosSom.ENEMY_HIT);
        break;
      case "batman_hit":
        SoundEffects.playBatmanHit(contexto, noSaida, instanteAtual, parametrosSom.BATMAN_HIT);
        break;
      case "kill":
        SoundEffects.playKill(contexto, noSaida, instanteAtual, parametrosSom.ENEMY_KILL);
        break;
      case "joker_laugh":
        SoundEffects.playJokerLaugh(contexto, noSaida, instanteAtual, parametrosSom.JOKER_LAUGH);
        break;
      case "teeth_chatter":
        SoundEffects.playTeethChatter(contexto, noSaida, instanteAtual, parametrosSom.TEETH_CHATTER);
        break;
      case "gas_hiss":
        SoundEffects.playGasHiss(contexto, noSaida, instanteAtual, parametrosSom.SCARECROW_GAS);
        break;
      case "fear_drone":
        SoundEffects.playFearDrone(contexto, noSaida, instanteAtual, parametrosSom.FEAR_DRONE);
        break;
      case "gas_bomb":
        SoundEffects.playGasBomb(contexto, noSaida, instanteAtual, parametrosSom.GAS_BOMB);
        break;
      case "umbrella_shot":
        SoundEffects.playUmbrellaShot(contexto, noSaida, instanteAtual, parametrosSom.PENGUIN_UMBRELLA);
        break;
      case "gunshot":
        SoundEffects.playGunshot(contexto, noSaida, instanteAtual, parametrosSom.GUNSHOT);
        break;
      case "coin_ping":
        SoundEffects.playCoinPing(contexto, noSaida, instanteAtual, parametrosSom.COIN_PING);
        break;
      case "boss_enter":
        SoundEffects.playBossEnter(contexto, noSaida, instanteAtual);
        break;
      case "gameover":
        SoundEffects.playGameOver(contexto, noSaida, instanteAtual);
        break;
      case "victory":
        SoundEffects.playVictory(contexto, noSaida, instanteAtual);
        break;
    }
  }
  static playThrow(contexto, saidaAudio, instanteAtual, parametrosSom) {
    SoundEffects.tocarTom(contexto, saidaAudio, instanteAtual, parametrosSom, "triangle", "linear");
  }
  static playBatmanHit(contexto, saidaAudio, instanteAtual, parametrosSom) {
    SoundEffects.tocarTom(contexto, saidaAudio, instanteAtual, parametrosSom, "sawtooth", "linear");
  }
  static playEnemyHit(contexto, saidaAudio, instanteAtual, parametrosSom) {
    SoundEffects.tocarTom(contexto, saidaAudio, instanteAtual, parametrosSom, "sawtooth", "linear");
  }
  static playKill(contexto, saidaAudio, instanteAtual, parametrosSom) {
    SoundEffects.tocarTom(contexto, saidaAudio, instanteAtual, parametrosSom, "square", "linear");
  }
  static playJokerLaugh(contexto, saidaAudio, instanteAtual, parametrosSom) {
    try {
      parametrosSom.notes.forEach((frequencia, indiceNota) => {
        const fracao = instanteAtual + indiceNota * parametrosSom.noteInterval;
        const osc = contexto.createOscillator();
        const gain = contexto.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(frequencia, fracao);
        gain.gain.setValueAtTime(parametrosSom.volume, fracao);
        gain.gain.exponentialRampToValueAtTime(0.01, fracao + parametrosSom.noteDuration);
        osc.connect(gain);
        gain.connect(saidaAudio);
        osc.start(fracao);
        osc.stop(fracao + parametrosSom.noteDuration);
      });
    } catch {}
  }
  static playTeethChatter(contexto, saidaAudio, instanteAtual, parametrosSom) {
    try {
      for (let indiceItem = 0; indiceItem < parametrosSom.clicks; indiceItem++) {
        const fracao = instanteAtual + indiceItem * 0.05;
        const osc = contexto.createOscillator();
        const gain = contexto.createGain();
        osc.type = "square";
        osc.frequency.setValueAtTime(parametrosSom.baseFreq + indiceItem * 60, fracao);
        gain.gain.setValueAtTime(parametrosSom.volume, fracao);
        gain.gain.exponentialRampToValueAtTime(0.01, fracao + 0.03);
        osc.connect(gain);
        gain.connect(saidaAudio);
        osc.start(fracao);
        osc.stop(fracao + 0.03);
      }
    } catch {}
  }
  static playGasHiss(contexto, saidaAudio, instanteAtual, parametrosSom) {
    try {
      const bufferSize = contexto.sampleRate * parametrosSom.duration;
      const buffer = contexto.createBuffer(1, bufferSize, contexto.sampleRate);
      const dados = buffer.getChannelData(0);
      for (let indiceItem = 0; indiceItem < bufferSize; indiceItem++) dados[indiceItem] = Math.random() * 2 - 1;
      const noise = contexto.createBufferSource();
      noise.buffer = buffer;
      const filtro = contexto.createBiquadFilter();
      filtro.type = "bandpass";
      filtro.frequency.setValueAtTime(parametrosSom.filterFreq, instanteAtual);
      filtro.Q.setValueAtTime(3.5, instanteAtual);
      const gain = contexto.createGain();
      gain.gain.setValueAtTime(parametrosSom.volume, instanteAtual);
      gain.gain.exponentialRampToValueAtTime(0.001, instanteAtual + parametrosSom.duration);
      noise.connect(filtro);
      filtro.connect(gain);
      gain.connect(saidaAudio);
      noise.start(instanteAtual);
      noise.stop(instanteAtual + parametrosSom.duration);
    } catch {}
  }
  static playFearDrone(contexto, saidaAudio, instanteAtual, parametrosSom) {
    try {
      const osc = contexto.createOscillator();
      const gain = contexto.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(parametrosSom.startFreq, instanteAtual);
      osc.frequency.linearRampToValueAtTime(parametrosSom.peakFreq, instanteAtual + parametrosSom.duration * 0.4);
      osc.frequency.linearRampToValueAtTime(parametrosSom.endFreq, instanteAtual + parametrosSom.duration);
      gain.gain.setValueAtTime(parametrosSom.volume, instanteAtual);
      gain.gain.linearRampToValueAtTime(0.01, instanteAtual + parametrosSom.duration);
      osc.connect(gain);
      gain.connect(saidaAudio);
      osc.start(instanteAtual);
      osc.stop(instanteAtual + parametrosSom.duration);
    } catch {}
  }
  static playGasBomb(contexto, saidaAudio, instanteAtual, parametrosSom) {
    SoundEffects.tocarTom(contexto, saidaAudio, instanteAtual, parametrosSom, "triangle", "exponential");
  }
  static playUmbrellaShot(contexto, saidaAudio, instanteAtual, parametrosSom) {
    SoundEffects.tocarTom(contexto, saidaAudio, instanteAtual, parametrosSom, "sawtooth", "linear");
  }
  static playGunshot(contexto, saidaAudio, instanteAtual, parametrosSom) {
    SoundEffects.tocarTom(contexto, saidaAudio, instanteAtual, parametrosSom, "sawtooth", "exponential");
  }
  static playCoinPing(contexto, saidaAudio, instanteAtual, parametrosSom) {
    try {
      const osc = contexto.createOscillator();
      const gain = contexto.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(parametrosSom.freq1, instanteAtual);
      osc.frequency.setValueAtTime(parametrosSom.freq2, instanteAtual + 0.08);
      gain.gain.setValueAtTime(parametrosSom.volume, instanteAtual);
      gain.gain.exponentialRampToValueAtTime(0.001, instanteAtual + parametrosSom.duration);
      osc.connect(gain);
      gain.connect(saidaAudio);
      osc.start(instanteAtual);
      osc.stop(instanteAtual + parametrosSom.duration);
    } catch {}
  }
  static playBossEnter(contexto, saidaAudio, instanteAtual) {
    try {
      const osc = contexto.createOscillator();
      const gain = contexto.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(80, instanteAtual);
      osc.frequency.linearRampToValueAtTime(160, instanteAtual + 0.45);
      gain.gain.setValueAtTime(0.38, instanteAtual);
      gain.gain.linearRampToValueAtTime(0.01, instanteAtual + 0.45);
      osc.connect(gain);
      gain.connect(saidaAudio);
      osc.start(instanteAtual);
      osc.stop(instanteAtual + 0.45);
    } catch {}
  }
  static playGameOver(contexto, saidaAudio, instanteAtual) {
    try {
      const osc = contexto.createOscillator();
      const gain = contexto.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(160, instanteAtual);
      osc.frequency.exponentialRampToValueAtTime(45, instanteAtual + 0.85);
      gain.gain.setValueAtTime(0.42, instanteAtual);
      gain.gain.linearRampToValueAtTime(0.01, instanteAtual + 0.85);
      osc.connect(gain);
      gain.connect(saidaAudio);
      osc.start(instanteAtual);
      osc.stop(instanteAtual + 0.85);
    } catch {}
  }
  static playVictory(contexto, saidaAudio, instanteAtual) {
    try {
      const notes = [
        {
          f: 293.66,
          t: 0
        },
        {
          f: 369.99,
          t: 0.15
        },
        {
          f: 440,
          t: 0.3
        },
        {
          f: 587.33,
          t: 0.45
        }
      ];
      notes.forEach(({ f: valorQuadro, t: fracao }) => {
        const osc = contexto.createOscillator();
        const gain = contexto.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(valorQuadro, instanteAtual + fracao);
        gain.gain.setValueAtTime(0.35, instanteAtual + fracao);
        gain.gain.exponentialRampToValueAtTime(0.001, instanteAtual + fracao + 0.6);
        osc.connect(gain);
        gain.connect(saidaAudio);
        osc.start(instanteAtual + fracao);
        osc.stop(instanteAtual + fracao + 0.6);
      });
    } catch {}
  }
  // Os efeitos simples compartilham a ligação dos nós, preservando a curva de cada som.
  static tocarTom(contexto, saidaAudio, instanteAtual, parametrosSom, onda, curva) {
    try {
      const oscilador = contexto.createOscillator();
      const ganho = contexto.createGain();
      oscilador.type = onda;
      oscilador.frequency.setValueAtTime(parametrosSom.startFreq, instanteAtual);
      oscilador.frequency.exponentialRampToValueAtTime(parametrosSom.endFreq, instanteAtual + parametrosSom.duration);
      ganho.gain.setValueAtTime(parametrosSom.volume, instanteAtual);
      if (curva === "linear") ganho.gain.linearRampToValueAtTime(0.01, instanteAtual + parametrosSom.duration);
      else ganho.gain.exponentialRampToValueAtTime(0.01, instanteAtual + parametrosSom.duration);
      oscilador.connect(ganho);
      ganho.connect(saidaAudio);
      oscilador.start(instanteAtual);
      oscilador.stop(instanteAtual + parametrosSom.duration);
    } catch {}
  }
}
