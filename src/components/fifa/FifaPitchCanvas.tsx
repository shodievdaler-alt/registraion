import React, { useRef, useEffect } from 'react';
import { FifaEngine } from './FifaEngine';
import { FifaPlayer } from './types';

interface FifaPitchCanvasProps {
  engine: FifaEngine;
}

export const FifaPitchCanvas: React.FC<FifaPitchCanvasProps> = ({ engine }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      // Update Engine
      engine.update(dt);

      // Render Canvas
      drawPitch(ctx, engine);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [engine]);

  const drawPitch = (ctx: CanvasRenderingContext2D, eng: FifaEngine) => {
    const w = 1000;
    const h = 600;

    ctx.save();
    ctx.clearRect(0, 0, w, h);

    // 1. Grass Base with Striping
    const stripeWidth = 60;
    for (let x = 0; x < w; x += stripeWidth) {
      const isEven = Math.floor(x / stripeWidth) % 2 === 0;
      ctx.fillStyle = isEven ? '#15803d' : '#166534';
      ctx.fillRect(x, 0, stripeWidth, h);
    }

    // Dirt/Wear patches on penalty boxes and center (dvor/scuffed aesthetic)
    ctx.fillStyle = 'rgba(120, 53, 15, 0.22)';
    ctx.beginPath();
    ctx.ellipse(80, 300, 45, 90, 0, 0, Math.PI * 2);
    ctx.ellipse(920, 300, 45, 90, 0, 0, Math.PI * 2);
    ctx.ellipse(500, 300, 70, 70, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. White Markings (Chalk)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 3;

    // Pitch borders
    ctx.strokeRect(45, 35, 910, 530);

    // Halfway line
    ctx.beginPath();
    ctx.moveTo(500, 35);
    ctx.lineTo(500, 565);
    ctx.stroke();

    // Center circle & spot
    ctx.beginPath();
    ctx.arc(500, 300, 70, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(500, 300, 4, 0, Math.PI * 2);
    ctx.fill();

    // Left Penalty Box
    ctx.strokeRect(45, 170, 140, 260);
    ctx.strokeRect(45, 230, 55, 140);
    ctx.beginPath();
    ctx.arc(140, 300, 3, 0, Math.PI * 2);
    ctx.fill();

    // Right Penalty Box
    ctx.strokeRect(815, 170, 140, 260);
    ctx.strokeRect(900, 230, 55, 140);
    ctx.beginPath();
    ctx.arc(860, 300, 3, 0, Math.PI * 2);
    ctx.fill();

    // Corner arcs
    [
      [45, 35, 0, Math.PI / 2],
      [45, 565, -Math.PI / 2, 0],
      [955, 35, Math.PI / 2, Math.PI],
      [955, 565, Math.PI, (3 * Math.PI) / 2],
    ].forEach(([cx, cy, sa, ea]) => {
      ctx.beginPath();
      ctx.arc(cx as number, cy as number, 15, sa as number, ea as number);
      ctx.stroke();
    });

    // 3. Goals & Nets
    // Left Goal
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.fillRect(10, 235, 35, 130);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 235, 35, 130);
    // Left net mesh
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1;
    for (let gy = 245; gy < 365; gy += 12) {
      ctx.beginPath();
      ctx.moveTo(10, gy);
      ctx.lineTo(45, gy);
      ctx.stroke();
    }
    for (let gx = 15; gx < 45; gx += 10) {
      ctx.beginPath();
      ctx.moveTo(gx, 235);
      ctx.lineTo(gx, 365);
      ctx.stroke();
    }

    // Right Goal
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.fillRect(955, 235, 35, 130);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.strokeRect(955, 235, 35, 130);
    // Right net mesh
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1;
    for (let gy = 245; gy < 365; gy += 12) {
      ctx.beginPath();
      ctx.moveTo(955, gy);
      ctx.lineTo(990, gy);
      ctx.stroke();
    }
    for (let gx = 960; gx < 990; gx += 10) {
      ctx.beginPath();
      ctx.moveTo(gx, 235);
      ctx.lineTo(gx, 365);
      ctx.stroke();
    }

    // 4. Ball Shadow & Trail
    if (eng.ball.trail.length > 0) {
      eng.ball.trail.forEach(t => {
        ctx.fillStyle = `rgba(245, 158, 11, ${t.alpha * 0.4})`;
        ctx.beginPath();
        ctx.arc(t.x, t.y, eng.ball.radius * 0.85, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // Ball ground shadow
    const shadowScale = Math.max(0.3, 1 - eng.ball.z / 120);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(eng.ball.x, eng.ball.y + 4, eng.ball.radius * shadowScale, eng.ball.radius * 0.5 * shadowScale, 0, 0, Math.PI * 2);
    ctx.fill();

    // 5. Draw Referee
    drawReferee(ctx, eng);

    // 6. Draw Players (Sorted by Y for depth)
    const allPlayers = [...eng.homePlayers, ...eng.awayPlayers].sort((a, b) => a.y - b.y);
    allPlayers.forEach(p => {
      drawPlayer(ctx, p, eng);
    });

    // 7. Draw Ball (Above players if in the air)
    drawBall(ctx, eng);

    // 8. Draw Explosions / Particles
    eng.particles.forEach(pt => {
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.size * (pt.life / pt.maxLife), 0, Math.PI * 2);
      ctx.fill();
    });

    // 9. Goal Celebration Banner / SIUUU Jump
    if (eng.goalCelebration && eng.goalCelebration.active) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 220, w, 160);

      ctx.fillStyle = '#facc15';
      ctx.font = '900 48px Impact, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⚡ ГООООООООЛ! ⚡', 500, 280);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px system-ui, sans-serif';
      ctx.fillText(`${eng.goalCelebration.scorerName} (${eng.goalCelebration.teamName})`, 500, 320);

      ctx.fillStyle = '#ef4444';
      ctx.font = 'italic bold 16px monospace';
      ctx.fillText('«СИИИИУУУУУУУУУУ!» — кричит весь двор', 500, 350);
    }

    // 10. VAR Overlay Screen
    if (eng.varModal && eng.varModal.active) {
      drawVarScreen(ctx, eng);
    }

    ctx.restore();
  };

  const drawPlayer = (ctx: CanvasRenderingContext2D, p: FifaPlayer, eng: FifaEngine) => {
    ctx.save();
    ctx.translate(p.x, p.y);

    const isHome = p.team === 'home';
    const teamCfg = isHome ? eng.homeTeam : eng.awayTeam;
    const isControlled = p.id === eng.controlledPlayerId;

    // Controlled Player Ring & Arrow Indicator
    if (isControlled) {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.ellipse(0, 4, 18, 9, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Overhead triangle arrow
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(0, -32);
      ctx.lineTo(-6, -42);
      ctx.lineTo(6, -42);
      ctx.closePath();
      ctx.fill();

      // Shooting Power Bar if charging
      if (eng.input.isChargingShoot && eng.input.shootCharge > 0) {
        const barWidth = 36;
        const barHeight = 6;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(-barWidth / 2, -50, barWidth, barHeight);

        const chargePct = eng.input.shootCharge / 100;
        ctx.fillStyle = chargePct > 0.85 ? '#ef4444' : chargePct > 0.5 ? '#f59e0b' : '#22c55e';
        ctx.fillRect(-barWidth / 2 + 1, -49, (barWidth - 2) * chargePct, barHeight - 2);
      }
    }

    // Player Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
    ctx.beginPath();
    ctx.ellipse(0, 4, 12, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Ragdoll / Fallen state (hilarious spinning flat)
    if (p.isFallen) {
      ctx.rotate(p.ragdollAngle);
      ctx.fillStyle = teamCfg.primaryColor;
      ctx.fillRect(-10, -5, 20, 10);
      ctx.fillStyle = p.skinColor;
      ctx.beginPath();
      ctx.arc(14, 0, 7, 0, Math.PI * 2);
      ctx.fill();

      // Dizzy stars over head
      ctx.fillStyle = '#facc15';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('💫', 12, -10);
      ctx.restore();
      return;
    }

    // T-Pose Glitch Mode!
    if (eng.glitches.tPose || p.isTPosing) {
      ctx.fillStyle = teamCfg.primaryColor;
      // Body
      ctx.fillRect(-7, -18, 14, 18);
      // T-Pose Arms stretched wide
      ctx.fillStyle = teamCfg.secondaryColor;
      ctx.fillRect(-22, -16, 44, 5);
      // Head
      ctx.fillStyle = p.skinColor;
      ctx.beginPath();
      ctx.arc(0, -24, 7, 0, Math.PI * 2);
      ctx.fill();
      // Face
      ctx.fillStyle = '#000000';
      ctx.fillRect(-3, -25, 2, 2);
      ctx.fillRect(1, -25, 2, 2);
      ctx.restore();
      return;
    }

    // Slide tackle animation
    if (p.isTackling) {
      ctx.fillStyle = teamCfg.primaryColor;
      ctx.fillRect(-14, -6, 28, 8);
      ctx.fillStyle = p.skinColor;
      ctx.beginPath();
      ctx.arc(16, -3, 6, 0, Math.PI * 2);
      ctx.fill();
      // Grass dust
      ctx.fillStyle = '#86efac';
      ctx.fillRect(-18, 0, 4, 3);
      ctx.fillRect(-22, 2, 5, 2);
      ctx.restore();
      return;
    }

    // Regular Running Player Figure
    const walkBob = Math.sin(Date.now() / 90 + p.x * 0.1) * (Math.hypot(p.vx, p.vy) > 10 ? 2 : 0);

    // Legs / Boots
    const legOffset = Math.sin(Date.now() / 70) * 4;
    ctx.fillStyle = '#000000'; // Boots
    ctx.fillRect(-5 + legOffset, 1, 4, 4);
    ctx.fillRect(2 - legOffset, 1, 4, 4);

    // Shorts
    ctx.fillStyle = teamCfg.secondaryColor;
    ctx.fillRect(-7, -7 + walkBob, 14, 8);

    // Jersey / Torso
    ctx.fillStyle = teamCfg.primaryColor;
    ctx.fillRect(-8, -18 + walkBob, 16, 12);

    // Jersey Number
    ctx.fillStyle = teamCfg.textColor;
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(p.number.toString(), 0, -9 + walkBob);

    // Head
    ctx.fillStyle = p.skinColor;
    ctx.beginPath();
    ctx.arc(0, -23 + walkBob, 6, 0, Math.PI * 2);
    ctx.fill();

    // Hair
    ctx.fillStyle = p.hairColor;
    if (p.hairStyle === 'afro') {
      ctx.beginPath();
      ctx.arc(0, -25 + walkBob, 8, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.hairStyle === 'cap') {
      ctx.fillStyle = teamCfg.secondaryColor;
      ctx.fillRect(-7, -29 + walkBob, 14, 5);
    } else if (p.hairStyle !== 'bald') {
      ctx.fillRect(-6, -28 + walkBob, 12, 4);
    }

    // Cards above head
    if (p.cards === 'yellow') {
      ctx.fillStyle = '#facc15';
      ctx.fillRect(8, -32, 5, 8);
    } else if (p.cards === 'red') {
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(8, -32, 5, 8);
    }

    ctx.restore();
  };

  const drawReferee = (ctx: CanvasRenderingContext2D, eng: FifaEngine) => {
    const ref = eng.referee;
    ctx.save();
    ctx.translate(ref.x, ref.y);

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(0, 4, 10, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Black shorts
    ctx.fillStyle = '#171717';
    ctx.fillRect(-5, -6, 10, 7);

    // Neon Yellow Ref Jersey
    ctx.fillStyle = '#eab308';
    ctx.fillRect(-6, -16, 12, 11);

    // Head
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(0, -21, 5, 0, Math.PI * 2);
    ctx.fill();

    // Whistle in mouth
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(2, -20, 4, 2);

    // Card in hand
    if (ref.cardInHand) {
      ctx.fillStyle = ref.cardInHand === 'red' ? '#ef4444' : '#facc15';
      ctx.fillRect(6, -34, 7, 12);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.strokeRect(6, -34, 7, 12);
    }

    ctx.restore();
  };

  const drawBall = (ctx: CanvasRenderingContext2D, eng: FifaEngine) => {
    const b = eng.ball;
    ctx.save();
    ctx.translate(b.x, b.y - b.z);

    // Rotating ball texture
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, b.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Black Pentagons
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(0, 0, b.radius * 0.45, 0, Math.PI * 2);
    ctx.fill();

    // Fire trail if super power shot
    if (b.vz > 50 || Math.hypot(b.vx, b.vy) > 350) {
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(-b.vx * 0.02, -b.vy * 0.02, b.radius * 0.6, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  };

  const drawVarScreen = (ctx: CanvasRenderingContext2D, eng: FifaEngine) => {
    const w = 1000;
    const h = 600;

    // Dark vintage overlay
    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.fillRect(0, 0, w, h);

    // Old CRT TV Box
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 8;
    ctx.strokeRect(260, 100, 480, 340);
    ctx.fillRect(260, 100, 480, 340);

    // Screen content
    ctx.fillStyle = '#020617';
    ctx.fillRect(280, 120, 440, 260);

    // Scanlines
    ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
    for (let y = 120; y < 380; y += 4) {
      ctx.fillRect(280, y, 440, 2);
    }

    // Funny image in the VAR TV
    ctx.font = '64px sans-serif';
    ctx.textAlign = 'center';
    const emoji = eng.varModal?.imageType === 'cat' ? '🐱' : eng.varModal?.imageType === 'tv' ? '📺' : '👟';
    ctx.fillText(emoji, 500, 240);

    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 20px monospace';
    ctx.fillText('🔴 [VAR REPLAY] ПРОВЕРКА ЭПИЗОДА...', 500, 290);

    ctx.fillStyle = '#38bdf8';
    ctx.font = '14px monospace';
    ctx.fillText('Камера №3: Домофон подъезда №2 (Разрешение 144p)', 500, 320);

    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText(eng.varModal?.decision || 'Судья принимает неадекватное решение...', 500, 355);
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-slate-950 select-none overflow-hidden">
      <canvas
        ref={canvasRef}
        width={1000}
        height={600}
        className="w-full max-w-[1000px] h-auto rounded-xl shadow-2xl border-4 border-slate-800 object-contain aspect-[5/3]"
      />
    </div>
  );
};
