# Requirements: AI Fundamentals Tracker — Learning Edition

**Defined:** 2026-03-28
**Core Value:** Every learning activity is accessible and completable inside the app itself — no switching between tools.

## v1 Requirements

### Content Extraction

- [x] **CONT-01**: Extract audio overview files from all 8 NotebookLM notebooks via MCP tools
- [x] **CONT-02**: Extract deck/slide images from all 8 NotebookLM notebooks via MCP tools
- [ ] **CONT-03**: Extract flashcard Q&A pairs from all 8 NotebookLM notebooks via MCP tools
- [ ] **CONT-04**: Extract multiple choice quiz questions from all 8 NotebookLM notebooks via MCP tools
- [ ] **CONT-05**: Organize extracted content into structured static assets (public/audio/, src/data/content/)
- [ ] **CONT-06**: Compress audio files to minimize PWA bundle size (64kbps mono MP3)

### Data Model

- [x] **DATA-01**: Rename "Mind Map" activity to "Deck" across modules.js, storage.js, useProgress.js
- [x] **DATA-02**: Migrate existing localStorage progress data from mindmap → deck keys
- [x] **DATA-03**: Create content data structures for flashcards (JSON per module with question/answer pairs)
- [x] **DATA-04**: Create content data structures for quizzes (JSON per module with questions, options, correct answer)
- [x] **DATA-05**: Create content data structures for Teach-Back prompts (concept explanation prompts per module)

### Activity Panel

- [x] **PANEL-01**: Build ActivityPanel expand-in-place container within ModuleDetail
- [x] **PANEL-02**: ActivityPanel expands/collapses with animation when user taps an activity
- [x] **PANEL-03**: Shared onComplete callback that fires toggleActivity(moduleId, activityId) for all content components

### Audio Player

- [x] **AUDIO-01**: Embedded audio player with play/pause toggle
- [x] **AUDIO-02**: Scrub bar / seek with current time and total duration display
- [x] **AUDIO-03**: Playback speed control (0.5x, 1x, 1.25x, 1.5x, 2x)
- [x] **AUDIO-04**: Auto-complete activity at ~90% playback progress
- [x] **AUDIO-05**: Audio files served from public/audio/ and cached by service worker on first play

### Deck Viewer

- [x] **DECK-01**: Image carousel with previous/next navigation
- [x] **DECK-02**: Slide counter showing current position (e.g., "3 / 12")
- [x] **DECK-03**: Tap/click to zoom image for readability
- [x] **DECK-04**: Auto-complete activity when user reaches last slide
- [x] **DECK-05**: Keyboard arrow key navigation on desktop

### Flashcards

- [ ] **FLASH-01**: Card flip animation to reveal answer
- [ ] **FLASH-02**: Correct / incorrect self-rating buttons after reveal
- [ ] **FLASH-03**: Running session score display (X/Y correct)
- [ ] **FLASH-04**: Card progress indicator (e.g., "5 of 20")
- [ ] **FLASH-05**: Shuffle option to randomize card order
- [ ] **FLASH-06**: Auto-complete activity when all cards reviewed

### Quiz

- [ ] **QUIZ-01**: Multiple choice question display with selectable options
- [ ] **QUIZ-02**: Submit answer and show correct/incorrect result per question
- [ ] **QUIZ-03**: Reveal correct answer on wrong selection
- [ ] **QUIZ-04**: Question progress indicator (e.g., "Q 3 of 10")
- [ ] **QUIZ-05**: Final score screen with percentage
- [ ] **QUIZ-06**: Auto-complete activity on quiz finish

### Teach-Back

- [ ] **TEACH-01**: Module-specific concept prompt displayed to user (e.g., "Explain how transformers use attention")
- [ ] **TEACH-02**: Voice input via Web Speech API (SpeechRecognition)
- [ ] **TEACH-03**: Text input fallback when SpeechRecognition is unavailable (Firefox, etc.)
- [ ] **TEACH-04**: Transcript display showing what was captured
- [ ] **TEACH-05**: Claude API call to evaluate user's explanation and provide feedback
- [ ] **TEACH-06**: AI feedback display with correctness assessment and guidance
- [ ] **TEACH-07**: Graceful offline fallback — "needs connection" message when navigator.onLine is false
- [ ] **TEACH-08**: Claude API proxy (Cloudflare Worker or equivalent) to keep API key server-side

### PWA / Offline

- [x] **PWA-01**: Service worker updated with Workbox runtimeCaching for audio files (CacheFirst strategy)
- [ ] **PWA-02**: All non-audio content (images, JSON) included in precache manifest
- [ ] **PWA-03**: Audio files cached on first play, available offline thereafter

## v2 Requirements

### Audio Enhancements

- **AUDIO-V2-01**: Persist playback position across sessions (localStorage)
- **AUDIO-V2-02**: Audio progress arc overlaid on module progress ring

### Flashcard Enhancements

- **FLASH-V2-01**: Review missed cards (replay incorrect subset after session)
- **FLASH-V2-02**: Keyboard shortcuts (Space to flip, 1/2 for correct/incorrect)

### Quiz Enhancements

- **QUIZ-V2-01**: Quiz attempt history with timestamps in localStorage
- **QUIZ-V2-02**: "Beat your score" prompt showing previous best

### Teach-Back Enhancements

- **TEACH-V2-01**: Multi-turn follow-up questions for deeper assessment
- **TEACH-V2-02**: Teach-Back session history

### Polish

- **POLISH-V2-01**: Celebration trigger (existing confetti system) on any activity completion
- **POLISH-V2-02**: Flashcard difficulty hint before flip (if metadata available)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Spaced repetition (SM-2/FSRS) | Massive scope for a fixed 6-week curriculum; "review missed cards" gives 80% benefit at 10% complexity |
| Audio transcripts/captions | NotebookLM doesn't expose transcripts; generating via Whisper adds cost and scope |
| User-created flashcards | Different product mode; Notes field already serves this need |
| Video content | Not part of NotebookLM assets; codec/storage complexity out of proportion |
| Quiz timer/countdown | Harmful for ADHD learners — directly counter to app's design philosophy |
| Real-time leaderboard | Personal tool; requires multi-user backend that doesn't exist |
| Teach-Back recording/playback | Storage/privacy concerns; transcript display serves the purpose |
| Adaptive quiz ordering | Requires difficulty metadata NotebookLM doesn't expose |
| Supabase-hosted content | User chose offline-first static bundling |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| CONT-01 | Phase 2 | Complete |
| CONT-02 | Phase 2 | Complete |
| CONT-03 | Phase 3 | Pending |
| CONT-04 | Phase 3 | Pending |
| CONT-05 | Phase 3 | Pending |
| CONT-06 | Phase 3 | Pending |
| DATA-01 | Phase 1 | Complete |
| DATA-02 | Phase 1 | Complete |
| DATA-03 | Phase 1 | Complete |
| DATA-04 | Phase 1 | Complete |
| DATA-05 | Phase 1 | Complete |
| PANEL-01 | Phase 1 | Complete |
| PANEL-02 | Phase 1 | Complete |
| PANEL-03 | Phase 1 | Complete |
| AUDIO-01 | Phase 2 | Complete |
| AUDIO-02 | Phase 2 | Complete |
| AUDIO-03 | Phase 2 | Complete |
| AUDIO-04 | Phase 2 | Complete |
| AUDIO-05 | Phase 2 | Complete |
| DECK-01 | Phase 2 | Complete |
| DECK-02 | Phase 2 | Complete |
| DECK-03 | Phase 2 | Complete |
| DECK-04 | Phase 2 | Complete |
| DECK-05 | Phase 2 | Complete |
| FLASH-01 | Phase 3 | Pending |
| FLASH-02 | Phase 3 | Pending |
| FLASH-03 | Phase 3 | Pending |
| FLASH-04 | Phase 3 | Pending |
| FLASH-05 | Phase 3 | Pending |
| FLASH-06 | Phase 3 | Pending |
| QUIZ-01 | Phase 3 | Pending |
| QUIZ-02 | Phase 3 | Pending |
| QUIZ-03 | Phase 3 | Pending |
| QUIZ-04 | Phase 3 | Pending |
| QUIZ-05 | Phase 3 | Pending |
| QUIZ-06 | Phase 3 | Pending |
| TEACH-01 | Phase 4 | Pending |
| TEACH-02 | Phase 4 | Pending |
| TEACH-03 | Phase 4 | Pending |
| TEACH-04 | Phase 4 | Pending |
| TEACH-05 | Phase 4 | Pending |
| TEACH-06 | Phase 4 | Pending |
| TEACH-07 | Phase 4 | Pending |
| TEACH-08 | Phase 4 | Pending |
| PWA-01 | Phase 1 | Complete |
| PWA-02 | Phase 3 | Pending |
| PWA-03 | Phase 2 | Pending |

**Coverage:**
- v1 requirements: 47 total
- Mapped to phases: 47
- Unmapped: 0

Note: Original count of 43 in this file was incorrect. Actual count is 47 (verified by enumeration).

---
*Requirements defined: 2026-03-28*
*Last updated: 2026-03-28 after roadmap creation*
