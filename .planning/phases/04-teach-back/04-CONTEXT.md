# Phase 4: Teach-Back - Context

**Gathered:** 2026-03-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the Teach-Back activity: user sees a module-specific concept prompt, speaks or types their explanation, submits it, and receives structured AI feedback evaluating their understanding. Voice input via Web Speech API with text fallback for unsupported browsers. Claude API evaluation routed through a Vercel API route (key never in client bundle). Graceful offline fallback. Auto-complete only when evaluation meets "good enough" threshold.

</domain>

<decisions>
## Implementation Decisions

### API Key Strategy (TEACH-08)
- **D-01:** Vercel API route at `api/evaluate.js` — receives user explanation, calls Claude API server-side, returns evaluation
- **D-02:** `ANTHROPIC_API_KEY` stored as Vercel environment variable — never in client bundle, never in repo
- **D-03:** App is already deployed on Vercel — no new infrastructure needed, same domain, no CORS issues
- **D-04:** API route receives `{ moduleId, conceptArea, explanation }` and returns structured evaluation JSON

### Voice Input UX (TEACH-02, TEACH-04)
- **D-05:** Tap-to-start / tap-to-stop recording — not hold-to-talk
- **D-06:** Transcript displayed after recording completes (not live word-by-word)
- **D-07:** After recording stops, show transcript in an editable textarea with a "Submit" button — user can review and fix speech recognition errors before submitting
- **D-08:** Pulsing mic icon while recording is active
- **D-09:** No minimum character length required before Submit is enabled
- **D-10:** To retry, user taps the mic button again — replaces previous transcript

### Text Input Fallback (TEACH-03)
- **D-11:** Simple textarea with "Submit" button when SpeechRecognition is unavailable (Firefox, etc.)
- **D-12:** Same submission flow as voice — textarea + Submit, identical from the submit step onward

### AI Feedback Display (TEACH-05, TEACH-06)
- **D-13:** Structured feedback format: numeric score (e.g., 4/5) + bullet points for what was correct + bullet points for what was missed or incorrect
- **D-14:** Visual numeric score displayed alongside the structured bullet points
- **D-15:** Claude decides pass/fail — evaluation includes a numeric score (1-5) and a pass boolean
- **D-16:** Auto-complete activity ONLY when evaluation passes ("good enough") — does NOT auto-complete on fail
- **D-17:** "Try Again" button on failed attempts — returns user to the prompt/input screen to re-record or re-type

### Prompt Display (TEACH-01)
- **D-18:** Module-specific concept prompt shown at the top of the Teach-Back panel (from `src/data/content/teachback.js`)
- **D-19:** Populate teach-back prompts for modules 2-8 (module 1 already has 2 prompts from Phase 1 scaffold)
- **D-20:** Random prompt selected from the module's prompt array each time the panel opens

### Offline Fallback (TEACH-07)
- **D-21:** Check `navigator.onLine` when Teach-Back panel opens — if offline, show "Needs internet connection" message instead of the input UI
- **D-22:** No broken UI or silent failure — clear messaging that this activity requires connectivity

### ActivityPanel Integration
- **D-23:** Add `case "teachback"` to the existing `renderContent` switch in ActivityPanel.jsx
- **D-24:** TeachBackViewer receives `moduleId` and `onComplete` props (same interface as all other content components)

### Claude's Discretion
- Claude API prompt engineering (system prompt, evaluation rubric)
- Exact pulsing animation for mic icon
- Layout of feedback screen (score placement, bullet point styling)
- Error handling for API failures (timeout, rate limit, 500)
- Whether to show the concept area label alongside the prompt

</decisions>

<specifics>
## Specific Ideas

- Teach-Back prompts scaffold exists in `src/data/content/teachback.js` — module 1 has 2 prompts, modules 2-8 are empty arrays
- App is designed for ADHD learners — feedback should be encouraging even on failed attempts, not punitive
- This is the only activity that requires network connectivity — all others work fully offline
- The Vercel API route is the only server-side code in the entire project

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Planning
- `.planning/PROJECT.md` — Offline-first constraint (Teach-Back is the exception), ADHD-aware UX
- `.planning/REQUIREMENTS.md` — TEACH-01 through TEACH-08
- `.planning/ROADMAP.md` §Phase 4 — Success criteria and requirement mapping
- `.planning/phases/03-flashcards-and-quiz/03-CONTEXT.md` — Phase 3 patterns (component-local state, completedRef guard, ActivityPanel routing)

### Existing Code (Phase 1-3 outputs)
- `src/components/ActivityPanel.jsx` — Content routing switch (add teachback case)
- `src/components/FlashcardViewer.jsx` — Reference for component interface pattern (moduleId + onComplete)
- `src/components/QuizViewer.jsx` — Reference for structured feedback display pattern
- `src/data/content/teachback.js` — Scaffold with module 1 prompts (Phase 1)
- `src/data/modules.js` — Module definitions
- `src/__tests__/ActivityPanel.test.jsx` — Existing routing tests to extend

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `ActivityPanel.jsx` renderContent switch: Add one new case — pattern established across 3 prior phases
- `completedRef` guard pattern: Prevents duplicate onComplete calls — reuse in TeachBackViewer
- `src/data/content/teachback.js`: Prompt data scaffold ready to populate
- Framer Motion: Available for mic pulse animation
- `confetti.js`: `fireCelebration()` available for pass celebration

### Established Patterns
- Named exports, no semicolons, double quotes
- CSS custom properties for all theming
- Component-local state for UI concerns, useProgress only for completion tracking
- Vitest + jsdom for component tests, vi.mock for isolating dependencies
- `onComplete` callback prop interface shared across all content components

### Integration Points
- `ActivityPanel.jsx`: Add `case "teachback"` → TeachBackViewer
- New component: `src/components/TeachBackViewer.jsx`
- New API route: `api/evaluate.js` (Vercel serverless function)
- Data: `TEACHBACK_PROMPTS` from teachback.js
- Tests: `src/__tests__/TeachBackViewer.test.jsx`, extend ActivityPanel.test.jsx

</code_context>

<deferred>
## Deferred Ideas

- Multi-turn follow-up questions (TEACH-V2-01) — v2 requirement
- Teach-Back session history (TEACH-V2-02) — v2 requirement
- Celebration on activity completion (POLISH-V2-01) — v2 requirement

</deferred>

---

*Phase: 04-teach-back*
*Context gathered: 2026-03-29*
