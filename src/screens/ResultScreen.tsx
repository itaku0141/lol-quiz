import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../theme/colors';
import { RootStackParamList } from '../types/navigation';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Result'>;
  route: RouteProp<RootStackParamList, 'Result'>;
};

function getEvaluation(score: number, total: number): string {
  if (total === 0) return 'エラー'; // D1
  const ratio = score / total;
  if (ratio === 1) return '完璧！さすがの知識力！';
  if (ratio >= 0.8) return '素晴らしい！かなり詳しいね！';
  if (ratio >= 0.6) return 'なかなかいける！';
  if (ratio >= 0.4) return 'もう少し！復習しよう';
  return 'まだまだこれから！';
}

export default function ResultScreen({ navigation, route }: Props) {
  const { score, total, category, difficulty, wrongQuestions } = route.params;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.scoreArea}>
          <Text style={styles.resultLabel}>結果</Text>
          <View style={styles.scoreRow}>
            <Text style={styles.scoreNumber}>{score}</Text>
            <Text style={styles.scoreSlash}> / </Text>
            <Text style={styles.scoreTotal}>{total}</Text>
          </View>
          <Text style={styles.evaluation}>{getEvaluation(score, total)}</Text>
        </View>

        <View style={styles.buttons}>
          {wrongQuestions.length > 0 && (
            <TouchableOpacity
              style={styles.reviewButton}
              onPress={() => navigation.replace('Quiz', { category, difficulty, reviewQuestions: wrongQuestions })}
              activeOpacity={0.8}
            >
              <Text style={styles.reviewText}>間違えた {wrongQuestions.length} 問を復習</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => navigation.replace('Quiz', { category, difficulty })}
            activeOpacity={0.8}
          >
            <Text style={styles.retryText}>もう一度挑戦</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.homeButton}
            onPress={() => navigation.navigate('Home')}
            activeOpacity={0.8}
          >
            <Text style={styles.homeText}>ホームに戻る</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    gap: 56,
  },
  scoreArea: {
    alignItems: 'center',
    gap: 12,
  },
  resultLabel: {
    color: Colors.textDim,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scoreNumber: {
    color: Colors.accent,
    fontSize: 80,
    fontWeight: '800',
    lineHeight: 90,
  },
  scoreSlash: {
    color: Colors.textDim,
    fontSize: 40,
  },
  scoreTotal: {
    color: Colors.textDim,
    fontSize: 40,
    fontWeight: '600',
  },
  evaluation: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginTop: 4,
  },
  buttons: {
    gap: 14,
  },
  reviewButton: {
    backgroundColor: Colors.card,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.incorrect,
  },
  reviewText: {
    color: Colors.incorrect,
    fontSize: 16,
    fontWeight: '700',
  },
  retryButton: {
    backgroundColor: Colors.accent,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  retryText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: '800',
  },
  homeButton: {
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  homeText: {
    color: Colors.textDim,
    fontSize: 16,
    fontWeight: '600',
  },
});
