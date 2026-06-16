import { useEffect, useState } from 'react'
import RuneDisplay from './RuneDisplay'

export default function ChestReveal({ level, animate }) {
  const [opened, setOpened] = useState(!animate)
  const isBonus = level.type === 'bonus'

  useEffect(() => {
    if (!animate) return
    const timer = setTimeout(() => setOpened(true), 250)
    return () => clearTimeout(timer)
  }, [animate])

  return (
    <div
      className={`souls-panel fade-in flex flex-col items-center gap-6 p-6 text-center ${
        isBonus && opened ? 'golden-glow' : ''
      }`}
    >
      <p className="font-heading text-xs uppercase tracking-[0.3em] text-bronze">
        {opened ? 'El cofre se abre con un crujido...' : 'Un cofre espera, atado con hierro viejo'}
      </p>

      <div className="chest-scene relative h-28 w-36">
        <div className="chest-box absolute bottom-0 h-16 w-36 rounded-sm" />
        <div
          className={`chest-lid absolute left-0 top-0 h-16 w-36 rounded-t-sm ${opened ? 'is-open' : ''} ${
            isBonus && opened ? 'golden-glow' : ''
          }`}
        />
        {opened && (
          <div className="absolute inset-0 flex items-center justify-center">
            <RuneDisplay
              rune={level.rune}
              runeName={level.runeName}
              size={isBonus ? 'text-8xl' : 'text-6xl'}
            />
          </div>
        )}
      </div>

      {opened && (
        <div className="flex flex-col items-center gap-3">
          <p className="font-display text-lg text-gold">{level.runeName}</p>
          <p className="max-w-xs font-body text-sm italic leading-relaxed text-bone/80">
            {level.rewardFlavor}
          </p>
          <p className="mt-1 font-heading text-xs uppercase tracking-[0.25em] text-bronze">
            Presenta esta runa a la Maiden para reclamar tu recompensa
          </p>
        </div>
      )}
    </div>
  )
}
