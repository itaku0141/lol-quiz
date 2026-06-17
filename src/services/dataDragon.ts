import AsyncStorage from '@react-native-async-storage/async-storage';
import { CHAMPION_LANES } from '../data/championLanes';
import { ChampionDetail, ChampionSummary } from '../types/champion';
import { stripHtml } from '../utils/stripHtml';

const BASE = 'https://ddragon.leagueoflegends.com';

async function fetchLatestVersion(): Promise<string> {
  const res = await fetch(`${BASE}/api/versions.json`);
  const versions: string[] = await res.json();
  return versions[0];
}

export async function getChampions(): Promise<ChampionSummary[]> {
  const latest = await fetchLatestVersion();
  const cachedVersion = await AsyncStorage.getItem('ddragon_version_v2');
  const cachedData = await AsyncStorage.getItem('ddragon_champions');

  if (cachedVersion === latest && cachedData) {
    return JSON.parse(cachedData) as ChampionSummary[];
  }

  const res = await fetch(`${BASE}/cdn/${latest}/data/ja_JP/champion.json`);
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
  ]);

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
  const cached = await AsyncStorage.getItem('ddragon_items');
  const cachedVersion = await AsyncStorage.getItem('ddragon_items_version');

  if (cachedVersion === latest && cached) {
    return JSON.parse(cached) as ItemInfo[];
  }

  const res = await fetch(`${BASE}/cdn/${latest}/data/ja_JP/item.json`);
  const json = await res.json();

  const items: ItemInfo[] = Object.entries<{
    name: string;
    description: string;
    hideFromAll?: boolean;
    inStore?: boolean;
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
  ]);

  return items;
}

export async function getRunes(): Promise<RuneInfo[]> {
  const latest = await fetchLatestVersion();
  const cached = await AsyncStorage.getItem('ddragon_runes');
  const cachedVersion = await AsyncStorage.getItem('ddragon_runes_version');

  if (cachedVersion === latest && cached) {
    return JSON.parse(cached) as RuneInfo[];
  }

  const res = await fetch(`${BASE}/cdn/${latest}/data/ja_JP/runesReforged.json`);
  const paths: {
    id: number;
    key: string;
    name: string;
    slots: {
      runes: {
        id: number;
        key: string;
        name: string;
        shortDesc: string;
      }[];
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
  ]);

  return runes;
}

export async function getChampionDetail(championId: string): Promise<ChampionDetail> {
  const cacheKey = `ddragon_champion_${championId}`;
  const cached = await AsyncStorage.getItem(cacheKey);
  if (cached) return JSON.parse(cached) as ChampionDetail;

  const version = (await AsyncStorage.getItem('ddragon_version')) ?? await fetchLatestVersion();
  const res = await fetch(`${BASE}/cdn/${version}/data/ja_JP/champion/${championId}.json`);
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

  await AsyncStorage.setItem(cacheKey, JSON.stringify(detail));
  return detail;
}
