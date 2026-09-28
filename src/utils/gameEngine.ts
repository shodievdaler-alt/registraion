import { 
  Warrior, 
  Zombie, 
  Projectile, 
  Particle, 
  FloatingText, 
  Castle, 
  Ability, 
  WarriorType, 
  ZombieType, 
  GameStats, 
  WarriorConfig, 
  DimensionType, 
  SkinType, 
  DifficultyType,
  Obstacle,
  ObstacleType
} from '../types';
import { 
  INITIAL_GOLD, 
  PASSIVE_GOLD_RATE, 
  INITIAL_CASTLE_HP, 
  WARRIOR_CONFIGS, 
  ZOMBIE_BASE_STATS, 
  CASTLE_LEVELS, 
  INITIAL_ABILITIES, 
  generateWave, 
  SKIN_DEFINITIONS, 
  CAMPAIGN_LEVELS, 
  DIFFICULTY_CONFIGS,
  OBSTACLE_CONFIGS
} from '../data/gameConfig';
import { soundFx } from './audio';

export interface GameEngineState {
  dimension: DimensionType;
  difficulty: DifficultyType;
  activeSkin: SkinType;
  portalReady: boolean;
  castle: Castle;
  warriors: Warrior[];
  zombies: Zombie[];
  obstacles: Obstacle[];
  obstacleCooldowns: Record<ObstacleType, number>;
  activeObstacleAim: ObstacleType | null;
  projectiles: Projectile[];
  particles: Particle[];
  floatingTexts: FloatingText[];
  abilities: Ability[];
  stats: GameStats;
  warriorTiers: Record<WarriorType, number>;
  summonCooldowns: Record<WarriorType, number>;
  waveState: 'prep' | 'active' | 'cleared' | 'boss_defeated' | 'game_over';
  prepTimer: number; // countdown in seconds
  spawnQueue: ZombieType[];
  spawnTimer: number;
  spawnInterval: number;
  totalZombiesInWave: number;
  currentZombiesAlive: number;
  isBossWave: boolean;
  bossDefeatedAlert: boolean;
  bossDefeatedTimer: number;
  isFreezeActive: boolean;
  freezeDuration: number;
  fireRainAiming: boolean;
  gameSpeed: number;
  screenShake: number;
  levelNumber?: number;
}

export function getDefaultObstacles(): Obstacle[] {
  return [
    {
      id: 'obs_init_trench_1',
      type: 'trench',
      name: 'Фортификационный окоп',
      x: 320,
      y: 455,
      width: 80,
      height: 35,
      hp: 600,
      maxHp: 600,
      damage: 0,
      cost: 75,
      isArmed: true,
    },
    {
      id: 'obs_init_mine_1',
      type: 'landmine',
      name: 'Фугасная мина',
      x: 485,
      y: 435,
      width: 30,
      height: 20,
      hp: 1,
      maxHp: 1,
      damage: 480,
      cost: 45,
      isArmed: true,
    },
    {
      id: 'obs_init_mine_2',
      type: 'landmine',
      name: 'Фугасная мина',
      x: 440,
      y: 500,
      width: 30,
      height: 20,
      hp: 1,
      maxHp: 1,
      damage: 480,
      cost: 45,
      isArmed: true,
    },
    {
      id: 'obs_init_barricade_1',
      type: 'barricade',
      name: 'Шипованная баррикада',
      x: 235,
      y: 440,
      width: 45,
      height: 45,
      hp: 800,
      maxHp: 800,
      damage: 18,
      cost: 60,
      isArmed: true,
    },
  ];
}

export class GameEngine {
  private state: GameEngineState;
  private canvasWidth: number = 1200;
  private canvasHeight: number = 600;
  private onStateChange?: (state: GameEngineState) => void;

  constructor(onStateChange?: (state: GameEngineState) => void) {
    this.onStateChange = onStateChange;

    const initialHighScore = typeof window !== 'undefined' 
      ? parseInt(localStorage.getItem('avz_highscore') || '0', 10) 
      : 0;

    const savedSkin = typeof window !== 'undefined'
      ? (localStorage.getItem('avz_equipped_skin') as SkinType) || 'classic'
      : 'classic';

    const savedDifficulty = typeof window !== 'undefined'
      ? (localStorage.getItem('avz_difficulty') as DifficultyType) || 'normal'
      : 'normal';

    this.state = {
      dimension: 'inamorta',
      difficulty: savedDifficulty,
      activeSkin: savedSkin,
      portalReady: true,
      castle: {
        hp: INITIAL_CASTLE_HP,
        maxHp: INITIAL_CASTLE_HP,
        level: 1,
        archerTimer: 0,
        cannonTimer: 0,
        regenTimer: 0,
        spikesActive: false,
      },
      warriors: [],
      zombies: [],
      obstacles: getDefaultObstacles(),
      obstacleCooldowns: {
        landmine: 0,
        trench: 0,
        barricade: 0,
      },
      activeObstacleAim: null,
      projectiles: [],
      particles: [],
      floatingTexts: [],
      abilities: JSON.parse(JSON.stringify(INITIAL_ABILITIES)),
      stats: {
        wave: 1,
        zombiesKilled: 0,
        score: 0,
        highScore: initialHighScore,
        gold: INITIAL_GOLD,
        totalGoldEarned: INITIAL_GOLD,
        gems: 120,
        crowns: 1,
        bossesDefeated: 0,
        warriorsSummoned: 0,
      },
      warriorTiers: {
        swordsman: 1,
        archer: 1,
        knight: 1,
        barbarian: 1,
        mage: 1,
        royal_knight: 1,
        jedi: 1,
        stormtrooper: 1,
        darth_vader: 1,
        yoda: 1,
        mandalorian: 1,
        iron_man: 1,
        captain: 1,
        thor: 1,
        optimus: 1,
        bumblebee: 1,
        hulk: 1,
        soldier: 1,
        tank: 1,
      },
      summonCooldowns: {
        swordsman: 0,
        archer: 0,
        knight: 0,
        barbarian: 0,
        mage: 0,
        royal_knight: 0,
        jedi: 0,
        stormtrooper: 0,
        darth_vader: 0,
        yoda: 0,
        mandalorian: 0,
        iron_man: 0,
        captain: 0,
        thor: 0,
        optimus: 0,
        bumblebee: 0,
        hulk: 0,
        soldier: 0,
        tank: 0,
      },
      waveState: 'prep',
      prepTimer: 3.5,
      spawnQueue: [],
      spawnTimer: 0,
      spawnInterval: 2000,
      totalZombiesInWave: 0,
      currentZombiesAlive: 0,
      isBossWave: false,
      bossDefeatedAlert: false,
      bossDefeatedTimer: 0,
      isFreezeActive: false,
      freezeDuration: 0,
      fireRainAiming: false,
      gameSpeed: 1,
      screenShake: 0,
    };

    this.prepareWave(1);
  }

  public getState(): GameEngineState {
    return this.state;
  }

  public setDimensions(w: number, h: number) {
    this.canvasWidth = w;
    this.canvasHeight = h;
  }

  public setGameSpeed(speed: number) {
    this.state.gameSpeed = speed;
    this.notify();
  }

  public setSkin(skin: SkinType) {
    this.state.activeSkin = skin;
    if (typeof window !== 'undefined') {
      localStorage.setItem('avz_equipped_skin', skin);
    }
    // Apply skin to all active warriors
    for (const w of this.state.warriors) {
      w.skin = skin;
    }
    this.notify();
  }

  public setDifficulty(diff: DifficultyType) {
    this.state.difficulty = diff;
    if (typeof window !== 'undefined') {
      localStorage.setItem('avz_difficulty', diff);
    }
    const diffCfg = DIFFICULTY_CONFIGS[diff];
    this.state.floatingTexts.push({
      id: 'ft_diff_' + Math.random(),
      text: `⚔️ СЛОЖНОСТЬ: ${diffCfg.badge.toUpperCase()}`,
      x: this.canvasWidth * 0.5,
      y: 160,
      color: diffCfg.color,
      size: 22,
      life: 2.5,
      maxLife: 2.5,
      vy: -15,
      isCrit: true,
    });
    this.notify();
  }

  // ==================== DIMENSIONAL PORTAL ====================

  public switchDimension(targetDimension?: DimensionType) {
    const worldsList: DimensionType[] = ['inamorta', 'star_wars', 'mustafar', 'hoth', 'multiverse', 'cyberpunk'];
    const curIdx = worldsList.indexOf(this.state.dimension);
    const nextDim = targetDimension || worldsList[(curIdx + 1) % worldsList.length];
    this.state.dimension = nextDim;
    this.state.screenShake = 2.5;

    soundFx.playPortalWarp();

    let themeColor = '#eab308';
    let bannerText = '🏰 КОРОЛЕВСТВО ИНАМОРТА!';
    if (nextDim === 'star_wars') {
      themeColor = '#38bdf8';
      bannerText = '🌌 ЗВЁЗДНЫЕ ВОЙНЫ: ТАТУИН & ЗВЕЗДА СМЕРТИ!';
    } else if (nextDim === 'mustafar') {
      themeColor = '#ef4444';
      bannerText = '🌋 МУСТАФАР — ЛАВОВЫЙ МИР СИТХОВ!';
    } else if (nextDim === 'hoth') {
      themeColor = '#06b6d4';
      bannerText = '❄️ ХОТ — ЛЕДЯНАЯ БАЗА ПОВСТАНЦЕВ!';
    } else if (nextDim === 'multiverse') {
      themeColor = '#8b5cf6';
      bannerText = '⚡ МУЛЬТИВСЕЛЕННАЯ: МСТИТЕЛИ & АВТОБОТЫ!';
    } else if (nextDim === 'cyberpunk') {
      themeColor = '#ec4899';
      bannerText = '🌆 НЕО-ТОКИО КИБЕРПАНК 2099!';
    }

    // Portal warp particles
    for (let i = 0; i < 40; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 30 + Math.random() * 120;
      this.state.particles.push({
        x: this.canvasWidth * 0.5 + Math.cos(angle) * dist,
        y: this.canvasHeight * 0.5 + Math.sin(angle) * dist,
        vx: Math.cos(angle) * 120,
        vy: Math.sin(angle) * 120,
        color: themeColor,
        radius: 4 + Math.random() * 4,
        alpha: 1.0,
        life: 0.8,
        maxLife: 0.8,
        type: 'portal',
      });
    }

    this.state.floatingTexts.push({
      id: 'ft_dim_' + Math.random(),
      text: bannerText,
      x: this.canvasWidth * 0.5,
      y: 200,
      color: themeColor,
      size: 24,
      life: 3.0,
      maxLife: 3.0,
      vy: -10,
      isCrit: true,
    });

    this.notify();
  }

  // ==================== WAVE MANAGEMENT ====================

  public prepareWave(waveNumber: number) {
    const waveData = generateWave(waveNumber, this.state.dimension, this.state.difficulty);
    this.state.waveState = 'prep';
    this.state.prepTimer = 3.5;
    this.state.spawnQueue = [...waveData.spawnQueue];
    this.state.spawnInterval = waveData.spawnInterval;
    this.state.spawnTimer = 0.5;
    this.state.totalZombiesInWave = waveData.totalZombies;
    this.state.currentZombiesAlive = 0;
    this.state.isBossWave = waveData.isBossWave;
    this.state.stats.wave = waveNumber;

    if (waveData.isBossWave) {
      soundFx.playBossRoar();
    } else {
      soundFx.playWaveStart();
    }

    this.notify();
  }

  // ==================== SUMMONING & UPGRADES ====================

  public summonWarrior(type: WarriorType): boolean {
    const config = WARRIOR_CONFIGS[type];
    let actualCost = config.cost;
    
    // Leaf Skin discount perk (-15%)
    if (this.state.activeSkin === 'leaf') {
      actualCost = Math.round(actualCost * 0.85);
    }

    if (this.state.stats.gold < actualCost) return false;
    if (this.state.summonCooldowns[type] > 0) return false;
    if (this.state.waveState === 'game_over') return false;

    // Deduct gold
    this.state.stats.gold -= actualCost;
    this.state.summonCooldowns[type] = config.summonCooldown;
    this.state.stats.warriorsSummoned++;

    // Audio & Special SFX on summon
    if (type === 'iron_man' || type === 'bumblebee') {
      soundFx.playLaserShot();
    } else if (type === 'optimus') {
      soundFx.playTransformerSound();
    } else if (type === 'thor') {
      soundFx.playThunderSlam();
    } else if (type === 'captain') {
      soundFx.playShieldThrow();
    } else if (type === 'soldier') {
      soundFx.playMachineGun();
    } else if (type === 'tank') {
      soundFx.playTankShot();
    } else {
      soundFx.playSummon();
    }

    // Calculate stats based on Tier
    const tier = this.state.warriorTiers[type] || 1;
    const tierMultiplier = 1 + (tier - 1) * 0.35;

    // Skin bonuses
    let skinSpeedBonus = 1.0;
    let skinArmorBonus = 0;
    let skinCritBonus = 0.15;

    if (this.state.activeSkin === 'leaf') skinSpeedBonus = 1.2;
    if (this.state.activeSkin === 'classic') skinArmorBonus = 0.1;
    if (this.state.activeSkin === 'avenger') skinCritBonus = 0.35;

    const laneY = 390 + Math.random() * 140;

    const newWarrior: Warrior = {
      id: 'w_' + Math.random().toString(36).substring(2, 9),
      type,
      tier,
      name: config.tierNames[tier - 1],
      x: 95,
      y: laneY,
      width: type === 'tank' ? 76 : ((type === 'hulk' || type === 'optimus') ? 48 : (type === 'knight' ? 36 : 32)),
      height: type === 'tank' ? 44 : ((type === 'hulk' || type === 'optimus') ? 56 : (type === 'soldier' ? 46 : 48)),
      hp: Math.round(config.baseHp * tierMultiplier),
      maxHp: Math.round(config.baseHp * tierMultiplier),
      damage: Math.round(config.baseDmg * tierMultiplier),
      attackRange: config.baseRange,
      attackCooldown: config.attackCooldown * (this.state.activeSkin === 'savage' ? 0.75 : 1.0),
      attackTimer: 0,
      speed: Math.round(config.baseSpeed * skinSpeedBonus),
      state: 'walk',
      stateTimer: 0,
      animFrame: 0,
      animTimer: 0,
      targetId: null,
      armor: (type === 'tank' ? 0.45 : (type === 'knight' ? 0.25 : (type === 'captain' ? 0.4 : 0))) + skinArmorBonus,
      critChance: skinCritBonus,
      splashRadius: type === 'tank' ? 85 : ((type === 'mage' || type === 'thor' || type === 'hulk') ? 70 : 0),
      isFlying: type === 'iron_man',
      skin: this.state.activeSkin,
    };

    this.state.warriors.push(newWarrior);

    // Summon Dust / Warp Particles
    for (let i = 0; i < 6; i++) {
      this.state.particles.push({
        x: newWarrior.x,
        y: newWarrior.y,
        vx: (Math.random() - 0.5) * 40,
        vy: -20 - Math.random() * 30,
        color: config.dimension === 'multiverse' ? '#38bdf8' : '#f59e0b',
        radius: 3 + Math.random() * 2,
        alpha: 1.0,
        life: 0.4,
        maxLife: 0.4,
        type: 'magic',
      });
    }

    this.notify();
    return true;
  }

  // ==================== OBSTACLES & FORTIFICATIONS ====================

  public setObstacleAim(type: ObstacleType | null) {
    this.state.activeObstacleAim = type;
    this.notify();
  }

  public placeObstacle(type: ObstacleType, targetX?: number, targetY?: number): boolean {
    const config = OBSTACLE_CONFIGS[type];
    if (this.state.stats.gold < config.cost) return false;
    if (this.state.obstacleCooldowns[type] > 0) return false;
    if (this.state.waveState === 'game_over') return false;

    // Deduct gold & set cooldown
    this.state.stats.gold -= config.cost;
    this.state.obstacleCooldowns[type] = config.cooldown;
    this.state.activeObstacleAim = null;

    let x = targetX;
    let y = targetY;

    if (x === undefined || y === undefined) {
      if (type === 'trench') {
        const existingCount = this.state.obstacles.filter(o => o.type === 'trench').length;
        x = 220 + existingCount * 85;
        y = 440 + (existingCount % 2) * 40;
      } else if (type === 'barricade') {
        const existingCount = this.state.obstacles.filter(o => o.type === 'barricade').length;
        x = 265 + existingCount * 70;
        y = 430 + ((existingCount * 28) % 65);
      } else {
        // Landmine in skirmish zone
        x = 310 + Math.random() * 260;
        y = 405 + Math.random() * 115;
      }
    }

    // Clamp coordinates
    x = Math.max(160, Math.min(this.canvasWidth - 140, x));
    y = Math.max(380, Math.min(this.canvasHeight - 55, y));

    const newObstacle: Obstacle = {
      id: 'obs_' + Math.random().toString(36).substring(2, 9),
      type,
      name: config.nameRu,
      x,
      y,
      width: config.width,
      height: config.height,
      hp: config.hp,
      maxHp: config.hp,
      damage: config.damage,
      cost: config.cost,
      isArmed: true,
    };

    this.state.obstacles.push(newObstacle);
    soundFx.playBuildObstacle();

    // Dust particles
    for (let i = 0; i < 8; i++) {
      this.state.particles.push({
        x: x + (Math.random() - 0.5) * config.width,
        y: y + (Math.random() - 0.5) * config.height,
        vx: (Math.random() - 0.5) * 40,
        vy: -Math.random() * 35,
        color: type === 'landmine' ? '#f59e0b' : '#78716c',
        radius: 2.5 + Math.random() * 2,
        alpha: 0.9,
        life: 0.4,
        maxLife: 0.4,
        type: 'smoke',
      });
    }

    this.state.floatingTexts.push({
      id: 'ft_obs_' + Math.random(),
      text: `${config.icon} ${config.nameRu}`,
      x,
      y: y - 25,
      color: '#38bdf8',
      size: 15,
      life: 1.0,
      maxLife: 1.0,
      vy: -20,
    });

    this.notify();
    return true;
  }

  public upgradeWarriorTier(type: WarriorType): boolean {
    const currentTier = this.state.warriorTiers[type] || 1;
    if (currentTier >= 3) return false;

    const config = WARRIOR_CONFIGS[type];
    const cost = currentTier === 1 ? config.upgradeCostTier2 : config.upgradeCostTier3;

    if (this.state.stats.gold < cost) return false;

    this.state.stats.gold -= cost;
    this.state.warriorTiers[type] = currentTier + 1;

    // Apply upgrade retroactively to existing alive warriors of that type
    const newTier = currentTier + 1;
    const tierMultiplier = 1 + (newTier - 1) * 0.35;
    for (const w of this.state.warriors) {
      if (w.type === type) {
        w.tier = newTier;
        w.name = config.tierNames[newTier - 1];
        const prevMax = w.maxHp;
        w.maxHp = Math.round(config.baseHp * tierMultiplier);
        w.hp = Math.min(w.maxHp, w.hp + (w.maxHp - prevMax));
        w.damage = Math.round(config.baseDmg * tierMultiplier);
      }
    }

    soundFx.playUpgrade();
    this.notify();
    return true;
  }

  public upgradeCastle(): boolean {
    const currentLvl = this.state.castle.level;
    if (currentLvl >= 5) return false;

    const nextInfo = CASTLE_LEVELS[currentLvl];
    if (!nextInfo || this.state.stats.gold < nextInfo.cost) return false;

    this.state.stats.gold -= nextInfo.cost;
    this.state.castle.level = currentLvl + 1;
    this.state.castle.maxHp += nextInfo.hpBonus;
    this.state.castle.hp += nextInfo.hpBonus;

    if (this.state.castle.level >= 4) {
      this.state.castle.spikesActive = true;
    }

    soundFx.playUpgrade();
    this.notify();
    return true;
  }

  // ==================== ABILITIES ====================

  public triggerAbility(id: 'fire_rain' | 'freeze' | 'lightning', targetPoint?: { x: number; y: number }): boolean {
    const ability = this.state.abilities.find(a => a.id === id);
    if (!ability || ability.currentCooldown > 0) return false;

    if (id === 'fire_rain') {
      const tx = targetPoint ? targetPoint.x : this.canvasWidth * 0.6;
      const ty = targetPoint ? targetPoint.y : this.canvasHeight * 0.65;

      soundFx.playExplosion(1.0);
      this.state.screenShake = 1.8;

      for (let i = 0; i < 8; i++) {
        setTimeout(() => {
          const offsetX = (Math.random() - 0.5) * 140;
          const offsetY = (Math.random() - 0.5) * 90;
          this.state.particles.push({
            x: tx + offsetX,
            y: ty + offsetY,
            vx: 0,
            vy: 0,
            color: '#ef4444',
            radius: 50,
            alpha: 1.0,
            life: 0.5,
            maxLife: 0.5,
            type: 'explosion',
          });

          for (const z of this.state.zombies) {
            const dist = Math.hypot(z.x - (tx + offsetX), z.y - (ty + offsetY));
            if (dist <= 65) {
              this.damageZombie(z, 90, true);
            }
          }
        }, i * 70);
      }

      ability.currentCooldown = ability.cooldown;
      this.notify();
      return true;
    }

    if (id === 'freeze') {
      soundFx.playFreeze();
      this.state.isFreezeActive = true;
      this.state.freezeDuration = 5.5;

      for (const z of this.state.zombies) {
        z.isFrozen = true;
        z.freezeTimer = 5.5;
      }

      ability.currentCooldown = ability.cooldown;
      this.notify();
      return true;
    }

    if (id === 'lightning') {
      soundFx.playLightning();
      this.state.screenShake = 1.5;

      let strongestZombie: Zombie | null = null;
      let highestHp = 0;
      for (const z of this.state.zombies) {
        if (z.hp > highestHp) {
          highestHp = z.hp;
          strongestZombie = z;
        }
      }

      if (strongestZombie) {
        this.damageZombie(strongestZombie, 500, true);

        for (let i = 0; i < 15; i++) {
          this.state.particles.push({
            x: strongestZombie.x + (Math.random() - 0.5) * 20,
            y: strongestZombie.y - (i * 25),
            vx: (Math.random() - 0.5) * 60,
            vy: 40,
            color: '#67e8f9',
            radius: 3 + Math.random() * 3,
            alpha: 1.0,
            life: 0.35,
            maxLife: 0.35,
            type: 'lightning',
          });
        }
      }

      ability.currentCooldown = ability.cooldown;
      this.notify();
      return true;
    }

    return false;
  }

  // ==================== MAIN UPDATE TICK ====================

  public update(dt: number) {
    if (this.state.waveState === 'game_over') return;

    const effectiveDt = dt * this.state.gameSpeed;
    if (effectiveDt <= 0) return;

    // 1. Passive gold generation
    this.state.stats.gold += PASSIVE_GOLD_RATE * effectiveDt;
    this.state.stats.totalGoldEarned += PASSIVE_GOLD_RATE * effectiveDt;

    // 2. Cooldowns tick
    for (const type of Object.keys(this.state.summonCooldowns) as WarriorType[]) {
      if (this.state.summonCooldowns[type] > 0) {
        this.state.summonCooldowns[type] = Math.max(0, this.state.summonCooldowns[type] - effectiveDt);
      }
    }

    for (const ability of this.state.abilities) {
      if (ability.currentCooldown > 0) {
        ability.currentCooldown = Math.max(0, ability.currentCooldown - effectiveDt);
      }
    }

    for (const obsType of Object.keys(this.state.obstacleCooldowns) as ObstacleType[]) {
      if (this.state.obstacleCooldowns[obsType] > 0) {
        this.state.obstacleCooldowns[obsType] = Math.max(0, this.state.obstacleCooldowns[obsType] - effectiveDt);
      }
    }

    // 3. Freeze duration
    if (this.state.isFreezeActive) {
      this.state.freezeDuration -= effectiveDt;
      if (this.state.freezeDuration <= 0) {
        this.state.isFreezeActive = false;
        for (const z of this.state.zombies) {
          z.isFrozen = false;
        }
      }
    }

    // 4. Screen shake decay
    if (this.state.screenShake > 0) {
      this.state.screenShake = Math.max(0, this.state.screenShake - effectiveDt * 3.5);
    }

    // 5. Boss Defeated alert banner timer
    if (this.state.bossDefeatedAlert) {
      this.state.bossDefeatedTimer -= effectiveDt;
      if (this.state.bossDefeatedTimer <= 0) {
        this.state.bossDefeatedAlert = false;
      }
    }

    // 6. Castle passive features
    this.updateCastle(effectiveDt);

    // 7. Wave State & Spawning
    this.updateWave(effectiveDt);

    // 8. Update Warriors
    this.updateWarriors(effectiveDt);

    // 9. Update Zombies
    this.updateZombies(effectiveDt);

    // 10. Update Projectiles
    this.updateProjectiles(effectiveDt);

    // 11. Update Particles
    this.updateParticles(effectiveDt);

    // 12. Update Floating Texts
    this.updateFloatingTexts(effectiveDt);

    // 13. Clean up dead entities
    this.state.warriors = this.state.warriors.filter(w => w.hp > 0);
    this.state.zombies = this.state.zombies.filter(z => z.hp > 0);
    this.state.projectiles = this.state.projectiles.filter(p => p.progress < 1.0);
    this.state.particles = this.state.particles.filter(p => p.life > 0);
    this.state.floatingTexts = this.state.floatingTexts.filter(t => t.life > 0);

    this.notify();
  }

  private updateCastle(dt: number) {
    const castle = this.state.castle;

    if (castle.level >= 2 && castle.hp < castle.maxHp) {
      castle.regenTimer += dt;
      if (castle.regenTimer >= 1.0) {
        castle.regenTimer = 0;
        castle.hp = Math.min(castle.maxHp, castle.hp + 5);
      }
    }

    if (castle.level >= 3 && this.state.zombies.length > 0) {
      castle.archerTimer += dt;
      if (castle.archerTimer >= 1.4) {
        castle.archerTimer = 0;
        const target = [...this.state.zombies].sort((a, b) => a.x - b.x)[0];
        if (target && target.x <= 450) {
          soundFx.playBowShoot();
          this.state.projectiles.push({
            id: 'proj_t_' + Math.random(),
            type: 'tower_arrow',
            x: 105,
            y: this.canvasHeight * 0.58 - 165,
            startX: 105,
            startY: this.canvasHeight * 0.58 - 165,
            targetX: target.x,
            targetY: target.y - target.height / 2,
            targetZombieId: target.id,
            damage: 35,
            speed: 650,
            progress: 0,
            arcHeight: 25,
            splashRadius: 0,
          });
        }
      }
    }

    if (castle.level >= 5 && this.state.zombies.length > 0) {
      castle.cannonTimer += dt;
      if (castle.cannonTimer >= 3.2) {
        castle.cannonTimer = 0;
        const target = [...this.state.zombies].sort((a, b) => a.x - b.x)[0];
        if (target) {
          soundFx.playExplosion(0.9);
          this.state.projectiles.push({
            id: 'proj_c_' + Math.random(),
            type: 'cannonball',
            x: 120,
            y: this.canvasHeight * 0.58 - 170,
            startX: 120,
            startY: this.canvasHeight * 0.58 - 170,
            targetX: target.x,
            targetY: target.y,
            targetZombieId: target.id,
            damage: 130,
            speed: 480,
            progress: 0,
            arcHeight: 60,
            splashRadius: 75,
          });
        }
      }
    }
  }

  private updateWave(dt: number) {
    if (this.state.waveState === 'prep') {
      this.state.prepTimer -= dt;
      if (this.state.prepTimer <= 0) {
        this.state.waveState = 'active';
      }
      return;
    }

    if (this.state.waveState === 'active') {
      if (this.state.spawnQueue.length > 0) {
        this.state.spawnTimer -= dt * 1000;
        if (this.state.spawnTimer <= 0) {
          this.state.spawnTimer = this.state.spawnInterval;
          const nextZombieType = this.state.spawnQueue.shift();
          if (nextZombieType) {
            this.spawnZombie(nextZombieType);
          }
        }
      } else {
        if (this.state.zombies.length === 0) {
          this.handleWaveClear();
        }
      }
    }
  }

  private handleWaveClear() {
    this.state.waveState = 'cleared';
    soundFx.playWaveClear();

    const diffCfg = DIFFICULTY_CONFIGS[this.state.difficulty] || DIFFICULTY_CONFIGS.normal;
    const baseReward = 50 + this.state.stats.wave * 25;
    const waveReward = Math.round(baseReward * diffCfg.rewardGoldMult);
    const gemReward = Math.round(5 * diffCfg.rewardGemsMult);

    this.state.stats.gold += waveReward;
    this.state.stats.gems += gemReward;

    this.state.floatingTexts.push({
      id: 'ft_wc_' + Math.random(),
      text: `🎉 ВОЛНА ${this.state.stats.wave} ЗАЧИЩЕНА! +${waveReward} 🪙 +${gemReward} 💎`,
      x: this.canvasWidth * 0.5,
      y: 190,
      color: '#4ade80',
      size: 24,
      life: 3.0,
      maxLife: 3.0,
      vy: -15,
      isCrit: true,
    });

    setTimeout(() => {
      if (this.state.waveState !== 'game_over') {
        this.prepareWave(this.state.stats.wave + 1);
      }
    }, 3500);
  }

  private spawnZombie(type: ZombieType) {
    const base = ZOMBIE_BASE_STATS[type];
    const wave = this.state.stats.wave;
    const diffCfg = DIFFICULTY_CONFIGS[this.state.difficulty] || DIFFICULTY_CONFIGS.normal;

    // Base wave scaling with higher difficulty base
    const waveScale = (1 + (wave - 1) * 0.08) * diffCfg.zombieHpMult;
    const dmgScale = (1 + (wave - 1) * 0.05) * diffCfg.zombieDmgMult;
    const speedScale = diffCfg.zombieSpeedMult;

    const laneY = 385 + Math.random() * 145;

    const isBoss = type === 'boss' || type === 'necro_titan' || type === 'mega_zombietron' || type === 'zombie_thanos' || type === 'undead_dragon';

    const newZombie: Zombie = {
      id: 'z_' + Math.random().toString(36).substring(2, 9),
      type,
      name: base.nameRu,
      x: this.canvasWidth - 70,
      y: laneY,
      width: base.width,
      height: base.height,
      hp: Math.round(base.baseHp * waveScale),
      maxHp: Math.round(base.baseHp * waveScale),
      damage: Math.round(base.baseDmg * dmgScale),
      attackRange: base.attackRange,
      attackCooldown: Math.max(0.65, base.attackCooldown / speedScale),
      attackTimer: 0,
      speed: Math.round(base.baseSpeed * speedScale),
      baseSpeed: Math.round(base.baseSpeed * speedScale),
      state: 'walk',
      stateTimer: 0,
      animFrame: 0,
      animTimer: 0,
      targetId: null,
      armor: base.armor,
      reward: Math.round(base.reward * diffCfg.rewardGoldMult),
      isBoss,
      isFrozen: this.state.isFreezeActive,
      freezeTimer: this.state.isFreezeActive ? this.state.freezeDuration : 0,
    };

    this.state.zombies.push(newZombie);
    this.state.currentZombiesAlive = this.state.zombies.length;

    for (let i = 0; i < 6; i++) {
      this.state.particles.push({
        x: newZombie.x,
        y: newZombie.y,
        vx: -30 - Math.random() * 30,
        vy: (Math.random() - 0.5) * 30,
        color: '#9333ea',
        radius: 4 + Math.random() * 3,
        alpha: 0.8,
        life: 0.5,
        maxLife: 0.5,
        type: 'magic',
      });
    }
  }

  // ==================== COMBAT EXECUTION ====================

  private updateWarriors(dt: number) {
    for (const w of this.state.warriors) {
      if (w.hp <= 0) continue;

      // Trench cover: warriors close to a trench attack faster and take less damage
      const nearTrench = this.state.obstacles.some(o => o.type === 'trench' && o.hp > 0 && Math.abs(o.x - w.x) < 55);
      const attackTimerRate = nearTrench && (w.type === 'soldier' || w.type === 'archer') ? dt * 1.3 : dt;

      w.attackTimer = Math.max(0, w.attackTimer - attackTimerRate);

      if (w.state === 'hit') {
        w.stateTimer -= dt;
        if (w.stateTimer <= 0) w.state = 'walk';
      }

      // Heavy Tank ramming capability
      if (w.type === 'tank') {
        for (const z of this.state.zombies) {
          if (z.hp > 0 && z.x > w.x - 10 && z.x < w.x + 60 && Math.abs(z.y - w.y) < 32) {
            z.x += 12 * dt;
            this.damageZombie(z, Math.round(20 * dt * 60), false);
          }
        }
      }

      const enemiesAhead = this.state.zombies.filter(z => z.x >= w.x - 10);
      enemiesAhead.sort((a, b) => a.x - b.x);
      const closestEnemy = enemiesAhead[0];

      if (closestEnemy) {
        const distance = Math.abs(closestEnemy.x - w.x);

        if (distance <= w.attackRange) {
          w.state = 'attack';

          if (w.attackTimer <= 0) {
            w.attackTimer = w.attackCooldown;
            this.executeWarriorAttack(w, closestEnemy);
          }
          continue;
        }
      }

      w.state = 'walk';
      w.x += w.speed * dt;

      // When reaching portal on the far right, warrior can step in
      if (w.x > this.canvasWidth - 85) {
        w.x = this.canvasWidth - 85;
      }
    }
  }

  private executeWarriorAttack(warrior: Warrior, target: Zombie) {
    const isCrit = Math.random() < warrior.critChance;
    const damage = Math.round(warrior.damage * (isCrit ? 1.8 : 1.0));

    // Star Wars Warriors attacks
    if (warrior.type === 'jedi') {
      soundFx.playSwordSlash();
      this.damageZombie(target, damage, isCrit);
      this.state.particles.push({
        x: target.x,
        y: target.y - 20,
        vx: (Math.random() - 0.5) * 60,
        vy: (Math.random() - 0.5) * 60,
        color: '#38bdf8',
        radius: 4,
        alpha: 1,
        life: 0.35,
        maxLife: 0.35,
        type: 'spark',
      });
    } else if (warrior.type === 'stormtrooper') {
      soundFx.playLaserShot();
      this.state.projectiles.push({
        id: 'p_st_' + Math.random(),
        type: 'blaster_bolt',
        x: warrior.x + 14,
        y: warrior.y - 20,
        startX: warrior.x + 14,
        startY: warrior.y - 20,
        targetX: target.x,
        targetY: target.y - target.height / 2,
        targetZombieId: target.id,
        damage,
        speed: 900,
        progress: 0,
        arcHeight: 0,
        splashRadius: 0,
        isCrit,
      });
    } else if (warrior.type === 'darth_vader') {
      soundFx.playThunderSlam();
      this.state.screenShake = 1.0;
      this.damageZombie(target, damage, isCrit);
      // Dark Side Force Choke AoE
      const others = this.state.zombies.filter(z => z.id !== target.id && Math.abs(z.x - target.x) < 80);
      for (const other of others.slice(0, 3)) {
        this.damageZombie(other, Math.round(damage * 0.5), false);
      }
    } else if (warrior.type === 'yoda') {
      soundFx.playSwordSlash();
      this.damageZombie(target, damage, isCrit);
      // Force push wave
      this.state.projectiles.push({
        id: 'p_yoda_' + Math.random(),
        type: 'force_push_wave',
        x: warrior.x + 10,
        y: warrior.y - 15,
        startX: warrior.x + 10,
        startY: warrior.y - 15,
        targetX: target.x + 30,
        targetY: target.y - 15,
        targetZombieId: target.id,
        damage: Math.round(damage * 0.4),
        speed: 600,
        progress: 0,
        arcHeight: 0,
        splashRadius: 0,
        isCrit,
      });
      target.x += 35;
    } else if (warrior.type === 'mandalorian') {
      soundFx.playLaserShot();
      this.state.projectiles.push({
        id: 'p_mando_' + Math.random(),
        type: 'blaster_bolt',
        x: warrior.x + 16,
        y: warrior.y - 22,
        startX: warrior.x + 16,
        startY: warrior.y - 22,
        targetX: target.x,
        targetY: target.y - target.height / 2,
        targetZombieId: target.id,
        damage,
        speed: 850,
        progress: 0,
        arcHeight: 0,
        splashRadius: 0,
        isCrit,
      });
      if (Math.random() < 0.45) {
        this.state.projectiles.push({
          id: 'p_mando_r_' + Math.random(),
          type: 'mando_rocket',
          x: warrior.x + 10,
          y: warrior.y - 30,
          startX: warrior.x + 10,
          startY: warrior.y - 30,
          targetX: target.x,
          targetY: target.y - 10,
          targetZombieId: target.id,
          damage: Math.round(damage * 0.6),
          speed: 750,
          progress: 0,
          arcHeight: 30,
          splashRadius: 40,
          isCrit: false,
        });
      }
    } else if (warrior.type === 'iron_man') {
      soundFx.playLaserShot();
      this.state.projectiles.push({
        id: 'p_im_' + Math.random(),
        type: 'repulsor_laser',
        x: warrior.x + 18,
        y: warrior.y - 24,
        startX: warrior.x + 18,
        startY: warrior.y - 24,
        targetX: target.x,
        targetY: target.y - target.height / 2,
        targetZombieId: target.id,
        damage,
        speed: 850,
        progress: 0,
        arcHeight: 0,
        splashRadius: 0,
        isCrit,
      });
    } else if (warrior.type === 'captain') {
      soundFx.playShieldThrow();
      this.state.projectiles.push({
        id: 'p_cap_' + Math.random(),
        type: 'vibranium_shield',
        x: warrior.x + 10,
        y: warrior.y - 20,
        startX: warrior.x + 10,
        startY: warrior.y - 20,
        targetX: target.x,
        targetY: target.y - target.height / 2,
        targetZombieId: target.id,
        damage,
        speed: 650,
        progress: 0,
        arcHeight: 20,
        splashRadius: 0,
        isCrit,
        ricochetsLeft: 2,
      });
    } else if (warrior.type === 'thor') {
      soundFx.playThunderSlam();
      this.state.screenShake = 1.2;
      this.damageZombie(target, damage, isCrit);

      // Chain lightning to 2 other zombies
      const others = this.state.zombies.filter(z => z.id !== target.id && Math.abs(z.x - target.x) < 90);
      for (const other of others.slice(0, 2)) {
        this.damageZombie(other, Math.round(damage * 0.65), false);
      }
    } else if (warrior.type === 'optimus') {
      soundFx.playTransformerSound();
      this.damageZombie(target, damage, isCrit);

      // Ion blast shot
      this.state.projectiles.push({
        id: 'p_opt_' + Math.random(),
        type: 'ion_blast',
        x: warrior.x + 20,
        y: warrior.y - 30,
        startX: warrior.x + 20,
        startY: warrior.y - 30,
        targetX: target.x,
        targetY: target.y - 20,
        targetZombieId: target.id,
        damage: Math.round(damage * 0.5),
        speed: 700,
        progress: 0,
        arcHeight: 5,
        splashRadius: 30,
        isCrit,
      });
    } else if (warrior.type === 'bumblebee') {
      soundFx.playLaserShot();
      this.state.projectiles.push({
        id: 'p_bee_' + Math.random(),
        type: 'plasma_stinger',
        x: warrior.x + 14,
        y: warrior.y - 24,
        startX: warrior.x + 14,
        startY: warrior.y - 24,
        targetX: target.x,
        targetY: target.y - target.height / 2,
        targetZombieId: target.id,
        damage,
        speed: 800,
        progress: 0,
        arcHeight: 5,
        splashRadius: 0,
        isCrit,
      });
    } else if (warrior.type === 'hulk') {
      soundFx.playThunderSlam();
      this.state.screenShake = 1.4;
      this.damageZombie(target, damage, isCrit);

      // Seismic ground smash hits all zombies within 80px
      for (const z of this.state.zombies) {
        if (Math.abs(z.x - warrior.x) < 80) {
          this.damageZombie(z, Math.round(damage * 0.5), false);
        }
      }
    } else if (warrior.type === 'archer') {
      soundFx.playBowShoot();
      this.state.projectiles.push({
        id: 'p_a_' + Math.random(),
        type: 'arrow',
        x: warrior.x + 8,
        y: warrior.y - 20,
        startX: warrior.x + 8,
        startY: warrior.y - 20,
        targetX: target.x,
        targetY: target.y - target.height / 2,
        targetZombieId: target.id,
        damage,
        speed: 600,
        progress: 0,
        arcHeight: 20,
        splashRadius: 0,
        isCrit,
      });
    } else if (warrior.type === 'soldier') {
      soundFx.playMachineGun();
      const inTrench = this.state.obstacles.some(o => o.type === 'trench' && o.hp > 0 && Math.abs(o.x - warrior.x) < 55);
      const bulletCount = inTrench ? 3 : 2;

      for (let b = 0; b < bulletCount; b++) {
        setTimeout(() => {
          if (!this.state.zombies.some(z => z.id === target.id)) return;
          this.state.projectiles.push({
            id: 'p_sol_' + Math.random(),
            type: 'bullet',
            x: warrior.x + 14,
            y: warrior.y - 20 + (b - 1) * 3,
            startX: warrior.x + 14,
            startY: warrior.y - 20 + (b - 1) * 3,
            targetX: target.x,
            targetY: target.y - target.height * 0.55 + (Math.random() - 0.5) * 6,
            targetZombieId: target.id,
            damage: Math.round(damage / bulletCount),
            speed: 1100,
            progress: 0,
            arcHeight: 0,
            splashRadius: 0,
            isCrit,
          });
        }, b * 55);
      }
    } else if (warrior.type === 'tank') {
      soundFx.playTankShot();
      this.state.screenShake = 1.3;
      this.state.projectiles.push({
        id: 'p_tank_' + Math.random(),
        type: 'tank_shell',
        x: warrior.x + 42,
        y: warrior.y - 26,
        startX: warrior.x + 42,
        startY: warrior.y - 26,
        targetX: target.x,
        targetY: target.y - target.height * 0.45,
        targetZombieId: target.id,
        damage,
        speed: 680,
        progress: 0,
        arcHeight: 10,
        splashRadius: 85,
        isCrit,
      });
    } else if (warrior.type === 'mage') {
      soundFx.playMagicCast();
      this.state.projectiles.push({
        id: 'p_m_' + Math.random(),
        type: warrior.tier === 3 ? 'fireball' : 'magic_orb',
        x: warrior.x + 12,
        y: warrior.y - 22,
        startX: warrior.x + 12,
        startY: warrior.y - 22,
        targetX: target.x,
        targetY: target.y - target.height / 2,
        targetZombieId: target.id,
        damage,
        speed: 480,
        progress: 0,
        arcHeight: 15,
        splashRadius: warrior.splashRadius || 60,
        isCrit,
      });
    } else {
      // Melee attack
      soundFx.playSwordSlash(isCrit);
      this.damageZombie(target, damage, isCrit);

      for (let i = 0; i < 4; i++) {
        this.state.particles.push({
          x: target.x,
          y: target.y - target.height / 2,
          vx: (Math.random() - 0.5) * 60,
          vy: -Math.random() * 50,
          color: isCrit ? '#fbbf24' : '#ffffff',
          radius: 2 + Math.random() * 2,
          alpha: 1.0,
          life: 0.3,
          maxLife: 0.3,
          type: 'spark',
        });
      }

      if (warrior.type === 'royal_knight') {
        const nearby = this.state.zombies.find(z => z.id !== target.id && Math.abs(z.x - warrior.x) < 55);
        if (nearby) {
          this.damageZombie(nearby, Math.round(damage * 0.7), false);
        }
      }
    }

    // Savage Skin lifesteal (6%)
    if (this.state.activeSkin === 'savage') {
      const heal = Math.max(1, Math.round(damage * 0.06));
      warrior.hp = Math.min(warrior.maxHp, warrior.hp + heal);
    }
  }

  private updateZombies(dt: number) {
    // 1. Detonate active landmines when zombies step on them
    for (const obs of this.state.obstacles) {
      if (obs.type === 'landmine' && obs.hp > 0) {
        const steppingZombie = this.state.zombies.find(
          z => z.hp > 0 && Math.abs(z.x - obs.x) < 32 && Math.abs(z.y - obs.y) < 38
        );
        if (steppingZombie) {
          obs.hp = 0; // Triggered!
          soundFx.playMineExplosion();
          this.state.screenShake = 2.0;

          // Huge fiery explosion particles
          for (let p = 0; p < 24; p++) {
            this.state.particles.push({
              x: obs.x + (Math.random() - 0.5) * 20,
              y: obs.y + (Math.random() - 0.5) * 15,
              vx: (Math.random() - 0.5) * 140,
              vy: -20 - Math.random() * 90,
              color: p % 2 === 0 ? '#ef4444' : (p % 3 === 0 ? '#f59e0b' : '#334155'),
              radius: 3.5 + Math.random() * 3,
              alpha: 1.0,
              life: 0.55,
              maxLife: 0.55,
              type: 'explosion',
            });
          }

          // Damage all zombies in 95px blast radius and concuss survivors
          for (const z of this.state.zombies) {
            if (z.hp > 0 && Math.hypot(z.x - obs.x, z.y - obs.y) < 95) {
              this.damageZombie(z, obs.damage, true);
              z.slowTimer = 2.5;
              z.isSlowed = true;
            }
          }

          this.state.floatingTexts.push({
            id: 'ft_boom_' + Math.random(),
            text: `💥 МИНА! ${obs.damage}`,
            x: obs.x,
            y: obs.y - 30,
            color: '#f87171',
            size: 20,
            life: 1.1,
            maxLife: 1.1,
            vy: -35,
            isCrit: true,
          });
        }
      }
    }

    for (const z of this.state.zombies) {
      if (z.hp <= 0) continue;

      if (z.isFrozen) {
        z.freezeTimer -= dt;
        if (z.freezeTimer <= 0) {
          z.isFrozen = false;
        }
        continue;
      }

      z.attackTimer = Math.max(0, z.attackTimer - dt);

      if (z.state === 'hit') {
        z.stateTimer -= dt;
        if (z.stateTimer <= 0) z.state = 'walk';
      }

      if (z.x <= 135) {
        z.state = 'attack';
        if (z.attackTimer <= 0) {
          z.attackTimer = z.attackCooldown;
          this.attackCastle(z);
        }
        continue;
      }

      // Check if blocked by obstacle (trench or barricade)
      const blockingObstacles = this.state.obstacles.filter(
        obs => (obs.type === 'trench' || obs.type === 'barricade') && obs.hp > 0 && obs.x <= z.x + 12 && Math.abs(z.y - obs.y) < 36
      );
      blockingObstacles.sort((a, b) => b.x - a.x);
      const targetObstacle = blockingObstacles[0];

      if (targetObstacle && Math.abs(z.x - targetObstacle.x) <= z.attackRange + targetObstacle.width * 0.4) {
        z.state = 'attack';
        if (z.attackTimer <= 0) {
          z.attackTimer = z.attackCooldown;
          targetObstacle.hp -= z.damage;
          soundFx.playZombieAttack();

          // Barricade thorns damage reflection
          if (targetObstacle.type === 'barricade') {
            soundFx.playSwordSlash(false);
            this.damageZombie(z, targetObstacle.damage, false);
          }

          this.state.floatingTexts.push({
            id: 'ft_obd_' + Math.random(),
            text: `-${z.damage}`,
            x: targetObstacle.x,
            y: targetObstacle.y - 20,
            color: '#fb923c',
            size: 14,
            life: 0.8,
            maxLife: 0.8,
            vy: -20,
          });

          if (targetObstacle.hp <= 0) {
            targetObstacle.hp = 0;
            soundFx.playCastleDamage();
            for (let i = 0; i < 10; i++) {
              this.state.particles.push({
                x: targetObstacle.x,
                y: targetObstacle.y,
                vx: (Math.random() - 0.5) * 60,
                vy: -Math.random() * 40,
                color: '#78716c',
                radius: 3,
                alpha: 0.9,
                life: 0.45,
                maxLife: 0.45,
                type: 'smoke',
              });
            }
          }
        }
        continue;
      }

      const opposingWarriors = this.state.warriors.filter(w => w.x <= z.x + 10 && w.hp > 0);
      opposingWarriors.sort((a, b) => b.x - a.x);
      const targetWarrior = opposingWarriors[0];

      if (targetWarrior) {
        const dist = Math.abs(z.x - targetWarrior.x);
        if (dist <= z.attackRange) {
          z.state = 'attack';
          if (z.attackTimer <= 0) {
            z.attackTimer = z.attackCooldown;
            this.attackWarrior(z, targetWarrior);
          }
          continue;
        }
      }

      // Check trench mud slowdown: when traversing an active trench
      const inTrench = this.state.obstacles.find(
        o => o.type === 'trench' && o.hp > 0 && Math.abs(z.x - o.x) < 48 && Math.abs(z.y - o.y) < 28
      );

      let effectiveSpeed = z.speed;
      if (inTrench) {
        effectiveSpeed = z.speed * 0.40; // 60% slow down in trench mud!
        if (!z.isSlowed) {
          z.isSlowed = true;
          this.state.floatingTexts.push({
            id: 'ft_slow_' + Math.random(),
            text: '🐌 В ОКОПЕ (-60%)',
            x: z.x,
            y: z.y - z.height - 10,
            color: '#38bdf8',
            size: 13,
            life: 0.7,
            maxLife: 0.7,
            vy: -15,
          });
        }
        z.slowTimer = 0.6;

        // Trudging mud/dust particles
        if (Math.random() < 0.25) {
          this.state.particles.push({
            x: z.x + (Math.random() - 0.5) * 14,
            y: z.y,
            vx: (Math.random() - 0.5) * 20,
            vy: -Math.random() * 20,
            color: '#6b4f35',
            radius: 2.5 + Math.random() * 2,
            alpha: 0.85,
            life: 0.35,
            maxLife: 0.35,
            type: 'smoke',
          });
        }
      } else if (z.slowTimer && z.slowTimer > 0) {
        z.slowTimer -= dt;
        effectiveSpeed = z.speed * 0.55;
        if (z.slowTimer <= 0) {
          z.isSlowed = false;
        }
      } else {
        z.isSlowed = false;
      }

      z.state = 'walk';
      z.x -= effectiveSpeed * dt;
    }

    // Clean up destroyed obstacles
    this.state.obstacles = this.state.obstacles.filter(o => o.hp > 0);
  }

  private attackCastle(zombie: Zombie) {
    soundFx.playCastleDamage();
    this.state.screenShake = 1.0;

    this.state.castle.hp -= zombie.damage;

    this.state.floatingTexts.push({
      id: 'ft_c_' + Math.random(),
      text: `-${zombie.damage}`,
      x: 135,
      y: this.canvasHeight * 0.58,
      color: '#ef4444',
      size: 18,
      life: 1.0,
      maxLife: 1.0,
      vy: -25,
      isCrit: true,
    });

    if (this.state.castle.spikesActive) {
      this.damageZombie(zombie, 25, false);
    }

    if (this.state.castle.hp <= 0) {
      this.state.castle.hp = 0;
      this.handleGameOver();
    }
  }

  private attackWarrior(zombie: Zombie, warrior: Warrior) {
    soundFx.playZombieAttack();

    // Trench defense: warriors standing close to a trench receive 45% additional defense
    const nearTrench = this.state.obstacles.some(o => o.type === 'trench' && o.hp > 0 && Math.abs(o.x - warrior.x) < 55);
    const trenchArmorBonus = nearTrench ? 0.45 : 0;
    const effectiveArmor = Math.min(0.85, warrior.armor + trenchArmorBonus);

    const finalDamage = Math.max(1, Math.round(zombie.damage * (1 - effectiveArmor)));
    warrior.hp -= finalDamage;
    warrior.state = 'hit';
    warrior.stateTimer = 0.15;

    this.state.floatingTexts.push({
      id: 'ft_w_' + Math.random(),
      text: `-${finalDamage}`,
      x: warrior.x,
      y: warrior.y - warrior.height - 10,
      color: '#f87171',
      size: 15,
      life: 0.9,
      maxLife: 0.9,
      vy: -25,
    });

    if (warrior.hp <= 0) {
      for (let i = 0; i < 6; i++) {
        this.state.particles.push({
          x: warrior.x,
          y: warrior.y - 15,
          vx: (Math.random() - 0.5) * 50,
          vy: -Math.random() * 40,
          color: '#e2e8f0',
          radius: 3,
          alpha: 0.8,
          life: 0.4,
          maxLife: 0.4,
          type: 'smoke',
        });
      }
    }
  }

  private damageZombie(zombie: Zombie, rawDamage: number, isCrit: boolean) {
    const finalDamage = Math.max(1, Math.round(rawDamage * (1 - zombie.armor)));
    zombie.hp -= finalDamage;
    zombie.state = 'hit';
    zombie.stateTimer = 0.15;

    // Ice skin slows zombie
    if (this.state.activeSkin === 'ice') {
      zombie.speed = zombie.baseSpeed * 0.65;
    }

    this.state.floatingTexts.push({
      id: 'ft_z_' + Math.random(),
      text: isCrit ? `💥 ${finalDamage}` : `${finalDamage}`,
      x: zombie.x,
      y: zombie.y - zombie.height - 10,
      color: isCrit ? '#facc15' : '#ffffff',
      size: isCrit ? 19 : 15,
      life: 0.85,
      maxLife: 0.85,
      vy: -30,
      isCrit,
    });

    if (zombie.hp <= 0) {
      this.handleZombieKill(zombie);
    }
  }

  private handleZombieKill(zombie: Zombie) {
    this.state.stats.zombiesKilled++;
    this.state.stats.gold += zombie.reward;
    this.state.stats.totalGoldEarned += zombie.reward;
    this.state.stats.score += zombie.reward * 10 * this.state.stats.wave;

    soundFx.playZombieDeath(zombie.isBoss);
    soundFx.playCoin();

    this.state.floatingTexts.push({
      id: 'ft_g_' + Math.random(),
      text: `+${zombie.reward} 🪙`,
      x: zombie.x,
      y: zombie.y - zombie.height - 25,
      color: '#fbbf24',
      size: 16,
      life: 1.2,
      maxLife: 1.2,
      vy: -20,
    });

    for (let i = 0; i < 3; i++) {
      this.state.particles.push({
        x: zombie.x + (Math.random() - 0.5) * 20,
        y: zombie.y - 20,
        vx: (Math.random() - 0.5) * 40,
        vy: -40 - Math.random() * 30,
        color: '#fbbf24',
        radius: 3,
        alpha: 1.0,
        life: 0.6,
        maxLife: 0.6,
        type: 'coin',
      });
    }

    if (zombie.isBoss) {
      this.state.stats.bossesDefeated++;
      const bossBonus = 120;
      this.state.stats.gold += bossBonus;
      this.state.stats.gems += 20;
      this.state.stats.crowns += 1;
      this.state.bossDefeatedAlert = true;
      this.state.bossDefeatedTimer = 4.0;
      this.state.screenShake = 2.0;
      soundFx.playVictory();

      this.state.floatingTexts.push({
        id: 'ft_b_' + Math.random(),
        text: `👑 БОСС ПОВЕРЖЕН! +${zombie.reward + bossBonus} ЗОЛОТА! +20 💎`,
        x: this.canvasWidth * 0.5,
        y: 180,
        color: '#f59e0b',
        size: 28,
        life: 3.5,
        maxLife: 3.5,
        vy: -15,
        isCrit: true,
      });
    }
  }

  private updateProjectiles(dt: number) {
    for (const p of this.state.projectiles) {
      p.progress += (p.speed / 400) * dt;
      if (p.progress >= 1.0) {
        p.progress = 1.0;
        this.impactProjectile(p);
      } else {
        p.x = p.startX + (p.targetX - p.startX) * p.progress;
        const straightY = p.startY + (p.targetY - p.startY) * p.progress;
        const arc = Math.sin(p.progress * Math.PI) * p.arcHeight;
        p.y = straightY - arc;
      }
    }
  }

  private impactProjectile(p: Projectile) {
    if (p.type === 'vibranium_shield' && p.ricochetsLeft && p.ricochetsLeft > 0) {
      // Ricochet to next enemy
      let nextTarget = this.state.zombies.find(z => z.id !== p.targetZombieId && z.hp > 0);
      if (nextTarget) {
        this.damageZombie(nextTarget, p.damage, !!p.isCrit);
        p.targetZombieId = nextTarget.id;
        p.startX = p.targetX;
        p.startY = p.targetY;
        p.targetX = nextTarget.x;
        p.targetY = nextTarget.y - 20;
        p.progress = 0;
        p.ricochetsLeft--;
        soundFx.playShieldThrow();
        return;
      }
    }

    if (
      p.type === 'arrow' ||
      p.type === 'tower_arrow' ||
      p.type === 'repulsor_laser' ||
      p.type === 'plasma_stinger' ||
      p.type === 'vibranium_shield' ||
      p.type === 'bullet' ||
      p.type === 'blaster_bolt' ||
      p.type === 'lightsaber_throw' ||
      p.type === 'force_push_wave'
    ) {
      soundFx.playArrowHit();
      let target = this.state.zombies.find(z => z.id === p.targetZombieId);
      if (!target || target.hp <= 0) {
        target = this.state.zombies.find(z => Math.hypot(z.x - p.targetX, z.y - p.targetY) < 30);
      }
      if (target) {
        this.damageZombie(target, p.damage, !!p.isCrit);
      }
    } else if (
      p.type === 'magic_orb' ||
      p.type === 'fireball' ||
      p.type === 'cannonball' ||
      p.type === 'ion_blast' ||
      p.type === 'tank_shell' ||
      p.type === 'mando_rocket'
    ) {
      if (p.type === 'tank_shell' || p.type === 'mando_rocket') {
        soundFx.playMineExplosion();
        this.state.screenShake = 1.3;
      } else {
        soundFx.playExplosion(p.type === 'cannonball' ? 1.0 : 0.7);
      }

      this.state.particles.push({
        x: p.targetX,
        y: p.targetY,
        vx: 0,
        vy: 0,
        color: p.type === 'tank_shell' ? '#f59e0b' : (p.type === 'fireball' ? '#f97316' : '#60a5fa'),
        radius: p.splashRadius,
        alpha: 1.0,
        life: 0.45,
        maxLife: 0.45,
        type: 'explosion',
      });

      for (const z of this.state.zombies) {
        const dist = Math.hypot(z.x - p.targetX, z.y - p.targetY);
        if (dist <= p.splashRadius) {
          this.damageZombie(z, p.damage, !!p.isCrit);
        }
      }
    }
  }

  private updateParticles(dt: number) {
    for (const p of this.state.particles) {
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.alpha = Math.max(0, p.life / p.maxLife);
    }
  }

  private updateFloatingTexts(dt: number) {
    for (const t of this.state.floatingTexts) {
      t.life -= dt;
      t.y += t.vy * dt;
    }
  }

  private handleGameOver() {
    this.state.waveState = 'game_over';
    soundFx.playGameOver();

    if (this.state.stats.score > this.state.stats.highScore) {
      this.state.stats.highScore = this.state.stats.score;
      if (typeof window !== 'undefined') {
        localStorage.setItem('avz_highscore', String(this.state.stats.score));
      }
    }

    this.notify();
  }

  public restartGame() {
    const highScore = this.state.stats.highScore;
    const currentDifficulty = this.state.difficulty;

    this.state = {
      dimension: 'inamorta',
      difficulty: currentDifficulty,
      activeSkin: this.state.activeSkin,
      portalReady: true,
      castle: {
        hp: INITIAL_CASTLE_HP,
        maxHp: INITIAL_CASTLE_HP,
        level: 1,
        archerTimer: 0,
        cannonTimer: 0,
        regenTimer: 0,
        spikesActive: false,
      },
      warriors: [],
      zombies: [],
      obstacles: getDefaultObstacles(),
      obstacleCooldowns: {
        landmine: 0,
        trench: 0,
        barricade: 0,
      },
      activeObstacleAim: null,
      projectiles: [],
      particles: [],
      floatingTexts: [],
      abilities: JSON.parse(JSON.stringify(INITIAL_ABILITIES)),
      stats: {
        wave: 1,
        zombiesKilled: 0,
        score: 0,
        highScore,
        gold: INITIAL_GOLD,
        totalGoldEarned: INITIAL_GOLD,
        gems: this.state.stats.gems,
        crowns: this.state.stats.crowns,
        bossesDefeated: 0,
        warriorsSummoned: 0,
      },
      warriorTiers: {
        swordsman: 1,
        archer: 1,
        knight: 1,
        barbarian: 1,
        mage: 1,
        royal_knight: 1,
        jedi: 1,
        stormtrooper: 1,
        darth_vader: 1,
        yoda: 1,
        mandalorian: 1,
        iron_man: 1,
        captain: 1,
        thor: 1,
        optimus: 1,
        bumblebee: 1,
        hulk: 1,
        soldier: 1,
        tank: 1,
      },
      summonCooldowns: {
        swordsman: 0,
        archer: 0,
        knight: 0,
        barbarian: 0,
        mage: 0,
        royal_knight: 0,
        jedi: 0,
        stormtrooper: 0,
        darth_vader: 0,
        yoda: 0,
        mandalorian: 0,
        iron_man: 0,
        captain: 0,
        thor: 0,
        optimus: 0,
        bumblebee: 0,
        hulk: 0,
        soldier: 0,
        tank: 0,
      },
      waveState: 'prep',
      prepTimer: 3.5,
      spawnQueue: [],
      spawnTimer: 0,
      spawnInterval: 2000,
      totalZombiesInWave: 0,
      currentZombiesAlive: 0,
      isBossWave: false,
      bossDefeatedAlert: false,
      bossDefeatedTimer: 0,
      isFreezeActive: false,
      freezeDuration: 0,
      fireRainAiming: false,
      gameSpeed: 1,
      screenShake: 0,
    };

    this.prepareWave(1);
    this.notify();
  }

  public startCampaignLevel(levelId: number, difficulty: DifficultyType = 'normal') {
    const level = CAMPAIGN_LEVELS.find(l => l.id === levelId);
    if (!level) return;

    this.state.difficulty = difficulty;
    this.state.dimension = level.dimension;
    this.state.castle.hp = this.state.castle.maxHp;
    this.state.warriors = [];
    this.state.zombies = [];
    this.state.projectiles = [];
    this.state.particles = [];
    this.state.floatingTexts = [];
    this.state.stats.wave = levelId;

    // Bonus starter gold based on difficulty
    const starterGold = difficulty === 'nightmare' ? 450 : (difficulty === 'insane' ? 350 : (difficulty === 'hard' ? 250 : 200));
    this.state.stats.gold = Math.max(this.state.stats.gold, starterGold);

    this.prepareWave(levelId);

    // Floating announcement
    this.state.floatingTexts.push({
      id: 'ft_camp_' + Math.random(),
      text: `⚔️ УРОВЕНЬ ${levelId}: ${level.titleRu.toUpperCase()}`,
      x: this.canvasWidth * 0.5,
      y: 180,
      color: level.dimension === 'multiverse' ? '#38bdf8' : '#f59e0b',
      size: 24,
      life: 3.5,
      maxLife: 3.5,
      vy: -15,
      isCrit: true,
    });

    soundFx.playWaveStart();
    this.notify();
  }

  public startTournamentDuel(opponentName: string, round: number) {
    this.state.castle.hp = this.state.castle.maxHp;
    this.state.warriors = [];
    this.state.zombies = [];
    this.state.projectiles = [];
    this.state.particles = [];
    this.state.floatingTexts = [];
    this.state.stats.wave = round * 3;

    // Tournament starter gold
    this.state.stats.gold = Math.max(this.state.stats.gold, 300 + round * 100);

    // Prepare intense wave
    this.prepareWave(Math.max(3, round * 3));

    this.state.floatingTexts.push({
      id: 'ft_tourn_' + Math.random(),
      text: `🏆 ТУРНИР РАУНД ${round}: ПРОТИВ ${opponentName.toUpperCase()}!`,
      x: this.canvasWidth * 0.5,
      y: 180,
      color: '#fbbf24',
      size: 24,
      life: 3.5,
      maxLife: 3.5,
      vy: -15,
      isCrit: true,
    });

    soundFx.playWaveStart();
    this.notify();
  }

  private notify() {
    if (this.onStateChange) {
      this.onStateChange({ ...this.state });
    }
  }
}
