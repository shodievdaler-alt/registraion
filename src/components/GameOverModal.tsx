import React from 'react';
import { GameStats } from '../types';
import { Skull, Trophy, RotateCcw, Award, Coins, Swords } from 'lucide-react';

interface GameOverModalProps {
  isOpen: boolean;
  stats: GameStats;
  onRestart: () => void;
  onBackToMenu?: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  stats,
  onRestart,
  onBackToMenu,
}) => {
  if (!isOpen) return null;

  const isNewHighScore = stats.score > 0 && stats.score >= stats.highScore;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-slate-900 border-2 border-red-600/80 rounded-2xl w-full max-w-md p-6 shadow-2xl text-center relative overflow-hidden">
        
        {/* Ambient Dark Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Skull Icon */}
        <div className="w-16 h-16 rounded-2xl bg-red-950/80 border border-red-500/50 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-red-950/50">
          <Skull className="w-9 h-9 text-red-500 animate-pulse" />
        </div>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-black text-red-500 uppercase tracking-wider mb-1">
          КРЕПОСТЬ ПАЛА
        </h2>
        <p className="text-xs text-slate-400 mb-6">
          Орда зомби прорвала ворота цитадели... Королевство в осаде!
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2.5 mb-6 text-left">
          
          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center space-x-1.5 text-slate-400 text-xs mb-1">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Волна</span>
            </div>
            <div className="text-xl font-mono font-black text-amber-400">
              {stats.wave}
            </div>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center space-x-1.5 text-slate-400 text-xs mb-1">
              <Skull className="w-4 h-4 text-rose-400" />
              <span>Зомби убито</span>
            </div>
            <div className="text-xl font-mono font-black text-rose-400">
              {stats.zombiesKilled}
            </div>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center space-x-1.5 text-slate-400 text-xs mb-1">
              <Coins className="w-4 h-4 text-yellow-400" />
              <span>Золото</span>
            </div>
            <div className="text-xl font-mono font-black text-yellow-400">
              {Math.floor(stats.totalGoldEarned)} 🪙
            </div>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center space-x-1.5 text-slate-400 text-xs mb-1">
              <Swords className="w-4 h-4 text-blue-400" />
              <span>Воинов призвано</span>
            </div>
            <div className="text-xl font-mono font-black text-blue-400">
              {stats.warriorsSummoned}
            </div>
          </div>

        </div>

        {/* Scores summary */}
        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 mb-6">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Финальный счёт:</span>
            <span className="text-base font-mono font-black text-white">{stats.score}</span>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center space-x-1">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Рекорд:</span>
            </span>
            <span className="text-base font-mono font-black text-amber-400">
              {stats.highScore}
            </span>
          </div>

          {isNewHighScore && (
            <div className="mt-2 text-xs font-bold text-amber-400 bg-amber-500/10 py-1 rounded border border-amber-500/30">
              🎉 НОВЫЙ РЕКОРД!
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            id="gameover-restart-btn"
            onClick={onRestart}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center space-x-2 shadow-xl shadow-red-950/60 active:scale-95 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Играть снова</span>
          </button>

          {onBackToMenu && (
            <button
              id="gameover-menu-btn"
              onClick={onBackToMenu}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              В Главное Меню
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
