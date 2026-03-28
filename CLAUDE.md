<!-- GSD:project-start source:PROJECT.md -->
## Project

**AI Fundamentals Tracker — Learning Edition**

An all-in-one AI learning and progress tracking PWA. Currently a pure progress tracker with checkboxes for 8 AI modules across 3 phases. The next milestone transforms it into an interactive learning app by embedding NotebookLM-generated content (audio overviews, deck slides, flashcards, quizzes) directly into each module, and adding a Claude-powered Teach-Back voice conversation feature.

**Core Value:** Every learning activity is accessible and completable inside the app itself — no switching between NotebookLM and the tracker. Study offline, track progress, and test understanding in one place.

### Constraints

- **Offline-first**: All learning content must be bundled as static assets in the PWA. Only Teach-Back requires network.
- **Tech stack**: Must stay within existing React/Vite/Tailwind stack. No new frameworks.
- **Content source**: NotebookLM MCP tools for extraction. 8 notebooks, one per module.
- **Claude API**: Teach-Back requires Claude API key — needs secure handling (not bundled in client code).
- **Bundle size**: Audio files will significantly increase bundle. Need to consider PWA caching strategy.
- **Platform**: Static hosting (GitHub Pages). No server-side code except Claude API proxy for Teach-Back.
<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->
## Technology Stack

## Languages
- JavaScript (JSX) - All application code in `src/`
- CSS - Global styles in `src/index.css`
- HTML - Entry point `index.html`
## Runtime
- Node.js v25.8.2 (local development)
- Browser runtime (production — no server-side execution)
- npm
- Lockfile: `package-lock.json` present (lockfileVersion 3)
## Frameworks
- React 19.2.4 - UI component framework; entry at `src/main.jsx`
- React Router DOM 7.13.1 - Client-side routing; three routes (`/`, `/module/:id`, `/settings`)
- Tailwind CSS 4.2.2 - Utility-first CSS via `@tailwindcss/vite` Vite plugin; configured with custom design tokens in `src/index.css`
- Framer Motion 12.38.0 - Page transition animations via `AnimatePresence` in `src/App.jsx`
- Sonner 2.0.7 - Toast notification system; configured in `src/App.jsx`
- Vite 8.0.1 - Build tool and dev server; config at `vite.config.js`
- `@vitejs/plugin-react` 6.0.1 - React fast refresh and JSX transform
- vite-plugin-pwa 1.2.0 - Service worker and Web App Manifest; configured in `vite.config.js` with `autoUpdate` strategy and Workbox for asset precaching
## Key Dependencies
- `@supabase/supabase-js` 2.99.3 - Cloud sync backend client; initialized conditionally in `src/utils/supabase.js` (app runs fully without it)
- `react-router-dom` 7.13.1 - All navigation depends on this; uses `BrowserRouter` wrapping in `src/main.jsx`
- `lucide-react` 0.577.0 - Icon library used throughout components
- `canvas-confetti` 1.9.4 - Celebration animations; wrapped in `src/utils/confetti.js`
- `framer-motion` 12.38.0 - Animated page transitions
- `vite-plugin-pwa` 1.2.0 - Enables installable PWA with offline asset caching
## Configuration
- Vite reads `VITE_` prefixed env vars at build time
- Required vars documented in `.env.example`:
- Both vars are optional; the app falls back gracefully to local-only mode when absent
- `vite.config.js` - Primary build config (React plugin, Tailwind plugin, PWA plugin)
- `eslint.config.js` - ESLint flat config targeting `**/*.{js,jsx}`; enforces `no-unused-vars` with uppercase pattern exception
- Tailwind v4 configured via CSS `@import "tailwindcss"` and `@theme` block in `src/index.css`
- Custom CSS custom properties used alongside Tailwind utilities for the design system
## Platform Requirements
- Node.js (v25 used locally)
- npm
- `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` env vars (optional — sync feature disabled without them)
- Static file host (no server required)
- PWA-capable browser for installability
- HTTPS recommended (required for service workers and `crypto.subtle` used in passphrase hashing)
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

## Naming Patterns
- React components: PascalCase `.jsx` — e.g., `ModuleCard.jsx`, `ActivityCheckbox.jsx`
- Hooks: camelCase prefixed with `use`, `.js` extension — e.g., `useProgress.js`, `useSync.js`
- Utilities: camelCase `.js` — e.g., `storage.js`, `supabase.js`, `confetti.js`
- Data files: camelCase `.js` — e.g., `modules.js`
- Pages: PascalCase `.jsx` in `src/pages/` — e.g., `Dashboard.jsx`, `ModuleDetail.jsx`
- Handler functions: `handle` prefix — e.g., `handleToggle`, `handleExport`, `handleReset`, `handleNotesChange`
- Callback actions: verb + noun — e.g., `toggleActivity`, `setNotes`, `saveProgress`, `loadProgress`
- Utility exports: camelCase verbs — e.g., `fireCelebration`, `getRandomEncouragement`, `hashPhrase`, `pullProgress`, `pushProgress`
- Boolean flags: `is` or `has` prefix — e.g., `isComplete`, `isNext`, `isHot`, `hasStreak`, `hasSyncPhrase`, `isConfigured`
- Refs: suffix `Ref` — e.g., `pushTimerRef`, `notesTimerRef`, `syncKeyRef`, `isSyncing`
- localStorage keys: string constants in SCREAMING_SNAKE_CASE — e.g., `SYNC_PHRASE_KEY`, `SYNC_KEY_KEY`, `STORAGE_KEY`
- Module-level data constants: SCREAMING_SNAKE_CASE — e.g., `PHASES`, `MODULES`, `MILESTONES`, `MILESTONE_DATA`, `ENCOURAGEMENTS`, `ICON_MAP`, `DEFAULT_STATE`
- ESLint is configured to allow unused vars matching `/^[A-Z_]/` pattern, enabling these top-level constants
- Shape mirroring the data: plain objects with descriptive keys — e.g., `{ current, best, lastStudyDate }` for streak; `{ id, title, phase, week, emoji, description, activities }` for modules
## Code Style
- No Prettier config detected — formatting is consistent but managed manually or by editor
- Double quotes for JSX string attributes, double quotes in JS imports
- Trailing commas in multi-line object/array literals
- Semicolons omitted (no-semicolon style throughout)
- ESLint 9 flat config at `eslint.config.js`
- Plugins: `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`
- Enforces `react-hooks/rules-of-hooks` and `react-hooks/exhaustive-deps`
- `no-unused-vars: error` with exception for SCREAMING_SNAKE constants
## Import Organization
- None — all imports use relative paths (e.g., `"../hooks/useProgress"`, `"../data/modules"`)
- Named exports used for all components, hooks, and utilities
- `App.jsx` uses a default export (required by Vite entry point convention)
- Barrel files are not used — import directly from source files
## Error Handling
- `try/catch` with empty catch blocks for non-critical errors — e.g., `storage.js` `loadProgress` catches JSON parse failures and returns default state silently
- Async operations in hooks use `try/catch` and update a `syncStatus` state variable to surface error state to UI rather than throwing
- Null guards via optional chaining — e.g., `completed[moduleId]?.[activityId]`, `phase?.color`
- Graceful degradation: `supabase` client is `null` when env vars are absent; all sync functions guard with `if (!supabase)` checks
- Not-found states render inline fallback UI (e.g., `ModuleDetail` renders a "Can't find that module" view when `module` is undefined)
## Logging
- No `console.log` calls detected anywhere in source
- User-facing feedback uses the `sonner` toast library via `toast()` from `"sonner"`
- Sync status communicated through `syncStatus` state string (`"idle" | "syncing" | "synced" | "error" | "offline"`)
## Comments
- JSDoc-style block comments on utility functions that have non-obvious behavior — e.g., `hashPhrase`, `pullProgress`, `pushProgress` in `src/utils/supabase.js`
- Inline comments for explaining merge strategy logic in `mergeProgress` function in `src/hooks/useSync.js`
- Section comments within large JSX files using `{/* Section Name */}` pattern
## Function Design
- Components receive named props destructured in function signature — e.g., `function ModuleCard({ module, completed, isNext })`
- Hooks return structured objects, not arrays — enables named access by callers
- Hooks return plain objects with all needed state and actions — e.g., `useProgress` returns `{ state, setState, toggleActivity, setNotes, markMilestoneCelebrated, resetAll, completedCount, totalActivities, overallPercent }`
- Utility functions return values directly or `null`/`false` on failure (no thrown errors to callers)
## Module Design
- Named exports for all components, hooks, and utilities
- Single default export only for `src/App.jsx` (Vite convention)
- Data constants exported as named exports from `src/data/modules.js`
- Not used — no `index.js` re-export files exist
- Each component is a single file; no separate style files per component (Tailwind classes inline)
- Helper functions that are only used within a file are defined in that same file (e.g., `StatRow` in `Settings.jsx`, `findNextModule` in `Dashboard.jsx`, `mergeProgress` in `useSync.js`)
## React Patterns
- `useCallback` wraps all event handlers and async functions to prevent unnecessary re-renders
- `useRef` used for timers (debounce), sync guards (`isSyncing`), and tracking first-render flags
- State initialization with lazy initializer: `useState(loadProgress)` (function reference, not call)
- `useEffect` cleanup always returns cleanup function when setting timers or starting animations
- `progress` and `sync` hook return objects are passed as props directly from `App.jsx` to page components — no context API used
- Tailwind utility classes for layout and spacing
- CSS custom properties (`var(--token)`) for all color, shadow, and font tokens via inline `style` prop
- Framer Motion `motion.*` components used for all animated elements
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

## Pattern Overview
- All state lives in React via `useProgress` hook; localStorage is the persistence layer
- Optional cloud sync layer (Supabase) layered on top — app works without it
- Data is static and co-located in `src/data/modules.js`; no API fetching for content
- No global state library (no Redux/Zustand/Context); state is prop-drilled from `App.jsx` down to pages
## Layers
- Purpose: Mount React app, wrap with router and strict mode
- Location: `src/main.jsx`
- Contains: `createRoot`, `BrowserRouter`, `StrictMode`
- Depends on: Nothing except React and `App.jsx`
- Used by: Browser via `index.html`
- Purpose: Route definitions, global providers (Toaster, AnimatePresence), and hook initialization
- Location: `src/App.jsx`
- Contains: `Routes`, `Route` declarations, `useProgress` and `useSync` instantiation, page-level animated transitions
- Depends on: `useProgress`, `useSync`, all three page components
- Used by: `main.jsx`
- Purpose: Full-screen views rendered at a route
- Location: `src/pages/`
- Contains: Layout, data assembly from props, local UI state
- Depends on: Components, data constants, utils
- Used by: `App.jsx` via React Router routes
- Purpose: Reusable UI units with no routing awareness
- Location: `src/components/`
- Contains: Presentational and lightly interactive elements
- Depends on: `src/data/modules.js` (some read `MODULES`/`PHASES` directly), `src/utils/`
- Used by: Pages
- Purpose: State and side-effect encapsulation
- Location: `src/hooks/`
- Contains: `useProgress` (local state + localStorage), `useSync` (Supabase sync lifecycle)
- Depends on: `src/utils/storage.js`, `src/utils/supabase.js`, `src/data/modules.js`
- Used by: `App.jsx` only — results are prop-drilled
- Purpose: Static curriculum definition
- Location: `src/data/modules.js`
- Contains: `PHASES` array, `MODULES` array, `NOTEBOOK_ID`, `NOTEBOOK_BASE_URL`
- Depends on: Nothing
- Used by: Pages, components, hooks
- Purpose: Pure functions and thin service wrappers
- Location: `src/utils/`
- Contains: `storage.js` (localStorage read/write), `supabase.js` (client + push/pull), `confetti.js` (canvas-confetti wrapper), `encouragements.js` (random string picker)
- Depends on: External packages only
- Used by: Hooks and components
## Data Flow
- Single `state` object shape: `{ completed, notes, streak, celebratedMilestones }`
- `completed` is `{ [moduleId]: { audio, mindmap, flashcards, quiz, teachback } }`
- `useProgress` returns derived values (`completedCount`, `overallPercent`) computed synchronously
- No memoization of derived values beyond `useCallback` on mutation functions
## Key Abstractions
- Purpose: Canonical representation of all user activity
- Shape defined in `src/utils/storage.js` `DEFAULT_STATE`
- Passed as the `progress` prop to all three pages
- Purpose: Anonymized identifier linking a device to a Supabase row without storing credentials
- Implementation: SHA-256 hash of user's passphrase via `crypto.subtle` (`src/utils/supabase.js` `hashPhrase`)
- Stored in `localStorage["ai-tracker-sync-key"]`
- Defined in `src/data/modules.js`
- Each module has `id` (number), `phase` (1–3), `week`, `emoji`, `description`, `activities[]`
- Each activity has `id` (string key), `label`, `icon` (Lucide name string)
- 8 modules × 5 activities = 40 total activities (hardcoded, checked against `MODULES.length * 5`)
- Defined in `mergeProgress` at bottom of `src/hooks/useSync.js`
- "true wins" for completed activities, "longer wins" for notes, "higher wins" for streak current/best, union for milestones
## Entry Points
- Location: `index.html`
- Triggers: Browser loads the URL
- Responsibilities: Sets PWA meta tags, mounts `<div id="root">`, loads `src/main.jsx` as ES module
- Location: `src/main.jsx`
- Triggers: Browser parses the module script
- Responsibilities: Creates React root, wraps app in `BrowserRouter` and `StrictMode`
- Location: `src/pages/Dashboard.jsx`
- Triggers: React Router matches path
- Responsibilities: Renders full progress overview — ring, streak, phase bars, module list
- Location: `src/pages/ModuleDetail.jsx`
- Triggers: React Router matches path; `id` param drives module lookup
- Responsibilities: Renders activities, milestone detection, notes, NotebookLM link
- Location: `src/pages/Settings.jsx`
- Triggers: React Router matches path
- Responsibilities: Cloud sync configuration, progress stats, export, reset
## Error Handling
- `loadProgress` wraps `JSON.parse` in try/catch; returns `DEFAULT_STATE` on any failure
- `useSync` catches Supabase errors and sets `syncStatus = "error"` (displayed in UI as a status indicator)
- `pushProgress` / `pullProgress` return `false` / `null` on error rather than throwing
- `supabase` client is exported as `null` if env vars are absent; callers check `if (!supabase) return`
- `ModuleDetail` renders a "Can't find that module" fallback if `id` param doesn't match any module
## Cross-Cutting Concerns
<!-- GSD:architecture-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd:quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd:debug` for investigation and bug fixing
- `/gsd:execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd:profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
