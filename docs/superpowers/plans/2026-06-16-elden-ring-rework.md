# Elden Ring Rework Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorganizar "The Tarnished's Birthday" a una temática 100% Elden Ring, reordenar y reasignar los niveles/regalos, añadir rondas bonus, repetición x4 en el dodge, un acertijo de Malenia en español, runas con contador y textos de intro avanzables por tap.

**Architecture:** React + Vite, sin backend, estado por `useState` en `App.jsx`, progreso en `localStorage` vía `useProgress`. Los retos viven en `src/challenges/*`, los datos de nivel en `src/data/levels.js`, estilos en `src/styles/souls.css`. Mantenemos los IDs internos de nivel (`vanilla-shrine`, `ember-forge`, `golden-lord`, `grinding-hollow`) para no romper el mapeo de componentes ni el `localStorage`; solo cambian nombres visibles, orden, lore y mecánicas.

**Tech Stack:** React 19, Vite 8, Tailwind 4, CSS custom. Se añade **Vitest** (solo para lógica pura: config de niveles, desbloqueo de progreso, cobertura del cifrado, escalado de velocidad). Los retos interactivos (rAF, animaciones) se verifican manualmente con checklists precisas.

---

## Estructura final (acordada con la usuaria)

| Orden | ID | Nombre visible | Reto | Regalo | Runa | runeCount |
|-------|----|----|----|----|----|----|
| 1 | `vanilla-shrine` | The Cleansing Chapel | Parry (+ ronda bonus más rápida) | 2 geles de ducha | ᚠ | 2 |
| 2 | `ember-forge` | The Forge of Giants | Memoria (+ ronda bonus más rápida) | 2 paquetes de café | ᚢ | 2 |
| 3 | `golden-lord` | The Golden Lord | Esquivar **x4, cada vez más rápido** | Tamper station 3D (4 piezas) | ᚦ | 4 |
| 4 | `grinding-hollow` | The Haligtree Sanctum | Cifrado de runas — frase de Malenia en español (1 vez) | Molinillo de café | ᚨ | 1 |

- Todos los niveles son `main` y secuenciales. **Se elimina el concepto de nivel "bonus"** (Golden Lord pasa a ser prueba principal 3).
- Se elimina la camiseta mostaza.
- Las runas se muestran con contador (`ᚠ ×2`, `ᚦ ×4`, …).
- Temática: solo Elden Ring. Se renombran las áreas y se purga el vocabulario Dark Souls ("Hollow", "Ember" como nombre, "Shrine Guardian").

## Mapa de archivos

- **Crear** `src/components/CinematicIntro.jsx` — intro avanzable por tap (texto a páginas).
- **Crear** `src/hooks/progressLogic.js` — funciones puras de desbloqueo/progreso (testables).
- **Crear** `src/challenges/grindingCipher.js` — `MESSAGE`, `RUNE_POOL`, `FREE_HINTS`, `buildCipher` (testable).
- **Crear** `src/challenges/goldenLordSpeed.js` — `TOTAL_ROUNDS`, `ATTACKS_PER_ROUND`, `ROUND_SPEED`, `fallDurationFor`, `spawnIntervalFor` (testable).
- **Crear** tests: `src/data/levels.test.js`, `src/hooks/progressLogic.test.js`, `src/challenges/grindingCipher.test.js`, `src/challenges/goldenLordSpeed.test.js`.
- **Modificar** `package.json` (script `test`, devDep `vitest`).
- **Modificar** `src/data/levels.js` (orden, nombres, lore, `runeCount`, `isFinal`, quitar `bonus`).
- **Modificar** `src/hooks/useProgress.js` (usar `progressLogic`, quitar `BONUS_LEVEL`).
- **Modificar** `src/components/MapScreen.jsx` (quitar bonus reveal, estilo de boss final).
- **Modificar** `src/components/ChestReveal.jsx` (quitar `isBonus`, contador de runas).
- **Modificar** `src/components/Inventory.jsx` (contador de runas).
- **Modificar** `src/components/RuneDisplay.jsx` (prop `count`).
- **Modificar** `src/components/StartScreen.jsx` (copy: 4 pruebas, sin "cuarta dorada").
- **Modificar** `src/challenges/VanillaShrine.jsx` (temática + 2 ofrendas, 2ª más rápida).
- **Modificar** `src/challenges/EmberForge.jsx` (2 intentos, 2º más rápido).
- **Modificar** `src/challenges/GoldenLord.jsx` (4 rondas más rápidas, intro por tap, temática tamper).
- **Modificar** `src/challenges/GrindingHollow.jsx` (cifrado de Malenia en español, intro por tap, temática Haligtree).
- **Modificar** `index.html` (descripción: "Elden Ring" en vez de "Souls").

---

## Task 1: Tooling + modelo de datos de niveles

**Files:**
- Modify: `package.json`
- Modify: `src/data/levels.js`
- Test: `src/data/levels.test.js` (create)

- [ ] **Step 1: Añadir Vitest y script de test**

Run: `npm install -D vitest`

Luego editar `package.json` para añadir el script `test` dentro de `"scripts"` (justo después de `"lint"`):

```json
    "lint": "eslint .",
    "test": "vitest run",
    "preview": "vite preview"
```

- [ ] **Step 2: Escribir el test de invariantes de niveles (debe fallar)**

Crear `src/data/levels.test.js`:

```js
import { describe, it, expect } from 'vitest'
import { LEVELS, MAIN_LEVELS, getLevelById, TOTAL_RUNES } from './levels'

describe('LEVELS config', () => {
  it('tiene 4 niveles, todos main, sin bonus', () => {
    expect(LEVELS).toHaveLength(4)
    expect(LEVELS.every((l) => l.type === 'main')).toBe(true)
    expect(MAIN_LEVELS).toHaveLength(4)
  })

  it('ordenado 1..4 sin huecos ni repetidos', () => {
    const orders = LEVELS.map((l) => l.order).sort((a, b) => a - b)
    expect(orders).toEqual([1, 2, 3, 4])
  })

  it('IDs y orden esperados', () => {
    expect(LEVELS.map((l) => l.id)).toEqual([
      'vanilla-shrine',
      'ember-forge',
      'golden-lord',
      'grinding-hollow',
    ])
  })

  it('runeCount por nivel y total = 9', () => {
    expect(getLevelById('vanilla-shrine').runeCount).toBe(2)
    expect(getLevelById('ember-forge').runeCount).toBe(2)
    expect(getLevelById('golden-lord').runeCount).toBe(4)
    expect(getLevelById('grinding-hollow').runeCount).toBe(1)
    expect(TOTAL_RUNES).toBe(9)
  })

  it('el último nivel está marcado como final', () => {
    expect(getLevelById('grinding-hollow').isFinal).toBe(true)
  })

  it('sin vocabulario Dark Souls en nombres visibles', () => {
    const text = LEVELS.map((l) => `${l.name} ${l.runeName}`).join(' ').toLowerCase()
    expect(text).not.toMatch(/hollow|shrine|\bember\b/)
  })
})
```

- [ ] **Step 3: Ejecutar el test para verificar que falla**

Run: `npx vitest run src/data/levels.test.js`
Expected: FAIL (LEVELS aún tiene 4 con tipos `main`/`bonus`, sin `runeCount`, `TOTAL_RUNES` no existe, nombres con "Shrine"/"Hollow"/"Ember").

- [ ] **Step 4: Reescribir `src/data/levels.js`**

Reemplazar el contenido completo por:

```js
// Level configuration for "The Tarnished's Birthday" (Elden Ring rework).
// Internal ids are kept stable so App.jsx component mapping and localStorage
// progress remain valid. Levels are now four sequential main trials.

export const LEVELS = [
  {
    id: 'vanilla-shrine',
    order: 1,
    type: 'main',
    name: 'The Cleansing Chapel',
    icon: '🕯️',
    rune: 'ᚠ',
    runeName: 'Runa del Ungimiento',
    runeCount: 2,
    difficulty: 'Sin probar',
    tagline: 'Una capilla en ruinas donde el agua aún recuerda el rito del ungimiento.',
    description:
      'En los días de la Orden Áurea, los peregrinos se purificaban aquí antes de buscar la gracia del Erdtree. Su guardián de piedra todavía vela el umbral. No exige fuerza al Tarnished, solo el temple de un golpe bien medido.',
    rewardFlavor:
      'Dos frascos gemelos, tibios al tacto, con un dulce aroma a vainilla.',
    gift: 'Vanilla shower gel ×2',
  },
  {
    id: 'ember-forge',
    order: 2,
    type: 'main',
    name: 'The Forge of Giants',
    icon: '🔥',
    rune: 'ᚢ',
    runeName: 'Runa de la Llama',
    runeCount: 2,
    difficulty: 'Prueba',
    tagline: 'La forja de los gigantes aún arde, alimentada por llamas que recuerdan.',
    description:
      'En lo alto de las cumbres heladas, el fuego de los gigantes nunca se apagó. Sus brasas guardan un patrón más antiguo que las palabras. Repite su himno, Tarnished, o serás consumido por él.',
    rewardFlavor:
      'Dos sacos de granos oscuros, tostados al calor de la forja.',
    gift: 'Coffee packages ×2',
  },
  {
    id: 'golden-lord',
    order: 3,
    type: 'main',
    name: 'The Golden Lord',
    icon: '👑',
    rune: 'ᚦ',
    runeName: 'Runa del Señor Áureo',
    runeCount: 4,
    difficulty: 'Despiadado',
    tagline: 'Un resplandor dorado llama desde el trono áureo, y exige tu instinto.',
    description:
      'El Señor del Trono Áureo no pone a prueba la mente ni la fuerza, solo el reflejo. Cuatro veces deberás caer con gracia y volver a alzarte, cada vez más raudo que la anterior. Esquiva, Tarnished.',
    rewardFlavor:
      'Una pieza de metal forjado con esmero, parte de un todo aún por armar.',
    gift: '3D-printed tamper station (1 of 4 pieces)',
  },
  {
    id: 'grinding-hollow',
    order: 4,
    type: 'main',
    isFinal: true,
    name: 'The Haligtree Sanctum',
    icon: '⚔️',
    rune: 'ᚨ',
    runeName: 'Runa de la Cuchilla',
    runeCount: 1,
    difficulty: 'Pesadilla',
    tagline: 'En lo más hondo del Haligtree espera la Cuchilla de Miquella.',
    description:
      'Tras todas las pruebas, en el santuario marchito del Haligtree, aguarda la diosa de la putrefacción escarlata. Su nombre fue escrito en runas antiguas, y solo los dignos sabrán leerlo. Descifra la verdad, Tarnished, y enfréntate a quien nunca ha conocido la derrota.',
    rewardFlavor:
      'Un pesado mecanismo de latón, hecho para moler hasta el polvo lo que un día fue grano.',
    gift: 'Coffee grinder (final boss reward)',
  },
]

export const getLevelById = (id) => LEVELS.find((level) => level.id === id)

export const MAIN_LEVELS = LEVELS.filter((level) => level.type === 'main')

export const TOTAL_RUNES = LEVELS.reduce((sum, level) => sum + level.runeCount, 0)
```

- [ ] **Step 5: Ejecutar el test para verificar que pasa**

Run: `npx vitest run src/data/levels.test.js`
Expected: PASS (6 tests).

- [ ] **Step 6: Commit**

```bash
git add package.json src/data/levels.js src/data/levels.test.js package-lock.json
git commit -m "feat: reorder levels, add runeCount, Elden Ring naming + vitest"
```

---

## Task 2: Lógica de progreso lineal (pura) + useProgress

**Files:**
- Create: `src/hooks/progressLogic.js`
- Test: `src/hooks/progressLogic.test.js` (create)
- Modify: `src/hooks/useProgress.js`

- [ ] **Step 1: Escribir el test de la lógica de progreso (debe fallar)**

Crear `src/hooks/progressLogic.test.js`:

```js
import { describe, it, expect } from 'vitest'
import { isLevelUnlocked, nextLevelId, runesOwned, FIRST_LEVEL_ID } from './progressLogic'

describe('progressLogic', () => {
  it('el primer nivel siempre está desbloqueado', () => {
    expect(FIRST_LEVEL_ID).toBe('vanilla-shrine')
    expect(isLevelUnlocked('vanilla-shrine', [])).toBe(true)
  })

  it('un nivel se desbloquea solo si el anterior está completo', () => {
    expect(isLevelUnlocked('ember-forge', [])).toBe(false)
    expect(isLevelUnlocked('ember-forge', ['vanilla-shrine'])).toBe(true)
    expect(isLevelUnlocked('golden-lord', ['vanilla-shrine'])).toBe(false)
    expect(isLevelUnlocked('golden-lord', ['vanilla-shrine', 'ember-forge'])).toBe(true)
    expect(
      isLevelUnlocked('grinding-hollow', ['vanilla-shrine', 'ember-forge', 'golden-lord']),
    ).toBe(true)
  })

  it('nextLevelId devuelve el primer nivel no completado por orden', () => {
    expect(nextLevelId([])).toBe('vanilla-shrine')
    expect(nextLevelId(['vanilla-shrine'])).toBe('ember-forge')
    expect(nextLevelId(['vanilla-shrine', 'ember-forge', 'golden-lord'])).toBe('grinding-hollow')
  })

  it('nextLevelId devuelve null cuando todo está completo', () => {
    expect(
      nextLevelId(['vanilla-shrine', 'ember-forge', 'golden-lord', 'grinding-hollow']),
    ).toBe(null)
  })

  it('runesOwned suma los runeCount de los niveles completados', () => {
    expect(runesOwned([])).toBe(0)
    expect(runesOwned(['vanilla-shrine'])).toBe(2)
    expect(runesOwned(['vanilla-shrine', 'golden-lord'])).toBe(6)
    expect(
      runesOwned(['vanilla-shrine', 'ember-forge', 'golden-lord', 'grinding-hollow']),
    ).toBe(9)
  })
})
```

- [ ] **Step 2: Ejecutar el test para verificar que falla**

Run: `npx vitest run src/hooks/progressLogic.test.js`
Expected: FAIL ("Cannot find module './progressLogic'").

- [ ] **Step 3: Crear `src/hooks/progressLogic.js`**

```js
import { LEVELS, getLevelById } from '../data/levels'

const byOrder = [...LEVELS].sort((a, b) => a.order - b.order)

export const FIRST_LEVEL_ID = byOrder[0]?.id

export function isLevelUnlocked(levelId, completedLevels) {
  const level = getLevelById(levelId)
  if (!level) return false
  if (level.order === 1) return true
  const previous = byOrder.find((entry) => entry.order === level.order - 1)
  return previous ? completedLevels.includes(previous.id) : false
}

export function nextLevelId(completedLevels) {
  const next = byOrder.find((entry) => !completedLevels.includes(entry.id))
  return next ? next.id : null
}

export function runesOwned(completedLevels) {
  return completedLevels.reduce((sum, id) => {
    const level = getLevelById(id)
    return sum + (level ? level.runeCount : 0)
  }, 0)
}
```

- [ ] **Step 4: Ejecutar el test para verificar que pasa**

Run: `npx vitest run src/hooks/progressLogic.test.js`
Expected: PASS (5 tests).

- [ ] **Step 5: Actualizar `src/hooks/useProgress.js` para usar la lógica pura**

Reemplazar el contenido completo por:

```js
import { useCallback, useEffect, useState } from 'react'
import { LEVELS } from '../data/levels'
import { FIRST_LEVEL_ID, isLevelUnlocked, nextLevelId } from './progressLogic'

const STORAGE_KEY = 'tarnished-progress'

const defaultProgress = () => ({
  completedLevels: [],
  currentLevel: FIRST_LEVEL_ID,
})

const loadProgress = () => {
  if (typeof window === 'undefined') return defaultProgress()

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultProgress()

    const parsed = JSON.parse(raw)
    return {
      completedLevels: Array.isArray(parsed.completedLevels)
        ? parsed.completedLevels
        : [],
      currentLevel: parsed.currentLevel ?? FIRST_LEVEL_ID,
    }
  } catch {
    return defaultProgress()
  }
}

const saveProgress = (progress) => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
}

export function useProgress() {
  const [progress, setProgress] = useState(loadProgress)

  useEffect(() => {
    saveProgress(progress)
  }, [progress])

  const isCompleted = useCallback(
    (levelId) => progress.completedLevels.includes(levelId),
    [progress.completedLevels],
  )

  const isUnlocked = useCallback(
    (levelId) => isLevelUnlocked(levelId, progress.completedLevels),
    [progress.completedLevels],
  )

  const getLevelStatus = useCallback(
    (levelId) => {
      if (isCompleted(levelId)) return 'completed'
      if (isUnlocked(levelId)) return 'available'
      return 'locked'
    },
    [isCompleted, isUnlocked],
  )

  const completeLevel = useCallback((levelId) => {
    setProgress((prev) => {
      if (prev.completedLevels.includes(levelId)) return prev
      const completedLevels = [...prev.completedLevels, levelId]
      return {
        completedLevels,
        currentLevel: nextLevelId(completedLevels) ?? prev.currentLevel,
      }
    })
  }, [])

  const resetProgress = useCallback(() => {
    const fresh = defaultProgress()
    setProgress(fresh)
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  const allCompleted = LEVELS.every((level) =>
    progress.completedLevels.includes(level.id),
  )

  return {
    progress,
    isCompleted,
    isUnlocked,
    getLevelStatus,
    completeLevel,
    resetProgress,
    allCompleted,
  }
}
```

- [ ] **Step 6: Verificar lint y tests**

Run: `npm run lint && npx vitest run`
Expected: lint sin errores; todos los tests PASS.

- [ ] **Step 7: Commit**

```bash
git add src/hooks/progressLogic.js src/hooks/progressLogic.test.js src/hooks/useProgress.js
git commit -m "feat: linear level unlock logic, drop bonus-level special casing"
```

---

## Task 3: Mapa, Cofre, Inventario y RuneDisplay con contador

**Files:**
- Modify: `src/components/RuneDisplay.jsx`
- Modify: `src/components/MapScreen.jsx`
- Modify: `src/components/ChestReveal.jsx`
- Modify: `src/components/Inventory.jsx`

- [ ] **Step 1: Añadir prop `count` a `RuneDisplay`**

Reemplazar el contenido completo de `src/components/RuneDisplay.jsx` por:

```jsx
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
```

- [ ] **Step 2: Limpiar `MapScreen` (quitar bonus, estilo de boss final)**

Reemplazar el contenido completo de `src/components/MapScreen.jsx` por:

```jsx
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
```

Nota: `MapScreen` ya no recibe ni usa `isCompleted`. `App.jsx` le pasa `isCompleted` como prop (línea 59); es inofensivo dejarla, pero para limpieza, en `src/App.jsx` eliminar la línea `isCompleted={isCompleted}` del render de `MapScreen` (dejar las demás props intactas).

- [ ] **Step 3: Actualizar `ChestReveal` (sin bonus, con contador)**

Reemplazar el contenido completo de `src/components/ChestReveal.jsx` por:

```jsx
import { useEffect, useState } from 'react'
import RuneDisplay from './RuneDisplay'

export default function ChestReveal({ level, animate }) {
  const [opened, setOpened] = useState(!animate)
  const isFinal = level.isFinal === true
  const multiple = level.runeCount > 1

  useEffect(() => {
    if (!animate) return
    const timer = setTimeout(() => setOpened(true), 250)
    return () => clearTimeout(timer)
  }, [animate])

  return (
    <div
      className={`souls-panel fade-in flex flex-col items-center gap-6 p-6 text-center ${
        isFinal && opened ? 'golden-glow' : ''
      }`}
    >
      <p className="font-heading text-xs uppercase tracking-[0.3em] text-bronze">
        {opened ? 'El cofre se abre con un crujido...' : 'Un cofre espera, atado con hierro viejo'}
      </p>

      <div className="chest-scene relative h-28 w-36">
        <div className="chest-box absolute bottom-0 h-16 w-36 rounded-sm" />
        <div
          className={`chest-lid absolute left-0 top-0 h-16 w-36 rounded-t-sm ${opened ? 'is-open' : ''} ${
            isFinal && opened ? 'golden-glow' : ''
          }`}
        />
        {opened && (
          <div className="absolute inset-0 flex items-center justify-center">
            <RuneDisplay
              rune={level.rune}
              runeName={level.runeName}
              count={level.runeCount}
              size={isFinal ? 'text-8xl' : 'text-6xl'}
            />
          </div>
        )}
      </div>

      {opened && (
        <div className="flex flex-col items-center gap-3">
          <p className="font-display text-lg text-gold">
            {level.runeName}
            {multiple ? ` ×${level.runeCount}` : ''}
          </p>
          <p className="max-w-xs font-body text-sm italic leading-relaxed text-bone/80">
            {level.rewardFlavor}
          </p>
          <p className="mt-1 font-heading text-xs uppercase tracking-[0.25em] text-bronze">
            {multiple
              ? 'Presenta estas runas a la Doncella para reclamar tu recompensa'
              : 'Presenta esta runa a la Doncella para reclamar tu recompensa'}
          </p>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Actualizar `Inventory` (contador de runas)**

En `src/components/Inventory.jsx`, reemplazar el bloque `<RuneDisplay .../>` y la etiqueta de nombre por la versión con contador. Cambiar:

```jsx
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
```

por:

```jsx
                <RuneDisplay
                  rune={level.rune}
                  runeName={level.runeName}
                  locked={!owned}
                  count={level.runeCount}
                  size="text-5xl"
                />
                <span
                  className={`font-heading text-xs uppercase tracking-wider ${
                    owned ? 'text-gold' : 'text-mist'
                  }`}
                >
                  {owned
                    ? `${level.runeName}${level.runeCount > 1 ? ` ×${level.runeCount}` : ''}`
                    : '???'}
                </span>
```

- [ ] **Step 5: Verificar build, lint y arranque visual**

Run: `npm run lint && npm run build`
Expected: sin errores.

Verificación manual (Run: `npm run dev`, abrir en el navegador, vista móvil):
- El mapa muestra 4 nodos: Cleansing Chapel (disponible), Forge of Giants, Golden Lord, Haligtree Sanctum (los 3 últimos sellados 🔒).
- No aparece ningún bloque "El Hollow enmudece" ni "camino dorado".
- El Haligtree Sanctum (último) tiene borde dorado/glow.
- Inventario: 4 celdas, todas como silueta `???` al inicio.

- [ ] **Step 6: Commit**

```bash
git add src/components/RuneDisplay.jsx src/components/MapScreen.jsx src/components/ChestReveal.jsx src/components/Inventory.jsx src/App.jsx
git commit -m "feat: rune counts in reveal/inventory, final-boss map styling, drop bonus UI"
```

---

## Task 4: Componente `CinematicIntro` (avanzar por tap)

**Files:**
- Create: `src/components/CinematicIntro.jsx`

- [ ] **Step 1: Crear `src/components/CinematicIntro.jsx`**

```jsx
import { useState } from 'react'

// Tap-to-advance cinematic intro. Receives an array of text pages and calls
// onDone after the last page. Each page re-triggers the cinematic-fade
// animation via the changing key.
export default function CinematicIntro({ pages, onDone, textClassName = '' }) {
  const [index, setIndex] = useState(0)
  const isLast = index >= pages.length - 1

  const advance = () => {
    if (isLast) {
      onDone()
    } else {
      setIndex((i) => i + 1)
    }
  }

  return (
    <button
      type="button"
      onClick={advance}
      className="flex min-h-[16rem] w-full flex-col items-center justify-center gap-6 px-2 text-center"
    >
      <p
        key={index}
        className={`cinematic-text font-display text-lg italic leading-relaxed text-gold ${textClassName}`}
      >
        {pages[index]}
      </p>
      <span className="animate-glow-pulse font-heading text-[10px] uppercase tracking-[0.3em] text-bronze">
        {isLast ? 'Toca para comenzar ⚔️' : 'Toca para continuar →'}
      </span>
    </button>
  )
}
```

- [ ] **Step 2: Verificar que compila**

Run: `npm run build`
Expected: sin errores (el componente aún no se usa; solo confirmamos que no rompe el build).

- [ ] **Step 3: Commit**

```bash
git add src/components/CinematicIntro.jsx
git commit -m "feat: add tap-to-advance CinematicIntro component"
```

---

## Task 5: Vanilla Shrine → The Cleansing Chapel (2 ofrendas, 2ª más rápida)

**Files:**
- Modify: `src/challenges/VanillaShrine.jsx`

**Diseño:** El reto se juega 2 veces (2 geles → 2 runas). Ofrenda 1 = velocidad actual (`CYCLE_MS` 2000, zona 24%). Ofrenda 2 = más rápida (`CYCLE_MS` 1300, zona 18%). Entre ambas hay una pantalla intermedia ("ofrenda bonus") que el jugador avanza con un botón. `onComplete` se llama **solo** al ganar la 2ª ofrenda.

- [ ] **Step 1: Reescribir `src/challenges/VanillaShrine.jsx`**

Reemplazar el contenido completo por:

```jsx
import { useEffect, useRef, useState } from 'react'

const PARRIES_NEEDED = 3
const FEEDBACK_MS = 500
const VICTORY_DELAY_MS = 1300
const ZONE_START = 38

// Two offerings: the second is swifter and its golden zone is narrower.
const OFFERINGS = [
  { cycleMs: 2000, zoneWidth: 24 },
  { cycleMs: 1300, zoneWidth: 18 },
]
const TOTAL_OFFERINGS = OFFERINGS.length

const FLAVOR_IDLE =
  'El guardián de la capilla alza su espada en silencio. Observa el indicador y golpea solo cuando brille en dorado.'
const FLAVOR_FAIL = 'El enemigo golpea con precisión... Reponte, Tarnished, e inténtalo de nuevo.'
const FLAVOR_SUCCESS = [
  'Una parada perfecta. El guardián se tambalea, desequilibrado.',
  'El acero resuena una vez más: el guardián flaquea, casi vencido.',
]
const FLAVOR_VICTORY = 'El guardián cae, disolviéndose en motas de luz dorada...'

export default function VanillaShrine({ onComplete }) {
  const [offering, setOffering] = useState(0) // index into OFFERINGS
  const [phase, setPhase] = useState('fighting') // 'fighting' | 'offering-clear'
  const [streak, setStreak] = useState(0)
  const [indicatorPos, setIndicatorPos] = useState(0)
  const [flash, setFlash] = useState(null)
  const [guardianState, setGuardianState] = useState('idle')
  const [message, setMessage] = useState(FLAVOR_IDLE)
  const [locked, setLocked] = useState(false)

  const { cycleMs, zoneWidth } = OFFERINGS[offering]

  const startTimeRef = useRef(null)
  const timeoutsRef = useRef([])

  const [burstParticles] = useState(() =>
    Array.from({ length: 12 }, () => {
      const angle = Math.random() * Math.PI * 2
      const distance = 40 + Math.random() * 60
      return {
        px: Math.cos(angle) * distance,
        py: Math.sin(angle) * distance,
        delay: Math.random() * 0.25,
        size: 3 + Math.random() * 3,
      }
    }),
  )

  useEffect(
    () => () => {
      timeoutsRef.current.forEach(clearTimeout)
    },
    [],
  )

  // Indicator bounces back and forth (triangle wave), one cycle every cycleMs.
  useEffect(() => {
    if (phase !== 'fighting' || guardianState === 'defeated') return
    startTimeRef.current = performance.now()

    let frame
    const tick = (now) => {
      const elapsed = (now - startTimeRef.current) % cycleMs
      const t = elapsed / cycleMs
      const pos = t < 0.5 ? t * 2 * 100 : (1 - t) * 2 * 100
      setIndicatorPos(pos)
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [phase, guardianState, cycleMs])

  const addTimeout = (fn, ms) => {
    const id = setTimeout(fn, ms)
    timeoutsRef.current.push(id)
  }

  const resetIndicator = () => {
    startTimeRef.current = performance.now()
    setIndicatorPos(0)
  }

  const handleParry = () => {
    if (locked || guardianState === 'defeated' || phase !== 'fighting') return

    setLocked(true)
    addTimeout(() => setLocked(false), FEEDBACK_MS)

    const inZone = indicatorPos >= ZONE_START && indicatorPos <= ZONE_START + zoneWidth

    if (inZone) {
      setFlash('success')
      addTimeout(() => setFlash(null), FEEDBACK_MS)

      const nextStreak = streak + 1
      setStreak(nextStreak)

      if (nextStreak >= PARRIES_NEEDED) {
        setGuardianState('defeated')
        setMessage(FLAVOR_VICTORY)

        if (offering >= TOTAL_OFFERINGS - 1) {
          addTimeout(onComplete, VICTORY_DELAY_MS)
        } else {
          addTimeout(() => setPhase('offering-clear'), VICTORY_DELAY_MS)
        }
      } else {
        setGuardianState('hit')
        addTimeout(() => setGuardianState((s) => (s === 'hit' ? 'idle' : s)), FEEDBACK_MS)
        setMessage(FLAVOR_SUCCESS[nextStreak - 1] ?? FLAVOR_SUCCESS[0])
      }
    } else {
      setStreak(0)
      setFlash('fail')
      addTimeout(() => setFlash(null), FEEDBACK_MS)
      setMessage(FLAVOR_FAIL)
      resetIndicator()
    }
  }

  const beginSecondOffering = () => {
    setOffering((o) => o + 1)
    setStreak(0)
    setGuardianState('idle')
    setMessage('La segunda ofrenda es más esquiva. El indicador se acelera...')
    setPhase('fighting')
    resetIndicator()
  }

  if (phase === 'offering-clear') {
    return (
      <div className="fade-in flex flex-col items-center gap-5 py-4 text-center">
        <p className="font-heading text-xs uppercase tracking-[0.3em] shimmer-text">
          Primer frasco reclamado
        </p>
        <p className="font-body text-sm leading-relaxed text-bone/80">
          Una runa ha sido tuya. Pero queda una segunda ofrenda en el altar, más veloz y esquiva.
          Demuestra de nuevo tu temple, Tarnished.
        </p>
        <button type="button" onClick={beginSecondOffering} className="souls-button w-full py-4 text-lg">
          Afrontar la segunda ofrenda
        </button>
      </div>
    )
  }

  const isDefeated = guardianState === 'defeated'

  return (
    <div className="relative flex flex-col items-center gap-5 text-center">
      <div
        className={`parry-flash ${flash === 'success' ? 'is-success' : ''} ${
          flash === 'fail' ? 'is-fail' : ''
        }`}
      />

      <p className="font-heading text-xs uppercase tracking-[0.3em] text-bronze">
        Guardián de la Capilla · Ofrenda {offering + 1}/{TOTAL_OFFERINGS}
      </p>

      <div className="relative flex h-28 w-full items-center justify-end pr-6">
        <div className="shrine-pedestal" />
        <div className="relative">
          <span
            className={`guardian-icon ${guardianState === 'hit' ? 'is-hit' : ''} ${
              isDefeated ? 'is-defeated' : ''
            }`}
          >
            🗿
          </span>
          {isDefeated &&
            burstParticles.map((particle, index) => (
              <span
                key={index}
                className="guardian-particle"
                style={{
                  width: `${particle.size}px`,
                  height: `${particle.size}px`,
                  animationDelay: `${particle.delay}s`,
                  '--px': `${particle.px}px`,
                  '--py': `${particle.py}px`,
                }}
              />
            ))}
        </div>
      </div>

      <p className="min-h-[3.5rem] font-body text-sm leading-relaxed text-bone/80">{message}</p>

      {!isDefeated && (
        <>
          <p className="font-heading text-sm uppercase tracking-[0.25em] text-gold">
            ⚔️ {streak}/{PARRIES_NEEDED}
          </p>

          <div className="parry-track">
            <div
              className="parry-zone"
              style={{ left: `${ZONE_START}%`, width: `${zoneWidth}%` }}
            />
            <div className="parry-indicator" style={{ left: `${indicatorPos}%` }} />
          </div>

          <button
            type="button"
            onClick={handleParry}
            disabled={locked}
            className="souls-button w-full py-4 text-lg"
          >
            ⚔️ Parada
          </button>
        </>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verificar build/lint**

Run: `npm run lint && npm run build`
Expected: sin errores.

- [ ] **Step 3: Verificación manual del reto**

Run: `npm run dev`. En la Cleansing Chapel:
- Ofrenda 1/2: indicador a velocidad normal. Acertar 3 paradas seguidas dentro de la zona dorada → "El guardián cae...".
- Aparece la pantalla "Primer frasco reclamado" con botón "Afrontar la segunda ofrenda".
- Al pulsar: Ofrenda 2/2, el indicador va **más rápido** y la zona dorada es más estrecha.
- Fallar reinicia el contador a 0 (sin volver a la ofrenda 1).
- Tras 3 paradas en la ofrenda 2 → cofre con `ᚠ ×2` y "Presenta estas runas a la Doncella".
- En el mapa, Forge of Giants queda desbloqueada.

- [ ] **Step 4: Commit**

```bash
git add src/challenges/VanillaShrine.jsx
git commit -m "feat: Cleansing Chapel — two offerings, faster second round (2 runes)"
```

---

## Task 6: Ember Forge → The Forge of Giants (2 intentos, 2º más rápido)

**Files:**
- Modify: `src/challenges/EmberForge.jsx`

**Diseño:** Se juega 2 veces (2 cafés → 2 runas). Intento 1 = velocidad actual (`LIGHT_MS` 800 / `PAUSE_MS` 300). Intento 2 = más rápido (`LIGHT_MS` 500 / `PAUSE_MS` 200). Pantalla intermedia entre intentos. Fallar dentro de un intento reinicia ese intento a la ronda 1 (comportamiento actual), no el conjunto.

- [ ] **Step 1: Reescribir `src/challenges/EmberForge.jsx`**

Reemplazar el contenido completo por:

```jsx
import { useEffect, useRef, useState } from 'react'

const RUNES = [
  { id: 0, symbol: 'ᚠ', name: 'Fehu', position: 'top', color: '#ff8a3d' },
  { id: 1, symbol: 'ᚢ', name: 'Uruz', position: 'right', color: '#ff4d3d' },
  { id: 2, symbol: 'ᚦ', name: 'Thurisaz', position: 'bottom', color: '#ffc94b' },
  { id: 3, symbol: 'ᚨ', name: 'Ansuz', position: 'left', color: '#fff4d6' },
]

const TOTAL_ROUNDS = 5
const PRE_SHOW_MS = 700
const CORRECT_FLASH_MS = 350
const ROUND_PAUSE_MS = 900
const FAIL_PAUSE_MS = 1800
const VICTORY_DELAY_MS = 1400

// Two attempts: the second lights the sequence faster.
const ATTEMPTS = [
  { lightMs: 800, pauseMs: 300 },
  { lightMs: 500, pauseMs: 200 },
]
const TOTAL_ATTEMPTS = ATTEMPTS.length

const MSG_SHOWING = 'Observa...'
const MSG_INPUT = 'Tu turno, Tarnished'
const MSG_FAIL = 'La forja rechaza tu ofrenda. Empieza de nuevo.'
const MSG_ROUND_COMPLETE = 'La brasa resiste. La forja se aviva aún más...'
const MSG_VICTORY = 'Las llamas se calman, satisfechas: la forja entrega su regalo...'

const randomRuneId = () => Math.floor(Math.random() * RUNES.length)
const buildSequence = () => Array.from({ length: TOTAL_ROUNDS }, randomRuneId)

export default function EmberForge({ onComplete }) {
  const [attempt, setAttempt] = useState(0) // index into ATTEMPTS
  const [sequence, setSequence] = useState(buildSequence)
  const [round, setRound] = useState(1)
  const [phase, setPhase] = useState('showing') // 'showing'|'input'|'fail'|'round-complete'|'victory'|'attempt-clear'
  const [litRune, setLitRune] = useState(null)
  const [feedback, setFeedback] = useState({})
  const [playerStep, setPlayerStep] = useState(0)
  const [message, setMessage] = useState(MSG_SHOWING)

  const { lightMs, pauseMs } = ATTEMPTS[attempt]

  const timeoutsRef = useRef([])

  const [sparkParticles] = useState(() =>
    Array.from({ length: 10 }, () => {
      const angle = Math.random() * Math.PI * 2
      const distance = 35 + Math.random() * 35
      return {
        px: Math.cos(angle) * distance,
        py: Math.sin(angle) * distance,
        delay: Math.random() * 0.15,
      }
    }),
  )

  const addTimeout = (fn, ms) => {
    const id = setTimeout(fn, ms)
    timeoutsRef.current.push(id)
    return id
  }

  useEffect(() => () => timeoutsRef.current.forEach(clearTimeout), [])

  // Play the lighting sequence for the current round whenever we enter 'showing'.
  useEffect(() => {
    if (phase !== 'showing') return

    setMessage(MSG_SHOWING)
    setPlayerStep(0)
    setLitRune(null)
    setFeedback({})

    const localIds = []
    const schedule = (fn, ms) => {
      const id = setTimeout(fn, ms)
      localIds.push(id)
      timeoutsRef.current.push(id)
    }

    const steps = sequence.slice(0, round)
    steps.forEach((runeId, i) => {
      const onAt = PRE_SHOW_MS + i * (lightMs + pauseMs)
      schedule(() => setLitRune(runeId), onAt)
      schedule(() => setLitRune(null), onAt + lightMs)
    })

    schedule(() => {
      setPhase('input')
      setMessage(MSG_INPUT)
    }, PRE_SHOW_MS + steps.length * (lightMs + pauseMs))

    return () => localIds.forEach(clearTimeout)
  }, [phase, round, sequence, lightMs, pauseMs])

  const handlePress = (runeId) => {
    if (phase !== 'input') return

    const expected = sequence[playerStep]

    if (runeId !== expected) {
      setPhase('fail')
      setMessage(MSG_FAIL)
      setFeedback(
        RUNES.reduce((acc, rune) => {
          acc[rune.id] = rune.id === expected ? 'reveal' : 'fail'
          return acc
        }, {}),
      )

      addTimeout(() => {
        setSequence(buildSequence())
        setRound(1)
        setPhase('showing')
      }, FAIL_PAUSE_MS)
      return
    }

    setFeedback({ [runeId]: 'correct' })
    addTimeout(() => setFeedback({}), CORRECT_FLASH_MS)

    const nextStep = playerStep + 1

    if (nextStep < round) {
      setPlayerStep(nextStep)
      return
    }

    if (round === TOTAL_ROUNDS) {
      if (attempt >= TOTAL_ATTEMPTS - 1) {
        setPhase('victory')
        setMessage(MSG_VICTORY)
        addTimeout(onComplete, VICTORY_DELAY_MS)
      } else {
        setPhase('attempt-clear')
        setMessage(MSG_VICTORY)
      }
    } else {
      setPhase('round-complete')
      setMessage(MSG_ROUND_COMPLETE)
      addTimeout(() => {
        setRound((r) => r + 1)
        setPhase('showing')
      }, ROUND_PAUSE_MS)
    }
  }

  const beginSecondAttempt = () => {
    setAttempt((a) => a + 1)
    setSequence(buildSequence())
    setRound(1)
    setFeedback({})
    setPlayerStep(0)
    setLitRune(null)
    setPhase('showing')
  }

  if (phase === 'attempt-clear') {
    return (
      <div className="fade-in flex flex-col items-center gap-5 py-4 text-center">
        <p className="font-heading text-xs uppercase tracking-[0.3em] shimmer-text">
          Primer saco forjado
        </p>
        <p className="font-body text-sm leading-relaxed text-bone/80">
          Una runa arde ya en tu mano. Pero la forja guarda un segundo himno, más veloz que el
          primero. Escúchalo bien, Tarnished.
        </p>
        <button type="button" onClick={beginSecondAttempt} className="souls-button w-full py-4 text-lg">
          Escuchar el segundo himno
        </button>
      </div>
    )
  }

  const inputDisabled = phase !== 'input'
  const showSpark = phase === 'round-complete' || phase === 'victory' || phase === 'attempt-clear'

  return (
    <div className="flex flex-col items-center gap-5 text-center">
      <p className="font-heading text-xs uppercase tracking-[0.3em] text-bronze">
        Himno {attempt + 1}/{TOTAL_ATTEMPTS} · Brasa {Math.min(round, TOTAL_ROUNDS)}/{TOTAL_ROUNDS}
      </p>

      <div className="ember-grid">
        {RUNES.map((rune) => (
          <button
            key={rune.id}
            type="button"
            disabled={inputDisabled}
            onClick={() => handlePress(rune.id)}
            aria-label={rune.name}
            className={`ember-rune-btn ember-rune-btn--${rune.position} ${
              litRune === rune.id ? 'is-lit' : ''
            } ${feedback[rune.id] ? `is-${feedback[rune.id]}` : ''}`}
            style={{ '--ember-color': rune.color }}
          >
            {rune.symbol}
          </button>
        ))}

        <div className="ember-center">
          <span className="ember-core">🔥</span>
          {showSpark && (
            <div className="ember-spark-container" key={`${attempt}-${round}-${phase}`}>
              {sparkParticles.map((particle, index) => (
                <span
                  key={index}
                  className="ember-spark"
                  style={{
                    animationDelay: `${particle.delay}s`,
                    '--px': `${particle.px}px`,
                    '--py': `${particle.py}px`,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <p className="min-h-[3rem] font-body text-sm leading-relaxed text-bone/80">{message}</p>
    </div>
  )
}
```

- [ ] **Step 2: Verificar build/lint**

Run: `npm run lint && npm run build`
Expected: sin errores.

- [ ] **Step 3: Verificación manual del reto**

Run: `npm run dev`. En la Forge of Giants (tras completar la capilla):
- Himno 1/2: la secuencia se ilumina a ritmo normal; completar las 5 rondas.
- Aparece "Primer saco forjado" con botón "Escuchar el segundo himno".
- Himno 2/2: la secuencia se ilumina **más rápido**; completar las 5 rondas.
- Fallar reinicia a Brasa 1/5 del himno actual.
- Al terminar el himno 2 → cofre con `ᚢ ×2`.
- Golden Lord queda desbloqueado.

- [ ] **Step 4: Commit**

```bash
git add src/challenges/EmberForge.jsx
git commit -m "feat: Forge of Giants — two hymns, faster second attempt (2 runes)"
```

---

## Task 7: Golden Lord — 4 rondas más rápidas + intro por tap + temática tamper

**Files:**
- Create: `src/challenges/goldenLordSpeed.js`
- Test: `src/challenges/goldenLordSpeed.test.js` (create)
- Modify: `src/challenges/GoldenLord.jsx`

**Diseño:** 4 rondas (4 piezas del tamper → 4 runas). Cada ronda hay que sobrevivir `ATTACKS_PER_ROUND = 12` ataques. La velocidad global de cada ronda se reduce con `ROUND_SPEED = [1, 0.82, 0.68, 0.55]` (multiplica las duraciones de caída/spawn: menor = más rápido). Pantalla intermedia tras cada ronda ("Pieza r/4 asegurada"). Morir reinicia la **ronda actual** (no el conjunto). Intro con `CinematicIntro` (tap).

- [ ] **Step 1: Escribir el test del escalado de velocidad (debe fallar)**

Crear `src/challenges/goldenLordSpeed.test.js`:

```js
import { describe, it, expect } from 'vitest'
import {
  TOTAL_ROUNDS,
  ATTACKS_PER_ROUND,
  ROUND_SPEED,
  fallDurationFor,
  spawnIntervalFor,
} from './goldenLordSpeed'

describe('goldenLordSpeed', () => {
  it('4 rondas y un factor de velocidad por ronda', () => {
    expect(TOTAL_ROUNDS).toBe(4)
    expect(ROUND_SPEED).toHaveLength(4)
    expect(ATTACKS_PER_ROUND).toBeGreaterThan(0)
  })

  it('los factores son estrictamente decrecientes (cada ronda más rápida)', () => {
    for (let i = 1; i < ROUND_SPEED.length; i++) {
      expect(ROUND_SPEED[i]).toBeLessThan(ROUND_SPEED[i - 1])
    }
  })

  it('para el mismo índice, una ronda posterior cae más rápido', () => {
    expect(fallDurationFor(3, 0)).toBeLessThan(fallDurationFor(0, 0))
    expect(spawnIntervalFor(3, 0)).toBeLessThan(spawnIntervalFor(0, 0))
  })

  it('dentro de una ronda, los ataques se aceleran con el índice', () => {
    expect(fallDurationFor(0, ATTACKS_PER_ROUND - 1)).toBeLessThan(fallDurationFor(0, 0))
  })
})
```

- [ ] **Step 2: Ejecutar el test para verificar que falla**

Run: `npx vitest run src/challenges/goldenLordSpeed.test.js`
Expected: FAIL ("Cannot find module './goldenLordSpeed'").

- [ ] **Step 3: Crear `src/challenges/goldenLordSpeed.js`**

```js
export const TOTAL_ROUNDS = 4
export const ATTACKS_PER_ROUND = 12

// Per-round global speed factor (multiplies fall/spawn durations).
// Lower = faster. Each round is strictly faster than the previous.
export const ROUND_SPEED = [1, 0.82, 0.68, 0.55]

const FALL_MS_START = 1500
const FALL_MS_END = 950
const SPAWN_MS_START = 1500
const SPAWN_MS_END = 950

const lerp = (a, b, t) => a + (b - a) * t

const factorFor = (round) => ROUND_SPEED[Math.min(round, ROUND_SPEED.length - 1)]

export const fallDurationFor = (round, index) =>
  lerp(FALL_MS_START, FALL_MS_END, index / (ATTACKS_PER_ROUND - 1)) * factorFor(round)

export const spawnIntervalFor = (round, index) =>
  lerp(SPAWN_MS_START, SPAWN_MS_END, index / (ATTACKS_PER_ROUND - 1)) * factorFor(round)
```

- [ ] **Step 4: Ejecutar el test para verificar que pasa**

Run: `npx vitest run src/challenges/goldenLordSpeed.test.js`
Expected: PASS (4 tests).

- [ ] **Step 5: Reescribir `src/challenges/GoldenLord.jsx`**

Reemplazar el contenido completo por:

```jsx
import { useCallback, useEffect, useRef, useState } from 'react'
import CinematicIntro from '../components/CinematicIntro'
import {
  TOTAL_ROUNDS,
  ATTACKS_PER_ROUND,
  fallDurationFor,
  spawnIntervalFor,
} from './goldenLordSpeed'

const LANES = ['left', 'center', 'right']
const LANE_POSITION = { left: 18, center: 50, right: 82 }

const STARTING_LIVES = 3
const FIRST_SPAWN_DELAY_MS = 1300

const ROLL_MS = 400
const INVULN_MS = 200
const HIT_FLASH_MS = 350
const VICTORY_DELAY_MS = 2600
const INPUT_DEBOUNCE_MS = 300

const ATTACK_TOP_START = -14
const ATTACK_TOP_END = 88

const INTRO_PAGES = [
  'Más allá de las pruebas, un resplandor dorado llama.',
  'El Señor del Trono Áureo no pone a prueba tu mente, sino tu instinto.',
  'Cuatro piezas guarda en su trono. Cuatro veces deberás caer con gracia y alzarte de nuevo... cada vez más raudo que la anterior.',
]
const MSG_VICTORY = 'El Golden Lord se arrodilla ante ti, radiante y humillado al fin...'

const pickLane = (prevLane) => {
  const options = prevLane ? LANES.filter((lane) => lane !== prevLane) : LANES
  return options[Math.floor(Math.random() * options.length)]
}

export default function GoldenLord({ onComplete }) {
  const [phase, setPhase] = useState('intro') // 'intro'|'playing'|'round-clear'|'dead'|'victory'
  const [round, setRound] = useState(0) // 0-based round index
  const [lives, setLives] = useState(STARTING_LIVES)
  const [survived, setSurvived] = useState(0)
  const [playerLane, setPlayerLane] = useState('center')
  const [rollDir, setRollDir] = useState(null)
  const [attacks, setAttacks] = useState([])
  const [hitFlash, setHitFlash] = useState(false)
  const [showHint, setShowHint] = useState(true)

  const timeoutsRef = useRef([])
  const onCompleteRef = useRef(onComplete)
  const phaseRef = useRef(phase)
  const roundRef = useRef(0)
  const lastInputRef = useRef(0)

  const attacksRef = useRef([])
  const elapsedRef = useRef(0)
  const nextSpawnRef = useRef(FIRST_SPAWN_DELAY_MS)
  const spawnedCountRef = useRef(0)
  const lastLaneRef = useRef(null)
  const attackIdRef = useRef(0)
  const playerLaneRef = useRef('center')
  const invulnUntilRef = useRef(0)
  const rollUntilRef = useRef(0)
  const livesRef = useRef(STARTING_LIVES)
  const survivedRef = useRef(0)
  const pausedRef = useRef(false)

  const [particles] = useState(() =>
    Array.from({ length: 8 }, () => ({
      left: Math.random() * 100,
      delay: Math.random() * -9,
      duration: 7 + Math.random() * 7,
      size: 2 + Math.random() * 3,
      drift: Math.random() * 40 - 20,
    })),
  )

  const addTimeout = useCallback((fn, ms) => {
    const id = setTimeout(fn, ms)
    timeoutsRef.current.push(id)
    return id
  }, [])

  useEffect(() => () => timeoutsRef.current.forEach(clearTimeout), [])
  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])
  useEffect(() => {
    phaseRef.current = phase
  }, [phase])
  useEffect(() => {
    roundRef.current = round
  }, [round])

  // Pause the loop entirely when the tab loses focus.
  useEffect(() => {
    const handleVisibility = () => {
      pausedRef.current = document.hidden
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])

  // Start (or restart) a given round.
  const startRound = useCallback((roundIndex) => {
    elapsedRef.current = 0
    nextSpawnRef.current = FIRST_SPAWN_DELAY_MS
    spawnedCountRef.current = 0
    lastLaneRef.current = null
    invulnUntilRef.current = 0
    rollUntilRef.current = 0
    attacksRef.current = []
    livesRef.current = STARTING_LIVES
    survivedRef.current = 0
    playerLaneRef.current = 'center'

    setRound(roundIndex)
    setAttacks([])
    setLives(STARTING_LIVES)
    setSurvived(0)
    setPlayerLane('center')
    setRollDir(null)
    setHitFlash(false)
    setShowHint(true)
    setPhase('playing')
  }, [])

  // Main game loop: spawns attacks, advances them, resolves collisions.
  useEffect(() => {
    if (phase !== 'playing') return

    let frameId
    let last = performance.now()

    const loop = (now) => {
      const delta = now - last
      last = now

      if (!pausedRef.current) {
        elapsedRef.current += delta
        const elapsed = elapsedRef.current
        const currentRound = roundRef.current

        // Return to center once the dodge roll window ends.
        if (rollUntilRef.current && elapsed >= rollUntilRef.current) {
          rollUntilRef.current = 0
          playerLaneRef.current = 'center'
          setPlayerLane('center')
          setRollDir(null)
        }

        // Spawn the next attack, never repeating the previous lane.
        if (spawnedCountRef.current < ATTACKS_PER_ROUND && elapsed >= nextSpawnRef.current) {
          const index = spawnedCountRef.current
          const lane = pickLane(lastLaneRef.current)
          lastLaneRef.current = lane

          attacksRef.current = [
            ...attacksRef.current,
            {
              id: attackIdRef.current++,
              lane,
              spawnElapsed: elapsed,
              fallDuration: fallDurationFor(currentRound, index),
              progress: 0,
            },
          ]

          spawnedCountRef.current += 1
          nextSpawnRef.current = elapsed + spawnIntervalFor(currentRound, index)
          setShowHint(false)
        }

        // Advance falling attacks and resolve any that reached the player's row.
        const remaining = []
        let resolvedCount = 0
        let tookHit = false

        for (const attack of attacksRef.current) {
          const progress = (elapsed - attack.spawnElapsed) / attack.fallDuration
          if (progress >= 1) {
            resolvedCount += 1
            const inPlayerLane = attack.lane === playerLaneRef.current
            if (inPlayerLane && elapsed >= invulnUntilRef.current) tookHit = true
          } else {
            attack.progress = progress
            remaining.push(attack)
          }
        }

        attacksRef.current = remaining
        setAttacks([...remaining])

        if (resolvedCount > 0) {
          survivedRef.current = Math.min(survivedRef.current + resolvedCount, ATTACKS_PER_ROUND)
          setSurvived(survivedRef.current)
        }

        let nextPhase = null

        if (tookHit) {
          livesRef.current -= 1
          setLives(livesRef.current)
          setHitFlash(true)
          addTimeout(() => setHitFlash(false), HIT_FLASH_MS)
          if (livesRef.current <= 0) nextPhase = 'dead'
        }

        if (!nextPhase && survivedRef.current >= ATTACKS_PER_ROUND) {
          nextPhase = currentRound >= TOTAL_ROUNDS - 1 ? 'victory' : 'round-clear'
        }

        if (nextPhase) {
          setPhase(nextPhase)
          if (nextPhase === 'victory') {
            addTimeout(() => onCompleteRef.current(), VICTORY_DELAY_MS)
          }
        }
      }

      frameId = requestAnimationFrame(loop)
    }

    frameId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frameId)
  }, [phase, addTimeout])

  const handleDodge = useCallback((direction) => {
    if (phaseRef.current !== 'playing') return
    playerLaneRef.current = direction
    setPlayerLane(direction)
    setRollDir(direction)
    invulnUntilRef.current = elapsedRef.current + INVULN_MS
    rollUntilRef.current = elapsedRef.current + ROLL_MS
    setShowHint(false)
  }, [])

  // touchstart and click both fire on touch devices; debounce so a single
  // tap only triggers one dodge.
  const handleInput = useCallback(
    (direction) => {
      const now = performance.now()
      if (now - lastInputRef.current < INPUT_DEBOUNCE_MS) return
      lastInputRef.current = now
      handleDodge(direction)
    },
    [handleDodge],
  )

  const handleDodgeLeft = useCallback(() => handleInput('left'), [handleInput])
  const handleDodgeRight = useCallback(() => handleInput('right'), [handleInput])

  if (phase === 'intro') {
    return <CinematicIntro pages={INTRO_PAGES} onDone={() => startRound(0)} />
  }

  if (phase === 'round-clear') {
    return (
      <div className="fade-in flex flex-col items-center gap-5 py-6 text-center">
        <p className="font-heading text-xs uppercase tracking-[0.3em] shimmer-text">
          Pieza {round + 1}/{TOTAL_ROUNDS} asegurada
        </p>
        <p className="font-body text-sm leading-relaxed text-bone/80">
          Una pieza del trono es tuya. El Señor se enfurece y su danza se acelera. Prepárate,
          Tarnished.
        </p>
        <button
          type="button"
          onClick={() => startRound(round + 1)}
          className="souls-button w-full py-4 text-lg"
        >
          Afrontar la siguiente embestida
        </button>
      </div>
    )
  }

  if (phase === 'victory') {
    return (
      <div className="flex flex-col items-center gap-6 py-4 text-center">
        <span className="lord-victory-figure" role="img" aria-label="El Golden Lord se arrodilla">
          👑
        </span>
        <p className="font-display text-2xl shimmer-text">EL GOLDEN LORD SE ARRODILLA</p>
        <p className="font-body text-sm leading-relaxed text-bone/80">{MSG_VICTORY}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="font-heading text-xs uppercase tracking-[0.3em] text-bronze">
        El Trono Áureo · Pieza {round + 1}/{TOTAL_ROUNDS}
      </p>

      <div className="lord-arena golden-glow">
        <div className="lord-particle-container" aria-hidden="true">
          {particles.map((particle, index) => (
            <span
              key={index}
              className="lord-particle"
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

        <div className="lord-lane-guide" style={{ left: '34%' }} aria-hidden="true" />
        <div className="lord-lane-guide" style={{ left: '66%' }} aria-hidden="true" />

        <div className="lord-hud">
          <div className="lord-lives" aria-label={`${lives} de ${STARTING_LIVES} vidas restantes`}>
            {Array.from({ length: STARTING_LIVES }, (_, i) => (
              <span key={i} className={`lord-life ${i >= lives ? 'is-lost' : ''}`} aria-hidden="true">
                🧪
              </span>
            ))}
          </div>
          <p className="lord-counter">
            Superados: {survived}/{ATTACKS_PER_ROUND}
          </p>
        </div>

        {attacks.map((attack) => (
          <div
            key={attack.id}
            className="lord-attack"
            style={{
              left: `${LANE_POSITION[attack.lane]}%`,
              top: `${ATTACK_TOP_START + attack.progress * (ATTACK_TOP_END - ATTACK_TOP_START)}%`,
            }}
          />
        ))}

        <div
          className={`lord-player ${rollDir ? `is-rolling-${rollDir}` : ''}`}
          style={{ left: `${LANE_POSITION[playerLane]}%` }}
        >
          <div className="lord-player-cape" />
          <div className="lord-player-body" />
          <div className="lord-player-head" />
        </div>

        {showHint && <p className="lord-hint">← Toca izquierda o derecha →</p>}

        <div className={`lord-flash ${hitFlash ? 'is-active' : ''}`} aria-hidden="true" />

        <button
          type="button"
          aria-label="Esquivar a la izquierda"
          className="lord-touch-zone lord-touch-zone--left"
          onTouchStart={handleDodgeLeft}
          onClick={handleDodgeLeft}
        />
        <button
          type="button"
          aria-label="Esquivar a la derecha"
          className="lord-touch-zone lord-touch-zone--right"
          onTouchStart={handleDodgeRight}
          onClick={handleDodgeRight}
        />
      </div>

      {phase === 'dead' && (
        <div className="lord-death">
          <p className="lord-death-text">YOU DIED</p>
          <button
            type="button"
            onClick={() => startRound(round)}
            className="souls-button px-8 py-4 text-lg"
          >
            Levántate de nuevo
          </button>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 6: Verificar build/lint y tests**

Run: `npm run lint && npm run build && npx vitest run`
Expected: sin errores; tests PASS.

- [ ] **Step 7: Verificación manual del reto**

Run: `npm run dev`. En Golden Lord (tras la forja):
- La intro se muestra como 3 páginas; **no avanza sola**: cada toque pasa de página y el último toque ("Toca para comenzar") arranca el juego.
- HUD muestra "Pieza 1/4" y "Superados: x/12".
- Sobrevivir 12 ataques → pantalla "Pieza 1/4 asegurada" con botón para continuar.
- Cada ronda siguiente es perceptiblemente **más rápida** (caída y aparición).
- Morir (3 fallos) muestra "YOU DIED" y "Levántate de nuevo" reinicia **la ronda actual** (no vuelve a la pieza 1).
- Tras la pieza 4 → "EL GOLDEN LORD SE ARRODILLA" → cofre con `ᚦ ×4`.
- Haligtree Sanctum queda desbloqueado.

- [ ] **Step 8: Commit**

```bash
git add src/challenges/goldenLordSpeed.js src/challenges/goldenLordSpeed.test.js src/challenges/GoldenLord.jsx
git commit -m "feat: Golden Lord — 4 faster rounds (4 runes), tap intro, tamper theming"
```

---

## Task 8: Grinding Hollow → The Haligtree Sanctum (acertijo de Malenia, intro por tap)

**Files:**
- Create: `src/challenges/grindingCipher.js`
- Test: `src/challenges/grindingCipher.test.js` (create)
- Modify: `src/challenges/GrindingHollow.jsx`

**Diseño:** Se mantiene el puzzle de sustitución (runa→letra), pero la frase oculta es en español sobre Malenia: `LA DIOSA DE LA PUTREFACCION ESCARLATA` (sin acentos para que el grid A-Z funcione). Para que "no sea fácil", solo 2 pistas gratis (`A`, `E`). Intentos ilimitados (1 sola vez, 1 runa). Intro con `CinematicIntro` (tap). Temática Haligtree/Malenia (sin "Hollow").

- [ ] **Step 1: Escribir el test de cobertura del cifrado (debe fallar)**

Crear `src/challenges/grindingCipher.test.js`:

```js
import { describe, it, expect } from 'vitest'
import { MESSAGE, RUNE_POOL, FREE_HINTS, buildCipher } from './grindingCipher'

const uniqueLettersOf = (msg) => [...new Set(msg.replace(/\s/g, '').split(''))]

describe('grindingCipher', () => {
  it('la frase es la de Malenia, en mayúsculas y sin acentos', () => {
    expect(MESSAGE).toBe('LA DIOSA DE LA PUTREFACCION ESCARLATA')
    expect(MESSAGE).toBe(MESSAGE.toUpperCase())
    expect(MESSAGE).not.toMatch(/[ÁÉÍÓÚÑáéíóúñ]/)
  })

  it('solo letras A-Z y espacios', () => {
    expect(MESSAGE).toMatch(/^[A-Z ]+$/)
  })

  it('el pool de runas no contiene las runas de recompensa', () => {
    for (const reward of ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ']) {
      expect(RUNE_POOL).not.toContain(reward)
    }
  })

  it('hay runas suficientes para todas las letras únicas', () => {
    expect(RUNE_POOL.length).toBeGreaterThanOrEqual(uniqueLettersOf(MESSAGE).length)
  })

  it('las pistas son pocas (dificultad alta) y son letras de la frase', () => {
    expect(FREE_HINTS.length).toBeLessThanOrEqual(2)
    const letters = uniqueLettersOf(MESSAGE)
    for (const hint of FREE_HINTS) {
      expect(letters).toContain(hint)
    }
  })

  it('buildCipher asigna una runa única a cada letra de la frase', () => {
    const { letterToRune, uniqueLetters } = buildCipher()
    expect(uniqueLetters).toEqual(uniqueLettersOf(MESSAGE))
    const runes = uniqueLetters.map((l) => letterToRune[l])
    expect(new Set(runes).size).toBe(uniqueLetters.length)
  })
})
```

- [ ] **Step 2: Ejecutar el test para verificar que falla**

Run: `npx vitest run src/challenges/grindingCipher.test.js`
Expected: FAIL ("Cannot find module './grindingCipher'").

- [ ] **Step 3: Crear `src/challenges/grindingCipher.js`**

```js
export const MESSAGE = 'LA DIOSA DE LA PUTREFACCION ESCARLATA'

// Solo 2 pistas gratis para que el acertijo no sea fácil.
export const FREE_HINTS = ['A', 'E']

// Elder Futhark runes, excluding the four runes awarded as level rewards
// (ᚠ ᚢ ᚦ ᚨ) so the cipher never overlaps with earned runes.
export const RUNE_POOL = [
  'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᚾ', 'ᛁ', 'ᛃ', 'ᛇ', 'ᛈ',
  'ᛉ', 'ᛊ', 'ᛏ', 'ᛒ', 'ᛖ', 'ᛗ', 'ᛚ', 'ᛜ', 'ᛟ', 'ᛞ',
]

const shuffle = (items) => {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

// Generates a fresh rune <-> letter mapping at mount time so the answer can
// never be read by inspecting the source.
export const buildCipher = () => {
  const uniqueLetters = [...new Set(MESSAGE.replace(/\s/g, '').split(''))]
  const runes = shuffle(RUNE_POOL).slice(0, uniqueLetters.length)
  const letterToRune = {}
  uniqueLetters.forEach((letter, i) => {
    letterToRune[letter] = runes[i]
  })
  return { letterToRune, uniqueLetters }
}
```

- [ ] **Step 4: Ejecutar el test para verificar que pasa**

Run: `npx vitest run src/challenges/grindingCipher.test.js`
Expected: PASS (6 tests).

- [ ] **Step 5: Reescribir `src/challenges/GrindingHollow.jsx`**

Reemplazar el contenido completo por:

```jsx
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
  'La diosa de la putrefacción escarlata aguarda. Su nombre fue grabado en runas antiguas.',
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
            Asigna una letra a <span className="text-xl text-gold">{selectedRune}</span>
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
```

- [ ] **Step 6: Verificar build/lint y tests**

Run: `npm run lint && npm run build && npx vitest run`
Expected: sin errores; todos los tests PASS.

- [ ] **Step 7: Verificación manual del reto**

Run: `npm run dev`. En el Haligtree Sanctum (tras Golden Lord):
- Intro de 3 páginas que **avanza por tap** (no sola).
- El puzzle muestra runas y casillas; solo `A` y `E` aparecen ya reveladas (2 pistas).
- Asignar letras a runas hasta formar `LA DIOSA DE LA PUTREFACCION ESCARLATA`.
- "Descifrar" con la solución incompleta hace temblar las casillas incorrectas en rojo.
- Con la frase completa → "MALENIA HA SIDO VENCIDA" → cofre con `ᚨ ×1`.
- En el código fuente del navegador (inspeccionar) **no** se ve el mapa runa→letra (se genera al montar).
- En el mapa, "Todas las runas reunidas / El Tarnished ha resurgido".

- [ ] **Step 8: Commit**

```bash
git add src/challenges/grindingCipher.js src/challenges/grindingCipher.test.js src/challenges/GrindingHollow.jsx
git commit -m "feat: Haligtree Sanctum — Malenia Spanish cipher, tap intro, boss theming"
```

---

## Task 9: StartScreen + index.html (copy y temática)

**Files:**
- Modify: `src/components/StartScreen.jsx`
- Modify: `index.html`

- [ ] **Step 1: Actualizar el texto de `StartScreen`**

En `src/components/StartScreen.jsx`, reemplazar el párrafo introductorio. Cambiar:

```jsx
        <p className="max-w-xs font-body text-sm leading-relaxed text-bone/80">
          La ceniza cae sobre una tierra olvidada. Tres pruebas esperan... y
          más allá de ellas, una cuarta: dorada, despiadada, reservada para
          quienes perseveren.
        </p>
```

por:

```jsx
        <p className="max-w-xs font-body text-sm leading-relaxed text-bone/80">
          La gracia ilumina las Tierras Intermedias. Cuatro pruebas te aguardan
          en el camino, y al final de todas, la Cuchilla de Miquella. Reclama sus
          runas y preséntalas ante la Doncella.
        </p>
```

- [ ] **Step 2: Actualizar la descripción de `index.html`**

En `index.html`, cambiar la línea de la meta description. Cambiar:

```html
    <meta name="description" content="The Tarnished's Birthday — una prueba al estilo Souls repleta de desafíos y runas." />
```

por:

```html
    <meta name="description" content="The Tarnished's Birthday — una aventura al estilo Elden Ring repleta de pruebas y runas." />
```

- [ ] **Step 3: Verificar build/lint**

Run: `npm run lint && npm run build`
Expected: sin errores.

- [ ] **Step 4: Commit**

```bash
git add src/components/StartScreen.jsx index.html
git commit -m "feat: start screen + meta copy — four trials, Elden Ring framing"
```

---

## Task 10: Verificación final y barrido de vocabulario

**Files:** (verificación; editar solo si aparecen restos)

- [ ] **Step 1: Barrido de vocabulario Dark Souls en texto visible**

Run: `grep -rniE "shrine guardian|hollow|hollowing|\bember forge\b|estus|bonfire|souls" src index.html | grep -viE "ember-forge|emberforge|\.ember|--ember|ember-|font|class"`

Expected: sin coincidencias en texto visible. (Las clases CSS internas `ember-*`, el id `ember-forge` y el nombre de archivo `souls.css` son internos y NO deben cambiarse.) Si aparece algún texto visible con esos términos, reescribirlo a vocabulario Elden Ring y volver a ejecutar.

- [ ] **Step 2: Suite de tests completa**

Run: `npx vitest run`
Expected: todos los archivos de test PASS (levels, progressLogic, grindingCipher, goldenLordSpeed).

- [ ] **Step 3: Lint + build de producción**

Run: `npm run lint && npm run build`
Expected: sin errores ni warnings de lint.

- [ ] **Step 4: Playthrough completo (manual)**

Run: `npm run dev`, en vista móvil, con `localStorage` limpio (o reset con 5 taps en el título):
1. Inicio → "Levántate, Tarnished" → mapa con 4 nodos.
2. Cleansing Chapel: 2 ofrendas (2ª más rápida) → `ᚠ ×2`.
3. Forge of Giants: 2 himnos (2º más rápido) → `ᚢ ×2`.
4. Golden Lord: intro por tap + 4 rondas cada vez más rápidas, muerte reinicia ronda actual → `ᚦ ×4`.
5. Haligtree Sanctum: intro por tap + cifrado de Malenia en español (2 pistas) → `ᚨ ×1`.
6. Mapa: "Todas las runas reunidas / El Tarnished ha resurgido".
7. Inventario: 4 runas con sus contadores (`×2`, `×2`, `×4`, `×1`).
8. Reset (5 taps en el título de inicio) deja todo sellado salvo el primer nivel.

- [ ] **Step 5: Commit final (si hubo ajustes en el barrido)**

```bash
git add -A
git commit -m "chore: final Elden Ring vocabulary sweep + verification"
```

---

## Notas de revisión (self-review)

- **Cobertura del spec:** Elden Ring only (Tasks 1,8,9,10) ✓; 2 geles con ronda bonus más rápida (Task 5) ✓; 2 cafés con ronda bonus más rápida (Task 6) ✓; reorden con Golden Lord en posición 3 (Tasks 1,2) ✓; Golden Lord x4 cada vez más rápido = tamper station 4 piezas/4 runas (Task 7) ✓; Grinding Hollow → último, acertijo de Malenia en español, no fácil, 1 vez (Task 8) ✓; intro por tap en vez de automática (Tasks 4,7,8) ✓; runas con contador (Task 3) ✓.
- **Decisiones de diseño concretas (ajustables en ejecución):** nombres de área (Cleansing Chapel, Forge of Giants, Golden Lord, Haligtree Sanctum), frase del cifrado (`LA DIOSA DE LA PUTREFACCION ESCARLATA`), 2 pistas (`A`,`E`), factores de velocidad de Golden Lord (`[1,0.82,0.68,0.55]`, 12 ataques/ronda), velocidades de las rondas bonus (capilla `cycleMs 1300`/zona 18%; forja `lightMs 500`/`pauseMs 200`).
- **IDs internos** sin cambios (`vanilla-shrine`, `ember-forge`, `golden-lord`, `grinding-hollow`) → `App.jsx` y `localStorage` intactos.
- **Consistencia de tipos:** `runeCount` usado en levels.js, RuneDisplay (`count`), ChestReveal, Inventory; `isFinal` en levels.js, MapScreen, ChestReveal; helpers puros (`isLevelUnlocked`, `nextLevelId`, `runesOwned`, `fallDurationFor(round,index)`, `spawnIntervalFor(round,index)`, `buildCipher`) con firmas consistentes entre tarea y test.
- **Testing:** TDD en lógica pura (Vitest, sin DOM); retos interactivos (rAF/animación) verificados con checklists manuales — desviación pragmática del TDD estricto por ser una app visual de regalo sin harness de DOM previo.
```