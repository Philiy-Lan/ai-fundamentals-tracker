---
phase: 04-teach-back
plan: 01
subsystem: api
tags: [anthropic-sdk, vercel, serverless, vitest, tdd, teach-back, react]

# Dependency graph
requires:
  - phase: 03-flashcards-and-quiz
    provides: Component patterns (FlashcardViewer, QuizViewer, ActivityPanel routing switch), test patterns (vi.mock, vitest/jsdom)
  - phase: 01-foundation
    provides: teachback.js scaffold with module 1 prompts
provides:
  - TEACHBACK_PROMPTS populated for all 8 modules
  - api/evaluate.js Vercel serverless function proxying Claude API
  - TeachBackViewer test stubs in RED state (10 tests covering TEACH-01 through TEACH-07)
  - ActivityPanel test extended with teachback routing assertion (D-23)
affects:
  - 04-02 (TeachBackViewer component build — tests are the RED target)
  - 04-03 (ActivityPanel integration — D-23 test drives the case addition)

# Tech tracking
tech-stack:
  added:
    - "@anthropic-ai/sdk ^0.80.0 (production dependency)"
  patterns:
    - "Vercel api/ directory for serverless functions — api/evaluate.js pattern"
    - "Defensive JSON extraction: find first { before JSON.parse to handle Claude preamble"
    - "Test stub pattern: import from non-existent component to achieve RED state"

key-files:
  created:
    - api/evaluate.js
    - src/__tests__/TeachBackViewer.test.jsx
  modified:
    - src/data/content/teachback.js
    - src/__tests__/ActivityPanel.test.jsx
    - src/__tests__/content.teachback.test.js

key-decisions:
  - "Defensive JSON extraction in api/evaluate.js strips text before first { to handle Claude haiku occasional preamble"
  - "content.teachback.test.js updated from asserting empty arrays to asserting length >= 1 after prompts populated"
  - "TeachBackViewer test stubs use actual test logic (not expect(true).toBe(false)) per plan spec"

patterns-established:
  - "Pattern: RED test stubs import from non-existent component — import failure = RED state confirmed"
  - "Pattern: vi.stubGlobal('fetch', vi.fn()) for fetch mocking in Vitest"
  - "Pattern: window.SpeechRecognition = class MockSpeechRecognition {} for voice API testing"

requirements-completed: [TEACH-01, TEACH-05, TEACH-08]

# Metrics
duration: 6min
completed: 2026-03-29
---

# Phase 04 Plan 01: Teach-Back Data Layer Summary

**TEACHBACK_PROMPTS filled for all 8 modules, Vercel claude-haiku-4-5 proxy in api/evaluate.js, and 10 RED test stubs covering TEACH-01 through TEACH-07**

## Performance

- **Duration:** 6 min
- **Started:** 2026-03-29T14:29:43Z
- **Completed:** 2026-03-29T14:35:39Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments

- Populated TEACHBACK_PROMPTS with 2 prompts per module for modules 2-8, keeping module 1 unchanged
- Created api/evaluate.js with full Claude API proxy: method guard (405), validation guard (400), error handler (500), defensive JSON extraction
- Installed @anthropic-ai/sdk 0.80.0 as production dependency
- Created TeachBackViewer.test.jsx with 10 test stubs covering all 7 TEACH requirements — confirmed RED state (component import fails)
- Extended ActivityPanel.test.jsx with teachback routing test (D-23) and TeachBackViewer mock

## Task Commits

Each task was committed atomically:

1. **Task 1: Populate teachback prompts + create API route + install SDK** - `c38a5ea` (feat)
2. **Task 2: Create TeachBackViewer test stubs (RED) + extend ActivityPanel test** - `fd559cf` (test)

**Plan metadata:** (pending final commit)

## Files Created/Modified

- `src/data/content/teachback.js` - Added 2 prompts per module for modules 2-8; module 1 unchanged
- `api/evaluate.js` - New Vercel serverless function: POST /api/evaluate proxying claude-haiku-4-5
- `package.json` + `package-lock.json` - @anthropic-ai/sdk 0.80.0 added
- `src/__tests__/TeachBackViewer.test.jsx` - 10 RED test stubs for TEACH-01 through TEACH-07
- `src/__tests__/ActivityPanel.test.jsx` - TeachBackViewer mock + D-23 routing test + updated placeholder test
- `src/__tests__/content.teachback.test.js` - Updated: modules 2-8 assert length >= 1 (not empty)

## Decisions Made

- Defensive JSON extraction in api/evaluate.js: `raw.indexOf("{")` + `raw.slice(jsonStart)` before `JSON.parse` — handles Claude haiku's rare preamble text
- content.teachback.test.js updated to assert populated arrays (old assertion of empty arrays was a Phase 1 placeholder that became incorrect after data layer work)
- TeachBackViewer test stubs use actual test logic per plan spec — not `expect(true).toBe(false)` placeholders

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Updated content.teachback.test.js assertion for modules 2-8**
- **Found during:** Task 2 (running full test suite to check for regressions)
- **Issue:** Existing test asserted `TEACHBACK_PROMPTS["2"] through ["8"]` equal `[]` — this became a failing test after Task 1 populated them
- **Fix:** Updated test to assert each module has `length >= 1` and valid `prompt` / `conceptArea` strings
- **Files modified:** `src/__tests__/content.teachback.test.js`
- **Verification:** Full test suite runs with only TeachBackViewer.test.jsx (RED) and ActivityPanel.test.jsx (D-23 RED) failing — no unintended regressions
- **Committed in:** fd559cf (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - bug in stale test assertion)
**Impact on plan:** Required fix to prevent test regression. No scope creep.

## Issues Encountered

None beyond the planned RED state for Task 2 tests.

## Next Phase Readiness

- api/evaluate.js ready for TeachBackViewer component to fetch against (Plan 02)
- TEACHBACK_PROMPTS fully populated — no data gaps that could break random prompt selection
- 10 RED tests define exact behavior contract for TeachBackViewer (Plan 02 makes them GREEN)
- ActivityPanel D-23 test in RED — Plan 02 adds the `case "teachback"` routing to ActivityPanel

## Known Stubs

None — api/evaluate.js is fully implemented. TEACHBACK_PROMPTS is fully populated. Test files are stubs by design (RED state is the goal for this plan).

---

*Phase: 04-teach-back*
*Completed: 2026-03-29*
