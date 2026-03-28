# Pitfalls Research

**Domain:** PWA with embedded media, interactive assessments, and AI API integration (React + Vite + vite-plugin-pwa)
**Researched:** 2026-03-28
**Confidence:** HIGH for PWA/audio/iOS quirks (well-documented, stable behavior); HIGH for Claude API security patterns; MEDIUM for vite-plugin-pwa cache invalidation specifics (version-dependent behavior)

---

## Critical Pitfalls

### Pitfall 1: Bundling Audio Into the JS/CSS Asset Pipeline

**What goes wrong:**
Audio files imported via ES module `import` statements (e.g., `import audio from './module1.mp3'`) get processed by Vite's asset pipeline. Files above Vite's `assetsInlineLimit` (default 4KB) are emitted as hashed filenames into `dist/assets/`. This is correct behavior but causes two compounding problems: (1) the service worker precache manifest lists every audio file by its content-hash filename, so every new build with any changed audio triggers a full cache bust of all audio — even unchanged files — if they share a manifest entry batch; (2) during development, HMR reloads the entire module graph when audio files change, making iteration slow. With 8 modules of NotebookLM Audio Overviews (podcast-style files are typically 15–40MB each), the Vite build output and precache manifest can easily exceed 200MB, which breaks GitHub Pages deployment and PWA install entirely.

**Why it happens:**
Developers treat audio the same as image imports. Vite handles small assets inline and large ones as hashed files — both paths work for display, but neither is designed for large binary media that should be streamed, not cached wholesale. The vite-plugin-pwa precache strategy (Workbox `generateSW`) will attempt to precache everything in the build output unless explicitly excluded.

**How to avoid:**
Place audio files in `public/audio/` (Vite copies `public/` to `dist/` verbatim with no hashing). Reference them via string paths (`/audio/module1.mp3`), not ES module imports. In the vite-plugin-pwa `workbox.globPatterns` config, explicitly exclude large audio: use `globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,json}']` — omit `.mp3`/`.m4a`. Cache audio separately using a Workbox runtime caching rule with a `CacheFirst` strategy and a size limit (`maxEntries`, `maxAgeSeconds`). This way audio is cached on first play, not on install, and the cache stays bounded.

**Warning signs:**
- `vite build` output shows `dist/assets/` contains `.mp3` files
- Lighthouse PWA audit reports installable asset set >50MB
- GitHub Pages deploy fails or hangs (file size limits apply)
- Service worker install takes >30 seconds on first load
- `workbox-config.js` or `vite.config.ts` has `globPatterns` including `**/*.mp3`

**Phase to address:**
Phase that adds the audio player component and bundles the first audio file. Do not add any audio to the project without this strategy in place first.

---

### Pitfall 2: iOS Safari Audio Playback — The Autoplay and Unlock Wall

**What goes wrong:**
iOS Safari (all versions, including iOS 17+) enforces a strict user gesture requirement for audio playback. Audio started programmatically — including `audioElement.play()` called from a `useEffect`, from a Framer Motion animation callback, or from any async operation that broke the gesture chain — will be silently blocked or throw an `AbortError`/`NotAllowedError`. Additionally: (1) `<audio>` elements with `preload="auto"` do not actually preload on iOS — the browser ignores the attribute to save data; (2) seeking an unplayed audio element before the user has interacted causes it to load from the network seek point rather than the beginning, which triggers buffering; (3) changing `audio.src` dynamically after construction requires calling `audio.load()` before `audio.play()` or playback silently fails; (4) background audio is paused by iOS when the screen locks or the browser is backgrounded, and the `pause` event may not fire reliably.

**Why it happens:**
Developers test on desktop Chrome where autoplay policies are looser and `preload` works as documented. The React pattern of calling `play()` in a `useEffect` after state change breaks the gesture chain because effects run asynchronously after render, not inline with the click event.

**How to avoid:**
Call `audioRef.current.play()` directly inside the click handler (synchronous, same call stack as the user gesture). Never call `play()` in a `useEffect` or after an `await`. For dynamic source changes: set `audio.src`, call `audio.load()`, then call `audio.play()` — all in the same synchronous block. Handle the returned Promise: `audio.play().catch(e => { if (e.name !== 'AbortError') setError(e) })`. For the ADHD-aware UX, show a visible "Tap to start audio" affordance rather than attempting autoplay. Test all audio interactions on a physical iOS device early — simulators do not replicate audio restrictions accurately.

**Warning signs:**
- `play()` call is inside a `useEffect` or `setTimeout`
- No `.catch()` handling on the `play()` Promise
- Audio works on desktop but silently fails on mobile
- `audio.load()` is not called when `audio.src` is changed dynamically
- Framer Motion `onAnimationComplete` callback triggers audio playback

**Phase to address:**
Phase that implements the audio player component. Add an iOS audio smoke test (physical device or BrowserStack) as a phase exit criterion.

---

### Pitfall 3: Service Worker Precache Invalidation on Content Updates

**What goes wrong:**
vite-plugin-pwa generates a Workbox precache manifest keyed on content hashes. When audio files, flashcard JSON, or quiz JSON change (e.g., after a NotebookLM re-export), their hashes change, the manifest changes, and the service worker version bumps. BUT: returning users with the old SW installed will not see the new content until the SW update cycle completes — which requires (1) all tabs of the app to be closed, (2) the new SW to move from `waiting` to `active`. On mobile, users rarely close all tabs. The result is users running stale content indefinitely without knowing it. The inverse problem: during development, stale service workers serve cached assets and mask new code changes, causing "why isn't my change showing up?" confusion that's hard to diagnose.

**Why it happens:**
The SW update lifecycle is invisible to users. vite-plugin-pwa's `registerSW` with `autoUpdate: true` can force the update but risks disrupting a user mid-quiz. The default `prompt` mode requires explicit user action. Developers forget to test the update flow and only notice when production users report seeing old content.

**How to avoid:**
Use `registerSW({ immediate: true })` with `skipWaiting: true` in the Workbox config for this app — it's a single-user personal tool, not a multi-tab production app, so forced updates are acceptable. Add a visible "App updated — reload to get new content" toast using the `onNeedRefresh` callback, with a one-click reload. During development, disable the service worker entirely (`if (import.meta.env.DEV)` guard around SW registration, or use `vite-plugin-pwa`'s `devOptions: { enabled: false }`). Keep a `sw-version.txt` file in `public/` that you manually bump with each content update — use it as a human-readable sentinel for debugging cache issues.

**Warning signs:**
- `workbox.skipWaiting` is not set to `true` in vite.config
- No user-visible update notification in the app
- Service worker is registered in development mode (masks code changes)
- Content JSON files are in `dist/assets/` with hashed names (hard to cache-bust selectively)
- No version indicator in the app UI or console

**Phase to address:**
Phase that updates the service worker to cache new content assets (audio, images, JSON). Include forced-update testing as a phase exit criterion.

---

### Pitfall 4: Claude API Key Exposed in Client-Side Code

**What goes wrong:**
The Claude API key is embedded in the client bundle — in `.env` as `VITE_ANTHROPIC_API_KEY`, in a config file, or hardcoded. Vite embeds all `VITE_` prefixed env vars into the built JS. The key is trivially extractable from the minified bundle via browser devtools or by fetching the `.js` asset directly. The key can then be used to rack up API charges against the account, access other Anthropic features, or exfiltrate data. GitHub Actions / GitHub Pages deployments commonly leak keys via repository secrets exposed in build logs if misconfigured.

**Why it happens:**
The app is static (GitHub Pages, no server). The instinct is "I'll just use an env var." This works for backend environment variables; it does not work for Vite because the env var value is inlined at build time into client-readable JS. The Anthropic SDK, when initialized client-side, also emits a warning about this exact issue.

**How to avoid:**
There are three viable options for a GitHub Pages static app: (1) **Cloudflare Worker proxy** — free tier, deploy a Worker that holds the API key server-side, the PWA calls the Worker, the Worker calls Anthropic. The Worker can add rate limiting and origin checking. (2) **User-supplied key** — store the user's own Claude API key in localStorage (encrypted or plaintext with a clear warning), call the Anthropic API directly from the client using the user's key. The user accepts the risk of their own key. This is the simplest option for a personal tool. (3) **Netlify/Vercel Function** — if willing to migrate from GitHub Pages for Teach-Back, a serverless function holds the key securely. For this app (single user, personal tool), option 2 (user-supplied key in Settings) is the pragmatic choice. Document the risk clearly in the UI.

**Warning signs:**
- Any file contains `VITE_ANTHROPIC_API_KEY` or `VITE_CLAUDE_KEY`
- The Anthropic client is initialized with a hardcoded string
- `import Anthropic from '@anthropic-ai/sdk'` is in a component that runs client-side without a proxy
- The `.env` file is committed to the repo (even if gitignored, check `.gitignore`)

**Phase to address:**
Phase that implements Teach-Back / Claude API integration. This decision must be made and committed to before writing any Claude API code — retrofitting the key strategy is disruptive.

---

### Pitfall 5: State Management Explosion When Adding Interactive Content

**What goes wrong:**
The existing app has a focused state model: `completed` (activity toggles), `notes` (text per module), `streak` (date). Adding flashcards, quizzes, and audio introduces new state dimensions: current audio position, audio play/pause state, flashcard deck index, flashcard flip state, per-card correct/incorrect marks, quiz answers, quiz score, quiz attempt history. If these states are added to the existing `useProgress` hook and persisted to localStorage via the existing `saveProgress` path, three things happen: (1) the localStorage blob grows and every state change (including audio position updates, which fire many times per second) triggers unnecessary Supabase sync pushes; (2) the existing DEFAULT_STATE shape (already duplicated, per CONCERNS.md) now has a third copy needed for the new content state; (3) the progress export JSON becomes unreadably large, and the existing merge logic in `mergeProgress` will not handle new keys correctly across devices.

**Why it happens:**
It feels natural to add new state to the existing state hook. The existing infrastructure (persistence, sync, reset) "just works" for the new keys. The problems are invisible until the app is slow, the Supabase push rate hits limits, or two devices sync conflicting flashcard scores.

**How to avoid:**
Treat interactive content state (audio position, quiz scores, flashcard progress) as session-local state — do not persist it to the global progress blob or sync it to Supabase. Use component-local `useState` for in-session UI state (flip state, current card index). For quiz scores and completion that matter for progress tracking, add a narrow, flat schema (e.g., `quizScores: { moduleId: { score, total, completedAt } }`) stored separately in localStorage under a distinct key, never merged or synced. Audio position does not need persistence at all for this use case — restart from beginning on revisit is fine.

**Warning signs:**
- `useProgress.js` gains more than 2-3 new keys in its state shape for content features
- Audio `timeupdate` event listener calls `saveProgress` or `setState`
- Flashcard flip state lives in the progress store rather than component state
- `mergeProgress` function is modified to handle new content keys
- The sync push debounce fires during audio playback

**Phase to address:**
Phase that adds the first interactive component (whichever comes first — flashcards or quiz). Establish the state boundary rule before any content components are built.

---

### Pitfall 6: Offline-First Breaks When Teach-Back Requires Network

**What goes wrong:**
The app's offline guarantee covers all learning content (audio, images, flashcards, quizzes). Teach-Back requires the Claude API — it cannot work offline. If Teach-Back is implemented as just another activity in the module's activity list and the app renders it the same way as other activities (always visible, clickable), users in offline/airplane mode will tap it, nothing will happen, and they won't understand why. Worse: if the error is surfaced as a generic fetch error or console error rather than a human-readable offline state message, the ADHD-aware UX breaks — confusion and frustration replace the warm encouragement tone.

**Why it happens:**
Online/offline state is often treated as a global flag rather than a feature-level concern. The `navigator.onLine` property is unreliable (it returns `true` on many captive portal networks where the Claude API is unreachable). Network errors from the Anthropic SDK are async and may arrive 5–30 seconds after the attempt.

**How to avoid:**
Gate Teach-Back behind an active network check at the component level, not just `navigator.onLine`. Use a lightweight probe request (fetch with timeout) to a known-reachable endpoint to confirm actual connectivity before enabling the Teach-Back button, or handle the error gracefully with a clear, warm message: "Teach-Back needs an internet connection. Come back when you're online." Visually distinguish Teach-Back from offline-capable activities (different icon, "needs connection" badge). The existing `CONCERNS.md` notes that `"offline"` sync status is never set — fix this pattern in the same phase so the app has a consistent offline/online awareness model.

**Warning signs:**
- Teach-Back button is always enabled regardless of network state
- `navigator.onLine` is the sole network check
- No user-visible "requires connection" affordance on the Teach-Back activity
- Teach-Back errors surface as generic "Something went wrong" rather than connectivity-specific messages
- The activity completion toggle for Teach-Back fires even when the session was abandoned due to no connection

**Phase to address:**
Phase that implements Teach-Back. Define the offline degradation UX before writing any Claude API code.

---

### Pitfall 7: Web Speech API Browser Compatibility for Teach-Back Voice

**What goes wrong:**
The Web Speech API (`SpeechRecognition` / `SpeechSynthesis`) has significant gaps: (1) Firefox does not support `SpeechRecognition` at all (as of mid-2025); (2) iOS Safari supports `SpeechSynthesis` but `SpeechRecognition` is gated behind a flag and unreliable; (3) Chrome on Android requires an online connection even for local speech recognition because it routes through Google's servers; (4) `SpeechRecognition` results are non-deterministic — interim results fire repeatedly, and final results may be split across multiple events; (5) the API has no standard error recovery — mic permission denial, no-speech timeouts, and network errors all surface as `onerror` events with different `error` codes that must be handled individually.

**Why it happens:**
Developers test on desktop Chrome where the API works well. The inconsistency only appears when testing on the target mobile devices.

**How to avoid:**
Detect support with `'SpeechRecognition' in window || 'webkitSpeechRecognition' in window` before rendering voice UI. For Teach-Back, offer a text fallback: if `SpeechRecognition` is unavailable, show a text input instead of a microphone button. Use `webkitSpeechRecognition` (prefixed) for Chrome/Safari compatibility. Handle these specific error codes explicitly: `no-speech` (restart or prompt user), `not-allowed` (explain mic permission), `network` (needs connectivity). Set `recognition.interimResults = false` for simpler result handling. Test on a physical iOS device and on Firefox before shipping.

**Warning signs:**
- `SpeechRecognition` is used without the `webkit` prefix fallback
- No feature detection guard before rendering the microphone UI
- No text input fallback
- `onerror` handler uses a single generic message for all error types
- Teach-Back is only tested on Chrome desktop

**Phase to address:**
Phase that implements Teach-Back voice interaction. Include Firefox and iOS Safari testing in phase exit criteria.

---

### Pitfall 8: PWA Install Size Exceeds GitHub Pages and Browser Limits

**What goes wrong:**
GitHub Pages has a soft 1GB repository size limit and a 100MB individual file limit. More critically, browsers enforce PWA cache storage quotas. Chrome allocates roughly 60% of available disk, but iOS Safari caps PWA storage at 50MB per origin (as of iOS 15; this limit has been relaxed somewhat since iOS 16.4 but remains lower than desktop). A single NotebookLM Audio Overview can be 20–60MB. Eight modules of audio = 160–480MB. Even if GitHub Pages hosts the files, the PWA will fail to cache them on iOS Safari, silently falling back to network-only fetches — breaking the offline-first guarantee on the most common mobile platform for a personal learning app.

**Why it happens:**
Developers verify the app works offline on Chrome desktop (generous quota). iOS Safari's quota enforcement is invisible until users report offline failures on their iPhones.

**How to avoid:**
Do not attempt to precache audio. Use Workbox runtime caching with `CacheFirst` strategy and explicit `maxEntries: 8` and `maxAgeSeconds: 30 * 24 * 60 * 60` (30 days) to cache audio only after first play. For iOS Safari, add a "Download for offline" affordance that explicitly fetches and caches individual module audio files on user request. Compress all audio to 64kbps mono MP3 (sufficient for podcast-style speech) — this typically reduces 40MB files to 8–12MB. Add a storage usage indicator in Settings so users can see how much space the app is using.

**Warning signs:**
- Audio files are in `vite.config`'s `workbox.globPatterns`
- No audio bitrate/format optimization plan
- Total audio asset size >50MB (check with `du -sh public/audio/`)
- No Workbox `runtimeCaching` config for audio routes
- App tested for offline only on desktop Chrome

**Phase to address:**
Before the audio player phase. Audio compression and caching strategy must be decided at content extraction time, not after.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Import audio via ES modules (`import mp3 from './file.mp3'`) | Works in dev immediately | Vite processes all audio into hashed assets; precache manifest bloats; cache invalidation cascades | Never for files >500KB |
| Add quiz/flashcard state to existing `useProgress` hook | No new infrastructure | Sync fires on every card flip; state shape diverges across devices; DEFAULT_STATE needs a third duplicate | Never |
| Use `VITE_ANTHROPIC_API_KEY` in .env | Zero setup time | API key exposed in built JS bundle | Never for any real key |
| `navigator.onLine` as the sole offline check | One-liner | Captive portals, lossy networks, and mobile radio state all return false positives | Acceptable as a first-pass gate if API errors are also handled gracefully |
| Skip `audio.load()` when changing `audio.src` | Slightly simpler code | Silent playback failure on iOS Safari every time | Never |
| Skip feature detection for SpeechRecognition | Simpler component | Uncaught TypeError crash on Firefox and some iOS versions | Never |
| Persist audio playback position to localStorage | Allows resume-on-return | `timeupdate` fires ~4x/sec, causing constant localStorage writes and sync triggers | Only if debounced to max once per 10 seconds, with audio position excluded from sync |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Claude API (Anthropic SDK) | Initialize client with hardcoded or Vite env var key in a React component | User-supplied key stored in localStorage, or proxy via Cloudflare Worker — never inline in build |
| Claude API | Call `client.messages.create()` from a `useEffect` with no abort controller | Always pass `AbortSignal` and cancel on component unmount to prevent state updates after unmount |
| Claude API | Assume streaming responses work in all environments | Test streaming in the actual deployment context (GitHub Pages → Cloudflare Worker must forward SSE correctly) |
| Workbox / vite-plugin-pwa | `generateSW` mode auto-discovers all files in `dist/` | Explicitly set `globPatterns` to exclude `.mp3`, `.m4a`, `.jpg` (large images); use runtime caching for media |
| Web Speech API | Use `recognition.start()` without checking if a session is already active | `recognition.abort()` before `start()` on retry; check `recognition.state` if available |
| Web Speech API | Assume `result` event gives a single clean string | Collect `event.results` array, filter `isFinal === true`, join alternatives by highest confidence |
| Framer Motion | Trigger audio playback from `onAnimationComplete` callback | Never start audio from animation callbacks — always start from direct user gesture handlers |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Audio `timeupdate` event causes React state update | UI re-renders 4x/sec during playback; jank on lower-end Android | Use a ref for current time; only call setState for UI-visible changes (every 500ms via throttle) | First audio file added |
| Flashcard deck renders all cards in DOM | Lag on initial render with 20+ cards; memory pressure on mobile | Render only current card + 1 ahead/behind; virtualize if >50 cards | >20 cards per module deck |
| Quiz component re-renders parent on every answer | Progress ring animations replay; confetti fires prematurely | Isolate quiz state to component scope; emit only final score to parent | First quiz interaction |
| Image carousel for Deck slides loads all images on mount | First module open takes 3–5s on slow connections; memory spikes | Use `loading="lazy"` on `<img>` and only render visible slide + neighbors | Modules with >5 slide images |
| Teach-Back sends full module content as context on every turn | Large token counts per request; slow responses; high API cost | Send a compact module summary (title, key concepts as bullet points) as system prompt, not full curriculum text | First Teach-Back session |

---

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| `VITE_ANTHROPIC_API_KEY` in `.env` | Key exposed in built JS; anyone can exfiltrate it from the bundle | User-supplied key model or Cloudflare Worker proxy |
| Claude API key in localStorage without warning | Key exposed to XSS and browser extensions (same risk as existing sync phrase issue) | Display clear "Your API key is stored locally — only enter a key you're comfortable exposing to this device" warning in Settings; never send key to any endpoint other than `api.anthropic.com` |
| Teach-Back prompt injection via user speech input | User could speak phrases that alter the system prompt behavior | System prompt must be server-controlled (Cloudflare Worker) or hardened; use Claude's `<userTurn>` / `<assistantTurn>` structure to clearly delimit user content |
| Sync phrase stored in plaintext localStorage (existing) | Already documented in CONCERNS.md — compounded by API key storage if both are in localStorage | Existing concern; address before adding API key storage to avoid two plaintext secrets in localStorage |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Audio player with no progress indicator | ADHD users cannot gauge remaining time; harder to return to a specific point | Always show a scrubber/progress bar even if seeking is disabled |
| Flashcard "flip" animation that blocks input during transition | ADHD users tap impatiently and trigger double-flips | Disable flip button during the animation (50–200ms) using a transitioning state flag |
| Quiz score shown only at the end | Long quizzes feel like a test; anxiety for ADHD learners | Show running score or "X of Y answered" throughout; celebrate each correct answer with a small micro-animation |
| Teach-Back microphone that records without visible feedback | User doesn't know if speech is being captured | Show a live waveform or animated indicator while `SpeechRecognition` is active |
| Teach-Back "thinking" spinner with no timeout | Claude API calls can take 5–15 seconds; users assume it's broken | Add a 30-second timeout with a friendly "still thinking..." message at 10s; cancel cleanly at 30s |
| All content activities shown as locked/greyed before audio plays | Implies wrong sequence; ADHD users may abandon before starting | Activities are independent; show all as available; the app tracks what's done, not what's allowed |

---

## "Looks Done But Isn't" Checklist

- [ ] **Audio player:** Works on desktop — verify `play()` is not called outside a user gesture handler and test on a physical iPhone
- [ ] **Audio caching:** Files in `public/audio/` — verify they are NOT in `workbox.globPatterns` and ARE in a `runtimeCaching` rule
- [ ] **Service worker update:** New content deployed — verify users get an update notification and the SW actually activates (test in Chrome DevTools SW panel)
- [ ] **Claude API key:** Teach-Back implemented — verify no `VITE_` prefixed API key exists anywhere in the codebase or build output
- [ ] **Flashcard state:** Cards implemented — verify no flashcard state is being written to `saveProgress` or triggering Supabase sync
- [ ] **Quiz completion:** Quiz finished — verify the score is recorded but the quiz session state is not merged into Supabase sync data
- [ ] **SpeechRecognition:** Teach-Back voice built — verify it has feature detection, a text fallback, and was tested in Firefox
- [ ] **Offline mode:** All offline-capable content tested — verify Teach-Back shows a clear offline message and does NOT show a generic fetch error
- [ ] **iOS audio:** Audio player built — verify `audio.load()` is called before `audio.play()` when src changes and that the src path uses `/audio/...` not a hashed asset URL

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Audio bundled in assets pipeline | HIGH | Move all audio to `public/audio/`; update all import references to string paths; update vite.config globPatterns; rebuild and re-deploy; existing SW caches must be invalidated |
| API key exposed in bundle | HIGH | Rotate the key immediately in Anthropic dashboard; audit GitHub Pages build artifacts and delete if possible; migrate to user-supplied key or proxy before re-deploying |
| Service worker serving stale content after update | MEDIUM | Add `skipWaiting: true` to Workbox config and redeploy; communicate to user to clear site data in browser settings as one-time fix |
| State management explosion in useProgress | MEDIUM | Extract content state to separate localStorage keys and hooks; requires refactoring all components that consume the merged state; 1–2 days of work |
| iOS audio broken in production | MEDIUM | Audit all `play()` call sites for async gaps; refactor to synchronous gesture handlers; can be fixed without structural changes |
| SpeechRecognition crash on Firefox | LOW | Add feature detection guard and text fallback; isolated to Teach-Back component; 2–4 hours |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Audio bundled in Vite asset pipeline | Before/during audio player implementation | `ls dist/assets/*.mp3` returns nothing; `workbox.globPatterns` excludes audio extensions |
| iOS audio autoplay/gesture chain | During audio player component build | Manual test on physical iOS device; `play()` call site audit |
| Service worker cache invalidation | During SW update for new content assets | Deploy a content change; verify returning users see update prompt; verify old audio is evicted |
| Claude API key in client bundle | Before any Teach-Back code is written | `grep -r "VITE_ANTHROPIC" src/` returns nothing; bundle analysis shows no key strings |
| State management explosion | Before first interactive content component | New content state lives in component-local or separate hooks; no new keys in `useProgress` state shape |
| Offline UX for Teach-Back | During Teach-Back feature design | Airplane mode test shows warm offline message, not error; activity completion does not fire without a completed session |
| Web Speech API compatibility | During Teach-Back voice implementation | Firefox test (text fallback renders); iOS test (voice works or falls back cleanly) |
| PWA install size / iOS Safari quota | Before audio extraction/bundling begins | Compressed audio files measured; runtime-only caching confirmed; offline test on iOS |

---

## Sources

- Anthropic SDK documentation (api.anthropic.com/docs) — API key security warnings are in the SDK README itself
- vite-plugin-pwa documentation (vite-pwa-org.netlify.app) — globPatterns and runtime caching configuration
- Workbox documentation (developer.chrome.com/docs/workbox) — CacheFirst strategy, size limits
- MDN Web Docs — HTMLMediaElement.play() Promise rejection, SpeechRecognition API browser compatibility table
- Apple WebKit documentation — iOS audio playback restrictions (webkit.org/blog)
- Project CONCERNS.md — existing tech debt patterns that compound with new feature risks (2026-03-28)
- Project PROJECT.md — constraints: GitHub Pages hosting, offline-first mandate, Vite 8 + React 19 stack

*Note: WebSearch was unavailable during this research session. Findings are based on training knowledge (cutoff August 2025) for well-established browser APIs and framework behaviors. iOS audio restrictions, PWA storage quotas, Workbox configuration, and API key security are stable, well-documented behaviors with HIGH confidence. Specific vite-plugin-pwa version behavior is MEDIUM confidence — verify against current docs before implementation.*

---
*Pitfalls research for: PWA embedded media + AI API integration (AI Fundamentals Tracker)*
*Researched: 2026-03-28*
