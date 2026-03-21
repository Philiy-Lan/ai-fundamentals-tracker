import { motion } from "framer-motion";
import {
  Headphones,
  GitBranch,
  Layers,
  CheckCircle,
  MessageCircle,
} from "lucide-react";

const ICON_MAP = {
  Headphones,
  GitBranch,
  Layers,
  CheckCircle,
  MessageCircle,
};

export function ActivityCheckbox({ activity, checked, onToggle, phaseColor }) {
  const Icon = ICON_MAP[activity.icon] || CheckCircle;
  const accentColor = phaseColor || "var(--success)";

  return (
    <motion.button
      onClick={() => {
        if (navigator.vibrate) navigator.vibrate(10);
        onToggle();
      }}
      className="flex items-center gap-3 w-full py-3 px-3.5 rounded-xl cursor-pointer transition-all duration-200 min-h-[52px] border"
      style={{
        backgroundColor: checked ? "var(--success-bg)" : "transparent",
        borderColor: checked ? "var(--success-border)" : "var(--border-subtle)",
      }}
      whileTap={{ scale: 0.97 }}
    >
      <Icon
        size={18}
        className="shrink-0 transition-colors duration-300"
        style={{
          color: checked ? "var(--success)" : "var(--text-dim)",
        }}
      />
      <span
        className="flex-1 text-left text-[15px] transition-colors duration-300"
        style={{
          color: checked ? "var(--success)" : "var(--text-primary)",
          fontWeight: checked ? 500 : 400,
        }}
      >
        {activity.label}
      </span>
      <div className="relative w-5 h-5 shrink-0">
        <motion.div
          className="absolute inset-0 rounded-full border-[1.5px]"
          style={{
            borderColor: checked ? "var(--success)" : "var(--text-dim)",
            backgroundColor: checked ? "var(--success)" : "transparent",
          }}
          animate={{
            scale: checked ? [1, 1.2, 1] : 1,
          }}
          transition={{ duration: 0.3 }}
        />
        {checked && (
          <motion.svg
            viewBox="0 0 24 24"
            className="absolute inset-0 w-5 h-5"
          >
            <motion.path
              d="M7 12l3.5 3.5L17 9"
              fill="none"
              stroke="white"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.25, delay: 0.05 }}
            />
          </motion.svg>
        )}
      </div>
    </motion.button>
  );
}
