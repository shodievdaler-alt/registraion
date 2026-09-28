import React from 'react';
import { MessageSquareQuote, Flame } from 'lucide-react';

interface CommentaryTickerProps {
  ticker: string[];
  stats: {
    shotsHome: number;
    shotsAway: number;
    simulationsHome: number;
    maguireOwnGoals: number;
  };
}

export const CommentaryTicker: React.FC<CommentaryTickerProps> = ({ ticker, stats }) => {
  return (
    <div className="w-full bg-[#080d19] border-t border-slate-800 px-4 py-2.5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
      {/* Latest Match Event */}
      <div className="flex items-center space-x-2.5 overflow-hidden w-full md:w-auto flex-1">
        <span className="flex items-center space-x-1 text-emerald-400 font-black uppercase text-[10px] tracking-wider shrink-0 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
          <Flame className="w-3.5 h-3.5" />
          <span>СОБЫТИЯ МАТЧА</span>
        </span>
        <p className="text-slate-300 font-medium truncate text-xs">
          {ticker[0] || 'Матч в самом разгаре!'}
        </p>
      </div>

      {/* Match Fun Stats */}
      <div className="flex items-center space-x-4 shrink-0 text-[11px] font-mono text-slate-400">
        <span title="Кувырков Неймара">
          🚑 Симуляций: <b className="text-rose-400">{stats.simulationsHome}</b>
        </span>
        <span title="Автоголов Магуайра">
          🗿 Автоголов Магуайра: <b className="text-amber-400">{stats.maguireOwnGoals}</b>
        </span>
        <span title="Удары по воробьям">
          🚀 Ударов: <b className="text-emerald-400">{stats.shotsHome + stats.shotsAway}</b>
        </span>
      </div>
    </div>
  );
};
