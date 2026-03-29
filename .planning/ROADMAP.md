# Roadmap: AI Fundamentals Tracker — Learning Edition

## Overview

This milestone transforms the existing progress tracker into a fully embedded learning experience. Eight curriculum modules each gain four interactive activity types (audio, deck, flashcards, quiz) plus a Claude-powered Teach-Back conversation feature. The build order is driven by hard dependencies: the data model migration and ActivityPanel scaffold must come first (everything else mounts onto them), static content extraction precedes each component set, and the Claude API proxy decision must be locked before any Teach-Back code is written.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [x] **Phase 1: Foundation** - Data model migration, ActivityPanel scaffold, and Workbox audio caching config (completed 2026-03-28)
- [ ] **Phase 2: Audio and Deck** - Embedded audio player and image deck carousel with content extraction for both
- [ ] **Phase 3: Flashcards and Quiz** - Interactive flashcard and quiz components with remaining content extraction
- [ ] **Phase 4: Teach-Back** - Claude API-powered voice/text concept evaluation with proxy and offline fallback

## Phase Details

### Phase 1: Foundation
**Goal**: The app data model, ActivityPanel container, and PWA audio caching strategy are in place — every subsequent phase mounts onto this without breaking existing progress
**Depends on**: Nothing (first phase)
**Requirements**: DATA-01, DATA-02, DATA-03, DATA-04, DATA-05, PANEL-01, PANEL-02, PANEL-03, PWA-01
**Success Criteria** (what must be TRUE):
  1. Tapping any activity on a module detail page expands an ActivityPanel in place with smooth open/close animation
  2. Existing user progress (streaks, completion marks, notes) is fully preserved after the mindmap → deck data migration
  3. Modules.js, storage.js, and useProgress.js all reference "deck" — no "mindmap" string remains in the codebase
  4. Workbox runtimeCaching is configured for /audio/** with CacheFirst strategy — audio is not included in the precache manifest
  5. JSON data structures for flashcards, quizzes, and Teach-Back prompts exist for at least one module (scaffold for Phase 2 and 3 work)
**Plans**: 4 plans

Plans:
- [x] 01-01-PLAN.md — Test framework setup (Wave 0): install Vitest, write all Phase 1 test stubs in RED state
- [x] 01-02-PLAN.md — Data migration (Wave 1): rename mindmap → deck across modules.js, storage.js, useProgress.js, useSync.js, ActivityCheckbox.jsx
- [x] 01-03-PLAN.md — ActivityPanel scaffold (Wave 1): build ActivityPanel component and wire into ModuleDetail.jsx
- [x] 01-04-PLAN.md — Content scaffolds + PWA config (Wave 1): create flashcards/quizzes/teachback data files, public directory placeholders, Workbox runtimeCaching

### Phase 2: Audio and Deck
**Goal**: Users can listen to audio overviews and browse deck slides for all 8 modules, with completion auto-detected and progress updated
**Depends on**: Phase 1
**Requirements**: CONT-01, CONT-02, AUDIO-01, AUDIO-02, AUDIO-03, AUDIO-04, AUDIO-05, DECK-01, DECK-02, DECK-03, DECK-04, DECK-05, PWA-03
**Success Criteria** (what must be TRUE):
  1. User can play/pause an audio overview, scrub to any position, and change playback speed (0.5x–2x) inside the module detail page
  2. Audio activity is auto-marked complete when playback reaches ~90% — the module's progress ring updates immediately
  3. User can swipe or tap prev/next through deck slides, see "3 / 12" position, tap to zoom, and navigate with arrow keys on desktop
  4. Deck activity is auto-marked complete when the last slide is reached
  5. Audio files load and play on a device that has gone offline after the first play (service worker cache confirmed on physical iOS device)
**Plans**: 5 plans

Plans:
- [ ] 02-01-PLAN.md — Content extraction (Wave 1): extract audio MP3s and deck slide PNGs from all 8 NotebookLM notebooks via MCP tools; write manifests; add deckSlideCount to modules.js
- [ ] 02-02-PLAN.md — Test stubs RED state (Wave 1): write AudioPlayer.test.jsx and DeckViewer.test.jsx; update ActivityPanel.test.jsx placeholder assertion
- [ ] 02-03-PLAN.md — AudioPlayer component (Wave 2): install react-h5-audio-player; implement play/pause, scrub, speed selector, auto-complete at 90%
- [ ] 02-04-PLAN.md — DeckViewer component (Wave 2): install embla-carousel-react; implement carousel, counter, zoom modal, keyboard nav, auto-complete on last slide
- [ ] 02-05-PLAN.md — ActivityPanel integration (Wave 3): wire AudioPlayer and DeckViewer into ActivityPanel content routing; human end-to-end verification

### Phase 3: Flashcards and Quiz
**Goal**: Users can test their knowledge with interactive flashcards and multiple-choice quizzes for all 8 modules, with session scores tracked and completion auto-detected
**Depends on**: Phase 2
**Requirements**: CONT-03, CONT-04, CONT-05, CONT-06, FLASH-01, FLASH-02, FLASH-03, FLASH-04, FLASH-05, FLASH-06, QUIZ-01, QUIZ-02, QUIZ-03, QUIZ-04, QUIZ-05, QUIZ-06, PWA-02
**Success Criteria** (what must be TRUE):
  1. User can tap a flashcard to flip it with animation, rate themselves correct or incorrect, and see a running score ("12 / 20 correct") while working through a deck
  2. Flashcard activity is auto-marked complete when all cards have been reviewed; shuffle option randomizes card order
  3. User can select a multiple-choice answer, submit it, see immediately whether it was right or wrong (with correct answer revealed on wrong selection), and view a final score screen with percentage
  4. Quiz activity is auto-marked complete when the final question is acknowledged
  5. All flashcard and quiz content (images, JSON) is included in the Workbox precache manifest and available fully offline
**Plans**: TBD

### Phase 4: Teach-Back
**Goal**: Users can speak or type an explanation of a module concept, receive Claude AI evaluation and feedback, and get a graceful "needs connection" message when offline
**Depends on**: Phase 3
**Requirements**: TEACH-01, TEACH-02, TEACH-03, TEACH-04, TEACH-05, TEACH-06, TEACH-07, TEACH-08
**Success Criteria** (what must be TRUE):
  1. User sees a module-specific concept prompt (e.g., "Explain how transformers use attention") and can speak their explanation via voice input — a live transcript displays as they talk
  2. User can switch to a text input field when voice is unavailable (Firefox) or preferred, and submit the same way
  3. After submitting, Claude evaluates the explanation and displays feedback with a correctness assessment and guidance — response appears within a few seconds
  4. When the device is offline, the Teach-Back activity shows a clear "needs connection" message instead of a broken UI or silent failure
  5. The Claude API key is never exposed in the client bundle — all API calls route through a server-side proxy (Cloudflare Worker or equivalent)
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 4/4 | Complete   | 2026-03-28 |
| 2. Audio and Deck | 0/5 | Not started | - |
| 3. Flashcards and Quiz | 0/? | Not started | - |
| 4. Teach-Back | 0/? | Not started | - |
