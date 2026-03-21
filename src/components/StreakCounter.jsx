import { motion } from "framer-motion";

export function StreakCounter({ current, best }) {
  const hasStreak = current > 0;
  const isHot = current >= 7;

  return (
    <div className="flex items-center justify-center gap-2.5 py-2">
      {hasStreak ? (
        <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[var(--bg-card)] border border-[var(--border)]">
          <motion.span
            className="text-lg"
            animate={isHot ? { scale: [1, 1.15, 1] } : {}}
            transition={isHot ? { repeat: Infinity, duration: 1.5 } : {}}
          >
            {"\u{1F525}"}
          </motion.span>
          <span className="text-sm font-semibold text-[var(--text-primary)]">
            {current} day streak
          </span>
          <span className="text-xs text-[var(--text-dim)]">
            &middot; Best: {best}
          </span>
        </div>
      ) : (
        <div className="px-4 py-1.5 rounded-full bg-[var(--bg-card)] border border-[var(--border)]">
          <span className="text-sm text-[var(--text-muted)]">
            {"\u{1F525}"} Start your streak today
          </span>
        </div>
      )}
    </div>
  );
}
