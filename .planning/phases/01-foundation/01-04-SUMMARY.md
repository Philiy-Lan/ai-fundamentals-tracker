---
phase: 01-foundation
plan: "04"
subsystem: data
tags: [vitest, workbox, pwa, service-worker, content-scaffold]

# Dependency graph
requires:
  - phase: 01-01
    provides: vite.config.js with VitePWA plugin and Workbox config base

provides:
  - FLASHCARDS export keyed "1"-"8", module 1 has 3 Q&A pairs for "What is AI?"
  - QUIZZES export keyed "1"-"8", module 1 has 3 multiple-choice questions
  - TEACHBACK_PROMPTS export keyed "1"-"8", module 1 has 2 concept prompts
  - public/audio/1/ and public/decks/1/ git-tracked directory placeholders
  - Workbox CacheFirst runtimeCaching for /audio/.+ URLs in vite.config.js

affects:
  - phase-02 (populates audio and deck files into public/audio/ and public/decks/)
  - phase-03 (populates flashcards, quizzes modules 2-8)
  - phase-04 (populates teachback modules 2-8)
  - ActivityPanel component (consumes FLASHCARDS, QUIZZES, TEACHBACK_PROMPTS)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Content data files in src/data/content/ — one file per activity type, keyed by module ID string"
    - "Workbox runtimeCaching for large binary assets excluded from precache globPatterns"
    - "TDD workflow: failing tests committed first, implementation committed when green"

key-files:
  created:
    - src/data/content/flashcards.js
    - src/data/content/quizzes.js
    - src/data/content/teachback.js
    - src/__tests__/content.flashcards.test.js
    - src/__tests__/content.quizzes.test.js
    - src/__tests__/content.teachback.test.js
    - public/audio/1/.gitkeep
    - public/decks/1/.gitkeep
  modified:
    - vite.config.js

key-decisions:
  - "CacheFirst for audio: serves cached audio on repeat plays, falls back to network on first play — avoids re-fetching on every play"
  - "maxEntries:10 covers all 8 modules with 2 spare entries, preventing unbounded cache growth"
  - "globPatterns unchanged: .mp3 already excluded from precache — audio handled only via runtimeCaching"
  - "Content keyed by string module ID (not integer) for consistent object key access"

patterns-established:
  - "Content data shape: object keyed '1'-'8', module 1 scaffold, modules 2-8 empty arrays ready for Phase 3 population"
  - "TDD pattern: write failing tests first, commit as test(), then write implementation, commit as feat()"

requirements-completed: [DATA-03, DATA-04, DATA-05, PWA-01]

# Metrics
duration: 4min
completed: 2026-03-28
---

# Phase 01 Plan 04: Content Scaffold and Audio Cache Summary

**Three content data scaffold files (flashcards, quizzes, teachback) plus Workbox CacheFirst audio caching wired into the PWA service worker**

## Performance

- **Duration:** ~4 min
- **Started:** 2026-03-28T20:25:00Z
- **Completed:** 2026-03-28T20:26:49Z
- **Tasks:** 2 (Task 1 TDD: 3 commits; Task 2: 1 commit)
- **Files modified:** 9

## Accomplishments

- Created `src/data/content/` with flashcards.js, quizzes.js, and teachback.js — all three exports keyed "1"-"8" with module 1 scaffold data and modules 2-8 empty arrays ready for Phase 3 content extraction
- Wrote and validated 9 Vitest tests (3 per file) using TDD — tests committed RED first, implementation committed once GREEN
- Created `public/audio/1/.gitkeep` and `public/decks/1/.gitkeep` so git tracks the directory structure Phase 2 will populate
- Added Workbox `runtimeCaching` CacheFirst handler for `/audio/.+` to vite.config.js — confirmed `audio-cache` appears in the built `dist/sw.js`

## Task Commits

1. **Task 1 (TDD RED): Add failing tests for content data** — `955f7a8` (test)
2. **Task 1 (TDD GREEN): Create flashcards, quizzes, teachback scaffold files** — `235f285` (feat)
3. **Task 2: Public asset directories and Workbox audio runtimeCaching** — `e29f8d8` (feat)

## Files Created/Modified

- `src/data/content/flashcards.js` — FLASHCARDS export, module 1 has 3 Q&A cards for "What is AI?", modules 2-8 empty
- `src/data/content/quizzes.js` — QUIZZES export, module 1 has 3 multiple-choice questions, modules 2-8 empty
- `src/data/content/teachback.js` — TEACHBACK_PROMPTS export, module 1 has 2 concept prompts, modules 2-8 empty
- `src/__tests__/content.flashcards.test.js` — 3 tests: key structure, module 1 shape, modules 2-8 empty
- `src/__tests__/content.quizzes.test.js` — 3 tests: key structure, module 1 shape (with options/correctIndex), modules 2-8 empty
- `src/__tests__/content.teachback.test.js` — 3 tests: key structure, module 1 shape (prompt/conceptArea), modules 2-8 empty
- `public/audio/1/.gitkeep` — git-tracked placeholder preserving audio directory structure
- `public/decks/1/.gitkeep` — git-tracked placeholder preserving decks directory structure
- `vite.config.js` — added runtimeCaching array with CacheFirst handler for /audio/.+ URLs

## Decisions Made

- **CacheFirst over NetworkFirst for audio:** Serves cached audio on repeat plays without a network round-trip. Falls back to network on first play. Audio content is stable between releases so stale-while-revalidate risk is minimal.
- **maxEntries: 10:** Covers all 8 modules with 2 spare slots. Prevents unbounded cache growth as audio files are large.
- **maxAgeSeconds: 30 days:** Audio content does not change between releases. Long TTL prevents unnecessary re-downloads.
- **globPatterns unchanged:** .mp3/.ogg already excluded from precache by omission. Adding runtimeCaching handles audio separately without touching the precache manifest.

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

- `sync.migration.test.js` has one failing test (`normalizeMindmapToDeck is not a function`) from a parallel plan (01-02 or 01-03) that exports this function from `useSync.js`. This is pre-existing and outside this plan's scope — the test file comment acknowledges it: "This test will fail until migrateMindmapToDeck helper is exported from useSync or storage." Not caused by this plan's changes.

## Known Stubs

- `src/data/content/flashcards.js` — modules 2-8 are intentional empty arrays. Phase 3 populates them via NotebookLM content extraction. Module 1 scaffold data is complete and functional.
- `src/data/content/quizzes.js` — same as above, modules 2-8 are intentional stubs.
- `src/data/content/teachback.js` — same as above, modules 2-8 are intentional stubs; Phase 4 populates them.

Note: These stubs do not block the plan's goal. The plan's purpose was to create the scaffold structure with module 1 data — all done criteria are met. Future phases populate 2-8.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Content scaffold files are ready for Phase 2 (audio, decks drop into public/) and Phase 3 (flashcards, quizzes modules 2-8 populated)
- Workbox audio caching is live — as soon as Phase 2 drops .mp3 files into public/audio/, the service worker will cache them on first play
- ActivityPanel components in Phase 2 can import FLASHCARDS, QUIZZES, TEACHBACK_PROMPTS directly from src/data/content/

---
*Phase: 01-foundation*
*Completed: 2026-03-28*

## Self-Check: PASSED

- FOUND: src/data/content/flashcards.js
- FOUND: src/data/content/quizzes.js
- FOUND: src/data/content/teachback.js
- FOUND: public/audio/1/.gitkeep
- FOUND: public/decks/1/.gitkeep
- FOUND commit: 955f7a8 (test RED)
- FOUND commit: 235f285 (feat GREEN)
- FOUND commit: e29f8d8 (feat task 2)
