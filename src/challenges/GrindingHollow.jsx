import { useRef, useState } from 'react'
import CinematicIntro from '../components/CinematicIntro'
import { MESSAGE, FREE_HINTS, buildCipher } from './grindingCipher'

const TOTAL_LETTERS = MESSAGE.replace(/\s/g, '').length

const ALPHABET = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i))

const ENGRAVE_MS = 550
const FAIL_FEEDBACK_MS = 1600
const VICTORY_DELAY_MS = 2400

const INTRO_PAGES = [
  'En lo más hondo del Haligtree marchito, una presencia se agita...',
  'Una presencia aguarda en la penumbra. Su nombre fue grabado en runas antiguas, esperando a quien sepa leerlo.',
  'Descifra lo que está escrito en piedra, Tarnished, y mira a los ojos a quien nunca ha conocido la derrota.',
]
const MSG_FAIL = 'El texto se resiste. Las runas vuelven a quedar quietas y silenciosas.'
const MSG_VICTORY = 'La piedra se enciende con fuego escarlata, y la verdad queda al descubierto...'

export default function GrindingHollow({ onComplete }) {
  const [cipher] = useState(buildCipher)
  const [assignments, setAssignments] = useState(() => {
    const initial = {}
    FREE_HINTS.forEach((letter) => {
      initial[cipher.letterToRune[letter]] = letter
    })
    return initial
  })
  const [phase, setPhase] = useState('intro')
  const [selectedRune, setSelectedRune] = useState(null)
  const [flashRune, setFlashRune] = useState(null)
  const [result, setResult] = useState(null)
  const [showCodex, setShowCodex] = useState(false)

  const timeoutsRef = useRef([])

  const [victoryParticles] = useState(() =>
    Array.from({ length: 20 }, () => {
      const angle = Math.random() * Math.PI * 2
      const distance = 50 + Math.random() * 90
      return {
        px: Math.cos(angle) * distance,
        py: Math.sin(angle) * distance,
        delay: Math.random() * 0.4,
        size: 3 + Math.random() * 4,
      }
    }),
  )

  const addTimeout = (fn, ms) => {
    const id = setTimeout(fn, ms)
    timeoutsRef.current.push(id)
    return id
  }

  const cipherChars = MESSAGE.split('').map((char) =>
    char === ' ' ? ' ' : cipher.letterToRune[char],
  )

  const decodedChars = MESSAGE.split('').map((char, i) =>
    char === ' ' ? ' ' : assignments[cipherChars[i]] ?? null,
  )

  const correctCount = MESSAGE.split('').reduce((acc, char, i) => {
    if (char === ' ') return acc
    return decodedChars[i] === char ? acc + 1 : acc
  }, 0)

  const healthPercent = Math.max(0, 100 - Math.round((correctCount / TOTAL_LETTERS) * 100))
  const isSolved = correctCount === TOTAL_LETTERS

  const handleSelectRune = (rune) => {
    setResult(null)
    setSelectedRune((prev) => (prev === rune ? null : rune))
  }

  const handleAssign = (letter) => {
    if (!selectedRune) return
    setAssignments((prev) => ({ ...prev, [selectedRune]: letter }))
    setFlashRune(selectedRune)
    addTimeout(() => setFlashRune(null), ENGRAVE_MS)
    setSelectedRune(null)
    setResult(null)
  }

  const handleDecipher = () => {
    if (isSolved) {
      setSelectedRune(null)
      setPhase('victory')
      addTimeout(onComplete, VICTORY_DELAY_MS)
      return
    }
    setResult('fail')
    addTimeout(() => setResult(null), FAIL_FEEDBACK_MS)
  }

  if (phase === 'intro') {
    return <CinematicIntro pages={INTRO_PAGES} onDone={() => setPhase('puzzle')} />
  }

  if (phase === 'victory') {
    return (
      <div className="relative flex flex-col items-center gap-6 py-4 text-center">
        {victoryParticles.map((particle, index) => (
          <span
            key={index}
            className="boss-victory-particle"
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              animationDelay: `${particle.delay}s`,
              '--px': `${particle.px}px`,
              '--py': `${particle.py}px`,
            }}
          />
        ))}
        <p className="rune-cipher-text boss-victory-message">{MESSAGE}</p>
        <p className="font-display text-2xl shimmer-text">MALENIA HA SIDO VENCIDA</p>
        <p className="font-body text-sm leading-relaxed text-bone/80">{MSG_VICTORY}</p>
      </div>
    )
  }

  return (
    <div className="boss-frame relative flex flex-col gap-5 p-4 text-center">
      <span className="boss-corner boss-corner--tr" aria-hidden="true" />
      <span className="boss-corner boss-corner--bl" aria-hidden="true" />

      <p className="font-body text-sm italic leading-relaxed text-bone/70">
        En el santuario marchito del Haligtree, el nombre de la Cuchilla de Miquella fue grabado en
        runas antiguas. Solo los dignos sabrán leer lo que está escrito en la piedra.
      </p>

      <div>
        <p className="mb-1 font-heading text-[10px] uppercase tracking-[0.3em] text-bronze">
          Vigor de la Cuchilla
        </p>
        <div className="boss-health-track">
          <div className="boss-health-fill" style={{ width: `${healthPercent}%` }} />
        </div>
      </div>

      <div className="rune-cipher-text flex flex-wrap items-center justify-center gap-y-2">
        {cipherChars.map((rune, i) =>
          rune === ' ' ? (
            <span key={i} className="inline-block w-3" aria-hidden="true" />
          ) : (
            <button
              key={i}
              type="button"
              onClick={() => handleSelectRune(rune)}
              aria-label={`Runa ${rune}`}
              className={`cipher-rune-btn ${selectedRune === rune ? 'is-selected' : ''} ${
                decodedChars[i] ? 'is-assigned' : ''
              }`}
            >
              {rune}
            </button>
          ),
        )}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-x-1 gap-y-2">
        {MESSAGE.split('').map((char, i) =>
          char === ' ' ? (
            <span key={i} className="inline-block w-3" aria-hidden="true" />
          ) : (
            <button
              key={i}
              type="button"
              onClick={() => handleSelectRune(cipherChars[i])}
              aria-label={`Casilla del cifrado ${i + 1}, ${decodedChars[i] ? `actualmente ${decodedChars[i]}` : 'vacía'}`}
              className={`cipher-tile ${decodedChars[i] ? 'is-filled' : ''} ${
                selectedRune === cipherChars[i] ? 'is-active' : ''
              } ${flashRune === cipherChars[i] ? 'is-engrave' : ''} ${
                result === 'fail'
                  ? decodedChars[i] === char
                    ? 'is-correct'
                    : 'is-wrong'
                  : ''
              }`}
            >
              {decodedChars[i] ?? '_'}
            </button>
          ),
        )}
      </div>

      {selectedRune && (
        <div className="souls-panel fade-in flex flex-col gap-3 p-4">
          <p className="font-heading text-xs uppercase tracking-[0.25em] text-bronze">
            Asigna una letra a <span className="rune-glyph text-xl text-gold">{selectedRune}</span>
          </p>
          <div className="letter-picker-grid">
            {ALPHABET.map((letter) => (
              <button
                key={letter}
                type="button"
                onClick={() => handleAssign(letter)}
                className={`letter-picker-btn ${
                  assignments[selectedRune] === letter ? 'is-current' : ''
                }`}
              >
                {letter}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setShowCodex((s) => !s)}
        className="font-heading text-xs uppercase tracking-[0.25em] text-bronze underline underline-offset-4"
      >
        {showCodex ? 'Ocultar' : 'Revelar'} el Códice de Runas
      </button>

      {showCodex && (
        <div className="rune-table fade-in">
          {cipher.uniqueLetters.map((letter) => {
            const rune = cipher.letterToRune[letter]
            return (
              <div key={letter} className="rune-table-entry">
                <span className="rune">{rune}</span>
                <span className="letter">{assignments[rune] ?? '?'}</span>
              </div>
            )
          })}
        </div>
      )}

      <p className="min-h-[2.5rem] font-body text-sm leading-relaxed text-bone/80">
        {result === 'fail' ? MSG_FAIL : ' '}
      </p>

      <button type="button" onClick={handleDecipher} className="souls-button w-full py-4 text-lg">
        Descifrar
      </button>
    </div>
  )
}
