import useEmblaCarousel from "embla-carousel-react"
import { useCallback, useEffect, useState, useRef } from "react"
import { flushSync } from "react-dom"
import { ChevronLeft, ChevronRight, X, Maximize2 } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"

export function DeckViewer({ moduleId, slideCount, onComplete }) {
  // Build slide URLs from moduleId and slideCount — no fetch needed
  const slides = Array.from(
    { length: slideCount },
    (_, i) => `/decks/${moduleId}/slide-${i + 1}.jpg`
  )

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, align: "start", containScroll: "trimSnaps" })
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const completedRef = useRef(false)

  // Fullscreen carousel — separate Embla instance
  const [fsEmblaRef, fsEmblaApi] = useEmblaCarousel({ loop: false, startIndex: selectedIndex })
  const [fsIndex, setFsIndex] = useState(0)

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    const idx = emblaApi.selectedScrollSnap()
    flushSync(() => {
      setSelectedIndex(idx)
    })
    // Auto-complete when last slide reached — fires once per session
    if (!completedRef.current && idx === slides.length - 1) {
      completedRef.current = true
      onComplete()
    }
  }, [emblaApi, slides.length, onComplete])

  useEffect(() => {
    if (!emblaApi) return
    emblaApi.on("select", onSelect)
    return () => emblaApi.off("select", onSelect)
  }, [emblaApi, onSelect])

  // Sync fullscreen carousel index
  const onFsSelect = useCallback(() => {
    if (!fsEmblaApi) return
    const idx = fsEmblaApi.selectedScrollSnap()
    setFsIndex(idx)
    // Also complete if last slide reached in fullscreen
    if (!completedRef.current && idx === slides.length - 1) {
      completedRef.current = true
      onComplete()
    }
  }, [fsEmblaApi, slides.length, onComplete])

  useEffect(() => {
    if (!fsEmblaApi) return
    fsEmblaApi.on("select", onFsSelect)
    return () => fsEmblaApi.off("select", onFsSelect)
  }, [fsEmblaApi, onFsSelect])

  // When opening fullscreen, jump to current slide
  useEffect(() => {
    if (isFullscreen && fsEmblaApi) {
      fsEmblaApi.scrollTo(selectedIndex, true)
      setFsIndex(selectedIndex)
    }
  }, [isFullscreen, fsEmblaApi, selectedIndex])

  // Sync main carousel when closing fullscreen
  const closeFullscreen = useCallback(() => {
    if (emblaApi && fsEmblaApi) {
      const idx = fsEmblaApi.selectedScrollSnap()
      emblaApi.scrollTo(idx, true)
      setSelectedIndex(idx)
    }
    setIsFullscreen(false)
  }, [emblaApi, fsEmblaApi])

  // Lock body scroll when fullscreen is open
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = "hidden"
      return () => { document.body.style.overflow = "" }
    }
  }, [isFullscreen])

  // Keyboard navigation for fullscreen
  useEffect(() => {
    if (!isFullscreen) return
    const handler = (e) => {
      if (e.key === "ArrowRight") fsEmblaApi?.scrollNext()
      if (e.key === "ArrowLeft") fsEmblaApi?.scrollPrev()
      if (e.key === "Escape") closeFullscreen()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [isFullscreen, fsEmblaApi, closeFullscreen])

  return (
    <div
      data-testid="deck-carousel"
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") emblaApi?.scrollNext()
        if (e.key === "ArrowLeft") emblaApi?.scrollPrev()
      }}
      tabIndex={0}
      className="outline-none"
    >
      {/* Carousel viewport */}
      <div ref={emblaRef} style={{ overflow: "hidden", borderRadius: "8px" }}>
        <div style={{ display: "flex" }}>
          {slides.map((src, i) => (
            <div key={i} style={{ flex: "0 0 100%", minWidth: 0 }}>
              <img
                src={src}
                alt={`Slide ${i + 1}`}
                loading="lazy"
                onClick={() => setIsFullscreen(true)}
                className="w-full cursor-zoom-in rounded-lg"
                style={{ display: "block" }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation row */}
      <div className="flex items-center justify-between px-1 pt-2">
        <button
          onClick={() => emblaApi?.scrollPrev()}
          className="p-1.5 rounded-lg cursor-pointer transition-colors"
          style={{ color: "var(--text-muted)", border: "1px solid var(--border)" }}
          aria-label="Previous slide"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="flex items-center gap-3">
          <span
            className="text-sm tabular-nums"
            style={{ color: "var(--text-muted)" }}
          >
            {selectedIndex + 1} / {slides.length}
          </span>
          <button
            onClick={() => setIsFullscreen(true)}
            className="p-1 rounded cursor-pointer transition-colors"
            style={{ color: "var(--text-muted)" }}
            aria-label="View fullscreen"
          >
            <Maximize2 size={14} />
          </button>
        </div>
        <button
          onClick={() => emblaApi?.scrollNext()}
          className="p-1.5 rounded-lg cursor-pointer transition-colors"
          style={{ color: "var(--text-muted)", border: "1px solid var(--border)" }}
          aria-label="Next slide"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Fullscreen carousel modal */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 50,
              backgroundColor: "rgba(0,0,0,0.92)",
              display: "flex",
              flexDirection: "column",
              touchAction: "pan-y",
            }}
          >
            {/* Close button + counter */}
            <div className="flex items-center justify-between px-4 py-3" style={{ flexShrink: 0 }}>
              <span className="text-sm tabular-nums" style={{ color: "rgba(255,255,255,0.7)" }}>
                {fsIndex + 1} / {slides.length}
              </span>
              <button
                onClick={closeFullscreen}
                className="p-2 rounded-full cursor-pointer transition-colors"
                style={{ color: "rgba(255,255,255,0.7)", backgroundColor: "rgba(255,255,255,0.1)" }}
                aria-label="Close fullscreen"
              >
                <X size={20} />
              </button>
            </div>

            {/* Swipeable fullscreen carousel */}
            <div style={{ flex: 1, minHeight: 0, display: "flex", alignItems: "center" }}>
              {/* Prev button — desktop only */}
              <button
                onClick={() => fsEmblaApi?.scrollPrev()}
                className="hidden md:flex items-center justify-center p-2 cursor-pointer transition-colors"
                style={{ color: "rgba(255,255,255,0.6)", flexShrink: 0, width: 48 }}
                aria-label="Previous slide"
              >
                <ChevronLeft size={28} />
              </button>

              <div ref={fsEmblaRef} style={{ overflow: "hidden", flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", height: "100%" }}>
                  {slides.map((src, i) => (
                    <div
                      key={i}
                      style={{
                        flex: "0 0 100%",
                        minWidth: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "0 8px",
                      }}
                    >
                      <img
                        src={src}
                        alt={`Slide ${i + 1}`}
                        style={{
                          maxWidth: "100%",
                          maxHeight: "calc(100vh - 120px)",
                          objectFit: "contain",
                          borderRadius: "4px",
                          userSelect: "none",
                          WebkitUserSelect: "none",
                        }}
                        draggable={false}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Next button — desktop only */}
              <button
                onClick={() => fsEmblaApi?.scrollNext()}
                className="hidden md:flex items-center justify-center p-2 cursor-pointer transition-colors"
                style={{ color: "rgba(255,255,255,0.6)", flexShrink: 0, width: 48 }}
                aria-label="Next slide"
              >
                <ChevronRight size={28} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
