// Este arquivo cuida de montar o cenário e as plataformas de uma fase.
// ===== DEPENDÊNCIAS E CONFIGURAÇÕES =====
import { MUNDO } from "../../config/configuracao.js";
import { Platform } from "../entities/Platform.js";
// ===== COMPORTAMENTO =====
export class Level {
  // Recebe as dependências e prepara o estado inicial deste componente.
  constructor(configuracao) {
    this.config = configuracao;
    this.width = MUNDO.largura;
    this.height = MUNDO.altura;
    this.platforms = [];
    this.spawnPoint = { ...MUNDO.inicio };
    this._buildPlatforms();
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

}
