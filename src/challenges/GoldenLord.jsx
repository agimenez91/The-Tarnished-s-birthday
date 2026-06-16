import { useCallback, useEffect, useRef, useState } from 'react'

const LANES = ['left', 'center', 'right']
const LANE_POSITION = { left: 18, center: 50, right: 82 }

const TOTAL_ATTACKS = 20
const STARTING_LIVES = 3

const FALL_MS_START = 1500
const FALL_MS_END = 800
const SPAWN_MS_START = 1500
const SPAWN_MS_END = 800
const FIRST_SPAWN_DELAY_MS = 1300

const ROLL_MS = 400
const INVULN_MS = 200
const HIT_FLASH_MS = 350
const INTRO_MS = 2600
const VICTORY_DELAY_MS = 2600
const INPUT_DEBOUNCE_MS = 300

const ATTACK_TOP_START = -14
const ATTACK_TOP_END = 88

const MSG_INTRO =
  'Más allá de las pruebas, un resplandor dorado llama. El Señor del Auric Throne espera... no para poner a prueba tu mente, sino tu instinto...'
const MSG_VICTORY = 'El Golden Lord se arrodilla ante ti, radiante y humillado al fin...'

const lerp = (a, b, t) => a + (b - a) * t

const fallDurationFor = (index) =>
  lerp(FALL_MS_START, FALL_MS_END, index / (TOTAL_ATTACKS - 1))

const spawnIntervalFor = (index) =>
  lerp(SPAWN_MS_START, SPAWN_MS_END, index / (TOTAL_ATTACKS - 1))

const pickLane = (prevLane) => {
  const options = prevLane ? LANES.filter((lane) => lane !== prevLane) : LANES
  return options[Math.floor(Math.random() * options.length)]
}

export default function GoldenLord({ onComplete }) {
  const [phase, setPhase] = useState('intro')
  const [lives, setLives] = useState(STARTING_LIVES)
  const [survived, setSurvived] = useState(0)
  const [playerLane, setPlayerLane] = useState('center')
  const [rollDir, setRollDir] = useState(null)
  const [attacks, setAttacks] = useState([])
  const [hitFlash, setHitFlash] = useState(false)
  const [showHint, setShowHint] = useState(true)

  const timeoutsRef = useRef([])
  const onCompleteRef = useRef(onComplete)
  const phaseRef = useRef(phase)
  const lastInputRef = useRef(0)

  const attacksRef = useRef([])
  const elapsedRef = useRef(0)
  const nextSpawnRef = useRef(FIRST_SPAWN_DELAY_MS)
  const spawnedCountRef = useRef(0)
  const lastLaneRef = useRef(null)
  const attackIdRef = useRef(0)
  const playerLaneRef = useRef('center')
  const invulnUntilRef = useRef(0)
  const rollUntilRef = useRef(0)
  const livesRef = useRef(STARTING_LIVES)
  const survivedRef = useRef(0)
  const pausedRef = useRef(false)

  const [particles] = useState(() =>
    Array.from({ length: 8 }, () => ({
      left: Math.random() * 100,
      delay: Math.random() * -9,
      duration: 7 + Math.random() * 7,
      size: 2 + Math.random() * 3,
      drift: Math.random() * 40 - 20,
    })),
  )

  const addTimeout = useCallback((fn, ms) => {
    const id = setTimeout(fn, ms)
    timeoutsRef.current.push(id)
    return id
  }, [])

  useEffect(() => () => timeoutsRef.current.forEach(clearTimeout), [])

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    phaseRef.current = phase
  }, [phase])

  // Pause the loop entirely when the tab loses focus.
  useEffect(() => {
    const handleVisibility = () => {
      pausedRef.current = document.hidden
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])

  const resetGame = useCallback(() => {
    elapsedRef.current = 0
    nextSpawnRef.current = FIRST_SPAWN_DELAY_MS
    spawnedCountRef.current = 0
    lastLaneRef.current = null
    invulnUntilRef.current = 0
    rollUntilRef.current = 0
    attacksRef.current = []
    livesRef.current = STARTING_LIVES
    survivedRef.current = 0
    playerLaneRef.current = 'center'

    setAttacks([])
    setLives(STARTING_LIVES)
    setSurvived(0)
    setPlayerLane('center')
    setRollDir(null)
    setHitFlash(false)
    setShowHint(true)
    setPhase('playing')
  }, [])

  // Cinematic intro, then drop into the wave.
  useEffect(() => {
    if (phase !== 'intro') return
    addTimeout(() => resetGame(), INTRO_MS)
  }, [phase, addTimeout, resetGame])

  // Main game loop: spawns attacks, advances them, resolves collisions.
  useEffect(() => {
    if (phase !== 'playing') return

    let frameId
    let last = performance.now()

    const loop = (now) => {
      const delta = now - last
      last = now

      if (!pausedRef.current) {
        elapsedRef.current += delta
        const elapsed = elapsedRef.current

        // Return to center once the dodge roll window ends.
        if (rollUntilRef.current && elapsed >= rollUntilRef.current) {
          rollUntilRef.current = 0
          playerLaneRef.current = 'center'
          setPlayerLane('center')
          setRollDir(null)
        }

        // Spawn the next attack, never repeating the previous lane.
        if (spawnedCountRef.current < TOTAL_ATTACKS && elapsed >= nextSpawnRef.current) {
          const index = spawnedCountRef.current
          const lane = pickLane(lastLaneRef.current)
          lastLaneRef.current = lane

          attacksRef.current = [
            ...attacksRef.current,
            {
              id: attackIdRef.current++,
              lane,
              spawnElapsed: elapsed,
              fallDuration: fallDurationFor(index),
              progress: 0,
            },
          ]

          spawnedCountRef.current += 1
          nextSpawnRef.current = elapsed + spawnIntervalFor(index)
          setShowHint(false)
        }

        // Advance falling attacks and resolve any that reached the player's row.
        const remaining = []
        let resolvedCount = 0
        let tookHit = false

        for (const attack of attacksRef.current) {
          const progress = (elapsed - attack.spawnElapsed) / attack.fallDuration
          if (progress >= 1) {
            resolvedCount += 1
            const inPlayerLane = attack.lane === playerLaneRef.current
            if (inPlayerLane && elapsed >= invulnUntilRef.current) tookHit = true
          } else {
            attack.progress = progress
            remaining.push(attack)
          }
        }

        attacksRef.current = remaining
        setAttacks([...remaining])

        if (resolvedCount > 0) {
          survivedRef.current = Math.min(survivedRef.current + resolvedCount, TOTAL_ATTACKS)
          setSurvived(survivedRef.current)
        }

        let nextPhase = null

        if (tookHit) {
          livesRef.current -= 1
          setLives(livesRef.current)
          setHitFlash(true)
          addTimeout(() => setHitFlash(false), HIT_FLASH_MS)
          if (livesRef.current <= 0) nextPhase = 'dead'
        }

        if (!nextPhase && survivedRef.current >= TOTAL_ATTACKS) {
          nextPhase = 'victory'
        }

        if (nextPhase) {
          setPhase(nextPhase)
          if (nextPhase === 'victory') {
            addTimeout(() => onCompleteRef.current(), VICTORY_DELAY_MS)
          }
        }
      }

      frameId = requestAnimationFrame(loop)
    }

    frameId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frameId)
  }, [phase, addTimeout])

  const handleDodge = useCallback((direction) => {
    if (phaseRef.current !== 'playing') return

    playerLaneRef.current = direction
    setPlayerLane(direction)
    setRollDir(direction)
    invulnUntilRef.current = elapsedRef.current + INVULN_MS
    rollUntilRef.current = elapsedRef.current + ROLL_MS
    setShowHint(false)
  }, [])

  // touchstart and click both fire on touch devices; debounce so a single
  // tap only triggers one dodge.
  const handleInput = useCallback(
    (direction) => {
      const now = performance.now()
      if (now - lastInputRef.current < INPUT_DEBOUNCE_MS) return
      lastInputRef.current = now
      handleDodge(direction)
    },
    [handleDodge],
  )

  const handleDodgeLeft = useCallback(() => handleInput('left'), [handleInput])
  const handleDodgeRight = useCallback(() => handleInput('right'), [handleInput])

  if (phase === 'intro') {
    return (
      <div className="flex min-h-[14rem] flex-col items-center justify-center gap-4 text-center">
        <p className="cinematic-text font-display text-lg italic text-gold">{MSG_INTRO}</p>
      </div>
    )
  }

  if (phase === 'victory') {
    return (
      <div className="flex flex-col items-center gap-6 py-4 text-center">
        <span className="lord-victory-figure" role="img" aria-label="El Golden Lord se arrodilla">
          👑
        </span>
        <p className="font-display text-2xl shimmer-text">EL GOLDEN LORD SE ARRODILLA</p>
        <p className="font-body text-sm leading-relaxed text-bone/80">{MSG_VICTORY}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="font-heading text-xs uppercase tracking-[0.3em] text-bronze">
        The Auric Throne
      </p>

      <div className="lord-arena golden-glow">
        <div className="lord-particle-container" aria-hidden="true">
          {particles.map((particle, index) => (
            <span
              key={index}
              className="lord-particle"
              style={{
                left: `${particle.left}%`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                animationDelay: `${particle.delay}s`,
                animationDuration: `${particle.duration}s`,
                '--drift': `${particle.drift}px`,
              }}
            />
          ))}
        </div>

        <div className="lord-lane-guide" style={{ left: '34%' }} aria-hidden="true" />
        <div className="lord-lane-guide" style={{ left: '66%' }} aria-hidden="true" />

        <div className="lord-hud">
          <div className="lord-lives" aria-label={`${lives} de ${STARTING_LIVES} vidas restantes`}>
            {Array.from({ length: STARTING_LIVES }, (_, i) => (
              <span key={i} className={`lord-life ${i >= lives ? 'is-lost' : ''}`} aria-hidden="true">
                🧪
              </span>
            ))}
          </div>
          <p className="lord-counter">
            Superados: {survived}/{TOTAL_ATTACKS}
          </p>
        </div>

        {attacks.map((attack) => (
          <div
            key={attack.id}
            className="lord-attack"
            style={{
              left: `${LANE_POSITION[attack.lane]}%`,
              top: `${ATTACK_TOP_START + attack.progress * (ATTACK_TOP_END - ATTACK_TOP_START)}%`,
            }}
          />
        ))}

        <div
          className={`lord-player ${rollDir ? `is-rolling-${rollDir}` : ''}`}
          style={{ left: `${LANE_POSITION[playerLane]}%` }}
        >
          <div className="lord-player-cape" />
          <div className="lord-player-body" />
          <div className="lord-player-head" />
        </div>

        {showHint && <p className="lord-hint">← Toca izquierda o derecha →</p>}

        <div className={`lord-flash ${hitFlash ? 'is-active' : ''}`} aria-hidden="true" />

        <button
          type="button"
          aria-label="Esquivar a la izquierda"
          className="lord-touch-zone lord-touch-zone--left"
          onTouchStart={handleDodgeLeft}
          onClick={handleDodgeLeft}
        />
        <button
          type="button"
          aria-label="Esquivar a la derecha"
          className="lord-touch-zone lord-touch-zone--right"
          onTouchStart={handleDodgeRight}
          onClick={handleDodgeRight}
        />
      </div>

      {phase === 'dead' && (
        <div className="lord-death">
          <p className="lord-death-text">YOU DIED</p>
          <button type="button" onClick={resetGame} className="souls-button px-8 py-4 text-lg">
            Levántate de nuevo
          </button>
        </div>
      )}
    </div>
  )
}
