import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../theme/colors';
import { RootStackParamList } from '../types/navigation';
import { QuizCategory } from '../types/quiz';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

const CATEGORY_LABELS: Record<QuizCategory, string> = {
  skill: 'スキル (Q/W/E)',
  ultimate: 'アルティメット',
  passive: 'パッシブ',
  item: 'アイテム',
  rune: 'ルーン',
};

export default function HomeScreen({ navigation }: Props) {
  const [category, setCategory] = useState<QuizCategory>('skill');

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>LoL Quiz</Text>
          <Text style={styles.subtitle}>League of Legends の知識を試そう</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>カテゴリー</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chipScroll}
            contentContainerStyle={styles.chipRow}
          >
            {(Object.keys(CATEGORY_LABELS) as QuizCategory[]).map((key) => (
              <TouchableOpacity
                key={key}
                style={[styles.chip, category === key && styles.chipActive]}
                onPress={() => setCategory(key)}
              >
                <Text style={[styles.chipText, category === key && styles.chipTextActive]}>
                  {CATEGORY_LABELS[key]}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <TouchableOpacity
          style={styles.startButton}
          onPress={() => navigation.navigate('Quiz', { category, difficulty: 'medium' })}
          activeOpacity={0.8}
        >
          <Text style={styles.startText}>START</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.encyclopediaButton}
          onPress={() => navigation.navigate('ChampionList')}
          activeOpacity={0.8}
        >
          <Text style={styles.encyclopediaText}>チャンピオン図鑑</Text>
        </TouchableOpacity>
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
    gap: 32,
  },
  header: {
    alignItems: 'center',
    gap: 8,
  },
  title: {
    color: Colors.accent,
    fontSize: 42,
    fontWeight: '800',
    letterSpacing: 4,
  },
  subtitle: {
    color: Colors.textDim,
    fontSize: 14,
  },
  section: {
    gap: 12,
  },
  sectionLabel: {
    color: Colors.textDim,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  chipScroll: {
    flexGrow: 0,
    flexShrink: 0,
  },
  chipRow: {
    gap: 8,
    flexDirection: 'row',
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  chipActive: {
    borderColor: Colors.accent,
  },
  chipText: {
    color: Colors.textDim,
    fontSize: 14,
    fontWeight: '600',
  },
  chipTextActive: {
    color: Colors.accent,
  },
  startButton: {
    backgroundColor: Colors.accent,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  startText: {
    color: Colors.background,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 3,
  },
  encyclopediaButton: {
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  encyclopediaText: {
    color: Colors.textDim,
    fontSize: 15,
    fontWeight: '600',
  },
});
