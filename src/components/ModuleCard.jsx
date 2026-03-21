import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { PHASES } from "../data/modules";

export function ModuleCard({ module, completed, isNext }) {
  const navigate = useNavigate();
  const modCompleted = completed[String(module.id)] || {};
  const doneCount = Object.values(modCompleted).filter(Boolean).length;
  const isComplete = doneCount === 5;
  const phase = PHASES.find((p) => p.id === module.phase);

  return (
    <motion.button
      onClick={() => navigate(`/module/${module.id}`)}
      className="w-full text-left rounded-xl p-3.5 cursor-pointer transition-colors relative"
      style={{
        backgroundColor: isNext ? "var(--bg-card)" : "transparent",
        border: isNext ? "1px solid var(--border-accent)" : "1px solid transparent",
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      {isNext && (
        <div
          className="absolute -left-px top-3 bottom-3 w-[3px] rounded-full"
          style={{ backgroundColor: phase?.color }}
        />
      )}
      <div className="flex items-center gap-3">
        <span className="text-xl">{module.emoji}</span>
        <div className="flex-1 min-w-0">
          <div
            className="font-medium text-[15px] truncate"
            style={{
              color: isComplete ? "var(--text-muted)" : "var(--text-primary)",
            }}
          >
            {module.title}
          </div>
          <div className="text-xs text-[var(--text-dim)] mt-0.5">{module.week}</div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex gap-[5px]">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="w-[6px] h-[6px] rounded-full transition-all duration-300"
                style={{
                  backgroundColor:
                    i < doneCount
                      ? phase?.color || "#b07ff5"
                      : "var(--border)",
                  transform: i < doneCount ? "scale(1.1)" : "scale(1)",
                }}
              />
            ))}
          </div>
          <ChevronRight
            size={14}
            className="text-[var(--text-dim)]"
          />
        </div>
      </div>
      {isNext && (
        <div className="mt-2 ml-9">
          <span
            className="text-xs font-medium px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: phase?.color + "18",
              color: phase?.color,
            }}
          >
            {doneCount > 0 ? "Continue" : "Up next"}
          </span>
        </div>
      )}
    </motion.button>
  );
}
