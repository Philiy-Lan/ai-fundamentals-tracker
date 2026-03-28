# Coding Conventions

**Analysis Date:** 2026-03-28

## Naming Patterns

**Files:**
- React components: PascalCase `.jsx` — e.g., `ModuleCard.jsx`, `ActivityCheckbox.jsx`
- Hooks: camelCase prefixed with `use`, `.js` extension — e.g., `useProgress.js`, `useSync.js`
- Utilities: camelCase `.js` — e.g., `storage.js`, `supabase.js`, `confetti.js`
- Data files: camelCase `.js` — e.g., `modules.js`
- Pages: PascalCase `.jsx` in `src/pages/` — e.g., `Dashboard.jsx`, `ModuleDetail.jsx`

**Functions:**
- Handler functions: `handle` prefix — e.g., `handleToggle`, `handleExport`, `handleReset`, `handleNotesChange`
- Callback actions: verb + noun — e.g., `toggleActivity`, `setNotes`, `saveProgress`, `loadProgress`
- Utility exports: camelCase verbs — e.g., `fireCelebration`, `getRandomEncouragement`, `hashPhrase`, `pullProgress`, `pushProgress`

**Variables and State:**
- Boolean flags: `is` or `has` prefix — e.g., `isComplete`, `isNext`, `isHot`, `hasStreak`, `hasSyncPhrase`, `isConfigured`
- Refs: suffix `Ref` — e.g., `pushTimerRef`, `notesTimerRef`, `syncKeyRef`, `isSyncing`
- localStorage keys: string constants in SCREAMING_SNAKE_CASE — e.g., `SYNC_PHRASE_KEY`, `SYNC_KEY_KEY`, `STORAGE_KEY`

**Constants and Data:**
- Module-level data constants: SCREAMING_SNAKE_CASE — e.g., `PHASES`, `MODULES`, `MILESTONES`, `MILESTONE_DATA`, `ENCOURAGEMENTS`, `ICON_MAP`, `DEFAULT_STATE`
- ESLint is configured to allow unused vars matching `/^[A-Z_]/` pattern, enabling these top-level constants

**Types/Objects:**
- Shape mirroring the data: plain objects with descriptive keys — e.g., `{ current, best, lastStudyDate }` for streak; `{ id, title, phase, week, emoji, description, activities }` for modules

## Code Style

**Formatting:**
- No Prettier config detected — formatting is consistent but managed manually or by editor
- Double quotes for JSX string attributes, double quotes in JS imports
- Trailing commas in multi-line object/array literals
- Semicolons omitted (no-semicolon style throughout)

**Linting:**
- ESLint 9 flat config at `eslint.config.js`
- Plugins: `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`
- Enforces `react-hooks/rules-of-hooks` and `react-hooks/exhaustive-deps`
- `no-unused-vars: error` with exception for SCREAMING_SNAKE constants

## Import Organization

**Order (observed pattern):**
1. Third-party libraries (framer-motion, react-router-dom, lucide-react, sonner)
2. Internal hooks (`../hooks/...`)
3. Internal components (`../components/...`)
4. Internal utils (`../utils/...`)
5. Internal data (`../data/...`)

**Path Aliases:**
- None — all imports use relative paths (e.g., `"../hooks/useProgress"`, `"../data/modules"`)

**Import style:**
- Named exports used for all components, hooks, and utilities
- `App.jsx` uses a default export (required by Vite entry point convention)
- Barrel files are not used — import directly from source files

## Error Handling

**Patterns:**

- `try/catch` with empty catch blocks for non-critical errors — e.g., `storage.js` `loadProgress` catches JSON parse failures and returns default state silently
- Async operations in hooks use `try/catch` and update a `syncStatus` state variable to surface error state to UI rather than throwing
- Null guards via optional chaining — e.g., `completed[moduleId]?.[activityId]`, `phase?.color`
- Graceful degradation: `supabase` client is `null` when env vars are absent; all sync functions guard with `if (!supabase)` checks
- Not-found states render inline fallback UI (e.g., `ModuleDetail` renders a "Can't find that module" view when `module` is undefined)

**Example pattern from `src/utils/storage.js`:**
```js
export function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(DEFAULT_STATE);
    const parsed = JSON.parse(raw);
    return { ...structuredClone(DEFAULT_STATE), ...parsed };
  } catch {
    return structuredClone(DEFAULT_STATE);
  }
}
```

**Example pattern from `src/hooks/useSync.js`:**
```js
try {
  const remote = await pullProgress(key);
  // ... handle success
} catch {
  setSyncStatus("error");
} finally {
  isSyncing.current = false;
}
```

## Logging

**Framework:** None — no logging library used

**Patterns:**
- No `console.log` calls detected anywhere in source
- User-facing feedback uses the `sonner` toast library via `toast()` from `"sonner"`
- Sync status communicated through `syncStatus` state string (`"idle" | "syncing" | "synced" | "error" | "offline"`)

## Comments

**When to Comment:**
- JSDoc-style block comments on utility functions that have non-obvious behavior — e.g., `hashPhrase`, `pullProgress`, `pushProgress` in `src/utils/supabase.js`
- Inline comments for explaining merge strategy logic in `mergeProgress` function in `src/hooks/useSync.js`
- Section comments within large JSX files using `{/* Section Name */}` pattern

**JSDoc usage:**
```js
/**
 * Hash a passphrase into a deterministic key using SHA-256.
 * Same phrase on any device = same row in the database.
 */
export async function hashPhrase(phrase) { ... }
```

**JSX section comments (from `src/pages/ModuleDetail.jsx`):**
```jsx
{/* Nav */}
{/* Header */}
{/* Progress bar */}
{/* Activities */}
```

## Function Design

**Size:** Functions stay focused; complex logic is extracted — e.g., `mergeProgress` is a standalone helper at the bottom of `useSync.js`, `findNextModule` is a standalone helper at the top of `Dashboard.jsx`

**Parameters:**
- Components receive named props destructured in function signature — e.g., `function ModuleCard({ module, completed, isNext })`
- Hooks return structured objects, not arrays — enables named access by callers

**Return Values:**
- Hooks return plain objects with all needed state and actions — e.g., `useProgress` returns `{ state, setState, toggleActivity, setNotes, markMilestoneCelebrated, resetAll, completedCount, totalActivities, overallPercent }`
- Utility functions return values directly or `null`/`false` on failure (no thrown errors to callers)

## Module Design

**Exports:**
- Named exports for all components, hooks, and utilities
- Single default export only for `src/App.jsx` (Vite convention)
- Data constants exported as named exports from `src/data/modules.js`

**Barrel Files:**
- Not used — no `index.js` re-export files exist

**Co-location:**
- Each component is a single file; no separate style files per component (Tailwind classes inline)
- Helper functions that are only used within a file are defined in that same file (e.g., `StatRow` in `Settings.jsx`, `findNextModule` in `Dashboard.jsx`, `mergeProgress` in `useSync.js`)

## React Patterns

**Hooks:**
- `useCallback` wraps all event handlers and async functions to prevent unnecessary re-renders
- `useRef` used for timers (debounce), sync guards (`isSyncing`), and tracking first-render flags
- State initialization with lazy initializer: `useState(loadProgress)` (function reference, not call)
- `useEffect` cleanup always returns cleanup function when setting timers or starting animations

**Props drilling:**
- `progress` and `sync` hook return objects are passed as props directly from `App.jsx` to page components — no context API used

**Styling approach:**
- Tailwind utility classes for layout and spacing
- CSS custom properties (`var(--token)`) for all color, shadow, and font tokens via inline `style` prop
- Framer Motion `motion.*` components used for all animated elements

---

*Convention analysis: 2026-03-28*
