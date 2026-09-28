import React, { useState, useEffect } from 'react';
import { WarriorType, DimensionType, SkinType, ObstacleType } from '../types';
import { WARRIOR_CONFIGS, SKIN_DEFINITIONS, OBSTACLE_CONFIGS } from '../data/gameConfig';
import { SkinImage } from './SkinImage';
import { Heart, Swords, Shield, Crosshair, Zap, ArrowUpCircle, Sparkles } from 'lucide-react';
import { soundFx } from '../utils/audio';

type DockTab = 'inamorta' | 'star_wars' | 'multiverse' | 'military';

interface SummonDockProps {
  gold: number;
  dimension: DimensionType;
  activeSkin: SkinType;
  warriorTiers: Record<WarriorType, number>;
  summonCooldowns: Record<WarriorType, number>;
  obstacleCooldowns?: Record<ObstacleType, number>;
  activeObstacleAim?: ObstacleType | null;
  onSummon: (type: WarriorType) => void;
  onSelectObstacleAim?: (type: ObstacleType | null) => void;
  onOpenUpgrades: () => void;
}

export const SummonDock: React.FC<SummonDockProps> = ({
  gold,
  dimension,
  activeSkin,
  warriorTiers,
  summonCooldowns,
  obstacleCooldowns = { trench: 0, landmine: 0, barricade: 0 },
  activeObstacleAim = null,
  onSummon,
  onSelectObstacleAim,
  onOpenUpgrades,
}) => {
  // Tab state: inamorta vs star wars vs multiverse heroes vs military & obstacles
  const [activeTab, setActiveTab] = useState<DockTab>(() => {
    if (dimension === 'star_wars' || dimension === 'mustafar' || dimension === 'hoth') return 'star_wars';
    if (dimension === 'multiverse' || dimension === 'cyberpunk') return 'multiverse';
    return 'inamorta';
  });

  // Sync tab when dimension switches via portal warp
  useEffect(() => {
    if (dimension === 'star_wars' || dimension === 'mustafar' || dimension === 'hoth') {
      setActiveTab('star_wars');
    } else if (dimension === 'multiverse' || dimension === 'cyberpunk') {
      setActiveTab('multiverse');
    } else {
      setActiveTab('inamorta');
    }
  }, [dimension]);

  const inamortaOrder: WarriorType[] = [
    'swordsman',
    'archer',
    'knight',
    'barbarian',
    'mage',
    'royal_knight',
  ];

  const starWarsOrder: WarriorType[] = [
    'jedi',
    'stormtrooper',
    'darth_vader',
    'yoda',
    'mandalorian',
  ];

  const multiverseOrder: WarriorType[] = [
    'iron_man',
    'captain',
    'thor',
    'optimus',
    'bumblebee',
    'hulk',
  ];

  const militaryWarriors: WarriorType[] = ['soldier', 'tank'];
  const obstacleOrder: ObstacleType[] = ['trench', 'landmine', 'barricade'];

  const currentWarriors =
    activeTab === 'inamorta'
      ? inamortaOrder
      : activeTab === 'star_wars'
      ? starWarsOrder
      : activeTab === 'multiverse'
      ? multiverseOrder
      : militaryWarriors;
  const currentSkin = SKIN_DEFINITIONS.find(s => s.id === activeSkin) || SKIN_DEFINITIONS[0];

  return (
    <div className="w-full bg-slate-950/95 border-t border-amber-900/40 p-2 sm:p-2.5 select-none backdrop-blur-md shadow-2xl z-20">
      <div className="max-w-7xl mx-auto flex flex-col gap-1.5">
        
        {/* Top Mini Bar: Tabs for Inamorta vs Star Wars vs Multiverse Army vs Military/Obstacles + Upgrades Button */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center space-x-1 sm:space-x-2">
            
            {/* Tab 1: Inamorta Army */}
            <button
              onClick={() => {
                soundFx.playButtonClick();
                setActiveTab('inamorta');
              }}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'inamorta'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <span>🏰 Воины</span>
            </button>

            {/* Tab 2: Star Wars Army */}
            <button
              onClick={() => {
                soundFx.playButtonClick();
                setActiveTab('star_wars');
              }}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'star_wars'
                  ? 'bg-blue-600/30 text-cyan-300 border border-cyan-400 shadow-sm shadow-cyan-500/30 ring-1 ring-cyan-400'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <span>⚔️ Звёздные Войны</span>
            </button>

            {/* Tab 3: Multiverse Avengers & Transformers */}
            <button
              onClick={() => {
                soundFx.playButtonClick();
                setActiveTab('multiverse');
              }}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'multiverse'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm shadow-cyan-500/20'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>🌀 Мстители</span>
            </button>

            {/* Tab 4: Military & Obstacles (Окопы, Мины, Танки, Солдаты) */}
            <button
              onClick={() => {
                soundFx.playButtonClick();
                setActiveTab('military');
              }}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'military'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-sm shadow-emerald-500/20'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>🪖 Оборона</span>
            </button>

          </div>

          <div className="flex items-center space-x-2">
            {/* Active Skin Tag */}
            <span 
              className="text-[10px] hidden sm:inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-lg border font-mono shadow-sm"
              style={{ 
                borderColor: `${currentSkin.color}66`,
                backgroundColor: `${currentSkin.color}15`,
                color: currentSkin.color
              }}
            >
              <SkinImage skin={currentSkin} size="sm" className="!w-5 !h-5 !rounded" animateAura={false} />
              <span className="font-bold">{currentSkin.nameRu}:</span>
              <span className="text-amber-300">{currentSkin.buffSummary}</span>
            </span>

            {/* Upgrades Shortcut */}
            <button
              onClick={() => {
                soundFx.playButtonClick();
                onOpenUpgrades();
              }}
              className="flex items-center space-x-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors"
            >
              <ArrowUpCircle className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Кузница (U)</span>
            </button>
          </div>
        </div>

        {/* Cards Carousel */}
        <div className="flex items-center justify-start gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-700">
          
          {/* 1. Unit Cards */}
          {currentWarriors.map((type, idx) => {
            const config = WARRIOR_CONFIGS[type];
            const tier = warriorTiers[type] || 1;
            const cooldown = summonCooldowns[type] || 0;
            const onCd = cooldown > 0;
            
            // Apply Leaf Skin gold discount
            const actualCost = activeSkin === 'leaf' ? Math.round(config.cost * 0.85) : config.cost;
            const canAfford = gold >= actualCost;
            const isUsable = canAfford && !onCd;
            const currentName = config.tierNames[tier - 1] || config.tierNames[0];

            // Tier scaled stats
            const tierMultiplier = 1 + (tier - 1) * 0.35;
            const hp = Math.round(config.baseHp * tierMultiplier);
            const dmg = Math.round(config.baseDmg * tierMultiplier);

            const isMultiverseCard = config.dimension === 'multiverse';
            const isMilitaryCard = activeTab === 'military';

            return (
              <button
                key={type}
                id={`summon-btn-${type}`}
                onClick={() => onSummon(type)}
                disabled={!isUsable}
                className={`relative flex-1 min-w-[125px] sm:min-w-[155px] max-w-[200px] p-2 rounded-xl border transition-all text-left group ${
                  isUsable
                    ? isMilitaryCard
                      ? 'bg-gradient-to-b from-slate-900 to-emerald-950/80 border-emerald-500/40 hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-500/20 active:scale-95 cursor-pointer ring-1 ring-emerald-500/20'
                      : isMultiverseCard
                        ? 'bg-gradient-to-b from-slate-900 to-sky-950/80 border-cyan-500/40 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/20 active:scale-95 cursor-pointer ring-1 ring-cyan-500/20'
                        : 'bg-gradient-to-b from-slate-800 to-slate-900 border-amber-500/40 hover:border-amber-400 hover:shadow-lg hover:shadow-amber-500/15 active:scale-95 cursor-pointer ring-1 ring-amber-500/10'
                    : !canAfford
                      ? 'bg-slate-900/60 border-slate-800 text-slate-500 opacity-65 cursor-not-allowed'
                      : 'bg-slate-900/80 border-slate-800 text-slate-400 cursor-not-allowed'
                }`}
              >
                {/* Header: Avatar, Name & Hotkey */}
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-1.5 truncate">
                    <span className="text-xl sm:text-2xl drop-shadow">{config.icon}</span>
                    <div className="truncate">
                      <h4 className={`text-xs sm:text-sm font-bold truncate leading-tight ${
                        isUsable 
                          ? isMilitaryCard ? 'text-emerald-200 group-hover:text-white' : isMultiverseCard ? 'text-cyan-200 group-hover:text-white' : 'text-slate-100 group-hover:text-amber-300' 
                          : 'text-slate-400'
                      }`}>
                        {currentName}
                      </h4>
                      <span className="text-[10px] text-slate-400 flex items-center space-x-1">
                        <span>Ур.{tier}</span>
                        <span>•</span>
                        <span className="capitalize">{config.role}</span>
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono font-bold bg-slate-950/80 border border-slate-700/80 px-1.5 py-0.5 rounded text-slate-300 shrink-0">
                    {idx + 1}
                  </span>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px] sm:text-[11px] text-slate-300 my-1 font-mono bg-slate-950/50 px-1.5 py-1 rounded border border-slate-800/80">
                  <div className="flex items-center space-x-1">
                    <Heart className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span>{hp}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Swords className="w-3 h-3 text-rose-400 shrink-0" />
                    <span>{dmg}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Crosshair className="w-3 h-3 text-cyan-400 shrink-0" />
                    <span>{config.baseRange}px</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Zap className="w-3 h-3 text-amber-400 shrink-0" />
                    <span>{config.baseSpeed}</span>
                  </div>
                </div>

                {/* Cost & Cooldown footer */}
                <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-800/60 text-xs">
                  <span className={`font-mono font-black flex items-center space-x-0.5 ${
                    canAfford ? 'text-amber-300' : 'text-rose-400'
                  }`}>
                    <span>{actualCost}</span>
                    <span>🪙</span>
                  </span>

                  {onCd ? (
                    <span className="text-[10px] font-mono font-bold text-cyan-400 animate-pulse">
                      {cooldown.toFixed(1)}s
                    </span>
                  ) : (
                    <span className={`text-[10px] uppercase font-bold ${
                      canAfford ? (isMilitaryCard ? 'text-emerald-400' : isMultiverseCard ? 'text-cyan-400' : 'text-emerald-400') : 'text-slate-500'
                    }`}>
                      {canAfford ? 'ПРИЗВАТЬ' : 'НЕТ ЗОЛОТА'}
                    </span>
                  )}
                </div>

                {/* Cooldown progress bar overlay */}
                {onCd && (
                  <div 
                    className="absolute inset-0 bg-slate-950/70 backdrop-blur-[1px] rounded-xl flex items-center justify-center pointer-events-none"
                  >
                    <span className="font-mono text-sm font-black text-cyan-300">
                      {cooldown.toFixed(1)}с
                    </span>
                  </div>
                )}
              </button>
            );
          })}

          {/* 2. Obstacles (Trenches, Mines, Barricades) in Military Tab */}
          {activeTab === 'military' && obstacleOrder.map((obsType) => {
            const obsConfig = OBSTACLE_CONFIGS[obsType];
            const cd = obstacleCooldowns[obsType] || 0;
            const onCd = cd > 0;
            const canAfford = gold >= obsConfig.cost;
            const isAimingThis = activeObstacleAim === obsType;

            return (
              <button
                key={obsType}
                id={`obstacle-btn-${obsType}`}
                onClick={() => {
                  if (isAimingThis) {
                    onSelectObstacleAim?.(null);
                  } else {
                    soundFx.playButtonClick();
                    onSelectObstacleAim?.(obsType);
                  }
                }}
                disabled={!canAfford && !isAimingThis}
                className={`relative flex-1 min-w-[135px] sm:min-w-[165px] max-w-[210px] p-2 rounded-xl border transition-all text-left group ${
                  isAimingThis
                    ? 'bg-gradient-to-b from-amber-900/60 to-amber-950/90 border-amber-400 shadow-lg shadow-amber-500/30 ring-2 ring-amber-400 animate-pulse'
                    : canAfford && !onCd
                      ? 'bg-gradient-to-b from-slate-900 to-amber-950/40 border-amber-600/40 hover:border-amber-400 hover:shadow-lg hover:shadow-amber-500/20 active:scale-95 cursor-pointer'
                      : 'bg-slate-900/60 border-slate-800 text-slate-500 opacity-60 cursor-not-allowed'
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-1.5 truncate">
                    <span className="text-xl sm:text-2xl drop-shadow">{obsConfig.icon}</span>
                    <div className="truncate">
                      <h4 className={`text-xs sm:text-sm font-bold truncate leading-tight ${
                        isAimingThis ? 'text-amber-200' : canAfford ? 'text-slate-100 group-hover:text-amber-300' : 'text-slate-400'
                      }`}>
                        {obsConfig.nameRu}
                      </h4>
                      <span className="text-[10px] text-amber-400/80">Преграда</span>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono font-bold bg-amber-950/80 border border-amber-700/80 px-1.5 py-0.5 rounded text-amber-300 shrink-0">
                    УСТАНОВКА
                  </span>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px] sm:text-[11px] text-slate-300 my-1 font-mono bg-slate-950/50 px-1.5 py-1 rounded border border-slate-800/80">
                  <div className="flex items-center space-x-1">
                    <Heart className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span>{obsConfig.hp > 1 ? `${obsConfig.hp} HP` : '1 РАЗ'}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Swords className="w-3 h-3 text-rose-400 shrink-0" />
                    <span>{obsConfig.damage > 0 ? `${obsConfig.damage} DMG` : 'УКРЫТИЕ'}</span>
                  </div>
                </div>

                {/* Cost & Action footer */}
                <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-800/60 text-xs">
                  <span className={`font-mono font-black flex items-center space-x-0.5 ${
                    canAfford ? 'text-amber-300' : 'text-rose-400'
                  }`}>
                    <span>{obsConfig.cost}</span>
                    <span>🪙</span>
                  </span>

                  {isAimingThis ? (
                    <span className="text-[10px] font-bold text-amber-300 animate-pulse">
                      КЛИК ПО ПОЛЮ
                    </span>
                  ) : onCd ? (
                    <span className="text-[10px] font-mono font-bold text-cyan-400 animate-pulse">
                      {cd.toFixed(1)}s
                    </span>
                  ) : (
                    <span className={`text-[10px] uppercase font-bold ${
                      canAfford ? 'text-emerald-400' : 'text-slate-500'
                    }`}>
                      {canAfford ? 'РАЗМЕСТИТЬ' : 'НЕТ ЗОЛОТА'}
                    </span>
                  )}
                </div>

                {/* Cooldown overlay */}
                {onCd && !isAimingThis && (
                  <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[1px] rounded-xl flex items-center justify-center pointer-events-none">
                    <span className="font-mono text-sm font-black text-cyan-300">
                      {cd.toFixed(1)}с
                    </span>
                  </div>
                )}
              </button>
            );
          })}

        </div>

      </div>
    </div>
  );
};
