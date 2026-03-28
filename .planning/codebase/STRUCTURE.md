# Codebase Structure

**Analysis Date:** 2026-03-28

## Directory Layout

```
ai-tracker/
├── public/                  # Static assets served at root
│   ├── icons/               # PWA icons (icon-192.png, icon-512.png, apple-touch-icon.png)
│   └── favicon.svg          # Browser tab icon
├── src/                     # All application source code
│   ├── main.jsx             # React bootstrap / app entry point
│   ├── App.jsx              # Router, global providers, hook initialization
│   ├── index.css            # Global styles, CSS custom properties, Tailwind import
│   ├── components/          # Reusable UI components
│   ├── data/                # Static curriculum data
│   ├── hooks/               # Custom React hooks
│   ├── pages/               # Full-screen route views
│   └── utils/               # Pure helpers and thin service wrappers
├── .planning/               # GSD planning documents (not shipped)
│   └── codebase/            # Codebase analysis documents
├── index.html               # HTML shell and PWA meta tags
├── vite.config.js           # Vite build config + PWA plugin setup
├── eslint.config.js         # ESLint flat config
├── package.json             # Dependencies and npm scripts
├── .env.example             # Template for required environment variables
└── .gitignore
```

## Directory Purposes

**`src/pages/`:**
- Purpose: Full-screen views, one file per route
- Contains: Layout composition, local UI state, route param reading
- Key files:
  - `src/pages/Dashboard.jsx` — route `/`, overview with ring, streak, phase bars, module list
  - `src/pages/ModuleDetail.jsx` — route `/module/:id`, activity checklist, notes, milestone detection
  - `src/pages/Settings.jsx` — route `/settings`, sync config, export, reset

**`src/components/`:**
- Purpose: Reusable, route-agnostic UI pieces
- Contains: Display components and self-contained interactive elements
- Key files:
  - `src/components/ActivityCheckbox.jsx` — animated toggleable row for each activity
  - `src/components/ModuleCard.jsx` — tappable module row with dot progress indicators
  - `src/components/ProgressRing.jsx` — animated SVG ring showing overall completion
  - `src/components/PhaseBar.jsx` — horizontal progress bar for a learning phase
  - `src/components/StreakCounter.jsx` — streak pill with fire emoji animation
  - `src/components/CelebrationOverlay.jsx` — full-screen confetti + message at milestones
  - `src/components/ModuleComplete.jsx` — toast-style banner when a module is finished
  - `src/components/NotebookLMButton.jsx` — external link to the shared NotebookLM notebook

**`src/hooks/`:**
- Purpose: Encapsulate stateful logic away from UI
- Contains: Custom hooks only — no components
- Key files:
  - `src/hooks/useProgress.js` — owns all progress state; reads/writes localStorage; exposes mutation functions
  - `src/hooks/useSync.js` — manages Supabase sync lifecycle; debounced push; pull on mount; merge on conflict

**`src/data/`:**
- Purpose: Static data constants that define the curriculum
- Contains: Plain JS exports, no dynamic content
- Key files:
  - `src/data/modules.js` — exports `PHASES`, `MODULES`, `NOTEBOOK_ID`, `NOTEBOOK_BASE_URL`

**`src/utils/`:**
- Purpose: Pure functions and thin wrappers; no React
- Contains: Side-effectful helpers isolated from component logic
- Key files:
  - `src/utils/storage.js` — `loadProgress`, `saveProgress`, `exportProgress`, `resetProgress` (localStorage)
  - `src/utils/supabase.js` — Supabase client instantiation, `hashPhrase`, `pullProgress`, `pushProgress`
  - `src/utils/confetti.js` — `fireCelebration` wrapper around `canvas-confetti`
  - `src/utils/encouragements.js` — `getRandomEncouragement` returning a random string from a fixed array

**`public/`:**
- Purpose: Static files copied as-is to build output root
- Generated: No — hand-placed assets
- Committed: Yes

## Key File Locations

**Entry Points:**
- `index.html`: HTML shell, loads `src/main.jsx` as ES module
- `src/main.jsx`: React root creation, BrowserRouter, StrictMode
- `src/App.jsx`: Route table, `useProgress` + `useSync` instantiation, page transitions

**Configuration:**
- `vite.config.js`: Build, dev server, PWA manifest, workbox settings
- `eslint.config.js`: ESLint flat config for React + hooks
- `.env.example`: Documents `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- `src/index.css`: CSS custom properties (design tokens), global resets, Tailwind import

**Core Logic:**
- `src/hooks/useProgress.js`: All progress state mutations and derived values
- `src/hooks/useSync.js`: Complete sync state machine and merge logic
- `src/utils/storage.js`: localStorage schema and default state definition

**Curriculum Data:**
- `src/data/modules.js`: All module/activity definitions — the single source of truth for curriculum content

## Naming Conventions

**Files:**
- React components: PascalCase matching the exported component name — `ModuleCard.jsx`, `ProgressRing.jsx`
- Hooks: camelCase prefixed with `use` — `useProgress.js`, `useSync.js`
- Utils: camelCase by responsibility — `storage.js`, `supabase.js`, `confetti.js`, `encouragements.js`
- Data: camelCase by domain — `modules.js`

**Directories:**
- Lowercase plural by type — `components/`, `pages/`, `hooks/`, `utils/`, `data/`

**Exports:**
- Named exports used throughout (no default exports except `App`)
- Component names match filenames exactly

**CSS:**
- Tailwind utility classes for layout, spacing, typography
- CSS custom properties (e.g. `var(--bg-card)`, `var(--phase-1)`) for design tokens
- Inline `style` props used when values are dynamic or come from JS data (e.g. `phase.color`)

**Constants:**
- Module-level constants in SCREAMING_SNAKE_CASE — `PHASES`, `MODULES`, `STORAGE_KEY`, `SYNC_PHRASE_KEY`, `MILESTONE_DATA`

## Where to Add New Code

**New page / route:**
- Page component: `src/pages/NewPage.jsx`
- Add `<Route>` to `src/App.jsx`
- Pass `progress` and/or `sync` props from `App.jsx` as needed (matches existing pattern)

**New UI component:**
- Implementation: `src/components/ComponentName.jsx`
- Use named export matching filename
- Import CSS tokens via `var(--token-name)` inline styles or Tailwind classes

**New utility function:**
- If related to an existing concern (storage, supabase, etc.) add to the appropriate `src/utils/*.js` file
- If a new concern, create `src/utils/newUtil.js`

**New hook:**
- `src/hooks/useNewHook.js`
- Instantiate in `src/App.jsx` and pass down via props (current pattern)

**Adding curriculum content:**
- Add entries to `MODULES` array in `src/data/modules.js`
- Each module must include `id` (unique number), `phase` (1–3), `week`, `emoji`, `title`, `description`, and `activities[]`
- Update `DEFAULT_STATE` in `src/utils/storage.js` if module count changes (currently hardcodes 8 modules)
- `totalActivities` calculation in `useProgress.js` uses `MODULES.length * 5` — no hardcoding needed there

**New environment variable:**
- Add to `.env.example` with a comment
- Read via `import.meta.env.VITE_*` (Vite convention; only `VITE_` prefixed vars are exposed to client)

## Special Directories

**`.planning/`:**
- Purpose: GSD planning and analysis documents
- Generated: By GSD map-codebase and plan-phase commands
- Committed: Yes (source of truth for project planning)

**`public/icons/`:**
- Purpose: PWA icon assets referenced in `vite.config.js` manifest
- Required files: `icon-192.png`, `icon-512.png`, `apple-touch-icon.png`
- Generated: No — must be created manually or by design tooling

---

*Structure analysis: 2026-03-28*
