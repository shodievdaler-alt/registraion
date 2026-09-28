import React, { useState } from 'react';
import { WarriorType, Castle } from '../types';
import { WARRIOR_CONFIGS, CASTLE_LEVELS } from '../data/gameConfig';
import { 
  X, 
  Shield, 
  Swords, 
  Sparkles, 
  Check, 
  ChevronRight, 
  Coins,
  Crosshair,
  Heart
} from 'lucide-react';

interface UpgradesModalProps {
  isOpen: boolean;
  castle: Castle;
  gold: number;
  warriorTiers: Record<WarriorType, number>;
  onClose: () => void;
  onUpgradeCastle: () => void;
  onUpgradeWarrior: (type: WarriorType) => void;
}

export const UpgradesModal: React.FC<UpgradesModalProps> = ({
  isOpen,
  castle,
  gold,
  warriorTiers,
  onClose,
  onUpgradeCastle,
  onUpgradeWarrior,
}) => {
  const [activeTab, setActiveTab] = useState<'castle' | 'warriors'>('castle');
  const [warriorCategory, setWarriorCategory] = useState<'inamorta' | 'multiverse'>('inamorta');

  if (!isOpen) return null;

  const nextCastleLevel = CASTLE_LEVELS[castle.level]; // index is current level for next
  const isCastleMax = castle.level >= 5;

  const inamortaList: WarriorType[] = [
    'swordsman',
    'archer',
    'knight',
    'barbarian',
    'mage',
    'royal_knight',
  ];

  const multiverseList: WarriorType[] = [
    'iron_man',
    'captain',
    'thor',
    'optimus',
    'bumblebee',
    'hulk',
  ];

  const warriorList = warriorCategory === 'inamorta' ? inamortaList : multiverseList;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in select-none">
      <div className="bg-slate-900 border border-amber-500/40 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-black text-slate-100 uppercase tracking-wide">
              Кузница и Улучшения
            </h2>
          </div>

          <div className="flex items-center space-x-4">
            {/* Gold balance */}
            <div className="flex items-center space-x-1 bg-amber-950/50 px-2.5 py-1 rounded-lg border border-amber-500/30 text-amber-300 font-mono font-bold text-sm">
              <Coins className="w-4 h-4 text-amber-400" />
              <span>{Math.floor(gold)}</span>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-5 pt-2">
          <button
            onClick={() => setActiveTab('castle')}
            className={`flex items-center space-x-2 px-4 py-2.5 font-bold text-sm border-b-2 transition-all ${
              activeTab === 'castle'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Крепость (Ур. {castle.level})</span>
          </button>
          <button
            onClick={() => setActiveTab('warriors')}
            className={`flex items-center space-x-2 px-4 py-2.5 font-bold text-sm border-b-2 transition-all ${
              activeTab === 'warriors'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Swords className="w-4 h-4" />
            <span>Улучшения Воинов</span>
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          
          {/* TAB 1: CASTLE UPGRADE */}
          {activeTab === 'castle' && (
            <div className="space-y-4">
              
              {/* Current Status Card */}
              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase text-amber-400 font-bold tracking-wider">Текущий уровень</div>
                  <h3 className="text-base sm:text-lg font-black text-white">
                    {CASTLE_LEVELS[castle.level - 1].nameRu}
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {CASTLE_LEVELS[castle.level - 1].description}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">Прочность</div>
                  <div className="text-base sm:text-lg font-mono font-bold text-emerald-400">
                    {castle.hp} / {castle.maxHp} HP
                  </div>
                </div>
              </div>

              {/* Next Level Preview */}
              {!isCastleMax && nextCastleLevel ? (
                <div className="p-4 rounded-xl bg-gradient-to-br from-amber-950/40 via-slate-800/80 to-slate-800 border border-amber-500/40">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs uppercase text-amber-300 font-bold tracking-wider">
                      Следующее улучшение: Уровень {nextCastleLevel.level}
                    </span>
                    <div className="flex items-center space-x-1 text-amber-400 font-mono font-bold text-sm">
                      <span>{nextCastleLevel.cost}</span>
                      <span>🪙</span>
                    </div>
                  </div>

                  <h3 className="text-base font-black text-white mb-2">
                    {nextCastleLevel.nameRu}
                  </h3>

                  <ul className="space-y-1.5 mb-4">
                    {nextCastleLevel.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center space-x-2 text-xs text-slate-200">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={onUpgradeCastle}
                    disabled={gold < nextCastleLevel.cost}
                    className={`w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 transition-all shadow-lg ${
                      gold >= nextCastleLevel.cost
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 cursor-pointer active:scale-98 shadow-amber-500/20'
                        : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                    }`}
                  >
                    <span>Улучшить Крепость до Ур. {nextCastleLevel.level}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="p-6 rounded-xl bg-slate-800/40 border border-emerald-500/30 text-center">
                  <div className="text-3xl mb-1">👑</div>
                  <h3 className="text-base font-bold text-emerald-400">Максимальный уровень крепости достигнут!</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Ваша цитадель оснащена всеми защитными системами, башенными лучниками, шипами и арканной пушкой.
                  </p>
                </div>
              )}

              {/* All Levels Path Roadmap */}
              <div className="pt-2">
                <h4 className="text-xs uppercase font-bold text-slate-400 mb-2">План развития крепости:</h4>
                <div className="space-y-2">
                  {CASTLE_LEVELS.map((lvl) => (
                    <div
                      key={lvl.level}
                      className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                        lvl.level <= castle.level
                          ? 'bg-slate-800/40 border-slate-700/70 text-slate-300'
                          : 'bg-slate-900/40 border-slate-800 text-slate-500'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold font-mono text-[10px] ${
                          lvl.level <= castle.level ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'
                        }`}>
                          {lvl.level}
                        </span>
                        <div>
                          <span className="font-bold text-slate-200">{lvl.nameRu}</span>
                          <span className="text-[11px] text-slate-400 block">{lvl.features[0]}</span>
                        </div>
                      </div>
                      {lvl.level <= castle.level ? (
                        <span className="text-emerald-400 font-bold text-[11px]">Изучено ✓</span>
                      ) : (
                        <span className="text-amber-400 font-mono font-bold text-[11px]">{lvl.cost} 🪙</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: WARRIORS UPGRADE */}
          {activeTab === 'warriors' && (
            <div className="space-y-3">
              {/* Category selector */}
              <div className="flex items-center space-x-2 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setWarriorCategory('inamorta')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    warriorCategory === 'inamorta'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🏰 Воины Инаморты
                </button>
                <button
                  onClick={() => setWarriorCategory('multiverse')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    warriorCategory === 'multiverse'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🌀 Мстители & Трансформеры
                </button>
              </div>

              {warriorList.map((type) => {
                const config = WARRIOR_CONFIGS[type];
                const tier = warriorTiers[type];
                const isMax = tier >= 3;
                const nextCost = tier === 1 ? config.upgradeCostTier2 : config.upgradeCostTier3;
                const canAfford = gold >= nextCost && !isMax;

                const currentName = config.tierNames[tier - 1];
                const nextName = !isMax ? config.tierNames[tier] : null;

                const currentHp = Math.round(config.baseHp * (1 + (tier - 1) * 0.35));
                const nextHp = !isMax ? Math.round(config.baseHp * (1 + tier * 0.35)) : null;

                const currentDmg = Math.round(config.baseDmg * (1 + (tier - 1) * 0.35));
                const nextDmg = !isMax ? Math.round(config.baseDmg * (1 + tier * 0.35)) : null;

                return (
                  <div
                    key={type}
                    className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 hover:border-slate-600 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    {/* Unit Info */}
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl drop-shadow-md">{config.icon}</span>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold text-sm text-slate-100">{currentName}</h4>
                          <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                            {tier === 3 ? '★★★ ЭЛИТА' : (tier === 2 ? '★★ ВЕТЕРАН' : '★ ТАКТИЧЕСКИЙ')}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 max-w-sm">
                          {config.description}
                        </p>
                        
                        {/* Stats diff */}
                        <div className="flex items-center space-x-3 text-[11px] font-mono mt-1 text-slate-300">
                          <span className="flex items-center space-x-1">
                            <Heart className="w-3 h-3 text-emerald-400" />
                            <span>{currentHp} {nextHp && <span className="text-emerald-400 font-bold">→ {nextHp}</span>}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Swords className="w-3 h-3 text-rose-400" />
                            <span>{currentDmg} {nextDmg && <span className="text-rose-400 font-bold">→ {nextDmg}</span>}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Crosshair className="w-3 h-3 text-cyan-400" />
                            <span>{config.baseRange} px</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="w-full sm:w-auto shrink-0">
                      {isMax ? (
                        <div className="text-xs font-bold text-emerald-400 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center">
                          МАКС. ТИР ✓
                        </div>
                      ) : (
                        <button
                          onClick={() => onUpgradeWarrior(type)}
                          disabled={!canAfford}
                          className={`w-full sm:w-auto px-3.5 py-2 rounded-lg font-bold text-xs flex items-center justify-center space-x-1.5 transition-all shadow-md ${
                            canAfford
                              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer active:scale-95 shadow-amber-500/20'
                              : 'bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed'
                          }`}
                        >
                          <span>Улучшить до {nextName}</span>
                          <span className="font-mono font-black ml-1">({nextCost} 🪙)</span>
                        </button>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
