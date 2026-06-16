# Fase 1: The Vanilla Shrine — Reto de Timing (Parry)

## Contexto

Este es el primer nivel del juego "The Tarnished's Birthday". Es el nivel más fácil, sirve de calentamiento. El regalo asociado es un gel de ducha de vainilla.

## El reto: Parry timing

### Mecánica

Simula el parry de Dark Souls. El jugador debe pulsar en el momento exacto para desviar un ataque.

### Cómo funciona

1. Aparece un enemigo (puede ser un simple sprite/silueta CSS o un icono estilizado) al lado derecho
2. Una barra horizontal en la parte inferior muestra un indicador (tipo aguja) que se mueve de izquierda a derecha y rebota
3. Hay una "zona de parry" marcada en dorado en la barra (ocupa ~20% del ancho)
4. El jugador debe pulsar el botón "⚔️ Parry" cuando el indicador está dentro de la zona dorada
5. Si acierta → cuenta como parry exitoso, flash dorado, feedback visual
6. Si falla → la barra se reinicia, flash rojo, mensaje tipo "The enemy strikes true..."

### Condición de victoria

- Necesita acertar **3 parries seguidos** (sin fallar entre medias)
- Si falla, el contador vuelve a 0
- Al completar los 3: el enemigo "cae", animación de victoria → se dispara la apertura del cofre (ya implementada en la fase 0)

### Parámetros de dificultad (fácil)

- Velocidad del indicador: moderada (~2 segundos por ciclo completo)
- Zona de parry: generosa (~20-25% del ancho de la barra)
- 3 parries seguidos necesarios

### UI específica del nivel

- Descripción del área al entrar (tono Souls):
  > "A shrine lost to time, where the air grows sweet with forgotten offerings. The guardian remains, hollow but vigilant. Prove your reflexes, Tarnished."
- El "enemigo" es "Shrine Guardian" — representado como una silueta simple con CSS (no necesita ser elaborado, puede ser un icono con glow)
- Mostrar contador de parries: "⚔️ 1/3", "⚔️ 2/3"
- Animación al acertar: la silueta del enemigo retrocede/parpadea
- Animación al completar: la silueta se desvanece en partículas doradas (CSS)

### Integración

- El componente se monta en `src/challenges/VanillaShrine.jsx`
- Reemplaza el placeholder creado en la Fase 0
- Al completar, llama a `onComplete()` (prop que viene del LevelScreen wrapper)
- Usa los estilos compartidos de `souls.css` definidos en la Fase 0

### Restricciones técnicas

- Solo CSS para animaciones (no canvas, no librerías de animación)
- requestAnimationFrame para el movimiento del indicador
- Touch-friendly: el botón de parry debe ser grande y cómodo en móvil
- Sin sonidos
