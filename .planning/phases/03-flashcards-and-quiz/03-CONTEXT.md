# Phase 3: Flashcards and Quiz - Context

**Gathered:** 2026-03-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Build interactive flashcard and quiz components for all 8 modules. Flashcards flip to reveal answers with self-rating and running score. Quizzes present multiple-choice questions with immediate feedback and a final score screen. Both auto-complete when finished. All content extracted from NotebookLM notebooks and bundled as static assets for offline use.

</domain>

<decisions>
## Implementation Decisions

### Content Extraction (CONT-03, CONT-04, CONT-05, CONT-06)
- **D-01:** Extract flashcard Q&A pairs from all 8 NotebookLM notebooks using notebooklm-mcp MCP tools — same approach as Phase 2 audio/deck extraction
- **D-02:** Extract quiz multiple-choice questions from all 8 NotebookLM notebooks via MCP tools
- **D-03:** Populate existing scaffold files: `src/data/content/flashcards.js` (already has module 1 examples) and `src/data/content/quizzes.js` (already has module 1 examples)
- **D-04:** Keep existing data shapes from Phase 1 scaffolds — flashcards: `{ question, answer }`, quizzes: `{ question, options: string[], correctIndex: number }`
- **D-05:** If MCP extraction unavailable in executor context, use placeholder content (same pattern as Phase 2 D-05) — structurally valid, manually replaceable later

### Flashcard Component (FLASH-01 through FLASH-06)
- **D-06:** Use Framer Motion for card flip animation (consistent with existing animation stack) — not 3D CSS transforms. `AnimatePresence` crossfade between question face and answer face.
- **D-07:** Two-state card: question side (default) → tap/click to flip → answer side with correct/incorrect buttons
- **D-08:** Self-rating buttons appear ONLY after flip: "Got it" (correct) and "Missed it" (incorrect) — advances to next card automatically
- **D-09:** Running score display: "12 / 20 correct" format — updates after each rating
- **D-10:** Card progress indicator: "Card 5 of 20" — shows position in deck
- **D-11:** Shuffle toggle button at top of flashcard view — randomizes remaining unreviewed cards when toggled on. Default: sequential order.
- **D-12:** Auto-complete: fire `onComplete()` when all cards have been rated (correct or incorrect) — uses `completedRef` guard pattern from Phase 2
- **D-13:** Score and progress are component-local state (NOT persisted to useProgress or localStorage) — consistent with Phase 2 D-12. Score history is v2 (FLASH-V2-01).

### Quiz Component (QUIZ-01 through QUIZ-06)
- **D-14:** One question per screen — tap an option to select, then tap "Submit" button to confirm
- **D-15:** After submit: wrong selection highlighted red, correct answer highlighted green — inline reveal, no modal. Keeps user in flow (ADHD-aware design).
- **D-16:** "Next" button appears after answer is revealed — advances to next question
- **D-17:** Question progress: "Q 3 of 10" indicator at top
- **D-18:** Final score screen after last question: shows percentage, correct count, and a "Done" button that dismisses the panel
- **D-19:** Auto-complete: fire `onComplete()` when user taps "Done" on the final score screen — uses `completedRef` guard
- **D-20:** Quiz state is component-local — no persistence. Quiz history is v2 (QUIZ-V2-01).
- **D-21:** No timer or countdown — explicitly out of scope per REQUIREMENTS.md (harmful for ADHD learners)

### ActivityPanel Integration
- **D-22:** Add `case "flashcards"` and `case "quiz"` to the existing `renderContent` switch in ActivityPanel.jsx
- **D-23:** FlashcardViewer receives `moduleId` and `onComplete` props (same interface as AudioPlayer/DeckViewer)
- **D-24:** QuizViewer receives `moduleId` and `onComplete` props
- **D-25:** Import flashcard data from `src/data/content/flashcards.js` and quiz data from `src/data/content/quizzes.js` inside the respective components

### PWA / Offline (PWA-02)
- **D-26:** Flashcard and quiz data is JS — already part of the Vite bundle and precached automatically
- **D-27:** No additional Workbox configuration needed (unlike audio which required runtimeCaching)
- **D-28:** Verify all content is available offline after build

### Claude's Discretion
- Exact flip animation parameters (duration, easing, spring config)
- Card visual design (shadows, borders, padding, font sizes)
- Correct/incorrect color choices (within CSS custom property system)
- Empty state when a module has no flashcards/quiz content yet
- Score screen layout and celebration behavior (may tie into existing confetti system)
- Whether "Got it" / "Missed it" use icons, text, or both

</decisions>

<specifics>
## Specific Ideas

- Flashcard data scaffold already exists in `src/data/content/flashcards.js` with 3 example cards for module 1
- Quiz data scaffold already exists in `src/data/content/quizzes.js` with 3 example questions for module 1
- App is designed for ADHD learners — no timers, warm encouragement, micro-celebrations
- Existing confetti system in `src/utils/confetti.js` could fire on quiz completion (Claude's discretion)
- The "Teach-Back" activity remains as "coming soon" placeholder — Phase 4

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Planning
- `.planning/PROJECT.md` — Offline-first constraint, ADHD-aware UX philosophy
- `.planning/REQUIREMENTS.md` — CONT-03–06, FLASH-01–06, QUIZ-01–06, PWA-02
- `.planning/ROADMAP.md` §Phase 3 — Success criteria and requirement mapping
- `.planning/phases/02-audio-and-deck/02-CONTEXT.md` — Phase 2 decisions (auto-complete pattern, component-local state, MCP extraction approach)

### Existing Code (Phase 1+2 outputs)
- `src/components/ActivityPanel.jsx` — Content routing switch (add flashcards/quiz cases)
- `src/components/AudioPlayer.jsx` — Reference for component interface pattern (moduleId + onComplete)
- `src/components/DeckViewer.jsx` — Reference for auto-complete with completedRef guard
- `src/data/content/flashcards.js` — Scaffold with module 1 example data (Phase 1)
- `src/data/content/quizzes.js` — Scaffold with module 1 example data (Phase 1)
- `src/data/modules.js` — Module definitions
- `src/__tests__/ActivityPanel.test.jsx` — Existing routing tests to extend

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `ActivityPanel.jsx` renderContent switch: Add two new cases — pattern is established
- `completedRef` guard pattern (AudioPlayer, DeckViewer): Prevents duplicate onComplete calls — reuse in both new components
- `src/data/content/flashcards.js` and `quizzes.js`: Data scaffolds ready to populate
- `Framer Motion`: Already used for ActivityPanel, DeckViewer zoom modal — use for card flip
- `confetti.js`: `fireCelebration()` available for quiz completion celebration

### Established Patterns
- Named exports, no semicolons, double quotes
- CSS custom properties for all theming (var(--bg-card), var(--text-primary), etc.)
- Component-local state for UI concerns, useProgress only for completion tracking
- Vitest + jsdom for component tests, vi.mock for isolating dependencies
- `onComplete` callback prop interface shared across all content components

### Integration Points
- `ActivityPanel.jsx`: Add `case "flashcards"` → FlashcardViewer, `case "quiz"` → QuizViewer
- New components: `src/components/FlashcardViewer.jsx`, `src/components/QuizViewer.jsx`
- Data imports: `FLASHCARDS` from flashcards.js, `QUIZZES` from quizzes.js
- Tests: `src/__tests__/FlashcardViewer.test.jsx`, `src/__tests__/QuizViewer.test.jsx`, extend ActivityPanel.test.jsx

</code_context>

<deferred>
## Deferred Ideas

- Review missed flashcards (FLASH-V2-01) — v2 requirement
- Flashcard keyboard shortcuts (FLASH-V2-02) — v2 requirement
- Quiz attempt history (QUIZ-V2-01) — v2 requirement
- "Beat your score" prompt (QUIZ-V2-02) — v2 requirement
- Celebration on activity completion (POLISH-V2-01) — v2 requirement

</deferred>

---

*Phase: 03-flashcards-and-quiz*
*Context gathered: 2026-03-29*
