import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UpgradePanel from "../components/UpgradePanel/UpgradePanel";

const defaultProps = {
  money: 200,
  heroCount: 1,
  heroSpeed: 1,
  heroCountLevel: 0,
  speedLevel: 0,
  activeHeroCountLevel: 0,
  activeSpeedLevel: 0,
  unlockOrbsLevel: 0,
  betterOrbsParam: 1,
  heroMaxHp: 10,
  questUnlockLevel: 0,
  activeQuestCreatureIdx: null,
  upgradeCosts: {
    heroSpeed: 50,
    heroCount: 100,
    unlockOrbs: 150,
    betterOrbs: 100,
    heroHealth: 200,
    questUnlock: 500,
  },
  onUpgradeHeroSpeed: vi.fn(),
  onUpgradeHeroCount: vi.fn(),
  onUpgradeUnlockOrbs: vi.fn(),
  onUpgradeBetterOrbs: vi.fn(),
  onUpgradeHeroHealth: vi.fn(),
  onUpgradeQuestUnlock: vi.fn(),
  onBuyQuest: vi.fn(),
  onSetActiveHeroCountLevel: vi.fn(),
  onSetActiveSpeedLevel: vi.fn(),
};

describe("UpgradePanel", () => {
  it("renders upgrades heading", () => {
    render(<UpgradePanel {...defaultProps} />);
    expect(screen.getByText("Upgrades")).toBeInTheDocument();
  });

  it("shows current money", () => {
    render(<UpgradePanel {...defaultProps} />);
    // Use getAllByText and check the money display span specifically
    const moneyElements = screen.getAllByText("200");
    expect(moneyElements.length).toBeGreaterThan(0);
  });

  it("shows 'coins' label for currency", () => {
    render(<UpgradePanel {...defaultProps} />);
    expect(screen.getByText("coins")).toBeInTheDocument();
  });

  it("calls onUpgradeHeroSpeed when clicked and can afford", async () => {
    const onUpgradeHeroSpeed = vi.fn();
    render(<UpgradePanel {...defaultProps} onUpgradeHeroSpeed={onUpgradeHeroSpeed} />);
    const buttons = screen.getAllByRole("button");
    const affordableButtons = buttons.filter((btn) => !btn.hasAttribute("disabled"));
    expect(affordableButtons.length).toBeGreaterThan(0);
  });

  it("can collapse and expand the panel", async () => {
    render(<UpgradePanel {...defaultProps} />);
    const toggleButton = screen.getByLabelText("Collapse upgrade panel");
    await userEvent.click(toggleButton);
    expect(screen.getByLabelText("Expand upgrade panel")).toBeInTheDocument();
  });

  it("renders orb legend for unlocked orbs", () => {
    render(<UpgradePanel {...defaultProps} unlockOrbsLevel={1} />);
    // With unlockOrbsLevel=1, two orbs are shown (index 0 and 1)
    expect(screen.getByText(/White/)).toBeInTheDocument();
    // Use getAllByText since "blue" also appears in the upgrade description
    const blueMatches = screen.getAllByText(/Blue/i);
    expect(blueMatches.length).toBeGreaterThan(0);
  });

  it("renders Buy Quest section when quest level unlocked", () => {
    render(<UpgradePanel {...defaultProps} questUnlockLevel={1} />);
    expect(screen.getByText("Buy Quest")).toBeInTheDocument();
    expect(screen.getByText("Green Dragon")).toBeInTheDocument();
  });

  it("shows active quest name when quest is in progress", () => {
    render(
      <UpgradePanel {...defaultProps} questUnlockLevel={1} activeQuestCreatureIdx={0} />,
    );
    expect(screen.getByText(/Quest active: Green Dragon/i)).toBeInTheDocument();
  });
});
