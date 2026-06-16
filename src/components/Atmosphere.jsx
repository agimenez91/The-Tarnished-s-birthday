import { useState } from 'react'

// Decorative fog + floating ember particles, shared across screens.
// Purely CSS-driven (see styles/souls.css) — no animation libraries.
export default function Atmosphere({ particleCount = 14 }) {
  const [particles] = useState(() =>
    Array.from({ length: particleCount }, () => ({
      left: Math.random() * 100,
      delay: Math.random() * -9,
      duration: 7 + Math.random() * 7,
      size: 2 + Math.random() * 3,
      drift: Math.random() * 40 - 20,
    })),
  )

  return (
    <>
      <div className="fog-container">
        <div className="fog-layer" />
        <div className="fog-layer fog-layer--alt" />
      </div>
      <div className="particle-container">
        {particles.map((particle, index) => (
          <span
            key={index}
            className="particle"
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
    </>
  )
}
