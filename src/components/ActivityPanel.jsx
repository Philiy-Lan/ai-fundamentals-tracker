import { AnimatePresence, motion } from "framer-motion"
import { ActivityCheckbox } from "./ActivityCheckbox"
import { AudioPlayer } from "./AudioPlayer"
import { DeckViewer } from "./DeckViewer"
import { FlashcardViewer } from "./FlashcardViewer"
import { QuizViewer } from "./QuizViewer"
import { MODULES } from "../data/modules"

function renderContent(activity, moduleId, onComplete) {
  switch (activity.id) {
    case "audio":
      return <AudioPlayer moduleId={moduleId} onComplete={onComplete} />
    case "deck": {
      const mod = MODULES.find((m) => String(m.id) === moduleId)
      const slideCount = mod?.deckSlideCount || 0
      return (
        <DeckViewer
          moduleId={moduleId}
          slideCount={slideCount}
          onComplete={onComplete}
        />
      )
    }
    case "flashcards":
      return <FlashcardViewer moduleId={moduleId} onComplete={onComplete} />
    case "quiz":
      return <QuizViewer moduleId={moduleId} onComplete={onComplete} />
    default:
      return (
        <p className="text-center py-4">
          Content coming soon — tap the checkbox above to mark complete
          manually.
        </p>
      )
  }
}

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
              {renderContent(activity, moduleId, onComplete)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
