export type FifaTeamId = 'real' | 'barca' | 'gazmyas' | 'manchester' | 'brazil' | 'dvor' | 'pensioners' | 'france';

export interface FifaPlayer {
  id: string;
  name: string;
  number: number;
  role: 'GK' | 'DEF' | 'MID' | 'FWD';
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseX: number;
  baseY: number;
  speed: number;
  power: number;
  dribble: number;
  tackle: number;
  rating: number;
  skinColor: string;
  hairColor: string;
  hairStyle: 'bald' | 'afro' | 'short' | 'cap' | 'long';
  team: 'home' | 'away';
  isTackling: boolean;
  tackleTimer: number;
  isFallen: boolean;
  fallTimer: number;
  isTPosing: boolean;
  isCelebrating: boolean;
  cards: 'none' | 'yellow' | 'red';
  ragdollAngle: number;
  stamina: number;
}

export interface FifaTeamConfig {
  id: FifaTeamId;
  name: string;
  shortName: string;
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  flag: string;
  stadiumName: string;
  description: string;
  rating: number;
  anthemNote: number;
}

export interface FifaBall {
  x: number;
  y: number;
  z: number; // height for lob/air
  vx: number;
  vy: number;
  vz: number;
  radius: number;
  ownerId: string | null;
  lastKickerTeam: 'home' | 'away' | null;
  trail: Array<{ x: number; y: number; z: number; alpha: number }>;
}

export interface FifaCardItem {
  id: string;
  name: string;
  nick: string;
  rating: number;
  role: 'GK' | 'DEF' | 'MID' | 'FWD';
  team: string;
  rarity: 'bronze' | 'silver' | 'gold' | 'cursed';
  quote: string;
  stats: {
    pac: number; // Pace
    sho: number; // Shooting
    pas: number; // Passing
    dri: number; // Dribbling
    def: number; // Defense
    phy: number; // Physical
  };
  avatarEmoji: string;
  specialSkill: string;
}

export type FifaGameMode = 'match' | 'penalty' | 'tournament' | 'packs';

export interface FifaGlitchSettings {
  tPose: boolean;
  moonGravity: boolean;
  superSpeed: boolean;
  drunkGoalkeeper: boolean;
  corruptRef: boolean;
  iceSkating: boolean;
  bribeCount: number;
}

export interface CommentaryMessage {
  id: string;
  speaker: string;
  text: string;
  type: 'goal' | 'foul' | 'miss' | 'bribe' | 'var' | 'funny';
  time: number;
}
