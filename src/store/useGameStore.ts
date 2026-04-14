import { useState, useCallback } from "react";
import type { UpgradeCosts } from "../game/types";

const BASE_COSTS: UpgradeCosts = {
  heroSpeed: 50,
  heroCount: 100,
  specialDotChance: 75,
};

const COST_MULTIPLIER = 1.8;
const MAX_HEROES = 10;
const MAX_HERO_SPEED = 5;
const MAX_SPECIAL_CHANCE = 0.5;

export function useGameStore() {
  const [money, setMoney] = useState(0);
  const [heroCount, setHeroCount] = useState(1);
  const [heroSpeed, setHeroSpeed] = useState(1);
  const [specialDotChance, setSpecialDotChance] = useState(0.05);
  const [speedLevel, setSpeedLevel] = useState(0);
  const [heroCountLevel, setHeroCountLevel] = useState(0);
  const [specialLevel, setSpecialLevel] = useState(0);

  const upgradeCosts: UpgradeCosts = {
    heroSpeed:
      heroSpeed >= MAX_HERO_SPEED
        ? Infinity
        : Math.floor(BASE_COSTS.heroSpeed * Math.pow(COST_MULTIPLIER, speedLevel)),
    heroCount:
      heroCount >= MAX_HEROES
        ? Infinity
        : Math.floor(BASE_COSTS.heroCount * Math.pow(COST_MULTIPLIER, heroCountLevel)),
    specialDotChance:
      specialDotChance >= MAX_SPECIAL_CHANCE
        ? Infinity
        : Math.floor(BASE_COSTS.specialDotChance * Math.pow(COST_MULTIPLIER, specialLevel)),
  };

  const addMoney = useCallback((amount: number) => {
    setMoney((prev) => prev + amount);
  }, []);

  const upgradeHeroSpeed = useCallback(() => {
    const cost = Math.floor(BASE_COSTS.heroSpeed * Math.pow(COST_MULTIPLIER, speedLevel));
    setMoney((prev) => {
      if (prev < cost) return prev;
      setHeroSpeed((s) => Math.min(s + 0.5, MAX_HERO_SPEED));
      setSpeedLevel((l) => l + 1);
      return prev - cost;
    });
  }, [speedLevel]);

  const upgradeHeroCount = useCallback(() => {
    const cost = Math.floor(BASE_COSTS.heroCount * Math.pow(COST_MULTIPLIER, heroCountLevel));
    setMoney((prev) => {
      if (prev < cost || heroCount >= MAX_HEROES) return prev;
      setHeroCount((c) => Math.min(c + 1, MAX_HEROES));
      setHeroCountLevel((l) => l + 1);
      return prev - cost;
    });
  }, [heroCountLevel, heroCount]);

  const upgradeSpecialDotChance = useCallback(() => {
    const cost = Math.floor(BASE_COSTS.specialDotChance * Math.pow(COST_MULTIPLIER, specialLevel));
    setMoney((prev) => {
      if (prev < cost || specialDotChance >= MAX_SPECIAL_CHANCE) return prev;
      setSpecialDotChance((c) => Math.min(c + 0.05, MAX_SPECIAL_CHANCE));
      setSpecialLevel((l) => l + 1);
      return prev - cost;
    });
  }, [specialLevel, specialDotChance]);

  return {
    money,
    heroCount,
    heroSpeed,
    specialDotChance,
    upgradeCosts,
    addMoney,
    upgradeHeroSpeed,
    upgradeHeroCount,
    upgradeSpecialDotChance,
  };
}
