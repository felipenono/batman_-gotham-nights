// Este arquivo cuida de formatar o relógio mostrado nas telas.
// ===== DEPENDÊNCIAS E CONFIGURAÇÕES =====
// Recebe segundos e devolve minutos:segundos, ou horas:minutos:segundos.
export function formatPlayTime(segundos) {
  const total = Number.isFinite(segundos) ? Math.max(0, Math.floor(segundos)) : 0;
  const minutos = Math.floor(total / 60);
  const segundosRestantes = String(total % 60).padStart(2, "0");
  if (minutos < 60) return String(minutos).padStart(2, "0") + ":" + segundosRestantes;
  const horas = Math.floor(minutos / 60);
  return horas + ":" + String(minutos % 60).padStart(2, "0") + ":" + segundosRestantes;
}
