export type LaneRole = 'top' | 'jungle' | 'mid' | 'adc' | 'support';

export type ChampionSummary = {
  id: string;
  key: string;
  name: string;
  title: string;
  iconUrl: string;
  tags: string[];     // e.g. ["Fighter", "Tank"]
  lanes: LaneRole[];  // e.g. ["top", "jungle"]
};

export type ChampionSkillInfo = {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
};

export type ChampionDetail = {
  id: string;
  name: string;
  title: string;
  passive: ChampionSkillInfo;
  spells: [ChampionSkillInfo, ChampionSkillInfo, ChampionSkillInfo, ChampionSkillInfo];
};
