import { vi, describe, it, expect, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
// DeckViewer.jsx does not exist yet — this import will fail in RED state
import { DeckViewer } from "../components/DeckViewer.jsx"

// Mock embla carousel with a controllable API
const mockScrollNext = vi.fn()
const mockScrollPrev = vi.fn()
let mockSelectCallback = null
let mockSelectedIndex = 0

vi.mock("embla-carousel-react", () => ({
  default: vi.fn(() => {
    const emblaRef = { current: null }
    const emblaApi = {
      scrollNext: mockScrollNext,
      scrollPrev: mockScrollPrev,
      selectedScrollSnap: vi.fn(() => mockSelectedIndex),
      on: vi.fn((event, cb) => {
        if (event === "select") mockSelectCallback = cb
      }),
      off: vi.fn(),
    }
    return [emblaRef, emblaApi]
  }),
}))

describe("DeckViewer", () => {
  beforeEach(() => {
    mockScrollNext.mockClear()
    mockScrollPrev.mockClear()
    mockSelectCallback = null
    mockSelectedIndex = 0
  })

  // DECK-01: DeckViewer renders prev/next buttons and at least one slide image (img with alt "Slide 1")
  it("renders prev/next buttons and a slide image with alt Slide 1 (DECK-01)", () => {
    const onComplete = vi.fn()
    render(<DeckViewer moduleId="1" slideCount={3} onComplete={onComplete} />)
    expect(screen.getByRole("button", { name: /prev|previous|back|left|◀|←/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /next|forward|right|▶|→/i })).toBeInTheDocument()
    expect(screen.getByAltText("Slide 1")).toBeInTheDocument()
  })

  // DECK-02: Slide counter shows "1 / N" on mount; after scrollNext event fires, shows "2 / N"
  it("shows slide counter 1 / 3 on mount and 2 / 3 after select event with index 1 (DECK-02)", () => {
    const onComplete = vi.fn()
    render(<DeckViewer moduleId="1" slideCount={3} onComplete={onComplete} />)
    // Initial render should show "1 / 3"
    expect(screen.getByText("1 / 3")).toBeInTheDocument()
    // Simulate a "select" event from embla (user navigated to slide 2, index 1)
    mockSelectedIndex = 1
    if (mockSelectCallback) mockSelectCallback()
    expect(screen.getByText("2 / 3")).toBeInTheDocument()
  })

  // DECK-03: Clicking a slide image renders a modal overlay
  it("clicking a slide image shows a modal overlay (DECK-03)", () => {
    const onComplete = vi.fn()
    render(<DeckViewer moduleId="1" slideCount={3} onComplete={onComplete} />)
    const slide = screen.getByAltText("Slide 1")
    fireEvent.click(slide)
    // Modal overlay should appear — a fixed position div covering the screen
    const modal = screen.getByRole("dialog")
    expect(modal).toBeInTheDocument()
  })

  // DECK-04: onComplete fires when user scrolls to last slide; does NOT fire twice
  it("fires onComplete once when last slide is reached, not again on re-trigger (DECK-04)", () => {
    const onComplete = vi.fn()
    render(<DeckViewer moduleId="1" slideCount={3} onComplete={onComplete} />)
    // Set selected index to last slide (index 2 for slideCount=3)
    mockSelectedIndex = 2
    if (mockSelectCallback) mockSelectCallback()
    expect(onComplete).toHaveBeenCalledTimes(1)
    // Trigger again — should NOT fire a second time
    if (mockSelectCallback) mockSelectCallback()
    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  // DECK-05: ArrowRight keydown calls scrollNext; ArrowLeft calls scrollPrev
  it("ArrowRight keydown calls scrollNext and ArrowLeft calls scrollPrev (DECK-05)", () => {
    const onComplete = vi.fn()
    render(<DeckViewer moduleId="1" slideCount={3} onComplete={onComplete} />)
    // The carousel container should handle keyboard events
    const carousel = screen.getByTestId("deck-carousel")
    fireEvent.keyDown(carousel, { key: "ArrowRight" })
    expect(mockScrollNext).toHaveBeenCalledTimes(1)
    fireEvent.keyDown(carousel, { key: "ArrowLeft" })
    expect(mockScrollPrev).toHaveBeenCalledTimes(1)
  })
})
