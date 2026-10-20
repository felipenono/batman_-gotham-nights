import { Character } from '../../models/entities/Character.js';
import { SpriteRenderer } from '../sprites/SpriteRenderer.js';
import { Batarang } from '../../models/entities/projectiles/Batarang.js';
import { paintBatarang } from './entities/BatarangRenderer.js';
import { Bullet } from '../../models/entities/projectiles/Bullet.js';
import { drawBullet } from './entities/BulletRenderer.js';
import { Coin } from '../../models/entities/projectiles/Coin.js';
import { drawCoin } from './entities/CoinRenderer.js';
import { FearSmoke } from '../../models/entities/projectiles/FearSmoke.js';
import { drawFearSmoke } from './entities/FearSmokeRenderer.js';
import { GasBomb } from '../../models/entities/projectiles/GasBomb.js';
import { drawGasBomb } from './entities/GasBombRenderer.js';
import { JokerTeeth } from '../../models/entities/projectiles/JokerTeeth.js';
import { drawJokerTeeth } from './entities/JokerTeethRenderer.js';
import { Mallet } from '../../models/entities/projectiles/Mallet.js';
import { drawMallet } from './entities/MalletRenderer.js';
import { PenguinBomb } from '../../models/entities/projectiles/PenguinBomb.js';
import { drawPenguinBomb } from './entities/PenguinBombRenderer.js';
import { UmbrellaBurst } from '../../models/entities/projectiles/UmbrellaBurst.js';
import { drawUmbrellaBurst } from './entities/UmbrellaBurstRenderer.js';
import { Platform } from '../../models/entities/Platform.js';
import { drawPlatform } from './entities/PlatformRenderer.js';

export class EntityRenderer {
  constructor() {
    const sprites = new SpriteRenderer();
    this.painters = new Map([
      [Character, function(ctx) { sprites.draw(ctx, this); }],
      [Batarang, paintBatarang],
      [Bullet, drawBullet],
      [Coin, drawCoin],
      [FearSmoke, drawFearSmoke],
      [GasBomb, drawGasBomb],
      [JokerTeeth, drawJokerTeeth],
      [Mallet, drawMallet],
      [PenguinBomb, drawPenguinBomb],
      [UmbrellaBurst, drawUmbrellaBurst],
      [Platform, drawPlatform]
    ]);
  }
  draw(ctx, entity) {
    if (!entity) return;
    let prototype = Object.getPrototypeOf(entity);
    while (prototype) {
      const paint = this.painters.get(prototype.constructor);
      if (paint) {
        paint.call(entity, ctx);
        return;
      }
      prototype = Object.getPrototypeOf(prototype);
    }
  }
}
