// Este arquivo cuida de desenhar os telhados e o céu de Gotham (Fase 1).
// Camadas, de trás para a frente: céu → relâmpago → nuvens → lua do Bat-Sinal →
// cidade distante → prédios intermediários → feixe e refletor → telhados próximos → névoa → chuva.
// ===== DEPENDÊNCIAS E CONFIGURAÇÕES =====
import { APARENCIA, CENARIOS, LOBBY } from "../../config/configuracao.js";
import { BatSignal, symbolBounds } from "../scenes/BatSignal.js";
import { Background } from "./Background.js";
import { criarSorteio, desenharCamada, movimentoReduzido, obterCamada, rgba, suavizar } from "./camadas.js";
const estiloVisual = APARENCIA.Level1Background;
const ajustes = CENARIOS.fase1;
const cores = ajustes.cores;

// O Bat-Sinal da fase é o MESMO do lobby (classe BatSignal): mesma logo (LOBBY.assets.logo),
// mesmas texturas de lua, halo e feixe. Um único carregamento serve para todas as partidas.
let sinalDaFase = null;
function sinalCompartilhado() {
  sinalDaFase ??= new BatSignal();
  return sinalDaFase;
}

// ===== COMPORTAMENTO =====
export class Level1Background extends Background {
  // Recebe as dependências e prepara o estado inicial deste componente.
  constructor(largura = 900, altura = 500) {
    super(largura, altura);
    this.reduzido = movimentoReduzido();
    this.tempo = 0;
    // Chuva em duas profundidades: gotas distantes (finas e lentas) e próximas.
    this.rainDrops = [];
    const quantidadePerto = Math.round(ajustes.chuva.quantidade * ajustes.chuva.fracaoPerto);
    for (let indiceItem = 0; indiceItem < ajustes.chuva.quantidade; indiceItem++) {
      const perto = indiceItem < quantidadePerto;
      this.rainDrops.push({
        x: Math.random() * (largura + 100),
        y: Math.random() * altura,
        len: perto ? 14 + Math.random() * 10 : 7 + Math.random() * 6,
        speed: (perto ? ajustes.chuva.velocidadePerto : ajustes.chuva.velocidadeLonge) * (0.85 + Math.random() * 0.3),
        perto
      });
    }
    this.lightningTimer = ajustes.relampago.intervaloMin;
    this.lightningAlpha = 0;
    // Plantas da cidade: geradas uma vez, sempre iguais (sorteio com semente fixa).
    this.distantes = gerarCidadeDistante();
    this.predios = gerarPrediosIntermediarios();
    this.proximos = gerarTelhadosProximos();
    this.janelasPiscando = escolherJanelasPiscando(this.predios);
    this.luzesDeAntena = escolherLuzesDeAntena(this.distantes, this.predios);
    // Funções que pintam cada camada estática (preparadas uma vez, reaproveitadas a cada quadro).
    this.pintar = {
      ceu: desenharCeuEstatico.bind(null, largura, altura),
      distante: desenharCidadeDistante.bind(null, this.distantes, altura),
      intermediaria: desenharPrediosIntermediarios.bind(null, this.predios, altura),
      proxima: desenharTelhadosProximos.bind(null, this.proximos, altura)
    };
  }

  // Recebe a atualização atual e avança o estado, sem redesenhar a tela.
  update(passoTempo = 1, cameraDoJogo = null) {
    // Com movimento reduzido, o cenário fica parado: sem chuva, relâmpago ou névoa andando.
    if (this.reduzido) return;
    this.tempo += passoTempo;
    for (const gota of this.rainDrops) {
      gota.y += gota.speed * passoTempo;
      gota.x -= ajustes.chuva.vento * (gota.perto ? 1 : 0.6) * passoTempo;
      if (gota.y > this.height) {
        gota.y = -20;
        gota.x = Math.random() * (this.width + 100);
      }
    }
    this.lightningTimer -= passoTempo;
    if (this.lightningTimer <= 0) {
      const { intervaloMin, intervaloMax, intensidade } = ajustes.relampago;
      this.lightningTimer = intervaloMin + Math.random() * (intervaloMax - intervaloMin);
      this.lightningAlpha = intensidade;
    }
    if (this.lightningAlpha > 0) {
      this.lightningAlpha = Math.max(0, this.lightningAlpha - ajustes.relampago.queda * passoTempo);
    }
  }

  // Recebe o contexto 2D e desenha o estado atual sem avançar o tempo.
  draw(contexto, cameraDoJogo = null) {
    const camX = cameraDoJogo ? cameraDoJogo.renderX : 0;
    const parallax = ajustes.parallax;
    contexto.save();
    this.desenharCeu(contexto);
    this.desenharRelampago(contexto);
    this.desenharNuvensAoFundo(contexto, camX);
    // Lua atrás da cidade (ela está longe).
    const lua = this.layoutDoSinal(camX);
    this.desenharLua(contexto, lua);
    // Cidade distante: muito escura e enevoada, quase parada.
    desenharCamada(contexto, obterCamada("fase1-distante", LARGURA_DISTANTE, this.height, this.pintar.distante), -camX * parallax.distante - MARGEM, 0, this.pintar.distante);
    this.desenharLuzesDeAntena(contexto, camX, "distante");
    // Prédios intermediários: caixas-d'água, antenas e janelas.
    desenharCamada(contexto, obterCamada("fase1-intermediaria", LARGURA_INTERMEDIARIA, this.height, this.pintar.intermediaria), -camX * parallax.intermediaria - MARGEM, 0, this.pintar.intermediaria);
    this.desenharJanelasPiscando(contexto, camX);
    this.desenharLuzesDeAntena(contexto, camX, "intermediaria");
    // O refletor fica no telhado do prédio do sinal (camada intermediária, mesmo parallax dela).
    // O feixe sobe à frente dessa camada até o centro da lua.
    const origem = { x: ajustes.sinal.origemX - camX * parallax.intermediaria, y: ajustes.sinal.alturaPredioSinal - 14 * ajustes.sinal.escalaRefletor };
    this.desenharFeixe(contexto, lua, origem);
    this.desenharRefletor(contexto, origem, lua);
    // Telhados próximos, logo atrás da área jogável.
    desenharCamada(contexto, obterCamada("fase1-proxima", LARGURA_PROXIMA, this.height, this.pintar.proxima), -camX * parallax.proxima - MARGEM, 0, this.pintar.proxima);
    this.desenharNevoa(contexto, camX);
    this.desenharChuva(contexto);
    contexto.restore();
  }

  // ===== CÉU, RELÂMPAGO E NUVENS =====
  desenharCeu(contexto) {
    desenharCamada(contexto, obterCamada("fase1-ceu", this.width, this.height, this.pintar.ceu), 0, 0, this.pintar.ceu);
  }
  // O relâmpago clareia só o céu (os prédios são desenhados depois, por cima), sem piscar a tela toda.
  desenharRelampago(contexto) {
    if (this.lightningAlpha <= 0.005) return;
    contexto.save();
    contexto.globalAlpha = this.lightningAlpha;
    contexto.fillStyle = cores.relampago;
    contexto.beginPath();
    contexto.rect(0, 0, this.width, this.height * 0.72);
    contexto.fill();
    contexto.restore();
  }
  // Uma faixa de nuvens que se repete e anda devagar com o vento.
  desenharNuvensAoFundo(contexto, camX) {
    const camada = obterCamada("fase1-nuvens", LARGURA_NUVENS, 200, desenharFaixaDeNuvens);
    const deslocamento = ((this.tempo * ajustes.nuvens.velocidade + camX * ajustes.parallax.nuvens) % LARGURA_NUVENS + LARGURA_NUVENS) % LARGURA_NUVENS;
    contexto.save();
    contexto.globalAlpha = ajustes.nuvens.opacidade;
    desenharCamada(contexto, camada, -deslocamento, 0, desenharFaixaDeNuvens);
    desenharCamada(contexto, camada, LARGURA_NUVENS - deslocamento, 0, desenharFaixaDeNuvens);
    contexto.restore();
  }

  // ===== BAT-SINAL =====
  // Uma única lua (centro e raio) define halo, disco, símbolo, o fim do feixe e a mira do refletor.
  // Ela acompanha a câmera pelo mesmo parallax em todas as partes, então nada se desalinha.
  layoutDoSinal(camX) {
    const configuracao = ajustes.sinal;
    return {
      x: configuracao.x - camX * ajustes.parallax.sinal,
      y: configuracao.y,
      radius: configuracao.raio
    };
  }
  // Intensidade da mesma fonte de luz do lobby (entrada suave e oscilação discreta).
  intensidadeDoSinal() {
    const tempoMs = this.reduzido ? Number.MAX_VALUE : this.tempo * 1000 / 60;
    const { fade, light } = sinalCompartilhado().intensity(tempoMs, this.reduzido);
    return { tempoMs, fade, light: light * ajustes.sinal.intensidade };
  }
  // Halo, lua com textura e a silhueta preta da logo no centro.
  desenharLua(contexto, lua) {
    const sinal = sinalCompartilhado();
    sinal.prepareTextures();
    const { fade, light } = this.intensidadeDoSinal();
    if (sinal.textures) {
      sinal.drawHalo(contexto, lua, light);
      sinal.drawMoon(contexto, lua, fade, light);
      return;
    }
    // Sem canvas (testes automáticos): lua lisa e o símbolo reserva do lobby, no mesmo centro.
    contexto.save();
    contexto.fillStyle = LOBBY.batSignal.colors.moon;
    contexto.beginPath();
    contexto.arc(lua.x, lua.y, lua.radius, 0, Math.PI * 2);
    contexto.fill();
    const caixa = symbolBounds(lua, 2.8);
    contexto.fillStyle = LOBBY.batSignal.colors.symbol;
    contexto.beginPath();
    LOBBY.batSignal.placeholder.forEach(([posicaoX, posicaoY], indiceItem) => contexto[indiceItem ? "lineTo" : "moveTo"](caixa.x + posicaoX * caixa.width, caixa.y + posicaoY * caixa.height));
    contexto.closePath();
    contexto.fill();
    contexto.restore();
  }
  // Feixe: sai da lente do refletor e chega ao centro da lua com a largura do círculo.
  desenharFeixe(contexto, lua, origem) {
    const { tempoMs, light } = this.intensidadeDoSinal();
    sinalCompartilhado().drawBeam(contexto, lua, origem, tempoMs, light, this.reduzido, ajustes.sinal.escalaRefletor);
  }
  // Refletor no telhado do prédio do sinal, apontado para o centro da mesma lua.
  desenharRefletor(contexto, origem, lua) {
    const { tempoMs } = this.intensidadeDoSinal();
    sinalCompartilhado().drawReflector(contexto, origem, lua, tempoMs, this.reduzido, ajustes.sinal.escalaRefletor);
  }

  // ===== LUZES OCASIONAIS =====
  // Algumas janelas acendem e apagam devagar, como apartamentos de verdade.
  desenharJanelasPiscando(contexto, camX) {
    const deslocamento = -camX * ajustes.parallax.intermediaria - MARGEM;
    contexto.save();
    for (const janela of this.janelasPiscando) {
      const onda = this.reduzido ? (janela.fase > Math.PI ? 1 : -1) : Math.sin(this.tempo * ajustes.luzes.velocidadeJanelas * janela.ritmo + janela.fase);
      const brilho = suavizar((onda - 0.1) / 0.4);
      if (brilho <= 0.02) continue;
      contexto.fillStyle = rgba(janela.fria ? cores.janelaFria : cores.janelaQuente, 0.7 * brilho);
      contexto.beginPath();
      contexto.rect(janela.x + deslocamento, janela.y, janela.w, janela.h);
      contexto.fill();
    }
    contexto.restore();
  }
  // Luz vermelha de aviso no alto das antenas, piscando devagar.
  desenharLuzesDeAntena(contexto, camX, camada) {
    const deslocamento = -camX * ajustes.parallax[camada] - MARGEM;
    contexto.save();
    contexto.fillStyle = cores.antena;
    for (const luz of this.luzesDeAntena) {
      if (luz.camada !== camada) continue;
      const pulso = this.reduzido ? 0.55 : 0.15 + 0.85 * Math.pow(Math.max(0, Math.sin(this.tempo * ajustes.luzes.velocidadeAntenas + luz.fase)), 6);
      contexto.globalAlpha = pulso;
      contexto.beginPath();
      contexto.arc(luz.x + deslocamento, luz.y, luz.raio, 0, Math.PI * 2);
      contexto.fill();
      contexto.globalAlpha = pulso * 0.25;
      contexto.beginPath();
      contexto.arc(luz.x + deslocamento, luz.y, luz.raio * 3.2, 0, Math.PI * 2);
      contexto.fill();
    }
    contexto.restore();
  }

  // ===== NÉVOA E CHUVA =====
  // Névoa entre os prédios intermediários e os telhados próximos, passando devagar.
  desenharNevoa(contexto, camX) {
    const camada = obterCamada("fase1-nevoa", LARGURA_NEVOA, 160, desenharFaixaDeNevoa);
    const andar = this.tempo * ajustes.nevoa.velocidade + camX * ajustes.parallax.nevoa;
    const deslocamento = (andar % LARGURA_NEVOA + LARGURA_NEVOA) % LARGURA_NEVOA;
    contexto.save();
    contexto.globalAlpha = ajustes.nevoa.opacidade;
    desenharCamada(contexto, camada, -deslocamento, 300, desenharFaixaDeNevoa);
    desenharCamada(contexto, camada, LARGURA_NEVOA - deslocamento, 300, desenharFaixaDeNevoa);
    contexto.restore();
  }
  // Todas as gotas de uma profundidade num único traço: bem mais leve que uma por vez.
  desenharChuva(contexto) {
    if (this.reduzido) return;
    contexto.save();
    contexto.lineWidth = 1;
    for (const perto of [false, true]) {
      contexto.strokeStyle = rgba(cores.chuva, perto ? ajustes.chuva.opacidadePerto : ajustes.chuva.opacidadeLonge);
      contexto.lineWidth = perto ? 1.2 : 0.8;
      contexto.beginPath();
      for (const gota of this.rainDrops) {
        if (gota.perto !== perto) continue;
        contexto.moveTo(gota.x, gota.y);
        contexto.lineTo(gota.x - 4, gota.y + gota.len);
      }
      contexto.stroke();
    }
    contexto.restore();
  }
}

// ===== PLANTAS DA CIDADE (geradas uma vez) =====
// Margem à esquerda das camadas para cobrir o tremor da câmera.
const MARGEM = 40;
const LARGURA_DISTANTE = 1000;
const LARGURA_INTERMEDIARIA = 1080;
const LARGURA_PROXIMA = 1120;
const LARGURA_NUVENS = 1400;
const LARGURA_NEVOA = 1200;

function gerarCidadeDistante() {
  const sorteio = criarSorteio(1931);
  const predios = [];
  for (let posicaoX = 0; posicaoX < LARGURA_DISTANTE;) {
    const largura = 26 + sorteio() * 54;
    const torre = sorteio() < 0.12;
    predios.push({
      x: posicaoX,
      w: largura,
      topo: torre ? 110 + sorteio() * 40 : 165 + sorteio() * 130,
      forma: torre ? "torre" : ["reto", "pontudo", "escalonado"][Math.floor(sorteio() * 3)],
      antena: sorteio() < 0.18,
      semente: Math.floor(sorteio() * 100000)
    });
    posicaoX += largura + sorteio() * 4;
  }
  return predios;
}

function gerarPrediosIntermediarios() {
  const sorteio = criarSorteio(1939);
  const predios = [];
  const sinalX = ajustes.sinal.origemX + MARGEM - 40;
  for (let posicaoX = 0; posicaoX < LARGURA_INTERMEDIARIA;) {
    // O prédio do refletor do Bat-Sinal tem lugar e altura fixos.
    if (posicaoX >= sinalX - 60 && posicaoX < sinalX + 80 && !predios.some((predio) => predio.sinal)) {
      predios.push({ x: sinalX, w: 80, topo: ajustes.sinal.alturaPredioSinal, forma: "reto", sinal: true, semente: 77 });
      posicaoX = sinalX + 80 + 3;
      continue;
    }
    const largura = 38 + sorteio() * 58;
    predios.push({
      x: posicaoX,
      w: largura,
      topo: 185 + sorteio() * 175,
      forma: ["reto", "reto", "escalonado", "pontudo"][Math.floor(sorteio() * 4)],
      caixaDagua: sorteio() < 0.3,
      antena: sorteio() < 0.3,
      arCondicionado: sorteio() < 0.4,
      casinha: sorteio() < 0.22,
      semente: Math.floor(sorteio() * 100000)
    });
    posicaoX += largura + sorteio() * 6;
  }
  return predios;
}

function gerarTelhadosProximos() {
  const sorteio = criarSorteio(1940);
  const pecas = [];
  for (let posicaoX = 0; posicaoX < LARGURA_PROXIMA;) {
    const tipo = ["chamine", "parapeito", "caixa", "parapeito", "porta"][Math.floor(sorteio() * 5)];
    const largura = tipo === "chamine" ? 14 + sorteio() * 10 : tipo === "caixa" ? 46 : 60 + sorteio() * 90;
    pecas.push({ x: posicaoX, w: largura, tipo, altura: tipo === "chamine" ? 34 + sorteio() * 18 : tipo === "caixa" ? 52 : tipo === "porta" ? 30 : 10 + sorteio() * 8 });
    posicaoX += largura + 20 + sorteio() * 70;
  }
  return pecas;
}

function escolherJanelasPiscando(predios) {
  const sorteio = criarSorteio(2024);
  const janelas = [];
  const candidatos = predios.filter((predio) => !predio.sinal);
  for (let indiceItem = 0; indiceItem < ajustes.luzes.janelasPiscando && candidatos.length; indiceItem++) {
    const predio = candidatos[Math.floor(sorteio() * candidatos.length)];
    const colunas = Math.max(1, Math.floor((predio.w - 10) / 11));
    const linhas = Math.max(1, Math.floor((500 - predio.topo - 30) / 16));
    janelas.push({
      x: predio.x + 6 + Math.floor(sorteio() * colunas) * 11,
      y: predio.topo + 12 + Math.floor(sorteio() * Math.min(linhas, 8)) * 16,
      w: 4,
      h: 6,
      fria: sorteio() < 0.25,
      fase: sorteio() * Math.PI * 2,
      ritmo: 0.6 + sorteio() * 0.8
    });
  }
  return janelas;
}

function escolherLuzesDeAntena(distantes, intermediarios) {
  const luzes = [];
  distantes.filter((predio) => predio.antena || predio.forma === "torre").slice(0, 3).forEach((predio, indiceItem) => {
    luzes.push({ camada: "distante", x: predio.x + predio.w / 2, y: predio.topo - (predio.forma === "torre" ? 46 : 20), raio: 1.3, fase: indiceItem * 2.1 });
  });
  intermediarios.filter((predio) => predio.antena).slice(0, 3).forEach((predio, indiceItem) => {
    luzes.push({ camada: "intermediaria", x: predio.x + predio.w * 0.7, y: predio.topo - 30, raio: 1.8, fase: 1 + indiceItem * 2.6 });
  });
  return luzes;
}

// ===== DESENHO DAS CAMADAS ESTÁTICAS =====
function desenharCeuEstatico(largura, altura, contexto) {
  const ceu = contexto.createLinearGradient(0, 0, 0, altura);
  ceu.addColorStop(0, estiloVisual.gradiente1);
  ceu.addColorStop(0.5, estiloVisual.gradiente2);
  ceu.addColorStop(1, estiloVisual.gradiente3);
  contexto.fillStyle = ceu;
  contexto.fillRect(0, 0, largura, altura);
  // Brilho alaranjado da cidade no horizonte (luz de rua refletida na névoa), bem fraco.
  const horizonte = contexto.createLinearGradient(0, altura * 0.45, 0, altura);
  horizonte.addColorStop(0, rgba(cores.brilhoHorizonte, 0));
  horizonte.addColorStop(1, rgba(cores.brilhoHorizonte, ajustes.brilhoHorizonte));
  contexto.fillStyle = horizonte;
  contexto.fillRect(0, altura * 0.45, largura, altura * 0.55);
}

// As faixas de nuvem e de névoa se repetem lado a lado. Cada mancha também é desenhada
// uma largura antes e uma depois: o que sai por um lado entra pelo outro, sem emenda visível.
function desenharFaixaDeNuvens(contexto) {
  const sorteio = criarSorteio(77);
  const opacidadeBase = contexto.globalAlpha;
  contexto.save();
  contexto.beginPath();
  contexto.rect(0, 0, LARGURA_NUVENS, 200);
  contexto.clip();
  contexto.fillStyle = cores.nuvem;
  for (let indiceItem = 0; indiceItem < 18; indiceItem++) {
    const posicaoX = indiceItem / 18 * LARGURA_NUVENS + sorteio() * 40;
    const posicaoY = 30 + sorteio() * 120;
    const raioX = 90 + sorteio() * 110, raioY = 16 + sorteio() * 20;
    contexto.globalAlpha = opacidadeBase * (0.35 + sorteio() * 0.4);
    contexto.beginPath();
    for (const repeticao of [-LARGURA_NUVENS, 0, LARGURA_NUVENS]) {
      contexto.ellipse(posicaoX + repeticao, posicaoY, raioX, raioY, 0, 0, Math.PI * 2);
    }
    contexto.fill();
  }
  contexto.restore();
}

function desenharCidadeDistante(predios, altura, contexto) {
  for (const predio of predios) {
    const sorteio = criarSorteio(predio.semente);
    contexto.fillStyle = cores.distante;
    contornoDoPredio(contexto, predio, altura);
    contexto.fill();
    // Janelas frias e raras: a distância apaga os detalhes.
    contexto.fillStyle = rgba(cores.janelaDistante, 0.32);
    for (let posicaoY = predio.topo + 10; posicaoY < altura - 30; posicaoY += 9) {
      for (let posicaoX = predio.x + 4; posicaoX < predio.x + predio.w - 5; posicaoX += 7) {
        if (sorteio() < 0.1) contexto.fillRect(posicaoX, posicaoY, 2, 3);
      }
    }
    if (predio.antena || predio.forma === "torre") {
      contexto.strokeStyle = cores.distante;
      contexto.lineWidth = 1.5;
      contexto.beginPath();
      contexto.moveTo(predio.x + predio.w / 2, predio.topo);
      contexto.lineTo(predio.x + predio.w / 2, predio.topo - (predio.forma === "torre" ? 46 : 20));
      contexto.stroke();
    }
  }
  // Névoa da distância: separa a cidade ao fundo dos prédios da frente.
  const nevoa = contexto.createLinearGradient(0, 230, 0, altura);
  nevoa.addColorStop(0, rgba(cores.nevoa, 0));
  nevoa.addColorStop(1, rgba(cores.nevoa, ajustes.nevoaDistante));
  contexto.fillStyle = nevoa;
  contexto.fillRect(0, 230, LARGURA_DISTANTE, altura - 230);
}

// Contorno de um prédio conforme o tipo de topo (reto, pontudo, escalonado, torre).
function contornoDoPredio(contexto, predio, altura) {
  const { x, w, topo } = predio;
  contexto.beginPath();
  contexto.moveTo(x, altura);
  contexto.lineTo(x, topo);
  if (predio.forma === "pontudo") {
    contexto.lineTo(x + w * 0.15, topo);
    contexto.lineTo(x + w / 2, topo - Math.min(34, w * 0.6));
    contexto.lineTo(x + w * 0.85, topo);
  } else if (predio.forma === "escalonado") {
    contexto.lineTo(x + w * 0.2, topo);
    contexto.lineTo(x + w * 0.2, topo - 12);
    contexto.lineTo(x + w * 0.35, topo - 12);
    contexto.lineTo(x + w * 0.35, topo - 22);
    contexto.lineTo(x + w * 0.65, topo - 22);
    contexto.lineTo(x + w * 0.65, topo - 12);
    contexto.lineTo(x + w * 0.8, topo - 12);
    contexto.lineTo(x + w * 0.8, topo);
  } else if (predio.forma === "torre") {
    contexto.lineTo(x + w * 0.25, topo);
    contexto.lineTo(x + w * 0.25, topo - 18);
    contexto.lineTo(x + w / 2, topo - 30);
    contexto.lineTo(x + w * 0.75, topo - 18);
    contexto.lineTo(x + w * 0.75, topo);
  }
  contexto.lineTo(x + w, topo);
  contexto.lineTo(x + w, altura);
  contexto.closePath();
}

function desenharPrediosIntermediarios(predios, altura, contexto) {
  for (const predio of predios) {
    const sorteio = criarSorteio(predio.semente);
    contexto.fillStyle = cores.intermediaria;
    contornoDoPredio(contexto, predio, altura);
    contexto.fill();
    // Borda do topo levemente iluminada pelo céu: separa o prédio do fundo.
    contexto.strokeStyle = cores.bordaIntermediaria;
    contexto.lineWidth = 1;
    contexto.stroke();
    // Cornija: uma linha fraca abaixo do topo (fraca para não parecer uma plataforma).
    contexto.fillStyle = cores.cornija;
    contexto.fillRect(predio.x, predio.topo + 6, predio.w, 1);
    // Janelas: a maioria apagada, algumas acesas em tom quente ou frio.
    for (let posicaoY = predio.topo + 12; posicaoY < altura - 26; posicaoY += 16) {
      for (let posicaoX = predio.x + 6; posicaoX < predio.x + predio.w - 9; posicaoX += 11) {
        const sorteado = sorteio();
        const { quentes, frias, opacidade } = ajustes.janelas;
        contexto.fillStyle = sorteado < quentes ? rgba(cores.janelaQuente, opacidade) : sorteado < quentes + frias ? rgba(cores.janelaFria, opacidade * 0.8) : cores.janelaApagada;
        contexto.fillRect(posicaoX, posicaoY, 4, 6);
      }
    }
    desenharAcessoriosDoTelhado(contexto, predio);
  }
}

// Caixas-d'água, antenas, aparelhos de ar e casinhas de escada sobre os telhados.
function desenharAcessoriosDoTelhado(contexto, predio) {
  const { x, w, topo } = predio;
  contexto.fillStyle = cores.intermediaria;
  contexto.strokeStyle = cores.bordaIntermediaria;
  contexto.lineWidth = 1;
  if (predio.casinha) {
    contexto.fillRect(x + w * 0.1, topo - 14, 18, 14);
    contexto.strokeRect(x + w * 0.1, topo - 14, 18, 14);
  }
  if (predio.arCondicionado) {
    contexto.fillRect(x + w * 0.55, topo - 7, 14, 7);
    contexto.strokeRect(x + w * 0.55, topo - 7, 14, 7);
  }
  if (predio.caixaDagua && predio.forma !== "pontudo") {
    const centro = x + w * 0.42;
    // Pernas
    contexto.beginPath();
    contexto.moveTo(centro - 8, topo);
    contexto.lineTo(centro - 6, topo - 12);
    contexto.moveTo(centro + 8, topo);
    contexto.lineTo(centro + 6, topo - 12);
    contexto.stroke();
    // Tanque e teto cônico
    contexto.beginPath();
    contexto.rect(centro - 9, topo - 30, 18, 18);
    contexto.moveTo(centro - 10, topo - 30);
    contexto.lineTo(centro, topo - 38);
    contexto.lineTo(centro + 10, topo - 30);
    contexto.closePath();
    contexto.fill();
    contexto.stroke();
  }
  if (predio.antena) {
    const posicaoX = x + w * 0.7;
    contexto.beginPath();
    contexto.moveTo(posicaoX, topo);
    contexto.lineTo(posicaoX, topo - 30);
    contexto.moveTo(posicaoX - 5, topo - 20);
    contexto.lineTo(posicaoX + 5, topo - 20);
    contexto.stroke();
  }
}

function desenharTelhadosProximos(pecas, altura, contexto) {
  const base = altura - 80;
  contexto.fillStyle = estiloVisual.preenchimento16;
  contexto.fillRect(0, base, LARGURA_PROXIMA, 80);
  contexto.fillStyle = cores.proxima;
  contexto.strokeStyle = cores.bordaProxima;
  contexto.lineWidth = 1;
  for (const peca of pecas) {
    const topo = base - peca.altura;
    if (peca.tipo === "parapeito") {
      // Mureta com grade fina por cima.
      contexto.fillRect(peca.x, topo, peca.w, peca.altura);
      contexto.beginPath();
      contexto.moveTo(peca.x, topo - 9);
      contexto.lineTo(peca.x + peca.w, topo - 9);
      for (let posicaoX = peca.x; posicaoX <= peca.x + peca.w; posicaoX += 12) {
        contexto.moveTo(posicaoX, topo);
        contexto.lineTo(posicaoX, topo - 9);
      }
      contexto.stroke();
    } else if (peca.tipo === "chamine") {
      contexto.fillRect(peca.x, topo, peca.w, peca.altura);
      contexto.fillRect(peca.x - 2, topo, peca.w + 4, 4);
    } else if (peca.tipo === "caixa") {
      // Caixa-d'água grande, bem próxima e escura.
      contexto.beginPath();
      contexto.rect(peca.x + 6, topo + 10, peca.w - 12, peca.altura - 22);
      contexto.moveTo(peca.x + 4, topo + 10);
      contexto.lineTo(peca.x + peca.w / 2, topo);
      contexto.lineTo(peca.x + peca.w - 4, topo + 10);
      contexto.closePath();
      contexto.fill();
      contexto.fillRect(peca.x + 10, base - 12, 3, 12);
      contexto.fillRect(peca.x + peca.w - 13, base - 12, 3, 12);
    } else {
      // Porta de acesso à escada.
      contexto.fillRect(peca.x, topo, 34, peca.altura);
      contexto.strokeRect(peca.x + 11, topo + 8, 12, peca.altura - 8);
    }
  }
  contexto.fillStyle = cores.bordaProxima;
  contexto.fillRect(0, base, LARGURA_PROXIMA, 2);
}

function desenharFaixaDeNevoa(contexto) {
  const sorteio = criarSorteio(1312);
  contexto.save();
  contexto.beginPath();
  contexto.rect(0, 0, LARGURA_NEVOA, 160);
  contexto.clip();
  for (let indiceItem = 0; indiceItem < 14; indiceItem++) {
    const posicaoX = indiceItem / 14 * LARGURA_NEVOA + sorteio() * 50;
    const posicaoY = 60 + sorteio() * 60;
    const raio = 110 + sorteio() * 80;
    for (const repeticao of [-LARGURA_NEVOA, 0, LARGURA_NEVOA]) {
      const centroX = posicaoX + repeticao;
      // Manchas achatadas: o gradiente é desenhado num círculo e "esmagado" na vertical.
      contexto.save();
      contexto.translate(centroX, posicaoY);
      contexto.scale(1, 0.28);
      const gradiente = contexto.createRadialGradient(0, 0, 0, 0, 0, raio);
      gradiente.addColorStop(0, rgba(cores.nevoa, 0.5));
      gradiente.addColorStop(1, rgba(cores.nevoa, 0));
      contexto.fillStyle = gradiente;
      contexto.beginPath();
      contexto.arc(0, 0, raio, 0, Math.PI * 2);
      contexto.fill();
      contexto.restore();
    }
  }
  contexto.restore();
}
