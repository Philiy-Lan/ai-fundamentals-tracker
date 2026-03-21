import { useState, useEffect, useCallback, useRef } from "react";
import { hashPhrase, pullProgress, pushProgress, supabase } from "../utils/supabase";
import { loadProgress, saveProgress } from "../utils/storage";

const SYNC_PHRASE_KEY = "ai-tracker-sync-phrase";
const SYNC_KEY_KEY = "ai-tracker-sync-key";

export function useSync(state, setState) {
  const [syncPhrase, setSyncPhraseState] = useState(
    () => localStorage.getItem(SYNC_PHRASE_KEY) || ""
  );
  const [syncStatus, setSyncStatus] = useState("idle"); // idle | syncing | synced | error | offline
  const [lastSynced, setLastSynced] = useState(null);
  const syncKeyRef = useRef(localStorage.getItem(SYNC_KEY_KEY) || "");
  const pushTimerRef = useRef(null);
  const isSyncing = useRef(false);

  // Compute sync key when phrase changes
  const setSyncPhrase = useCallback(async (phrase) => {
    const trimmed = phrase.trim();
    setSyncPhraseState(trimmed);

    if (!trimmed) {
      localStorage.removeItem(SYNC_PHRASE_KEY);
      localStorage.removeItem(SYNC_KEY_KEY);
      syncKeyRef.current = "";
      setSyncStatus("idle");
      return;
    }

    localStorage.setItem(SYNC_PHRASE_KEY, trimmed);
    const key = await hashPhrase(trimmed);
    localStorage.setItem(SYNC_KEY_KEY, key);
    syncKeyRef.current = key;

    // Pull immediately on new phrase
    await pull(key, setState);
  }, [setState]);

  // Pull from remote and merge
  const pull = useCallback(async (key, setStateFn) => {
    if (!supabase || !key) return;
    if (isSyncing.current) return;
    isSyncing.current = true;
    setSyncStatus("syncing");

    try {
      const remote = await pullProgress(key);
      if (remote?.data) {
        const local = loadProgress();
        const merged = mergeProgress(local, remote.data);
        saveProgress(merged);
        setStateFn(merged);
        setLastSynced(new Date());
        setSyncStatus("synced");
      } else {
        // No remote data yet — push local
        const local = loadProgress();
        await pushProgress(key, local);
        setLastSynced(new Date());
        setSyncStatus("synced");
      }
    } catch {
      setSyncStatus("error");
    } finally {
      isSyncing.current = false;
    }
  }, []);

  // Debounced push after state changes
  const schedulePush = useCallback((progressState) => {
    if (!syncKeyRef.current || !supabase) return;
    if (pushTimerRef.current) clearTimeout(pushTimerRef.current);
    pushTimerRef.current = setTimeout(async () => {
      if (isSyncing.current) return;
      isSyncing.current = true;
      setSyncStatus("syncing");
      try {
        const ok = await pushProgress(syncKeyRef.current, progressState);
        if (ok) {
          setLastSynced(new Date());
          setSyncStatus("synced");
        } else {
          setSyncStatus("error");
        }
      } catch {
        setSyncStatus("error");
      } finally {
        isSyncing.current = false;
      }
    }, 1500);
  }, []);

  // Pull on mount if we have a key
  useEffect(() => {
    if (syncKeyRef.current && supabase) {
      pull(syncKeyRef.current, setState);
    }
  }, [pull, setState]);

  // Push whenever state changes (after initial load)
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    schedulePush(state);
  }, [state, schedulePush]);

  return {
    syncPhrase,
    setSyncPhrase,
    syncStatus,
    lastSynced,
    isConfigured: !!supabase,
    hasSyncPhrase: !!syncPhrase.trim(),
  };
}

/**
 * Merge local and remote progress.
 * Strategy: for each module/activity, prefer "completed" (true wins).
 * For streak, take the higher current streak.
 * For notes, take the longer content.
 * For milestones, union the arrays.
 */
function mergeProgress(local, remote) {
  const merged = { ...local };

  // Merge completed activities (true wins)
  if (remote.completed) {
    merged.completed = { ...local.completed };
    for (const modId of Object.keys(remote.completed)) {
      if (!merged.completed[modId]) {
        merged.completed[modId] = remote.completed[modId];
      } else {
        merged.completed[modId] = { ...merged.completed[modId] };
        for (const actId of Object.keys(remote.completed[modId])) {
          if (remote.completed[modId][actId]) {
            merged.completed[modId][actId] = true;
          }
        }
      }
    }
  }

  // Merge notes (longer wins)
  if (remote.notes) {
    merged.notes = { ...local.notes };
    for (const modId of Object.keys(remote.notes)) {
      const localNote = local.notes?.[modId] || "";
      const remoteNote = remote.notes[modId] || "";
      merged.notes[modId] = remoteNote.length >= localNote.length ? remoteNote : localNote;
    }
  }

  // Merge streak (higher current wins)
  if (remote.streak) {
    const localStreak = local.streak || { current: 0, best: 0, lastStudyDate: null };
    const remoteStreak = remote.streak;
    merged.streak = {
      current: Math.max(localStreak.current, remoteStreak.current || 0),
      best: Math.max(localStreak.best || 0, remoteStreak.best || 0),
      lastStudyDate:
        (localStreak.lastStudyDate || "") >= (remoteStreak.lastStudyDate || "")
          ? localStreak.lastStudyDate
          : remoteStreak.lastStudyDate,
    };
  }

  // Merge milestones (union)
  if (remote.celebratedMilestones) {
    merged.celebratedMilestones = [
      ...new Set([
        ...(local.celebratedMilestones || []),
        ...(remote.celebratedMilestones || []),
      ]),
    ];
  }

  return merged;
}
