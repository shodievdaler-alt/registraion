import React, { useState } from 'react';
import { useTranslation } from '../utils/i18n';
import { soundFx } from '../utils/audio';
import { LanguageSelector } from './LanguageSelector';
import { SkinType, DifficultyType } from '../types';
import { SKIN_DEFINITIONS, DIFFICULTY_CONFIGS } from '../data/gameConfig';
import { SkinImage } from './SkinImage';
import { 
  Swords, 
  Trophy, 
  Sparkles, 
  Flame, 
  Shield, 
  HelpCircle, 
  Volume2, 
  VolumeX, 
  Crown, 
  Coins, 
  ArrowRight,
  Globe,
  Infinity
} from 'lucide-react';

interface MainMenuProps {
  gold: number;
  gems: number;
  crowns: number;
  activeSkin: SkinType;
  difficulty: DifficultyType;
  highScore: number;
  isMuted: boolean;
  onStartCampaign: () => void;
  onStartTournament: () => void;
  onOpenSkins: () => void;
  onEnterMultiversePortal: () => void;
  onStartEndless: () => void;
  onSelectDifficulty: (diff: DifficultyType) => void;
  onOpenGuide: () => void;
  onToggleMute: () => void;
  onPlayFifa?: () => void;
  onOpenMathQuiz?: () => void;
  onOpenWorlds?: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  gold,
  gems,
  crowns,
  activeSkin,
  difficulty,
  highScore,
  isMuted,
  onStartCampaign,
  onStartTournament,
  onOpenSkins,
  onEnterMultiversePortal,
  onStartEndless,
  onSelectDifficulty,
  onOpenGuide,
  onToggleMute,
  onPlayFifa,
  onOpenMathQuiz,
  onOpenWorlds,
}) => {
  const { t } = useTranslation();
  const currentSkin = SKIN_DEFINITIONS.find(s => s.id === activeSkin) || SKIN_DEFINITIONS[0];
  const diffCfg = DIFFICULTY_CONFIGS[difficulty] || DIFFICULTY_CONFIGS.normal;

  return (
    <div className="h-screen w-screen bg-[#070913] text-slate-100 flex flex-col justify-between select-none overflow-hidden relative font-sans">
      
      {/* Background with Dark Atmosphere & Ember Glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-[#0d1326] to-[#080913] opacity-95" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#04060b] to-transparent pointer-events-none" />

      {/* Top Header Bar: Currencies, Equipped Skin & Language */}
      <header className="relative z-20 flex items-center justify-between px-4 sm:px-8 py-3.5 border-b border-amber-900/40 bg-slate-950/80 backdrop-blur-md">
        
        {/* Currencies */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="flex items-center space-x-1.5 bg-amber-950/40 border border-amber-500/40 px-3 py-1 rounded-lg text-xs font-mono font-bold text-amber-300 shadow">
            <Coins className="w-4 h-4 text-amber-400" />
            <span>{Math.floor(gold)}</span>
          </div>
          <div className="flex items-center space-x-1.5 bg-cyan-950/40 border border-cyan-500/40 px-3 py-1 rounded-lg text-xs font-mono font-bold text-cyan-300 shadow">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>{gems}</span>
          </div>
          <div className="flex items-center space-x-1.5 bg-yellow-950/40 border border-yellow-500/40 px-3 py-1 rounded-lg text-xs font-mono font-bold text-yellow-300 shadow">
            <Crown className="w-4 h-4 text-yellow-400" />
            <span>{crowns}</span>
          </div>

          {onOpenMathQuiz && (
            <button
              onClick={onOpenMathQuiz}
              title="Чтобы получить очки и золото, нужно решать примеры!"
              className="flex items-center space-x-1.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs px-2.5 py-1 rounded-lg shadow-md active:scale-95 transition-all animate-pulse"
            >
              <span>🧮</span>
              <span className="hidden sm:inline">Решать примеры</span>
              <span className="text-[10px] bg-black/20 px-1 rounded font-mono">+Очки</span>
            </button>
          )}
        </div>

        {/* Right: Difficulty Selector, Active Skin Badge & Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          
          {/* Difficulty Selector Button */}
          <button
            id="menu-difficulty-btn"
            onClick={() => {
              soundFx.playButtonClick();
              const diffOrder: DifficultyType[] = ['normal', 'hard', 'insane', 'nightmare'];
              const curIdx = diffOrder.indexOf(difficulty);
              const nextDiff = diffOrder[(curIdx + 1) % diffOrder.length];
              onSelectDifficulty(nextDiff);
            }}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all shadow cursor-pointer ${
              difficulty === 'nightmare'
                ? 'bg-purple-950 border-purple-500 text-purple-300 shadow-purple-500/30'
                : difficulty === 'insane'
                  ? 'bg-red-950 border-red-500 text-red-300 shadow-red-500/30'
                  : difficulty === 'hard'
                    ? 'bg-amber-950 border-amber-500 text-amber-300 shadow-amber-500/30'
                    : 'bg-emerald-950 border-emerald-500 text-emerald-300 shadow-emerald-500/30'
            }`}
            title={`Сложность игры: ${diffCfg.nameRu} (${diffCfg.descriptionRu}). Нажмите для смены!`}
          >
            <Swords className="w-3.5 h-3.5" />
            <span className="font-bold">{diffCfg.badge}</span>
            <span className="text-[10px] font-mono opacity-80 hidden sm:inline">({diffCfg.rewardGoldMult}x)</span>
          </button>

          {/* Active Skin Pill */}
          <button
            id="menu-active-skin-btn"
            onClick={() => {
              soundFx.playButtonClick();
              onOpenSkins();
            }}
            className="flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-amber-400/60 px-2.5 py-1 rounded-lg text-xs transition-all shadow"
            title="Сменить облик армии"
          >
            <span className="text-base">{currentSkin.icon}</span>
            <span className="hidden md:inline font-bold text-slate-300">{currentSkin.nameRu}</span>
          </button>

          {/* All Languages Selector */}
          <LanguageSelector compact={false} />

          {/* Sound Mute Toggle */}
          <button
            id="menu-mute-btn"
            onClick={onToggleMute}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition-colors"
            title="Звуковые эффекты"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
          </button>

          {/* Encyclopedia Guide */}
          <button
            id="menu-guide-btn"
            onClick={() => {
              soundFx.playButtonClick();
              onOpenGuide();
            }}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition-colors"
            title="Справка и энциклопедия"
          >
            <HelpCircle className="w-4 h-4 text-cyan-400" />
          </button>
        </div>

      </header>

      {/* Center: Grand Logo & Stick War Legacy Stone Buttons */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 max-w-4xl mx-auto w-full my-auto">
        
        {/* Epic Logo Header */}
        <div className="text-center mb-6 sm:mb-8 animate-fade-in">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold tracking-widest uppercase mb-2 shadow-inner">
            <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>{t('stickWarSub')}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-yellow-500 uppercase tracking-wider drop-shadow-2xl">
            {t('gameTitle')}
          </h1>

          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto mt-2 font-medium">
            Легендарная стратегия в стиле Stick War Legacy: командуй армией, срази боссов и шагни в квантовый портал к Мстителям и Трансформерам!
          </p>
        </div>

        {/* Big Stick War Legacy Style Menu Buttons */}
        <div className="w-full max-w-md space-y-3 sm:space-y-3.5">
          
          {/* Button 0: Play Scuffed FIFA */}
          {onPlayFifa && (
            <button
              id="menu-fifa-btn"
              onClick={() => {
                soundFx.playButtonClick();
                onPlayFifa();
              }}
              className="w-full group relative py-3 px-6 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-emerald-600/30 border-2 border-emerald-300 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <div className="p-1 rounded-lg bg-black/20 text-xl">⚽</div>
                <div className="text-left">
                  <span className="block leading-none">ОЧЕНЬ ПЛОХАЯ ФИФА 98</span>
                  <span className="text-[10px] text-emerald-100 font-bold lowercase tracking-normal">
                    scuffed bootleg edition с багами и взятками
                  </span>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
            </button>
          )}

          {/* Button 1: Campaign */}
          <button
            id="menu-campaign-btn"
            onClick={() => {
              soundFx.playButtonClick();
              onStartCampaign();
            }}
            className="w-full group relative py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-slate-950 font-black text-sm sm:text-base uppercase tracking-wider shadow-xl shadow-amber-500/20 border-t-2 border-amber-300 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <div className="p-1.5 rounded-lg bg-slate-950/20 text-slate-950">
                <Swords className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="block leading-none">{t('campaign')}</span>
                <span className="text-[10px] text-amber-950 font-bold lowercase tracking-normal">
                  12 уровней: Инаморта и Мультивселенная
                </span>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-950 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Button 2: AI Tournament */}
          <button
            id="menu-tournament-btn"
            onClick={() => {
              soundFx.playButtonClick();
              onStartTournament();
            }}
            className="w-full group relative py-3.5 px-6 rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-amber-300 border-2 border-amber-500/50 hover:border-amber-400 font-black text-sm sm:text-base uppercase tracking-wider shadow-lg shadow-black/40 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                <Trophy className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="block leading-none">{t('tournament')}</span>
                <span className="text-[10px] text-slate-400 font-bold lowercase tracking-normal">
                  битва 8 генералов за Корону
                </span>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-amber-400 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Button 3: Portal into the Multiverse (Direct Action!) */}
          <button
            id="menu-portal-btn"
            onClick={() => {
              soundFx.playPortalWarp();
              onEnterMultiversePortal();
            }}
            className="w-full group relative py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-950 via-sky-900 to-indigo-950 hover:from-cyan-900 hover:to-indigo-900 text-cyan-200 border-2 border-cyan-400/70 font-black text-sm sm:text-base uppercase tracking-wider shadow-xl shadow-cyan-500/25 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300">
                <Sparkles className="w-5 h-5 animate-spin" />
              </div>
              <div className="text-left">
                <span className="block leading-none">{t('multiversePortal')}</span>
                <span className="text-[10px] text-cyan-400 font-bold lowercase tracking-normal">
                  войти в портал к Мстителям и Трансформерам!
                </span>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-cyan-300 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Button 4: Armory & Skins */}
          <button
            id="menu-skins-btn"
            onClick={() => {
              soundFx.playButtonClick();
              onOpenSkins();
            }}
            className="w-full group relative py-2.5 px-4 sm:px-6 rounded-xl bg-slate-900/90 hover:bg-slate-850 text-slate-200 border border-slate-700 hover:border-amber-500/60 font-bold text-xs sm:text-sm uppercase tracking-wider shadow-md transition-all hover:scale-[1.01] active:scale-95 flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <SkinImage skin={currentSkin} size="sm" className="!w-10 !h-10 shrink-0 border-amber-500/40 shadow" />
              <div className="text-left">
                <div className="flex items-center space-x-2">
                  <span className="block leading-none">{t('skins')}</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono">
                    {currentSkin.nameRu.split(' ')[0]}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 lowercase tracking-normal">
                  {currentSkin.buffSummary} • {currentSkin.universeNameRu || 'Вселенная'}
                </span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Button 5: Endless Night Mode */}
          <button
            id="menu-endless-btn"
            onClick={() => {
              soundFx.playWaveStart();
              onStartEndless();
            }}
            className="w-full group relative py-2.5 px-6 rounded-xl bg-slate-950/80 hover:bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700 font-semibold text-xs uppercase tracking-wider transition-all flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center space-x-2">
              <Infinity className="w-4 h-4 text-purple-400" />
              <span>{t('endless')}</span>
            </div>
            <span className="text-[10px] font-mono text-amber-400">
              Рекорд: {highScore} очков
            </span>
          </button>

        </div>

      </main>

      {/* Footer Bar */}
      <footer className="relative z-20 flex items-center justify-between px-6 py-2.5 border-t border-slate-800/80 bg-slate-950 text-xs text-slate-500">
        <span>Армия против Зомби: Stick War Multiverse v2.5</span>
        <span>12 Языков Мира • Офлайн Без Сервера</span>
      </footer>

    </div>
  );
};
