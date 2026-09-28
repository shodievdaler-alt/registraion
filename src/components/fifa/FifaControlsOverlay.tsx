import React from 'react';
import { FifaEngine } from './FifaEngine';
import { 
  ShieldAlert, 
  Tv, 
  DollarSign, 
  Zap, 
  Shuffle, 
  Flame, 
  Footprints,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface FifaControlsOverlayProps {
  engine: FifaEngine;
  onToggleGlitch: (key: keyof FifaEngine['glitches']) => void;
  glitches: FifaEngine['glitches'];
}

export const FifaControlsOverlay: React.FC<FifaControlsOverlayProps> = ({
  engine,
  onToggleGlitch,
  glitches,
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 sm:p-4 z-20">
      {/* Top Ticker: Live Hilarious Commentary */}
      <div className="w-full flex justify-center pointer-events-auto">
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 px-4 py-1.5 rounded-full shadow-lg max-w-xl text-center text-xs sm:text-sm text-slate-200 truncate flex items-center space-x-2">
          <span className="text-red-500 font-bold animate-pulse">● LIVE</span>
          <span className="text-amber-400 font-bold">🎙️</span>
          <span className="font-mono truncate">
            {engine.commentaries[0]?.text || "Матч продолжается! Зрители на трибунах грызут семечки."}
          </span>
        </div>
      </div>

      {/* Middle side buttons for Glitch Toggles & Bribe */}
      <div className="w-full flex justify-between items-center pointer-events-auto">
        {/* Left Cursed Glitches Dock */}
        <div className="flex flex-col space-y-1.5 bg-slate-900/85 backdrop-blur-md p-2 rounded-xl border border-slate-800 shadow-xl">
          <span className="text-[10px] uppercase font-mono font-bold text-amber-400 tracking-wider mb-1 flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-400" /> БАГИ ФИФЫ
          </span>

          <button
            id="btn-glitch-tpose"
            onClick={() => onToggleGlitch('tPose')}
            className={`text-xs px-2.5 py-1 rounded font-bold border transition-all text-left flex items-center justify-between ${
              glitches.tPose 
                ? 'bg-purple-600 text-white border-purple-400' 
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
            }`}
          >
            <span>🧍 Т-Поза</span>
            <span className="text-[9px] opacity-70 ml-2">{glitches.tPose ? 'ВКЛ' : 'ВЫКЛ'}</span>
          </button>

          <button
            id="btn-glitch-moon"
            onClick={() => onToggleGlitch('moonGravity')}
            className={`text-xs px-2.5 py-1 rounded font-bold border transition-all text-left flex items-center justify-between ${
              glitches.moonGravity 
                ? 'bg-blue-600 text-white border-blue-400' 
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
            }`}
          >
            <span>🌙 Луна (Гравитация)</span>
            <span className="text-[9px] opacity-70 ml-2">{glitches.moonGravity ? 'ВКЛ' : 'ВЫКЛ'}</span>
          </button>

          <button
            id="btn-glitch-speed"
            onClick={() => onToggleGlitch('superSpeed')}
            className={`text-xs px-2.5 py-1 rounded font-bold border transition-all text-left flex items-center justify-between ${
              glitches.superSpeed 
                ? 'bg-amber-600 text-white border-amber-400' 
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
            }`}
          >
            <span>⚡ Спиды x2.5</span>
            <span className="text-[9px] opacity-70 ml-2">{glitches.superSpeed ? 'ВКЛ' : 'ВЫКЛ'}</span>
          </button>

          <button
            id="btn-glitch-gk"
            onClick={() => onToggleGlitch('drunkGoalkeeper')}
            className={`text-xs px-2.5 py-1 rounded font-bold border transition-all text-left flex items-center justify-between ${
              glitches.drunkGoalkeeper 
                ? 'bg-pink-600 text-white border-pink-400' 
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
            }`}
          >
            <span>🍺 Пьяный Вратарь</span>
            <span className="text-[9px] opacity-70 ml-2">{glitches.drunkGoalkeeper ? 'ВКЛ' : 'ВЫКЛ'}</span>
          </button>

          <button
            id="btn-glitch-ice"
            onClick={() => onToggleGlitch('iceSkating')}
            className={`text-xs px-2.5 py-1 rounded font-bold border transition-all text-left flex items-center justify-between ${
              glitches.iceSkating 
                ? 'bg-cyan-600 text-white border-cyan-400' 
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
            }`}
          >
            <span>⛸️ Каток (Скольжение)</span>
            <span className="text-[9px] opacity-70 ml-2">{glitches.iceSkating ? 'ВКЛ' : 'ВЫКЛ'}</span>
          </button>
        </div>

        {/* Right Action buttons: VAR & Bribe */}
        <div className="flex flex-col space-y-2">
          <button
            id="btn-bribe-ref"
            onClick={() => engine.bribeReferee()}
            title="Дать взятку судье 500₽ (клавиша E)"
            className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold p-2.5 rounded-xl border border-emerald-400 shadow-xl flex items-center space-x-1.5 transition-all text-xs sm:text-sm"
          >
            <DollarSign className="w-4 h-4 text-emerald-200" />
            <span className="hidden sm:inline">Взятка судье 500₽ [E]</span>
            <span className="sm:hidden font-mono">500₽</span>
          </button>

          <button
            id="btn-trigger-var"
            onClick={() => engine.triggerVar()}
            title="Вызвать видеоповтор VAR (клавиша V)"
            className="bg-sky-600 hover:bg-sky-500 active:scale-95 text-white font-bold p-2.5 rounded-xl border border-sky-400 shadow-xl flex items-center space-x-1.5 transition-all text-xs sm:text-sm"
          >
            <Tv className="w-4 h-4 text-sky-200" />
            <span className="hidden sm:inline">VAR Повтор [V]</span>
            <span className="sm:hidden font-mono">VAR</span>
          </button>
        </div>
      </div>

      {/* Bottom Virtual Controls (D-Pad on left, Action buttons on right) */}
      <div className="w-full flex justify-between items-end pointer-events-auto pb-1">
        {/* Virtual D-Pad (Touch/Mobile Friendly) */}
        <div className="grid grid-cols-3 gap-1 bg-slate-900/80 backdrop-blur-md p-2 rounded-2xl border border-slate-800 shadow-2xl">
          <div />
          <button
            id="dpad-up"
            onPointerDown={() => (engine.input.up = true)}
            onPointerUp={() => (engine.input.up = false)}
            onPointerLeave={() => (engine.input.up = false)}
            className="w-11 h-11 bg-slate-800 hover:bg-slate-700 active:bg-amber-600 text-white rounded-xl flex items-center justify-center border border-slate-700 active:scale-95"
          >
            <ChevronUp className="w-6 h-6" />
          </button>
          <div />

          <button
            id="dpad-left"
            onPointerDown={() => (engine.input.left = true)}
            onPointerUp={() => (engine.input.left = false)}
            onPointerLeave={() => (engine.input.left = false)}
            className="w-11 h-11 bg-slate-800 hover:bg-slate-700 active:bg-amber-600 text-white rounded-xl flex items-center justify-center border border-slate-700 active:scale-95"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            id="dpad-sprint"
            onPointerDown={() => (engine.input.sprint = true)}
            onPointerUp={() => (engine.input.sprint = false)}
            onPointerLeave={() => (engine.input.sprint = false)}
            className="w-11 h-11 bg-amber-700 hover:bg-amber-600 active:bg-amber-500 text-amber-200 rounded-xl flex items-center justify-center border border-amber-500 text-[10px] font-bold"
          >
            БЕГ
          </button>
          <button
            id="dpad-right"
            onPointerDown={() => (engine.input.right = true)}
            onPointerUp={() => (engine.input.right = false)}
            onPointerLeave={() => (engine.input.right = false)}
            className="w-11 h-11 bg-slate-800 hover:bg-slate-700 active:bg-amber-600 text-white rounded-xl flex items-center justify-center border border-slate-700 active:scale-95"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <div />
          <button
            id="dpad-down"
            onPointerDown={() => (engine.input.down = true)}
            onPointerUp={() => (engine.input.down = false)}
            onPointerLeave={() => (engine.input.down = false)}
            className="w-11 h-11 bg-slate-800 hover:bg-slate-700 active:bg-amber-600 text-white rounded-xl flex items-center justify-center border border-slate-700 active:scale-95"
          >
            <ChevronDown className="w-6 h-6" />
          </button>
          <div />
        </div>

        {/* Keyboard Hints & Virtual Action Buttons */}
        <div className="flex items-center space-x-2">
          {/* Switch Player Button */}
          <button
            id="action-btn-switch"
            onClick={() => engine.switchPlayer()}
            className="w-14 h-14 bg-slate-800 hover:bg-slate-700 active:bg-indigo-600 text-slate-200 rounded-2xl border border-slate-700 shadow-xl flex flex-col items-center justify-center transition-all active:scale-95"
          >
            <Shuffle className="w-5 h-5 text-indigo-400" />
            <span className="text-[9px] font-mono font-bold mt-0.5">СМЕНА [Q]</span>
          </button>

          {/* Pass Button */}
          <button
            id="action-btn-pass"
            onClick={() => engine.passBall()}
            className="w-14 h-14 bg-blue-700 hover:bg-blue-600 active:bg-blue-500 text-white rounded-2xl border border-blue-500 shadow-xl flex flex-col items-center justify-center transition-all active:scale-95"
          >
            <Footprints className="w-5 h-5 text-blue-200" />
            <span className="text-[9px] font-mono font-bold mt-0.5">ПАС [Z]</span>
          </button>

          {/* Slide Tackle Button */}
          <button
            id="action-btn-tackle"
            onClick={() => engine.slideTackle()}
            className="w-14 h-14 bg-amber-700 hover:bg-amber-600 active:bg-amber-500 text-white rounded-2xl border border-amber-500 shadow-xl flex flex-col items-center justify-center transition-all active:scale-95"
          >
            <ShieldAlert className="w-5 h-5 text-amber-200" />
            <span className="text-[9px] font-mono font-bold mt-0.5">ПОДКАТ [C]</span>
          </button>

          {/* Shoot Button (Long Press for Power!) */}
          <button
            id="action-btn-shoot"
            onPointerDown={() => {
              engine.input.isChargingShoot = true;
              engine.input.shootCharge = 0;
            }}
            onPointerUp={() => engine.releaseShoot()}
            onPointerLeave={() => {
              if (engine.input.isChargingShoot) engine.releaseShoot();
            }}
            className="w-16 h-16 bg-gradient-to-tr from-red-700 to-red-500 hover:from-red-600 hover:to-red-400 active:scale-95 text-white rounded-2xl border-2 border-red-300 shadow-2xl flex flex-col items-center justify-center transition-all"
          >
            <Flame className="w-6 h-6 text-yellow-300 animate-pulse" />
            <span className="text-[10px] font-black tracking-tight mt-0.5">УДАР [ПРОБЕЛ]</span>
          </button>
        </div>
      </div>
    </div>
  );
};
