import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { MODULES, PHASES } from "../data/modules";
import { ActivityCheckbox } from "../components/ActivityCheckbox";
import { NotebookLMButton } from "../components/NotebookLMButton";
import { CelebrationOverlay } from "../components/CelebrationOverlay";
import { ModuleComplete } from "../components/ModuleComplete";
import { getRandomEncouragement } from "../utils/encouragements";
import { toast } from "sonner";

const MILESTONES = [25, 50, 75, 100];

export function ModuleDetail({ progress }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const module = MODULES.find((m) => m.id === Number(id));
  const {
    state,
    toggleActivity,
    setNotes,
    markMilestoneCelebrated,
    overallPercent,
  } = progress;
  const [celebrateMilestone, setCelebrateMilestone] = useState(null);
  const [showModuleComplete, setShowModuleComplete] = useState(false);
  const prevPercent = useRef(overallPercent);
  const notesTimerRef = useRef(null);

  // Milestone detection
  useEffect(() => {
    if (overallPercent > prevPercent.current) {
      const hit = MILESTONES.find(
        (m) =>
          overallPercent >= m &&
          prevPercent.current < m &&
          !state.celebratedMilestones.includes(m)
      );
      if (hit) setCelebrateMilestone(hit);
    }
    prevPercent.current = overallPercent;
  }, [overallPercent, state.celebratedMilestones]);

  const handleToggle = useCallback(
    (activityId) => {
      const wasChecked = state.completed[String(module.id)]?.[activityId];
      toggleActivity(String(module.id), activityId);

      if (!wasChecked) {
        // Check if this completes the module
        const modCompleted = state.completed[String(module.id)] || {};
        const currentDone = Object.values(modCompleted).filter(Boolean).length;
        if (currentDone === 4) {
          // This was the 5th (will be 5 after toggle)
          setTimeout(() => setShowModuleComplete(true), 300);
        }

        // Random encouragement toast
        if (Math.random() < 0.3) {
          const phase = PHASES.find((p) => p.id === module.phase);
          toast(getRandomEncouragement(), {
            duration: 2500,
            style: {
              background: "var(--bg-elevated)",
              color: "var(--text-primary)",
              border: "1px solid var(--border-accent)",
              borderLeft: `3px solid ${phase?.color || "var(--phase-1)"}`,
              borderRadius: "12px",
            },
          });
        }
      }
    },
    [module, state.completed, toggleActivity]
  );

  // Debounced notes save
  const handleNotesChange = useCallback(
    (e) => {
      const text = e.target.value;
      if (notesTimerRef.current) clearTimeout(notesTimerRef.current);
      notesTimerRef.current = setTimeout(() => {
        setNotes(String(module.id), text);
      }, 500);
    },
    [module, setNotes]
  );

  const handleNotesBlur = useCallback(
    (e) => {
      if (notesTimerRef.current) clearTimeout(notesTimerRef.current);
      setNotes(String(module.id), e.target.value);
    },
    [module, setNotes]
  );

  if (!module) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-8 text-center">
        <span className="text-4xl mb-3">{"\u{1F50D}"}</span>
        <p className="text-base text-[var(--text-secondary)] mb-4">
          Can't find that module
        </p>
        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 rounded-lg text-sm font-medium cursor-pointer"
          style={{
            backgroundColor: "var(--bg-card)",
            color: "var(--text-primary)",
            border: "1px solid var(--border)",
          }}
        >
          Head back home
        </button>
      </div>
    );
  }

  const phase = PHASES.find((p) => p.id === module.phase);
  const modCompleted = state.completed[String(module.id)] || {};
  const doneCount = Object.values(modCompleted).filter(Boolean).length;
  const modulePercent = Math.round((doneCount / 5) * 100);

  return (
    <>
      <ModuleComplete
        moduleTitle={module.title}
        show={showModuleComplete}
      />

      <motion.div
        className="min-h-screen pb-10"
        initial={{ x: "50%", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: "50%", opacity: 0 }}
        transition={{ type: "spring", stiffness: 350, damping: 32 }}
      >
        {/* Nav */}
        <div className="flex items-center justify-between px-5 pt-5 pb-2">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1 text-[var(--text-muted)] cursor-pointer p-2 -ml-2 rounded-lg active:bg-[var(--bg-card)] transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="text-sm">Back</span>
          </button>
          <span className="text-xs text-[var(--text-dim)]">
            {module.id} of {MODULES.length}
          </span>
        </div>

        {/* Header */}
        <div className="px-5 pb-5">
          <div className="flex items-start gap-3">
            <span className="text-3xl mt-0.5">{module.emoji}</span>
            <div className="flex-1">
              <h1 className="text-lg font-display font-bold text-[var(--text-primary)] leading-snug">
                {module.title}
              </h1>
              <div className="flex items-center gap-2 mt-1.5">
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: phase?.color + "15",
                    color: phase?.color,
                  }}
                >
                  {phase?.name}
                </span>
                <span className="text-xs text-[var(--text-dim)]">
                  {module.week}
                </span>
              </div>
              <p className="text-sm text-[var(--text-muted)] mt-2.5 leading-relaxed">
                {module.description}
              </p>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="px-5 pb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[var(--text-muted)]">
              {doneCount} of 5 activities
            </span>
            <span className="text-xs tabular-nums text-[var(--text-dim)]">
              {modulePercent}%
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-[var(--border)] overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: phase?.color || "#b07ff5" }}
              initial={{ width: 0 }}
              animate={{ width: `${modulePercent}%` }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
            />
          </div>
        </div>

        {/* Activities */}
        <div className="px-5 pb-5">
          <div className="space-y-1.5">
            {module.activities.map((activity) => (
              <ActivityCheckbox
                key={activity.id}
                activity={activity}
                checked={!!modCompleted[activity.id]}
                onToggle={() => handleToggle(activity.id)}
                phaseColor={phase?.color}
              />
            ))}
          </div>
        </div>

        {/* NotebookLM */}
        <div className="px-5 pb-5">
          <NotebookLMButton />
        </div>

        {/* Notes */}
        <div className="px-5 pb-5">
          <label className="text-xs font-medium text-[var(--text-dim)] uppercase tracking-wider mb-2 block">
            Notes
          </label>
          <textarea
            defaultValue={state.notes[String(module.id)] || ""}
            onChange={handleNotesChange}
            onBlur={handleNotesBlur}
            placeholder="Key insights, questions, connections..."
            className="w-full min-h-[100px] p-3.5 rounded-xl text-sm leading-relaxed resize-y focus:outline-none"
            style={{
              backgroundColor: "var(--bg-card)",
              color: "var(--text-primary)",
              border: "1px solid var(--border)",
              fontFamily: "var(--font-body)",
            }}
          />
        </div>
      </motion.div>

      {celebrateMilestone && (
        <CelebrationOverlay
          milestone={celebrateMilestone}
          onDismiss={() => {
            markMilestoneCelebrated(celebrateMilestone);
            setCelebrateMilestone(null);
          }}
        />
      )}
    </>
  );
}
