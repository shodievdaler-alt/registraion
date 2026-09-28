import { MathProblem } from '../types/scuffedFifa';

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function generateDistractors(answer: number): number[] {
  const distractors = new Set<number>();
  const deltas = [-10, -5, -2, -1, 1, 2, 3, 5, 10, 12, 15];

  // Shuffle deltas
  const shuffledDeltas = shuffleArray(deltas);

  for (const delta of shuffledDeltas) {
    const val = answer + delta;
    if (val > 0 && val !== answer) {
      distractors.add(val);
    }
    if (distractors.size >= 3) break;
  }

  // Fallback if needed
  let counter = 1;
  while (distractors.size < 3) {
    const val = answer + counter * 2;
    if (val > 0 && val !== answer) {
      distractors.add(val);
    }
    counter++;
  }

  return Array.from(distractors).slice(0, 3);
}

const STAR_WARS_STORIES = [
  {
    theme: '🌌 ЗВЁЗДНЫЕ ВОЙНЫ: МАГИСТР ЙОДА',
    generate: (diff: 'easy' | 'medium' | 'hard') => {
      if (diff === 'easy') {
        const a = getRandomInt(4, 15);
        const b = getRandomInt(3, 12);
        return {
          expression: `Йода учил Люка ${a} ч. и ${b} ч.: ${a} + ${b} = ?`,
          answer: a + b,
          explanation: `Магистр Йода тренировал Люка: ${a} + ${b} = ${a + b} часов Силы!`,
        };
      } else if (diff === 'medium') {
        const a = getRandomInt(4, 9);
        const b = getRandomInt(6, 11);
        return {
          expression: `У Йоды ${a} учеников по ${b} уроков Силы: ${a} × ${b} = ?`,
          answer: a * b,
          explanation: `Всего изучено: ${a} × ${b} = ${a * b} уроков джедаев!`,
        };
      } else {
        const a = getRandomInt(12, 18);
        const b = getRandomInt(5, 9);
        const c = getRandomInt(10, 25);
        return {
          expression: `Сила Джедая: (${a} × ${b}) − ${c} = ?`,
          answer: a * b - c,
          explanation: `(${a} × ${b}) − ${c} = ${a * b} − ${c} = ${a * b - c} очков Силы!`,
        };
      }
    },
  },
  {
    theme: '🔴 ИМПЕРИЯ: ДАРТ ВЕЙДЕР',
    generate: (diff: 'easy' | 'medium' | 'hard') => {
      if (diff === 'easy') {
        const a = getRandomInt(15, 30);
        const b = getRandomInt(5, 14);
        return {
          expression: `Вейдер уничтожил ${b} из ${a} TIE-истребителей: ${a} − ${b} = ?`,
          answer: a - b,
          explanation: `Осталось в эскадрилье: ${a} − ${b} = ${a - b} кораблей!`,
        };
      } else if (diff === 'medium') {
        const a = getRandomInt(5, 9);
        const b = getRandomInt(7, 12);
        return {
          expression: `Звезда Смерти выпустила ${a} лучей по ${b} мегаватт: ${a} × ${b} = ?`,
          answer: a * b,
          explanation: `Мощность суперлазера: ${a} × ${b} = ${a * b} МВт!`,
        };
      } else {
        const a = getRandomInt(11, 16);
        const b = getRandomInt(7, 13);
        return {
          expression: `Эскадра Дарта Вейдера: ${a} × ${b} = ?`,
          answer: a * b,
          explanation: `${a} × ${b} = ${a * b} имперских разрушителей в гиперпространстве!`,
        };
      }
    },
  },
  {
    theme: '❄️ ЛЕДЯНАЯ ПЛАНЕТА ХОТ',
    generate: (diff: 'easy' | 'medium' | 'hard') => {
      if (diff === 'easy') {
        const a = getRandomInt(6, 18);
        const b = getRandomInt(4, 15);
        return {
          expression: `Шагоходы AT-AT прошли ${a} км и ещё ${b} км: ${a} + ${b} = ?`,
          answer: a + b,
          explanation: `Путь сквозь снежную бурю Хота: ${a} + ${b} = ${a + b} км!`,
        };
      } else if (diff === 'medium') {
        const b = getRandomInt(4, 9);
        const ans = getRandomInt(5, 12);
        const a = b * ans;
        return {
          expression: `Снежные спидеры повстанцев: ${a} ÷ ${b} = ?`,
          answer: ans,
          explanation: `Гарнизон базы Эхо: ${a} ÷ ${b} = ${ans} эскадрилий!`,
        };
      } else {
        const a = getRandomInt(4, 12);
        const b = getRandomInt(5, 11);
        const c = getRandomInt(4, 8);
        return {
          expression: `Генератор щита Хота: (${a} + ${b}) × ${c} = ?`,
          answer: (a + b) * c,
          explanation: `(${a} + ${b}) × ${c} = ${a + b} × ${c} = ${(a + b) * c} энергоблоков!`,
        };
      }
    },
  },
  {
    theme: '🌋 ЛАВОВЫЙ МИР МУСТАФАР',
    generate: (diff: 'easy' | 'medium' | 'hard') => {
      if (diff === 'easy') {
        const a = getRandomInt(8, 20);
        const b = getRandomInt(4, 15);
        return {
          expression: `Лава Мустафара: ${a} + ${b} = ?`,
          answer: a + b,
          explanation: `Раскалённая магма: ${a} + ${b} = ${a + b} сотен градусов!`,
        };
      } else if (diff === 'medium') {
        const a = getRandomInt(6, 12);
        const b = getRandomInt(6, 11);
        return {
          expression: `Дуэль на Мустафаре: ${a} × ${b} = ?`,
          answer: a * b,
          explanation: `Световые клинки скрестились ${a} × ${b} = ${a * b} раз!`,
        };
      } else {
        const a = getRandomInt(12, 19);
        const b = getRandomInt(8, 14);
        return {
          expression: `Ярость Тёмной Стороны: ${a} × ${b} = ?`,
          answer: a * b,
          explanation: `Энергия лавового мира: ${a} × ${b} = ${a * b}!`,
        };
      }
    },
  },
  {
    theme: '🛡️ МАНДАЛОРЕЦ: ТАКОВ ПУТЬ',
    generate: (diff: 'easy' | 'medium' | 'hard') => {
      if (diff === 'easy') {
        const a = getRandomInt(10, 25);
        const b = getRandomInt(3, 9);
        return {
          expression: `Мандалорец взял ${a} слитков и отдал ${b}: ${a} − ${b} = ?`,
          answer: a - b,
          explanation: `Осталось слитков бескара: ${a} − ${b} = ${a - b}!`,
        };
      } else if (diff === 'medium') {
        const a = getRandomInt(4, 8);
        const b = getRandomInt(7, 12);
        return {
          expression: `Свистящие птицы: ${a} обойм по ${b} ракет: ${a} × ${b} = ?`,
          answer: a * b,
          explanation: `Залп Мандо: ${a} × ${b} = ${a * b} микроракет! Таков Путь!`,
        };
      } else {
        const a = getRandomInt(14, 22);
        const b = getRandomInt(6, 12);
        return {
          expression: `Награда охотника за головами: ${a} × ${b} = ?`,
          answer: a * b,
          explanation: `Выплата гильдии: ${a} × ${b} = ${a * b} кредитов!`,
        };
      }
    },
  },
];

export function generateMathProblem(difficulty: 'easy' | 'medium' | 'hard' = 'medium'): MathProblem {
  let expression = '';
  let answer = 0;
  let explanation = '';
  let pointsReward = 100;

  // 35% chance to roll a Star Wars / Worlds problem!
  const isStarWarsStory = Math.random() < 0.35;
  if (isStarWarsStory) {
    const template = STAR_WARS_STORIES[getRandomInt(0, STAR_WARS_STORIES.length - 1)];
    const result = template.generate(difficulty);
    expression = result.expression;
    answer = result.answer;
    explanation = result.explanation;
    pointsReward = difficulty === 'easy' ? 70 : difficulty === 'medium' ? 140 : 300;
  } else if (difficulty === 'easy') {
    pointsReward = 50;
    const type = getRandomInt(1, 3);

    if (type === 1) {
      // Simple addition
      const a = getRandomInt(3, 25);
      const b = getRandomInt(2, 20);
      answer = a + b;
      expression = `${a} + ${b}`;
      explanation = `${a} + ${b} = ${answer}`;
    } else if (type === 2) {
      // Simple subtraction
      const ans = getRandomInt(2, 20);
      const b = getRandomInt(2, 20);
      const a = ans + b;
      answer = ans;
      expression = `${a} − ${b}`;
      explanation = `${a} − ${b} = ${answer}`;
    } else {
      // Small multiplication
      const a = getRandomInt(2, 5);
      const b = getRandomInt(2, 6);
      answer = a * b;
      expression = `${a} × ${b}`;
      explanation = `${a} × ${b} = ${answer}`;
    }
  } else if (difficulty === 'medium') {
    pointsReward = 100;
    const type = getRandomInt(1, 4);

    if (type === 1) {
      // Multiplication table (4..9) * (4..12)
      const a = getRandomInt(4, 9);
      const b = getRandomInt(4, 12);
      answer = a * b;
      expression = `${a} × ${b}`;
      explanation = `${a} × ${b} = ${answer}`;
    } else if (type === 2) {
      // Clean Division
      const b = getRandomInt(3, 9);
      const ans = getRandomInt(4, 12);
      const a = b * ans;
      answer = ans;
      expression = `${a} ÷ ${b}`;
      explanation = `${a} ÷ ${b} = ${answer} (так как ${b} × ${ans} = ${a})`;
    } else if (type === 3) {
      // 2-digit addition
      const a = getRandomInt(25, 79);
      const b = getRandomInt(18, 65);
      answer = a + b;
      expression = `${a} + ${b}`;
      explanation = `${a} + ${b} = ${answer}`;
    } else {
      // 2-digit subtraction
      const ans = getRandomInt(15, 60);
      const b = getRandomInt(19, 58);
      const a = ans + b;
      answer = ans;
      expression = `${a} − ${b}`;
      explanation = `${a} − ${b} = ${answer}`;
    }
  } else {
    // Hard
    pointsReward = 250;
    const type = getRandomInt(1, 4);

    if (type === 1) {
      // 2-digit multiplication
      const a = getRandomInt(11, 19);
      const b = getRandomInt(6, 14);
      answer = a * b;
      expression = `${a} × ${b}`;
      explanation = `${a} × ${b} = ${answer}`;
    } else if (type === 2) {
      // 3-digit division
      const b = getRandomInt(6, 16);
      const ans = getRandomInt(9, 22);
      const a = b * ans;
      answer = ans;
      expression = `${a} ÷ ${b}`;
      explanation = `${a} ÷ ${b} = ${answer} (так как ${b} × ${ans} = ${a})`;
    } else if (type === 3) {
      // Combined: (a + b) × c
      const a = getRandomInt(4, 15);
      const b = getRandomInt(3, 12);
      const c = getRandomInt(3, 7);
      answer = (a + b) * c;
      expression = `(${a} + ${b}) × ${c}`;
      explanation = `(${a} + ${b}) × ${c} = ${a + b} × ${c} = ${answer}`;
    } else {
      // Combined: a × b − c
      const a = getRandomInt(6, 12);
      const b = getRandomInt(6, 11);
      const c = getRandomInt(11, 35);
      answer = a * b - c;
      expression = `${a} × ${b} − ${c}`;
      explanation = `${a} × ${b} − ${c} = ${a * b} − ${c} = ${answer}`;
    }
  }

  const distractors = generateDistractors(answer);
  const options = shuffleArray([answer, ...distractors]);

  return {
    id: `math_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    expression,
    answer,
    options,
    pointsReward,
    difficulty,
    explanation,
  };
}
