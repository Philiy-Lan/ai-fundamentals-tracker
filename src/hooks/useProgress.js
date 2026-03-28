import { useState, useCallback } from "react";
import { loadProgress, saveProgress } from "../utils/storage";
import { MODULES } from "../data/modules";

export function useProgress() {
  const [state, setState] = useState(loadProgress);

  const toggleActivity = useCallback((moduleId, activityId) => {
    setState((prev) => {
      const next = {
        ...prev,
        completed: {
          ...prev.completed,
          [moduleId]: {
            ...prev.completed[moduleId],
            [activityId]: !prev.completed[moduleId]?.[activityId],
          },
        },
      };

      const today = new Date().toISOString().split("T")[0];
      if (next.completed[moduleId][activityId]) {
        if (prev.streak.lastStudyDate !== today) {
          const yesterday = new Date(Date.now() - 86400000)
            .toISOString()
            .split("T")[0];
          const newCurrent =
            prev.streak.lastStudyDate === yesterday
              ? prev.streak.current + 1
              : 1;
          next.streak = {
            current: newCurrent,
            best: Math.max(newCurrent, prev.streak.best),
            lastStudyDate: today,
          };
        } else {
          next.streak = { ...prev.streak };
        }
      } else {
        next.streak = { ...prev.streak };
      }

      saveProgress(next);
      return next;
    });
  }, []);

  const setNotes = useCallback((moduleId, text) => {
    setState((prev) => {
      const next = { ...prev, notes: { ...prev.notes, [moduleId]: text } };
      saveProgress(next);
      return next;
    });
  }, []);

  const markMilestoneCelebrated = useCallback((pct) => {
    setState((prev) => {
      if (prev.celebratedMilestones.includes(pct)) return prev;
      const next = {
        ...prev,
        celebratedMilestones: [...prev.celebratedMilestones, pct],
      };
      saveProgress(next);
      return next;
    });
  }, []);

  const resetAll = useCallback(() => {
    localStorage.removeItem("ai-tracker-progress");
    const def = {
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
    saveProgress(def);
    setState(def);
  }, []);

  const totalActivities = MODULES.length * 5;
  const completedCount = Object.values(state.completed).reduce(
    (sum, mod) => sum + Object.values(mod).filter(Boolean).length,
    0
  );
  const overallPercent = Math.round((completedCount / totalActivities) * 100);

  return {
    state,
    setState,
    toggleActivity,
    setNotes,
    markMilestoneCelebrated,
    resetAll,
    completedCount,
    totalActivities,
    overallPercent,
  };
}
