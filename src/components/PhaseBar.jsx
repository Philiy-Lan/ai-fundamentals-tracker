import { motion } from "framer-motion";
import { MODULES } from "../data/modules";

export function PhaseBar({ phase, completed }) {
  const phaseModules = MODULES.filter((m) => m.phase === phase.id);
  const totalActivities = phaseModules.length * 5;
  const completedCount = phaseModules.reduce((sum, mod) => {
    const modCompleted = completed[String(mod.id)] || {};
    return sum + Object.values(modCompleted).filter(Boolean).length;
  }, 0);
  const percent = totalActivities > 0 ? (completedCount / totalActivities) * 100 : 0;

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1.5 min-w-0 shrink-0">
        <div
          className="w-2 h-2 rounded-full shrink-0"
          style={{ backgroundColor: phase.color }}
        />
        <span className="text-xs font-medium text-[var(--text-muted)] whitespace-nowrap">
          {phase.name}
        </span>
      </div>
      <div className="flex-1 h-1.5 rounded-full bg-[var(--border)] overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: phase.color }}
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.2 }}
        />
      </div>
      <span className="text-xs tabular-nums text-[var(--text-dim)] shrink-0">
        {completedCount}/{totalActivities}
      </span>
    </div>
  );
}
