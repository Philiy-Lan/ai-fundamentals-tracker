import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { fireCelebration } from "../utils/confetti";

const MILESTONE_DATA = {
  25: {
    emoji: "\u{1F389}",
    title: "Quarter way there!",
    message: "You're building real momentum. Keep it going.",
  },
  50: {
    emoji: "\u{1F680}",
    title: "Halfway!",
    message: "You know more about AI than most people on the planet.",
  },
  75: {
    emoji: "\u2B50",
    title: "Almost there!",
    message: "The finish line is in sight. You've got this.",
  },
  100: {
    emoji: "\u{1F3C6}",
    title: "Complete!",
    message: "AI Fundamentals: done. You earned this.",
  },
};

export function CelebrationOverlay({ milestone, onDismiss }) {
  const data = MILESTONE_DATA[milestone];

  useEffect(() => {
    if (data) {
      fireCelebration();
      const t1 = setTimeout(fireCelebration, 700);
      const t2 = setTimeout(onDismiss, 6000);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [data, onDismiss]);

  if (!data) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center px-8"
        style={{ backgroundColor: "rgba(10, 9, 12, 0.8)", backdropFilter: "blur(8px)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onDismiss}
      >
        <motion.div
          className="rounded-2xl p-8 text-center max-w-xs w-full border"
          style={{
            backgroundColor: "var(--bg-elevated)",
            borderColor: "var(--border-accent)",
            boxShadow: "var(--shadow-lg)",
          }}
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
          onClick={(e) => e.stopPropagation()}
        >
          <motion.div
            className="text-6xl mb-5"
            animate={{ scale: [1, 1.2, 1], rotate: [0, 8, -8, 0] }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            {data.emoji}
          </motion.div>
          <h2 className="text-xl font-display font-bold text-[var(--text-primary)] mb-2">
            {data.title}
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mb-6 leading-relaxed">
            {data.message}
          </p>
          <button
            onClick={onDismiss}
            className="px-5 py-2.5 rounded-lg font-medium text-sm text-white cursor-pointer border-0"
            style={{ background: "var(--gradient-hero)" }}
          >
            Keep Going
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
