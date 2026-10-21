// Este arquivo cuida das ferramentas compartilhadas pelos cenários das fases:
// camadas estáticas desenhadas uma única vez, sorteios repetíveis e movimento reduzido.
// ===== DEPENDÊNCIAS E CONFIGURAÇÕES =====
import { GAME, CENARIOS } from "../../config/configuracao.js";

// Camadas já prontas, guardadas por nome. O desenho de cada fase é sempre o mesmo,
// então a mesma imagem serve para todas as vezes que a fase for carregada.
const camadasProntas = new Map();

// ===== SORTEIO REPETÍVEL =====
// Gera números entre 0 e 1 sempre na mesma ordem para a mesma semente.
// Assim a cidade, as garrafas e as manchas ficam iguais em toda partida.
export function criarSorteio(semente = 1) {
  let estado = semente >>> 0;
  return () => {
    estado = (estado + 0x6d2b79f5) >>> 0;
    let valor = estado;
    valor = Math.imul(valor ^ (valor >>> 15), valor | 1);
    valor ^= valor + Math.imul(valor ^ (valor >>> 7), valor | 61);
    return ((valor ^ (valor >>> 14)) >>> 0) / 4294967296;
  };
}

// ===== MOVIMENTO REDUZIDO =====
// Respeita a opção do sistema "reduzir movimento" (chuva, relâmpagos e oscilações param).
export function movimentoReduzido() {
  return globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

// ===== CORES =====
// Converte "#rrggbb" em "rgba(r, g, b, alfa)" para variar a transparência de uma cor da configuração.
export function rgba(hex, alfa) {
  const valor = Number.parseInt(hex.slice(1), 16);
  return `rgba(${valor >> 16}, ${valor >> 8 & 255}, ${valor & 255}, ${alfa})`;
}

// Suaviza uma transição entre 0 e 1 (começa e termina devagar).
export function suavizar(valor) {
  const fracao = Math.max(0, Math.min(1, valor));
  return fracao * fracao * (3 - 2 * fracao);
}

// ===== CAMADAS ESTÁTICAS =====
// Escala das imagens guardadas: por padrão, a mesma da tela (1920 ÷ 900), para não borrar.
function escalaDasCamadas() {
  return CENARIOS.geral.escalaCamadas ?? GAME.RENDER_WIDTH / GAME.WIDTH;
}

/**
 * Desenha uma camada estática UMA vez numa imagem guardada na memória.
 * `desenhar(contexto)` usa as mesmas coordenadas do jogo (espaço lógico 900 × 500).
 * Fora do navegador (nos testes automáticos) não existe canvas: devolve null e a
 * camada é desenhada direto a cada quadro, com o mesmo resultado.
 */
export function obterCamada(nome, largura, altura, desenhar) {
  if (camadasProntas.has(nome)) return camadasProntas.get(nome);
  if (!globalThis.document?.createElement) return null;
  const escala = escalaDasCamadas();
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(largura * escala);
  canvas.height = Math.ceil(altura * escala);
  const contexto = canvas.getContext("2d");
  if (!contexto) return null;
  contexto.scale(escala, escala);
  desenhar(contexto);
  const camada = { canvas, largura, altura };
  camadasProntas.set(nome, camada);
  return camada;
}

/**
 * Coloca uma camada na posição (x, y). Usa a imagem pronta quando existe;
 * senão, chama `desenhar` deslocado para a mesma posição.
 */
export function desenharCamada(contexto, camada, posicaoX, posicaoY, desenhar) {
  contexto.save();
  if (camada) {
    // A imagem guardada já tem a resolução da tela (1 pixel para 1 pixel): sem suavização,
    // a cópia é mais rápida e continua nítida.
    contexto.imageSmoothingEnabled = false;
    contexto.drawImage(camada.canvas, posicaoX, posicaoY, camada.largura, camada.altura);
  } else {
    contexto.translate(posicaoX, posicaoY);
    desenhar(contexto);
  }
  contexto.restore();
}
