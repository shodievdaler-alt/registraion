import { 
  Warrior, 
  Zombie, 
  Projectile, 
  Particle, 
  FloatingText, 
  Castle,
  DimensionType,
  SkinType,
  Obstacle,
  ObstacleType
} from '../types';

export class GameRenderer {
  private ctx: CanvasRenderingContext2D;
  private width: number = 1200;
  private height: number = 600;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  public setSize(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  public render(
    time: number,
    castle: Castle,
    warriors: Warrior[],
    zombies: Zombie[],
    obstacles: Obstacle[] = [],
    projectiles: Projectile[] = [],
    particles: Particle[] = [],
    floatingTexts: FloatingText[] = [],
    fireRainTarget: { x: number; y: number } | null = null,
    isFreezeActive: boolean = false,
    screenShake: number = 0,
    dimension: DimensionType = 'inamorta',
    activeSkin: SkinType = 'classic',
    activeObstacleAim: ObstacleType | null = null,
    aimPos: { x: number; y: number } | null = null
  ) {
    const ctx = this.ctx;
    ctx.save();

    // Apply screen shake if active
    if (screenShake > 0) {
      const shakeX = (Math.random() - 0.5) * screenShake * 8;
      const shakeY = (Math.random() - 0.5) * screenShake * 8;
      ctx.translate(shakeX, shakeY);
    }

    // 1. Clear background
    ctx.clearRect(0, 0, this.width, this.height);

    // 2. Draw Sky & Atmosphere (Inamorta vs Multiverse)
    this.drawSky(time, dimension);

    // 3. Draw Parallax Backdrop (Mountains / Cyberpunk Stark Towers)
    this.drawParallaxBackdrop(time, dimension);

    // 4. Draw Ground, Road & Environment Props
    this.drawBattlefield(time, dimension);

    // 5. Draw Castle / Stark Citadel (Left side)
    this.drawCastle(castle, time, dimension);

    // 6. Draw Dimensional Portal (Right side)
    this.drawDimensionalPortal(time, dimension);

    // 6b. Draw Ground Obstacles (Trenches & Landmines)
    for (const obs of obstacles) {
      if (obs.type === 'trench' || obs.type === 'landmine') {
        this.drawObstacle(obs, time);
      }
    }

    // 7. Draw Warriors, Zombies & Standing Obstacles (Barricades) (sorted by Y for correct isometric depth)
    const allEntities = [
      ...warriors.map(w => ({ type: 'warrior' as const, entity: w, y: w.y })),
      ...zombies.map(z => ({ type: 'zombie' as const, entity: z, y: z.y })),
      ...obstacles.filter(o => o.type === 'barricade').map(o => ({ type: 'obstacle' as const, entity: o, y: o.y }))
    ].sort((a, b) => a.y - b.y);

    for (const item of allEntities) {
      if (item.type === 'warrior') {
        this.drawWarrior(item.entity as Warrior, time, activeSkin);
      } else if (item.type === 'zombie') {
        this.drawZombie(item.entity as Zombie, time);
      } else {
        this.drawObstacle(item.entity as Obstacle, time);
      }
    }

    // 8. Draw Projectiles
    this.drawProjectiles(projectiles);

    // 9. Draw Particles (Sparks, explosions, blood, magic, lasers, portals)
    this.drawParticles(particles);

    // 10. Draw Floating Texts (Damage numbers, gold popups)
    this.drawFloatingTexts(floatingTexts);

    // 11. Draw Freeze Weather Effect
    if (isFreezeActive) {
      this.drawFreezeOverlay(time);
    }

    // 12. Draw Fire Rain Reticle if aiming
    if (fireRainTarget) {
      this.drawFireRainReticle(fireRainTarget, time);
    }

    // 13. Draw Obstacle Placement Preview if aiming
    if (activeObstacleAim && aimPos) {
      this.drawObstaclePlacementPreview(activeObstacleAim, aimPos, time);
    }

    ctx.restore();
  }

  // ==================== BACKGROUND RENDERING ====================

  private drawSky(time: number, dimension: DimensionType) {
    const ctx = this.ctx;

    if (dimension === 'star_wars') {
      // 🌌 Deep Space & Death Star (Звезда Смерти) & Tatooine Twin Suns
      const skyGrad = ctx.createLinearGradient(0, 0, 0, this.height * 0.75);
      skyGrad.addColorStop(0, '#020308');
      skyGrad.addColorStop(0.5, '#050b18');
      skyGrad.addColorStop(1, '#1e1b4b');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, this.width, this.height);

      // Deep space stars
      for (let i = 0; i < 60; i++) {
        const sx = (i * 67 + 23) % this.width;
        const sy = (i * 41 + 17) % (this.height * 0.6);
        const tw = (Math.sin(time * 3 + i) + 1) * 0.5;
        ctx.fillStyle = `rgba(255, 255, 255, ${0.4 + tw * 0.6})`;
        ctx.beginPath();
        ctx.arc(sx, sy, (i % 3 === 0) ? 1.8 : 1.0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Death Star (Звезда Смерти) in orbit
      const dsX = this.width * 0.65;
      const dsY = this.height * 0.22;
      const dsRadius = 65;

      const dsGrad = ctx.createRadialGradient(dsX - 20, dsY - 20, 10, dsX, dsY, dsRadius);
      dsGrad.addColorStop(0, '#94a3b8');
      dsGrad.addColorStop(0.65, '#475569');
      dsGrad.addColorStop(1, '#1e293b');
      ctx.fillStyle = dsGrad;
      ctx.beginPath();
      ctx.arc(dsX, dsY, dsRadius, 0, Math.PI * 2);
      ctx.fill();

      // Equatorial Trench
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(dsX, dsY, dsRadius, -Math.PI * 0.08, Math.PI * 1.08);
      ctx.stroke();

      // Superlaser Dish
      const dishX = dsX - 18;
      const dishY = dsY - 22;
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.arc(dishX, dishY, 15, 0, Math.PI * 2);
      ctx.fill();

      // Superlaser focus green glow
      const laserPulse = (Math.sin(time * 4) + 1) * 0.5;
      ctx.fillStyle = `rgba(34, 197, 94, ${0.4 + laserPulse * 0.5})`;
      ctx.beginPath();
      ctx.arc(dishX, dishY, 5 + laserPulse * 3, 0, Math.PI * 2);
      ctx.fill();

      // Tatooine Twin Suns
      const sun1X = this.width * 0.22;
      const sun1Y = this.height * 0.18;
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(sun1X, sun1Y, 18, 0, Math.PI * 2);
      ctx.fill();

      const sun2X = sun1X + 38;
      const sun2Y = sun1Y + 10;
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(sun2X, sun2Y, 12, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    if (dimension === 'mustafar') {
      // 🌋 Mustafar Volcanic Dark Lava Sky
      const skyGrad = ctx.createLinearGradient(0, 0, 0, this.height * 0.75);
      skyGrad.addColorStop(0, '#1c0505');
      skyGrad.addColorStop(0.4, '#450a0a');
      skyGrad.addColorStop(0.8, '#7f1d1d');
      skyGrad.addColorStop(1, '#b91c1c');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, this.width, this.height);

      // Ash clouds & volcanic embers
      for (let i = 0; i < 35; i++) {
        const ex = (i * 73 + time * 25) % this.width;
        const ey = (i * 47 - time * 15 + this.height) % (this.height * 0.65);
        ctx.fillStyle = i % 2 === 0 ? '#f97316' : '#ef4444';
        ctx.beginPath();
        ctx.arc(ex, ey, 1.5 + (i % 2), 0, Math.PI * 2);
        ctx.fill();
      }
      return;
    }

    if (dimension === 'hoth') {
      // ❄️ Hoth Blizzard Ice Sky
      const skyGrad = ctx.createLinearGradient(0, 0, 0, this.height * 0.75);
      skyGrad.addColorStop(0, '#0c1a2e');
      skyGrad.addColorStop(0.4, '#164e63');
      skyGrad.addColorStop(0.8, '#0891b2');
      skyGrad.addColorStop(1, '#cffafe');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, this.width, this.height);

      // Snow particles
      for (let i = 0; i < 50; i++) {
        const sx = (i * 59 + time * 60) % this.width;
        const sy = (i * 37 + time * 40) % (this.height * 0.7);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.beginPath();
        ctx.arc(sx, sy, 1.2 + (i % 3) * 0.8, 0, Math.PI * 2);
        ctx.fill();
      }
      return;
    }

    if (dimension === 'cyberpunk') {
      // 🌆 Cyberpunk 2099 Neon Sky
      const skyGrad = ctx.createLinearGradient(0, 0, 0, this.height * 0.75);
      skyGrad.addColorStop(0, '#050510');
      skyGrad.addColorStop(0.5, '#1e0826');
      skyGrad.addColorStop(0.9, '#4c0519');
      skyGrad.addColorStop(1, '#831843');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, this.width, this.height);

      // Neon grid lines in sky
      ctx.strokeStyle = 'rgba(236, 72, 153, 0.2)';
      ctx.lineWidth = 1;
      for (let y = 30; y < this.height * 0.55; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(this.width, y);
        ctx.stroke();
      }
      return;
    }

    if (dimension === 'multiverse') {
      // 🌌 Cyber-Cosmic Multiverse Sky (Cybertron / Stark Quantum City)
      const skyGrad = ctx.createLinearGradient(0, 0, 0, this.height * 0.75);
      skyGrad.addColorStop(0, '#030712'); // Deep quantum void
      skyGrad.addColorStop(0.35, '#0c1a30'); // Electric navy
      skyGrad.addColorStop(0.7, '#1e1b4b'); // Cyber purple
      skyGrad.addColorStop(1, '#0f766e'); // Neon teal horizon
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, this.width, this.height);

      // Cybertron Twin Moons & Quantum Rift Nebula
      const moonX = this.width * 0.45;
      const moonY = this.height * 0.16;
      const moonGrad = ctx.createRadialGradient(moonX, moonY, 15, moonX, moonY, 70);
      moonGrad.addColorStop(0, '#38bdf8');
      moonGrad.addColorStop(0.4, 'rgba(14, 165, 233, 0.4)');
      moonGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = moonGrad;
      ctx.beginPath();
      ctx.arc(moonX, moonY, 70, 0, Math.PI * 2);
      ctx.fill();

      // Cyber Moon core
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.arc(moonX, moonY, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Smaller second moon
      ctx.fillStyle = '#e11d48';
      ctx.beginPath();
      ctx.arc(moonX + 90, moonY - 20, 14, 0, Math.PI * 2);
      ctx.fill();

      // Twinkling quantum stars & cosmic lines
      for (let i = 0; i < 40; i++) {
        const sx = (i * 47) % this.width;
        const sy = (i * 29) % (this.height * 0.45);
        const twinkle = (Math.sin(time * 3 + i) + 1) * 0.5;
        ctx.fillStyle = i % 2 === 0 ? `rgba(56, 189, 248, ${0.4 + twinkle * 0.6})` : `rgba(244, 63, 94, ${0.4 + twinkle * 0.6})`;
        ctx.beginPath();
        ctx.arc(sx, sy, 1 + (i % 2), 0, Math.PI * 2);
        ctx.fill();
      }
      return;
    }

    // 🏰 Classic Inamorta Twilight Sky
    const skyGrad = ctx.createLinearGradient(0, 0, 0, this.height * 0.7);
    skyGrad.addColorStop(0, '#0a0d1a'); // Dark cosmic indigo
    skyGrad.addColorStop(0.4, '#1b122c'); // Deep royal purple
    skyGrad.addColorStop(0.75, '#4a1525'); // Sunset crimson
    skyGrad.addColorStop(1, '#8a3324'); // Burning horizon ember
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, this.width, this.height);

    // Gothic full moon
    const moonX = this.width * 0.35;
    const moonY = this.height * 0.18;
    const moonGrad = ctx.createRadialGradient(moonX, moonY, 10, moonX, moonY, 65);
    moonGrad.addColorStop(0, '#fffbf0');
    moonGrad.addColorStop(0.5, '#fde68a');
    moonGrad.addColorStop(0.8, 'rgba(251, 191, 36, 0.2)');
    moonGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = moonGrad;
    ctx.beginPath();
    ctx.arc(moonX, moonY, 65, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fef3c7';
    ctx.beginPath();
    ctx.arc(moonX, moonY, 26, 0, Math.PI * 2);
    ctx.fill();

    // Subtle moon craters
    ctx.fillStyle = '#e2d39b';
    ctx.beginPath();
    ctx.arc(moonX - 7, moonY - 6, 5, 0, Math.PI * 2);
    ctx.arc(moonX + 8, moonY + 8, 7, 0, Math.PI * 2);
    ctx.arc(moonX + 11, moonY - 8, 4, 0, Math.PI * 2);
    ctx.fill();

    // Stars
    for (let i = 0; i < 35; i++) {
      const sx = (i * 53) % this.width;
      const sy = (i * 31) % (this.height * 0.4);
      const twinkle = (Math.sin(time * 2 + i) + 1) * 0.5;
      ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + twinkle * 0.7})`;
      ctx.beginPath();
      ctx.arc(sx, sy, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private drawParallaxBackdrop(time: number, dimension: DimensionType) {
    const ctx = this.ctx;
    const horizon = this.height * 0.58;

    if (dimension === 'star_wars') {
      // 🌌 Star Destroyer in Orbit & Tatooine Sand Dunes
      // Imperial Star Destroyer wedge silhouette
      const isdX = this.width * 0.42;
      const isdY = horizon - 150;
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(isdX, isdY);
      ctx.lineTo(isdX + 160, isdY - 45);
      ctx.lineTo(isdX + 160, isdY + 45);
      ctx.closePath();
      ctx.fill();
      // Command Bridge
      ctx.fillRect(isdX + 115, isdY - 60, 30, 18);
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(isdX + 120, isdY - 55, 20, 4);

      // Tatooine rolling sand dunes
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.moveTo(0, horizon);
      ctx.quadraticCurveTo(this.width * 0.25, horizon - 70, this.width * 0.5, horizon - 20);
      ctx.quadraticCurveTo(this.width * 0.75, horizon - 90, this.width, horizon - 30);
      ctx.lineTo(this.width, horizon);
      ctx.closePath();
      ctx.fill();

      // Moisture vaporators
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 2;
      for (let i = 0; i < 6; i++) {
        const vx = i * 190 + 60;
        ctx.beginPath();
        ctx.moveTo(vx, horizon);
        ctx.lineTo(vx, horizon - 35);
        ctx.moveTo(vx - 6, horizon - 25);
        ctx.lineTo(vx + 6, horizon - 25);
        ctx.stroke();
      }
      return;
    }

    if (dimension === 'mustafar') {
      // 🌋 Mustafar Jagged Obsidian Volcanic Spires & Magma Falls
      ctx.fillStyle = '#180808';
      ctx.beginPath();
      ctx.moveTo(0, horizon);
      ctx.lineTo(100, horizon - 160);
      ctx.lineTo(240, horizon - 70);
      ctx.lineTo(400, horizon - 180);
      ctx.lineTo(580, horizon - 80);
      ctx.lineTo(760, horizon - 190);
      ctx.lineTo(950, horizon - 90);
      ctx.lineTo(1100, horizon - 170);
      ctx.lineTo(this.width, horizon);
      ctx.closePath();
      ctx.fill();

      // Glowing lava veins on mountains
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 2.5;
      for (let i = 0; i < 4; i++) {
        const mx = i * 300 + 120;
        ctx.beginPath();
        ctx.moveTo(mx, horizon - 120);
        ctx.lineTo(mx + 20, horizon - 60);
        ctx.lineTo(mx - 10, horizon);
        ctx.stroke();
      }
      return;
    }

    if (dimension === 'hoth') {
      // ❄️ Hoth Frozen Snow Peaks & AT-AT Walker Silhouettes
      ctx.fillStyle = '#083344';
      ctx.beginPath();
      ctx.moveTo(0, horizon);
      ctx.lineTo(150, horizon - 140);
      ctx.lineTo(320, horizon - 80);
      ctx.lineTo(500, horizon - 170);
      ctx.lineTo(700, horizon - 90);
      ctx.lineTo(900, horizon - 150);
      ctx.lineTo(this.width, horizon - 60);
      ctx.lineTo(this.width, horizon);
      ctx.closePath();
      ctx.fill();

      // AT-AT Walker silhouette in distance
      const atatX = this.width * 0.72;
      const atatY = horizon - 75;
      ctx.fillStyle = '#164e63';
      ctx.fillRect(atatX, atatY, 44, 24); // Body
      ctx.fillRect(atatX + 40, atatY + 4, 16, 12); // Head
      // 4 Legs
      for (let l = 0; l < 4; l++) {
        ctx.fillRect(atatX + 4 + l * 10, atatY + 24, 4, 38);
      }
      return;
    }

    if (dimension === 'cyberpunk') {
      // 🌆 Cyberpunk Megacity with Neon Billboards
      ctx.fillStyle = '#090714';
      for (let i = 0; i < 18; i++) {
        const bw = 55 + (i % 4) * 18;
        const bh = 90 + (i % 7) * 35;
        const bx = i * 70 - 15;
        ctx.fillRect(bx, horizon - bh, bw, bh);

        // Neon billboards & signs
        ctx.fillStyle = (i % 2 === 0) ? '#ec4899' : '#06b6d4';
        ctx.fillRect(bx + 8, horizon - bh + 12, bw - 16, 4);
        ctx.fillStyle = '#090714';
      }
      return;
    }

    if (dimension === 'multiverse') {
      // 🏙️ Cyberpunk Stark Megalopolis & Cybertron Towers
      ctx.fillStyle = '#090d16';
      // Futuristic skyscrapers silhouette
      for (let i = 0; i < 16; i++) {
        const bw = 50 + (i % 5) * 15;
        const bh = 100 + (i % 6) * 35;
        const bx = i * 75 - 20;
        ctx.fillRect(bx, horizon - bh, bw, bh);

        // Neon window lights
        ctx.fillStyle = (i % 3 === 0) ? 'rgba(56, 189, 248, 0.4)' : 'rgba(234, 179, 8, 0.3)';
        for (let r = 0; r < 4; r++) {
          ctx.fillRect(bx + 8, horizon - bh + 15 + r * 20, bw - 16, 3);
        }
        ctx.fillStyle = '#090d16';
      }

      // Stark Tower with glowing 'A' emblem in the background
      const starkX = this.width * 0.28;
      const starkY = horizon - 220;
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(starkX - 25, horizon);
      ctx.lineTo(starkX - 10, starkY);
      ctx.lineTo(starkX + 15, starkY - 20);
      ctx.lineTo(starkX + 35, starkY);
      ctx.lineTo(starkX + 45, horizon);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Glowing Avengers 'A' Logo
      ctx.fillStyle = '#06b6d4';
      ctx.font = 'bold 22px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Ⓐ', starkX + 12, starkY + 30);
      return;
    }

    // 🏔️ Classic Inamorta Jagged Mountains
    ctx.fillStyle = '#161124';
    ctx.beginPath();
    ctx.moveTo(0, horizon);
    ctx.lineTo(120, horizon - 140);
    ctx.lineTo(260, horizon - 80);
    ctx.lineTo(440, horizon - 160);
    ctx.lineTo(600, horizon - 90);
    ctx.lineTo(760, horizon - 170);
    ctx.lineTo(920, horizon - 110);
    ctx.lineTo(1080, horizon - 150);
    ctx.lineTo(this.width, horizon - 80);
    ctx.lineTo(this.width, horizon);
    ctx.closePath();
    ctx.fill();

    // Midground Pine Forest Silhouette
    ctx.fillStyle = '#111718';
    const treeCount = 45;
    const treeSpacing = this.width / treeCount;
    for (let i = 0; i <= treeCount; i++) {
      const tx = i * treeSpacing;
      const th = 28 + (i % 5) * 8;
      ctx.beginPath();
      ctx.moveTo(tx, horizon);
      ctx.lineTo(tx + treeSpacing * 0.5, horizon - th);
      ctx.lineTo(tx + treeSpacing, horizon);
      ctx.closePath();
      ctx.fill();
    }
  }

  private drawBattlefield(time: number, dimension: DimensionType) {
    const ctx = this.ctx;
    const horizon = this.height * 0.58;
    const roadTopY = horizon + 30;
    const roadBottomY = this.height - 35;

    if (dimension === 'multiverse') {
      // 🌐 Cybertron Neon Grid Battlefield
      const floorGrad = ctx.createLinearGradient(0, horizon, 0, this.height);
      floorGrad.addColorStop(0, '#042f2e');
      floorGrad.addColorStop(0.5, '#090d16');
      floorGrad.addColorStop(1, '#020617');
      ctx.fillStyle = floorGrad;
      ctx.fillRect(0, horizon, this.width, this.height - horizon);

      // Glowing Neon Grid Lines
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.35)';
      ctx.lineWidth = 1.5;
      for (let y = horizon; y < this.height; y += 28) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(this.width, y);
        ctx.stroke();
      }
      for (let x = 0; x < this.width; x += 55) {
        ctx.beginPath();
        ctx.moveTo(x, horizon);
        ctx.lineTo(x, this.height);
        ctx.stroke();
      }

      // Energon Crystals growing from the cyber-ground
      ctx.fillStyle = '#38bdf8';
      for (let i = 0; i < 14; i++) {
        const cx = (i * 90 + 30) % this.width;
        const cy = horizon + 20 + ((i * 35) % (this.height - horizon - 40));
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + 4, cy - 18);
        ctx.lineTo(cx + 8, cy);
        ctx.closePath();
        ctx.fill();
      }
      return;
    }

    // 🌿 Classic Medieval Dirt & Grass Ground
    const groundGrad = ctx.createLinearGradient(0, horizon, 0, this.height);
    groundGrad.addColorStop(0, '#2d3e1e');
    groundGrad.addColorStop(0.2, '#3b2f1e');
    groundGrad.addColorStop(1, '#1e1810');
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, horizon, this.width, this.height - horizon);

    // Muddy trampled road
    const roadGrad = ctx.createLinearGradient(0, roadTopY, 0, roadBottomY);
    roadGrad.addColorStop(0, '#534331');
    roadGrad.addColorStop(0.5, '#6a5641');
    roadGrad.addColorStop(1, '#47392a');
    ctx.fillStyle = roadGrad;
    ctx.beginPath();
    ctx.moveTo(0, roadTopY);
    ctx.lineTo(this.width, roadTopY);
    ctx.lineTo(this.width, roadBottomY);
    ctx.lineTo(0, roadBottomY);
    ctx.closePath();
    ctx.fill();

    // Cobblestones
    ctx.fillStyle = 'rgba(75, 65, 55, 0.4)';
    for (let i = 0; i < 35; i++) {
      const stoneX = (i * 45 + 15) % this.width;
      const stoneY = roadTopY + 15 + ((i * 27) % (roadBottomY - roadTopY - 30));
      ctx.beginPath();
      ctx.ellipse(stoneX, stoneY, 10, 6, (i * 0.4), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ==================== CASTLE RENDERING ====================

  private drawCastle(castle: Castle, time: number, dimension: DimensionType) {
    const ctx = this.ctx;
    const castleX = 0;
    const baseY = this.height * 0.58;
    const castleWidth = 140;

    ctx.save();

    if (dimension === 'multiverse') {
      // 🛡️ STARK TOWER / AUTOBOT COMMAND FORTRESS
      // Sleek Nanotech Plating with Blue Neon Energy
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, baseY - 220, castleWidth, 320);

      // Nanotech Edge Trim
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.strokeRect(0, baseY - 220, castleWidth, 320);

      // Arc Reactor Core on Citadel Wall
      const arcPulse = (Math.sin(time * 5) + 1) * 0.5;
      const coreGrad = ctx.createRadialGradient(castleWidth * 0.6, baseY - 100, 5, castleWidth * 0.6, baseY - 100, 35);
      coreGrad.addColorStop(0, '#ffffff');
      coreGrad.addColorStop(0.4, '#38bdf8');
      coreGrad.addColorStop(0.8, '#0284c7');
      coreGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(castleWidth * 0.6, baseY - 100, 35 + arcPulse * 5, 0, Math.PI * 2);
      ctx.fill();

      // Holographic HUD Shield
      ctx.strokeStyle = `rgba(56, 189, 248, ${0.4 + arcPulse * 0.4})`;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(castleWidth * 0.6, baseY - 100, 55, -Math.PI * 0.4, Math.PI * 0.4);
      ctx.stroke();

      // Citadel Plasma Turret
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(castleWidth - 25, baseY - 180, 45, 14);
      ctx.fillStyle = '#eab308';
      ctx.fillRect(castleWidth + 15, baseY - 177, 8, 8);

      ctx.restore();
      return;
    }

    // 🏰 Classic Inamorta Stone Fortress
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(castleX, baseY - 180, castleWidth, 260);

    // Stone Brick Pattern
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 1.5;
    for (let row = 0; row < 12; row++) {
      const y = baseY - 180 + row * 22;
      ctx.beginPath();
      ctx.moveTo(castleX, y);
      ctx.lineTo(castleX + castleWidth, y);
      ctx.stroke();
    }

    // Heavy Iron Portcullis Gate
    const gateW = 55;
    const gateH = 80;
    const gateX = castleWidth - gateW - 10;
    const gateY = baseY + 10;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(gateX, gateY, gateW, gateH);

    // Gate Iron Bars
    ctx.strokeStyle = '#9ca3af';
    ctx.lineWidth = 2.5;
    for (let c = gateX + 8; c < gateX + gateW; c += 14) {
      ctx.beginPath();
      ctx.moveTo(c, gateY);
      ctx.lineTo(c, gateY + gateH);
      ctx.stroke();
    }

    // Level 3+ Castle Archers
    if (castle.level >= 3) {
      this.drawCastleArcher(35, baseY - 195, time);
      this.drawCastleArcher(100, baseY - 165, time + 1.5);
    }

    // Level 5 Arcane Cannon
    if (castle.level >= 5) {
      ctx.fillStyle = '#d97706';
      ctx.fillRect(castleWidth - 20, baseY - 185, 36, 12);
      ctx.fillStyle = '#67e8f9';
      ctx.beginPath();
      ctx.arc(castleWidth - 5, baseY - 179, 6, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  private drawCastleArcher(x: number, y: number, time: number) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);

    // Body
    ctx.fillStyle = '#15803d';
    ctx.fillRect(-6, -16, 12, 16);
    // Head
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(0, -22, 6, 0, Math.PI * 2);
    ctx.fill();
    // Bow
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(6, -8, 10, -Math.PI * 0.4, Math.PI * 0.4);
    ctx.stroke();

    ctx.restore();
  }

  // ==================== DIMENSIONAL PORTAL RENDERING ====================

  private drawDimensionalPortal(time: number, dimension: DimensionType) {
    const ctx = this.ctx;
    const portalX = this.width - 80;
    const portalY = this.height * 0.68;
    const radiusX = 45;
    const radiusY = 95;

    ctx.save();

    // 1. Monolith Pillars framing the portal
    ctx.fillStyle = dimension === 'multiverse' ? '#082f49' : '#0f172a';
    ctx.strokeStyle = dimension === 'multiverse' ? '#38bdf8' : '#7e22ce';
    ctx.lineWidth = 2.5;

    // Left & Right Pillars
    ctx.fillRect(portalX - radiusX - 14, portalY - radiusY - 15, 14, radiusY * 2 + 30);
    ctx.strokeRect(portalX - radiusX - 14, portalY - radiusY - 15, 14, radiusY * 2 + 30);
    ctx.fillRect(portalX + radiusX, portalY - radiusY - 15, 14, radiusY * 2 + 30);
    ctx.strokeRect(portalX + radiusX, portalY - radiusY - 15, 14, radiusY * 2 + 30);

    // 2. Swirling Quantum Vortex
    const vortexGrad = ctx.createRadialGradient(portalX, portalY, 5, portalX, portalY, radiusY);
    if (dimension === 'multiverse') {
      vortexGrad.addColorStop(0, '#facc15'); // Gold quantum spark
      vortexGrad.addColorStop(0.4, '#06b6d4'); // Cyan rift
      vortexGrad.addColorStop(0.8, '#4f46e5'); // Deep indigo
      vortexGrad.addColorStop(1, 'transparent');
    } else {
      vortexGrad.addColorStop(0, '#f43f5e'); // Crimson core
      vortexGrad.addColorStop(0.35, '#9333ea'); // Arcane purple
      vortexGrad.addColorStop(0.7, '#3b0764'); // Abyssal violet
      vortexGrad.addColorStop(1, 'transparent');
    }

    ctx.fillStyle = vortexGrad;
    ctx.beginPath();
    ctx.ellipse(portalX, portalY, radiusX, radiusY, 0, 0, Math.PI * 2);
    ctx.fill();

    // Rotating Energy Rings
    for (let r = 0; r < 3; r++) {
      const angle = time * (2.0 + r * 0.7) * (r % 2 === 0 ? 1 : -1);
      ctx.save();
      ctx.translate(portalX, portalY);
      ctx.rotate(angle);
      ctx.strokeStyle = dimension === 'multiverse' ? 'rgba(56, 189, 248, 0.8)' : 'rgba(232, 121, 249, 0.7)';
      ctx.lineWidth = 3 - r * 0.7;
      ctx.beginPath();
      ctx.ellipse(0, 0, radiusX * (0.8 - r * 0.2), radiusY * (0.8 - r * 0.2), 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Floating Portal Label Banner above
    ctx.fillStyle = dimension === 'multiverse' ? '#38bdf8' : '#c084fc';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(dimension === 'multiverse' ? '🌀 ПОРТАЛ В ИНАМОРТУ' : '🌀 ВХОД В МУЛЬТИВСЕЛЕННУЮ', portalX, portalY - radiusY - 22);

    ctx.restore();
  }

  // ==================== WARRIORS RENDERING ====================

  private drawWarrior(warrior: Warrior, time: number, activeSkin: SkinType) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(warrior.x, warrior.y);

    const isWalking = warrior.state === 'walk';
    const isAttacking = warrior.state === 'attack';
    const bob = isWalking ? Math.sin(time * 12) * 3 : Math.sin(time * 4) * 1;
    const legSwing = isWalking ? Math.sin(time * 12) * 6 : 0;

    // Hit flash
    if (warrior.state === 'hit') {
      ctx.filter = 'brightness(2.2) sepia(1) hue-rotate(320deg)';
    }

    // Character Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 10, warrior.width * 0.5, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Skin Aura & Particles
    this.drawSkinAura(ctx, activeSkin, time);

    ctx.translate(0, bob);

    // Render individual unit type visual
    switch (warrior.type) {
      // Inamorta Warriors
      case 'swordsman':
        this.renderSwordsman(ctx, warrior, legSwing, isAttacking, time, activeSkin);
        break;
      case 'archer':
        this.renderArcher(ctx, warrior, legSwing, isAttacking, time, activeSkin);
        break;
      case 'knight':
        this.renderKnight(ctx, warrior, legSwing, isAttacking, time, activeSkin);
        break;
      case 'barbarian':
        this.renderBarbarian(ctx, warrior, legSwing, isAttacking, time, activeSkin);
        break;
      case 'mage':
        this.renderMage(ctx, warrior, isAttacking, time, activeSkin);
        break;
      case 'royal_knight':
        this.renderRoyalKnight(ctx, warrior, legSwing, isAttacking, time, activeSkin);
        break;

      // Multiverse Heroes: Avengers & Transformers
      case 'iron_man':
        this.renderIronMan(ctx, warrior, legSwing, isAttacking, time);
        break;
      case 'captain':
        this.renderCaptainAmerica(ctx, warrior, legSwing, isAttacking, time);
        break;
      case 'thor':
        this.renderThor(ctx, warrior, legSwing, isAttacking, time);
        break;
      case 'optimus':
        this.renderOptimusPrime(ctx, warrior, legSwing, isAttacking, time);
        break;
      case 'bumblebee':
        this.renderBumblebee(ctx, warrior, legSwing, isAttacking, time);
        break;
      case 'hulk':
        this.renderHulk(ctx, warrior, legSwing, isAttacking, time);
        break;

      // Military Units
      case 'soldier':
        this.renderSoldier(ctx, warrior, legSwing, isAttacking, time);
        break;
      case 'tank':
        this.renderTank(ctx, warrior, isAttacking, time);
        break;
    }

    ctx.filter = 'none';

    // Health Bar
    this.drawHealthBar(ctx, warrior.hp, warrior.maxHp, -warrior.width / 2, -warrior.height - 8, warrior.width, 5, '#22c55e', warrior.tier);

    ctx.restore();
  }

  private drawSkinAura(ctx: CanvasRenderingContext2D, skin: SkinType, time: number) {
    if (skin === 'classic') return;

    ctx.save();
    if (skin === 'ice') {
      ctx.fillStyle = 'rgba(56, 189, 248, 0.3)';
      ctx.beginPath();
      ctx.arc(0, -15, 26, 0, Math.PI * 2);
      ctx.fill();
    } else if (skin === 'lava') {
      ctx.fillStyle = 'rgba(239, 68, 68, 0.35)';
      ctx.beginPath();
      ctx.arc(0, -15, 26, 0, Math.PI * 2);
      ctx.fill();
    } else if (skin === 'leaf') {
      ctx.fillStyle = 'rgba(74, 222, 128, 0.3)';
      ctx.beginPath();
      ctx.arc(0, -15, 24, 0, Math.PI * 2);
      ctx.fill();
    } else if (skin === 'transformer') {
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-18, -45, 36, 50);
    } else if (skin === 'avenger') {
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, -20, 28, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  // ==================== INAMORTA WARRIORS VISUALS ====================

  private renderSwordsman(ctx: CanvasRenderingContext2D, w: Warrior, legSwing: number, isAttacking: boolean, time: number, skin: SkinType) {
    const tunicColor = skin === 'leaf' ? '#15803d' : skin === 'ice' ? '#0284c7' : skin === 'lava' ? '#b91c1c' : '#2563eb';
    // Legs
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-6 + legSwing, -12, 5, 14);
    ctx.fillRect(1 - legSwing, -12, 5, 14);

    // Torso Armor
    ctx.fillStyle = tunicColor;
    ctx.fillRect(-8, -26, 16, 16);

    // Head & Helmet
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(-6, -38, 12, 12);
    // Face slit
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-2, -34, 8, 3);

    // Sword
    ctx.save();
    ctx.translate(8, -18);
    const slash = isAttacking ? Math.sin(time * 20) * 1.6 : 0.2;
    ctx.rotate(slash);
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(0, -18, 4, 22);
    ctx.fillStyle = '#d97706';
    ctx.fillRect(-4, 0, 12, 3);
    ctx.restore();
  }

  private renderArcher(ctx: CanvasRenderingContext2D, w: Warrior, legSwing: number, isAttacking: boolean, time: number, skin: SkinType) {
    const cloakColor = skin === 'ice' ? '#0369a1' : skin === 'lava' ? '#991b1b' : '#166534';
    ctx.fillStyle = '#451a03';
    ctx.fillRect(-5 + legSwing, -10, 4, 12);
    ctx.fillRect(1 - legSwing, -10, 4, 12);

    ctx.fillStyle = cloakColor;
    ctx.fillRect(-7, -24, 14, 16);

    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(0, -30, 5, 0, Math.PI * 2);
    ctx.fill();

    // Bow
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(8, -18, 11, -Math.PI * 0.4, Math.PI * 0.4);
    ctx.stroke();
  }

  private renderKnight(ctx: CanvasRenderingContext2D, w: Warrior, legSwing: number, isAttacking: boolean, time: number, skin: SkinType) {
    const armorColor = skin === 'ice' ? '#38bdf8' : skin === 'lava' ? '#ea580c' : '#64748b';
    ctx.fillStyle = '#334155';
    ctx.fillRect(-7 + legSwing, -12, 6, 14);
    ctx.fillRect(1 - legSwing, -12, 6, 14);

    ctx.fillStyle = armorColor;
    ctx.fillRect(-10, -28, 20, 18);

    // Knight Helmet with Crest
    ctx.fillStyle = '#475569';
    ctx.fillRect(-7, -42, 14, 14);
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(-3, -48, 6, 6);

    // Heavy Kite Shield
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(-14, -26, 10, 18);
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-14, -26, 10, 18);
  }

  private renderBarbarian(ctx: CanvasRenderingContext2D, w: Warrior, legSwing: number, isAttacking: boolean, time: number, skin: SkinType) {
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-8 + legSwing, -14, 6, 16);
    ctx.fillRect(2 - legSwing, -14, 6, 16);

    // Bare muscular chest
    ctx.fillStyle = '#d97706';
    ctx.fillRect(-11, -30, 22, 18);

    // Horned Helmet
    ctx.fillStyle = '#451a03';
    ctx.fillRect(-8, -42, 16, 12);
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.moveTo(-8, -40);
    ctx.lineTo(-14, -48);
    ctx.lineTo(-6, -42);
    ctx.fill();

    // Giant Battleaxe
    ctx.save();
    ctx.translate(12, -20);
    const chop = isAttacking ? Math.sin(time * 18) * 1.8 : 0.3;
    ctx.rotate(chop);
    ctx.fillStyle = '#451a03';
    ctx.fillRect(-2, -22, 4, 28);
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.arc(6, -18, 10, -Math.PI * 0.5, Math.PI * 0.5);
    ctx.fill();
    ctx.restore();
  }

  private renderMage(ctx: CanvasRenderingContext2D, w: Warrior, isAttacking: boolean, time: number, skin: SkinType) {
    const robeColor = skin === 'ice' ? '#0284c7' : skin === 'lava' ? '#b91c1c' : '#6b21a8';
    ctx.fillStyle = robeColor;
    ctx.beginPath();
    ctx.moveTo(-10, -8);
    ctx.lineTo(10, -8);
    ctx.lineTo(8, -28);
    ctx.lineTo(-8, -28);
    ctx.closePath();
    ctx.fill();

    // Wizard Pointy Hat
    ctx.fillStyle = robeColor;
    ctx.beginPath();
    ctx.moveTo(-12, -34);
    ctx.lineTo(12, -34);
    ctx.lineTo(0, -52);
    ctx.closePath();
    ctx.fill();

    // Glowing Arcane Staff
    ctx.fillStyle = '#78350f';
    ctx.fillRect(10, -32, 4, 30);
    const orbPulse = (Math.sin(time * 8) + 1) * 0.5;
    ctx.fillStyle = skin === 'ice' ? '#38bdf8' : '#c084fc';
    ctx.beginPath();
    ctx.arc(12, -34, 6 + orbPulse * 3, 0, Math.PI * 2);
    ctx.fill();
  }

  private renderRoyalKnight(ctx: CanvasRenderingContext2D, w: Warrior, legSwing: number, isAttacking: boolean, time: number, skin: SkinType) {
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(-12, -32, 24, 20);
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(-8, -46, 16, 14);

    // Crown
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.moveTo(-8, -46);
    ctx.lineTo(-8, -52);
    ctx.lineTo(-4, -48);
    ctx.lineTo(0, -54);
    ctx.lineTo(4, -48);
    ctx.lineTo(8, -52);
    ctx.lineTo(8, -46);
    ctx.closePath();
    ctx.fill();

    // Radiant Gold Broadsword
    ctx.save();
    ctx.translate(14, -22);
    const slash = isAttacking ? Math.sin(time * 16) * 1.8 : 0.2;
    ctx.rotate(slash);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(0, -28, 6, 32);
    ctx.restore();
  }

  // ==================== AVENGERS & TRANSFORMERS RENDERING ====================

  private renderIronMan(ctx: CanvasRenderingContext2D, w: Warrior, legSwing: number, isAttacking: boolean, time: number) {
    // 🦾 IRON MAN (MARK 85) - Crimson & Gold Nanotech Armor
    // Hovering thruster flames from boots
    const flameFlicker = 8 + (Math.sin(time * 25) * 4);
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.moveTo(-6, 4);
    ctx.lineTo(-3, 4 + flameFlicker);
    ctx.lineTo(0, 4);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(2, 4);
    ctx.lineTo(5, 4 + flameFlicker);
    ctx.lineTo(8, 4);
    ctx.fill();

    // Legs
    ctx.fillStyle = '#eab308'; // Gold thigh plating
    ctx.fillRect(-7, -14, 5, 16);
    ctx.fillRect(1, -14, 5, 16);
    ctx.fillStyle = '#dc2626'; // Red boots
    ctx.fillRect(-7, -4, 5, 8);
    ctx.fillRect(1, -4, 5, 8);

    // Torso (Crimson Titanium)
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(-10, -32, 20, 20);

    // Glowing Arc Reactor in Chest
    const reactorGlow = (Math.sin(time * 8) + 1) * 0.5;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, -24, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = `rgba(56, 189, 248, ${0.7 + reactorGlow * 0.3})`;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Iron Man Helmet
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(-7, -46, 14, 14);
    // Gold Faceplate
    ctx.fillStyle = '#facc15';
    ctx.fillRect(-5, -44, 10, 10);
    // Glowing Blue Slit Eyes
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(-4, -40, 3, 2);
    ctx.fillRect(1, -40, 3, 2);

    // Repulsor Arm aiming forward
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(6, -26, 14, 6);
    // Hand repulsor blast glow
    if (isAttacking) {
      ctx.fillStyle = '#67e8f9';
      ctx.beginPath();
      ctx.arc(22, -23, 7, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private renderCaptainAmerica(ctx: CanvasRenderingContext2D, w: Warrior, legSwing: number, isAttacking: boolean, time: number) {
    // ⭐ CAPTAIN AMERICA
    // Combat Boots & Pants
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(-7 + legSwing, -12, 6, 14);
    ctx.fillRect(1 - legSwing, -12, 6, 14);
    ctx.fillStyle = '#991b1b';
    ctx.fillRect(-7 + legSwing, -4, 6, 6);
    ctx.fillRect(1 - legSwing, -4, 6, 6);

    // Blue Torso with White Star & Red/White Stripes
    ctx.fillStyle = '#1e40af';
    ctx.fillRect(-10, -28, 20, 18);
    // Red & white stomach stripes
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-8, -16, 16, 6);
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(-6, -16, 4, 6);
    ctx.fillRect(2, -16, 4, 6);

    // White Star on Chest
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('★', 0, -21);

    // Blue Helmet with 'A'
    ctx.fillStyle = '#1d4ed8';
    ctx.fillRect(-7, -42, 14, 14);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 8px sans-serif';
    ctx.fillText('A', 0, -32);

    // Vibranium Round Shield (Red, White, Blue, Star)
    ctx.save();
    ctx.translate(-14, -20);
    const shieldAngle = isAttacking ? Math.sin(time * 16) * 1.5 : 0;
    ctx.rotate(shieldAngle);

    // Outer Red Ring
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(0, 0, 13, 0, Math.PI * 2);
    ctx.fill();
    // White Ring
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.fill();
    // Inner Red Ring
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(0, 0, 7, 0, Math.PI * 2);
    ctx.fill();
    // Center Blue Circle with Star
    ctx.fillStyle = '#1d4ed8';
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillText('★', 0, 3);
    ctx.restore();
  }

  private renderThor(ctx: CanvasRenderingContext2D, w: Warrior, legSwing: number, isAttacking: boolean, time: number) {
    // ⚡ THOR - GOD OF THUNDER
    // Red Billowing Cape
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.moveTo(-8, -32);
    ctx.lineTo(-24 + Math.sin(time * 6) * 4, -4);
    ctx.lineTo(-4, -12);
    ctx.closePath();
    ctx.fill();

    // Dark Asgardian Plate
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-10, -30, 20, 20);

    // 6 Silver Discs on Torso
    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.arc(-4, -24, 3, 0, Math.PI * 2);
    ctx.arc(4, -24, 3, 0, Math.PI * 2);
    ctx.arc(-4, -16, 3, 0, Math.PI * 2);
    ctx.arc(4, -16, 3, 0, Math.PI * 2);
    ctx.fill();

    // Silver Winged Helmet & Blonde Hair
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(-7, -44, 14, 14);
    ctx.fillStyle = '#fde047'; // Blonde beard/hair
    ctx.fillRect(-8, -34, 16, 4);

    // Silver Wings on Helmet
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.moveTo(-7, -40);
    ctx.lineTo(-14, -48);
    ctx.lineTo(-7, -44);
    ctx.fill();

    // Mjolnir Hammer (with crackling lightning)
    ctx.save();
    ctx.translate(14, -22);
    const slam = isAttacking ? Math.sin(time * 18) * 1.6 : 0.2;
    ctx.rotate(slam);
    // Handle
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-2, -6, 4, 20);
    // Heavy Steel Head
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(-8, -18, 16, 12);
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-8, -18, 16, 12);

    // Lightning Sparks crackling from Mjolnir
    if (isAttacking || Math.random() < 0.4) {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -18);
      ctx.lineTo(8, -26);
      ctx.lineTo(4, -34);
      ctx.stroke();
    }
    ctx.restore();
  }

  private renderOptimusPrime(ctx: CanvasRenderingContext2D, w: Warrior, legSwing: number, isAttacking: boolean, time: number) {
    // 🚛 OPTIMUS PRIME - AUTOBOT LEADER
    // Blue Mecha Legs
    ctx.fillStyle = '#1d4ed8';
    ctx.fillRect(-12 + legSwing, -16, 9, 22);
    ctx.fillRect(3 - legSwing, -16, 9, 22);

    // Red Truck Cab Torso with Silver Grille and Windows
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(-16, -42, 32, 28);
    // Blue Windshield Windows
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(-12, -38, 10, 8);
    ctx.fillRect(2, -38, 10, 8);
    // Silver Grille & Bumper
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(-8, -26, 16, 10);
    for (let g = 0; g < 4; g++) {
      ctx.fillStyle = '#475569';
      ctx.fillRect(-7, -25 + g * 2, 14, 1);
    }

    // Iconic Autobot Helmet with Antennae & Faceplate
    ctx.fillStyle = '#1d4ed8';
    ctx.fillRect(-10, -58, 20, 18);
    // Blue antennae
    ctx.fillRect(-12, -64, 3, 10);
    ctx.fillRect(9, -64, 3, 10);
    // Silver Battle Mask
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(-6, -48, 12, 8);
    // Glowing Yellow Optics
    ctx.fillStyle = '#facc15';
    ctx.fillRect(-5, -53, 3, 2);
    ctx.fillRect(2, -53, 3, 2);

    // Glowing Orange Energon Battleaxe & Ion Cannon
    ctx.save();
    ctx.translate(18, -32);
    const axeSwing = isAttacking ? Math.sin(time * 16) * 1.7 : 0.3;
    ctx.rotate(axeSwing);
    // Energon Blade
    ctx.fillStyle = '#fb923c';
    ctx.beginPath();
    ctx.moveTo(0, -28);
    ctx.lineTo(16, -14);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#fed7aa';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }

  private renderBumblebee(ctx: CanvasRenderingContext2D, w: Warrior, legSwing: number, isAttacking: boolean, time: number) {
    // 🐝 BUMBLEBEE - AGILE AUTOBOT SCOUT
    // Yellow & Black Legs
    ctx.fillStyle = '#eab308';
    ctx.fillRect(-7 + legSwing, -12, 6, 16);
    ctx.fillRect(1 - legSwing, -12, 6, 16);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-7 + legSwing, -4, 6, 4);
    ctx.fillRect(1 - legSwing, -4, 6, 4);

    // Yellow Mecha Body with Racing Stripes
    ctx.fillStyle = '#facc15';
    ctx.fillRect(-10, -30, 20, 20);
    ctx.fillStyle = '#0f172a'; // Black center racing stripes
    ctx.fillRect(-2, -30, 4, 20);

    // Yellow Mecha Head & Horns
    ctx.fillStyle = '#eab308';
    ctx.fillRect(-7, -44, 14, 14);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-8, -48, 3, 6);
    ctx.fillRect(5, -48, 3, 6);
    // Glowing Blue Optics
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(-4, -39, 3, 2);
    ctx.fillRect(1, -39, 3, 2);

    // Arm-Mounted Plasma Stinger Cannon
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(6, -26, 14, 7);
    ctx.fillStyle = '#facc15';
    ctx.fillRect(16, -27, 4, 9);
  }

  private renderHulk(ctx: CanvasRenderingContext2D, w: Warrior, legSwing: number, isAttacking: boolean, time: number) {
    // 🟢 THE INCREDIBLE HULK
    // Ripped Purple Pants & Massive Bare Feet
    ctx.fillStyle = '#7e22ce';
    ctx.fillRect(-14 + legSwing, -18, 12, 22);
    ctx.fillRect(2 - legSwing, -18, 12, 22);
    // Green toes
    ctx.fillStyle = '#16a34a';
    ctx.fillRect(-14 + legSwing, 0, 12, 6);
    ctx.fillRect(2 - legSwing, 0, 12, 6);

    // Massive Muscular Green Torso & Shoulders
    ctx.fillStyle = '#15803d';
    ctx.fillRect(-18, -52, 36, 36);
    // Chest muscle definition
    ctx.strokeStyle = '#14532d';
    ctx.lineWidth = 2;
    ctx.strokeRect(-16, -50, 15, 14);
    ctx.strokeRect(1, -50, 15, 14);

    // Huge Angry Green Head & Black Hair
    ctx.fillStyle = '#16a34a';
    ctx.fillRect(-10, -68, 20, 18);
    // Black wild hair
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-12, -74, 24, 8);
    // Glowing Furious Green/White Eyes & Gritted Teeth
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-7, -62, 4, 3);
    ctx.fillRect(3, -62, 4, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-6, -55, 12, 3);

    // Giant Green Fists smashing
    ctx.save();
    ctx.translate(16, -34);
    const smash = isAttacking ? Math.sin(time * 14) * 1.8 : 0.2;
    ctx.rotate(smash);
    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // ==================== ZOMBIES & BOSSES RENDERING ====================

  private drawZombie(zombie: Zombie, time: number) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(zombie.x, zombie.y);

    const isWalking = zombie.state === 'walk';
    const isAttacking = zombie.state === 'attack';
    const bob = isWalking ? Math.sin(time * 8) * 3 : Math.sin(time * 3) * 1;
    const legSwing = isWalking ? Math.sin(time * 8) * (zombie.type === 'fast' ? 10 : 5) : 0;

    if (zombie.state === 'hit') {
      ctx.filter = 'brightness(2.5) hue-rotate(180deg)';
    }

    if (zombie.isFrozen) {
      ctx.filter = 'brightness(1.3) hue-rotate(160deg) saturate(1.8)';
    }

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(0, 10, zombie.width * 0.5, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.translate(0, bob);

    // Render individual zombie type
    switch (zombie.type) {
      case 'regular':
        this.renderRegularZombie(ctx, zombie, legSwing, isAttacking, time);
        break;
      case 'fast':
        this.renderFastZombie(ctx, zombie, legSwing, isAttacking, time);
        break;
      case 'fat':
        this.renderFatZombie(ctx, zombie, legSwing, isAttacking, time);
        break;
      case 'armored':
        this.renderArmoredZombie(ctx, zombie, legSwing, isAttacking, time);
        break;
      case 'giant':
        this.renderGiantZombie(ctx, zombie, legSwing, isAttacking, time);
        break;
      case 'boss':
        this.renderBossZombie(ctx, zombie, legSwing, isAttacking, time);
        break;

      // New Bosses
      case 'necro_titan':
        this.renderNecroTitan(ctx, zombie, legSwing, isAttacking, time);
        break;
      case 'zombie_transformer':
        this.renderZombieTransformer(ctx, zombie, legSwing, isAttacking, time);
        break;
      case 'mega_zombietron':
        this.renderMegaZombietron(ctx, zombie, legSwing, isAttacking, time);
        break;
      case 'zombie_thanos':
        this.renderZombieThanos(ctx, zombie, legSwing, isAttacking, time);
        break;
      case 'undead_dragon':
        this.renderUndeadDragon(ctx, zombie, legSwing, isAttacking, time);
        break;
    }

    ctx.filter = 'none';

    // Health Bar
    if (zombie.isBoss) {
      this.drawBossHealthBar(ctx, zombie);
    } else {
      this.drawHealthBar(ctx, zombie.hp, zombie.maxHp, -zombie.width / 2, -zombie.height - 6, zombie.width, 4, '#ef4444');
    }

    // Slow status indicator from trench mud or landmine concussion
    if (zombie.isSlowed) {
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🐌 ЗАМЕДЛЕН', 0, -zombie.height - 12);
    }

    ctx.restore();
  }

  private renderRegularZombie(ctx: CanvasRenderingContext2D, z: Zombie, legSwing: number, isAttacking: boolean, time: number) {
    ctx.fillStyle = '#374151';
    ctx.fillRect(-6 + legSwing, -10, 5, 12);
    ctx.fillRect(1 - legSwing, -10, 5, 12);

    ctx.fillStyle = '#475569';
    ctx.fillRect(-8, -24, 16, 16);

    ctx.fillStyle = '#4ade80';
    ctx.beginPath();
    ctx.arc(0, -32, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ef4444';
    ctx.fillRect(-4, -34, 2, 2);
    ctx.fillRect(1, -34, 2, 2);
  }

  private renderFastZombie(ctx: CanvasRenderingContext2D, z: Zombie, legSwing: number, isAttacking: boolean, time: number) {
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-5 + legSwing, -8, 4, 12);
    ctx.fillRect(1 - legSwing, -8, 4, 12);

    ctx.fillStyle = '#b91c1c';
    ctx.fillRect(-6, -20, 12, 14);

    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(0, -27, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  private renderFatZombie(ctx: CanvasRenderingContext2D, z: Zombie, legSwing: number, isAttacking: boolean, time: number) {
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(-10 + legSwing, -12, 7, 14);
    ctx.fillRect(3 - legSwing, -12, 7, 14);

    ctx.fillStyle = '#15803d';
    ctx.fillRect(-14, -34, 28, 24);

    ctx.fillStyle = '#86efac';
    ctx.beginPath();
    ctx.arc(0, -42, 8, 0, Math.PI * 2);
    ctx.fill();
  }

  private renderArmoredZombie(ctx: CanvasRenderingContext2D, z: Zombie, legSwing: number, isAttacking: boolean, time: number) {
    ctx.fillStyle = '#451a03';
    ctx.fillRect(-7 + legSwing, -12, 6, 14);
    ctx.fillRect(1 - legSwing, -12, 6, 14);

    ctx.fillStyle = '#78350f';
    ctx.fillRect(-9, -28, 18, 18);
    ctx.strokeStyle = '#9ca3af';
    ctx.lineWidth = 2;
    ctx.strokeRect(-9, -28, 18, 18);

    ctx.fillStyle = '#475569';
    ctx.fillRect(-7, -42, 14, 14);
  }

  private renderGiantZombie(ctx: CanvasRenderingContext2D, z: Zombie, legSwing: number, isAttacking: boolean, time: number) {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-14 + legSwing, -18, 11, 24);
    ctx.fillRect(3 - legSwing, -18, 11, 24);

    ctx.fillStyle = '#14532d';
    ctx.fillRect(-18, -52, 36, 36);

    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(0, -64, 13, 0, Math.PI * 2);
    ctx.fill();
  }

  private renderBossZombie(ctx: CanvasRenderingContext2D, z: Zombie, legSwing: number, isAttacking: boolean, time: number) {
    // 👹 Demonic Arch-Fiend Boss
    ctx.fillStyle = '#09090b';
    ctx.fillRect(-20 - legSwing, -22, 15, 26);
    ctx.fillRect(5 + legSwing, -22, 15, 26);

    ctx.fillStyle = '#18181b';
    ctx.fillRect(-26, -64, 52, 44);

    // Glowing Core
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(0, -45, 9, 0, Math.PI * 2);
    ctx.fill();

    // Horned Head
    ctx.fillStyle = '#3b0764';
    ctx.beginPath();
    ctx.arc(0, -78, 16, 0, Math.PI * 2);
    ctx.fill();
  }

  // ==================== NEW BOSSES RENDERING ====================

  private renderNecroTitan(ctx: CanvasRenderingContext2D, z: Zombie, legSwing: number, isAttacking: boolean, time: number) {
    // 💀 NECRO TITAN (Boss of Level 5)
    ctx.fillStyle = '#09090b';
    ctx.fillRect(-24 - legSwing, -24, 18, 30);
    ctx.fillRect(6 + legSwing, -24, 18, 30);

    // Ribcage & Dark Magic Skeleton Torso
    ctx.fillStyle = '#18181b';
    ctx.fillRect(-30, -75, 60, 55);
    ctx.fillStyle = '#e2e8f0'; // Exposed ribs
    for (let r = 0; r < 4; r++) {
      ctx.fillRect(-22, -68 + r * 10, 44, 4);
    }

    // Skull with Crown of Bone
    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.arc(0, -92, 18, 0, Math.PI * 2);
    ctx.fill();
    // Glowing Cyan Necrotic Eyes
    ctx.fillStyle = '#06b6d4';
    ctx.beginPath();
    ctx.arc(-7, -94, 4, 0, Math.PI * 2);
    ctx.arc(7, -94, 4, 0, Math.PI * 2);
    ctx.fill();

    // Giant Bone Mace
    ctx.save();
    ctx.translate(-35, -55);
    const slam = isAttacking ? Math.sin(time * 12) * 1.8 : 0.4;
    ctx.rotate(slam);
    ctx.fillStyle = '#475569';
    ctx.fillRect(-6, -45, 12, 55);
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.arc(0, -45, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  private renderZombieTransformer(ctx: CanvasRenderingContext2D, z: Zombie, legSwing: number, isAttacking: boolean, time: number) {
    // 🤖 CYBER DECEPTICON ZOMBIE
    ctx.fillStyle = '#4c0519';
    ctx.fillRect(-10 + legSwing, -14, 8, 18);
    ctx.fillRect(2 - legSwing, -14, 8, 18);

    ctx.fillStyle = '#312e81';
    ctx.fillRect(-14, -38, 28, 26);

    // Glowing Toxic Green Zombie Slime dripping
    ctx.fillStyle = '#4ade80';
    ctx.fillRect(-10, -22, 6, 8);

    // Decepticon Head
    ctx.fillStyle = '#1e1b4b';
    ctx.fillRect(-9, -52, 18, 16);
    ctx.fillStyle = '#ef4444'; // Red optics
    ctx.fillRect(-5, -46, 3, 2);
    ctx.fillRect(2, -46, 3, 2);
  }

  private renderMegaZombietron(ctx: CanvasRenderingContext2D, z: Zombie, legSwing: number, isAttacking: boolean, time: number) {
    // 🤖 MEGA-ZOMBIETRON (Boss of Level 10)
    // Dark Gunmetal & Purple Plating
    ctx.fillStyle = '#1e1b4b';
    ctx.fillRect(-28 - legSwing, -26, 22, 32);
    ctx.fillRect(6 + legSwing, -26, 22, 32);

    ctx.fillStyle = '#312e81';
    ctx.fillRect(-34, -80, 68, 56);

    // Shoulder Missile Pods
    ctx.fillStyle = '#4c0519';
    ctx.fillRect(-45, -92, 18, 20);
    ctx.fillRect(27, -92, 18, 20);
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(-36, -82, 4, 0, Math.PI * 2);
    ctx.arc(36, -82, 4, 0, Math.PI * 2);
    ctx.fill();

    // Dark Energon Cannon on Arm
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-58, -60, 32, 16);
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(-58, -52, 8, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.fillStyle = '#111827';
    ctx.fillRect(-14, -100, 28, 22);
    ctx.fillStyle = '#f43f5e';
    ctx.fillRect(-8, -92, 6, 4);
    ctx.fillRect(2, -92, 6, 4);
  }

  private renderZombieThanos(ctx: CanvasRenderingContext2D, z: Zombie, legSwing: number, isAttacking: boolean, time: number) {
    // 🟣 ZOMBIE THANOS (FINAL BOSS)
    // Golden Battle Greaves
    ctx.fillStyle = '#ca8a04';
    ctx.fillRect(-26 - legSwing, -28, 20, 34);
    ctx.fillRect(6 + legSwing, -28, 20, 34);

    // Golden Armor & Blue Tunic
    ctx.fillStyle = '#a16207';
    ctx.fillRect(-35, -85, 70, 60);
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(-22, -85, 44, 50);

    // Massive Purple Titan Head with Ridged Chin
    ctx.fillStyle = '#7e22ce';
    ctx.fillRect(-18, -108, 36, 26);
    // Golden Helmet
    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.moveTo(-20, -108);
    ctx.lineTo(20, -108);
    ctx.lineTo(0, -122);
    ctx.closePath();
    ctx.fill();
    // Glowing Void Eyes
    ctx.fillStyle = '#fde047';
    ctx.fillRect(-10, -100, 5, 3);
    ctx.fillRect(5, -100, 5, 3);

    // 🧤 THE INFINITY GAUNTLET with 6 glowing infinity stones!
    ctx.save();
    ctx.translate(-45, -60);
    ctx.fillStyle = '#eab308';
    ctx.fillRect(-12, -15, 24, 30);

    // 6 Stones: Power (Purple), Space (Blue), Reality (Red), Soul (Orange), Time (Green), Mind (Yellow)
    ctx.fillStyle = '#a855f7'; ctx.beginPath(); ctx.arc(-8, -12, 3, 0, Math.PI * 2); ctx.fill(); // Power
    ctx.fillStyle = '#3b82f6'; ctx.beginPath(); ctx.arc(-3, -12, 3, 0, Math.PI * 2); ctx.fill(); // Space
    ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.arc(2, -12, 3, 0, Math.PI * 2); ctx.fill(); // Reality
    ctx.fillStyle = '#22c55e'; ctx.beginPath(); ctx.arc(7, -12, 3, 0, Math.PI * 2); ctx.fill(); // Time
    ctx.fillStyle = '#f97316'; ctx.beginPath(); ctx.arc(-10, -2, 3, 0, Math.PI * 2); ctx.fill(); // Soul
    ctx.fillStyle = '#fde047'; ctx.beginPath(); ctx.arc(0, 0, 5, 0, Math.PI * 2); ctx.fill(); // Mind (Center)

    ctx.restore();
  }

  private renderUndeadDragon(ctx: CanvasRenderingContext2D, z: Zombie, legSwing: number, isAttacking: boolean, time: number) {
    // 🐉 UNDEAD CYBER DRAGON (Boss of Level 11)
    // Flapping Bone Wings
    const wingAngle = Math.sin(time * 8) * 0.4;
    ctx.save();
    ctx.translate(0, -50);
    ctx.rotate(wingAngle);
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(45, -40);
    ctx.lineTo(25, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Skeletal Dragon Body
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-28, -60, 56, 32);

    // Dragon Horned Skull Head
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.moveTo(-20, -60);
    ctx.lineTo(-45, -75);
    ctx.lineTo(-30, -55);
    ctx.closePath();
    ctx.fill();
    // Glowing Cyan Breath
    ctx.fillStyle = '#22d3ee';
    ctx.beginPath();
    ctx.arc(-42, -70, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // ==================== HEALTH BARS RENDERING ====================

  private drawHealthBar(
    ctx: CanvasRenderingContext2D,
    hp: number,
    maxHp: number,
    x: number,
    y: number,
    w: number,
    h: number,
    fillColor: string,
    tier?: number
  ) {
    const pct = Math.max(0, Math.min(1, hp / maxHp));

    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(x - 1, y - 1, w + 2, h + 2);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x - 1, y - 1, w + 2, h + 2);

    ctx.fillStyle = fillColor;
    ctx.fillRect(x, y, w * pct, h);

    if (tier && tier > 1) {
      ctx.fillStyle = '#f59e0b';
      ctx.font = '8px sans-serif';
      ctx.fillText(tier === 3 ? '★★★' : '★★', x, y - 2);
    }
  }

  private drawBossHealthBar(ctx: CanvasRenderingContext2D, boss: Zombie) {
    const pct = Math.max(0, Math.min(1, boss.hp / boss.maxHp));
    const w = 85;
    const h = 8;
    const x = -w / 2;
    const y = -boss.height - 20;

    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`👑 ${boss.name}`, 0, y - 4);

    ctx.fillStyle = '#1e1b4b';
    ctx.fillRect(x - 2, y - 2, w + 4, h + 4);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x - 2, y - 2, w + 4, h + 4);

    const grad = ctx.createLinearGradient(x, y, x + w, y);
    grad.addColorStop(0, '#dc2626');
    grad.addColorStop(1, '#f97316');
    ctx.fillStyle = grad;
    ctx.fillRect(x, y, w * pct, h);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 8px sans-serif';
    ctx.fillText(`${Math.ceil(boss.hp)} / ${boss.maxHp}`, 0, y + 7);
  }

  // ==================== PROJECTILES RENDERING ====================

  private drawProjectiles(projectiles: Projectile[]) {
    const ctx = this.ctx;

    for (const p of projectiles) {
      ctx.save();
      ctx.translate(p.x, p.y);

      switch (p.type) {
        case 'arrow':
        case 'tower_arrow': {
          const dx = p.targetX - p.startX;
          const dy = p.targetY - p.startY;
          const angle = Math.atan2(dy, dx);
          ctx.rotate(angle);
          ctx.fillStyle = '#92400e';
          ctx.fillRect(-10, -1, 16, 2);
          ctx.fillStyle = '#e2e8f0';
          ctx.beginPath();
          ctx.moveTo(6, -2.5);
          ctx.lineTo(12, 0);
          ctx.lineTo(6, 2.5);
          ctx.closePath();
          ctx.fill();
          break;
        }

        case 'repulsor_laser': {
          // 🦾 Iron Man Cyan Laser Beam
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(-12, -3, 24, 6);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(-8, -1.5, 16, 3);
          break;
        }

        case 'vibranium_shield': {
          // ⭐ Captain America Spinning Shield
          ctx.rotate(p.progress * 25);
          ctx.fillStyle = '#dc2626';
          ctx.beginPath();
          ctx.arc(0, 0, 10, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(0, 0, 7, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#1d4ed8';
          ctx.beginPath();
          ctx.arc(0, 0, 4, 0, Math.PI * 2);
          ctx.fill();
          break;
        }

        case 'thor_lightning': {
          // ⚡ Thor Lightning Bolt
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(-15, -10);
          ctx.lineTo(0, 0);
          ctx.lineTo(15, -5);
          ctx.stroke();
          break;
        }

        case 'ion_blast': {
          // 🚛 Optimus Ion Blast
          ctx.fillStyle = '#60a5fa';
          ctx.beginPath();
          ctx.arc(0, 0, 8, 0, Math.PI * 2);
          ctx.fill();
          break;
        }

        case 'plasma_stinger': {
          // 🐝 Bumblebee Yellow Plasma Bolt
          ctx.fillStyle = '#facc15';
          ctx.beginPath();
          ctx.ellipse(0, 0, 9, 4, 0, 0, Math.PI * 2);
          ctx.fill();
          break;
        }

        case 'magic_orb':
        case 'fireball': {
          const isFire = p.type === 'fireball';
          const radius = isFire ? 9 : 7;
          const orbGlow = ctx.createRadialGradient(0, 0, 1, 0, 0, radius * 2);
          orbGlow.addColorStop(0, '#ffffff');
          orbGlow.addColorStop(0.4, isFire ? '#fb923c' : '#c084fc');
          orbGlow.addColorStop(0.8, isFire ? '#dc2626' : '#9333ea');
          orbGlow.addColorStop(1, 'transparent');
          ctx.fillStyle = orbGlow;
          ctx.beginPath();
          ctx.arc(0, 0, radius * 2, 0, Math.PI * 2);
          ctx.fill();
          break;
        }

        case 'cannonball': {
          ctx.fillStyle = '#1e293b';
          ctx.beginPath();
          ctx.arc(0, 0, 8, 0, Math.PI * 2);
          ctx.fill();
          break;
        }

        case 'bullet': {
          const dx = p.targetX - p.startX;
          const dy = p.targetY - p.startY;
          const angle = Math.atan2(dy, dx);
          ctx.rotate(angle);
          // Tracer bullet glow
          const grad = ctx.createLinearGradient(-12, 0, 8, 0);
          grad.addColorStop(0, 'rgba(251, 191, 36, 0)');
          grad.addColorStop(0.5, '#f59e0b');
          grad.addColorStop(1, '#ffffff');
          ctx.fillStyle = grad;
          ctx.fillRect(-12, -1.5, 20, 3);
          break;
        }

        case 'tank_shell': {
          const dx = p.targetX - p.startX;
          const dy = p.targetY - p.startY;
          const angle = Math.atan2(dy, dx);
          ctx.rotate(angle);
          // Heavy Artillery Shell
          ctx.fillStyle = '#475569';
          ctx.fillRect(-12, -4, 20, 8);
          ctx.fillStyle = '#ea580c';
          ctx.beginPath();
          ctx.moveTo(8, -4);
          ctx.lineTo(16, 0);
          ctx.lineTo(8, 4);
          ctx.closePath();
          ctx.fill();
          // Fiery tail
          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.arc(-8, 0, 3, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
      }

      ctx.restore();
    }
  }

  // ==================== PARTICLES & FX ====================

  private drawParticles(particles: Particle[]) {
    const ctx = this.ctx;

    for (const p of particles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);

      if (p.type === 'explosion') {
        const grad = ctx.createRadialGradient(p.x, p.y, 2, p.x, p.y, p.radius);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.4, '#f59e0b');
        grad.addColorStop(0.8, '#dc2626');
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'coin') {
        ctx.fillStyle = '#fbbf24';
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  private drawFloatingTexts(floatingTexts: FloatingText[]) {
    const ctx = this.ctx;

    for (const t of floatingTexts) {
      ctx.save();
      const alpha = Math.max(0, t.life / t.maxLife);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = t.color;
      ctx.font = `${t.isCrit ? 'bold ' : ''}${t.size}px sans-serif`;
      ctx.textAlign = 'center';

      ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.lineWidth = 2.5;
      ctx.strokeText(t.text, t.x, t.y);
      ctx.fillText(t.text, t.x, t.y);

      ctx.restore();
    }
  }

  private drawFreezeOverlay(time: number) {
    const ctx = this.ctx;
    ctx.save();

    const frostGrad = ctx.createRadialGradient(
      this.width / 2, this.height / 2, this.width * 0.3,
      this.width / 2, this.height / 2, this.width * 0.65
    );
    frostGrad.addColorStop(0, 'transparent');
    frostGrad.addColorStop(0.7, 'rgba(186, 230, 253, 0.25)');
    frostGrad.addColorStop(1, 'rgba(125, 211, 252, 0.55)');
    ctx.fillStyle = frostGrad;
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 35; i++) {
      const sx = (i * 37 + time * 40) % this.width;
      const sy = (i * 29 + time * 65) % this.height;
      ctx.beginPath();
      ctx.arc(sx, sy, 1.5 + (i % 3), 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  private drawFireRainReticle(target: { x: number; y: number }, time: number) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(target.x, target.y);

    const radius = 80;
    const pulse = Math.sin(time * 8) * 4;

    ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
    ctx.beginPath();
    ctx.arc(0, 0, radius + pulse, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, radius + pulse, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-radius - 10, 0);
    ctx.lineTo(radius + 10, 0);
    ctx.moveTo(0, -radius - 10);
    ctx.lineTo(0, radius + 10);
    ctx.stroke();

    ctx.restore();
  }

  // ==================== OBSTACLES RENDERING (ОКОПЫ, МИНЫ, БАРРИКАДЫ) ====================

  private drawObstacle(obs: Obstacle, time: number) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(obs.x, obs.y);

    if (obs.type === 'trench') {
      // 🪖 ОКОП (TRENCH)
      // Ground Excavation Depression Shadow
      ctx.fillStyle = 'rgba(15, 23, 42, 0.45)';
      ctx.beginPath();
      ctx.ellipse(0, 4, 38, 16, 0, 0, Math.PI * 2);
      ctx.fill();

      // Deep dark earthen ditch pit
      const trenchGrad = ctx.createLinearGradient(0, -14, 0, 14);
      trenchGrad.addColorStop(0, '#261b11');
      trenchGrad.addColorStop(0.5, '#170f08');
      trenchGrad.addColorStop(1, '#3b2a1a');
      ctx.fillStyle = trenchGrad;
      ctx.beginPath();
      ctx.ellipse(0, 0, 36, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#4a3520';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Wooden duckboard floorboards in trench bottom
      ctx.fillStyle = '#6b4f35';
      for (let p = -24; p <= 24; p += 8) {
        ctx.fillRect(p - 2, -6, 5, 12);
        ctx.fillStyle = '#261b11';
        ctx.fillRect(p - 1, -4, 2, 2);
        ctx.fillRect(p - 1, 2, 2, 2);
        ctx.fillStyle = '#6b4f35';
      }

      // Layered Sandbags Parapet on the defensive rim
      const bagColors = ['#d4be92', '#c7ae7e', '#b89f6d'];
      const bagPositions = [
        { x: -28, y: -7, w: 16, h: 8 },
        { x: -14, y: -9, w: 16, h: 8 },
        { x: 0, y: -10, w: 16, h: 8 },
        { x: 14, y: -9, w: 16, h: 8 },
        { x: -20, y: -13, w: 15, h: 7 },
        { x: -6, y: -15, w: 15, h: 7 },
        { x: 8, y: -14, w: 15, h: 7 },
      ];

      for (let i = 0; i < bagPositions.length; i++) {
        const bag = bagPositions[i];
        ctx.save();
        ctx.translate(bag.x, bag.y);
        ctx.fillStyle = bagColors[i % bagColors.length];
        ctx.strokeStyle = '#786443';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(bag.w / 2, bag.h / 2, bag.w / 2, bag.h / 2, -0.05, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = '#574830';
        ctx.beginPath();
        ctx.moveTo(bag.w * 0.3, bag.h * 0.2);
        ctx.lineTo(bag.w * 0.4, bag.h * 0.8);
        ctx.stroke();
        ctx.restore();
      }

      // Camo netting stakes and wire on right rim
      ctx.strokeStyle = '#4b5563';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(22, -8);
      ctx.lineTo(26, -18);
      ctx.moveTo(30, -5);
      ctx.lineTo(34, -15);
      ctx.stroke();

      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(20, -12);
      ctx.lineTo(34, -14);
      ctx.stroke();

      // Defensive cover crest tag
      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🛡️ ОКОП (+45% БРОНЯ)', 0, -22);

      // Health bar if damaged
      if (obs.hp < obs.maxHp) {
        this.drawHealthBar(ctx, obs.hp, obs.maxHp, -25, -34, 50, 4, '#3b82f6');
      }
    } else if (obs.type === 'landmine') {
      // 💥 МИНА (LANDMINE)
      // Ground shadow
      ctx.fillStyle = 'rgba(24, 17, 12, 0.6)';
      ctx.beginPath();
      ctx.ellipse(0, 3, 20, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      // Proximity detection ring (pulsing dashed perimeter)
      const pulseRadius = 30 + Math.sin(time * 6) * 3;
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(0, 0, pulseRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Main Outer Steel Disc
      const mineGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, 14);
      mineGrad.addColorStop(0, '#475569');
      mineGrad.addColorStop(0.7, '#334155');
      mineGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = mineGrad;
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(0, 0, 15, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Raised Center Pressure Plate
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.ellipse(0, -1, 9, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // 4 Trigger Spokes
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-7, -1);
      ctx.lineTo(7, -1);
      ctx.moveTo(0, -4.5);
      ctx.lineTo(0, 2.5);
      ctx.stroke();

      // Blinking Hazard Red LED Sensor
      const ledGlow = (Math.sin(time * 10) + 1) / 2;
      ctx.fillStyle = `rgba(239, 68, 68, ${0.4 + ledGlow * 0.6})`;
      ctx.beginPath();
      ctx.arc(0, -1, 3 + ledGlow * 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, -1, 1.2, 0, Math.PI * 2);
      ctx.fill();

      // Stencil warning tag
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 8px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⚠ 300 DMG', 0, -11);
    } else if (obs.type === 'barricade') {
      // 🛑 БАРРИКАДА (BARRICADE)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.ellipse(0, 8, 22, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      // Heavy wooden crossbeams
      ctx.save();
      ctx.rotate(-0.4);
      ctx.fillStyle = '#78350f';
      ctx.fillRect(-6, -26, 12, 32);
      ctx.fillStyle = '#451a03';
      ctx.strokeRect(-6, -26, 12, 32);
      ctx.restore();

      ctx.save();
      ctx.rotate(0.4);
      ctx.fillStyle = '#92400e';
      ctx.fillRect(-6, -26, 12, 32);
      ctx.fillStyle = '#451a03';
      ctx.strokeRect(-6, -26, 12, 32);
      ctx.restore();

      // Center Iron Bracket & Bolts
      ctx.fillStyle = '#475569';
      ctx.fillRect(-8, -16, 16, 12);
      ctx.fillStyle = '#cbd5e1';
      ctx.beginPath();
      ctx.arc(-4, -10, 1.5, 0, Math.PI * 2);
      ctx.arc(4, -10, 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Sharp Forward Spikes
      ctx.fillStyle = '#cbd5e1';
      ctx.beginPath();
      ctx.moveTo(6, -18);
      ctx.lineTo(20, -14);
      ctx.lineTo(6, -10);
      ctx.closePath();
      ctx.fill();

      // Razor wire coil
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let a = 0; a < Math.PI * 4; a += 0.5) {
        const rx = Math.cos(a) * 14;
        const ry = Math.sin(a) * 7 - 12;
        if (a === 0) ctx.moveTo(rx, ry);
        else ctx.lineTo(rx, ry);
      }
      ctx.stroke();

      // Thorns reflection tag
      ctx.fillStyle = '#f87171';
      ctx.font = 'bold 8px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`⚔ ШИПЫ ${obs.damage}`, 0, -30);

      // HP bar
      this.drawHealthBar(ctx, obs.hp, obs.maxHp, -20, -38, 40, 4, '#fb923c');
    }

    ctx.restore();
  }

  private drawObstaclePlacementPreview(type: ObstacleType, pos: { x: number; y: number }, time: number) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(pos.x, pos.y);

    const isValid = pos.x >= 150 && pos.x <= this.width - 110;
    const accentColor = isValid ? '#22c55e' : '#ef4444';
    const bgFill = isValid ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)';

    // Radius boundary ring
    ctx.fillStyle = bgFill;
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.ellipse(0, 0, 36, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.setLineDash([]);

    // Ghost object preview
    ctx.globalAlpha = 0.75;
    if (type === 'trench') {
      ctx.fillStyle = '#3e2e1d';
      ctx.beginPath();
      ctx.ellipse(0, 0, 32, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#d4be92';
      ctx.fillRect(-20, -10, 40, 6);
    } else if (type === 'landmine') {
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.ellipse(0, 0, 14, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(0, 0, 3, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === 'barricade') {
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(-12, -20);
      ctx.lineTo(12, 0);
      ctx.moveTo(12, -20);
      ctx.lineTo(-12, 0);
      ctx.stroke();
    }
    ctx.globalAlpha = 1.0;

    // Floating Tooltip Tag
    const titles: Record<ObstacleType, string> = {
      trench: '⛏ ОКОП (75 ☀️)',
      landmine: '💥 МИНА (45 ☀️)',
      barricade: '🛑 БАРРИКАДА (60 ☀️)'
    };

    ctx.fillStyle = isValid ? '#15803d' : '#991b1b';
    ctx.fillRect(-65, -36, 130, 18);
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 1;
    ctx.strokeRect(-65, -36, 130, 18);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(isValid ? titles[type] : '❌ НЕДОПУСТИМАЯ ЗОНА', 0, -24);

    ctx.restore();
  }

  // ==================== MILITARY SOLDIER & TANK RENDERING ====================

  private renderSoldier(ctx: CanvasRenderingContext2D, w: Warrior, legSwing: number, isAttacking: boolean, time: number) {
    // Combat Boots
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-6 + legSwing, -12, 5, 14);
    ctx.fillRect(1 - legSwing, -12, 5, 14);

    // Camo Pants (Dark Olive)
    ctx.fillStyle = '#3f4f34';
    ctx.fillRect(-6 + legSwing, -14, 5, 5);
    ctx.fillRect(1 - legSwing, -14, 5, 5);

    // Torso Camo Uniform
    ctx.fillStyle = '#4b5e3e';
    ctx.fillRect(-8, -27, 16, 16);

    // Tactical Vest & Mag Pouches
    ctx.fillStyle = '#222d1d';
    ctx.fillRect(-7, -26, 14, 12);
    ctx.fillStyle = '#334155';
    ctx.fillRect(-5, -20, 4, 5);
    ctx.fillRect(1, -20, 4, 5);

    // Head
    ctx.fillStyle = '#fbcfe8';
    ctx.beginPath();
    ctx.arc(0, -32, 6, 0, Math.PI * 2);
    ctx.fill();

    // Kevlar Helmet (Camouflage)
    ctx.fillStyle = '#3d4f32';
    ctx.beginPath();
    ctx.arc(0, -34, 7.5, Math.PI, 0);
    ctx.lineTo(8, -32);
    ctx.lineTo(-8, -32);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Night Vision Goggles / Visor
    ctx.fillStyle = '#06b6d4';
    ctx.fillRect(-2, -34, 8, 3);

    // Assault Rifle Carbine
    ctx.save();
    ctx.translate(6, -20);
    const recoil = isAttacking ? Math.sin(time * 35) * 3 : 0;
    ctx.translate(-recoil, 0);

    // Gun body & barrel
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-4, -2, 16, 4);
    ctx.fillRect(12, -1, 6, 2); // Barrel
    // Magazine
    ctx.fillStyle = '#334155';
    ctx.fillRect(0, 2, 4, 6);
    // Stock
    ctx.fillStyle = '#475569';
    ctx.fillRect(-8, -1, 5, 5);

    // Muzzle Flash when attacking
    if (isAttacking && Math.sin(time * 40) > 0.1) {
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.moveTo(18, -1);
      ctx.lineTo(26, -4);
      ctx.lineTo(24, -1);
      ctx.lineTo(28, 0);
      ctx.lineTo(24, 1);
      ctx.lineTo(26, 4);
      ctx.lineTo(18, 1);
      ctx.closePath();
      ctx.fill();

      // Brass casing particle
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(2, -5, 2, 3);
    }

    ctx.restore();
  }

  private renderTank(ctx: CanvasRenderingContext2D, w: Warrior, isAttacking: boolean, time: number) {
    // Heavy Armored Tank Body (Shadow first)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(0, 8, 38, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Caterpillar Treads (Tracks)
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(-34, -4, 68, 15, 6);
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Rotating Road Wheels inside tracks
    const wheelRot = time * 8;
    for (let i = -24; i <= 24; i += 12) {
      ctx.save();
      ctx.translate(i, 3);
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1;
      ctx.stroke();
      // Spokes
      ctx.rotate(wheelRot);
      ctx.strokeStyle = '#94a3b8';
      ctx.beginPath();
      ctx.moveTo(-4, 0);
      ctx.lineTo(4, 0);
      ctx.moveTo(0, -4);
      ctx.lineTo(0, 4);
      ctx.stroke();
      ctx.restore();
    }

    // Armored Hull (Olive drab camouflage)
    const hullGrad = ctx.createLinearGradient(0, -22, 0, -4);
    hullGrad.addColorStop(0, '#556b2f');
    hullGrad.addColorStop(0.5, '#445626');
    hullGrad.addColorStop(1, '#2f3b1a');
    ctx.fillStyle = hullGrad;
    ctx.beginPath();
    ctx.moveTo(-32, -4);
    ctx.lineTo(-26, -18);
    ctx.lineTo(26, -18);
    ctx.lineTo(34, -4);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#1e2611';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Hull armor rivets
    ctx.fillStyle = '#6b8e23';
    ctx.beginPath();
    ctx.arc(-22, -14, 1.2, 0, Math.PI * 2);
    ctx.arc(-10, -14, 1.2, 0, Math.PI * 2);
    ctx.arc(10, -14, 1.2, 0, Math.PI * 2);
    ctx.arc(22, -14, 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Rotating Turret
    const turretGrad = ctx.createLinearGradient(0, -34, 0, -18);
    turretGrad.addColorStop(0, '#607935');
    turretGrad.addColorStop(1, '#3b4b21');
    ctx.fillStyle = turretGrad;
    ctx.beginPath();
    ctx.roundRect(-18, -32, 34, 15, [6, 8, 2, 2]);
    ctx.fill();
    ctx.strokeStyle = '#1e2611';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Commander Cupola & Hatch
    ctx.fillStyle = '#283416';
    ctx.beginPath();
    ctx.ellipse(-6, -33, 6, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Antenna
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-12, -32);
    ctx.lineTo(-14, -50);
    ctx.stroke();

    // Red star / army emblem on turret
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(4, -25, 3, 0, Math.PI * 2);
    ctx.fill();

    // Massive Cannon with Muzzle Brake & Recoil Animation
    ctx.save();
    ctx.translate(14, -25);
    const cannonRecoil = isAttacking ? Math.sin(time * 25) * 5 : 0;
    ctx.translate(-Math.max(0, cannonRecoil), 0);

    // Gun Mantlet
    ctx.fillStyle = '#2f3b1a';
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fill();

    // Long Heavy Barrel
    ctx.fillStyle = '#475569';
    ctx.fillRect(0, -3, 30, 6);
    ctx.fillStyle = '#1e293b';
    ctx.strokeRect(0, -3, 30, 6);

    // Muzzle Brake
    ctx.fillStyle = '#334155';
    ctx.fillRect(28, -5, 6, 10);

    // Muzzle blast if firing
    if (isAttacking && cannonRecoil > 2) {
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(36, 0, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(36, 0, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Exhaust smoke puffs from rear pipes
    if (Math.sin(time * 10) > 0.4) {
      ctx.fillStyle = 'rgba(148, 163, 184, 0.4)';
      ctx.beginPath();
      ctx.arc(-34, -14, 4, 0, Math.PI * 2);
      ctx.arc(-39, -18, 6, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
