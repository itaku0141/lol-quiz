import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { getChampions } from '../services/dataDragon';
import { Colors } from '../theme/colors';
import { ChampionSummary, LaneRole } from '../types/champion';
import { RootStackParamList } from '../types/navigation';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ChampionList'>;
};

const LANE_FILTERS: { key: LaneRole | 'all'; label: string }[] = [
  { key: 'all', label: '全て' },
  { key: 'top', label: 'トップ' },
  { key: 'jungle', label: 'JG' },
  { key: 'mid', label: 'ミッド' },
  { key: 'adc', label: 'ADC' },
  { key: 'support', label: 'サポート' },
];

const CLASS_FILTERS: { key: string; label: string }[] = [
  { key: 'all', label: '全て' },
  { key: 'Fighter', label: 'ファイター' },
  { key: 'Tank', label: 'タンク' },
  { key: 'Mage', label: 'メイジ' },
  { key: 'Assassin', label: 'アサシン' },
  { key: 'Marksman', label: 'マークスマン' },
  { key: 'Support', label: 'サポート' },
];

export default function ChampionListScreen({ navigation }: Props) {
  const [champions, setChampions] = useState<ChampionSummary[]>([]);
  const [search, setSearch] = useState('');
  const [laneFilter, setLaneFilter] = useState<LaneRole | 'all'>('all');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    getChampions()
      .then(setChampions)
      .catch(() => setError('データの読み込みに失敗しました。\nネットワーク接続を確認してください。'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim();
    return champions.filter((c) => {
      if (q && !c.name.includes(q)) return false;
      if (laneFilter !== 'all' && !c.lanes.includes(laneFilter)) return false;
      if (classFilter !== 'all' && !c.tags.includes(classFilter)) return false;
      return true;
    });
  }, [champions, search, laneFilter, classFilter]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.accent} />
        <Text style={styles.loadingText}>チャンピオンデータを取得中...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={load}>
          <Text style={styles.retryText}>再試行</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <TextInput
        style={styles.searchInput}
        placeholder="チャンピオン名で検索..."
        placeholderTextColor={Colors.textDim}
        value={search}
        onChangeText={setSearch}
        clearButtonMode="while-editing"
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterRow}
      >
        {LANE_FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.chip, laneFilter === f.key && styles.chipActive]}
            onPress={() => setLaneFilter(f.key as LaneRole | 'all')}
          >
            <Text style={[styles.chipText, laneFilter === f.key && styles.chipTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterRow}
      >
        {CLASS_FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.chip, classFilter === f.key && styles.chipActive]}
            onPress={() => setClassFilter(f.key)}
          >
            <Text style={[styles.chipText, classFilter === f.key && styles.chipTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.listContainer}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={styles.list}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.cell}
            onPress={() => navigation.navigate('ChampionDetail', { championId: item.id, championName: item.name })}
            activeOpacity={0.7}
          >
            <Image source={{ uri: item.iconUrl }} style={styles.icon} />
            <Text style={styles.name} numberOfLines={1}>
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
      />
      </View>
    </SafeAreaView>
  );
}

const CELL_SIZE = 100;

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
  loadingText: {
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
  searchInput: {
    margin: 12,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.text,
    fontSize: 15,
  },
  filterScroll: {
    flexShrink: 0,
    flexGrow: 0,
  },
  filterRow: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 8,
    flexDirection: 'row',
  },
  listContainer: {
    flex: 1,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  chipActive: {
    borderColor: Colors.accent,
    backgroundColor: Colors.card,
  },
  chipText: {
    color: Colors.textDim,
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextActive: {
    color: Colors.accent,
  },
  list: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 32,
  },
  row: {
    gap: 8,
    marginBottom: 8,
  },
  cell: {
    width: CELL_SIZE,
    alignItems: 'center',
    gap: 6,
  },
  icon: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  name: {
    color: Colors.text,
    fontSize: 11,
    textAlign: 'center',
    width: CELL_SIZE,
  },
});
