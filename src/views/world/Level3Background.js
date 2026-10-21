// Este arquivo cuida de desenhar o Asilo Arkham e seus reflexos de luz (Fase 3).
// Corredor de celas com azulejo hospitalar desgastado, tubulações no teto, uma passagem em arco
// para a Ala B ao fundo (camadas com parallax), luminárias que oscilam devagar, névoa baixa e goteiras.
// Regra de luz: só as luminárias acesas criam brilho radial (cone e reflexo no chão).
// ===== DEPENDÊNCIAS E CONFIGURAÇÕES =====
import { APARENCIA, CENARIOS, LIGHTING } from "../../config/configuracao.js";
import { Background } from "./Background.js";
import { criarSorteio, desenharCamada, movimentoReduzido, obterCamada, rgba, suavizar } from "./camadas.js";
const estiloVisual = APARENCIA.Level3Background;
const ajustes = CENARIOS.fase3;
const cores = ajustes.cores;

// ===== PLANTA DO CORREDOR (coordenadas do mundo; o chão jogável começa em y = 440) =====
const CHAO = 440;
const AZULEJO_TOPO = 300;
const CELAS = [
  { x: 30, numero: "A-01" },
  { x: 200, numero: "A-02" },
  { x: 790, numero: "A-07" },
  { x: 960, numero: "A-08" }
];
const PILARES = [170, 930];
// Passagem em arco para a Ala B.
const ARCO = { esquerda: 360, direita: 730, topoReto: 180, raio: 90 };
// Camadas ao fundo, vistas pelo arco: largura extra para cobrir o parallax.
const ALA_B = { largura: 560, inicio: 300 };
// Meia largura da abertura do segundo arco da Ala B (camada mais próxima).
const MEIA_ABERTURA_ALA = 130;

// ===== COMPORTAMENTO =====
export class Level3Background extends Background {
  // Recebe as dependências e prepara o estado inicial deste componente.
  constructor(largura = 900, altura = 500) {
    super(largura, altura);
    this.reduzido = movimentoReduzido();
    this.flickerTimer = 0;
    this.fogTime = 0;
    this.tempo = 0;
    this.lights = [{
      x: 260,
      y: 45,
      width: 70,
      enabled: true,
      phase: 0
    }, {
      x: 640,
      y: 45,
      width: 70,
      enabled: true,
      phase: 1.7
    }, {
      x: 905,
      y: 45,
      width: 60,
      enabled: true,
      phase: 3.9
    }];
    // Goteiras: cada uma pinga de um ponto do cano, com seu próprio ritmo.
    const sorteio = criarSorteio(1974);
    this.goteiras = ajustes.goteiras.posicoes.map((posicaoX) => ({
      x: posicaoX,
      y: 32,
      velocidade: 0,
      espera: Math.floor(sorteio() * ajustes.goteiras.intervaloMax),
      respingo: 0
    }));
    // Superfícies onde a luz pode cair (entregues pelo LevelView). Sem elas, a luz vai até o chão.
    this.plataformas = [];
    this.pintar = {
      corredor: desenharCorredorEstatico.bind(null, largura, altura),
      alaDistante: desenharAlaDistante,
      alaProxima: desenharAlaProxima
    };
  }

  // Recebe a atualização atual e avança o estado, sem redesenhar a tela.
  update(passoTempo = 1, cameraDoJogo = null) {
    if (this.reduzido) return;
    this.tempo += passoTempo;
    this.fogTime += ajustes.nevoa.velocidade * passoTempo;
    // A oscilação das lâmpadas é lenta: um ciclo leva vários segundos (sem efeito estroboscópico).
    this.flickerTimer += ajustes.luzes.velocidadeOscilacao * passoTempo;
    for (const gota of this.goteiras) {
      if (gota.respingo > 0) gota.respingo -= passoTempo;
      if (gota.espera > 0) {
        gota.espera -= passoTempo;
        continue;
      }
      gota.velocidade += 0.25 * passoTempo;
      gota.y += gota.velocidade * passoTempo;
      if (gota.y >= CHAO - 2) {
        gota.y = 32;
        gota.velocidade = 0;
        gota.respingo = 18;
        gota.espera = ajustes.goteiras.intervaloMin + Math.random() * (ajustes.goteiras.intervaloMax - ajustes.goteiras.intervaloMin);
      }
    }
  }

  // Recebe o contexto 2D e desenha o estado atual sem avançar o tempo.
  draw(contexto, cameraDoJogo = null) {
    const camX = cameraDoJogo?.renderX ?? 0;
    contexto.save();
    contexto.translate(-camX, -(cameraDoJogo?.renderY ?? 0));
    this.desenharAlaB(contexto, camX);
    // Paredes, azulejos, celas, canos e placas: preparados uma única vez.
    desenharCamada(contexto, obterCamada("fase3-corredor", this.width, this.height, this.pintar.corredor), 0, 0, this.pintar.corredor);
    this.desenharOlhosNasCelas(contexto);
    this.desenharLampadas(contexto);
    this.desenharGoteiras(contexto);
    this.desenharNevoaBaixa(contexto);
    contexto.restore();
  }

  usarPlataformas(plataformas) {
    this.plataformas = plataformas ?? [];
  }

  // ===== UMA DEFINIÇÃO POR LUMINÁRIA =====
  // Cada item de this.lights (x, y, width, enabled, phase) controla tudo o que é dele:
  // a intensidade (lightIntensity), o halo, o cone e o reflexo (projecao). Nada de luz sem fonte.
  // Projeção: a superfície mais alta logo abaixo da luminária e a largura da área iluminada nela.
  projecao(light, plataformas = this.plataformas) {
    let superficie = null;
    for (const plataforma of plataformas) {
      if (plataforma.alive === false || plataforma.y <= light.y) continue;
      if (light.x < plataforma.x || light.x > plataforma.x + plataforma.w) continue;
      if (!superficie || plataforma.y < superficie.y) superficie = plataforma;
    }
    const alturaDaLuz = (superficie ? superficie.y : CHAO) - (light.y + 6);
    return {
      superficie,
      alturaDaLuz,
      // A luz se abre com a distância: quanto mais longe a superfície, maior a mancha.
      meiaLargura: light.width / 2 + alturaDaLuz * ajustes.luzes.abertura
    };
  }

  // Intensidade de uma luminária. Ela oscila pouco e, de vez em quando, apaga e volta devagar.
  lightIntensity(light) {
    if (!light.enabled) return 0;
    const base = 0.85 * LIGHTING.INTENSITY;
    if (this.reduzido) return base;
    const onda = Math.sin(this.flickerTimer * 0.4 + light.phase);
    const { inicioQueda, apagada, zumbido } = ajustes.luzes;
    if (onda >= apagada) return 0;
    // Entre inicioQueda e apagada a luz enfraquece suavemente.
    const queda = suavizar((onda - inicioQueda) / (apagada - inicioQueda));
    // Zumbido: variação pequena e só para baixo, para nunca passar do brilho normal.
    const variacao = zumbido * (0.5 + 0.5 * Math.sin(this.tempo * 0.07 + light.phase * 3));
    return base * (1 - queda) * (1 - variacao);
  }

  // Called after platforms, in the same world transform as the colliders.
  // O reflexo fica na MESMA superfície onde o cone termina, com a mesma largura e intensidade.
  drawSurfaceLighting(contexto, platforms) {
    for (const light of this.lights) {
      const intensity = this.lightIntensity(light);
      if (intensity === 0) continue;
      const { superficie: surface, meiaLargura } = this.projecao(light, platforms);
      if (!surface) continue;
      contexto.save();
      contexto.beginPath();
      contexto.rect(surface.x, surface.y, surface.w, surface.h);
      contexto.clip();
      contexto.globalCompositeOperation = "lighter";
      contexto.translate(light.x, surface.y + 3);
      contexto.scale(1, 0.15);
      const reflection = contexto.createRadialGradient(0, 0, 2, 0, 0, meiaLargura);
      reflection.addColorStop(0, rgba(cores.luz, intensity * ajustes.luzes.reflexo));
      reflection.addColorStop(1, estiloVisual.gradiente5);
      contexto.fillStyle = reflection;
      contexto.fillRect(-meiaLargura, -meiaLargura, meiaLargura * 2, meiaLargura * 2);
      contexto.restore();
    }
  }

  // ===== ALA B AO FUNDO (parallax pelo arco) =====
  // Duas camadas: a mais distante anda menos que a mais próxima. Assim o corredor parece profundo.
  desenharAlaB(contexto, camX) {
    contexto.save();
    caminhoDoArco(contexto);
    contexto.clip();
    const distante = ALA_B.inicio + camX * (1 - ajustes.parallax.alaDistante);
    const proxima = ALA_B.inicio + camX * (1 - ajustes.parallax.alaProxima);
    desenharCamada(contexto, obterCamada("fase3-ala-distante", ALA_B.largura, CHAO, this.pintar.alaDistante), distante, 0, this.pintar.alaDistante);
    desenharCamada(contexto, obterCamada("fase3-ala-proxima", ALA_B.largura, CHAO, this.pintar.alaProxima), proxima, 0, this.pintar.alaProxima);
    contexto.restore();
  }

  // ===== DETALHES ANIMADOS =====
  // Olhos no escuro das celas, que piscam de vez em quando.
  desenharOlhosNasCelas(contexto) {
    contexto.save();
    CELAS.forEach((cela, indiceItem) => {
      const piscando = !this.reduzido && Math.sin(this.tempo * 0.013 + indiceItem * 2.4) > 0.96;
      if (piscando) return;
      contexto.fillStyle = indiceItem % 2 ? estiloVisual.gradiente12 : estiloVisual.gradiente11;
      contexto.globalAlpha = 0.85;
      contexto.beginPath();
      contexto.arc(cela.x + 45, 170, 2.5, 0, Math.PI * 2);
      contexto.arc(cela.x + 55, 170, 2.5, 0, Math.PI * 2);
      contexto.fill();
    });
    contexto.restore();
  }
  // Luminárias penduradas e o cone de luz fria de cada uma.
  desenharLampadas(contexto) {
    contexto.save();
    for (const light of this.lights) {
      const tx = light.x;
      const lightAlpha = this.lightIntensity(light);
      contexto.strokeStyle = estiloVisual.contorno9;
      contexto.lineWidth = 2;
      contexto.beginPath();
      contexto.moveTo(tx, 34);
      contexto.lineTo(tx, light.y);
      contexto.stroke();
      // Calha da luminária
      contexto.fillStyle = cores.calha;
      contexto.fillRect(tx - light.width / 2 - 3, light.y - 4, light.width + 6, 5);
      contexto.fillStyle = lightAlpha > 0 ? rgba(cores.lampada, Math.min(1, lightAlpha * 2.2)) : estiloVisual.gradiente20;
      contexto.fillRect(tx - light.width / 2, light.y, light.width, 6);
      // Apagada: sem halo, sem cone e (em drawSurfaceLighting) sem reflexo.
      if (lightAlpha === 0) continue;
      const { alturaDaLuz, meiaLargura } = this.projecao(light);
      const topo = light.y + 6;
      // Um só gradiente por luminária, usado pelo halo e pelo cone: a mesma fonte.
      const coneGrad = contexto.createRadialGradient(tx, topo, 5, tx, topo, alturaDaLuz + 20);
      coneGrad.addColorStop(0, rgba(cores.luz, lightAlpha * ajustes.luzes.cone));
      coneGrad.addColorStop(0.55, rgba(cores.luz, lightAlpha * ajustes.luzes.cone * 0.35));
      coneGrad.addColorStop(1, estiloVisual.gradiente5);
      contexto.save();
      contexto.globalCompositeOperation = "lighter";
      contexto.fillStyle = coneGrad;
      // Halo curto em volta da calha.
      contexto.globalAlpha = ajustes.luzes.halo;
      contexto.beginPath();
      contexto.ellipse(tx, topo - 2, light.width / 2 + 16, 13, 0, 0, Math.PI * 2);
      contexto.fill();
      // Cone até a superfície, em três camadas cada vez mais estreitas: o centro fica mais forte
      // e as laterais somem aos poucos (sem borda dura).
      for (const fracao of [1, 0.72, 0.45]) {
        contexto.globalAlpha = 0.42;
        contexto.beginPath();
        contexto.moveTo(tx - light.width / 2 * fracao, topo);
        contexto.lineTo(tx + light.width / 2 * fracao, topo);
        contexto.lineTo(tx + meiaLargura * fracao, topo + alturaDaLuz);
        contexto.lineTo(tx - meiaLargura * fracao, topo + alturaDaLuz);
        contexto.closePath();
        contexto.fill();
      }
      contexto.restore();
    }
    contexto.restore();
  }
  // Gotas caindo dos canos e um pequeno respingo no chão.
  desenharGoteiras(contexto) {
    if (this.reduzido) return;
    contexto.save();
    contexto.fillStyle = rgba(cores.agua, 0.55);
    contexto.strokeStyle = rgba(cores.agua, 0.4);
    contexto.lineWidth = 1;
    for (const gota of this.goteiras) {
      if (gota.espera <= 0) {
        contexto.beginPath();
        contexto.ellipse(gota.x, gota.y, 1.2, 1.2 + Math.min(3, gota.velocidade * 0.4), 0, 0, Math.PI * 2);
        contexto.fill();
      } else if (gota.espera > ajustes.goteiras.intervaloMin * 0.6) {
        // Gota se formando na ponta do cano.
        contexto.beginPath();
        contexto.arc(gota.x, 33, 1.3, 0, Math.PI * 2);
        contexto.fill();
      }
      if (gota.respingo > 0) {
        const progresso = 1 - gota.respingo / 18;
        contexto.globalAlpha = 1 - progresso;
        contexto.beginPath();
        contexto.ellipse(gota.x, CHAO - 1, 2 + progresso * 9, 1 + progresso * 1.5, 0, 0, Math.PI * 2);
        contexto.stroke();
        contexto.globalAlpha = 1;
      }
    }
    contexto.restore();
  }
  // Névoa fria e baixa, só perto do chão: uma faixa em gradiente que "respira" devagar,
  // sem manchas ou placas, para não esconder ataques e personagens.
  desenharNevoaBaixa(contexto) {
    const respiracao = 1 + Math.sin(this.fogTime * 2) * 0.2;
    const altura = ajustes.nevoa.altura;
    const nevoa = contexto.createLinearGradient(0, CHAO - altura, 0, CHAO);
    nevoa.addColorStop(0, rgba(cores.nevoa, 0));
    nevoa.addColorStop(0.7, rgba(cores.nevoa, ajustes.nevoa.opacidade * respiracao));
    nevoa.addColorStop(1, rgba(cores.nevoa, ajustes.nevoa.opacidade * 0.6 * respiracao));
    contexto.save();
    contexto.fillStyle = nevoa;
    contexto.beginPath();
    contexto.rect(0, CHAO - altura, this.width, altura);
    contexto.fill();
    contexto.restore();
  }
}

// ===== FORMAS AUXILIARES =====
function caminhoDoArco(contexto) {
  const centroX = (ARCO.esquerda + ARCO.direita) / 2, raioX = (ARCO.direita - ARCO.esquerda) / 2;
  contexto.beginPath();
  contexto.moveTo(ARCO.esquerda, CHAO);
  contexto.lineTo(ARCO.esquerda, ARCO.topoReto);
  contexto.ellipse(centroX, ARCO.topoReto, raioX, ARCO.raio, 0, Math.PI, 0, false);
  contexto.lineTo(ARCO.direita, CHAO);
  contexto.closePath();
}

// Celas com grades, usadas no corredor e (menores e mais escuras) na Ala B.
function desenharCela(contexto, posicaoX, topo, largura, altura, corGrade, corFundo) {
  contexto.fillStyle = corFundo;
  contexto.fillRect(posicaoX, topo, largura, altura);
  contexto.strokeStyle = corGrade;
  contexto.lineWidth = Math.max(2, largura / 28);
  contexto.beginPath();
  for (let grade = posicaoX + largura * 0.07; grade < posicaoX + largura; grade += largura / 6) {
    contexto.moveTo(grade, topo);
    contexto.lineTo(grade, topo + altura);
  }
  contexto.moveTo(posicaoX, topo + altura * 0.45);
  contexto.lineTo(posicaoX + largura, topo + altura * 0.45);
  contexto.stroke();
}

// ===== DESENHO ESTÁTICO (preparado uma vez) =====
function desenharAlaDistante(contexto) {
  const largura = ALA_B.largura, centro = largura / 2;
  // Parede do fim do corredor, bem escura.
  const fundo = contexto.createLinearGradient(0, 80, 0, CHAO);
  fundo.addColorStop(0, cores.fundoAla);
  fundo.addColorStop(1, cores.fundoAlaBase);
  contexto.fillStyle = fundo;
  contexto.fillRect(0, 0, largura, CHAO);
  // Porta iluminada no fim: luz fria que escorre pelo chão (gradiente linear, sem brilho radial).
  // Porta do fim do corredor, com uma luz fraca vinda de dentro (ela é a própria fonte;
  // não projeta mancha no chão do corredor da frente).
  const porta = { x: centro - 18, y: 300, w: 36, h: CHAO - 300 };
  const luz = contexto.createLinearGradient(0, porta.y, 0, CHAO);
  luz.addColorStop(0, rgba(cores.luz, 0.04));
  luz.addColorStop(1, rgba(cores.luz, 0.09));
  contexto.fillStyle = luz;
  contexto.fillRect(porta.x, porta.y, porta.w, porta.h);
  // Celas pequenas dos dois lados da porta.
  for (const deslocamento of [-190, -130, -70, 70, 130, 190]) {
    desenharCela(contexto, centro + deslocamento - 20, 300, 40, 90, rgba(cores.grade, 0.5), cores.celaEscura);
  }
  // Placa "ALA B" sobre a porta.
  contexto.fillStyle = rgba(cores.placa, 0.6);
  contexto.fillRect(centro - 26, 278, 52, 14);
  contexto.fillStyle = rgba(cores.textoPlaca, 0.45);
  contexto.font = "bold 9px monospace";
  contexto.textAlign = "center";
  contexto.textBaseline = "middle";
  contexto.fillText("ALA B", centro, 285.5);
}

function desenharAlaProxima(contexto) {
  const largura = ALA_B.largura, centro = largura / 2;
  // Um segundo arco, mais perto: dá a sensação de profundidade em camadas planas.
  contexto.fillStyle = cores.arcoAla;
  contexto.beginPath();
  contexto.rect(0, 0, largura, CHAO);
  contexto.moveTo(centro - MEIA_ABERTURA_ALA, CHAO);
  contexto.lineTo(centro + MEIA_ABERTURA_ALA, CHAO);
  contexto.lineTo(centro + MEIA_ABERTURA_ALA, 230);
  contexto.ellipse(centro, 230, MEIA_ABERTURA_ALA, 70, 0, 0, Math.PI, true);
  contexto.closePath();
  contexto.fill("evenodd");
  // Tijolos apagados no arco intermediário.
  contexto.strokeStyle = rgba(cores.argamassa, 0.5);
  contexto.lineWidth = 1;
  for (let posicaoY = 110; posicaoY < CHAO; posicaoY += 30) {
    contexto.beginPath();
    contexto.moveTo(0, posicaoY);
    contexto.lineTo(centro - 132, posicaoY);
    contexto.moveTo(centro + 132, posicaoY);
    contexto.lineTo(largura, posicaoY);
    contexto.stroke();
  }
  // Celas maiores (mais perto) nas laterais.
  // Celas maiores (mais perto) nas laterais. As posições saem da abertura do arco, com folga,
  // para as grades ficarem sempre sobre a parede e nunca soltas dentro da passagem.
  const larguraCela = 56, folga = 8, espaco = 8;
  const bordaEsquerda = centro - MEIA_ABERTURA_ALA - folga, bordaDireita = centro + MEIA_ABERTURA_ALA + folga;
  const posicoes = [
    bordaEsquerda - larguraCela * 2 - espaco,
    bordaEsquerda - larguraCela,
    bordaDireita,
    bordaDireita + larguraCela + espaco
  ];
  for (const posicaoX of posicoes) {
    desenharCela(contexto, posicaoX, 250, larguraCela, 130, rgba(cores.grade, 0.7), cores.celaEscura);
  }
  // Sombra da distância por cima de tudo.
  const sombra = contexto.createLinearGradient(0, 80, 0, CHAO);
  sombra.addColorStop(0, rgba(cores.sombra, 0.5));
  sombra.addColorStop(1, rgba(cores.sombra, 0.12));
  contexto.fillStyle = sombra;
  contexto.fillRect(0, 0, largura, CHAO);
}

function desenharCorredorEstatico(largura, altura, contexto) {
  const sorteio = criarSorteio(1888);
  desenharParedeComArco(contexto, largura, altura);
  desenharTijolos(contexto, largura);
  desenharManchas(contexto, largura, sorteio);
  desenharAzulejos(contexto, largura, sorteio);
  desenharMolduraDoArco(contexto);
  for (const cela of CELAS) desenharCelaDoCorredor(contexto, cela);
  desenharPilaresEGargulas(contexto);
  desenharCanos(contexto, largura);
  desenharPlacas(contexto);
  desenharSombrasDasBordas(contexto, largura, altura);
}

function desenharParedeComArco(contexto, largura, altura) {
  const pedra = contexto.createLinearGradient(0, 0, 0, altura);
  pedra.addColorStop(0, estiloVisual.gradiente6);
  pedra.addColorStop(0.5, estiloVisual.gradiente7);
  pedra.addColorStop(1, cores.paredeBase);
  contexto.fillStyle = pedra;
  const centroX = (ARCO.esquerda + ARCO.direita) / 2, raioX = (ARCO.direita - ARCO.esquerda) / 2;
  contexto.beginPath();
  contexto.rect(0, 0, largura, altura);
  contexto.moveTo(ARCO.esquerda, CHAO);
  contexto.lineTo(ARCO.direita, CHAO);
  contexto.lineTo(ARCO.direita, ARCO.topoReto);
  contexto.ellipse(centroX, ARCO.topoReto, raioX, ARCO.raio, 0, 0, Math.PI, true);
  contexto.closePath();
  contexto.fill("evenodd");
}

// Tijolos só fora do arco e acima do azulejo.
function desenharTijolos(contexto, largura) {
  contexto.save();
  contexto.beginPath();
  contexto.rect(0, 34, ARCO.esquerda - 14, AZULEJO_TOPO - 34);
  contexto.rect(ARCO.direita + 14, 34, largura - ARCO.direita - 14, AZULEJO_TOPO - 34);
  contexto.rect(ARCO.esquerda - 14, 34, ARCO.direita - ARCO.esquerda + 28, ARCO.topoReto - ARCO.raio - 50);
  contexto.clip();
  contexto.strokeStyle = estiloVisual.contorno9;
  contexto.lineWidth = 1;
  for (let posicaoY = 34; posicaoY < AZULEJO_TOPO; posicaoY += 22) {
    contexto.beginPath();
    contexto.moveTo(0, posicaoY);
    contexto.lineTo(largura, posicaoY);
    const deslocamento = (posicaoY / 22) % 2 ? 0 : 22;
    for (let posicaoX = deslocamento; posicaoX < largura; posicaoX += 44) {
      contexto.moveTo(posicaoX, posicaoY);
      contexto.lineTo(posicaoX, posicaoY + 22);
    }
    contexto.stroke();
  }
  contexto.restore();
}

// Umidade e sujeira: manchas escuras e rachaduras finas na parede.
function desenharManchas(contexto, largura, sorteio) {
  contexto.fillStyle = rgba(cores.mancha, 0.22);
  for (let indiceItem = 0; indiceItem < 16; indiceItem++) {
    const posicaoX = sorteio() * largura, posicaoY = 50 + sorteio() * 230;
    contexto.beginPath();
    contexto.ellipse(posicaoX, posicaoY, 14 + sorteio() * 30, 8 + sorteio() * 18, sorteio() * 3, 0, Math.PI * 2);
    contexto.fill();
  }
  contexto.strokeStyle = rgba(cores.rachadura, 0.7);
  contexto.lineWidth = 1;
  for (let indiceItem = 0; indiceItem < 7; indiceItem++) {
    let posicaoX = sorteio() * largura, posicaoY = 40 + sorteio() * 200;
    contexto.beginPath();
    contexto.moveTo(posicaoX, posicaoY);
    for (let segmento = 0; segmento < 5; segmento++) {
      posicaoX += (sorteio() - 0.5) * 16;
      posicaoY += 6 + sorteio() * 10;
      contexto.lineTo(posicaoX, posicaoY);
    }
    contexto.stroke();
  }
}

// Azulejo hospitalar na parte de baixo da parede: escuro, gasto e com escorridos.
function desenharAzulejos(contexto, largura, sorteio) {
  contexto.save();
  contexto.beginPath();
  contexto.rect(0, AZULEJO_TOPO, ARCO.esquerda, CHAO - AZULEJO_TOPO);
  contexto.rect(ARCO.direita, AZULEJO_TOPO, largura - ARCO.direita, CHAO - AZULEJO_TOPO);
  contexto.clip();
  contexto.fillStyle = cores.azulejo;
  contexto.fillRect(0, AZULEJO_TOPO, largura, CHAO - AZULEJO_TOPO);
  // Azulejos lascados (mais escuros), sorteados.
  contexto.fillStyle = cores.azulejoLascado;
  for (let posicaoY = AZULEJO_TOPO + 6; posicaoY < CHAO; posicaoY += 14) {
    for (let posicaoX = 0; posicaoX < largura; posicaoX += 14) {
      if (sorteio() < 0.06) contexto.fillRect(posicaoX, posicaoY, 14, 14);
    }
  }
  contexto.strokeStyle = cores.rejunte;
  contexto.lineWidth = 1;
  contexto.beginPath();
  for (let posicaoY = AZULEJO_TOPO + 6; posicaoY < CHAO; posicaoY += 14) {
    contexto.moveTo(0, posicaoY);
    contexto.lineTo(largura, posicaoY);
  }
  for (let posicaoX = 0; posicaoX < largura; posicaoX += 14) {
    contexto.moveTo(posicaoX, AZULEJO_TOPO + 6);
    contexto.lineTo(posicaoX, CHAO);
  }
  contexto.stroke();
  // Faixa escura no topo do azulejo.
  contexto.fillStyle = cores.faixa;
  contexto.fillRect(0, AZULEJO_TOPO, largura, 6);
  // Escorridos de sujeira descendo da faixa.
  for (let indiceItem = 0; indiceItem < 22; indiceItem++) {
    const posicaoX = sorteio() * largura, comprimento = 20 + sorteio() * 70;
    const escorrido = contexto.createLinearGradient(0, AZULEJO_TOPO + 6, 0, AZULEJO_TOPO + 6 + comprimento);
    escorrido.addColorStop(0, rgba(cores.mancha, 0.45));
    escorrido.addColorStop(1, rgba(cores.mancha, 0));
    contexto.fillStyle = escorrido;
    contexto.fillRect(posicaoX, AZULEJO_TOPO + 6, 3 + sorteio() * 5, comprimento);
  }
  // "ARKHAM" pintado com estêncil, já apagado pelo tempo.
  contexto.fillStyle = rgba(cores.textoPlaca, 0.07);
  contexto.font = "900 34px Impact, 'Arial Narrow', sans-serif";
  contexto.textAlign = "left";
  contexto.textBaseline = "alphabetic";
  contexto.fillText("ARKHAM", 30, 424);
  contexto.restore();
}

function desenharMolduraDoArco(contexto) {
  const centroX = (ARCO.esquerda + ARCO.direita) / 2, raioX = (ARCO.direita - ARCO.esquerda) / 2;
  // Pedras grandes contornando a passagem.
  contexto.strokeStyle = cores.pedraArco;
  contexto.lineWidth = 14;
  contexto.beginPath();
  contexto.moveTo(ARCO.esquerda - 7, CHAO);
  contexto.lineTo(ARCO.esquerda - 7, ARCO.topoReto);
  contexto.ellipse(centroX, ARCO.topoReto, raioX + 7, ARCO.raio + 7, 0, Math.PI, 0, false);
  contexto.lineTo(ARCO.direita + 7, CHAO);
  contexto.stroke();
  // Juntas entre as pedras do arco.
  contexto.strokeStyle = estiloVisual.contorno9;
  contexto.lineWidth = 1.5;
  for (let indiceItem = 1; indiceItem < 12; indiceItem++) {
    const angulo = Math.PI + indiceItem / 12 * Math.PI;
    const cosseno = Math.cos(angulo), seno = Math.sin(angulo);
    contexto.beginPath();
    contexto.moveTo(centroX + cosseno * raioX, ARCO.topoReto + seno * ARCO.raio);
    contexto.lineTo(centroX + cosseno * (raioX + 14), ARCO.topoReto + seno * (ARCO.raio + 14));
    contexto.stroke();
  }
  // Portão de ferro aberto, recolhido junto aos batentes.
  contexto.strokeStyle = rgba(cores.grade, 0.9);
  contexto.lineWidth = 3;
  contexto.beginPath();
  for (const [inicio, direcao] of [[ARCO.esquerda + 4, 1], [ARCO.direita - 4, -1]]) {
    for (let barra = 0; barra < 5; barra++) {
      const posicaoX = inicio + direcao * barra * 7;
      contexto.moveTo(posicaoX, ARCO.topoReto + 10);
      contexto.lineTo(posicaoX, CHAO);
    }
    contexto.moveTo(inicio, ARCO.topoReto + 40);
    contexto.lineTo(inicio + direcao * 28, ARCO.topoReto + 40);
    contexto.moveTo(inicio, 380);
    contexto.lineTo(inicio + direcao * 28, 380);
  }
  contexto.stroke();
}

function desenharCelaDoCorredor(contexto, cela) {
  const largura = 110;
  // Batente com rebites.
  contexto.fillStyle = cores.batente;
  contexto.fillRect(cela.x - 6, 74, largura + 12, 232);
  contexto.fillStyle = rgba(cores.textoPlaca, 0.18);
  for (let posicaoY = 84; posicaoY < 300; posicaoY += 22) {
    contexto.fillRect(cela.x - 4, posicaoY, 2, 2);
    contexto.fillRect(cela.x + largura + 2, posicaoY, 2, 2);
  }
  // Interior escuro com um catre ao fundo.
  contexto.fillStyle = estiloVisual.preenchimento10;
  contexto.fillRect(cela.x, 80, largura, 220);
  contexto.fillStyle = cores.catre;
  contexto.fillRect(cela.x + 12, 262, 64, 10);
  contexto.fillRect(cela.x + 14, 272, 3, 22);
  contexto.fillRect(cela.x + 71, 272, 3, 22);
  // Grades.
  contexto.strokeStyle = estiloVisual.contorno13;
  contexto.lineWidth = 4;
  contexto.beginPath();
  for (let posicaoX = cela.x + 8; posicaoX < cela.x + largura; posicaoX += 18) {
    contexto.moveTo(posicaoX, 80);
    contexto.lineTo(posicaoX, 300);
  }
  contexto.stroke();
  contexto.lineWidth = 3;
  contexto.beginPath();
  contexto.moveTo(cela.x, 190);
  contexto.lineTo(cela.x + largura, 190);
  contexto.stroke();
  // Arco de pedra sobre a cela e plaquinha com o número.
  contexto.fillStyle = estiloVisual.contorno9;
  contexto.beginPath();
  contexto.arc(cela.x + 55, 80, 55, Math.PI, 0, false);
  contexto.fill();
  contexto.fillStyle = cores.placa;
  contexto.fillRect(cela.x + 37, 50, 36, 14);
  contexto.fillStyle = rgba(cores.textoPlaca, 0.6);
  contexto.font = "bold 9px monospace";
  contexto.textAlign = "center";
  contexto.textBaseline = "middle";
  contexto.fillText(cela.numero, cela.x + 55, 57.5);
}

function desenharPilaresEGargulas(contexto) {
  for (const px of PILARES) {
    contexto.fillStyle = estiloVisual.preenchimento15;
    contexto.fillRect(px - 20, 120, 40, CHAO - 120);
    contexto.fillStyle = rgba(cores.textoPlaca, 0.05);
    contexto.fillRect(px - 20, 120, 4, CHAO - 120);
    contexto.fillStyle = estiloVisual.preenchimento16;
    contexto.beginPath();
    contexto.ellipse(px, 110, 16, 14, 0, 0, Math.PI * 2);
    contexto.fill();
    contexto.beginPath();
    contexto.moveTo(px - 14, 110);
    contexto.lineTo(px - 32, 85);
    contexto.lineTo(px - 12, 100);
    contexto.moveTo(px + 14, 110);
    contexto.lineTo(px + 32, 85);
    contexto.lineTo(px + 12, 100);
    contexto.fill();
    contexto.fillStyle = estiloVisual.preenchimento17;
    contexto.fillRect(px - 5, 107, 3, 2);
    contexto.fillRect(px + 2, 107, 3, 2);
  }
}

// Tubulações no teto: dois canos com flanges, um registro e um cano descendo pela parede.
function desenharCanos(contexto, largura) {
  contexto.fillStyle = cores.teto;
  contexto.fillRect(0, 0, largura, 34);
  for (const [posicaoY, espessura] of [[12, 9], [26, 7]]) {
    const cano = contexto.createLinearGradient(0, posicaoY - espessura / 2, 0, posicaoY + espessura / 2);
    cano.addColorStop(0, cores.canoClaro);
    cano.addColorStop(1, cores.cano);
    contexto.fillStyle = cano;
    contexto.fillRect(0, posicaoY - espessura / 2, largura, espessura);
    contexto.fillStyle = cores.flange;
    for (let posicaoX = 60; posicaoX < largura; posicaoX += 140) {
      contexto.fillRect(posicaoX, posicaoY - espessura / 2 - 2, 6, espessura + 4);
    }
  }
  // Registro (volante) no cano de baixo.
  contexto.strokeStyle = cores.registro;
  contexto.lineWidth = 2;
  contexto.beginPath();
  contexto.arc(470, 26, 8, 0, Math.PI * 2);
  contexto.moveTo(462, 26);
  contexto.lineTo(478, 26);
  contexto.moveTo(470, 18);
  contexto.lineTo(470, 34);
  contexto.stroke();
  // Cano descendo pela parede até o chão.
  const descendo = contexto.createLinearGradient(1046, 0, 1058, 0);
  descendo.addColorStop(0, cores.canoClaro);
  descendo.addColorStop(1, cores.cano);
  contexto.fillStyle = descendo;
  contexto.fillRect(1046, 30, 12, CHAO - 30);
  contexto.fillStyle = cores.flange;
  for (let posicaoY = 90; posicaoY < CHAO; posicaoY += 110) {
    contexto.fillRect(1044, posicaoY, 16, 5);
  }
}

function desenharPlacas(contexto) {
  const centroX = (ARCO.esquerda + ARCO.direita) / 2;
  // Placa de aviso sobre o arco, com faixas de alerta apagadas.
  const placa = { x: centroX - 110, y: 50, w: 220, h: 22 };
  contexto.fillStyle = cores.placa;
  contexto.fillRect(placa.x, placa.y, placa.w, placa.h);
  contexto.save();
  contexto.beginPath();
  contexto.rect(placa.x, placa.y, placa.w, placa.h);
  contexto.clip();
  contexto.fillStyle = rgba(cores.alerta, 0.35);
  for (let posicaoX = placa.x - 20; posicaoX < placa.x + placa.w; posicaoX += 14) {
    contexto.beginPath();
    contexto.moveTo(posicaoX, placa.y + placa.h);
    contexto.lineTo(posicaoX + 7, placa.y + placa.h);
    contexto.lineTo(posicaoX + 17, placa.y);
    contexto.lineTo(posicaoX + 10, placa.y);
    contexto.closePath();
    contexto.fill();
  }
  contexto.restore();
  contexto.fillStyle = cores.placa;
  contexto.fillRect(placa.x + 14, placa.y + 3, placa.w - 28, placa.h - 6);
  contexto.fillStyle = rgba(cores.alerta, 0.75);
  contexto.font = "bold 10px monospace";
  contexto.textAlign = "center";
  contexto.textBaseline = "middle";
  contexto.fillText("ALA B · SEGURANÇA MÁXIMA", centroX, placa.y + placa.h / 2 + 0.5);
  // Placas de direção esmaltadas no azulejo.
  for (const [posicaoX, texto] of [[262, "← ALA A"], [836, "ENFERMARIA →"]]) {
    contexto.fillStyle = rgba(cores.placaEsmalte, 0.55);
    contexto.fillRect(posicaoX - 40, 318, 80, 16);
    contexto.fillStyle = rgba(cores.textoPlaca, 0.6);
    contexto.font = "bold 8px monospace";
    contexto.fillText(texto, posicaoX, 326.5);
  }
}

// Bordas da cena mais escuras (vinheta), só com gradientes lineares.
function desenharSombrasDasBordas(contexto, largura, altura) {
  const topo = contexto.createLinearGradient(0, 0, 0, 120);
  topo.addColorStop(0, rgba(cores.sombra, 0.55));
  topo.addColorStop(1, rgba(cores.sombra, 0));
  contexto.fillStyle = topo;
  contexto.fillRect(0, 0, largura, 120);
  for (const [inicio, fim] of [[0, 90], [largura, largura - 90]]) {
    const lado = contexto.createLinearGradient(inicio, 0, fim, 0);
    lado.addColorStop(0, rgba(cores.sombra, 0.5));
    lado.addColorStop(1, rgba(cores.sombra, 0));
    contexto.fillStyle = lado;
    contexto.fillRect(Math.min(inicio, fim), 0, 90, altura);
  }
}
