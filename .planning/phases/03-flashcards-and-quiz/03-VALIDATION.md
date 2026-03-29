---
phase: 03
slug: flashcards-and-quiz
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-29
---

# Phase 03 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.2 + @testing-library/react 16.3.2 |
| **Config file** | `vite.config.js` (test block: environment jsdom, globals true) |
| **Setup file** | `src/__tests__/setup.js` (imports @testing-library/jest-dom) |
| **Quick run command** | `npm test -- --reporter=verbose` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~2 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- --reporter=verbose`
- **After every plan wave:** Run `npm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 3 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 0 | FLASH-01–06 | unit | `npm test -- src/__tests__/FlashcardViewer.test.jsx` | ❌ W0 | ⬜ pending |
| 03-01-02 | 01 | 0 | QUIZ-01–06 | unit | `npm test -- src/__tests__/QuizViewer.test.jsx` | ❌ W0 | ⬜ pending |
| 03-01-03 | 01 | 0 | D-22 | unit | `npm test -- src/__tests__/ActivityPanel.test.jsx` | ✅ extend | ⬜ pending |
| 03-02-01 | 02 | 1 | CONT-03, CONT-04 | unit | `npm test -- src/__tests__/content.flashcards.test.js src/__tests__/content.quizzes.test.js` | ✅ update | ⬜ pending |
| 03-03-01 | 03 | 2 | FLASH-01–06 | unit | `npm test -- src/__tests__/FlashcardViewer.test.jsx` | ❌ W0 | ⬜ pending |
| 03-04-01 | 04 | 2 | QUIZ-01–06 | unit | `npm test -- src/__tests__/QuizViewer.test.jsx` | ❌ W0 | ⬜ pending |
| 03-05-01 | 05 | 3 | D-22 | unit | `npm test -- src/__tests__/ActivityPanel.test.jsx` | ✅ extend | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/__tests__/FlashcardViewer.test.jsx` — stubs for FLASH-01 through FLASH-06
- [ ] `src/__tests__/QuizViewer.test.jsx` — stubs for QUIZ-01 through QUIZ-06
- [ ] Update `src/__tests__/ActivityPanel.test.jsx` — add flashcards/quiz routing tests + vi.mock stubs
- [ ] Update `src/__tests__/content.flashcards.test.js` — adjust assertions for populated modules 2-8
- [ ] Update `src/__tests__/content.quizzes.test.js` — adjust assertions for populated modules 2-8

*Existing infrastructure covers test framework. Wave 0 creates test files for new components.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| PWA offline availability | PWA-02 | Browser offline mode cannot be tested in jsdom | `npm run build`, open in browser, toggle offline in DevTools, verify flashcards/quiz load |
| Card flip animation visual | FLASH-01 | Animation quality is visual | Open module, tap flashcard, verify smooth flip transition |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 3s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
