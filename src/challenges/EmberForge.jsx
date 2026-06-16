import { useEffect, useRef, useState } from 'react'

const RUNES = [
  { id: 0, symbol: 'ᚠ', name: 'Fehu', position: 'top', color: '#ff8a3d' },
  { id: 1, symbol: 'ᚢ', name: 'Uruz', position: 'right', color: '#ff4d3d' },
  { id: 2, symbol: 'ᚦ', name: 'Thurisaz', position: 'bottom', color: '#ffc94b' },
  { id: 3, symbol: 'ᚨ', name: 'Ansuz', position: 'left', color: '#fff4d6' },
]

const TOTAL_ROUNDS = 5
const LIGHT_MS = 800
const PAUSE_MS = 300
const PRE_SHOW_MS = 700
const CORRECT_FLASH_MS = 350
const ROUND_PAUSE_MS = 900
const FAIL_PAUSE_MS = 1800
const VICTORY_DELAY_MS = 1400

const MSG_SHOWING = 'Observa...'
const MSG_INPUT = 'Tu turno, Tarnished'
const MSG_FAIL = 'La forja rechaza tu ofrenda. Empieza de nuevo.'
const MSG_ROUND_COMPLETE = 'La brasa resiste. La forja se aviva aún más...'
const MSG_VICTORY = 'Las llamas se calman, satisfechas: la forja entrega su regalo...'

const randomRuneId = () => Math.floor(Math.random() * RUNES.length)
const buildSequence = () => Array.from({ length: TOTAL_ROUNDS }, randomRuneId)

export default function EmberForge({ onComplete }) {
  const [sequence, setSequence] = useState(buildSequence)
  const [round, setRound] = useState(1)
  const [phase, setPhase] = useState('showing')
  const [litRune, setLitRune] = useState(null)
  const [feedback, setFeedback] = useState({})
  const [playerStep, setPlayerStep] = useState(0)
  const [message, setMessage] = useState(MSG_SHOWING)

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
      const onAt = PRE_SHOW_MS + i * (LIGHT_MS + PAUSE_MS)
      schedule(() => setLitRune(runeId), onAt)
      schedule(() => setLitRune(null), onAt + LIGHT_MS)
    })

    schedule(() => {
      setPhase('input')
      setMessage(MSG_INPUT)
    }, PRE_SHOW_MS + steps.length * (LIGHT_MS + PAUSE_MS))

    return () => localIds.forEach(clearTimeout)
  }, [phase, round, sequence])

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
      setPhase('victory')
      setMessage(MSG_VICTORY)
      addTimeout(onComplete, VICTORY_DELAY_MS)
    } else {
      setPhase('round-complete')
      setMessage(MSG_ROUND_COMPLETE)
      addTimeout(() => {
        setRound((r) => r + 1)
        setPhase('showing')
      }, ROUND_PAUSE_MS)
    }
  }

  const inputDisabled = phase !== 'input'
  const showSpark = phase === 'round-complete' || phase === 'victory'

  return (
    <div className="flex flex-col items-center gap-5 text-center">
      <p className="font-heading text-xs uppercase tracking-[0.3em] text-bronze">
        Ember {Math.min(round, TOTAL_ROUNDS)}/{TOTAL_ROUNDS}
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
          <span className="ember-core">🔥</span>
          {showSpark && (
            <div className="ember-spark-container" key={`${round}-${phase}`}>
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
