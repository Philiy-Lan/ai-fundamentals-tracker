# Requirements: AI Fundamentals Tracker — Learning Edition

**Defined:** 2026-03-28
**Core Value:** Every learning activity is accessible and completable inside the app itself — no switching between tools.

## v1 Requirements

### Content Extraction

- [ ] **CONT-01**: Extract audio overview files from all 8 NotebookLM notebooks via MCP tools
- [ ] **CONT-02**: Extract deck/slide images from all 8 NotebookLM notebooks via MCP tools
- [ ] **CONT-03**: Extract flashcard Q&A pairs from all 8 NotebookLM notebooks via MCP tools
- [ ] **CONT-04**: Extract multiple choice quiz questions from all 8 NotebookLM notebooks via MCP tools
- [ ] **CONT-05**: Organize extracted content into structured static assets (public/audio/, src/data/content/)
- [ ] **CONT-06**: Compress audio files to minimize PWA bundle size (64kbps mono MP3)

### Data Model

- [ ] **DATA-01**: Rename "Mind Map" activity to "Deck" across modules.js, storage.js, useProgress.js
- [ ] **DATA-02**: Migrate existing localStorage progress data from mindmap → deck keys
- [ ] **DATA-03**: Create content data structures for flashcards (JSON per module with question/answer pairs)
- [ ] **DATA-04**: Create content data structures for quizzes (JSON per module with questions, options, correct answer)
- [ ] **DATA-05**: Create content data structures for Teach-Back prompts (concept explanation prompts per module)

### Activity Panel

- [ ] **PANEL-01**: Build ActivityPanel expand-in-place container within ModuleDetail
- [ ] **PANEL-02**: ActivityPanel expands/collapses with animation when user taps an activity
- [ ] **PANEL-03**: Shared onComplete callback that fires toggleActivity(moduleId, activityId) for all content components

### Audio Player

- [ ] **AUDIO-01**: Embedded audio player with play/pause toggle
- [ ] **AUDIO-02**: Scrub bar / seek with current time and total duration display
- [ ] **AUDIO-03**: Playback speed control (0.5x, 1x, 1.25x, 1.5x, 2x)
- [ ] **AUDIO-04**: Auto-complete activity at ~90% playback progress
- [ ] **AUDIO-05**: Audio files served from public/audio/ and cached by service worker on first play

### Deck Viewer

- [ ] **DECK-01**: Image carousel with previous/next navigation
- [ ] **DECK-02**: Slide counter showing current position (e.g., "3 / 12")
- [ ] **DECK-03**: Tap/click to zoom image for readability
- [ ] **DECK-04**: Auto-complete activity when user reaches last slide
- [ ] **DECK-05**: Keyboard arrow key navigation on desktop

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

- [ ] **PWA-01**: Service worker updated with Workbox runtimeCaching for audio files (CacheFirst strategy)
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
| CONT-01 | TBD | Pending |
| CONT-02 | TBD | Pending |
| CONT-03 | TBD | Pending |
| CONT-04 | TBD | Pending |
| CONT-05 | TBD | Pending |
| CONT-06 | TBD | Pending |
| DATA-01 | TBD | Pending |
| DATA-02 | TBD | Pending |
| DATA-03 | TBD | Pending |
| DATA-04 | TBD | Pending |
| DATA-05 | TBD | Pending |
| PANEL-01 | TBD | Pending |
| PANEL-02 | TBD | Pending |
| PANEL-03 | TBD | Pending |
| AUDIO-01 | TBD | Pending |
| AUDIO-02 | TBD | Pending |
| AUDIO-03 | TBD | Pending |
| AUDIO-04 | TBD | Pending |
| AUDIO-05 | TBD | Pending |
| DECK-01 | TBD | Pending |
| DECK-02 | TBD | Pending |
| DECK-03 | TBD | Pending |
| DECK-04 | TBD | Pending |
| DECK-05 | TBD | Pending |
| FLASH-01 | TBD | Pending |
| FLASH-02 | TBD | Pending |
| FLASH-03 | TBD | Pending |
| FLASH-04 | TBD | Pending |
| FLASH-05 | TBD | Pending |
| FLASH-06 | TBD | Pending |
| QUIZ-01 | TBD | Pending |
| QUIZ-02 | TBD | Pending |
| QUIZ-03 | TBD | Pending |
| QUIZ-04 | TBD | Pending |
| QUIZ-05 | TBD | Pending |
| QUIZ-06 | TBD | Pending |
| TEACH-01 | TBD | Pending |
| TEACH-02 | TBD | Pending |
| TEACH-03 | TBD | Pending |
| TEACH-04 | TBD | Pending |
| TEACH-05 | TBD | Pending |
| TEACH-06 | TBD | Pending |
| TEACH-07 | TBD | Pending |
| TEACH-08 | TBD | Pending |
| PWA-01 | TBD | Pending |
| PWA-02 | TBD | Pending |
| PWA-03 | TBD | Pending |

**Coverage:**
- v1 requirements: 43 total
- Mapped to phases: 0
- Unmapped: 43 (pending roadmap creation)

---
*Requirements defined: 2026-03-28*
*Last updated: 2026-03-28 after initial definition*
