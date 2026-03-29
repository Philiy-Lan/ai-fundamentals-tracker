import { describe, it, expect } from "vitest"
import { TEACHBACK_PROMPTS } from "../data/content/teachback.js"

describe("TEACHBACK_PROMPTS", () => {
  it("is keyed '1' through '8'", () => {
    const keys = Object.keys(TEACHBACK_PROMPTS)
    expect(keys).toEqual(["1", "2", "3", "4", "5", "6", "7", "8"])
  })

  it("module 1 has 1 or more prompts with prompt and conceptArea strings", () => {
    const prompts = TEACHBACK_PROMPTS["1"]
    expect(Array.isArray(prompts)).toBe(true)
    expect(prompts.length).toBeGreaterThanOrEqual(1)
    prompts.forEach((p) => {
      expect(typeof p.prompt).toBe("string")
      expect(p.prompt.length).toBeGreaterThan(0)
      expect(typeof p.conceptArea).toBe("string")
      expect(p.conceptArea.length).toBeGreaterThan(0)
    })
  })

  it("modules 2-8 each have 1 or more prompts with prompt and conceptArea strings", () => {
    for (let i = 2; i <= 8; i++) {
      const prompts = TEACHBACK_PROMPTS[String(i)]
      expect(Array.isArray(prompts)).toBe(true)
      expect(prompts.length).toBeGreaterThanOrEqual(1)
      prompts.forEach((p) => {
        expect(typeof p.prompt).toBe("string")
        expect(p.prompt.length).toBeGreaterThan(0)
        expect(typeof p.conceptArea).toBe("string")
        expect(p.conceptArea.length).toBeGreaterThan(0)
      })
    }
  })
})
