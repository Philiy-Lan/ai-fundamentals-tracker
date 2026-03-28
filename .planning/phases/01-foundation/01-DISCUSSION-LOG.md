# Phase 1: Foundation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-28
**Phase:** 01-foundation
**Areas discussed:** Data migration, ActivityPanel interaction, Content data structure
**Mode:** Auto (--auto flag — recommended defaults selected)

---

## Data Migration (mindmap → deck)

| Option | Description | Selected |
|--------|-------------|----------|
| In-place migration in loadProgress | Add migration logic to existing loadProgress merge pattern — matches codebase conventions | ✓ |
| Separate migration script | Run once manually to update localStorage | |
| Version flag in state | Track schema version, migrate on version bump | |

**User's choice:** [auto] In-place migration in loadProgress (recommended default)
**Notes:** Matches the existing `{ ...DEFAULT_STATE, ...parsed }` merge pattern already in storage.js. Most consistent with codebase conventions.

---

## ActivityPanel Interaction

| Option | Description | Selected |
|--------|-------------|----------|
| Expand-in-place below activity row | Panel slides open below the tapped activity — stays in context, uses existing Framer Motion | ✓ |
| Modal overlay | Full-screen or half-screen modal with content | |
| New route per activity | Navigate to /module/:id/activity/:type | |

**User's choice:** [auto] Expand-in-place (recommended default)
**Notes:** Keeps the user in context on ModuleDetail page. Consistent with the app's existing single-page feel. No new routes needed.

---

## Content Data Structure

| Option | Description | Selected |
|--------|-------------|----------|
| src/data/content/ with per-type files | One JS file per activity type (flashcards.js, quizzes.js, teachback.js), each exporting object keyed by moduleId | ✓ |
| JSON files in public/ | Static JSON fetched at runtime | |
| Single content.js with all types | Everything in one file | |

**User's choice:** [auto] src/data/content/ with per-type files (recommended default)
**Notes:** Consistent with existing modules.js pattern. Keeps data co-located in src/data/. No runtime fetch needed — bundled at build time for offline-first.

---

## Claude's Discretion

- Framer Motion animation parameters for ActivityPanel
- Placeholder content for Phase 1 stub panels
- Deck activity icon choice (Images vs Layers)
- Audio cache configuration values

## Deferred Ideas

None — auto mode stayed within phase scope
