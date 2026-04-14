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
        <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%" }}>
          <button
            onClick={() => setScreen("landing")}
            style={{
              position: "absolute",
              top: "0.5rem",
              right: "0.75rem",
              zIndex: 10,
              padding: "0.25rem 0.7rem",
              fontSize: "0.78rem",
              border: "1px solid #3a3a6a",
              borderRadius: "6px",
              background: "#1a1a3e",
              color: "#aaaacc",
              cursor: "pointer",
            }}
          >
            ✕ Close Editor
          </button>
          <SpriteEditor />
        </div>
      )}
    </div>
  );
}
