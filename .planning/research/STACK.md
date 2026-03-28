# Stack Research

**Domain:** Interactive learning PWA — embedded audio, image carousels, flashcards, quizzes, voice AI conversation
**Researched:** 2026-03-28
**Confidence:** MEDIUM (external npm/docs queries blocked during research session; versions from training data, flagged below)

---

## Context: What Already Exists

The app ships React 19.2.4 + Vite 8.0.1 + Tailwind CSS 4.2.2 + Framer Motion 12.38.0 + vite-plugin-pwa 1.2.0. Every library recommendation below is additive to this base. Where Framer Motion can handle the job, no new library is added.

---

## Recommended Stack

### Core Technologies (New Additions)

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| `react-h5-audio-player` | ^3.9.x | Audio player component | Keyboard-accessible HTML5 audio with custom styling hooks, active maintenance, React 18/19 compatible. Styling is all CSS overrides — works cleanly with Tailwind custom CSS. Zero config for offline use since it wraps native `<audio>`, which reads bundled files from `public/assets/audio/`. |
| `embla-carousel-react` | ^8.x | Image carousel for deck slides | Smallest bundle (~7 kB gzip), zero dependencies, fully headless — you own all DOM and styling. Widely adopted as the go-to carousel for React post-2023 after Swiper became bloated. Works with touch, mouse, and keyboard. React 19 compatible. |
| `@anthropic-ai/sdk` | ^0.30.x | Claude API client for Teach-Back | Official Anthropic client. Works in browser environments; use it only through a server-side proxy (see note below). Streaming support is critical for voice conversation UX — users see responses as they arrive, not after a 3–5s wait. |

**Confidence note:** Version ranges above are from training data (cutoff August 2025). Verify current versions with `npm info <package> version` before pinning. The major versions (3.x, 8.x, 0.30.x) are stable anchors; patch versions may be higher.

### No New Libraries Needed For

| Feature | Why Existing Stack Covers It |
|---------|------------------------------|
| Flashcard flip animation | Framer Motion 12 `rotateY` with `AnimatePresence` handles 3D card flip. CSS `perspective` + Framer Motion `variants` is the pattern. No separate flashcard library. |
| Quiz component | Pure React state — question index, selected answer, score counter. No library. Build it. Complexity is low and a library adds bundle weight without benefit. |
| Multiple choice UI | Tailwind CSS utility classes. Radio-button-style option cards. No library. |
| Card/panel layout | Tailwind. Already established pattern in the codebase. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `workbox-strategies` | (bundled with vite-plugin-pwa) | Extended PWA caching for audio + image assets | Use `CacheFirst` for audio files (large, immutable once deployed) and images. Configure via `runtimeCaching` in Workbox options in `vite.config.js`. No extra install — already available through vite-plugin-pwa. |
| Web Speech API | (browser built-in) | Speech-to-text for user's spoken Teach-Back response | Built into all modern browsers. No package needed. `SpeechRecognition` / `webkitSpeechRecognition` with React refs. Offline-capable for recognition (device-based), though quality varies. |
| Web Speech Synthesis API | (browser built-in) | Text-to-speech for Claude's responses | Built into all modern browsers. `window.speechSynthesis.speak()`. No package needed. Pairs with streaming Claude responses: speak each sentence as it arrives. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Vite `assetsInclude` config | Tell Vite to bundle audio files as static assets | Add `assetsInclude: ['**/*.mp3', '**/*.m4a']` to `vite.config.js` if importing audio directly in JS. Alternatively, put audio in `public/assets/audio/` and reference by URL — simpler for large files. |
| Workbox `runtimeCaching` | Cache audio + image files at runtime in the service worker | Add entries for `/assets/audio/**` and `/assets/images/**` with `CacheFirst` strategy in `vite.config.js` `workbox` block. |

---

## Installation

```bash
# Core additions — audio player and carousel only
npm install react-h5-audio-player embla-carousel-react @anthropic-ai/sdk

# No dev dependency additions needed
```

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| `embla-carousel-react` | `swiper` | Only if you need complex multi-slide layouts, autoplay, lazy loading with thumbnails out of the box. For simple image deck slides, Swiper is massively over-engineered (40+ kB vs ~7 kB). |
| `embla-carousel-react` | `react-slick` | Never. react-slick wraps slick.js (jQuery-era), has open accessibility issues, and is effectively unmaintained. |
| `react-h5-audio-player` | `plyr` + React wrapper | Only if you need video support too. plyr is heavier. For audio-only, react-h5-audio-player is cleaner. |
| `react-h5-audio-player` | Custom `<audio>` element + React | Valid option. Build custom if you want full styling control without CSS overrides. react-h5-audio-player saves ~2–3 hours of building accessible controls (keyboard, progress scrubbing, time display). |
| Web Speech API (built-in) | `react-speech-recognition` (wrapper package) | Use the wrapper if you need cross-browser normalization and hook-based ergonomics. Adds ~8 kB. Acceptable tradeoff if bare Web Speech API proves awkward. |
| Web Speech Synthesis (built-in) | ElevenLabs / external TTS | Only if voice quality is critical and the app has a paid tier. For a personal study tool, native synthesis is sufficient and keeps Teach-Back functional without additional API costs. |
| Claude API via proxy | Direct browser `@anthropic-ai/sdk` call | Never expose API key in client code. Always proxy, even for personal tools hosted publicly. See Architecture note below. |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `react-slick` | Unmaintained, jQuery-era dependency, broken accessibility, known CSS conflicts | `embla-carousel-react` |
| `react-spring` for card flip | Already have Framer Motion installed; two animation libraries fight each other and inflate the bundle | Framer Motion `rotateY` + `AnimatePresence` |
| Supabase Storage for audio/images | Project decision: offline-first static bundling. Runtime fetches from Supabase break offline mode. | `public/assets/` directory + Workbox `CacheFirst` |
| `react-quiz-component` or similar quiz libraries | Generic quiz libraries impose opinionated data structures that won't match the NotebookLM JSON schema you extract. You'll spend more time adapting the data than building a simple quiz from scratch. | Custom React component (~80 lines) |
| Direct `@anthropic-ai/sdk` in browser without proxy | Exposes API key in client bundle — visible in devtools network tab to any visitor | Serverless function proxy (Netlify/Vercel function, or Cloudflare Worker for GitHub Pages) |
| `howler.js` | Heavier audio library (28 kB) designed for game audio with complex sprite sheets. PWA study app needs a simple linear audio player, not game audio management. | `react-h5-audio-player` wrapping native HTML5 `<audio>` |

---

## Architecture Notes for Teach-Back (Critical)

### The API Key Problem

This app is hosted on GitHub Pages (static hosting). There is no server. The Claude API key cannot be bundled in client code.

**Required:** A serverless proxy function sits between the browser and Anthropic.

**Recommended approach for GitHub Pages:** Cloudflare Worker (free tier: 100k requests/day).
- Worker receives `{ messages: [...] }` from the browser
- Worker injects the API key from Worker secrets (never exposed to client)
- Worker proxies to `https://api.anthropic.com/v1/messages`
- Worker streams back the response

**Alternative:** If user is willing to deploy to Netlify or Vercel, use their built-in serverless functions (`netlify/functions/claude.js` or `api/claude.js`). Requires changing deploy target from GitHub Pages.

**Not acceptable:** Storing the API key in `.env` as `VITE_ANTHROPIC_KEY` — Vite bakes `VITE_` prefixed vars into the client bundle at build time. Anyone who views source can read it.

Confidence: HIGH — this is a documented Vite behavior, not speculation.

### Audio Bundle Size

8 modules × 1 audio file = 8 audio files. NotebookLM Audio Overviews are typically 10–25 minutes of podcast-style audio. At 128kbps MP3, that is 10–19 MB per file, or 80–150 MB total.

**This cannot be precached in the service worker.** Workbox's default precache is unsuitable for files this large.

**Required approach:**
1. Store audio in `public/assets/audio/` (not imported in JS — referenced by URL)
2. Use Workbox `runtimeCaching` with `CacheFirst` strategy for `/assets/audio/`
3. Set a generous `maxAgeSeconds` (e.g., 30 days) and `maxEntries` limit
4. The audio files cache on first play, then serve offline from that point forward

This is a deliberate lazy-caching approach: the user must play each audio file once while online for it to become available offline. This is standard PWA practice for large media assets.

---

## Stack Patterns by Condition

**For the flashcard flip animation:**
- Use Framer Motion `motion.div` with `rotateY` variants (0 → 180 degrees)
- Set CSS `perspective: 1000px` on the container
- `backfaceVisibility: hidden` on both card faces
- `AnimatePresence` is not needed — just toggle a `flipped` boolean and drive `rotateY`

**For the Teach-Back conversation loop:**
1. User presses mic button → `SpeechRecognition` starts
2. User speaks → transcript populates in real time
3. User stops speaking → send transcript to Claude proxy
4. Claude streams back evaluation → display text + optionally speak via `speechSynthesis`
5. Framer Motion `AnimatePresence` handles message bubble entry animations

**For PWA caching of images:**
- Deck images will be smaller (likely 200–500 kB each × 8 modules)
- These CAN be precached in Workbox `globPatterns`
- Add `**/*.{jpg,jpeg,png,webp}` to the existing glob pattern

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| `react-h5-audio-player@^3.9` | React 19 | Library uses standard hooks; no known React 19 incompatibilities as of August 2025. Verify at install time. |
| `embla-carousel-react@^8` | React 19 | Embla v8 targets React 18+; React 19 is backward-compatible. Verify changelog at install. |
| `@anthropic-ai/sdk@^0.30` | Node 18+, browser ESM | SDK is isomorphic; browser use requires proxy to avoid CORS and key exposure. Streaming (`stream: true`) works in browser fetch. |
| `vite-plugin-pwa@1.2` | Vite 8 | Already installed and working. Workbox `runtimeCaching` is standard Workbox config, no compatibility concerns. |

---

## Sources

- `/Users/philiy/Developer/ai-tracker/package.json` — confirmed existing dependency versions (HIGH confidence)
- `/Users/philiy/Developer/ai-tracker/vite.config.js` — confirmed Workbox `globPatterns` baseline (HIGH confidence)
- Training data (cutoff August 2025) — library recommendations, version ranges, API key security patterns (MEDIUM confidence for versions, HIGH confidence for architectural patterns)
- Vite documentation (training data) — `VITE_` env var behavior, `assetsInclude` config (HIGH confidence — stable, well-documented behavior)
- Workbox documentation (training data) — `CacheFirst` strategy, `runtimeCaching` config (HIGH confidence — stable Workbox patterns)

**Version verification required before implementation:**
```bash
npm info react-h5-audio-player version
npm info embla-carousel-react version
npm info @anthropic-ai/sdk version
```

---

*Stack research for: AI Fundamentals Tracker — embedded learning content milestone*
*Researched: 2026-03-28*
