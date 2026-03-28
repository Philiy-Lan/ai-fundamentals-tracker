import { describe, it, expect } from "vitest"
import { MODULES } from "../data/modules.js"

describe("modules.migration", () => {
  it("no activity in MODULES has id 'mindmap'", () => {
    const allActivityIds = MODULES.flatMap((m) => m.activities.map((a) => a.id))
    expect(allActivityIds).not.toContain("mindmap")
  })

  it("every module has exactly one activity with id 'deck'", () => {
    for (const mod of MODULES) {
      const deckActivities = mod.activities.filter((a) => a.id === "deck")
      expect(deckActivities).toHaveLength(1)
    }
  })

  it("deck activity has icon 'Images' and label 'Deck'", () => {
    for (const mod of MODULES) {
      const deckActivity = mod.activities.find((a) => a.id === "deck")
      expect(deckActivity).toBeDefined()
      expect(deckActivity.icon).toBe("Images")
      expect(deckActivity.label).toBe("Deck")
    }
  })
})
