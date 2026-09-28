export type TeamId =
  | 'red_manchester'
  | 'white_madrid'
  | 'blue_barca'
  | 'beer_munich'
  | 'dvor_united'
  | 'oil_paris'
  | 'shaurma_fc'
  | 'ea_clowns'
  | 'star_wars_empire'
  | 'star_wars_rebels';

export type StadiumWorld =
  | 'classic'
  | 'death_star'
  | 'mustafar'
  | 'hoth'
  | 'tatooine'
  | 'cyberpunk';

export interface TeamConfig {
  id: TeamId;
  name: string;
  shortName: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  badgeEmoji: string;
  motto: string;
  memeDescription: string;
  defaultRoster: string[];
}

export type PlayerRole = 'forward' | 'midfielder' | 'defender' | 'goalkeeper';

export interface PitchPlayer {
  id: string;
  name: string;
  number: number;
  team: 'home' | 'away';
  role: PlayerRole;
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetX: number;
  targetY: number;
  speed: number;
  power: number;
  stamina: number; // 0-100
  faceType: number;
  skinColor: string;
  hairColor: string;
  isControlled: boolean;
  // Glitch states
  isRolling: boolean;
  rollAngle: number;
  rollTimer: number;
  isTpose: boolean;
  isSliding: boolean;
  slideTimer: number;
  slideAngle: number;
  isStunned: boolean;
  stunTimer: number;
  isNeymarSimulating: boolean;
  isMaguireSpinning: boolean;
  hasRedCard: boolean;
  yellowCards: number;
  limbsWobble: number;
  headScale: number;
}

export interface SoccerBall {
  x: number;
  y: number;
  z: number; // height off ground
  vx: number;
  vy: number;
  vz: number;
  radius: number;
  rotation: number;
  spinSpeed: number;
  type: 'normal' | 'cube' | 'balloon' | 'super' | 'watermelon' | 'bowling' | 'death_star' | 'lightsaber';
  trail: Array<{ x: number; y: number; alpha: number }>;
  lastKickerTeam?: 'home' | 'away';
  lastKickerName?: string;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
}

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  fontSize: number;
  life: number;
  maxLife: number;
  vy: number;
}

export interface PitchDog {
  x: number;
  y: number;
  vx: number;
  vy: number;
  active: boolean;
  barkTimer: number;
  chewingBallTimer: number;
}

export interface PitchFan {
  x: number;
  y: number;
  vx: number;
  vy: number;
  active: boolean;
  lifeTimer: number;
  name: string;
}

export interface Referee {
  x: number;
  y: number;
  vx: number;
  vy: number;
  isBlindfolded: boolean;
  cardDrawn: 'none' | 'yellow' | 'red' | 'uno_reverse';
  whistleTimer: number;
  chasingPlayerId?: string;
}

export interface MatchStats {
  homeScore: number;
  awayScore: number;
  shotsHome: number;
  shotsAway: number;
  foulsHome: number;
  foulsAway: number;
  simulationsHome: number;
  simulationsAway: number;
  maguireOwnGoals: number;
  eaPointsSpent: number;
  playerPoints?: number;
  mathProblemsSolved?: number;
}

export interface MathProblem {
  id: string;
  expression: string;
  answer: number;
  options: number[];
  pointsReward: number;
  difficulty: 'easy' | 'medium' | 'hard';
  explanation: string;
}

export interface GameSettings {
  gravity: number; // 1.0 normal
  fieldFriction: number; // 0.98 normal, 0.999 ice, 0.85 mud
  ballSpeedMultiplier: number;
  aiClownLevel: 'drunk' | 'average' | 'sweaty_tryhard';
  neymarSensitivity: number; // chance of rolling when touched
  maguireMode: boolean; // defenders prioritize own goal
  multiBallCount: number; // 1 to 5
  vuvuzelaVolume: number; // 0 to 1
  commentatorStyle: 'utkin' | 'toxic_streamer' | 'babushka';
  eaScriptingActive: boolean;
  funnyBugsEnabled: boolean;
  stadiumWorld?: StadiumWorld;
}

export interface PlayerCard {
  id: string;
  name: string;
  photoEmoji: string;
  team: string;
  rarity: 'bronze_trash' | 'silver_mid' | 'gold_meme' | 'diamond_goat';
  overall: number;
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
  memeStatName: string;
  memeStatValue: number;
  description: string;
  soundQuote: string;
}

export interface EAPopupOffer {
  id: string;
  title: string;
  description: string;
  priceTag: string;
  realCost: string;
  perk: string;
}
