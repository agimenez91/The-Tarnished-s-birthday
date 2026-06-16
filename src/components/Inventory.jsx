import { LEVELS } from '../data/levels'
import Atmosphere from './Atmosphere'
import RuneDisplay from './RuneDisplay'

export default function Inventory({ isCompleted, onBack }) {
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

        <header className="mb-8 text-center">
          <p className="font-heading text-xs uppercase tracking-[0.3em] text-bronze">
            Runas Ligadas a Ti
          </p>
          <h1 className="font-display text-3xl text-gold">Inventario</h1>
        </header>

        <div className="grid grid-cols-2 gap-4">
          {LEVELS.map((level) => {
            const owned = isCompleted(level.id)
            return (
              <div
                key={level.id}
                className="souls-panel flex flex-col items-center gap-3 p-5 text-center"
              >
                <RuneDisplay
                  rune={level.rune}
                  runeName={level.runeName}
                  locked={!owned}
                  size="text-5xl"
                />
                <span
                  className={`font-heading text-xs uppercase tracking-wider ${
                    owned ? 'text-gold' : 'text-mist'
                  }`}
                >
                  {owned ? level.runeName : '???'}
                </span>
                <span className="font-body text-[11px] text-mist">{level.name}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
