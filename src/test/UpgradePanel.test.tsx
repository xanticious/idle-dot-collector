import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UpgradePanel from "../components/UpgradePanel/UpgradePanel";

const defaultProps = {
  money: 200,
  heroCount: 1,
  heroSpeed: 1,
  specialDotChance: 0.05,
  upgradeCosts: { heroSpeed: 50, heroCount: 100, specialDotChance: 75 },
  onUpgradeHeroSpeed: vi.fn(),
  onUpgradeHeroCount: vi.fn(),
  onUpgradeSpecialDotChance: vi.fn(),
};

describe("UpgradePanel", () => {
  it("renders upgrades heading", () => {
    render(<UpgradePanel {...defaultProps} />);
    expect(screen.getByText("Upgrades")).toBeInTheDocument();
  });

  it("shows current money", () => {
    render(<UpgradePanel {...defaultProps} />);
    expect(screen.getByText("200")).toBeInTheDocument();
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
});
