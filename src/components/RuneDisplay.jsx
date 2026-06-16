export default function RuneDisplay({ rune, runeName, locked = false, size = 'text-6xl' }) {
  return (
    <span
      className={`font-display ${size} ${locked ? 'rune-locked' : 'rune-reveal text-gold'}`}
      style={locked ? undefined : { textShadow: '0 0 16px rgba(200, 168, 78, 0.6)' }}
      role="img"
      aria-label={locked ? 'Runa sin reclamar' : runeName}
    >
      {rune}
    </span>
  )
}
