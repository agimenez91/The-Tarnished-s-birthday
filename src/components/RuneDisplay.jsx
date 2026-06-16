export default function RuneDisplay({
  rune,
  runeName,
  locked = false,
  size = 'text-6xl',
  count = 1,
}) {
  const label = locked
    ? 'Runa sin reclamar'
    : count > 1
      ? `${runeName}, ${count}`
      : runeName

  return (
    <span className="relative inline-flex items-center justify-center">
      <span
        className={`font-display ${size} ${locked ? 'rune-locked' : 'rune-reveal text-gold'}`}
        style={locked ? undefined : { textShadow: '0 0 16px rgba(200, 168, 78, 0.6)' }}
        role="img"
        aria-label={label}
      >
        {rune}
      </span>
      {!locked && count > 1 && (
        <span className="ml-1 self-start font-heading text-base text-bronze">×{count}</span>
      )}
    </span>
  )
}
