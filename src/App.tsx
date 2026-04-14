import { useState } from "react";
import LandingScreen from "./components/LandingScreen/LandingScreen";
import GameScreen from "./components/GameScreen/GameScreen";
import SpriteEditor from "./components/SpriteEditor/SpriteEditor";
import styles from "./App.module.css";

type Screen = "landing" | "game" | "spriteEditor";

export default function App() {
  const [screen, setScreen] = useState<Screen>("landing");

  return (
    <div className={styles.app}>
      {screen === "landing" && (
        <LandingScreen
          onBegin={() => setScreen("game")}
          onOpenSpriteEditor={() => setScreen("spriteEditor")}
        />
      )}
      {screen === "game" && <GameScreen />}
      {screen === "spriteEditor" && (
        <div className={styles.spriteEditorWrapper}>
          <button className={styles.closeEditorBtn} onClick={() => setScreen("landing")}>
            ✕ Close Editor
          </button>
          <SpriteEditor />
        </div>
      )}
    </div>
  );
}
