export type DimensionType = 
  | 'inamorta' 
  | 'multiverse' 
  | 'star_wars' 
  | 'mustafar' 
  | 'hoth' 
  | 'cyberpunk';

export type GameMode = 'menu' | 'campaign' | 'tournament' | 'endless';

export type DifficultyType = 'normal' | 'hard' | 'insane' | 'nightmare';

export type SkinType = 
  | 'classic' 
  | 'leaf' 
  | 'ice' 
  | 'savage' 
  | 'lava' 
  | 'transformer' 
  | 'avenger'
  | 'star_wars';

export type WarriorType = 
  // Medieval Inamorta Warriors
  | 'swordsman' 
  | 'archer' 
  | 'knight' 
  | 'barbarian' 
  | 'mage' 
  | 'royal_knight'
  // Star Wars Galaxy Warriors
  | 'jedi'
  | 'stormtrooper'
  | 'darth_vader'
  | 'yoda'
  | 'mandalorian'
  // Multiverse: Avengers & Transformers
  | 'iron_man'
  | 'captain'
  | 'thor'
  | 'optimus'
  | 'bumblebee'
  | 'hulk'
  // Military & Heavy Armor
  | 'soldier'
  | 'tank';

export type ZombieType = 
  | 'regular' 
  | 'fast' 
  | 'fat' 
  | 'armored' 
  | 'giant' 
  | 'boss'
  // New Multiverse Bosses & Threats
  | 'necro_titan'
  | 'zombie_transformer'
  | 'mega_zombietron'
  | 'zombie_thanos'
  | 'undead_dragon';

export type ProjectileType = 
  | 'arrow' 
  | 'magic_orb' 
  | 'fireball' 
  | 'cannonball' 
  | 'tower_arrow'
  // Star Wars projectiles
  | 'blaster_bolt'
  | 'lightsaber_throw'
  | 'force_push_wave'
  | 'mando_rocket'
  // Multiverse projectiles
  | 'repulsor_laser'
  | 'vibranium_shield'
  | 'thor_lightning'
  | 'ion_blast'
  | 'plasma_stinger'
  | 'cosmic_beam'
  // Military projectiles
  | 'bullet'
  | 'tank_shell';

export type ObstacleType = 'landmine' | 'trench' | 'barricade';

export interface Obstacle {
  id: string;
  type: ObstacleType;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  hp: number;
  maxHp: number;
  damage: number;
  isArmed?: boolean;
  cost: number;
}

export type EntityState = 'walk' | 'attack' | 'hit' | 'die';

export interface Warrior {
  id: string;
  type: WarriorType;
  tier: number; // 1, 2, or 3
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  hp: number;
  maxHp: number;
  damage: number;
  attackRange: number;
  attackCooldown: number;
  attackTimer: number;
  speed: number;
  state: EntityState;
  stateTimer: number;
  animFrame: number;
  animTimer: number;
  targetId: string | null;
  armor: number; // damage reduction multiplier (e.g. 0.2 = 20% reduction)
  critChance: number;
  splashRadius?: number;
  healAura?: boolean;
  isFlying?: boolean;
  skin?: SkinType;
}

export interface Zombie {
  id: string;
  type: ZombieType;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  hp: number;
  maxHp: number;
  damage: number;
  attackRange: number;
  attackCooldown: number;
  attackTimer: number;
  speed: number;
  baseSpeed: number;
  state: EntityState;
  stateTimer: number;
  animFrame: number;
  animTimer: number;
  targetId: string | null;
  armor: number;
  reward: number;
  isBoss: boolean;
  isFrozen: boolean;
  freezeTimer: number;
  isSlowed?: boolean;
  slowTimer?: number;
  shockwaveTimer?: number;
  burnTimer?: number;
  isFlying?: boolean;
}

export interface Projectile {
  id: string;
  type: ProjectileType;
  x: number;
  y: number;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  targetZombieId?: string;
  damage: number;
  speed: number;
  progress: number;
  arcHeight: number;
  splashRadius: number;
  isCrit?: boolean;
  ricochetsLeft?: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  radius: number;
  alpha: number;
  life: number;
  maxLife: number;
  type: 'spark' | 'smoke' | 'blood' | 'magic' | 'slash' | 'coin' | 'ice' | 'explosion' | 'fire' | 'lightning' | 'laser' | 'portal';
}

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  vy: number;
  isCrit?: boolean;
}

export interface Castle {
  hp: number;
  maxHp: number;
  level: number; // 1 to 5
  archerTimer: number;
  cannonTimer: number;
  regenTimer: number;
  spikesActive: boolean;
  energyShield?: boolean;
}

export interface Ability {
  id: 'fire_rain' | 'freeze' | 'lightning';
  name: string;
  nameRu: string;
  icon: string;
  description: string;
  cooldown: number; // in seconds
  currentCooldown: number; // in seconds remaining
  hotkey: string;
}

export interface WarriorConfig {
  type: WarriorType;
  nameRu: string;
  nameEn: string;
  tierNames: [string, string, string];
  cost: number;
  summonCooldown: number;
  icon: string;
  baseHp: number;
  baseDmg: number;
  baseRange: number;
  baseSpeed: number;
  attackCooldown: number;
  role: 'melee' | 'ranged' | 'tank' | 'magic' | 'hero';
  dimension: DimensionType;
  description: string;
  upgradeCostTier2: number;
  upgradeCostTier3: number;
}

export interface CastleLevelInfo {
  level: number;
  nameRu: string;
  nameEn: string;
  hpBonus: number;
  cost: number;
  features: string[];
  description: string;
}

export interface WaveInfo {
  waveNumber: number;
  totalZombies: number;
  spawnQueue: ZombieType[];
  isBossWave: boolean;
  spawnInterval: number; // in ms
}

export interface GameStats {
  wave: number;
  zombiesKilled: number;
  score: number;
  highScore: number;
  gold: number;
  totalGoldEarned: number;
  gems: number;
  crowns: number;
  bossesDefeated: number;
  warriorsSummoned: number;
}

// Skins Definition (Stick War Legacy style)
export interface SkinDefinition {
  id: SkinType;
  nameRu: string;
  nameEn: string;
  icon: string;
  tagline: string;
  perkDesc: string;
  costGems: number;
  primaryColor: string;
  secondaryColor: string;
  glowColor: string;
  color?: string;
  buffSummary?: string;
  description?: string;
  universe?: 'inamorta' | 'multiverse' | 'star_wars';
  universeNameRu?: string;
  artTitleRu?: string;
  combatStats?: {
    defense: string;
    speed: string;
    attack: string;
    ability: string;
  };
}

// Campaign Levels (Stick War Legacy map)
export interface CampaignLevel {
  id: number;
  titleRu: string;
  titleEn: string;
  descriptionRu: string;
  descriptionEn: string;
  dimension: DimensionType;
  rewardGold: number;
  rewardGems: number;
  isUnlocked: boolean;
  stars: number; // 0 to 3
  bossType?: ZombieType;
  difficulty: DifficultyType;
}

// Tournament AI Leader (Stick War Crown Tournament)
export interface TournamentAILeader {
  id: string;
  name: string;
  titleRu: string;
  titleEn: string;
  avatar: string;
  playstyleRu: string;
  playstyleEn: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'boss';
  favoredUnits: WarriorType[];
  isPlayer?: boolean;
}

export interface TournamentMatch {
  id: string;
  round: 'quarter' | 'semi' | 'final';
  leader1: TournamentAILeader;
  leader2: TournamentAILeader;
  winner?: TournamentAILeader;
  isPlayerMatch: boolean;
}
