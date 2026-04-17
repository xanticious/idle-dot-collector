export interface GameConfig {
  heroCount: number;
  heroSpeed: number;
  unlockedOrbLevel: number; // 0 = only white orbs; 8 = all 9 types available
  betterOrbsParam: number; // exponential distribution parameter; higher = rarer orbs more likely
  heroMaxHp: number; // max hit points per hero
  activeQuestCreatureIdx: number | null; // null = no active quest
}

export interface UpgradeCosts {
  heroSpeed: number;
  heroCount: number;
  unlockOrbs: number;
  betterOrbs: number;
  heroHealth: number;
  questUnlock: number;
}

export interface HeroData {
  id: number;
  x: number;
  y: number;
  color: number;
}

export interface OrbData {
  id: number;
  x: number;
  y: number;
  orbTypeIndex: number; // index into ORB_TYPES
  value: number;
}
