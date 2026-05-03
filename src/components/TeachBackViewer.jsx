import { useState, useRef, useCallback, useEffect } from "react"
import { motion } from "framer-motion"
import { Mic, MicOff, Send, RefreshCw, WifiOff } from "lucide-react"
import { TEACHBACK_PROMPTS } from "../data/content/teachback"

const PHASES = {
  OFFLINE: "offline",
  IDLE: "idle",
  RECORDING: "recording",
  REVIEWING: "reviewing",
  EVALUATING: "evaluating",
  FEEDBACK: "feedback",
}

function getSpeechRecognition() {
  if (typeof window === "undefined") return null
  return window.SpeechRecognition || window.webkitSpeechRecognition || null
}

export function TeachBackViewer({ moduleId, onComplete }) {
  const prompts = TEACHBACK_PROMPTS[moduleId] || []
  const [promptItem] = useState(() => {
    if (prompts.length === 0) return null
    return prompts[Math.floor(Math.random() * prompts.length)]
  })

  const [phase, setPhase] = useState(() =>
    navigator.onLine ? PHASES.IDLE : PHASES.OFFLINE
  )
  const [transcript, setTranscript] = useState("")
  const [evaluation, setEvaluation] = useState(null)
  const [error, setError] = useState(null)

  const completedRef = useRef(false)
  const recognitionRef = useRef(null)
  const timeoutRef = useRef(null)

  const hasSpeech = Boolean(getSpeechRecognition())

  // Online/offline listener
  useEffect(() => {
    const goOnline = () => setPhase(p => p === PHASES.OFFLINE ? PHASES.IDLE : p)
    const goOffline = () => setPhase(PHASES.OFFLINE)
    window.addEventListener("online", goOnline)
    window.addEventListener("offline", goOffline)
    return () => {
      window.removeEventListener("online", goOnline)
      window.removeEventListener("offline", goOffline)
    }
  }, [])

  // Cleanup recognition on unmount
  useEffect(() => {
    return () => {
      recognitionRef.current?.stop()
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const handleStartRecording = useCallback(() => {
    const SR = getSpeechRecognition()
    if (!SR) return
    const recognition = new SR()
    recognition.continuous = true
    recognition.interimResults = false
    recognition.lang = "en-US"

    recognition.onresult = (event) => {
      let text = ""
      for (let i = 0; i < event.results.length; i++) {
        text += event.results[i][0].transcript
      }
      setTranscript(text)
      setPhase(PHASES.REVIEWING)
    }

    recognition.onerror = (event) => {
      setError(`Speech recognition error: ${event.error}`)
      setPhase(PHASES.IDLE)
    }

    recognition.onend = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }

    recognition.start()
    recognitionRef.current = recognition
    setPhase(PHASES.RECORDING)

    timeoutRef.current = setTimeout(() => {
      recognitionRef.current?.stop()
    }, 60000)
  }, [])

  const handleStopRecording = useCallback(() => {
    recognitionRef.current?.stop()
  }, [])

  const handleSubmit = useCallback(async () => {
    setPhase(PHASES.EVALUATING)
    setError(null)

    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moduleId,
          conceptArea: promptItem?.conceptArea,
          explanation: transcript,
        }),
      })

      if (!res.ok) {
        throw new Error("Server error")
      }

      const parsed = await res.json()
      setEvaluation(parsed)
      setPhase(PHASES.FEEDBACK)

      if (parsed.pass && !completedRef.current) {
        completedRef.current = true
        onComplete()
      }
    } catch {
      setError("Couldn't reach the server — check your connection and try again")
      setPhase(PHASES.REVIEWING)
    }
  }, [moduleId, promptItem, transcript, onComplete])

  const handleTryAgain = useCallback(() => {
    setPhase(PHASES.IDLE)
    setTranscript("")
    setEvaluation(null)
    setError(null)
  }, [])

  if (!promptItem) {
    return (
      <p
        className="text-center py-4"
        style={{ color: "var(--text-muted)" }}
      >
        No prompts available for this module.
      </p>
    )
  }

  // OFFLINE
  if (phase === PHASES.OFFLINE) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "12px",
          padding: "32px 16px",
        }}
      >
        <WifiOff size={32} style={{ color: "var(--text-muted)" }} />
        <p style={{ color: "var(--text-muted)", textAlign: "center" }}>
          Needs internet connection
        </p>
      </div>
    )
  }

  // EVALUATING
  if (phase === PHASES.EVALUATING) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <p
          style={{
            color: "var(--text-primary)",
            lineHeight: 1.5,
            fontWeight: 500,
          }}
        >
          {promptItem.prompt}
        </p>
        <div
          style={{
            textAlign: "center",
            padding: "32px 16px",
            color: "var(--text-muted)",
          }}
        >
          <motion.div
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            Evaluating your explanation...
          </motion.div>
        </div>
      </div>
    )
  }

  // FEEDBACK
  if (phase === PHASES.FEEDBACK && evaluation) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <p
          style={{
            color: "var(--text-primary)",
            lineHeight: 1.5,
            fontWeight: 500,
          }}
        >
          {promptItem.prompt}
        </p>

        {/* Score */}
        <div style={{ textAlign: "center", padding: "8px 0" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              backgroundColor: evaluation.pass
                ? "rgba(94, 194, 105, 0.15)"
                : "rgba(224, 98, 152, 0.15)",
              border: `2px solid ${evaluation.pass ? "#5ec269" : "#e06298"}`,
              fontSize: "1.75rem",
              fontWeight: 700,
              color: "var(--text-primary)",
            }}
          >
            {evaluation.score}
          </div>
          <p
            style={{
              marginTop: "8px",
              fontWeight: 500,
              color: evaluation.pass ? "#5ec269" : "#e06298",
            }}
          >
            {evaluation.pass ? "Great job!" : "Keep practicing!"}
          </p>
        </div>

        {/* Correct bullets */}
        {evaluation.correct?.length > 0 && (
          <div>
            <p
              style={{
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "var(--text-primary)",
                marginBottom: "4px",
              }}
            >
              What you got right:
            </p>
            <ul
              style={{
                paddingLeft: "20px",
                margin: 0,
                fontSize: "0.85rem",
                color: "var(--text-muted)",
                lineHeight: 1.6,
              }}
            >
              {evaluation.correct.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Missed bullets */}
        {evaluation.missed?.length > 0 && (
          <div>
            <p
              style={{
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "var(--text-primary)",
                marginBottom: "4px",
              }}
            >
              What to work on:
            </p>
            <ul
              style={{
                paddingLeft: "20px",
                margin: 0,
                fontSize: "0.85rem",
                color: "var(--text-muted)",
                lineHeight: 1.6,
              }}
            >
              {evaluation.missed.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Try Again or success message */}
        <div style={{ textAlign: "center", marginTop: "4px" }}>
          {evaluation.pass ? (
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
              Activity complete — nice work!
            </p>
          ) : (
            <button
              onClick={handleTryAgain}
              aria-label="Try Again"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 20px",
                borderRadius: "8px",
                border: "1px solid var(--border)",
                backgroundColor: "transparent",
                color: "var(--text-primary)",
                cursor: "pointer",
                fontSize: "0.9rem",
              }}
            >
              <RefreshCw size={16} />
              Try Again
            </button>
          )}
        </div>
      </div>
    )
  }

  // RECORDING
  if (phase === PHASES.RECORDING) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <p
          style={{
            color: "var(--text-primary)",
            lineHeight: 1.5,
            fontWeight: 500,
          }}
        >
          {promptItem.prompt}
        </p>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "12px",
            padding: "16px 0",
          }}
        >
          <motion.button
            onClick={handleStopRecording}
            aria-label="Stop recording"
            animate={{ scale: [1, 1.15, 1], opacity: [1, 0.7, 1] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              border: "none",
              backgroundColor: "#e06298",
              color: "#fff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MicOff size={24} />
          </motion.button>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            Listening... tap to stop
          </p>
        </div>
      </div>
    )
  }

  // IDLE and REVIEWING share similar layout
  const isReviewing = phase === PHASES.REVIEWING

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Prompt */}
      <p
        style={{
          color: "var(--text-primary)",
          lineHeight: 1.5,
          fontWeight: 500,
        }}
      >
        {promptItem.prompt}
      </p>
      <span
        style={{
          fontSize: "0.75rem",
          color: "var(--text-muted)",
          marginTop: "-8px",
        }}
      >
        {promptItem.conceptArea}
      </span>

      {/* Mic button — only in IDLE with speech support */}
      {!isReviewing && hasSpeech && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <button
            onClick={handleStartRecording}
            aria-label="Start recording"
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              border: "none",
              backgroundColor: "var(--accent)",
              color: "#fff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Mic size={24} />
          </button>
        </div>
      )}

      {/* Textarea */}
      <div>
        {!isReviewing && hasSpeech && (
          <p
            style={{
              fontSize: "0.75rem",
              color: "var(--text-muted)",
              marginBottom: "6px",
            }}
          >
            Or type instead
          </p>
        )}
        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Type your explanation here..."
          rows={4}
          style={{
            width: "100%",
            borderRadius: "8px",
            border: "1px solid var(--border)",
            backgroundColor: "var(--bg-card)",
            color: "var(--text-primary)",
            padding: "10px 12px",
            fontSize: "0.9rem",
            resize: "vertical",
            boxSizing: "border-box",
          }}
        />
      </div>

      {/* Error message */}
      {error && (
        <p style={{ fontSize: "0.85rem", color: "#e06298" }}>
          {error}
        </p>
      )}

      {/* Action row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
        }}
      >
        {isReviewing && hasSpeech && (
          <button
            onClick={handleStartRecording}
            aria-label="Re-record"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              padding: "6px 12px",
              borderRadius: "6px",
              border: "1px solid var(--border)",
              backgroundColor: "transparent",
              color: "var(--text-muted)",
              cursor: "pointer",
              fontSize: "0.8rem",
            }}
          >
            <Mic size={14} />
            Re-record
          </button>
        )}
        <button
          onClick={handleSubmit}
          disabled={!transcript.trim()}
          aria-label="Submit"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "8px 20px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: "var(--accent)",
            color: "#fff",
            cursor: transcript.trim() ? "pointer" : "not-allowed",
            fontSize: "0.9rem",
            opacity: transcript.trim() ? 1 : 0.5,
          }}
        >
          <Send size={16} />
          Submit
        </button>
      </div>
    </div>
  )
}
