# Fase 0: Setup del proyecto — "The Tarnished's Birthday"

## Contexto

Estoy construyendo una web app móvil (PWA o simple web responsive) como regalo de cumpleaños para mi novio. Es un juego de pruebas estilo Dark Souls / Elden Ring donde tiene que superar retos para "abrir cofres" y conseguir runas. Cada runa la canjea conmigo por un regalo físico real.

## Qué necesito en esta fase

Monta la estructura base del proyecto con todo lo compartido: navegación, layout, sistema de estilos, pantalla principal y lógica de progreso. **NO construyas las pruebas todavía**, solo la carcasa.

## Stack técnico

- React (Vite) — proyecto simple, sin backend
- Tailwind CSS para utilidades + CSS custom para la estética Souls
- Estado con localStorage para guardar progreso (qué niveles ha completado)
- Mobile-first, optimizado para verse bien en móvil (es el formato principal)
- Una sola página con navegación interna (no react-router, solo estados)

## Estructura de pantallas

### 1. Pantalla de inicio
- Título "The Tarnished's Birthday" con tipografía medieval/gótica (usa Google Fonts, por ejemplo "MedievalSharp" o "Cinzel Decorative")
- Fondo oscuro con textura sutil (puede ser un gradient con noise o un patrón CSS)
- Efecto de niebla o partículas sutiles con CSS (no librerías pesadas)
- Botón "Arise, Tarnished" para entrar al mapa
- Ambientación: colores apagados, dorados oscuros, negros, grises piedra. Palette tipo: `#0a0a0a`, `#1a1a1a`, `#c8a84e` (dorado), `#8b7355` (bronce), `#2a2a2a` (piedra)

### 2. Pantalla de mapa / selección de nivel
- Muestra los niveles como localizaciones en un mapa vertical (scroll vertical, tipo path)
- Cada nivel es un "área" con:
  - Nombre del área
  - Icono/símbolo representativo (usa emojis o SVGs simples)
  - Estado: bloqueado 🔒 / disponible ⚔️ / completado ✅
  - Los niveles se desbloquean en orden (1 → 2 → 3 → bonus)
- El nivel bonus aparece con estética diferente (más brillante, dorado) solo cuando se completan los 3 principales

### 3. Pantalla de nivel (template)
- Header con nombre del área y descripción ambientada
- Zona del reto (aquí irá cada minijuego, por ahora placeholder)
- Al completar: animación de cofre abriéndose → se revela una runa con símbolo único
- Mensaje: "Presenta esta runa a la Maiden para reclamar tu recompensa"
- Botón para volver al mapa

### 4. Pantalla de inventario (opcional, accesible desde el mapa)
- Muestra las runas conseguidas
- Las runas no conseguidas aparecen como siluetas oscuras

## Niveles definidos (solo nombre y metadata, sin implementar el reto)

| Orden | ID | Nombre del área | Regalo real | Dificultad | Runa |
|-------|-----|-----------------|-------------|------------|------|
| 1 | vanilla-shrine | The Vanilla Shrine | Gel de ducha de vainilla | Fácil | ᚠ |
| 2 | ember-forge | The Ember Forge | Café en grano | Media | ᚢ |
| 3 | grinding-hollow | The Grinding Hollow | Molinillo de café (boss final) | Difícil | ᚦ |
| Bonus | golden-lord | The Golden Lord | Camiseta mostaza | Especial | ᚨ |

## Lógica de progreso

- Guardar en localStorage un objeto tipo `{ completedLevels: ["vanilla-shrine"], currentLevel: "ember-forge" }`
- El primer nivel está desbloqueado por defecto
- Al completar un nivel, se desbloquea el siguiente
- El bonus se desbloquea al completar los 3 principales
- Incluir un botón oculto (tap 5 veces en el título) para resetear el progreso (para testing)

## Arquitectura de componentes

Estructura sugerida para que las siguientes fases encajen fácil:

```
src/
  components/
    StartScreen.jsx
    MapScreen.jsx
    LevelScreen.jsx      ← wrapper genérico que recibe el reto como children
    Inventory.jsx
    ChestReveal.jsx       ← animación del cofre + runa
    RuneDisplay.jsx
  challenges/
    VanillaShrine.jsx     ← placeholder por ahora, solo "reto completado" button
    EmberForge.jsx        ← placeholder
    GrindingHollow.jsx    ← placeholder
    GoldenLord.jsx        ← placeholder
  hooks/
    useProgress.js        ← hook para leer/escribir progreso en localStorage
  data/
    levels.js             ← array con la config de cada nivel
  styles/
    souls.css             ← estilos temáticos compartidos
  App.jsx
```

## Estilo y tono

- Todo el texto en inglés con tono Souls: solemne, críptico, poético
- Las descripciones de los niveles deben sonar como item descriptions de Dark Souls
- Fuente display: "Cinzel Decorative" o "MedievalSharp" (Google Fonts)
- Fuente body: "Cinzel" o similar serif
- Animaciones sutiles: glow en los bordes dorados, fade-ins, partículas mínimas
- Sonidos: NO incluir sonidos (complica la UX en móvil)

## Output esperado

Un proyecto Vite+React funcionando donde:
- Se ve la pantalla de inicio
- Se accede al mapa con los 4 niveles
- Se puede entrar a cada nivel (desbloqueado) y ver el placeholder
- El placeholder tiene un botón "Complete Challenge (DEV)" que simula completar el reto
- Se ve la animación del cofre y la runa
- El progreso se guarda entre sesiones
