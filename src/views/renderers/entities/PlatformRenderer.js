// Este arquivo cuida de desenhar cada tema de plataforma.
import { APARENCIA, CENARIOS } from "../../../config/configuracao.js";

// ===== DEPENDÊNCIAS E CONFIGURAÇÕES =====
const estiloVisual = APARENCIA.Platform;
// ===== COMPORTAMENTO =====
export function drawPlatform(contexto) {
    contexto.save();
    if (this.theme === "rooftop") {
      desenharTelhado.call(this, contexto);
    } else if (this.theme === "ac_unit") {
      desenharVentilacao.call(this, contexto);
    } else if (this.theme === "pipe") {
      desenharCano.call(this, contexto);
    } else if (this.theme === "casino") {
      desenharCassino.call(this, contexto);
    } else if (this.theme === "asylum") {
      desenharAsilo.call(this, contexto);
    }
    contexto.restore();

}

// ===== PLATAFORMAS DOS TELHADOS (Fase 1) =====
// Todas as superfícies jogáveis da fase têm o MESMO acabamento: material, borda clara de pisar
// no topo, contorno e sombra. Só o detalhe interno muda (juntas, grelha ou conduítes).
// Posição, tamanho e colisão continuam vindo da plataforma (this), sem nenhuma alteração.
function acabamentoDeTelhado(contexto) {
    const cores = CENARIOS.fase1.plataformas;
    const material = contexto.createLinearGradient(this.x, this.y, this.x, this.y + this.h);
    material.addColorStop(0, cores.materialTopo);
    material.addColorStop(0.25, cores.materialMeio);
    material.addColorStop(1, cores.materialBase);
    contexto.fillStyle = material;
    contexto.fillRect(this.x, this.y, this.w, this.h);
    // Sombra fina logo abaixo: descola a plataforma do fundo.
    contexto.fillStyle = cores.sombra;
    contexto.fillRect(this.x + 2, this.y + this.h, this.w - 2, 3);
    // Contorno escuro igual para todas.
    contexto.strokeStyle = cores.contorno;
    contexto.lineWidth = 1;
    contexto.strokeRect(this.x + 0.5, this.y + 0.5, this.w - 1, this.h - 1);
}

// Borda de pisar: a faixa clara do topo, por último, para ficar sempre visível.
function bordaDePisar(contexto) {
    const cores = CENARIOS.fase1.plataformas;
    contexto.fillStyle = cores.borda;
    contexto.fillRect(this.x, this.y, this.w, 3);
    contexto.fillStyle = cores.brilho;
    contexto.fillRect(this.x, this.y, this.w, 1);
}

export function desenharTelhado(contexto) {
    acabamentoDeTelhado.call(this, contexto);
    // Juntas das placas do telhado.
    contexto.strokeStyle = CENARIOS.fase1.plataformas.junta;
    contexto.lineWidth = 1;
    contexto.beginPath();
    for (let px = this.x + 40; px < this.x + this.w; px += 40) {
      contexto.moveTo(px + 0.5, this.y + 4);
      contexto.lineTo(px + 0.5, this.y + this.h - 1);
    }
    contexto.stroke();
    bordaDePisar.call(this, contexto);
}

export function desenharVentilacao(contexto) {
    const cores = CENARIOS.fase1.plataformas;
    acabamentoDeTelhado.call(this, contexto);
    // Grelha de ventilação embutida (detalhe decorativo, dentro da mesma superfície).
    contexto.fillStyle = cores.painel;
    contexto.fillRect(this.x + 5, this.y + 6, this.w - 10, this.h - 9);
    contexto.fillStyle = cores.junta;
    for (let py = this.y + 8; py < this.y + this.h - 4; py += 4) {
      contexto.fillRect(this.x + 7, py, this.w - 14, 2);
    }
    bordaDePisar.call(this, contexto);
}

export function desenharCano(contexto) {
    const cores = CENARIOS.fase1.plataformas;
    acabamentoDeTelhado.call(this, contexto);
    // Conduítes presos na lateral da laje (detalhe metálico fosco, não um cano solto).
    for (const py of [this.y + 9, this.y + this.h - 6]) {
      contexto.fillStyle = cores.detalhe;
      contexto.fillRect(this.x + 4, py - 2, this.w - 8, 4);
      contexto.fillStyle = cores.detalheClaro;
      contexto.fillRect(this.x + 4, py - 2, this.w - 8, 1);
    }
    contexto.fillStyle = cores.contorno;
    for (let px = this.x + 18; px < this.x + this.w - 8; px += 35) {
      contexto.fillRect(px, this.y + 5, 3, this.h - 7);
    }
    bordaDePisar.call(this, contexto);
}

export function desenharCassino(contexto) {
    const grad = contexto.createLinearGradient(this.x, this.y, this.x, this.y + this.h);
    grad.addColorStop(0, estiloVisual.gradiente15);
    grad.addColorStop(0.4, estiloVisual.gradiente16);
    grad.addColorStop(1, estiloVisual.gradiente17);
    contexto.fillStyle = grad;
    contexto.fillRect(this.x, this.y, this.w, this.h);
    contexto.fillStyle = estiloVisual.preenchimento18;
    contexto.fillRect(this.x, this.y, this.w, 4);
    contexto.fillRect(this.x, this.y + this.h - 3, this.w, 3);
    contexto.fillStyle = estiloVisual.preenchimento19;
    const count = Math.max(1, Math.floor(this.w / 40));
    const spacing = this.w / count;
    const centerY = this.y + (4 + this.h - 3) / 2;
    const radiusY = Math.min(5, (this.h - 9) / 2);
    for (let index = 0; index < count; index++) {
      const px = this.x + spacing * (index + 0.5);
      contexto.beginPath();
      contexto.moveTo(px, centerY - radiusY);
      contexto.lineTo(px + 4, centerY);
      contexto.lineTo(px, centerY + radiusY);
      contexto.lineTo(px - 4, centerY);
      contexto.closePath();
      contexto.fill();
    }

}

export function desenharAsilo(contexto) {
    const grad = contexto.createLinearGradient(this.x, this.y, this.x, this.y + this.h);
    grad.addColorStop(0, estiloVisual.gradiente20);
    grad.addColorStop(0.5, estiloVisual.gradiente21);
    grad.addColorStop(1, estiloVisual.gradiente22);
    contexto.fillStyle = grad;
    contexto.fillRect(this.x, this.y, this.w, this.h);
    contexto.fillStyle = estiloVisual.preenchimento23;
    contexto.fillRect(this.x, this.y, this.w, 3);
    contexto.strokeStyle = estiloVisual.contorno24;
    contexto.lineWidth = 2;
    for (let px = this.x + 12; px < this.x + this.w; px += 24) {
      contexto.beginPath();
      contexto.moveTo(px, this.y + 3);
      contexto.lineTo(px, this.y + this.h);
      contexto.stroke();
      contexto.fillStyle = estiloVisual.preenchimento25;
      contexto.beginPath();
      contexto.arc(px, this.y + 7, 2, 0, Math.PI * 2);
      contexto.fill();
    }

}
