import React, { useState } from 'react';
import { CampaignLevel, DimensionType, DifficultyType } from '../types';
import { CAMPAIGN_LEVELS, DIFFICULTY_CONFIGS } from '../data/gameConfig';
import { useTranslation } from '../utils/i18n';
import { soundFx } from '../utils/audio';
import { 
  ArrowLeft, 
  Star, 
  Lock, 
  Play, 
  Shield, 
  Coins, 
  Sparkles, 
  Skull, 
  Flame, 
  ChevronRight,
  Globe2
} from 'lucide-react';

interface CampaignMapProps {
  currentLevelId: number;
  unlockedLevelId: number;
  onSelectLevel: (level: CampaignLevel, difficulty: DifficultyType) => void;
  onBackToMenu: () => void;
}

export const CampaignMap: React.FC<CampaignMapProps> = ({
  currentLevelId,
  unlockedLevelId,
  onSelectLevel,
  onBackToMenu,
}) => {
  const { t } = useTranslation();
  const [selectedLevelId, setSelectedLevelId] = useState<number>(() => {
    return Math.min(unlockedLevelId, 12);
  });
  const [difficulty, setDifficulty] = useState<DifficultyType>('normal');

  const selectedLevel = CAMPAIGN_LEVELS.find(l => l.id === selectedLevelId) || CAMPAIGN_LEVELS[0];

  const handleLevelClick = (lvl: CampaignLevel) => {
    if (lvl.id > unlockedLevelId) {
      soundFx.playButtonClick();
      return;
    }
    soundFx.playButtonClick();
    setSelectedLevelId(lvl.id);
  };

  const handleStartBattle = () => {
    soundFx.playWaveStart();
    onSelectLevel(selectedLevel, difficulty);
  };

  const diffCfg = DIFFICULTY_CONFIGS[difficulty] || DIFFICULTY_CONFIGS.normal;
  const rewardGold = Math.round(selectedLevel.rewardGold * diffCfg.rewardGoldMult);
  const rewardGems = Math.round(selectedLevel.rewardGems * diffCfg.rewardGemsMult);

  return (
    <div className="h-screen w-screen bg-[#070913] text-slate-100 flex flex-col select-none overflow-hidden relative font-sans">
      
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-[#0d1326] to-[#080a14] opacity-90" />

      {/* Decorative Starry / Multiverse Glows */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <header className="relative z-20 flex items-center justify-between px-4 sm:px-8 py-4 border-b border-amber-900/40 bg-slate-950/80 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              soundFx.playButtonClick();
              onBackToMenu();
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/40 transition-colors shadow"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs font-bold uppercase">{t('returnToMenu')}</span>
          </button>
          <div className="h-5 w-px bg-slate-800 mx-1" />
          <h1 className="text-base sm:text-xl font-black text-amber-300 uppercase tracking-widest drop-shadow flex items-center space-x-2">
            <span>🗺️ {t('campaign')}</span>
            <span className="text-xs text-slate-400 font-mono font-normal">
              (12 Эпических Уровней)
            </span>
          </h1>
        </div>

        {/* Territory Indicators */}
        <div className="flex items-center space-x-2">
          <span className="text-xs px-2.5 py-1 rounded-lg bg-amber-950/60 border border-amber-500/40 text-amber-300 font-bold hidden sm:inline-flex items-center space-x-1">
            <span>🏰 Инаморта (1-6)</span>
          </span>
          <span className="text-xs px-2.5 py-1 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 font-bold hidden sm:inline-flex items-center space-x-1">
            <span>🌀 Мультивселенная (7-12)</span>
          </span>
        </div>
      </header>

      {/* Main Campaign Stage Selector & Map Content */}
      <div className="relative z-10 flex-1 flex flex-col md:flex-row overflow-hidden p-4 sm:p-6 gap-6">
        
        {/* Left: 12 Stages Map Grid */}
        <div className="flex-1 bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 sm:p-5 flex flex-col overflow-hidden backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3 text-xs font-bold text-slate-400">
            <span>ВЫБЕРИТЕ УРОВЕНЬ НА КАРТЕ ВОЙНЫ</span>
            <span className="text-amber-400">
              Открыто: {Math.min(unlockedLevelId, 12)} / 12
            </span>
          </div>

          {/* Level Nodes Grid */}
          <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 scrollbar-thin scrollbar-thumb-slate-800">
            {CAMPAIGN_LEVELS.map((lvl) => {
              const isUnlocked = lvl.id <= unlockedLevelId;
              const isSelected = lvl.id === selectedLevelId;
              const isMultiverse = lvl.dimension === 'multiverse';
              const isBoss = !!lvl.bossType || lvl.id === 6 || lvl.id === 12;

              return (
                <div
                  key={lvl.id}
                  id={`level-node-${lvl.id}`}
                  onClick={() => handleLevelClick(lvl)}
                  className={`relative p-3 rounded-xl border-2 transition-all flex flex-col justify-between select-none cursor-pointer group ${
                    isSelected
                      ? isMultiverse
                        ? 'bg-cyan-950/60 border-cyan-400 shadow-lg shadow-cyan-500/20 scale-[1.02]'
                        : 'bg-amber-950/60 border-amber-400 shadow-lg shadow-amber-500/20 scale-[1.02]'
                      : isUnlocked
                        ? 'bg-slate-900/80 hover:bg-slate-850 border-slate-700 hover:border-slate-500'
                        : 'bg-slate-950/60 border-slate-900 opacity-55 cursor-not-allowed'
                  }`}
                >
                  {/* Top Badge: Level Number & Realm */}
                  <div className="flex items-center justify-between text-xs">
                    <span className={`font-mono font-black px-1.5 py-0.5 rounded text-[11px] ${
                      isSelected ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                    }`}>
                      #{lvl.id}
                    </span>

                    {isUnlocked ? (
                      <div className="flex items-center space-x-0.5 text-amber-400">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span className="text-[10px] font-bold">
                          {lvl.id < unlockedLevelId ? '3★' : '1★'}
                        </span>
                      </div>
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-slate-600" />
                    )}
                  </div>

                  {/* Level Icon & Title */}
                  <div className="my-2">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-xl">
                        {lvl.id === 6 
                          ? '🌀' 
                          : lvl.id === 12 
                            ? '🟣' 
                            : isBoss 
                              ? '👑' 
                              : isMultiverse 
                                ? '🦾' 
                                : '⚔️'
                        }
                      </span>
                      <h3 className="text-xs font-bold text-slate-200 truncate leading-tight group-hover:text-amber-300">
                        {lvl.titleRu}
                      </h3>
                    </div>
                    <span className={`text-[10px] font-mono uppercase tracking-wider block mt-0.5 ${
                      isMultiverse ? 'text-cyan-400' : 'text-amber-400'
                    }`}>
                      {isMultiverse ? 'Мультивселенная' : 'Инаморта'}
                    </span>
                  </div>

                  {/* Rewards summary */}
                  <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-800/80 pt-1.5 font-mono">
                    <span className="flex items-center space-x-0.5 text-amber-300 font-bold">
                      <span>+{lvl.rewardGold}</span>
                      <span>🪙</span>
                    </span>
                    <span className="flex items-center space-x-0.5 text-cyan-300 font-bold">
                      <span>+{lvl.rewardGems}</span>
                      <span>💎</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Level Briefing Card */}
        <div className="w-full md:w-80 lg:w-96 bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/40 rounded-2xl p-5 flex flex-col justify-between shadow-2xl backdrop-blur-md">
          
          <div>
            {/* Dimension Badge */}
            <div className="flex items-center justify-between mb-2">
              <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md border ${
                selectedLevel.dimension === 'multiverse'
                  ? 'bg-cyan-950/80 border-cyan-500/50 text-cyan-300'
                  : 'bg-amber-950/80 border-amber-500/50 text-amber-300'
              }`}>
                {selectedLevel.dimension === 'multiverse' ? '🌀 КИБЕР-МУЛЬТИВСЕЛЕННАЯ' : '🏰 КОРОЛЕВСТВО ИНАМОРТА'}
              </span>
              <span className="text-xs font-mono font-bold text-slate-400">
                УРОВЕНЬ {selectedLevel.id}
              </span>
            </div>

            {/* Level Title */}
            <h2 className="text-xl font-black text-slate-100 uppercase tracking-wide leading-tight mt-1">
              {selectedLevel.titleRu}
            </h2>

            {/* Description */}
            <p className="text-xs text-slate-300 mt-2 leading-relaxed bg-slate-950/50 p-3 rounded-xl border border-slate-800">
              {selectedLevel.descriptionRu}
            </p>

            {/* Boss Alert if any */}
            {selectedLevel.bossType && (
              <div className="mt-3 bg-red-950/40 border border-red-500/40 rounded-xl p-2.5 flex items-center space-x-2">
                <Skull className="w-5 h-5 text-red-400 shrink-0" />
                <div className="text-[11px] leading-tight">
                  <span className="font-bold text-red-300 block">БОСС УРОВНЯ!</span>
                  <span className="text-slate-300">Победите могучего титана волны.</span>
                </div>
              </div>
            )}

            {/* Portal Note on Level 6 */}
            {selectedLevel.id === 6 && (
              <div className="mt-3 bg-cyan-950/40 border border-cyan-500/40 rounded-xl p-2.5 flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-cyan-400 shrink-0" />
                <div className="text-[11px] leading-tight">
                  <span className="font-bold text-cyan-300 block">ПОРТАЛ В ДРУГОЙ МИР!</span>
                  <span className="text-slate-300">После победы откроется доступ к Мстителям и Трансформерам!</span>
                </div>
              </div>
            )}

            {/* Difficulty Selector */}
            <div className="mt-4">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center justify-between">
                <span>Сложность Сражения:</span>
                <span className="text-[10px] font-mono font-bold text-amber-400">{diffCfg.badge}</span>
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {(['normal', 'hard', 'insane', 'nightmare'] as const).map((mode) => {
                  const isCur = difficulty === mode;
                  const cfg = DIFFICULTY_CONFIGS[mode];
                  return (
                    <button
                      key={mode}
                      onClick={() => {
                        soundFx.playButtonClick();
                        setDifficulty(mode);
                      }}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold uppercase transition-all flex items-center justify-between border ${
                        isCur
                          ? mode === 'nightmare'
                            ? 'bg-purple-900 text-purple-100 border-purple-400 shadow-lg shadow-purple-900/40 ring-1 ring-purple-400'
                            : mode === 'insane'
                              ? 'bg-rose-600 text-white border-rose-400 shadow-lg shadow-rose-600/30'
                              : mode === 'hard'
                                ? 'bg-amber-600 text-white border-amber-400 shadow-lg shadow-amber-600/30'
                                : 'bg-emerald-600 text-white border-emerald-400 shadow-lg shadow-emerald-600/30'
                          : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      <span>{cfg.nameRu}</span>
                      <span className="text-[10px] opacity-75 font-mono">{cfg.rewardGoldMult}x</span>
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5 px-1 italic">
                {diffCfg.descriptionRu}
              </p>
            </div>

            {/* Rewards Breakdown */}
            <div className="mt-3.5 bg-slate-950/80 rounded-xl p-3 border border-slate-800 text-xs space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                Награда за Победу ({diffCfg.rewardGoldMult}x Золото / {diffCfg.rewardGemsMult}x 💎):
              </span>
              <div className="flex items-center justify-between">
                <span className="text-amber-400 font-bold flex items-center space-x-1">
                  <span>🪙 Золото:</span>
                </span>
                <span className="font-mono font-bold text-amber-300">+{rewardGold}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-cyan-400 font-bold flex items-center space-x-1">
                  <span>💎 Кристаллы:</span>
                </span>
                <span className="font-mono font-bold text-cyan-300">+{rewardGems}</span>
              </div>
            </div>
          </div>

          {/* Action Button: Start Battle */}
          <button
            id="start-campaign-battle-btn"
            onClick={handleStartBattle}
            className="w-full mt-4 py-3 bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-slate-950 font-black text-sm uppercase tracking-wider rounded-xl shadow-xl shadow-amber-500/20 transition-transform active:scale-95 flex items-center justify-center space-x-2 border-t border-amber-300 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>В БОЙ! НАЧАТЬ УРОВЕНЬ</span>
          </button>

        </div>

      </div>

    </div>
  );
};
