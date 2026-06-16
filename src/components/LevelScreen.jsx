import { useState } from 'react'
import Atmosphere from './Atmosphere'
import ChestReveal from './ChestReveal'

const SKIP_CODE = '88'

export default function LevelScreen({ level, alreadyCompleted, onComplete, onBack, children }) {
  const [stage, setStage] = useState(alreadyCompleted ? 'reveal' : 'challenge')
  const [justCompleted, setJustCompleted] = useState(false)
  const [skipOpen, setSkipOpen] = useState(false)
  const [skipCode, setSkipCode] = useState('')
  const [skipError, setSkipError] = useState(false)

  const handleChallengeComplete = () => {
    onComplete()
    setJustCompleted(true)
    setStage('reveal')
  }

  const closeSkip = () => {
    setSkipOpen(false)
    setSkipCode('')
    setSkipError(false)
  }

  const submitSkip = (event) => {
    event.preventDefault()
    if (skipCode.trim() === SKIP_CODE) {
      closeSkip()
      handleChallengeComplete()
    } else {
      setSkipError(true)
    }
  }

  return (
    <div className="souls-bg relative min-h-screen overflow-hidden px-5 pb-12 pt-8">
      <Atmosphere particleCount={8} />

      <div className="fade-in relative z-10 mx-auto max-w-sm">
        <button
          type="button"
          onClick={onBack}
          className="mb-6 font-heading text-xs uppercase tracking-[0.25em] text-bronze"
        >
          ← Volver al Mapa
        </button>

        <header className="mb-6 text-center">
          <p className="font-heading text-xs uppercase tracking-[0.3em] text-bronze">
            {level.difficulty}
          </p>
          <h1 className="font-display text-3xl text-gold">{level.name}</h1>
          <p className="mt-3 font-body text-sm leading-relaxed text-bone/80">
            {level.description}
          </p>
        </header>

        {stage === 'challenge' && (
          <div className="souls-panel p-5">
            {typeof children === 'function'
              ? children(handleChallengeComplete)
              : children}
          </div>
        )}

        {stage === 'reveal' && (
          <>
            <ChestReveal level={level} animate={justCompleted} />
            <button type="button" onClick={onBack} className="souls-button mt-8 w-full">
              Volver al Mapa
            </button>
          </>
        )}
      </div>

      {stage === 'challenge' && (
        <button
          type="button"
          onClick={() => setSkipOpen(true)}
          aria-label="Saltar prueba"
          className="fixed bottom-5 right-5 z-20 flex h-12 w-12 items-center justify-center rounded-full border border-bronze/50 bg-black/60 text-lg text-bronze/70 backdrop-blur-sm transition-colors hover:text-gold"
        >
          ⏭
        </button>
      )}

      {skipOpen && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/80 px-6">
          <form onSubmit={submitSkip} className="souls-panel fade-in w-full max-w-xs p-6 text-center">
            <p className="font-heading text-xs uppercase tracking-[0.3em] text-bronze">
              Sello del Tarnished
            </p>
            <h2 className="mt-2 font-display text-xl text-gold">Saltar la prueba</h2>
            <p className="mt-3 font-body text-sm leading-relaxed text-bone/80">
              Pronuncia el código para dar esta prueba por superada.
            </p>
            <input
              type="text"
              inputMode="numeric"
              autoFocus
              value={skipCode}
              onChange={(e) => {
                setSkipCode(e.target.value)
                setSkipError(false)
              }}
              className="mt-5 w-full rounded border border-bronze/50 bg-black/50 px-4 py-3 text-center font-heading text-lg tracking-[0.4em] text-gold outline-none focus:border-gold"
              placeholder="• •"
            />
            {skipError && (
              <p className="mt-3 font-body text-xs text-red-400">Código incorrecto.</p>
            )}
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={closeSkip}
                className="flex-1 rounded border border-bronze/40 py-2 font-heading text-xs uppercase tracking-[0.2em] text-bronze"
              >
                Volver
              </button>
              <button type="submit" className="souls-button flex-1">
                Confirmar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
