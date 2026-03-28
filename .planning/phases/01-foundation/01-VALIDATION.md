---
phase: 1
slug: foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-28
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest + @testing-library/react (Wave 0 installs — no test framework currently exists) |
| **Config file** | vite.config.js (vitest uses same config) |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run --reporter=verbose` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run --reporter=verbose`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01 | 01 | 0 | - | setup | `npx vitest --version` | ❌ W0 | ⬜ pending |
| 01-02 | 02 | 1 | DATA-01 | unit | `npx vitest run` | ❌ W0 | ⬜ pending |
| 01-03 | 02 | 1 | DATA-02 | unit | `npx vitest run` | ❌ W0 | ⬜ pending |
| 01-04 | 03 | 1 | PANEL-01 | manual | visual check | n/a | ⬜ pending |
| 01-05 | 03 | 1 | PANEL-02 | manual | visual check | n/a | ⬜ pending |
| 01-06 | 03 | 1 | PANEL-03 | unit | `npx vitest run` | ❌ W0 | ⬜ pending |
| 01-07 | 04 | 1 | PWA-01 | manual | Lighthouse PWA audit | n/a | ⬜ pending |
| 01-08 | 05 | 2 | DATA-03,04,05 | unit | `npx vitest run` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Install vitest, @testing-library/react, @testing-library/jest-dom, jsdom
- [ ] Create vitest config in vite.config.js (test block)
- [ ] Create `src/__tests__/` directory
- [ ] Stub test for storage.js loadProgress migration logic
- [ ] Stub test for modules.js deck activity definition

*Research found no test framework installed. Wave 0 must install before any automated verification.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| ActivityPanel expand/collapse animation | PANEL-01, PANEL-02 | Visual animation quality requires human eye | Tap activity row → panel expands smoothly. Tap again → collapses. Tap different activity → first closes, second opens. |
| Workbox audio caching config | PWA-01 | Requires built PWA + dev tools | Build app, open in Chrome DevTools → Application → Service Workers. Check runtimeCaching includes audio/** with CacheFirst. |
| Existing progress preserved | DATA-02 | Requires pre-existing localStorage data | Set some mindmap activities to true in localStorage before migration. Load app. Verify deck activities show as completed. Streaks and notes intact. |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
