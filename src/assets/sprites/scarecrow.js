// scarecrow: original procedural artwork, isolated from gameplay and reused by named animation frames.
export const scarecrow = { width:60, height:110, paint(ctx) {
    if (!this.alive) return;

    ctx.save();
    ctx.translate(this.x + this.w / 2, this.y + this.h);
    ctx.scale(this.facing, 1);

    const hoverSway = Math.sin(this.floatCycle * 2) * 2;

    // --- TATTERED ROBE & HEM ---
    const robeBaseY = -18;
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.moveTo(-22, robeBaseY - 50);
    ctx.lineTo(22, robeBaseY - 50);
    ctx.lineTo(26, robeBaseY);
    // Jagged tattered hem
    ctx.lineTo(18, robeBaseY - 6);
    ctx.lineTo(10, robeBaseY + 2);
    ctx.lineTo(0, robeBaseY - 4);
    ctx.lineTo(-10, robeBaseY + 2);
    ctx.lineTo(-18, robeBaseY - 6);
    ctx.lineTo(-26, robeBaseY);
    ctx.closePath();
    ctx.fill();

    // Robe shading & patches
    ctx.fillStyle = '#92400e';
    ctx.fillRect(-14, robeBaseY - 40, 10, 12);
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 1;
    ctx.strokeRect(-14, robeBaseY - 40, 10, 12);

    // Dark boots underneath
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(-14, -14, 10, 14);
    ctx.fillRect(4, -14, 10, 14);

    // --- ROPE BELT ---
    const beltY = robeBaseY - 44;
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(-20, beltY);
    ctx.lineTo(20, beltY);
    ctx.stroke();

    // Hanging rope knot
    ctx.beginPath();
    ctx.moveTo(4, beltY);
    ctx.lineTo(6, beltY + 16);
    ctx.stroke();

    // --- CHEST & SLEEVES ---
    // Left & Right tattered arms
    ctx.fillStyle = '#854d0e';
    if (this.isAttacking) {
      // Extended claw-like casting arm
      ctx.fillRect(14, beltY - 24, 28, 12);
      // Straw poking out from sleeve
      ctx.fillStyle = '#fde047';
      ctx.fillRect(38, beltY - 26, 6, 3);
      ctx.fillRect(40, beltY - 14, 8, 3);
      // Hypodermic syringe glove fingers
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(42, beltY - 22, 6, 2);
      ctx.fillRect(42, beltY - 18, 6, 2);
      ctx.fillRect(42, beltY - 14, 6, 2);
    } else {
      ctx.fillRect(16, beltY - 24, 12, 28);
      // Straw needle fingers
      ctx.fillStyle = '#fde047';
      ctx.fillRect(18, beltY + 4, 3, 8);
      ctx.fillRect(22, beltY + 4, 3, 8);
    }

    // --- BURLAP SACK MASK & HEAD ---
    const headY = beltY - 34;

    // Burlap head sack
    ctx.fillStyle = '#a16207';
    ctx.beginPath();
    ctx.roundRect(-16, headY - 10, 32, 34, 10);
    ctx.fill();

    // Stitched X eyes matching reference
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 2.4;
    // Left X eye
    ctx.beginPath();
    ctx.moveTo(-11, headY - 4); ctx.lineTo(-5, headY + 2);
    ctx.moveTo(-5, headY - 4); ctx.lineTo(-11, headY + 2);
    ctx.stroke();

    // Right X eye
    ctx.beginPath();
    ctx.moveTo(5, headY - 4); ctx.lineTo(11, headY + 2);
    ctx.moveTo(11, headY - 4); ctx.lineTo(5, headY + 2);
    ctx.stroke();

    // Stitched grinning mouth
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-12, headY + 14);
    ctx.lineTo(12, headY + 14);
    ctx.stroke();

    // Cross-stitches across mouth line
    for (let s = -10; s <= 10; s += 4) {
      ctx.beginPath();
      ctx.moveTo(s, headY + 11);
      ctx.lineTo(s, headY + 17);
      ctx.stroke();
    }

    // --- WIDE-BRIM STRAW HAT ---
    const hatY = headY - 14;

    // Straw poking out under hat
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(-22, hatY + 6, 6, 3);
    ctx.fillRect(18, hatY + 6, 5, 3);

    // Wide hat brim
    ctx.fillStyle = '#713f12';
    ctx.beginPath();
    ctx.ellipse(0, hatY + 4, 32, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Hat crown (tall pointed ragged cone)
    ctx.beginPath();
    ctx.moveTo(-16, hatY + 4);
    ctx.lineTo(-4, hatY - 26);
    ctx.lineTo(6, hatY - 24);
    ctx.lineTo(16, hatY + 4);
    ctx.closePath();
    ctx.fill();

    // Hat rope band
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-15, hatY + 2);
    ctx.lineTo(15, hatY + 2);
    ctx.stroke();

    // Hurt flash
    if (this.hurtFlash > 0) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.beginPath();
      ctx.roundRect(-24, -110, 48, 110, 6);
      ctx.fill();
    }

    ctx.restore();
} };
