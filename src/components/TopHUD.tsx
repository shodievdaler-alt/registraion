import React from 'react';
import { MatchEngineState } from '../utils/fifaPhysicsEngine';
import { soundEngine } from '../utils/audioSynthesizer';
import { Volume2, VolumeX, Sparkles, ShoppingBag, Settings, RefreshCw, Trophy, Target, Swords, Shield, Coins, Brain, Globe } from 'lucide-react';

interface TopHUDProps {
  state: MatchEngineState;
  playerPoints: number;
  onOpenMathQuiz: () => void;
  onOpenStadiumWorlds?: () => void;
  onNeymarDive: () => void;
  onMaguireSlide: () => void;
  onToggleScript: () => void;
  onSpawnDog?: () => void;
  onTriggerBrawl?: () => void;
  onOpenStore: () => void;
  onOpenPacks: () => void;
  onOpenPenalty: () => void;
  onOpenGlitchSettings: () => void;
  onOpenTeamSelect: () => void;
  onRestartMatch: () => void;
  onSwitchPlayer: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  isVuvuzelaOn: boolean;
  onToggleVuvuzela: () => void;
  onSwitchToStickWar?: () => void;
}

export const TopHUD: React.FC<TopHUDProps> = ({
  state,
  playerPoints,
  onOpenMathQuiz,
  onOpenStadiumWorlds,
  onNeymarDive,
  onMaguireSlide,
  onToggleScript,
  onSpawnDog,
  onTriggerBrawl,
  onOpenStore,
  onOpenPacks,
  onOpenPenalty,
  onOpenGlitchSettings,
  onOpenTeamSelect,
  onRestartMatch,
  onSwitchPlayer,
  isMuted,
  onToggleMute,
  isVuvuzelaOn,
  onToggleVuvuzela,
  onSwitchToStickWar,
}) => {
  const controlledPlayer = state.players.find(p => p.isControlled);

  return (
    <header className="w-full bg-[#0a0f1d]/95 border-b border-slate-800 text-white shadow-xl z-20 sticky top-0 px-3 py-2 select-none">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Branding & Team Badges / Scoreboard */}
        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex flex-col">
            <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-400 font-bold">
              EA SPORTS™ (НЕ ОФИЦИАЛЬНО)
            </span>
            <span className="text-sm font-black italic tracking-tighter text-amber-400">
              ОЧЕНЬ ПЛОХАЯ ФИФА 26
            </span>
          </div>

          {/* Real-time Match Score Box (Clickable to switch teams) */}
          <button
            id="btn-scoreboard-teams"
            onClick={onOpenTeamSelect}
            title="Нажми, чтобы сменить команды (Играть за Барселону, Реал, Баварию...)"
            className="flex items-center bg-slate-900 hover:bg-slate-800/90 border border-slate-700 hover:border-cyan-400/80 rounded-xl px-3 py-1.5 shadow-inner transition-all group cursor-pointer"
          >
            {/* Home Team */}
            <div className="flex items-center space-x-2">
              <span className="text-xl group-hover:scale-110 transition-transform">{state.homeTeam.badgeEmoji}</span>
              <span className="font-extrabold text-sm sm:text-base text-slate-100 hidden md:inline group-hover:text-cyan-300 transition-colors">
                {state.homeTeam.name}
              </span>
              <span className="font-extrabold text-sm sm:text-base text-slate-100 md:hidden group-hover:text-cyan-300 transition-colors">
                {state.homeTeam.shortName}
              </span>
            </div>

            {/* Score */}
            <div className="mx-3 flex items-center bg-black/60 px-3 py-0.5 rounded-lg border border-slate-800">
              <span className="text-xl sm:text-2xl font-black text-amber-400 tabular-nums">
                {state.stats.homeScore}
              </span>
              <span className="mx-1 text-slate-500 font-bold">:</span>
              <span className="text-xl sm:text-2xl font-black text-amber-400 tabular-nums">
                {state.stats.awayScore}
              </span>
            </div>

            {/* Away Team */}
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-sm sm:text-base text-slate-100 md:hidden group-hover:text-rose-300 transition-colors">
                {state.awayTeam.shortName}
              </span>
              <span className="font-extrabold text-sm sm:text-base text-slate-100 hidden md:inline group-hover:text-rose-300 transition-colors">
                {state.awayTeam.name}
              </span>
              <span className="text-xl group-hover:scale-110 transition-transform">{state.awayTeam.badgeEmoji}</span>
            </div>

            {/* Match Clock */}
            <div className="ml-3 pl-3 border-l border-slate-800 flex items-center space-x-1.5 font-mono text-xs">
              <span className="text-emerald-400 font-bold">
                {Math.min(90, Math.floor(state.matchTime))}'
              </span>
              {state.stoppageTime > 0 && (
                <span className="bg-red-950 text-red-400 border border-red-800 font-bold px-1.5 py-0.5 rounded text-[10px] animate-pulse">
                  +{state.stoppageTime}
                </span>
              )}
            </div>
          </button>
        </div>

        {/* Center: Action Quick Buttons (Player Switch, Neymar Dive, Maguire, EA Script, Dog, Brawl) */}
        <div className="flex items-center space-x-1.5">
          {/* Quick Player Switch Button */}
          <button
            id="btn-switch-player"
            onClick={onSwitchPlayer}
            title="Переключить игрока [Клавиши Q, Tab, C или клик мышью по игроку]"
            className="flex items-center space-x-1.5 bg-cyan-600 hover:bg-cyan-500 active:scale-95 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg border border-cyan-400/60 shadow-md transition-all ring-1 ring-cyan-400/40"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Сменить</span>
            <span className="font-mono text-[10px] bg-cyan-950/80 px-1 rounded text-cyan-200">Q / Tab</span>
          </button>

          <button
            id="btn-neymar-dive"
            onClick={onNeymarDive}
            title="Кувырок Неймара [Z]: упасть, кричать и требовать пенальти"
            className="flex items-center space-x-1 bg-rose-600/90 hover:bg-rose-500 active:scale-95 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg border border-rose-400/50 shadow-md transition-all"
          >
            <span>🚑</span>
            <span className="hidden sm:inline">Кувырок</span>
            <span className="font-mono text-[10px] bg-rose-950/80 px-1 rounded text-rose-200">Z</span>
          </button>

          <button
            id="btn-maguire-slide"
            onClick={onMaguireSlide}
            title="Подкат Магуайра [E]: вынести всех на 15 метров вперед"
            className="flex items-center space-x-1 bg-amber-600/90 hover:bg-amber-500 active:scale-95 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg border border-amber-400/50 shadow-md transition-all"
          >
            <span>🗿</span>
            <span className="hidden sm:inline">Подкат</span>
            <span className="font-mono text-[10px] bg-amber-950/80 px-1 rounded text-amber-200">E</span>
          </button>

          <button
            id="btn-ea-script"
            onClick={onToggleScript}
            title="Скрипт EA [F]: включить гандикап в пользу отстающих"
            className={`flex items-center space-x-1 text-xs font-bold px-2.5 py-1.5 rounded-lg border shadow-md transition-all ${
              state.settings.eaScriptingActive
                ? 'bg-yellow-500 text-black border-yellow-300 animate-pulse ring-2 ring-yellow-400'
                : 'bg-slate-800 hover:bg-slate-700 text-yellow-400 border-slate-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Скрипт EA</span>
            <span className="font-mono text-[10px] bg-black/40 px-1 rounded">F</span>
          </button>

          {/* Quick Dog Button */}
          <button
            id="btn-dog"
            onClick={onSpawnDog}
            title="Выпустить собаку на поле! (Клавиша P)"
            className="flex items-center space-x-1 bg-amber-700 hover:bg-amber-600 text-amber-100 text-xs font-bold px-2 py-1.5 rounded-lg border border-amber-500/50 shadow-md transition-all active:scale-95"
          >
            <span>🐕</span>
            <span className="hidden lg:inline">Собака</span>
            <span className="font-mono text-[10px] bg-black/40 px-1 rounded">P</span>
          </button>

          {/* Quick Brawl Button */}
          <button
            id="btn-brawl"
            onClick={onTriggerBrawl}
            title="Стенка на стенку (массовая драка, Клавиша B)"
            className="flex items-center space-x-1 bg-red-800 hover:bg-red-700 text-red-100 text-xs font-bold px-2 py-1.5 rounded-lg border border-red-500/50 shadow-md transition-all active:scale-95"
          >
            <span>🥊</span>
            <span className="hidden lg:inline">Драка</span>
            <span className="font-mono text-[10px] bg-black/40 px-1 rounded">B</span>
          </button>

          <button
            id="btn-vuvuzela"
            onClick={onToggleVuvuzela}
            title="Вувузела: легендарный гул Чемпионата Мира 2010"
            className={`p-1.5 rounded-lg border transition-all ${
              isVuvuzelaOn
                ? 'bg-amber-500 text-black border-amber-300 animate-bounce'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
          >
            <span className="text-sm">🎺</span>
          </button>
        </div>

        {/* Right: Game Modes & Menus */}
        <div className="flex items-center space-x-1.5">
          {onSwitchToStickWar && (
            <button
              id="btn-switch-stickwar"
              onClick={onSwitchToStickWar}
              title="Перейти в прошлый проект: Стратегия «Армия против Зомби (Stick War)»"
              className="flex items-center space-x-1.5 bg-gradient-to-r from-red-700 via-amber-600 to-yellow-500 hover:brightness-110 text-white text-xs font-black px-2.5 py-1.5 rounded-lg border border-yellow-300/60 shadow-lg transition-all active:scale-95 animate-pulse"
            >
              <Shield className="w-3.5 h-3.5 text-yellow-200" />
              <span className="hidden sm:inline">Прошлый проект</span>
              <span className="text-[10px] bg-red-950/90 text-amber-300 px-1 py-0.2 rounded font-extrabold">ЗОМБИ</span>
            </button>
          )}

          <button
            id="btn-teams-modal"
            onClick={onOpenTeamSelect}
            title="Выбрать команды (Барселона, Реал, Манчестер, Бавария и др.)"
            className="flex items-center space-x-1.5 bg-gradient-to-r from-blue-600 via-rose-600 to-amber-500 hover:brightness-110 text-white text-xs font-black px-2.5 py-1.5 rounded-lg border border-white/30 shadow-md transition-all active:scale-95"
          >
            <Swords className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Команды</span>
            <span className="text-[10px] bg-rose-950/80 text-rose-200 px-1 py-0.2 rounded font-bold">
              {state.homeTeam.id.startsWith('star_wars') ? 'ЗВЁЗДНЫЕ' : 'КЛУБЫ'}
            </span>
          </button>

          {onOpenStadiumWorlds && (
            <button
              id="btn-worlds-modal"
              onClick={onOpenStadiumWorlds}
              title="Выбрать мир и стадион (Звезда Смерти, Мустафар, Хот, Татуин, Киберпанк, Сантьяго)"
              className="flex items-center space-x-1.5 bg-gradient-to-r from-cyan-600 via-sky-600 to-indigo-600 hover:brightness-110 text-white text-xs font-black px-2.5 py-1.5 rounded-lg border border-cyan-300/50 shadow-md transition-all active:scale-95"
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Миры</span>
              <span className="text-[10px] bg-cyan-950/80 text-cyan-200 px-1 py-0.2 rounded font-bold uppercase">
                {state.stadiumWorld === 'death_star'
                  ? 'ЗВЕЗДА'
                  : state.stadiumWorld === 'mustafar'
                  ? 'МУСТАФАР'
                  : state.stadiumWorld === 'hoth'
                  ? 'ХОТ'
                  : state.stadiumWorld === 'tatooine'
                  ? 'ТАТУИН'
                  : state.stadiumWorld === 'cyberpunk'
                  ? 'КИБЕР'
                  : 'СТАДИОН'}
              </span>
            </button>
          )}

          {/* Points Balance & Math Solver Action Button */}
          <div className="flex items-center bg-amber-950/70 border border-amber-400/60 rounded-xl p-0.5 shadow-md">
            <div className="flex items-center space-x-1 px-2 py-0.5">
              <Coins className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="font-mono font-black text-amber-300 text-xs sm:text-sm tabular-nums">
                {playerPoints.toLocaleString()}
              </span>
              <span className="text-[10px] text-amber-400/80 font-bold hidden sm:inline">FC</span>
            </div>
            <button
              id="btn-math-quiz"
              onClick={onOpenMathQuiz}
              title="Чтобы получить очки, нужно решать математические примеры! [Клавиша M]"
              className="bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs px-2 sm:px-2.5 py-1 rounded-lg active:scale-95 shadow transition-all flex items-center space-x-1 animate-pulse"
            >
              <Brain className="w-3.5 h-3.5 text-slate-950" />
              <span className="hidden sm:inline">Примеры</span>
              <span className="text-[10px] bg-black/20 px-1 rounded font-mono font-bold">+Очки</span>
            </button>
          </div>

          <button
            id="btn-packs"
            onClick={onOpenPacks}
            title="Ultimate Scam: Открыть паки с карточками игроков"
            className="flex items-center space-x-1 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg border border-purple-400/40 shadow-sm"
          >
            <Trophy className="w-3.5 h-3.5 text-yellow-300" />
            <span className="hidden md:inline">Паки</span>
          </button>

          <button
            id="btn-penalty"
            onClick={onOpenPenalty}
            title="Пенальти Клоунада"
            className="flex items-center space-x-1 bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-600 hover:to-teal-600 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg border border-emerald-400/40 shadow-sm"
          >
            <Target className="w-3.5 h-3.5 text-emerald-200" />
            <span className="hidden md:inline">Пенальти</span>
          </button>

          <button
            id="btn-store"
            onClick={onOpenStore}
            title="Донат EA: Купить ноги, подкупить судью"
            className="flex items-center space-x-1 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black px-2.5 py-1.5 rounded-lg border border-amber-300 shadow-sm"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Донат</span>
          </button>

          <button
            id="btn-glitches"
            onClick={onOpenGlitchSettings}
            title="Настройки физики и багов"
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            id="btn-sound"
            onClick={onToggleMute}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          <button
            id="btn-restart"
            onClick={onRestartMatch}
            title="Перезапустить матч"
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bottom Sub-Bar: Controlled player stamina & Kick charge meter */}
      {controlledPlayer && (
        <div className="max-w-7xl mx-auto mt-1 pt-1 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
          <div className="flex items-center space-x-3">
            <span className="font-bold text-slate-200">
              Под контролем: <span className="text-amber-400">{controlledPlayer.name} #{controlledPlayer.number}</span>
            </span>
            <div className="flex items-center space-x-1">
              <span>Выносливость:</span>
              <div className="w-20 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                <div
                  className="h-full bg-emerald-500 transition-all duration-100"
                  style={{ width: `${controlledPlayer.stamina}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {state.isChargingKick && (
              <div className="flex items-center space-x-1.5">
                <span className="text-rose-400 font-bold animate-pulse">СИЛА УДАРА:</span>
                <div className="w-28 h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                  <div
                    className="h-full bg-gradient-to-r from-yellow-400 via-orange-500 to-rose-600 transition-all duration-75"
                    style={{ width: `${state.kickCharge * 100}%` }}
                  />
                </div>
              </div>
            )}
            <div className="hidden sm:flex items-center space-x-2 text-[11px] text-slate-400">
              <span>Управление: <b>WASD</b> бег • <b>Пробел</b> удар • <b>Shift</b> ускорение • <b>Tab</b> сменить игрока</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
