import { useState } from "react";
import type { UpgradeCosts } from "../../game/types";
import styles from "./UpgradePanel.module.css";

interface UpgradePanelProps {
  money: number;
  heroCount: number;
  heroSpeed: number;
  specialDotChance: number;
  upgradeCosts: UpgradeCosts;
  onUpgradeHeroSpeed: () => void;
  onUpgradeHeroCount: () => void;
  onUpgradeSpecialDotChance: () => void;
}

export default function UpgradePanel({
  money,
  heroCount,
  heroSpeed,
  specialDotChance,
  upgradeCosts,
  onUpgradeHeroSpeed,
  onUpgradeHeroCount,
  onUpgradeSpecialDotChance,
}: UpgradePanelProps) {
  const [collapsed, setCollapsed] = useState(false);

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
          <span className={styles.moneyLabel}>dots</span>
        </div>

        <div className={styles.upgrades}>
          <UpgradeItem
            icon="fa-gauge-high"
            label="Hero Speed"
            description={`Speed: ${heroSpeed.toFixed(1)}x`}
            cost={upgradeCosts.heroSpeed}
            canAfford={money >= upgradeCosts.heroSpeed}
            onUpgrade={onUpgradeHeroSpeed}
          />
          <UpgradeItem
            icon="fa-person-running"
            label="Hero Count"
            description={`Heroes: ${heroCount}`}
            cost={upgradeCosts.heroCount}
            canAfford={money >= upgradeCosts.heroCount}
            onUpgrade={onUpgradeHeroCount}
          />
          <UpgradeItem
            icon="fa-star"
            label="Special Dots"
            description={`Chance: ${(specialDotChance * 100).toFixed(0)}%`}
            cost={upgradeCosts.specialDotChance}
            canAfford={money >= upgradeCosts.specialDotChance}
            onUpgrade={onUpgradeSpecialDotChance}
          />
        </div>

        <div className={styles.legend}>
          <div className={styles.legendItem}>
            <span className={styles.normalDot} />
            <span>Normal Dot (1 pt)</span>
          </div>
          <div className={styles.legendItem}>
            <span className={styles.specialDot} />
            <span>Special Dot (10 pts)</span>
          </div>
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
}

function UpgradeItem({ icon, label, description, cost, canAfford, onUpgrade }: UpgradeItemProps) {
  return (
    <div className={styles.upgradeItem}>
      <div className={styles.upgradeInfo}>
        <i className={`fa-solid ${icon} ${styles.upgradeIcon}`} />
        <div>
          <div className={styles.upgradeName}>{label}</div>
          <div className={styles.upgradeDesc}>{description}</div>
        </div>
      </div>
      <button
        className={`${styles.upgradeButton} ${canAfford ? styles.canAfford : styles.cantAfford}`}
        onClick={onUpgrade}
        disabled={!canAfford}
      >
        <i className="fa-solid fa-circle" style={{ color: "#FFD700", fontSize: "0.75em" }} />
        {cost}
      </button>
    </div>
  );
}
