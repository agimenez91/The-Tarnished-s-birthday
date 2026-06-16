import { useEffect, useRef, useState } from 'react'

const FEEDBACK_MS = 500
const VICTORY_DELAY_MS = 1300
const ZONE_START = 38

// Two offerings: same tempo, but the second demands a longer chain of parries.
const OFFERINGS = [
  { cycleMs: 2000, zoneWidth: 24, parries: 3 },
  { cycleMs: 2000, zoneWidth: 24, parries: 5 },
]
const TOTAL_OFFERINGS = OFFERINGS.length

const FLAVOR_IDLE =
  'El guardián de la capilla alza su espada en silencio. Observa el indicador y golpea solo cuando brille en dorado.'
const FLAVOR_FAIL = 'El enemigo golpea con precisión... Reponte, Tarnished, e inténtalo de nuevo.'
const FLAVOR_SUCCESS = [
  'Una parada perfecta. El guardián se tambalea, desequilibrado.',
  'El acero resuena una vez más: el guardián flaquea, casi vencido.',
]
const FLAVOR_VICTORY = 'El guardián cae, disolviéndose en motas de luz dorada...'

export default function VanillaShrine({ onComplete }) {
  const [offering, setOffering] = useState(0) // index into OFFERINGS
  const [phase, setPhase] = useState('fighting') // 'fighting' | 'offering-clear'
  const [streak, setStreak] = useState(0)
  const [indicatorPos, setIndicatorPos] = useState(0)
  const [flash, setFlash] = useState(null)
  const [guardianState, setGuardianState] = useState('idle')
  const [message, setMessage] = useState(FLAVOR_IDLE)
  const [locked, setLocked] = useState(false)

  const { cycleMs, zoneWidth, parries: parriesNeeded } = OFFERINGS[offering]

  const startTimeRef = useRef(null)
  const timeoutsRef = useRef([])

  const [burstParticles] = useState(() =>
    Array.from({ length: 12 }, () => {
      const angle = Math.random() * Math.PI * 2
      const distance = 40 + Math.random() * 60
      return {
        px: Math.cos(angle) * distance,
        py: Math.sin(angle) * distance,
        delay: Math.random() * 0.25,
        size: 3 + Math.random() * 3,
      }
    }),
  )

  useEffect(
    () => () => {
      timeoutsRef.current.forEach(clearTimeout)
    },
    [],
  )

  // Indicator bounces back and forth (triangle wave), one cycle every cycleMs.
  useEffect(() => {
    if (phase !== 'fighting' || guardianState === 'defeated') return
    startTimeRef.current = performance.now()

    let frame
    const tick = (now) => {
      const elapsed = (now - startTimeRef.current) % cycleMs
      const t = elapsed / cycleMs
      const pos = t < 0.5 ? t * 2 * 100 : (1 - t) * 2 * 100
      setIndicatorPos(pos)
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [phase, guardianState, cycleMs])

  const addTimeout = (fn, ms) => {
    const id = setTimeout(fn, ms)
    timeoutsRef.current.push(id)
  }

  const resetIndicator = () => {
    startTimeRef.current = performance.now()
    setIndicatorPos(0)
  }

  const handleParry = () => {
    if (locked || guardianState === 'defeated' || phase !== 'fighting') return

    setLocked(true)
    addTimeout(() => setLocked(false), FEEDBACK_MS)

    const inZone = indicatorPos >= ZONE_START && indicatorPos <= ZONE_START + zoneWidth

    if (inZone) {
      setFlash('success')
      addTimeout(() => setFlash(null), FEEDBACK_MS)

      const nextStreak = streak + 1
      setStreak(nextStreak)

      if (nextStreak >= parriesNeeded) {
        setGuardianState('defeated')
        setMessage(FLAVOR_VICTORY)

        if (offering >= TOTAL_OFFERINGS - 1) {
          addTimeout(onComplete, VICTORY_DELAY_MS)
        } else {
          addTimeout(() => setPhase('offering-clear'), VICTORY_DELAY_MS)
        }
      } else {
        setGuardianState('hit')
        addTimeout(() => setGuardianState((s) => (s === 'hit' ? 'idle' : s)), FEEDBACK_MS)
        setMessage(FLAVOR_SUCCESS[nextStreak - 1] ?? FLAVOR_SUCCESS[0])
      }
    } else {
      setStreak(0)
      setFlash('fail')
      addTimeout(() => setFlash(null), FEEDBACK_MS)
      setMessage(FLAVOR_FAIL)
      resetIndicator()
    }
  }

  const beginSecondOffering = () => {
    setOffering((o) => o + 1)
    setStreak(0)
    setGuardianState('idle')
    setMessage('La segunda ofrenda exige una cadena más larga. Cinco paradas perfectas, Tarnished.')
    setPhase('fighting')
    resetIndicator()
  }

  if (phase === 'offering-clear') {
    return (
      <div className="fade-in flex flex-col items-center gap-5 py-4 text-center">
        <p className="font-heading text-xs uppercase tracking-[0.3em] shimmer-text">
          Primer frasco reclamado
        </p>
        <p className="font-body text-sm leading-relaxed text-bone/80">
          Una runa ha sido tuya. Pero queda una segunda ofrenda en el altar, que exige cinco paradas
          encadenadas. Demuestra de nuevo tu temple, Tarnished.
        </p>
        <button type="button" onClick={beginSecondOffering} className="souls-button w-full py-4 text-lg">
          Afrontar la segunda ofrenda
        </button>
      </div>
    )
  }

  const isDefeated = guardianState === 'defeated'

  return (
    <div className="relative flex flex-col items-center gap-5 text-center">
      <div
        className={`parry-flash ${flash === 'success' ? 'is-success' : ''} ${
          flash === 'fail' ? 'is-fail' : ''
        }`}
      />

      <p className="font-heading text-xs uppercase tracking-[0.3em] text-bronze">
        Guardián de la Capilla · Ofrenda {offering + 1}/{TOTAL_OFFERINGS}
      </p>

      <div className="relative flex h-28 w-full items-center justify-center">
        <div className="shrine-pedestal" />
        <div className="relative">
          <img
            src="/icons/grace.webp"
            alt=""
            aria-hidden
            className={`guardian-icon h-[4.5rem] w-[4.5rem] object-contain ${
              guardianState === 'hit' ? 'is-hit' : ''
            } ${isDefeated ? 'is-defeated' : ''}`}
          />
          {isDefeated &&
            burstParticles.map((particle, index) => (
              <span
                key={index}
                className="guardian-particle"
                style={{
                  width: `${particle.size}px`,
                  height: `${particle.size}px`,
                  animationDelay: `${particle.delay}s`,
                  '--px': `${particle.px}px`,
                  '--py': `${particle.py}px`,
                }}
              />
            ))}
        </div>
      </div>

      <p className="min-h-[3.5rem] font-body text-sm leading-relaxed text-bone/80">{message}</p>

      {!isDefeated && (
        <>
          <p className="flex items-center justify-center gap-2 font-heading text-sm uppercase tracking-[0.25em] text-gold">
            <img src="/icons/espada.webp" alt="" aria-hidden className="h-5 w-5 object-contain" />
            {streak}/{parriesNeeded}
          </p>

          <div className="parry-track">
            <div
              className="parry-zone"
              style={{ left: `${ZONE_START}%`, width: `${zoneWidth}%` }}
            />
            <div className="parry-indicator" style={{ left: `${indicatorPos}%` }} />
          </div>

          <button
            type="button"
            onClick={handleParry}
            disabled={locked}
            className="souls-button flex w-full items-center justify-center gap-2 py-4 text-lg"
          >
            <img src="/icons/espada.webp" alt="" aria-hidden className="h-6 w-6 object-contain" />
            Parada
          </button>
        </>
      )}
    </div>
  )
}
