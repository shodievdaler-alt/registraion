import React from 'react';
import { StadiumWorld } from '../types/scuffedFifa';
import { STADIUM_WORLDS, StadiumWorldConfig } from '../data/fifaData';
import { soundEngine } from '../utils/audioSynthesizer';
import { X, Globe, Sparkles, Check, Swords, Shield } from 'lucide-react';

interface StadiumWorldsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeWorld: StadiumWorld;
  onSelectWorld: (world: StadiumWorld) => void;
  onQuickStarWarsMatch?: () => void;
}

export const StadiumWorldsModal: React.FC<StadiumWorldsModalProps> = ({
  isOpen,
  onClose,
  activeWorld,
  onSelectWorld,
  onQuickStarWarsMatch,
}) => {
  if (!isOpen) return null;

  const handleSelect = (world: StadiumWorldConfig) => {
    soundEngine.playSiuuu();
    onSelectWorld(world.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-3xl max-h-[92vh] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-2 border-cyan-500/80 rounded-3xl p-5 sm:p-6 shadow-2xl text-white flex flex-col overflow-hidden">
        
        {/* Top Header Ribbon */}
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-600 via-cyan-400 to-indigo-600 py-1 px-4 text-center">
          <span className="text-[11px] font-black uppercase tracking-widest text-slate-950 flex items-center justify-center space-x-1.5">
            <Globe className="w-3.5 h-3.5" />
            <span>СТАДИОНЫ И МИРЫ: ЗВЁЗДНЫЕ ВОЙНЫ, ЛАВА, ЛЁД И КИБЕРПАНК</span>
            <Sparkles className="w-3.5 h-3.5" />
          </span>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="mt-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-400">
            🌌 ВЫБОР МИРА И СТАДИОНА
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xl mx-auto">
            Перенесите футбольный матч в открытый космос Звезды Смерти, раскалённую лаву Мустафара, ледники Хота или пески Татуина!
          </p>
        </div>

        {/* Quick Star Wars Match Banner */}
        {onQuickStarWarsMatch && (
          <div className="mt-4 bg-gradient-to-r from-red-950/70 via-slate-900 to-blue-950/70 border border-amber-500/50 rounded-2xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center space-x-3">
              <span className="text-2xl sm:text-3xl">⚔️</span>
              <div className="text-left">
                <span className="text-xs font-black text-amber-300 uppercase tracking-wide block">
                  Звёздные Войны: Битва за Галактику!
                </span>
                <span className="text-[11px] text-slate-300">
                  Матч: 🗡️ Орден Джедаев (Йода, Оби-Ван) против 🔴 Галактической Империи (Вейдер, Палпатин)!
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                onQuickStarWarsMatch();
                onClose();
              }}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all shrink-0 flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <Swords className="w-4 h-4" />
              <span>Играть Звёздными Войнами!</span>
            </button>
          </div>
        )}

        {/* Stadium Worlds Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-4 overflow-y-auto pr-1">
          {STADIUM_WORLDS.map(world => {
            const isActive = activeWorld === world.id;

            return (
              <div
                key={world.id}
                onClick={() => handleSelect(world)}
                className={`relative rounded-2xl p-4 border-2 transition-all cursor-pointer flex flex-col justify-between group hover:scale-[1.02] shadow-lg ${
                  isActive
                    ? 'bg-cyan-950/60 border-cyan-400 ring-2 ring-cyan-400/50 shadow-cyan-500/20'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-600'
                }`}
              >
                {/* Active Indicator */}
                {isActive && (
                  <div className="absolute top-3 right-3 bg-cyan-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center space-x-1 shadow">
                    <Check className="w-3 h-3 stroke-[3]" />
                    <span>ВЫБРАН</span>
                  </div>
                )}

                <div>
                  <div className="flex items-center space-x-2">
                    <h3
                      className="font-extrabold text-sm sm:text-base transition-colors"
                      style={{ color: world.themeColor }}
                    >
                      {world.badge}
                    </h3>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                    {world.nameEn}
                  </span>

                  <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">
                    {world.descriptionRu}
                  </p>

                  <div className="mt-3 flex items-center space-x-1.5 text-[10px] text-amber-300 font-mono bg-black/40 px-2 py-1 rounded-lg border border-white/5">
                    <span>📣</span>
                    <span className="truncate">{world.crowdCheer}</span>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-400 font-mono">
                    Трение: {world.friction}
                  </span>
                  <span
                    className={`font-black text-[11px] uppercase ${
                      isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-white'
                    }`}
                  >
                    {isActive ? 'АКТИВЕН' : 'ВЫБРАТЬ ➔'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
