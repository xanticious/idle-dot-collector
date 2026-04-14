import GameCanvas from "../GameCanvas/GameCanvas";
import UpgradePanel from "../UpgradePanel/UpgradePanel";
import { useGameStore } from "../../store/useGameStore";
import styles from "./GameScreen.module.css";

export default function GameScreen() {
  const store = useGameStore();

  return (
    <div className={styles.container}>
      <GameCanvas
        heroCount={store.heroCount}
        heroSpeed={store.heroSpeed}
        specialDotChance={store.specialDotChance}
        onDotsCollected={store.addMoney}
      />
      <UpgradePanel
        money={store.money}
        heroCount={store.heroCount}
        heroSpeed={store.heroSpeed}
        specialDotChance={store.specialDotChance}
        onUpgradeHeroSpeed={store.upgradeHeroSpeed}
        onUpgradeHeroCount={store.upgradeHeroCount}
        onUpgradeSpecialDotChance={store.upgradeSpecialDotChance}
        upgradeCosts={store.upgradeCosts}
      />
    </div>
  );
}
