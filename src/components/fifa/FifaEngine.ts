import { FifaPlayer, FifaBall, FifaTeamConfig, FifaGlitchSettings, CommentaryMessage } from './types';
import { TEAMS_DATA, FUNNY_COMMENTARIES } from './fifaData';
import { fifaAudio } from './fifaAudio';

export interface MatchScore {
  home: number;
  away: number;
  matchTime: number; // in virtual seconds (0 to 5400 = 90 mins)
  isHalfTime: boolean;
  isFinished: boolean;
  isPaused: boolean;
  stoppageTime: number;
}

export class FifaEngine {
  public fieldWidth: number = 1000;
  public fieldHeight: number = 600;

  public homeTeam: FifaTeamConfig;
  public awayTeam: FifaTeamConfig;
  public homePlayers: FifaPlayer[] = [];
  public awayPlayers: FifaPlayer[] = [];

  public ball: FifaBall;
  public controlledPlayerId: string = '';
  public score: MatchScore;

  public glitches: FifaGlitchSettings = {
    tPose: false,
    moonGravity: false,
    superSpeed: false,
    drunkGoalkeeper: false,
    corruptRef: false,
    iceSkating: false,
    bribeCount: 0,
  };

  public referee = {
    x: 500,
    y: 300,
    vx: 0,
    vy: 0,
    anger: 0,
    cardInHand: null as 'yellow' | 'red' | null,
    cardTimer: 0,
    targetPlayerId: null as string | null,
  };

  public varModal: {
    active: boolean;
    timer: number;
    decision: string;
    imageType: 'cat' | 'tv' | 'shoe' | 'cloud';
  } | null = null;

  public goalCelebration: {
    active: boolean;
    scorerName: string;
    teamName: string;
    timer: number;
  } | null = null;

  public commentaries: CommentaryMessage[] = [];
  public particles: Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: string;
    life: number;
    maxLife: number;
    size: number;
  }> = [];

  // Input state
  public input = {
    up: false,
    down: false,
    left: false,
    right: false,
    shootCharge: 0,
    isChargingShoot: false,
    isPassing: false,
    isTackling: false,
    sprint: false,
  };

  public onStateChange?: () => void;

  constructor(homeTeamId: string = 'real', awayTeamId: string = 'barca') {
    this.homeTeam = TEAMS_DATA[homeTeamId] || TEAMS_DATA.real;
    this.awayTeam = TEAMS_DATA[awayTeamId] || TEAMS_DATA.barca;

    this.ball = {
      x: 500,
      y: 300,
      z: 0,
      vx: 0,
      vy: 0,
      vz: 0,
      radius: 9,
      ownerId: null,
      lastKickerTeam: null,
      trail: [],
    };

    this.score = {
      home: 0,
      away: 0,
      matchTime: 0,
      isHalfTime: false,
      isFinished: false,
      isPaused: false,
      stoppageTime: 3,
    };

    this.initPlayers();
    this.addCommentary("МАТЧ НАЧАЛСЯ! Свисток арбитра оглушил ворон над стадионом!", 'funny');
  }

  public initPlayers() {
    this.homePlayers = [
      this.createPlayer('h_gk', 'Дядя Вася', 1, 'GK', 80, 300, 'home', 65),
      this.createPlayer('h_def1', 'Магуайр (Клон)', 5, 'DEF', 260, 180, 'home', 72),
      this.createPlayer('h_def2', 'Серёга Бетон', 4, 'DEF', 260, 420, 'home', 76),
      this.createPlayer('h_mid', 'Модрич с Алиэкспресс', 10, 'MID', 420, 300, 'home', 85),
      this.createPlayer('h_fwd', 'КриРо Джуниор', 7, 'FWD', 480, 280, 'home', 94),
    ];

    this.awayPlayers = [
      this.createPlayer('a_gk', 'Штеген в Шоке', 1, 'GK', 920, 300, 'away', 70),
      this.createPlayer('a_def1', 'Пике без Шакиры', 3, 'DEF', 740, 190, 'away', 75),
      this.createPlayer('a_def2', 'Кунде в Пальто', 23, 'DEF', 740, 410, 'away', 78),
      this.createPlayer('a_mid', 'Педри на Мопеде', 8, 'MID', 580, 300, 'away', 84),
      this.createPlayer('a_fwd', 'Левандовски с Колбасой', 9, 'FWD', 520, 320, 'away', 92),
    ];

    this.controlledPlayerId = this.homePlayers[4].id; // Forward
  }

  private createPlayer(
    id: string,
    name: string,
    number: number,
    role: 'GK' | 'DEF' | 'MID' | 'FWD',
    baseX: number,
    baseY: number,
    team: 'home' | 'away',
    rating: number
  ): FifaPlayer {
    const skinTones = ['#fbcfe8', '#fed7aa', '#fde047', '#d97706', '#78350f'];
    const hairStyles: Array<'bald' | 'afro' | 'short' | 'cap' | 'long'> = ['bald', 'afro', 'short', 'cap', 'long'];
    return {
      id,
      name,
      number,
      role,
      x: baseX,
      y: baseY,
      vx: 0,
      vy: 0,
      baseX,
      baseY,
      speed: (role === 'FWD' ? 3.4 : role === 'MID' ? 3.0 : 2.7) * (rating / 80),
      power: 4 + (rating / 10),
      dribble: rating / 100,
      tackle: role === 'DEF' ? 85 : 55,
      rating,
      skinColor: skinTones[Math.floor(Math.random() * skinTones.length)],
      hairColor: ['#171717', '#78350f', '#f59e0b', '#dc2626'][Math.floor(Math.random() * 4)],
      hairStyle: hairStyles[Math.floor(Math.random() * hairStyles.length)],
      team,
      isTackling: false,
      tackleTimer: 0,
      isFallen: false,
      fallTimer: 0,
      isTPosing: false,
      isCelebrating: false,
      cards: 'none',
      ragdollAngle: 0,
      stamina: 100,
    };
  }

  public resetPositions(afterGoalTeam?: 'home' | 'away') {
    this.ball.x = 500;
    this.ball.y = 300;
    this.ball.z = 0;
    this.ball.vx = 0;
    this.ball.vy = 0;
    this.ball.vz = 0;
    this.ball.ownerId = null;

    [...this.homePlayers, ...this.awayPlayers].forEach(p => {
      p.x = p.baseX;
      p.y = p.baseY;
      p.vx = 0;
      p.vy = 0;
      p.isFallen = false;
      p.isTackling = false;
      p.isCelebrating = false;
      p.ragdollAngle = 0;
    });

    if (afterGoalTeam) {
      fifaAudio.playWhistle();
    }
  }

  public update(dt: number) {
    if (this.score.isPaused) return;

    // Handle VAR modal pause
    if (this.varModal && this.varModal.active) {
      this.varModal.timer -= dt;
      if (this.varModal.timer <= 0) {
        this.finishVarDecision();
      }
      return;
    }

    // Handle goal celebration
    if (this.goalCelebration && this.goalCelebration.active) {
      this.goalCelebration.timer -= dt;
      this.updateParticles(dt);
      if (this.goalCelebration.timer <= 0) {
        this.goalCelebration = null;
        this.resetPositions('home');
      }
      return;
    }

    // Advance match clock (90 minutes in ~120s real time => 45 virtual mins per minute)
    if (!this.score.isFinished) {
      this.score.matchTime += dt * 45;
      if (this.score.matchTime >= 2700 && !this.score.isHalfTime && this.score.matchTime < 2800) {
        this.score.isHalfTime = true;
        this.addCommentary("ПЕРЕРЫВ! Команды уходят в раздевалку пить чай с сушками!", 'funny');
        fifaAudio.playWhistle();
      } else if (this.score.matchTime >= 5400) {
        this.score.isFinished = true;
        this.addCommentary(
          `ФИНАЛЬНЫЙ СВИСТОК! Итог матча: ${this.homeTeam.shortName} ${this.score.home} - ${this.score.away} ${this.awayTeam.shortName}!`,
          'goal'
        );
        fifaAudio.playWhistle();
      }
    }

    // Update Player Inputs (Human Control)
    this.updateHumanControl(dt);

    // Update AI for teammates & opponent
    this.updateAI(dt);

    // Update Ball Physics
    this.updateBall(dt);

    // Update Referee
    this.updateReferee(dt);

    // Update Particles
    this.updateParticles(dt);

    // Periodic random funny commentary
    if (Math.random() < 0.003) {
      const quote = FUNNY_COMMENTARIES[Math.floor(Math.random() * FUNNY_COMMENTARIES.length)];
      this.addCommentary(quote, 'funny');
    }
  }

  private updateHumanControl(dt: number) {
    const controlled = this.homePlayers.find(p => p.id === this.controlledPlayerId);
    if (!controlled || controlled.isFallen) return;

    let moveX = 0;
    let moveY = 0;
    if (this.input.left) moveX -= 1;
    if (this.input.right) moveX += 1;
    if (this.input.up) moveY -= 1;
    if (this.input.down) moveY += 1;

    const len = Math.hypot(moveX, moveY);
    let speed = controlled.speed * (this.input.sprint ? 1.45 : 1.0);
    if (this.glitches.superSpeed) speed *= 2.2;

    const friction = this.glitches.iceSkating ? 0.985 : 0.82;

    if (len > 0) {
      controlled.vx = (moveX / len) * speed * 60;
      controlled.vy = (moveY / len) * speed * 60;
    } else {
      controlled.vx *= friction;
      controlled.vy *= friction;
    }

    controlled.x += controlled.vx * dt;
    controlled.y += controlled.vy * dt;

    // Bounds check
    controlled.x = Math.max(35, Math.min(965, controlled.x));
    controlled.y = Math.max(35, Math.min(565, controlled.y));

    // Dribble ball if close
    const distToBall = Math.hypot(this.ball.x - controlled.x, this.ball.y - controlled.y);
    if (distToBall < 26 && this.ball.z < 15 && !controlled.isTackling) {
      this.ball.ownerId = controlled.id;
      this.ball.lastKickerTeam = 'home';
      // Pull ball gently along in movement direction
      const angle = len > 0 ? Math.atan2(moveY, moveX) : Math.atan2(this.ball.vy, this.ball.vx);
      this.ball.x = controlled.x + Math.cos(angle) * 16;
      this.ball.y = controlled.y + Math.sin(angle) * 16;
      this.ball.vx = controlled.vx * 1.05;
      this.ball.vy = controlled.vy * 1.05;
    }

    // Charging shoot
    if (this.input.isChargingShoot) {
      this.input.shootCharge = Math.min(100, this.input.shootCharge + dt * 110);
    }
  }

  public releaseShoot() {
    const controlled = this.homePlayers.find(p => p.id === this.controlledPlayerId);
    if (!controlled || controlled.isFallen) {
      this.input.shootCharge = 0;
      this.input.isChargingShoot = false;
      return;
    }

    const distToBall = Math.hypot(this.ball.x - controlled.x, this.ball.y - controlled.y);
    if (distToBall < 36) {
      const charge = this.input.shootCharge;
      const powerMultiplier = 0.5 + (charge / 100) * 1.8;
      const shotSpeed = controlled.power * powerMultiplier * 55;

      // Target opponent's goal (x: 960, y: 300)
      const targetX = 965;
      const targetY = 270 + Math.random() * 60; // random height inside goal
      const angle = Math.atan2(targetY - controlled.y, targetX - controlled.x);

      // Overcharged blast = "Moon shot" / rocket into outer space
      if (charge > 94) {
        this.ball.vx = Math.cos(angle) * shotSpeed * 1.6;
        this.ball.vy = Math.sin(angle) * shotSpeed * 1.6;
        this.ball.vz = 80;
        this.addCommentary("ГИПЕР-УДАР! Мяч пробил озоновый слой и улетел к спутникам Starlink!", 'funny');
        this.createExplosionParticles(this.ball.x, this.ball.y, '#f59e0b');
        fifaAudio.playKick(2.2);
      } else {
        this.ball.vx = Math.cos(angle) * shotSpeed;
        this.ball.vy = Math.sin(angle) * shotSpeed;
        this.ball.vz = charge > 50 ? 25 : 5;
        fifaAudio.playKick(powerMultiplier);
      }

      this.ball.ownerId = null;
      this.ball.lastKickerTeam = 'home';
    }

    this.input.shootCharge = 0;
    this.input.isChargingShoot = false;
  }

  public passBall() {
    const controlled = this.homePlayers.find(p => p.id === this.controlledPlayerId);
    if (!controlled || controlled.isFallen) return;

    const distToBall = Math.hypot(this.ball.x - controlled.x, this.ball.y - controlled.y);
    if (distToBall < 36) {
      // Find closest teammate in forward direction
      const teammates = this.homePlayers.filter(p => p.id !== controlled.id);
      let bestTeammate = teammates[0];
      let bestDist = 9999;
      teammates.forEach(p => {
        const d = Math.hypot(p.x - controlled.x, p.y - controlled.y);
        if (d < bestDist && p.x >= controlled.x - 50) {
          bestDist = d;
          bestTeammate = p;
        }
      });

      const angle = Math.atan2(bestTeammate.y - controlled.y, bestTeammate.x - controlled.x);
      const passSpeed = 240;
      this.ball.vx = Math.cos(angle) * passSpeed;
      this.ball.vy = Math.sin(angle) * passSpeed;
      this.ball.vz = 2;
      this.ball.ownerId = null;
      this.ball.lastKickerTeam = 'home';
      fifaAudio.playKick(0.7);

      // Automatically switch control to target teammate
      this.controlledPlayerId = bestTeammate.id;
    }
  }

  public slideTackle() {
    const controlled = this.homePlayers.find(p => p.id === this.controlledPlayerId);
    if (!controlled || controlled.isFallen || controlled.isTackling) return;

    controlled.isTackling = true;
    controlled.tackleTimer = 0.55;
    fifaAudio.playSlide();

    // Sudden dash in moving direction
    const angle = Math.atan2(controlled.vy || 0.1, controlled.vx || 1);
    controlled.vx = Math.cos(angle) * 380;
    controlled.vy = Math.sin(angle) * 380;

    // Check collision with opponent players
    this.awayPlayers.forEach(opp => {
      const d = Math.hypot(opp.x - controlled.x, opp.y - controlled.y);
      if (d < 32 && !opp.isFallen) {
        opp.isFallen = true;
        opp.fallTimer = 2.0;
        opp.ragdollAngle = Math.random() * 6.28;
        this.createExplosionParticles(opp.x, opp.y, '#ef4444');

        // Loose ball
        if (this.ball.ownerId === opp.id) {
          this.ball.ownerId = null;
          this.ball.vx = (Math.random() - 0.5) * 300;
          this.ball.vy = (Math.random() - 0.5) * 300;
        }

        // Referee reaction (50% chance if not bribed)
        if (!this.glitches.corruptRef && Math.random() < 0.6) {
          this.triggerFoul(controlled, opp);
        } else {
          this.addCommentary("СУДЬЯ: «Чистый подкат, вставай, нечего притворяться трупом!»", 'foul');
        }
      }
    });
  }

  private triggerFoul(perpetrator: FifaPlayer, victim: FifaPlayer) {
    fifaAudio.playWhistle();
    this.referee.anger = 1.0;
    this.referee.targetPlayerId = perpetrator.id;

    if (Math.random() < 0.35) {
      this.referee.cardInHand = 'red';
      perpetrator.cards = 'red';
      this.addCommentary(`КРАСНАЯ КАРТОЧКА! ${perpetrator.name} удален за жестокий подкат в колено!`, 'foul');
    } else {
      this.referee.cardInHand = 'yellow';
      perpetrator.cards = 'yellow';
      this.addCommentary(`ЖЁЛТАЯ КАРТОЧКА! ${perpetrator.name} наказан за снос соперника!`, 'foul');
    }
    this.referee.cardTimer = 2.5;

    // Set ball for free kick
    this.ball.x = victim.x;
    this.ball.y = victim.y;
    this.ball.vx = 0;
    this.ball.vy = 0;
    this.ball.ownerId = null;
  }

  public switchPlayer() {
    const candidates = this.homePlayers.filter(p => p.id !== this.controlledPlayerId && !p.isFallen);
    if (candidates.length === 0) return;

    // Sort by distance to ball
    candidates.sort((a, b) => {
      const da = Math.hypot(a.x - this.ball.x, a.y - this.ball.y);
      const db = Math.hypot(b.x - this.ball.x, b.y - this.ball.y);
      return da - db;
    });

    this.controlledPlayerId = candidates[0].id;
  }

  public bribeReferee() {
    this.glitches.bribeCount += 1;
    this.glitches.corruptRef = true;
    fifaAudio.playBribe();

    this.addCommentary("ВЗЯТКА 500 РУБЛЕЙ ПРИНЯТА! Судья внезапно перестал видеть офсайды и фолы!", 'bribe');

    // Free penalty or remove red card
    this.homePlayers.forEach(p => {
      if (p.cards === 'red') p.cards = 'yellow';
    });

    this.createExplosionParticles(this.referee.x, this.referee.y, '#22c55e');
  }

  public triggerVar() {
    fifaAudio.playVarChime();
    const images: Array<'cat' | 'tv' | 'shoe' | 'cloud'> = ['cat', 'tv', 'shoe', 'cloud'];
    const decisions = [
      'ГОЛ ЗАСЧИТАН! На повторе видно, что мяч пересёк границу соседнего квартала!',
      'ПЕНАЛЬТИ! Защитник моргнул в штрафной площади с нарушением правил!',
      'ОФСАЙД ОТМЕНЁН! Линия была нарисована кривым маркером!',
      'СУДЬЯ ПОСМОТРЕЛ ВИДЕО С КОТИКАМИ И РЕШИЛ ПРОДОЛЖАТЬ МАТЧ!',
    ];

    this.varModal = {
      active: true,
      timer: 3.2,
      decision: decisions[Math.floor(Math.random() * decisions.length)],
      imageType: images[Math.floor(Math.random() * images.length)],
    };

    this.addCommentary("VAR ПРОВЕРКА! Судья подошел к экрану телевизора «Рубин» 1987 года выпуска...", 'var');
  }

  private finishVarDecision() {
    if (!this.varModal) return;
    fifaAudio.playWhistle();
    this.addCommentary(this.varModal.decision, 'var');
    this.varModal = null;
  }

  private updateAI(dt: number) {
    // Teammates AI (Home players except the controlled one)
    this.homePlayers.forEach(p => {
      if (p.id === this.controlledPlayerId) return;
      this.updateSingleAI(p, 'home', dt);
    });

    // Away Team AI
    this.awayPlayers.forEach(p => {
      this.updateSingleAI(p, 'away', dt);
    });
  }

  private updateSingleAI(p: FifaPlayer, team: 'home' | 'away', dt: number) {
    if (p.isFallen) {
      p.fallTimer -= dt;
      if (p.fallTimer <= 0) {
        p.isFallen = false;
        p.ragdollAngle = 0;
      }
      return;
    }

    if (p.isTackling) {
      p.tackleTimer -= dt;
      if (p.tackleTimer <= 0) p.isTackling = false;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      return;
    }

    // Goalkeeper behavior
    if (p.role === 'GK') {
      const goalX = team === 'home' ? 80 : 920;
      const targetY = Math.max(240, Math.min(360, this.ball.y));

      // Drunk Goalkeeper Glitch
      if (this.glitches.drunkGoalkeeper) {
        p.x = goalX + Math.sin(Date.now() / 400) * 80;
        p.y = 300 + Math.cos(Date.now() / 300) * 120;
        return;
      }

      p.x += (goalX - p.x) * 4 * dt;
      p.y += (targetY - p.y) * 4.5 * dt;

      // GK Save
      const d = Math.hypot(p.x - this.ball.x, p.y - this.ball.y);
      if (d < 30 && this.ball.z < 25) {
        fifaAudio.playKick(1.2);
        this.ball.vx = (team === 'home' ? 1 : -1) * (200 + Math.random() * 150);
        this.ball.vy = (Math.random() - 0.5) * 200;
        this.ball.vz = 8;
        this.ball.ownerId = null;
        this.addCommentary(`${p.name} чудом отбил мяч челюстью!`, 'funny');
      }
      return;
    }

    // Field Player AI
    const distToBall = Math.hypot(p.x - this.ball.x, p.y - this.ball.y);
    let targetX = p.baseX;
    let targetY = p.baseY;

    // Is the ball near this player's zone?
    const isBallNear = distToBall < 240;
    if (isBallNear) {
      targetX = this.ball.x;
      targetY = this.ball.y;
    } else {
      // Dynamic formation shift with the ball
      const ballShiftX = (this.ball.x - 500) * 0.35;
      targetX = p.baseX + ballShiftX;
    }

    const angle = Math.atan2(targetY - p.y, targetX - p.x);
    const speed = p.speed * 48 * (this.glitches.superSpeed ? 2.0 : 1.0);
    p.vx = Math.cos(angle) * speed;
    p.vy = Math.sin(angle) * speed;

    p.x += p.vx * dt;
    p.y += p.vy * dt;

    p.x = Math.max(35, Math.min(965, p.x));
    p.y = Math.max(35, Math.min(565, p.y));

    // Possession and kick
    if (distToBall < 25 && this.ball.z < 15) {
      this.ball.ownerId = p.id;
      this.ball.lastKickerTeam = team;

      // Away AI shooting or passing
      if (team === 'away') {
        const distToHomeGoal = Math.hypot(p.x - 45, p.y - 300);
        if (distToHomeGoal < 300 && Math.random() < 0.12) {
          // Shoot at Home goal
          fifaAudio.playKick(1.1);
          const shootAngle = Math.atan2(270 + Math.random() * 60 - p.y, 40 - p.x);
          this.ball.vx = Math.cos(shootAngle) * 320;
          this.ball.vy = Math.sin(shootAngle) * 320;
          this.ball.vz = 8;
          this.ball.ownerId = null;
        } else {
          // Dribble towards home goal
          this.ball.vx = -180;
          this.ball.vy = (Math.random() - 0.5) * 80;
        }
      }
    }
  }

  private updateBall(dt: number) {
    const gravity = this.glitches.moonGravity ? 18 : 130;
    const airFriction = 0.985;
    const groundFriction = this.glitches.iceSkating ? 0.992 : 0.975;

    // Movement in 3D
    this.ball.x += this.ball.vx * dt;
    this.ball.y += this.ball.vy * dt;
    this.ball.z += this.ball.vz * dt;

    // Gravity
    if (this.ball.z > 0) {
      this.ball.vz -= gravity * dt;
      this.ball.vx *= airFriction;
      this.ball.vy *= airFriction;
    } else {
      this.ball.z = 0;
      if (Math.abs(this.ball.vz) > 15) {
        this.ball.vz = -this.ball.vz * 0.55; // bounce
      } else {
        this.ball.vz = 0;
      }
      this.ball.vx *= groundFriction;
      this.ball.vy *= groundFriction;
    }

    // Trail
    if (Math.hypot(this.ball.vx, this.ball.vy) > 150) {
      this.ball.trail.push({ x: this.ball.x, y: this.ball.y, z: this.ball.z, alpha: 1.0 });
      if (this.ball.trail.length > 12) this.ball.trail.shift();
    }
    this.ball.trail.forEach(t => (t.alpha -= dt * 2.5));
    this.ball.trail = this.ball.trail.filter(t => t.alpha > 0);

    // Goal Check!
    // Left Goal: x in [0, 45], y in [240, 360]
    if (this.ball.x <= 45 && this.ball.y >= 235 && this.ball.y <= 365) {
      this.onGoal('away');
      return;
    }
    // Right Goal: x in [955, 1000], y in [240, 360]
    if (this.ball.x >= 955 && this.ball.y >= 235 && this.ball.y <= 365) {
      this.onGoal('home');
      return;
    }

    // Post collisions
    const posts = [
      { x: 45, y: 235 },
      { x: 45, y: 365 },
      { x: 955, y: 235 },
      { x: 955, y: 365 },
    ];
    posts.forEach(post => {
      const d = Math.hypot(this.ball.x - post.x, this.ball.y - post.y);
      if (d < 16) {
        fifaAudio.playPostHit();
        this.ball.vx = -this.ball.vx * 0.8;
        this.ball.vy = -this.ball.vy * 0.8;
        this.addCommentary("ШТАНГА! Звон металла разбудил сторожа на автостоянке!", 'miss');
      }
    });

    // Field boundaries bounce
    if (this.ball.y < 35) {
      this.ball.y = 35;
      this.ball.vy = -this.ball.vy * 0.7;
    } else if (this.ball.y > 565) {
      this.ball.y = 565;
      this.ball.vy = -this.ball.vy * 0.7;
    }

    if (this.ball.x < 35 && (this.ball.y < 235 || this.ball.y > 365)) {
      this.ball.x = 35;
      this.ball.vx = -this.ball.vx * 0.7;
    } else if (this.ball.x > 965 && (this.ball.y < 235 || this.ball.y > 365)) {
      this.ball.x = 965;
      this.ball.vx = -this.ball.vx * 0.7;
    }
  }

  private onGoal(team: 'home' | 'away') {
    if (team === 'home') {
      this.score.home += 1;
      const scorer = this.homePlayers.find(p => p.id === this.controlledPlayerId)?.name || 'Нападающий';
      this.goalCelebration = {
        active: true,
        scorerName: scorer,
        teamName: this.homeTeam.name,
        timer: 3.5,
      };
      this.addCommentary(`ГОООООЛ! ${this.homeTeam.shortName} забивает шедевр! ${scorer} ликует!`, 'goal');
    } else {
      this.score.away += 1;
      this.goalCelebration = {
        active: true,
        scorerName: 'Соперник',
        teamName: this.awayTeam.name,
        timer: 3.5,
      };
      this.addCommentary(`ГОЛ В НАШИ ВОРОТА! ${this.awayTeam.shortName} открывает шампанское!`, 'goal');
    }

    fifaAudio.playGoalHorn();
    fifaAudio.playSiuuu();
    this.createExplosionParticles(this.ball.x, this.ball.y, '#eab308', 50);
  }

  private updateReferee(dt: number) {
    // Referee runs towards the ball or towards a penalized player
    let targetX = this.ball.x;
    let targetY = this.ball.y;

    if (this.referee.targetPlayerId) {
      const p = [...this.homePlayers, ...this.awayPlayers].find(x => x.id === this.referee.targetPlayerId);
      if (p) {
        targetX = p.x;
        targetY = p.y;
      }
    }

    // Keep referee slightly off to the side so he doesn't block the screen constantly
    targetX += 30;
    targetY -= 20;

    const angle = Math.atan2(targetY - this.referee.y, targetX - this.referee.x);
    this.referee.vx = Math.cos(angle) * 120;
    this.referee.vy = Math.sin(angle) * 120;

    this.referee.x += this.referee.vx * dt;
    this.referee.y += this.referee.vy * dt;

    if (this.referee.cardTimer > 0) {
      this.referee.cardTimer -= dt;
      if (this.referee.cardTimer <= 0) {
        this.referee.cardInHand = null;
        this.referee.targetPlayerId = null;
      }
    }

    // Hit by the ball!
    const distToBall = Math.hypot(this.ball.x - this.referee.x, this.ball.y - this.referee.y);
    if (distToBall < 18) {
      this.ball.vx = -this.ball.vx * 0.85;
      this.ball.vy = -this.ball.vy * 0.85;
      this.addCommentary("МЯЧ ПОПАЛ В СУДЬЮ! Арбитр пошатнулся, но мужественно продолжил стоять!", 'funny');
      fifaAudio.playPostHit();
    }
  }

  private updateParticles(dt: number) {
    this.particles.forEach(p => {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
    });
    this.particles = this.particles.filter(p => p.life > 0);
  }

  public createExplosionParticles(x: number, y: number, color: string, count: number = 25) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 220;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        life: 0.6 + Math.random() * 0.8,
        maxLife: 1.2,
        size: 3 + Math.random() * 5,
      });
    }
  }

  public addCommentary(text: string, type: CommentaryMessage['type']) {
    const msg: CommentaryMessage = {
      id: 'comm_' + Math.random(),
      speaker: 'Комментатор',
      text,
      type,
      time: Date.now(),
    };
    this.commentaries.unshift(msg);
    if (this.commentaries.length > 5) {
      this.commentaries.pop();
    }
  }
}
