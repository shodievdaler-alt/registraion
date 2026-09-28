import React, { useState } from 'react';
import { MEME_CARDS } from '../data/fifaData';
import { PlayerCard } from '../types/scuffedFifa';
import { soundEngine } from '../utils/audioSynthesizer';
import { X, Sparkles, Gift, RotateCcw, Zap, Coins, Brain } from 'lucide-react';

interface UltimateScamPacksProps {
  isOpen: boolean;
  onClose: () => void;
  playerPoints: number;
  onDeductPoints: (amount: number) => boolean;
  onOpenMathQuiz: () => void;
}

export const UltimateScamPacks: React.FC<UltimateScamPacksProps> = ({
  isOpen,
  onClose,
  playerPoints,
  onDeductPoints,
  onOpenMathQuiz,
}) => {
  const [openingState, setOpeningState] = useState<'idle' | 'opening' | 'revealed'>('idle');
  const [currentCard, setCurrentCard] = useState<PlayerCard | null>(null);
  const [notEnoughPointsMsg, setNotEnoughPointsMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const packCosts = {
    trash: 0,
    gold: 300,
    diamond: 1000,
  };

  const handleOpenPack = (packType: 'trash' | 'gold' | 'diamond') => {
    const cost = packCosts[packType];
    if (cost > 0) {
      const success = onDeductPoints(cost);
      if (!success) {
        soundEngine.playFail();
        setNotEnoughPointsMsg(`Нужно ${cost} очков! Решите примеры, чтобы получить очки!`);
        setTimeout(() => setNotEnoughPointsMsg(null), 3000);
        return;
      }
    }

    setOpeningState('opening');
    soundEngine.playWhistle();

    setTimeout(() => {
      // Pick card based on pack type or random
      let pool = MEME_CARDS;
      if (packType === 'trash') {
        pool = MEME_CARDS.filter(c => c.rarity === 'bronze_trash' || c.rarity === 'silver_mid');
      } else if (packType === 'gold') {
        pool = MEME_CARDS.filter(c => c.rarity === 'gold_meme' || c.rarity === 'silver_mid');
      } else {
        pool = MEME_CARDS.filter(c => c.rarity === 'diamond_goat' || c.rarity === 'gold_meme');
      }

      const card = pool[Math.floor(Math.random() * pool.length)] || MEME_CARDS[0];
      setCurrentCard(card);
      setOpeningState('revealed');
      soundEngine.playPackFanfare();
    }, 1800);
  };

  const getRarityBadge = (rarity: PlayerCard['rarity']) => {
    switch (rarity) {
      case 'diamond_goat':
        return 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-cyan-300';
      case 'gold_meme':
        return 'bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 border-amber-300';
      case 'silver_mid':
        return 'bg-gradient-to-r from-slate-400 to-slate-500 text-slate-950 border-slate-300';
      default:
        return 'bg-gradient-to-r from-amber-800 to-stone-700 text-amber-100 border-amber-700';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-950 border-2 border-purple-500 rounded-3xl p-6 shadow-2xl overflow-hidden text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title & Player Points Bar */}
        <div className="text-center">
          <span className="text-[10px] font-mono tracking-widest text-purple-400 uppercase font-bold">
            ULTIMATE SCAM PACK SIMULATOR
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-rose-400 italic">
            ОТКРЫТИЕ ПАКЕТОВ EA SCAM
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Открой пак и проверь, выпадет ли тебе легендарный Криш Роботалдо или рваный кед за 50 рублей!
          </p>

          {/* User Balance & Solve Math for Points Banner */}
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

          {notEnoughPointsMsg && (
            <div className="mt-2 bg-rose-600/90 text-white font-bold text-xs py-1 px-3 rounded-lg border border-rose-300 animate-bounce inline-block">
              {notEnoughPointsMsg}
            </div>
          )}
        </div>

        {/* State: IDLE (Pack Selection) */}
        {openingState === 'idle' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            {/* Trash Pack */}
            <div className="bg-slate-900/90 border border-stone-700 rounded-2xl p-4 flex flex-col items-center text-center justify-between hover:border-stone-500 transition-all">
              <div>
                <div className="text-4xl mb-2">🗑️</div>
                <h3 className="font-extrabold text-sm text-stone-300">Дворовый Пак</h3>
                <p className="text-[11px] text-slate-400 mt-1">
                  Шанс выбить дворника или сломанный сапог: 99%
                </p>
              </div>
              <button
                onClick={() => handleOpenPack('trash')}
                className="mt-4 w-full bg-stone-700 hover:bg-stone-600 text-stone-100 font-bold text-xs py-2 rounded-xl transition-colors"
              >
                Бесплатно (0 FC)
              </button>
            </div>

            {/* Gold Meme Pack */}
            <div className="bg-slate-900/90 border-2 border-amber-500/80 rounded-2xl p-4 flex flex-col items-center text-center justify-between hover:scale-105 transition-all shadow-lg shadow-amber-500/10">
              <div>
                <div className="text-4xl mb-2">📦✨</div>
                <h3 className="font-extrabold text-sm text-amber-300">Золотой Клоун Пак</h3>
                <p className="text-[11px] text-slate-400 mt-1">
                  Повышенный шанс на Гарри Магуайра и автоголы!
                </p>
              </div>
              <button
                onClick={() => handleOpenPack('gold')}
                className={`mt-4 w-full font-black text-xs py-2 rounded-xl transition-all shadow ${
                  playerPoints >= 300
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 active:scale-95'
                    : 'bg-slate-800 text-amber-300 border border-amber-500/40 hover:bg-slate-700'
                }`}
              >
                {playerPoints >= 300 ? 'Открыть (300 FC)' : '🔒 300 FC (Решить примеры)'}
              </button>
            </div>

            {/* Diamond GOAT Pack */}
            <div className="bg-slate-900/90 border-2 border-cyan-500/80 rounded-2xl p-4 flex flex-col items-center text-center justify-between hover:scale-105 transition-all shadow-lg shadow-cyan-500/10">
              <div>
                <div className="text-4xl mb-2">💎🐐</div>
                <h3 className="font-extrabold text-sm text-cyan-300">Донатный GOAT Пак</h3>
                <p className="text-[11px] text-slate-400 mt-1">
                  Роботалдо SIUUU, Пепси Месси и кувыркающийся Неймар!
                </p>
              </div>
              <button
                onClick={() => handleOpenPack('diamond')}
                className={`mt-4 w-full font-black text-xs py-2 rounded-xl transition-all shadow ${
                  playerPoints >= 1000
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white active:scale-95'
                    : 'bg-slate-800 text-cyan-300 border border-cyan-500/40 hover:bg-slate-700'
                }`}
              >
                {playerPoints >= 1000 ? 'Открыть (1000 FC)' : '🔒 1000 FC (Решить примеры)'}
              </button>
            </div>
          </div>
        )}

        {/* State: OPENING (Dramatic Fireworks Animation) */}
        {openingState === 'opening' && (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <div className="relative">
              <div className="w-32 h-44 bg-gradient-to-br from-amber-400 via-rose-500 to-purple-600 rounded-2xl animate-pulse shadow-2xl flex items-center justify-center text-6xl">
                ⚽
              </div>
              <div className="absolute -inset-4 bg-yellow-400/20 rounded-3xl blur-xl animate-ping" />
            </div>
            <span className="text-xl font-black italic text-amber-400 mt-6 tracking-wide animate-bounce">
              СКАНИРОВАНИЕ КАРТОЧКИ... WALKOUT?! 🎆
            </span>
            <span className="text-xs text-slate-400 mt-1">
              Держите валидол, открывается пак века!
            </span>
          </div>
        )}

        {/* State: REVEALED (Card Showoff) */}
        {openingState === 'revealed' && currentCard && (
          <div className="mt-4 flex flex-col items-center">
            {/* The Football Card */}
            <div className="relative w-64 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-950 border-4 border-amber-400 rounded-3xl p-4 shadow-2xl text-center">
              {/* Overall Rating & Position */}
              <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                <div className="flex flex-col items-start">
                  <span className="text-3xl font-black text-amber-400 leading-none">
                    {currentCard.overall}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">
                    OVR
                  </span>
                </div>
                <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getRarityBadge(currentCard.rarity)}`}>
                  {currentCard.team}
                </div>
              </div>

              {/* Character Photo / Emoji */}
              <div className="my-3 flex justify-center">
                <div className="w-24 h-24 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-6xl shadow-inner">
                  {currentCard.photoEmoji}
                </div>
              </div>

              {/* Player Name */}
              <h3 className="text-xl font-black text-white tracking-tight">
                {currentCard.name}
              </h3>
              <p className="text-[11px] text-amber-300 italic font-mono mt-0.5">
                {currentCard.soundQuote}
              </p>

              {/* Stats Hexagon / Grid */}
              <div className="grid grid-cols-3 gap-1.5 mt-3 pt-3 border-t border-slate-700/80 text-xs font-mono">
                <div className="bg-slate-800/70 p-1 rounded">
                  <span className="text-slate-400 block text-[9px]">СКР</span>
                  <span className="font-bold text-white">{currentCard.pace}</span>
                </div>
                <div className="bg-slate-800/70 p-1 rounded">
                  <span className="text-slate-400 block text-[9px]">УДР</span>
                  <span className="font-bold text-white">{currentCard.shooting}</span>
                </div>
                <div className="bg-slate-800/70 p-1 rounded">
                  <span className="text-slate-400 block text-[9px]">ПАС</span>
                  <span className="font-bold text-white">{currentCard.passing}</span>
                </div>
                <div className="bg-slate-800/70 p-1 rounded">
                  <span className="text-slate-400 block text-[9px]">ДРБ</span>
                  <span className="font-bold text-white">{currentCard.dribbling}</span>
                </div>
                <div className="bg-slate-800/70 p-1 rounded">
                  <span className="text-slate-400 block text-[9px]">ЗЩТ</span>
                  <span className="font-bold text-white">{currentCard.defending}</span>
                </div>
                <div className="bg-slate-800/70 p-1 rounded">
                  <span className="text-slate-400 block text-[9px]">ФИЗ</span>
                  <span className="font-bold text-white">{currentCard.physical}</span>
                </div>
              </div>

              {/* Special Meme Stat Badge */}
              <div className="mt-3 p-1.5 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-between text-xs font-bold text-amber-300">
                <span className="flex items-center space-x-1">
                  <Zap className="w-3.5 h-3.5" />
                  <span>{currentCard.memeStatName}:</span>
                </span>
                <span className="text-sm font-black">{currentCard.memeStatValue}</span>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-300 mt-3 max-w-sm text-center">
              {currentCard.description}
            </p>

            {/* Try Again Button */}
            <button
              onClick={() => setOpeningState('idle')}
              className="mt-4 flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs px-4 py-2 rounded-xl border border-slate-700 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Открыть ещё один пак</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
