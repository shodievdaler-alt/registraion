import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FifaEngine } from './FifaEngine';
import { FifaPitchCanvas } from './FifaPitchCanvas';
import { FifaScoreboard } from './FifaScoreboard';
import { FifaControlsOverlay } from './FifaControlsOverlay';
import { FifaMainMenu } from './FifaMainMenu';
import { FifaPacksModal } from './FifaPacksModal';
import { FifaPenaltyShootout } from './FifaPenaltyShootout';
import { FifaTeamId } from './types';
import { fifaAudio } from './fifaAudio';

interface ScuffedFifaGameProps {
  onSwitchToOriginalApp?: () => void;
}

type FifaView = 'menu' | 'match' | 'penalty';

export const ScuffedFifaGame: React.FC<ScuffedFifaGameProps> = ({ onSwitchToOriginalApp }) => {
  const [currentView, setCurrentView] = useState<FifaView>('menu');
  const [homeTeam, setHomeTeam] = useState<FifaTeamId>('real');
  const [awayTeam, setAwayTeam] = useState<FifaTeamId>('gazmyas');

  const [engine, setEngine] = useState<FifaEngine>(() => new FifaEngine(homeTeam, awayTeam));
  const [isPacksOpen, setIsPacksOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(() => fifaAudio.isMuted());
  const [glitches, setGlitches] = useState<FifaEngine['glitches']>(engine.glitches);

  // Initialize or restart engine when starting match
  const startMatch = (home: FifaTeamId, away: FifaTeamId) => {
    setHomeTeam(home);
    setAwayTeam(away);
    const newEngine = new FifaEngine(home, away);
    setEngine(newEngine);
    setGlitches({ ...newEngine.glitches });
    setCurrentView('match');
  };

  const startPenalty = (home: FifaTeamId, away: FifaTeamId) => {
    setHomeTeam(home);
    setAwayTeam(away);
    setCurrentView('penalty');
  };

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    fifaAudio.setMuted(next);
  };

  const handleToggleGlitch = (key: keyof FifaEngine['glitches']) => {
    if (!engine) return;
    if (typeof engine.glitches[key] === 'boolean') {
      (engine.glitches[key] as boolean) = !engine.glitches[key];
      setGlitches({ ...engine.glitches });
      fifaAudio.playKick(0.5);
    }
  };

  // Keyboard controls listener
  useEffect(() => {
    if (currentView !== 'match') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }

      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          engine.input.up = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          engine.input.down = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          engine.input.left = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          engine.input.right = true;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          engine.input.sprint = true;
          break;
        case 'Space':
          if (!engine.input.isChargingShoot) {
            engine.input.isChargingShoot = true;
            engine.input.shootCharge = 0;
          }
          break;
        case 'KeyZ':
        case 'KeyJ':
          engine.passBall();
          break;
        case 'KeyC':
        case 'KeyL':
          engine.slideTackle();
          break;
        case 'KeyQ':
          engine.switchPlayer();
          break;
        case 'KeyE':
          engine.bribeReferee();
          break;
        case 'KeyV':
          engine.triggerVar();
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          engine.input.up = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          engine.input.down = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          engine.input.left = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          engine.input.right = false;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          engine.input.sprint = false;
          break;
        case 'Space':
          engine.releaseShoot();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [currentView, engine]);

  return (
    <div className="w-full h-screen bg-slate-950 flex flex-col select-none overflow-hidden font-sans">
      {currentView === 'menu' && (
        <FifaMainMenu
          onStartMatch={startMatch}
          onOpenPacks={() => setIsPacksOpen(true)}
          onStartPenalty={startPenalty}
          onSwitchToOriginalApp={onSwitchToOriginalApp}
          isMuted={isMuted}
          onToggleMute={toggleMute}
        />
      )}

      {currentView === 'penalty' && (
        <FifaPenaltyShootout
          homeTeamId={homeTeam}
          awayTeamId={awayTeam}
          onBackToMenu={() => setCurrentView('menu')}
        />
      )}

      {currentView === 'match' && (
        <div className="relative w-full h-full flex flex-col">
          {/* Match Scoreboard */}
          <FifaScoreboard
            engine={engine}
            isMuted={isMuted}
            onToggleMute={toggleMute}
            onRestartMatch={() => startMatch(homeTeam, awayTeam)}
            onBackToMenu={() => setCurrentView('menu')}
          />

          {/* Center Interactive Pitch */}
          <div className="relative flex-1 w-full h-full overflow-hidden flex items-center justify-center p-2 sm:p-4">
            <FifaPitchCanvas engine={engine} />
            <FifaControlsOverlay
              engine={engine}
              glitches={glitches}
              onToggleGlitch={handleToggleGlitch}
            />
          </div>
        </div>
      )}

      {/* Packs Modal */}
      <FifaPacksModal isOpen={isPacksOpen} onClose={() => setIsPacksOpen(false)} />
    </div>
  );
};
