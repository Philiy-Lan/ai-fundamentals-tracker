# AI Fundamentals Tracker — Learning Edition

## What This Is

An all-in-one AI learning and progress tracking PWA. Currently a pure progress tracker with checkboxes for 8 AI modules across 3 phases. The next milestone transforms it into an interactive learning app by embedding NotebookLM-generated content (audio overviews, deck slides, flashcards, quizzes) directly into each module, and adding a Claude-powered Teach-Back voice conversation feature.

## Core Value

Every learning activity is accessible and completable inside the app itself — no switching between NotebookLM and the tracker. Study offline, track progress, and test understanding in one place.

## Requirements

### Validated

- ✓ Progress tracking with animated rings and visual indicators — existing
- ✓ Module activity management with 5 activity types per module — existing
- ✓ Streak counter for daily engagement motivation — existing
- ✓ Celebration animations and confetti on milestone completion — existing
- ✓ Notes/insights tracking per module — existing
- ✓ Cloud sync via Supabase (optional, app works offline) — existing
- ✓ PWA with offline asset caching — existing
- ✓ ADHD-aware UX with encouragement messages — existing
- ✓ Export progress functionality — existing

### Active

- [ ] Extract content from 8 NotebookLM notebooks (one per module) via MCP tools
- [ ] Embedded audio player for Audio Overview activities (bundled audio files)
- [ ] Image carousel for Deck activities (replacing Mind Map, bundled deck images)
- [ ] Interactive flashcard component (reveal answer, mark correct/incorrect, track score)
- [ ] Multiple choice quiz component with scoring
- [ ] Claude API-powered Teach-Back voice conversation (asks user to explain concepts, evaluates understanding)
- [ ] Update activity definitions (rename Mind Map → Deck, update icons)
- [ ] All content bundled as static assets for offline-first PWA
- [ ] Service worker updated to cache new content assets (audio, images, JSON)
- [ ] Graceful degradation for Teach-Back when offline ("needs connection" message)

### Out of Scope

- Supabase-hosted content — decided on static bundling for offline-first experience
- Content authoring/editing in-app — content comes from NotebookLM, not user-created
- Video content — not part of the NotebookLM asset types being used
- Real-time collaboration — this is a personal learning tool
- Content syncing/updating from NotebookLM — one-time extraction, manual re-pull if needed

## Context

- 8 modules across 3 phases (Foundation, Core AI, Applied AI), 6-week curriculum
- Each module has one dedicated NotebookLM notebook containing all learning assets
- Current app is React 19 + Vite 8 + Tailwind CSS 4 + Framer Motion PWA
- Supabase used for optional cloud sync; localStorage is primary persistence
- One NotebookLM notebook ID is currently hardcoded (`72cf9d0c-05b7-48ad-94ff-c12f20f2a6c1`) — need to discover all 8 notebook IDs
- Activity types in NotebookLM: Audio Overview (podcast-style audio), Decks (image slides), Flashcards (interactive Q&A), Quiz (multiple choice)
- Teach-Back is a new concept not from NotebookLM — uses Claude API for voice-based concept evaluation
- App is designed for ADHD learners with warm encouragement, visual progress, and micro-celebrations

## Constraints

- **Offline-first**: All learning content must be bundled as static assets in the PWA. Only Teach-Back requires network.
- **Tech stack**: Must stay within existing React/Vite/Tailwind stack. No new frameworks.
- **Content source**: NotebookLM MCP tools for extraction. 8 notebooks, one per module.
- **Claude API**: Teach-Back requires Claude API key — needs secure handling (not bundled in client code).
- **Bundle size**: Audio files will significantly increase bundle. Need to consider PWA caching strategy.
- **Platform**: Static hosting (GitHub Pages). No server-side code except Claude API proxy for Teach-Back.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Static bundling over Supabase storage | User wants offline-first study experience | — Pending |
| Claude API for Teach-Back | Direct integration, user preference | — Pending |
| Extract content via NotebookLM MCP tools | Automated extraction over manual export | — Pending |
| Rename Mind Map → Deck | User stopped using mind maps, uses deck slides instead | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-03-28 after initialization*
