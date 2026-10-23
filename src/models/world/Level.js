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

  // Usa uma plataforma existente perto do centro da tela inicial.
  centerSpawn(playerWidth, playerHeight, viewportWidth, viewportHeight) {
    const centerX = Math.min(this.width, viewportWidth) / 2;
    const x = centerX - playerWidth / 2;
    const idealPlatformY = Math.min(this.height, viewportHeight) / 2 + playerHeight / 2;
    const platforms = this.platforms.filter(platform => platform.alive && platform.x <= x && platform.x + platform.w >= x + playerWidth);
    const platform = platforms.reduce((nearest, candidate) => !nearest || Math.abs(candidate.y - idealPlatformY) < Math.abs(nearest.y - idealPlatformY) ? candidate : nearest, null);
    this.spawnPoint = { x, y: (platform?.y ?? this.height - MUNDO.alturaChao) - playerHeight };
    return this.spawnPoint;
  }

}
