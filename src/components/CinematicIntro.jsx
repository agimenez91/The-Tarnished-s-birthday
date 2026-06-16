import { useState } from 'react'

// Tap-to-advance cinematic intro. Receives an array of text pages and calls
// onDone after the last page. Each page re-triggers the cinematic-fade
// animation via the changing key.
export default function CinematicIntro({ pages, onDone, textClassName = '' }) {
  const [index, setIndex] = useState(0)
  const isLast = index >= pages.length - 1

  const advance = () => {
    if (isLast) {
      onDone()
    } else {
      setIndex((i) => i + 1)
    }
  }

  return (
    <button
      type="button"
      onClick={advance}
      className="flex min-h-[16rem] w-full flex-col items-center justify-center gap-6 px-2 text-center"
    >
      <p
        key={index}
        className={`cinematic-text font-display text-lg italic leading-relaxed text-gold ${textClassName}`}
      >
        {pages[index]}
      </p>
      <span className="animate-glow-pulse font-heading text-[10px] uppercase tracking-[0.3em] text-bronze">
        {isLast ? 'Toca para comenzar ⚔️' : 'Toca para continuar →'}
      </span>
    </button>
  )
}
