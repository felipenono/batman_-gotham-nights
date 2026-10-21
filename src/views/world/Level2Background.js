// Este arquivo cuida de desenhar o Iceberg Lounge do Pinguim (Fase 2).
// Clube de luxo frio: azul profundo, detalhes dourados, bar, palco com escultura de gelo,
// vitrines de guarda-chuvas, lustres de cristal e letreiro de neon.
// Camadas: fundo do palco (parallax) → salão estático → luzes animadas → névoa e cristais de gelo.
// ===== DEPENDÊNCIAS E CONFIGURAÇÕES =====
import { APARENCIA, CENARIOS, LEVELS, LIGHTING } from "../../config/configuracao.js";
import { Background } from "./Background.js";
import { criarSorteio, desenharCamada, movimentoReduzido, obterCamada, rgba, suavizar } from "./camadas.js";
const estiloVisual = APARENCIA.Level2Background;
const ajustes = CENARIOS.fase2;
const cores = ajustes.cores;

// ===== PLANTA DO SALÃO (coordenadas do mundo, 1100 × 500; o chão jogável começa em y = 440) =====
const CHAO = 440;
// Abertura do palco (arco), por onde se vê o fundo com parallax.
const PALCO = { esquerda: 400, direita: 700, topoReto: 170, raioArco: 72, borda: CHAO - 36 };
const BAR = { esquerda: 30, direita: 318, espelhoTopo: 138, espelhoBase: 300, balcaoTopo: 394 };
const VITRINES = [800, 895, 990];
const LUSTRES = [250, 960];
const MESAS = [356, 744];
const LETREIRO = { x: 550, y: 50, largura: 280, altura: 40 };
// Fundo do palco: camada mais larga que a abertura para cobrir o deslocamento do parallax.
const FUNDO_PALCO = { largura: 470, inicio: 315 };

// ===== COMPORTAMENTO =====
export class Level2Background extends Background {
  // Recebe as dependências e prepara o estado inicial deste componente.
  constructor(largura = 900, altura = 500) {
    super(largura, altura);
    this.reduzido = movimentoReduzido();
    this.tempo = 0;
    this.spotlightAngle = 0;
    // Pequenos cristais de gelo flutuando no ar frio do salão.
    const sorteio = criarSorteio(4242);
    this.cristais = [];
    for (let indiceItem = 0; indiceItem < ajustes.cristais.quantidade; indiceItem++) {
      this.cristais.push({ x: sorteio() * largura, y: sorteio() * CHAO, velocidade: 0.12 + sorteio() * 0.2, fase: sorteio() * Math.PI * 2, tamanho: 0.6 + sorteio() * 0.9 });
    }
    // Brilhos que cintilam nos lustres (posições fixas nos cristais).
    this.cintilas = [];
    for (const centro of LUSTRES) {
      for (let indiceItem = 0; indiceItem < ajustes.lustres.cintilas; indiceItem++) {
        this.cintilas.push({ x: centro - 24 + sorteio() * 48, y: 100 + sorteio() * 28, fase: sorteio() * Math.PI * 2, ritmo: 0.6 + sorteio() * 0.9 });
      }
    }
    this.pintar = {
      salao: desenharSalaoEstatico.bind(null, largura, altura),
      fundoPalco: desenharFundoDoPalco,
      letreiro: desenharLetreiroAceso,
      brilhoLustre: desenharBrilhoDeLustre
    };
  }

  // Recebe a atualização atual e avança o estado, sem redesenhar a tela.
  update(passoTempo = 1, cameraDoJogo = null) {
    if (this.reduzido) return;
    this.tempo += passoTempo;
    this.spotlightAngle += ajustes.palco.velocidadeHolofote * passoTempo;
    for (const cristal of this.cristais) {
      cristal.y += cristal.velocidade * passoTempo;
      cristal.x += Math.sin(this.tempo * 0.01 + cristal.fase) * 0.15 * passoTempo;
      if (cristal.y > CHAO) {
        cristal.y = -5;
        cristal.x = (cristal.x + 377) % this.width;
      }
    }
  }

  // Recebe o contexto 2D e desenha o estado atual sem avançar o tempo.
  draw(contexto, cameraDoJogo = null) {
    const camX = cameraDoJogo?.renderX ?? 0;
    contexto.save();
    contexto.translate(-camX, -(cameraDoJogo?.renderY ?? 0));
    this.desenharFundoDoPalco(contexto, camX);
    // Salão inteiro (paredes, bar, vitrines, cortinas e móveis): preparado uma única vez.
    desenharCamada(contexto, obterCamada("fase2-salao", this.width, this.height, this.pintar.salao), 0, 0, this.pintar.salao);
    this.desenharHolofotes(contexto);
    this.desenharLuzesDaRibalta(contexto);
    this.desenharReflexoDoEspelho(contexto);
    this.desenharLetreiro(contexto);
    this.desenharLustres(contexto);
    this.desenharAbajures(contexto);
    this.desenharNevoaFria(contexto);
    this.desenharCristais(contexto);
    contexto.restore();
  }

  // ===== FUNDO DO PALCO (parallax) =====
  // O fundo anda mais devagar que o salão: parece estar mais longe, atrás da abertura do arco.
  desenharFundoDoPalco(contexto, camX) {
    const posicaoX = FUNDO_PALCO.inicio + camX * (1 - ajustes.palco.parallax);
    contexto.save();
    caminhoDaAbertura(contexto);
    contexto.clip();
    desenharCamada(contexto, obterCamada("fase2-fundo-palco", FUNDO_PALCO.largura, CHAO, this.pintar.fundoPalco), posicaoX, 0, this.pintar.fundoPalco);
    contexto.restore();
  }

  // ===== LUZES ANIMADAS =====
  // Dois holofotes do alto do arco varrendo o palco devagar, com uma poça de luz no chão.
  desenharHolofotes(contexto) {
    const alvoX = (PALCO.esquerda + PALCO.direita) / 2 + Math.sin(this.spotlightAngle) * ajustes.palco.amplitude;
    contexto.save();
    contexto.globalCompositeOperation = "lighter";
    contexto.globalAlpha = ajustes.palco.intensidade * LIGHTING.INTENSITY * 2;
    for (const [origemX, desvio] of [[PALCO.esquerda + 22, -26], [PALCO.direita - 22, 26]]) {
      const gradiente = contexto.createLinearGradient(origemX, PALCO.topoReto - 40, alvoX, PALCO.borda);
      gradiente.addColorStop(0, rgba(cores.luzFria, 0.55));
      gradiente.addColorStop(1, rgba(cores.luzFria, 0.08));
      contexto.fillStyle = gradiente;
      contexto.beginPath();
      contexto.moveTo(origemX - 4, PALCO.topoReto - 40);
      contexto.lineTo(alvoX + desvio - 42, PALCO.borda);
      contexto.lineTo(alvoX + desvio + 42, PALCO.borda);
      contexto.lineTo(origemX + 4, PALCO.topoReto - 40);
      contexto.closePath();
      contexto.fill();
    }
    // Poça de luz na borda do palco.
    const poca = contexto.createRadialGradient(alvoX, PALCO.borda, 4, alvoX, PALCO.borda, 90);
    poca.addColorStop(0, rgba(cores.luzFria, 0.5));
    poca.addColorStop(1, rgba(cores.luzFria, 0));
    contexto.fillStyle = poca;
    contexto.beginPath();
    contexto.ellipse(alvoX, PALCO.borda, 90, 14, 0, 0, Math.PI * 2);
    contexto.fill();
    contexto.restore();
  }
  // Lâmpadas na borda do palco (ribalta), com uma leve variação de brilho.
  desenharLuzesDaRibalta(contexto) {
    contexto.save();
    contexto.fillStyle = cores.luzQuente;
    for (let indiceItem = 0; indiceItem < 9; indiceItem++) {
      const posicaoX = PALCO.esquerda + 22 + indiceItem * ((PALCO.direita - PALCO.esquerda - 44) / 8);
      const variacao = this.reduzido ? 0 : Math.sin(this.tempo * 0.05 + indiceItem * 1.7) * 0.12;
      contexto.globalAlpha = (0.55 + variacao) * LIGHTING.INTENSITY * 2;
      contexto.beginPath();
      contexto.arc(posicaoX, PALCO.borda + 4, 1.8, 0, Math.PI * 2);
      contexto.fill();
      contexto.globalAlpha *= 0.25;
      contexto.beginPath();
      contexto.arc(posicaoX, PALCO.borda + 3, 6, 0, Math.PI * 2);
      contexto.fill();
    }
    contexto.restore();
  }
  // Um reflexo diagonal atravessa o espelho do bar de tempos em tempos.
  desenharReflexoDoEspelho(contexto) {
    if (this.reduzido) return;
    const ciclo = (this.tempo * ajustes.bar.velocidadeReflexo) % 1;
    const larguraEspelho = BAR.direita - BAR.esquerda - 20;
    const posicaoX = BAR.esquerda + 10 - 60 + ciclo * (larguraEspelho + 160);
    contexto.save();
    contexto.beginPath();
    contexto.rect(BAR.esquerda + 10, BAR.espelhoTopo + 8, larguraEspelho, BAR.espelhoBase - BAR.espelhoTopo - 16);
    contexto.clip();
    const gradiente = contexto.createLinearGradient(posicaoX - 30, 0, posicaoX + 30, 0);
    gradiente.addColorStop(0, rgba(cores.geloClaro, 0));
    gradiente.addColorStop(0.5, rgba(cores.geloClaro, ajustes.bar.opacidadeReflexo));
    gradiente.addColorStop(1, rgba(cores.geloClaro, 0));
    contexto.fillStyle = gradiente;
    contexto.beginPath();
    contexto.moveTo(posicaoX - 10, BAR.espelhoTopo);
    contexto.lineTo(posicaoX + 40, BAR.espelhoTopo);
    contexto.lineTo(posicaoX - 20, BAR.espelhoBase);
    contexto.lineTo(posicaoX - 70, BAR.espelhoBase);
    contexto.closePath();
    contexto.fill();
    contexto.restore();
  }
  // Letreiro de neon azul: aceso quase sempre, com um zumbido suave e, raramente, uma falha curta.
  desenharLetreiro(contexto) {
    const configuracao = ajustes.letreiro;
    let brilho = 1;
    if (!this.reduzido) {
      brilho = 1 - configuracao.zumbido * (0.5 + 0.5 * Math.sin(this.tempo * 0.21));
      const falha = Math.sin(this.tempo * configuracao.velocidadeFalha);
      if (falha > 0.985) brilho *= 0.45 + (1 - suavizar((falha - 0.985) / 0.015)) * 0.55;
    }
    const larguraSprite = LETREIRO.largura + 60, alturaSprite = LETREIRO.altura + 40;
    contexto.save();
    contexto.globalAlpha = brilho * Math.min(1, LIGHTING.INTENSITY * 2);
    desenharCamada(contexto, obterCamada("fase2-letreiro", larguraSprite, alturaSprite, this.pintar.letreiro), LETREIRO.x - larguraSprite / 2, LETREIRO.y - alturaSprite / 2, this.pintar.letreiro);
    contexto.restore();
  }
  // Brilho dos lustres respirando devagar e cintilas que acendem nos cristais.
  desenharLustres(contexto) {
    const respiracao = this.reduzido ? 0 : Math.sin(this.tempo * 0.02) * 0.08;
    contexto.save();
    contexto.globalCompositeOperation = "lighter";
    for (const centro of LUSTRES) {
      contexto.globalAlpha = (ajustes.lustres.brilho + respiracao) * LIGHTING.INTENSITY * 2;
      desenharCamada(contexto, obterCamada("fase2-brilho-lustre", 160, 120, this.pintar.brilhoLustre), centro - 80, 52, this.pintar.brilhoLustre);
    }
    contexto.fillStyle = cores.geloClaro;
    for (const cintila of this.cintilas) {
      const onda = this.reduzido ? 0.3 : Math.sin(this.tempo * 0.04 * cintila.ritmo + cintila.fase);
      const forca = Math.pow(Math.max(0, onda), 8);
      if (forca < 0.05) continue;
      contexto.globalAlpha = forca * 0.9;
      estrela(contexto, cintila.x, cintila.y, 1 + forca * 2.5);
    }
    contexto.restore();
  }
  // Abajures das mesinhas: chama quente com uma oscilação mínima.
  desenharAbajures(contexto) {
    contexto.save();
    contexto.globalCompositeOperation = "lighter";
    for (const [indiceItem, posicaoX] of MESAS.entries()) {
      const variacao = this.reduzido ? 0 : Math.sin(this.tempo * 0.09 + indiceItem * 2) * 0.06 + Math.sin(this.tempo * 0.23 + indiceItem) * 0.04;
      const brilho = contexto.createRadialGradient(posicaoX, 404, 1, posicaoX, 404, 30);
      brilho.addColorStop(0, rgba(cores.luzQuente, (0.42 + variacao) * LIGHTING.INTENSITY * 2));
      brilho.addColorStop(1, rgba(cores.luzQuente, 0));
      contexto.fillStyle = brilho;
      contexto.beginPath();
      contexto.arc(posicaoX, 404, 30, 0, Math.PI * 2);
      contexto.fill();
    }
    contexto.restore();
  }
  // Ar gelado rente ao chão, passando devagar.
  desenharNevoaFria(contexto) {
    const andar = this.tempo * ajustes.nevoa.velocidade;
    contexto.save();
    contexto.fillStyle = rgba(cores.nevoa, ajustes.nevoa.opacidade);
    contexto.beginPath();
    for (let indiceItem = 0; indiceItem < 12; indiceItem++) {
      const posicaoX = ((indiceItem * 105 + andar) % (this.width + 200)) - 100;
      contexto.ellipse(posicaoX, CHAO - 6 + Math.sin(indiceItem * 1.3) * 5, 80, 12, 0, 0, Math.PI * 2);
    }
    contexto.fill();
    contexto.restore();
  }
  desenharCristais(contexto) {
    if (this.reduzido) return;
    contexto.save();
    contexto.fillStyle = cores.geloClaro;
    for (const cristal of this.cristais) {
      contexto.globalAlpha = ajustes.cristais.opacidade * (0.5 + 0.5 * Math.sin(this.tempo * 0.05 + cristal.fase));
      contexto.beginPath();
      contexto.arc(cristal.x, cristal.y, cristal.tamanho, 0, Math.PI * 2);
      contexto.fill();
    }
    contexto.restore();
  }

  // ===== REFLEXOS NO PISO =====
  // Chamado depois das plataformas: reflexos fracos dos lustres e do palco no piso brilhante.
  // Ficam só dentro do chão (recorte) e são bem transparentes, sem esconder nada.
  drawSurfaceLighting(contexto, platforms) {
    const piso = platforms.find((plataforma) => plataforma.y >= CHAO && plataforma.w >= this.width * 0.9);
    if (!piso) return;
    const ondulacao = this.reduzido ? 0 : Math.sin(this.tempo * 0.03) * 0.25;
    contexto.save();
    contexto.beginPath();
    contexto.rect(piso.x, piso.y, piso.w, piso.h);
    contexto.clip();
    contexto.globalCompositeOperation = "lighter";
    const reflexos = [
      ...LUSTRES.map((posicaoX) => [posicaoX, cores.luzQuente, 26]),
      [(PALCO.esquerda + PALCO.direita) / 2 + Math.sin(this.spotlightAngle) * ajustes.palco.amplitude, cores.luzFria, 48]
    ];
    for (const [posicaoX, cor, metadeLargura] of reflexos) {
      const gradiente = contexto.createLinearGradient(0, piso.y, 0, piso.y + piso.h);
      gradiente.addColorStop(0, rgba(cor, ajustes.piso.reflexo * (1 + ondulacao) * LIGHTING.INTENSITY * 2));
      gradiente.addColorStop(1, rgba(cor, 0));
      contexto.fillStyle = gradiente;
      contexto.beginPath();
      contexto.moveTo(posicaoX - metadeLargura * 0.6, piso.y);
      contexto.lineTo(posicaoX + metadeLargura * 0.6, piso.y);
      contexto.lineTo(posicaoX + metadeLargura, piso.y + piso.h);
      contexto.lineTo(posicaoX - metadeLargura, piso.y + piso.h);
      contexto.closePath();
      contexto.fill();
    }
    contexto.restore();
  }
}

// ===== FORMAS AUXILIARES =====
// Contorno da abertura do palco: laterais retas e topo em arco.
function caminhoDaAbertura(contexto) {
  const centroX = (PALCO.esquerda + PALCO.direita) / 2, raioX = (PALCO.direita - PALCO.esquerda) / 2;
  contexto.beginPath();
  contexto.moveTo(PALCO.esquerda, CHAO);
  contexto.lineTo(PALCO.esquerda, PALCO.topoReto);
  contexto.ellipse(centroX, PALCO.topoReto, raioX, PALCO.raioArco, 0, Math.PI, 0, false);
  contexto.lineTo(PALCO.direita, CHAO);
  contexto.closePath();
}

// Estrela de quatro pontas (cintila).
function estrela(contexto, posicaoX, posicaoY, raio) {
  contexto.beginPath();
  contexto.moveTo(posicaoX, posicaoY - raio * 2);
  contexto.lineTo(posicaoX + raio * 0.4, posicaoY - raio * 0.4);
  contexto.lineTo(posicaoX + raio * 2, posicaoY);
  contexto.lineTo(posicaoX + raio * 0.4, posicaoY + raio * 0.4);
  contexto.lineTo(posicaoX, posicaoY + raio * 2);
  contexto.lineTo(posicaoX - raio * 0.4, posicaoY + raio * 0.4);
  contexto.lineTo(posicaoX - raio * 2, posicaoY);
  contexto.lineTo(posicaoX - raio * 0.4, posicaoY - raio * 0.4);
  contexto.closePath();
  contexto.fill();
}

// ===== DESENHO ESTÁTICO (preparado uma vez) =====
function desenharFundoDoPalco(contexto) {
  const largura = FUNDO_PALCO.largura, centro = largura / 2;
  // Parede do fundo do palco com luz azul vinda de baixo.
  const fundo = contexto.createLinearGradient(0, 90, 0, CHAO);
  fundo.addColorStop(0, cores.paredeTopo);
  fundo.addColorStop(0.7, cores.palcoFundo);
  fundo.addColorStop(1, cores.palcoLuz);
  contexto.fillStyle = fundo;
  contexto.fillRect(0, 0, largura, CHAO);
  // Cortina de fundo: pregas verticais bem escuras.
  for (let posicaoX = 0; posicaoX < largura; posicaoX += 16) {
    contexto.fillStyle = posicaoX % 32 === 0 ? rgba(cores.veludoEscuro, 0.55) : rgba(cores.veludo, 0.14);
    contexto.fillRect(posicaoX, 90, 9, CHAO - 130);
  }
  // Escultura de iceberg: facetas de gelo translúcido.
  const facetas = [
    [[centro - 92, 404], [centro - 70, 300], [centro - 30, 250], [centro - 8, 404]],
    [[centro - 40, 404], [centro - 22, 258], [centro + 6, 196], [centro + 30, 262], [centro + 46, 404]],
    [[centro + 12, 404], [centro + 40, 286], [centro + 70, 312], [centro + 96, 404]],
    [[centro - 22, 258], [centro + 6, 196], [centro + 2, 300]],
    [[centro + 40, 286], [centro + 70, 312], [centro + 52, 350]]
  ];
  const brilhoGelo = ajustes.palco.brilhoGelo;
  facetas.forEach((pontos, indiceItem) => {
    contexto.fillStyle = rgba(indiceItem >= 3 ? cores.geloClaro : cores.gelo, brilhoGelo * (indiceItem >= 3 ? 0.22 : 0.14 + indiceItem * 0.03));
    contexto.beginPath();
    pontos.forEach(([posicaoX, posicaoY], indicePonto) => contexto[indicePonto ? "lineTo" : "moveTo"](posicaoX, posicaoY));
    contexto.closePath();
    contexto.fill();
    contexto.strokeStyle = rgba(cores.geloClaro, 0.35 * brilhoGelo);
    contexto.lineWidth = 1;
    contexto.stroke();
  });
  // Piano de cauda e pianista: silhueta à esquerda do palco.
  contexto.fillStyle = cores.silhueta;
  contexto.beginPath();
  contexto.moveTo(70, 372);
  contexto.lineTo(150, 364);
  contexto.quadraticCurveTo(178, 366, 170, 382);
  contexto.lineTo(70, 384);
  contexto.closePath();
  contexto.fill();
  contexto.fillRect(78, 384, 3, 20);
  contexto.fillRect(160, 382, 3, 22);
  contexto.beginPath();
  contexto.moveTo(70, 372);
  contexto.lineTo(120, 330);
  contexto.lineTo(124, 334);
  contexto.lineTo(82, 372);
  contexto.closePath();
  contexto.fill();
  contexto.beginPath();
  contexto.arc(56, 352, 6, 0, Math.PI * 2);
  contexto.moveTo(48, 360);
  contexto.lineTo(64, 360);
  contexto.lineTo(66, 386);
  contexto.lineTo(46, 386);
  contexto.closePath();
  contexto.fill();
  // Microfone antigo à direita.
  contexto.fillRect(largura - 120, 340, 2, 64);
  contexto.beginPath();
  contexto.ellipse(largura - 119, 336, 4, 6, 0, 0, Math.PI * 2);
  contexto.fill();
}

function desenharSalaoEstatico(largura, altura, contexto) {
  desenharParedes(contexto, largura, altura);
  desenharMolduraDoPalco(contexto);
  desenharBar(contexto);
  desenharVitrines(contexto);
  desenharMesas(contexto);
  desenharEstruturaDosLustres(contexto);
  desenharPlacaDoLetreiro(contexto);
}

function desenharParedes(contexto, largura, altura) {
  // Parede com um "buraco" na abertura do palco (regra evenodd), para o fundo aparecer.
  const parede = contexto.createLinearGradient(0, 0, 0, altura);
  parede.addColorStop(0, cores.paredeTopo);
  parede.addColorStop(0.55, cores.paredeMeio);
  parede.addColorStop(1, cores.paredeBase);
  contexto.fillStyle = parede;
  contexto.beginPath();
  contexto.rect(0, 0, largura, altura);
  const centroX = (PALCO.esquerda + PALCO.direita) / 2, raioX = (PALCO.direita - PALCO.esquerda) / 2;
  contexto.moveTo(PALCO.esquerda, CHAO);
  contexto.lineTo(PALCO.direita, CHAO);
  contexto.lineTo(PALCO.direita, PALCO.topoReto);
  contexto.ellipse(centroX, PALCO.topoReto, raioX, PALCO.raioArco, 0, 0, Math.PI, true);
  contexto.closePath();
  contexto.fill("evenodd");
  // Painéis art déco discretos nas paredes.
  contexto.strokeStyle = rgba(cores.ouro, 0.12);
  contexto.lineWidth = 1;
  for (const [inicio, fim] of [[30, 330], [770, 1080]]) {
    for (let posicaoX = inicio; posicaoX < fim - 40; posicaoX += 75) {
      contexto.strokeRect(posicaoX + 8, 62, 59, 60);
    }
  }
  // Teto escuro com sanca dourada.
  contexto.fillStyle = cores.teto;
  contexto.fillRect(0, 0, largura, 30);
  contexto.fillStyle = rgba(cores.ouro, 0.55);
  contexto.fillRect(0, 30, largura, 2);
  contexto.fillStyle = rgba(cores.ouro, 0.22);
  contexto.fillRect(0, 35, largura, 1);
  for (let posicaoX = 10; posicaoX < largura; posicaoX += 46) {
    contexto.fillStyle = rgba(cores.ouro, 0.08);
    contexto.fillRect(posicaoX, 8, 30, 14);
  }
  // Pilastras com capitel escalonado dourado.
  for (const posicaoX of [14, 340, 762, 1086]) {
    contexto.fillStyle = cores.pilastra;
    contexto.fillRect(posicaoX - 12, 36, 24, CHAO - 36);
    contexto.fillStyle = rgba(cores.ouro, 0.45);
    contexto.fillRect(posicaoX - 15, 36, 30, 4);
    contexto.fillRect(posicaoX - 12, 42, 24, 3);
    contexto.fillRect(posicaoX - 9, 47, 18, 2);
    contexto.fillStyle = rgba(cores.ouro, 0.14);
    contexto.fillRect(posicaoX - 1, 54, 2, CHAO - 70);
  }
}

function desenharMolduraDoPalco(contexto) {
  const centroX = (PALCO.esquerda + PALCO.direita) / 2, raioX = (PALCO.direita - PALCO.esquerda) / 2;
  // Moldura dourada em volta do arco.
  contexto.strokeStyle = rgba(cores.ouro, 0.7);
  contexto.lineWidth = 3;
  contexto.beginPath();
  contexto.moveTo(PALCO.esquerda - 6, PALCO.borda);
  contexto.lineTo(PALCO.esquerda - 6, PALCO.topoReto);
  contexto.ellipse(centroX, PALCO.topoReto, raioX + 6, PALCO.raioArco + 6, 0, Math.PI, 0, false);
  contexto.lineTo(PALCO.direita + 6, PALCO.borda);
  contexto.stroke();
  contexto.strokeStyle = rgba(cores.ouro, 0.25);
  contexto.lineWidth = 1;
  contexto.beginPath();
  contexto.moveTo(PALCO.esquerda - 13, PALCO.borda);
  contexto.lineTo(PALCO.esquerda - 13, PALCO.topoReto);
  contexto.ellipse(centroX, PALCO.topoReto, raioX + 13, PALCO.raioArco + 13, 0, Math.PI, 0, false);
  contexto.lineTo(PALCO.direita + 13, PALCO.borda);
  contexto.stroke();
  // Cortinas e bambinela ficam recortadas pelo contorno da abertura (não cobrem a moldura).
  contexto.save();
  caminhoDaAbertura(contexto);
  contexto.clip();
  // Cortinas laterais de veludo azul, presas por cordões dourados.
  for (const lado of [-1, 1]) {
    const borda = lado < 0 ? PALCO.esquerda : PALCO.direita;
    const larguraCortina = 52;
    const inicio = lado < 0 ? borda : borda - larguraCortina;
    const veludo = contexto.createLinearGradient(inicio, 0, inicio + larguraCortina, 0);
    for (let parada = 0; parada <= 6; parada++) {
      veludo.addColorStop(parada / 6, parada % 2 ? cores.veludo : cores.veludoEscuro);
    }
    contexto.fillStyle = veludo;
    contexto.beginPath();
    contexto.moveTo(borda, PALCO.topoReto - 40);
    contexto.lineTo(borda - lado * larguraCortina, PALCO.topoReto - 30);
    contexto.quadraticCurveTo(borda - lado * 30, 300, borda - lado * 16, 318);
    contexto.quadraticCurveTo(borda - lado * 34, 360, borda - lado * 40, PALCO.borda);
    contexto.lineTo(borda, PALCO.borda);
    contexto.closePath();
    contexto.fill();
    contexto.fillStyle = rgba(cores.ouro, 0.7);
    contexto.beginPath();
    contexto.arc(borda - lado * 16, 318, 3, 0, Math.PI * 2);
    contexto.fill();
  }
  // Bambinela (faixa de cortina no alto) com franja dourada.
  contexto.fillStyle = cores.veludoEscuro;
  contexto.beginPath();
  contexto.moveTo(PALCO.esquerda, PALCO.topoReto - 34);
  for (let indiceItem = 0; indiceItem < 4; indiceItem++) {
    const inicio = PALCO.esquerda + indiceItem * 75;
    contexto.quadraticCurveTo(inicio + 37, PALCO.topoReto - 2, inicio + 75, PALCO.topoReto - 34);
  }
  contexto.lineTo(PALCO.direita, PALCO.topoReto - 80);
  contexto.lineTo(PALCO.esquerda, PALCO.topoReto - 80);
  contexto.closePath();
  contexto.fill();
  contexto.strokeStyle = rgba(cores.ouro, 0.55);
  contexto.lineWidth = 1.5;
  contexto.beginPath();
  contexto.moveTo(PALCO.esquerda, PALCO.topoReto - 34);
  for (let indiceItem = 0; indiceItem < 4; indiceItem++) {
    const inicio = PALCO.esquerda + indiceItem * 75;
    contexto.quadraticCurveTo(inicio + 37, PALCO.topoReto - 2, inicio + 75, PALCO.topoReto - 34);
  }
  contexto.stroke();
  contexto.restore();
  // Frente do palco: madeira escura, sem borda clara (não deve parecer uma plataforma).
  contexto.fillStyle = cores.palcoFrente;
  contexto.fillRect(PALCO.esquerda - 14, PALCO.borda, PALCO.direita - PALCO.esquerda + 28, CHAO - PALCO.borda);
  contexto.fillStyle = rgba(cores.ouro, 0.12);
  for (let posicaoX = PALCO.esquerda; posicaoX < PALCO.direita; posicaoX += 30) {
    contexto.fillRect(posicaoX, PALCO.borda + 12, 1, CHAO - PALCO.borda - 16);
  }
}

function desenharBar(contexto) {
  const sorteio = criarSorteio(1959);
  // Espelho atrás do balcão, com moldura dourada.
  const espelho = contexto.createLinearGradient(BAR.esquerda, BAR.espelhoTopo, BAR.direita, BAR.espelhoBase);
  espelho.addColorStop(0, cores.espelho);
  espelho.addColorStop(0.5, cores.espelhoClaro);
  espelho.addColorStop(1, cores.espelho);
  contexto.fillStyle = espelho;
  contexto.fillRect(BAR.esquerda + 10, BAR.espelhoTopo, BAR.direita - BAR.esquerda - 20, BAR.espelhoBase - BAR.espelhoTopo);
  contexto.strokeStyle = rgba(cores.ouro, 0.5);
  contexto.lineWidth = 2;
  contexto.strokeRect(BAR.esquerda + 10, BAR.espelhoTopo, BAR.direita - BAR.esquerda - 20, BAR.espelhoBase - BAR.espelhoTopo);
  // Prateleiras com garrafas.
  for (const prateleira of [184, 226, 268]) {
    contexto.fillStyle = rgba(cores.ouro, 0.3);
    contexto.fillRect(BAR.esquerda + 14, prateleira, BAR.direita - BAR.esquerda - 28, 2);
    for (let posicaoX = BAR.esquerda + 20; posicaoX < BAR.direita - 26;) {
      const larguraGarrafa = 4 + sorteio() * 4, alturaGarrafa = 14 + sorteio() * 12;
      const cor = ajustes.bar.garrafas[Math.floor(sorteio() * ajustes.bar.garrafas.length)];
      contexto.fillStyle = rgba(cor, ajustes.bar.opacidadeGarrafas);
      contexto.fillRect(posicaoX, prateleira - alturaGarrafa, larguraGarrafa, alturaGarrafa);
      contexto.fillRect(posicaoX + larguraGarrafa / 2 - 1, prateleira - alturaGarrafa - 5, 2, 5);
      contexto.fillStyle = rgba(cores.geloClaro, 0.14);
      contexto.fillRect(posicaoX + 1, prateleira - alturaGarrafa + 2, 1, alturaGarrafa - 4);
      posicaoX += larguraGarrafa + 3 + sorteio() * 6;
    }
  }
  // Armário baixo do bar.
  contexto.fillStyle = cores.balcao;
  contexto.fillRect(BAR.esquerda + 10, BAR.espelhoBase, BAR.direita - BAR.esquerda - 20, BAR.balcaoTopo - BAR.espelhoBase);
  // Silhuetas: barman atrás do balcão e dois clientes nas banquetas.
  contexto.fillStyle = cores.silhueta;
  silhuetaDePessoa(contexto, 196, BAR.balcaoTopo, 1, false);
  // Balcão: frente com frisos dourados finos e tampo só um pouco mais claro.
  contexto.fillStyle = cores.balcaoFrente;
  contexto.fillRect(BAR.esquerda, BAR.balcaoTopo, BAR.direita - BAR.esquerda, CHAO - BAR.balcaoTopo);
  contexto.fillStyle = cores.balcaoTampo;
  contexto.fillRect(BAR.esquerda - 4, BAR.balcaoTopo, BAR.direita - BAR.esquerda + 8, 4);
  contexto.fillStyle = rgba(cores.ouro, 0.2);
  for (let posicaoX = BAR.esquerda + 12; posicaoX < BAR.direita; posicaoX += 24) {
    contexto.fillRect(posicaoX, BAR.balcaoTopo + 10, 1, CHAO - BAR.balcaoTopo - 14);
  }
  // Banquetas e clientes.
  contexto.fillStyle = cores.silhueta;
  for (const posicaoX of [72, 132, 192, 252]) {
    contexto.beginPath();
    contexto.ellipse(posicaoX, 414, 10, 3, 0, 0, Math.PI * 2);
    contexto.fill();
    contexto.fillRect(posicaoX - 1, 414, 2, 24);
    contexto.beginPath();
    contexto.ellipse(posicaoX, 439, 7, 2, 0, 0, Math.PI * 2);
    contexto.fill();
  }
  silhuetaDePessoa(contexto, 132, 414, 1, true);
  silhuetaDePessoa(contexto, 252, 414, 0.95, false);
}

// Cabeça, chapéu opcional e ombros; a base fica em `base`.
function silhuetaDePessoa(contexto, posicaoX, base, escala, chapeu) {
  contexto.beginPath();
  contexto.moveTo(posicaoX - 11 * escala, base);
  contexto.lineTo(posicaoX - 9 * escala, base - 26 * escala);
  contexto.quadraticCurveTo(posicaoX, base - 32 * escala, posicaoX + 9 * escala, base - 26 * escala);
  contexto.lineTo(posicaoX + 11 * escala, base);
  contexto.closePath();
  contexto.fill();
  contexto.beginPath();
  contexto.arc(posicaoX, base - 38 * escala, 7 * escala, 0, Math.PI * 2);
  contexto.fill();
  if (chapeu) {
    contexto.fillRect(posicaoX - 11 * escala, base - 44 * escala, 22 * escala, 3 * escala);
    contexto.fillRect(posicaoX - 6 * escala, base - 52 * escala, 12 * escala, 9 * escala);
  }
}

function desenharVitrines(contexto) {
  const guardaChuvas = ajustes.vitrines.guardaChuvas;
  VITRINES.forEach((posicaoX, indiceItem) => {
    const largura = 74, topo = 120, base = 396;
    // Fundo da vitrine e luz que desce do alto.
    const luz = contexto.createLinearGradient(0, topo, 0, base);
    luz.addColorStop(0, rgba(cores.luzFria, 0.2));
    luz.addColorStop(0.6, rgba(cores.vidro, 0.05));
    luz.addColorStop(1, rgba(cores.vidro, 0.02));
    contexto.fillStyle = cores.vitrineFundo;
    contexto.fillRect(posicaoX, topo, largura, base - topo);
    contexto.fillStyle = luz;
    contexto.fillRect(posicaoX, topo, largura, base - topo);
    // Guarda-chuva aberto, a peça da coleção do Pinguim.
    const centro = posicaoX + largura / 2;
    contexto.fillStyle = guardaChuvas[indiceItem % guardaChuvas.length];
    contexto.beginPath();
    contexto.moveTo(centro - 26, 214);
    contexto.quadraticCurveTo(centro, 166, centro + 26, 214);
    for (let gomo = 0; gomo < 4; gomo++) {
      const inicio = centro + 26 - gomo * 13;
      contexto.quadraticCurveTo(inicio - 6.5, 207, inicio - 13, 214);
    }
    contexto.closePath();
    contexto.fill();
    contexto.strokeStyle = rgba(cores.geloClaro, 0.35);
    contexto.lineWidth = 1;
    contexto.stroke();
    contexto.fillStyle = cores.cabo;
    contexto.fillRect(centro - 1, 178, 2, 98);
    contexto.beginPath();
    contexto.arc(centro - 5, 276, 5, 0, Math.PI, false);
    contexto.lineWidth = 2;
    contexto.strokeStyle = cores.cabo;
    contexto.stroke();
    // Pedestal e plaquinha dourada.
    contexto.fillStyle = cores.balcao;
    contexto.fillRect(posicaoX + 14, 300, largura - 28, base - 300);
    contexto.fillStyle = rgba(cores.ouro, 0.55);
    contexto.fillRect(centro - 12, 318, 24, 6);
    // Vidro: moldura dourada, faixa de luz no topo e um reflexo diagonal.
    contexto.fillStyle = rgba(cores.luzFria, 0.6);
    contexto.fillRect(posicaoX + 4, topo + 3, largura - 8, 2);
    contexto.strokeStyle = rgba(cores.ouro, 0.55);
    contexto.lineWidth = 2;
    contexto.strokeRect(posicaoX, topo, largura, base - topo);
    contexto.fillStyle = rgba(cores.geloClaro, 0.06);
    contexto.beginPath();
    contexto.moveTo(posicaoX + 10, topo);
    contexto.lineTo(posicaoX + 26, topo);
    contexto.lineTo(posicaoX + 4, topo + 120);
    contexto.lineTo(posicaoX + 4, topo + 40);
    contexto.closePath();
    contexto.fill();
  });
}

function desenharMesas(contexto) {
  contexto.fillStyle = cores.silhueta;
  for (const posicaoX of MESAS) {
    // Mesinha redonda de pé central com abajur.
    contexto.beginPath();
    contexto.ellipse(posicaoX, 414, 16, 4, 0, 0, Math.PI * 2);
    contexto.fill();
    contexto.fillRect(posicaoX - 1.5, 414, 3, 24);
    contexto.beginPath();
    contexto.ellipse(posicaoX, 439, 9, 2, 0, 0, Math.PI * 2);
    contexto.fill();
    contexto.fillStyle = rgba(cores.luzQuente, 0.55);
    contexto.beginPath();
    contexto.moveTo(posicaoX - 6, 410);
    contexto.lineTo(posicaoX - 3, 400);
    contexto.lineTo(posicaoX + 3, 400);
    contexto.lineTo(posicaoX + 6, 410);
    contexto.closePath();
    contexto.fill();
    contexto.fillStyle = cores.silhueta;
  }
}

function desenharEstruturaDosLustres(contexto) {
  for (const centro of LUSTRES) {
    contexto.strokeStyle = rgba(cores.ouro, 0.5);
    contexto.lineWidth = 1.5;
    contexto.beginPath();
    contexto.moveTo(centro, 32);
    contexto.lineTo(centro, 96);
    contexto.stroke();
    // Coroa dourada e três fileiras de cristais.
    contexto.fillStyle = rgba(cores.ouro, 0.7);
    contexto.beginPath();
    contexto.ellipse(centro, 98, 30, 5, 0, 0, Math.PI * 2);
    contexto.fill();
    contexto.fillStyle = rgba(cores.geloClaro, 0.7);
    [[30, 104, 8], [22, 114, 6], [12, 124, 4]].forEach(([raio, posicaoY, gotas]) => {
      for (let indiceItem = 0; indiceItem <= gotas; indiceItem++) {
        const posicaoX = centro - raio + indiceItem * (raio * 2 / gotas);
        contexto.beginPath();
        contexto.moveTo(posicaoX, posicaoY - 5);
        contexto.lineTo(posicaoX + 2, posicaoY);
        contexto.lineTo(posicaoX, posicaoY + 5);
        contexto.lineTo(posicaoX - 2, posicaoY);
        contexto.closePath();
        contexto.fill();
      }
    });
  }
}

function desenharBrilhoDeLustre(contexto) {
  const brilho = contexto.createRadialGradient(80, 56, 4, 80, 56, 80);
  brilho.addColorStop(0, rgba(cores.luzQuente, 0.55));
  brilho.addColorStop(0.35, rgba(cores.luzQuente, 0.16));
  brilho.addColorStop(1, rgba(cores.luzQuente, 0));
  contexto.fillStyle = brilho;
  contexto.fillRect(0, 0, 160, 120);
}

function desenharPlacaDoLetreiro(contexto) {
  // Placa escura onde fica o neon (o neon aceso é uma camada à parte, com brilho).
  contexto.fillStyle = cores.placa;
  contexto.fillRect(LETREIRO.x - LETREIRO.largura / 2, LETREIRO.y - LETREIRO.altura / 2, LETREIRO.largura, LETREIRO.altura);
  contexto.strokeStyle = rgba(cores.ouro, 0.45);
  contexto.lineWidth = 1;
  contexto.strokeRect(LETREIRO.x - LETREIRO.largura / 2 - 3, LETREIRO.y - LETREIRO.altura / 2 - 3, LETREIRO.largura + 6, LETREIRO.altura + 6);
}

function desenharLetreiroAceso(contexto) {
  const larguraSprite = LETREIRO.largura + 60, alturaSprite = LETREIRO.altura + 40;
  const centroX = larguraSprite / 2, centroY = alturaSprite / 2;
  contexto.shadowColor = estiloVisual.brilho14;
  contexto.shadowBlur = 10;
  contexto.strokeStyle = cores.neon;
  contexto.lineWidth = 2;
  contexto.strokeRect(centroX - LETREIRO.largura / 2 + 6, centroY - LETREIRO.altura / 2 + 5, LETREIRO.largura - 12, LETREIRO.altura - 10);
  contexto.textAlign = "center";
  contexto.textBaseline = "middle";
  contexto.font = estiloVisual.fonte1;
  contexto.fillStyle = cores.neonForte;
  // O letreiro mostra o nome da fase definido em LEVELS (um único lugar para o nome).
  contexto.fillText(LEVELS.LEVEL_2.name, centroX - 14, centroY + 1);
  // Pinguim de cartola em neon, à direita do nome.
  const pinguimX = centroX + LETREIRO.largura / 2 - 26, pinguimY = centroY + 2;
  contexto.lineWidth = 1.6;
  contexto.beginPath();
  contexto.ellipse(pinguimX, pinguimY + 3, 7, 9, 0, 0, Math.PI * 2);
  contexto.moveTo(pinguimX + 3, pinguimY - 3);
  contexto.arc(pinguimX, pinguimY - 7, 4, 0, Math.PI * 2);
  contexto.moveTo(pinguimX - 6, pinguimY - 11);
  contexto.lineTo(pinguimX + 6, pinguimY - 11);
  contexto.moveTo(pinguimX - 3.5, pinguimY - 11);
  contexto.lineTo(pinguimX - 3.5, pinguimY - 17);
  contexto.lineTo(pinguimX + 3.5, pinguimY - 17);
  contexto.lineTo(pinguimX + 3.5, pinguimY - 11);
  contexto.stroke();
  // Monóculo dourado.
  contexto.strokeStyle = cores.ouroClaro;
  contexto.shadowColor = cores.ouroClaro;
  contexto.beginPath();
  contexto.arc(pinguimX + 1.5, pinguimY - 7.5, 1.6, 0, Math.PI * 2);
  contexto.stroke();
}
