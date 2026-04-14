import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LandingScreen from "../components/LandingScreen/LandingScreen";

describe("LandingScreen", () => {
  it("renders the title", () => {
    render(<LandingScreen onBegin={() => {}} onOpenSpriteEditor={() => {}} />);
    expect(screen.getByText("Idle Dot Collector")).toBeInTheDocument();
  });

  it("renders the Begin button", () => {
    render(<LandingScreen onBegin={() => {}} onOpenSpriteEditor={() => {}} />);
    expect(screen.getByRole("button", { name: /begin/i })).toBeInTheDocument();
  });

  it("calls onBegin when Begin button is clicked", async () => {
    const onBegin = vi.fn();
    render(<LandingScreen onBegin={onBegin} onOpenSpriteEditor={() => {}} />);
    await userEvent.click(screen.getByRole("button", { name: /begin/i }));
    expect(onBegin).toHaveBeenCalledOnce();
  });

  it("renders the Sprite Editor button", () => {
    render(<LandingScreen onBegin={() => {}} onOpenSpriteEditor={() => {}} />);
    expect(screen.getByRole("button", { name: /sprite editor/i })).toBeInTheDocument();
  });

  it("calls onOpenSpriteEditor when Sprite Editor button is clicked", async () => {
    const onOpenSpriteEditor = vi.fn();
    render(<LandingScreen onBegin={() => {}} onOpenSpriteEditor={onOpenSpriteEditor} />);
    await userEvent.click(screen.getByRole("button", { name: /sprite editor/i }));
    expect(onOpenSpriteEditor).toHaveBeenCalledOnce();
  });
});

