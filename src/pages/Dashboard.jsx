import { motion } from "framer-motion";
import { Settings as SettingsIcon, Cloud } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ProgressRing } from "../components/ProgressRing";
import { StreakCounter } from "../components/StreakCounter";
import { PhaseBar } from "../components/PhaseBar";
import { ModuleCard } from "../components/ModuleCard";
import { PHASES, MODULES } from "../data/modules";

function findNextModule(completed) {
  return MODULES.find((mod) => {
    const modCompleted = completed[String(mod.id)] || {};
    return Object.values(modCompleted).filter(Boolean).length < 5;
  });
}

export function Dashboard({ progress, sync }) {
  const navigate = useNavigate();
  const { state, overallPercent, completedCount, totalActivities } = progress;
  const nextModule = findNextModule(state.completed);

  return (
    <motion.div
      className="pb-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5">
        <h1
          className="text-lg font-display font-bold bg-clip-text text-transparent"
          style={{ backgroundImage: "var(--gradient-hero)" }}
        >
          AI Fundamentals
        </h1>
        <div className="flex items-center gap-1">
          {sync?.hasSyncPhrase && (
            <Cloud
              size={14}
              style={{
                color: sync.syncStatus === "synced"
                  ? "var(--success)"
                  : sync.syncStatus === "error"
                  ? "var(--destructive)"
                  : "var(--text-dim)",
              }}
            />
          )}
          <button
            onClick={() => navigate("/settings")}
            className="p-2 -mr-2 rounded-lg text-[var(--text-dim)] active:bg-[var(--bg-card)] transition-colors cursor-pointer"
            aria-label="Settings"
          >
            <SettingsIcon size={18} />
          </button>
        </div>
      </div>

      {/* Progress Ring */}
      <ProgressRing
        percent={overallPercent}
        completedCount={completedCount}
        totalActivities={totalActivities}
      />

      {/* Streak */}
      <StreakCounter
        current={state.streak.current}
        best={state.streak.best}
      />

      {/* Phase Bars Summary */}
      <div className="px-5 py-4 space-y-2.5">
        {PHASES.map((phase) => (
          <PhaseBar
            key={phase.id}
            phase={phase}
            completed={state.completed}
          />
        ))}
      </div>

      {/* Divider */}
      <div className="mx-5 border-t border-[var(--border)]" />

      {/* Module List grouped by Phase */}
      <div className="pt-4 pb-2">
        {PHASES.map((phase, phaseIdx) => {
          const phaseModules = MODULES.filter((m) => m.phase === phase.id);
          return (
            <div key={phase.id} className={phaseIdx > 0 ? "mt-5" : ""}>
              <div className="flex items-center gap-2 px-5 mb-1">
                <span
                  className="text-xs font-semibold uppercase tracking-widest"
                  style={{ color: phase.color }}
                >
                  {phase.name}
                </span>
                <span className="text-xs text-[var(--text-dim)]">
                  {phase.weeks}
                </span>
              </div>
              <div className="px-3">
                {phaseModules.map((mod, i) => (
                  <motion.div
                    key={mod.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.03 * (phaseIdx * 3 + i),
                      duration: 0.25,
                    }}
                  >
                    <ModuleCard
                      module={mod}
                      completed={state.completed}
                      isNext={nextModule?.id === mod.id}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
