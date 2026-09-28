import {
  PitchPlayer,
  SoccerBall,
  Referee,
  MatchStats,
  GameSettings,
  TeamConfig,
  Particle,
  FloatingText,
  PitchDog,
  PitchFan,
  StadiumWorld,
} from '../types/scuffedFifa';
import { TEAMS, COMMENTARY_LINES } from '../data/fifaData';
import { soundEngine } from './audioSynthesizer';

export interface MatchEngineState {
  homeTeam: TeamConfig;
  awayTeam: TeamConfig;
  players: PitchPlayer[];
  balls: SoccerBall[];
  referee: Referee;
  dog: PitchDog;
  streakers: PitchFan[];
  isBrawlActive: boolean;
  brawlTimer: number;
  stats: MatchStats;
  settings: GameSettings;
  particles: Particle[];
  floatingTexts: FloatingText[];
  matchTime: number; // in match minutes (0 to 90+)
  stoppageTime: number; // ridiculous e.g. +98 min
  isPaused: boolean;
  isGoalCelebration: boolean;
  goalCelebrationTimer: number;
  lastScoringTeam?: 'home' | 'away';
  lastScorerName?: string;
  kickCharge: number; // 0 to 1
  isChargingKick: boolean;
  activeEAPopup: boolean;
  commentaryTicker: string[];
  screenShake: number;
  slowMotionFactor: number;
  ttsEnabled: boolean;
  nextSwitchPlayerId?: string;
  stadiumWorld: StadiumWorld;
}

export class FifaPhysicsEngine {
  public state: MatchEngineState;
  public readonly fieldWidth = 1200;
  public readonly fieldHeight = 700;
  public readonly goalTop = 270;
  public readonly goalBottom = 430;
  public readonly goalDepth = 55;

  private onStateChangeCallback?: (state: MatchEngineState) => void;
  private onEAPopupTrigger?: () => void;
  private keysDown: Set<string> = new Set();
  private controlledPlayerIndex: number = 0;
  private stateThrottleTimer: number = 0;

  // Virtual Joystick & Sprint Controls (FC Mobile)
  public joystickInput = { x: 0, y: 0, active: false };
  public isSprintActive: boolean = false;

  constructor(homeTeamId: string = 'blue_barca', awayTeamId: string = 'white_madrid') {
    const homeTeam = TEAMS.find(t => t.id === homeTeamId) || TEAMS[2] || TEAMS[0];
    const awayTeam = TEAMS.find(t => t.id === awayTeamId) || TEAMS[1];

    this.state = {
      homeTeam,
      awayTeam,
      players: [],
      balls: [this.createBall('normal')],
      referee: {
        x: 600,
        y: 350,
        vx: 0,
        vy: 0,
        isBlindfolded: true,
        cardDrawn: 'none',
        whistleTimer: 0,
      },
      dog: {
        x: -50,
        y: 350,
        vx: 0,
        vy: 0,
        active: false,
        barkTimer: 0,
        chewingBallTimer: 0,
      },
      streakers: [],
      isBrawlActive: false,
      brawlTimer: 0,
      ttsEnabled: false,
      stats: {
        homeScore: 0,
        awayScore: 0,
        shotsHome: 0,
        shotsAway: 0,
        foulsHome: 0,
        foulsAway: 0,
        simulationsHome: 0,
        simulationsAway: 0,
        maguireOwnGoals: 0,
        eaPointsSpent: 0,
      },
      settings: {
        gravity: 1.0,
        fieldFriction: 0.985,
        ballSpeedMultiplier: 1.2,
        aiClownLevel: 'average',
        neymarSensitivity: 0.35,
        maguireMode: true,
        multiBallCount: 1,
        vuvuzelaVolume: 0.3,
        commentatorStyle: 'utkin',
        eaScriptingActive: false,
        funnyBugsEnabled: true,
      },
      particles: [],
      floatingTexts: [],
      matchTime: 0,
      stoppageTime: 0,
      isPaused: false,
      isGoalCelebration: false,
      goalCelebrationTimer: 0,
      kickCharge: 0,
      isChargingKick: false,
      activeEAPopup: false,
      commentaryTicker: [
        'Матч века начался! Встречаются титаны мирового позора!',
        'Судья потерял очки еще в раздевалке, матч обещает быть честным!',
      ],
      screenShake: 0,
      slowMotionFactor: 1.0,
      stadiumWorld: 'classic',
    };

    this.spawnTeams();
  }

  public setStadiumWorld(world: StadiumWorld) {
    this.state.stadiumWorld = world;
    this.state.settings.stadiumWorld = world;

    if (world === 'hoth') {
      this.state.settings.fieldFriction = 0.997;
      this.addFloatingText('❄️ ЛЕДНИК ХОТ: СВЕРХСКОЛЬЗКИЙ ЛЁД!', 600, 240, '#06b6d4', 26);
      this.state.commentaryTicker.unshift('Хот: Снежная буря на поле! Игроки скользят по леднику, а на фоне шагают AT-AT!');
    } else if (world === 'death_star') {
      this.state.settings.fieldFriction = 0.990;
      this.addFloatingText('🌌 ЗВЕЗДА СМЕРТИ: АРЕНА В КОСМОСЕ!', 600, 240, '#38bdf8', 26);
      this.state.commentaryTicker.unshift('Звезда Смерти: Матч проходит в ангаре Звезды Смерти! В иллюминаторах виден Альдераан!');
    } else if (world === 'mustafar') {
      this.state.settings.fieldFriction = 0.982;
      this.addFloatingText('🌋 МУСТАФАР: ЛАВА И СИТХИ!', 600, 240, '#ef4444', 26);
      this.state.commentaryTicker.unshift('Мустафар: Осторожно, реки раскалённой лавы окружают ворота! Бутсы плавятся!');
    } else if (world === 'tatooine') {
      this.state.settings.fieldFriction = 0.970;
      this.addFloatingText('🏜️ ПЕСКИ ТАТУИНА: ДВОЙНОЕ СОЛНЦЕ!', 600, 240, '#f59e0b', 26);
      this.state.commentaryTicker.unshift('Татуин: Жара 50 градусов под двумя солнцами! Песок замедляет качение мяча!');
    } else if (world === 'cyberpunk') {
      this.state.settings.fieldFriction = 0.985;
      this.addFloatingText('🌆 НЕО-ТОКИО 2099: КИБЕР-ГАЗОН!', 600, 240, '#ec4899', 26);
      this.state.commentaryTicker.unshift('Нео-Токио 2099: Неоновые линии и голограммы драконов над футбольным полем!');
    } else {
      this.state.settings.fieldFriction = 0.985;
      this.addFloatingText('🌿 КЛАССИЧЕСКИЙ САНТЬЯГО БЕРНАБЕУ!', 600, 240, '#22c55e', 26);
      this.state.commentaryTicker.unshift('Сантьяго Бернабеу: Идеальный газон и полные трибуны фанатов!');
    }

    soundEngine.playWhistle(true);
  }

  public setOnStateChange(cb: (state: MatchEngineState) => void) {
    this.onStateChangeCallback = cb;
  }

  public setOnEAPopupTrigger(cb: () => void) {
    this.onEAPopupTrigger = cb;
  }

  public createBall(type: SoccerBall['type'] = 'normal', x = 600, y = 350): SoccerBall {
    return {
      x,
      y,
      z: 0,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      vz: 0,
      radius: type === 'watermelon' ? 17 : type === 'bowling' ? 15 : 13,
      rotation: 0,
      spinSpeed: 0,
      type,
      trail: [],
    };
  }

  public spawnTeams() {
    const players: PitchPlayer[] = [];
    const homeNames = this.state.homeTeam.defaultRoster;
    const awayNames = this.state.awayTeam.defaultRoster;

    // Home Team (11 Players, attacking left-to-right towards x=1140)
    // GK
    players.push(this.makePlayer('p_h_0', homeNames[0] || 'Вратарь', 1, 'home', 'goalkeeper', 130, 350));
    // 4 Defenders (LB, CB1, CB2, RB)
    players.push(this.makePlayer('p_h_1', homeNames[2] || 'Левый Защитник', 3, 'home', 'defender', 250, 160));
    players.push(this.makePlayer('p_h_2', homeNames[3] || 'ЦЗ 1', 4, 'home', 'defender', 230, 280));
    players.push(this.makePlayer('p_h_3', homeNames[4] || 'Магуайр (КЭП)', 5, 'home', 'defender', 230, 420));
    players.push(this.makePlayer('p_h_4', homeNames[1] || 'Правый Защитник', 2, 'home', 'defender', 250, 540));
    // 3 Midfielders (CDM, CM, CAM)
    players.push(this.makePlayer('p_h_5', homeNames[5] || 'Опорник', 6, 'home', 'midfielder', 360, 350));
    players.push(this.makePlayer('p_h_6', homeNames[7] || 'Центральный ПЗ', 8, 'home', 'midfielder', 450, 240));
    players.push(this.makePlayer('p_h_7', homeNames[9] || 'Атакующий ПЗ', 10, 'home', 'midfielder', 470, 460));
    // 3 Forwards (LW, ST, RW)
    players.push(this.makePlayer('p_h_8', homeNames[6] || 'Левый Вингер', 11, 'home', 'forward', 560, 180));
    players.push(this.makePlayer('p_h_9', homeNames[10] || 'Роботалдо (ST)', 7, 'home', 'forward', 580, 350));
    players.push(this.makePlayer('p_h_10', homeNames[8] || 'Правый Вингер', 9, 'home', 'forward', 560, 520));

    // Away Team (11 Players, attacking right-to-left towards x=60)
    // GK
    players.push(this.makePlayer('p_a_0', awayNames[0] || 'Вратарь Соперника', 1, 'away', 'goalkeeper', 1070, 350));
    // 4 Defenders (RB, CB1, CB2, LB)
    players.push(this.makePlayer('p_a_1', awayNames[1] || 'Защитник ПЗ', 2, 'away', 'defender', 950, 160));
    players.push(this.makePlayer('p_a_2', awayNames[3] || 'ЦЗ Соперника 1', 4, 'away', 'defender', 970, 280));
    players.push(this.makePlayer('p_a_3', awayNames[4] || 'ЦЗ Соперника 2', 5, 'away', 'defender', 970, 420));
    players.push(this.makePlayer('p_a_4', awayNames[2] || 'Защитник ЛЗ', 3, 'away', 'defender', 950, 540));
    // 3 Midfielders (CDM, CM, CAM)
    players.push(this.makePlayer('p_a_5', awayNames[5] || 'Опорник Соперника', 6, 'away', 'midfielder', 840, 350));
    players.push(this.makePlayer('p_a_6', awayNames[7] || 'ПЗ Соперника 1', 8, 'away', 'midfielder', 750, 240));
    players.push(this.makePlayer('p_a_7', awayNames[9] || 'ПЗ Соперника 2', 10, 'away', 'midfielder', 730, 460));
    // 3 Forwards (RW, ST, LW)
    players.push(this.makePlayer('p_a_8', awayNames[6] || 'Вингер Соперника 1', 7, 'away', 'forward', 640, 180));
    players.push(this.makePlayer('p_a_9', awayNames[8] || 'Форвард Соперника', 9, 'away', 'forward', 620, 350));
    players.push(this.makePlayer('p_a_10', awayNames[10] || 'Вингер Соперника 2', 11, 'away', 'forward', 640, 520));

    // Make home striker controlled by default
    players[9].isControlled = true;
    this.controlledPlayerIndex = 9;

    this.state.players = players;
    this.updateNextSwitchCandidate();
  }

  private makePlayer(
    id: string,
    name: string,
    number: number,
    team: 'home' | 'away',
    role: PitchPlayer['role'],
    x: number,
    y: number
  ): PitchPlayer {
    const skinTones = ['#fcd34d', '#fbcfe8', '#fed7aa', '#fca5a5', '#d97706', '#92400e'];
    const hairTones = ['#1e293b', '#78350f', '#f59e0b', '#dc2626', '#ffffff', '#ca8a04'];
    return {
      id,
      name,
      number,
      team,
      role,
      x,
      y,
      vx: 0,
      vy: 0,
      targetX: x,
      targetY: y,
      speed: role === 'goalkeeper' ? 3.4 : 3.8 + Math.random() * 0.8,
      power: 1.0,
      stamina: 100,
      faceType: Math.floor(Math.random() * 5),
      skinColor: skinTones[Math.floor(Math.random() * skinTones.length)],
      hairColor: hairTones[Math.floor(Math.random() * hairTones.length)],
      isControlled: false,
      isRolling: false,
      rollAngle: 0,
      rollTimer: 0,
      isTpose: false,
      isSliding: false,
      slideTimer: 0,
      slideAngle: 0,
      isStunned: false,
      stunTimer: 0,
      isNeymarSimulating: false,
      isMaguireSpinning: false,
      hasRedCard: false,
      yellowCards: 0,
      limbsWobble: 0,
      headScale: 1.0,
    };
  }

  public updateNextSwitchCandidate() {
    const homePlayers = this.state.players.filter(p => p.team === 'home' && !p.hasRedCard);
    const ball = this.state.balls[0] || { x: 600, y: 350 };
    const currentControlled = homePlayers.find(p => p.isControlled);

    // Find outfield home player closest to ball that is not currently controlled
    let bestCandidate: PitchPlayer | null = null;
    let minDist = Infinity;

    for (const p of homePlayers) {
      if (p.id === currentControlled?.id) continue;
      // Slight penalty for goalkeeper so we prefer switching to outfield players
      const rolePenalty = p.role === 'goalkeeper' ? 300 : 0;
      const dist = Math.hypot(p.x - ball.x, p.y - ball.y) + rolePenalty;
      if (dist < minDist) {
        minDist = dist;
        bestCandidate = p;
      }
    }

    this.state.nextSwitchPlayerId = bestCandidate?.id;
  }

  public setJoystickInput(x: number, y: number, isSprint: boolean = false) {
    this.joystickInput.x = x;
    this.joystickInput.y = y;
    this.joystickInput.active = Math.hypot(x, y) > 0.04;
    this.isSprintActive = isSprint;
  }

  public handleKeyDown(key: string) {
    const k = key.toLowerCase();
    this.keysDown.add(k);

    // Q, Tab, C: Player Switch
    if (k === 'q' || k === 'й' || key === 'Tab' || k === 'c' || k === 'с') {
      this.switchControlledPlayer();
    }

    // X, F, Ч, А: Pass to teammate (FC Mobile style)
    if (k === 'x' || k === 'ч' || k === 'f' || k === 'а') {
      this.performPass();
    }

    // Z, V: Neymar Simulation Dive
    if (k === 'z' || k === 'я' || k === 'v' || k === 'м') {
      this.triggerNeymarDive();
    }

    // E: Maguire Slide Tackle
    if (k === 'e' || k === 'у') {
      this.triggerMaguireSlide();
    }

    // R: Open EA Scam Store
    if (k === 'r' || k === 'к') {
      this.onEAPopupTrigger?.();
    }

    // B: Mass Brawl (Стенка на стенку)
    if (k === 'b' || k === 'и') {
      this.triggerPitchBrawl();
    }

    // P: Dog on Pitch (Пёс Барбос)
    if (k === 'p' || k === 'з') {
      this.spawnPitchDog();
    }

    // Space: start charging kick
    if (key === ' ' || key === 'Spacebar') {
      this.state.isChargingKick = true;
    }
  }

  public handleKeyUp(key: string) {
    this.keysDown.delete(key.toLowerCase());

    // Space release: perform kick
    if (key === ' ' || key === 'Spacebar') {
      if (this.state.isChargingKick) {
        this.performKick();
        this.state.isChargingKick = false;
        this.state.kickCharge = 0;
      }
    }
  }

  public performPass() {
    const controlled = this.state.players.find(p => p.isControlled);
    if (!controlled || controlled.isRolling || controlled.isSliding) return;

    // Find nearest ball within reach
    let targetBall: SoccerBall | null = null;
    let minDist = 55;
    for (const ball of this.state.balls) {
      const dist = Math.hypot(ball.x - controlled.x, ball.y - controlled.y);
      if (dist < minDist) {
        minDist = dist;
        targetBall = ball;
      }
    }
    if (!targetBall) return;

    // Find all outfield teammates
    const teammates = this.state.players.filter(
      p => p.team === controlled.team && p.id !== controlled.id && !p.hasRedCard
    );
    if (teammates.length === 0) return;

    // Choose best pass target
    let bestTeammate = teammates[0];
    let bestScore = -Infinity;

    const moveX = controlled.vx !== 0 ? controlled.vx : (controlled.team === 'home' ? 1 : -1);
    const moveY = controlled.vy;
    const moveLen = Math.hypot(moveX, moveY) || 1;
    const dirX = moveX / moveLen;
    const dirY = moveY / moveLen;

    for (const tm of teammates) {
      const dx = tm.x - controlled.x;
      const dy = tm.y - controlled.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 50 || dist > 650) continue;

      const dot = (dx / dist) * dirX + (dy / dist) * dirY;
      const forwardBonus = (controlled.team === 'home' ? dx : -dx) * 0.4;
      const score = dot * 160 + forwardBonus - dist * 0.12;

      if (score > bestScore) {
        bestScore = score;
        bestTeammate = tm;
      }
    }

    const pdx = bestTeammate.x - targetBall.x;
    const pdy = bestTeammate.y - targetBall.y;
    const pdist = Math.hypot(pdx, pdy) || 1;
    const passSpeed = (18 + Math.min(6, pdist * 0.015)) * this.state.settings.ballSpeedMultiplier;

    targetBall.vx = (pdx / pdist) * passSpeed;
    targetBall.vy = (pdy / pdist) * passSpeed;
    targetBall.vz = 2.0;
    targetBall.lastKickerTeam = controlled.team;
    targetBall.lastKickerName = controlled.name;

    soundEngine.playKick(0.55);
    this.addFloatingText(`👟 Пас ➔ ${bestTeammate.name}!`, controlled.x, controlled.y - 30, '#38bdf8', 15);

    // Switch control to recipient after short delay or instantly
    setTimeout(() => {
      this.switchControlledPlayer(bestTeammate.id);
    }, 180);
  }

  public switchControlledPlayer(targetId?: string) {
    const homePlayers = this.state.players.filter(p => p.team === 'home' && !p.hasRedCard);
    if (homePlayers.length === 0) return;

    let targetPlayer: PitchPlayer | undefined = undefined;

    if (targetId) {
      targetPlayer = homePlayers.find(p => p.id === targetId);
    }

    if (!targetPlayer && this.state.nextSwitchPlayerId) {
      targetPlayer = homePlayers.find(p => p.id === this.state.nextSwitchPlayerId);
    }

    if (!targetPlayer) {
      const ball = this.state.balls[0] || { x: 600, y: 350 };
      let minDist = Infinity;
      for (const p of homePlayers) {
        if (p.isControlled) continue;
        const dist = Math.hypot(p.x - ball.x, p.y - ball.y);
        if (dist < minDist) {
          minDist = dist;
          targetPlayer = p;
        }
      }
    }

    if (!targetPlayer) return;

    this.state.players.forEach(p => (p.isControlled = false));
    targetPlayer.isControlled = true;
    this.controlledPlayerIndex = this.state.players.findIndex(p => p.id === targetPlayer.id);

    soundEngine.playKick(0.25);
    this.addFloatingText(`🔄 ${targetPlayer.name} #${targetPlayer.number}`, targetPlayer.x, targetPlayer.y - 35, '#38bdf8', 15);
    this.updateNextSwitchCandidate();
  }

  public switchToPlayerById(id: string) {
    this.switchControlledPlayer(id);
  }

  public triggerNeymarDive() {
    const controlled = this.state.players.find(p => p.isControlled);
    if (!controlled || controlled.isRolling) return;

    controlled.isRolling = true;
    controlled.isNeymarSimulating = true;
    controlled.rollTimer = 2.5;
    controlled.rollAngle = 0;
    controlled.vx = (Math.random() - 0.5) * 14;
    controlled.vy = (Math.random() - 0.5) * 14;

    this.state.stats.simulationsHome++;
    soundEngine.playNeymarRoll();

    this.addFloatingText('🚑 КУВЫРОК НЕЙМАРА! ААААА!', controlled.x, controlled.y - 40, '#f43f5e', 18);
    this.addCommentary('simulation');

    // Summon referee to inspect the tragedy
    this.state.referee.chasingPlayerId = controlled.id;
    this.state.referee.cardDrawn = Math.random() < 0.5 ? 'yellow' : 'red';
    soundEngine.playWhistle(false);
  }

  public triggerMaguireSlide() {
    const controlled = this.state.players.find(p => p.isControlled);
    if (!controlled || controlled.isSliding) return;

    controlled.isSliding = true;
    controlled.slideTimer = 1.0;
    // Slide forward towards where player is moving or looking
    const angle = Math.atan2(controlled.vy || 0, controlled.vx || 1);
    controlled.slideAngle = angle;
    controlled.vx = Math.cos(angle) * 18;
    controlled.vy = Math.sin(angle) * 18;

    soundEngine.playSlide();
    this.addFloatingText('🗿 МАГУАЙР ПОДКАТ!', controlled.x, controlled.y - 30, '#f59e0b', 16);
  }

  public toggleEAScripting() {
    this.state.settings.eaScriptingActive = !this.state.settings.eaScriptingActive;
    const active = this.state.settings.eaScriptingActive;

    if (active) {
      soundEngine.playKaChing();
      this.state.screenShake = 15;
      this.addFloatingText('⚡ СКРИПТ EA АКТИВИРОВАН!', 600, 200, '#eab308', 22);
      this.addCommentary('scripting');
    } else {
      this.addFloatingText('Скрипт отключен', 600, 200, '#94a3b8', 16);
    }
  }

  public performKick() {
    const controlled = this.state.players.find(p => p.isControlled);
    if (!controlled) return;

    // Find nearest ball within reach (reach = 45px)
    let targetBall: SoccerBall | null = null;
    let minDist = 48;

    for (const ball of this.state.balls) {
      const dist = Math.hypot(ball.x - controlled.x, ball.y - controlled.y);
      if (dist < minDist) {
        minDist = dist;
        targetBall = ball;
      }
    }

    if (!targetBall) {
      // Hilarious air kick! Player trips and falls
      if (Math.random() < 0.4) {
        controlled.isRolling = true;
        controlled.rollTimer = 1.2;
        soundEngine.playFail();
        this.addFloatingText('МАХНУЛ МИМО МЯЧА! 😂', controlled.x, controlled.y - 30, '#f87171', 15);
      }
      return;
    }

    const power = Math.max(0.2, this.state.kickCharge);
    soundEngine.playKick(power);

    // Calculate kick direction
    // By default, kick towards opponent goal or mouse / movement vector
    let dirX = 1;
    let dirY = (Math.random() - 0.5) * 0.4;

    if (controlled.vx !== 0 || controlled.vy !== 0) {
      const len = Math.hypot(controlled.vx, controlled.vy);
      dirX = controlled.vx / len;
      dirY = controlled.vy / len;
    } else {
      // Kick toward opponent goal (right side for home)
      const targetGoalX = controlled.team === 'home' ? 1140 : 60;
      const targetGoalY = 350 + (Math.random() - 0.5) * 120;
      const len = Math.hypot(targetGoalX - targetBall.x, targetGoalY - targetBall.y);
      dirX = (targetGoalX - targetBall.x) / len;
      dirY = (targetGoalY - targetBall.y) / len;
    }

    // Overpowered kick: chance to rocket into the sky or warp
    if (power > 0.88) {
      this.state.screenShake = 18;
      this.addFloatingText('🚀 ПУШКА СТРАШНАЯ!', targetBall.x, targetBall.y - 35, '#ec4899', 20);
      targetBall.vz = 8;
    }

    const kickSpeed = (14 + power * 24) * this.state.settings.ballSpeedMultiplier;
    targetBall.vx = dirX * kickSpeed;
    targetBall.vy = dirY * kickSpeed;
    targetBall.lastKickerTeam = controlled.team;
    targetBall.lastKickerName = controlled.name;

    this.state.stats.shotsHome++;
    this.addCommentary('kick');

    // Kick particles
    for (let i = 0; i < 12; i++) {
      this.state.particles.push({
        x: targetBall.x,
        y: targetBall.y,
        vx: (Math.random() - 0.5) * 8 - dirX * 3,
        vy: (Math.random() - 0.5) * 8 - dirY * 3,
        color: '#facc15',
        size: 3 + Math.random() * 3,
        alpha: 1,
        life: 0.4,
        maxLife: 0.4,
      });
    }
  }

  public update(dt: number) {
    if (this.state.isPaused) return;

    // Shake dampening
    if (this.state.screenShake > 0) {
      this.state.screenShake = Math.max(0, this.state.screenShake - dt * 25);
    }

    // Match Clock progression
    if (!this.state.isGoalCelebration) {
      this.state.matchTime += dt * 1.5;
      // Stoppage time meme: when 90 is reached, add endless stoppage time!
      if (this.state.matchTime >= 90 && this.state.stoppageTime === 0) {
        this.state.stoppageTime = Math.floor(5 + Math.random() * 94); // up to +99 min!
        this.addFloatingText(`⏱️ ДОБАВЛЕНО: +${this.state.stoppageTime} МИНУТ!`, 600, 150, '#f43f5e', 24);
      }
    }

    // Kick charge up
    if (this.state.isChargingKick) {
      this.state.kickCharge = Math.min(1, this.state.kickCharge + dt * 1.6);
    }

    // Periodic EA Popup Trigger (every ~35 match minutes or random funny events)
    if (Math.random() < 0.0008 && !this.state.activeEAPopup) {
      this.onEAPopupTrigger?.();
    }

    // Update Balls
    this.updateBalls(dt);

    // Update Players
    this.updatePlayers(dt);

    // Update Referee
    this.updateReferee(dt);

    // Update Pitch Dog
    this.updateDog(dt);

    // Update Streakers
    this.updateStreakers(dt);

    // Update Mass Brawl
    this.updateBrawl(dt);

    // Update Particles
    this.updateParticles(dt);

    // Refresh candidate for quick player switching [Q/Tab]
    this.updateNextSwitchCandidate();

    // Goal celebration cooldown
    if (this.state.isGoalCelebration) {
      this.state.goalCelebrationTimer -= dt;
      if (this.state.goalCelebrationTimer <= 0) {
        this.resetAfterGoal();
      }
    }

    // Auto-switch controlled player if current one is too far from ball
    this.autoSwitchControlled();

    // Throttle React state notification to ~12 FPS to eliminate all CPU lag & re-render spikes
    this.stateThrottleTimer += dt;
    if (this.stateThrottleTimer >= 0.08 || this.state.isGoalCelebration) {
      this.stateThrottleTimer = 0;
      this.onStateChangeCallback?.(this.state);
    }
  }

  private updateBalls(dt: number) {
    const friction = this.state.settings.fieldFriction;

    for (const ball of this.state.balls) {
      // Record trail
      if (Math.hypot(ball.vx, ball.vy) > 8) {
        ball.trail.push({ x: ball.x, y: ball.y, alpha: 0.8 });
        if (ball.trail.length > 8) ball.trail.shift();
      } else {
        ball.trail = [];
      }

      // Physics integration
      ball.x += ball.vx * 60 * dt;
      ball.y += ball.vy * 60 * dt;

      // Z height gravity
      if (ball.z > 0 || ball.vz !== 0) {
        ball.z += ball.vz * 60 * dt;
        ball.vz -= 0.3 * this.state.settings.gravity;
        if (ball.z <= 0) {
          ball.z = 0;
          ball.vz = -ball.vz * 0.65; // bounce
        }
      }

      // Spin / rotation
      ball.rotation += (ball.vx + ball.vy) * 0.05;

      // Friction
      ball.vx *= friction;
      ball.vy *= friction;

      // EA Scripting: magnetic pull towards opponent goal or dramatic ricochet
      if (this.state.settings.eaScriptingActive) {
        // Curve ball dramatically toward right goal
        const targetGoalX = 1140;
        const targetGoalY = 350;
        const dx = targetGoalX - ball.x;
        const dy = targetGoalY - ball.y;
        ball.vx += (dx * 0.002) * dt * 60;
        ball.vy += (dy * 0.002) * dt * 60;
      }

      // Check Pitch Boundaries & Goals
      this.checkBallCollisions(ball);
    }
  }

  private checkBallCollisions(ball: SoccerBall) {
    // Top & Bottom sidelines
    const minY = 75;
    const maxY = 625;

    if (ball.y < minY) {
      ball.y = minY;
      ball.vy = -ball.vy * 0.8;
      this.spawnBounceSparks(ball.x, ball.y);
    } else if (ball.y > maxY) {
      ball.y = maxY;
      ball.vy = -ball.vy * 0.8;
      this.spawnBounceSparks(ball.x, ball.y);
    }

    // Left Goal Check (x < 110)
    // Goal line is x = 90. Posts are at y = 270 and y = 430.
    if (ball.x < 95) {
      if (ball.y > this.goalTop && ball.y < this.goalBottom) {
        // GOAL FOR AWAY TEAM!
        if (ball.x < 45 && !this.state.isGoalCelebration) {
          this.triggerGoal('away');
        }
      } else {
        // Rebound off left goal line / posts
        ball.x = 95;
        ball.vx = -ball.vx * 0.85;
        this.spawnBounceSparks(ball.x, ball.y);
      }
    }

    // Right Goal Check (x > 1105)
    // Goal line is x = 1110. Posts are at y = 270 and y = 430.
    if (ball.x > 1105) {
      if (ball.y > this.goalTop && ball.y < this.goalBottom) {
        // GOAL FOR HOME TEAM!
        if (ball.x > 1155 && !this.state.isGoalCelebration) {
          this.triggerGoal('home');
        }
      } else {
        // Rebound off right goal line / posts
        ball.x = 1105;
        ball.vx = -ball.vx * 0.85;
        this.spawnBounceSparks(ball.x, ball.y);
      }
    }
  }

  private spawnBounceSparks(x: number, y: number) {
    for (let i = 0; i < 5; i++) {
      this.state.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        color: '#22c55e',
        size: 3,
        alpha: 0.9,
        life: 0.3,
        maxLife: 0.3,
      });
    }
  }

  private triggerGoal(scoringTeam: 'home' | 'away') {
    this.state.isGoalCelebration = true;
    this.state.goalCelebrationTimer = 4.0;
    this.state.lastScoringTeam = scoringTeam;
    this.state.screenShake = 25;

    soundEngine.playGoalCelebration();

    if (scoringTeam === 'home') {
      this.state.stats.homeScore++;
      this.state.lastScorerName = this.state.homeTeam.defaultRoster[1] || 'Игрок Хозяев';
      this.addFloatingText('⚽ ГООООООООООЛ!!! 🚀', 600, 260, '#22c55e', 38);
    } else {
      this.state.stats.awayScore++;
      // Maguire meme: if Maguire mode active, chance it was Maguire own goal!
      if (this.state.settings.maguireMode && Math.random() < 0.6) {
        this.state.stats.maguireOwnGoals++;
        this.state.lastScorerName = 'Гарри Магуайр (АВТОГОЛ)';
        this.addFloatingText('🗿 АВТОГОЛ МАГУАЙРА! ШЕДЕВР!', 600, 260, '#ef4444', 32);
      } else {
        this.state.lastScorerName = this.state.awayTeam.defaultRoster[0] || 'Игрок Гостей';
        this.addFloatingText('⚽ ГОЛ СОПЕРНИКА! 😱', 600, 260, '#ef4444', 36);
      }
    }

    this.addCommentary('goal');

    // Confetti particles
    const colors = ['#f43f5e', '#3b82f6', '#eab308', '#22c55e', '#a855f7'];
    for (let i = 0; i < 70; i++) {
      this.state.particles.push({
        x: 600 + (Math.random() - 0.5) * 400,
        y: 200 + (Math.random() - 0.5) * 150,
        vx: (Math.random() - 0.5) * 12,
        vy: -Math.random() * 10,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 5 + Math.random() * 6,
        alpha: 1,
        life: 3.5,
        maxLife: 3.5,
      });
    }
  }

  private resetAfterGoal() {
    this.state.isGoalCelebration = false;
    // Reset balls to center
    this.state.balls.forEach(b => {
      b.x = 600;
      b.y = 350;
      b.vx = 0;
      b.vy = 0;
      b.z = 0;
    });

    // Reset player positions
    this.spawnTeams();
    soundEngine.playWhistle(true);
  }

  private updatePlayers(dt: number) {
    const ball = this.state.balls[0] || this.createBall('normal');

    for (let i = 0; i < this.state.players.length; i++) {
      const p = this.state.players[i];

      // Handle Stunned / Rolling / Sliding timers
      if (p.isRolling) {
        p.rollTimer -= dt;
        p.rollAngle += dt * 18;
        p.x += p.vx * 60 * dt;
        p.y += p.vy * 60 * dt;
        p.vx *= 0.94;
        p.vy *= 0.94;

        if (p.rollTimer <= 0) {
          p.isRolling = false;
          p.isNeymarSimulating = false;
        }
        continue;
      }

      if (p.isSliding) {
        p.slideTimer -= dt;
        p.x += p.vx * 60 * dt;
        p.y += p.vy * 60 * dt;
        p.vx *= 0.95;
        p.vy *= 0.95;

        // Slide collision with other players! (knock them down)
        for (const other of this.state.players) {
          if (other.id !== p.id && !other.isRolling) {
            const dist = Math.hypot(other.x - p.x, other.y - p.y);
            if (dist < 32) {
              other.isRolling = true;
              other.rollTimer = 1.8;
              other.vx = p.vx * 0.7;
              other.vy = p.vy * 0.7;
              soundEngine.playFoul();
              this.addFloatingText('💥 СБИТ С НОГ!', other.x, other.y - 30, '#ef4444', 16);
            }
          }
        }

        if (p.slideTimer <= 0) {
          p.isSliding = false;
        }
        continue;
      }

      // Wobble limbs animation
      p.limbsWobble += dt * 8;

      if (p.isControlled) {
        // Player input control (Virtual Joystick or WASD/Arrows)
        let moveX = 0;
        let moveY = 0;

        if (this.joystickInput.active) {
          moveX = this.joystickInput.x;
          moveY = this.joystickInput.y;
        } else {
          if (this.keysDown.has('w') || this.keysDown.has('arrowup') || this.keysDown.has('ц')) moveY -= 1;
          if (this.keysDown.has('s') || this.keysDown.has('arrowdown') || this.keysDown.has('ы')) moveY += 1;
          if (this.keysDown.has('a') || this.keysDown.has('arrowleft') || this.keysDown.has('ф')) moveX -= 1;
          if (this.keysDown.has('d') || this.keysDown.has('arrowright') || this.keysDown.has('в')) moveX += 1;

          if (moveX !== 0 && moveY !== 0) {
            moveX *= 0.707;
            moveY *= 0.707;
          }
        }

        const isSprint = this.isSprintActive || this.keysDown.has('shift') || this.keysDown.has('e') || this.keysDown.has('у');
        // Free sprint like FC Mobile: rapid acceleration, agile and responsive
        const sprintMultiplier = isSprint ? 1.75 : 1.15;
        const speed = p.speed * sprintMultiplier * 60 * dt;

        p.vx = moveX * speed;
        p.vy = moveY * speed;
        p.x += p.vx;
        p.y += p.vy;

        // Free stamina (never completely stalls the player, regenerates immediately)
        if (isSprint && (moveX !== 0 || moveY !== 0)) {
          p.stamina = Math.max(15, p.stamina - dt * 6);
        } else {
          p.stamina = Math.min(100, p.stamina + dt * 30);
        }
      } else {
        // AI Behavior
        this.updateAIPlayer(p, ball, dt);
      }

      // Constrain inside pitch
      p.x = Math.max(90, Math.min(1110, p.x));
      p.y = Math.max(85, Math.min(615, p.y));

      // Dribble / Ball touch collision (FC Mobile style close control)
      for (const b of this.state.balls) {
        const dist = Math.hypot(b.x - p.x, b.y - p.y);
        if (p.isControlled && dist < 38 && !p.isRolling && !p.isSliding) {
          // Smooth dribbling glued in running direction
          const moving = Math.hypot(p.vx, p.vy) > 0.2;
          if (moving) {
            const mLen = Math.hypot(p.vx, p.vy);
            const fx = p.vx / mLen;
            const fy = p.vy / mLen;
            const isSprint = this.isSprintActive || this.keysDown.has('shift') || this.keysDown.has('e');
            const lead = isSprint ? 22 : 14;
            const targetX = p.x + fx * lead;
            const targetY = p.y + fy * lead;

            b.x += (targetX - b.x) * 0.45;
            b.y += (targetY - b.y) * 0.45;
            b.vx = p.vx * 1.05;
            b.vy = p.vy * 1.05;
          } else {
            b.vx *= 0.88;
            b.vy *= 0.88;
          }
          b.lastKickerTeam = p.team;
          b.lastKickerName = p.name;
        } else if (dist < 26) {
          // AI soft dribble touch
          const pushX = (b.x - p.x) / (dist || 1);
          const pushY = (b.y - p.y) / (dist || 1);
          b.vx += pushX * 2.2;
          b.vy += pushY * 2.2;
          b.lastKickerTeam = p.team;
          b.lastKickerName = p.name;
        }
      }
    }
  }

  private updateAIPlayer(p: PitchPlayer, ball: SoccerBall, dt: number) {
    // Goalkeeper AI
    if (p.role === 'goalkeeper') {
      const goalX = p.team === 'home' ? 125 : 1075;
      // Track ball Y, but stay between goal posts (270 to 430)
      const targetY = Math.max(this.goalTop + 15, Math.min(this.goalBottom - 15, ball.y));
      p.x += (goalX - p.x) * 0.09;
      p.y += (targetY - p.y) * 0.09;

      // If ball is very close, save or punch away!
      const dist = Math.hypot(ball.x - p.x, ball.y - p.y);
      if (dist < 42) {
        soundEngine.playKick(0.75);
        const clearDir = p.team === 'home' ? 1 : -1;
        ball.vx = clearDir * (13 + Math.random() * 8);
        ball.vy = (Math.random() - 0.5) * 12;
        this.addCommentary('save');
        this.addFloatingText('🧤 СЕЙВ ВРАТАРЯ!', p.x, p.y - 30, '#38bdf8', 15);
      }
      return;
    }

    // Maguire meme AI: if player is Maguire, occasionally rush towards own goal
    if (p.name.includes('Магуайр') && this.state.settings.maguireMode) {
      if (Math.random() < 0.015) {
        p.isMaguireSpinning = true;
      }
    }

    // Determine tactical anchor based on ball position and player role
    const distToBall = Math.hypot(ball.x - p.x, ball.y - p.y);

    // Identify if this player is among the 2 closest teammates to the ball
    const teammates = this.state.players.filter(
      other => other.team === p.team && other.role !== 'goalkeeper' && !other.isControlled && !other.hasRedCard
    );
    let closerCount = 0;
    for (const tm of teammates) {
      if (tm.id === p.id) continue;
      const d = Math.hypot(ball.x - tm.x, ball.y - tm.y);
      if (d < distToBall) closerCount++;
    }
    const isChaser = closerCount < 2 && distToBall < 350;

    if (isChaser) {
      // Active pressing towards ball
      const dirX = (ball.x - p.x) / (distToBall || 1);
      const dirY = (ball.y - p.y) / (distToBall || 1);
      p.x += dirX * p.speed * 44 * dt;
      p.y += dirY * p.speed * 44 * dt;

      // AI shoot or pass if touching ball
      if (distToBall < 32) {
        const oppGoalX = p.team === 'home' ? 1140 : 60;
        const distToOppGoal = Math.hypot(oppGoalX - p.x, 350 - p.y);

        if (distToOppGoal < 360) {
          // Shoot on goal!
          soundEngine.playKick(0.7);
          const shootDirX = (oppGoalX - ball.x) / distToOppGoal;
          const shootDirY = (350 - ball.y) / distToOppGoal + (Math.random() - 0.5) * 0.25;
          ball.vx = shootDirX * 19;
          ball.vy = shootDirY * 19;
          ball.lastKickerTeam = p.team;
          ball.lastKickerName = p.name;
          this.addCommentary('kick');
        } else {
          // Pass towards teammate or advance
          const forwardTeammates = teammates.filter(t => (p.team === 'home' ? t.x > p.x : t.x < p.x));
          const passTarget = forwardTeammates.length > 0 ? forwardTeammates[Math.floor(Math.random() * forwardTeammates.length)] : null;
          soundEngine.playKick(0.5);
          if (passTarget) {
            const pd = Math.hypot(passTarget.x - p.x, passTarget.y - p.y) || 1;
            ball.vx = ((passTarget.x - p.x) / pd) * 14;
            ball.vy = ((passTarget.y - p.y) / pd) * 14;
          } else {
            const fwd = p.team === 'home' ? 1 : -1;
            ball.vx = fwd * 12;
            ball.vy = (Math.random() - 0.5) * 6;
          }
          ball.lastKickerTeam = p.team;
          ball.lastKickerName = p.name;
        }
      }
    } else {
      // Dynamic formation positioning
      // Shift base line with ball.x
      const ballProgress = (ball.x - 600) / 600; // -1 (left) to +1 (right)
      let dynamicTargetX = p.targetX;
      let dynamicTargetY = p.targetY;

      if (p.team === 'home') {
        if (p.role === 'defender') {
          dynamicTargetX = p.targetX + Math.max(-40, Math.min(130, ballProgress * 90));
        } else if (p.role === 'midfielder') {
          dynamicTargetX = p.targetX + ballProgress * 110;
        } else if (p.role === 'forward') {
          dynamicTargetX = p.targetX + Math.max(-70, ballProgress * 140);
        }
      } else {
        if (p.role === 'defender') {
          dynamicTargetX = p.targetX - Math.max(-40, Math.min(130, -ballProgress * 90));
        } else if (p.role === 'midfielder') {
          dynamicTargetX = p.targetX + ballProgress * 110;
        } else if (p.role === 'forward') {
          dynamicTargetX = p.targetX - Math.max(-70, -ballProgress * 140);
        }
      }

      // Track ball Y subtly so team supports laterally
      dynamicTargetY += (ball.y - 350) * 0.22;

      p.x += (dynamicTargetX - p.x) * 0.038;
      p.y += (dynamicTargetY - p.y) * 0.038;
    }
  }

  private updateReferee(dt: number) {
    const ref = this.state.referee;
    const ball = this.state.balls[0] || { x: 600, y: 350 };

    if (ref.chasingPlayerId) {
      const target = this.state.players.find(p => p.id === ref.chasingPlayerId);
      if (target) {
        const dist = Math.hypot(target.x - ref.x, target.y - ref.y);
        if (dist > 30) {
          ref.x += ((target.x - ref.x) / dist) * 5.5;
          ref.y += ((target.y - ref.y) / dist) * 5.5;
        } else {
          // Hand out card
          if (ref.cardDrawn === 'yellow') {
            target.yellowCards++;
            this.addFloatingText('🟨 ЖЁЛТАЯ КАРТОЧКА!', target.x, target.y - 45, '#eab308', 20);
          } else if (ref.cardDrawn === 'red') {
            this.addFloatingText('🟥 КРАСНАЯ КАРТОЧКА! УДАЛЕНИЕ!', target.x, target.y - 45, '#ef4444', 22);
          }
          ref.chasingPlayerId = undefined;
          setTimeout(() => (ref.cardDrawn = 'none'), 2500);
        }
      }
    } else {
      // Wander near the ball
      const dist = Math.hypot(ball.x - ref.x, ball.y - ref.y);
      if (dist > 180) {
        ref.x += ((ball.x - ref.x) / dist) * 2.5;
        ref.y += ((ball.y - ref.y) / dist) * 2.5;
      }
    }
  }

  private updateParticles(dt: number) {
    for (let i = this.state.particles.length - 1; i >= 0; i--) {
      const p = this.state.particles[i];
      p.x += p.vx * 60 * dt;
      p.y += p.vy * 60 * dt;
      p.life -= dt;
      p.alpha = Math.max(0, p.life / p.maxLife);
      if (p.life <= 0) {
        this.state.particles.splice(i, 1);
      }
    }

    for (let i = this.state.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.state.floatingTexts[i];
      ft.y += ft.vy * dt;
      ft.life -= dt;
      if (ft.life <= 0) {
        this.state.floatingTexts.splice(i, 1);
      }
    }
  }

  private autoSwitchControlled() {
    const current = this.state.players[this.controlledPlayerIndex];
    const ball = this.state.balls[0];
    if (!ball || !current) return;

    const currentDist = Math.hypot(current.x - ball.x, current.y - ball.y);
    // If current controlled is way too far, find closest home player
    if (currentDist > 450) {
      let closestIdx = this.controlledPlayerIndex;
      let closestDist = currentDist;

      this.state.players.forEach((p, idx) => {
        if (p.team === 'home' && !p.hasRedCard && p.role !== 'goalkeeper') {
          const dist = Math.hypot(p.x - ball.x, p.y - ball.y);
          if (dist < closestDist) {
            closestDist = dist;
            closestIdx = idx;
          }
        }
      });

      if (closestIdx !== this.controlledPlayerIndex) {
        this.state.players.forEach(p => (p.isControlled = false));
        this.state.players[closestIdx].isControlled = true;
        this.controlledPlayerIndex = closestIdx;
      }
    }
  }

  public addFloatingText(text: string, x: number, y: number, color: string, fontSize = 16) {
    this.state.floatingTexts.push({
      id: 'ft_' + Math.random(),
      text,
      x,
      y,
      color,
      fontSize,
      life: 1.6,
      maxLife: 1.6,
      vy: -25,
    });
  }

  public addCommentary(category: string) {
    const list = COMMENTARY_LINES[category] || COMMENTARY_LINES['kick'];
    const line = list[Math.floor(Math.random() * list.length)];
    this.state.commentaryTicker.unshift(line);
    if (this.state.commentaryTicker.length > 5) {
      this.state.commentaryTicker.pop();
    }
  }

  public triggerPitchBrawl() {
    this.state.isBrawlActive = true;
    this.state.brawlTimer = 6.0;
    this.state.screenShake = 25;
    soundEngine.playPunch();
    soundEngine.playWhistle(false);

    // Make all players rush to the center and collide violently
    this.state.players.forEach(p => {
      p.isStunned = true;
      p.stunTimer = 6.0;
      const angle = Math.atan2(350 - p.y, 600 - p.x);
      p.vx = Math.cos(angle) * 12 + (Math.random() - 0.5) * 6;
      p.vy = Math.sin(angle) * 12 + (Math.random() - 0.5) * 6;
    });

    this.addFloatingText('🥊 МАССОВАЯ ПОТАСОВКА «СТЕНКА НА СТЕНКУ»!', 600, 200, '#ef4444', 26);
    this.addCommentary('foul');
  }

  public spawnPitchDog() {
    this.state.dog.active = true;
    this.state.dog.x = Math.random() < 0.5 ? 90 : 1110;
    this.state.dog.y = Math.random() * 500 + 100;
    this.state.dog.vx = 0;
    this.state.dog.vy = 0;
    this.state.dog.barkTimer = 0;
    this.state.dog.chewingBallTimer = 0;

    soundEngine.playDogBark();
    this.addFloatingText('🐕 НА ПОЛЕ ВЫБЕЖАЛА СОБАКА!', this.state.dog.x, this.state.dog.y - 30, '#fbbf24', 22);
    this.state.commentaryTicker.unshift('🐕 Внимание! На поле выбежал пёс Барбос и требует мяч!');
  }

  public spawnStreaker() {
    const names = ['Фанат в трусах Валера', 'Безумный болельщик', 'Стрикер с флагом'];
    const chosenName = names[Math.floor(Math.random() * names.length)];
    this.state.streakers.push({
      x: 100 + Math.random() * 1000,
      y: 90,
      vx: (Math.random() - 0.5) * 8,
      vy: 6 + Math.random() * 4,
      active: true,
      lifeTimer: 9.0,
      name: chosenName,
    });

    soundEngine.playWhistle(true);
    this.addFloatingText(`🏃‍♂️ НА ПОЛЕ ${chosenName.toUpperCase()}!`, 600, 220, '#ec4899', 20);
    this.state.commentaryTicker.unshift(`🏃‍♂️ ${chosenName} бегает по газону и передаёт привет маме!`);
  }

  public updateDog(dt: number) {
    const dog = this.state.dog;
    if (!dog.active) return;

    dog.barkTimer -= dt;
    if (dog.barkTimer <= 0) {
      soundEngine.playDogBark();
      dog.barkTimer = 2.5 + Math.random() * 2.0;
    }

    const ball = this.state.balls[0];
    if (ball) {
      const dist = Math.hypot(ball.x - dog.x, ball.y - dog.y);
      if (dist > 18) {
        // Run towards ball fast
        const speed = 7.5;
        dog.vx = ((ball.x - dog.x) / dist) * speed;
        dog.vy = ((ball.y - dog.y) / dist) * speed;
        dog.x += dog.vx * 45 * dt;
        dog.y += dog.vy * 45 * dt;
      } else {
        // Chew and play with ball!
        dog.chewingBallTimer += dt;
        ball.vx = (Math.random() - 0.5) * 12;
        ball.vy = (Math.random() - 0.5) * 12;

        if (dog.chewingBallTimer > 8.0) {
          // Dog gets tired and runs away
          dog.active = false;
          this.addFloatingText('🐕 Собака устала и убежала за сосиской', dog.x, dog.y - 20, '#a3e635', 16);
        }
      }
    }
  }

  public updateStreakers(dt: number) {
    const ref = this.state.referee;
    for (let i = this.state.streakers.length - 1; i >= 0; i--) {
      const fan = this.state.streakers[i];
      fan.lifeTimer -= dt;
      fan.x += fan.vx * 40 * dt;
      fan.y += fan.vy * 40 * dt;

      // Bounce off pitch borders
      if (fan.x < 90 || fan.x > 1110) fan.vx *= -1;
      if (fan.y < 90 || fan.y > 610) fan.vy *= -1;

      // Referee or players tackle the streaker
      const distToRef = Math.hypot(fan.x - ref.x, fan.y - ref.y);
      if (distToRef < 35) {
        soundEngine.playFoul();
        this.addFloatingText('👮‍♂️ Стрикер пойман охраной!', fan.x, fan.y - 25, '#38bdf8', 16);
        this.state.streakers.splice(i, 1);
        continue;
      }

      if (fan.lifeTimer <= 0) {
        this.state.streakers.splice(i, 1);
      }
    }
  }

  public updateBrawl(dt: number) {
    if (!this.state.isBrawlActive) return;

    this.state.brawlTimer -= dt;
    if (this.state.brawlTimer <= 0) {
      this.state.isBrawlActive = false;
      this.addFloatingText('🕊️ Судья кое-как всех разнял', 600, 250, '#e2e8f0', 18);
      return;
    }

    // Players grapple near center
    for (let i = 0; i < this.state.players.length; i++) {
      const p1 = this.state.players[i];
      for (let j = i + 1; j < this.state.players.length; j++) {
        const p2 = this.state.players[j];
        const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
        if (dist < 32) {
          // Punch effect
          if (Math.random() < 0.08) {
            soundEngine.playPunch();
            this.state.screenShake = 6;
            this.state.particles.push({
              x: (p1.x + p2.x) / 2,
              y: (p1.y + p2.y) / 2,
              vx: (Math.random() - 0.5) * 10,
              vy: (Math.random() - 0.5) * 10,
              color: '#ef4444',
              size: 4,
              alpha: 1,
              life: 0.3,
              maxLife: 0.3,
            });
          }
          p1.vx += (Math.random() - 0.5) * 6;
          p1.vy += (Math.random() - 0.5) * 6;
          p2.vx += (Math.random() - 0.5) * 6;
          p2.vy += (Math.random() - 0.5) * 6;
        }
      }
    }
  }

  public spawnExtraBall(type: SoccerBall['type'] = 'normal') {
    this.state.balls.push(this.createBall(type, 600 + (Math.random() - 0.5) * 100, 350 + (Math.random() - 0.5) * 100));
    this.addFloatingText(`⚽ ДОБАВЛЕН МЯЧ: ${type.toUpperCase()}`, 600, 320, '#facc15', 20);
    soundEngine.playWhistle();
  }
}
