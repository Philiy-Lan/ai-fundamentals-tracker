import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { ActivityPanel } from "../components/ActivityPanel.jsx"

vi.mock("../components/AudioPlayer.jsx", () => ({
  AudioPlayer: () => <div data-testid="audio-player-mock">AudioPlayer</div>,
}))
vi.mock("../components/DeckViewer.jsx", () => ({
  DeckViewer: () => <div data-testid="deck-viewer-mock">DeckViewer</div>,
}))
vi.mock("../components/FlashcardViewer.jsx", () => ({
  FlashcardViewer: () => <div data-testid="flashcard-viewer-mock">FlashcardViewer</div>,
}))
vi.mock("../components/QuizViewer.jsx", () => ({
  QuizViewer: () => <div data-testid="quiz-viewer-mock">QuizViewer</div>,
}))

const mockActivity = { id: "audio", label: "Audio Overview", icon: "Headphones" }

describe("ActivityPanel", () => {
  it("renders the activity label via ActivityCheckbox", () => {
    render(
      <ActivityPanel
        activity={mockActivity}
        moduleId="1"
        checked={false}
        isOpen={false}
        onPanelToggle={vi.fn()}
        onComplete={vi.fn()}
        phaseColor="#b07ff5"
      />
    )
    expect(screen.getByText("Audio Overview")).toBeInTheDocument()
  })

  it("does not show panel content when isOpen is false (PANEL-01)", () => {
    render(
      <ActivityPanel
        activity={mockActivity}
        moduleId="1"
        checked={false}
        isOpen={false}
        onPanelToggle={vi.fn()}
        onComplete={vi.fn()}
        phaseColor="#b07ff5"
      />
    )
    expect(screen.queryByText(/Content coming in Phase/)).not.toBeInTheDocument()
  })

  it("renders AudioPlayer when activity.id is 'audio' and isOpen is true (D-24)", () => {
    render(
      <ActivityPanel
        activity={{ id: "audio", label: "Audio Overview", icon: "Headphones" }}
        moduleId="1"
        checked={false}
        isOpen={true}
        onPanelToggle={vi.fn()}
        onComplete={vi.fn()}
        phaseColor="#b07ff5"
      />
    )
    expect(screen.getByTestId("audio-player-mock")).toBeInTheDocument()
  })

  it("renders placeholder for unimplemented activities (teachback) when isOpen is true", () => {
    render(
      <ActivityPanel
        activity={{ id: "teachback", label: "Teach-Back", icon: "MessageCircle" }}
        moduleId="1"
        checked={false}
        isOpen={true}
        onPanelToggle={vi.fn()}
        onComplete={vi.fn()}
        phaseColor="#b07ff5"
      />
    )
    expect(screen.getByText(/Content coming soon/)).toBeInTheDocument()
  })

  it("renders FlashcardViewer when activity.id is 'flashcards' and isOpen is true (D-22)", () => {
    render(
      <ActivityPanel
        activity={{ id: "flashcards", label: "Flashcards", icon: "Layers" }}
        moduleId="1"
        checked={false}
        isOpen={true}
        onPanelToggle={vi.fn()}
        onComplete={vi.fn()}
        phaseColor="#b07ff5"
      />
    )
    expect(screen.getByTestId("flashcard-viewer-mock")).toBeInTheDocument()
  })

  it("renders QuizViewer when activity.id is 'quiz' and isOpen is true (D-22)", () => {
    render(
      <ActivityPanel
        activity={{ id: "quiz", label: "Quiz", icon: "CheckCircle" }}
        moduleId="1"
        checked={false}
        isOpen={true}
        onPanelToggle={vi.fn()}
        onComplete={vi.fn()}
        phaseColor="#b07ff5"
      />
    )
    expect(screen.getByTestId("quiz-viewer-mock")).toBeInTheDocument()
  })

  it("calls onPanelToggle with activity.id when the row is tapped (PANEL-02)", () => {
    const onPanelToggle = vi.fn()
    render(
      <ActivityPanel
        activity={mockActivity}
        moduleId="1"
        checked={false}
        isOpen={false}
        onPanelToggle={onPanelToggle}
        onComplete={vi.fn()}
        phaseColor="#b07ff5"
      />
    )
    fireEvent.click(screen.getByText("Audio Overview"))
    expect(onPanelToggle).toHaveBeenCalledWith("audio")
  })

  it("does NOT call onComplete when the activity row is tapped (PANEL-03 — complete is separate)", () => {
    const onComplete = vi.fn()
    const onPanelToggle = vi.fn()
    render(
      <ActivityPanel
        activity={mockActivity}
        moduleId="1"
        checked={false}
        isOpen={false}
        onPanelToggle={onPanelToggle}
        onComplete={onComplete}
        phaseColor="#b07ff5"
      />
    )
    fireEvent.click(screen.getByText("Audio Overview"))
    expect(onComplete).not.toHaveBeenCalled()
  })
})
