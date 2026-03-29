import { useState, useRef, useCallback } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { CheckCircle2, XCircle, Shuffle } from "lucide-react"
import { FLASHCARDS } from "../data/content/flashcards"

function shuffleArray(arr) {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function FlashcardViewer({ moduleId, onComplete }) {
  const source = FLASHCARDS[moduleId] || []
  const [cards, setCards] = useState(source)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [score, setScore] = useState(0)
  const [isShuffled, setIsShuffled] = useState(false)
  const completedRef = useRef(false)

  const handleRate = useCallback((wasCorrect) => {
    if (wasCorrect) setScore(s => s + 1)
    const nextIndex = currentIndex + 1
    if (nextIndex >= cards.length) {
      if (!completedRef.current) {
        completedRef.current = true
        onComplete()
      }
    } else {
      setCurrentIndex(nextIndex)
      setIsFlipped(false)
    }
  }, [currentIndex, cards.length, onComplete])

  const handleShuffle = useCallback(() => {
    if (!isShuffled) {
      setCards(shuffleArray(source))
      setCurrentIndex(0)
      setIsFlipped(false)
      setIsShuffled(true)
    } else {
      setCards(source)
      setCurrentIndex(0)
      setIsFlipped(false)
      setIsShuffled(false)
    }
  }, [isShuffled, source])

  if (source.length === 0) {
    return (
      <p
        className="text-center py-4"
        style={{ color: "var(--text-muted)" }}
      >
        No flashcards yet for this module.
      </p>
    )
  }

  const card = cards[currentIndex]

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {/* Header: progress, score, shuffle */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        <span
          className="text-sm tabular-nums"
          style={{ color: "var(--text-muted)" }}
        >
          Card {currentIndex + 1} of {cards.length}
        </span>
        <span
          className="text-sm tabular-nums"
          style={{ color: "var(--text-muted)" }}
        >
          {score} / {cards.length} correct
        </span>
        <button
          data-testid="btn-shuffle"
          onClick={handleShuffle}
          aria-label="Shuffle cards"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            padding: "4px 10px",
            borderRadius: "6px",
            border: "1px solid var(--border)",
            backgroundColor: isShuffled ? "var(--bg-elevated)" : "transparent",
            color: isShuffled ? "var(--text-primary)" : "var(--text-muted)",
            cursor: "pointer",
            fontSize: "13px",
          }}
        >
          <Shuffle size={14} />
          Shuffle
        </button>
      </div>

      {/* Card */}
      <div
        style={{
          minHeight: "200px",
          borderRadius: "10px",
          border: "1px solid var(--border)",
          backgroundColor: "var(--bg-card)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <AnimatePresence mode="wait">
          {!isFlipped ? (
            <motion.div
              key="question"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsFlipped(true)}
              style={{
                padding: "24px",
                minHeight: "200px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                cursor: "pointer",
                color: "var(--text-primary)",
                fontSize: "16px",
                lineHeight: 1.5,
              }}
            >
              {card.question}
            </motion.div>
          ) : (
            <motion.div
              key="answer"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              style={{
                padding: "24px",
                minHeight: "200px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                color: "var(--text-primary)",
                fontSize: "15px",
                lineHeight: 1.6,
              }}
            >
              {card.answer}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Rating buttons — only visible after flip */}
      {isFlipped && (
        <div
          style={{
            display: "flex",
            gap: "10px",
            justifyContent: "center",
          }}
        >
          <button
            data-testid="btn-correct"
            onClick={() => handleRate(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 20px",
              borderRadius: "8px",
              border: "1px solid var(--border)",
              backgroundColor: "transparent",
              color: "#5ec269",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: 500,
            }}
          >
            <CheckCircle2 size={16} />
            Got it
          </button>
          <button
            data-testid="btn-incorrect"
            onClick={() => handleRate(false)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 20px",
              borderRadius: "8px",
              border: "1px solid var(--border)",
              backgroundColor: "transparent",
              color: "#e06298",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: 500,
            }}
          >
            <XCircle size={16} />
            Missed it
          </button>
        </div>
      )}
    </div>
  )
}
