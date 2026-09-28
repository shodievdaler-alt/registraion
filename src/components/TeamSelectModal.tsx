import React from 'react';
import { TEAMS } from '../data/fifaData';
import { TeamConfig } from '../types/scuffedFifa';
import { X, Check, Shield, Flame, Swords } from 'lucide-react';

interface TeamSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  homeTeamId: string;
  awayTeamId: string;
  onSelectTeams: (homeId: string, awayId: string) => void;
}

export const TeamSelectModal: React.FC<TeamSelectModalProps> = ({
  isOpen,
  onClose,
  homeTeamId,
  awayTeamId,
  onSelectTeams,
}) => {
  const [selectedHome, setSelectedHome] = React.useState(homeTeamId);
  const [selectedAway, setSelectedAway] = React.useState(awayTeamId);

  React.useEffect(() => {
    if (isOpen) {
      setSelectedHome(homeTeamId);
      setSelectedAway(awayTeamId);
    }
  }, [isOpen, homeTeamId, awayTeamId]);

  if (!isOpen) return null;

  const handleApply = () => {
    onSelectTeams(selectedHome, selectedAway);
    onClose();
  };

  const handleQuickElClasico = () => {
    setSelectedHome('blue_barca');
    setSelectedAway('white_madrid');
  };

  const handleQuickStarWars = () => {
    setSelectedHome('star_wars_rebels');
    setSelectedAway('star_wars_empire');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-900 border-2 border-slate-700 rounded-3xl shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950/80 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-blue-600 to-rose-600 text-white shadow-lg">
              <Swords className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                ВЫБОР КОМАНД
                <span className="text-xs font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full">
                  Играй за Барселону!
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Выбери, за какой клуб ты играешь (Домашние) и против кого (Гости)
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleQuickStarWars}
              className="hidden sm:flex items-center space-x-1.5 bg-gradient-to-r from-red-700 via-slate-800 to-sky-700 hover:brightness-110 text-white text-xs font-black px-3 py-1.5 rounded-xl border border-amber-400/40 shadow-md transition-all active:scale-95"
            >
              <span>🗡️</span>
              <span>ЗВЁЗДНЫЕ ВОЙНЫ</span>
            </button>
            <button
              onClick={handleQuickElClasico}
              className="hidden sm:flex items-center space-x-1.5 bg-gradient-to-r from-blue-700 via-rose-700 to-amber-600 hover:brightness-110 text-white text-xs font-black px-3 py-1.5 rounded-xl border border-white/20 shadow-md transition-all active:scale-95"
            >
              <span>⚔️</span>
              <span>ЭЛЬ-КЛАСИКО</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body: Two columns for Home (Your Team) and Away (Opponent) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* HOME TEAM (ТВОЯ КОМАНДА) */}
          <div className="flex flex-col space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
                <h3 className="font-black text-sm uppercase tracking-wider text-cyan-300">
                  ТВОЯ КОМАНДА (УПРАВЛЕНИЕ)
                </h3>
              </div>
              <span className="text-[11px] font-mono font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md">
                1P ИГРОК
              </span>
            </div>

            <div className="space-y-2.5">
              {TEAMS.map((team: TeamConfig) => {
                const isSelected = selectedHome === team.id;
                const isBarca = team.id === 'blue_barca';

                return (
                  <button
                    key={`home-${team.id}`}
                    onClick={() => {
                      setSelectedHome(team.id);
                      if (selectedAway === team.id) {
                        // Switch away team if same
                        const other = TEAMS.find(t => t.id !== team.id);
                        if (other) setSelectedAway(other.id);
                      }
                    }}
                    className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between group ${
                      isSelected
                        ? 'bg-gradient-to-r from-blue-950/80 to-slate-900 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.25)] ring-2 ring-cyan-400/40'
                        : 'bg-slate-950/60 hover:bg-slate-800/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3.5 min-w-0">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-white/10 shrink-0"
                        style={{ backgroundColor: team.primaryColor }}
                      >
                        {team.badgeEmoji}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="font-black text-sm text-white group-hover:text-cyan-300 transition-colors truncate">
                            {team.name}
                          </span>
                          {isBarca && (
                            <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[9px] font-extrabold px-1.5 py-0.5 rounded">
                              ⭐ ВЫБОР!
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-1 italic mt-0.5">
                          {team.motto}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 ml-2">
                      {isSelected ? (
                        <div className="w-7 h-7 rounded-full bg-cyan-500 flex items-center justify-center text-slate-950 font-black shadow-md">
                          <Check className="w-4 h-4 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-7 h-7 rounded-full border border-slate-700 group-hover:border-slate-500" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* AWAY TEAM (СОПЕРНИК) */}
          <div className="flex flex-col space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-rose-400" />
                <h3 className="font-black text-sm uppercase tracking-wider text-rose-300">
                  СОПЕРНИК (БОТ AI)
                </h3>
              </div>
              <span className="text-[11px] font-mono font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md">
                КОМПЬЮТЕР
              </span>
            </div>

            <div className="space-y-2.5">
              {TEAMS.map((team: TeamConfig) => {
                const isSelected = selectedAway === team.id;
                const isCurrentHome = selectedHome === team.id;

                return (
                  <button
                    key={`away-${team.id}`}
                    disabled={isCurrentHome}
                    onClick={() => setSelectedAway(team.id)}
                    className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between group ${
                      isCurrentHome
                        ? 'opacity-40 cursor-not-allowed bg-slate-950 border-slate-900'
                        : isSelected
                        ? 'bg-gradient-to-r from-rose-950/80 to-slate-900 border-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.25)] ring-2 ring-rose-400/40'
                        : 'bg-slate-950/60 hover:bg-slate-800/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3.5 min-w-0">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-white/10 shrink-0"
                        style={{ backgroundColor: team.primaryColor }}
                      >
                        {team.badgeEmoji}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="font-black text-sm text-white group-hover:text-rose-300 transition-colors truncate">
                            {team.name}
                          </span>
                          {isCurrentHome && (
                            <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                              Твоя команда
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-1 italic mt-0.5">
                          {team.motto}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 ml-2">
                      {isSelected ? (
                        <div className="w-7 h-7 rounded-full bg-rose-500 flex items-center justify-center text-white font-black shadow-md">
                          <Check className="w-4 h-4 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-7 h-7 rounded-full border border-slate-700 group-hover:border-slate-500" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-950/90 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-xs text-slate-300">
            <span>Матч:</span>
            <span className="font-black text-cyan-300">
              {TEAMS.find(t => t.id === selectedHome)?.name}
            </span>
            <span className="text-slate-500 font-bold">VS</span>
            <span className="font-black text-rose-300">
              {TEAMS.find(t => t.id === selectedAway)?.name}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
            >
              Отмена
            </button>
            <button
              id="btn-apply-teams"
              onClick={handleApply}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-95 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/30 transition-all flex items-center space-x-2"
            >
              <span>НАЧАТЬ МАТЧ ЗА {TEAMS.find(t => t.id === selectedHome)?.shortName || 'КОМАНДУ'}! ⚽</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
