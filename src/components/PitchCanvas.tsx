import React, { useEffect, useRef } from 'react';
import { MatchEngineState, FifaPhysicsEngine } from '../utils/fifaPhysicsEngine';
import { FifaRenderer } from '../utils/fifaRenderer';
import { FCMobileControls } from './FCMobileControls';

interface PitchCanvasProps {
  engine: FifaPhysicsEngine;
  state: MatchEngineState;
}

export const PitchCanvas: React.FC<PitchCanvasProps> = ({ engine, state }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Resize canvas according to container
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current || !canvasRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvasRef.current.width = rect.width * dpr;
      canvasRef.current.height = rect.height * dpr;
    };

    handleResize();
    const observer = new ResizeObserver(handleResize);
    if (containerRef.current) observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, []);

  // Main Render Loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      // Update Engine
      engine.update(dt);

      // Render to canvas
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          FifaRenderer.render(ctx, engine.state, canvasRef.current.width, canvasRef.current.height);
        }
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [engine]);

  // Handle canvas click to switch player or perform kick/pass
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 1200;
    const clickY = ((e.clientY - rect.top) / rect.height) * 700;

    // Check if clicked directly on any home player
    const homePlayers = engine.state.players.filter(p => p.team === 'home' && !p.hasRedCard);
    const clickedPlayer = homePlayers.find(p => {
      const dist = Math.hypot(p.x - clickX, p.y - clickY);
      return dist < 36;
    });

    if (clickedPlayer) {
      engine.switchControlledPlayer(clickedPlayer.id);
      return;
    }

    // Direct kick towards click
    const controlled = engine.state.players.find(p => p.isControlled);
    if (controlled) {
      const dx = clickX - controlled.x;
      const dy = clickY - controlled.y;
      controlled.vx = dx * 0.05;
      controlled.vy = dy * 0.05;
      engine.state.kickCharge = 0.65;
      engine.performKick();
    }
  };

  const controlledPlayer = state.players.find(p => p.isControlled);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[65vh] min-h-[480px] max-h-[740px] bg-slate-950 flex items-center justify-center overflow-hidden cursor-crosshair select-none"
    >
      <canvas
        ref={canvasRef}
        onMouseDown={handleCanvasMouseDown}
        className="w-full h-full block"
      />

      {/* Controlled Player HUD Pill in Corner */}
      {controlledPlayer && (
        <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-sm border border-amber-500/40 px-3 py-1.5 rounded-xl shadow-lg flex items-center space-x-2 pointer-events-none">
          <span className="text-base">{state.homeTeam.badgeEmoji}</span>
          <span className="text-xs font-black text-white">{state.homeTeam.shortName}:</span>
          <span className="text-xs font-extrabold text-amber-300 font-mono">
            {controlledPlayer.name} #{controlledPlayer.number}
          </span>
          <span className="text-[10px] bg-slate-800 text-cyan-300 px-1.5 py-0.5 rounded border border-slate-700">
            {controlledPlayer.role === 'goalkeeper' ? 'ВРАТАРЬ' : controlledPlayer.role === 'defender' ? 'ЗАЩИТНИК' : controlledPlayer.role === 'midfielder' ? 'ПОЛУЗАЩИТНИК' : 'НАПАДАЮЩИЙ'}
          </span>
        </div>
      )}

      {/* Control Hint Footer */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/75 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-700/80 text-[11px] text-slate-300 hidden lg:flex items-center space-x-2 pointer-events-none shadow-lg z-20">
        <span><kbd className="bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 text-amber-300 font-mono">WASD</kbd> Бег</span>
        <span className="text-slate-600">•</span>
        <span><kbd className="bg-amber-950 text-amber-300 px-1.5 py-0.5 rounded border border-amber-700 font-mono font-bold">Shift / E</kbd> Спринт (Бесплатно)</span>
        <span className="text-slate-600">•</span>
        <span><kbd className="bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 text-amber-300 font-mono">Пробел</kbd> Удар</span>
        <span className="text-slate-600">•</span>
        <span><kbd className="bg-blue-950 text-blue-300 px-1.5 py-0.5 rounded border border-blue-700 font-mono font-bold">X / F</kbd> Пас</span>
        <span className="text-slate-600">•</span>
        <span><kbd className="bg-cyan-950 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-800 font-mono font-bold">Q / Tab</kbd> Смена игрока</span>
      </div>

      {/* FC Mobile Virtual Joystick & Action Buttons Overlay */}
      <FCMobileControls engine={engine} />

      {/* Goal Celebration Overlay */}
      {state.isGoalCelebration && (
        <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px] animate-in fade-in zoom-in duration-300">
          <div className="text-center p-6 rounded-3xl bg-slate-900/90 border-4 border-amber-400 shadow-2xl">
            <span className="text-5xl sm:text-7xl font-black text-amber-400 tracking-tighter drop-shadow-[0_5px_15px_rgba(245,158,11,0.6)] animate-bounce block">
              ⚽ ГООООООООЛ! 🚀
            </span>
            <span className="text-lg sm:text-2xl font-black text-white mt-2 block">
              {state.lastScorerName}
            </span>
            <div className="mt-3 inline-block bg-slate-800 px-4 py-1 rounded-full border border-slate-700 text-xs font-mono text-emerald-400">
              Повтор отменен (EA требует $1.99 за просмотр)
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
