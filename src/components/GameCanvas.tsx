import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GameEngine, GameEngineState } from '../utils/gameEngine';
import { GameRenderer } from '../utils/renderer';

interface GameCanvasProps {
  engine: GameEngine;
  state: GameEngineState;
  onCanvasClick?: (x: number, y: number) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  engine,
  state,
  onCanvasClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<GameRenderer | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  // Initialize Canvas & Renderer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    rendererRef.current = new GameRenderer(ctx);

    const updateSize = () => {
      if (!containerRef.current || !canvas) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      const targetWidth = Math.max(800, rect.width);
      const targetHeight = Math.max(450, rect.height);

      canvas.width = targetWidth * dpr;
      canvas.height = targetHeight * dpr;

      ctx.resetTransform?.();
      ctx.scale(dpr, dpr);

      rendererRef.current?.setSize(targetWidth, targetHeight);
      engine.setDimensions(targetWidth, targetHeight);
    };

    updateSize();
    const resizeObserver = new ResizeObserver(() => updateSize());
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [engine]);

  // Main 60 FPS Game Loop
  useEffect(() => {
    let animId: number;

    const renderLoop = (now: number) => {
      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = now;

      // Update engine simulation
      engine.update(dt);

      // Render frame
      if (rendererRef.current && canvasRef.current) {
        const currentState = engine.getState();
        const fireRainTarget = currentState.fireRainAiming ? mousePos : null;

        rendererRef.current.render(
          now / 1000,
          currentState.castle,
          currentState.warriors,
          currentState.zombies,
          currentState.obstacles,
          currentState.projectiles,
          currentState.particles,
          currentState.floatingTexts,
          fireRainTarget,
          currentState.isFreezeActive,
          currentState.screenShake,
          currentState.dimension,
          currentState.activeSkin,
          currentState.activeObstacleAim,
          mousePos
        );
      }

      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [engine, mousePos]);

  // Handle Mouse movement for targeting
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setMousePos(null);
  }, []);

  // Handle Clicks
  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (state.activeObstacleAim) {
      engine.placeObstacle(state.activeObstacleAim, x, y);
    } else if (state.fireRainAiming) {
      engine.triggerAbility('fire_rain', x, y);
    } else if (onCanvasClick) {
      onCanvasClick(x, y);
    }
  }, [engine, state.fireRainAiming, state.activeObstacleAim, onCanvasClick]);

  return (
    <div 
      ref={containerRef} 
      className="relative w-full flex-1 min-h-[380px] sm:min-h-[460px] bg-[#070913] overflow-hidden select-none"
    >
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        className={`w-full h-full block ${state.fireRainAiming || state.activeObstacleAim ? 'cursor-crosshair' : 'cursor-default'}`}
        style={{ touchAction: 'none' }}
      />
    </div>
  );
};
