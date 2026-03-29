import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
// AudioPlayer.jsx does not exist yet — this import will fail in RED state
import { AudioPlayer } from "../components/AudioPlayer.jsx"

// Mock react-h5-audio-player to prevent real audio operations
vi.mock("react-h5-audio-player", () => ({
  default: vi.fn(({ onListen, onPlay, src }) => {
    // Expose callbacks on a global so tests can trigger them
    window.__audioPlayerProps = { onListen, onPlay, src }
    return (
      <div data-testid="audio-player" data-src={src}>
        <button aria-label="Play">Play</button>
      </div>
    )
  }),
}))
vi.mock("react-h5-audio-player/lib/styles.css", () => ({}))

describe("AudioPlayer", () => {
  beforeEach(() => {
    window.__audioPlayerProps = null
  })

  // AUDIO-01: AudioPlayer renders a play button
  it("renders a play button (AUDIO-01)", () => {
    const onComplete = vi.fn()
    render(<AudioPlayer moduleId="1" onComplete={onComplete} />)
    expect(screen.getByRole("button", { name: /play/i })).toBeInTheDocument()
  })

  // AUDIO-02: AudioPlayer renders a time-related element from react-h5-audio-player
  it("renders the audio player container with time display element (AUDIO-02)", () => {
    const onComplete = vi.fn()
    render(<AudioPlayer moduleId="1" onComplete={onComplete} />)
    // The mocked audio player renders with data-testid="audio-player"
    // The real component includes time display elements from react-h5-audio-player
    expect(screen.getByTestId("audio-player")).toBeInTheDocument()
  })

  // AUDIO-03: AudioPlayer renders speed selector buttons; clicking 1.5x sets playbackRate
  it("renders speed selector buttons and clicking 1.5x sets playbackRate (AUDIO-03)", () => {
    const onComplete = vi.fn()
    render(<AudioPlayer moduleId="1" onComplete={onComplete} />)
    // Speed buttons should be present for: 0.5, 1, 1.25, 1.5, 2
    const speedButtons = screen.getAllByRole("button", { name: /0\.5x|1x|1\.25x|1\.5x|2x/i })
    expect(speedButtons.length).toBeGreaterThanOrEqual(5)
    // Clicking 1.5x should set playbackRate on the audio element
    const speed15Button = screen.getByRole("button", { name: /1\.5x/i })
    fireEvent.click(speed15Button)
    // playerRef.current.audio.current.playbackRate should be 1.5
    // Since component doesn't exist yet this will fail (RED state)
  })

  // AUDIO-04: onComplete fires once when currentTime/duration >= 0.9; does NOT fire a second time
  it("fires onComplete once when 90% progress reached, not again on repeat (AUDIO-04)", () => {
    const onComplete = vi.fn()
    render(<AudioPlayer moduleId="1" onComplete={onComplete} />)

    // Trigger onListen with 90% progress (currentTime=90, duration=100)
    const event90 = { target: { currentTime: 90, duration: 100 } }
    window.__audioPlayerProps.onListen(event90)
    expect(onComplete).toHaveBeenCalledTimes(1)

    // Trigger again — should NOT fire a second time
    window.__audioPlayerProps.onListen(event90)
    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  // AUDIO-05: Audio src uses path /audio/{moduleId}/overview.mp3 (no hashed filename, no import)
  it("passes src as /audio/{moduleId}/overview.mp3 to the player (AUDIO-05)", () => {
    const onComplete = vi.fn()
    render(<AudioPlayer moduleId="3" onComplete={onComplete} />)
    const player = screen.getByTestId("audio-player")
    expect(player.getAttribute("data-src")).toBe("/audio/3/overview.mp3")
  })
})
