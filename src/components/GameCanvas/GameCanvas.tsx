import { useEffect, useRef } from "react";
import { GameEngine } from "../../game/GameEngine";
import type { GameConfig } from "../../game/types";
import styles from "./GameCanvas.module.css";

interface GameCanvasProps {
  heroCount: number;
  heroSpeed: number;
  unlockedOrbLevel: number;
  betterOrbsParam: number;
  heroMaxHp: number;
  activeQuestCreatureIdx: number | null;
  onCoinsCollected: (amount: number) => void;
  onQuestComplete: (reward: number) => void;
  onQuestFail: () => void;
}

export default function GameCanvas({
  heroCount,
  heroSpeed,
  unlockedOrbLevel,
  betterOrbsParam,
  heroMaxHp,
  activeQuestCreatureIdx,
  onCoinsCollected,
  onQuestComplete,
  onQuestFail,
}: GameCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const configRef = useRef<GameConfig>({
    heroCount,
    heroSpeed,
    unlockedOrbLevel,
    betterOrbsParam,
    heroMaxHp,
    activeQuestCreatureIdx,
  });

  useEffect(() => {
    if (!containerRef.current) return;

    const engine = new GameEngine(
      containerRef.current,
      onCoinsCollected,
      onQuestComplete,
      onQuestFail,
    );
    engineRef.current = engine;

    void engine.init(configRef.current);

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    configRef.current = {
      heroCount,
      heroSpeed,
      unlockedOrbLevel,
      betterOrbsParam,
      heroMaxHp,
      activeQuestCreatureIdx,
    };
    if (!engineRef.current) return;
    engineRef.current.updateConfig(configRef.current);
  }, [heroCount, heroSpeed, unlockedOrbLevel, betterOrbsParam, heroMaxHp, activeQuestCreatureIdx]);

  return <div ref={containerRef} className={styles.canvas} />;
}
