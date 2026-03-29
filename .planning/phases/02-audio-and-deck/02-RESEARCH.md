# Phase 2: Audio and Deck - Research

**Researched:** 2026-03-29
**Domain:** React audio player, image carousel, NotebookLM MCP content extraction, iOS Safari audio, Workbox runtime caching
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Use NotebookLM MCP tools (notebooklm-mcp) to discover all 8 notebook IDs and extract assets
- **D-02:** Extract audio overview files from each notebook — save as MP3 to `public/audio/{moduleId}/overview.mp3`
- **D-03:** Extract deck/slide images from each notebook — save to `public/decks/{moduleId}/slide-{N}.png`
- **D-04:** Compress audio to ~64kbps mono MP3 to minimize iOS PWA storage pressure
- **D-05:** Content extraction is a build-time/dev-time step, not runtime — assets committed to repo as static files
- **D-06:** One notebook per module; module 1 notebook ID is `72cf9d0c-05b7-48ad-94ff-c12f20f2a6c1`; modules 2-8 IDs need discovery
- **D-07:** Compact inline AudioPlayer rendered inside ActivityPanel when activity.id === "audio"
- **D-08:** Controls: play/pause toggle, scrub bar with current time + total duration, playback speed selector (0.5x, 1x, 1.25x, 1.5x, 2x)
- **D-09:** Use `react-h5-audio-player` library
- **D-10:** Audio source: `public/audio/{moduleId}/overview.mp3`
- **D-11:** Auto-complete: fire `onComplete()` when `currentTime / duration >= 0.9` — fires once per session only
- **D-12:** Player state (playing, position) is component-local — NOT saved to useProgress
- **D-13:** Style player with CSS custom properties (var(--bg-card), var(--text-primary), etc.)
- **D-14:** Image carousel rendered inside ActivityPanel when activity.id === "deck"
- **D-15:** Use `embla-carousel-react` library
- **D-16:** Navigation: prev/next arrow buttons + swipe gesture on mobile
- **D-17:** Slide counter: "3 / 12" position indicator
- **D-18:** Tap/click to zoom: opens a modal/overlay with the full-size image for readability
- **D-19:** Keyboard arrow key navigation on desktop when carousel is focused
- **D-20:** Auto-complete: fire `onComplete()` when user reaches the last slide — fires once per session only
- **D-21:** Deck images loaded from `public/decks/{moduleId}/slide-{N}.png`
- **D-22:** All deck images included in Workbox precache manifest (small enough, unlike audio)
- **D-23:** ActivityPanel currently shows placeholder text — replace with content component routing based on activity.id
- **D-24:** ActivityPanel renders AudioPlayer when activity.id === "audio", DeckViewer when activity.id === "deck", placeholder for flashcards/quiz/teachback
- **D-25:** Both AudioPlayer and DeckViewer receive `moduleId` and `onComplete` props from ActivityPanel

### Claude's Discretion

- Audio player exact styling (spacing, button sizes, scrub bar appearance)
- Embla carousel configuration (drag threshold, alignment, containScroll)
- Zoom modal animation and dismiss behavior
- How to handle modules with no audio/deck content yet (graceful empty state)

### Deferred Ideas (OUT OF SCOPE)

- Audio position persistence across sessions (v2 requirement AUDIO-V2-01)
- Audio progress arc overlaid on module progress ring (v2 requirement AUDIO-V2-02)
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CONT-01 | Extract audio overview files from all 8 NotebookLM notebooks via MCP tools | notebooklm-mcp `notebook_list`, `studio_create` (audio), `download_artifact` confirmed available |
| CONT-02 | Extract deck/slide images from all 8 NotebookLM notebooks via MCP tools | notebooklm-mcp `studio_create` (slide_deck), `download_artifact` confirmed; slide images need PPTX/PNG extraction step |
| AUDIO-01 | Embedded audio player with play/pause toggle | react-h5-audio-player v3.10.2 provides this by default |
| AUDIO-02 | Scrub bar / seek with current time and total duration | react-h5-audio-player includes progress bar section with time display by default |
| AUDIO-03 | Playback speed control (0.5x, 1x, 1.25x, 1.5x, 2x) | react-h5-audio-player has no built-in playbackRate prop; implement via audioRef.current.audio.current.playbackRate — custom speed selector UI needed |
| AUDIO-04 | Auto-complete at ~90% playback progress | Use `onListen` callback with throttled currentTime/duration ratio check; fires onComplete once using a ref flag |
| AUDIO-05 | Audio files served from public/audio/ and cached by service worker on first play | Workbox runtimeCaching already configured for /audio/.+ pattern in vite.config.js |
| DECK-01 | Image carousel with previous/next navigation | embla-carousel-react v8.6.0: emblaApi.scrollPrev(), emblaApi.scrollNext() |
| DECK-02 | Slide counter showing current position (e.g., "3 / 12") | emblaApi.selectedScrollSnap() on 'select' event + total slides from image array length |
| DECK-03 | Tap/click to zoom image for readability | Custom zoom modal — Framer Motion AnimatePresence for enter/exit animation |
| DECK-04 | Auto-complete activity when user reaches last slide | Detect selectedScrollSnap() === slides.length - 1 on 'select' event; fire onComplete once via ref flag |
| DECK-05 | Keyboard arrow key navigation on desktop | Add keydown listener on the carousel wrapper div with onKeyDown handler |
| PWA-03 | Audio files cached on first play, available offline thereafter | Workbox CacheFirst runtimeCaching for /audio/.+ already in vite.config.js — confirmed working |
</phase_requirements>

---

## Summary

Phase 2 builds two content components — AudioPlayer and DeckViewer — and wires them into the existing ActivityPanel via activity.id routing. The infrastructure from Phase 1 is already in place: ActivityPanel renders, the onComplete callback chain works, and Workbox runtimeCaching for audio is configured.

The biggest non-obvious technical issue is that `react-h5-audio-player` (v3.10.2) has **no built-in playbackRate prop**. The playback speed selector (AUDIO-03) must be implemented by accessing the underlying audio element through `playerRef.current.audio.current.playbackRate` directly. This is well-supported since the library exposes the audio ref, but it means building a custom speed-selector UI element rather than using a library prop.

Content extraction via the notebooklm-mcp server is confirmed available (`notebook_list`, `studio_create` with `artifact_type="audio"` or `"slide_deck"`, `download_artifact`). The deck slide extraction requires a two-step approach: download the slide deck artifact (likely PPTX format), then extract individual PNG images from it — the MCP does not directly export per-slide PNG files. This is a meaningful scoping issue the planner must account for.

**Primary recommendation:** Plan the content extraction task first (notebooks → audio MP3 + slide PNGs on disk), then build AudioPlayer and DeckViewer components against those static assets. Keep both components fully isolated from useProgress — they communicate only via the onComplete prop.

---

## Standard Stack

### Core (Additions to Install)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `react-h5-audio-player` | 3.10.2 | Audio player component wrapping HTML5 `<audio>` | Handles accessible controls, progress scrubbing, time display; exposes raw audioRef for custom properties like playbackRate |
| `embla-carousel-react` | 8.6.0 | Headless image carousel | ~7kB, zero dependencies, touch/mouse/keyboard-ready, React 19 compatible, useEmblaCarousel hook API |

**Version verification (run before implementation):**
```bash
npm info react-h5-audio-player version   # verified: 3.10.2
npm info embla-carousel-react version    # verified: 8.6.0
```

### Already Available (No Install Needed)

| Library | Purpose |
|---------|---------|
| Framer Motion 12.38.0 | Zoom modal animations (AnimatePresence), already installed |
| Workbox (via vite-plugin-pwa 1.2.0) | runtimeCaching for audio already configured |
| Lucide React 0.577.0 | Prev/next arrow icons, play/pause icons |

### Installation

```bash
npm install react-h5-audio-player embla-carousel-react
```

react-h5-audio-player ships its own CSS. Import it in the component:
```js
import "react-h5-audio-player/lib/styles.css"
```

Then override with CSS custom properties targeting `.rhap_container` selector in the component's style block or a scoped CSS file.

### Alternatives Considered

| Standard | Alternative | When Alternative Makes Sense |
|----------|-------------|------------------------------|
| react-h5-audio-player | Custom `<audio>` + React | If full CSS control with zero overrides matters more than saving 2-3 hours; playbackRate would be equally easy to implement |
| embla-carousel-react | Swiper | Only if complex multi-slide layouts with thumbnails/autoplay are needed; massively over-engineered for a simple image deck |

---

## Architecture Patterns

### Recommended Project Structure (Phase 2 Additions)

```
src/
├── components/
│   ├── ActivityPanel.jsx      # MODIFY — add content routing by activity.id
│   ├── AudioPlayer.jsx        # NEW
│   └── DeckViewer.jsx         # NEW
public/
├── audio/
│   ├── 1/overview.mp3         # Extracted from NotebookLM
│   ├── 2/overview.mp3
│   └── .../
└── decks/
    ├── 1/
    │   ├── slide-1.png
    │   └── slide-2.png
    └── .../
```

### Pattern 1: ActivityPanel Content Routing

Replace the placeholder `<p>` in ActivityPanel with a switch on `activity.id`:

```jsx
// src/components/ActivityPanel.jsx
import { AudioPlayer } from "./AudioPlayer"
import { DeckViewer } from "./DeckViewer"

function renderContent(activity, moduleId, onComplete) {
  switch (activity.id) {
    case "audio":
      return <AudioPlayer moduleId={moduleId} onComplete={onComplete} />
    case "deck":
      return <DeckViewer moduleId={moduleId} onComplete={onComplete} />
    default:
      return (
        <p className="text-center py-4">
          Content coming soon — tap the checkbox above to mark complete manually.
        </p>
      )
  }
}
```

The existing `ActivityPanel` prop signature (`activity`, `moduleId`, `onComplete`) already supports this — no prop changes needed.

### Pattern 2: AudioPlayer with Playback Rate via audioRef

react-h5-audio-player has no `playbackRate` prop. Access it through the exposed ref:

```jsx
// src/components/AudioPlayer.jsx
import AudioPlayerLib from "react-h5-audio-player"
import "react-h5-audio-player/lib/styles.css"
import { useRef, useState, useCallback } from "react"

const SPEEDS = [0.5, 1, 1.25, 1.5, 2]

export function AudioPlayer({ moduleId, onComplete }) {
  const playerRef = useRef(null)
  const completedRef = useRef(false)
  const [speed, setSpeed] = useState(1)

  const handleSpeedChange = useCallback((newSpeed) => {
    setSpeed(newSpeed)
    if (playerRef.current?.audio?.current) {
      playerRef.current.audio.current.playbackRate = newSpeed
    }
  }, [])

  const handleListen = useCallback((e) => {
    const audio = e.target
    if (!completedRef.current && audio.duration > 0) {
      if (audio.currentTime / audio.duration >= 0.9) {
        completedRef.current = true
        onComplete()
      }
    }
  }, [onComplete])

  return (
    <div>
      <AudioPlayerLib
        ref={playerRef}
        src={`/audio/${moduleId}/overview.mp3`}
        onListen={handleListen}
        listenInterval={1000}
        showJumpControls={false}
        showSkipControls={false}
        layout="stacked"
        style={{ backgroundColor: "var(--bg-card)", color: "var(--text-primary)" }}
      />
      {/* Custom speed selector — rendered below the player */}
      <div className="flex gap-2 justify-center pt-2">
        {SPEEDS.map((s) => (
          <button
            key={s}
            onClick={() => handleSpeedChange(s)}
            style={{
              color: speed === s ? "var(--text-primary)" : "var(--text-muted)",
              border: speed === s ? "1px solid var(--border-accent)" : "1px solid var(--border)",
              backgroundColor: "var(--bg-card)",
            }}
            className="text-xs px-2 py-1 rounded-lg"
          >
            {s}x
          </button>
        ))}
      </div>
    </div>
  )
}
```

**Critical note:** `handleSpeedChange` must also reset `playbackRate` when the `onPlay` event fires, because some browsers reset it on play. Set it in both the button handler and `onPlay`:

```jsx
const handlePlay = useCallback(() => {
  if (playerRef.current?.audio?.current) {
    playerRef.current.audio.current.playbackRate = speed
  }
}, [speed])
```

### Pattern 3: DeckViewer with Embla Carousel

```jsx
// src/components/DeckViewer.jsx
import useEmblaCarousel from "embla-carousel-react"
import { useCallback, useEffect, useState, useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"

export function DeckViewer({ moduleId, onComplete }) {
  // slides: array of image URLs — derive from known naming convention
  const slides = buildSlideUrls(moduleId)  // see helper below
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, align: "start" })
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [zoomedSrc, setZoomedSrc] = useState(null)
  const completedRef = useRef(false)

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    const idx = emblaApi.selectedScrollSnap()
    setSelectedIndex(idx)
    if (!completedRef.current && idx === slides.length - 1) {
      completedRef.current = true
      onComplete()
    }
  }, [emblaApi, slides.length, onComplete])

  useEffect(() => {
    if (!emblaApi) return
    emblaApi.on("select", onSelect)
    return () => emblaApi.off("select", onSelect)
  }, [emblaApi, onSelect])

  return (
    <div
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") emblaApi?.scrollNext()
        if (e.key === "ArrowLeft") emblaApi?.scrollPrev()
      }}
      tabIndex={0}
    >
      <div ref={emblaRef} style={{ overflow: "hidden" }}>
        <div style={{ display: "flex" }}>
          {slides.map((src, i) => (
            <div key={i} style={{ flex: "0 0 100%", minWidth: 0 }}>
              <img
                src={src}
                alt={`Slide ${i + 1}`}
                loading="lazy"
                onClick={() => setZoomedSrc(src)}
                style={{ width: "100%", cursor: "zoom-in", borderRadius: "8px" }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Nav + counter */}
      <div className="flex items-center justify-between pt-2 px-1">
        <button onClick={() => emblaApi?.scrollPrev()}>
          <ChevronLeft size={20} />
        </button>
        <span className="text-sm" style={{ color: "var(--text-muted)" }}>
          {selectedIndex + 1} / {slides.length}
        </span>
        <button onClick={() => emblaApi?.scrollNext()}>
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Zoom modal */}
      <AnimatePresence>
        {zoomedSrc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setZoomedSrc(null)}
            style={{
              position: "fixed", inset: 0, zIndex: 50,
              backgroundColor: "rgba(0,0,0,0.85)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <img src={zoomedSrc} style={{ maxWidth: "95vw", maxHeight: "90vh", borderRadius: "8px" }} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
```

**Slide URL helper** — since slide count is not known at build time for each module, probe by attempting to load images or maintain a slide-count manifest. Recommended approach: a small JSON file at `public/decks/{moduleId}/manifest.json` containing `{ "count": 12 }`:

```js
// During content extraction, write public/decks/{moduleId}/manifest.json
// DeckViewer reads it via a fetch or inline import approach.
// Simplest: put slide count in modules.js after extraction:
// { id: 1, ..., deckSlideCount: 12 }
```

### Pattern 4: Workbox Deck Image Precaching

Add PNG glob to globPatterns so deck slide images are precached at install (they are small):

```js
// vite.config.js — workbox section
globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"]
// The existing pattern already includes *.png — deck images in public/decks/
// will be picked up automatically. Verify after content extraction with:
// npx workbox injectManifest (or check sw output for the deck paths)
```

Audio is excluded from globPatterns (no *.mp3 in the pattern) — already correct.

### Anti-Patterns to Avoid

- **Calling `play()` in a useEffect:** Breaks iOS gesture chain. Always call it from the click handler. react-h5-audio-player handles this internally — do not add a useEffect that auto-plays on mount.
- **Adding audio/position state to useProgress:** Player state is component-local only. The `onComplete` prop is the only output.
- **Precaching audio:** Workbox globPatterns already excludes mp3. Do not add it. The runtimeCaching rule handles audio.
- **Importing MP3 files via ES module `import` statement:** Puts audio into hashed asset pipeline. Always reference via URL string `/audio/{moduleId}/overview.mp3`.
- **Setting emblaApi methods in the render phase:** Always access emblaApi inside event handlers or useEffect, never during render.

---

## NotebookLM MCP Content Extraction

### Confirmed Available Tools (notebooklm-mcp server installed at `~/.claude/claude_desktop_config.json`)

| Tool | Parameters | Use |
|------|------------|-----|
| `notebook_list` | none | Discover all 8 notebook IDs |
| `notebook_get` | `notebook_id` | Get notebook details including existing artifacts |
| `studio_create` | `notebook_id`, `artifact_type`, `confirm` | Generate audio overview or slide deck artifact |
| `studio_status` | `notebook_id` | Poll generation progress |
| `download_artifact` | `notebook_id`, `artifact_type`, `output_path` | Download to disk |

### Audio Extraction Workflow

```
1. notebook_list → discover notebook IDs for modules 2-8
2. For each module notebook:
   a. studio_create(notebook_id, artifact_type="audio", confirm=True)
   b. studio_status(notebook_id) → poll until complete
   c. download_artifact(notebook_id, artifact_type="audio", output_path="public/audio/{moduleId}/overview.mp3")
3. Compress each MP3 to ~64kbps mono (ffmpeg: see below)
```

Audio compression command (required per D-04):
```bash
ffmpeg -i input.mp3 -b:a 64k -ac 1 output.mp3
```
This reduces a typical 20MB 128kbps stereo file to ~8MB.

### Deck Slide Extraction Workflow — Important Scoping Note

The notebooklm-mcp `download_artifact` for `artifact_type="slide_deck"` downloads a **PPTX file**, not individual PNG images. Extracting per-slide PNGs requires an additional step:

```
1. studio_create(notebook_id, artifact_type="slide_deck", confirm=True)
2. download_artifact(notebook_id, artifact_type="slide_deck", output_path="/tmp/{moduleId}.pptx")
3. Extract PNGs from PPTX:
   - Option A: python-pptx + Pillow (programmatic, cross-platform)
   - Option B: LibreOffice headless: libreoffice --headless --convert-to png *.pptx
   - Option C: macOS: soffice (if installed)
4. Rename outputs to slide-1.png, slide-2.png, ... and move to public/decks/{moduleId}/
5. Write public/decks/{moduleId}/manifest.json with { "count": N }
```

**Confidence:** MEDIUM — confirmed that `studio_create` supports `"slide_deck"` type and `download_artifact` is the download mechanism. The PPTX-to-PNG extraction step is standard but adds a tool dependency. Verify output format of `download_artifact` at execution time.

### Module 1 Notebook ID

Already known: `72cf9d0c-05b7-48ad-94ff-c12f20f2a6c1` (from modules.js `NOTEBOOK_ID` export and CONTEXT.md D-06).

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Audio time display, progress scrubbing | Custom `<input type="range">` + time formatting | react-h5-audio-player | Handles buffered progress, seeking before metadata load, iOS seek edge cases |
| Touch swipe detection for carousel | Custom touchstart/touchend math | embla-carousel-react | Handles drag threshold, momentum, containScroll; cross-browser |
| Zoom overlay entrance/exit animation | CSS transition class toggling | Framer Motion AnimatePresence (already installed) | Already in the project; consistent with existing panel animations |
| Audio accessibility (keyboard controls, aria) | aria-label juggling on custom buttons | react-h5-audio-player built-in | Keyboard nav and aria are handled in the library |

**Key insight:** For playback speed (AUDIO-03), hand-rolling the speed selector UI is required because the library doesn't provide it. But that selector is ~10 lines of JSX — it sets `audio.playbackRate` directly. This is not a "don't hand-roll" situation; it's intentionally simple.

---

## Common Pitfalls

### Pitfall 1: playbackRate Resets on Play

**What goes wrong:** Some browsers (notably iOS Safari) reset `audio.playbackRate` to 1 when the audio is paused and resumed. If speed state is set once and not re-applied on play, the user's speed selection silently disappears.

**How to avoid:** Set `playbackRate` in both the speed button handler AND the `onPlay` callback. Use a `useRef` or `useState` to track selected speed and re-apply it every time play starts.

**Warning signs:** Speed selector shows "1.5x" but playback is clearly at 1x after pause/resume on iPhone.

### Pitfall 2: onListen Fires After Component Unmount

**What goes wrong:** If the user opens audio panel, audio plays to 90%, then immediately closes the panel (unmount), `onListen` can fire the onComplete callback after unmount, causing a React state update on an unmounted component warning.

**How to avoid:** Use a `completedRef` (not state) to gate the onComplete call. Since refs don't trigger re-renders, this is safe across the unmount boundary. Additionally, the `<audio>` element stops when the component unmounts so this is a narrow window, but the ref guard is the correct pattern.

### Pitfall 3: Embla API Not Available on First Render

**What goes wrong:** `emblaApi` returned by `useEmblaCarousel` is `undefined` until after the first DOM paint. Calling `emblaApi.selectedScrollSnap()` in the render phase (e.g., to initialize state) throws.

**How to avoid:** Always guard with `if (!emblaApi) return`. Register all event listeners in a `useEffect` that depends on `[emblaApi]`. The onSelect callback pattern shown in Pattern 3 above handles this correctly.

### Pitfall 4: Deck Images Not in Workbox Precache

**What goes wrong:** Deck images are in `public/decks/` but Workbox's globPatterns targets `**/*.png` relative to the build output. If images are not present at build time (content extraction not yet done), they won't be in the precache manifest. D-22 requires all deck images to be precached.

**How to avoid:** Content extraction (CONT-02) must run and commit images to the repo BEFORE the Workbox build for those images to appear in the precache manifest. Plan content extraction as Wave 0 so images exist before component implementation begins.

### Pitfall 5: Existing ActivityPanel Test Breaks on Placeholder Text Change

**What goes wrong:** `src/__tests__/ActivityPanel.test.jsx` line 50 explicitly asserts `screen.getByText(/Content coming in Phase/)`. When the placeholder is replaced with actual content routing, this test will fail (correctly — it's testing the placeholder that no longer exists).

**How to avoid:** Update the ActivityPanel test as part of the same task that updates `ActivityPanel.jsx`. The new test should assert that the AudioPlayer renders when `activity.id === "audio"` and DeckViewer when `activity.id === "deck"`. Keep the test for the default fallback placeholder for unimplemented activity types.

### Pitfall 6: Missing Slide Count — DeckViewer Can't Build URL Array

**What goes wrong:** `DeckViewer` needs to know how many slides exist to build the `slides` array of URLs (`/decks/1/slide-1.png` through `/decks/1/slide-12.png`). If there is no manifest file or modules.js field with slide count, the component can't render without a fetch.

**How to avoid:** During content extraction, write `public/decks/{moduleId}/manifest.json` with `{ "count": N }` and also add `deckSlideCount` to each module entry in `modules.js`. The ActivityPanel can pass `slideCount` as a prop to DeckViewer, keeping it a pure static render with no fetch.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.2 + @testing-library/react 16.3.2 |
| Config file | `vite.config.js` (test block: environment jsdom, globals true) |
| Setup file | `src/__tests__/setup.js` (imports @testing-library/jest-dom) |
| Quick run command | `npm test` |
| Full suite command | `npm test` |

All 23 existing tests pass (verified 2026-03-29).

### Phase Requirements to Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| AUDIO-01 | AudioPlayer renders play/pause button | unit | `npm test -- --reporter=verbose` | ❌ Wave 0 |
| AUDIO-02 | AudioPlayer shows time display and scrub bar | unit | `npm test` | ❌ Wave 0 |
| AUDIO-03 | Speed selector buttons present; clicking 1.5x sets audio.playbackRate | unit | `npm test` | ❌ Wave 0 |
| AUDIO-04 | onComplete fires when currentTime/duration >= 0.9; fires only once | unit | `npm test` | ❌ Wave 0 |
| AUDIO-05 | Audio src uses /audio/{moduleId}/overview.mp3 path (not hashed asset) | unit | `npm test` | ❌ Wave 0 |
| DECK-01 | DeckViewer renders prev/next buttons and first slide image | unit | `npm test` | ❌ Wave 0 |
| DECK-02 | Slide counter displays "1 / N" on mount, "2 / N" after scrollNext | unit | `npm test` | ❌ Wave 0 |
| DECK-03 | Clicking an image sets zoomedSrc; modal overlay renders | unit | `npm test` | ❌ Wave 0 |
| DECK-04 | onComplete fires when last slide is reached; fires only once | unit | `npm test` | ❌ Wave 0 |
| DECK-05 | ArrowRight keydown calls scrollNext; ArrowLeft calls scrollPrev | unit | `npm test` | ❌ Wave 0 |
| CONT-01 | Audio files exist at public/audio/{1-8}/overview.mp3 | smoke (manual) | `ls public/audio/*/overview.mp3` | ❌ manual |
| CONT-02 | Deck images exist at public/decks/{1-8}/slide-*.png | smoke (manual) | `ls public/decks/*/slide-*.png` | ❌ manual |
| PWA-03 | Audio plays after offline; runtimeCaching in sw output | smoke (manual/device) | Chrome DevTools → offline mode | ❌ manual |

**Note on PANEL test update:**
The existing `ActivityPanel.test.jsx` has an assertion on `/Content coming in Phase/` (line 50). This will break when placeholder is replaced with content routing. Include this test update in the Wave 1 ActivityPanel routing task — replace the placeholder assertion with a test that the default fallback renders for activity.id === "flashcards" (not yet implemented).

### Sampling Rate

- **Per task commit:** `npm test`
- **Per wave merge:** `npm test`
- **Phase gate:** All tests green + manual smoke test (audio plays offline on device) before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `src/__tests__/AudioPlayer.test.jsx` — covers AUDIO-01 through AUDIO-05
- [ ] `src/__tests__/DeckViewer.test.jsx` — covers DECK-01 through DECK-05
- [ ] Update `src/__tests__/ActivityPanel.test.jsx` — replace placeholder assertion with content routing assertions

*(Existing test infrastructure and framework already in place — only test files are missing.)*

---

## Code Examples

### react-h5-audio-player: Ref Access Pattern

```jsx
// Source: github.com/lhz516/react-h5-audio-player (v3.10.2 README)
import AudioPlayer from "react-h5-audio-player"
import "react-h5-audio-player/lib/styles.css"

const playerRef = createRef()
// After mount:
// playerRef.current.audio.current   → the native HTMLAudioElement
// playerRef.current.audio.current.playbackRate = 1.5
```

### react-h5-audio-player: CSS Override Pattern

```css
/* Override SASS variables via CSS targeting the component's class */
.rhap_container {
  background-color: var(--bg-card);
  box-shadow: none;
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 12px;
}
.rhap_time {
  color: var(--text-muted);
  font-size: 12px;
}
.rhap_progress-filled,
.rhap_volume-bar {
  background-color: var(--phase-color, #b07ff5);
}
.rhap_button-clear {
  color: var(--text-primary);
}
```

### embla-carousel-react: Minimal Working Pattern

```jsx
// Source: embla-carousel.com/docs/get-started/react (verified 2026-03-29)
import useEmblaCarousel from "embla-carousel-react"
import { useEffect, useCallback } from "react"

function Carousel({ slides }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false })

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    console.log("current index:", emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    emblaApi.on("select", onSelect)
    return () => emblaApi.off("select", onSelect)
  }, [emblaApi, onSelect])

  return (
    <div ref={emblaRef} style={{ overflow: "hidden" }}>
      <div style={{ display: "flex" }}>
        {slides.map((src, i) => (
          <div key={i} style={{ flex: "0 0 100%", minWidth: 0 }}>
            <img src={src} loading="lazy" />
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| react-slick for carousels | embla-carousel-react | Lighter bundle, no jQuery dependency, accessible |
| Swiper for simple decks | embla-carousel-react | Swiper is 40kB+ for simple use case; embla is ~7kB |
| Custom HTML5 audio controls | react-h5-audio-player | Saves 2-3 hours; accessible keyboard/screen reader controls built in |

**Note on react-h5-audio-player playbackRate:** This is a known missing feature in the library. Community discussions suggest accessing `audio.current` directly is the standard workaround. No open PR or release notes indicate a native prop is planned as of v3.10.2.

---

## Open Questions

1. **Deck slide count per module**
   - What we know: Slide count is unknown until extraction runs
   - What's unclear: Whether to use a manifest.json approach or add deckSlideCount to modules.js
   - Recommendation: Add `deckSlideCount` to each module entry in modules.js after extraction. Simpler than a fetch. Pass it as a prop from ActivityPanel.

2. **ffmpeg availability on dev machine**
   - What we know: ffmpeg is needed for audio compression (D-04)
   - What's unclear: Whether ffmpeg is already installed
   - Recommendation: Add ffmpeg install verification as the first step in the content extraction task. If unavailable, use Homebrew: `brew install ffmpeg`.

3. **NotebookLM audio overview generation vs. existing**
   - What we know: Module 1 notebook ID is known; modules 2-8 IDs need discovery via `notebook_list`
   - What's unclear: Whether audio overviews already exist in the notebooks (need to check `studio_status`) or need to be generated fresh
   - Recommendation: First task checks `notebook_get` for each notebook to see if audio artifacts exist before triggering `studio_create`.

4. **embla-carousel-react React 19 compatibility**
   - What we know: Embla v8 targets React 18+; React 19 is backward-compatible
   - What's unclear: Any specific breaking behavior with React 19's concurrent features
   - Recommendation: Verify at `npm install` time that no peer dependency warnings appear. Embla is a DOM library with minimal React coupling — incompatibility is LOW probability.

---

## Sources

### Primary (HIGH confidence)
- `package.json` — confirmed React 19.2.4, Framer Motion 12.38.0, Vitest 4.1.2, no audio/carousel packages installed yet
- `vite.config.js` — confirmed Workbox runtimeCaching for `/audio/.+` with CacheFirst already in place; globPatterns excludes mp3
- `src/components/ActivityPanel.jsx` — confirmed current prop signature, existing AnimatePresence structure, placeholder to replace
- `src/pages/ModuleDetail.jsx` — confirmed onComplete wiring, handlePanelToggle, isOpen prop already passed
- `src/__tests__/ActivityPanel.test.jsx` — confirmed which test assertions will break on placeholder removal
- `npm info react-h5-audio-player version` → `3.10.2` (verified live)
- `npm info embla-carousel-react version` → `8.6.0` (verified live)
- `~/.claude/claude_desktop_config.json` — confirmed notebooklm-mcp server is installed and configured

### Secondary (MEDIUM confidence)
- github.com/lhz516/react-h5-audio-player — README confirms no built-in playbackRate prop; audioRef.current.audio.current exposure confirmed
- github.com/jacob-bd/notebooklm-mcp-cli docs/MCP_GUIDE.md — tool names `notebook_list`, `studio_create`, `download_artifact`, `studio_status` and parameters confirmed
- embla-carousel.com/docs/get-started/react — useEmblaCarousel hook, scrollNext/scrollPrev, onSelect event pattern confirmed
- WebSearch cross-references for embla selectedScrollSnap() usage pattern

### Tertiary (LOW confidence — needs verification at execution time)
- slide_deck artifact output format from download_artifact (confirmed type exists; assumed PPTX, verify at extraction time)
- iOS Safari playbackRate reset behavior on pause/resume (well-documented pattern, but verify on physical device)

---

## Metadata

**Confidence breakdown:**
- Standard stack (react-h5-audio-player, embla): HIGH — versions verified live with npm info
- AudioPlayer implementation pattern: HIGH — library README confirms audioRef exposure mechanism
- playbackRate workaround: HIGH — directly accessing HTMLAudioElement.playbackRate is web platform standard
- DeckViewer Embla pattern: HIGH — hook API confirmed from official docs
- NotebookLM MCP tools: MEDIUM — tool names and params confirmed from MCP guide; PPTX output format is assumption (verify at run time)
- iOS audio pitfalls: HIGH — stable, well-documented browser behavior

**Research date:** 2026-03-29
**Valid until:** 2026-04-29 (react-h5-audio-player and embla are stable libraries; MCP tools could change faster)
