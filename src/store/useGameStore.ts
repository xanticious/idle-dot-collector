import { useState, useCallback } from "react";
import type { UpgradeCosts } from "../game/types";
import { QUEST_BUY_COSTS, CREATURE_TYPES } from "../game/creatureSpriteDefinitions";
import { ORB_TYPES } from "../game/orbSpriteDefinitions";

const BASE_COSTS: UpgradeCosts = {
  heroSpeed: 50,
  heroCount: 100,
  unlockOrbs: 150,
  betterOrbs: 100,
  heroHealth: 200,
  questUnlock: 500,
};

const COST_MULTIPLIER = 1.8;
const MAX_HERO_COUNT_LEVEL = 9;  // 1 + 9 = 10 heroes max
const MAX_SPEED_LEVEL = 8;       // 1 + 8*0.5 = 5 speed max
const MAX_UNLOCK_ORBS_LEVEL = ORB_TYPES.length - 1; // unlock all 9 orb types
const MAX_BETTER_ORBS_LEVEL = 8;  // betterOrbsParam up to 5.0
const MAX_HERO_HEALTH_LEVEL = 10; // heroMaxHp up to 60
const MAX_QUEST_UNLOCK_LEVEL = CREATURE_TYPES.length; // unlock all 5 creatures

export function useGameStore() {
  const [money, setMoney] = useState(0);

  // Upgrade levels (how many upgrades have been purchased)
  const [speedLevel, setSpeedLevel] = useState(0);
  const [heroCountLevel, setHeroCountLevel] = useState(0);
  const [unlockOrbsLevel, setUnlockOrbsLevel] = useState(0);
  const [betterOrbsLevel, setBetterOrbsLevel] = useState(0);
  const [heroHealthLevel, setHeroHealthLevel] = useState(0);
  const [questUnlockLevel, setQuestUnlockLevel] = useState(0);

  // Active levels chosen by the player (0 = base, up to the unlocked level)
  const [activeSpeedLevel, setActiveSpeedLevelState] = useState(0);
  const [activeHeroCountLevel, setActiveHeroCountLevelState] = useState(0);

  // Quest state
  const [activeQuestCreatureIdx, setActiveQuestCreatureIdx] = useState<number | null>(null);

  // Derived active values used by the game engine
  const heroCount = 1 + activeHeroCountLevel;
  const heroSpeed = 1 + activeSpeedLevel * 0.5;
  const unlockedOrbLevel = unlockOrbsLevel;
  const betterOrbsParam = 1 + betterOrbsLevel * 0.5;
  const heroMaxHp = 10 + heroHealthLevel * 5;

  const upgradeCosts: UpgradeCosts = {
    heroSpeed:
      speedLevel >= MAX_SPEED_LEVEL
        ? Infinity
        : Math.floor(BASE_COSTS.heroSpeed * Math.pow(COST_MULTIPLIER, speedLevel)),
    heroCount:
      heroCountLevel >= MAX_HERO_COUNT_LEVEL
        ? Infinity
        : Math.floor(BASE_COSTS.heroCount * Math.pow(COST_MULTIPLIER, heroCountLevel)),
    unlockOrbs:
      unlockOrbsLevel >= MAX_UNLOCK_ORBS_LEVEL
        ? Infinity
        : Math.floor(BASE_COSTS.unlockOrbs * Math.pow(COST_MULTIPLIER, unlockOrbsLevel)),
    betterOrbs:
      betterOrbsLevel >= MAX_BETTER_ORBS_LEVEL
        ? Infinity
        : Math.floor(BASE_COSTS.betterOrbs * Math.pow(COST_MULTIPLIER, betterOrbsLevel)),
    heroHealth:
      heroHealthLevel >= MAX_HERO_HEALTH_LEVEL
        ? Infinity
        : Math.floor(BASE_COSTS.heroHealth * Math.pow(COST_MULTIPLIER, heroHealthLevel)),
    questUnlock:
      questUnlockLevel >= MAX_QUEST_UNLOCK_LEVEL
        ? Infinity
        : Math.floor(BASE_COSTS.questUnlock * Math.pow(COST_MULTIPLIER, questUnlockLevel)),
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

  const upgradeUnlockOrbs = useCallback(() => {
    const cost = Math.floor(BASE_COSTS.unlockOrbs * Math.pow(COST_MULTIPLIER, unlockOrbsLevel));
    setMoney((prev) => {
      if (prev < cost || unlockOrbsLevel >= MAX_UNLOCK_ORBS_LEVEL) return prev;
      setUnlockOrbsLevel((l) => l + 1);
      return prev - cost;
    });
  }, [unlockOrbsLevel]);

  const upgradeBetterOrbs = useCallback(() => {
    const cost = Math.floor(BASE_COSTS.betterOrbs * Math.pow(COST_MULTIPLIER, betterOrbsLevel));
    setMoney((prev) => {
      if (prev < cost || betterOrbsLevel >= MAX_BETTER_ORBS_LEVEL) return prev;
      setBetterOrbsLevel((l) => l + 1);
      return prev - cost;
    });
  }, [betterOrbsLevel]);

  const upgradeHeroHealth = useCallback(() => {
    const cost = Math.floor(BASE_COSTS.heroHealth * Math.pow(COST_MULTIPLIER, heroHealthLevel));
    setMoney((prev) => {
      if (prev < cost || heroHealthLevel >= MAX_HERO_HEALTH_LEVEL) return prev;
      setHeroHealthLevel((l) => l + 1);
      return prev - cost;
    });
  }, [heroHealthLevel]);

  const upgradeQuestUnlock = useCallback(() => {
    const cost = Math.floor(BASE_COSTS.questUnlock * Math.pow(COST_MULTIPLIER, questUnlockLevel));
    setMoney((prev) => {
      if (prev < cost || questUnlockLevel >= MAX_QUEST_UNLOCK_LEVEL) return prev;
      setQuestUnlockLevel((l) => l + 1);
      return prev - cost;
    });
  }, [questUnlockLevel]);

  const buyQuest = useCallback(
    (creatureIdx: number) => {
      if (activeQuestCreatureIdx !== null) return;
      const cost = QUEST_BUY_COSTS[creatureIdx] ?? Infinity;
      setMoney((prev) => {
        if (prev < cost) return prev;
        setActiveQuestCreatureIdx(creatureIdx);
        return prev - cost;
      });
    },
    [activeQuestCreatureIdx],
  );

  const completeQuest = useCallback((reward: number) => {
    setActiveQuestCreatureIdx(null);
    setMoney((prev) => prev + reward);
  }, []);

  const failQuest = useCallback(() => {
    setActiveQuestCreatureIdx(null);
  }, []);

  const setActiveHeroCountLevel = useCallback(
    (level: number) => {
      setActiveHeroCountLevelState(Math.max(0, Math.min(level, heroCountLevel)));
    },
    [heroCountLevel],
  );

  const setActiveSpeedLevel = useCallback(
    (level: number) => {
      setActiveSpeedLevelState(Math.max(0, Math.min(level, speedLevel)));
    },
    [speedLevel],
  );

  return {
    money,
    heroCount,
    heroSpeed,
    heroMaxHp,
    unlockedOrbLevel,
    betterOrbsParam,
    betterOrbsLevel,
    unlockOrbsLevel,
    heroHealthLevel,
    questUnlockLevel,
    heroCountLevel,
    speedLevel,
    activeHeroCountLevel,
    activeSpeedLevel,
    activeQuestCreatureIdx,
    upgradeCosts,
    addMoney,
    upgradeHeroSpeed,
    upgradeHeroCount,
    upgradeUnlockOrbs,
    upgradeBetterOrbs,
    upgradeHeroHealth,
    upgradeQuestUnlock,
    buyQuest,
    completeQuest,
    failQuest,
    setActiveHeroCountLevel,
    setActiveSpeedLevel,
  };
}
