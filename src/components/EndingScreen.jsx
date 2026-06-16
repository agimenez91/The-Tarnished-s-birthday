import Atmosphere from './Atmosphere'

// Final screen, reached after the last trial (The Haligtree Sanctum) is felled.
// Melina's portrait fills the frame; a layered dark scrim keeps the text legible
// over the bright amber flames.
export default function EndingScreen({ onBack }) {
  return (
    <div className="ending-scene relative flex min-h-screen flex-col items-center justify-end overflow-hidden">
      <div className="ending-bg" aria-hidden />
      <div className="ending-scrim" aria-hidden />

      <Atmosphere particleCount={14} />

      <div className="fade-in relative z-10 w-full max-w-md px-6 pb-12 text-center">
        <p className="ending-eyebrow font-heading text-xs uppercase tracking-[0.4em] text-gold">
          El alba de un nuevo año
        </p>

        <h1 className="ending-title mt-3 font-display text-3xl leading-tight shimmer-text sm:text-4xl">
          Has resurgido, Tarnished
        </h1>

        <div className="ending-body mt-5 space-y-4 font-body text-sm leading-relaxed text-bone sm:text-base">
          <p>
            Las cuatro pruebas han caído ante ti y todas las runas reposan ya en
            tu mano. La gracia que un día te fue arrebatada vuelve a arder en tu
            pecho, más viva que nunca.
          </p>
          <p>
            Ahora deja la espada a un lado y alza la copa: que este día se
            celebre con honor, con risa y con quienes te acompañan en las Tierras
            Intermedias.
          </p>
          <p className="ending-blessing font-display text-lg text-gold">
            Feliz cumpleaños, Tarnished.
          </p>
        </div>

        <button type="button" onClick={onBack} className="souls-button mt-9 w-full">
          Volver al Mapa
        </button>
      </div>
    </div>
  )
}
