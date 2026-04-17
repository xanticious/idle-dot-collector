import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useGameStore } from "../store/useGameStore";

describe("useGameStore", () => {
  it("initializes with correct defaults", () => {
    const { result } = renderHook(() => useGameStore());
    expect(result.current.money).toBe(0);
    expect(result.current.heroCount).toBe(1);
    expect(result.current.heroSpeed).toBe(1);
    expect(result.current.unlockedOrbLevel).toBe(0);
    expect(result.current.betterOrbsParam).toBe(1);
    expect(result.current.heroMaxHp).toBe(10);
    expect(result.current.activeQuestCreatureIdx).toBeNull();
  });

  it("adds money correctly", () => {
    const { result } = renderHook(() => useGameStore());
    act(() => result.current.addMoney(42));
    expect(result.current.money).toBe(42);
  });

  it("upgrades hero speed when affordable (unlocks new level, deducts cost)", () => {
    const { result } = renderHook(() => useGameStore());
    act(() => result.current.addMoney(1000));
    act(() => result.current.upgradeHeroSpeed());
    expect(result.current.speedLevel).toBe(1);
    expect(result.current.money).toBeLessThan(1000);
  });

  it("selecting higher speed level after unlock increases active speed", () => {
    const { result } = renderHook(() => useGameStore());
    act(() => result.current.addMoney(1000));
    act(() => result.current.upgradeHeroSpeed());
    act(() => result.current.setActiveSpeedLevel(1));
    expect(result.current.heroSpeed).toBeGreaterThan(1);
  });

  it("upgrades hero count when affordable (unlocks new level, deducts cost)", () => {
    const { result } = renderHook(() => useGameStore());
    act(() => result.current.addMoney(1000));
    act(() => result.current.upgradeHeroCount());
    expect(result.current.heroCountLevel).toBe(1);
    expect(result.current.money).toBeLessThan(1000);
  });

  it("selecting higher hero count after unlock increases active count", () => {
    const { result } = renderHook(() => useGameStore());
    act(() => result.current.addMoney(1000));
    act(() => result.current.upgradeHeroCount());
    act(() => result.current.setActiveHeroCountLevel(1));
    expect(result.current.heroCount).toBe(2);
  });

  it("upgrades unlock orbs when affordable (unlocks new orb tier, deducts cost)", () => {
    const { result } = renderHook(() => useGameStore());
    act(() => result.current.addMoney(1000));
    act(() => result.current.upgradeUnlockOrbs());
    expect(result.current.unlockOrbsLevel).toBe(1);
    expect(result.current.money).toBeLessThan(1000);
  });

  it("upgrades better orbs when affordable (increases param, deducts cost)", () => {
    const { result } = renderHook(() => useGameStore());
    act(() => result.current.addMoney(1000));
    act(() => result.current.upgradeBetterOrbs());
    expect(result.current.betterOrbsLevel).toBe(1);
    expect(result.current.betterOrbsParam).toBeGreaterThan(1);
    expect(result.current.money).toBeLessThan(1000);
  });

  it("upgrades hero health when affordable (increases maxHp, deducts cost)", () => {
    const { result } = renderHook(() => useGameStore());
    act(() => result.current.addMoney(1000));
    act(() => result.current.upgradeHeroHealth());
    expect(result.current.heroHealthLevel).toBe(1);
    expect(result.current.heroMaxHp).toBeGreaterThan(10);
    expect(result.current.money).toBeLessThan(1000);
  });

  it("unlocks quest level when affordable", () => {
    const { result } = renderHook(() => useGameStore());
    act(() => result.current.addMoney(10000));
    act(() => result.current.upgradeQuestUnlock());
    expect(result.current.questUnlockLevel).toBe(1);
    expect(result.current.money).toBeLessThan(10000);
  });

  it("can buy a quest after unlocking it", () => {
    const { result } = renderHook(() => useGameStore());
    act(() => result.current.addMoney(10000));
    act(() => result.current.upgradeQuestUnlock());
    act(() => result.current.buyQuest(0));
    expect(result.current.activeQuestCreatureIdx).toBe(0);
    expect(result.current.money).toBeLessThan(10000);
  });

  it("completing a quest clears the active quest and adds reward", () => {
    const { result } = renderHook(() => useGameStore());
    act(() => result.current.addMoney(10000));
    act(() => result.current.upgradeQuestUnlock());
    act(() => result.current.buyQuest(0));
    const moneyBefore = result.current.money;
    act(() => result.current.completeQuest(500));
    expect(result.current.activeQuestCreatureIdx).toBeNull();
    expect(result.current.money).toBe(moneyBefore + 500);
  });

  it("failing a quest clears the active quest without reward", () => {
    const { result } = renderHook(() => useGameStore());
    act(() => result.current.addMoney(10000));
    act(() => result.current.upgradeQuestUnlock());
    act(() => result.current.buyQuest(0));
    act(() => result.current.failQuest());
    expect(result.current.activeQuestCreatureIdx).toBeNull();
  });

  it("cannot buy a second quest while one is active", () => {
    const { result } = renderHook(() => useGameStore());
    act(() => result.current.addMoney(10000));
    act(() => result.current.upgradeQuestUnlock());
    act(() => result.current.buyQuest(0));
    const moneyAfterFirst = result.current.money;
    act(() => result.current.buyQuest(0));
    expect(result.current.money).toBe(moneyAfterFirst); // no extra deduction
  });

  it("does not upgrade when cannot afford", () => {
    const { result } = renderHook(() => useGameStore());
    act(() => result.current.upgradeHeroSpeed());
    expect(result.current.speedLevel).toBe(0);
    expect(result.current.money).toBe(0);
  });
});
