import React from 'react';
import { FifaEngine } from './FifaEngine';
import { Volume2, VolumeX, RotateCcw, Home, Pause, Play } from 'lucide-react';
import { fifaAudio } from './fifaAudio';

interface FifaScoreboardProps {
  engine: FifaEngine;
  isMuted: boolean;
  onToggleMute: () => void;
  onRestartMatch: () => void;
  onBackToMenu: () => void;
}

export const FifaScoreboard: React.FC<FifaScoreboardProps> = ({
  engine,
  isMuted,
  onToggleMute,
  onRestartMatch,
  onBackToMenu,
}) => {
  const score = engine.score;
  const minutes = Math.floor(score.matchTime / 60);
  const seconds = Math.floor(score.matchTime % 60);
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <header className="w-full bg-slate-900 border-b-2 border-slate-800 px-3 py-2 sm:px-6 sm:py-2.5 flex items-center justify-between shadow-xl select-none z-30">
      {/* Left: Home Club Info */}
      <div className="flex items-center space-x-3">
        <div className="text-2xl sm:text-3xl filter drop-shadow">{engine.homeTeam.flag}</div>
        <div className="hidden sm:flex flex-col">
          <span className="text-sm font-black text-white tracking-wide uppercase">
            {engine.homeTeam.name}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            {engine.homeTeam.stadiumName}
          </span>
        </div>
      </div>

      {/* Center: Electronic Scoreboard */}
      <div className="flex items-center space-x-2 sm:space-x-4 bg-slate-950 px-4 py-1.5 rounded-xl border border-slate-800 shadow-inner">
        <span className="text-sm sm:text-lg font-black text-amber-400 uppercase">
          {engine.homeTeam.shortName}
        </span>

        {/* Digital Score Numbers */}
        <div className="flex items-center space-x-1.5 font-mono text-xl sm:text-3xl font-black bg-black/60 px-3 py-0.5 rounded-lg border border-slate-800 text-emerald-400">
          <span>{score.home}</span>
          <span className="text-slate-600">:</span>
          <span>{score.away}</span>
        </div>

        <span className="text-sm sm:text-lg font-black text-sky-400 uppercase">
          {engine.awayTeam.shortName}
        </span>

        {/* Match Timer */}
        <div className="ml-2 pl-2 border-l border-slate-800 flex flex-col items-center">
          <span className="text-xs sm:text-sm font-mono font-bold text-slate-200">
            {formattedTime}
          </span>
          <span className="text-[9px] font-mono uppercase text-amber-500 font-bold">
            {score.isFinished ? 'МАТЧ ОКОНЧЕН' : score.isHalfTime ? '2-Й ТАЙМ' : '1-Й ТАЙМ'}
          </span>
        </div>
      </div>

      {/* Right: Away Club + Controls */}
      <div className="flex items-center space-x-3">
        <div className="hidden sm:flex flex-col text-right">
          <span className="text-sm font-black text-white tracking-wide uppercase">
            {engine.awayTeam.name}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            Рейтинг: ⭐ {engine.awayTeam.rating}
          </span>
        </div>
        <div className="text-2xl sm:text-3xl filter drop-shadow">{engine.awayTeam.flag}</div>

        <div className="flex items-center space-x-1 pl-2 border-l border-slate-800">
          {/* Pause Toggle */}
          <button
            id="btn-pause-fifa"
            onClick={() => {
              score.isPaused = !score.isPaused;
            }}
            title="Пауза"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 active:scale-95 transition-all"
          >
            {score.isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4" />}
          </button>

          {/* Sound Toggle */}
          <button
            id="btn-mute-fifa"
            onClick={onToggleMute}
            title={isMuted ? 'Включить звук' : 'Выключить звук'}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 active:scale-95 transition-all"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Restart */}
          <button
            id="btn-restart-fifa"
            onClick={onRestartMatch}
            title="Перезапуск матча"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 active:scale-95 transition-all"
          >
            <RotateCcw className="w-4 h-4 text-amber-400" />
          </button>

          {/* Menu */}
          <button
            id="btn-menu-fifa"
            onClick={onBackToMenu}
            title="В главное меню"
            className="p-2 rounded-lg bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-800 active:scale-95 transition-all"
          >
            <Home className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
