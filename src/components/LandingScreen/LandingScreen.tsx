import styles from "./LandingScreen.module.css";

interface LandingScreenProps {
  onBegin: () => void;
  onOpenSpriteEditor: () => void;
}

const DECORATIVE_DOTS = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  left: `${(i * 17 + 5) % 100}%`,
  top: `${(i * 23 + 10) % 100}%`,
  delay: `${(i * 0.3) % 3}s`,
  size: `${8 + (i % 4) * 4}px`,
}));

export default function LandingScreen({ onBegin, onOpenSpriteEditor }: LandingScreenProps) {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.icon}>
          <i className="fa-solid fa-circle-dot" />
        </div>
        <h1 className={styles.title}>Idle Dot Collector</h1>
        <p className={styles.subtitle}>Deploy heroes. Collect dots. Upgrade your forces.</p>
        <button className={styles.beginButton} onClick={onBegin}>
          <i className="fa-solid fa-play" />
          Begin
        </button>
        <button className={styles.editorButton} onClick={onOpenSpriteEditor}>
          <i className="fa-solid fa-film" />
          Sprite Editor
        </button>
      </div>
      <div className={styles.dots} aria-hidden="true">
        {DECORATIVE_DOTS.map((dot) => (
          <span
            key={dot.id}
            className={styles.decorativeDot}
            style={{
              left: dot.left,
              top: dot.top,
              animationDelay: dot.delay,
              width: dot.size,
              height: dot.size,
            }}
          />
        ))}
      </div>
    </div>
  );
}
