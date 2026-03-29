---
phase: 2
slug: audio-and-deck
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-29
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest + @testing-library/react (installed in Phase 1) |
| **Config file** | vite.config.js (test block from Phase 1) |
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
| 02-01-T1 | 02-01 | 1 | CONT-01 | filesystem | `ls public/audio/*/overview.mp3 \| wc -l` | n/a | ⬜ pending |
| 02-01-T2 | 02-01 | 1 | CONT-02 | filesystem | `ls public/decks/*/slide-*.png \| wc -l` | n/a | ⬜ pending |
| 02-02-T1 | 02-02 | 1 | AUDIO-01-05 | unit | `npx vitest run src/__tests__/AudioPlayer.test.jsx` | ❌ W1 | ⬜ pending |
| 02-02-T2 | 02-02 | 1 | DECK-01-05 | unit | `npx vitest run src/__tests__/DeckViewer.test.jsx` | ❌ W1 | ⬜ pending |
| 02-02-T3 | 02-02 | 1 | PANEL | unit | `npx vitest run src/__tests__/ActivityPanel.test.jsx` | ✅ | ⬜ pending |
| 02-03-T1 | 02-03 | 2 | AUDIO-01-03 | unit | `npx vitest run src/__tests__/AudioPlayer.test.jsx` | ❌ W1 | ⬜ pending |
| 02-03-T2 | 02-03 | 2 | AUDIO-04 | unit | `npx vitest run src/__tests__/AudioPlayer.test.jsx` | ❌ W1 | ⬜ pending |
| 02-04-T1 | 02-04 | 2 | DECK-01-03 | unit | `npx vitest run src/__tests__/DeckViewer.test.jsx` | ❌ W1 | ⬜ pending |
| 02-04-T2 | 02-04 | 2 | DECK-04-05 | unit | `npx vitest run src/__tests__/DeckViewer.test.jsx` | ❌ W1 | ⬜ pending |
| 02-05-T1 | 02-05 | 3 | CONT-01,02 | unit+build | `npx vitest run && npm run build` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

*Existing test infrastructure from Phase 1 covers all framework needs. No Wave 0 additions required.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Audio playback on iOS Safari | AUDIO-05, PWA-03 | iOS audio restrictions require physical device | Play audio on iOS device. Close tab. Reopen (offline). Audio should play from cache. |
| Playback speed persistence during playback | AUDIO-03 | HTMLAudioElement.playbackRate resets on iOS after seek — needs device testing | Set speed to 1.5x, scrub forward, verify speed stays 1.5x |
| Deck swipe gesture | DECK-01 | Touch gesture requires real mobile device | Swipe left/right on deck slides on mobile device |
| Deck zoom readability | DECK-03 | Image quality/readability is subjective | Tap slide image, verify zoomed view is readable |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
