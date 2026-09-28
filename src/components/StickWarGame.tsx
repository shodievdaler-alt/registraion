import React, { useState, useEffect, useRef } from 'react';
import { GameEngine, GameEngineState } from '../utils/gameEngine';
import { soundFx } from '../utils/audio';
import { MainMenu } from './MainMenu';
import { GameCanvas } from './GameCanvas';
import { SummonDock } from './SummonDock';
import { UpgradesModal } from './UpgradesModal';
import { SkinsModal } from './SkinsModal';
import { GuideModal } from './GuideModal';
import { CampaignMap } from './CampaignMap';
import { TournamentBracket } from './TournamentBracket';
import { GameOverModal } from './GameOverModal';
import { WaveAnnouncer } from './WaveAnnouncer';
import { WarriorType, SkinType, DifficultyType, DimensionType, ObstacleType, TournamentAILeader, CampaignLevel } from '../types';
import { CAMPAIGN_LEVELS, TOURNAMENT_LEADERS, WARRIOR_CONFIGS } from '../data/gameConfig';
import { MathQuizModal } from './MathQuizModal';
import { ArrowLeft, Pause, Play, Volume2, VolumeX, Shield, Swords, Sparkles, RefreshCw, Globe, Zap, ArrowRightLeft } from 'lucide-react';

interface StickWarGameProps {
  onBackToFifa: () => void;
  playerPoints?: number;
  onAddPoints?: (pts: number) => void;
}

type ScreenType = 'menu' | 'battle' | 'campaign' | 'tournament';

export const StickWarGame: React.FC<StickWarGameProps> = ({ onBackToFifa, playerPoints, onAddPoints }) => {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('menu');

  // Modals
  const [isUpgradesOpen, setIsUpgradesOpen] = useState(false);
  const [isSkinsOpen, setIsSkinsOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isMathQuizOpen, setIsMathQuizOpen] = useState(false);

  // Currencies & Meta progression
  const [gold, setGold] = useState(300);
  const [gems, setGems] = useState(50);
  const [crowns, setCrowns] = useState(3);
  const [activeSkin, setActiveSkin] = useState<SkinType>('classic');
  const [difficulty, setDifficulty] = useState<DifficultyType>('normal');
  const [highScore, setHighScore] = useState(1250);
  const [isMuted, setIsMuted] = useState(false);

  // Campaign progress
  const [currentLevelId, setCurrentLevelId] = useState(1);
  const [unlockedLevelId, setUnlockedLevelId] = useState(1);

  // Tournament progress
  const [tournamentRound, setTournamentRound] = useState<1 | 2 | 3>(1);
  const [tournamentWon, setTournamentWon] = useState(false);

  // Active Battle Engine
  const engineRef = useRef<GameEngine | null>(null);
  const [gameState, setGameState] = useState<GameEngineState | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Initialize engine once for battle state
  useEffect(() => {
    const engine = new GameEngine(st => {
      setGameState({ ...st });
      setGold(st.stats.gold);
      setGems(st.stats.gems);
      setCrowns(st.stats.crowns);
      setHighScore(st.stats.highScore);
    });

    engineRef.current = engine;
    setGameState(engine.getState());

    // Animation loop for engine
    let animId: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      if (!isPaused && engineRef.current) {
        engineRef.current.update(dt);
      }
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isPaused]);

  // Campaign level start
  const handleSelectCampaignLevel = (lvl: CampaignLevel, diff: DifficultyType) => {
    setCurrentLevelId(lvl.id);
    setDifficulty(diff);
    if (engineRef.current) {
      engineRef.current.setDifficulty(diff);
      engineRef.current.setSkin(activeSkin);
      engineRef.current.startCampaignLevel(lvl.id, diff);
    }
    setCurrentScreen('battle');
  };

  // Tournament duel start
  const handleStartTournamentMatch = (opponent: TournamentAILeader, round: number) => {
    setTournamentRound(round as 1 | 2 | 3);
    if (engineRef.current) {
      engineRef.current.setSkin(activeSkin);
      engineRef.current.startTournamentDuel(opponent.name, round);
    }
    setCurrentScreen('battle');
  };

  // Endless mode start
  const handleStartEndless = () => {
    if (engineRef.current) {
      engineRef.current.setDifficulty(difficulty);
      engineRef.current.setSkin(activeSkin);
      engineRef.current.restartGame();
    }
    setCurrentScreen('battle');
  };

  // Multiverse portal start
  const handleEnterMultiverse = () => {
    if (engineRef.current) {
      engineRef.current.setDifficulty(difficulty);
      engineRef.current.setSkin('avenger');
      setActiveSkin('avenger');
      engineRef.current.restartGame();
      engineRef.current.switchDimension('multiverse');
    }
    setCurrentScreen('battle');
  };

  const handleReturnToMenu = () => {
    setIsPaused(false);
    setCurrentScreen('menu');
  };

  const handleSolveMathInStickWar = (pointsWon: number) => {
    onAddPoints?.(pointsWon);
    const goldBonus = pointsWon * 3;
    const gemsBonus = Math.max(5, Math.round(pointsWon / 10));
    setGold(g => g + goldBonus);
    setGems(g => g + gemsBonus);
    if (engineRef.current) {
      engineRef.current.state.stats.gold += goldBonus;
      engineRef.current.state.stats.gems += gemsBonus;
    }
  };

  return (
    <div className="w-full h-screen bg-[#070913] text-slate-100 flex flex-col select-none overflow-hidden relative font-sans">
      
      {/* Universal Top Switch to FIFA Button */}
      <div className="absolute top-2 right-4 z-50 flex items-center space-x-2">
        <button
          onClick={onBackToFifa}
          className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-700 via-rose-700 to-amber-500 hover:brightness-110 text-white font-black text-xs border border-white/50 shadow-2xl transition-all active:scale-95 cursor-pointer"
          title="Вернуться к игре Очень Плохая Фифа 26 (Барселона)"
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
          <span>⚽ К Фифе 26 (Барселона)</span>
        </button>
      </div>

      {/* Main Menu Screen */}
      {currentScreen === 'menu' && (
        <MainMenu
          gold={gold}
          gems={gems}
          crowns={crowns}
          activeSkin={activeSkin}
          difficulty={difficulty}
          highScore={highScore}
          isMuted={isMuted}
          onStartCampaign={() => setCurrentScreen('campaign')}
          onStartTournament={() => setCurrentScreen('tournament')}
          onOpenSkins={() => setIsSkinsOpen(true)}
          onEnterMultiversePortal={handleEnterMultiverse}
          onStartEndless={handleStartEndless}
          onSelectDifficulty={d => {
            setDifficulty(d);
            engineRef.current?.setDifficulty(d);
          }}
          onOpenGuide={() => setIsGuideOpen(true)}
          onToggleMute={() => {
            const next = !isMuted;
            setIsMuted(next);
            soundFx.setMuted(next);
          }}
          onPlayFifa={onBackToFifa}
          onOpenMathQuiz={() => setIsMathQuizOpen(true)}
        />
      )}

      {/* Campaign Map Screen */}
      {currentScreen === 'campaign' && (
        <CampaignMap
          currentLevelId={currentLevelId}
          unlockedLevelId={unlockedLevelId}
          onSelectLevel={handleSelectCampaignLevel}
          onBackToMenu={handleReturnToMenu}
        />
      )}

      {/* Tournament Screen */}
      {currentScreen === 'tournament' && (
        <TournamentBracket
          currentRound={tournamentRound}
          tournamentWon={tournamentWon}
          onStartMatch={handleStartTournamentMatch}
          onResetTournament={() => {
            setTournamentRound(1);
            setTournamentWon(false);
          }}
          onBackToMenu={handleReturnToMenu}
        />
      )}

      {/* Real-time Battle Screen */}
      {currentScreen === 'battle' && gameState && engineRef.current && (
        <div className="w-full h-full relative flex flex-col justify-between">
          
          {/* Top Battle HUD */}
          <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-2 bg-slate-950/85 backdrop-blur-md border-b border-amber-900/40">
            <div className="flex items-center space-x-3">
              <button
                onClick={handleReturnToMenu}
                className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-300 border border-slate-700 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>В меню</span>
              </button>
              
              <div className="flex items-center space-x-2 font-mono text-xs text-amber-400 font-bold bg-black/50 px-3 py-1 rounded-lg border border-amber-500/30">
                <span>💰 Золото: {Math.floor(gameState.stats.gold)}</span>
              </div>

              {/* Math problem solver button for instant gold and points */}
              <button
                onClick={() => setIsMathQuizOpen(true)}
                title="Решать примеры, чтобы получить очки и золото!"
                className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 text-slate-950 font-black text-xs shadow-md transition-all active:scale-95 animate-pulse"
              >
                <span>🧮</span>
                <span>Примеры (+Золото)</span>
              </button>

              <div className="flex items-center space-x-2 font-mono text-xs text-emerald-400 font-bold bg-black/50 px-3 py-1 rounded-lg border border-emerald-500/30">
                <span>🏰 База: {gameState.castle.hp} / {gameState.castle.maxHp}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2 mr-48">
              {/* Quantum portal switcher */}
              <button
                onClick={() => engineRef.current?.switchDimension()}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-black border shadow transition-all ${
                  gameState.dimension === 'multiverse'
                    ? 'bg-cyan-950 border-cyan-500 text-cyan-300 shadow-cyan-500/30'
                    : 'bg-amber-950 border-amber-500 text-amber-300 shadow-amber-500/30'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{gameState.dimension === 'multiverse' ? 'Мультивселенная' : 'Инаморта'}</span>
              </button>

              <button
                onClick={() => setIsPaused(!isPaused)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                title={isPaused ? 'Продолжить' : 'Пауза'}
              >
                {isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4 text-amber-400" />}
              </button>

              <button
                onClick={() => engineRef.current?.restartGame()}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                title="Перезапустить раунд"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Interactive Battle Canvas */}
          <div className="flex-1 w-full h-full relative">
            <GameCanvas
              engine={engineRef.current}
              state={gameState}
              onCanvasClick={(x, y) => {
                if (gameState.activeObstacleAim) {
                  engineRef.current?.placeObstacle(gameState.activeObstacleAim, x, y);
                }
              }}
            />
          </div>

          {/* Bottom Warrior Summon Dock */}
          <div className="relative z-30">
            <SummonDock
              gold={gameState.stats.gold}
              dimension={gameState.dimension}
              activeSkin={activeSkin}
              warriorTiers={gameState.warriorTiers}
              summonCooldowns={gameState.summonCooldowns}
              obstacleCooldowns={gameState.obstacleCooldowns}
              activeObstacleAim={gameState.activeObstacleAim}
              onSummon={type => engineRef.current?.summonWarrior(type)}
              onSelectObstacleAim={type => engineRef.current?.setObstacleAim(type)}
              onOpenUpgrades={() => setIsUpgradesOpen(true)}
            />
          </div>

          {/* Game Over / Victory Modal */}
          {gameState.waveState === 'game_over' && (
            <GameOverModal
              isOpen={true}
              stats={gameState.stats}
              onRestart={() => engineRef.current?.restartGame()}
              onBackToMenu={handleReturnToMenu}
            />
          )}

          {/* Wave Announcer Banner */}
          {gameState.waveState === 'prep' && (
            <WaveAnnouncer text={`ВОЛНА ${gameState.stats.wave}: ПРИГОТОВИТЬСЯ К ОБОРОНЕ!`} />
          )}
        </div>
      )}

      {/* Upgrades Modal */}
      {isUpgradesOpen && gameState && engineRef.current && (
        <UpgradesModal
          isOpen={isUpgradesOpen}
          castle={gameState.castle}
          gold={gameState.stats.gold}
          warriorTiers={gameState.warriorTiers}
          onClose={() => setIsUpgradesOpen(false)}
          onUpgradeCastle={() => engineRef.current?.upgradeCastle()}
          onUpgradeWarrior={type => engineRef.current?.upgradeWarriorTier(type)}
        />
      )}

      {/* Skins Modal */}
      {isSkinsOpen && (
        <SkinsModal
          isOpen={isSkinsOpen}
          activeSkin={activeSkin}
          gems={gems}
          onEquipSkin={s => {
            setActiveSkin(s);
            engineRef.current?.setSkin(s);
          }}
          onClose={() => setIsSkinsOpen(false)}
        />
      )}

      {/* Guide Modal */}
      {isGuideOpen && (
        <GuideModal
          isOpen={isGuideOpen}
          onClose={() => setIsGuideOpen(false)}
        />
      )}

      {/* Math Quiz Modal */}
      <MathQuizModal
        isOpen={isMathQuizOpen}
        onClose={() => setIsMathQuizOpen(false)}
        playerPoints={playerPoints || 0}
        onAddPoints={handleSolveMathInStickWar}
      />
    </div>
  );
};
