import { 
  WarriorConfig, 
  CastleLevelInfo, 
  Ability, 
  ZombieType, 
  WarriorType,
  SkinDefinition,
  CampaignLevel,
  TournamentAILeader,
  DifficultyType,
  ObstacleType
} from '../types';

export const INITIAL_GOLD = 180;
export const PASSIVE_GOLD_RATE = 2.5; // gold per second
export const INITIAL_CASTLE_HP = 1000;

export interface DifficultyConfig {
  id: DifficultyType;
  nameRu: string;
  nameEn: string;
  badge: string;
  color: string;
  zombieHpMult: number;
  zombieDmgMult: number;
  zombieSpeedMult: number;
  spawnRateMult: number; // multiplier on spawn frequency (higher = faster waves)
  hordeSizeMult: number; // multiplier on number of zombies in wave
  rewardGoldMult: number;
  rewardGemsMult: number;
  descriptionRu: string;
}

export const DIFFICULTY_CONFIGS: Record<DifficultyType, DifficultyConfig> = {
  normal: {
    id: 'normal',
    nameRu: 'Обычная',
    nameEn: 'Normal',
    badge: '🛡️ Обычная',
    color: '#10b981',
    zombieHpMult: 1.0,
    zombieDmgMult: 1.0,
    zombieSpeedMult: 1.0,
    spawnRateMult: 1.0,
    hordeSizeMult: 1.0,
    rewardGoldMult: 1.0,
    rewardGemsMult: 1.0,
    descriptionRu: 'Классический баланс для размеренной тактической игры.',
  },
  hard: {
    id: 'hard',
    nameRu: 'Сложная',
    nameEn: 'Hard',
    badge: '⚔️ Сложно',
    color: '#f59e0b',
    zombieHpMult: 1.35,
    zombieDmgMult: 1.3,
    zombieSpeedMult: 1.15,
    spawnRateMult: 1.25,
    hordeSizeMult: 1.25,
    rewardGoldMult: 1.5,
    rewardGemsMult: 1.5,
    descriptionRu: '+35% HP и +30% урона зомби, учащённый спавн, +50% награды.',
  },
  insane: {
    id: 'insane',
    nameRu: 'Безумие',
    nameEn: 'Insane',
    badge: '💀 Безумие',
    color: '#ef4444',
    zombieHpMult: 1.8,
    zombieDmgMult: 1.7,
    zombieSpeedMult: 1.3,
    spawnRateMult: 1.5,
    hordeSizeMult: 1.5,
    rewardGoldMult: 2.2,
    rewardGemsMult: 2.0,
    descriptionRu: '+80% HP, +70% урона, стремительный бег зомби и удвоенные награды.',
  },
  nightmare: {
    id: 'nightmare',
    nameRu: 'Кошмар Инаморты',
    nameEn: 'Nightmare',
    badge: '☠️ КОШМАР',
    color: '#a855f7',
    zombieHpMult: 2.5,
    zombieDmgMult: 2.4,
    zombieSpeedMult: 1.45,
    spawnRateMult: 1.8,
    hordeSizeMult: 1.8,
    rewardGoldMult: 3.5,
    rewardGemsMult: 3.0,
    descriptionRu: 'Ультимативный хардкор! Орда гигантов, бешеная скорость, утроенная награда!',
  },
};

export const WARRIOR_CONFIGS: Record<WarriorType, WarriorConfig> = {
  // ==================== INAMORTA WARRIORS ====================
  swordsman: {
    type: 'swordsman',
    nameRu: 'Мечник',
    nameEn: 'Swordsman',
    tierNames: ['Мечник', 'Ветеран', 'Элитный мечник'],
    cost: 30,
    summonCooldown: 2.0,
    icon: '⚔️',
    baseHp: 120,
    baseDmg: 18,
    baseRange: 35,
    baseSpeed: 50,
    attackCooldown: 1.0,
    role: 'melee',
    dimension: 'inamorta',
    description: 'Ближний бой, сбалансированные здоровье и урон.',
    upgradeCostTier2: 120,
    upgradeCostTier3: 260,
  },
  archer: {
    type: 'archer',
    nameRu: 'Лучник',
    nameEn: 'Archer',
    tierNames: ['Лучник', 'Снайпер', 'Королевский лучник'],
    cost: 50,
    summonCooldown: 3.0,
    icon: '🏹',
    baseHp: 75,
    baseDmg: 24,
    baseRange: 270,
    baseSpeed: 44,
    attackCooldown: 1.3,
    role: 'ranged',
    dimension: 'inamorta',
    description: 'Дальний бой, стреляет издалека через всё поле.',
    upgradeCostTier2: 160,
    upgradeCostTier3: 320,
  },
  knight: {
    type: 'knight',
    nameRu: 'Рыцарь',
    nameEn: 'Knight',
    tierNames: ['Рыцарь', 'Тяжёлый рыцарь', 'Паладин'],
    cost: 80,
    summonCooldown: 4.5,
    icon: '🛡️',
    baseHp: 300,
    baseDmg: 16,
    baseRange: 35,
    baseSpeed: 38,
    attackCooldown: 1.2,
    role: 'tank',
    dimension: 'inamorta',
    description: 'Высокая броня и живучесть, принимает удар на себя.',
    upgradeCostTier2: 220,
    upgradeCostTier3: 400,
  },
  barbarian: {
    type: 'barbarian',
    nameRu: 'Варвар',
    nameEn: 'Barbarian',
    tierNames: ['Варвар', 'Берсерк', 'Воевода'],
    cost: 110,
    summonCooldown: 5.5,
    icon: '🪓',
    baseHp: 230,
    baseDmg: 52,
    baseRange: 40,
    baseSpeed: 48,
    attackCooldown: 1.6,
    role: 'melee',
    dimension: 'inamorta',
    description: 'Медленный замах, но сокрушительный урон с критами.',
    upgradeCostTier2: 260,
    upgradeCostTier3: 480,
  },
  mage: {
    type: 'mage',
    nameRu: 'Маг',
    nameEn: 'Mage',
    tierNames: ['Маг', 'Чародей', 'Архимаг'],
    cost: 150,
    summonCooldown: 6.5,
    icon: '🧙',
    baseHp: 95,
    baseDmg: 42,
    baseRange: 240,
    baseSpeed: 40,
    attackCooldown: 2.0,
    role: 'magic',
    dimension: 'inamorta',
    description: 'Магические сферы с уроном по области.',
    upgradeCostTier2: 300,
    upgradeCostTier3: 550,
  },
  royal_knight: {
    type: 'royal_knight',
    nameRu: 'Королевский рыцарь',
    nameEn: 'Royal Knight',
    tierNames: ['Королевский рыцарь', 'Герой Ордена', 'Чемпион Короны'],
    cost: 250,
    summonCooldown: 9.0,
    icon: '👑',
    baseHp: 580,
    baseDmg: 70,
    baseRange: 42,
    baseSpeed: 45,
    attackCooldown: 1.1,
    role: 'melee',
    dimension: 'inamorta',
    description: 'Элитный благородный чемпион с вихревым ударом клинка.',
    upgradeCostTier2: 450,
    upgradeCostTier3: 800,
  },

  // ==================== MULTIVERSE: AVENGERS & TRANSFORMERS ====================
  iron_man: {
    type: 'iron_man',
    nameRu: 'Железный Человек',
    nameEn: 'Iron Man',
    tierNames: ['Mark 50', 'Mark 85', 'Hulkbuster Protocol'],
    cost: 175,
    summonCooldown: 7.0,
    icon: '🦾',
    baseHp: 420,
    baseDmg: 62,
    baseRange: 290,
    baseSpeed: 56,
    attackCooldown: 1.0,
    role: 'ranged',
    dimension: 'multiverse',
    description: 'Парит в воздухе, испепеляет толпы лазерными репульсорами и ракетами.',
    upgradeCostTier2: 320,
    upgradeCostTier3: 650,
  },
  captain: {
    type: 'captain',
    nameRu: 'Капитан Америка',
    nameEn: 'Captain America',
    tierNames: ['Первый Мститель', 'Ветеран Ваканды', 'Достойный Торговец Молот'],
    cost: 150,
    summonCooldown: 6.0,
    icon: '⭐',
    baseHp: 650,
    baseDmg: 48,
    baseRange: 160,
    baseSpeed: 52,
    attackCooldown: 1.1,
    role: 'tank',
    dimension: 'multiverse',
    description: 'Вибраниумный щит рикошетит по 3 зомби, блокируя 40% урона.',
    upgradeCostTier2: 280,
    upgradeCostTier3: 580,
  },
  thor: {
    type: 'thor',
    nameRu: 'Тор (Бог Грома)',
    nameEn: 'Thor God of Thunder',
    tierNames: ['Бог Асгарда', 'Владыка Мьёльнира', 'Громовержец Штормбрейкер'],
    cost: 260,
    summonCooldown: 8.5,
    icon: '⚡',
    baseHp: 780,
    baseDmg: 92,
    baseRange: 180,
    baseSpeed: 48,
    attackCooldown: 1.3,
    role: 'hero',
    dimension: 'multiverse',
    description: 'Молнии небес поражают врагов цепными разрядами и громовым ударом.',
    upgradeCostTier2: 480,
    upgradeCostTier3: 920,
  },
  optimus: {
    type: 'optimus',
    nameRu: 'Оптимус Прайм',
    nameEn: 'Optimus Prime',
    tierNames: ['Лидер Автоботов', 'Матрица Лидерства', 'Звёздный Прайм'],
    cost: 320,
    summonCooldown: 10.0,
    icon: '🚛',
    baseHp: 1050,
    baseDmg: 105,
    baseRange: 60,
    baseSpeed: 58,
    attackCooldown: 1.2,
    role: 'hero',
    dimension: 'multiverse',
    description: 'Ионная пушка, энергонный топор и трансформация с тараном!',
    upgradeCostTier2: 550,
    upgradeCostTier3: 1100,
  },
  bumblebee: {
    type: 'bumblebee',
    nameRu: 'Бамблби',
    nameEn: 'Bumblebee',
    tierNames: ['Разведчик', 'Спринтер Кибертрона', 'Золотой Воин'],
    cost: 140,
    summonCooldown: 5.0,
    icon: '🐝',
    baseHp: 400,
    baseDmg: 52,
    baseRange: 240,
    baseSpeed: 75,
    attackCooldown: 0.85,
    role: 'ranged',
    dimension: 'multiverse',
    description: 'Стремительный автобот с плазменными жалящими бластерами.',
    upgradeCostTier2: 260,
    upgradeCostTier3: 540,
  },
  hulk: {
    type: 'hulk',
    nameRu: 'Невероятный Халк',
    nameEn: 'The Incredible Hulk',
    tierNames: ['Зелёный Гигант', 'Гладиатор Сакаара', 'Разрушитель Миров'],
    cost: 290,
    summonCooldown: 9.0,
    icon: '🟢',
    baseHp: 1350,
    baseDmg: 120,
    baseRange: 45,
    baseSpeed: 44,
    attackCooldown: 1.5,
    role: 'tank',
    dimension: 'multiverse',
    description: 'Халк крушить! Сейсмический удар по земле раскидывает всех врагов.',
    upgradeCostTier2: 520,
    upgradeCostTier3: 980,
  },

  // ==================== MILITARY & HEAVY ARMOR ====================
  soldier: {
    type: 'soldier',
    nameRu: 'Солдат-Штурмовик',
    nameEn: 'Assault Soldier',
    tierNames: ['Пехотинец', 'Штурмовик Спецназа', 'Элитный Коммандос'],
    cost: 65,
    summonCooldown: 3.2,
    icon: '🪖',
    baseHp: 170,
    baseDmg: 34,
    baseRange: 270,
    baseSpeed: 50,
    attackCooldown: 0.9,
    role: 'ranged',
    dimension: 'multiverse',
    description: 'Тактический пехотинец с автоматом. Стреляет скоростными очередями, а в окопе получает +50% защиты и скорострельность!',
    upgradeCostTier2: 200,
    upgradeCostTier3: 420,
  },
  tank: {
    type: 'tank',
    nameRu: 'Боевой Танк',
    nameEn: 'Battle Tank',
    tierNames: ['Танк Т-72 Броня', 'Т-90М Прорыв', 'Сверхтяжёлый Танк Мамонт'],
    cost: 320,
    summonCooldown: 9.5,
    icon: '🚜',
    baseHp: 1650,
    baseDmg: 145,
    baseRange: 280,
    baseSpeed: 36,
    attackCooldown: 2.1,
    role: 'tank',
    dimension: 'multiverse',
    description: 'Тяжёлая бронетехника! Орудие стреляет фугасными снарядами со сплэш-уроном, а гусеницы тарана давят наступающую орду.',
    upgradeCostTier2: 580,
    upgradeCostTier3: 1150,
  },

  // ==================== STAR WARS GALAXY ====================
  jedi: {
    type: 'jedi',
    nameRu: 'Рыцарь-Джедай',
    nameEn: 'Jedi Knight',
    tierNames: ['Падаван Света', 'Рыцарь-Джедай', 'Мастер Совета Силы'],
    cost: 85,
    summonCooldown: 3.5,
    icon: '⚔️',
    baseHp: 240,
    baseDmg: 48,
    baseRange: 55,
    baseSpeed: 68,
    attackCooldown: 0.8,
    role: 'melee',
    dimension: 'star_wars',
    description: 'Синий световой меч рассекает любую броню! Быстрый рывок Силы и отражение снарядов.',
    upgradeCostTier2: 220,
    upgradeCostTier3: 480,
  },
  stormtrooper: {
    type: 'stormtrooper',
    nameRu: 'Имперский Штурмовик',
    nameEn: 'Imperial Stormtrooper',
    tierNames: ['Штурмовик Новичок', 'Тяжёлый Стрелок E-11', 'Командир Тёмного Легиона'],
    cost: 65,
    summonCooldown: 3.0,
    icon: '⚪',
    baseHp: 160,
    baseDmg: 38,
    baseRange: 290,
    baseSpeed: 48,
    attackCooldown: 0.85,
    role: 'ranged',
    dimension: 'star_wars',
    description: 'Стреляет скоростными красными плазменными болтами из бластера E-11!',
    upgradeCostTier2: 190,
    upgradeCostTier3: 400,
  },
  darth_vader: {
    type: 'darth_vader',
    nameRu: 'Дарт Вейдер',
    nameEn: 'Darth Vader',
    tierNames: ['Лорд Вейдер', 'Владыка Тёмной Стороны', 'Палач Галактики'],
    cost: 320,
    summonCooldown: 10.0,
    icon: '🖤',
    baseHp: 1550,
    baseDmg: 135,
    baseRange: 60,
    baseSpeed: 40,
    attackCooldown: 1.3,
    role: 'tank',
    dimension: 'star_wars',
    description: 'Владыка Ситхов! Красный световой меч и тёмное удушение Силы повергают врагов в ужас.',
    upgradeCostTier2: 550,
    upgradeCostTier3: 1100,
  },
  yoda: {
    type: 'yoda',
    nameRu: 'Гранд-Магистр Йода',
    nameEn: 'Grand Master Yoda',
    tierNames: ['Мудрец Йода', 'Гранд-Магистр Силы', 'Аватар Светлой Стороны'],
    cost: 260,
    summonCooldown: 8.0,
    icon: '🟢',
    baseHp: 580,
    baseDmg: 95,
    baseRange: 160,
    baseSpeed: 78,
    attackCooldown: 0.75,
    role: 'mage',
    dimension: 'star_wars',
    description: 'Зелёный вихрь светового меча и мощнейший толчок Силы, отбрасывающий всю толпу зомби!',
    upgradeCostTier2: 480,
    upgradeCostTier3: 950,
  },
  mandalorian: {
    type: 'mandalorian',
    nameRu: 'Мандалорец',
    nameEn: 'The Mandalorian',
    tierNames: ['Охотник за Головами', 'Воин в Бескаре', 'Владелец Тёмного Меча'],
    cost: 210,
    summonCooldown: 6.5,
    icon: '🛡️',
    baseHp: 480,
    baseDmg: 72,
    baseRange: 270,
    baseSpeed: 58,
    attackCooldown: 1.1,
    role: 'ranged',
    dimension: 'star_wars',
    description: 'Броня из чистого бескара поглощает урон. Джетпак позволяет парить, а ракеты с плеча взрывают толпу.',
    upgradeCostTier2: 360,
    upgradeCostTier3: 720,
  },
};

export interface ObstacleConfig {
  type: ObstacleType;
  nameRu: string;
  nameEn: string;
  cost: number;
  icon: string;
  hp: number;
  damage: number;
  width: number;
  height: number;
  cooldown: number;
  descriptionRu: string;
}

export const OBSTACLE_CONFIGS: Record<ObstacleType, ObstacleConfig> = {
  landmine: {
    type: 'landmine',
    nameRu: 'Фугасная Мина',
    nameEn: 'Landmine',
    cost: 40,
    icon: '💣',
    hp: 1,
    damage: 480,
    width: 26,
    height: 14,
    cooldown: 2.0,
    descriptionRu: 'Детонирует при наступлении зомби, нанося колоссальный урон по площади (AoE)!',
  },
  trench: {
    type: 'trench',
    nameRu: 'Окоп с Мешками',
    nameEn: 'Sandbag Trench',
    cost: 85,
    icon: '🕳️',
    hp: 950,
    damage: 0,
    width: 68,
    height: 40,
    cooldown: 4.0,
    descriptionRu: 'Задерживает орду. Солдаты и лучники в укрытии получают -50% урона и стреляют быстрее!',
  },
  barricade: {
    type: 'barricade',
    nameRu: 'Стальные Ежи',
    nameEn: 'Steel Barricade',
    cost: 60,
    icon: '🚧',
    hp: 700,
    damage: 35,
    width: 44,
    height: 34,
    cooldown: 3.0,
    descriptionRu: 'Противопехотные стальные ежи с колючей проволокой: останавливают врагов и наносят им шиповой урон.',
  },
};

export const ZOMBIE_BASE_STATS: Record<ZombieType, {
  nameRu: string;
  nameEn: string;
  baseHp: number;
  baseDmg: number;
  baseSpeed: number;
  attackRange: number;
  attackCooldown: number;
  armor: number;
  reward: number;
  width: number;
  height: number;
  description: string;
}> = {
  regular: {
    nameRu: 'Обычный зомби',
    nameEn: 'Regular Zombie',
    baseHp: 85,
    baseDmg: 14,
    baseSpeed: 32,
    attackRange: 32,
    attackCooldown: 1.2,
    armor: 0,
    reward: 10,
    width: 32,
    height: 48,
    description: 'Медленный, слабый, но опасный в больших толпах.',
  },
  fast: {
    nameRu: 'Быстрый зомби',
    nameEn: 'Fast Runner Zombie',
    baseHp: 55,
    baseDmg: 16,
    baseSpeed: 72,
    attackRange: 30,
    attackCooldown: 0.9,
    armor: 0,
    reward: 12,
    width: 30,
    height: 44,
    description: 'Стремительно несётся к крепости.',
  },
  fat: {
    nameRu: 'Толстый зомби',
    nameEn: 'Bloated Zombie',
    baseHp: 270,
    baseDmg: 24,
    baseSpeed: 22,
    attackRange: 36,
    attackCooldown: 1.5,
    armor: 0.1,
    reward: 20,
    width: 44,
    height: 54,
    description: 'Огромная масса плоти с большим запасом здоровья.',
  },
  armored: {
    nameRu: 'Бронированный зомби',
    nameEn: 'Armored Zombie',
    baseHp: 200,
    baseDmg: 20,
    baseSpeed: 30,
    attackRange: 34,
    attackCooldown: 1.3,
    armor: 0.35,
    reward: 25,
    width: 34,
    height: 50,
    description: 'Экипирован ржавыми доспехами, блокирует урон.',
  },
  giant: {
    nameRu: 'Зомби-гигант',
    nameEn: 'Zombie Giant',
    baseHp: 720,
    baseDmg: 48,
    baseSpeed: 20,
    attackRange: 48,
    attackCooldown: 1.8,
    armor: 0.2,
    reward: 50,
    width: 58,
    height: 76,
    description: 'Колосс невиданных размеров, сминает воинов одним ударом.',
  },
  boss: {
    nameRu: 'Зомби-босс 👹',
    nameEn: 'Zombie Boss',
    baseHp: 1800,
    baseDmg: 80,
    baseSpeed: 25,
    attackRange: 55,
    attackCooldown: 1.6,
    armor: 0.25,
    reward: 150,
    width: 72,
    height: 94,
    description: 'Владыка скверны! Сокрушает всё на пути.',
  },

  // ==================== NEW BOSSES & MULTIVERSE THREATS ====================
  necro_titan: {
    nameRu: 'Некро-Титан 💀',
    nameEn: 'Necro Titan',
    baseHp: 3200,
    baseDmg: 110,
    baseSpeed: 22,
    attackRange: 60,
    attackCooldown: 1.7,
    armor: 0.3,
    reward: 250,
    width: 80,
    height: 104,
    description: 'Древний гигант скверны, вызывающий ударные волны раскола земли.',
  },
  zombie_transformer: {
    nameRu: 'Кибер-Зомби Десептикон',
    nameEn: 'Cyber Decepticon Zombie',
    baseHp: 580,
    baseDmg: 45,
    baseSpeed: 45,
    attackRange: 45,
    attackCooldown: 1.1,
    armor: 0.3,
    reward: 45,
    width: 48,
    height: 60,
    description: 'Заражённый тёмным энергоном трансформер нежити.',
  },
  mega_zombietron: {
    nameRu: 'Мега-Зомбитрон 🤖',
    nameEn: 'Mega-Zombietron',
    baseHp: 5500,
    baseDmg: 140,
    baseSpeed: 24,
    attackRange: 70,
    attackCooldown: 1.5,
    armor: 0.38,
    reward: 400,
    width: 95,
    height: 115,
    description: 'Исполинский механический владыка, запускающий ракетные залпы!',
  },
  zombie_thanos: {
    nameRu: 'Зомби-Танос Бесконечности 🟣',
    nameEn: 'Zombie Thanos',
    baseHp: 8500,
    baseDmg: 180,
    baseSpeed: 26,
    attackRange: 75,
    attackCooldown: 1.4,
    armor: 0.45,
    reward: 600,
    width: 100,
    height: 120,
    description: 'Повелитель Перчатки Бесконечности! Испепеляет космическими лучами.',
  },
  undead_dragon: {
    nameRu: 'Кибер-Дракон Нежити 🐉',
    nameEn: 'Undead Cyber Dragon',
    baseHp: 4200,
    baseDmg: 125,
    baseSpeed: 38,
    attackRange: 65,
    attackCooldown: 1.3,
    armor: 0.25,
    reward: 350,
    width: 88,
    height: 100,
    description: 'Летающий повелитель пламени пустоты, выжигающий поле боя.',
  },
};

// ==================== STICK WAR LEGACY SKINS ====================
export const SKIN_DEFINITIONS: SkinDefinition[] = [
  {
    id: 'classic',
    nameRu: 'Классический (Сталь)',
    nameEn: 'Classic Steel',
    icon: '🛡️',
    tagline: 'Стандартная броня королевства Инаморта',
    perkDesc: '+10% к базовой защите всех воинов.',
    costGems: 0,
    primaryColor: '#64748b',
    secondaryColor: '#334155',
    glowColor: '#94a3b8',
    color: '#64748b',
    buffSummary: '+10% броня',
    description: 'Стандартная закалённая стальная броня королевства Инаморта',
    universe: 'inamorta',
    universeNameRu: 'Королевство Инаморта',
    artTitleRu: 'Рыцарь Стального Ордена',
    combatStats: {
      defense: '+15%',
      speed: '100%',
      attack: '100%',
      ability: 'Стальная стойка',
    },
  },
  {
    id: 'leaf',
    nameRu: 'Лиственный (Природа)',
    nameEn: 'Leaf (Nature)',
    icon: '🍃',
    tagline: 'Быстрый и лёгкий стиль лесных эльфов',
    perkDesc: '+20% скорость передвижения, -15% стоимость призыва воинов.',
    costGems: 50,
    primaryColor: '#15803d',
    secondaryColor: '#166534',
    glowColor: '#4ade80',
    color: '#15803d',
    buffSummary: '+20% скорость, -15% золото',
    description: 'Легендарные эльфийские одеяния из древесной коры и изумрудных листьев',
    universe: 'inamorta',
    universeNameRu: 'Королевство Инаморта',
    artTitleRu: 'Следопыт Шепчущих Лесов',
    combatStats: {
      defense: '90%',
      speed: '+25%',
      attack: '100%',
      ability: '-15% цена золота',
    },
  },
  {
    id: 'ice',
    nameRu: 'Ледяной (Стужа)',
    nameEn: 'Ice (Frost)',
    icon: '❄️',
    tagline: 'Холод ледников севера',
    perkDesc: 'Атаки замедляют зомби на 35% и создают ледяной шлейф.',
    costGems: 100,
    primaryColor: '#0284c7',
    secondaryColor: '#0369a1',
    glowColor: '#38bdf8',
    color: '#0284c7',
    buffSummary: 'Замедление врагов на 35%',
    description: 'Кристаллические доспехи из вечного льда с морозной алебардой',
    universe: 'inamorta',
    universeNameRu: 'Королевство Инаморта',
    artTitleRu: 'Страж Ледяных Пиков',
    combatStats: {
      defense: '+10%',
      speed: '95%',
      attack: '105%',
      ability: 'Замедление -35%',
    },
  },
  {
    id: 'savage',
    nameRu: 'Дикарь (Костяной)',
    nameEn: 'Savage (Bone)',
    icon: '🦴',
    tagline: 'Ярость племён диких пустошей',
    perkDesc: '+25% скорость атаки, 6% вампиризм (хил от нанесённого урона).',
    costGems: 150,
    primaryColor: '#d97706',
    secondaryColor: '#b45309',
    glowColor: '#fbbf24',
    color: '#d97706',
    buffSummary: '+25% скор. атаки, 6% вампиризм',
    description: 'Грозная костяная маска черепа и шипастая броня племён Пустоши',
    universe: 'inamorta',
    universeNameRu: 'Королевство Инаморта',
    artTitleRu: 'Берсерк Кровавой Пустоши',
    combatStats: {
      defense: '95%',
      speed: '+10%',
      attack: '+30%',
      ability: 'Вампиризм 6%',
    },
  },
  {
    id: 'lava',
    nameRu: 'Вулканический (Лава)',
    nameEn: 'Volcanic (Lava)',
    icon: '🌋',
    tagline: 'Огонь магматических глубин',
    perkDesc: 'Атаки поджигают врагов (урон во времени) + взрыв при гибели.',
    costGems: 200,
    primaryColor: '#dc2626',
    secondaryColor: '#991b1b',
    glowColor: '#f97316',
    color: '#dc2626',
    buffSummary: 'Поджог врагов + взрыв при смерти',
    description: 'Осколки обсидиана, сочащиеся пылающей магмой и жаром жерла вулкана',
    universe: 'inamorta',
    universeNameRu: 'Королевство Инаморта',
    artTitleRu: 'Повелитель Магмы',
    combatStats: {
      defense: '+15%',
      speed: '90%',
      attack: '+25%',
      ability: 'Поджог + взрыв',
    },
  },
  {
    id: 'transformer',
    nameRu: 'Кибертрон (Автобот)',
    nameEn: 'Cybertron Mech',
    icon: '🤖',
    tagline: 'Энергонная броня Автоботов',
    perkDesc: '+35% урон лазеров и ионных орудий + фотонный щит.',
    costGems: 250,
    primaryColor: '#0284c7',
    secondaryColor: '#dc2626',
    glowColor: '#60a5fa',
    color: '#0284c7',
    buffSummary: '+35% лазерный урон, щит',
    description: 'Титановый экзоскелет Автоботов с питанием от синего Энергона Кибертрона',
    universe: 'multiverse',
    universeNameRu: 'Кибер-Мультивселенная',
    artTitleRu: 'Боевой Автобот Омега',
    combatStats: {
      defense: '+25%',
      speed: '+15%',
      attack: '+35%',
      ability: 'Фотонный щит',
    },
  },
  {
    id: 'avenger',
    nameRu: 'Квантовый Мститель',
    nameEn: 'Quantum Avenger',
    icon: '⚡',
    tagline: 'Нанотехнологии Тони Старка и сила Асгарда',
    perkDesc: '+25% крит. шанс, молнии вырываются при каждом критическом ударе!',
    costGems: 300,
    primaryColor: '#e11d48',
    secondaryColor: '#eab308',
    glowColor: '#f43f5e',
    color: '#e11d48',
    buffSummary: '+25% криты + цепные молнии',
    description: 'Нанокостюм Старка Mark LXXXV, реактор Arc, вибраниум и молнии Мьёльнира',
    universe: 'multiverse',
    universeNameRu: 'Кибер-Мультивселенная',
    artTitleRu: 'Мститель Мультивселенной',
    combatStats: {
      defense: '+20%',
      speed: '+20%',
      attack: '+40%',
      ability: 'Цепная молния',
    },
  },
  {
    id: 'star_wars',
    nameRu: 'Звёздные Войны (Джедаи & Ситхи)',
    nameEn: 'Star Wars (Jedi & Sith)',
    icon: '⚔️🌌',
    tagline: 'Да пребудет с тобой Великая Сила!',
    perkDesc: 'Световые мечи наносят +30% урона, а Сила отталкивает зомби при получении урона.',
    costGems: 250,
    primaryColor: '#3b82f6',
    secondaryColor: '#ef4444',
    glowColor: '#60a5fa',
    color: '#3b82f6',
    buffSummary: '+30% урон световых мечей, толчок Силы',
    description: 'Экипировка Ордена Джедаев и Тёмных Лордов Ситхов со световым мечом и плащом',
    universe: 'star_wars',
    universeNameRu: 'Галактика Звёздных Войн',
    artTitleRu: 'Рыцарь Силы и Владыка Галактики',
    combatStats: {
      defense: '+20%',
      speed: '+20%',
      attack: '+30%',
      ability: 'Аура Великой Силы',
    },
  },
];

// ==================== WORLDS OF THE GAME ====================
export interface WorldInfo {
  id: DimensionType;
  nameRu: string;
  nameEn: string;
  badge: string;
  themeColor: string;
  icon: string;
  skySummary: string;
  descriptionRu: string;
  featuresRu: string;
}

export const GAME_WORLDS: WorldInfo[] = [
  {
    id: 'inamorta',
    nameRu: 'Королевство Инаморта',
    nameEn: 'Kingdom of Inamorta',
    badge: '🏰 Средневековье',
    themeColor: '#f59e0b',
    icon: '🏰',
    skySummary: 'Закатное небо и готический замок',
    descriptionRu: 'Классическое королевство: лучники, рыцари, маги огня и королевские стражи против орд нежити.',
    featuresRu: 'Рыцари, лучники, катапульты, магия огня',
  },
  {
    id: 'star_wars',
    nameRu: 'Галактика: Татуин & Звезда Смерти',
    nameEn: 'Star Wars: Tatooine & Death Star',
    badge: '🌌 Звёздные Войны',
    themeColor: '#38bdf8',
    icon: '🌌',
    skySummary: 'Глубокий космос, Звезда Смерти и дюны Татуина',
    descriptionRu: 'Легендарная космическая сага! Световые мечи, бластеры, Джедаи, Вейдер, Йода и Мандалорец.',
    featuresRu: 'Световые мечи, бластеры E-11, Удушение Силы, Толчок Йоды',
  },
  {
    id: 'mustafar',
    nameRu: 'Мустафар — Лавовый Мир Ситхов',
    nameEn: 'Mustafar — Lava Sith World',
    badge: '🌋 Мустафар (Лава)',
    themeColor: '#ef4444',
    icon: '🌋',
    skySummary: 'Раскалённое пепельное небо и реки магмы',
    descriptionRu: 'Планета раскалённой магмы, замок Дарта Вейдера и тёмная энергия Великой Силы.',
    featuresRu: 'Огненные реки, ярость Ситхов, лавовые взрывы',
  },
  {
    id: 'hoth',
    nameRu: 'Хот — Ледяная Планета Звёздных Войн',
    nameEn: 'Hoth — Ice Rebel Planet',
    badge: '❄️ Хот (Лёд)',
    themeColor: '#06b6d4',
    icon: '❄️',
    skySummary: 'Бескрайние ледники и шагоходы AT-AT',
    descriptionRu: 'Бескрайние ледники, База Эхо Повстанцев, снежная буря и шагоходы AT-AT на горизонте.',
    featuresRu: 'Снежная буря, замедление, генераторы щита повстанцев',
  },
  {
    id: 'multiverse',
    nameRu: 'Мультивселенная Marvel',
    nameEn: 'Marvel Multiverse',
    badge: '⚡ Мстители & Автоботы',
    themeColor: '#8b5cf6',
    icon: '⚡',
    skySummary: 'Квантовый разлом и Башня Старка',
    descriptionRu: 'Железный Человек, Тор с Мьёльниром, Капитан Америка, Оптимус Прайм и Халк!',
    featuresRu: 'Репульсоры, молнии Тора, броня автоботов',
  },
  {
    id: 'cyberpunk',
    nameRu: 'Нео-Токио Киберпанк 2099',
    nameEn: 'Neo-Tokyo Cyberpunk 2099',
    badge: '🌆 Киберпанк 2099',
    themeColor: '#ec4899',
    icon: '🌆',
    skySummary: 'Неоновые небоскрёбы и голографические драконы',
    descriptionRu: 'Мегаполис будущего, неоновые голограммы драконов, кибер-пехота и плазменные турели.',
    featuresRu: 'Неоновые катаны, кибер-пушки, голографические щиты',
  },
];

// ==================== 12 CAMPAIGN STAGES ====================
export const CAMPAIGN_LEVELS: CampaignLevel[] = [
  {
    id: 1,
    titleRu: 'Равнины Инаморты',
    titleEn: 'Plains of Inamorta',
    descriptionRu: 'Первая стычка с разведчиками нежити у границы королевства.',
    descriptionEn: 'First encounter with zombie scouts near the borders.',
    dimension: 'inamorta',
    rewardGold: 150,
    rewardGems: 15,
    isUnlocked: true,
    stars: 3,
    difficulty: 'normal',
  },
  {
    id: 2,
    titleRu: 'Шепчущий Тёмный Лес',
    titleEn: 'Whispering Dark Forest',
    descriptionRu: 'Быстрые зомби-бегуны скрываются в чаще деревьев.',
    descriptionEn: 'Fast runner zombies ambush from deep shadows.',
    dimension: 'inamorta',
    rewardGold: 220,
    rewardGems: 20,
    isUnlocked: true,
    stars: 0,
    difficulty: 'normal',
  },
  {
    id: 3,
    titleRu: 'Ледяное Ущелье',
    titleEn: 'Frozen Chasm',
    descriptionRu: 'Толстые бронированные зомби штурмуют горный перевал.',
    descriptionEn: 'Heavy armored zombies march through the freezing pass.',
    dimension: 'inamorta',
    rewardGold: 300,
    rewardGems: 25,
    isUnlocked: false,
    stars: 0,
    difficulty: 'normal',
  },
  {
    id: 4,
    titleRu: 'Врата Вулкана',
    titleEn: 'Volcanic Gates',
    descriptionRu: 'Гиганты нежити пробивают лавовые баррикады.',
    descriptionEn: 'Zombie giants smash through obsidian gates.',
    dimension: 'inamorta',
    rewardGold: 400,
    rewardGems: 30,
    isUnlocked: false,
    stars: 0,
    difficulty: 'hard',
  },
  {
    id: 5,
    titleRu: 'Цитадель Некроманта',
    titleEn: 'Necro Citadel',
    descriptionRu: 'Битва с Некро-Титаном! Древний владыка скверны восстал.',
    descriptionEn: 'Showdown with the Necro Titan king!',
    dimension: 'inamorta',
    rewardGold: 600,
    rewardGems: 50,
    isUnlocked: false,
    stars: 0,
    bossType: 'necro_titan',
    difficulty: 'hard',
  },
  {
    id: 6,
    titleRu: 'КВАНТОВЫЙ РАЗЛОМ (ПОРТАЛ В ДРУГОЙ МИР)',
    titleEn: 'QUANTUM RIFT (MULTIVERSE PORTAL)',
    descriptionRu: 'Разлом во времени и пространстве! Пробейся сквозь орду в портал!',
    descriptionEn: 'Breach the portal horde to jump into the Multiverse!',
    dimension: 'inamorta',
    rewardGold: 800,
    rewardGems: 80,
    isUnlocked: false,
    stars: 0,
    difficulty: 'hard',
  },
  {
    id: 7,
    titleRu: 'Неоновый Мегаполис Старка',
    titleEn: 'Stark Neo-Metropolis',
    descriptionRu: 'Ты в другом мире! Железный Человек и Капитан Америка вступают в бой!',
    descriptionEn: 'Arrived in the Multiverse! Iron Man and Captain America join!',
    dimension: 'multiverse',
    rewardGold: 950,
    rewardGems: 90,
    isUnlocked: false,
    stars: 0,
    difficulty: 'hard',
  },
  {
    id: 8,
    titleRu: 'Руины Кибертрона',
    titleEn: 'Ruins of Cybertron',
    descriptionRu: 'Оптимус Прайм и Бамблби громят орду десептиконов-зомби!',
    descriptionEn: 'Optimus Prime and Bumblebee crush zombie Decepticons!',
    dimension: 'multiverse',
    rewardGold: 1100,
    rewardGems: 100,
    isUnlocked: false,
    stars: 0,
    difficulty: 'insane',
  },
  {
    id: 9,
    titleRu: 'Небесный Гром Асгарда',
    titleEn: 'Asgard Sky Thunder',
    descriptionRu: 'Тор и Халк крушат полчища зомби громом и землетрясениями!',
    descriptionEn: 'Thor and Hulk smash the undead with lightning and fury!',
    dimension: 'multiverse',
    rewardGold: 1300,
    rewardGems: 120,
    isUnlocked: false,
    stars: 0,
    difficulty: 'insane',
  },
  {
    id: 10,
    titleRu: 'Крепость Мега-Зомбитрона',
    titleEn: 'Fortress of Mega-Zombietron',
    descriptionRu: 'Битва титанов! Мега-Зомбитрон открывает огонь всеми ракетами!',
    descriptionEn: 'Boss Fight: Defeat the towering Mega-Zombietron!',
    dimension: 'multiverse',
    rewardGold: 1600,
    rewardGems: 150,
    isUnlocked: false,
    stars: 0,
    bossType: 'mega_zombietron',
    difficulty: 'insane',
  },
  {
    id: 11,
    titleRu: 'Святилище Камней Бесконечности',
    titleEn: 'Sanctuary of Infinity Stones',
    descriptionRu: 'Кибер-Дракон Нежити закрывает небеса крыльями погибели.',
    descriptionEn: 'Undead Cyber Dragon scorches the skyline!',
    dimension: 'multiverse',
    rewardGold: 2000,
    rewardGems: 200,
    isUnlocked: false,
    stars: 0,
    bossType: 'undead_dragon',
    difficulty: 'insane',
  },
  {
    id: 12,
    titleRu: 'ФИНАЛ: ЗОМБИ-ТАНОС БЕСКОНЕЧНОСТИ',
    titleEn: 'ENDGAME: ZOMBIE THANOS',
    descriptionRu: 'Судьба всей Мультивселенной! Сразись с Таносом и спаси миры!',
    descriptionEn: 'The ultimate climax! Defeat Zombie Thanos to save all reality!',
    dimension: 'multiverse',
    rewardGold: 3000,
    rewardGems: 500,
    isUnlocked: false,
    stars: 0,
    bossType: 'zombie_thanos',
    difficulty: 'insane',
  },
];

// ==================== 8 TOURNAMENT AI LEADERS ====================
export const TOURNAMENT_LEADERS: TournamentAILeader[] = [
  {
    id: 'player',
    name: 'Главнокомандующий (Игрок)',
    titleRu: 'Страж Цитадели',
    titleEn: 'Guardian of the Citadel',
    avatar: '👑',
    playstyleRu: 'Тактический гений с поддержкой магии и героев.',
    playstyleEn: 'Tactical strategist with magic and multiverse heroes.',
    difficulty: 'easy',
    favoredUnits: ['swordsman', 'archer', 'knight', 'mage'],
    isPlayer: true,
  },
  {
    id: 'ironfist',
    name: 'Генерал Стальной Кулак',
    titleRu: 'Штурмовик Передовой',
    titleEn: 'Vanguard Rusher',
    avatar: '⚔️',
    playstyleRu: 'Молниеносный раш мечниками и варварами с первых секунд.',
    playstyleEn: 'Fast aggressive rush of swordsmen and berserkers.',
    difficulty: 'easy',
    favoredUnits: ['swordsman', 'barbarian'],
  },
  {
    id: 'frostpeak',
    name: 'Архонт Морозный Пик',
    titleRu: 'Ледяной Тактик',
    titleEn: 'Frost Guardian',
    avatar: '❄️',
    playstyleRu: 'Глухая оборона щитами, лучники и замораживающие атаки.',
    playstyleEn: 'Deep turtle defense with heavy shields and frost archers.',
    difficulty: 'medium',
    favoredUnits: ['knight', 'archer'],
  },
  {
    id: 'lord_necros',
    name: 'Лорд Некрос',
    titleRu: 'Владыка Скверны',
    titleEn: 'Lord of Shadows',
    avatar: '💀',
    playstyleRu: 'Бесчисленные полчища зомби и тёмные заклинания огня.',
    playstyleEn: 'Endless swarm with dark sorcery.',
    difficulty: 'medium',
    favoredUnits: ['barbarian', 'mage'],
  },
  {
    id: 'krog_berserk',
    name: 'Вождь Крог',
    titleRu: 'Ярость Пустошей',
    titleEn: 'Warlord Krog',
    avatar: '🪓',
    playstyleRu: 'Варвары-берсерки с критическими ударами и бешеным натиском.',
    playstyleEn: 'Brutal barbarian offensive with massive crits.',
    difficulty: 'hard',
    favoredUnits: ['barbarian', 'royal_knight'],
  },
  {
    id: 'nova_cyber',
    name: 'Командир Нова',
    titleRu: 'Кибернетический Стратег',
    titleEn: 'Cyber Strategist',
    avatar: '🤖',
    playstyleRu: 'Лазерные технологии, скорострельные стрелки и щиты.',
    playstyleEn: 'High-tech ranged barrage with photon shields.',
    difficulty: 'hard',
    favoredUnits: ['archer', 'mage', 'royal_knight'],
  },
  {
    id: 'grand_inquisitor',
    name: 'Инквизитор Элрик',
    titleRu: 'Верховный Паладин',
    titleEn: 'Grand Inquisitor',
    avatar: '🛡️',
    playstyleRu: 'Сбалансированная элитная армия с королевскими рыцарями.',
    playstyleEn: 'Balanced elite force of royal knights and archmages.',
    difficulty: 'hard',
    favoredUnits: ['knight', 'mage', 'royal_knight'],
  },
  {
    id: 'void_overlord',
    name: 'Титан Бездны',
    titleRu: 'Чемпион Короны Инаморты',
    titleEn: 'Crown Champion',
    avatar: '👹',
    playstyleRu: 'Сокрушительная мощь всех стихий и гигантские чемпионы.',
    playstyleEn: 'Ultimate champion with supreme stats and cosmic spells.',
    difficulty: 'boss',
    favoredUnits: ['barbarian', 'royal_knight', 'mage'],
  },
];

export const CASTLE_LEVELS: CastleLevelInfo[] = [
  {
    level: 1,
    nameRu: 'Деревянный форпост',
    nameEn: 'Wooden Outpost',
    hpBonus: 0,
    cost: 0,
    features: ['Базовая защита крепости', '1000 HP'],
    description: 'Первый рубеж обороны королевства.',
  },
  {
    level: 2,
    nameRu: 'Каменная цитадель',
    nameEn: 'Stone Citadel',
    hpBonus: 600,
    cost: 140,
    features: ['+600 Макс. HP', 'Пассивная регенерация +5 HP/сек', 'Каменная кладка стен'],
    description: 'Укреплённые гранитные блоки защищают от осады.',
  },
  {
    level: 3,
    nameRu: 'Башня лучников',
    nameEn: 'Archer Bastion',
    hpBonus: 400,
    cost: 220,
    features: ['+400 Макс. HP', '2 автоматических лучника на парапетах', 'Дальность 320 px'],
    description: 'Меткие стражи непрерывно обстреливают приближающихся зомби.',
  },
  {
    level: 4,
    nameRu: 'Шипастый палисад',
    nameEn: 'Spiked Barricade',
    hpBonus: 500,
    cost: 320,
    features: ['+500 Макс. HP', 'Отражение урона (шипы наносят 25 урона/сек атакующим врагам)'],
    description: 'Острые стальные шипы и ров ранят каждого, кто посмеет подойти.',
  },
  {
    level: 5,
    nameRu: 'Магическая цитадель / Башня Старка',
    nameEn: 'Stark Arcane Citadel',
    hpBonus: 800,
    cost: 450,
    features: ['+800 Макс. HP', 'Тяжёлая пушка / плазменная турель', 'Энергетический щит'],
    description: 'Вершина фортификации: арканная пушка сметает целые группы нежити.',
  },
];

export const INITIAL_ABILITIES: Ability[] = [
  {
    id: 'fire_rain',
    name: 'fire_rain',
    nameRu: 'Огненный дождь',
    icon: '🔥',
    description: 'Метеоритный ливень обрушивается на врагов, нанося 180 урона по площади.',
    cooldown: 28,
    currentCooldown: 0,
    hotkey: 'Q',
  },
  {
    id: 'freeze',
    name: 'freeze',
    nameRu: 'Заморозка',
    icon: '❄️',
    description: 'Ледяной шторм полностью сковывает всю армию зомби на 5.5 секунд.',
    cooldown: 35,
    currentCooldown: 0,
    hotkey: 'W',
  },
  {
    id: 'lightning',
    name: 'lightning',
    nameRu: 'Молния',
    icon: '⚡',
    description: 'Небесный громовой разряд наносит 500 урона сильнейшему врагу на поле.',
    cooldown: 22,
    currentCooldown: 0,
    hotkey: 'E',
  },
];

/**
 * Generates an interesting, scaling wave of zombies
 */
export function generateWave(
  waveNumber: number, 
  dimension: 'inamorta' | 'multiverse' = 'inamorta',
  difficulty: DifficultyType = 'normal'
): {
  totalZombies: number;
  spawnQueue: ZombieType[];
  isBossWave: boolean;
  spawnInterval: number;
} {
  const isBossWave = waveNumber % 5 === 0;
  const queue: ZombieType[] = [];
  const diffCfg = DIFFICULTY_CONFIGS[difficulty] || DIFFICULTY_CONFIGS.normal;

  // Base count increases with wave and scales with difficulty
  let baseCount = Math.min(10 + Math.floor(waveNumber * 2.2), 65);
  if (waveNumber > 20) {
    baseCount = Math.min(baseCount + (waveNumber - 20) * 3, 100); // Horde mode
  }
  let count = Math.round(baseCount * diffCfg.hordeSizeMult);

  // Distribution weights depending on wave progress & dimension & difficulty
  for (let i = 0; i < count; i++) {
    const roll = Math.random();

    if (dimension === 'multiverse') {
      // Multiverse has corrupted Cyber-Decepticon zombies & giants
      if (difficulty === 'nightmare') {
        if (roll < 0.15) queue.push('fast');
        else if (roll < 0.45) queue.push('zombie_transformer');
        else if (roll < 0.70) queue.push('armored');
        else queue.push('giant');
      } else if (difficulty === 'insane') {
        if (roll < 0.20) queue.push('fast');
        else if (roll < 0.50) queue.push('zombie_transformer');
        else if (roll < 0.75) queue.push('armored');
        else queue.push('giant');
      } else {
        if (roll < 0.25) queue.push('regular');
        else if (roll < 0.50) queue.push('fast');
        else if (roll < 0.75) queue.push('zombie_transformer');
        else if (roll < 0.90) queue.push('armored');
        else queue.push('giant');
      }
    } else {
      if (difficulty === 'nightmare' || difficulty === 'insane') {
        // High difficulty introduces tougher enemies even early
        if (waveNumber === 1) {
          queue.push(roll < 0.5 ? 'regular' : 'fast');
        } else if (waveNumber <= 3) {
          if (roll < 0.4) queue.push('fast');
          else if (roll < 0.7) queue.push('fat');
          else queue.push('armored');
        } else {
          if (roll < 0.20) queue.push('fast');
          else if (roll < 0.45) queue.push('armored');
          else if (roll < 0.75) queue.push('fat');
          else queue.push('giant');
        }
      } else {
        if (waveNumber === 1) {
          queue.push('regular');
        } else if (waveNumber === 2) {
          queue.push(roll < 0.75 ? 'regular' : 'fast');
        } else if (waveNumber <= 4) {
          if (roll < 0.55) queue.push('regular');
          else if (roll < 0.85) queue.push('fast');
          else queue.push('fat');
        } else if (waveNumber <= 8) {
          if (roll < 0.40) queue.push('regular');
          else if (roll < 0.65) queue.push('fast');
          else if (roll < 0.85) queue.push('fat');
          else queue.push('armored');
        } else {
          if (roll < 0.25) queue.push('regular');
          else if (roll < 0.45) queue.push('fast');
          else if (roll < 0.65) queue.push('armored');
          else if (roll < 0.85) queue.push('fat');
          else queue.push('giant');
        }
      }
    }
  }

  // Boss inserted mid-way or near start of boss wave
  if (isBossWave) {
    const bossInsertIdx = Math.floor(queue.length * 0.4);
    
    // Choose appropriate boss depending on wave & dimension
    let bossType: ZombieType = 'boss';
    if (dimension === 'multiverse') {
      if (waveNumber >= 15) bossType = 'zombie_thanos';
      else if (waveNumber >= 10) bossType = 'mega_zombietron';
      else bossType = 'undead_dragon';
    } else {
      if (waveNumber >= 15) bossType = 'necro_titan';
      else if (waveNumber >= 10) bossType = 'boss';
      else bossType = 'boss';
    }

    queue.splice(bossInsertIdx, 0, bossType);

    if (waveNumber >= 10 || difficulty === 'nightmare' || difficulty === 'insane') {
      queue.splice(bossInsertIdx + 1, 0, 'giant');
    }
    if (difficulty === 'nightmare') {
      queue.splice(bossInsertIdx + 2, 0, 'giant');
    }
  }

  // Spawn interval scales inversely with difficulty (faster spawn rate)
  const baseSpawnInterval = Math.max(700, 2400 - waveNumber * 50);
  const spawnInterval = Math.max(450, Math.round(baseSpawnInterval / diffCfg.spawnRateMult));

  return {
    totalZombies: queue.length,
    spawnQueue: queue,
    isBossWave,
    spawnInterval,
  };
}
