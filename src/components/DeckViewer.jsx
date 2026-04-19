import useEmblaCarousel from "embla-carousel-react"
import { useCallback, useEffect, useState, useRef } from "react"
import { flushSync } from "react-dom"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"

export function DeckViewer({ moduleId, slideCount, onComplete }) {
  // Build slide URLs from moduleId and slideCount — no fetch needed
  const slides = Array.from(
    { length: slideCount },
    (_, i) => `/decks/${moduleId}/slide-${i + 1}.jpg`
  )

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, align: "start", containScroll: "trimSnaps" })
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [zoomedSrc, setZoomedSrc] = useState(null)
  const completedRef = useRef(false)

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
                onClick={() => setZoomedSrc(src)}
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
        <span
          className="text-sm tabular-nums"
          style={{ color: "var(--text-muted)" }}
        >
          {selectedIndex + 1} / {slides.length}
        </span>
        <button
          onClick={() => emblaApi?.scrollNext()}
          className="p-1.5 rounded-lg cursor-pointer transition-colors"
          style={{ color: "var(--text-muted)", border: "1px solid var(--border)" }}
          aria-label="Next slide"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Zoom modal */}
      <AnimatePresence>
        {zoomedSrc && (
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setZoomedSrc(null)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 50,
              backgroundColor: "rgba(0,0,0,0.88)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "zoom-out",
            }}
          >
            <img
              src={zoomedSrc}
              alt="Slide zoomed"
              style={{
                maxWidth: "95vw",
                maxHeight: "90vh",
                borderRadius: "8px",
                boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
