// Este arquivo cuida de definir os estados possíveis da partida.
// ===== DEPENDÊNCIAS E CONFIGURAÇÕES =====
export const GameState = Object.freeze({
  MENU: "MENU",
  PLAYING: "PLAYING",
  PAUSED: "PAUSED",
  LEVEL_TRANSITION: "LEVEL_TRANSITION",
  GAME_OVER: "GAME_OVER",
  VICTORY: "VICTORY"
});
