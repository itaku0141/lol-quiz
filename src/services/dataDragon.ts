import AsyncStorage from '@react-native-async-storage/async-storage';
import { CHAMPION_LANES } from '../data/championLanes';
import { ChampionDetail, ChampionSummary } from '../types/champion';
import { stripHtml } from '../utils/stripHtml';

const BASE = 'https://ddragon.leagueoflegends.com';

// 並列呼び出し時の重複リクエストを防ぐ in-flight キャッシュ (A5)
let _versionPromise: Promise<string> | null = null;

async function fetchLatestVersion(): Promise<string> {
  if (!_versionPromise) {
    _versionPromise = fetch(`${BASE}/api/versions.json`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`); // A1
        return res.json() as Promise<string[]>;
      })
      .then((versions) => versions[0])
      .finally(() => { _versionPromise = null; });
  }
  return _versionPromise;
}

async function safeParse<T>(json: string, cacheKey: string): Promise<T | null> {
  try {
    return JSON.parse(json) as T; // A2: 破損時は null を返して呼び元が再フェッチ
  } catch {
    await AsyncStorage.removeItem(cacheKey).catch(() => {});
    return null;
  }
}

export async function getChampions(): Promise<ChampionSummary[]> {
  const latest = await fetchLatestVersion();
  const [cachedVersion, cachedData] = await Promise.all([
    AsyncStorage.getItem('ddragon_version_v2'),
    AsyncStorage.getItem('ddragon_champions'),
  ]);

  if (cachedVersion === latest && cachedData) {
    const parsed = await safeParse<ChampionSummary[]>(cachedData, 'ddragon_champions');
    if (parsed) return parsed;
  }

  const res = await fetch(`${BASE}/cdn/${latest}/data/ja_JP/champion.json`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`); // A1
  const json = await res.json();

  const champions: ChampionSummary[] = Object.values<{
    id: string;
    key: string;
    name: string;
    title: string;
    tags: string[];
    image: { full: string };
  }>(json.data)
    .map((c) => ({
      id: c.id,
      key: c.key,
      name: c.name,
      title: c.title,
      iconUrl: `${BASE}/cdn/${latest}/img/champion/${c.image.full}`,
      tags: c.tags,
      lanes: CHAMPION_LANES[c.id] ?? [],
    }))
    .sort((a, b) => a.name.localeCompare(b.name, 'ja'));

  await AsyncStorage.multiSet([
    ['ddragon_version_v2', latest],
    ['ddragon_champions', JSON.stringify(champions)],
  ]).catch(() => {}); // A3: キャッシュ書き込み失敗は無視して続行

  return champions;
}

export type ItemInfo = {
  id: string;
  name: string;
  description: string;
};

export type RuneInfo = {
  id: number;
  key: string;
  name: string;
  shortDesc: string;
};

export async function getItems(): Promise<ItemInfo[]> {
  const latest = await fetchLatestVersion();
  const [cachedVersion, cached] = await Promise.all([
    AsyncStorage.getItem('ddragon_items_version'),
    AsyncStorage.getItem('ddragon_items'),
  ]);

  if (cachedVersion === latest && cached) {
    const parsed = await safeParse<ItemInfo[]>(cached, 'ddragon_items');
    if (parsed) return parsed;
  }

  const res = await fetch(`${BASE}/cdn/${latest}/data/ja_JP/item.json`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`); // A1
  const json = await res.json();

  const items: ItemInfo[] = Object.entries<{
    name: string;
    description: string;
    hideFromAll?: boolean;
    maps: Record<string, boolean>;
    gold: { purchasable: boolean };
  }>(json.data)
    .filter(([, item]) =>
      item.gold.purchasable &&
      !item.hideFromAll &&
      item.maps['11'] === true
    )
    .map(([id, item]) => ({
      id,
      name: item.name,
      description: item.description,
    }));

  await AsyncStorage.multiSet([
    ['ddragon_items_version', latest],
    ['ddragon_items', JSON.stringify(items)],
  ]).catch(() => {}); // A3

  return items;
}

export async function getRunes(): Promise<RuneInfo[]> {
  const latest = await fetchLatestVersion();
  const [cachedVersion, cached] = await Promise.all([
    AsyncStorage.getItem('ddragon_runes_version'),
    AsyncStorage.getItem('ddragon_runes'),
  ]);

  if (cachedVersion === latest && cached) {
    const parsed = await safeParse<RuneInfo[]>(cached, 'ddragon_runes');
    if (parsed) return parsed;
  }

  const res = await fetch(`${BASE}/cdn/${latest}/data/ja_JP/runesReforged.json`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`); // A1
  const paths: {
    slots: {
      runes: { id: number; key: string; name: string; shortDesc: string }[];
    }[];
  }[] = await res.json();

  const runes: RuneInfo[] = paths.flatMap((path) =>
    path.slots.flatMap((slot) =>
      slot.runes.map((rune) => ({
        id: rune.id,
        key: rune.key,
        name: rune.name,
        shortDesc: rune.shortDesc,
      }))
    )
  );

  await AsyncStorage.multiSet([
    ['ddragon_runes_version', latest],
    ['ddragon_runes', JSON.stringify(runes)],
  ]).catch(() => {}); // A3

  return runes;
}

export async function getChampionDetail(championId: string): Promise<ChampionDetail> {
  const cacheKey = `ddragon_champion_${championId}`;
  const cached = await AsyncStorage.getItem(cacheKey);
  if (cached) {
    const parsed = await safeParse<ChampionDetail>(cached, cacheKey);
    if (parsed) return parsed;
  }

  const version = (await AsyncStorage.getItem('ddragon_version_v2')) ?? await fetchLatestVersion(); // A4: 正しいキーを参照
  const res = await fetch(`${BASE}/cdn/${version}/data/ja_JP/champion/${championId}.json`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`); // A1
  const json = await res.json();
  const raw = json.data[championId];

  const detail: ChampionDetail = {
    id: raw.id,
    name: raw.name,
    title: raw.title,
    passive: {
      id: raw.passive.image.full,
      name: raw.passive.name,
      description: stripHtml(raw.passive.description),
      iconUrl: `${BASE}/cdn/${version}/img/passive/${raw.passive.image.full}`,
    },
    spells: (raw.spells as {
      id: string;
      name: string;
      description: string;
      image: { full: string };
    }[]).slice(0, 4).map((spell) => ({
      id: spell.id,
      name: spell.name,
      description: stripHtml(spell.description),
      iconUrl: `${BASE}/cdn/${version}/img/spell/${spell.image.full}`,
    })) as ChampionDetail['spells'],
  };

  await AsyncStorage.setItem(cacheKey, JSON.stringify(detail)).catch(() => {}); // A3
  return detail;
}
