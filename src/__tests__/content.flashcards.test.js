import { describe, it, expect } from "vitest"
import { FLASHCARDS } from "../data/content/flashcards.js"

describe("FLASHCARDS", () => {
  it("is keyed '1' through '8'", () => {
    const keys = Object.keys(FLASHCARDS)
    expect(keys).toEqual(["1", "2", "3", "4", "5", "6", "7", "8"])
  })

  it("module 1 has 2 or more cards with question and answer strings", () => {
    const cards = FLASHCARDS["1"]
    expect(Array.isArray(cards)).toBe(true)
    expect(cards.length).toBeGreaterThanOrEqual(2)
    cards.forEach((card) => {
      expect(typeof card.question).toBe("string")
      expect(card.question.length).toBeGreaterThan(0)
      expect(typeof card.answer).toBe("string")
      expect(card.answer.length).toBeGreaterThan(0)
    })
  })

  it("modules 2-8 are empty arrays", () => {
    for (let i = 2; i <= 8; i++) {
      expect(FLASHCARDS[String(i)]).toEqual([])
    }
  })
})
