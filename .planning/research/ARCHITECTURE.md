# Architecture Research

**Domain:** Embedded learning content in an existing React 19 + Vite PWA
**Researched:** 2026-03-28
**Confidence:** HIGH (derived from direct codebase analysis + well-established patterns for this stack)

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                          App Shell (App.jsx)                         │
│         useProgress ──────────────────── useSync                    │
│              │ (prop-drill progress object)      │ (Supabase sync)  │
├─────────────┬───────────────────────┬───────────────────────────────┤
│  Dashboard  │     ModuleDetail      │         Settings              │
│   (/)       │   (/module/:id)       │        (/settings)            │
│             │                       │                               │
│             │  ┌─────────────────┐  │                               │
│             │  │ ActivityPanel   │  │                               │
│             │  │ (new container) │  │                               │
│             │  │  ┌───────────┐  │  │                               │
│             │  │  │ Audio-    │  │  │                               │
│             │  │  │ Player    │  │  │                               │
│             │  │  ├───────────┤  │  │                               │
│             │  │  │ Deck      │  │  │                               │
│             │  │  │ Carousel  │  │  │                               │
│             │  │  ├───────────┤  │  │                               │
│             │  │  │ Flash-    │  │  │                               │
│             │  │  │ cards     │  │  │                               │
│             │  │  ├───────────┤  │  │                               │
│             │  │  │ Quiz      │  │  │                               │
│             │  │  ├───────────┤  │  │                               │
│             │  │  │ Teach-    │  │  │                               │
│             │  │  │ Back      │  │  │                               │
│             │  │  └───────────┘  │  │                               │
│             │  └─────────────────┘  │                               │
└─────────────┴───────────────────────┴───────────────────────────────┘
              │               │                  │
┌─────────────┴───────────────┴──────────────────┴──────────────────┐
│                          Data Layer                                 │
│  src/data/modules.js     src/data/content/[moduleId]/              │
│  (curriculum definition) (audio, images, flashcards.json,          │
│                           quiz.json)                               │
├─────────────────────────────────────────────────────────────────────┤
│                       Persistence Layer                             │
│   localStorage (primary)          Supabase (optional sync)         │
│   progress state only             progress state only              │
│   content is static assets        content is never synced          │
├─────────────────────────────────────────────────────────────────────┤
│                       External Services                             │
│   Claude API proxy                Service Worker cache             │
│   (Teach-Back only, online)       (all static assets, offline)     │
└─────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | New or Existing |
|-----------|----------------|-----------------|
| `ModuleDetail` | Route shell, passes module content to ActivityPanel | Existing — extend |
| `ActivityPanel` | Container that selects and renders the correct interactive component for an activity | New |
| `AudioPlayer` | Plays a single bundled audio file, exposes play/pause/progress UI, marks complete on finish | New |
| `DeckCarousel` | Displays ordered image slides with swipe/tap navigation | New |
| `FlashcardDeck` | Renders Q/A flip cards, tracks per-card correct/incorrect, shows final score | New |
| `QuizEngine` | Renders multiple-choice questions from JSON, grades answers, shows result | New |
| `TeachBack` | Manages voice/text conversation with Claude API proxy; graceful offline fallback | New |
| `useContentScore` | Hook: local state for session score/attempts; writes to `localStorage` via storage.js | New |
| `src/data/modules.js` | Curriculum definition; gains `notebookId` and `contentPath` per module | Existing — extend |
| `src/data/content/` | Static asset folder: per-module subfolders with audio, images, JSON | New |
| Claude API proxy | Edge function or lightweight server that holds the API key, forwards requests | New (external) |

## Recommended Project Structure

```
src/
├── components/
│   ├── ActivityCheckbox.jsx     # existing
│   ├── ActivityPanel.jsx        # NEW — selects and renders content component
│   ├── AudioPlayer.jsx          # NEW
│   ├── DeckCarousel.jsx         # NEW
│   ├── FlashcardDeck.jsx        # NEW
│   ├── QuizEngine.jsx           # NEW
│   ├── TeachBack.jsx            # NEW
│   └── ...existing components
├── hooks/
│   ├── useProgress.js           # existing — gains `deck` key, drops `mindmap` key
│   ├── useSync.js               # existing — unchanged
│   └── useContentScore.js       # NEW — session score state for flashcards/quiz
├── data/
│   ├── modules.js               # existing — gains notebookId, contentPath per module
│   └── content/
│       ├── 1/                   # Module 1: What is AI?
│       │   ├── audio.mp3
│       │   ├── deck/
│       │   │   ├── slide-01.jpg
│       │   │   └── slide-02.jpg
│       │   ├── flashcards.json
│       │   └── quiz.json
│       ├── 2/                   # Module 2: ML Essentials
│       │   └── ...
│       └── .../                 # Modules 3–8
├── utils/
│   ├── storage.js               # existing — DEFAULT_STATE gains `deck`, removes `mindmap`
│   ├── supabase.js              # existing — unchanged
│   └── teachback.js             # NEW — thin wrapper around Claude API proxy fetch
└── pages/
    ├── ModuleDetail.jsx         # existing — gains ActivityPanel in place of bare checkbox list
    └── ...existing pages
```

### Structure Rationale

- **`src/data/content/`:** Co-located with source, not `public/`. Vite processes imports of JSON, and audio/image files are referenced via import paths, letting Vite handle fingerprinting and the service worker's precache manifest pick them up automatically.
- **`ActivityPanel`:** Keeps `ModuleDetail` clean. The panel receives an `activity` object and `moduleId`, resolves the right component, and owns open/closed expand state. `ModuleDetail` does not need to know about the internals of any content type.
- **`useContentScore`:** Separates transient session state (quiz score, flashcard pass/fail) from durable progress state (`useProgress`). Scores are local-only and reset on component unmount; only the binary "completed" flag propagates to `useProgress`.

## Architectural Patterns

### Pattern 1: Expand-in-Place Activity Panel

**What:** Each activity row in `ModuleDetail` expands inline to show its interactive component when tapped, rather than navigating to a new route.

**When to use:** The app is a mobile-first single-page PWA with slide transitions. Opening a sub-route for each activity adds transition complexity and breaks the back-button UX. Expand-in-place keeps the user in context and avoids new route definitions.

**Trade-offs:** Slightly more DOM on screen when expanded; simpler routing and better UX for a phone-width layout.

**Example:**
```jsx
// ActivityPanel.jsx
function ActivityPanel({ activity, moduleId, checked, onToggle, phaseColor }) {
  const [open, setOpen] = useState(false);

  const contentMap = {
    audio:      <AudioPlayer   src={`/data/content/${moduleId}/audio.mp3`} onComplete={() => onToggle()} />,
    deck:       <DeckCarousel  moduleId={moduleId} onComplete={() => onToggle()} />,
    flashcards: <FlashcardDeck moduleId={moduleId} onComplete={() => onToggle()} />,
    quiz:       <QuizEngine    moduleId={moduleId} onComplete={() => onToggle()} />,
    teachback:  <TeachBack     moduleId={moduleId} onComplete={() => onToggle()} />,
  };

  return (
    <div>
      <ActivityCheckbox activity={activity} checked={checked} onToggle={() => setOpen(o => !o)} phaseColor={phaseColor} />
      <AnimatePresence>
        {open && (
          <motion.div key="panel" initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}>
            {contentMap[activity.id]}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

### Pattern 2: Completion Callback Propagation

**What:** Each content component receives an `onComplete` callback. When the user finishes the activity (audio ends, quiz submitted, all flashcards reviewed), the component calls `onComplete()`. `ActivityPanel` relays this to `ModuleDetail.handleToggle`, which calls `useProgress.toggleActivity`.

**When to use:** Keeps content components unaware of the progress system. A `FlashcardDeck` should not import `useProgress` — it just signals "done."

**Trade-offs:** Minor prop threading; significantly better separation of concerns than letting content components write to localStorage directly.

### Pattern 3: Vite Static Asset Import for Content

**What:** Audio and image files are imported via relative ES module paths in `modules.js` (or a per-module content manifest). Vite resolves these at build time, applies content-hash fingerprinting, and emits them to `dist/`. The `vite-plugin-pwa` workbox config picks up all emitted assets for precaching.

**When to use:** Required for correct service worker precaching of audio files. Files placed in `public/` bypass Vite's asset pipeline and must be manually added to the `globPatterns` in `workbox` config — error-prone with 8 modules of audio.

**Trade-offs:** Build takes longer with large audio files; bundle analysis tool (`vite-bundle-visualizer`) is helpful. Alternatively, keep audio in `public/audio/` and add `**/*.mp3` to `workbox.globPatterns` — simpler but requires manual maintenance of the glob list.

**Recommendation:** Put audio in `public/audio/[moduleId]/audio.mp3` and JSON/images through Vite imports. Audio files are large binary blobs that don't benefit from fingerprinting in the same way JS/CSS do — `public/` is cleaner for them and the glob pattern is trivial to maintain.

```js
// vite.config.js workbox update
workbox: {
  globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2,mp3}"],
  runtimeCaching: [
    {
      urlPattern: /\/audio\/.+\.mp3$/,
      handler: "CacheFirst",
      options: {
        cacheName: "audio-cache",
        expiration: { maxEntries: 20 },
      },
    },
  ],
},
```

## Data Flow

### Activity Completion (Content Path)

```
User finishes AudioPlayer / Quiz / Flashcards
    ↓
content component calls onComplete()
    ↓
ActivityPanel relays to ModuleDetail.handleToggle(activityId)
    ↓
ModuleDetail.handleToggle → progress.toggleActivity(moduleId, activityId)
    ↓
useProgress.toggleActivity → setState → saveProgress(localStorage)
    ↓
useSync detects state change → debounced Supabase push (if sync enabled)
    ↓
Updated state prop flows down: App → ModuleDetail → ActivityPanel → ActivityCheckbox
```

### Flashcard / Quiz Score State

```
User answers card/question
    ↓
useContentScore.recordAnswer(correct: boolean)
    ↓
Local React state updates (correct count, attempt count)
    ↓
Score displayed in component UI (session only)
    ↓
On session complete → onComplete() called → binary "done" flag enters useProgress
    ↓
Score is discarded on unmount — not persisted
```

**Rationale:** Scores are motivational feedback, not durable data. The progress model tracks *completion* of activities, not performance. Storing scores would require a data model change with no user-facing benefit in the current product scope.

### Teach-Back API Flow

```
User speaks/types response in TeachBack component
    ↓
teachback.js sendMessage(moduleId, userInput)
    ↓
POST /api/teachback  (Claude API proxy — not client-side)
    ↓
Proxy attaches Authorization: Bearer [API_KEY], forwards to Claude API
    ↓
Claude response streamed back to client
    ↓
TeachBack renders response, user continues or ends session
    ↓
User taps "Mark Complete" → onComplete() called
```

**Offline handling:** `TeachBack` checks `navigator.onLine` on mount and after each network error. If offline, it renders a "Teach-Back needs an internet connection" card in place of the conversation UI. No partial degradation — it is all-or-nothing.

### Data Model Evolution

**Current `completed` shape per module:**
```js
{ audio: false, mindmap: false, flashcards: false, quiz: false, teachback: false }
```

**Required change:** rename `mindmap` → `deck`

```js
{ audio: false, deck: false, flashcards: false, quiz: false, teachback: false }
```

**Migration strategy:** Add a one-time migration in `loadProgress()`:
```js
// storage.js — inside loadProgress, after JSON.parse
if (parsed.completed) {
  Object.values(parsed.completed).forEach(mod => {
    if ("mindmap" in mod && !("deck" in mod)) {
      mod.deck = mod.mindmap;
      delete mod.mindmap;
    }
  });
}
```

This runs on first load after deployment and writes forward-compatible state. No localStorage key change needed.

**Module content data extension in `modules.js`:**
```js
{
  id: 1,
  title: "What is AI?",
  // ... existing fields ...
  notebookId: "72cf9d0c-05b7-48ad-94ff-c12f20f2a6c1",
  content: {
    audioSrc: "/audio/1/audio.mp3",
    deckImages: ["/content/1/deck/slide-01.jpg", "/content/1/deck/slide-02.jpg"],
    flashcardsFile: "/content/1/flashcards.json",
    quizFile: "/content/1/quiz.json",
  }
}
```

Content components receive `module.content` as a prop from `ActivityPanel`. No component fetches content independently.

## Scaling Considerations

This is a personal-use PWA. Scale is irrelevant. The relevant constraint is **bundle size**.

| Concern | Current | After Content Addition | Mitigation |
|---------|---------|----------------------|------------|
| JS bundle | Small (~150KB est.) | Unchanged for new components | Components are simple |
| Audio files | None | 8 × ~5-20MB = 40-160MB | Service worker CacheFirst; large files load on demand, not precached at install |
| Images (deck slides) | None | 8 modules × ~10 images × ~200KB = ~16MB | Lazy load via `loading="lazy"` on `<img>` |
| JSON content | None | Negligible (~100KB total) | Bundled via Vite import |
| localStorage | ~2KB | Unchanged | Scores not persisted |

**Audio caching decision:** Do NOT add audio to `workbox.globPatterns` for precaching at install time. 40-160MB would be downloaded on first install, which is a terrible experience on mobile. Use `runtimeCaching` with `CacheFirst` so audio files are cached the first time a user plays them, then available offline forever after.

## Anti-Patterns

### Anti-Pattern 1: Content Components Writing Directly to useProgress

**What people do:** Import `useProgress` (or a progress context) inside `AudioPlayer` or `QuizEngine` to call `toggleActivity` directly.

**Why it is wrong:** Creates hidden coupling. Content components become aware of the progress model. Swapping the progress store, testing components in isolation, or reordering completion logic all become harder.

**Do this instead:** Each content component receives `onComplete` as a prop. `ActivityPanel` owns the wiring between completion signals and the progress hook.

### Anti-Pattern 2: Precaching Audio at Service Worker Install

**What people do:** Add `**/*.mp3` to `workbox.globPatterns` to ensure offline access from first launch.

**Why it is wrong:** Workbox precaches the entire glob at service worker install time. 8 audio files at 5-20MB each = potentially 160MB downloaded silently in the background on first visit. This triggers browser storage quotas, kills mobile data plans, and makes the "installed" experience feel broken.

**Do this instead:** Use `runtimeCaching` with `CacheFirst` strategy. Audio is cached on first play and served from cache on subsequent plays. Offline playback works after the user has played the file once.

### Anti-Pattern 3: Storing the Claude API Key in the Client Bundle

**What people do:** Put `VITE_CLAUDE_API_KEY=...` in `.env` and call the Claude API directly from `TeachBack.jsx`.

**Why it is wrong:** Any `VITE_` prefixed variable is embedded in the built JS bundle and readable by anyone who opens DevTools. The key will be compromised.

**Do this instead:** The client calls a proxy endpoint (e.g., a Cloudflare Worker, Netlify Function, or Vercel Edge Function) that holds the key in a server-side environment variable. The proxy validates the request and forwards it to the Claude API. The client never sees the key.

### Anti-Pattern 4: Separate Route per Activity

**What people do:** Add routes like `/module/:id/audio`, `/module/:id/quiz` to give each content type its own page.

**Why it is wrong:** Six new routes per module × 8 modules = 40+ route definitions. Each route needs its own transition animation, back-button handling, and scroll restoration. On a mobile PWA this multiplies navigation complexity for no UX benefit — the module detail page is already the right scope.

**Do this instead:** Expand-in-place within `ModuleDetail` (see Pattern 1 above).

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Claude API | POST to a proxy endpoint (not directly) | Proxy holds API key; client sends `{ moduleId, history, userMessage }` |
| Supabase | Existing `useSync` hook — no changes needed | Content is never synced; only the `completed` object needs the `mindmap → deck` rename handled in merge strategy |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| `ModuleDetail` ↔ `ActivityPanel` | Props: `activity`, `moduleId`, `checked`, `onToggle`, `phaseColor` | Panel does not receive the whole `progress` object — only what it needs |
| `ActivityPanel` ↔ content components | Props: content source refs, `onComplete` callback | Content components are stateless except for session UI state |
| `ActivityPanel` ↔ `useProgress` | Via `onToggle` prop from `ModuleDetail` | Panel never imports `useProgress` directly |
| `TeachBack` ↔ Claude proxy | `fetch` POST with JSON body | `teachback.js` util wraps this; `TeachBack` component calls the util |
| `useContentScore` ↔ content components | Hook used locally in `FlashcardDeck` and `QuizEngine` | Not lifted to `App.jsx`; score is session-local |

## Suggested Build Order

Dependencies drive this order. Each step can be built and tested independently before the next.

1. **Data model migration** — rename `mindmap → deck` in `storage.js`, `useProgress.js`, and `modules.js`. Update `resetAll()` in `useProgress`. Verify existing tests (if any) pass. This is a blocking dependency for everything else.

2. **Static content scaffolding** — create `src/data/content/` folder structure, add placeholder files for one module (Module 1). Verify Vite builds without errors. Update `workbox` config for audio runtime caching. This unblocks all content components.

3. **`ActivityPanel` shell** — implement the expand/collapse container with `AnimatePresence`. Wire it into `ModuleDetail` in place of the bare `ActivityCheckbox` list. Use the existing `ActivityCheckbox` inside the panel. Verify toggle still works and progress saves correctly.

4. **`AudioPlayer`** — simplest content component. Uses native HTML5 `<audio>` element. `onComplete` fires when `onEnded` fires or user taps a "Mark done" button. Test offline playback with a cached file.

5. **`DeckCarousel`** — image array from `module.content.deckImages`. Swipe navigation via touch events or a simple left/right button. `onComplete` when user reaches the last slide or taps "Done."

6. **`FlashcardDeck` + `useContentScore`** — renders flashcards from JSON. `useContentScore` hook manages correct/incorrect tallies. `onComplete` after last card reviewed.

7. **`QuizEngine`** — renders multiple-choice questions from JSON. Grades on submit. Shows result screen. `onComplete` after result acknowledged.

8. **Claude API proxy** — implement proxy (Cloudflare Worker recommended for GitHub Pages deployments; no server needed). Confirm `CORS`, `Authorization` header handling, and rate-limit response shape.

9. **`TeachBack`** — implement conversation UI. Wire to `teachback.js` util. Add offline detection and fallback card. `onComplete` on user confirmation.

10. **Service worker audit** — run Lighthouse PWA audit with content assets present. Confirm audio is not precached at install. Confirm flashcard/quiz JSON and images are precached.

## Sources

- Direct codebase analysis: `/Users/philiy/Developer/ai-tracker/src/` (2026-03-28)
- `vite-plugin-pwa` workbox `runtimeCaching` pattern — HIGH confidence, standard vite-plugin-pwa API
- HTML5 `<audio>` element for audio playback — HIGH confidence, web platform standard
- Cloudflare Workers as Claude API proxy for static hosting — MEDIUM confidence (pattern is well-established; specific Workers pricing/limits should be verified before implementation)
- `mindmap → deck` migration pattern in `loadProgress` — HIGH confidence, mirrors existing DEFAULT_STATE merge pattern already in `storage.js`

---
*Architecture research for: Embedded learning content — AI Fundamentals Tracker PWA*
*Researched: 2026-03-28*
