# Project Research Summary

**Project:** AI Fundamentals Tracker — Embedded Interactive Learning Milestone
**Domain:** React PWA with embedded media, interactive assessments, and AI conversation
**Researched:** 2026-03-28
**Confidence:** MEDIUM (architecture HIGH; stack/features/pitfalls MEDIUM due to web access unavailability during research)

---

## Executive Summary

This milestone transforms the existing AI Fundamentals Tracker from a checkbox-driven progress app into a fully embedded learning experience. Each of the 8 curriculum modules gains five interactive activity types: an audio player (NotebookLM podcast overview), an image deck carousel (slide-based mind map), a flashcard component, a multiple-choice quiz, and a voice-driven AI Teach-Back session powered by Claude. All activities wire into the existing progress model via a single shared completion callback. The app is a React 19 + Vite 8 + Tailwind CSS 4 + Framer Motion + vite-plugin-pwa stack — no framework change is needed. Three new npm packages cover the net-new UI needs: `react-h5-audio-player`, `embla-carousel-react`, and `@anthropic-ai/sdk`. Everything else is covered by the existing stack or browser built-ins.

The recommended implementation approach is an `ActivityPanel` component that expands inline within the existing `ModuleDetail` page, rendering the appropriate content component based on activity type. Content components are stateless except for session-local UI state; they emit a single `onComplete()` callback when done. Progress tracking stays in the existing `useProgress` hook (binary complete/incomplete per activity, no score data). A separate `useContentScore` hook holds transient quiz/flashcard scores that reset on unmount and are never synced to Supabase. Audio files live in `public/audio/` and are cached on first play via Workbox runtime caching — not precached at install, which would break mobile and exhaust iOS Safari's storage quota.

The single hardest problem is Teach-Back: the app is hosted on GitHub Pages (static), so the Claude API key cannot be in the client bundle. The pragmatic solution for a personal tool is a user-supplied API key stored in localStorage with an explicit warning, or a Cloudflare Worker proxy (free tier). This decision must be locked in before any Teach-Back code is written. The second hardest problem is iOS audio: Safari enforces strict user-gesture requirements, and any `play()` call that crosses an async boundary (useEffect, animation callback) will silently fail. Both problems have clear, well-documented solutions — they just require deliberate choices up front rather than fixes after the fact.

---

## Key Findings

### Recommended Stack

The existing stack covers the majority of the work. Framer Motion handles flashcard flip animation. Pure React state is sufficient for quiz logic. The three new packages are narrow and justified: `react-h5-audio-player` saves 2–3 hours of building accessible audio controls from scratch; `embla-carousel-react` is the lightest-weight carousel option (~7kB gzip, zero dependencies, headless); `@anthropic-ai/sdk` is the official client and must be used through a proxy, not called directly from client code. Web Speech API (browser built-in) handles voice input and TTS for Teach-Back — no additional package needed, though `react-speech-recognition` is an acceptable wrapper if cross-browser normalization proves necessary.

**Core technologies (new additions):**
- `react-h5-audio-player ^3.9.x`: accessible HTML5 audio player with custom styling hooks — saves build time vs. raw `<audio>` element
- `embla-carousel-react ^8.x`: headless, zero-dependency carousel for deck slides — smallest viable option post-2023
- `@anthropic-ai/sdk ^0.30.x`: official Claude client for Teach-Back — must route through a server-side proxy to protect the API key
- `Web Speech API` (browser built-in): `SpeechRecognition` for voice input, `SpeechSynthesis` for TTS — no install, offline-capable recognition
- `Workbox runtimeCaching` (already bundled via vite-plugin-pwa): `CacheFirst` strategy for audio — lazy-caches on first play, not at install

**What NOT to add:** `react-slick` (unmaintained), `react-spring` (fights Framer Motion), `howler.js` (over-engineered for linear audio), `react-quiz-component` (wrong data shape), `VITE_ANTHROPIC_KEY` in `.env` (exposes key in bundle).

### Expected Features

All four offline-capable activity types (audio, deck, flashcards, quiz) are P1 table stakes — their core interactions are well-established patterns with low implementation cost and high user expectation. Teach-Back is also P1 despite high complexity because it is the app's signature differentiator. The shared `markActivityComplete(moduleId, activityType)` handler is P1 infrastructure that every component depends on.

**Must have (table stakes — P1):**
- Audio: play/pause, scrub bar, playback speed control, duration display, completion detection at ~90% — users expect all of these; missing any feels broken
- Image deck: prev/next navigation, slide counter, completion on last slide — every carousel since 2005 has this
- Flashcards: flip to reveal, correct/incorrect self-rating, session score display, card progress indicator, completion on last card
- Quiz: answer selection, submit, correct reveal on wrong choice, question progress indicator, final score screen, completion trigger
- Teach-Back: voice input via Web Speech API, Claude AI evaluation, AI feedback display, graceful offline fallback, text input fallback for unsupported browsers
- Claude API proxy or user-supplied key: required for Teach-Back to function on GitHub Pages

**Should have (differentiators — P2, add after v1 validation):**
- Persist audio playback position across sessions (localStorage, debounced)
- Review missed flashcards (replay incorrect subset)
- Quiz attempt history with "beat your score" prompt
- Celebration trigger on activity complete (reuse existing confetti system)

**Defer (v2+):**
- Teach-Back multi-turn follow-up questions — validate single-turn first
- Full spaced repetition algorithm — scope creep for a fixed 8-module, 6-week curriculum
- Audio transcript/captions — NotebookLM does not expose transcripts via API
- Learner-created flashcards — a different product mode entirely

### Architecture Approach

The architecture adds a new `ActivityPanel` component as the layer between `ModuleDetail` and all content components. `ModuleDetail` remains the route shell; it passes an `activity` object and `moduleId` to `ActivityPanel`, which resolves the correct component and owns the expand/collapse animation. Content components (AudioPlayer, DeckCarousel, FlashcardDeck, QuizEngine, TeachBack) are each unaware of the progress system — they receive content source props and a single `onComplete` callback. A new `useContentScore` hook holds transient session scores in component-local state, completely separate from `useProgress`. The data model requires one migration: renaming `mindmap` to `deck` in the `completed` state shape, handled by a one-time forward migration in `loadProgress()`. Content assets use `public/audio/` for audio (URL references, not Vite imports) and `src/data/content/[moduleId]/` for JSON and images (Vite-processed for fingerprinting and precaching).

**Major components:**
1. `ActivityPanel` — expand-in-place container; resolves activity type to component; owns open/close state; relays `onComplete` to `ModuleDetail.handleToggle`
2. `AudioPlayer` — HTML5 audio with accessible controls; fires completion at ~90% duration; `play()` only from synchronous click handlers
3. `DeckCarousel` — image slide viewer; `embla-carousel-react`; fires completion on last slide
4. `FlashcardDeck` — Q/A flip cards via Framer Motion `rotateY`; `useContentScore` for session tally; fires completion on last card
5. `QuizEngine` — multiple-choice from JSON; grades on submit; shows result screen; fires completion on acknowledgment
6. `TeachBack` — voice/text input; proxy or user-supplied key for Claude API; offline detection before enabling; fires completion on user confirmation
7. `useContentScore` — session-local hook for scores; never lifted to App or persisted to Supabase
8. Claude API proxy (external) — Cloudflare Worker or user-supplied key model; holds API key server-side

**Key patterns:**
- Expand-in-place (no sub-routes per activity — avoids 40+ new route definitions across 8 modules)
- Completion callback propagation (content components signal "done" without knowing about progress system)
- `public/audio/` + Workbox `runtimeCaching` for audio (not Vite asset pipeline — prevents precache bloat)
- Session-local score state separate from durable progress state

### Critical Pitfalls

1. **Audio in Vite asset pipeline** — Importing `.mp3` files via ES module imports causes Vite to bundle them into `dist/assets/` with hashed names. With 8 NotebookLM audio files at 15–40MB each, the precache manifest can exceed 200MB, breaking GitHub Pages deployment and PWA install. Fix: all audio in `public/audio/` referenced by string URL; omit `.mp3` from `workbox.globPatterns`; add a `runtimeCaching` rule with `CacheFirst` for `/audio/**`.

2. **iOS Safari audio autoplay wall** — `play()` called inside a `useEffect`, animation callback, or after any `await` will be silently blocked by iOS Safari. Also: changing `audio.src` dynamically requires calling `audio.load()` before `audio.play()` or playback silently fails. Fix: call `play()` only in synchronous click handlers; always call `load()` after a src change; handle the returned Promise with `.catch()`.

3. **Claude API key in client bundle** — `VITE_ANTHROPIC_API_KEY` in `.env` is baked into the built JS by Vite at build time. Anyone who views source can read it. Fix: choose user-supplied key (stored in localStorage with explicit risk warning) or Cloudflare Worker proxy. This decision must precede any Teach-Back code.

4. **State management explosion in `useProgress`** — Adding quiz scores, flashcard state, and audio position to the existing `useProgress` hook causes `timeupdate` events (4x/sec during playback) to trigger Supabase syncs, inflates the localStorage blob, and breaks the existing merge logic across devices. Fix: all session state lives in component-local `useState` or the new `useContentScore` hook; only the binary "completed" flag enters `useProgress`.

5. **Service worker cache invalidation on content updates** — When audio or JSON content changes after a NotebookLM re-export, the service worker version bumps, but returning mobile users who never close all tabs run stale content indefinitely. Fix: `skipWaiting: true` in Workbox config; add an "App updated — reload" toast with `onNeedRefresh` callback; disable SW in development with `devOptions: { enabled: false }`.

---

## Implications for Roadmap

Based on research, the build order is driven by hard dependencies: the data model migration must come first (everything else breaks without it), static content scaffolding must precede any content component, and the Claude API proxy decision must be locked before Teach-Back. Within the content components, audio and deck are the safest starting points (lowest complexity, no external dependencies), followed by flashcards and quiz (self-contained state), then Teach-Back (external dependency, highest risk).

### Phase 1: Foundation and Data Model

**Rationale:** The `mindmap → deck` rename in `storage.js`, `useProgress.js`, and `modules.js` is a blocking dependency for every subsequent phase. The `ActivityPanel` container and content folder structure are the scaffolding everything else mounts onto. No content component can be built or tested until this is in place.
**Delivers:** Data migration, `ActivityPanel` expand/collapse wired into `ModuleDetail`, `src/data/content/` folder structure for one module, Workbox `runtimeCaching` config for audio.
**Addresses:** All five activity types in the feature list (unblocks them all).
**Avoids:** State management explosion (establish `useContentScore` vs. `useProgress` boundary before any content state is added); audio pipeline pitfall (configure Workbox correctly before any audio is added).
**Research flag:** Standard patterns — no additional research needed. Direct codebase analysis was done; migration and Workbox config patterns are well-established.

### Phase 2: Audio Player and Deck Carousel

**Rationale:** Simplest two content components. Audio uses native HTML5 with a thin React wrapper (`react-h5-audio-player`). Deck is a basic image array with Embla Carousel. Both fire `onComplete` when done. Building these two together validates the `ActivityPanel` → completion → `useProgress` wiring before adding stateful components.
**Delivers:** Functional audio player with play/pause, scrub, speed control, completion detection; image deck with prev/next, slide counter, completion on last slide; both wired to the shared completion handler.
**Uses:** `react-h5-audio-player`, `embla-carousel-react`, Workbox `runtimeCaching` for audio.
**Implements:** `AudioPlayer`, `DeckCarousel` components; completion callback propagation pattern.
**Avoids:** iOS audio pitfall (physical device test is a phase exit criterion); audio precache pitfall (Workbox config was set in Phase 1).
**Research flag:** Standard patterns. iOS audio behavior is well-documented; Embla Carousel has thorough docs.

### Phase 3: Flashcards and Quiz

**Rationale:** Both components are self-contained interactive state machines with no external dependencies. Flashcards use Framer Motion (already installed). Quiz is pure React state from JSON. Building them together establishes the `useContentScore` pattern and validates the score → completion flow before tackling the external dependency in Phase 4.
**Delivers:** Flashcard deck with flip animation, correct/incorrect rating, session score display, completion on last card; quiz with answer submission, correct reveal, final score screen, completion trigger; `useContentScore` hook serving both.
**Uses:** Framer Motion `rotateY` + `AnimatePresence` (no new library), `useContentScore` hook, flashcards.json and quiz.json per module.
**Implements:** `FlashcardDeck`, `QuizEngine`, `useContentScore`.
**Avoids:** State management explosion (session scores stay in `useContentScore`, not `useProgress`); quiz re-render-parent pitfall (quiz state scoped to component).
**Research flag:** Standard patterns. Flashcard flip with Framer Motion and quiz state machines are well-documented.

### Phase 4: Teach-Back (Claude AI Integration)

**Rationale:** Highest-risk phase. Requires an external API key strategy decision, a proxy or user-supplied key implementation, Web Speech API feature detection with text fallback, and offline degradation UX. Building this last means the entire learning content flow (Phases 1–3) works and is tested before introducing the most complex, failure-prone component. The proxy/key decision must be the first task in this phase.
**Delivers:** Teach-Back component with voice input (Web Speech API), text fallback, Claude API evaluation, streaming response display, offline detection and fallback card, completion on user confirmation.
**Uses:** Web Speech API (browser built-in), `@anthropic-ai/sdk`, `teachback.js` utility wrapping proxy fetch.
**Implements:** `TeachBack` component, `teachback.js` util, Claude API proxy (Cloudflare Worker) or user-supplied key UI in Settings.
**Avoids:** API key exposure pitfall (proxy or user-supplied key decided before first line of Teach-Back code); offline UX pitfall (offline card designed before component shell); Web Speech API compatibility pitfall (feature detection and text fallback built in from the start).
**Research flag:** NEEDS DEEPER RESEARCH. Cloudflare Worker setup for streaming SSE responses, CORS configuration, and rate limiting are non-trivial. Verify current Cloudflare Workers pricing and streaming support. If user-supplied key is chosen instead, the Settings UI and localStorage key storage pattern need design.

### Phase 5: Polish and PWA Audit

**Rationale:** After all content components are functional, address the P2 features that enhance the experience but are not blocking, and run the full PWA audit to confirm offline guarantees hold with real content assets in place.
**Delivers:** Audio playback position persistence (debounced localStorage); review missed flashcards; quiz attempt history; celebration trigger on activity complete; Lighthouse PWA audit passing; iOS Safari offline audio confirmed; service worker update notification tested.
**Addresses:** P2 features from FEATURES.md; "Looks Done But Isn't" checklist from PITFALLS.md.
**Avoids:** Service worker cache invalidation pitfall (update flow tested in this phase); PWA install size pitfall (Lighthouse audit flags any audio that slipped into precache).
**Research flag:** Standard patterns. Workbox, Lighthouse PWA audit, and localStorage debouncing are all well-documented.

### Phase Ordering Rationale

- **Phase 1 must come first** because the data model rename (`mindmap → deck`) breaks existing tests and localStorage if deployed after content components are live. The Workbox audio caching config must also be in place before any audio file is added to the project.
- **Phase 4 (Teach-Back) must come last among content components** because it is the only one with an external hard dependency (Claude API proxy). Phases 2 and 3 can be built, tested, and shipped independently of Phase 4's architecture decision.
- **Phases 2 and 3 could be swapped** — flashcards and quiz have no dependency on audio/deck. The proposed order (audio/deck first) is recommended because they validate the `ActivityPanel` wiring with simpler components before adding stateful score tracking.
- **Phase 5 cannot precede Phases 2–4** — the PWA audit with real content is only meaningful once all content components and their assets are present.

### Research Flags

Phases needing deeper research during planning:
- **Phase 4 (Teach-Back):** Cloudflare Worker configuration for streaming SSE proxying, CORS headers, and rate limiting. Verify current Workers free tier limits (100k requests/day as of training data — confirm current pricing). If user-supplied key model is chosen, design the Settings UX and security warning copy. Also verify current Web Speech API support table — Firefox exclusion may have changed since August 2025 training cutoff.

Phases with standard patterns (can skip `research-phase`):
- **Phase 1:** Vite config and Workbox `runtimeCaching` patterns are stable and well-documented. Data migration pattern mirrors existing `loadProgress()` code already in the repo.
- **Phase 2:** `react-h5-audio-player` and `embla-carousel-react` are well-documented with React 19 compatibility. iOS audio restrictions are stable, well-documented behavior.
- **Phase 3:** Framer Motion `rotateY` flashcard flip and React state machine quiz are standard patterns with abundant examples.
- **Phase 5:** Lighthouse PWA audit and Workbox service worker update flow are stable, well-documented.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | MEDIUM | Version ranges from training data (cutoff August 2025); major versions are stable anchors but patch versions need `npm info` verification before pinning. Architectural patterns (proxy requirement, audio in `public/`) are HIGH confidence. |
| Features | MEDIUM | Feature expectations derived from knowledge of Anki, Quizlet, Duolingo, Khan Academy — no live access to current products. Core table stakes are stable; verify Web Speech API Firefox support status before implementation. |
| Architecture | HIGH | Based on direct codebase analysis of the live repo (`/Users/philiy/Developer/ai-tracker/src/`) plus well-established Vite/Workbox patterns. Component boundaries and data flow are specific to this codebase and verified. |
| Pitfalls | HIGH | iOS audio restrictions, Workbox precaching, API key security, and Web Speech API gaps are stable, well-documented platform behaviors. vite-plugin-pwa version-specific behavior is MEDIUM. |

**Overall confidence:** MEDIUM-HIGH

The architecture and pitfall research are grounded in the actual codebase. Stack and feature research are knowledge-based without live web access, but cover well-established technologies with stable behavior. The one area requiring live validation before implementation is Phase 4 (Teach-Back proxy options and current Web Speech API support).

### Gaps to Address

- **Verify npm package versions** before any install: `npm info react-h5-audio-player version`, `npm info embla-carousel-react version`, `npm info @anthropic-ai/sdk version`. Use these to pin exact versions.
- **Decide Teach-Back key strategy** (Cloudflare Worker vs. user-supplied key) before Phase 4 begins. This decision affects Settings UI design, the proxy implementation, and the security warning copy — it cannot be deferred to mid-implementation.
- **Verify Web Speech API Firefox support** at implementation time (MDN browser compat table). As of August 2025 training data, Firefox does not support `SpeechRecognition`. This may have changed.
- **Measure actual NotebookLM audio file sizes** once content is exported. The estimate of 15–40MB per file determines whether the iOS Safari 50MB quota is a real constraint for this specific content. If files are consistently under 8MB (achievable at 64kbps mono), the quota risk is reduced.
- **Confirm GitHub Pages file size limits** before uploading audio — individual files above 100MB will fail silently on push.

---

## Sources

### Primary (HIGH confidence)
- `/Users/philiy/Developer/ai-tracker/src/` — direct codebase analysis; component structure, hook patterns, localStorage schema, existing Workbox config
- `/Users/philiy/Developer/ai-tracker/package.json` — confirmed existing dependency versions
- `/Users/philiy/Developer/ai-tracker/vite.config.js` — confirmed existing Workbox `globPatterns`
- MDN Web Docs (training knowledge) — HTMLMediaElement.play() Promise rejection, SpeechRecognition API, Web Speech API
- Vite documentation (training knowledge) — `VITE_` env var client-bundle behavior (stable, documented behavior)
- Workbox documentation (training knowledge) — `CacheFirst` strategy, `runtimeCaching` config, `globPatterns`
- Apple WebKit documentation (training knowledge) — iOS audio playback restrictions

### Secondary (MEDIUM confidence)
- npm package documentation (training knowledge, cutoff August 2025) — `react-h5-audio-player`, `embla-carousel-react`, `@anthropic-ai/sdk` version ranges and API
- vite-plugin-pwa documentation (training knowledge) — `skipWaiting`, `devOptions`, service worker update flow
- Cloudflare Workers documentation (training knowledge) — proxy pattern for static site API key security; verify current pricing and streaming support at cloudflare.com/workers

### Tertiary (MEDIUM confidence, verify at implementation)
- Anki, Quizlet, Duolingo, Khan Academy feature patterns — feature expectations for flashcards, quizzes, and audio players (knowledge-based, no live access)
- Web Speech API browser compatibility table — Firefox exclusion status may have changed; verify at developer.mozilla.org before implementing Teach-Back voice input

---

*Research completed: 2026-03-28*
*Ready for roadmap: yes*
