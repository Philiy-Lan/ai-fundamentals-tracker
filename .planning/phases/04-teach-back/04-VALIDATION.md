---
phase: 04
slug: teach-back
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-29
---

# Phase 04 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.2 + @testing-library/react 16.3.2 |
| **Config file** | `vite.config.js` (test block: environment jsdom, globals true) |
| **Quick run command** | `npx vitest run src/__tests__/TeachBackViewer.test.jsx` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~2 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run src/__tests__/TeachBackViewer.test.jsx`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 3 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 01 | 0 | TEACH-01–07 | unit | `npx vitest run src/__tests__/TeachBackViewer.test.jsx` | ❌ W0 | ⬜ pending |
| 04-01-02 | 01 | 0 | TEACH-08 | unit | `npx vitest run src/__tests__/ActivityPanel.test.jsx` | ✅ extend | ⬜ pending |
| 04-02-01 | 02 | 1 | TEACH-08 | unit | `npx vitest run src/__tests__/TeachBackViewer.test.jsx` | ❌ W0 | ⬜ pending |
| 04-03-01 | 03 | 2 | TEACH-01–07 | unit | `npx vitest run src/__tests__/TeachBackViewer.test.jsx` | ❌ W0 | ⬜ pending |
| 04-04-01 | 04 | 3 | TEACH-08 | integration | manual Vercel deploy test | manual | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/__tests__/TeachBackViewer.test.jsx` — stubs for TEACH-01 through TEACH-07 with SpeechRecognition mocks
- [ ] Update `src/__tests__/content.teachback.test.js` — update "modules 2-8 are empty" assertion when content populated
- [ ] Update `src/__tests__/ActivityPanel.test.jsx` — add `case "teachback"` routing test + vi.mock stub

*Existing infrastructure covers test framework. Wave 0 creates test files for the new component.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Voice recording works in Chrome | TEACH-02 | Web Speech API not in jsdom | Open in Chrome, tap mic, speak, verify transcript |
| Vercel API route responds | TEACH-08 | Requires live deployment | Deploy, call `/api/evaluate` with test payload |
| Offline fallback message | TEACH-07 | `navigator.onLine` mock limited | Toggle offline in DevTools, open Teach-Back |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 3s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
