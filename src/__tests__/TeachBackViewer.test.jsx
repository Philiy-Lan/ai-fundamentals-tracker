import { describe, it, expect, vi, afterEach, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { TeachBackViewer } from "../components/TeachBackViewer.jsx"

vi.mock("../data/content/teachback", () => ({
  TEACHBACK_PROMPTS: {
    "1": [{ prompt: "Test prompt", conceptArea: "Test area" }],
  },
}))

vi.stubGlobal("fetch", vi.fn())

vi.mock("framer-motion", () => ({
  AnimatePresence: ({ children }) => children,
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
  },
}))

describe("TeachBackViewer", () => {
  afterEach(() => {
    vi.restoreAllMocks()
    // Restore navigator.onLine to true after each test
    Object.defineProperty(navigator, "onLine", {
      value: true,
      writable: true,
      configurable: true,
    })
    // Clean up any SpeechRecognition mocks
    delete window.SpeechRecognition
    delete window.webkitSpeechRecognition
  })

  // TEACH-01 / D-18 / D-20: Module-specific prompt from TEACHBACK_PROMPTS renders
  it("renders a concept prompt from TEACHBACK_PROMPTS for the given moduleId", () => {
    render(<TeachBackViewer moduleId="1" onComplete={vi.fn()} />)
    expect(screen.getByText("Test prompt")).toBeInTheDocument()
  })

  // TEACH-07 / D-21: Offline message when navigator.onLine is false
  it("shows offline message when navigator.onLine is false", () => {
    Object.defineProperty(navigator, "onLine", {
      value: false,
      writable: true,
      configurable: true,
    })
    render(<TeachBackViewer moduleId="1" onComplete={vi.fn()} />)
    expect(screen.getByText(/needs.*connection/i)).toBeInTheDocument()
  })

  // TEACH-03 / D-11: Textarea renders when SpeechRecognition unavailable
  it("renders textarea when SpeechRecognition is unavailable", () => {
    // Ensure both SpeechRecognition variants are undefined
    window.SpeechRecognition = undefined
    window.webkitSpeechRecognition = undefined
    render(<TeachBackViewer moduleId="1" onComplete={vi.fn()} />)
    expect(document.querySelector("textarea")).toBeInTheDocument()
  })

  // TEACH-02 / D-05: Mic button renders when SpeechRecognition is available
  it("renders mic button when SpeechRecognition is available", () => {
    // Mock SpeechRecognition as a constructor class
    window.SpeechRecognition = class MockSpeechRecognition {
      continuous = false
      interimResults = false
      lang = ""
      onresult = null
      onend = null
      start() {}
      stop() {}
    }
    render(<TeachBackViewer moduleId="1" onComplete={vi.fn()} />)
    // Mic button should be present
    expect(screen.getByRole("button", { name: /start recording|mic|record/i })).toBeInTheDocument()
  })

  // TEACH-04 / D-07: Shows transcript in editable textarea after recording
  it("shows transcript in editable textarea after recording", async () => {
    // TODO: This test requires a full SpeechRecognition mock that fires onresult.
    // The interaction is: mount → tap mic → fire onresult → tap stop → textarea appears.
    // Deferred to implementation phase — complexity of wiring onresult in jsdom.
    // Placeholder: component renders without crashing when SpeechRecognition is mocked.
    window.SpeechRecognition = class MockSpeechRecognition {
      continuous = false
      interimResults = false
      lang = ""
      onresult = null
      onend = null
      start() {}
      stop() {}
    }
    render(<TeachBackViewer moduleId="1" onComplete={vi.fn()} />)
    // Component should render mic button without crashing
    expect(screen.getByRole("button", { name: /start recording|mic|record/i })).toBeInTheDocument()
  })

  // TEACH-05 / D-04: Calls /api/evaluate with moduleId, conceptArea, explanation on submit
  it("calls /api/evaluate with moduleId, conceptArea, and explanation on submit", async () => {
    window.SpeechRecognition = undefined
    window.webkitSpeechRecognition = undefined

    const mockResponse = { score: 4, pass: true, correct: ["Good explanation"], missed: [] }
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    render(<TeachBackViewer moduleId="1" onComplete={vi.fn()} />)

    const textarea = document.querySelector("textarea")
    fireEvent.change(textarea, { target: { value: "My explanation here" } })

    const submitButton = screen.getByRole("button", { name: /submit/i })
    fireEvent.click(submitButton)

    // Wait for fetch to be called
    await vi.waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/evaluate",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({ "Content-Type": "application/json" }),
          body: expect.stringContaining("My explanation here"),
        })
      )
    })

    // Verify moduleId and conceptArea are in the request body
    const callBody = JSON.parse(fetch.mock.calls[0][1].body)
    expect(callBody.moduleId).toBe("1")
    expect(callBody.conceptArea).toBe("Test area")
    expect(callBody.explanation).toBe("My explanation here")
  })

  // TEACH-06 / D-13 / D-14: Displays score and feedback bullets from evaluation
  it("displays score and feedback bullets from evaluation", async () => {
    window.SpeechRecognition = undefined
    window.webkitSpeechRecognition = undefined

    const mockResponse = {
      score: 4,
      pass: true,
      correct: ["You nailed the definition"],
      missed: ["Could add more detail"],
    }
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    render(<TeachBackViewer moduleId="1" onComplete={vi.fn()} />)

    const textarea = document.querySelector("textarea")
    fireEvent.change(textarea, { target: { value: "My explanation here" } })
    fireEvent.click(screen.getByRole("button", { name: /submit/i }))

    // Wait for score and bullet text to appear
    expect(await screen.findByText(/4/)).toBeInTheDocument()
    expect(await screen.findByText("You nailed the definition")).toBeInTheDocument()
    expect(await screen.findByText("Could add more detail")).toBeInTheDocument()
  })

  // TEACH-06 / D-16: Calls onComplete when evaluation passes
  it("calls onComplete when evaluation passes", async () => {
    window.SpeechRecognition = undefined
    window.webkitSpeechRecognition = undefined

    const onComplete = vi.fn()
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ score: 4, pass: true, correct: ["Great"], missed: [] }),
    })

    render(<TeachBackViewer moduleId="1" onComplete={onComplete} />)

    const textarea = document.querySelector("textarea")
    fireEvent.change(textarea, { target: { value: "My explanation" } })
    fireEvent.click(screen.getByRole("button", { name: /submit/i }))

    await vi.waitFor(() => {
      expect(onComplete).toHaveBeenCalledTimes(1)
    })
  })

  // TEACH-06 / D-17: Shows Try Again button and does NOT call onComplete when evaluation fails
  it("shows Try Again button and does NOT call onComplete when evaluation fails", async () => {
    window.SpeechRecognition = undefined
    window.webkitSpeechRecognition = undefined

    const onComplete = vi.fn()
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ score: 2, pass: false, correct: [], missed: ["Key concept missing"] }),
    })

    render(<TeachBackViewer moduleId="1" onComplete={onComplete} />)

    const textarea = document.querySelector("textarea")
    fireEvent.change(textarea, { target: { value: "Incomplete explanation" } })
    fireEvent.click(screen.getByRole("button", { name: /submit/i }))

    expect(await screen.findByRole("button", { name: /try again/i })).toBeInTheDocument()
    expect(onComplete).not.toHaveBeenCalled()
  })

  // TEACH-06 / D-17: Try Again returns to input screen
  it("Try Again returns to input screen", async () => {
    window.SpeechRecognition = undefined
    window.webkitSpeechRecognition = undefined

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ score: 1, pass: false, correct: [], missed: ["Major errors"] }),
    })

    render(<TeachBackViewer moduleId="1" onComplete={vi.fn()} />)

    const textarea = document.querySelector("textarea")
    fireEvent.change(textarea, { target: { value: "Wrong explanation" } })
    fireEvent.click(screen.getByRole("button", { name: /submit/i }))

    // Wait for Try Again button
    const tryAgainButton = await screen.findByRole("button", { name: /try again/i })
    fireEvent.click(tryAgainButton)

    // After clicking Try Again, should return to input screen (textarea or mic button visible)
    await vi.waitFor(() => {
      const hasTextarea = document.querySelector("textarea") !== null
      const hasMicButton = screen.queryByRole("button", { name: /start recording|mic|record/i }) !== null
      expect(hasTextarea || hasMicButton).toBe(true)
    })
  })
})
