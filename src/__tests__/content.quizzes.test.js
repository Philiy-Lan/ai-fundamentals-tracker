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

  it("all 8 modules have 2 or more questions with correct { question, options, correctIndex } shape", () => {
    for (let i = 1; i <= 8; i++) {
      const questions = QUIZZES[String(i)]
      expect(Array.isArray(questions), `module ${i} should be an array`).toBe(true)
      expect(questions.length, `module ${i} should have at least 2 questions`).toBeGreaterThanOrEqual(2)
      questions.forEach((q, idx) => {
        expect(typeof q.question, `module ${i} question ${idx} should be a string`).toBe("string")
        expect(q.question.length, `module ${i} question ${idx} should not be empty`).toBeGreaterThan(0)
        expect(Array.isArray(q.options), `module ${i} question ${idx} options should be an array`).toBe(true)
        expect(q.options.length, `module ${i} question ${idx} should have at least 2 options`).toBeGreaterThanOrEqual(2)
        q.options.forEach((opt, optIdx) => {
          expect(typeof opt, `module ${i} question ${idx} option ${optIdx} should be a string`).toBe("string")
        })
        expect(typeof q.correctIndex, `module ${i} question ${idx} correctIndex should be a number`).toBe("number")
        expect(q.correctIndex, `module ${i} question ${idx} correctIndex should be >= 0`).toBeGreaterThanOrEqual(0)
        expect(q.correctIndex, `module ${i} question ${idx} correctIndex should be < options.length`).toBeLessThan(q.options.length)
      })
    }
  })
})
