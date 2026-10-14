/**
 * ============================================================================
 * @file GameState.js
 * @category POO - Padrão de Projeto: Máquina de Estados Finitos (State Pattern / Enum)
 * ============================================================================
 * CONCEITOS DE PROGRAMAÇÃO ORIENTADA A OBJETOS (POO):
 * 
 * 1. PADRÃO STATE (Finite State Machine - FSM):
 *    Em vez de usar múltiplas variáveis booleanas espalhadas (ex: isMenu, isOver, isPlaying),
 *    o ciclo de vida da aplicação é governado por uma máquina de estados finitos inequívoca.
 * 
 * 2. IMUTABILIDADE & ELIMINAÇÃO DE "MAGIC STRINGS":
 *    Centraliza constantes simbólicas para garantir tipagem previsível e prevenir bugs
 *    de digitação em transições de tela no Game.js.
 * ============================================================================
 */

export const GameState = Object.freeze({
  MENU: 'MENU',                         // Tela de título e aguardo de início
  PLAYING: 'PLAYING',                   // Loop de combate ativo
  PAUSED: 'PAUSED',                     // Mundo e cronômetro congelados
  LEVEL_TRANSITION: 'LEVEL_TRANSITION', // Cortina art déco de avanço entre fases
  GAME_OVER: 'GAME_OVER',               // Derrota do Batman e menu de reinício
  VICTORY: 'VICTORY',                   // Triunfo final após derrotar todos os chefes
});
