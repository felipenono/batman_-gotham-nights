// penguin: original procedural artwork, isolated from gameplay and reused by named animation frames.
export const penguin = { width:40, height:60, paint(ctx) {
    if (!this.alive) return;

    ctx.save();
    ctx.translate(this.x + this.w / 2, this.y + this.h);
    ctx.scale(this.facing, 1);

    const isWalking = Math.abs(this.vx) > 0.1;
    const waddleTilt = isWalking ? Math.sin(this.waddleTime * 3) * 0.12 : 0;
    ctx.rotate(waddleTilt);

    // --- LEGS & WADDLE FEET ---
    const legOffset = isWalking ? Math.sin(this.waddleTime * 3) * 6 : 0;
    ctx.fillStyle = '#7e228c';
    ctx.fillRect(-12 - legOffset * 0.4, -14, 8, 8);
    ctx.fillRect(4 + legOffset * 0.4, -14, 8, 8);

    // Black dress shoes
    ctx.fillStyle = '#10131b';
    ctx.fillRect(-14 - legOffset * 0.4, -6, 11, 6);
    ctx.fillRect(3 + legOffset * 0.4, -6, 12, 6);

    // --- ROTUND BODY & TAILCOAT ---
    const bodyY = -42;

    // Black tailcoat back
    ctx.fillStyle = '#1e1b4b';
    ctx.beginPath();
    ctx.ellipse(0, bodyY + 16, 18, 16, 0, 0, Math.PI * 2);
    ctx.fill();

    // Split tails at the back
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(-16, bodyY + 16);
    ctx.lineTo(-22, bodyY + 34);
    ctx.lineTo(-10, bodyY + 28);
    ctx.fill();

    // Plump white vest / shirt front
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.ellipse(3, bodyY + 16, 12, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Vest gold buttons
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(3, bodyY + 10, 2, 2);
    ctx.fillRect(3, bodyY + 16, 2, 2);
    ctx.fillRect(3, bodyY + 22, 2, 2);

    // Red bow tie
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.moveTo(0, bodyY + 4);
    ctx.lineTo(-4, bodyY + 2);
    ctx.lineTo(-4, bodyY + 6);
    ctx.moveTo(0, bodyY + 4);
    ctx.lineTo(4, bodyY + 2);
    ctx.lineTo(4, bodyY + 6);
    ctx.fill();

    // --- HEAD, SHARP NOSE & MONOCLE ---
    const headY = bodyY - 10;

    // Plump face
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.ellipse(2, headY + 4, 11, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Sharp pointy beak-like nose
    ctx.fillStyle = '#fdba74';
    ctx.beginPath();
    ctx.moveTo(8, headY + 2);
    ctx.lineTo(19, headY + 6);
    ctx.lineTo(8, headY + 8);
    ctx.closePath();
    ctx.fill();

    // Left eye (squinting)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, headY + 1, 3, 2);

    // Monocle on front eye
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(6, headY + 2, 4.5, 0, Math.PI * 2);
    ctx.stroke();

    // Monocle glass glint
    ctx.fillStyle = 'rgba(186, 230, 253, 0.55)';
    ctx.beginPath();
    ctx.arc(6, headY + 2, 3.8, 0, Math.PI * 2);
    ctx.fill();

    // Monocle string down to vest
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(6, headY + 6);
    ctx.quadraticCurveTo(2, bodyY + 6, 2, bodyY + 10);
    ctx.stroke();

    // Cigarette holder in mouth
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(8, headY + 9, 8, 2);
    ctx.fillStyle = '#f87171'; // burning red tip
    ctx.fillRect(16, headY + 9, 2, 2);

    // --- TOP HAT WITH PURPLE BAND ---
    const hatY = headY - 6;

    // Brim
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.ellipse(0, hatY, 18, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cylinder crown
    ctx.fillStyle = '#1e1b4b';
    ctx.fillRect(-10, hatY - 20, 20, 20);

    // Royal purple ribbon band
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(-10, hatY - 6, 20, 5);

    // --- UMBRELLA WEAPON ---
    if (this.isAttacking) {
      // Aimed straight forward
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(10, bodyY + 14);
      ctx.lineTo(34, bodyY + 14);
      ctx.stroke();

      // Umbrella ferrule tip
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(34, bodyY + 12, 4, 4);
    } else {
      // Held as walking cane
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(12, bodyY + 12);
      ctx.lineTo(16, bodyY + 36);
      ctx.stroke();

      // Hooked umbrella handle
      ctx.beginPath();
      ctx.arc(10, bodyY + 12, 3, Math.PI, 0, false);
      ctx.stroke();
    }

    // Hurt flash
    if (this.hurtFlash > 0) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.beginPath();
      ctx.roundRect(-20, -60, 40, 60, 4);
      ctx.fill();
    }

    // Mini overhead health bar when damaged
    if (this.hp < this.maxHp) {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-16, -68, 32, 5);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-16, -68, 32 * this.hpRatio, 5);
      ctx.strokeStyle = '#f87171';
      ctx.lineWidth = 0.8;
      ctx.strokeRect(-16, -68, 32, 5);
    }

    ctx.restore();
} };
