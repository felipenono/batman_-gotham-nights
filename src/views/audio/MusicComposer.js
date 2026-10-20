// Este arquivo cuida de agendar as notas das trilhas sintetizadas.
// ===== DEPENDÊNCIAS E CONFIGURAÇÕES =====
import { PARTITURAS } from "../../config/configuracao.js";
import { Instrumentos } from "./Instrumentos.js";
import { LOBBY } from "../../config/configuracao.js";
// ===== COMPORTAMENTO =====
export class MusicComposer extends Instrumentos {
  static scheduleStep(trilha, tempo, passo, contexto, destinoAudio) {
    if (!contexto || !destinoAudio) return;
    const compasso = Math.floor(passo / 16);
    const passoNoCompasso = passo % 16;
    if (trilha === "rooftops") {
      MusicComposer._playRooftopsTheme(tempo, passo, compasso, passoNoCompasso, contexto, destinoAudio);
    } else if (trilha === "boss") {
      MusicComposer._playBossTheme(tempo, passo, compasso, passoNoCompasso, contexto, destinoAudio);
    } else if (trilha === "menu") {
      MusicComposer._playMenuTheme(tempo, passo, compasso, passoNoCompasso, contexto, destinoAudio);
    } else if (trilha === "defeat" || trilha === "victory") {
      // Fallbacks discretos para os MP3 ainda não fornecidos.
      const notes = LOBBY.endScreens.screens[trilha].audio.notes;
      const note = notes[compasso % notes.length];
      if (passoNoCompasso === 0) {
        MusicComposer.playPad(tempo, note, 2.4, 0.16, contexto, destinoAudio);
        MusicComposer.playBell(tempo, note * 2, 1.3, 0.1, contexto, destinoAudio);
      }
      if (trilha === "victory" && passoNoCompasso % 8 === 0) {
        MusicComposer.playBrass(tempo, note * (passoNoCompasso ? 1.5 : 1), 0.65, 0.1, contexto, destinoAudio);
      }
    }
  }
  static _playRooftopsTheme(tempo, passo, compasso, passoNoCompasso, contexto, destinoAudio) {
    const bassNotes = PARTITURAS.baixoTelhados;
    const bassFreq = bassNotes[passoNoCompasso];
    const isAccent = passoNoCompasso % 4 === 0;
    MusicComposer.playBass(tempo, bassFreq, 0.12, isAccent ? 0.28 : 0.15, contexto, destinoAudio);
    if (passoNoCompasso === 0 || passoNoCompasso === 6 || passoNoCompasso === 10) {
      MusicComposer.playTimpani(tempo, 80, 0.22, contexto, destinoAudio);
    }
    if (passoNoCompasso === 4 || passoNoCompasso === 12) {
      MusicComposer.playSnare(tempo, 0.14, contexto, destinoAudio);
    }
    if (passoNoCompasso % 2 === 0) {
      MusicComposer.playHihat(tempo, 0.05, contexto, destinoAudio);
    }
    if (compasso === 1 || compasso === 3) {
      if (passoNoCompasso === 0) MusicComposer.playBrass(tempo, 146.83, 0.45, 0.28, contexto, destinoAudio);
      if (passoNoCompasso === 4) MusicComposer.playBrass(tempo, 174.61, 0.35, 0.28, contexto, destinoAudio);
      if (passoNoCompasso === 7) MusicComposer.playBrass(tempo, 146.83, 0.35, 0.28, contexto, destinoAudio);
      if (passoNoCompasso === 10) MusicComposer.playBrass(tempo, 138.59, 0.35, 0.28, contexto, destinoAudio);
      if (passoNoCompasso === 12) MusicComposer.playBrass(tempo, 146.83, 0.65, 0.28, contexto, destinoAudio);
    }
    if (passoNoCompasso === 0 && compasso % 2 === 0) {
      MusicComposer.playBell(tempo, 440, 0.8, 0.16, contexto, destinoAudio);
    }
  }
  static _playBossTheme(tempo, passo, compasso, passoNoCompasso, contexto, destinoAudio) {
    const bassFreq = compasso % 2 === 0 ? 65.41 : 73.42;
    MusicComposer.playBass(tempo, bassFreq, 0.1, 0.35, contexto, destinoAudio);
    if (passoNoCompasso % 2 === 0) {
      MusicComposer.playTimpani(tempo, 90, 0.3, contexto, destinoAudio);
    }
    if (passoNoCompasso % 4 === 2) {
      MusicComposer.playSnare(tempo, 0.25, contexto, destinoAudio);
    }
    if (passoNoCompasso === 0 || passoNoCompasso === 3 || passoNoCompasso === 6 || passoNoCompasso === 10 || passoNoCompasso === 14) {
      const stabFreq = passoNoCompasso === 6 ? 220 : 174.61;
      MusicComposer.playBrass(tempo, stabFreq, 0.18, 0.4, contexto, destinoAudio);
    }
  }
  static _playMenuTheme(tempo, passo, compasso, passoNoCompasso, contexto, destinoAudio) {
    if (passoNoCompasso === 0) {
      const chords = PARTITURAS.acordesMenu;
      MusicComposer.playPad(tempo, chords[compasso % chords.length], 2.2, 0.18, contexto, destinoAudio);
      MusicComposer.playBell(tempo, chords[compasso % chords.length] * 2, 1.4, 0.15, contexto, destinoAudio);
      MusicComposer.playTimpani(tempo, 65, 0.2, contexto, destinoAudio);
    }
  }
}
