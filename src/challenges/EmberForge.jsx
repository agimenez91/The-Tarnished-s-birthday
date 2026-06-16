import { useEffect, useRef, useState } from 'react'

const RUNES = [
  { id: 0, symbol: 'ᚠ', name: 'Fehu', position: 'top', color: '#ff8a3d' },
  { id: 1, symbol: 'ᚢ', name: 'Uruz', position: 'right', color: '#ff4d3d' },
  { id: 2, symbol: 'ᚦ', name: 'Thurisaz', position: 'bottom', color: '#ffc94b' },
  { id: 3, symbol: 'ᚨ', name: 'Ansuz', position: 'left', color: '#fff4d6' },
]

const TOTAL_ROUNDS = 5
const PRE_SHOW_MS = 700
const CORRECT_FLASH_MS = 350
const ROUND_PAUSE_MS = 900
const FAIL_PAUSE_MS = 1800
const VICTORY_DELAY_MS = 1400

// Two attempts: the second lights the sequence faster.
const ATTEMPTS = [
  { lightMs: 800, pauseMs: 300 },
  { lightMs: 500, pauseMs: 200 },
]
const TOTAL_ATTEMPTS = ATTEMPTS.length

const MSG_SHOWING = 'Observa...'
const MSG_INPUT = 'Tu turno, Tarnished'
const MSG_FAIL = 'La forja rechaza tu ofrenda. Empieza de nuevo.'
const MSG_ROUND_COMPLETE = 'La brasa resiste. La forja se aviva aún más...'
const MSG_VICTORY = 'Las llamas se calman, satisfechas: la forja entrega su regalo...'

const randomRuneId = () => Math.floor(Math.random() * RUNES.length)
const buildSequence = () => Array.from({ length: TOTAL_ROUNDS }, randomRuneId)

export default function EmberForge({ onComplete }) {
  const [attempt, setAttempt] = useState(0) // index into ATTEMPTS
  const [sequence, setSequence] = useState(buildSequence)
  const [round, setRound] = useState(1)
  const [phase, setPhase] = useState('showing') // 'showing'|'input'|'fail'|'round-complete'|'victory'|'attempt-clear'
  const [litRune, setLitRune] = useState(null)
  const [feedback, setFeedback] = useState({})
  const [playerStep, setPlayerStep] = useState(0)
  const [message, setMessage] = useState(MSG_SHOWING)

  const { lightMs, pauseMs } = ATTEMPTS[attempt]

  const timeoutsRef = useRef([])

  const [sparkParticles] = useState(() =>
    Array.from({ length: 10 }, () => {
      const angle = Math.random() * Math.PI * 2
      const distance = 35 + Math.random() * 35
      return {
        px: Math.cos(angle) * distance,
        py: Math.sin(angle) * distance,
        delay: Math.random() * 0.15,
      }
    }),
  )

  const addTimeout = (fn, ms) => {
    const id = setTimeout(fn, ms)
    timeoutsRef.current.push(id)
    return id
  }

  useEffect(() => () => timeoutsRef.current.forEach(clearTimeout), [])

  // Play the lighting sequence for the current round whenever we enter 'showing'.
  useEffect(() => {
    if (phase !== 'showing') return

    setMessage(MSG_SHOWING)
    setPlayerStep(0)
    setLitRune(null)
    setFeedback({})

    const localIds = []
    const schedule = (fn, ms) => {
      const id = setTimeout(fn, ms)
      localIds.push(id)
      timeoutsRef.current.push(id)
    }

    const steps = sequence.slice(0, round)
    steps.forEach((runeId, i) => {
      const onAt = PRE_SHOW_MS + i * (lightMs + pauseMs)
      schedule(() => setLitRune(runeId), onAt)
      schedule(() => setLitRune(null), onAt + lightMs)
    })

    schedule(() => {
      setPhase('input')
      setMessage(MSG_INPUT)
    }, PRE_SHOW_MS + steps.length * (lightMs + pauseMs))

    return () => localIds.forEach(clearTimeout)
  }, [phase, round, sequence, lightMs, pauseMs])

  const handlePress = (runeId) => {
    if (phase !== 'input') return

    const expected = sequence[playerStep]

    if (runeId !== expected) {
      setPhase('fail')
      setMessage(MSG_FAIL)
      setFeedback(
        RUNES.reduce((acc, rune) => {
          acc[rune.id] = rune.id === expected ? 'reveal' : 'fail'
          return acc
        }, {}),
      )

      addTimeout(() => {
        setSequence(buildSequence())
        setRound(1)
        setPhase('showing')
      }, FAIL_PAUSE_MS)
      return
    }

    setFeedback({ [runeId]: 'correct' })
    addTimeout(() => setFeedback({}), CORRECT_FLASH_MS)

    const nextStep = playerStep + 1

    if (nextStep < round) {
      setPlayerStep(nextStep)
      return
    }

    if (round === TOTAL_ROUNDS) {
      if (attempt >= TOTAL_ATTEMPTS - 1) {
        setPhase('victory')
        setMessage(MSG_VICTORY)
        addTimeout(onComplete, VICTORY_DELAY_MS)
      } else {
        setPhase('attempt-clear')
        setMessage(MSG_VICTORY)
      }
    } else {
      setPhase('round-complete')
      setMessage(MSG_ROUND_COMPLETE)
      addTimeout(() => {
        setRound((r) => r + 1)
        setPhase('showing')
      }, ROUND_PAUSE_MS)
    }
  }

  const beginSecondAttempt = () => {
    setAttempt((a) => a + 1)
    setSequence(buildSequence())
    setRound(1)
    setFeedback({})
    setPlayerStep(0)
    setLitRune(null)
    setPhase('showing')
  }

  if (phase === 'attempt-clear') {
    return (
      <div className="fade-in flex flex-col items-center gap-5 py-4 text-center">
        <p className="font-heading text-xs uppercase tracking-[0.3em] shimmer-text">
          Primer saco forjado
        </p>
        <p className="font-body text-sm leading-relaxed text-bone/80">
          Una runa arde ya en tu mano. Pero la forja guarda un segundo himno, más veloz que el
          primero. Escúchalo bien, Tarnished.
        </p>
        <button type="button" onClick={beginSecondAttempt} className="souls-button w-full py-4 text-lg">
          Escuchar el segundo himno
        </button>
      </div>
    )
  }

  const inputDisabled = phase !== 'input'
  const showSpark = phase === 'round-complete' || phase === 'victory' || phase === 'attempt-clear'

  return (
    <div className="flex flex-col items-center gap-5 text-center">
      <p className="font-heading text-xs uppercase tracking-[0.3em] text-bronze">
        Himno {attempt + 1}/{TOTAL_ATTEMPTS} · Brasa {Math.min(round, TOTAL_ROUNDS)}/{TOTAL_ROUNDS}
      </p>

      <div className="ember-grid">
        {RUNES.map((rune) => (
          <button
            key={rune.id}
            type="button"
            disabled={inputDisabled}
            onClick={() => handlePress(rune.id)}
            aria-label={rune.name}
            className={`ember-rune-btn ember-rune-btn--${rune.position} ${
              litRune === rune.id ? 'is-lit' : ''
            } ${feedback[rune.id] ? `is-${feedback[rune.id]}` : ''}`}
            style={{ '--ember-color': rune.color }}
          >
            {rune.symbol}
          </button>
        ))}

        <div className="ember-center">
          <img src="/icons/boss.webp" alt="" className="ember-core" />
          {showSpark && (
            <div className="ember-spark-container" key={`${attempt}-${round}-${phase}`}>
              {sparkParticles.map((particle, index) => (
                <span
                  key={index}
                  className="ember-spark"
                  style={{
                    animationDelay: `${particle.delay}s`,
                    '--px': `${particle.px}px`,
                    '--py': `${particle.py}px`,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <p className="min-h-[3rem] font-body text-sm leading-relaxed text-bone/80">{message}</p>
    </div>
  )
}
