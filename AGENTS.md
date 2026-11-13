# 🤖 AGENTS.md — Developer & Autonomous Agent Guidelines

This document outlines architecture rules, coding standards, simulation guidelines, and operational procedures for autonomous agents and contributors working on **Tiny Mart Tycoon**.

---

## 🏗️ 1. Architecture Overview

Tiny Mart Tycoon is structured with strict separation of concerns:

```
src/
  app/                    # Application shell & top-level layout
  components/
    game/                 # Game viewport and HTML5 Canvas bridge
    hud/                  # Top status bar (Cash, XP, Level, Shoppers, Speed, Audio)
    panels/               # Management UI tabs (Products, Staff, Upgrades, Stats, Achievements, Settings)
    ui/                   # Global modal overlays (OfflineProgress, TutorialGuide)
  data/                   # Initial immutable definitions (Products, Staff, Upgrades, Layout coordinates)
  game/
    economy/              # Economic calculations, wholesale multipliers, and offline math
    entities/             # Game entity definitions & waypoint coordinates
    progression/          # Store XP, level thresholds, and achievement evaluations
    rendering/            # 60 FPS HTML5 Canvas 2D isometric/top-down rendering pipeline
    systems/              # Customer AI state machine and Staff automation loops
  store/                  # Zustand store (bridges simulation ticks with React UI state)
  types/                  # Strict TypeScript data models and save schema definitions
  utils/                  # Web Audio synthesizer and versioned LocalStorage persistence
tests/                    # Vitest unit test suites
```

### Core Architecture Rules:
1. **Simulation Decoupling**: Simulation math in `src/game/` must remain pure and testable outside React components.
2. **Delta Time (`deltaSeconds`)**: All continuous gameplay movement, timers, and progress updates must be scaled by `deltaSeconds * gameSpeed`. Never rely on `setInterval` or fixed step timers for physics/movement.
3. **No Financial Desynchronization**: Never create money or products from unvalidated states. Always verify funds with `canAfford` before deducting and verify `maxCapacity - stock` before adding inventory.
4. **Single Agent Rule**: **DO NOT use `/swarm`**. Work as a single, focused autonomous agent.

---

## 📦 2. Adding New Features

### Adding a New Product
1. Define the item in `src/data/initialData.ts` under `INITIAL_PRODUCTS`.
2. Add corresponding `ShelfLocation` coordinates in `SHELF_LOCATIONS`.
3. Add a Lucide icon mapping in `src/components/panels/ProductsPanel.tsx`.
4. Ensure `INITIAL_STATS.itemsSold` records unit sales for the new product ID.
5. Add unit tests in `tests/economy.test.ts` verifying unlock requirements and restocking.

### Adding a New Upgrade
1. Add an entry to `INITIAL_UPGRADES` in `src/data/initialData.ts`.
2. Define its effect handling inside `useGameStore.ts` (`buyUpgrade` action or simulation ticks).
3. Add an icon mapping in `src/components/panels/UpgradesPanel.tsx`.
4. Verify cost scaling with `calculateUpgradeCost`.

### Adding a New Staff Role
1. Add role definition to `StaffType` and `INITIAL_STAFF`.
2. Implement automation handling in `src/game/systems/staffSystem.ts`.
3. Add salary handling in `calculateStaffSalaries`.
4. Add unit tests in `tests/staff.test.ts`.

---

## 💾 3. Save Game Safety & Versioning

- All save data is stored under localStorage key `TINY_MART_TYCOON_SAVE_V1`.
- When modifying save schema:
  - If backward compatible: update `src/utils/storage.ts` sanitizers with default fallbacks.
  - If schema changes significantly: create a migration function incrementing `version` (e.g. from 1 to 2) and convert old fields safely.
  - Always guard against `NaN`, `Infinity`, negative numbers, and malformed strings.

---

## 🧪 4. Testing & Quality Control Process

Before committing or pushing any code, run the full verification pipeline:

```bash
# 1. Lint checking (oxlint)
npm run lint

# 2. Run all Vitest unit tests
npm run test

# 3. TypeScript compilation & production build
npm run build
```

**Never ignore errors or warnings.** If a test fails or TypeScript complains about `verbatimModuleSyntax`, fix it cleanly before proceeding.

---

## 🚀 5. Git & GitHub Workflow

When asked to update or implement new features:
1. Review `AGENTS.md`.
2. Implement changes with clean, strict TypeScript.
3. Run `npm run lint`, `npm run test`, and `npm run build`.
4. Stage and commit with descriptive semantic commit messages:
   - `feat: ...` for new features
   - `fix: ...` for bug fixes
   - `test: ...` for test suite additions
   - `docs: ...` for documentation
5. Push to branch `main` on the configured remote repository.
6. Never force-push (`git push -f`) or delete existing commit histories.
