import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FifaPhysicsEngine } from '../utils/fifaPhysicsEngine';
import { Zap, CircleDot, ArrowUpRight, RefreshCw, Shield, Eye, EyeOff } from 'lucide-react';

interface FCMobileControlsProps {
  engine: FifaPhysicsEngine;
}

export const FCMobileControls: React.FC<FCMobileControlsProps> = ({ engine }) => {
  const [joystickPos, setJoystickPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isSprinting, setIsSprinting] = useState(false);
  const [isChargingShot, setIsChargingShot] = useState(false);
  const [shotCharge, setShotCharge] = useState(0);
  const [showControls, setShowControls] = useState(true);

  const joystickBaseRef = useRef<HTMLDivElement>(null);
  const touchIdRef = useRef<number | null>(null);
  const chargeAnimRef = useRef<number | null>(null);

  // Sync sprint state to engine
  const handleSprintChange = useCallback((sprint: boolean) => {
    setIsSprinting(sprint);
    engine.isSprintActive = sprint;
    // update joystick input with new sprint
    if (isDragging) {
      engine.setJoystickInput(joystickPos.x, joystickPos.y, sprint);
    }
  }, [engine, isDragging, joystickPos]);

  // Handle Shot Charging loop
  useEffect(() => {
    if (!isChargingShot) {
      if (chargeAnimRef.current) cancelAnimationFrame(chargeAnimRef.current);
      setShotCharge(0);
      return;
    }

    let start = performance.now();
    const tick = () => {
      const elapsed = (performance.now() - start) / 1000;
      const charge = Math.min(1.0, elapsed * 1.5);
      setShotCharge(charge);
      engine.state.kickCharge = charge;
      chargeAnimRef.current = requestAnimationFrame(tick);
    };

    chargeAnimRef.current = requestAnimationFrame(tick);
    return () => {
      if (chargeAnimRef.current) cancelAnimationFrame(chargeAnimRef.current);
    };
  }, [isChargingShot, engine]);

  // Virtual Joystick handlers (Touch & Pointer)
  const updateJoystick = (clientX: number, clientY: number) => {
    if (!joystickBaseRef.current) return;
    const rect = joystickBaseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const maxRadius = 45; // max pixels knob moves
    let dx = clientX - centerX;
    let dy = clientY - centerY;
    const dist = Math.hypot(dx, dy);

    if (dist > maxRadius) {
      dx = (dx / dist) * maxRadius;
      dy = (dy / dist) * maxRadius;
    }

    const normX = dx / maxRadius;
    const normY = dy / maxRadius;

    setJoystickPos({ x: normX, y: normY });
    engine.setJoystickInput(normX, normY, engine.isSprintActive || isSprinting);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    updateJoystick(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    e.preventDefault();
    updateJoystick(e.clientX, e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    setJoystickPos({ x: 0, y: 0 });
    engine.setJoystickInput(0, 0, engine.isSprintActive || isSprinting);
  };

  // Action Button Handlers
  const handleShootDown = (e: React.PointerEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsChargingShot(true);
    engine.state.isChargingKick = true;
    engine.state.kickCharge = 0.2;
  };

  const handleShootUp = (e: React.PointerEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isChargingShot) {
      engine.performKick();
      engine.state.isChargingKick = false;
      engine.state.kickCharge = 0;
      setIsChargingShot(false);
      setShotCharge(0);
    }
  };

  return (
    <>
      {/* Visibility Toggle Button */}
      <button
        id="btn-toggle-fc-controls"
        onClick={() => setShowControls(!showControls)}
        title="Переключить экранное управление FC Mobile"
        className="absolute top-3 right-3 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 px-2.5 py-1.5 rounded-xl shadow-lg backdrop-blur-sm text-xs font-semibold flex items-center space-x-1.5 transition-all z-20"
      >
        {showControls ? <EyeOff className="w-3.5 h-3.5 text-cyan-400" /> : <Eye className="w-3.5 h-3.5 text-amber-400" />}
        <span className="hidden sm:inline">FC Mobile {showControls ? 'Скрыть' : 'Кнопки'}</span>
      </button>

      {showControls && (
        <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-4 sm:p-6 overflow-hidden">
          {/* Top Center: Power Bar when shooting */}
          {isChargingShot && (
            <div className="self-center mt-2 bg-slate-900/90 border border-slate-700 px-4 py-2 rounded-2xl shadow-2xl flex flex-col items-center animate-in fade-in zoom-in duration-150 pointer-events-none">
              <span className="text-[11px] font-black text-amber-400 tracking-wider uppercase mb-1">
                ⚽ СИЛА УДАРА: {Math.round(shotCharge * 100)}%
              </span>
              <div className="w-44 h-3.5 bg-slate-950 rounded-full overflow-hidden border border-slate-700 p-0.5 shadow-inner">
                <div
                  className="h-full rounded-full transition-all duration-75"
                  style={{
                    width: `${shotCharge * 100}%`,
                    background: shotCharge > 0.85
                      ? 'linear-gradient(90deg, #eab308, #ef4444)'
                      : 'linear-gradient(90deg, #22c55e, #eab308)',
                  }}
                />
              </div>
            </div>
          )}

          {/* Bottom Controls Row: Joystick on Left, Action Buttons on Right */}
          <div className="mt-auto w-full flex items-end justify-between select-none">
            {/* Left: Virtual Thumbstick */}
            <div className="pointer-events-auto flex flex-col items-center">
              <div
                ref={joystickBaseRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                className={`relative w-28 h-28 sm:w-32 sm:h-32 rounded-full border-2 ${
                  isDragging
                    ? 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_25px_rgba(34,211,238,0.3)]'
                    : 'border-slate-600/60 bg-slate-900/50'
                } backdrop-blur-md flex items-center justify-center cursor-grab active:cursor-grabbing touch-none transition-colors duration-150`}
              >
                {/* Crosshair guide lines */}
                <div className="absolute w-full h-[1px] bg-slate-700/40 pointer-events-none" />
                <div className="absolute h-full w-[1px] bg-slate-700/40 pointer-events-none" />

                {/* Movable Knob */}
                <div
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 ${
                    isDragging
                      ? 'bg-cyan-500 border-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.8)] scale-110'
                      : 'bg-slate-700/80 border-slate-400'
                  } flex items-center justify-center transition-transform duration-75 pointer-events-none`}
                  style={{
                    transform: `translate(${joystickPos.x * 42}px, ${joystickPos.y * 42}px)`,
                  }}
                >
                  <div className="w-3.5 h-3.5 rounded-full bg-white/80" />
                </div>
              </div>
              <span className="text-[10px] font-bold text-slate-400/90 mt-1.5 uppercase tracking-wider">
                Бег / Джойстик
              </span>
            </div>

            {/* Right: FC Mobile Action Diamond Buttons */}
            <div className="pointer-events-auto flex items-end gap-2 sm:gap-3">
              {/* Secondary Controls Column (Switch & Slide) */}
              <div className="flex flex-col gap-2">
                {/* Switch Player Button */}
                <button
                  id="btn-fc-switch"
                  onClick={() => engine.switchControlledPlayer()}
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-cyan-600/90 hover:bg-cyan-500 active:scale-90 border-2 border-cyan-300 text-white shadow-lg flex flex-col items-center justify-center backdrop-blur-sm transition-all"
                  title="Сменить игрока [Q / Tab]"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span className="text-[9px] font-extrabold uppercase mt-0.5 leading-none">Смена</span>
                </button>

                {/* Slide / Tackle Button */}
                <button
                  id="btn-fc-slide"
                  onClick={() => engine.triggerMaguireSlide()}
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-purple-600/90 hover:bg-purple-500 active:scale-90 border-2 border-purple-300 text-white shadow-lg flex flex-col items-center justify-center backdrop-blur-sm transition-all"
                  title="Подкат / Отбор [Z]"
                >
                  <Shield className="w-4 h-4" />
                  <span className="text-[9px] font-extrabold uppercase mt-0.5 leading-none">Отбор</span>
                </button>
              </div>

              {/* Primary Pass Button */}
              <button
                id="btn-fc-pass"
                onClick={() => engine.performPass()}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-blue-600/90 hover:bg-blue-500 active:scale-90 border-2 border-blue-300 text-white shadow-[0_4px_15px_rgba(37,99,235,0.4)] flex flex-col items-center justify-center backdrop-blur-sm transition-all"
                title="Пас партнеру [X / F]"
              >
                <ArrowUpRight className="w-5 h-5" />
                <span className="text-[10px] font-black uppercase mt-0.5 tracking-wide">Пас</span>
                <span className="text-[8px] opacity-70 font-mono">[X]</span>
              </button>

              {/* Primary Shoot Button */}
              <button
                id="btn-fc-shoot"
                onPointerDown={handleShootDown}
                onPointerUp={handleShootUp}
                onPointerCancel={handleShootUp}
                className="w-16 h-16 sm:w-18 sm:h-18 rounded-3xl bg-rose-600/95 hover:bg-rose-500 active:scale-95 border-2 border-rose-300 text-white shadow-[0_4px_20px_rgba(225,29,72,0.5)] flex flex-col items-center justify-center backdrop-blur-sm transition-all cursor-pointer"
                title="Удар по воротам (Зажми для силы) [Пробел]"
              >
                <CircleDot className="w-5 h-5 animate-pulse" />
                <span className="text-[11px] font-black uppercase tracking-wider mt-0.5">Удар</span>
                <span className="text-[8px] opacity-75 font-mono">[Пробел]</span>
              </button>

              {/* Sprint / Turbo Speed Button (Hold for free turbo boost!) */}
              <button
                id="btn-fc-sprint"
                onPointerDown={(e) => {
                  e.preventDefault();
                  handleSprintChange(true);
                }}
                onPointerUp={(e) => {
                  e.preventDefault();
                  handleSprintChange(false);
                }}
                onPointerLeave={() => handleSprintChange(false)}
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-3xl ${
                  isSprinting
                    ? 'bg-amber-400 border-amber-100 text-slate-950 scale-105 shadow-[0_0_25px_rgba(251,191,36,0.8)]'
                    : 'bg-amber-500/90 hover:bg-amber-400 active:scale-90 border-2 border-amber-300 text-slate-950 shadow-[0_4px_15px_rgba(245,158,11,0.4)]'
                } flex flex-col items-center justify-center backdrop-blur-sm transition-all`}
                title="Бесплатный спринт / Ускорение (Зажми) [Shift / E]"
              >
                <Zap className={`w-5 h-5 ${isSprinting ? 'fill-current animate-bounce' : ''}`} />
                <span className="text-[10px] font-black uppercase mt-0.5 tracking-wide">Спринт</span>
                <span className="text-[8px] opacity-75 font-mono">[Shift]</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
