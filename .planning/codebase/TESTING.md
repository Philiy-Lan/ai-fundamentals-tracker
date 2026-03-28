# Testing Patterns

**Analysis Date:** 2026-03-28

## Test Framework

**Runner:** None — no test framework is installed or configured

**Assertion Library:** None

**Run Commands:** No test script exists in `package.json`

The `scripts` block in `package.json` contains only:
```json
"dev": "vite",
"build": "vite build",
"lint": "eslint .",
"preview": "vite preview"
```

No `vitest`, `jest`, `@testing-library/react`, `playwright`, `cypress`, or any testing dependency appears in `dependencies` or `devDependencies`.

## Test File Organization

**Test files:** None found in the codebase. No `.test.js`, `.test.jsx`, `.spec.js`, or `.spec.jsx` files exist anywhere under `src/`.

## What Exists Instead of Tests

**Type safety:** None — the project uses plain JavaScript (`.js`/`.jsx`), no TypeScript

**Linting:** ESLint 9 (`eslint.config.js`) with `react-hooks` plugin enforces hook rules at the lint level — the closest thing to automated correctness checking in this codebase

**Manual verification:** The only quality gate before shipping is `npm run lint`

**Build check:** `vite build` acts as a basic integration check (module resolution errors surface here)

## Critical Logic With No Test Coverage

These are the areas most at risk given the absence of tests:

**`src/utils/storage.js`** — `loadProgress`, `saveProgress`, `exportProgress`, `resetProgress`
- Pure functions operating on localStorage
- Easy to unit test; logic includes JSON parse fallback and `DEFAULT_STATE` spread merge

**`src/hooks/useProgress.js`** — `toggleActivity`, streak calculation, `resetAll`
- Streak logic (yesterday detection, consecutive day counting) is complex and stateful
- Bugs here silently corrupt user data

**`src/hooks/useSync.js`** — `mergeProgress`
- The `mergeProgress` function at the bottom of the file is a pure function with explicit merge strategies (true-wins for activities, longer-wins for notes, higher-wins for streaks, union for milestones)
- Ideal candidate for pure unit tests; no React needed

**`src/utils/supabase.js`** — `hashPhrase`
- Deterministic SHA-256 hash — pure async function, easy to test with known inputs/outputs

## Recommended Testing Setup (if added)

**Recommended framework:** Vitest (matches the existing Vite build toolchain)

**Install:**
```bash
npm install -D vitest @testing-library/react @testing-library/user-event jsdom
```

**Config addition to `vite.config.js`:**
```js
test: {
  environment: 'jsdom',
  globals: true,
}
```

**Run commands (once added):**
```bash
npm run test          # Run all tests
npm run test -- --watch   # Watch mode
npm run test -- --coverage  # Coverage report
```

**Suggested test file locations:**
- Co-located alongside source: `src/utils/storage.test.js`, `src/hooks/useSync.test.js`
- Or in a separate `src/__tests__/` directory

## Patterns to Follow When Tests Are Added

**Pure utility functions (highest priority):**
```js
// src/utils/storage.test.js
import { loadProgress, saveProgress } from './storage'

describe('loadProgress', () => {
  beforeEach(() => localStorage.clear())

  it('returns DEFAULT_STATE when localStorage is empty', () => {
    expect(loadProgress()).toEqual(expect.objectContaining({
      notes: {},
      celebratedMilestones: [],
    }))
  })

  it('falls back to DEFAULT_STATE on corrupt JSON', () => {
    localStorage.setItem('ai-tracker-progress', 'not-json')
    expect(loadProgress()).toEqual(expect.objectContaining({ notes: {} }))
  })
})
```

**Pure merge logic:**
```js
// src/hooks/useSync.test.js — test mergeProgress directly
// Note: mergeProgress is not currently exported; it would need to be exported or tested via the hook
```

**Async hash function:**
```js
// src/utils/supabase.test.js
import { hashPhrase } from './supabase'

it('produces consistent SHA-256 hash for same phrase', async () => {
  const a = await hashPhrase('my secret')
  const b = await hashPhrase('my secret')
  expect(a).toBe(b)
  expect(a).toHaveLength(64) // 256-bit hex
})

it('normalises to lowercase before hashing', async () => {
  const lower = await hashPhrase('hello')
  const upper = await hashPhrase('HELLO')
  expect(lower).toBe(upper)
})
```

## Mocking

**When mocking would be needed:**
- `localStorage` — use `jsdom` environment (auto-provided) or `vi.spyOn(Storage.prototype, 'getItem')`
- `supabase` client — mock `../utils/supabase` module to return `null` (tests offline path) or a spy object
- `crypto.subtle.digest` — available in `jsdom` via Node's Web Crypto API in modern Node versions

**What NOT to mock:**
- `mergeProgress` logic itself — it's pure and should be tested directly
- `DEFAULT_STATE` — test against real values

## Coverage

**Requirements:** None enforced (no config exists)

**Priority areas if coverage is added:**
1. `src/utils/storage.js` — pure functions, zero dependencies
2. `src/hooks/useSync.js` — `mergeProgress` function (complex conflict resolution)
3. `src/utils/supabase.js` — `hashPhrase` determinism
4. `src/hooks/useProgress.js` — streak increment/reset logic

---

*Testing analysis: 2026-03-28*
