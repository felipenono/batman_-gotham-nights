// Este arquivo cuida de ler o direcional do controle conectado.
// ===== DEPENDÊNCIAS E CONFIGURAÇÕES =====
import { LOBBY } from "../config/configuracao.js";
export function controleConectado() {
  const controles = globalThis.navigator?.getGamepads?.();
  return controles?.find((controle) => controle?.connected);
}
export function direcaoDoControle(controle) {
  const eixoVertical = controle.axes?.[1] ?? 0;
  const limite = LOBBY.motion.stickThreshold;
  if (controle.buttons[12]?.pressed || eixoVertical < -limite) return -1;
  if (controle.buttons[13]?.pressed || eixoVertical > limite) return 1;
  return 0;
}
