import { describe, it, expect } from "vitest"
import { QUIZZES } from "../data/content/quizzes.js"

describe("QUIZZES", () => {
  it("is keyed '1' through '8'", () => {
    const keys = Object.keys(QUIZZES)
    expect(keys).toEqual(["1", "2", "3", "4", "5", "6", "7", "8"])
  })

  it("module 1 has 2 or more questions with correct shape", () => {
    const questions = QUIZZES["1"]
    expect(Array.isArray(questions)).toBe(true)
    expect(questions.length).toBeGreaterThanOrEqual(2)
    questions.forEach((q) => {
      expect(typeof q.question).toBe("string")
      expect(q.question.length).toBeGreaterThan(0)
      expect(Array.isArray(q.options)).toBe(true)
      expect(q.options.length).toBeGreaterThanOrEqual(2)
      q.options.forEach((opt) => {
        expect(typeof opt).toBe("string")
      })
      expect(typeof q.correctIndex).toBe("number")
      expect(q.correctIndex).toBeGreaterThanOrEqual(0)
      expect(q.correctIndex).toBeLessThan(q.options.length)
    })
  })

  it("modules 2-8 are empty arrays", () => {
    for (let i = 2; i <= 8; i++) {
      expect(QUIZZES[String(i)]).toEqual([])
    }
  })
})
