import React from 'react';
import { GameSettings, TeamConfig, SoccerBall } from '../types/scuffedFifa';
import { TEAMS } from '../data/fifaData';
import { X, Sparkles, Sliders, Shield, Zap } from 'lucide-react';

interface GlitchSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  currentHomeTeamId: string;
  currentAwayTeamId: string;
  onChangeTeams: (homeId: string, awayId: string) => void;
  onSpawnBall: (type: SoccerBall['type']) => void;
  onMassRagdoll: () => void;
  onTriggerBrawl: () => void;
  onSpawnDog: () => void;
  onSpawnStreaker: () => void;
}

export const GlitchSettingsModal: React.FC<GlitchSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  currentHomeTeamId,
  currentAwayTeamId,
  onChangeTeams,
  onSpawnBall,
  onMassRagdoll,
  onTriggerBrawl,
  onSpawnDog,
  onSpawnStreaker,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-slate-700 rounded-3xl p-6 shadow-2xl overflow-hidden text-white max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center">
          <span className="text-[10px] font-mono tracking-widest text-amber-400 uppercase font-bold flex items-center justify-center space-x-1">
            <Sliders className="w-3.5 h-3.5" />
            <span>ЛАБОРАТОРИЯ БАГОВ & ЧИТОВ FIFA 26</span>
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white italic">
            НАСТРОЙКИ ПОЛОМАННОЙ ФИЗИКИ
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Здесь можно превратить матч в абсолютный цирк: добавить 10 мячей, включить лед или заставить всех кувыркаться.
          </p>
        </div>

        {/* Section 1: Teams Selection */}
        <div className="mt-6 p-4 rounded-2xl bg-slate-800/60 border border-slate-700">
          <h3 className="text-sm font-bold text-slate-200 flex items-center space-x-1.5 mb-3">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Выбор команд (Эль Классико позора)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Хозяева поля:</label>
              <select
                value={currentHomeTeamId}
                onChange={e => onChangeTeams(e.target.value, currentAwayTeamId)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:border-amber-400 outline-none"
              >
                {TEAMS.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.badgeEmoji} {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Гости поля:</label>
              <select
                value={currentAwayTeamId}
                onChange={e => onChangeTeams(currentHomeTeamId, e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:border-amber-400 outline-none"
              >
                {TEAMS.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.badgeEmoji} {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Spawn Special Balls */}
        <div className="mt-4 p-4 rounded-2xl bg-slate-800/60 border border-slate-700">
          <h3 className="text-sm font-bold text-slate-200 flex items-center space-x-1.5 mb-3">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Заспавнить особый мяч прямо на поле</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={() => onSpawnBall('normal')}
              className="bg-slate-900 hover:bg-slate-800 p-2.5 rounded-xl border border-slate-700 text-xs font-bold flex flex-col items-center gap-1 transition-colors"
            >
              <span className="text-2xl">⚽</span>
              <span>Классический</span>
            </button>

            <button
              onClick={() => onSpawnBall('cube')}
              className="bg-slate-900 hover:bg-slate-800 p-2.5 rounded-xl border border-slate-700 text-xs font-bold flex flex-col items-center gap-1 transition-colors"
            >
              <span className="text-2xl">🎲</span>
              <span>Мяч-Куб (Рикошет)</span>
            </button>

            <button
              onClick={() => onSpawnBall('watermelon')}
              className="bg-slate-900 hover:bg-slate-800 p-2.5 rounded-xl border border-slate-700 text-xs font-bold flex flex-col items-center gap-1 transition-colors"
            >
              <span className="text-2xl">🍉</span>
              <span>Сочный Арбуз</span>
            </button>

            <button
              onClick={() => onSpawnBall('bowling')}
              className="bg-slate-900 hover:bg-slate-800 p-2.5 rounded-xl border border-slate-700 text-xs font-bold flex flex-col items-center gap-1 transition-colors"
            >
              <span className="text-2xl">🎳</span>
              <span>Боулинг</span>
            </button>

            <button
              onClick={() => onSpawnBall('death_star')}
              className="bg-slate-900 hover:bg-slate-800 p-2.5 rounded-xl border border-cyan-500/50 text-xs font-bold flex flex-col items-center gap-1 transition-colors"
            >
              <span className="text-2xl">🌌</span>
              <span className="text-cyan-300">Звезда Смерти</span>
            </button>

            <button
              onClick={() => onSpawnBall('lightsaber')}
              className="bg-slate-900 hover:bg-slate-800 p-2.5 rounded-xl border border-amber-500/50 text-xs font-bold flex flex-col items-center gap-1 transition-colors"
            >
              <span className="text-2xl">⚔️</span>
              <span className="text-amber-300">Световой шар</span>
            </button>
          </div>
        </div>

        {/* Section 3: Gameplay Toggles */}
        <div className="mt-4 p-4 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-3">
          <h3 className="text-sm font-bold text-slate-200 flex items-center space-x-1.5">
            <Zap className="w-4 h-4 text-rose-400" />
            <span>Параметры багов</span>
          </h3>

          {/* Maguire Mode */}
          <div className="flex items-center justify-between">
            <div>
              <span className="font-bold text-xs text-white block">Режим Гарри Магуайра</span>
              <span className="text-[11px] text-slate-400">
                Защитники чаще отдают голевые пасы сопернику и забивают в свои ворота
              </span>
            </div>
            <input
              type="checkbox"
              checked={settings.maguireMode}
              onChange={e => onUpdateSettings({ maguireMode: e.target.checked })}
              className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
            />
          </div>

          {/* Ice Field */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-700/60">
            <div>
              <span className="font-bold text-xs text-white block">Ледяной газон (Трение 0%)</span>
              <span className="text-[11px] text-slate-400">
                Все игроки и мяч скользят как шайба в хоккее
              </span>
            </div>
            <input
              type="checkbox"
              checked={settings.fieldFriction > 0.99}
              onChange={e =>
                onUpdateSettings({ fieldFriction: e.target.checked ? 0.996 : 0.985 })
              }
              className="w-5 h-5 accent-cyan-500 rounded cursor-pointer"
            />
          </div>

          {/* EA Scripting */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-700/60">
            <div>
              <span className="font-bold text-xs text-white block">Скрипты EA (Гандикап)</span>
              <span className="text-[11px] text-slate-400">
                Магическая помощь проигрывающей команде на последних секундах
              </span>
            </div>
            <input
              type="checkbox"
              checked={settings.eaScriptingActive}
              onChange={e => onUpdateSettings({ eaScriptingActive: e.target.checked })}
              className="w-5 h-5 accent-yellow-500 rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Chaos Triggers Grid */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            onClick={() => {
              onSpawnDog();
              onClose();
            }}
            className="bg-amber-600 hover:bg-amber-500 text-white font-black text-xs py-2.5 px-3 rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center space-x-1.5"
          >
            <span>🐕</span>
            <span>Выпустить собаку!</span>
          </button>

          <button
            onClick={() => {
              onTriggerBrawl();
              onClose();
            }}
            className="bg-rose-600 hover:bg-rose-500 text-white font-black text-xs py-2.5 px-3 rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center space-x-1.5"
          >
            <span>🥊</span>
            <span>Стенка на стенку!</span>
          </button>

          <button
            onClick={() => {
              onSpawnStreaker();
              onClose();
            }}
            className="bg-pink-600 hover:bg-pink-500 text-white font-black text-xs py-2.5 px-3 rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center space-x-1.5"
          >
            <span>🏃‍♂️</span>
            <span>Выпустить стрикера!</span>
          </button>
        </div>

        {/* Mass Ragdoll Action Button */}
        <div className="mt-3 flex justify-center">
          <button
            onClick={onMassRagdoll}
            className="w-full bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-xs py-3 rounded-2xl shadow-xl active:scale-95 transition-all"
          >
            💥 СБИТЬ ВСЕХ ИГРОКОВ НА ПОЛЕ (МАССОВЫЙ КУВЫРОК) 💥
          </button>
        </div>
      </div>
    </div>
  );
};
