import { AnimatePresence, motion } from "framer-motion"
import { ActivityCheckbox } from "./ActivityCheckbox"

export function ActivityPanel({
  activity,
  moduleId,
  checked,
  isOpen,
  onPanelToggle,
  onComplete,
  phaseColor,
}) {
  return (
    <div>
      <ActivityCheckbox
        activity={activity}
        checked={checked}
        onToggle={() => onPanelToggle(activity.id)}
        phaseColor={phaseColor}
      />
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <div
              className="mx-3.5 mb-1.5 rounded-xl p-4 text-sm"
              style={{
                backgroundColor: "var(--bg-card)",
                border: "1px solid var(--border)",
                color: "var(--text-muted)",
              }}
            >
              <p className="text-center py-4">
                Content coming in Phase 2 — tap the checkbox above to mark complete manually.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
