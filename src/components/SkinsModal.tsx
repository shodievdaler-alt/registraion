import React, { useState } from 'react';
import { SkinType } from '../types';
import { SKIN_DEFINITIONS } from '../data/gameConfig';
import { useTranslation } from '../utils/i18n';
import { soundFx } from '../utils/audio';
import { SkinImage } from './SkinImage';
import { X, Sparkles, Check, Shield, Zap, Swords, Globe } from 'lucide-react';

interface SkinsModalProps {
  isOpen: boolean;
  activeSkin: SkinType;
  gems?: number;
  onEquipSkin?: (skin: SkinType) => void;
  onSelectSkin?: (skin: SkinType) => void;
  onClose: () => void;
}

export const SkinsModal: React.FC<SkinsModalProps> = ({
  isOpen,
  activeSkin,
  gems = 0,
  onEquipSkin,
  onSelectSkin,
  onClose,
}) => {
  const { t } = useTranslation();
  
  // Track selected skin for preview (defaults to active equipped skin)
  const [selectedSkinId, setSelectedSkinId] = useState<SkinType>(activeSkin);
  const [universeFilter, setUniverseFilter] = useState<'all' | 'inamorta' | 'multiverse'>('all');

  if (!isOpen) return null;

  const handleEquip = (skinId: SkinType) => {
    soundFx.playUpgrade();
    if (onEquipSkin) onEquipSkin(skinId);
    if (onSelectSkin) onSelectSkin(skinId);
    setSelectedSkinId(skinId);
  };

  const previewSkin = SKIN_DEFINITIONS.find(s => s.id === selectedSkinId) || SKIN_DEFINITIONS[0];
  const isSelectedEquipped = previewSkin.id === activeSkin;

  const filteredSkins = SKIN_DEFINITIONS.filter(s => {
    if (universeFilter === 'inamorta') return s.universe === 'inamorta';
    if (universeFilter === 'multiverse') return s.universe === 'multiverse';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-gradient-to-b from-slate-900 via-slate-950 to-[#070913] border-2 border-amber-500/50 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header: Stick War Legacy Style */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-b border-amber-900/40 bg-slate-950/90">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-black text-amber-300 uppercase tracking-wider drop-shadow">
                  {t('skins')}
                </h2>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-mono px-2 py-0.5 rounded-full border border-amber-500/40">
                  Stick War Armory
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Уникальные иллюстрации и боевые ауры воинов из разных вселенных
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {gems > 0 && (
              <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold">
                <span>💎 {gems}</span>
              </div>
            )}
            <button
              onClick={() => {
                soundFx.playButtonClick();
                onClose();
              }}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors border border-slate-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Universe Filter Tabs */}
        <div className="flex items-center px-6 pt-3 pb-1 border-b border-slate-800/80 bg-slate-950/50 space-x-2 overflow-x-auto">
          <button
            onClick={() => {
              soundFx.playButtonClick();
              setUniverseFilter('all');
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              universeFilter === 'all'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Все облики ({SKIN_DEFINITIONS.length})
          </button>
          <button
            onClick={() => {
              soundFx.playButtonClick();
              setUniverseFilter('inamorta');
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center space-x-1.5 ${
              universeFilter === 'inamorta'
                ? 'bg-amber-600/25 text-amber-300 border border-amber-500/50 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🏰 Вселенная Инаморты</span>
            <span className="text-[10px] opacity-70">(5)</span>
          </button>
          <button
            onClick={() => {
              soundFx.playButtonClick();
              setUniverseFilter('multiverse');
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center space-x-1.5 ${
              universeFilter === 'multiverse'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🌀 Кибер-Мультивселенная</span>
            <span className="text-[10px] opacity-70">(2)</span>
          </button>
        </div>

        {/* Main Content Area: Left Grid (Cards) & Right Showcase Preview */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left / Center: Skin Cards Grid (7 columns on lg) */}
          <div className="lg:col-span-7 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredSkins.map((skin) => {
                const isEquipped = skin.id === activeSkin;
                const isInspected = skin.id === selectedSkinId;
                const isMultiverse = skin.universe === 'multiverse';

                return (
                  <div
                    key={skin.id}
                    id={`skin-card-${skin.id}`}
                    onClick={() => {
                      soundFx.playButtonClick();
                      setSelectedSkinId(skin.id);
                    }}
                    className={`relative p-3 rounded-xl border-2 transition-all cursor-pointer text-left flex flex-col justify-between group overflow-hidden ${
                      isInspected
                        ? isMultiverse
                          ? 'bg-cyan-950/40 border-cyan-400 shadow-lg shadow-cyan-500/20 ring-2 ring-cyan-400/40'
                          : 'bg-amber-950/40 border-amber-400 shadow-lg shadow-amber-500/20 ring-2 ring-amber-400/40'
                        : isEquipped
                        ? 'bg-amber-500/10 border-amber-500/60 shadow-md'
                        : 'bg-slate-900/80 hover:bg-slate-850 border-slate-700/80 hover:border-slate-500'
                    }`}
                  >
                    {/* Top Row: Visual Image & Identity */}
                    <div className="flex items-start space-x-3">
                      
                      {/* Distinct Skin Artwork Thumbnail */}
                      <div className="shrink-0 relative">
                        <SkinImage
                          skin={skin}
                          size="md"
                          className="shadow-md"
                          animateAura={isInspected || isEquipped}
                        />
                      </div>

                      {/* Info & Badges */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-sm font-black text-slate-100 truncate">
                            {skin.nameRu}
                          </h4>
                          {isEquipped && (
                            <span className="shrink-0 flex items-center space-x-1 text-[9px] font-black bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded shadow">
                              <Check className="w-2.5 h-2.5" />
                              <span>НАДЕТ</span>
                            </span>
                          )}
                        </div>

                        <div className="text-[10px] text-slate-400 mt-0.5 flex items-center space-x-1">
                          <Globe className="w-3 h-3 text-slate-500" />
                          <span className={isMultiverse ? 'text-cyan-400 font-bold' : 'text-amber-400 font-bold'}>
                            {skin.universeNameRu || (isMultiverse ? 'Мультивселенная' : 'Инаморта')}
                          </span>
                        </div>

                        <div className="mt-1">
                          <span className="inline-block text-[10px] font-mono font-bold text-amber-300 bg-amber-950/60 border border-amber-500/30 px-1.5 py-0.5 rounded">
                            {skin.buffSummary}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Short Description */}
                    <p className="text-[11px] text-slate-300 mt-2.5 line-clamp-2 leading-relaxed">
                      {skin.description}
                    </p>

                    {/* Bottom Action Footer */}
                    <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 italic font-serif">
                        {skin.artTitleRu || skin.tagline}
                      </span>

                      {!isEquipped ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEquip(skin.id);
                          }}
                          className="text-[10px] font-bold bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 px-2 py-0.5 rounded border border-slate-700 transition-colors cursor-pointer"
                        >
                          Надеть
                        </button>
                      ) : (
                        <span className="text-[10px] text-amber-400 font-bold">
                          Активен
                        </span>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: High-Res Cinematic Preview Showcase (5 columns on lg) */}
          <div className="lg:col-span-5 bg-slate-950/90 rounded-2xl border-2 border-slate-800 p-5 flex flex-col justify-between relative overflow-hidden shadow-2xl">
            
            {/* Thematic Background Glow */}
            <div 
              className="absolute -top-12 -right-12 w-64 h-64 rounded-full opacity-20 blur-3xl pointer-events-none"
              style={{ backgroundColor: previewSkin.glowColor }}
            />
            <div 
              className="absolute -bottom-12 -left-12 w-64 h-64 rounded-full opacity-15 blur-3xl pointer-events-none"
              style={{ backgroundColor: previewSkin.secondaryColor }}
            />

            {/* Header of Showcase */}
            <div className="relative z-10 w-full text-center">
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border shadow-sm"
                style={{
                  backgroundColor: previewSkin.universe === 'multiverse' ? 'rgba(8, 47, 73, 0.6)' : 'rgba(69, 26, 3, 0.6)',
                  borderColor: previewSkin.universe === 'multiverse' ? '#38bdf8' : '#f59e0b',
                  color: previewSkin.universe === 'multiverse' ? '#38bdf8' : '#fbbf24',
                }}
              >
                <span>{previewSkin.universe === 'multiverse' ? '🌀 КИБЕР-МУЛЬТИВСЕЛЕННАЯ' : '🏰 КОРОЛЕВСТВО ИНАМОРТА'}</span>
              </div>

              <h3 className="text-xl font-black text-slate-100 mt-1 drop-shadow">
                {previewSkin.nameRu}
              </h3>
              <p className="text-xs text-amber-400 font-bold">
                «{previewSkin.artTitleRu || previewSkin.tagline}»
              </p>
            </div>

            {/* Large Cinematic Artwork */}
            <div className="relative z-10 my-4 flex flex-col items-center justify-center">
              <div className="w-full max-w-[240px] aspect-square relative group">
                <SkinImage
                  skin={previewSkin}
                  size="xl"
                  showUniverseBadge={true}
                  className="shadow-2xl ring-2"
                />
              </div>
            </div>

            {/* Combat Stats & Per-Skin Attribute Breakdown */}
            <div className="relative z-10 w-full space-y-2.5 bg-slate-900/90 rounded-xl p-3.5 border border-slate-800 text-xs">
              
              {/* Primary Perk Aura */}
              <div className="flex items-center justify-between text-amber-300 font-bold pb-2 border-b border-slate-800">
                <span className="flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Боевая Аура:</span>
                </span>
                <span className="font-mono">{previewSkin.buffSummary}</span>
              </div>

              {/* 4 Detailed Combat Attribute Badges */}
              {previewSkin.combatStats && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="bg-slate-950/70 p-1.5 rounded-lg border border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 flex items-center space-x-1">
                      <Shield className="w-3 h-3 text-sky-400" />
                      <span>Защита:</span>
                    </span>
                    <span className="font-mono font-bold text-sky-300">{previewSkin.combatStats.defense}</span>
                  </div>

                  <div className="bg-slate-950/70 p-1.5 rounded-lg border border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 flex items-center space-x-1">
                      <Zap className="w-3 h-3 text-emerald-400" />
                      <span>Скорость:</span>
                    </span>
                    <span className="font-mono font-bold text-emerald-300">{previewSkin.combatStats.speed}</span>
                  </div>

                  <div className="bg-slate-950/70 p-1.5 rounded-lg border border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 flex items-center space-x-1">
                      <Swords className="w-3 h-3 text-rose-400" />
                      <span>Атака:</span>
                    </span>
                    <span className="font-mono font-bold text-rose-300">{previewSkin.combatStats.attack}</span>
                  </div>

                  <div className="bg-slate-950/70 p-1.5 rounded-lg border border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 flex items-center space-x-1">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>Абилка:</span>
                    </span>
                    <span className="font-mono font-bold text-amber-300 truncate max-w-[80px]" title={previewSkin.combatStats.ability}>
                      {previewSkin.combatStats.ability}
                    </span>
                  </div>
                </div>
              )}

              {/* Lore Description */}
              <p className="text-[11px] text-slate-300 leading-relaxed pt-1">
                {previewSkin.description}
              </p>
            </div>

            {/* Equip / Selected Button */}
            <div className="relative z-10 w-full mt-4">
              {isSelectedEquipped ? (
                <div className="w-full py-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-bold text-xs flex items-center justify-center space-x-1.5 shadow">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Этот облик сейчас активен</span>
                </div>
              ) : (
                <button
                  id="equip-selected-skin-btn"
                  onClick={() => handleEquip(previewSkin.id)}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>Экипировать «{previewSkin.nameRu}»</span>
                </button>
              )}
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <span>Скин меняет визуальный стиль и дает постоянные боевые ауры воинам во всех режимах игры.</span>
          <button
            onClick={() => {
              soundFx.playButtonClick();
              onClose();
            }}
            className="w-full sm:w-auto px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl border border-slate-700 transition-colors cursor-pointer"
          >
            ЗАКРЫТЬ
          </button>
        </div>

      </div>
    </div>
  );
};
