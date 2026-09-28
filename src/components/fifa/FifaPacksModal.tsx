import React, { useState } from 'react';
import { CURSED_CARDS } from './fifaData';
import { FifaCardItem } from './types';
import { X, Sparkles, Gift, RotateCcw } from 'lucide-react';
import { fifaAudio } from './fifaAudio';

interface FifaPacksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FifaPacksModal: React.FC<FifaPacksModalProps> = ({ isOpen, onClose }) => {
  const [openedCard, setOpenedCard] = useState<FifaCardItem | null>(null);
  const [isOpening, setIsOpening] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleOpenPack = () => {
    setIsOpening(true);
    setOpenedCard(null);
    fifaAudio.playVarChime();

    setTimeout(() => {
      const randomCard = CURSED_CARDS[Math.floor(Math.random() * CURSED_CARDS.length)];
      setOpenedCard(randomCard);
      setIsOpening(false);
      fifaAudio.playGoalHorn();
      if (randomCard.id === 'card_ronaldo') {
        fifaAudio.playSiuuu();
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="relative w-full max-w-2xl bg-slate-900 border-2 border-amber-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center space-x-2 text-amber-400 font-mono text-xs font-bold uppercase tracking-wider mb-2">
          <Gift className="w-4 h-4" />
          <span>FUT-ДОНАТ ЗА 0 РУБЛЕЙ</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white italic tracking-tight">
          ЗОЛОТОЙ ПАК ДВОРОВЫХ КУМИРОВ
        </h2>
        <p className="text-xs text-slate-400 max-w-md mt-1">
          EA Sports требует 10 000₽ за пак, а у нас бесплатно! Выбей Роналду с рынка, Дядю Толю или Холодильник Магуайра!
        </p>

        {/* Pack Animation / Opened Card View */}
        <div className="my-8 flex flex-col items-center justify-center min-h-[320px]">
          {isOpening ? (
            <div className="flex flex-col items-center animate-bounce space-y-4">
              <div className="text-8xl filter drop-shadow-2xl">📦</div>
              <span className="text-lg font-black text-amber-400 animate-pulse font-mono">
                РАСПАКОВКА ПАКА... ВОТ-ВОТ ВЫПАДЕТ ЛЕГЕНДА!
              </span>
            </div>
          ) : openedCard ? (
            <div className="flex flex-col items-center animate-in zoom-in-75 duration-300">
              {/* Card Container */}
              <div className={`relative w-64 h-96 rounded-2xl p-4 flex flex-col justify-between shadow-2xl border-4 ${
                openedCard.rarity === 'cursed' 
                  ? 'bg-gradient-to-br from-red-950 via-slate-900 to-red-900 border-red-500' 
                  : openedCard.rarity === 'gold' 
                  ? 'bg-gradient-to-br from-amber-500 via-yellow-600 to-amber-700 border-amber-300 text-slate-950' 
                  : 'bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 border-slate-400 text-white'
              }`}>
                {/* Header Rating & Role */}
                <div className="flex justify-between items-start">
                  <div className="flex flex-col items-start leading-none font-black">
                    <span className="text-4xl">{openedCard.rating}</span>
                    <span className="text-sm font-mono tracking-wider mt-1">{openedCard.role}</span>
                  </div>
                  <div className="text-4xl">{openedCard.avatarEmoji}</div>
                </div>

                {/* Nickname & Name */}
                <div className="flex flex-col items-center text-center">
                  <span className="text-[10px] uppercase font-mono font-bold tracking-widest opacity-80">
                    {openedCard.nick}
                  </span>
                  <span className="text-lg font-black tracking-tight uppercase leading-snug">
                    {openedCard.name}
                  </span>
                  <span className="text-[10px] font-medium opacity-80">{openedCard.team}</span>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-1 bg-black/30 p-2 rounded-xl text-[11px] font-mono font-bold">
                  <div>PAC: {openedCard.stats.pac}</div>
                  <div>SHO: {openedCard.stats.sho}</div>
                  <div>PAS: {openedCard.stats.pas}</div>
                  <div>DRI: {openedCard.stats.dri}</div>
                  <div>DEF: {openedCard.stats.def}</div>
                  <div>PHY: {openedCard.stats.phy}</div>
                </div>

                {/* Special Quirk */}
                <div className="text-[9px] italic bg-black/40 p-1.5 rounded text-center text-white/90">
                  «{openedCard.quote}»
                </div>
              </div>

              <div className="mt-3 text-xs text-amber-300 font-mono font-bold max-w-sm">
                ⚡ Способность: {openedCard.specialSkill}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-4">
              <div className="text-8xl hover:scale-105 transition-transform cursor-pointer filter drop-shadow-2xl" onClick={handleOpenPack}>
                🎁
              </div>
              <span className="text-sm font-mono text-slate-400">
                Нажми на кнопку ниже, чтобы вскрыть пак!
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3 w-full max-w-xs">
          <button
            onClick={handleOpenPack}
            disabled={isOpening}
            className="flex-1 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 active:scale-95 text-slate-950 font-black py-3 px-4 rounded-xl border border-amber-300 shadow-xl flex items-center justify-center space-x-2 transition-all text-sm uppercase"
          >
            <Sparkles className="w-4 h-4" />
            <span>{openedCard ? 'ОТКРЫТЬ ЕЩЁ ПАК' : 'ОТКРЫТЬ ПАК (0₽)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
