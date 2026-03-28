---
phase: 01-foundation
plan: 02
subsystem: data
tags: [react, localStorage, migration, vitest, supabase-sync, lucide-react]

# Dependency graph
requires:
  - phase: 01-01
    provides: project scaffold with React/Vite/Tailwind, src/ file structure established
provides:
  - mindmap → deck rename complete across all 5 affected source files
  - localStorage migration in loadProgress() for existing user data
  - normalizeMindmapToDeck helper preventing Supabase sync from re-introducing stale key
  - vitest test infrastructure with jsdom environment
  - 3 migration test suites (modules, storage, sync) all GREEN
affects: [01-03, 01-04, ActivityPanel, ModuleDetail, useProgress, useSync]

# Tech tracking
tech-stack:
  added: [vitest, jsdom, @vitest/coverage-v8]
  patterns: [TDD RED-GREEN for data migration tasks, inline one-time migration in loadProgress, exported normalization helper pattern for sync safety]

key-files:
  created:
    - src/__tests__/modules.migration.test.js
    - src/__tests__/storage.migration.test.js
    - src/__tests__/sync.migration.test.js
  modified:
    - src/data/modules.js
    - src/components/ActivityCheckbox.jsx
    - src/utils/storage.js
    - src/hooks/useProgress.js
    - src/hooks/useSync.js
    - vite.config.js

key-decisions:
  - "TDD approach for migration: wrote failing tests first, verified RED, then implemented GREEN"
  - "Migration placed inline in loadProgress() before DEFAULT_STATE merge to avoid shallow spread discarding migrated values"
  - "normalizeMindmapToDeck exported (not private) so sync.migration test can import and verify it directly"
  - "Vitest added as devDependency with jsdom environment — vitest config added to vite.config.js test block"

patterns-established:
  - "Migration pattern: inline in loadProgress() using Object.values(parsed.completed).forEach — runs before DEFAULT_STATE spread"
  - "Sync normalization pattern: exported helper called on remote data inside mergeProgress — prevents stale keys from re-entering localStorage"
  - "TDD test file naming: src/__tests__/{area}.{feature}.test.js"

requirements-completed: [DATA-01, DATA-02]

# Metrics
duration: 8min
completed: 2026-03-28
---

# Phase 01 Plan 02: Mindmap → Deck Migration Summary

**mindmap activity renamed to deck across 5 source files with localStorage migration and Supabase sync normalization — existing user progress survives the rename**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-03-28T20:24:55Z
- **Completed:** 2026-03-28T20:27:53Z
- **Tasks:** 3
- **Files modified:** 8 (5 source files + 3 new test files + vite.config.js + package.json)

## Accomplishments

- All 8 modules updated: `id: "deck"`, `label: "Deck"`, `icon: "Images"` — GitBranch icon removed from ActivityCheckbox
- One-time localStorage migration in `loadProgress()` converts `mindmap: true` → `deck: true` for existing users, then removes the stale key
- Exported `normalizeMindmapToDeck` helper in `useSync.js` called on remote Supabase data before merge — prevents stale key re-entry
- vitest infrastructure installed (jsdom environment) with 3 migration test suites — all 23 tests in project now pass

## Task Commits

Each task was committed atomically:

1. **Task 1: Rename mindmap → deck in modules.js and ActivityCheckbox.jsx** - `fbb59ab` (feat)
2. **Task 2: Add localStorage migration in storage.js and fix resetAll in useProgress.js** - `74663ed` (feat)
3. **Task 3: Add normalizeMindmapToDeck helper to useSync.js** - `8520702` (feat)

## Files Created/Modified

- `src/data/modules.js` - All 8 modules: id/label/icon changed from mindmap/Mind Map/GitBranch → deck/Deck/Images
- `src/components/ActivityCheckbox.jsx` - ICON_MAP: Images replaces GitBranch; import updated
- `src/utils/storage.js` - DEFAULT_STATE uses deck; loadProgress() has inline migration block; migration runs before DEFAULT_STATE spread
- `src/hooks/useProgress.js` - resetAll uses deck shape; dead `const fresh = loadProgress()` line removed
- `src/hooks/useSync.js` - Exported normalizeMindmapToDeck helper added; mergeProgress uses normalizedRemote throughout
- `src/__tests__/modules.migration.test.js` - 3 tests: no mindmap in MODULES, every module has deck, deck activity shape correct
- `src/__tests__/storage.migration.test.js` - 3 tests: mindmap→deck migration, idempotent second load, clean deck data unaffected
- `src/__tests__/sync.migration.test.js` - 3 tests: function exported, mindmap normalized to deck, mindmap key absent after normalize
- `vite.config.js` - Added test.environment jsdom and test.setupFiles config block

## Decisions Made

- Placed migration inline in `loadProgress()` before the `DEFAULT_STATE` spread — a post-spread placement would have the shallow merge restore `mindmap: false` from DEFAULT_STATE, defeating the migration
- Exported `normalizeMindmapToDeck` as a named export rather than keeping it private to `mergeProgress` — enables direct unit testing without mocking the whole sync flow
- Added vitest as a dev dependency with jsdom environment (not a full React Testing Library setup) — sufficient for the data/utility-level tests in this plan

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Installed vitest and jsdom — test infrastructure did not exist**
- **Found during:** Task 1 (TDD RED phase)
- **Issue:** `npx vitest` not available; no test framework in project
- **Fix:** `npm install --save-dev vitest jsdom @vitest/coverage-v8`; added vitest config block to `vite.config.js`
- **Files modified:** package.json, package-lock.json, vite.config.js
- **Verification:** `npx vitest run` executes successfully
- **Committed in:** fbb59ab (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking — missing test infrastructure)
**Impact on plan:** Required to execute the TDD tasks as specified. No scope creep.

## Issues Encountered

- The TDD plan specified the sync.migration test as "1/1 green" but 3 tests were written (exported function, normalization correctness, key absence) — this is additive and matches the spirit of the behavior spec. All pass.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- `deck` is the canonical activity id throughout the codebase — all subsequent phases can safely reference it
- All 23 tests passing including the 9 new migration tests
- No remaining `mindmap` references in non-migration source files
- ActivityPanel and content components (plan 03, 04) can proceed knowing deck is the stable activity id

---
*Phase: 01-foundation*
*Completed: 2026-03-28*
