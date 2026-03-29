---
phase: 02-audio-and-deck
plan: "02"
subsystem: testing
tags: [vitest, react-testing-library, tdd, red-state, audio, carousel, embla, react-h5-audio-player]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: Vitest + jsdom test infrastructure, ActivityPanel with onComplete callback contract
provides:
  - RED-state failing tests for AudioPlayer (AUDIO-01 through AUDIO-05)
  - RED-state failing tests for DeckViewer (DECK-01 through DECK-05)
  - Updated ActivityPanel tests with content routing assertions replacing old placeholder text assertion
  - Documented DeckViewer slideCount prop contract
affects: [02-03-audio-player-implementation, 02-04-deck-viewer-implementation, 02-05-activitypanel-routing]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "window.__audioPlayerProps for exposing mock callback state in react-h5-audio-player tests"
    - "mockSelectCallback pattern for controlling embla-carousel-react select event in tests"
    - "vi.mock at file top for component isolation in ActivityPanel tests"

key-files:
  created:
    - src/__tests__/AudioPlayer.test.jsx
    - src/__tests__/DeckViewer.test.jsx
  modified:
    - src/__tests__/ActivityPanel.test.jsx

key-decisions:
  - "DeckViewer accepts slideCount prop directly from ActivityPanel (reads module.deckSlideCount) to avoid fetching — enables pure static rendering and simpler tests"
  - "window.__audioPlayerProps pattern used to expose mocked react-h5-audio-player callbacks to test scope"
  - "ActivityPanel tests mock both AudioPlayer and DeckViewer to isolate routing logic from component rendering"

patterns-established:
  - "Pattern: RED-state test files import components that don't exist yet — import error IS the red state"
  - "Pattern: embla-carousel-react mocked with controllable mockSelectCallback and mockSelectedIndex for deterministic select event simulation"

requirements-completed:
  - AUDIO-01
  - AUDIO-02
  - AUDIO-03
  - AUDIO-04
  - AUDIO-05
  - DECK-01
  - DECK-02
  - DECK-03
  - DECK-04
  - DECK-05

# Metrics
duration: 3min
completed: 2026-03-28
---

# Phase 02 Plan 02: TDD Red-State Tests for AudioPlayer and DeckViewer Summary

**5 failing AudioPlayer tests (AUDIO-01 through AUDIO-05) and 5 failing DeckViewer tests (DECK-01 through DECK-05) written before components exist, with ActivityPanel routing assertions replacing the old placeholder text test**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-28T00:06:16Z
- **Completed:** 2026-03-28T00:08:32Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments

- Created `AudioPlayer.test.jsx` with 5 failing tests in RED state — covers play button, time display, speed selector with playbackRate, auto-complete at 90% once-only, and static src path format
- Created `DeckViewer.test.jsx` with 5 failing tests in RED state — covers prev/next buttons, slide counter with select event simulation, zoom modal, auto-complete on last slide once-only, and keyboard arrow nav
- Updated `ActivityPanel.test.jsx` — removed old "Content coming in Phase 2" positive assertion, added AudioPlayer routing test (RED) and flashcards placeholder test (RED pending Plan 04 routing), added mocks for both new components

## Task Commits

Each task was committed atomically:

1. **Task 1: Write failing AudioPlayer tests** - `8db77d9` (test)
2. **Task 2: Write failing DeckViewer tests** - `df6f742` (test)
3. **Task 3: Update ActivityPanel tests** - `0f95e0b` (test)

## Files Created/Modified

- `src/__tests__/AudioPlayer.test.jsx` - 5 RED-state tests covering AUDIO-01 through AUDIO-05; mocks react-h5-audio-player via window.__audioPlayerProps
- `src/__tests__/DeckViewer.test.jsx` - 5 RED-state tests covering DECK-01 through DECK-05; mocks embla-carousel-react with controllable select callback and index; documents slideCount prop
- `src/__tests__/ActivityPanel.test.jsx` - Replaced old placeholder assertion with two routing tests; added vi.mock for AudioPlayer and DeckViewer

## Test Status at Plan Completion

| File | Tests | RED | GREEN |
|------|-------|-----|-------|
| AudioPlayer.test.jsx | 5 | 5 (import error — file doesn't exist) | 0 |
| DeckViewer.test.jsx | 5 | 5 (import error — file doesn't exist) | 0 |
| ActivityPanel.test.jsx | 6 | 2 (routing not yet implemented) | 4 |
| All other test files | 18 | 0 | 18 |

**Total:** 12 RED (expected), 22 GREEN

## Decisions Made

- **DeckViewer slideCount prop:** DeckViewer receives `slideCount` as an explicit prop from ActivityPanel (which reads `module.deckSlideCount` from modules.js). This avoids any runtime image fetching and enables pure static rendering. Tests use `slideCount={3}` for concrete assertions.
- **window.__audioPlayerProps mock pattern:** Exposes the mocked react-h5-audio-player callbacks (`onListen`, `onPlay`, `src`) on the global `window` object so test cases can call them directly without piercing component internals.
- **mockSelectCallback pattern:** Embla mock captures the `on("select", cb)` callback in a module-level variable. Tests control selected index via `mockSelectedIndex` then call `mockSelectCallback()` to simulate navigation events deterministically.

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

- The flashcards "Content coming soon" placeholder test is also RED because the current `ActivityPanel.jsx` renders "Content coming in Phase 2" (not "Content coming soon"). This is expected — both the AudioPlayer routing test and the placeholder text test will go GREEN together when ActivityPanel.jsx is updated in Plan 04.

## Known Stubs

None — this plan creates test files only. No component code, no data wiring.

## Next Phase Readiness

- RED tests define the full contract for AudioPlayer and DeckViewer implementations
- Plan 03 (content extraction) and Plan 04 (AudioPlayer component) can proceed independently — tests don't depend on extracted content
- When AudioPlayer.jsx and DeckViewer.jsx are created in Plans 04 and 05, running `npm test` confirms GREEN
- slideCount prop contract is documented: ActivityPanel must pass `module.deckSlideCount` to DeckViewer

---
*Phase: 02-audio-and-deck*
*Completed: 2026-03-28*
