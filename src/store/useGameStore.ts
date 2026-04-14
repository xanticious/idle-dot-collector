import { useState, useCallback } from "react";
import type { UpgradeCosts } from "../game/types";

const BASE_COSTS: UpgradeCosts = {
  heroSpeed: 50,
  heroCount: 100,
  specialDotChance: 75,
};

const COST_MULTIPLIER = 1.8;
const MAX_HERO_COUNT_LEVEL = 9;  // 1 + 9 = 10 heroes max
const MAX_SPEED_LEVEL = 8;       // 1 + 8*0.5 = 5 speed max
const MAX_SPECIAL_LEVEL = 9;     // 0.05 + 9*0.05 = 0.5 chance max

export function useGameStore() {
  const [money, setMoney] = useState(0);

  // Unlocked levels (how many upgrades have been purchased)
  const [speedLevel, setSpeedLevel] = useState(0);
  const [heroCountLevel, setHeroCountLevel] = useState(0);
  const [specialLevel, setSpecialLevel] = useState(0);

  // Active levels chosen by the player (0 = base, up to the unlocked level)
  const [activeSpeedLevel, setActiveSpeedLevelState] = useState(0);
  const [activeHeroCountLevel, setActiveHeroCountLevelState] = useState(0);
  const [activeSpecialLevel, setActiveSpecialLevelState] = useState(0);

  // Derived active values used by the game engine
  const heroCount = 1 + activeHeroCountLevel;
  const heroSpeed = 1 + activeSpeedLevel * 0.5;
  const specialDotChance = 0.05 + activeSpecialLevel * 0.05;

  const upgradeCosts: UpgradeCosts = {
    heroSpeed:
      speedLevel >= MAX_SPEED_LEVEL
        ? Infinity
        : Math.floor(BASE_COSTS.heroSpeed * Math.pow(COST_MULTIPLIER, speedLevel)),
    heroCount:
      heroCountLevel >= MAX_HERO_COUNT_LEVEL
        ? Infinity
        : Math.floor(BASE_COSTS.heroCount * Math.pow(COST_MULTIPLIER, heroCountLevel)),
    specialDotChance:
      specialLevel >= MAX_SPECIAL_LEVEL
        ? Infinity
        : Math.floor(BASE_COSTS.specialDotChance * Math.pow(COST_MULTIPLIER, specialLevel)),
  };

  const addMoney = useCallback((amount: number) => {
    setMoney((prev) => prev + amount);
  }, []);

  const upgradeHeroSpeed = useCallback(() => {
    const cost = Math.floor(BASE_COSTS.heroSpeed * Math.pow(COST_MULTIPLIER, speedLevel));
    setMoney((prev) => {
      if (prev < cost || speedLevel >= MAX_SPEED_LEVEL) return prev;
      setSpeedLevel((l) => l + 1);
      return prev - cost;
    });
  }, [speedLevel]);

  const upgradeHeroCount = useCallback(() => {
    const cost = Math.floor(BASE_COSTS.heroCount * Math.pow(COST_MULTIPLIER, heroCountLevel));
    setMoney((prev) => {
      if (prev < cost || heroCountLevel >= MAX_HERO_COUNT_LEVEL) return prev;
      setHeroCountLevel((l) => l + 1);
      return prev - cost;
    });
  }, [heroCountLevel]);

  const upgradeSpecialDotChance = useCallback(() => {
    const cost = Math.floor(BASE_COSTS.specialDotChance * Math.pow(COST_MULTIPLIER, specialLevel));
    setMoney((prev) => {
      if (prev < cost || specialLevel >= MAX_SPECIAL_LEVEL) return prev;
      setSpecialLevel((l) => l + 1);
      return prev - cost;
    });
  }, [specialLevel]);

  const setActiveHeroCountLevel = useCallback((level: number) => {
    setActiveHeroCountLevelState(Math.max(0, Math.min(level, heroCountLevel)));
  }, [heroCountLevel]);

  const setActiveSpeedLevel = useCallback((level: number) => {
    setActiveSpeedLevelState(Math.max(0, Math.min(level, speedLevel)));
  }, [speedLevel]);

  const setActiveSpecialLevel = useCallback((level: number) => {
    setActiveSpecialLevelState(Math.max(0, Math.min(level, specialLevel)));
  }, [specialLevel]);

  return {
    money,
    heroCount,
    heroSpeed,
    specialDotChance,
    heroCountLevel,
    speedLevel,
    specialLevel,
    activeHeroCountLevel,
    activeSpeedLevel,
    activeSpecialLevel,
    upgradeCosts,
    addMoney,
    upgradeHeroSpeed,
    upgradeHeroCount,
    upgradeSpecialDotChance,
    setActiveHeroCountLevel,
    setActiveSpeedLevel,
    setActiveSpecialLevel,
  };
}
