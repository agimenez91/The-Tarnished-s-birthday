import { useEffect, useRef, useState } from 'react'

const CYCLE_MS = 2000
const ZONE_START = 38
const ZONE_WIDTH = 24
const PARRIES_NEEDED = 3
const FEEDBACK_MS = 500
const VICTORY_DELAY_MS = 1300

const FLAVOR_IDLE =
  'El Shrine Guardian alza su espada en silencio. Observa el indicador y golpea solo cuando brille en dorado.'
const FLAVOR_FAIL = 'El enemigo golpea con precisión... Reponte, Tarnished, e inténtalo de nuevo.'
const FLAVOR_SUCCESS = [
  'Una parada perfecta. El Guardian se tambalea, desequilibrado.',
  'El acero resuena una vez más: el Guardian flaquea, casi vencido.',
]
const FLAVOR_VICTORY = 'El Guardian cae, disolviéndose en motas de luz dorada...'

export default function VanillaShrine({ onComplete }) {
  const [streak, setStreak] = useState(0)
  const [indicatorPos, setIndicatorPos] = useState(0)
  const [flash, setFlash] = useState(null)
  const [guardianState, setGuardianState] = useState('idle')
  const [message, setMessage] = useState(FLAVOR_IDLE)
  const [locked, setLocked] = useState(false)

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

  // Indicator bounces back and forth across the bar (triangle wave),
  // one full there-and-back cycle every CYCLE_MS.
  useEffect(() => {
    if (guardianState === 'defeated') return
    if (startTimeRef.current === null) startTimeRef.current = performance.now()

    let frame
    const tick = (now) => {
      const elapsed = (now - startTimeRef.current) % CYCLE_MS
      const t = elapsed / CYCLE_MS
      const pos = t < 0.5 ? t * 2 * 100 : (1 - t) * 2 * 100
      setIndicatorPos(pos)
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [guardianState])

  const addTimeout = (fn, ms) => {
    const id = setTimeout(fn, ms)
    timeoutsRef.current.push(id)
  }

  const resetIndicator = () => {
    startTimeRef.current = performance.now()
    setIndicatorPos(0)
  }

  const handleParry = () => {
    if (locked || guardianState === 'defeated') return

    setLocked(true)
    addTimeout(() => setLocked(false), FEEDBACK_MS)

    const inZone = indicatorPos >= ZONE_START && indicatorPos <= ZONE_START + ZONE_WIDTH

    if (inZone) {
      setFlash('success')
      addTimeout(() => setFlash(null), FEEDBACK_MS)

      const nextStreak = streak + 1
      setStreak(nextStreak)

      if (nextStreak >= PARRIES_NEEDED) {
        setGuardianState('defeated')
        setMessage(FLAVOR_VICTORY)
        addTimeout(onComplete, VICTORY_DELAY_MS)
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

  const isDefeated = guardianState === 'defeated'

  return (
    <div className="relative flex flex-col items-center gap-5 text-center">
      <div
        className={`parry-flash ${flash === 'success' ? 'is-success' : ''} ${
          flash === 'fail' ? 'is-fail' : ''
        }`}
      />

      <p className="font-heading text-xs uppercase tracking-[0.3em] text-bronze">
        Shrine Guardian
      </p>

      <div className="relative flex h-28 w-full items-center justify-end pr-6">
        <div className="shrine-pedestal" />
        <div className="relative">
          <span
            className={`guardian-icon ${guardianState === 'hit' ? 'is-hit' : ''} ${
              isDefeated ? 'is-defeated' : ''
            }`}
          >
            🗿
          </span>
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
          <p className="font-heading text-sm uppercase tracking-[0.25em] text-gold">
            ⚔️ {streak}/{PARRIES_NEEDED}
          </p>

          <div className="parry-track">
            <div
              className="parry-zone"
              style={{ left: `${ZONE_START}%`, width: `${ZONE_WIDTH}%` }}
            />
            <div className="parry-indicator" style={{ left: `${indicatorPos}%` }} />
          </div>

          <button
            type="button"
            onClick={handleParry}
            disabled={locked}
            className="souls-button w-full py-4 text-lg"
          >
            ⚔️ Parada
          </button>
        </>
      )}
    </div>
  )
}
