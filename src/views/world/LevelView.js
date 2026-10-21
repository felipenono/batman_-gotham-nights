import { Level1Background } from './Level1Background.js';
import { Level2Background } from './Level2Background.js';
import { Level3Background } from './Level3Background.js';
import { EntityRenderer } from '../renderers/EntityRenderer.js';

export class LevelView {
  constructor(model, entities = new EntityRenderer()) {
    this.model = model;
    this.entities = entities;
    this._setupBackground();
  }
  _setupBackground() {
    switch (this.model.config.background) {
      case "Level1Background":
        this.background = new Level1Background(this.model.width, this.model.height);
        break;
      case "Level2Background":
        this.background = new Level2Background(this.model.width, this.model.height);
        break;
      case "Level3Background":
        this.background = new Level3Background(this.model.width, this.model.height);
        break;
      default: this.background = new Level1Background(this.model.width, this.model.height);
    }
    // Cenários com luz projetada (Fase 3) precisam saber onde ficam as superfícies.
    this.background.usarPlataformas?.(this.model.platforms);
  }
  update(passoTempo = 1, cameraDoJogo = null) {
    if (this.background) {
      this.background.update(passoTempo, cameraDoJogo);
    }
  }
  draw(contexto, cameraDoJogo = null) {
    if (this.background) {
      this.background.draw(contexto, cameraDoJogo);
    }
    contexto.save();
    contexto.translate(-(cameraDoJogo?.renderX ?? 0), -(cameraDoJogo?.renderY ?? 0));
    for (const plat of this.model.platforms) {
      this.entities.draw(contexto, plat);
    }
    this.background?.drawSurfaceLighting?.(contexto, this.model.platforms);
    contexto.restore();
  }
}
