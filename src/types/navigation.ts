import { QuizCategory } from './quiz';

export type RootStackParamList = {
  Home: undefined;
  Quiz: { category: QuizCategory; difficulty: 'easy' | 'medium' | 'hard' };
  Result: {
    score: number;
    total: number;
    category: QuizCategory;
    difficulty: 'easy' | 'medium' | 'hard';
  };
  ChampionList: undefined;
  ChampionDetail: { championId: string; championName: string };
};
