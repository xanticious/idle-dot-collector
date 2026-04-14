import { useState } from 'react';
import LandingScreen from './components/LandingScreen/LandingScreen';
import GameScreen from './components/GameScreen/GameScreen';
import styles from './App.module.css';

type Screen = 'landing' | 'game';

export default function App() {
  const [screen, setScreen] = useState<Screen>('landing');

  return (
    <div className={styles.app}>
      {screen === 'landing' ? (
        <LandingScreen onBegin={() => setScreen('game')} />
      ) : (
        <GameScreen />
      )}
    </div>
  );
}
