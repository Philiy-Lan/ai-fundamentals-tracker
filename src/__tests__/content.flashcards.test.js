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

  it("all 8 modules have 2 or more cards with correct { question, answer } shape", () => {
    for (let i = 1; i <= 8; i++) {
      const cards = FLASHCARDS[String(i)]
      expect(Array.isArray(cards), `module ${i} should be an array`).toBe(true)
      expect(cards.length, `module ${i} should have at least 2 cards`).toBeGreaterThanOrEqual(2)
      cards.forEach((card, idx) => {
        expect(typeof card.question, `module ${i} card ${idx} question should be a string`).toBe("string")
        expect(card.question.length, `module ${i} card ${idx} question should not be empty`).toBeGreaterThan(0)
        expect(typeof card.answer, `module ${i} card ${idx} answer should be a string`).toBe("string")
        expect(card.answer.length, `module ${i} card ${idx} answer should not be empty`).toBeGreaterThan(0)
      })
    }
  })
})
