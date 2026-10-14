// harley_quinn: original procedural artwork, isolated from gameplay and reused by named animation frames.
export const harley_quinn = { width:38, height:72, paint(ctx) {
    if (!this.alive) return;

    ctx.save();
    ctx.translate(this.x + this.w / 2, this.y + this.h);

    if (this.isCartwheeling) {
      ctx.rotate(this.cartwheelAngle);
    } else {
      ctx.scale(this.facing, 1);
    }

    const isMoving = Math.abs(this.vx) > 0.2;
    const legOffset = isMoving ? Math.sin(this.acrobatTime * 4) * 8 : 0;
    const bounce = Math.sin(this.acrobatTime * 2) * 1.5;

    // --- LEGS & BOOTS (Split Red & Black) ---
    // Left leg (Red)
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(-12 - legOffset * 0.4, -22, 9, 14);
    // Left boot (Black with white pompom)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-14 - legOffset * 0.4, -8, 11, 8);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-13 - legOffset * 0.4, -8, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Right leg (Black)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(3 + legOffset * 0.4, -22, 9, 14);
    // Right boot (Red with white pompom)
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(3 + legOffset * 0.4, -8, 12, 8);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(14 + legOffset * 0.4, -8, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // --- TORSO (Split Diamond Jester Harlequin) ---
    const torsoY = -48 + bounce;

    // Base body split
    ctx.fillStyle = '#dc2626'; // Red half
    ctx.fillRect(-14, torsoY + 8, 14, 22);
    ctx.fillStyle = '#0f172a'; // Black half
    ctx.fillRect(0, torsoY + 8, 14, 22);

    // Diamond patterns on opposite sides
    ctx.fillStyle = '#0f172a'; // Black diamonds on red
    ctx.beginPath();
    ctx.moveTo(-7, torsoY + 11);
    ctx.lineTo(-3, torsoY + 16);
    ctx.lineTo(-7, torsoY + 21);
    ctx.lineTo(-11, torsoY + 16);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#dc2626'; // Red diamonds on black
    ctx.beginPath();
    ctx.moveTo(7, torsoY + 11);
    ctx.lineTo(11, torsoY + 16);
    ctx.lineTo(7, torsoY + 21);
    ctx.lineTo(3, torsoY + 16);
    ctx.closePath();
    ctx.fill();

    // Ruffled white neck collar
    ctx.fillStyle = '#f8fafc';
    for (let c = -14; c <= 10; c += 6) {
      ctx.beginPath();
      ctx.arc(c + 3, torsoY + 8, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // --- ARMS & WEAPONS ---
    // Right hand gun / Left hand mallet
    ctx.fillStyle = '#dc2626';
    if (this.isAttacking) {
      // Handgun extended
      ctx.fillRect(6, torsoY + 10, 16, 5);
      // Revolver / pistol
      ctx.fillStyle = '#475569';
      ctx.fillRect(20, torsoY + 7, 9, 6);
      ctx.fillRect(19, torsoY + 13, 3, 5);
      // Muzzle spark
      ctx.fillStyle = '#facc15';
      ctx.fillRect(29, torsoY + 8, 3, 4);
    } else {
      ctx.fillRect(8, torsoY + 10, 6, 16);
      // Mallet held over shoulder
      ctx.fillStyle = '#78350f'; // handle
      ctx.fillRect(-16, torsoY - 8, 4, 30);
      // Mallet giant wooden head
      ctx.fillStyle = '#92400e';
      ctx.fillRect(-24, torsoY - 20, 20, 14);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-24, torsoY - 20, 20, 14);
    }

    // --- HEAD, JESTER COWL & HORNS ---
    const headY = torsoY - 14;

    // Face
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.roundRect(-9, headY + 2, 18, 18, 5);
    ctx.fill();

    // Black domino eye mask
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(-8, headY + 5, 16, 6, 2);
    ctx.fill();

    // Blue eyes inside mask
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(-5, headY + 6, 3, 3);
    ctx.fillRect(3, headY + 6, 3, 3);

    // Red lipstick smile
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(0, headY + 13, 5, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();

    // JESTER COWL (Split Red on left, Black on right)
    // Left horn (Red)
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.moveTo(-8, headY + 4);
    ctx.quadraticCurveTo(-16, headY - 12, -22, headY - 2);
    ctx.lineTo(-14, headY - 1);
    ctx.closePath();
    ctx.fill();
    // Left bell
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-22, headY - 2, 3, 0, Math.PI * 2);
    ctx.fill();

    // Right horn (Black)
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(8, headY + 4);
    ctx.quadraticCurveTo(16, headY - 12, 22, headY - 2);
    ctx.lineTo(14, headY - 1);
    ctx.closePath();
    ctx.fill();
    // Right bell
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(22, headY - 2, 3, 0, Math.PI * 2);
    ctx.fill();

    // Blonde bangs peaking through
    ctx.fillStyle = '#fde047';
    ctx.fillRect(-6, headY + 2, 5, 3);
    ctx.fillRect(1, headY + 2, 5, 3);

    // Hurt flash
    if (this.hurtFlash > 0) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.beginPath();
      ctx.roundRect(-20, -72, 40, 72, 5);
      ctx.fill();
    }

    ctx.restore();
} };
