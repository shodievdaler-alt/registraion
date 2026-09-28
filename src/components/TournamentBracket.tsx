import React, { useState } from 'react';
import { TournamentAILeader } from '../types';
import { TOURNAMENT_LEADERS } from '../data/gameConfig';
import { useTranslation } from '../utils/i18n';
import { soundFx } from '../utils/audio';
import { 
  ArrowLeft, 
  Trophy, 
  Crown, 
  Swords, 
  Shield, 
  Zap, 
  Check, 
  Sparkles,
  ChevronRight,
  Play
} from 'lucide-react';

interface TournamentBracketProps {
  currentRound: 1 | 2 | 3;
  tournamentWon: boolean;
  onStartMatch: (opponent: TournamentAILeader, round: number) => void;
  onResetTournament: () => void;
  onBackToMenu: () => void;
}

export const TournamentBracket: React.FC<TournamentBracketProps> = ({
  currentRound,
  tournamentWon,
  onStartMatch,
  onResetTournament,
  onBackToMenu,
}) => {
  const { t } = useTranslation();

  // 8 Leaders: index 0 is player, opponents are 1..7
  // Round 1 opponent: ironfist (index 1)
  // Round 2 opponent: krog_berserk (index 4)
  // Round 3 opponent: void_overlord (index 7)
  const roundOpponentMap: Record<number, TournamentAILeader> = {
    1: TOURNAMENT_LEADERS[1], // General Ironfist
    2: TOURNAMENT_LEADERS[4], // Warlord Krog
    3: TOURNAMENT_LEADERS[7], // Titan of the Void
  };

  const currentOpponent = roundOpponentMap[currentRound] || roundOpponentMap[1];
  const [selectedOpponent, setSelectedOpponent] = useState<TournamentAILeader>(currentOpponent);

  const roundName = currentRound === 1 
    ? t('roundQuarter') 
    : currentRound === 2 
      ? t('roundSemi') 
      : t('roundFinal');

  const handleFight = () => {
    soundFx.playWaveStart();
    onStartMatch(currentOpponent, currentRound);
  };

  return (
    <div className="h-screen w-screen bg-[#070913] text-slate-100 flex flex-col select-none overflow-hidden relative font-sans">
      
      {/* Background Gradient and Ambiance */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-[#101426] to-[#080913] opacity-95" />
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

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
            <Trophy className="w-5 h-5 text-amber-400" />
            <span>{t('tournament')}</span>
          </h1>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs px-3 py-1 rounded-lg bg-amber-500/20 border border-amber-500/50 text-amber-300 font-bold flex items-center space-x-1">
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span>{roundName}</span>
          </span>
        </div>
      </header>

      {/* Main Tournament Content */}
      <div className="relative z-10 flex-1 flex flex-col lg:flex-row overflow-hidden p-4 sm:p-6 gap-6">
        
        {/* Left: Tournament Bracket Tree (Quarter -> Semi -> Final) */}
        <div className="flex-1 bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between backdrop-blur-sm overflow-y-auto">
          
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              СЕТКА ТУРНИРА 8 ПОЛКОВОДЦЕВ
            </span>
            <span className="text-xs text-amber-400 font-mono font-bold">
              {tournamentWon ? '🏆 ТУРНИР ВЫИГРАН!' : `РАУНД ${currentRound} ИЗ 3`}
            </span>
          </div>

          {/* Bracket Tree Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center flex-1 my-2">
            
            {/* Column 1: Quarterfinals (Round 1) */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400/80 block text-center mb-1">
                1/4 ФИНАЛА
              </span>

              {/* Match 1: Player vs Ironfist */}
              <div 
                onClick={() => {
                  soundFx.playButtonClick();
                  setSelectedOpponent(TOURNAMENT_LEADERS[1]);
                }}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                  currentRound === 1 
                    ? 'bg-amber-500/10 border-amber-400 shadow-md ring-1 ring-amber-400/40' 
                    : currentRound > 1 
                      ? 'bg-emerald-950/30 border-emerald-500/40' 
                      : 'bg-slate-900/60 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-amber-300">👑 Игрок (Ты)</span>
                  {currentRound > 1 && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <div className="h-px bg-slate-800 my-1.5" />
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">⚔️ Генерал Стальной Кулак</span>
                  <span className="text-[10px] text-slate-500">AI</span>
                </div>
              </div>

              {/* Match 2: Frostpeak vs Lord Necros */}
              <div className="p-2.5 rounded-xl border bg-slate-900/40 border-slate-800/80 opacity-75">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>❄️ Морозный Пик</span>
                  {currentRound > 1 && <span className="text-[10px] text-slate-500">ВЫБЫЛ</span>}
                </div>
                <div className="h-px bg-slate-800 my-1.5" />
                <div className="flex items-center justify-between text-xs text-slate-300 font-bold">
                  <span>💀 Лорд Некрос</span>
                  {currentRound > 1 && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
              </div>

              {/* Match 3: Krog vs Nova Cyber */}
              <div className="p-2.5 rounded-xl border bg-slate-900/40 border-slate-800/80 opacity-75">
                <div className="flex items-center justify-between text-xs text-slate-300 font-bold">
                  <span>🪓 Вождь Крог</span>
                  {currentRound > 1 && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <div className="h-px bg-slate-800 my-1.5" />
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>🤖 Нова Кибер</span>
                </div>
              </div>

              {/* Match 4: Grand Inquisitor vs Void Overlord */}
              <div className="p-2.5 rounded-xl border bg-slate-900/40 border-slate-800/80 opacity-75">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>🛡️ Инквизитор</span>
                </div>
                <div className="h-px bg-slate-800 my-1.5" />
                <div className="flex items-center justify-between text-xs text-slate-300 font-bold">
                  <span>👹 Титан Бездны</span>
                  {currentRound > 1 && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
              </div>

            </div>

            {/* Column 2: Semifinals (Round 2) */}
            <div className="space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400/80 block text-center mb-1">
                ПОЛУФИНАЛ
              </span>

              {/* Match 1: Player vs Krog */}
              <div 
                onClick={() => {
                  soundFx.playButtonClick();
                  setSelectedOpponent(TOURNAMENT_LEADERS[4]);
                }}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  currentRound === 2 
                    ? 'bg-amber-500/10 border-amber-400 shadow-md ring-1 ring-amber-400/40' 
                    : currentRound > 2 
                      ? 'bg-emerald-950/30 border-emerald-500/40' 
                      : 'bg-slate-900/40 border-slate-800/80 opacity-65'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-amber-300">👑 Игрок (Ты)</span>
                  {currentRound > 2 && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <div className="h-px bg-slate-800 my-2" />
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">🪓 Вождь Крог</span>
                  <span className="text-[10px] text-amber-400 font-bold">AI</span>
                </div>
              </div>

              {/* Match 2: Lord Necros vs Void Overlord */}
              <div className="p-3 rounded-xl border bg-slate-900/40 border-slate-800/80 opacity-65">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>💀 Лорд Некрос</span>
                </div>
                <div className="h-px bg-slate-800 my-2" />
                <div className="flex items-center justify-between text-xs text-slate-300 font-bold">
                  <span>👹 Титан Бездны</span>
                  {currentRound > 2 && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
              </div>

            </div>

            {/* Column 3: Grand Final (Round 3) */}
            <div className="space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 block text-center mb-1">
                👑 ГРАНД-ФИНАЛ
              </span>

              <div 
                onClick={() => {
                  soundFx.playButtonClick();
                  setSelectedOpponent(TOURNAMENT_LEADERS[7]);
                }}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  tournamentWon
                    ? 'bg-amber-500/20 border-amber-400 shadow-xl shadow-amber-500/30'
                    : currentRound === 3
                      ? 'bg-amber-500/10 border-amber-400 ring-2 ring-amber-400/50 shadow-lg'
                      : 'bg-slate-900/40 border-slate-800/80 opacity-65'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-black">
                  <span className="text-amber-300">👑 Игрок (Ты)</span>
                  {tournamentWon && <Crown className="w-4 h-4 text-amber-400" />}
                </div>
                <div className="h-px bg-slate-800 my-2.5" />
                <div className="flex items-center justify-between text-xs font-bold text-rose-300">
                  <span>👹 Титан Бездны</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-950 border border-rose-500/40 text-rose-400">
                    БОСС
                  </span>
                </div>
              </div>

              {tournamentWon && (
                <div className="p-3 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/50 rounded-xl text-center animate-pulse">
                  <span className="text-xs font-black text-amber-300 uppercase block">
                    🎉 ТЫ ЧЕМПИОН ТУРНИРА!
                  </span>
                  <span className="text-[11px] text-slate-300">
                    Корона Инаморты твоя! +500 🪙 +50 💎 +1 👑
                  </span>
                </div>
              )}

            </div>

          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs text-slate-400">
            <span>Побеждайте соперников, чтобы продвигаться по сетке к Короне.</span>
            {tournamentWon && (
              <button
                onClick={onResetTournament}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
              >
                Начать Турнир Заново
              </button>
            )}
          </div>
        </div>

        {/* Right: Selected Opponent Profile Card */}
        <div className="w-full lg:w-96 bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/40 rounded-2xl p-5 flex flex-col justify-between shadow-2xl backdrop-blur-md">
          
          <div>
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block mb-1">
              СОПЕРНИК В ТЕКУЩЕМ БОЮ
            </span>

            {/* Avatar & Title */}
            <div className="flex items-center space-x-3 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 mt-2">
              <div className="w-14 h-14 rounded-xl bg-slate-800 border border-amber-500/40 flex items-center justify-center text-3xl shadow">
                {selectedOpponent.avatar}
              </div>
              <div className="flex-1">
                <h3 className="text-base font-black text-slate-100 leading-tight">
                  {selectedOpponent.name}
                </h3>
                <span className="text-xs text-amber-400 font-bold block">
                  {selectedOpponent.titleRu}
                </span>
                <span className="text-[10px] text-slate-400 uppercase font-mono">
                  Сложность: {selectedOpponent.difficulty}
                </span>
              </div>
            </div>

            {/* Playstyle & Tactics */}
            <div className="mt-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 space-y-2">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                Тактика Соперника:
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedOpponent.playstyleRu}
              </p>
            </div>

            {/* Favored Units */}
            <div className="mt-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Любимые Отряды:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedOpponent.favoredUnits.map(unit => (
                  <span 
                    key={unit} 
                    className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-amber-300 font-mono font-bold"
                  >
                    {unit}
                  </span>
                ))}
              </div>
            </div>

            {/* Tournament Reward */}
            <div className="mt-4 bg-amber-950/30 border border-amber-500/40 rounded-xl p-3 flex items-center justify-between text-xs">
              <span className="text-amber-300 font-bold">Награда за Раунд:</span>
              <span className="text-amber-400 font-mono font-bold">
                +{currentRound * 250} 🪙 +{currentRound * 20} 💎
              </span>
            </div>
          </div>

          {/* Action Button: Fight! */}
          <div className="mt-5">
            {!tournamentWon ? (
              <button
                id="start-tournament-match-btn"
                onClick={handleFight}
                className="w-full py-3.5 bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-slate-950 font-black text-sm uppercase tracking-wider rounded-xl shadow-xl shadow-amber-500/25 transition-transform active:scale-95 flex items-center justify-center space-x-2 border-t border-amber-300 cursor-pointer"
              >
                <Swords className="w-4 h-4" />
                <span>СРАЗИТЬСЯ В {roundName}!</span>
              </button>
            ) : (
              <button
                onClick={onResetTournament}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs uppercase rounded-xl transition-colors"
              >
                Начать Новый Турнир
              </button>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
