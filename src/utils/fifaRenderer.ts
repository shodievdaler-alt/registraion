import { MatchEngineState } from './fifaPhysicsEngine';
import { PitchPlayer, SoccerBall, PitchDog, PitchFan } from '../types/scuffedFifa';

export class FifaRenderer {
  public static render(ctx: CanvasRenderingContext2D, state: MatchEngineState, width: number, height: number) {
    ctx.save();
    ctx.clearRect(0, 0, width, height);

    // Apply Screen Shake
    if (state.screenShake > 0) {
      const shakeX = (Math.random() - 0.5) * state.screenShake;
      const shakeY = (Math.random() - 0.5) * state.screenShake;
      ctx.translate(shakeX, shakeY);
    }

    // Scale from virtual coordinates (1200 x 700) to actual canvas dimensions
    const scaleX = width / 1200;
    const scaleY = height / 700;
    ctx.scale(scaleX, scaleY);

    // 1. Draw Field Turf (Multiple Worlds: Classic, Death Star, Mustafar, Hoth, Tatooine, Cyberpunk)
    this.drawPitch(ctx, state);

    // 2. Draw Ad Boards (Hilarious Sponsors & Star Wars Galaxy Ads)
    this.drawAdBoards(ctx, state);

    // 3. Draw Pitch Markings (White lines or glowing laser energy lines)
    this.drawPitchLines(ctx, state);

    // 4. Draw Goal Nets
    this.drawGoalNets(ctx, state);

    // 5. Draw Ball Shadows
    state.balls.forEach(ball => this.drawBallShadow(ctx, ball));

    // 6. Draw Player Shadows
    state.players.forEach(player => this.drawPlayerShadow(ctx, player));

    // 7. Draw Referee
    this.drawReferee(ctx, state);

    // 7.1 Draw Dog
    if (state.dog.active) {
      this.drawDog(ctx, state.dog);
    }

    // 7.2 Draw Streakers
    state.streakers.forEach(fan => this.drawStreaker(ctx, fan));

    // 8. Draw Players
    state.players.forEach(player => this.drawPlayer(ctx, player, state));

    // 9. Draw Balls
    state.balls.forEach(ball => this.drawBall(ctx, ball, state));

    // 10. Draw Particles
    this.drawParticles(ctx, state);

    // 11. Draw Floating Texts
    this.drawFloatingTexts(ctx, state);

    ctx.restore();
  }

  private static drawPitch(ctx: CanvasRenderingContext2D, state: MatchEngineState) {
    const world = state.stadiumWorld || 'classic';
    const stripeWidth = 100;
    const count = 12;

    if (world === 'death_star') {
      // Space Arena background outside pitch with sparkling stars
      ctx.fillStyle = '#030712';
      ctx.fillRect(0, 0, 1200, 700);

      // Stars
      ctx.fillStyle = '#ffffff';
      for (let s = 0; s < 50; s++) {
        const sx = (s * 97) % 1200;
        const sy = (s * 53) % 700;
        ctx.fillRect(sx, sy, (s % 4 === 0) ? 2.5 : 1.5, (s % 4 === 0) ? 2.5 : 1.5);
      }

      // Metallic Imperial floor
      for (let i = 0; i < count; i++) {
        ctx.fillStyle = i % 2 === 0 ? '#0f172a' : '#1e293b';
        ctx.fillRect(i * stripeWidth, 75, stripeWidth, 550);
      }

      // Circular reactor core in center
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(600, 350, 120, 0, Math.PI * 2);
      ctx.stroke();

      // Imperial Superlaser concavity hint in corner
      ctx.fillStyle = 'rgba(16, 185, 129, 0.12)';
      ctx.beginPath();
      ctx.arc(600, 350, 45, 0, Math.PI * 2);
      ctx.fill();

    } else if (world === 'mustafar') {
      // Dark Volcanic Rock floor with rivers of glowing orange magma
      for (let i = 0; i < count; i++) {
        ctx.fillStyle = i % 2 === 0 ? '#18181b' : '#27272a';
        ctx.fillRect(i * stripeWidth, 0, stripeWidth, 700);
      }

      // Molten magma rivers cutting through the pitch
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.45)';
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(95, 130);
      ctx.bezierCurveTo(400, 80, 500, 190, 1105, 120);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(249, 115, 22, 0.6)';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(95, 130);
      ctx.bezierCurveTo(400, 80, 500, 190, 1105, 120);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(95, 570);
      ctx.bezierCurveTo(450, 620, 700, 510, 1105, 580);
      ctx.stroke();

      // Vignette with heat glow
      const grad = ctx.createRadialGradient(600, 350, 180, 600, 350, 700);
      grad.addColorStop(0, 'rgba(239, 68, 68, 0.08)');
      grad.addColorStop(1, 'rgba(153, 27, 27, 0.4)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1200, 700);

    } else if (world === 'hoth') {
      // Glacial ice & snow field
      for (let i = 0; i < count; i++) {
        ctx.fillStyle = i % 2 === 0 ? '#e0f2fe' : '#bae6fd';
        ctx.fillRect(i * stripeWidth, 0, stripeWidth, 700);
      }

      // Frost crystalline sheen
      const grad = ctx.createLinearGradient(0, 0, 1200, 700);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
      grad.addColorStop(0.5, 'rgba(186, 230, 253, 0.12)');
      grad.addColorStop(1, 'rgba(125, 211, 252, 0.25)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1200, 700);

      // AT-AT silhouettes in the distance (top edge)
      ctx.fillStyle = 'rgba(71, 85, 105, 0.35)';
      // Mini AT-AT walker 1
      ctx.fillRect(160, 18, 32, 18);
      ctx.fillRect(156, 22, 10, 8);
      ctx.fillRect(164, 36, 4, 18);
      ctx.fillRect(184, 36, 4, 18);
      // Mini AT-AT walker 2
      ctx.fillRect(960, 18, 36, 20);
      ctx.fillRect(954, 22, 12, 9);
      ctx.fillRect(966, 38, 4, 18);
      ctx.fillRect(988, 38, 4, 18);

    } else if (world === 'tatooine') {
      // Desert sand dunes with twin suns
      for (let i = 0; i < count; i++) {
        ctx.fillStyle = i % 2 === 0 ? '#d97706' : '#b45309';
        ctx.fillRect(i * stripeWidth, 0, stripeWidth, 700);
      }

      // Sand waves
      ctx.strokeStyle = 'rgba(254, 243, 199, 0.25)';
      ctx.lineWidth = 3;
      for (let line = 120; line <= 580; line += 100) {
        ctx.beginPath();
        ctx.moveTo(95, line);
        ctx.bezierCurveTo(400, line - 15, 800, line + 15, 1105, line);
        ctx.stroke();
      }

      // Twin suns in top right
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(1040, 36, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f87171';
      ctx.beginPath();
      ctx.arc(1070, 44, 12, 0, Math.PI * 2);
      ctx.fill();

    } else if (world === 'cyberpunk') {
      // Synthwave dark purple with neon grid
      for (let i = 0; i < count; i++) {
        ctx.fillStyle = i % 2 === 0 ? '#180828' : '#240d3d';
        ctx.fillRect(i * stripeWidth, 0, stripeWidth, 700);
      }

      // Horizontal cyber grid
      ctx.strokeStyle = 'rgba(236, 72, 153, 0.15)';
      ctx.lineWidth = 1;
      for (let y = 75; y <= 625; y += 40) {
        ctx.beginPath();
        ctx.moveTo(95, y);
        ctx.lineTo(1105, y);
        ctx.stroke();
      }

    } else {
      // Classic green turf stripes
      for (let i = 0; i < count; i++) {
        ctx.fillStyle = i % 2 === 0 ? '#1b8a3e' : '#157333';
        ctx.fillRect(i * stripeWidth, 0, stripeWidth, 700);
      }

      const grad = ctx.createRadialGradient(600, 350, 200, 600, 350, 750);
      grad.addColorStop(0, 'rgba(0,0,0,0)');
      grad.addColorStop(1, 'rgba(0,0,0,0.3)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1200, 700);
    }
  }

  private static drawAdBoards(ctx: CanvasRenderingContext2D, state: MatchEngineState) {
    const isStarWars =
      state.stadiumWorld === 'death_star' ||
      state.stadiumWorld === 'mustafar' ||
      state.stadiumWorld === 'hoth' ||
      state.stadiumWorld === 'tatooine' ||
      state.homeTeam.id.startsWith('star_wars') ||
      state.awayTeam.id.startsWith('star_wars');

    const ads = isStarWars
      ? [
          'ВСТУПАЙ В ИМПЕРИЮ: ШТУРМОВИКАМ СКИДКА НА ОЧКИ 🥽',
          'ЛАВКА УОТТО: ЗАПЧАСТИ ДЛЯ СОКОЛА ТЫСЯЧЕЛЕТИЯ 🚀',
          'ТАКОЙ ПУТЬ: БЕСКАРСКИЕ ЩИТКИ НА НОГИ 🛡️',
          'ЗВЕЗДА СМЕРТИ: СУПЕРЛАЗЕР ПРЯМО В ДЕВЯТКУ 🌌',
          'МАГИСТР ЙОДА: РЕШИ ПРИМЕР = СИЛУ ОБРЕТИ 🧮',
          'СВЕТОВЫЕ МЕЧИ ВМЕСТО УГЛОВЫХ ФЛАЖКОВ ⚔️',
          'ЧУБАККА: ВЫХОД ОДИН НА ОДИН — НЕ РЕКОМЕНДУЕТСЯ 🦍',
        ]
      : [
          'EA SPORTS: IT\'S IN THE SCAM',
          'КУПИТЕ НОГИ ЗА $9.99 💳',
          'ШАУРМА У АШОТА: СКИДКА ЗА ПЕНАЛЬТИ 🌯',
          'МАГУАЙР — ЛУЧШИЙ НАПАДАЮЩИЙ СОПЕРНИКА 🗿',
          'ВУВУЗЕЛЫ В ИПОТЕКУ 🎺',
          'СУДЬЯ КУПЛЕН, МАТЧ СДАН 👨‍🦯',
          'BUY FC POINTS OR CRY 😢',
        ];

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(50, 10, 1100, 48);

    ctx.strokeStyle = isStarWars ? '#f59e0b' : '#38bdf8';
    ctx.lineWidth = 2;
    ctx.strokeRect(50, 10, 1100, 48);

    ctx.font = 'bold 12px "Montserrat", sans-serif';
    ctx.textAlign = 'center';

    const segmentW = 1100 / ads.length;
    ads.forEach((ad, idx) => {
      const x = 50 + idx * segmentW + segmentW / 2;
      ctx.fillStyle = idx % 2 === 0 ? '#facc15' : (isStarWars ? '#38bdf8' : '#38bdf8');
      ctx.fillText(ad, x, 38);

      // Separator
      ctx.strokeStyle = '#334155';
      ctx.beginPath();
      ctx.moveTo(50 + (idx + 1) * segmentW, 12);
      ctx.lineTo(50 + (idx + 1) * segmentW, 56);
      ctx.stroke();
    });
  }

  private static drawPitchLines(ctx: CanvasRenderingContext2D, state: MatchEngineState) {
    ctx.save();
    const world = state.stadiumWorld || 'classic';
    let lineColor = 'rgba(255, 255, 255, 0.85)';
    if (world === 'death_star') lineColor = 'rgba(56, 189, 248, 0.9)'; // Neon cyan
    else if (world === 'mustafar') lineColor = 'rgba(248, 113, 113, 0.9)'; // Molten red
    else if (world === 'hoth') lineColor = 'rgba(14, 165, 233, 0.85)'; // Deep ice blue
    else if (world === 'tatooine') lineColor = 'rgba(254, 240, 138, 0.9)'; // Warm sand yellow
    else if (world === 'cyberpunk') lineColor = 'rgba(244, 63, 94, 0.9)'; // Neon pink

    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 4;

    // Outer Boundary (75 to 625, 95 to 1105)
    ctx.strokeRect(95, 75, 1010, 550);

    // Halfway Line
    ctx.beginPath();
    ctx.moveTo(600, 75);
    ctx.lineTo(600, 625);
    ctx.stroke();

    // Center Circle (radius 85)
    ctx.beginPath();
    ctx.arc(600, 350, 85, 0, Math.PI * 2);
    ctx.stroke();

    // Center Spot
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(600, 350, 5, 0, Math.PI * 2);
    ctx.fill();

    // Left Penalty Box (x = 95 to 260, y = 190 to 510)
    ctx.strokeRect(95, 190, 165, 320);
    // Left Goal Area
    ctx.strokeRect(95, 260, 60, 180);
    // Left Penalty Spot
    ctx.beginPath();
    ctx.arc(205, 350, 4, 0, Math.PI * 2);
    ctx.fill();
    // Left Penalty Arc
    ctx.beginPath();
    ctx.arc(205, 350, 60, -0.65, 0.65);
    ctx.stroke();

    // Right Penalty Box (x = 940 to 1105, y = 190 to 510)
    ctx.strokeRect(940, 190, 165, 320);
    // Right Goal Area
    ctx.strokeRect(1045, 260, 60, 180);
    // Right Penalty Spot
    ctx.beginPath();
    ctx.arc(995, 350, 4, 0, Math.PI * 2);
    ctx.fill();
    // Right Penalty Arc
    ctx.beginPath();
    ctx.arc(995, 350, 60, Math.PI - 0.65, Math.PI + 0.65);
    ctx.stroke();

    // Corner Arcs
    const corners = [
      { x: 95, y: 75, sa: 0, ea: Math.PI / 2 },
      { x: 1105, y: 75, sa: Math.PI / 2, ea: Math.PI },
      { x: 95, y: 625, sa: -Math.PI / 2, ea: 0 },
      { x: 1105, y: 625, sa: Math.PI, ea: -Math.PI / 2 },
    ];
    corners.forEach(c => {
      ctx.beginPath();
      ctx.arc(c.x, c.y, 18, c.sa, c.ea);
      ctx.stroke();
    });

    ctx.restore();
  }

  private static drawGoalNets(ctx: CanvasRenderingContext2D, state: MatchEngineState) {
    ctx.save();
    const world = state.stadiumWorld || 'classic';
    let postColor = '#ffffff';
    let netBg = 'rgba(255, 255, 255, 0.12)';
    let netLine = 'rgba(255, 255, 255, 0.6)';

    if (world === 'death_star') {
      postColor = '#38bdf8';
      netBg = 'rgba(56, 189, 248, 0.15)';
      netLine = 'rgba(56, 189, 248, 0.7)';
    } else if (world === 'mustafar') {
      postColor = '#ef4444';
      netBg = 'rgba(239, 68, 68, 0.18)';
      netLine = 'rgba(249, 115, 22, 0.7)';
    } else if (world === 'hoth') {
      postColor = '#7dd3fc';
      netBg = 'rgba(224, 242, 254, 0.25)';
      netLine = 'rgba(14, 165, 233, 0.7)';
    } else if (world === 'cyberpunk') {
      postColor = '#ec4899';
      netBg = 'rgba(236, 72, 153, 0.15)';
      netLine = 'rgba(6, 182, 212, 0.7)';
    }

    // Left Goal Net (x = 35 to 95, y = 270 to 430)
    ctx.fillStyle = netBg;
    ctx.fillRect(35, 270, 60, 160);

    ctx.strokeStyle = netLine;
    ctx.lineWidth = 1.5;
    // Net grid left
    for (let x = 35; x <= 95; x += 12) {
      ctx.beginPath();
      ctx.moveTo(x, 270);
      ctx.lineTo(x, 430);
      ctx.stroke();
    }
    for (let y = 270; y <= 430; y += 12) {
      ctx.beginPath();
      ctx.moveTo(35, y);
      ctx.lineTo(95, y);
      ctx.stroke();
    }

    // Left Goal Posts
    ctx.strokeStyle = postColor;
    ctx.lineWidth = 6;
    ctx.strokeRect(35, 270, 60, 160);

    // Right Goal Net (x = 1105 to 1165, y = 270 to 430)
    ctx.fillStyle = netBg;
    ctx.fillRect(1105, 270, 60, 160);

    ctx.strokeStyle = netLine;
    ctx.lineWidth = 1.5;
    // Net grid right
    for (let x = 1105; x <= 1165; x += 12) {
      ctx.beginPath();
      ctx.moveTo(x, 270);
      ctx.lineTo(x, 430);
      ctx.stroke();
    }
    for (let y = 270; y <= 430; y += 12) {
      ctx.beginPath();
      ctx.moveTo(1105, y);
      ctx.lineTo(1165, y);
      ctx.stroke();
    }

    // Right Goal Posts
    ctx.strokeStyle = postColor;
    ctx.lineWidth = 6;
    ctx.strokeRect(1105, 270, 60, 160);

    ctx.restore();
  }

  private static drawPlayerShadow(ctx: CanvasRenderingContext2D, p: PitchPlayer) {
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(p.x, p.y + 14, 16, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  private static drawBallShadow(ctx: CanvasRenderingContext2D, b: SoccerBall) {
    ctx.save();
    const shadowSize = Math.max(4, b.radius - b.z * 0.3);
    const shadowAlpha = Math.max(0.1, 0.4 - b.z * 0.015);
    ctx.fillStyle = `rgba(0, 0, 0, ${shadowAlpha})`;
    ctx.beginPath();
    ctx.ellipse(b.x, b.y + b.z * 0.5 + 4, shadowSize * 1.3, shadowSize * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  private static drawPlayer(ctx: CanvasRenderingContext2D, p: PitchPlayer, state: MatchEngineState) {
    ctx.save();
    ctx.translate(p.x, p.y);

    // Controlled Player Marker (Golden glowing ring, arrow, name & stamina)
    if (p.isControlled) {
      ctx.save();
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(0, 16, 24, 10, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Stamina mini-bar under feet
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(-16, 22, 32, 4);
      const stamWidth = Math.max(0, Math.min(32, (p.stamina / 100) * 32));
      ctx.fillStyle = p.stamina > 30 ? '#22c55e' : '#ef4444';
      ctx.fillRect(-16, 22, stamWidth, 4);

      // Bouncing Arrow Indicator above head
      const bounce = Math.sin(Date.now() * 0.008) * 4;
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.moveTo(0, -48 + bounce);
      ctx.lineTo(-9, -61 + bounce);
      ctx.lineTo(9, -61 + bounce);
      ctx.closePath();
      ctx.fill();

      // Name & Number Tag
      ctx.font = 'bold 11px "Montserrat", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillText(`${p.name} #${p.number}`, 1, -67 + bounce);
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`${p.name} #${p.number}`, 0, -68 + bounce);
      ctx.restore();
    } else if (p.id === state.nextSwitchPlayerId && p.team === 'home') {
      // Secondary Switch Target Marker [Q / Tab] (Translucent Cyan Cursor)
      ctx.save();
      const bounce = Math.sin(Date.now() * 0.008 + 1) * 3;
      ctx.fillStyle = 'rgba(56, 189, 248, 0.85)';
      ctx.beginPath();
      ctx.moveTo(0, -44 + bounce);
      ctx.lineTo(-6, -53 + bounce);
      ctx.lineTo(6, -53 + bounce);
      ctx.closePath();
      ctx.fill();

      // Key prompt badge [Q]
      ctx.font = 'bold 9px "Montserrat", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#000000';
      ctx.fillText('[Q]', 1, -57 + bounce);
      ctx.fillStyle = '#38bdf8';
      ctx.fillText('[Q]', 0, -58 + bounce);
      ctx.restore();
    }

    // Rotation if rolling / Neymar diving
    if (p.isRolling) {
      ctx.rotate(p.rollAngle);
    } else if (p.isSliding) {
      ctx.rotate(p.slideAngle + Math.PI / 2);
    }

    const teamCfg = p.team === 'home' ? state.homeTeam : state.awayTeam;
    const isGK = p.role === 'goalkeeper';
    const jerseyPrimary = isGK ? (p.team === 'home' ? '#f59e0b' : '#10b981') : teamCfg.primaryColor;
    const jerseySecondary = isGK ? '#000000' : teamCfg.secondaryColor;

    // Legs animation
    const isMoving = Math.hypot(p.vx, p.vy) > 0.4;
    const legOffset = isMoving ? Math.sin(p.limbsWobble) * 9 : 0;

    // Left Leg
    ctx.fillStyle = jerseySecondary;
    ctx.fillRect(-9, 0 + legOffset, 6, 14);
    // Left Boot
    ctx.fillStyle = '#000000';
    ctx.fillRect(-10, 12 + legOffset, 8, 4);

    // Right Leg
    ctx.fillStyle = jerseySecondary;
    ctx.fillRect(3, 0 - legOffset, 6, 14);
    // Right Boot
    ctx.fillStyle = '#000000';
    ctx.fillRect(2, 12 - legOffset, 8, 4);

    // Torso (Jersey)
    ctx.fillStyle = jerseyPrimary;
    ctx.beginPath();
    ctx.roundRect(-14, -18, 28, 22, 5);
    ctx.fill();

    // Iconic Blaugrana stripes for Barcelona!
    if (!isGK && teamCfg.id === 'blue_barca') {
      ctx.fillStyle = teamCfg.secondaryColor; // Garnet red stripes
      ctx.fillRect(-7, -18, 4.5, 22);
      ctx.fillRect(2.5, -18, 4.5, 22);
    }

    ctx.strokeStyle = isGK ? '#ffffff' : teamCfg.accentColor;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Jersey Number on back/chest
    ctx.fillStyle = jerseySecondary;
    ctx.font = 'bold 9px "Montserrat", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(p.number.toString(), 0, -4);

    // Arms
    ctx.fillStyle = jerseyPrimary;
    const armSwing = isMoving ? Math.cos(p.limbsWobble) * 6 : 0;
    ctx.fillRect(-18, -16 + armSwing, 5, 12);
    ctx.fillRect(13, -16 - armSwing, 5, 12);

    // Hands (GK Gloves or Skin)
    if (isGK) {
      ctx.fillStyle = '#ffffff'; // Goalkeeper big white gloves!
      ctx.beginPath();
      ctx.arc(-15.5, -3 + armSwing, 4.5, 0, Math.PI * 2);
      ctx.arc(15.5, -3 - armSwing, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1;
      ctx.stroke();
    } else {
      ctx.fillStyle = p.skinColor;
      ctx.beginPath();
      ctx.arc(-15.5, -3 + armSwing, 3, 0, Math.PI * 2);
      ctx.arc(15.5, -3 - armSwing, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Oversized Caricature Bobble Head or Star Wars Helmet
    ctx.save();
    ctx.translate(0, -28);

    const nameLower = p.name.toLowerCase();
    const isVader = nameLower.includes('вейдер') || nameLower.includes('vader');
    const isYoda = nameLower.includes('йода') || nameLower.includes('yoda');
    const isStormtrooper = nameLower.includes('штурмовик') || nameLower.includes('stormtrooper');
    const isChewbacca = nameLower.includes('чубакка') || nameLower.includes('вуки');
    const isMandalorian = nameLower.includes('мандалорец') || nameLower.includes('mandalorian');
    const isPalpatine = nameLower.includes('палпатин') || nameLower.includes('император');
    const isR2D2 = nameLower.includes('r2-d2') || nameLower.includes('астродроид');

    if (isVader) {
      // Darth Vader Sith Helmet
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(0, -2, 14, 0, Math.PI * 2);
      ctx.fill();
      // Flared brim
      ctx.fillRect(-17, 1, 34, 5);
      // Dark triangular mask & grille
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(-7, 2);
      ctx.lineTo(7, 2);
      ctx.lineTo(0, 11);
      ctx.closePath();
      ctx.fill();
      // Red sinister eyes
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-6, -2, 4, 3);
      ctx.fillRect(2, -2, 4, 3);
    } else if (isYoda) {
      // Master Yoda: Green pointy ears & head
      ctx.fillStyle = '#84cc16';
      ctx.beginPath();
      ctx.arc(0, 1, 11, 0, Math.PI * 2);
      ctx.fill();
      // Left pointy ear
      ctx.beginPath();
      ctx.moveTo(-8, 0);
      ctx.lineTo(-24, -4);
      ctx.lineTo(-8, 7);
      ctx.closePath();
      ctx.fill();
      // Right pointy ear
      ctx.beginPath();
      ctx.moveTo(8, 0);
      ctx.lineTo(24, -4);
      ctx.lineTo(8, 7);
      ctx.closePath();
      ctx.fill();
      // Wise Yoda eyes
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(-4, 0, 2.5, 0, Math.PI * 2);
      ctx.arc(4, 0, 2.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (isStormtrooper) {
      // White Imperial Stormtrooper Helmet
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, -1, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1;
      ctx.stroke();
      // Black Brow Line
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-11, -5, 22, 3);
      // Black Visor lenses
      ctx.beginPath();
      ctx.arc(-5, 0, 3, 0, Math.PI * 2);
      ctx.arc(5, 0, 3, 0, Math.PI * 2);
      ctx.fill();
      // Aerator grill
      ctx.fillStyle = '#475569';
      ctx.fillRect(-4, 6, 8, 4);
    } else if (isChewbacca) {
      // Chewbacca Wookiee Fur Head
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#92400e';
      ctx.fillRect(-15, -4, 4, 10);
      ctx.fillRect(11, -4, 4, 10);
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(-4, -2, 2, 0, Math.PI * 2);
      ctx.arc(4, -2, 2, 0, Math.PI * 2);
      ctx.arc(0, 3, 3, 0, Math.PI * 2);
      ctx.fill();
    } else if (isMandalorian) {
      // Mandalorian Beskar Helmet with T-Visor
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.arc(0, -1, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#475569';
      ctx.stroke();
      ctx.fillStyle = '#020617';
      ctx.fillRect(-9, -2, 18, 4);
      ctx.fillRect(-2, -2, 4, 12);
    } else if (isR2D2) {
      // R2-D2 Astromech Dome
      ctx.fillStyle = '#cbd5e1';
      ctx.beginPath();
      ctx.arc(0, 2, 12, Math.PI, Math.PI * 2);
      ctx.lineTo(12, 10);
      ctx.lineTo(-12, 10);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(-10, 0, 20, 3);
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(0, -3, 2.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (isPalpatine) {
      // Dark Sith Cowl
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(0, -3, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#cbd5e1';
      ctx.beginPath();
      ctx.arc(0, 1, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#facc15';
      ctx.fillRect(-4, 0, 3, 2);
      ctx.fillRect(2, 0, 3, 2);
    } else {
      // Default Caricature Bobble Head
      // Hair
      ctx.fillStyle = p.hairColor;
      ctx.beginPath();
      ctx.arc(0, -2, 14, Math.PI, Math.PI * 2);
      ctx.fill();

      // Head circle
      ctx.fillStyle = p.skinColor;
      ctx.beginPath();
      ctx.arc(0, 0, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Funny Eyes
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-4, -1, 3.5, 0, Math.PI * 2);
      ctx.arc(4, -1, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Pupils (looking towards movement direction)
      const lookX = p.vx !== 0 ? Math.sign(p.vx) * 1.5 : (p.team === 'home' ? 1.5 : -1.5);
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(-4 + lookX, -1, 1.8, 0, Math.PI * 2);
      ctx.arc(4 + lookX, -1, 1.8, 0, Math.PI * 2);
      ctx.fill();

      // Mouth
      ctx.strokeStyle = '#991b1b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      if (p.isNeymarSimulating || p.isRolling) {
        ctx.fillStyle = '#7f1d1d';
        ctx.arc(0, 6, 4, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.arc(0, 4, 3, 0, Math.PI);
        ctx.stroke();
      }
    }

    ctx.restore();

    ctx.restore();
  }

  private static drawReferee(ctx: CanvasRenderingContext2D, state: MatchEngineState) {
    const ref = state.referee;
    ctx.save();
    ctx.translate(ref.x, ref.y);

    // Ref Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 14, 15, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Striped Shirt (Black and Yellow)
    ctx.fillStyle = '#eab308';
    ctx.fillRect(-12, -18, 24, 20);
    ctx.fillStyle = '#000000';
    ctx.fillRect(-8, -18, 4, 20);
    ctx.fillRect(0, -18, 4, 20);
    ctx.fillRect(8, -18, 4, 20);

    // Legs
    ctx.fillStyle = '#000000';
    ctx.fillRect(-7, 2, 5, 12);
    ctx.fillRect(2, 2, 5, 12);

    // Head
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(0, -26, 11, 0, Math.PI * 2);
    ctx.fill();

    // BLINDFOLD over eyes ("СЛЕПОЙ СУДЬЯ")
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(-11, -29, 22, 6);

    // Whistle in mouth
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(-2, -20, 6, 3);

    // Card drawn in hand
    if (ref.cardDrawn === 'yellow') {
      ctx.fillStyle = '#facc15';
      ctx.fillRect(12, -38, 10, 16);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.strokeRect(12, -38, 10, 16);
    } else if (ref.cardDrawn === 'red') {
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(12, -38, 10, 16);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.strokeRect(12, -38, 10, 16);
    }

    ctx.restore();
  }

  private static drawBall(ctx: CanvasRenderingContext2D, ball: SoccerBall) {
    ctx.save();
    // Render ball at height z
    ctx.translate(ball.x, ball.y - ball.z);
    ctx.rotate(ball.rotation);

    // Motion Trail
    if (ball.trail.length > 0) {
      ctx.save();
      ball.trail.forEach(pt => {
        ctx.fillStyle = `rgba(250, 204, 21, ${pt.alpha * 0.4})`;
        ctx.beginPath();
        ctx.arc(pt.x - ball.x, pt.y - (ball.y - ball.z), ball.radius * 0.7, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
    }

    if (ball.type === 'cube') {
      // 3D Cube Ball
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-ball.radius, -ball.radius, ball.radius * 2, ball.radius * 2);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.strokeRect(-ball.radius, -ball.radius, ball.radius * 2, ball.radius * 2);
      ctx.fillStyle = '#000000';
      ctx.fillRect(-4, -4, 8, 8);
    } else if (ball.type === 'watermelon') {
      // Watermelon
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.arc(0, 0, ball.radius, 0, Math.PI * 2);
      ctx.fill();
      // Stripes
      ctx.strokeStyle = '#14532d';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, ball.radius - 2, 0.4, 2.7);
      ctx.stroke();
    } else if (ball.type === 'bowling') {
      // Bowling Ball
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(0, 0, ball.radius, 0, Math.PI * 2);
      ctx.fill();
      // Holes
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-3, -4, 2, 0, Math.PI * 2);
      ctx.arc(3, -4, 2, 0, Math.PI * 2);
      ctx.arc(0, 2, 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (ball.type === 'death_star') {
      // Death Star Ball (Imperial Grey, equatorial trench, green superlaser lens)
      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.arc(0, 0, ball.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Equatorial trench
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-ball.radius, 0);
      ctx.lineTo(ball.radius, 0);
      ctx.stroke();

      // Superlaser dish concavity
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.arc(4, -5, 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#10b981'; // Green superlaser eye
      ctx.beginPath();
      ctx.arc(4, -5, 2.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (ball.type === 'lightsaber') {
      // Lightsaber Plasma Ball (Cyan & Red energy swirl)
      const grad = ctx.createRadialGradient(0, 0, 2, 0, 0, ball.radius);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.5, '#38bdf8');
      grad.addColorStop(1, '#ef4444');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, ball.radius, 0, Math.PI * 2);
      ctx.fill();

      // Energy sparks
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, ball.radius * 0.7, 0, Math.PI);
      ctx.stroke();
    } else {
      // Standard Soccer Ball
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, ball.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Pentagons
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(0, 0, ball.radius * 0.38, 0, Math.PI * 2);
      ctx.fill();

      for (let i = 0; i < 5; i++) {
        const ang = (i * Math.PI * 2) / 5;
        const px = Math.cos(ang) * (ball.radius * 0.7);
        const py = Math.sin(ang) * (ball.radius * 0.7);
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  private static drawParticles(ctx: CanvasRenderingContext2D, state: MatchEngineState) {
    state.particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  private static drawFloatingTexts(ctx: CanvasRenderingContext2D, state: MatchEngineState) {
    state.floatingTexts.forEach(ft => {
      ctx.save();
      ctx.font = `900 ${ft.fontSize}px "Montserrat", sans-serif`;
      ctx.textAlign = 'center';
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.9)';
      ctx.lineWidth = 3;
      ctx.strokeText(ft.text, ft.x, ft.y);
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    });
  }

  private static drawDog(ctx: CanvasRenderingContext2D, dog: PitchDog) {
    ctx.save();
    ctx.translate(dog.x, dog.y);

    // Flip if moving left
    if (dog.vx < 0) {
      ctx.scale(-1, 1);
    }

    // Shadow
    ctx.beginPath();
    ctx.ellipse(0, 8, 14, 6, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fill();

    // Dog body emoji or cartoon
    ctx.font = '24px "Apple Color Emoji", "Segoe UI Emoji", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🐕', 0, -4);

    // Name tag
    ctx.font = 'bold 9px "Montserrat", sans-serif';
    ctx.fillStyle = '#fbbf24';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.strokeText('Барбос 🐾', 0, -20);
    ctx.fillText('Барбос 🐾', 0, -20);

    ctx.restore();
  }

  private static drawStreaker(ctx: CanvasRenderingContext2D, fan: PitchFan) {
    ctx.save();
    ctx.translate(fan.x, fan.y);

    // Shadow
    ctx.beginPath();
    ctx.ellipse(0, 10, 12, 5, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fill();

    // Funny streaker: underwear body
    ctx.font = '22px "Apple Color Emoji", "Segoe UI Emoji", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🩲🏃‍♂️', 0, -6);

    // Label
    ctx.font = 'bold 9px "Montserrat", sans-serif';
    ctx.fillStyle = '#ec4899';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.strokeText(fan.name, 0, -22);
    ctx.fillText(fan.name, 0, -22);

    ctx.restore();
  }
}
