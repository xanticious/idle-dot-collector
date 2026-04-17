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
        unlockedOrbLevel={store.unlockedOrbLevel}
        betterOrbsParam={store.betterOrbsParam}
        heroMaxHp={store.heroMaxHp}
        activeQuestCreatureIdx={store.activeQuestCreatureIdx}
        onCoinsCollected={store.addMoney}
        onQuestComplete={store.completeQuest}
        onQuestFail={store.failQuest}
      />
      <UpgradePanel
        money={store.money}
        heroCount={store.heroCount}
        heroSpeed={store.heroSpeed}
        heroCountLevel={store.heroCountLevel}
        speedLevel={store.speedLevel}
        activeHeroCountLevel={store.activeHeroCountLevel}
        activeSpeedLevel={store.activeSpeedLevel}
        unlockOrbsLevel={store.unlockOrbsLevel}
        betterOrbsLevel={store.betterOrbsLevel}
        betterOrbsParam={store.betterOrbsParam}
        heroHealthLevel={store.heroHealthLevel}
        heroMaxHp={store.heroMaxHp}
        questUnlockLevel={store.questUnlockLevel}
        activeQuestCreatureIdx={store.activeQuestCreatureIdx}
        upgradeCosts={store.upgradeCosts}
        onUpgradeHeroSpeed={store.upgradeHeroSpeed}
        onUpgradeHeroCount={store.upgradeHeroCount}
        onUpgradeUnlockOrbs={store.upgradeUnlockOrbs}
        onUpgradeBetterOrbs={store.upgradeBetterOrbs}
        onUpgradeHeroHealth={store.upgradeHeroHealth}
        onUpgradeQuestUnlock={store.upgradeQuestUnlock}
        onBuyQuest={store.buyQuest}
        onSetActiveHeroCountLevel={store.setActiveHeroCountLevel}
        onSetActiveSpeedLevel={store.setActiveSpeedLevel}
      />
    </div>
  );
}
