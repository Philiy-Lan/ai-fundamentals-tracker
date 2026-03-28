import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { ActivityPanel } from "../components/ActivityPanel.jsx"

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

  it("shows placeholder content when isOpen is true (PANEL-01, PANEL-02)", () => {
    render(
      <ActivityPanel
        activity={mockActivity}
        moduleId="1"
        checked={false}
        isOpen={true}
        onPanelToggle={vi.fn()}
        onComplete={vi.fn()}
        phaseColor="#b07ff5"
      />
    )
    expect(screen.getByText(/Content coming in Phase/)).toBeInTheDocument()
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
