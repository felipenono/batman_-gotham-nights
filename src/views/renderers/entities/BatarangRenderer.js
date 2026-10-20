// Este arquivo cuida de controlar o batarangue e seu limite de lançamentos.
// ===== DEPENDÊNCIAS E CONFIGURAÇÕES =====
import { drawBatarang } from "../batSymbols.js";
// ===== COMPORTAMENTO =====
export function paintBatarang(contexto) {
    if (!this.alive) return;
    contexto.save();
    contexto.translate(this.x + this.w / 2, this.y + this.h / 2);
    contexto.rotate(this.spin);
    drawBatarang(contexto);
    contexto.restore();

}
