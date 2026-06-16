import { LEVELS } from '../data/levels'
import Atmosphere from './Atmosphere'

const STATUS_BADGE = {
  locked: '🔒',
  available: '⚔️',
  completed: '✅',
}

function LevelNode({ level, status, align, onSelect }) {
  const isFinal = level.isFinal === true
  const isLocked = status === 'locked'

  const alignment = align === 'right' ? 'self-end mr-4' : 'self-start ml-4'

  const nodeStyles = isLocked
    ? 'border-iron bg-abyss/60 text-mist'
    : isFinal
      ? 'souls-panel golden-glow text-gold'
      : status === 'completed'
        ? 'souls-panel text-bone'
        : 'souls-panel text-bone animate-glow-pulse'

  return (
    <button
      type="button"
      onClick={() => !isLocked && onSelect(level.id)}
      disabled={isLocked}
      className={`relative z-10 w-[78%] max-w-[280px] ${alignment} ${nodeStyles} flex items-center gap-3 rounded-sm border px-4 py-3 text-left transition-transform active:scale-[0.98] disabled:cursor-not-allowed`}
    >
      <span className="text-3xl leading-none" aria-hidden>
        {level.icon}
      </span>

      <span className="flex-1">
        <span className="flex items-center justify-between gap-2">
          <span
            className={`font-heading text-sm uppercase tracking-wider ${
              isFinal && !isLocked ? 'shimmer-text' : ''
            }`}
          >
            {level.name}
          </span>
          <span aria-hidden>{STATUS_BADGE[status]}</span>
        </span>
        <span className="mt-1 block font-body text-xs text-mist">
          {isLocked ? 'Sellado' : level.difficulty}
        </span>
      </span>
    </button>
  )
}

export default function MapScreen({
  getLevelStatus,
  allCompleted,
  onSelectLevel,
  onOpenInventory,
}) {
  return (
    <div className="souls-bg relative min-h-screen overflow-hidden px-4 pb-16 pt-8">
      <Atmosphere particleCount={10} />

      <header className="fade-in relative z-10 mb-10 flex items-center justify-between">
        <div>
          <p className="font-heading text-xs uppercase tracking-[0.3em] text-bronze">
            The Lands Between
          </p>
          <h1 className="font-display text-2xl text-gold">Elige tu Camino</h1>
        </div>

        <button
          type="button"
          onClick={onOpenInventory}
          aria-label="Abrir inventario"
          className="souls-panel flex h-12 w-12 items-center justify-center text-xl text-gold"
        >
          🎒
        </button>
      </header>

      {allCompleted && (
        <div className="souls-panel golden-glow fade-in relative z-10 mb-8 p-4 text-center">
          <p className="font-display text-lg shimmer-text">Todas las runas reunidas</p>
          <p className="mt-2 font-body text-sm leading-relaxed text-bone/80">
            El Tarnished ha resurgido.
          </p>
        </div>
      )}

      <div className="relative flex flex-col gap-10 pb-4">
        <div className="map-path-line" aria-hidden />

        {LEVELS.map((level, index) => (
          <div key={level.id} className="fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
            <LevelNode
              level={level}
              status={getLevelStatus(level.id)}
              align={index % 2 === 0 ? 'left' : 'right'}
              onSelect={onSelectLevel}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
