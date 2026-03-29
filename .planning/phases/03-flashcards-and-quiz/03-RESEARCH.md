# Phase 3: Flashcards and Quiz - Research

**Researched:** 2026-03-29
**Domain:** React interactive learning components (flashcard flip, multi-choice quiz) with Framer Motion animation
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Extract flashcard Q&A pairs from all 8 NotebookLM notebooks using notebooklm-mcp MCP tools
- **D-02:** Extract quiz multiple-choice questions from all 8 NotebookLM notebooks via MCP tools
- **D-03:** Populate existing scaffold files: `src/data/content/flashcards.js` and `src/data/content/quizzes.js`
- **D-04:** Keep existing data shapes: flashcards `{ question, answer }`, quizzes `{ question, options: string[], correctIndex: number }`
- **D-05:** If MCP extraction unavailable, use placeholder content — structurally valid, manually replaceable
- **D-06:** Use Framer Motion for card flip animation (AnimatePresence crossfade) — NOT 3D CSS transforms
- **D-07:** Two-state card: question side → tap/click to flip → answer side with correct/incorrect buttons
- **D-08:** Self-rating buttons appear ONLY after flip: "Got it" and "Missed it"
- **D-09:** Running score display: "12 / 20 correct" format
- **D-10:** Card progress indicator: "Card 5 of 20"
- **D-11:** Shuffle toggle button — randomizes remaining unreviewed cards; default sequential
- **D-12:** Auto-complete: fire `onComplete()` when all cards rated — use `completedRef` guard pattern
- **D-13:** Score and progress are component-local state — NOT persisted to useProgress or localStorage
- **D-14:** One question per screen — tap option to select, tap Submit to confirm
- **D-15:** After submit: wrong selection highlighted red, correct answer highlighted green
- **D-16:** "Next" button appears after answer revealed
- **D-17:** Question progress: "Q 3 of 10" indicator at top
- **D-18:** Final score screen after last question: percentage + correct count + "Done" button
- **D-19:** Auto-complete: fire `onComplete()` when user taps "Done" — uses `completedRef` guard
- **D-20:** Quiz state is component-local — no persistence
- **D-21:** No timer or countdown (harmful for ADHD learners — out of scope per REQUIREMENTS.md)
- **D-22:** Add `case "flashcards"` and `case "quiz"` to `renderContent` switch in ActivityPanel.jsx
- **D-23:** FlashcardViewer receives `moduleId` and `onComplete` props
- **D-24:** QuizViewer receives `moduleId` and `onComplete` props
- **D-25:** Import data from respective content files inside the components
- **D-26:** Flashcard and quiz data is JS — already part of Vite bundle, precached automatically
- **D-27:** No additional Workbox configuration needed
- **D-28:** Verify all content available offline after build

### Claude's Discretion

- Exact flip animation parameters (duration, easing, spring config)
- Card visual design (shadows, borders, padding, font sizes)
- Correct/incorrect color choices (within CSS custom property system)
- Empty state when a module has no flashcards/quiz content yet
- Score screen layout and celebration behavior (may tie into existing confetti system)
- Whether "Got it" / "Missed it" use icons, text, or both

### Deferred Ideas (OUT OF SCOPE)

- Review missed flashcards (FLASH-V2-01)
- Flashcard keyboard shortcuts (FLASH-V2-02)
- Quiz attempt history (QUIZ-V2-01)
- "Beat your score" prompt (QUIZ-V2-02)
- Celebration on activity completion (POLISH-V2-01)
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CONT-03 | Extract flashcard Q&A pairs from all 8 NotebookLM notebooks | D-01/D-05: MCP extraction or placeholder pattern established |
| CONT-04 | Extract multiple choice quiz questions from all 8 NotebookLM notebooks | D-02/D-05: same extraction pattern |
| CONT-05 | Organize extracted content into structured static assets | D-03: populate `flashcards.js` and `quizzes.js` scaffolds |
| CONT-06 | Compress audio files to minimize PWA bundle size | N/A for Phase 3 data (JS data files, not audio) |
| FLASH-01 | Card flip animation to reveal answer | Framer Motion AnimatePresence key-swap crossfade pattern documented below |
| FLASH-02 | Correct / incorrect self-rating buttons after reveal | Two-state (flipped) render branch with "Got it" / "Missed it" buttons |
| FLASH-03 | Running session score display (X/Y correct) | Local `useState` counter; format "X / Y correct" |
| FLASH-04 | Card progress indicator (e.g., "5 of 20") | `currentIndex + 1` / `cards.length` display |
| FLASH-05 | Shuffle option to randomize card order | Fisher-Yates on remaining unreviewed cards; toggle state in component |
| FLASH-06 | Auto-complete activity when all cards reviewed | `completedRef` guard — same pattern as DeckViewer and AudioPlayer |
| QUIZ-01 | Multiple choice question display with selectable options | Option list with selectedIndex state; visual highlight on selection |
| QUIZ-02 | Submit answer and show correct/incorrect result | `isSubmitted` state gate; color highlight based on `selectedIndex === correctIndex` |
| QUIZ-03 | Reveal correct answer on wrong selection | Always highlight `correctIndex` green after submit; wrong selection red |
| QUIZ-04 | Question progress indicator (e.g., "Q 3 of 10") | `currentIndex + 1` / `questions.length` display |
| QUIZ-05 | Final score screen with percentage | Separate render branch when `currentIndex >= questions.length` |
| QUIZ-06 | Auto-complete activity on quiz finish | `completedRef` guard fires in "Done" button handler |
| PWA-02 | All non-audio content (images, JSON) included in precache manifest | JS data files are auto-bundled by Vite — Workbox `globPatterns` covers `**/*.js` already |
</phase_requirements>

---

## Summary

Phase 3 builds two interactive learning components — FlashcardViewer and QuizViewer — that plug into the existing ActivityPanel routing switch. The technical groundwork is entirely in place: Framer Motion is installed and actively used, the data scaffold files exist with correct shapes, the `completedRef` guard pattern is established, and ActivityPanel's switch just needs two new cases.

The card flip animation uses Framer Motion's `AnimatePresence` with a key-swap crossfade between two `motion.div` elements (question face and answer face). This is the correct Framer Motion 12 pattern and avoids the CSS 3D transform approach, which has cross-browser inconsistencies (Safari backface visibility, perspective inheritance) that the key-swap method sidesteps entirely.

Quiz state is a simple three-phase state machine: answering → revealed → score screen. The scoring logic is trivial (increment correct count on submit if selectedIndex matches correctIndex). Both components are pure component-local state — no hooks, no context, no persistence — making them straightforward to test in isolation.

**Primary recommendation:** Implement FlashcardViewer and QuizViewer as self-contained components following the DeckViewer interface pattern exactly. All state is local; all completion fires through the `onComplete` prop.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| framer-motion | 12.38.0 (installed) | Card flip animation via AnimatePresence key-swap | Already in use for ActivityPanel and CelebrationOverlay; no new dependency |
| React | 19.2.4 (installed) | Component state (useState, useRef, useCallback) | Already the app framework |
| lucide-react | 0.577.0 (installed) | Icons for "Got it" / "Missed it" buttons (CheckCircle2, XCircle) | Already in use throughout app |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| canvas-confetti (via confetti.js) | 1.9.4 (installed) | Optional quiz completion celebration | If planner decides to fire confetti on quiz Done — already wrapped in `fireCelebration()` |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| AnimatePresence key-swap crossfade | CSS 3D transform perspective flip | CSS 3D has Safari backface-visibility bugs; key-swap is simpler and already the project pattern |
| Component-local state | useProgress persistence | Persistence is v2 scope; local state is simpler and matches Phase 2 decision D-12 |

**Installation:**

No new packages required. All dependencies are already installed.

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── components/
│   ├── FlashcardViewer.jsx     # New — FLASH-01 through FLASH-06
│   └── QuizViewer.jsx          # New — QUIZ-01 through QUIZ-06
├── data/content/
│   ├── flashcards.js           # Exists — populate modules 2-8
│   └── quizzes.js              # Exists — populate modules 2-8
└── __tests__/
    ├── FlashcardViewer.test.jsx  # New
    ├── QuizViewer.test.jsx       # New
    └── ActivityPanel.test.jsx   # Extend — add flashcards/quiz case tests
```

### Pattern 1: Framer Motion AnimatePresence Key-Swap (Card Flip)

**What:** Two `motion.div` elements rendered conditionally inside `AnimatePresence`. When `isFlipped` state changes, the key changes, causing one to exit and the other to enter. This produces a crossfade that reads as a "flip".

**When to use:** Any two-state toggle where face A and face B occupy the same space. Per D-06, this is the chosen approach.

**Example:**

```jsx
// Source: Framer Motion AnimatePresence docs + existing DeckViewer/CelebrationOverlay patterns
import { AnimatePresence, motion } from "framer-motion"

const [isFlipped, setIsFlipped] = useState(false)

<div style={{ position: "relative" }}>
  <AnimatePresence mode="wait">
    {!isFlipped ? (
      <motion.div
        key="question"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2 }}
      >
        {/* Question content */}
      </motion.div>
    ) : (
      <motion.div
        key="answer"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2 }}
      >
        {/* Answer content + rating buttons */}
      </motion.div>
    )}
  </AnimatePresence>
</div>
```

Note: `mode="wait"` ensures the exit animation finishes before the enter animation starts, preventing overlap. This is a Framer Motion 10+ feature (available in 12.38.0).

### Pattern 2: completedRef Guard (Auto-Complete)

**What:** A `useRef(false)` that prevents `onComplete()` from being called more than once. The guard is set to `true` before calling `onComplete()`.

**When to use:** Every content component with auto-complete. Already established in AudioPlayer and DeckViewer.

**Example:**

```jsx
// Source: Existing DeckViewer.jsx and AudioPlayer.jsx patterns
const completedRef = useRef(false)

function handleCardRated(wasCorrect) {
  // ... update score ...
  const nextIndex = currentIndex + 1
  if (nextIndex >= cards.length) {
    if (!completedRef.current) {
      completedRef.current = true
      onComplete()
    }
  } else {
    setCurrentIndex(nextIndex)
    setIsFlipped(false)
  }
}
```

### Pattern 3: FlashcardViewer State Machine

**What:** Two main state variables drive the UI. `currentIndex` tracks position in the deck; `isFlipped` tracks which face is showing. A separate `score` counter tracks correct ratings.

```jsx
const [cards, setCards] = useState(() => FLASHCARDS[moduleId] || [])
const [currentIndex, setCurrentIndex] = useState(0)
const [isFlipped, setIsFlipped] = useState(false)
const [score, setScore] = useState(0)   // correct ratings
const [isShuffled, setIsShuffled] = useState(false)
const completedRef = useRef(false)
```

**Shuffle implementation:** When the shuffle toggle is activated, apply Fisher-Yates to a copy of the full array and replace `cards` state. When deactivated, restore `FLASHCARDS[moduleId]` order. Shuffle only reorders unreviewed cards conceptually — simplest implementation resets to start of shuffled array.

### Pattern 4: QuizViewer State Machine

**What:** Three phases — answering, revealed, score screen — driven by `selectedIndex` and `isSubmitted` state.

```jsx
const [questions] = useState(() => QUIZZES[moduleId] || [])
const [currentIndex, setCurrentIndex] = useState(0)
const [selectedIndex, setSelectedIndex] = useState(null)  // null = nothing selected
const [isSubmitted, setIsSubmitted] = useState(false)
const [correctCount, setCorrectCount] = useState(0)
const [isComplete, setIsComplete] = useState(false)   // shows score screen
const completedRef = useRef(false)
```

Phases:
1. `isSubmitted === false`: Show options, tap selects, Submit enabled when `selectedIndex !== null`
2. `isSubmitted === true`: Show color highlights, show Next button
3. `isComplete === true`: Show score screen, show Done button

### Pattern 5: ActivityPanel renderContent Extension

**What:** Add two cases to the existing switch in `ActivityPanel.jsx`.

```jsx
// Source: existing ActivityPanel.jsx renderContent function
case "flashcards":
  return <FlashcardViewer moduleId={moduleId} onComplete={onComplete} />
case "quiz":
  return <QuizViewer moduleId={moduleId} onComplete={onComplete} />
```

Import the two new components at the top of ActivityPanel.jsx alongside existing imports.

### Anti-Patterns to Avoid

- **Deriving shuffle from every render:** Don't call `Math.random()` inside render. Shuffle once when the toggle fires, store result in state.
- **Resetting `completedRef` on re-render:** `completedRef` is per-mount. If ActivityPanel closes and reopens, a new component instance is created, so the ref naturally resets. This is correct behavior.
- **Putting quiz feedback in a modal:** D-15 explicitly says inline reveal. No separate dialog needed.
- **Calling `onComplete` before state updates settle:** Always call `onComplete` after all state mutations are done, or inside a callback where sequencing is clear.
- **Quiz Submit button enabled with no selection:** Guard the submit handler with `if (selectedIndex === null) return`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Crossfade animation between card faces | Custom CSS keyframe toggle | Framer Motion AnimatePresence key-swap | Already installed; handles mount/unmount lifecycle, exit animations, and interrupt states correctly |
| Shuffle algorithm | Custom reorder loop | Fisher-Yates (3 lines, in-place) | No library needed — trivial but must be done correctly to avoid bias |
| Confetti on quiz complete | Custom particle system | `fireCelebration()` from `src/utils/confetti.js` | Already wrapped and tested |
| Icon buttons | SVG strings | Lucide icons (CheckCircle2, XCircle, Shuffle, etc.) | Already in dependency list, consistent with rest of app |

**Key insight:** Every hard problem in this phase is already solved by installed dependencies. The work is wiring state and rendering — not infrastructure.

---

## Common Pitfalls

### Pitfall 1: AnimatePresence mode="wait" Missing

**What goes wrong:** Without `mode="wait"`, exit and enter animations run simultaneously. The old face and new face overlap mid-animation, creating a visual mess inside the fixed-height card container.

**Why it happens:** Default AnimatePresence mode allows concurrent animations.

**How to avoid:** Always set `mode="wait"` on the AnimatePresence wrapping the two card faces.

**Warning signs:** Two faces visible at the same time during the transition.

### Pitfall 2: isFlipped Not Reset on Card Advance

**What goes wrong:** After rating card N and advancing to card N+1, the new card shows the answer face instead of the question face because `isFlipped` was not reset.

**Why it happens:** The handler that increments `currentIndex` forgets to call `setIsFlipped(false)`.

**How to avoid:** Always pair `setCurrentIndex(nextIndex)` with `setIsFlipped(false)` in the rating handler. Verified in the `completedRef` guard code example above.

**Warning signs:** Cards appear to show answers immediately on advance.

### Pitfall 3: Submit Button Active With No Selection

**What goes wrong:** User taps Submit without selecting an option — the quiz silently marks the first option or throws an array access error.

**Why it happens:** `selectedIndex` starts as `null`; forgetting to guard the submit handler.

**How to avoid:** Disable the Submit button (`disabled={selectedIndex === null}`) and guard the handler with an early return.

**Warning signs:** Tapping Submit before selecting does nothing or causes incorrect behavior.

### Pitfall 4: onComplete Called Twice

**What goes wrong:** The activity gets toggled complete twice, potentially double-counting in `useProgress`.

**Why it happens:** The final card/question can trigger completion in multiple places (e.g., rating handler AND an effect).

**How to avoid:** Use the `completedRef` guard — exactly one code path calls `onComplete()`, and it sets `completedRef.current = true` first.

**Warning signs:** Module shows 100% complete when it shouldn't, or console errors about state updates on unmounted components.

### Pitfall 5: Empty Module Data (No Cards / No Questions)

**What goes wrong:** Rendering a FlashcardViewer or QuizViewer for a module with an empty array causes division by zero in progress indicators, or the card component renders with undefined content.

**Why it happens:** Modules 2-8 start as `[]` in the scaffold files. If content extraction is deferred, these arrays remain empty.

**How to avoid:** Add an empty-state check at the top of each component. Render a fallback message ("No flashcards yet for this module") when the array is empty, rather than attempting to render `cards[0]`.

**Warning signs:** "Card NaN of NaN" or blank card face.

### Pitfall 6: Incorrect Correct-Answer Highlight Logic

**What goes wrong:** On wrong selection, only the selected option turns red. The correct option doesn't turn green. User cannot see which answer was right.

**Why it happens:** Highlight logic only checks `index === selectedIndex` instead of also checking `index === correctIndex`.

**How to avoid:** Apply green to `index === correctIndex` unconditionally after submit. Apply red only to `index === selectedIndex && selectedIndex !== correctIndex`.

**Warning signs:** QUIZ-03 acceptance criteria fails ("correct answer not revealed on wrong selection").

---

## Code Examples

Verified patterns from existing codebase and Framer Motion 12 API:

### FlashcardViewer Skeleton

```jsx
// New file: src/components/FlashcardViewer.jsx
import { useState, useRef, useCallback } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { FLASHCARDS } from "../data/content/flashcards"

export function FlashcardViewer({ moduleId, onComplete }) {
  const source = FLASHCARDS[moduleId] || []
  const [cards, setCards] = useState(source)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [score, setScore] = useState(0)
  const [isShuffled, setIsShuffled] = useState(false)
  const completedRef = useRef(false)

  const card = cards[currentIndex]

  const handleRate = useCallback((wasCorrect) => {
    const nextScore = wasCorrect ? score + 1 : score
    if (wasCorrect) setScore(s => s + 1)
    const nextIndex = currentIndex + 1
    if (nextIndex >= cards.length) {
      if (!completedRef.current) {
        completedRef.current = true
        onComplete()
      }
    } else {
      setCurrentIndex(nextIndex)
      setIsFlipped(false)
    }
  }, [currentIndex, cards.length, score, onComplete])

  if (source.length === 0) {
    return <p className="text-center py-4" style={{ color: "var(--text-muted)" }}>No flashcards yet for this module.</p>
  }

  return (
    <div>
      {/* Header: score + progress + shuffle */}
      {/* Card: AnimatePresence key-swap between question/answer faces */}
      {/* Rating buttons: shown only when isFlipped */}
    </div>
  )
}
```

### QuizViewer Skeleton

```jsx
// New file: src/components/QuizViewer.jsx
import { useState, useRef, useCallback } from "react"
import { QUIZZES } from "../data/content/quizzes"

export function QuizViewer({ moduleId, onComplete }) {
  const questions = QUIZZES[moduleId] || []
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedIndex, setSelectedIndex] = useState(null)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const completedRef = useRef(false)

  const question = questions[currentIndex]

  const handleSubmit = useCallback(() => {
    if (selectedIndex === null) return
    if (selectedIndex === question.correctIndex) {
      setCorrectCount(c => c + 1)
    }
    setIsSubmitted(true)
  }, [selectedIndex, question])

  const handleNext = useCallback(() => {
    const nextIndex = currentIndex + 1
    if (nextIndex >= questions.length) {
      setIsComplete(true)
    } else {
      setCurrentIndex(nextIndex)
      setSelectedIndex(null)
      setIsSubmitted(false)
    }
  }, [currentIndex, questions.length])

  const handleDone = useCallback(() => {
    if (!completedRef.current) {
      completedRef.current = true
      onComplete()
    }
  }, [onComplete])

  if (questions.length === 0) {
    return <p className="text-center py-4" style={{ color: "var(--text-muted)" }}>No quiz yet for this module.</p>
  }

  if (isComplete) {
    // Score screen: show percentage, correct count, Done button
  }

  // Question screen: progress, question text, options list, Submit
}
```

### Fisher-Yates Shuffle (in-place copy)

```js
// Pure utility — no import needed, inline in FlashcardViewer
function shuffleArray(arr) {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}
```

### Option Highlight Logic (Quiz)

```jsx
// Applied as inline style per option button
function getOptionStyle(index, selectedIndex, correctIndex, isSubmitted) {
  if (!isSubmitted) {
    return index === selectedIndex
      ? { backgroundColor: "var(--bg-elevated)", border: "2px solid var(--text-primary)" }
      : { border: "1px solid var(--border)" }
  }
  // Submitted state
  if (index === correctIndex) {
    return { backgroundColor: "rgba(94, 194, 105, 0.15)", border: "2px solid #5ec269" }
  }
  if (index === selectedIndex) {
    return { backgroundColor: "rgba(224, 98, 152, 0.15)", border: "2px solid #e06298" }
  }
  return { border: "1px solid var(--border)", opacity: 0.5 }
}
```

Note: `#5ec269` (green) and `#e06298` (pink/red) are taken from the existing `fireCelebration()` colors array — consistent with the design system.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| CSS 3D perspective flip for flashcards | AnimatePresence key-swap crossfade | Framer Motion became ubiquitous (~2021) | Simpler, no Safari backface-visibility bugs |
| Separate quiz result page/route | Inline reveal, same screen | ADHD-aware design trend | Keeps user in flow, no navigation overhead |
| Persisting quiz state in localStorage | Component-local state | Explicit decision this phase | Simpler, v2 concern only |

**Deprecated/outdated:**

- CSS `transform: rotateY(180deg)` flip: Works but requires `perspective`, `backface-visibility`, and `transform-style: preserve-3d` — has known Safari mobile issues. Not used in this project.

---

## Open Questions

1. **MCP extraction availability in executor context**
   - What we know: Phase 2 required placeholder fallback (D-05 pattern) because MCP was unavailable in some executor contexts
   - What's unclear: Whether notebooklm-mcp will be available when executor runs Phase 3 content extraction tasks
   - Recommendation: Plan content extraction as a separate plan with explicit fallback to placeholder content following the Phase 2 D-05 pattern. Placeholder data must still have the correct `{ question, answer }` and `{ question, options, correctIndex }` shapes.

2. **Existing content.flashcards.test.js update scope**
   - What we know: The test currently asserts `modules 2-8 are empty arrays` (verified in source). This test will fail once content is populated.
   - What's unclear: Whether to update the test to verify all 8 modules have content, or whether to leave the structural test as-is
   - Recommendation: Update `content.flashcards.test.js` and `content.quizzes.test.js` assertions when populating modules 2-8 — change the "modules 2-8 are empty" assertion to "all modules have 2+ items with correct shape".

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.2 + @testing-library/react 16.3.2 |
| Config file | `vite.config.js` (test block: environment jsdom, globals true) |
| Setup file | `src/__tests__/setup.js` (imports @testing-library/jest-dom) |
| Quick run command | `npm test -- --reporter=verbose src/__tests__/FlashcardViewer.test.jsx` |
| Full suite command | `npm test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FLASH-01 | Card flip: tap card shows answer face | unit | `npm test -- src/__tests__/FlashcardViewer.test.jsx` | ❌ Wave 0 |
| FLASH-02 | Rating buttons appear after flip | unit | `npm test -- src/__tests__/FlashcardViewer.test.jsx` | ❌ Wave 0 |
| FLASH-03 | Running score increments on correct rating | unit | `npm test -- src/__tests__/FlashcardViewer.test.jsx` | ❌ Wave 0 |
| FLASH-04 | Progress indicator shows "Card X of Y" | unit | `npm test -- src/__tests__/FlashcardViewer.test.jsx` | ❌ Wave 0 |
| FLASH-05 | Shuffle toggle randomizes card order | unit | `npm test -- src/__tests__/FlashcardViewer.test.jsx` | ❌ Wave 0 |
| FLASH-06 | onComplete fires after last card rated | unit | `npm test -- src/__tests__/FlashcardViewer.test.jsx` | ❌ Wave 0 |
| QUIZ-01 | Options render; tap selects an option | unit | `npm test -- src/__tests__/QuizViewer.test.jsx` | ❌ Wave 0 |
| QUIZ-02 | Submit shows correct/incorrect coloring | unit | `npm test -- src/__tests__/QuizViewer.test.jsx` | ❌ Wave 0 |
| QUIZ-03 | Correct answer shown green on wrong selection | unit | `npm test -- src/__tests__/QuizViewer.test.jsx` | ❌ Wave 0 |
| QUIZ-04 | Progress indicator shows "Q X of Y" | unit | `npm test -- src/__tests__/QuizViewer.test.jsx` | ❌ Wave 0 |
| QUIZ-05 | Final score screen shows percentage and count | unit | `npm test -- src/__tests__/QuizViewer.test.jsx` | ❌ Wave 0 |
| QUIZ-06 | onComplete fires when Done tapped on score screen | unit | `npm test -- src/__tests__/QuizViewer.test.jsx` | ❌ Wave 0 |
| D-22 | ActivityPanel routes flashcards → FlashcardViewer | unit | `npm test -- src/__tests__/ActivityPanel.test.jsx` | ✅ (extend) |
| D-22 | ActivityPanel routes quiz → QuizViewer | unit | `npm test -- src/__tests__/ActivityPanel.test.jsx` | ✅ (extend) |
| CONT-03/04 | flashcards.js and quizzes.js have correct shapes for all 8 modules | unit | `npm test -- src/__tests__/content.flashcards.test.js src/__tests__/content.quizzes.test.js` | ✅ (update assertions) |
| PWA-02 | JS data files included in Vite bundle (auto-precached) | manual | `npm run build && check dist/assets/*.js` | manual-only — no test needed; Vite bundles all imported JS by default |

### Sampling Rate

- **Per task commit:** `npm test -- src/__tests__/FlashcardViewer.test.jsx` or `src/__tests__/QuizViewer.test.jsx` (whichever is being worked on)
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `src/__tests__/FlashcardViewer.test.jsx` — covers FLASH-01 through FLASH-06
- [ ] `src/__tests__/QuizViewer.test.jsx` — covers QUIZ-01 through QUIZ-06
- [ ] Update `src/__tests__/ActivityPanel.test.jsx` — add `case "flashcards"` and `case "quiz"` routing tests (and add vi.mock stubs for new components)
- [ ] Update `src/__tests__/content.flashcards.test.js` — update "modules 2-8 are empty" assertion when content populated
- [ ] Update `src/__tests__/content.quizzes.test.js` — same as above

---

## Sources

### Primary (HIGH confidence)

- Existing codebase — `src/components/DeckViewer.jsx`, `src/components/AudioPlayer.jsx`, `src/components/CelebrationOverlay.jsx` — patterns extracted directly from source
- `src/data/content/flashcards.js`, `src/data/content/quizzes.js` — data shapes verified from source
- `src/components/ActivityPanel.jsx` — renderContent switch structure verified from source
- `package.json` — exact installed versions of framer-motion (12.38.0), React (19.2.4), lucide-react (0.577.0) verified
- `vite.config.js` — Vitest configuration and Workbox globPatterns verified from source
- `.planning/phases/03-flashcards-and-quiz/03-CONTEXT.md` — all implementation decisions

### Secondary (MEDIUM confidence)

- Framer Motion 12 AnimatePresence `mode="wait"` behavior — consistent with observed usage in CelebrationOverlay and known Framer Motion API

### Tertiary (LOW confidence)

- None — all claims in this document are supported by direct source inspection or established library APIs available in the installed versions.

---

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH — all dependencies verified from package.json and installed node_modules
- Architecture: HIGH — patterns extracted directly from existing working components in the codebase
- Pitfalls: HIGH — derived from code inspection and established React + Framer Motion behavior
- Test coverage plan: HIGH — test infrastructure verified from vite.config.js and existing test files

**Research date:** 2026-03-29
**Valid until:** 2026-04-28 (stable stack; 30-day window is conservative)
