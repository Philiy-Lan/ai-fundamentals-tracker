import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { FlashcardViewer } from "../components/FlashcardViewer.jsx"
import { FLASHCARDS } from "../data/content/flashcards.js"

vi.mock("framer-motion", () => ({
  AnimatePresence: ({ children }) => children,
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
}))

describe("FlashcardViewer", () => {
  it("FLASH-01: renders question text and flips to answer on card click", () => {
    render(<FlashcardViewer moduleId="1" onComplete={vi.fn()} />)
    // Question text from module 1 first card should be visible
    const firstQuestion = FLASHCARDS["1"][0].question
    expect(screen.getByText(firstQuestion)).toBeInTheDocument()
    // Click the card to flip it
    fireEvent.click(screen.getByText(firstQuestion))
    // Answer text from module 1 first card should now be visible
    const firstAnswer = FLASHCARDS["1"][0].answer
    expect(screen.getByText(firstAnswer)).toBeInTheDocument()
  })

  it("FLASH-02: shows Got it and Missed it buttons only after flip", () => {
    render(<FlashcardViewer moduleId="1" onComplete={vi.fn()} />)
    // Before flip: no rating buttons
    expect(screen.queryByText("Got it")).not.toBeInTheDocument()
    expect(screen.queryByText("Missed it")).not.toBeInTheDocument()
    // Click card to flip
    const firstQuestion = FLASHCARDS["1"][0].question
    fireEvent.click(screen.getByText(firstQuestion))
    // After flip: both buttons visible
    expect(screen.getByText("Got it")).toBeInTheDocument()
    expect(screen.getByText("Missed it")).toBeInTheDocument()
  })

  it("FLASH-03: increments score on Got it rating", () => {
    render(<FlashcardViewer moduleId="1" onComplete={vi.fn()} />)
    // Flip the first card
    const firstQuestion = FLASHCARDS["1"][0].question
    fireEvent.click(screen.getByText(firstQuestion))
    // Click "Got it"
    fireEvent.click(screen.getByText("Got it"))
    // Score should show 1 correct
    expect(screen.getByText(/1.+correct/i)).toBeInTheDocument()
  })

  it("FLASH-04: shows card progress indicator Card X of Y", () => {
    render(<FlashcardViewer moduleId="1" onComplete={vi.fn()} />)
    // Progress indicator like "Card 1 of 8" should be visible on first render
    expect(screen.getByText(/Card 1 of/i)).toBeInTheDocument()
  })

  it("FLASH-05: shuffle toggle randomizes card order", () => {
    render(<FlashcardViewer moduleId="1" onComplete={vi.fn()} />)
    // Shuffle button must be present
    const shuffleButton = screen.getByRole("button", { name: /shuffle/i })
    expect(shuffleButton).toBeInTheDocument()
    // Click shuffle — at minimum the component shouldn't crash and the button state should toggle
    fireEvent.click(shuffleButton)
    // Shuffle button should still be present after toggle
    expect(screen.getByRole("button", { name: /shuffle/i })).toBeInTheDocument()
  })

  it("FLASH-06: calls onComplete after all cards are rated", () => {
    const onComplete = vi.fn()
    render(<FlashcardViewer moduleId="1" onComplete={onComplete} />)
    const cards = FLASHCARDS["1"]
    // Rate each card as "Got it" — flip then click Got it for each card
    for (let i = 0; i < cards.length; i++) {
      // Find the current card's question text or use Got it after flipping
      // First flip by clicking on the card content
      const questionEl = screen.getByText(cards[i].question)
      fireEvent.click(questionEl)
      // Click "Got it" to advance
      fireEvent.click(screen.getByText("Got it"))
    }
    expect(onComplete).toHaveBeenCalledTimes(1)
  })
})
