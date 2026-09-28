import React, { useState, useEffect, useRef } from 'react';
import { TEAMS_DATA } from './fifaData';
import { FifaTeamId } from './types';
import { fifaAudio } from './fifaAudio';
import { RotateCcw, Home, Target, Flame } from 'lucide-react';

interface FifaPenaltyShootoutProps {
  homeTeamId: FifaTeamId;
  awayTeamId: FifaTeamId;
  onBackToMenu: () => void;
}

export const FifaPenaltyShootout: React.FC<FifaPenaltyShootoutProps> = ({
  homeTeamId,
  awayTeamId,
  onBackToMenu,
}) => {
  const homeTeam = TEAMS_DATA[homeTeamId] || TEAMS_DATA.real;
  const awayTeam = TEAMS_DATA[awayTeamId] || TEAMS_DATA.barca;

  const [round, setRound] = useState<number>(1);
  const [playerScores, setPlayerScores] = useState<Array<'goal' | 'miss' | null>>([null, null, null, null, null]);
  const [aiScores, setAiScores] = useState<Array<'goal' | 'miss' | null>>([null, null, null, null, null]);

  const [aimX, setAimX] = useState<number>(50); // percentage 0 to 100
  const [aimY, setAimY] = useState<number>(50);
  const [aimMovingRight, setAimMovingRight] = useState<boolean>(true);

  const [power, setPower] = useState<number>(0);
  const [isCharging, setIsCharging] = useState<boolean>(false);
  const [isShooting, setIsShooting] = useState<boolean>(false);

  const [ballPos, setBallPos] = useState<{ x: number; y: number; scale: number }>({ x: 50, y: 85, scale: 1 });
  const [gkPos, setGkPos] = useState<{ x: number; dive: 'left' | 'right' | 'center' }>({ x: 50, dive: 'center' });
  const [resultText, setResultText] = useState<string>('Нажми и удерживай УДАР для выбора силы!');

  // Moving aim reticle horizontally
  useEffect(() => {
    if (isShooting) return;
    const interval = setInterval(() => {
      setAimX(prev => {
        if (prev >= 85) {
          setAimMovingRight(false);
          return prev - 2;
        }
        if (prev <= 15) {
          setAimMovingRight(true);
          return prev + 2;
        }
        return aimMovingRight ? prev + 2.5 : prev - 2.5;
      });
    }, 30);
    return () => clearInterval(interval);
  }, [aimMovingRight, isShooting]);

  // Charging power
  useEffect(() => {
    if (!isCharging || isShooting) return;
    const interval = setInterval(() => {
      setPower(prev => (prev >= 100 ? 100 : prev + 3));
    }, 25);
    return () => clearInterval(interval);
  }, [isCharging, isShooting]);

  const handleShoot = () => {
    if (isShooting) return;
    setIsCharging(false);
    setIsShooting(true);

    const shotPower = power;
    fifaAudio.playKick(1.2);

    // AI Goalkeeper randomly dives
    const gkDive = Math.random() < 0.33 ? 'left' : Math.random() < 0.5 ? 'right' : 'center';
    const gkTargetX = gkDive === 'left' ? 25 : gkDive === 'right' ? 75 : 50;
    setGkPos({ x: gkTargetX, dive: gkDive });

    // Animate ball to goal
    const targetX = aimX;
    const targetY = shotPower > 92 ? -15 : 30 + (shotPower / 100) * 25; // Over the bar if overcharged!

    setBallPos({ x: targetX, y: targetY, scale: 0.45 });

    setTimeout(() => {
      // Evaluate result
      let isGoal = false;
      if (shotPower > 92) {
        setResultText('МИМО! Мяч улетел на балкон бабы Клавы!');
        fifaAudio.playPostHit();
      } else if (Math.abs(targetX - gkTargetX) < 18) {
        setResultText('СЕЙВ! Вратарь поймал мяч зубами!');
        fifaAudio.playPostHit();
      } else {
        isGoal = true;
        setResultText('ГООООООООЛ! Чистая девятка!');
        fifaAudio.playGoalHorn();
        fifaAudio.playSiuuu();
      }

      // Record score
      const newPlayerScores = [...playerScores];
      newPlayerScores[round - 1] = isGoal ? 'goal' : 'miss';
      setPlayerScores(newPlayerScores);

      // AI turn simulation after 1.5s
      setTimeout(() => {
        const aiGoal = Math.random() < 0.6;
        const newAiScores = [...aiScores];
        newAiScores[round - 1] = aiGoal ? 'goal' : 'miss';
        setAiScores(newAiScores);

        // Next round or finished
        if (round < 5) {
          setRound(r => r + 1);
          resetForNextKick();
        } else {
          setResultText('СЕРИЯ ПЕНАЛЬТИ ЗАВЕРШЕНА!');
        }
      }, 1600);
    }, 600);
  };

  const resetForNextKick = () => {
    setBallPos({ x: 50, y: 85, scale: 1 });
    setGkPos({ x: 50, dive: 'center' });
    setPower(0);
    setIsShooting(false);
    setResultText('Твой черёд! Целься и бей!');
  };

  const playerScoreCount = playerScores.filter(s => s === 'goal').length;
  const aiScoreCount = aiScores.filter(s => s === 'goal').length;

  return (
    <div className="relative w-full min-h-screen bg-slate-950 flex flex-col items-center justify-between p-4 select-none">
      {/* Top Header */}
      <header className="w-full max-w-4xl flex items-center justify-between bg-slate-900 px-6 py-3 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex items-center space-x-2">
          <Target className="w-6 h-6 text-red-500" />
          <h2 className="text-base sm:text-lg font-black uppercase text-white">
            СЕРИЯ ПЕНАЛЬТИ: {homeTeam.shortName} VS {awayTeam.shortName}
          </h2>
        </div>

        {/* Shootout Score Dots */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <span className="text-xs font-mono font-bold text-amber-400 mr-1">{homeTeam.shortName}</span>
            {playerScores.map((s, idx) => (
              <div
                key={`p_${idx}`}
                className={`w-3.5 h-3.5 rounded-full border border-slate-700 ${
                  s === 'goal' ? 'bg-emerald-500' : s === 'miss' ? 'bg-red-500' : 'bg-slate-800'
                }`}
              />
            ))}
            <span className="font-mono font-bold ml-1 text-white">{playerScoreCount}</span>
          </div>

          <span className="text-slate-600">:</span>

          <div className="flex items-center space-x-1">
            <span className="font-mono font-bold mr-1 text-white">{aiScoreCount}</span>
            {aiScores.map((s, idx) => (
              <div
                key={`ai_${idx}`}
                className={`w-3.5 h-3.5 rounded-full border border-slate-700 ${
                  s === 'goal' ? 'bg-emerald-500' : s === 'miss' ? 'bg-red-500' : 'bg-slate-800'
                }`}
              />
            ))}
            <span className="text-xs font-mono font-bold text-sky-400 ml-1">{awayTeam.shortName}</span>
          </div>
        </div>

        <button
          onClick={onBackToMenu}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
        >
          <Home className="w-4 h-4" />
        </button>
      </header>

      {/* Center 3D Penalty Stage */}
      <div className="relative w-full max-w-4xl h-[460px] bg-gradient-to-b from-sky-900 via-slate-900 to-emerald-900 rounded-3xl border-4 border-slate-800 shadow-2xl overflow-hidden my-4 flex items-center justify-center">
        {/* Goal Frame */}
        <div className="absolute top-12 w-3/4 h-56 border-8 border-white bg-white/5 rounded-t-xl shadow-2xl flex items-center justify-center">
          {/* Net Mesh Background */}
          <div
            className="w-full h-full opacity-20"
            style={{
              backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
              backgroundSize: '16px 16px',
            }}
          />

          {/* Goalkeeper */}
          <div
            className="absolute bottom-0 text-7xl transition-all duration-300 transform -translate-x-1/2"
            style={{ left: `${gkPos.x}%` }}
          >
            {gkPos.dive === 'left' ? '🤸‍♂️' : gkPos.dive === 'right' ? '🤾‍♂️' : '🧍‍♂️'}
          </div>

          {/* Aim Reticle */}
          {!isShooting && (
            <div
              className="absolute w-10 h-10 border-2 border-red-500 rounded-full flex items-center justify-center pointer-events-none transform -translate-x-1/2 animate-pulse"
              style={{ left: `${aimX}%`, top: '40%' }}
            >
              <div className="w-2 h-2 bg-red-500 rounded-full" />
            </div>
          )}
        </div>

        {/* Penalty Spot Line */}
        <div className="absolute bottom-20 w-4 h-4 bg-white rounded-full" />

        {/* Ball */}
        <div
          className="absolute text-5xl transition-all duration-500 ease-out transform -translate-x-1/2 -translate-y-1/2 filter drop-shadow-xl"
          style={{
            left: `${ballPos.x}%`,
            top: `${ballPos.y}%`,
            transform: `scale(${ballPos.scale})`,
          }}
        >
          ⚽
        </div>

        {/* Result Message Ticker */}
        <div className="absolute top-4 bg-black/75 px-4 py-1.5 rounded-full border border-amber-500/50 text-amber-400 font-mono text-sm font-bold shadow-lg">
          {resultText}
        </div>
      </div>

      {/* Bottom Controls */}
      <footer className="w-full max-w-md flex flex-col items-center space-y-3">
        {/* Power Bar */}
        <div className="w-full bg-slate-900 p-3 rounded-2xl border border-slate-800 flex flex-col space-y-2">
          <div className="flex justify-between text-xs font-mono font-bold">
            <span className="text-slate-400">СИЛА УДАРА:</span>
            <span className={power > 90 ? 'text-red-500' : 'text-emerald-400'}>{power}%</span>
          </div>
          <div className="w-full h-4 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div
              className={`h-full rounded-full transition-all ${
                power > 92 ? 'bg-red-600 animate-pulse' : power > 60 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${power}%` }}
            />
          </div>
        </div>

        {/* Shoot Button */}
        <button
          onPointerDown={() => setIsCharging(true)}
          onPointerUp={handleShoot}
          disabled={isShooting}
          className="w-full py-4 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 active:scale-95 text-white font-black text-lg rounded-2xl border border-red-400 shadow-xl flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
        >
          <Flame className="w-6 h-6 text-yellow-300" />
          <span>{isCharging ? 'ОТПУСТИ ДЛЯ УДАРА!' : 'ЗАЖАТЬ УДАР (ПРОБЕЛ)'}</span>
        </button>
      </footer>
    </div>
  );
};
