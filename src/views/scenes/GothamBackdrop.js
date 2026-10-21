// Este arquivo cuida de desenhar a cidade em camadas dos menus.
import { APARENCIA } from "../../config/configuracao.js";
// ===== DEPENDÊNCIAS E CONFIGURAÇÕES =====
import { LOBBY } from "../../config/configuracao.js";
import { BatSignal, moonLayout, visibleSky } from "./BatSignal.js";
const estiloVisual = APARENCIA.GothamBackdrop;
/** Cenário vetorial determinístico: sem imagens obrigatórias ou sorteio por quadro. */
// ===== COMPORTAMENTO =====
export class GothamBackdrop {
  // Recebe as dependências e prepara o estado inicial deste componente.
  constructor(profile = {}) {
    this.colors = {
      ...LOBBY.colors,
      ...profile.colors
    };
    this.weather = {
      rainCount: 100,
      fogOpacity: 0.055,
      fogStart: 0.055,
      fogDissipate: 0,
      fogColor: estiloVisual.gradiente1,
      rainColor: estiloVisual.gradiente2,
      ...profile.weather
    };
    let seed = 27;
    const random = () => {
      seed = seed * 16807 % 2147483647;
      return seed / 2147483647;
    };
    this.layers = [
      0,
      1,
      2
    ].map((layer) => {
      const buildings = [];
      for (let posicaoX = -100; posicaoX < 2100;) {
        const largura = 45 + random() * (85 - layer * 12);
        const altura = 80 + random() * (260 + layer * 65);
        buildings.push({
          x: posicaoX,
          width: largura,
          height: altura,
          spire: random() > 0.55,
          seed: random() * 100
        });
        posicaoX += largura + 5;
      }
      const ground = 895 + layer * 95;
      for (const predio of buildings) {
        predio.janelas = [];
        for (let posicaoY = ground - predio.height + 22; posicaoY < ground; posicaoY += 23) {
          for (let posicaoX = predio.x + 12; posicaoX < predio.x + predio.width - 8; posicaoX += 14) {
            if (Math.sin(posicaoX * 7 + posicaoY * 13 + predio.seed) >= 0.35) predio.janelas.push({
              x: posicaoX,
              y: posicaoY
            });
          }
        }
      }
      return buildings;
    });
    this.batSignal = new BatSignal({
      ...LOBBY.batSignal,
      ...profile.signal,
      colors: {
        ...LOBBY.batSignal.colors,
        ...profile.signal?.colors
      }
    });
    this.reflectorBuilding = null;
    this.screenAspect = undefined;
  }
  // Recebe o contexto 2D e desenha o estado atual sem avançar o tempo.
  // Desenha as camadas na mesma ordem; somente a origem do feixe acompanha a cidade.
  draw(contexto, largura, altura, tempo, pointer = 0, reduced = false, screenAspect = null) {
    contexto.save();
    contexto.scale(largura / LOBBY.base.width, altura / LOBBY.base.height);
    this.desenharCeu(contexto);
    const offsets = this.layers.map((_, layer) => reduced ? 0 : Math.sin(tempo / 14000) * (layer + 1) * 5 + pointer * (layer + 1) * LOBBY.motion.parallax);
    this.selecionarRefletor(screenAspect);
    const roof = this.reflectorBuilding;
    const origem = {
      x: roof.x + roof.width / 2 + offsets[2],
      y: 895 + 2 * 95 - roof.height - 26
    };
    // Uma única lua por quadro: o céu (em pixels) e o refletor (na escala base 1920 × 1080)
    // usam a mesma posição, só convertida de unidade. A lente também sai desse cálculo.
    const escalaX = largura / LOBBY.base.width, escalaY = altura / LOBBY.base.height;
    const lua = moonLayout(largura, altura, this.batSignal.config, screenAspect);
    const luaBase = { x: lua.x / escalaX, y: lua.y / escalaY, radius: lua.radius / Math.min(escalaX, escalaY) };
    const lenteBase = this.batSignal.lensPoint(origem, luaBase, 1);
    const luz = {
      lua,
      luaBase,
      origem: { x: origem.x * escalaX, y: origem.y * escalaY },
      lente: { x: lenteBase.x * escalaX, y: lenteBase.y * escalaY }
    };
    this.layers.forEach((buildings, layer) => {
      const deslocamento = offsets[layer];
      this.desenharLuz(contexto, largura, altura, tempo, luz, reduced, screenAspect, layer);
      contexto.save();
      contexto.translate(deslocamento, 0);
      this.desenharPredios(contexto, buildings, layer, origem, deslocamento, tempo, reduced);
      contexto.restore();
      this.desenharNevoa(contexto, layer, tempo, reduced);
    });
    this.batSignal.drawReflector(contexto, origem, luaBase, tempo, reduced);
    this.desenharChuva(contexto, tempo, reduced);
    this.desenharVinheta(contexto);
    // Halo, lua e símbolo são a própria fonte de luz: ficam por cima da vinheta (que escurece o resto).
    this.desenharLua(contexto, largura, altura, tempo, luz, reduced);
    contexto.restore();
  }
  desenharCeu(contexto) {
    const parametrosLocais = this.colors;
    const sky = contexto.createLinearGradient(0, 0, 0, 1080);
    sky.addColorStop(0, parametrosLocais.sky);
    sky.addColorStop(0.75, parametrosLocais.horizon);
    sky.addColorStop(1, parametrosLocais.near);
    contexto.fillStyle = sky;
    contexto.fillRect(0, 0, 1920, 1080);
  }
  selecionarRefletor(screenAspect) {
    if (!this.reflectorBuilding || this.screenAspect !== screenAspect) {
      // Seleciona uma vez por redimensionamento; o refletor permanece no mesmo prédio.
      const visible = visibleSky(LOBBY.base.width, LOBBY.base.height, screenAspect);
      const alvo = visible.x + visible.width * this.batSignal.config.sourceX;
      this.reflectorBuilding = this.layers[2].filter((building) => !building.spire).reduce((nearest, building) => Math.abs(building.x + building.width / 2 - alvo) < Math.abs(nearest.x + nearest.width / 2 - alvo) ? building : nearest);
      this.screenAspect = screenAspect;
    }
  }
  desenharLuz(contexto, largura, altura, tempo, luz, reduced, screenAspect, layer) {
    if (layer === 2) {
      // Luz à frente da cidade distante e atrás da camada do refletor.
      // Só a origem acompanha o parallax; lua, halo, símbolo e fim do feixe compartilham o centro.
      // Desfaz a escala desigual do cenário para conservar o círculo da lua.
      // Aqui entra só o feixe; halo e lua vêm depois da vinheta (desenharLua).
      contexto.save();
      contexto.scale(LOBBY.base.width / largura, LOBBY.base.height / altura);
      this.batSignal.drawBeam(contexto, luz.lua, luz.origem, tempo, this.batSignal.intensity(tempo, reduced).light, reduced, undefined, luz.lente);
      contexto.restore();
    }
  }
  desenharLua(contexto, largura, altura, tempo, luz, reduced) {
    const { fade, light } = this.batSignal.intensity(tempo, reduced);
    contexto.save();
    contexto.scale(LOBBY.base.width / largura, LOBBY.base.height / altura);
    this.batSignal.drawHalo(contexto, luz.lua, light);
    this.batSignal.drawMoon(contexto, luz.lua, fade, light);
    contexto.restore();
  }
  desenharPredios(contexto, buildings, layer, origem, deslocamento, tempo, reduced) {
    const ground = 895 + layer * 95;
    const coresCamadas = [
      this.colors.far,
      this.colors.middle,
      this.colors.near
    ];
    for (const predio of buildings) {
      const top = ground - predio.height;
      contexto.fillStyle = coresCamadas[layer];
      contexto.fillRect(predio.x, top, predio.width, 1100 - top);
      contexto.fillRect(predio.x + predio.width * 0.18, top - 12, predio.width * 0.64, 16);
      if (predio.spire) {
        contexto.fillRect(predio.x + predio.width / 2, top - 60, 3, 60);
        contexto.beginPath();
        contexto.moveTo(predio.x + 8, top);
        contexto.lineTo(predio.x + predio.width / 2, top - 32);
        contexto.lineTo(predio.x + predio.width - 8, top);
        contexto.fill();
        contexto.fillStyle = estiloVisual.preenchimento3;
        contexto.fillRect(predio.x + predio.width / 2, top - 61, 3, 3);
      }
      for (const janela of predio.janelas) {
        contexto.fillStyle = layer === 2 ? estiloVisual.gradiente4 : estiloVisual.gradiente5;
        contexto.fillRect(janela.x, janela.y, 3, 7);
      }
      if (layer === 2) this.batSignal.drawRim(contexto, predio, top, origem.x - deslocamento, tempo, reduced);
    }
  }
  desenharNevoa(contexto, layer, tempo, reduced) {
    const ground = 895 + layer * 95;
    const weather = this.weather;
    const drift = reduced ? 0 : Math.sin(tempo / LOBBY.motion.fog * Math.PI * 2 + layer) * 24;
    const fog = contexto.createLinearGradient(0, ground - 180 + drift, 0, ground + 30 + drift);
    fog.addColorStop(0, weather.fogColor + "00");
    fog.addColorStop(0.6, weather.fogColor);
    fog.addColorStop(1, weather.fogColor + "00");
    contexto.save();
    const dissipate = weather.fogDissipate ? Math.min(1, tempo / weather.fogDissipate) : 1;
    contexto.globalAlpha = weather.fogStart + (weather.fogOpacity - weather.fogStart) * dissipate;
    contexto.fillStyle = fog;
    contexto.fillRect(0, ground - 180, 1920, 230);
    contexto.restore();
  }
  desenharChuva(contexto, tempo, reduced) {
    const weather = this.weather;
    if (!reduced) {
      contexto.strokeStyle = weather.rainColor;
      contexto.lineWidth = 1;
      contexto.beginPath();
      for (let indiceItem = 0; indiceItem < weather.rainCount; indiceItem++) {
        const posicaoX = (indiceItem * 139 + tempo * 0.018) % 2000;
        const posicaoY = (indiceItem * 97 + tempo * 0.5) % 1080;
        contexto.moveTo(posicaoX, posicaoY);
        contexto.lineTo(posicaoX - 7, posicaoY + 24);
      }
      contexto.stroke();
    }
  }
  desenharVinheta(contexto) {
    const vignette = contexto.createRadialGradient(960, 420, 100, 960, 450, 1100);
    vignette.addColorStop(0, estiloVisual.gradiente6);
    vignette.addColorStop(1, estiloVisual.gradiente7);
    contexto.fillStyle = vignette;
    contexto.fillRect(0, 0, 1920, 1080);
  }
}
