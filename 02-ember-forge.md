# Fase 2: The Ember Forge — Reto de Memoria (Secuencia de Runas)

## Contexto

Segundo nivel del juego. Dificultad media. El regalo es café en grano. La temática es una forja donde hay que recordar secuencias de runas que se iluminan (tipo Simon Says pero con estética de hoguera/brasas).

## El reto: Secuencia de runas

### Mecánica

Un panel con runas que se iluminan en secuencia. El jugador debe repetir la secuencia en orden correcto. Cada ronda añade una runa más.

### Cómo funciona

1. Se muestran 4 runas en pantalla dispuestas en forma de diamante o cuadrado (ᚠ ᚢ ᚦ ᚨ u otros símbolos rúnicos)
2. Cada runa tiene un color de "brasa" diferente cuando se ilumina (naranja, rojo, ámbar, blanco-caliente)
3. **Ronda 1:** Se ilumina 1 runa → el jugador la pulsa
4. **Ronda 2:** Se iluminan 2 runas en secuencia → el jugador repite las 2
5. **Ronda 3:** 3 runas → repite 3
6. **Ronda 4:** 4 runas → repite 4
7. **Ronda 5 (final):** 5 runas → repite 5

### Condición de victoria

- Completar las 5 rondas sin fallar
- Si falla en cualquier ronda → vuelve a la ronda 1 con secuencia nueva
- Al completar la ronda 5 → victoria → cofre

### Parámetros de dificultad (media)

- Velocidad de iluminación: cada runa se ilumina ~800ms con ~300ms de pausa entre runas
- Las runas pueden repetirse en la secuencia (no son siempre las 4 distintas)
- 5 rondas totales
- Al fallar, se genera secuencia nueva (no se repite la misma)

### UI específica del nivel

- Descripción del área:
  > "The ancient forge still burns, fed by embers that remember. Watch the flames closely — they speak in patterns older than words. Repeat their hymn, or be consumed."
- Las 4 runas son botones grandes, táctiles, con borde de brasa/fuego
- Estado normal: runa oscura con borde tenue naranja
- Estado iluminado: brillo intenso, glow, como si la runa se calentara al rojo
- Estado pulsado por el jugador: flash breve de confirmación
- Indicador de ronda actual: "Ember 3/5" o similar
- Al fallar: las runas parpadean en rojo, mensaje: "The forge rejects your offering. Begin again."
- Al completar cada ronda: breve animación de chispas/ascuas (CSS)

### Feedback visual

- Secuencia mostrándose → las runas están deshabilitadas (no se pueden pulsar), texto "Observe..."
- Turno del jugador → las runas se habilitan, texto "Your turn, Tarnished"
- Acierto parcial → la runa pulsada hace un flash verde/dorado breve
- Fallo → la runa correcta se ilumina en dorado para mostrar cuál era

### Integración

- Componente en `src/challenges/EmberForge.jsx`
- Reemplaza el placeholder
- Al completar → `onComplete()`
- Usa estilos de `souls.css`

### Restricciones técnicas

- CSS para animaciones de glow/brasa (box-shadow animado, keyframes)
- setTimeout/setInterval para la secuencia de iluminación
- Deshabilitar input durante la fase de muestra
- Touch-friendly: runas grandes, mínimo 60x60px de zona táctil
- Sin sonidos
