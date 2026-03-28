import { describe, it, expect } from "vitest"
import { normalizeMindmapToDeck } from "../hooks/useSync.js"

describe("sync.migration", () => {
  it("normalizeMindmapToDeck is exported from useSync.js", () => {
    expect(typeof normalizeMindmapToDeck).toBe("function")
  })

  it("remote data with mindmap: true normalized to deck: true before merge", () => {
    const remoteData = {
      completed: {
        "1": { audio: false, mindmap: true, flashcards: false, quiz: false, teachback: false },
        "2": { audio: true, mindmap: false, flashcards: false, quiz: false, teachback: false },
      },
      notes: {},
      streak: { current: 0, best: 0, lastStudyDate: null },
      celebratedMilestones: [],
    }

    const result = normalizeMindmapToDeck(remoteData)

    expect(result.completed["1"].deck).toBe(true)
    expect(result.completed["2"].deck).toBe(false)
  })

  it("mindmap key absent from normalized result", () => {
    const remoteData = {
      completed: {
        "1": { audio: false, mindmap: true, flashcards: false, quiz: false, teachback: false },
      },
      notes: {},
      streak: { current: 0, best: 0, lastStudyDate: null },
      celebratedMilestones: [],
    }

    const result = normalizeMindmapToDeck(remoteData)

    expect(result.completed["1"].mindmap).toBeUndefined()
  })
})
