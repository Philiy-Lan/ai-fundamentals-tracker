# Feature Research

**Domain:** Embedded interactive learning — audio, image decks, flashcards, quizzes, AI assessment
**Researched:** 2026-03-28
**Confidence:** MEDIUM — knowledge-based from well-documented platforms (Anki, Quizlet, Duolingo, Khan Academy, Spotify, Khanmigo). Web access unavailable during research session; flag for spot-check before implementation.

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing = product feels broken or incomplete.

#### Audio Player

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Play / pause toggle | Zero-friction start/stop — every audio UI has this | LOW | HTML5 `<audio>` provides natively |
| Scrub bar / seek | Users skip intros, rewind missed points — standard since iPod era | LOW | HTML5 range input + `currentTime` |
| Current time + total duration display | "How long is this?" is the first question | LOW | Format MM:SS from `duration` / `currentTime` |
| Playback speed control (0.5×, 1×, 1.25×, 1.5×, 2×) | Podcast listeners set speed as default habit; missing = friction | MEDIUM | HTML5 `playbackRate` + UI toggle |
| Persist playback position across sessions | Audio stops mid-lesson → user closes tab → position lost = rage | MEDIUM | Save `currentTime` to localStorage on `timeupdate`, restore on load |
| Mark as complete / completion detection | Core to a tracker app — the entire value prop requires knowing "done" | LOW | Trigger at ~90–95% of duration to catch early stop |
| Offline playback | PROJECT.md constraint: offline-first PWA | LOW | Bundled file — works automatically if service worker caches it |

#### Image Deck / Slide Viewer

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Previous / next navigation | Every carousel since 2005 has this | LOW | Index state + array of image paths |
| Slide counter (e.g., "3 / 12") | Users need orientation — "where am I in this deck?" | LOW | `currentIndex + 1` / `total` |
| Mark as complete on last slide | Tracker integration — must fire when deck is consumed | LOW | Trigger on reaching final slide |
| Full-size / zoom on tap or click | Images often contain text — small viewport = unreadable | MEDIUM | CSS transform scale or modal lightbox |
| Keyboard arrow navigation | Desktop users reach for arrow keys instinctively | LOW | `keydown` listener, scope to focused component |

#### Flashcards

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Flip to reveal answer | The defining interaction of a flashcard — non-negotiable | LOW | CSS 3D card flip animation |
| Correct / incorrect self-rating | Users self-grade after seeing answer (Anki model) — how score accumulates | LOW | Two-button UI post-flip |
| Session score display (X/Y correct) | Immediate feedback loop — essential for motivation | LOW | Running tally in component state |
| Card progress indicator | "5 of 20 cards" — same orientation need as slide counter | LOW | Index state |
| Shuffle option | Prevents pattern memorization — Quizlet users expect this | MEDIUM | Fisher-Yates shuffle on deck array |
| Mark deck as complete | Tracker integration | LOW | Trigger at end of final card |
| Review missed cards | Standard in every flashcard tool — after session, see what you missed | MEDIUM | Filter cards where result === 'incorrect', replay subset |

#### Multiple Choice Quiz

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Select answer, submit, see result | The basic interaction loop — no quiz exists without this | LOW | Click handler, state, conditional styling |
| Correct answer revealed on wrong choice | Immediate corrective feedback is core to learning — Kahoot, Google Forms, Khan Academy all do this | LOW | Show correct option highlighted after wrong selection |
| Question progress indicator (Q 3 of 10) | Users abandon without orientation | LOW | Index state |
| Final score screen (7/10 — 70%) | Closing the loop — what did I get? | LOW | Score tally + summary screen |
| Prevent changing answer after submission | Locks in commitment, prevents accidental re-selection | LOW | Disable options after submit |
| Mark as complete on quiz finish | Tracker integration | LOW | Trigger on final score screen render |

#### AI-Powered Teach-Back Assessment

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Voice input (microphone) | Teach-Back is inherently verbal — typing defeats the purpose | HIGH | Web Speech API (SpeechRecognition) — browser support is Chrome/Edge/Safari; Firefox excluded |
| AI response after explanation | User explains a concept → AI evaluates and responds — the entire value prop | HIGH | Claude API call with transcript + system prompt defining evaluation criteria |
| Graceful offline fallback | PROJECT.md requirement — must not silently fail | LOW | Check `navigator.onLine`, show "needs connection" message before opening session |
| Clear prompt stating what to explain | Without a focused prompt, the exercise is vague and anxiety-inducing | LOW | Module-specific question passed as prop |
| Transcript display | Users want to see what the AI heard — builds trust in voice recognition accuracy | MEDIUM | Display SpeechRecognition result before/during API call |

---

### Differentiators (Competitive Advantage)

Features that set this product apart. Not required, but meaningful for an ADHD-aware learning tool.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Flashcard session score → module progress ring | Score feeds the existing animated ring — makes self-grading feel consequential | MEDIUM | Pass final score back to parent state; ring fill proportional to correct % |
| Quiz attempt history (show previous score) | "Last time you got 6/10 — let's beat it" — replayability and growth mindset | MEDIUM | Store per-module quiz results in localStorage with timestamp |
| Audio player integrated with activity completion | Completion ring fills as audio finishes — visual progress is motivating for ADHD learners | MEDIUM | `timeupdate` events drive a progress arc overlaid on player |
| Teach-Back follow-up questions | AI asks a clarifying question if explanation is shallow — goes deeper than pass/fail | HIGH | Multi-turn conversation state; requires more careful prompt engineering |
| Celebrate completion with existing confetti | Reuse existing celebration system when any activity completes — consistency + dopamine | LOW | Call existing `triggerCelebration()` on activity completion events |
| Flashcard difficulty hint before flip | "This one trips most people" — primes attention and reduces ADHD distraction | MEDIUM | Requires difficulty metadata per card from NotebookLM extraction |
| Keyboard shortcuts for flashcard rating | Power-user flow: Space to flip, 1 = correct, 2 = incorrect — no mouse required | LOW | `keydown` listener, document on component mount |
| Quiz wrong-answer explanation | After quiz ends, show why each wrong answer was wrong — not just the right answer | MEDIUM | Requires explanation field in quiz JSON data from NotebookLM |

---

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Full spaced repetition algorithm (SM-2 / FSRS) | Anki users expect it; sounds scientific | Requires persistent card history, scheduling logic, "due today" queue — massive scope creep for a fixed 8-module curriculum that ends in 6 weeks. The content doesn't change, so scheduling adds complexity without proportional value. | Simple "review missed cards" replay is enough for a bounded curriculum |
| Audio transcript / captions | Accessibility expectation | NotebookLM Audio Overviews don't provide transcripts via API. Generating them would require Whisper or a transcription service — adds cost, latency, and scope. | Note in UI: "Transcript not available for this content" |
| Learner-created flashcards | Power users want to add their own | Requires content authoring, storage schema changes, sync decisions — completely different product mode. Out of scope per PROJECT.md. | Notes/insights field (already exists) serves this need |
| Video embeds | "While you're at it..." | Out of scope per PROJECT.md. Codec handling, progressive download, offline caching of large video files — entirely different problem. | Stick to audio + images |
| Real-time quiz leaderboard | Gamification pattern from Kahoot | This is a personal tool. Leaderboards require a backend, multi-user model, and real-time sync — none of which exist. | Streak counter + personal score history achieves similar motivation |
| Quiz timer / countdown pressure | Some learners use timed quizzes | ADHD learners specifically are harmed by time pressure — directly counter to the app's design philosophy. | Let users self-pace; score is the feedback mechanism |
| Teach-Back recording/playback | "Let me hear myself back" | Storing audio raises privacy concerns, adds storage complexity, and the primary value is AI feedback — not listening back. | Display transcript instead |
| Adaptive quiz question ordering | "Show harder questions first" | Requires difficulty metadata that NotebookLM doesn't expose, plus ongoing calibration. High complexity, low payoff for a fixed curriculum. | Shuffle + review missed cards achieves 80% of the benefit |

---

## Feature Dependencies

```
[Activity Completion Tracking]
    └──required by──> [Module Progress Ring]
                          └──required by──> [Phase Progress / Dashboard]

[Audio Player]
    └──fires──> [Activity Completion Tracking]

[Image Deck]
    └──fires──> [Activity Completion Tracking]

[Flashcard Component]
    └──fires──> [Activity Completion Tracking]
    └──produces──> [Session Score]
                       └──optional──> [Module Progress Ring score input]

[Quiz Component]
    └──fires──> [Activity Completion Tracking]
    └──produces──> [Session Score]
                       └──stored in──> [localStorage quiz history]

[Teach-Back Voice Input (Web Speech API)]
    └──required by──> [Teach-Back Transcript]
                          └──required by──> [Claude API Evaluation]
                                                └──produces──> [AI Feedback Display]

[navigator.onLine check]
    └──gates──> [Teach-Back session open]

[Claude API Proxy]
    └──required by──> [Teach-Back Claude API Evaluation]
    (static GitHub Pages cannot call Claude API directly — needs proxy or edge function)
```

### Dependency Notes

- **Activity Completion fires tracker update:** Every component (audio, deck, flashcard, quiz) must emit an identical completion event or call a shared handler. Design one `markActivityComplete(moduleId, activityType)` function and wire all components to it.
- **Flashcard score is optional input to progress ring:** The ring already tracks binary complete/incomplete. Score data is additive — the ring can show completion without it. Implement score display in the component; hook to ring separately as an enhancement.
- **Teach-Back requires a Claude API proxy:** GitHub Pages is static. Calling Claude API from the client exposes the API key. A lightweight proxy (Cloudflare Worker, Vercel Edge Function, or Netlify Function) is required. This is a build dependency — Teach-Back cannot ship without it.
- **Web Speech API gates voice input:** If browser doesn't support `SpeechRecognition` (Firefox, some mobile), Teach-Back voice input fails. A text-input fallback prevents the whole feature from breaking.

---

## MVP Definition

### Launch With (v1)

Minimum viable product — everything needed for the app to deliver its stated value ("all learning completable inside the app").

- [ ] Audio player with play/pause, scrub, speed control, duration display, completion detection — core content type
- [ ] Image deck with prev/next, slide counter, completion on last slide — replaces Mind Map activities
- [ ] Flashcard flip with correct/incorrect rating, session score, completion on last card — primary study mechanic
- [ ] Multiple choice quiz with answer submission, correct reveal, final score, completion trigger — assessment mechanic
- [ ] `markActivityComplete(moduleId, activityType)` shared completion handler wired to all four components — tracker integration
- [ ] Teach-Back with voice input, Claude API call, AI feedback display, offline fallback — the signature differentiator
- [ ] Claude API proxy (Cloudflare Worker or equivalent) — required for Teach-Back to function on GitHub Pages
- [ ] Graceful degradation for voice: text input fallback if `SpeechRecognition` is unavailable

### Add After Validation (v1.x)

Features to add once core is confirmed working and content is loaded.

- [ ] Persist audio playback position (localStorage) — add after base player works; prevents data loss on refresh
- [ ] Review missed flashcards (replay incorrect subset) — add after session completion UX is confirmed
- [ ] Quiz attempt history + "beat your score" prompt — add after quiz completion UX is confirmed
- [ ] Celebration trigger on activity complete — reuse existing system; add after completion handler is wired

### Future Consideration (v2+)

Defer until core milestone is stable.

- [ ] Teach-Back follow-up questions (multi-turn) — high complexity, validate single-turn first
- [ ] Flashcard keyboard shortcuts — polish, not core
- [ ] Audio player progress arc overlaid on ring — visual enhancement, not functional

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Audio player (play/pause/scrub/speed/complete) | HIGH | LOW | P1 |
| Image deck (prev/next/counter/complete) | HIGH | LOW | P1 |
| Flashcard (flip/score/complete) | HIGH | LOW | P1 |
| Quiz (submit/reveal/score/complete) | HIGH | LOW | P1 |
| Shared completion handler | HIGH | LOW | P1 |
| Claude API proxy for Teach-Back | HIGH | MEDIUM | P1 |
| Teach-Back voice + AI evaluation | HIGH | HIGH | P1 |
| Offline fallback for Teach-Back | HIGH | LOW | P1 |
| Voice → text fallback for unsupported browsers | MEDIUM | LOW | P1 |
| Audio position persistence | MEDIUM | LOW | P2 |
| Review missed flashcards | MEDIUM | MEDIUM | P2 |
| Quiz attempt history | MEDIUM | LOW | P2 |
| Celebration on activity complete | MEDIUM | LOW | P2 |
| Teach-Back multi-turn follow-up | HIGH | HIGH | P3 |
| Flashcard keyboard shortcuts | LOW | LOW | P3 |
| Audio progress arc on ring | LOW | MEDIUM | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

---

## Competitor Feature Analysis

Reference apps analyzed from training knowledge (no live access during research):

| Feature | Anki | Quizlet | Duolingo | Khan Academy | Our Approach |
|---------|------|---------|----------|--------------|--------------|
| Flashcard flip | Card flip animation | Card flip animation | N/A | N/A | CSS 3D flip |
| Self-rating | Again / Hard / Good / Easy (4 levels) | Know / Don't Know (2 levels) | N/A | N/A | Correct / Incorrect (2 levels — simpler, appropriate for fixed curriculum) |
| Spaced repetition | Full SM-2/FSRS algorithm | Basic (Quizlet Learn mode) | Lesson-based, not SRS | N/A | None — see anti-features rationale |
| Quiz feedback | N/A | Immediate correct/wrong | Immediate + hearts | Immediate + explanation | Immediate correct reveal + final score |
| Audio in learning | Pronunciation clips | Pronunciation clips | Core to lessons | Video-embedded | Podcast-style overview (different use case) |
| AI assessment | N/A | N/A | Duolingo Max (2024) explain my answer | Khanmigo Socratic tutor | Teach-Back: explain a concept, get evaluated |
| Offline | Full offline (desktop) | Limited (mobile) | Limited | No | Full offline except Teach-Back (by design) |
| Progress tracking | Deck-level stats | Limited | XP + streaks | Exercise completion | Module rings + streak (existing) |

---

## Sources

- Knowledge-based analysis drawn from: Anki (ankiweb.net), Quizlet, Duolingo, Khan Academy, Spotify/podcast app conventions, Kahoot, Khanmigo (Khan Academy AI tutor), Duolingo Max AI features
- HTML5 audio/video API behavior: MDN Web Docs (training knowledge, verify at developer.mozilla.org)
- Web Speech API browser support: Chrome/Edge/Safari confirmed; Firefox excluded (training knowledge — verify current status)
- PROJECT.md constraints applied throughout: offline-first, static hosting, existing React/Vite/Tailwind stack, ADHD-aware UX
- **Confidence note:** All findings are MEDIUM confidence. WebSearch and WebFetch were unavailable during this session. Verify browser support tables for Web Speech API before implementing voice input. Verify Claude API proxy options against current Cloudflare Workers / Vercel Edge pricing and limits.

---

*Feature research for: AI Fundamentals Tracker — embedded interactive learning (audio, deck, flashcard, quiz, AI teach-back)*
*Researched: 2026-03-28*
