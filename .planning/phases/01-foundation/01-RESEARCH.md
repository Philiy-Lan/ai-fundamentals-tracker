# Phase 1: Foundation - Research

**Researched:** 2026-03-28
**Domain:** React 19 + Vite 8 PWA — data model migration, Framer Motion expand-in-place, Workbox runtimeCaching, static content data scaffolding
**Confidence:** HIGH — all findings derived from direct codebase analysis and established framework patterns

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Data Migration (mindmap → deck)**
- D-01: Rename all `mindmap` references to `deck` in modules.js activities array (id, label, icon)
- D-02: Update DEFAULT_STATE in storage.js to use `deck` key instead of `mindmap`
- D-03: Add one-time migration in `loadProgress()` — if parsed data contains `mindmap` keys in any module's completed object, copy value to `deck` key and delete `mindmap`. Matches the existing merge pattern already in storage.js.
- D-04: Update useProgress.js `resetAll` to use `deck` instead of `mindmap`
- D-05: Update useSync.js `mergeProgress` to handle `deck` key (the "true wins" merge strategy applies unchanged)
- D-06: Update ActivityCheckbox and any component that references the `mindmap` activity id
- D-07: Update the Deck activity icon from `GitBranch` to `Layers` or `ImageIcon` (more appropriate for image slides)

**ActivityPanel Interaction**
- D-08: ActivityPanel expands in-place below the activity row when tapped — no modal, no new route
- D-09: Only one ActivityPanel can be open at a time (tapping another closes the current one)
- D-10: Use Framer Motion `AnimatePresence` + `motion.div` with height animation for smooth expand/collapse
- D-11: ActivityPanel receives `moduleId`, `activityId`, and an `onComplete` callback prop
- D-12: The `onComplete` callback calls `toggleActivity(moduleId, activityId)` from useProgress
- D-13: For Phase 1, expanded panel shows a placeholder ("Content coming in Phase 2/3")

**Content Data Structure**
- D-14: Create `src/data/content/` directory for all learning content data
- D-15: Flashcard data: `src/data/content/flashcards.js` — exports object keyed by moduleId, array of `{ question, answer }`
- D-16: Quiz data: `src/data/content/quizzes.js` — exports object keyed by moduleId, array of `{ question, options: string[], correctIndex: number }`
- D-17: Teach-Back prompts: `src/data/content/teachback.js` — exports object keyed by moduleId, array of `{ prompt, conceptArea }`
- D-18: Audio and deck image files in `public/audio/{moduleId}/` and `public/decks/{moduleId}/` — empty directories in Phase 1

**Workbox Audio Caching**
- D-19: Add runtimeCaching entry in vite.config.js PWA config for `audio/**` pattern with CacheFirst strategy
- D-20: Do NOT add audio files to `globPatterns` (precache manifest)
- D-21: Set maxEntries and maxAgeSeconds on the audio cache to prevent unbounded growth

### Claude's Discretion
- Exact Framer Motion animation parameters for ActivityPanel (duration, easing)
- Placeholder content text for the Phase 1 ActivityPanel stub
- Whether to use `Images` or `Layers` icon for the renamed Deck activity
- Cache maxEntries and maxAgeSeconds values for audio runtime cache

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DATA-01 | Rename "Mind Map" activity to "Deck" across modules.js, storage.js, useProgress.js | Exact file locations, line-level targets, and migration code pattern documented below |
| DATA-02 | Migrate existing localStorage progress data from mindmap → deck keys | One-time migration in loadProgress() using existing merge pattern; no localStorage key change required |
| DATA-03 | Create content data structures for flashcards (JSON per module with question/answer pairs) | Data shape, file location, and scaffold pattern documented; JS module export pattern identified |
| DATA-04 | Create content data structures for quizzes (JSON per module with questions, options, correct answer) | Data shape, file location, and scaffold pattern documented |
| DATA-05 | Create content data structures for Teach-Back prompts (concept explanation prompts per module) | Data shape, file location, and scaffold pattern documented |
| PANEL-01 | Build ActivityPanel expand-in-place container within ModuleDetail | Component interface, state management pattern (openId lifted to ModuleDetail), and JSX structure documented |
| PANEL-02 | ActivityPanel expands/collapses with animation when user taps an activity | Framer Motion `AnimatePresence` + `motion.div` height animation — recommended params documented |
| PANEL-03 | Shared onComplete callback that fires toggleActivity(moduleId, activityId) for all content components | Wiring path: content component → onComplete prop → ModuleDetail.handleToggle → toggleActivity documented |
| PWA-01 | Service worker updated with Workbox runtimeCaching for audio files (CacheFirst strategy) | Exact vite.config.js runtimeCaching config block documented; globPatterns exclusion of audio confirmed |
</phase_requirements>

---

## Summary

Phase 1 is a pure scaffolding and migration phase — no new interactive features ship, but it establishes every structural foundation that Phases 2-4 mount onto. The work divides into three independent tracks that can be executed sequentially: (1) rename `mindmap` to `deck` across five specific files, (2) create the ActivityPanel component with placeholder content and wire it into ModuleDetail, and (3) add runtimeCaching for audio to vite.config.js and scaffold content data files.

The data migration is the highest-risk item: existing user progress stored in localStorage uses the `mindmap` key, and the migration must copy those values to `deck` on first load after deployment. The migration pattern is trivial to implement correctly using the existing `loadProgress()` try/catch structure, but must be verified end-to-end with actual browser localStorage before the phase is considered complete.

The ActivityPanel's "only one open at a time" constraint (D-09) means open state must be lifted to ModuleDetail, not owned per-panel. This is the key architectural decision for the component: ModuleDetail holds an `openActivityId` state and passes it down.

**Primary recommendation:** Execute in order — data migration first (blocking nothing but itself), then ActivityPanel (depends on renamed activity ids), then content scaffolds and Workbox config (independent of each other).

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| framer-motion | 12.38.0 (installed) | Height animate for expand/collapse panel | Already used in project for page transitions — same `AnimatePresence` + `motion.div` pattern |
| vite-plugin-pwa | 1.2.0 (installed) | Workbox runtimeCaching config | Already the project's PWA plugin — `workbox.runtimeCaching` is its native config surface |
| lucide-react | 0.577.0 (installed) | `Images` icon for renamed Deck activity | Already used throughout — `Images` icon present in this version |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| React useState | (React 19.2.4) | `openActivityId` state in ModuleDetail | Lifting panel open state to parent for single-open constraint |
| React useCallback | (React 19.2.4) | Wrap `handleToggle` and `handlePanelToggle` in ModuleDetail | Existing pattern in ModuleDetail — follow it |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `Images` icon for Deck | `Layers` | `Layers` is already used for flashcards activity — creates visual ambiguity between Deck and Flashcards activities in the list |
| CacheFirst for audio | NetworkFirst | NetworkFirst would re-fetch audio on every play even when cached — defeats offline-first goal |

**Installation:** No new packages required. All dependencies already installed.

---

## Architecture Patterns

### Recommended Project Structure Changes

```
src/
├── components/
│   ├── ActivityCheckbox.jsx     # existing — ICON_MAP gains Images, loses GitBranch
│   └── ActivityPanel.jsx        # NEW — Phase 1 scaffold with placeholder content
├── data/
│   ├── modules.js               # existing — mindmap → deck rename in all 8 activities arrays
│   └── content/
│       ├── flashcards.js        # NEW — scaffold with module 1 example data
│       ├── quizzes.js           # NEW — scaffold with module 1 example data
│       └── teachback.js         # NEW — scaffold with module 1 example prompts
├── hooks/
│   └── useProgress.js           # existing — resetAll() mindmap → deck
├── utils/
│   └── storage.js               # existing — DEFAULT_STATE + loadProgress migration
└── pages/
    └── ModuleDetail.jsx         # existing — gains openActivityId state + ActivityPanel rendering
public/
├── audio/
│   └── 1/                       # empty directory placeholder (Phase 2 populates)
└── decks/
    └── 1/                       # empty directory placeholder (Phase 2 populates)
vite.config.js                   # existing — gains workbox.runtimeCaching for audio
```

### Pattern 1: Open-State Lifted to ModuleDetail (Single-Open Constraint)

**What:** `openActivityId` lives in ModuleDetail, not inside ActivityPanel. Tapping an activity sets `openActivityId` to that activity's id (or null if already open). Only the panel whose `activityId` matches `openActivityId` renders its content.

**When to use:** Required when "only one panel open at a time" is specified. Each ActivityPanel cannot know about sibling panels unless the open state is lifted.

**Example:**
```jsx
// ModuleDetail.jsx additions
const [openActivityId, setOpenActivityId] = useState(null)

const handlePanelToggle = useCallback((activityId) => {
  setOpenActivityId((prev) => (prev === activityId ? null : activityId))
}, [])

// In the activities render:
{module.activities.map((activity) => (
  <ActivityPanel
    key={activity.id}
    activity={activity}
    moduleId={String(module.id)}
    checked={!!modCompleted[activity.id]}
    isOpen={openActivityId === activity.id}
    onPanelToggle={handlePanelToggle}
    onComplete={() => handleToggle(activity.id)}
    phaseColor={phase?.color}
  />
))}
```

### Pattern 2: ActivityPanel Height Animation

**What:** Framer Motion `AnimatePresence` + `motion.div` with `height: 0` → `height: "auto"` transition. `overflow: "hidden"` on the motion div prevents content flash during collapse.

**When to use:** Expand-in-place content panel where height is unknown at render time. `height: "auto"` in Framer Motion is handled via layout measurement.

**Recommended parameters (Claude's Discretion):**
- Duration: `0.25s` (fast enough to feel instant on mobile, slow enough to be perceptible)
- Easing: `ease` (matches existing Framer Motion transitions in the project)
- Opacity fade on content: `initial={{ opacity: 0 }} animate={{ opacity: 1 }}` with 50ms delay to prevent content flash before panel opens

**Example:**
```jsx
// ActivityPanel.jsx
import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ActivityCheckbox } from "./ActivityCheckbox"

export function ActivityPanel({ activity, moduleId, checked, isOpen, onPanelToggle, onComplete, phaseColor }) {
  return (
    <div>
      <ActivityCheckbox
        activity={activity}
        checked={checked}
        onToggle={() => onPanelToggle(activity.id)}
        phaseColor={phaseColor}
      />
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "ease" }}
            style={{ overflow: "hidden" }}
          >
            <div
              className="mx-3.5 mb-1.5 rounded-xl p-4 text-sm"
              style={{
                backgroundColor: "var(--bg-card)",
                border: "1px solid var(--border)",
                color: "var(--text-muted)",
              }}
            >
              <p className="text-center py-4">
                Content coming in Phase 2 — tap the checkbox above to mark complete manually.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
```

### Pattern 3: localStorage Migration in loadProgress

**What:** One-time forward migration inside the existing `loadProgress()` try block. Mutates the parsed object before returning it. Subsequent loads find `deck` already present and skip the migration branch.

**When to use:** Schema evolution in localStorage where old key must be preserved for users who haven't loaded since deployment.

**Critical detail:** The existing `loadProgress` merge — `{ ...structuredClone(DEFAULT_STATE), ...parsed }` — does a **shallow** merge. The `completed` object from `parsed` overwrites the DEFAULT_STATE `completed` object entirely. This means the migration MUST run on the `parsed.completed` entries before the merge, or the migrated values will be lost. The code below places the migration before the merge return.

**Example:**
```js
// storage.js — loadProgress
export function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return structuredClone(DEFAULT_STATE)
    const parsed = JSON.parse(raw)

    // One-time migration: mindmap → deck
    if (parsed.completed) {
      Object.values(parsed.completed).forEach((mod) => {
        if ("mindmap" in mod) {
          mod.deck = mod.mindmap
          delete mod.mindmap
        }
      })
    }

    return { ...structuredClone(DEFAULT_STATE), ...parsed }
  } catch {
    return structuredClone(DEFAULT_STATE)
  }
}
```

Note: The condition `!("deck" in mod)` from the architecture doc was intentionally removed — if a user somehow has both keys, copying mindmap over an existing deck value would be wrong. Only migrating when `mindmap` exists is sufficient and safer.

### Pattern 4: Workbox runtimeCaching for Audio

**What:** Add a `runtimeCaching` entry to the Workbox config in vite.config.js. The `CacheFirst` handler serves audio from cache on repeat plays; falls back to network on first play.

**Recommended values (Claude's Discretion):**
- `maxEntries: 10` — covers all 8 modules with 2 spare entries
- `maxAgeSeconds: 30 * 24 * 60 * 60` — 30 days; audio doesn't change between content updates

**Example:**
```js
// vite.config.js — workbox section
workbox: {
  globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
  runtimeCaching: [
    {
      urlPattern: /\/audio\/.+/,
      handler: "CacheFirst",
      options: {
        cacheName: "audio-cache",
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 30 * 24 * 60 * 60,
        },
      },
    },
  ],
},
```

Note: The current `globPatterns` in vite.config.js is `["**/*.{js,css,html,ico,png,svg,woff2}"]` — it already excludes audio. No change needed to globPatterns, only the addition of `runtimeCaching`.

### Anti-Patterns to Avoid

- **Owning `openActivityId` inside ActivityPanel:** Each panel is unaware of siblings, making the single-open constraint impossible without a context or lifted state. Always lift to ModuleDetail.
- **Animating with raw CSS `max-height`:** `max-height` transitions require a fixed upper bound, causing jarring snapping if the panel is shorter than the max. Framer Motion's `height: "auto"` measures actual content height.
- **Placing migration after the DEFAULT_STATE merge:** The shallow spread means `parsed.completed` overwrites default keys. Migration must mutate `parsed.completed` before the final return.
- **Adding `mindmap` migration condition `!("deck" in mod)`:** Unnecessary and fragile. If a user has both keys from some edge case, we should not override their `deck` value with an old `mindmap` value.
- **Using `Layers` icon for the renamed Deck activity:** `Layers` is already the icon for `flashcards`. Sharing the icon between deck and flashcards creates visual confusion in the activity list.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Height-unknown panel expand/collapse | CSS max-height trick or JS getBoundingClientRect loop | Framer Motion `AnimatePresence` + `height: "auto"` | FM handles ResizeObserver and layout measurement internally; max-height requires a fixed cap |
| One-at-a-time panel constraint | Custom event system or React Context | `useState` in ModuleDetail + pass `isOpen` prop | State is local to the module detail view; no global state needed |
| LocalStorage schema migration | Versioned migration runner | Inline `if ("mindmap" in mod)` check in loadProgress | Single schema change; a migration runner is over-engineered for one key rename |

---

## Runtime State Inventory

> This section is included because Phase 1 contains a rename/migration.

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | localStorage key `ai-tracker-progress` contains `completed[moduleId].mindmap` for any user who has used the app. 8 modules × 1 key = up to 8 `mindmap` boolean values. | One-time migration in `loadProgress()` — copy value to `deck`, delete `mindmap`. Code edit only, no separate migration script needed. |
| Live service config | Supabase row for the user's sync key contains the same `completed` shape if they have sync enabled. The remote data will still have `mindmap` on first pull after deployment. | `mergeProgress` in useSync.js handles this correctly by key — after migration, local has `deck`; remote has `mindmap`. The merge loop iterates `Object.keys(remote.completed[modId])` and copies `mindmap: true` into merged result if present. The merge does NOT delete unknown keys, so `mindmap: true` can leak back in. **Fix required:** add the same migration to the pull path in `mergeProgress`, or run the migration on the merged result before `saveProgress(merged)` in useSync.js. |
| OS-registered state | None — no OS-level registration of activity keys. | None — verified by codebase inspection. |
| Secrets/env vars | None — activity ids are not used as env var names. | None. |
| Build artifacts | None — no compiled artifacts carry activity key names. | None — verified. |

**Sync pull migration gap:** This is the most important finding in this section. `useSync.pull()` calls `mergeProgress(local, remote.data)` then `saveProgress(merged)`. If the remote Supabase row has `mindmap: true`, the merge copies it into the local merged object. The migration in `loadProgress()` will not re-run because the merged data is written directly via `saveProgress` and then set with `setState(merged)` — bypassing `loadProgress()`. **The migration must also be applied to remote data inside `mergeProgress` or immediately after merge in `pull()`.** Add a helper function `migrateMindmapToDeck(progressObj)` that can be called from both places.

---

## Common Pitfalls

### Pitfall 1: Shallow Merge Loses Migration

**What goes wrong:** The migration runs on `parsed.completed` inside `loadProgress()`, but then `{ ...structuredClone(DEFAULT_STATE), ...parsed }` spreads `parsed` — which now has `completed` with `deck` keys — over DEFAULT_STATE. This works correctly. But if the migration runs AFTER the merge, `parsed.completed` has already been replaced by the merged object and the migration mutates a dead reference.

**Why it happens:** Placing the migration at the end of the try block after the return statement.

**How to avoid:** Place the migration block immediately after `JSON.parse(raw)` succeeds, before the return. See Pattern 3 example above.

**Warning signs:** User with existing `mindmap` progress sees it reset to false after deployment.

### Pitfall 2: Supabase Sync Re-Introduces `mindmap` Key

**What goes wrong:** loadProgress() migrates local data to `deck`. User opens the app. useSync pulls remote data (which still has `mindmap: true`). mergeProgress copies `mindmap` from remote into the merged object. saveProgress writes `mindmap` back into localStorage. The migration runs once and is then undone by the next sync pull.

**Why it happens:** mergeProgress iterates `Object.keys(remote.completed[modId])` and copies all keys from remote to merged, including `mindmap`.

**How to avoid:** Apply the same `mindmap → deck` migration to remote data inside `mergeProgress` (before the key iteration loop), or create a `normalizeMindmapToDeck(obj)` helper called on both parsed localStorage data and remote pulled data.

**Warning signs:** User sees `deck` toggle reset to false on next app load after a sync pull.

### Pitfall 3: ActivityCheckbox onToggle Behavior Change

**What goes wrong:** Currently, `ActivityCheckbox.onToggle` directly triggers completion. After Phase 1, tapping an activity row opens the panel — it does NOT complete the activity. Completion happens via `onComplete` from inside the panel. If the old direct-complete wiring remains, tapping a row will both open the panel AND toggle completion simultaneously.

**Why it happens:** Wiring `onToggle` in the new ActivityPanel to call both `onPanelToggle` and `onComplete` incorrectly, or passing `handleToggle` directly as `onToggle` to ActivityCheckbox inside ActivityPanel.

**How to avoid:** Inside ActivityPanel, ActivityCheckbox receives `onToggle={() => onPanelToggle(activity.id)}` — only opens the panel. The `onComplete` prop is separate and only called when the user deliberately finishes content (in Phase 2+, or ignored in Phase 1 placeholder).

**Warning signs:** Tapping an activity row marks it complete immediately without any content interaction.

### Pitfall 4: `Images` Icon Not in ICON_MAP

**What goes wrong:** modules.js is updated to use `icon: "Images"` for the deck activity, but `ActivityCheckbox.jsx` ICON_MAP does not include the `Images` import. The component falls back to `CheckCircle` silently.

**Why it happens:** The ICON_MAP in ActivityCheckbox is manually maintained and doesn't auto-sync with modules.js.

**How to avoid:** When updating modules.js to use `Images`, simultaneously update ActivityCheckbox.jsx to import `Images` from lucide-react and add it to ICON_MAP. Remove `GitBranch` from the import and ICON_MAP (no longer needed after renaming).

**Warning signs:** Deck activity shows a checkmark icon instead of the expected image icon.

### Pitfall 5: `public/audio/` and `public/decks/` Empty Directory Git Behavior

**What goes wrong:** Git does not track empty directories. Creating `public/audio/1/` and `public/decks/1/` locally will not be committed unless a placeholder file exists. Phase 2 expects the directory structure to already exist.

**Why it happens:** Standard Git behavior.

**How to avoid:** Add a `.gitkeep` file in each empty directory. `public/audio/1/.gitkeep` and `public/decks/1/.gitkeep`. These are harmless and maintain the directory structure in the repository.

---

## Code Examples

Verified patterns from direct codebase analysis:

### Current DEFAULT_STATE (needs mindmap → deck change)
```js
// src/utils/storage.js — lines 3-13 (current state)
const DEFAULT_STATE = {
  completed: Object.fromEntries(
    Array.from({ length: 8 }, (_, i) => [
      String(i + 1),
      { audio: false, mindmap: false, flashcards: false, quiz: false, teachback: false },
    ])
  ),
  notes: {},
  streak: { current: 0, best: 0, lastStudyDate: null },
  celebratedMilestones: [],
}
```

### Target DEFAULT_STATE
```js
// src/utils/storage.js — after migration
const DEFAULT_STATE = {
  completed: Object.fromEntries(
    Array.from({ length: 8 }, (_, i) => [
      String(i + 1),
      { audio: false, deck: false, flashcards: false, quiz: false, teachback: false },
    ])
  ),
  notes: {},
  streak: { current: 0, best: 0, lastStudyDate: null },
  celebratedMilestones: [],
}
```

### resetAll in useProgress (needs mindmap → deck change)
```js
// src/hooks/useProgress.js — lines 71-83 (current state)
// The hardcoded object inside resetAll duplicates DEFAULT_STATE and has mindmap: false
// Target: change mindmap → deck in the hardcoded shape, OR better — use DEFAULT_STATE directly
const resetAll = useCallback(() => {
  localStorage.removeItem("ai-tracker-progress")
  const def = {
    completed: Object.fromEntries(
      Array.from({ length: 8 }, (_, i) => [
        String(i + 1),
        { audio: false, deck: false, flashcards: false, quiz: false, teachback: false },
      ])
    ),
    notes: {},
    streak: { current: 0, best: 0, lastStudyDate: null },
    celebratedMilestones: [],
  }
  saveProgress(def)
  setState(def)
}, [])
```

### Flashcard Data Scaffold (src/data/content/flashcards.js)
```js
// Module 1 scaffold — 3 example cards; remaining modules are empty arrays (Phase 3 populates)
export const FLASHCARDS = {
  "1": [
    { question: "What is the difference between narrow AI and general AI?", answer: "Narrow AI is designed for a specific task (e.g., image recognition). General AI can reason across domains like a human — it does not yet exist." },
    { question: "Name three main types of machine learning.", answer: "Supervised learning, unsupervised learning, and reinforcement learning." },
    { question: "What is a training dataset?", answer: "A labeled collection of examples used to teach a model the patterns it should recognize or predict." },
  ],
  "2": [],
  "3": [],
  "4": [],
  "5": [],
  "6": [],
  "7": [],
  "8": [],
}
```

### Quiz Data Scaffold (src/data/content/quizzes.js)
```js
// Module 1 scaffold — 3 example questions; remaining modules are empty arrays (Phase 3 populates)
export const QUIZZES = {
  "1": [
    {
      question: "Which of the following is an example of narrow AI?",
      options: ["A robot that can cook, clean, and write code", "A chess engine that only plays chess", "A system that learns any skill instantly", "A human brain simulation"],
      correctIndex: 1,
    },
    {
      question: "What does 'training a model' mean?",
      options: ["Writing the model's code manually", "Adjusting model parameters using example data", "Downloading pre-built weights from the internet", "Testing the model in production"],
      correctIndex: 1,
    },
    {
      question: "Which learning type uses labeled input-output pairs?",
      options: ["Reinforcement learning", "Unsupervised learning", "Supervised learning", "Transfer learning"],
      correctIndex: 2,
    },
  ],
  "2": [],
  "3": [],
  "4": [],
  "5": [],
  "6": [],
  "7": [],
  "8": [],
}
```

### Teach-Back Prompts Scaffold (src/data/content/teachback.js)
```js
// Module 1 scaffold — 2 example prompts; remaining modules are empty arrays (Phase 4 populates)
export const TEACHBACK_PROMPTS = {
  "1": [
    { prompt: "Explain what artificial intelligence is and how it differs from traditional software.", conceptArea: "AI definition" },
    { prompt: "Describe the three main types of machine learning and give a real-world example of each.", conceptArea: "ML types" },
  ],
  "2": [],
  "3": [],
  "4": [],
  "5": [],
  "6": [],
  "7": [],
  "8": [],
}
```

### modules.js Activity Update (one module shown — repeat for all 8)
```js
// Before (all 8 modules share this activity shape)
activities: [
  { id: "audio", label: "Audio Overview", icon: "Headphones" },
  { id: "mindmap", label: "Mind Map", icon: "GitBranch" },   // ← rename this
  { id: "flashcards", label: "Flashcards", icon: "Layers" },
  { id: "quiz", label: "Quiz", icon: "CheckCircle" },
  { id: "teachback", label: "Teach-Back", icon: "MessageCircle" },
]

// After
activities: [
  { id: "audio", label: "Audio Overview", icon: "Headphones" },
  { id: "deck", label: "Deck", icon: "Images" },              // ← renamed
  { id: "flashcards", label: "Flashcards", icon: "Layers" },
  { id: "quiz", label: "Quiz", icon: "CheckCircle" },
  { id: "teachback", label: "Teach-Back", icon: "MessageCircle" },
]
```

### ActivityCheckbox ICON_MAP Update
```js
// Before
import { Headphones, GitBranch, Layers, CheckCircle, MessageCircle } from "lucide-react"
const ICON_MAP = { Headphones, GitBranch, Layers, CheckCircle, MessageCircle }

// After
import { Headphones, Images, Layers, CheckCircle, MessageCircle } from "lucide-react"
const ICON_MAP = { Headphones, Images, Layers, CheckCircle, MessageCircle }
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| CSS `max-height` transition for expand/collapse | Framer Motion `height: "auto"` | Framer Motion v5+ | No fixed max-height ceiling needed; content of any height animates correctly |
| `workbox-webpack-plugin` manual config | `vite-plugin-pwa` Workbox config via `vite.config.js` | Vite ecosystem adoption (2022+) | Single config location; no separate workbox config file |

**No deprecations relevant to this phase.**

---

## Open Questions

1. **Should the migration also strip `mindmap` from the Supabase remote row after migration?**
   - What we know: The local migration fixes localStorage. Supabase will still have `mindmap` until the user's next push.
   - What's unclear: Whether having a stale `mindmap: true` in Supabase causes real problems after the migration (it gets ignored by mergeProgress once `deck` is the canonical key, but only if mergeProgress also runs the migration on remote data).
   - Recommendation: Apply `normalizeMindmapToDeck()` inside `mergeProgress` before the key iteration loop. This handles remote data silently. No explicit Supabase row update needed — the next push from the normalized local state will overwrite the remote row.

2. **The `flashcards` activity currently uses `Layers` icon; Deck will also use `Images`. Is there a concern about `Images` icon availability in lucide-react 0.577.0?**
   - What we know: `Images` has been a stable lucide-react icon since approximately v0.300. Version 0.577.0 is current as of 2026 and should include it. node_modules is not installed in this repo at research time.
   - What's unclear: Exact icon name — lucide-react uses PascalCase; the icon is `Images` not `Image`.
   - Recommendation: Verify by running `npm install` and checking the import compiles without error. Fallback is `GalleryHorizontal` (also a standard lucide icon for slides/image collections).

---

## Validation Architecture

> `nyquist_validation: true` in .planning/config.json — section is required.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None installed — no test framework in package.json |
| Config file | None — Wave 0 must add one |
| Quick run command | `npm test` (after Wave 0 installs framework) |
| Full suite command | `npm test` (after Wave 0 installs framework) |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DATA-01 | modules.js has no `mindmap` activity id in any module | unit (snapshot/grep) | `npm test -- modules.migration` | ❌ Wave 0 |
| DATA-02 | loadProgress() migrates mindmap → deck in stored data | unit | `npm test -- storage.migration` | ❌ Wave 0 |
| DATA-02 | loadProgress() migration is idempotent (runs twice safely) | unit | included in storage.migration | ❌ Wave 0 |
| DATA-02 | Sync pull does not re-introduce mindmap key | unit | `npm test -- sync.migration` | ❌ Wave 0 |
| DATA-03 | flashcards.js exports FLASHCARDS with correct shape | unit | `npm test -- content.flashcards` | ❌ Wave 0 |
| DATA-04 | quizzes.js exports QUIZZES with correct shape | unit | `npm test -- content.quizzes` | ❌ Wave 0 |
| DATA-05 | teachback.js exports TEACHBACK_PROMPTS with correct shape | unit | `npm test -- content.teachback` | ❌ Wave 0 |
| PANEL-01 | ActivityPanel renders ActivityCheckbox and hidden panel content | unit | `npm test -- ActivityPanel` | ❌ Wave 0 |
| PANEL-02 | ActivityPanel expands on tap, collapses on second tap | unit | `npm test -- ActivityPanel.toggle` | ❌ Wave 0 |
| PANEL-03 | onComplete prop is called when the placeholder "complete" path fires | unit | `npm test -- ActivityPanel.onComplete` | ❌ Wave 0 |
| PWA-01 | vite.config.js workbox config has runtimeCaching entry for audio | unit (config inspection) | manual review — config is build-time only | manual-only |

**PWA-01 manual justification:** Workbox runtimeCaching is a build-time configuration. Verifying it requires building and inspecting the generated service worker file (`dist/sw.js` or equivalent). This is a manual step: `npm run build && grep -i "CacheFirst\|audio-cache" dist/sw.js`.

### Sampling Rate
- **Per task commit:** `npm test` (fast unit suite, <10 seconds once framework is installed)
- **Per wave merge:** `npm test` (full suite)
- **Phase gate:** Full suite green + manual PWA-01 verification (`npm run build && grep audio-cache dist/sw.js`) before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/__tests__/storage.migration.test.js` — covers DATA-02 (loadProgress migration + idempotency)
- [ ] `src/__tests__/sync.migration.test.js` — covers DATA-02 sync pull path
- [ ] `src/__tests__/modules.migration.test.js` — covers DATA-01 (no mindmap id remaining)
- [ ] `src/__tests__/content.flashcards.test.js` — covers DATA-03
- [ ] `src/__tests__/content.quizzes.test.js` — covers DATA-04
- [ ] `src/__tests__/content.teachback.test.js` — covers DATA-05
- [ ] `src/__tests__/ActivityPanel.test.jsx` — covers PANEL-01, PANEL-02, PANEL-03
- [ ] `src/__tests__/setup.js` — test environment setup (jsdom, React Testing Library mocks)
- [ ] Framework install: `npm install --save-dev vitest @testing-library/react @testing-library/user-event jsdom` — no test framework currently in package.json

**Recommended test framework:** Vitest (native Vite integration, no config needed for basic setup, works with React 19 via `@testing-library/react`). No jest.config or separate test runner needed — add `"test": "vitest run"` to package.json scripts.

---

## Sources

### Primary (HIGH confidence)
- Direct codebase analysis: `/Users/philiy/Developer/ai-tracker/src/` — storage.js, useProgress.js, useSync.js, modules.js, vite.config.js, ModuleDetail.jsx, ActivityCheckbox.jsx (2026-03-28)
- `.planning/research/ARCHITECTURE.md` — architecture patterns, data flow, migration code (2026-03-28)
- `.planning/research/PITFALLS.md` — audio caching, state separation, migration pitfalls (2026-03-28)

### Secondary (MEDIUM confidence)
- Framer Motion `height: "auto"` animation — standard pattern in FM docs; `AnimatePresence` already confirmed present and used in `App.jsx`
- vite-plugin-pwa `workbox.runtimeCaching` config — standard plugin API; confirmed current `globPatterns` key in vite.config.js
- lucide-react `Images` icon — standard icon, present in v0.300+; confirmed v0.577.0 installed; unverifiable without node_modules

### Tertiary (LOW confidence)
- None for this phase — all findings are from direct codebase analysis or well-established framework patterns

---

## Metadata

**Confidence breakdown:**
- Data migration: HIGH — exact source lines read, migration pattern is deterministic
- ActivityPanel architecture: HIGH — based on direct ModuleDetail.jsx analysis and established Framer Motion patterns
- Sync pull migration gap: HIGH — identified by reading mergeProgress logic directly; the risk is real and concrete
- Icon availability: MEDIUM — `Images` is a stable lucide-react icon but node_modules not installed for compile-time verification
- Workbox config: HIGH — existing vite.config.js read; runtimeCaching is standard vite-plugin-pwa API

**Research date:** 2026-03-28
**Valid until:** 2026-04-28 (stable stack; 30-day window)
