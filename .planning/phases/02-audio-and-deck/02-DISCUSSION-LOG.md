# Phase 2: Audio and Deck - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-29
**Phase:** 02-audio-and-deck
**Areas discussed:** NotebookLM extraction, Audio player UX, Deck viewer UX
**Mode:** Auto (--auto flag — recommended defaults selected)

---

## NotebookLM Content Extraction

| Option | Description | Selected |
|--------|-------------|----------|
| MCP tools extraction | Use NotebookLM MCP tools to discover notebooks and extract assets programmatically | ✓ |
| Manual export | User exports from NotebookLM web UI manually | |
| API integration | Build runtime integration with NotebookLM API | |

**User's choice:** [auto] MCP tools extraction (recommended default)
**Notes:** User explicitly requested programmatic extraction via MCP tools in earlier conversation.

---

## Audio Player UX

| Option | Description | Selected |
|--------|-------------|----------|
| Compact inline player | Play/pause, scrub, speed, time — all within ActivityPanel | ✓ |
| Full-width player | Sticky bottom player like Spotify | |
| Minimal player | Just play/pause + progress bar | |

**User's choice:** [auto] Compact inline player (recommended default)
**Notes:** Fits within ActivityPanel expand pattern. react-h5-audio-player from research.

---

## Deck Viewer UX

| Option | Description | Selected |
|--------|-------------|----------|
| Horizontal carousel | Prev/next + swipe + counter + zoom | ✓ |
| Vertical scroll | Stack slides vertically, scroll through | |
| Grid view | Thumbnail grid, tap to view full | |

**User's choice:** [auto] Horizontal carousel (recommended default)
**Notes:** embla-carousel-react from research. Matches standard slide deck UX.

---

## Claude's Discretion

- Audio player styling details
- Carousel config parameters
- Zoom modal implementation
- Empty state handling

## Deferred Ideas

- Audio position persistence (v2)
- Audio progress arc on ring (v2)
