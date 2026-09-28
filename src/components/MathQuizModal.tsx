import React, { useState, useEffect, useRef } from 'react';
import { generateMathProblem } from '../utils/mathGenerator';
import { MathProblem } from '../types/scuffedFifa';
import { soundEngine } from '../utils/audioSynthesizer';
import {
  X,
  Sparkles,
  Flame,
  Award,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  ShoppingBag,
  Trophy,
  Coins,
  Brain,
  Zap,
} from 'lucide-react';

interface MathQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerPoints: number;
  onAddPoints: (amount: number) => void;
  onOpenStore?: () => void;
  onOpenPacks?: () => void;
}

export const MathQuizModal: React.FC<MathQuizModalProps> = ({
  isOpen,
  onClose,
  playerPoints,
  onAddPoints,
  onOpenStore,
  onOpenPacks,
}) => {
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [problem, setProblem] = useState<MathProblem>(() => generateMathProblem('medium'));
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [manualInput, setManualInput] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [sessionPointsEarned, setSessionPointsEarned] = useState(0);
  const [solvedCount, setSolvedCount] = useState(0);
  const [floatingBonus, setFloatingBonus] = useState<string | null>(null);

  // Blitz mode (30 seconds)
  const [isBlitzMode, setIsBlitzMode] = useState(false);
  const [blitzTimer, setBlitzTimer] = useState(30);

  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input or load problem on open
  useEffect(() => {
    if (isOpen) {
      nextProblem(difficulty);
    }
  }, [isOpen, difficulty]);

  // Blitz countdown timer
  useEffect(() => {
    if (!isOpen || !isBlitzMode) return;
    if (blitzTimer <= 0) {
      soundEngine.playWhistle(true);
      return;
    }
    const timer = setInterval(() => {
      setBlitzTimer(t => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, isBlitzMode, blitzTimer]);

  const nextProblem = (diff: 'easy' | 'medium' | 'hard' = difficulty) => {
    setProblem(generateMathProblem(diff));
    setSelectedOption(null);
    setManualInput('');
    setIsAnswered(false);
    setIsCorrect(null);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  const handleSelectOption = (chosen: number) => {
    if (isAnswered) return;
    submitAnswer(chosen);
  };

  const handleManualSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isAnswered) return;
    const num = parseInt(manualInput.trim(), 10);
    if (isNaN(num)) return;
    submitAnswer(num);
  };

  const submitAnswer = (chosen: number) => {
    setIsAnswered(true);
    setSelectedOption(chosen);

    const correct = chosen === problem.answer;
    setIsCorrect(correct);

    if (correct) {
      // Calculate multiplier
      let multiplier = 1.0;
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      if (nextStreak > bestStreak) setBestStreak(nextStreak);

      if (nextStreak >= 5) {
        multiplier = 2.0;
        soundEngine.playComboStreak();
      } else if (nextStreak >= 3) {
        multiplier = 1.5;
        soundEngine.playComboStreak();
      } else {
        soundEngine.playCorrect();
      }

      if (isBlitzMode) {
        multiplier *= 1.25; // Bonus for blitz
      }

      const pointsWon = Math.round(problem.pointsReward * multiplier);
      onAddPoints(pointsWon);
      setSessionPointsEarned(p => p + pointsWon);
      setSolvedCount(c => c + 1);

      const bonusLabel = multiplier > 1.0 ? `+${pointsWon} (x${multiplier.toFixed(1)} СТРИК!)` : `+${pointsWon} ОЧКОВ!`;
      setFloatingBonus(bonusLabel);
      setTimeout(() => setFloatingBonus(null), 1400);

      // Auto advance to next problem after short celebratory delay
      setTimeout(() => {
        nextProblem();
      }, 1000);
    } else {
      soundEngine.playWrong();
      setStreak(0);
      setFloatingBonus('❌ НЕВЕРНО');
      setTimeout(() => setFloatingBonus(null), 1200);
    }
  };

  // Keyboard shortcut listener (1, 2, 3, 4 for options)
  useEffect(() => {
    if (!isOpen || isAnswered) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) {
        if (e.key === 'Enter') {
          handleManualSubmit();
        }
        return;
      }

      if (['1', '2', '3', '4'].includes(e.key)) {
        const idx = parseInt(e.key, 10) - 1;
        if (problem.options[idx] !== undefined) {
          handleSelectOption(problem.options[idx]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isAnswered, problem]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-gradient-to-b from-slate-900 via-indigo-950/95 to-slate-950 border-2 border-amber-400 rounded-3xl p-5 sm:p-6 shadow-2xl text-white overflow-hidden">
        {/* Top Gold Ribbon */}
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 py-1 px-4 text-center shadow">
          <div className="flex items-center justify-center space-x-2 text-[11px] font-black uppercase tracking-wider text-slate-950">
            <Brain className="w-3.5 h-3.5" />
            <span>ТРЕНАЖЁР ОЧКОВ: РЕШАЙ ПРИМЕРЫ ДЛЯ ПОЛУЧЕНИЯ ДОНАТА И ПАКОВ</span>
            <Sparkles className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Balance & Title */}
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-200">
              🧮 РЕШЕНИЕ ПРИМЕРОВ ЗА ОЧКИ
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Каждый правильный ответ даёт FC Очки на паки и читы EA!
            </p>
          </div>

          {/* Current Player Points Counter */}
          <div className="flex items-center space-x-2 bg-amber-500/20 border border-amber-400/60 rounded-2xl px-3.5 py-1.5 shadow-inner">
            <Coins className="w-5 h-5 text-amber-400 animate-bounce" />
            <div className="flex flex-col items-start leading-none">
              <span className="text-[10px] uppercase font-mono text-amber-300 font-bold">Ваш баланс:</span>
              <span className="text-lg font-black text-amber-300 font-mono">
                {playerPoints.toLocaleString()} <span className="text-xs font-sans">FC</span>
              </span>
            </div>
          </div>
        </div>

        {/* Floating Reward Animation */}
        {floatingBonus && (
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30">
            <div
              className={`text-2xl sm:text-3xl font-black px-4 py-2 rounded-2xl shadow-2xl border animate-bounce ${
                floatingBonus.includes('❌')
                  ? 'bg-rose-600/90 text-white border-rose-300'
                  : 'bg-emerald-600/95 text-white border-emerald-300 shadow-emerald-500/50'
              }`}
            >
              {floatingBonus}
            </div>
          </div>
        )}

        {/* Difficulty & Mode Selector Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-2 mt-4">
          <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => {
                setDifficulty('easy');
                setIsBlitzMode(false);
              }}
              className={`text-xs font-bold px-3 py-1 rounded-lg transition-all ${
                difficulty === 'easy' && !isBlitzMode
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🟢 Легко (+50)
            </button>
            <button
              onClick={() => {
                setDifficulty('medium');
                setIsBlitzMode(false);
              }}
              className={`text-xs font-bold px-3 py-1 rounded-lg transition-all ${
                difficulty === 'medium' && !isBlitzMode
                  ? 'bg-amber-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🟡 Средне (+100)
            </button>
            <button
              onClick={() => {
                setDifficulty('hard');
                setIsBlitzMode(false);
              }}
              className={`text-xs font-bold px-3 py-1 rounded-lg transition-all ${
                difficulty === 'hard' && !isBlitzMode
                  ? 'bg-rose-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🔴 Сложно (+250)
            </button>
          </div>

          {/* Blitz Toggle */}
          <button
            onClick={() => {
              const next = !isBlitzMode;
              setIsBlitzMode(next);
              if (next) setBlitzTimer(30);
            }}
            className={`text-xs font-black px-3 py-1.5 rounded-xl border flex items-center space-x-1.5 transition-all ${
              isBlitzMode
                ? 'bg-purple-600 border-purple-400 text-white animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-purple-300'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-yellow-300" />
            <span>Блиц 30с</span>
            {isBlitzMode && (
              <span className="font-mono text-xs bg-black/40 px-1 rounded text-yellow-300">
                {blitzTimer}с
              </span>
            )}
          </button>
        </div>

        {/* Streak & Stats Bar */}
        <div className="flex items-center justify-between bg-slate-950/60 border border-slate-800/80 rounded-xl px-3 py-1.5 mt-3 text-xs">
          <div className="flex items-center space-x-2">
            <span className="flex items-center text-amber-400 font-bold">
              <Flame className={`w-4 h-4 mr-1 ${streak > 0 ? 'text-orange-500 animate-pulse' : 'text-slate-600'}`} />
              Стрик: <span className="font-mono text-white ml-1 font-black">{streak}</span>
            </span>
            {streak >= 3 && (
              <span className="bg-orange-500/20 text-orange-300 border border-orange-500/40 text-[10px] font-bold px-1.5 py-0.2 rounded-full animate-pulse">
                {streak >= 5 ? 'x2.0 ОЧКОВ! 🔥🔥' : 'x1.5 БОНУС! 🔥'}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-3 text-slate-400 font-mono text-[11px]">
            <span>Решено: <strong className="text-emerald-400">{solvedCount}</strong></span>
            <span>За сессию: <strong className="text-amber-400">+{sessionPointsEarned}</strong></span>
          </div>
        </div>

        {/* The Math Problem Display Box */}
        <div className="mt-4 bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-indigo-500/50 rounded-2xl p-6 text-center relative shadow-inner">
          <span className="text-[11px] uppercase tracking-widest text-indigo-300 font-mono font-bold">
            РЕШИТЕ ПРИМЕР:
          </span>

          <div className="my-3 text-4xl sm:text-5xl font-black font-mono tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-100">
            {problem.expression} = ?
          </div>

          {/* Explanation if answered */}
          {isAnswered && (
            <div
              className={`mt-2 text-xs font-bold py-1 px-3 rounded-lg inline-flex items-center space-x-1.5 ${
                isCorrect
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700'
                  : 'bg-rose-950/80 text-rose-300 border border-rose-700'
              }`}
            >
              {isCorrect ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{problem.explanation}</span>
            </div>
          )}
        </div>

        {/* 4 Multi-Choice Option Buttons */}
        <div className="grid grid-cols-2 gap-2.5 mt-4">
          {problem.options.map((opt, idx) => {
            const isChosen = selectedOption === opt;
            const isAnswerKey = opt === problem.answer;

            let btnStyle = 'bg-slate-800/90 hover:bg-slate-700/90 border-slate-700 text-slate-100 hover:border-indigo-400';
            if (isAnswered) {
              if (isAnswerKey) {
                btnStyle = 'bg-emerald-600 border-emerald-400 text-white ring-2 ring-emerald-400';
              } else if (isChosen && !isCorrect) {
                btnStyle = 'bg-rose-600 border-rose-400 text-white';
              } else {
                btnStyle = 'bg-slate-900/60 border-slate-800 text-slate-500 opacity-60';
              }
            }

            return (
              <button
                key={idx}
                disabled={isAnswered}
                onClick={() => handleSelectOption(opt)}
                className={`py-3 px-4 rounded-xl border-2 font-mono font-black text-xl sm:text-2xl transition-all shadow-md active:scale-95 flex items-center justify-between ${btnStyle}`}
              >
                <span className="text-[11px] font-sans font-bold bg-black/40 text-slate-400 px-1.5 py-0.5 rounded border border-white/10">
                  {idx + 1}
                </span>
                <span className="flex-1 text-center">{opt}</span>
              </button>
            );
          })}
        </div>

        {/* Optional Manual Numeric Input Form */}
        <form onSubmit={handleManualSubmit} className="mt-3 flex items-center space-x-2">
          <input
            ref={inputRef}
            type="number"
            value={manualInput}
            onChange={e => setManualInput(e.target.value)}
            disabled={isAnswered}
            placeholder="Или введите ответ числом..."
            className="flex-1 bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-sm text-center font-mono font-bold text-white focus:outline-none focus:border-amber-400 placeholder:text-slate-500"
          />
          <button
            type="submit"
            disabled={isAnswered || !manualInput.trim()}
            className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow transition-all active:scale-95"
          >
            Ответить
          </button>
          {isAnswered && (
            <button
              type="button"
              onClick={() => nextProblem()}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs px-4 py-2.5 rounded-xl shadow transition-all flex items-center space-x-1"
            >
              <span>Дальше</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </form>

        {/* Footer Navigation: Spend Points */}
        <div className="mt-5 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-slate-400">Куда потратить очки:</span>
          <div className="flex items-center space-x-2">
            {onOpenPacks && (
              <button
                onClick={() => {
                  onClose();
                  onOpenPacks();
                }}
                className="bg-purple-900/80 hover:bg-purple-800 text-purple-200 border border-purple-600/60 font-bold px-3 py-1.5 rounded-xl flex items-center space-x-1.5 shadow transition-all active:scale-95"
              >
                <Trophy className="w-3.5 h-3.5 text-yellow-300" />
                <span>Открыть паки (от 300 FC)</span>
              </button>
            )}
            {onOpenStore && (
              <button
                onClick={() => {
                  onClose();
                  onOpenStore();
                }}
                className="bg-amber-600/90 hover:bg-amber-500 text-slate-950 font-black px-3 py-1.5 rounded-xl flex items-center space-x-1.5 shadow transition-all active:scale-95"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Купить читы EA</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
