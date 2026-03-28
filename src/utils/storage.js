const STORAGE_KEY = "ai-tracker-progress";

const DEFAULT_STATE = {
  completed: Object.fromEntries(
    Array.from({ length: 8 }, (_, i) => [
      String(i + 1),
      { audio: false, deck: false, flashcards: false, quiz: false, teachback: false },
    ])
  ),
  notes: {},
  streak: { current: 0, best: 0, lastStudyDate: null },
  celebratedMilestones: [],
};

export function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(DEFAULT_STATE);
    const parsed = JSON.parse(raw);

    // One-time migration: mindmap → deck
    // Must run before the DEFAULT_STATE merge (shallow spread would discard changes otherwise)
    if (parsed.completed) {
      Object.values(parsed.completed).forEach((mod) => {
        if ("mindmap" in mod) {
          mod.deck = mod.mindmap;
          delete mod.mindmap;
        }
      });
    }

    return { ...structuredClone(DEFAULT_STATE), ...parsed };
  } catch {
    return structuredClone(DEFAULT_STATE);
  }
}

export function saveProgress(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function exportProgress() {
  return JSON.stringify(loadProgress(), null, 2);
}

export function resetProgress() {
  localStorage.removeItem(STORAGE_KEY);
  return structuredClone(DEFAULT_STATE);
}
