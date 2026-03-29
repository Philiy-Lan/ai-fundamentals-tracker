---
phase: 02-audio-and-deck
plan: 01
subsystem: content
tags: [audio, mp3, png, deck, modules, notebooklm, placeholder, pwa]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: ActivityPanel scaffold, public/audio/ and public/decks/ directory structure with .gitkeep files
provides:
  - public/audio/{1-8}/overview.mp3 — placeholder MP3 files for all 8 modules (unblocks AudioPlayer dev)
  - public/decks/{1-8}/slide-{1-3}.png — placeholder PNG slides for all 8 modules (unblocks DeckViewer dev)
  - public/decks/{1-8}/manifest.json — slide count manifest per module ({ "count": 3 })
  - src/data/modules.js deckSlideCount field — slide count data for DeckViewer component
affects:
  - 02-02 (AudioPlayer and DeckViewer components consume these static assets)
  - 02-03 and beyond (flashcard/quiz/teachback builds)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Static asset manifest pattern: public/decks/{moduleId}/manifest.json with { count: N } — DeckViewer reads this at runtime to know total slides without hardcoding"
    - "deckSlideCount in modules.js mirrors manifest.json count — both should stay in sync when real content is extracted"

key-files:
  created:
    - public/audio/1/overview.mp3 through public/audio/8/overview.mp3
    - public/decks/1/manifest.json through public/decks/8/manifest.json
    - public/decks/1/slide-1.png through public/decks/8/slide-3.png (3 slides per module)
  modified:
    - src/data/modules.js (deckSlideCount: 3 added to all 8 modules)

key-decisions:
  - "Placeholder approach for all 8 modules: NotebookLM MCP tools not available in executor agent context; placeholder files unblock Wave 2 component development"
  - "3 slides per placeholder module: chosen as minimal non-trivial count to exercise prev/next carousel navigation"
  - "manifest.json pattern for slide count: DeckViewer reads count from manifest at runtime rather than scanning filesystem or hardcoding in component"

patterns-established:
  - "Manifest-driven slide count: public/decks/{moduleId}/manifest.json contains { count: N } which is the source of truth for DeckViewer pagination"
  - "deckSlideCount mirrors manifest: both must be updated together when real content is extracted"

requirements-completed: [CONT-01, CONT-02]

# Metrics
duration: 3min
completed: 2026-03-29
---

# Phase 02 Plan 01: Content Extraction Summary

**Placeholder audio MP3s and deck slide PNGs created for all 8 modules with manifest.json and deckSlideCount — Wave 2 AudioPlayer and DeckViewer development unblocked**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-03-29T09:46:23Z
- **Completed:** 2026-03-29T09:49:03Z
- **Tasks:** 2 (+ 1 checkpoint auto-approved)
- **Files modified:** 41 (8 MP3s, 24 PNGs, 8 manifests, modules.js)

## Accomplishments

- Created placeholder MP3 files for all 8 modules at `public/audio/{1-8}/overview.mp3` (218-byte minimal valid MP3)
- Created 3 placeholder PNG slides per module at `public/decks/{1-8}/slide-{1-3}.png` (69-byte valid 1x1 PNG)
- Written `manifest.json` per module with `{ "count": 3 }` — used by DeckViewer for slide count
- Added `deckSlideCount: 3` to all 8 modules in `src/data/modules.js`
- All pre-existing module/storage/sync tests continue to pass

## Task Commits

Each task was committed atomically:

1. **Task 1: Extract audio overviews (placeholder)** - `a777d38` (chore)
2. **Task 2: Extract deck slides, manifests, modules.js** - `f7a1a74` (chore)

## Files Created/Modified

- `public/audio/{1-8}/overview.mp3` — minimal valid MP3 placeholder per module (8 files)
- `public/decks/{1-8}/slide-1.png` through `slide-3.png` — minimal valid 1x1 PNG placeholder per module (24 files)
- `public/decks/{1-8}/manifest.json` — `{ "count": 3 }` per module (8 files)
- `src/data/modules.js` — `deckSlideCount: 3` added after `description` on all 8 modules

## Decisions Made

- **Placeholder approach for all content**: NotebookLM MCP tools are not accessible in the executor agent context (no MCP server connection available to executor). Placeholder files satisfy the structural requirement and unblock Wave 2 component development — AudioPlayer and DeckViewer can be built and tested against real file paths.
- **3 slides per module**: Chose 3 as the minimum to exercise carousel prev/next navigation logic meaningfully (1 or 2 slides would not cover the typical middle-slide case).
- **Manifest JSON pattern**: `public/decks/{moduleId}/manifest.json` stores `{ "count": N }` as the runtime source of truth for DeckViewer. This avoids filesystem scanning at runtime and keeps slide count explicit.

## Known Stubs

All audio and deck content in this plan is placeholder:

| File | Type | Reason |
|------|------|--------|
| `public/audio/{1-8}/overview.mp3` | 218-byte silent MP3 | NotebookLM MCP unavailable in executor agent context |
| `public/decks/{1-8}/slide-{1-3}.png` | 1x1 white PNG | NotebookLM MCP unavailable in executor agent context |

**Impact:** AudioPlayer will load and attempt to play but audio will be inaudible (218-byte placeholder). DeckViewer will render slides but images will be blank white 1x1 pixels.

**Resolution required:** Manual extraction of real audio and deck content from 8 NotebookLM notebooks using the `notebooklm-mcp` tools. Steps:
1. Run `notebook_list` to discover all 8 notebook IDs
2. For each module: `studio_create(artifact_type="audio")`, wait for completion, `download_artifact` → save to `public/audio/{id}/overview.mp3`
3. For each module: `studio_create(artifact_type="slide_deck")`, wait, `download_artifact` → extract PNGs from PPTX → save to `public/decks/{id}/slide-{N}.png`
4. Update `manifest.json` and `deckSlideCount` with real slide counts

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Fallback] Used placeholder content instead of NotebookLM MCP extraction**
- **Found during:** Task 1 (audio extraction)
- **Issue:** NotebookLM MCP tools (`notebook_list`, `studio_create`, `download_artifact`) are not available in the executor agent's tool context — only file read/write/bash tools are accessible
- **Fix:** Applied the FALLBACK path specified in the plan — created minimal valid placeholder MP3 and PNG files so Wave 2 component development can proceed immediately
- **Files modified:** `public/audio/{1-8}/overview.mp3`, `public/decks/{1-8}/slide-{1-3}.png`
- **Verification:** `ls public/audio/*/overview.mp3 | wc -l` = 8, all non-empty
- **Committed in:** a777d38, f7a1a74

**2. [Rule 2 - Missing critical] ffmpeg not installed for audio compression**
- **Found during:** Task 1 (post-download compression step)
- **Issue:** `ffmpeg` is not installed; placeholder files do not require compression so this is moot for placeholders
- **Fix:** No action needed for placeholders; recorded here for when real audio is extracted (install via `brew install ffmpeg`)
- **Impact on real content:** Real audio extraction will need `brew install ffmpeg` before the compression step

---

**Total deviations:** 2 noted (1 plan-specified fallback, 1 environment gap documented)
**Impact on plan:** Placeholder approach satisfies must_have artifacts and unblocks Wave 2. Real content extraction is a manual follow-up.

## Issues Encountered

- `ffmpeg` not installed. Not a blocker for placeholders. Required for real audio compression (`brew install ffmpeg`).
- Pre-existing test failures in `AudioPlayer.test.jsx` and `DeckViewer.test.jsx` (TDD RED state from plan 02-02 scaffolding — intentional, not caused by this plan).

## User Setup Required

**Manual content extraction required before shipping to production.**

To replace placeholders with real NotebookLM content:

1. Open Claude Desktop with `notebooklm-mcp` server configured
2. Run: `notebook_list` — map notebook titles to module IDs 1-8
3. For each module audio:
   ```
   studio_create(notebook_id=<id>, artifact_type="audio", confirm=True)
   # poll studio_status until complete
   download_artifact(notebook_id=<id>, artifact_type="audio", output_path="public/audio/{id}/overview-raw.mp3")
   ```
4. Install ffmpeg: `brew install ffmpeg`
5. Compress: `ffmpeg -i overview-raw.mp3 -b:a 64k -ac 1 overview.mp3 -y && rm overview-raw.mp3`
6. For each module deck:
   ```
   studio_create(notebook_id=<id>, artifact_type="slide_deck", confirm=True)
   download_artifact(notebook_id=<id>, artifact_type="slide_deck", output_path="/tmp/deck-{id}.pptx")
   ```
7. Extract PNGs: use LibreOffice or python-pptx from PPTX files
8. Update `manifest.json` and `modules.js` `deckSlideCount` with real counts

## Next Phase Readiness

- Wave 2 component development (plan 02-02) is **unblocked** — AudioPlayer and DeckViewer can be built and tested against real file paths with placeholder content
- Workbox precache will include all deck PNG files (they exist on disk before build)
- Audio files served from `public/audio/` will be cached by the existing Workbox runtimeCaching configuration
- **Before production deploy**: Replace placeholder files with real NotebookLM content (see User Setup Required above)

---
*Phase: 02-audio-and-deck*
*Completed: 2026-03-29*
