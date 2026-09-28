import React from 'react';
import { Skull, Crown, AlertTriangle } from 'lucide-react';

interface WaveAnnouncerProps {
  waveState: string;
  waveNumber: number;
  prepTimer: number;
  isBossWave: boolean;
  bossDefeatedAlert: boolean;
}

export const WaveAnnouncer: React.FC<WaveAnnouncerProps> = ({
  waveState,
  waveNumber,
  prepTimer,
  isBossWave,
  bossDefeatedAlert,
}) => {
  // 1. Boss Defeated Celebration Banner
  if (bossDefeatedAlert) {
    return (
      <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 pointer-events-none animate-bounce">
        <div className="bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 text-slate-950 font-black px-6 py-3 rounded-2xl shadow-2xl border-2 border-yellow-200 flex items-center space-x-3 text-center">
          <Crown className="w-8 h-8 text-slate-950 animate-spin" />
          <div>
            <div className="text-xl sm:text-2xl uppercase tracking-wider">
              👑 БОСС ПОБЕЖДЁН!
            </div>
            <div className="text-xs sm:text-sm font-bold text-slate-900">
              Королевская награда: +250 ЗОЛОТА!
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Wave Preparation Countdown Banner
  if (waveState === 'prep') {
    return (
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex flex-col items-center animate-fade-in">
        <div className={`px-6 py-3 rounded-2xl backdrop-blur-md shadow-2xl border flex items-center space-x-3 text-center ${
          isBossWave 
            ? 'bg-red-950/90 border-red-500/80 text-red-100 ring-2 ring-red-500/40 animate-pulse' 
            : 'bg-slate-900/90 border-amber-500/50 text-amber-300'
        }`}>
          {isBossWave ? (
            <AlertTriangle className="w-7 h-7 text-red-400 animate-bounce" />
          ) : (
            <Skull className="w-6 h-6 text-amber-400" />
          )}

          <div>
            <h2 className="text-lg sm:text-2xl font-black uppercase tracking-wider">
              {isBossWave ? `⚠️ ВОЛНА ${waveNumber}: ВЛАДЫКА СКВЕРНЫ!` : `ВОЛНА ${waveNumber} НАЧИНАЕТСЯ!`}
            </h2>
            <p className="text-xs sm:text-sm font-medium opacity-90">
              {isBossWave 
                ? 'Приготовьте сильнейших рыцарей и магию — идёт гигантский Босс!' 
                : `Подготовка к атаке: ${Math.ceil(prepTimer)} сек`}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
