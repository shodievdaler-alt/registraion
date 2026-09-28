import React, { useState, useEffect, useRef } from 'react';
import { soundEngine } from '../utils/audioSynthesizer';
import { X, RotateCcw, Target, ShieldAlert } from 'lucide-react';

interface PenaltyModeProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PenaltyMode: React.FC<PenaltyModeProps> = ({ isOpen, onClose }) => {
  const [score, setScore] = useState({ goals: 0, misses: 0 });
  const [aimAngle, setAimAngle] = useState(0); // -45 to 45 degrees
  const [power, setPower] = useState(50);
  const [isCharging, setIsCharging] = useState(false);
  const [lastOutcome, setLastOutcome] = useState<string | null>(null);
  const [keeperPos, setKeeperPos] = useState<'center' | 'left' | 'right' | 'afk'>('center');
  const [isShotInFlight, setIsShotInFlight] = useState(false);
  const [ballVisual, setBallVisual] = useState<{ x: number; y: number; scale: number }>({ x: 50, y: 85, scale: 1 });

  const animRef = useRef<number | null>(null);

  // Aim needle oscillator
  useEffect(() => {
    if (!isOpen || isShotInFlight) return;
    let angle = -40;
    let dir = 1;

    const interval = setInterval(() => {
      angle += dir * 2.5;
      if (angle > 40) dir = -1;
      if (angle < -40) dir = 1;
      setAimAngle(angle);
    }, 25);

    return () => clearInterval(interval);
  }, [isOpen, isShotInFlight]);

  // Power charge loop
  useEffect(() => {
    if (!isCharging) return;
    let p = 20;
    let dir = 1;
    const interval = setInterval(() => {
      p += dir * 4;
      if (p > 100) dir = -1;
      if (p < 20) dir = 1;
      setPower(p);
    }, 30);

    return () => clearInterval(interval);
  }, [isCharging]);

  if (!isOpen) return null;

  const handleStartCharge = () => {
    if (isShotInFlight) return;
    setIsCharging(true);
  };

  const handleShoot = () => {
    if (!isCharging || isShotInFlight) return;
    setIsCharging(false);
    setIsShotInFlight(true);

    soundEngine.playKick(power / 100);

    // Random keeper dive direction
    const dives: Array<'left' | 'center' | 'right' | 'afk'> = ['left', 'center', 'right', 'afk'];
    const keeperDive = dives[Math.floor(Math.random() * dives.length)];
    setKeeperPos(keeperDive);

    // Animate ball flying towards goal
    const targetX = 50 + (aimAngle / 40) * 35; // 15% to 85%
    const targetY = power > 85 ? 10 : 35 + (power / 100) * 15; // if over 85 power, skies over crossbar!

    setBallVisual({ x: targetX, y: targetY, scale: 0.45 });

    setTimeout(() => {
      // Determine outcome
      if (power > 85) {
        // Skied over crossbar
        soundEngine.playFail();
        setScore(prev => ({ ...prev, misses: prev.misses + 1 }));
        setLastOutcome('🚀 ВЫШЕ ВОРОТ! Мяч улетел на околоземную орбиту!');
      } else if (
        (keeperDive === 'left' && targetX < 38) ||
        (keeperDive === 'right' && targetX > 62) ||
        (keeperDive === 'center' && targetX >= 38 && targetX <= 62)
      ) {
        // Saved by keeper
        soundEngine.playFoul();
        setScore(prev => ({ ...prev, misses: prev.misses + 1 }));
        setLastOutcome('🧤 СЕЙВ! Вратарь отбил мяч пузом!');
      } else {
        // GOAL!
        soundEngine.playGoalCelebration();
        setScore(prev => ({ ...prev, goals: prev.goals + 1 }));
        setLastOutcome('⚽ ГООООЛ! Вратарь даже не понял, куда лететь!');
      }

      setTimeout(() => {
        setIsShotInFlight(false);
        setBallVisual({ x: 50, y: 85, scale: 1 });
        setKeeperPos('center');
      }, 1500);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-emerald-500 rounded-3xl p-6 shadow-2xl overflow-hidden text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center">
          <span className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase font-bold">
            ПЕНАЛЬТИ КЛОУНАДА 2026
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-amber-400 italic">
            ДУЭЛЬ С ТОЛСТЫМ ВРАТАРЁМ
          </h2>
          <div className="mt-2 flex items-center justify-center space-x-4 text-xs font-mono font-bold">
            <span className="text-emerald-400">ГОЛЫ: {score.goals}</span>
            <span className="text-slate-600">|</span>
            <span className="text-rose-400">ПРОМАХИ: {score.misses}</span>
          </div>
        </div>

        {/* The Penalty Arena Stage */}
        <div className="relative mt-6 w-full h-72 bg-gradient-to-b from-emerald-900 via-emerald-800 to-emerald-700 rounded-2xl border-2 border-emerald-600 overflow-hidden shadow-inner flex flex-col items-center justify-between p-4">
          {/* Goal Frame */}
          <div className="relative w-72 h-36 border-4 border-white bg-black/30 rounded-t-lg shadow-2xl flex items-center justify-center">
            {/* Hex Net Grid */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:8px_8px]" />

            {/* Crossbar label */}
            <span className="absolute -top-6 text-[10px] font-mono text-slate-300 font-bold">
              ПЕРЕКЛАДИНА (РИКОШЕТ 99%)
            </span>

            {/* Goalkeeper */}
            <div
              className={`absolute bottom-0 text-5xl transition-all duration-300 transform select-none ${
                keeperPos === 'left'
                  ? '-translate-x-24 rotate-[-25deg]'
                  : keeperPos === 'right'
                    ? 'translate-x-24 rotate-[25deg]'
                    : keeperPos === 'afk'
                      ? 'opacity-40 scale-75'
                      : 'translate-x-0'
              }`}
            >
              {keeperPos === 'afk' ? '🚶‍♂️' : '🍔🧤'}
            </div>
          </div>

          {/* Ball */}
          <div
            className="absolute text-3xl transition-all duration-500 ease-out select-none pointer-events-none drop-shadow-md"
            style={{
              left: `${ballVisual.x}%`,
              top: `${ballVisual.y}%`,
              transform: `translate(-50%, -50%) scale(${ballVisual.scale})`,
            }}
          >
            ⚽
          </div>

          {/* Aim Direction Arrow (only before shot) */}
          {!isShotInFlight && (
            <div
              className="w-1 h-14 bg-gradient-to-t from-amber-400 to-transparent origin-bottom transition-transform duration-75 absolute bottom-12 left-1/2 -translate-x-1/2"
              style={{ transform: `translateX(-50%) rotate(${aimAngle}deg)` }}
            >
              <div className="w-3 h-3 bg-amber-400 rounded-full mx-auto -mt-1 shadow-lg shadow-amber-400" />
            </div>
          )}

          {/* Outcome Banner */}
          {lastOutcome && (
            <div className="absolute top-4 bg-slate-900/90 border border-amber-400 px-4 py-1.5 rounded-full text-xs font-bold text-amber-300 shadow-xl animate-bounce">
              {lastOutcome}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Power Meter */}
          <div className="w-full sm:w-1/2 flex items-center space-x-2">
            <span className="text-xs font-mono font-bold text-slate-400">СИЛА:</span>
            <div className="flex-1 h-4 bg-slate-800 rounded-full border border-slate-700 overflow-hidden">
              <div
                className={`h-full transition-all duration-75 ${
                  power > 85
                    ? 'bg-rose-600 animate-pulse'
                    : power > 55
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                }`}
                style={{ width: `${power}%` }}
              />
            </div>
            <span className="text-xs font-mono font-bold text-slate-300 w-10 text-right">
              {power}%
            </span>
          </div>

          {/* Action Button */}
          <div className="flex items-center space-x-2">
            <button
              onMouseDown={handleStartCharge}
              onMouseUp={handleShoot}
              onTouchStart={handleStartCharge}
              onTouchEnd={handleShoot}
              disabled={isShotInFlight}
              className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider shadow-lg transition-all active:scale-95 ${
                isCharging
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950'
              }`}
            >
              {isCharging ? 'ОТПУСТИТЕ ДЛЯ УДАРА!' : 'ЗАЖМИТЕ ДЛЯ УДАРА'}
            </button>

            <button
              onClick={() => setScore({ goals: 0, misses: 0 })}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl border border-slate-700 transition-colors"
              title="Сбросить счет"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <p className="text-[11px] text-slate-500 text-center mt-3">
          Совет: если зарядить силу более 85%, мяч с вероятностью 100% улетит за пределы стадиона!
        </p>
      </div>
    </div>
  );
};
