import { describe, it, expect, beforeEach, afterEach } from "vitest"

// We need to mock localStorage for these tests
const localStorageMock = (() => {
  let store = {}
  return {
    getItem: (key) => store[key] ?? null,
    setItem: (key, value) => { store[key] = String(value) },
    removeItem: (key) => { delete store[key] },
    clear: () => { store = {} },
  }
})()

Object.defineProperty(global, "localStorage", {
  value: localStorageMock,
  writable: true,
})

describe("storage.migration", () => {
  beforeEach(() => {
    localStorageMock.clear()
  })

  afterEach(() => {
    localStorageMock.clear()
  })

  it("loadProgress migrates mindmap: true → deck: true", async () => {
    const oldData = {
      completed: {
        "1": { audio: true, mindmap: true, flashcards: false, quiz: false, teachback: false },
        "2": { audio: false, mindmap: false, flashcards: false, quiz: false, teachback: false },
      },
      notes: {},
      streak: { current: 1, best: 1, lastStudyDate: "2026-03-28" },
      celebratedMilestones: [],
    }
    localStorageMock.setItem("ai-tracker-progress", JSON.stringify(oldData))

    const { loadProgress } = await import("../utils/storage.js?t=" + Date.now())
    const result = loadProgress()

    expect(result.completed["1"].deck).toBe(true)
    expect(result.completed["1"].mindmap).toBeUndefined()
    expect(result.completed["2"].deck).toBe(false)
    expect(result.completed["2"].mindmap).toBeUndefined()
  })

  it("migration is idempotent (second load does not corrupt deck value)", async () => {
    const newData = {
      completed: {
        "1": { audio: true, deck: true, flashcards: false, quiz: false, teachback: false },
      },
      notes: {},
      streak: { current: 1, best: 1, lastStudyDate: "2026-03-28" },
      celebratedMilestones: [],
    }
    localStorageMock.setItem("ai-tracker-progress", JSON.stringify(newData))

    const { loadProgress } = await import("../utils/storage.js?t=" + Date.now() + "b")
    const result = loadProgress()

    expect(result.completed["1"].deck).toBe(true)
    expect(result.completed["1"].mindmap).toBeUndefined()
  })

  it("data already using deck key is not affected", async () => {
    const cleanData = {
      completed: {
        "1": { audio: false, deck: false, flashcards: true, quiz: false, teachback: false },
      },
      notes: { "1": "Some notes" },
      streak: { current: 0, best: 0, lastStudyDate: null },
      celebratedMilestones: [],
    }
    localStorageMock.setItem("ai-tracker-progress", JSON.stringify(cleanData))

    const { loadProgress } = await import("../utils/storage.js?t=" + Date.now() + "c")
    const result = loadProgress()

    expect(result.completed["1"].flashcards).toBe(true)
    expect(result.completed["1"].deck).toBe(false)
    expect(result.notes["1"]).toBe("Some notes")
  })
})
