import { useState } from "react";
import type { UpgradeCosts } from "../../game/types";
import { ORB_TYPES } from "../../game/orbDefinitions";
import { CREATURE_TYPES, QUEST_BUY_COSTS } from "../../game/creatureDefinitions";
import styles from "./UpgradePanel.module.css";

interface UpgradePanelProps {
  money: number;
  heroCount: number;
  heroSpeed: number;
  heroCountLevel: number;
  speedLevel: number;
  activeHeroCountLevel: number;
  activeSpeedLevel: number;
  unlockOrbsLevel: number;
  betterOrbsLevel: number;
  betterOrbsParam: number;
  heroHealthLevel: number;
  heroMaxHp: number;
  questUnlockLevel: number;
  activeQuestCreatureIdx: number | null;
  upgradeCosts: UpgradeCosts;
  onUpgradeHeroSpeed: () => void;
  onUpgradeHeroCount: () => void;
  onUpgradeUnlockOrbs: () => void;
  onUpgradeBetterOrbs: () => void;
  onUpgradeHeroHealth: () => void;
  onUpgradeQuestUnlock: () => void;
  onBuyQuest: (level: number) => void;
  onSetActiveHeroCountLevel: (level: number) => void;
  onSetActiveSpeedLevel: (level: number) => void;
}

export default function UpgradePanel({
  money,
  heroCount,
  heroSpeed,
  heroCountLevel,
  speedLevel,
  activeHeroCountLevel,
  activeSpeedLevel,
  unlockOrbsLevel,
  betterOrbsLevel,
  betterOrbsParam,
  heroHealthLevel,
  heroMaxHp,
  questUnlockLevel,
  activeQuestCreatureIdx,
  upgradeCosts,
  onUpgradeHeroSpeed,
  onUpgradeHeroCount,
  onUpgradeUnlockOrbs,
  onUpgradeBetterOrbs,
  onUpgradeHeroHealth,
  onUpgradeQuestUnlock,
  onBuyQuest,
  onSetActiveHeroCountLevel,
  onSetActiveSpeedLevel,
}: UpgradePanelProps) {
  const [collapsed, setCollapsed] = useState(false);

  // Build label arrays for hero count and speed (support active-level selectors)
  const heroCountLabels = Array.from(
    { length: heroCountLevel + 1 },
    (_, i) => `${i + 1}`,
  );
  const speedLabels = Array.from(
    { length: speedLevel + 1 },
    (_, i) => `${(1 + i * 0.5).toFixed(1)}x`,
  );

  // Next orb to unlock
  const nextOrbName =
    unlockOrbsLevel < ORB_TYPES.length
      ? ORB_TYPES[unlockOrbsLevel].name
      : null;

  // Active quest creature name
  const activeCreatureName =
    activeQuestCreatureIdx !== null
      ? CREATURE_TYPES[activeQuestCreatureIdx]?.name
      : null;

  return (
    <div className={`${styles.panel} ${collapsed ? styles.collapsed : ""}`}>
      <button
        className={styles.toggleButton}
        onClick={() => setCollapsed(!collapsed)}
        aria-label={collapsed ? "Expand upgrade panel" : "Collapse upgrade panel"}
      >
        <i className={`fa-solid ${collapsed ? "fa-chevron-left" : "fa-chevron-right"}`} />
      </button>

      <div className={styles.content}>
        <div className={styles.header}>
          <i className="fa-solid fa-bolt" />
          <h2>Upgrades</h2>
        </div>

        <div className={styles.moneyDisplay}>
          <i className="fa-solid fa-circle" style={{ color: "#FFD700" }} />
          <span className={styles.moneyAmount}>{Math.floor(money)}</span>
          <span className={styles.moneyLabel}>coins</span>
        </div>

        <div className={styles.upgrades}>
          {/* ── Hero upgrades ── */}
          <UpgradeItem
            icon="fa-gauge-high"
            label="Hero Speed"
            description={`Speed: ${heroSpeed.toFixed(1)}x`}
            cost={upgradeCosts.heroSpeed}
            canAfford={money >= upgradeCosts.heroSpeed}
            onUpgrade={onUpgradeHeroSpeed}
            levelLabels={speedLabels}
            activeLevel={activeSpeedLevel}
            onSetActiveLevel={onSetActiveSpeedLevel}
          />
          <UpgradeItem
            icon="fa-person-running"
            label="Hero Count"
            description={`Heroes: ${heroCount}`}
            cost={upgradeCosts.heroCount}
            canAfford={money >= upgradeCosts.heroCount}
            onUpgrade={onUpgradeHeroCount}
            levelLabels={heroCountLabels}
            activeLevel={activeHeroCountLevel}
            onSetActiveLevel={onSetActiveHeroCountLevel}
          />
          <UpgradeItem
            icon="fa-heart"
            label="Hero Health"
            description={`Max HP: ${heroMaxHp}`}
            cost={upgradeCosts.heroHealth}
            canAfford={money >= upgradeCosts.heroHealth}
            onUpgrade={onUpgradeHeroHealth}
            maxedLabel={heroHealthLevel >= 10 ? "MAX" : undefined}
          />

          {/* ── Orb upgrades ── */}
          <div className={styles.sectionDivider}>Orbs</div>
          <UpgradeItem
            icon="fa-circle-dot"
            label="Unlock Orbs"
            description={
              nextOrbName
                ? `Next: ${nextOrbName} (${ORB_TYPES[unlockOrbsLevel].value} coins)`
                : `All ${ORB_TYPES.length} orb types unlocked`
            }
            cost={upgradeCosts.unlockOrbs}
            canAfford={money >= upgradeCosts.unlockOrbs}
            onUpgrade={onUpgradeUnlockOrbs}
            maxedLabel={upgradeCosts.unlockOrbs === Infinity ? "MAX" : undefined}
          />
          <UpgradeItem
            icon="fa-star"
            label="Better Orbs"
            description={`Quality: ${betterOrbsParam.toFixed(1)}x`}
            cost={upgradeCosts.betterOrbs}
            canAfford={money >= upgradeCosts.betterOrbs}
            onUpgrade={onUpgradeBetterOrbs}
            maxedLabel={betterOrbsLevel >= 8 ? "MAX" : undefined}
          />

          {/* ── Quest upgrades ── */}
          <div className={styles.sectionDivider}>Quests</div>
          <UpgradeItem
            icon="fa-dragon"
            label="Unlock Quest"
            description={
              questUnlockLevel < CREATURE_TYPES.length
                ? `Next: ${CREATURE_TYPES[questUnlockLevel]?.name ?? "?"}`
                : `All ${CREATURE_TYPES.length} quest levels unlocked`
            }
            cost={upgradeCosts.questUnlock}
            canAfford={money >= upgradeCosts.questUnlock}
            onUpgrade={onUpgradeQuestUnlock}
            maxedLabel={upgradeCosts.questUnlock === Infinity ? "MAX" : undefined}
          />
        </div>

        {/* ── Buy Quest section ── */}
        {questUnlockLevel > 0 && (
          <div className={styles.questSection}>
            <div className={styles.questHeader}>
              <i className="fa-solid fa-swords" />
              <span>Buy Quest</span>
            </div>

            {activeCreatureName ? (
              <div className={styles.activeQuest}>
                <i className="fa-solid fa-hourglass-half" />
                <span>Quest active: {activeCreatureName}</span>
              </div>
            ) : (
              <div className={styles.questList}>
                {Array.from({ length: questUnlockLevel }, (_, i) => {
                  const creature = CREATURE_TYPES[i];
                  const cost = QUEST_BUY_COSTS[i];
                  const canAfford = money >= cost;
                  return (
                    <button
                      key={i}
                      className={`${styles.questButton} ${canAfford ? styles.questCanAfford : styles.questCantAfford}`}
                      onClick={() => onBuyQuest(i)}
                      disabled={!canAfford}
                      title={`HP: ${creature.hp} | Dmg: ${creature.damage} | Reward: ${creature.reward}`}
                    >
                      <span className={styles.questName}>{creature.name}</span>
                      <span className={styles.questCost}>
                        <i
                          className="fa-solid fa-circle"
                          style={{ color: "#FFD700", fontSize: "0.7em" }}
                        />{" "}
                        {cost}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Orb legend ── */}
        <div className={styles.legend}>
          {Array.from({ length: unlockOrbsLevel + 1 }, (_, i) => {
            const orb = ORB_TYPES[i];
            const hex = `#${orb.color.toString(16).padStart(6, "0")}`;
            return (
              <div key={i} className={styles.legendItem}>
                <span
                  className={styles.orbDot}
                  style={{ background: hex, boxShadow: `0 0 6px ${hex}` }}
                />
                <span>
                  {orb.name.charAt(0).toUpperCase() + orb.name.slice(1)} ({orb.value}{" "}
                  {orb.value === 1 ? "coin" : "coins"})
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

interface UpgradeItemProps {
  icon: string;
  label: string;
  description: string;
  cost: number;
  canAfford: boolean;
  onUpgrade: () => void;
  levelLabels?: string[];
  activeLevel?: number;
  onSetActiveLevel?: (level: number) => void;
  maxedLabel?: string;
}

function UpgradeItem({
  icon,
  label,
  description,
  cost,
  canAfford,
  onUpgrade,
  levelLabels,
  activeLevel,
  onSetActiveLevel,
  maxedLabel,
}: UpgradeItemProps) {
  const isMaxed = cost === Infinity || maxedLabel !== undefined;
  return (
    <div className={styles.upgradeItem}>
      <div className={styles.upgradeRow}>
        <div className={styles.upgradeInfo}>
          <i className={`fa-solid ${icon} ${styles.upgradeIcon}`} />
          <div>
            <div className={styles.upgradeName}>{label}</div>
            <div className={styles.upgradeDesc}>{description}</div>
          </div>
        </div>
        <button
          className={`${styles.upgradeButton} ${canAfford && !isMaxed ? styles.canAfford : styles.cantAfford}`}
          onClick={onUpgrade}
          disabled={!canAfford || isMaxed}
        >
          {isMaxed ? (
            "MAX"
          ) : (
            <>
              <i className="fa-solid fa-circle" style={{ color: "#FFD700", fontSize: "0.75em" }} />
              {cost}
            </>
          )}
        </button>
      </div>
      {levelLabels && levelLabels.length > 1 && onSetActiveLevel !== undefined && (
        <div className={styles.levelSelector}>
          {levelLabels.map((lbl, i) => (
            <button
              key={i}
              className={`${styles.levelButton} ${i === activeLevel ? styles.levelButtonActive : ""}`}
              onClick={() => onSetActiveLevel(i)}
              title={lbl}
            >
              {lbl}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
