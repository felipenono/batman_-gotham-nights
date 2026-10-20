import { GAME } from '../../config/configuracao.js';

export class PlayerController {
  handleInput(player, input, mouse, projectilesOut, createBatarang) {
    if (!player.alive || player.deathTimer > 0) return;
    if (player.inputResetVersion !== input.resetVersion) {
      player.inputResetVersion = input.resetVersion;
      player.jumpBufferTimer = player.coyoteTimer = 0;
    }
    // Etapa 1: Inversão de controles caso sob efeito do medo
    const inverted = player.fearTimer > 0;
    const moveLeftKey = inverted ? input.isDown("RIGHT") : input.isDown("LEFT");
    const moveRightKey = inverted ? input.isDown("LEFT") : input.isDown("RIGHT");
    // Etapa 2: Cinemática horizontal
    if (moveLeftKey && !moveRightKey) {
      player.vx = -player.speed;
      player.facing = -1;
    } else if (moveRightKey && !moveLeftKey) {
      player.vx = player.speed;
      player.facing = 1;
    } else {
      player.vx = 0;
    }
    player.coyoteTimer = player.onGround ? GAME.COYOTE_FRAMES : Math.max(0, player.coyoteTimer - 1);
    player.jumpBufferTimer = input.justPressed("JUMP") ? GAME.JUMP_BUFFER_FRAMES : Math.max(0, player.jumpBufferTimer - 1);
    if (player.jumpBufferTimer > 0 && player.coyoteTimer > 0) {
      player.jumpBufferTimer = 0;
      player.coyoteTimer = 0;
      player.vy = player.jumpForce;
      player.onGround = false;
    }
    // Etapa 4: Disparo do Batarang (Único ataque do Batman)
    const isMouseFiring = mouse.justClicked;
    const isKeyFiring = input.justPressed("SHOOT");
    const wantsToShoot = isMouseFiring || isKeyFiring;
    if (wantsToShoot && player.shootCooldown <= 0) {
      player.throwBatarang(mouse, isMouseFiring, projectilesOut, createBatarang);
    }

  }
}
