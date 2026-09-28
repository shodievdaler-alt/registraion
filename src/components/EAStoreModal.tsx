import React, { useState } from 'react';
import { EA_OFFERS } from '../data/fifaData';
import { soundEngine } from '../utils/audioSynthesizer';
import { X, Sparkles, CreditCard, AlertTriangle, ShieldCheck, Coins, Brain } from 'lucide-react';
import { EAPopupOffer } from '../types/scuffedFifa';

interface EAStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerPoints: number;
  onDeductPoints: (cost: number) => boolean;
  onBuyOffer: (offer: EAPopupOffer) => void;
  onOpenMathQuiz: () => void;
}

export const EAStoreModal: React.FC<EAStoreModalProps> = ({
  isOpen,
  onClose,
  playerPoints,
  onDeductPoints,
  onBuyOffer,
  onOpenMathQuiz,
}) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const parseCost = (priceTag: string): number => {
    const match = priceTag.match(/\d+/);
    return match ? parseInt(match[0], 10) : 500;
  };

  const handleBuy = (offer: EAPopupOffer) => {
    const cost = parseCost(offer.priceTag);
    const success = onDeductPoints(cost);
    if (!success) {
      soundEngine.playFail();
      setErrorMsg(`Не хватает ${cost - playerPoints} очков! Решите примеры в математическом тренажёре!`);
      setTimeout(() => setErrorMsg(null), 3500);
      return;
    }

    soundEngine.playKaChing();
    onBuyOffer(offer);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-amber-500 rounded-3xl p-6 shadow-2xl overflow-hidden text-white">
        {/* Header Ribbon */}
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 py-1 px-4 text-center">
          <span className="text-[11px] font-black uppercase tracking-widest text-slate-950 flex items-center justify-center space-x-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>EA SPORTS™ ОФИЦИАЛЬНЫЙ МАГАЗИН ДОНАТОВ & РАЗВОДОВ</span>
            <Sparkles className="w-3.5 h-3.5" />
          </span>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mt-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-black text-amber-400 italic">
            ПОПОЛНИТЕ СЧЁТ ИЛИ ПРОИГРАЙТЕ!
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Чтобы получить очки для доната, нужно решать математические примеры!
          </p>

          {/* Balance & Math button in Store */}
          <div className="mt-3 flex items-center justify-center gap-3">
            <div className="inline-flex items-center space-x-1.5 bg-amber-950/80 border border-amber-400/60 rounded-xl px-3 py-1 shadow-inner">
              <Coins className="w-4 h-4 text-amber-400" />
              <span className="text-xs text-amber-300 font-bold">Баланс:</span>
              <span className="text-sm font-black text-amber-300 font-mono">
                {playerPoints.toLocaleString()} FC
              </span>
            </div>

            <button
              onClick={onOpenMathQuiz}
              className="bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs px-3 py-1.5 rounded-xl shadow-md transition-all active:scale-95 flex items-center space-x-1.5 animate-pulse"
            >
              <Brain className="w-3.5 h-3.5" />
              <span>Решать примеры (+Очки)</span>
            </button>
          </div>

          {errorMsg && (
            <div className="mt-2 bg-rose-600/90 text-white font-bold text-xs py-1.5 px-3 rounded-xl border border-rose-300 animate-bounce inline-block">
              {errorMsg}
            </div>
          )}
        </div>

        {/* Offers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
          {EA_OFFERS.map(offer => {
            const cost = parseCost(offer.priceTag);
            const canAfford = playerPoints >= cost;

            return (
              <div
                key={offer.id}
                className="bg-slate-800/80 border border-slate-700 hover:border-amber-400/80 rounded-2xl p-4 flex flex-col justify-between transition-all hover:scale-[1.02] shadow-lg group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-extrabold text-sm text-slate-100 group-hover:text-amber-300">
                      {offer.title}
                    </h3>
                    <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                      {offer.priceTag}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    {offer.description}
                  </p>
                  <div className="mt-2 text-[11px] font-bold text-emerald-400 flex items-center space-x-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Бонус: {offer.perk}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-mono">
                    {offer.realCost}
                  </span>
                  {canAfford ? (
                    <button
                      onClick={() => handleBuy(offer)}
                      className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 active:scale-95 text-slate-950 font-black text-xs px-3 py-1.5 rounded-xl shadow-md transition-all flex items-center space-x-1"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>КУПИТЬ ({cost} FC)</span>
                    </button>
                  ) : (
                    <button
                      onClick={onOpenMathQuiz}
                      className="bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 font-bold text-xs px-2.5 py-1.5 rounded-xl transition-all flex items-center space-x-1"
                    >
                      <Brain className="w-3.5 h-3.5" />
                      <span>Нужно {cost} FC (Решить примеры)</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Humorous Disclaimer footer */}
        <div className="mt-5 p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center space-x-2 text-[11px] text-slate-400">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
          <span>
            Внимание: Все очки зарабатываются честным умом при решении примеров. EA Sports одобряет математику!
          </span>
        </div>
      </div>
    </div>
  );
};
