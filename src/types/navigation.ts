import { QuizCategory, QuizQuestion } from './quiz';

export type RootStackParamList = {
  Home: undefined;
  Quiz: {
    category: QuizCategory;
    difficulty: 'easy' | 'medium' | 'hard';
    reviewQuestions?: QuizQuestion[];
  };
  Result: {
    score: number;
    total: number;
    category: QuizCategory;
    difficulty: 'easy' | 'medium' | 'hard';
    wrongQuestions: QuizQuestion[];
  };
  ChampionList: undefined;
  ChampionDetail: { championId: string; championName: string };
};
