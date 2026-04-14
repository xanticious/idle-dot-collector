# Idle Dot Collector — Design Document

## Overview

Idle Dot Collector is a browser-based idle/incremental game built with TypeScript, React 19, and PixiJS 8. The player watches autonomous "heroes" roam a canvas collecting dots. Each collected dot earns currency that can be spent in an upgrade panel to make heroes faster, more numerous, or to improve the chance of lucrative special dots appearing.

The game requires zero active input once started. The player's only interactions are:
1. Clicking "Begin" on the landing screen.
2. Spending earned currency on upgrades in the side panel.

---

## Tech Stack

| Technology | Version | Role |
|---|---|---|
| TypeScript | ^6.0.2 | Static typing across the entire project |
| React | ^19.2.5 | UI layer (landing screen, upgrade panel, layout) |
| ReactDOM | ^19.2.5 | DOM rendering |
| PixiJS | ^8.17.1 | WebGL-accelerated canvas game rendering |
| Vite | ^8.0.8 | Dev server and production bundler |
| Vitest | ^4.1.4 | Unit and component testing |
| @vitejs/plugin-react | ^6.0.1 | React Fast Refresh and JSX transform |
| @testing-library/react | ^16.3.2 | React component testing utilities |
| @testing-library/jest-dom | ^6.9.1 | DOM assertion matchers |
| @testing-library/user-event | ^14.6.1 | Realistic user interaction simulation |
| jsdom | ^29.0.2 | DOM environment for tests |
| oxlint | ^1.60.0 | Fast Rust-based linter |
| oxfmt | ^0.45.0 | Fast Rust-based formatter |
| Font Awesome Free | ^7.2.0 | Icon set (solid style used exclusively) |
| CSS Modules | built-in | Scoped component styles |

---

## Architecture

The project is split into three logical layers:

### 1. UI Layer (React)
React manages the application shell, screen transitions, and the upgrade panel. It does **not** manage the game simulation — that is delegated entirely to the GameEngine class.

### 2. Game Engine Layer (PixiJS)
The `GameEngine` class is a pure TypeScript class that owns a PixiJS `Application` instance. It runs its own ticker loop independent of React's render cycle. React communicates with the engine by calling imperative methods (`init`, `updateConfig`, `destroy`) via a ref in `GameCanvas`.

### 3. State Layer (React Hooks)
`useGameStore` is a custom React hook that holds all upgrade state (money, hero count, hero speed, special dot chance, upgrade levels) as local `useState`. Callbacks from the engine arrive via `onDotsCollected`, which calls `addMoney`, causing React to re-render the upgrade panel with updated counts.

This separation ensures:
- The canvas never causes React re-renders.
- React state changes propagate to the engine only through `updateConfig`, not through continuous polling.

---

## File Structure

```
idle-dot-collector/
├── index.html                          # App shell
├── package.json
├── tsconfig.json
├── vite.config.ts
├── public/
│   └── dot.svg                         # Favicon
├── design/
│   └── DESIGN_DOCUMENT.md             # This file
└── src/
    ├── vite-env.d.ts
    ├── index.css                        # Global reset & base styles
    ├── main.tsx                         # React root mount
    ├── App.tsx                          # Screen router (landing / game)
    ├── App.module.css
    ├── components/
    │   ├── LandingScreen/
    │   │   ├── LandingScreen.tsx
    │   │   └── LandingScreen.module.css
    │   ├── GameScreen/
    │   │   ├── GameScreen.tsx
    │   │   └── GameScreen.module.css
    │   ├── GameCanvas/
    │   │   ├── GameCanvas.tsx
    │   │   └── GameCanvas.module.css
    │   └── UpgradePanel/
    │       ├── UpgradePanel.tsx
    │       └── UpgradePanel.module.css
    ├── game/
    │   ├── types.ts                     # Shared TypeScript interfaces
    │   └── GameEngine.ts               # PixiJS simulation engine
    ├── store/
    │   └── useGameStore.ts             # All upgrade/economy state
    └── test/
        ├── setup.ts                     # jest-dom matchers
        ├── LandingScreen.test.tsx
        ├── UpgradePanel.test.tsx
        └── useGameStore.test.ts
```

---

## Component Tree

```
App
├── LandingScreen (screen === 'landing')
│   ├── .icon       (Font Awesome circle-dot)
│   ├── .title      (h1)
│   ├── .subtitle   (p)
│   ├── .beginButton (button)
│   └── .dots       (decorative animated spans)
└── GameScreen (screen === 'game')
    ├── GameCanvas  (PixiJS canvas host div)
    └── UpgradePanel
        ├── .toggleButton  (collapse/expand)
        ├── .header        (title + bolt icon)
        ├── .moneyDisplay  (current balance)
        ├── .upgrades
        │   ├── UpgradeItem (Hero Speed)
        │   ├── UpgradeItem (Hero Count)
        │   └── UpgradeItem (Special Dots)
        └── .legend        (dot color guide)
```

---

## Game Mechanics

### Dots

Dots appear randomly across the canvas. There are two kinds:

| Type | Color | Radius | Value | Spawn Chance |
|---|---|---|---|---|
| Normal | Yellow `#FFFF00` | 6 px | 1 pt | `1 - specialDotChance` |
| Special | Gold `#FFAA00` | 10 px + glow ring | 10 pts | `specialDotChance` |

- Dots spawn every 60 frames (approximately 1 second at 60 fps).
- A maximum of 50 dots may exist on the canvas at once.
- Ten dots are pre-spawned when the engine initialises.

### Heroes

Heroes are hexagonal shapes rendered by PixiJS Graphics. Each hero has a unique color from a palette of eight:

```
Red      #FF6B6B
Teal     #4ECDC4
Sky      #45B7D1
Yellow   #F9CA24
Purple   #6C5CE7
Pink     #FD79A8
Green    #00B894
Coral    #E17055
```

A small white circle (radius 4) is drawn at each hero's center to distinguish them from dots at a glance.

Hero behavior:
1. When idle, the hero scans all unclaimed dots and targets the nearest.
2. The targeted dot is marked `claimed = true` to prevent two heroes competing for the same dot.
3. The hero moves toward the target at `heroSpeed * 2` pixels per frame.
4. When the hero's position is within `speed + dotRadius` pixels of the dot, the dot is collected.
5. Collected dots are removed from the stage and from the internal array.
6. The `onCollect` callback fires with the dot's value, crediting the player's balance.

### Economy

| Currency | Source |
|---|---|
| Dots (pts) | Collected by heroes |

All currency is spent on upgrades. There is no prestige, saving, or offline progress in the base implementation.

### Upgrades

Three upgrade tracks exist, each with exponentially increasing cost:

```
cost(level) = floor(BASE_COST * MULTIPLIER ^ level)
MULTIPLIER = 1.8
```

| Upgrade | Base Cost | Effect per Level | Maximum |
|---|---|---|---|
| Hero Speed | 50 | +0.5x speed | 5x |
| Hero Count | 100 | +1 hero | 10 heroes |
| Special Dot Chance | 75 | +5% chance | 50% |

When a maximum is reached, the upgrade button cost displays `Infinity` and remains disabled.

---

## State Management

All game-related state lives in the `useGameStore` hook, which is instantiated once in `GameScreen` and passed down as props.

### State Shape

```typescript
{
  money: number;             // current balance
  heroCount: number;         // number of active heroes
  heroSpeed: number;         // speed multiplier (1 = base)
  specialDotChance: number;  // probability in [0, 0.5]
  speedLevel: number;        // upgrades purchased (for cost calc)
  heroCountLevel: number;
  specialLevel: number;
}
```

### Derived State

`upgradeCosts` is computed on every render from current levels and the cost formula. It is not stored — it is always fresh.

### Data Flow

```
[PixiJS ticker] -> onCollect(value) -> addMoney() -> setMoney() -> React re-render
[User clicks upgrade] -> upgradeHeroSpeed/Count/Special() -> setMoney/setHero* -> React re-render
[React re-render] -> GameCanvas useEffect -> engine.updateConfig({ ... })
```

The `onDotsCollected` callback reference is captured at `GameEngine` construction time. Because `addMoney` is memoised with `useCallback` and has no dependencies, the same function reference is used forever — no stale closure issues.

---

## Game Engine Design

### Lifecycle

```
GameEngine.constructor(container, onCollect)
  -> new GameEngine instance (no side effects)

engine.init(config): Promise<void>
  -> creates Application
  -> awaits app.init(...)         // async PixiJS v8 API
  -> appends canvas to container
  -> creates dotContainer, heroContainer
  -> spawns initial heroes + dots
  -> starts ticker

engine.updateConfig(config)
  -> called by React on prop changes
  -> syncs hero count (add/remove heroes)
  -> updates speed on all existing heroes

engine.destroy()
  -> sets destroyed flag
  -> calls app.destroy(true, { children: true })
  -> clears arrays
```

### Rendering Architecture

PixiJS uses two `Container` children on the stage:
1. `dotContainer` — all dot Graphics objects.
2. `heroContainer` — all hero Graphics objects.

This layering ensures heroes are always drawn on top of dots.

### Performance Considerations

- Graphics objects are created once and reused; they are never re-created per frame.
- The update loop runs at the display's native refresh rate (typically 60 fps) via `app.ticker`.
- Dot graphics are fully destroyed (`.destroy()`) on collection to release WebGL resources.
- The `claimed` flag prevents O(n²) dot-targeting conflicts without requiring a separate data structure.
- Hero targeting uses a simple linear scan over dots (O(n * m) where n = heroes, m = dots). With the capped maximums (10 heroes, 50 dots) this is negligible.

---

## Visual Design

### Color Palette

| Token | Hex | Usage |
|---|---|---|
| Background | `#0d0d1a` | Page background, canvas background |
| Panel Background | `#111122` | Upgrade panel |
| Panel Border | `#2a2a4a` | All borders |
| Gold | `#FFD700` | Normal dot, money display, accents |
| Special Gold | `#FFAA00` | Special dot fill |
| Text Primary | `#e0e0f0` | Body text |
| Text Muted | `#8888aa` | Subtitles, descriptions |
| Text Dim | `#6666aa` | Legend, upgrade descriptions |
| Upgrade Accent | `#6C5CE7` | Upgrade item icons |
| Affordable Green | `#90ee90` | Upgrade button when affordable |

### Landing Screen

- Full-viewport centered flex layout.
- Radial gradient background from `#1a1a3e` to `#0d0d1a`.
- Gradient text title using `background-clip: text`.
- 20 decorative dots with deterministic positions (no `Math.random()` in render to avoid hydration issues) that float with CSS keyframe animations and staggered delays.
- "Begin" button with pill shape, gold gradient, and hover lift effect.

### Upgrade Panel

- Fixed-width (280 px) right-edge overlay, vertically centered.
- Slide-out animation when collapsed (`translateX(280px)`).
- Toggle button appears outside the panel to remain accessible when collapsed.
- Money display uses large bold yellow numeral.
- Each upgrade item shows an icon, label, current value, and cost button.
- Cost button changes colour (green vs dimmed) based on affordability.

---

## Canvas Rendering Details

### Hero Shape (Hexagon)

Each hero is drawn as a regular hexagon using six `lineTo` calls from a center origin:

```
(0, -s)
(s*0.866, -s*0.5)
(s*0.866,  s*0.5)
(0,  s)
(-s*0.866,  s*0.5)
(-s*0.866, -s*0.5)
```

where `s = 18` (HERO_SIZE). A white circle of radius 4 is drawn at center.

### Dot Shape

Normal dots: single `circle(0, 0, 6)` filled yellow.
Special dots: inner `circle(0, 0, 10)` filled gold + outer `circle(0, 0, 14)` filled gold at 30% alpha for glow effect.

### Resize Behaviour

PixiJS `resizeTo: container` automatically updates `app.screen.width/height` and resizes the canvas whenever the container element changes size. No manual resize listener is needed.

---

## Testing Strategy

### Unit Tests (Vitest + Testing Library)

| Test File | Coverage |
|---|---|
| `LandingScreen.test.tsx` | Title renders; Begin button exists; clicking Begin fires `onBegin` |
| `UpgradePanel.test.tsx` | Heading renders; money displays; affordable buttons exist; panel collapses/expands |
| `useGameStore.test.ts` | Default state; `addMoney`; upgrade speed/count/chance when affordable; no-op when broke |

### Test Environment

- **jsdom** provides a browser-like DOM for component rendering.
- CSS Modules are processed by Vite's transform (vitest uses `css: true`).
- `@testing-library/jest-dom` matchers are registered globally in `src/test/setup.ts`.
- PixiJS (WebGL) is not tested — the `GameCanvas` component is integration-level and would require a WebGL-capable headless environment. Unit tests focus on the React and state layers.

---

## Future Enhancements

### Gameplay

1. **Prestige / Reset** — reset progress for a permanent multiplier bonus.
2. **Offline Progress** — calculate earnings during time away using `Date.now()` delta on load.
3. **Achievements** — unlock badges for milestones (e.g., "Collect 1,000 dots").
4. **Hero Abilities** — each hero type has a unique passive ability (e.g., magnet field that attracts nearby dots).
5. **Dot Types** — add more dot varieties: cursed dots that penalise money, bonus multiplier dots, chain-reaction cluster dots.
6. **Wave Events** — periodic events where a burst of special dots floods the field for 10 seconds.
7. **Hero Levels** — individual hero XP and levels gained from collecting dots.
8. **Map Zones** — divide the canvas into zones with different base dot values.

### Technical

1. **Persistent Save State** — serialize game state to `localStorage` on a timer and on page unload.
2. **Web Worker Simulation** — move the game logic to a Web Worker to keep the main thread free for smooth UI.
3. **Particle Effects** — add PixiJS particle emitters for dot collection bursts and hero trails.
4. **Sound Effects** — Web Audio API for collection pops, upgrade chimes, and ambient background music.
5. **Mobile Support** — touch event handling for the upgrade panel, responsive layout adjustments.
6. **PWA** — add a service worker and web manifest for installability and offline support.
7. **Accessibility** — add ARIA live regions to announce money and upgrade status to screen readers.
8. **Internationalisation** — number formatting via `Intl.NumberFormat` for large values (K, M, B suffixes).

---

## Development Commands

```bash
# Install dependencies
npm install

# Start dev server with hot reload
npm run dev

# Type-check and build for production
npm run build

# Preview production build
npm run preview

# Run all tests once
npm test

# Run tests in watch mode
npm run test:watch

# Lint source files
npm run lint

# Format source files
npm run format
```

---

*Document version: 1.0.0 — Initial release*
