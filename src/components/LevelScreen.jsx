import { useState } from 'react'
import Atmosphere from './Atmosphere'
import ChestReveal from './ChestReveal'

export default function LevelScreen({ level, alreadyCompleted, onComplete, onBack, children }) {
  const [stage, setStage] = useState(alreadyCompleted ? 'reveal' : 'challenge')
  const [justCompleted, setJustCompleted] = useState(false)

  const handleChallengeComplete = () => {
    onComplete()
    setJustCompleted(true)
    setStage('reveal')
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
    </div>
  )
}
