import React, { useState } from 'react';
import { TEAMS_DATA } from './fifaData';
import { FifaTeamId } from './types';
import { Trophy, Play, Gift, Target, Volume2, VolumeX, Sparkles, ArrowRightLeft } from 'lucide-react';
import { fifaAudio } from './fifaAudio';

interface FifaMainMenuProps {
  onStartMatch: (homeId: FifaTeamId, awayId: FifaTeamId) => void;
  onOpenPacks: () => void;
  onStartPenalty: (homeId: FifaTeamId, awayId: FifaTeamId) => void;
  onSwitchToOriginalApp?: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const FifaMainMenu: React.FC<FifaMainMenuProps> = ({
  onStartMatch,
  onOpenPacks,
  onStartPenalty,
  onSwitchToOriginalApp,
  isMuted,
  onToggleMute,
}) => {
  const [selectedHome, setSelectedHome] = useState<FifaTeamId>('real');
  const [selectedAway, setSelectedAway] = useState<FifaTeamId>('gazmyas');

  const teamList = Object.values(TEAMS_DATA);
  const homeTeam = TEAMS_DATA[selectedHome];
  const awayTeam = TEAMS_DATA[selectedAway];

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white flex flex-col items-center justify-between p-4 sm:p-8 overflow-y-auto">
      {/* Background Decorative Soccer Circles */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Parody */}
      <header className="w-full max-w-5xl flex items-center justify-between z-10 py-2 border-b border-slate-800/80">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center font-black text-xl italic shadow-lg shadow-red-600/30">
            EA
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-black italic tracking-tighter uppercase text-white">
                SHPORTS <span className="text-emerald-400">ФИФА 98</span>
              </h1>
              <span className="text-[10px] bg-red-600/80 text-white font-mono px-2 py-0.5 rounded-full font-bold">
                SCUFFED BOOTLEG
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              «It's in the trash! Самая плохая версия в истории футбола»
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {onSwitchToOriginalApp && (
            <button
              onClick={onSwitchToOriginalApp}
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center space-x-1.5 transition-all"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">В режим Stick War</span>
            </button>
          )}

          <button
            onClick={onToggleMute}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </header>

      {/* Center Main Stage: Team Selection Matchup */}
      <main className="w-full max-w-5xl my-6 flex flex-col items-center z-10">
        {/* Team Matchup Card */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900/90 backdrop-blur-md p-6 rounded-2xl border-2 border-slate-800 shadow-2xl">
          {/* Home Team Picker */}
          <div className="flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                ДОМАШНЯЯ КОМАНДА (ТЫ)
              </span>
              <span className="text-xs font-mono text-emerald-400">Рейтинг: ⭐ {homeTeam.rating}</span>
            </div>

            <div className="flex items-center space-x-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="text-5xl">{homeTeam.flag}</div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-black text-white truncate">{homeTeam.name}</h3>
                <p className="text-xs text-slate-400 italic mt-0.5 line-clamp-2">{homeTeam.description}</p>
                <div className="text-[10px] font-mono text-slate-500 mt-1">🏟️ {homeTeam.stadiumName}</div>
              </div>
            </div>

            {/* Quick Switch Carousel */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-thin">
              {teamList.map(t => (
                <button
                  key={`home_${t.id}`}
                  onClick={() => {
                    setSelectedHome(t.id);
                    fifaAudio.playKick(0.8);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap border transition-all flex items-center space-x-1.5 ${
                    selectedHome === t.id
                      ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-md scale-105'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  <span>{t.flag}</span>
                  <span>{t.shortName}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Away Team Picker */}
          <div className="flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider">
                ГОСТЕВАЯ КОМАНДА (ИИ)
              </span>
              <span className="text-xs font-mono text-emerald-400">Рейтинг: ⭐ {awayTeam.rating}</span>
            </div>

            <div className="flex items-center space-x-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="text-5xl">{awayTeam.flag}</div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-black text-white truncate">{awayTeam.name}</h3>
                <p className="text-xs text-slate-400 italic mt-0.5 line-clamp-2">{awayTeam.description}</p>
                <div className="text-[10px] font-mono text-slate-500 mt-1">🏟️ {awayTeam.stadiumName}</div>
              </div>
            </div>

            {/* Quick Switch Carousel */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-thin">
              {teamList.map(t => (
                <button
                  key={`away_${t.id}`}
                  onClick={() => {
                    setSelectedAway(t.id);
                    fifaAudio.playKick(0.8);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap border transition-all flex items-center space-x-1.5 ${
                    selectedAway === t.id
                      ? 'bg-sky-500 text-slate-950 border-sky-300 shadow-md scale-105'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  <span>{t.flag}</span>
                  <span>{t.shortName}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          {/* Main Play Match Button */}
          <button
            id="btn-start-match"
            onClick={() => {
              fifaAudio.playWhistle();
              onStartMatch(selectedHome, selectedAway);
            }}
            className="sm:col-span-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black py-4 px-8 rounded-2xl border-2 border-emerald-400 shadow-2xl shadow-emerald-500/25 active:scale-98 transition-all flex items-center justify-center space-x-3 text-lg sm:text-xl"
          >
            <Play className="w-7 h-7 fill-white" />
            <span>ИГРАТЬ МАТЧ (ХАОС И БАГИ)</span>
          </button>

          {/* Penalty Shootout */}
          <button
            id="btn-penalty-mode"
            onClick={() => onStartPenalty(selectedHome, selectedAway)}
            className="bg-slate-800 hover:bg-slate-700 text-white p-4 rounded-xl border border-slate-700 shadow-lg flex items-center space-x-3 transition-all active:scale-95"
          >
            <Target className="w-6 h-6 text-red-400" />
            <div className="text-left">
              <div className="font-bold text-sm">Серия Пенальти</div>
              <div className="text-[11px] text-slate-400">Дуэль с пьяным Дядей Толей</div>
            </div>
          </button>

          {/* Ultimate Team Packs */}
          <button
            id="btn-open-packs"
            onClick={onOpenPacks}
            className="bg-slate-800 hover:bg-slate-700 text-white p-4 rounded-xl border border-slate-700 shadow-lg flex items-center space-x-3 transition-all active:scale-95"
          >
            <Gift className="w-6 h-6 text-amber-400" />
            <div className="text-left">
              <div className="font-bold text-sm">Паки за 0₽ (FUT)</div>
              <div className="text-[11px] text-slate-400">Криро, Магуайр, Пепси</div>
            </div>
          </button>

          {/* Quick Glitch Info */}
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex items-center space-x-3">
            <Sparkles className="w-6 h-6 text-purple-400" />
            <div className="text-left">
              <div className="font-bold text-sm text-purple-300">Встроенные Читы</div>
              <div className="text-[11px] text-slate-400">Т-Поза, Взятки судье, VAR</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Controls & Instructions */}
      <footer className="w-full max-w-5xl text-center text-xs text-slate-500 font-mono py-2 border-t border-slate-800/80">
        Управление: <span className="text-slate-300 font-bold">WASD / Стрелки</span> — Бег |{' '}
        <span className="text-slate-300 font-bold">Пробел</span> — Удар (удерживай силу) |{' '}
        <span className="text-slate-300 font-bold">Z</span> — Пас |{' '}
        <span className="text-slate-300 font-bold">C</span> — Подкат в колено |{' '}
        <span className="text-slate-300 font-bold">E</span> — Дать взятку судье 500₽ |{' '}
        <span className="text-slate-300 font-bold">V</span> — VAR
      </footer>
    </div>
  );
};
