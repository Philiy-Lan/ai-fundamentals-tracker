import { useRef, useState, useCallback } from "react"
import ReactH5AudioPlayer from "react-h5-audio-player"
import "react-h5-audio-player/lib/styles.css"

const SPEEDS = [0.5, 1, 1.25, 1.5, 2]

export function AudioPlayer({ moduleId, onComplete }) {
  const playerRef = useRef(null)
  const completedRef = useRef(false)
  const [activeSpeed, setActiveSpeed] = useState(1)

  const handleListen = useCallback(
    (e) => {
      const { currentTime, duration } = e.target
      if (
        !completedRef.current &&
        duration > 0 &&
        currentTime / duration >= 0.9
      ) {
        completedRef.current = true
        onComplete()
      }
    },
    [onComplete]
  )

  const handleSpeed = useCallback((speed) => {
    setActiveSpeed(speed)
    if (playerRef.current?.audio?.current) {
      playerRef.current.audio.current.playbackRate = speed
    }
  }, [])

  const handlePlay = useCallback(() => {
    if (playerRef.current?.audio?.current) {
      playerRef.current.audio.current.playbackRate = activeSpeed
    }
  }, [activeSpeed])

  return (
    <div>
      <ReactH5AudioPlayer
        ref={playerRef}
        src={`/audio/${moduleId}/overview.mp3`}
        onListen={handleListen}
        onPlay={handlePlay}
        listenInterval={1000}
        showJumpControls={false}
        showDownloadProgress={false}
        showFilledProgress
        customAdditionalControls={[]}
        customVolumeControls={[]}
        layout="stacked-reverse"
        style={{
          backgroundColor: "var(--bg-card)",
          boxShadow: "none",
          borderRadius: "8px",
        }}
      />
      {/* Speed selector */}
      <div className="flex items-center justify-center gap-1.5 pt-2">
        {SPEEDS.map((speed) => (
          <button
            key={speed}
            onClick={() => handleSpeed(speed)}
            aria-label={`${speed}x`}
            className="px-2 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors"
            style={{
              backgroundColor:
                activeSpeed === speed
                  ? "var(--text-primary)"
                  : "var(--bg-card)",
              color:
                activeSpeed === speed
                  ? "var(--bg-base)"
                  : "var(--text-muted)",
              border: "1px solid var(--border)",
            }}
          >
            {speed}x
          </button>
        ))}
      </div>
    </div>
  )
}
