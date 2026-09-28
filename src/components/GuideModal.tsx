import React, { useState } from 'react';
import { X, Swords, Skull, Flame, Shield, Keyboard } from 'lucide-react';
import { WARRIOR_CONFIGS, ZOMBIE_BASE_STATS, CASTLE_LEVELS, INITIAL_ABILITIES } from '../data/gameConfig';
import { WarriorType, ZombieType } from '../types';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  const [tab, setTab] = useState<'warriors' | 'zombies' | 'abilities' | 'shortcuts'>('warriors');

  if (!isOpen) return null;

  const warriorKeys: WarriorType[] = ['swordsman', 'archer', 'knight', 'barbarian', 'mage', 'royal_knight'];
  const zombieKeys: ZombieType[] = ['regular', 'fast', 'fat', 'armored', 'giant', 'boss'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in select-none">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-black text-slate-100 uppercase tracking-wide">
              Энциклопедия и Тактика
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-5 pt-2 overflow-x-auto">
          <button
            onClick={() => setTab('warriors')}
            className={`flex items-center space-x-1.5 px-3 py-2 font-bold text-xs sm:text-sm border-b-2 transition-all ${
              tab === 'warriors' ? 'border-amber-400 text-amber-400' : 'border-transparent text-slate-400'
            }`}
          >
            <Swords className="w-4 h-4" />
            <span>Воины (6)</span>
          </button>
          <button
            onClick={() => setTab('zombies')}
            className={`flex items-center space-x-1.5 px-3 py-2 font-bold text-xs sm:text-sm border-b-2 transition-all ${
              tab === 'zombies' ? 'border-rose-400 text-rose-400' : 'border-transparent text-slate-400'
            }`}
          >
            <Skull className="w-4 h-4" />
            <span>Зомби (6)</span>
          </button>
          <button
            onClick={() => setTab('abilities')}
            className={`flex items-center space-x-1.5 px-3 py-2 font-bold text-xs sm:text-sm border-b-2 transition-all ${
              tab === 'abilities' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>Магия и Крепость</span>
          </button>
          <button
            onClick={() => setTab('shortcuts')}
            className={`flex items-center space-x-1.5 px-3 py-2 font-bold text-xs sm:text-sm border-b-2 transition-all ${
              tab === 'shortcuts' ? 'border-purple-400 text-purple-400' : 'border-transparent text-slate-400'
            }`}
          >
            <Keyboard className="w-4 h-4" />
            <span>Клавиши</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          
          {/* TAB: WARRIORS */}
          {tab === 'warriors' && (
            <div className="space-y-3">
              {warriorKeys.map((type) => {
                const w = WARRIOR_CONFIGS[type];
                return (
                  <div key={type} className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 flex items-start space-x-3">
                    <span className="text-3xl drop-shadow">{w.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-100">{w.nameRu}</h4>
                        <span className="text-xs font-mono font-bold text-amber-400">{w.cost} 🪙</span>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5">{w.description}</p>
                      <div className="flex flex-wrap gap-2 mt-2 text-[11px] font-mono text-slate-400">
                        <span className="bg-slate-900 px-2 py-0.5 rounded text-emerald-400">HP: {w.baseHp}</span>
                        <span className="bg-slate-900 px-2 py-0.5 rounded text-rose-400">Урон: {w.baseDmg}</span>
                        <span className="bg-slate-900 px-2 py-0.5 rounded text-cyan-400">Дальность: {w.baseRange}px</span>
                        <span className="bg-slate-900 px-2 py-0.5 rounded text-amber-400">Тиры: {w.tierNames.join(' → ')}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB: ZOMBIES */}
          {tab === 'zombies' && (
            <div className="space-y-3">
              {zombieKeys.map((type) => {
                const z = ZOMBIE_BASE_STATS[type];
                return (
                  <div key={type} className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-rose-950/60 border border-rose-500/40 flex items-center justify-center text-xl shrink-0">
                      {type === 'boss' ? '👹' : '🧟'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-100">{z.nameRu}</h4>
                        <span className="text-xs font-mono font-bold text-emerald-400">Награда: +{z.reward} 🪙</span>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5">{z.description}</p>
                      <div className="flex flex-wrap gap-2 mt-2 text-[11px] font-mono text-slate-400">
                        <span className="bg-slate-900 px-2 py-0.5 rounded text-rose-400">Баз. HP: {z.baseHp}</span>
                        <span className="bg-slate-900 px-2 py-0.5 rounded text-amber-400">Урон: {z.baseDmg}</span>
                        <span className="bg-slate-900 px-2 py-0.5 rounded text-blue-400">Скорость: {z.baseSpeed}</span>
                        {z.armor > 0 && <span className="bg-slate-900 px-2 py-0.5 rounded text-purple-400">Броня: {Math.round(z.armor * 100)}%</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB: ABILITIES & CASTLE */}
          {tab === 'abilities' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-xs uppercase font-bold text-amber-400 mb-2">Заклинания главнокомандующего:</h4>
                <div className="space-y-2">
                  {INITIAL_ABILITIES.map(ab => (
                    <div key={ab.id} className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 flex items-start space-x-3">
                      <span className="text-2xl">{ab.icon}</span>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h5 className="font-bold text-white text-sm">{ab.nameRu}</h5>
                          <span className="text-[10px] font-mono font-bold bg-slate-900 px-1.5 py-0.5 rounded text-slate-300">Клавиша: [{ab.hotkey}]</span>
                        </div>
                        <p className="text-xs text-slate-300 mt-1">{ab.description}</p>
                        <span className="text-[11px] text-amber-400 font-mono mt-1 block">Перезарядка: {ab.cooldown} сек</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs uppercase font-bold text-amber-400 mb-2">Развитие крепости (до 5 уровней):</h4>
                <div className="space-y-1.5 text-xs text-slate-300">
                  <div className="p-2 bg-slate-800/40 rounded border border-slate-800">
                    <strong className="text-white">Ур. 1:</strong> 1000 HP, базовые ворота.
                  </div>
                  <div className="p-2 bg-slate-800/40 rounded border border-slate-800">
                    <strong className="text-white">Ур. 2:</strong> +600 HP, пассивная регенерация 5 HP/сек.
                  </div>
                  <div className="p-2 bg-slate-800/40 rounded border border-slate-800">
                    <strong className="text-white">Ур. 3:</strong> 2 башенных лучника стреляют по приближающимся врагам.
                  </div>
                  <div className="p-2 bg-slate-800/40 rounded border border-slate-800">
                    <strong className="text-white">Ур. 4:</strong> Защитный палисад с шипами ранит атакующих зомби.
                  </div>
                  <div className="p-2 bg-slate-800/40 rounded border border-slate-800">
                    <strong className="text-white">Ур. 5:</strong> Арканная пушка цитадели взрывает группы зомби.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: SHORTCUTS */}
          {tab === 'shortcuts' && (
            <div className="space-y-2">
              <div className="p-2.5 bg-slate-800/80 rounded-lg flex items-center justify-between text-xs">
                <span className="text-slate-300">Призвать Мечника</span>
                <kbd className="px-2 py-1 bg-slate-950 border border-slate-700 rounded font-mono font-bold text-amber-400">1</kbd>
              </div>
              <div className="p-2.5 bg-slate-800/80 rounded-lg flex items-center justify-between text-xs">
                <span className="text-slate-300">Призвать Лучника</span>
                <kbd className="px-2 py-1 bg-slate-950 border border-slate-700 rounded font-mono font-bold text-amber-400">2</kbd>
              </div>
              <div className="p-2.5 bg-slate-800/80 rounded-lg flex items-center justify-between text-xs">
                <span className="text-slate-300">Призвать Рыцаря</span>
                <kbd className="px-2 py-1 bg-slate-950 border border-slate-700 rounded font-mono font-bold text-amber-400">3</kbd>
              </div>
              <div className="p-2.5 bg-slate-800/80 rounded-lg flex items-center justify-between text-xs">
                <span className="text-slate-300">Призвать Варвара</span>
                <kbd className="px-2 py-1 bg-slate-950 border border-slate-700 rounded font-mono font-bold text-amber-400">4</kbd>
              </div>
              <div className="p-2.5 bg-slate-800/80 rounded-lg flex items-center justify-between text-xs">
                <span className="text-slate-300">Призвать Мага</span>
                <kbd className="px-2 py-1 bg-slate-950 border border-slate-700 rounded font-mono font-bold text-amber-400">5</kbd>
              </div>
              <div className="p-2.5 bg-slate-800/80 rounded-lg flex items-center justify-between text-xs">
                <span className="text-slate-300">Призвать Королевского рыцаря</span>
                <kbd className="px-2 py-1 bg-slate-950 border border-slate-700 rounded font-mono font-bold text-amber-400">6</kbd>
              </div>
              <div className="p-2.5 bg-slate-800/80 rounded-lg flex items-center justify-between text-xs">
                <span className="text-slate-300">Способность: Огненный дождь</span>
                <kbd className="px-2 py-1 bg-slate-950 border border-slate-700 rounded font-mono font-bold text-rose-400">Q</kbd>
              </div>
              <div className="p-2.5 bg-slate-800/80 rounded-lg flex items-center justify-between text-xs">
                <span className="text-slate-300">Способность: Заморозка</span>
                <kbd className="px-2 py-1 bg-slate-950 border border-slate-700 rounded font-mono font-bold text-cyan-400">W</kbd>
              </div>
              <div className="p-2.5 bg-slate-800/80 rounded-lg flex items-center justify-between text-xs">
                <span className="text-slate-300">Способность: Молния</span>
                <kbd className="px-2 py-1 bg-slate-950 border border-slate-700 rounded font-mono font-bold text-amber-400">E</kbd>
              </div>
              <div className="p-2.5 bg-slate-800/80 rounded-lg flex items-center justify-between text-xs">
                <span className="text-slate-300">Пауза / Продолжить</span>
                <kbd className="px-2 py-1 bg-slate-950 border border-slate-700 rounded font-mono font-bold text-slate-200">Space</kbd>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
