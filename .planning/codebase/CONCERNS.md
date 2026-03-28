# Codebase Concerns

**Analysis Date:** 2026-03-28

## Tech Debt

**Hardcoded module count in DEFAULT_STATE:**
- Issue: `src/utils/storage.js` hardcodes 8 modules in `DEFAULT_STATE` using `Array.from({ length: 8 }, ...)`. If modules are added or removed from `src/data/modules.js`, the default state goes out of sync silently — new modules won't get default activity slots, and stale keys linger for removed ones.
- Files: `src/utils/storage.js` (lines 5–13), `src/hooks/useProgress.js` (lines 71–82)
- Impact: Adding a 9th module means it has no default entry in `completed`, so activity toggles work but the default shape is wrong. The bug is duplicated — `useProgress.js` has its own copy of `DEFAULT_STATE` logic in `resetAll` that also hardcodes 8.
- Fix approach: Derive default state from `MODULES` imported from `src/data/modules.js`. Single source of truth. Both `storage.js` and `useProgress.js` should import the same builder function.

**Duplicate DEFAULT_STATE definition:**
- Issue: The default progress shape is defined in two places: `src/utils/storage.js` (the canonical location) and again inline inside `resetAll` in `src/hooks/useProgress.js`. They can drift apart.
- Files: `src/utils/storage.js` (lines 3–13), `src/hooks/useProgress.js` (lines 71–83)
- Impact: `resetAll` may reset to a different shape than `loadProgress` falls back to, causing subtle inconsistencies.
- Fix approach: Export `DEFAULT_STATE` or a `makeDefaultState()` factory from `storage.js`. Have `useProgress.js` import and reuse it.

**Activity count hardcoded as magic number 5:**
- Issue: Several files treat 5 as the fixed number of activities per module: `src/hooks/useProgress.js` line 86 (`MODULES.length * 5`), `src/pages/ModuleDetail.jsx` lines 54 and 123 (`if (currentDone === 4)` and `Math.round((doneCount / 5) * 100)`), `src/components/ModuleCard.jsx` line 10 (`doneCount === 5`).
- Files: `src/hooks/useProgress.js`, `src/pages/ModuleDetail.jsx`, `src/components/ModuleCard.jsx`
- Impact: Any module with a different activity count (e.g., a bonus module with 6) will silently miscalculate completion.
- Fix approach: Derive activity count from `module.activities.length` at the point of use rather than assuming 5.

**NotebookLM notebook ID hardcoded in data file:**
- Issue: `NOTEBOOK_ID` and `NOTEBOOK_BASE_URL` are embedded directly in `src/data/modules.js` (lines 130–131). This conflates learning content data with an external integration URL.
- Files: `src/data/modules.js`, `src/components/NotebookLMButton.jsx`
- Impact: Updating the notebook requires editing the data file. If the notebook changes, the link silently breaks for all users with a cached PWA build until they refresh.
- Fix approach: Move to a `src/config/integrations.js` or environment variable so it's clearly a configuration concern, not data.

**Sync phrase stored in plaintext localStorage:**
- Issue: `src/hooks/useSync.js` stores the raw sync phrase in localStorage under `ai-tracker-sync-phrase`. Only the derived hash key is safe — the phrase itself can reconstruct the hash and access all synced data.
- Files: `src/hooks/useSync.js` (lines 5–6, 28–32)
- Impact: Any script with localStorage access (XSS, browser extensions, devtools) can read the phrase and impersonate the user across devices.
- Fix approach: Store only the computed hash (`syncKeyRef.current`) and omit the raw phrase from localStorage. Show the phrase in the UI from React state only (already in `useState`); it will be lost on page reload which is acceptable for a secret.

## Known Bugs

**Module complete toast fires on stale state:**
- Symptoms: When the 5th activity is toggled, `handleToggle` in `ModuleDetail.jsx` checks `currentDone === 4` against `state.completed` *before* the toggle is applied (since `toggleActivity` is async state update). The check is correct at the time of reading but relies on the activity not yet being persisted.
- Files: `src/pages/ModuleDetail.jsx` (lines 52–55)
- Trigger: Toggle the last unchecked activity in any module. The condition works currently but is fragile — it reads pre-toggle state to infer post-toggle completion.
- Workaround: Works correctly today because `wasChecked` is false and `currentDone` is checked before `toggleActivity` is called. However, concurrent toggling or React batching changes could break this. A safer check would be in `useEffect` watching completion state.

**Streak does not decrement or reset when activity is unchecked:**
- Symptoms: Unchecking an activity never updates the streak. If a user checks and unchecks activities on the same day, their streak date is set but could be inflated.
- Files: `src/hooks/useProgress.js` (lines 38–41)
- Trigger: Check an activity (sets streak date to today), then uncheck it. Streak date remains set to today even though no activity is technically completed.
- Workaround: None. This is intentional-feeling but could lead to streak inflation on edge cases where a user checks/unchecks repeatedly across midnight.

**Notes textarea uses `defaultValue` instead of `value`:**
- Symptoms: The notes textarea in `ModuleDetail.jsx` uses `defaultValue`, making it an uncontrolled input. If the component re-renders (e.g., after a sync pull updates `state`), the textarea will NOT reflect the updated notes from remote — it only seeds its initial value.
- Files: `src/pages/ModuleDetail.jsx` (line 229)
- Trigger: Connect sync, open a module, update notes on a second device, trigger a sync pull on the first device. The textarea won't update.
- Workaround: Use `key={state.notes[String(module.id)]}` to force a remount on sync, or convert to a controlled input.

**CelebrationOverlay auto-dismiss timer not reset between milestones:**
- Symptoms: `CelebrationOverlay` fires `onDismiss` via a 6-second `setTimeout` in `useEffect`. The dependency array includes `onDismiss`, which is a new function reference on each render of `ModuleDetail`. In practice this is unlikely to cause double-fires due to the `celebrateMilestone` state, but the effect cleanup/restart on every render is wasteful.
- Files: `src/components/CelebrationOverlay.jsx` (lines 31–38)
- Trigger: Any re-render of the parent while the overlay is visible.

## Security Considerations

**Sync phrase stored in plaintext localStorage:**
- Risk: Raw passphrase readable by any JavaScript on the page or via browser devtools. The phrase is the secret that controls access to all synced progress data in Supabase.
- Files: `src/hooks/useSync.js` (lines 5, 28–32)
- Current mitigation: None. The phrase is stored as-is.
- Recommendations: Remove phrase persistence from localStorage. Require users to re-enter it on each session (it's a short phrase by design), or at minimum document the risk clearly in the Settings UI.

**Supabase Row access is phrase-hash only — no authentication:**
- Risk: Anyone who guesses or brute-forces a sync phrase gains full read/write access to that user's progress row. The Supabase `progress` table relies entirely on the hashed phrase as the row ID, with no additional auth layer.
- Files: `src/utils/supabase.js`
- Current mitigation: SHA-256 hash provides reasonable entropy for typical phrases, but short or common passphrases are vulnerable.
- Recommendations: Document the requirement for a long, random phrase in the Settings UI. Optionally add Supabase Row Level Security (RLS) rules. Consider rate-limiting upsert operations via Supabase Edge Functions.

**No input sanitization on sync phrase before hashing:**
- Risk: The phrase is only trimmed and lowercased before hashing. No length validation or character restriction. Extremely short phrases (e.g., "a") produce valid keys.
- Files: `src/utils/supabase.js` (lines 15–16), `src/pages/Settings.jsx` (line 180 — `disabled={!phraseInput.trim()}`)
- Current mitigation: `disabled` button prevents empty phrase, but allows single-character phrases.
- Recommendations: Enforce a minimum phrase length (e.g., 8 characters) with a UI hint.

## Performance Bottlenecks

**All modules rendered with staggered animation on every Dashboard mount:**
- Problem: `Dashboard.jsx` renders all 8 `ModuleCard` components inside `motion.div` wrappers with delay-based stagger on every mount/re-mount (including when navigating back from a module).
- Files: `src/pages/Dashboard.jsx` (lines 106–118)
- Cause: Framer Motion delay calculated as `0.03 * (phaseIdx * 3 + i)` — runs on every mount, not just first load.
- Improvement path: Track first-render with a ref and skip animation delays on return visits, or use `AnimatePresence` initial={false} to suppress enter animations on back-navigation.

**`schedulePush` fires on every state change including notes debounce:**
- Problem: `useSync.js` schedules a Supabase push on every `state` change (line 108). Notes are debounced in `ModuleDetail.jsx` (500ms) but each keystroke still causes a React state update that queues a sync push (1500ms). Two debounce timers run in parallel rather than one.
- Files: `src/hooks/useSync.js` (lines 101–109), `src/pages/ModuleDetail.jsx` (lines 79–86)
- Cause: Notes are saved to localStorage on every debounced keystroke via `setNotes`, which calls `saveProgress` and `setState`, triggering the sync useEffect.
- Improvement path: Separate notes from the synced state or increase the push debounce. Consider only pushing on activity toggles and explicit saves rather than all state changes.

## Fragile Areas

**`useSync` pull on mount can overwrite local progress with older remote data:**
- Files: `src/hooks/useSync.js` (lines 95–99)
- Why fragile: On app mount, if a sync key exists, the code immediately pulls remote data and merges it. The merge strategy ("true wins" for activities, "longer wins" for notes) is sound but there is no timestamp comparison. If remote data is stale (e.g., set on an older device), the merge silently unions all activity completions even if the user reset intentionally on the new device.
- Safe modification: Any changes to merge strategy in `mergeProgress` need careful consideration of the reset flow. Currently, resetting progress locally does NOT push the reset to remote — a re-mount will re-pull and re-merge the old completed activities back.
- Test coverage: No tests exist for merge behavior.

**`resetAll` does not push reset to remote:**
- Files: `src/hooks/useProgress.js` (lines 68–84)
- Why fragile: `resetAll` clears localStorage and updates React state, but `useSync.js` will then push the fresh state via the `schedulePush` effect — only if `state` changes trigger the `useEffect`. However, there is a `isFirstRender` guard (line 102–107) that skips the first push after mount, not after reset. On reset, the push *should* fire, but the sequence depends on React render ordering. If a re-mount occurs, the old remote data will be pulled and merged back over the reset, undoing it.
- Safe modification: Add an explicit `pushProgress` call in `resetAll` (or expose a `pushNow` method from `useSync`) to ensure the reset state is persisted to remote immediately.

**Module ID type inconsistency (number vs string):**
- Files: `src/data/modules.js` (IDs are numbers), `src/utils/storage.js` (keys stored as strings via `String(i + 1)`), `src/pages/ModuleDetail.jsx` (uses `Number(id)` from URL params), `src/hooks/useProgress.js` (uses `String(module.id)`)
- Why fragile: Module IDs are numbers in `MODULES`, but all storage keys are strings. `useParams` returns a string, converted to number for `.find()`. Any new code that forgets a `String()` or `Number()` conversion will silently fail to find or save the right module.
- Safe modification: Standardize on one type throughout. String keys in storage is correct (JSON keys are strings); make `MODULES` IDs strings to match, or add a central lookup helper that always coerces.

## Scaling Limits

**localStorage as primary store — ~5MB browser limit:**
- Current capacity: localStorage allows ~5MB per origin. The current data structure (8 modules × 5 boolean activities + notes text) is tiny. However, if notes become large or the module count grows significantly, this limit could be approached.
- Limit: Notes would need to be extremely long (hundreds of KB each) to hit the ceiling with 8 modules.
- Scaling path: Supabase sync already handles cross-device persistence; localStorage functions as a local cache. No action needed for current scope.

**Module list is static data — no dynamic loading:**
- Current capacity: 8 modules hardcoded in `src/data/modules.js`.
- Limit: Adding new modules requires a code change and rebuild. No CMS or remote data source.
- Scaling path: If the curriculum expands significantly, consider extracting modules to a JSON file fetched at runtime, or a headless CMS. For current scope (a personal tracker), this is not a concern.

## Dependencies at Risk

**`vite` at ^8.0.1 (major version):**
- Risk: Vite 8 is a recent major release. The `^` range will auto-install patch/minor updates. The ecosystem (plugins) may lag behind major Vite versions.
- Impact: `@vitejs/plugin-react` at ^6.0.1, `vite-plugin-pwa` at ^1.2.0, and `@tailwindcss/vite` at ^4.2.2 all need to stay compatible with Vite 8.
- Migration plan: Pin Vite to a specific minor version in CI to prevent surprise breakage on `npm install`.

**`framer-motion` at ^12.38.0:**
- Risk: Framer Motion has a history of breaking API changes between major versions. The `^12` range is locked to major 12, which is appropriate. No immediate risk, but monitor for deprecations.
- Impact: Used extensively across all pages and components — a required upgrade would touch most files.
- Migration plan: No action needed now. Watch for v13 announcements.

**`react` and `react-dom` at ^19.2.4:**
- Risk: React 19 is the current stable major. Using `^19` is safe. The React 19 concurrent features (used implicitly via StrictMode) are relied upon throughout.
- Impact: Stable. No risk.

## Missing Critical Features

**No import/restore from JSON export:**
- Problem: `src/pages/Settings.jsx` provides an Export button that downloads progress as JSON, but there is no corresponding import/restore function.
- Blocks: If a user loses localStorage (clears browser data, new device without sync configured), the export file is useless — they cannot restore from it.
- Files: `src/pages/Settings.jsx`, `src/utils/storage.js`

**No error boundary:**
- Problem: The app has no React error boundary. Any unhandled render error (e.g., malformed localStorage data that passes the shallow merge in `loadProgress`) will crash the entire app with a blank white screen.
- Blocks: Recovery from corrupted localStorage state requires manual devtools intervention.
- Files: `src/main.jsx`, `src/App.jsx`

**Offline "syncing" status is never set:**
- Problem: `useSync.js` defines an `"offline"` status in its state machine comments and the Settings `statusLabel` map, but nothing in the code ever sets `syncStatus` to `"offline"`. Network failures result in `"error"` status only.
- Files: `src/hooks/useSync.js`, `src/pages/Settings.jsx` (line 54)

## Test Coverage Gaps

**No tests exist:**
- What's not tested: The entire codebase has zero test files. No unit, integration, or E2E tests.
- Files: All of `src/`
- Risk: Core logic with subtle edge cases goes unverified — specifically `mergeProgress` in `src/hooks/useSync.js`, streak calculation in `src/hooks/useProgress.js`, and the `loadProgress` fallback behavior in `src/utils/storage.js`.
- Priority: High for `mergeProgress` (data loss risk), Medium for streak logic (user-visible correctness), Low for UI components (visual regression risk is lower for a personal tool).

---

*Concerns audit: 2026-03-28*
