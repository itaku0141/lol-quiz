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

export default function QuizScreen({ navigation, route }: Props) {
  const { category, difficulty, reviewQuestions } = route.params;

  const [screenPhase, setScreenPhase] = useState<ScreenPhase>({ status: 'loading' });
  const [quizState, setQuizState] = useState<QuizState>({
    currentIndex: 0,
    phase: { answered: false },
  });

  const scoreRef = useRef(0);
  const wrongRef = useRef<QuizQuestion[]>([]);

  useEffect(() => {
    let cancelled = false;
    scoreRef.current = 0;
    wrongRef.current = [];
    setQuizState({ currentIndex: 0, phase: { answered: false } });

    if (reviewQuestions) {
      setScreenPhase({ status: 'ready', questions: reviewQuestions });
      return;
    }

    setScreenPhase({ status: 'loading' });
    generateQuestions(category)
      .then((qs) => { if (!cancelled) setScreenPhase({ status: 'ready', questions: qs }); })
      .catch(() => { if (!cancelled) setScreenPhase({ status: 'error', message: '問題の生成に失敗しました。\nネットワーク接続を確認してください。' }); });
    return () => { cancelled = true; };
  }, [category, reviewQuestions]);

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
          style={styles.nextButton}
          onPress={() => {
            setScreenPhase({ status: 'loading' });
            generateQuestions(category)
              .then((qs) => setScreenPhase({ status: 'ready', questions: qs }))
              .catch(() => setScreenPhase({ status: 'error', message: '問題の生成に失敗しました。\nネットワーク接続を確認してください。' }));
          }}
        >
          <Text style={styles.nextButtonText}>再試行</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { questions } = screenPhase;
  const { currentIndex, phase } = quizState;
  const currentQuestion = questions[currentIndex];
  const total = questions.length;
  const isLast = currentIndex === total - 1;

  const handleChoicePress = (choice: string) => {
    if (phase.answered) return;
    const isCorrect = choice === currentQuestion.correctChoice;
    if (isCorrect) {
      scoreRef.current += 1;
    } else {
      wrongRef.current = [...wrongRef.current, currentQuestion];
    }
    setQuizState(prev => ({ ...prev, phase: { answered: true, selectedChoice: choice, isCorrect } }));
  };

  const handleNext = () => {
    if (isLast) {
      navigation.replace('Result', {
        score: scoreRef.current,
        total,
        category,
        difficulty,
        wrongQuestions: wrongRef.current,
      });
    } else {
      setQuizState({ currentIndex: currentIndex + 1, phase: { answered: false } });
    }
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
            {currentQuestion.choices.map((choice, i) => (
              <ChoiceButton
                key={`${i}_${choice}`}
                label={choice}
                state={getChoiceState(choice)}
                onPress={() => handleChoicePress(choice)}
              />
            ))}
          </View>

          {phase.answered && (
            <>
              <View style={[styles.resultBanner, phase.isCorrect ? styles.resultCorrect : styles.resultIncorrect]}>
                <Text style={styles.resultIcon}>{phase.isCorrect ? '✓' : '✗'}</Text>
                <Text style={styles.resultText}>
                  {phase.isCorrect ? '正解！' : `不正解　正解：${currentQuestion.correctChoice}`}
                </Text>
              </View>
              <TouchableOpacity style={styles.nextButton} onPress={handleNext} activeOpacity={0.8}>
                <Text style={styles.nextButtonText}>
                  {isLast ? '結果を見る' : '次の問題へ'}
                </Text>
              </TouchableOpacity>
            </>
          )}
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
  resultBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
  },
  resultCorrect: {
    backgroundColor: '#1A3A1E',
    borderColor: Colors.correct,
  },
  resultIncorrect: {
    backgroundColor: '#3A1A1A',
    borderColor: Colors.incorrect,
  },
  resultIcon: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  resultText: {
    flex: 1,
    color: Colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: Colors.accent,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  nextButtonText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: '700',
  },
});
