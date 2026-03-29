# Phase 2: Audio and Deck - Context

**Gathered:** 2026-03-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Extract audio overview files and deck slide images from all 8 NotebookLM notebooks via MCP tools. Build an embedded audio player component and image deck carousel component that render inside ActivityPanel. Auto-complete activities based on consumption (audio at ~90%, deck at last slide). Service worker caches audio on first play for offline use.

</domain>

<decisions>
## Implementation Decisions

### NotebookLM Content Extraction
- **D-01:** Use NotebookLM MCP tools (mcp__claude_ai_Granola or notebooklm skill) to discover all 8 notebook IDs and extract assets
- **D-02:** Extract audio overview files from each notebook — save as MP3 to `public/audio/{moduleId}/overview.mp3`
- **D-03:** Extract deck/slide images from each notebook — save to `public/decks/{moduleId}/slide-{N}.png`
- **D-04:** Compress audio to ~64kbps mono MP3 to minimize iOS PWA storage pressure (research recommendation)
- **D-05:** Content extraction is a build-time/dev-time step, not runtime — assets are committed to the repo as static files
- **D-06:** One notebook per module, user confirmed. Need to discover notebook IDs for modules 2-8 (module 1 ID is `72cf9d0c-05b7-48ad-94ff-c12f20f2a6c1`)

### Audio Player Component
- **D-07:** Compact inline player rendered inside ActivityPanel when activity.id === "audio"
- **D-08:** Controls: play/pause toggle, scrub bar with current time + total duration, playback speed selector (0.5x, 1x, 1.25x, 1.5x, 2x)
- **D-09:** Use `react-h5-audio-player` library (research recommendation) — wraps HTML5 `<audio>`, offline-capable with bundled files
- **D-10:** Audio source: `public/audio/{moduleId}/overview.mp3` — served from public dir, cached by service worker on first play
- **D-11:** Auto-complete: fire `onComplete()` callback when `currentTime / duration >= 0.9` — only fires once per session
- **D-12:** Player state (playing, position) is component-local — NOT saved to useProgress (research pitfall: avoid sync thrashing)
- **D-13:** Style the player to match existing dark theme using CSS custom properties (var(--bg-card), var(--text-primary), etc.)

### Deck Viewer Component
- **D-14:** Image carousel rendered inside ActivityPanel when activity.id === "deck"
- **D-15:** Use `embla-carousel-react` library (research recommendation) — ~7kB, headless, zero dependencies
- **D-16:** Navigation: prev/next arrow buttons + swipe gesture on mobile
- **D-17:** Slide counter: "3 / 12" position indicator
- **D-18:** Tap/click to zoom: opens a modal/overlay with the full-size image for readability
- **D-19:** Keyboard arrow key navigation on desktop when carousel is focused
- **D-20:** Auto-complete: fire `onComplete()` when user reaches the last slide — only fires once per session
- **D-21:** Deck images loaded from `public/decks/{moduleId}/slide-{N}.png`
- **D-22:** All deck images included in Workbox precache manifest (they're small enough, unlike audio)

### ActivityPanel Integration
- **D-23:** ActivityPanel currently shows placeholder text — replace with actual content components based on activity.id
- **D-24:** ActivityPanel renders AudioPlayer when activity.id === "audio", DeckViewer when activity.id === "deck", and keeps placeholder for flashcards/quiz/teachback (Phase 3+)
- **D-25:** Both AudioPlayer and DeckViewer receive `moduleId` and `onComplete` props from ActivityPanel

### Claude's Discretion
- Audio player exact styling (spacing, button sizes, scrub bar appearance)
- Embla carousel configuration (drag threshold, alignment, containScroll)
- Zoom modal animation and dismiss behavior
- How to handle modules with no audio/deck content yet (graceful empty state)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Planning
- `.planning/PROJECT.md` — Offline-first constraint, static hosting
- `.planning/REQUIREMENTS.md` — CONT-01, CONT-02, AUDIO-01–05, DECK-01–05, PWA-03
- `.planning/ROADMAP.md` §Phase 2 — Success criteria
- `.planning/research/STACK.md` — react-h5-audio-player, embla-carousel-react recommendations
- `.planning/research/PITFALLS.md` — iOS audio quirks, audio caching strategy, state separation
- `.planning/research/ARCHITECTURE.md` — ActivityPanel expand-in-place, content state boundaries

### Existing Code (Phase 1 outputs)
- `src/components/ActivityPanel.jsx` — Current placeholder panel, needs content component routing
- `src/pages/ModuleDetail.jsx` — ActivityPanel wiring with onComplete callback
- `src/data/modules.js` — Module definitions with activity IDs (audio, deck, flashcards, quiz, teachback)
- `vite.config.js` — Workbox runtimeCaching already configured for audio/**
- `public/audio/1/.gitkeep` — Directory structure placeholder from Phase 1
- `public/decks/1/.gitkeep` — Directory structure placeholder from Phase 1

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `ActivityPanel.jsx`: Already built with AnimatePresence animation. Needs content routing added (switch on activity.id).
- `handleToggle` in ModuleDetail: Already wired as `onComplete` prop to ActivityPanel.
- `vite.config.js` Workbox config: runtimeCaching for audio/** already in place from Phase 1.
- `public/audio/` and `public/decks/` directories exist with .gitkeep placeholders.

### Established Patterns
- Framer Motion for all animations (ActivityPanel uses it for expand/collapse)
- CSS custom properties for theming (var(--bg-card), var(--border), etc.)
- No semicolons, double quotes, named exports
- Component-local state for UI concerns, useProgress only for completion tracking

### Integration Points
- `ActivityPanel.jsx`: Replace placeholder `<p>` with content component based on `activity.id`
- New components: `src/components/AudioPlayer.jsx`, `src/components/DeckViewer.jsx`
- New npm packages: `react-h5-audio-player`, `embla-carousel-react`
- Content files: `public/audio/{1-8}/overview.mp3`, `public/decks/{1-8}/slide-{N}.png`

</code_context>

<specifics>
## Specific Ideas

- User wants to extract content using NotebookLM MCP tools programmatically — not manual export
- Audio files are NotebookLM "Audio Overview" podcast-style recordings
- Deck images replaced Mind Maps — user switched to using decks instead
- iOS Safari audio playback requires physical device testing (research pitfall)
- Audio position persistence is v2 — not in this phase scope

</specifics>

<deferred>
## Deferred Ideas

- Audio position persistence across sessions (v2 requirement AUDIO-V2-01)
- Audio progress arc overlaid on module ring (v2 requirement AUDIO-V2-02)

</deferred>

---

*Phase: 02-audio-and-deck*
*Context gathered: 2026-03-29*
