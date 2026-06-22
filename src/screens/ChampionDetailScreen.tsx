import { RouteProp } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { getChampionDetail } from '../services/dataDragon';
import { Colors } from '../theme/colors';
import { RootStackParamList } from '../types/navigation';
import { ChampionDetail, ChampionSkillInfo } from '../types/champion';

type Props = {
  route: RouteProp<RootStackParamList, 'ChampionDetail'>;
};

const SLOT_LABELS = ['パッシブ', 'Q', 'W', 'E', 'R'] as const;

function SkillCard({ skill, slot }: { skill: ChampionSkillInfo; slot: string }) {
  return (
    <View style={styles.skillCard}>
      <View style={styles.skillHeader}>
        <View style={styles.slotBadge}>
          <Text style={styles.slotLabel}>{slot}</Text>
        </View>
        <Image source={{ uri: skill.iconUrl }} style={styles.skillIcon} />
        <Text style={styles.skillName}>{skill.name}</Text>
      </View>
      <Text style={styles.skillDescription}>{skill.description}</Text>
    </View>
  );
}

export default function ChampionDetailScreen({ route }: Props) {
  const { championId } = route.params;
  const [detail, setDetail] = useState<ChampionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getChampionDetail(championId)
      .then((d) => {
        if (!cancelled) setDetail(d);
      })
      .catch(() => {
        if (!cancelled) setError('データの読み込みに失敗しました');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [championId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  if (error || !detail) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error ?? 'エラーが発生しました'}</Text>
      </View>
    );
  }

  const allSkills = [detail.passive, ...detail.spells];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <Image source={{ uri: detail.passive.iconUrl }} style={styles.heroIcon} />
          <View style={styles.heroText}>
            <Text style={styles.heroName}>{detail.name}</Text>
            <Text style={styles.heroTitle}>{detail.title}</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>スキル</Text>

        {allSkills.map((skill, index) => (
          <SkillCard key={skill.id} skill={skill} slot={SLOT_LABELS[index]} />
        ))}
      </ScrollView>
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
  },
  errorText: {
    color: Colors.textDim,
    fontSize: 14,
  },
  scroll: {
    padding: 16,
    gap: 12,
  },
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 4,
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: Colors.border,
  },
  heroText: {
    flex: 1,
    gap: 4,
  },
  heroName: {
    color: Colors.accent,
    fontSize: 22,
    fontWeight: '800',
  },
  heroTitle: {
    color: Colors.textDim,
    fontSize: 13,
  },
  sectionLabel: {
    color: Colors.textDim,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  skillCard: {
    backgroundColor: Colors.card,
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
  },
  skillHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  slotBadge: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotLabel: {
    color: Colors.accent,
    fontSize: 12,
    fontWeight: '800',
  },
  skillIcon: {
    width: 44,
    height: 44,
    borderRadius: 6,
    backgroundColor: Colors.border,
  },
  skillName: {
    flex: 1,
    color: Colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  skillDescription: {
    color: Colors.textDim,
    fontSize: 13,
    lineHeight: 20,
  },
});
