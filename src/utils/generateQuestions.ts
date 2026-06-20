import { getChampionDetail, getChampions, getItems, getRunes } from '../services/dataDragon';
import { QuizCategory, QuizQuestion } from '../types/quiz';
import { stripHtml } from './stripHtml';

function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function maskAnswer(text: string, masks: { name: string; placeholder: string }[]): string {
  let result = text;
  for (const { name, placeholder } of masks) {
    if (!name) continue;
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    result = result.replace(new RegExp(escaped, 'g'), placeholder);
  }
  return result;
}

function pickDistractors(pool: string[], exclude: string, count = 3): string[] {
  const candidates = pool.filter((s) => s !== exclude);
  return shuffle(candidates).slice(0, count);
}

async function generateSkillQuestions(
  category: 'skill' | 'ultimate' | 'passive',
  count: number
): Promise<QuizQuestion[]> {
  const allChampions = await getChampions();
  const selected = shuffle(allChampions).slice(0, Math.min(25, allChampions.length));

  const results = await Promise.allSettled(selected.map((c) => getChampionDetail(c.id)));
  const details = results
    .filter((r): r is PromiseFulfilledResult<Awaited<ReturnType<typeof getChampionDetail>>> => r.status === 'fulfilled')
    .map((r) => r.value);

  type SkillEntry = { championName: string; skillName: string; description: string; slot: 'Q' | 'W' | 'E' | 'R' | 'P' };

  const pool: SkillEntry[] = [];
  for (const detail of details) {
    if (category === 'passive') {
      pool.push({
        championName: detail.name,
        skillName: detail.passive.name,
        description: maskAnswer(detail.passive.description, [
          { name: detail.name, placeholder: '【チャンピオン】' },
          { name: detail.passive.name, placeholder: '【スキル名】' },
        ]),
        slot: 'P',
      });
    } else if (category === 'ultimate') {
      if (detail.spells.length < 4) continue;
      const spell = detail.spells[3];
      pool.push({
        championName: detail.name,
        skillName: spell.name,
        description: maskAnswer(spell.description, [
          { name: detail.name, placeholder: '【チャンピオン】' },
          { name: spell.name, placeholder: '【スキル名】' },
        ]),
        slot: 'R',
      });
    } else {
      const slots = ['Q', 'W', 'E'] as const;
      detail.spells.slice(0, 3).forEach((spell, i) => {
        pool.push({
          championName: detail.name,
          skillName: spell.name,
          description: maskAnswer(spell.description, [
            { name: detail.name, placeholder: '【チャンピオン】' },
            { name: spell.name, placeholder: '【スキル名】' },
          ]),
          slot: slots[i],
        });
      });
    }
  }

  const namePool = pool.map((e) => `${e.championName} / ${e.skillName}`);
  const questions = shuffle(pool).slice(0, count);

  return questions.map((entry, i) => {
    const correctChoice = `${entry.championName} / ${entry.skillName}`;
    const distractors = pickDistractors(namePool, correctChoice);
    return {
      id: `${category}_${i}_${entry.championName}`,
      meta: {
        category,
        championName: entry.championName,
        skillSlot: entry.slot,
        skillName: entry.skillName,
      },
      description: entry.description,
      difficulty: 'medium' as const,
      choices: shuffle([correctChoice, ...distractors]),
      correctChoice,
    };
  });
}

async function generateItemQuestions(count: number): Promise<QuizQuestion[]> {
  const allItems = await getItems();
  const pool = shuffle(allItems).slice(0, Math.min(50, allItems.length));
  const selected = pool.slice(0, count);
  const namePool = pool.map((item) => item.name);

  return selected.map((item, i) => {
    const distractors = pickDistractors(namePool, item.name);
    return {
      id: `item_${i}_${item.id}`,
      meta: { category: 'item' as const, itemName: item.name },
      description: maskAnswer(stripHtml(item.description), [
        { name: item.name, placeholder: '【アイテム名】' },
      ]),
      difficulty: 'medium' as const,
      choices: shuffle([item.name, ...distractors]),
      correctChoice: item.name,
    };
  });
}

async function generateRuneQuestions(count: number): Promise<QuizQuestion[]> {
  const allRunes = await getRunes();
  const pool = shuffle(allRunes);
  const selected = pool.slice(0, count);
  const namePool = pool.map((r) => r.name);

  return selected.map((rune, i) => {
    const distractors = pickDistractors(namePool, rune.name);
    return {
      id: `rune_${i}_${rune.key}`,
      meta: { category: 'rune' as const, runeName: rune.name },
      description: maskAnswer(stripHtml(rune.shortDesc), [
        { name: rune.name, placeholder: '【ルーン名】' },
      ]),
      difficulty: 'medium' as const,
      choices: shuffle([rune.name, ...distractors]),
      correctChoice: rune.name,
    };
  });
}

export async function generateQuestions(
  category: QuizCategory,
  count = 10
): Promise<QuizQuestion[]> {
  switch (category) {
    case 'skill':
    case 'ultimate':
    case 'passive':
      return generateSkillQuestions(category, count);
    case 'item':
      return generateItemQuestions(count);
    case 'rune':
      return generateRuneQuestions(count);
  }
}
