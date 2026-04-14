import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useGameStore } from "../store/useGameStore";

describe("useGameStore", () => {
  it("initializes with correct defaults", () => {
    const { result } = renderHook(() => useGameStore());
    expect(result.current.money).toBe(0);
    expect(result.current.heroCount).toBe(1);
    expect(result.current.heroSpeed).toBe(1);
    expect(result.current.specialDotChance).toBe(0.05);
  });

  it("adds money correctly", () => {
    const { result } = renderHook(() => useGameStore());
    act(() => result.current.addMoney(42));
    expect(result.current.money).toBe(42);
  });

  it("upgrades hero speed when affordable", () => {
    const { result } = renderHook(() => useGameStore());
    act(() => result.current.addMoney(1000));
    act(() => result.current.upgradeHeroSpeed());
    expect(result.current.heroSpeed).toBeGreaterThan(1);
    expect(result.current.money).toBeLessThan(1000);
  });

  it("upgrades hero count when affordable", () => {
    const { result } = renderHook(() => useGameStore());
    act(() => result.current.addMoney(1000));
    act(() => result.current.upgradeHeroCount());
    expect(result.current.heroCount).toBe(2);
  });

  it("upgrades special dot chance when affordable", () => {
    const { result } = renderHook(() => useGameStore());
    act(() => result.current.addMoney(1000));
    act(() => result.current.upgradeSpecialDotChance());
    expect(result.current.specialDotChance).toBeGreaterThan(0.05);
  });

  it("does not upgrade when cannot afford", () => {
    const { result } = renderHook(() => useGameStore());
    act(() => result.current.upgradeHeroSpeed());
    expect(result.current.heroSpeed).toBe(1);
    expect(result.current.money).toBe(0);
  });
});
