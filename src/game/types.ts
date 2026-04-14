export interface GameConfig {
  heroCount: number;
  heroSpeed: number;
  specialDotChance: number;
}

export interface UpgradeCosts {
  heroSpeed: number;
  heroCount: number;
  specialDotChance: number;
}

export interface HeroData {
  id: number;
  x: number;
  y: number;
  color: number;
}

export interface DotData {
  id: number;
  x: number;
  y: number;
  isSpecial: boolean;
  value: number;
}
