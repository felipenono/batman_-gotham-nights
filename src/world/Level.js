// Este arquivo cuida de montar o cenário e as plataformas de uma fase.
// ===== DEPENDÊNCIAS E CONFIGURAÇÕES =====
import { MUNDO } from "../config/configuracao.js";
import { Platform } from "../entities/Platform.js";
import { Level1Background } from "./Level1Background.js";
import { Level2Background } from "./Level2Background.js";
import { Level3Background } from "./Level3Background.js";
// ===== COMPORTAMENTO =====
export class Level {
  // Recebe as dependências e prepara o estado inicial deste componente.
  constructor(configuracao) {
    this.config = configuracao;
    this.width = MUNDO.largura;
    this.height = MUNDO.altura;
    this.platforms = [];
    this.spawnPoint = { ...MUNDO.inicio };
    this._setupBackground();
    this._buildPlatforms();
  }
  _setupBackground() {
    switch (this.config.background) {
      case "Level1Background":
        this.background = new Level1Background(this.width, this.height);
        break;
      case "Level2Background":
        this.background = new Level2Background(this.width, this.height);
        break;
      case "Level3Background":
        this.background = new Level3Background(this.width, this.height);
        break;
      default: this.background = new Level1Background(this.width, this.height);
    }
  }
  // Recebe o mapa da configuração; a primeira plataforma acompanha o tamanho do mundo.
  _buildPlatforms() {
    const mapa = MUNDO.plataformas[this.config.id] ?? [];
    this.platforms = mapa.map((dados, indice) => {
      const plataforma = { ...dados };
      if (indice === 0) {
        plataforma.y = this.height - MUNDO.alturaChao;
        plataforma.w = this.width;
        plataforma.h = MUNDO.alturaChao;
      }
      return new Platform(plataforma);
    });
  }
  // Recebe a atualização atual e avança o estado, sem redesenhar a tela.
  update(passoTempo = 1, cameraDoJogo = null) {
    if (this.background) {
      this.background.update(passoTempo, cameraDoJogo);
    }
  }
  // Recebe o contexto 2D e desenha o estado atual sem avançar o tempo.
  draw(contexto, cameraDoJogo = null) {
    if (this.background) {
      this.background.draw(contexto, cameraDoJogo);
    }
    contexto.save();
    contexto.translate(-(cameraDoJogo?.renderX ?? 0), -(cameraDoJogo?.renderY ?? 0));
    for (const plat of this.platforms) {
      plat.draw(contexto);
    }
    this.background?.drawSurfaceLighting?.(contexto, this.platforms);
    contexto.restore();
  }
}
