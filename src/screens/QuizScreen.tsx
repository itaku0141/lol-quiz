import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ChoiceButton from '../components/ChoiceButton';
import ProgressBar from '../components/ProgressBar';
import { generateQuestions } from '../utils/generateQuestions';
import { Colors } from '../theme/colors';
import { QuizQuestion } from '../types/quiz';
import { RootStackParamList } from '../types/navigation';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Quiz'>;
  route: RouteProp<RootStackParamList, 'Quiz'>;
};

type QuizPhase =
  | { answered: false }
  | { answered: true; selectedChoice: string; isCorrect: boolean };

type QuizState = {
  currentIndex: number;
  phase: QuizPhase;
};

type ScreenPhase =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; questions: QuizQuestion[] };

function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export default function QuizScreen({ navigation, route }: Props) {
  const { category, difficulty } = route.params;

  const [screenPhase, setScreenPhase] = useState<ScreenPhase>({ status: 'loading' });
  const [quizState, setQuizState] = useState<QuizState>({
    currentIndex: 0,
    phase: { answered: false },
  });

  const scoreRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    scoreRef.current = 0;
    setQuizState({ currentIndex: 0, phase: { answered: false } });
    setScreenPhase({ status: 'loading' });

    generateQuestions(category)
      .then((qs) => {
        setScreenPhase({ status: 'ready', questions: qs });
      })
      .catch(() => {
        setScreenPhase({ status: 'error', message: '問題の生成に失敗しました。\nネットワーク接続を確認してください。' });
      });

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [category]);

  if (screenPhase.status === 'loading') {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.accent} />
        <Text style={styles.centerText}>問題を生成中...</Text>
      </View>
    );
  }

  if (screenPhase.status === 'error') {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{screenPhase.message}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setScreenPhase({ status: 'loading' });
            generateQuestions(category)
              .then((qs) => setScreenPhase({ status: 'ready', questions: qs }))
              .catch(() => setScreenPhase({ status: 'error', message: '問題の生成に失敗しました。\nネットワーク接続を確認してください。' }));
          }}
        >
          <Text style={styles.retryText}>再試行</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { questions } = screenPhase;
  const { currentIndex, phase } = quizState;
  const currentQuestion = questions[currentIndex];
  const total = questions.length;

  const handleChoicePress = (choice: string) => {
    if (phase.answered) return;

    const isCorrect = choice === currentQuestion.correctChoice;
    if (isCorrect) scoreRef.current += 1;

    setQuizState(prev => ({ ...prev, phase: { answered: true, selectedChoice: choice, isCorrect } }));

    timeoutRef.current = setTimeout(() => {
      if (currentIndex < total - 1) {
        setQuizState({ currentIndex: currentIndex + 1, phase: { answered: false } });
      } else {
        navigation.replace('Result', {
          score: scoreRef.current,
          total,
          category,
          difficulty,
        });
      }
    }, 1200);
  };

  const getChoiceState = (choice: string) => {
    if (!phase.answered) return 'default';
    if (choice === phase.selectedChoice) return phase.isCorrect ? 'correct' : 'incorrect';
    if (choice === currentQuestion.correctChoice) return 'correct';
    return 'disabled';
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <ProgressBar current={currentIndex + 1} total={total} />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <Text style={styles.questionText}>{currentQuestion.description}</Text>
          </View>

          <View style={styles.choices}>
            {currentQuestion.choices.map((choice) => (
              <ChoiceButton
                key={choice}
                label={choice}
                state={getChoiceState(choice)}
                onPress={() => handleChoicePress(choice)}
              />
            ))}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  center: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 24,
  },
  centerText: {
    color: Colors.textDim,
    fontSize: 14,
  },
  errorText: {
    color: Colors.textDim,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: Colors.accent,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  retryText: {
    color: Colors.background,
    fontWeight: '700',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 20,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    gap: 24,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  questionText: {
    color: Colors.text,
    fontSize: 16,
    lineHeight: 26,
  },
  choices: {},
});
