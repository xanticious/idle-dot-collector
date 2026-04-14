import { useEffect, useRef } from 'react';
import { GameEngine } from '../../game/GameEngine';
import type { GameConfig } from '../../game/types';
import styles from './GameCanvas.module.css';

interface GameCanvasProps {
  heroCount: number;
  heroSpeed: number;
  specialDotChance: number;
  onDotsCollected: (amount: number) => void;
}

export default function GameCanvas({
  heroCount,
  heroSpeed,
  specialDotChance,
  onDotsCollected,
}: GameCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const configRef = useRef<GameConfig>({ heroCount, heroSpeed, specialDotChance });

  useEffect(() => {
    if (!containerRef.current) return;

    const engine = new GameEngine(containerRef.current, onDotsCollected);
    engineRef.current = engine;

    void engine.init(configRef.current);

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    configRef.current = { heroCount, heroSpeed, specialDotChance };
    if (!engineRef.current) return;
    engineRef.current.updateConfig({ heroCount, heroSpeed, specialDotChance });
  }, [heroCount, heroSpeed, specialDotChance]);

  return <div ref={containerRef} className={styles.canvas} />;
}
