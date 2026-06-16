import { useRef, useState } from 'react'
import Atmosphere from './Atmosphere'

const RESET_TAPS = 5
const TAP_WINDOW_MS = 1500

export default function StartScreen({ onEnter, onResetProgress }) {
  const [tapCount, setTapCount] = useState(0)
  const tapTimer = useRef(null)

  const handleTitleTap = () => {
    const next = tapCount + 1

    if (tapTimer.current) clearTimeout(tapTimer.current)

    if (next >= RESET_TAPS) {
      setTapCount(0)
      onResetProgress()
      return
    }

    setTapCount(next)
    tapTimer.current = setTimeout(() => setTapCount(0), TAP_WINDOW_MS)
  }

  return (
    <div className="souls-bg relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center">
      <Atmosphere particleCount={18} />

      <div className="fade-in relative z-10 flex flex-col items-center gap-6">
        <img
          src="/icons/elden.png"
          alt=""
          aria-hidden
          className="w-48 max-w-[60%] object-contain drop-shadow-[0_0_24px_rgba(200,168,78,0.3)] sm:w-56"
        />

        <p className="font-heading text-xs uppercase tracking-[0.35em] text-bronze">
          Una prueba para el Tarnished
        </p>

        <h1
          onClick={handleTitleTap}
          className="select-none font-display text-4xl leading-tight text-gold drop-shadow-[0_0_18px_rgba(200,168,78,0.35)] sm:text-5xl"
        >
          The Tarnished&apos;s
          <br />
          Birthday
        </h1>

        <p className="max-w-xs font-body text-sm leading-relaxed text-bone/80">
          La gracia ilumina las Tierras Intermedias. Cuatro pruebas te aguardan
          en el camino, y al final de todas, la Cuchilla de Miquella. Reclama sus
          runas y preséntalas ante la Doncella.
        </p>

        <button onClick={onEnter} className="souls-button mt-4 text-base">
          Levántate, Tarnished
        </button>
      </div>

      <p className="absolute bottom-6 z-10 font-body text-[10px] uppercase tracking-[0.25em] text-mist">
        Feliz Cumpleaños
      </p>
    </div>
  )
}
