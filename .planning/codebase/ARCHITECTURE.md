# Architecture

**Analysis Date:** 2026-03-28

## Pattern Overview

**Overall:** Single-page application (SPA) with client-first state management

**Key Characteristics:**
- All state lives in React via `useProgress` hook; localStorage is the persistence layer
- Optional cloud sync layer (Supabase) layered on top — app works without it
- Data is static and co-located in `src/data/modules.js`; no API fetching for content
- No global state library (no Redux/Zustand/Context); state is prop-drilled from `App.jsx` down to pages

## Layers

**Entry / Bootstrap:**
- Purpose: Mount React app, wrap with router and strict mode
- Location: `src/main.jsx`
- Contains: `createRoot`, `BrowserRouter`, `StrictMode`
- Depends on: Nothing except React and `App.jsx`
- Used by: Browser via `index.html`

**App Shell:**
- Purpose: Route definitions, global providers (Toaster, AnimatePresence), and hook initialization
- Location: `src/App.jsx`
- Contains: `Routes`, `Route` declarations, `useProgress` and `useSync` instantiation, page-level animated transitions
- Depends on: `useProgress`, `useSync`, all three page components
- Used by: `main.jsx`

**Pages:**
- Purpose: Full-screen views rendered at a route
- Location: `src/pages/`
- Contains: Layout, data assembly from props, local UI state
- Depends on: Components, data constants, utils
- Used by: `App.jsx` via React Router routes

**Components:**
- Purpose: Reusable UI units with no routing awareness
- Location: `src/components/`
- Contains: Presentational and lightly interactive elements
- Depends on: `src/data/modules.js` (some read `MODULES`/`PHASES` directly), `src/utils/`
- Used by: Pages

**Hooks:**
- Purpose: State and side-effect encapsulation
- Location: `src/hooks/`
- Contains: `useProgress` (local state + localStorage), `useSync` (Supabase sync lifecycle)
- Depends on: `src/utils/storage.js`, `src/utils/supabase.js`, `src/data/modules.js`
- Used by: `App.jsx` only — results are prop-drilled

**Data:**
- Purpose: Static curriculum definition
- Location: `src/data/modules.js`
- Contains: `PHASES` array, `MODULES` array, `NOTEBOOK_ID`, `NOTEBOOK_BASE_URL`
- Depends on: Nothing
- Used by: Pages, components, hooks

**Utils:**
- Purpose: Pure functions and thin service wrappers
- Location: `src/utils/`
- Contains: `storage.js` (localStorage read/write), `supabase.js` (client + push/pull), `confetti.js` (canvas-confetti wrapper), `encouragements.js` (random string picker)
- Depends on: External packages only
- Used by: Hooks and components

## Data Flow

**Activity Toggle (happy path):**

1. User taps `ActivityCheckbox` in `ModuleDetail`
2. `ModuleDetail.handleToggle` calls `progress.toggleActivity(moduleId, activityId)`
3. `useProgress.toggleActivity` updates React state via `setState`, recalculates streak
4. `saveProgress(next)` writes updated state to `localStorage["ai-tracker-progress"]`
5. `useSync` `useEffect` fires on `state` change, calls `schedulePush` with 1500ms debounce
6. After debounce, `pushProgress(syncKey, progressState)` upserts to Supabase `progress` table
7. Updated `state` flows back down: `App` → `Dashboard` or `ModuleDetail` → child components re-render

**Initial Load / Sync Pull:**

1. `main.jsx` mounts; `App` renders; `useProgress` calls `loadProgress()` as `useState` initializer
2. `loadProgress` reads `localStorage["ai-tracker-progress"]`, merges with `DEFAULT_STATE`
3. `useSync` `useEffect` runs on mount — if `syncKeyRef` is set, calls `pull(key, setState)`
4. `pullProgress(key)` queries Supabase; if remote data exists, `mergeProgress(local, remote)` is called
5. Merged state is saved locally and set via `setState`

**Navigation:**

1. `ModuleCard` (inside `Dashboard`) calls `navigate('/module/:id')` on tap
2. React Router swaps the page component; `AnimatePresence` in `App.jsx` runs exit + enter transitions
3. `ModuleDetail` reads `useParams().id`, finds module in `MODULES` array

**State Management:**

- Single `state` object shape: `{ completed, notes, streak, celebratedMilestones }`
- `completed` is `{ [moduleId]: { audio, mindmap, flashcards, quiz, teachback } }`
- `useProgress` returns derived values (`completedCount`, `overallPercent`) computed synchronously
- No memoization of derived values beyond `useCallback` on mutation functions

## Key Abstractions

**Progress State Object:**
- Purpose: Canonical representation of all user activity
- Shape defined in `src/utils/storage.js` `DEFAULT_STATE`
- Passed as the `progress` prop to all three pages

**Sync Key:**
- Purpose: Anonymized identifier linking a device to a Supabase row without storing credentials
- Implementation: SHA-256 hash of user's passphrase via `crypto.subtle` (`src/utils/supabase.js` `hashPhrase`)
- Stored in `localStorage["ai-tracker-sync-key"]`

**Module / Activity Data Model:**
- Defined in `src/data/modules.js`
- Each module has `id` (number), `phase` (1–3), `week`, `emoji`, `description`, `activities[]`
- Each activity has `id` (string key), `label`, `icon` (Lucide name string)
- 8 modules × 5 activities = 40 total activities (hardcoded, checked against `MODULES.length * 5`)

**Merge Strategy (useSync):**
- Defined in `mergeProgress` at bottom of `src/hooks/useSync.js`
- "true wins" for completed activities, "longer wins" for notes, "higher wins" for streak current/best, union for milestones

## Entry Points

**HTML Shell:**
- Location: `index.html`
- Triggers: Browser loads the URL
- Responsibilities: Sets PWA meta tags, mounts `<div id="root">`, loads `src/main.jsx` as ES module

**React Bootstrap:**
- Location: `src/main.jsx`
- Triggers: Browser parses the module script
- Responsibilities: Creates React root, wraps app in `BrowserRouter` and `StrictMode`

**Route `/`:**
- Location: `src/pages/Dashboard.jsx`
- Triggers: React Router matches path
- Responsibilities: Renders full progress overview — ring, streak, phase bars, module list

**Route `/module/:id`:**
- Location: `src/pages/ModuleDetail.jsx`
- Triggers: React Router matches path; `id` param drives module lookup
- Responsibilities: Renders activities, milestone detection, notes, NotebookLM link

**Route `/settings`:**
- Location: `src/pages/Settings.jsx`
- Triggers: React Router matches path
- Responsibilities: Cloud sync configuration, progress stats, export, reset

## Error Handling

**Strategy:** Silent fallbacks — the app degrades gracefully rather than surfacing errors to the user

**Patterns:**
- `loadProgress` wraps `JSON.parse` in try/catch; returns `DEFAULT_STATE` on any failure
- `useSync` catches Supabase errors and sets `syncStatus = "error"` (displayed in UI as a status indicator)
- `pushProgress` / `pullProgress` return `false` / `null` on error rather than throwing
- `supabase` client is exported as `null` if env vars are absent; callers check `if (!supabase) return`
- `ModuleDetail` renders a "Can't find that module" fallback if `id` param doesn't match any module

## Cross-Cutting Concerns

**Styling:** CSS custom properties defined in `src/index.css` `:root`; Tailwind classes used for layout/spacing; inline `style` props used for dynamic/theme-color values

**Animations:** Framer Motion used consistently for page transitions (`x: "50%"` slide), list stagger, and micro-interactions (checkbox check, progress ring, streak icon pulse)

**PWA:** Configured in `vite.config.js` via `vite-plugin-pwa`; auto-updates service worker; manifest targets portrait standalone display; icons at `public/icons/`

**Accessibility:** `aria-label` on icon-only buttons; `focus-visible` outline set in global CSS; `prefers-reduced-motion` media query disables all transitions

---

*Architecture analysis: 2026-03-28*
