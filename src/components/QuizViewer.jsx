import { useState, useRef, useCallback } from "react"
import { QUIZZES } from "../data/content/quizzes"

export function QuizViewer({ moduleId, onComplete }) {
  const questions = QUIZZES[moduleId] || []
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedIndex, setSelectedIndex] = useState(null)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const completedRef = useRef(false)

  const handleDone = useCallback(() => {
    if (!completedRef.current) {
      completedRef.current = true
      onComplete()
    }
  }, [onComplete])

  if (questions.length === 0) {
    return (
      <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "24px 0" }}>
        No quiz yet for this module.
      </p>
    )
  }

  if (isComplete) {
    const percentage = Math.round((correctCount / questions.length) * 100)
    return (
      <div style={{ textAlign: "center", padding: "24px 16px" }}>
        <div
          style={{
            fontSize: "2.5rem",
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: "8px",
          }}
        >
          {percentage}%
        </div>
        <div
          style={{
            fontSize: "1rem",
            color: "var(--text-muted)",
            marginBottom: "24px",
          }}
        >
          {correctCount} / {questions.length} correct
        </div>
        <button
          data-testid="btn-done"
          onClick={handleDone}
          style={{
            minWidth: "120px",
            padding: "10px 24px",
            borderRadius: "8px",
            border: "1px solid var(--border)",
            background: "var(--bg-elevated)",
            color: "var(--text-primary)",
            cursor: "pointer",
            fontSize: "0.95rem",
          }}
        >
          Done
        </button>
      </div>
    )
  }

  const question = questions[currentIndex]

  const getOptionStyle = (index) => {
    const base = {
      display: "block",
      width: "100%",
      textAlign: "left",
      padding: "12px 16px",
      marginBottom: "8px",
      borderRadius: "8px",
      border: "1px solid var(--border)",
      background: "var(--bg-card)",
      color: "var(--text-primary)",
      cursor: isSubmitted ? "default" : "pointer",
      fontSize: "0.9rem",
    }

    if (!isSubmitted) {
      if (index === selectedIndex) {
        return {
          ...base,
          border: "2px solid var(--border)",
          background: "var(--bg-elevated)",
        }
      }
      return base
    }

    // Submitted state
    if (index === question.correctIndex) {
      return {
        ...base,
        background: "rgba(94, 194, 105, 0.15)",
        border: "2px solid #5ec269",
      }
    }
    if (index === selectedIndex && selectedIndex !== question.correctIndex) {
      return {
        ...base,
        background: "rgba(224, 98, 152, 0.15)",
        border: "2px solid #e06298",
      }
    }
    return { ...base, opacity: 0.5 }
  }

  const handleSubmit = () => {
    if (selectedIndex === null) return
    if (selectedIndex === question.correctIndex) {
      setCorrectCount((c) => c + 1)
    }
    setIsSubmitted(true)
  }

  const handleNext = () => {
    const nextIndex = currentIndex + 1
    if (nextIndex >= questions.length) {
      setIsComplete(true)
    } else {
      setCurrentIndex(nextIndex)
      setSelectedIndex(null)
      setIsSubmitted(false)
    }
  }

  return (
    <div style={{ padding: "8px 0" }}>
      {/* Progress indicator */}
      <div
        style={{
          fontSize: "0.8rem",
          color: "var(--text-muted)",
          marginBottom: "16px",
          fontWeight: 500,
        }}
      >
        Q {currentIndex + 1} of {questions.length}
      </div>

      {/* Question text */}
      <p
        style={{
          fontWeight: 500,
          color: "var(--text-primary)",
          marginBottom: "16px",
          lineHeight: 1.5,
        }}
      >
        {question.question}
      </p>

      {/* Options */}
      <div>
        {question.options.map((option, index) => (
          <button
            key={index}
            data-testid={`option-${index}`}
            style={getOptionStyle(index)}
            onClick={() => {
              if (!isSubmitted) setSelectedIndex(index)
            }}
          >
            {option}
          </button>
        ))}
      </div>

      {/* Submit / Next buttons */}
      <div style={{ textAlign: "center", marginTop: "16px" }}>
        {!isSubmitted ? (
          <button
            data-testid="btn-submit"
            onClick={handleSubmit}
            disabled={selectedIndex === null}
            style={{
              minWidth: "120px",
              padding: "10px 24px",
              borderRadius: "8px",
              border: "1px solid var(--border)",
              background: "var(--bg-elevated)",
              color: selectedIndex === null ? "var(--text-muted)" : "var(--text-primary)",
              cursor: selectedIndex === null ? "not-allowed" : "pointer",
              fontSize: "0.95rem",
              opacity: selectedIndex === null ? 0.6 : 1,
            }}
          >
            Submit
          </button>
        ) : (
          <button
            data-testid="btn-next"
            onClick={handleNext}
            style={{
              minWidth: "120px",
              padding: "10px 24px",
              borderRadius: "8px",
              border: "1px solid var(--border)",
              background: "var(--bg-elevated)",
              color: "var(--text-primary)",
              cursor: "pointer",
              fontSize: "0.95rem",
            }}
          >
            Next
          </button>
        )}
      </div>
    </div>
  )
}
