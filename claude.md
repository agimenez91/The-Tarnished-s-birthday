# The Tarnished's Birthday — Project Brief

## Qué es

Una web app móvil (regalo de cumpleaños) con estética Dark Souls / Elden Ring. El jugador es un Tarnished que debe superar 4 pruebas para abrir cofres y conseguir runas. Cada runa la canjea en persona por un regalo físico real.

## Stack

- React (Vite), sin backend
- Tailwind CSS + CSS custom para la estética Souls
- localStorage para guardar progreso
- Mobile-first (se usará en móvil)
- Sin react-router, navegación por estados
- Sin sonidos
- Sin canvas: todo DOM + CSS
- Google Fonts: "Cinzel Decorative" (display) y "Cinzel" (body)

## Paleta y estética

Colores base: `#0a0a0a` (negro), `#1a1a1a` (fondo), `#2a2a2a` (piedra), `#c8a84e` (dorado), `#8b7355` (bronce).
Tono visual: oscuro, medieval, solemne. Textura de piedra/niebla con CSS (gradients, noise, partículas mínimas con CSS puro). Bordes dorados con glow sutil. Todo el texto en inglés con tono de item description de Dark Souls: críptico, poético, solemne.

## Pantallas

### Inicio
Título "The Tarnished's Birthday", tipografía medieval, fondo con niebla/partículas CSS, botón "Arise, Tarnished".

### Mapa (selección de nivel)
Scroll vertical tipo path. Cada nivel es un nodo con nombre, icono y estado (bloqueado 🔒 / disponible ⚔️ / completado ✅). Se desbloquean en orden. El bonus aparece con estética dorada solo al completar los 3 principales. Al completar todo: mensaje final "All runes collected. The Tarnished has risen."

### Nivel (wrapper genérico)
Header con nombre y descripción del área. Zona del reto. Al completar: animación de cofre abriéndose → runa revelada → mensaje "Presenta esta runa a la Maiden para reclamar tu recompensa" → volver al mapa.

### Inventario (accesible desde el mapa)
Muestra runas conseguidas. Las no conseguidas como siluetas oscuras.

## Niveles y retos

| Orden | ID | Nombre | Regalo | Runa | Tipo de reto |
|-------|----|--------|--------|------|-------------|
| 1 | vanilla-shrine | The Vanilla Shrine | Gel de vainilla | ᚠ | Timing (parry) |
| 2 | ember-forge | The Ember Forge | Café en grano | ᚢ | Memoria (secuencia) |
| 3 | grinding-hollow | The Grinding Hollow | Molinillo de café | ᚦ | Puzzle lógico (cifrado) |
| Bonus | golden-lord | The Golden Lord | Camiseta mostaza | ᚨ | Habilidad (esquivar) |

---

### Nivel 1: The Vanilla Shrine — Parry (fácil)

> "A shrine lost to time, where the air grows sweet with forgotten offerings. The guardian remains, hollow but vigilant. Prove your reflexes, Tarnished."

**Mecánica:** una barra horizontal con un indicador que se mueve de lado a lado. Hay una zona dorada (~20-25% del ancho). El jugador pulsa "⚔️ Parry" cuando el indicador está en la zona. Necesita 3 parries seguidos sin fallar. Si falla, el contador vuelve a 0.

**UI:** silueta de "Shrine Guardian" con CSS, contador "⚔️ 1/3", botón de parry grande y táctil. Al acertar la silueta retrocede, al completar se desvanece en partículas doradas.

**Parámetros:** velocidad del indicador ~2s por ciclo, zona de parry ~20-25%, 3 aciertos seguidos. Usar requestAnimationFrame.

---

### Nivel 2: The Ember Forge — Memoria (media)

> "The ancient forge still burns, fed by embers that remember. Watch the flames closely — they speak in patterns older than words. Repeat their hymn, or be consumed."

**Mecánica:** 4 runas en pantalla (disposición diamante/cuadrado). Se iluminan en secuencia, el jugador repite el orden. Ronda 1: 1 runa, Ronda 2: 2 runas... hasta Ronda 5: 5 runas. Si falla, vuelve a ronda 1 con secuencia nueva.

**UI:** runas con borde de brasa, estado normal oscuro, estado iluminado con glow intenso (colores: naranja, rojo, ámbar, blanco-caliente). Fase de muestra: runas deshabilitadas + texto "Observe...". Fase del jugador: runas habilitadas + "Your turn, Tarnished". Indicador "Ember 3/5".

**Parámetros:** iluminación ~800ms con ~300ms de pausa. Runas pueden repetirse. Al fallar se muestra la runa correcta brevemente.

---

### Nivel 3: The Grinding Hollow — Cifrado de runas (difícil, boss final)

> "In the deepest hollow, where all things are ground to dust and born anew, the final truth awaits. The ancient script guards its meaning — only the worthy shall read what was written in stone."

**Mecánica:** puzzle de sustitución. El mensaje `SEEK THE WARMTH WITHIN` aparece cifrado con runas nórdicas (cada letra = una runa). Se dan 3 pistas gratis (W, E, T reveladas). El jugador pulsa una runa → selector A-Z → asigna letra → todas las apariciones se actualizan. Botón "Decipher" para comprobar. Intentos ilimitados.

**UI de boss:** borde doble dorado con esquinas decoradas, barra de vida del boss (% de letras acertadas), intro cinemática con fade-in lento: "A presence stirs in the darkness...". Al fallar: letras incorrectas tiemblan en rojo. Al ganar: victoria épica con más partículas y texto "THE HOLLOW IS VANQUISHED".

**Parámetros:** mapa de cifrado generado dinámicamente al montar (no hardcodeado, que no se vea inspeccionando el código). Selector de letras tipo grid 6x5, táctil. Al ganar el boss se desbloquea el bonus + mensaje especial en el mapa.

---

### Nivel Bonus: The Golden Lord — Esquivar (especial)

> "Beyond the trials, a golden radiance calls. The Lord of the Auric Throne awaits — not to test your mind, but your instinct. Only those who learned to fall gracefully shall rise in gold."

**Mecánica:** el personaje (silueta abajo-centro) debe esquivar ataques dorados que caen desde arriba en 3 carriles (izquierda, centro, derecha). Tocar mitad izquierda de pantalla = dodge roll izquierda, mitad derecha = dodge roll derecha. El personaje vuelve al centro tras el roll. 3 vidas (Estus Flasks 🧪). Sobrevivir 20 ataques = victoria.

**UI:** paleta diferente (dorados, ámbar, blanco cálido), partículas doradas flotando, ataques como barras luminosas verticales, contador "Survived: 12/20", vidas arriba. Al morir: pantalla "YOU DIED" en rojo con fade-in lento + botón "Rise again". Indicación inicial "← Tap left or right →".

**Parámetros:** velocidad de caída de 1.5s → 0.8s progresivo, intervalo entre ataques de 1.5s → 0.8s, nunca 2 ataques seguidos en el mismo carril, dodge roll con ~200ms de invulnerabilidad visual. Usar requestAnimationFrame, pausar con visibilitychange. Touch events con fallback a click.

---

## Progreso

```js
// localStorage
{ completedLevels: ["vanilla-shrine"], currentLevel: "ember-forge" }
```

- Nivel 1 desbloqueado por defecto
- Al completar uno se desbloquea el siguiente
- Bonus al completar los 3 principales
- Botón oculto de reset: tap 5 veces en el título del mapa

## Arquitectura

```
src/
  components/
    StartScreen.jsx
    MapScreen.jsx
    LevelScreen.jsx       ← wrapper, recibe reto como children
    Inventory.jsx
    ChestReveal.jsx        ← animación cofre + runa
    RuneDisplay.jsx
  challenges/
    VanillaShrine.jsx
    EmberForge.jsx
    GrindingHollow.jsx
    GoldenLord.jsx
  hooks/
    useProgress.js         ← leer/escribir progreso en localStorage
  data/
    levels.js              ← config de cada nivel
  styles/
    souls.css              ← estilos temáticos compartidos
  App.jsx
```

## Construcción por fases

Construye el proyecto en este orden. Cada fase debe funcionar antes de pasar a la siguiente:

1. **Fase 0 — Setup:** estructura del proyecto, pantallas, mapa, progreso, estilos Souls, placeholders con botón "Complete (DEV)" en cada nivel
2. **Fase 1 — Vanilla Shrine:** implementar reto de parry
3. **Fase 2 — Ember Forge:** implementar reto de memoria
4. **Fase 3 — Grinding Hollow:** implementar puzzle de cifrado (boss)
5. **Fase 4 — Golden Lord:** implementar reto de esquivar (bonus)
