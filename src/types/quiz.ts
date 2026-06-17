export type QuizCategory = 'skill' | 'ultimate' | 'passive' | 'item' | 'rune';

export type SkillSlot = 'Q' | 'W' | 'E' | 'R' | 'P';

export type SkillMeta = {
  category: 'skill' | 'ultimate' | 'passive';
  championName: string;
  skillSlot: SkillSlot;
  skillName: string;
};

export type ItemMeta = {
  category: 'item';
  itemName: string;
};

export type RuneMeta = {
  category: 'rune';
  runeName: string;
};

export type QuizQuestion = {
  id: string;
  meta: SkillMeta | ItemMeta | RuneMeta;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  choices: string[];
  correctChoice: string;
};
