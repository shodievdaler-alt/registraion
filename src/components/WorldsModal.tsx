import React from 'react';
import { DimensionType } from '../types';
import { GAME_WORLDS, WorldInfo } from '../data/gameConfig';
import { soundFx } from '../utils/audio';
import { X, Globe, Sparkles, Check, ArrowRight } from 'lucide-react';

interface WorldsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeWorld: DimensionType;
  onSelectWorld: (world: DimensionType) => void;
}

export const WorldsModal: React.FC<WorldsModalProps> = ({
  isOpen,
  onClose,
  activeWorld,
  onSelectWorld,
}) => {
  if (!isOpen) return null;

  const handleChoose = (world: WorldInfo) => {
    soundFx.playPortalWarp();
    onSelectWorld(world.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-2 border-cyan-500/80 rounded-3xl p-5 sm:p-6 shadow-2xl text-white flex flex-col overflow-hidden">
        {/* Top Header Ribbon */}
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-600 via-cyan-400 to-indigo-600 py-1 px-4 text-center">
          <span className="text-[11px] font-black uppercase tracking-widest text-slate-950 flex items-center justify-center space-x-1.5">
            <Globe className="w-3.5 h-3.5" />
            <span>ПОРТАЛ МУЛЬТИВСЕЛЕННОЙ: ВЫБОР ИЗ 6 МИРОВ И ЗВЁЗДНЫХ ВОЙН</span>
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
            🌌 МИРЫ И ИЗМЕРЕНИЯ
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xl mx-auto">
            Перемещайтесь между мирами: Галактика Звёздных Войн, лавовый Мустафар, ледяной Хот, Мультивселенная Marvel и Киберпанк!
          </p>
        </div>

        {/* Worlds Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-5 overflow-y-auto pr-1">
          {GAME_WORLDS.map(world => {
            const isActive = activeWorld === world.id;

            return (
              <div
                key={world.id}
                onClick={() => handleChoose(world)}
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
                    <span>ТЕКУЩИЙ МИР</span>
                  </div>
                )}

                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-3xl">{world.icon}</span>
                    <div>
                      <h3
                        className="font-extrabold text-sm sm:text-base transition-colors"
                        style={{ color: world.themeColor }}
                      >
                        {world.nameRu}
                      </h3>
                      <span className="text-[10px] text-slate-400 font-mono block">
                        {world.nameEn}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">
                    {world.descriptionRu}
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-slate-800 text-[11px] text-slate-400 flex items-center space-x-1">
                    <span className="font-bold text-slate-300">Особенности:</span>
                    <span className="text-slate-400">{world.featuresRu}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-mono">
                    {world.skySummary}
                  </span>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      handleChoose(world);
                    }}
                    className={`text-xs font-black px-3 py-1.5 rounded-xl transition-all flex items-center space-x-1 ${
                      isActive
                        ? 'bg-cyan-500 text-slate-950 shadow'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 group-hover:bg-cyan-600 group-hover:text-white'
                    }`}
                  >
                    <span>{isActive ? 'Выбрано' : 'Перейти'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
