# Phase 1: Foundation - Context

**Gathered:** 2026-03-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Data model migration (mindmap → deck), ActivityPanel expand-in-place scaffold within ModuleDetail, Workbox runtimeCaching for audio, and content data structure scaffolds for flashcards, quizzes, and Teach-Back prompts. No actual content extraction or interactive components — those are Phase 2+.

</domain>

<decisions>
## Implementation Decisions

### Data Migration (mindmap → deck)
- **D-01:** Rename all `mindmap` references to `deck` in modules.js activities array (id, label, icon)
- **D-02:** Update DEFAULT_STATE in storage.js to use `deck` key instead of `mindmap`
- **D-03:** Add one-time migration in `loadProgress()` — if parsed data contains `mindmap` keys in any module's completed object, copy value to `deck` key and delete `mindmap`. This matches the existing merge pattern (`{ ...DEFAULT_STATE, ...parsed }`) already in storage.js.
- **D-04:** Update useProgress.js `resetAll` to use `deck` instead of `mindmap`
- **D-05:** Update useSync.js `mergeProgress` to handle `deck` key (the "true wins" merge strategy applies unchanged)
- **D-06:** Update ActivityCheckbox and any component that references the `mindmap` activity id
- **D-07:** Update the Deck activity icon from `GitBranch` to `Layers` or `ImageIcon` (more appropriate for image slides)

### ActivityPanel Interaction
- **D-08:** ActivityPanel expands in-place below the activity row when tapped — no modal, no new route
- **D-09:** Only one ActivityPanel can be open at a time (tapping another closes the current one)
- **D-10:** Use Framer Motion `AnimatePresence` + `motion.div` with height animation for smooth expand/collapse — consistent with existing animation patterns
- **D-11:** ActivityPanel receives `moduleId`, `activityId`, and an `onComplete` callback prop
- **D-12:** The `onComplete` callback calls `toggleActivity(moduleId, activityId)` from useProgress — this is the shared completion handler (PANEL-03 requirement)
- **D-13:** For Phase 1, expanded panel shows a placeholder ("Content coming in Phase 2/3") — actual content components plug in later

### Content Data Structure
- **D-14:** Create `src/data/content/` directory for all learning content data
- **D-15:** Flashcard data: `src/data/content/flashcards.js` — exports object keyed by moduleId, each containing array of `{ question, answer }` pairs. Phase 1 scaffolds with 2-3 example cards for module 1 only.
- **D-16:** Quiz data: `src/data/content/quizzes.js` — exports object keyed by moduleId, each containing array of `{ question, options: string[], correctIndex: number }`. Phase 1 scaffolds with 2-3 example questions for module 1 only.
- **D-17:** Teach-Back prompts: `src/data/content/teachback.js` — exports object keyed by moduleId, each containing array of `{ prompt, conceptArea }` strings. Phase 1 scaffolds with 1-2 example prompts for module 1 only.
- **D-18:** Audio and deck image files will go in `public/audio/{moduleId}/` and `public/decks/{moduleId}/` respectively — created as empty directories in Phase 1, populated in Phase 2.

### Workbox Audio Caching
- **D-19:** Add runtimeCaching entry in vite.config.js PWA config for `audio/**` pattern with CacheFirst strategy
- **D-20:** Do NOT add audio files to `globPatterns` (precache manifest) — they are too large for precaching
- **D-21:** Set maxEntries and maxAgeSeconds on the audio cache to prevent unbounded growth

### Claude's Discretion
- Exact Framer Motion animation parameters for ActivityPanel (duration, easing)
- Placeholder content text for the Phase 1 ActivityPanel stub
- Whether to use `Images` or `Layers` icon for the renamed Deck activity
- Cache maxEntries and maxAgeSeconds values for audio runtime cache

</decisions>

<canonical_refs>
## Canonical References

No external specs — requirements fully captured in decisions above and in the following planning artifacts:

### Planning
- `.planning/PROJECT.md` — Project vision, constraints (offline-first, static hosting)
- `.planning/REQUIREMENTS.md` — DATA-01 through DATA-05, PANEL-01 through PANEL-03, PWA-01
- `.planning/ROADMAP.md` §Phase 1 — Success criteria and requirement mapping
- `.planning/research/ARCHITECTURE.md` — Component boundaries, data flow, build order recommendations
- `.planning/research/PITFALLS.md` — Audio caching pitfalls, state separation guidance

### Existing Code
- `src/utils/storage.js` — DEFAULT_STATE definition and loadProgress merge pattern (migration target)
- `src/hooks/useProgress.js` — toggleActivity function (completion handler integration point)
- `src/hooks/useSync.js` — mergeProgress function (needs deck key handling)
- `src/data/modules.js` — Activity definitions (mindmap → deck rename target)
- `vite.config.js` — PWA/Workbox configuration (runtimeCaching addition target)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `ActivityCheckbox` component: Currently renders each activity row — ActivityPanel will expand below this
- `AnimatePresence` + Framer Motion: Already used for page transitions in App.jsx — same pattern for panel expand/collapse
- `useProgress.toggleActivity(moduleId, activityId)`: Existing completion handler — ActivityPanel's onComplete callback wraps this directly
- `loadProgress()` merge pattern: `{ ...DEFAULT_STATE, ...parsed }` already handles schema evolution — migration builds on this

### Established Patterns
- **Props drilling from App.jsx**: Progress state flows App → Page → Component. ActivityPanel will receive its onComplete via ModuleDetail props.
- **No semicolons, double quotes, named exports**: All new files must follow this style
- **CSS custom properties for theming**: ActivityPanel should use `var(--bg-card)`, `var(--border)`, etc.
- **Framer Motion for all animations**: No raw CSS transitions — use `motion.div` with `AnimatePresence`

### Integration Points
- `ModuleDetail.jsx`: ActivityPanel renders inside the activity list, below each ActivityCheckbox
- `storage.js`: DEFAULT_STATE and loadProgress need migration logic
- `modules.js`: Activity definitions need mindmap → deck rename
- `vite.config.js`: PWA plugin config needs runtimeCaching addition

</code_context>

<specifics>
## Specific Ideas

- User explicitly stopped using Mind Maps in NotebookLM and switched to Decks (image slides) — the rename reflects actual usage
- Existing progress data must survive the migration — user has been tracking for weeks
- Content state (flashcard scores, quiz attempts, audio position) must stay SEPARATE from useProgress to avoid sync thrashing (from research PITFALLS.md)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-foundation*
*Context gathered: 2026-03-28*
