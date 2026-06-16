# Fase 4: The Golden Lord — Nivel Bonus (Esquivar / Dodge Roll)

## Contexto

Nivel bonus secreto que se desbloquea al completar los 3 niveles principales. El regalo es una camiseta color mostaza. La temática es un encuentro con un señor dorado, y la prueba es de habilidad/reflejos tipo dodge roll.

## El reto: Dodge Roll

### Mecánica

El jugador controla un personaje (icono/silueta) que debe esquivar ataques que vienen desde arriba. Es un minijuego de reflejos donde debe moverse a izquierda o derecha para evitar proyectiles.

### Cómo funciona

1. El personaje del jugador está abajo en el centro de la pantalla
2. Desde arriba caen "ataques dorados" (pueden ser rayos, espadas, runas... representados como formas simples CSS)
3. El jugador se mueve tocando/pulsando la mitad izquierda o derecha de la pantalla:
   - Toca la izquierda → el personaje hace dodge roll a la izquierda
   - Toca la derecha → dodge roll a la derecha
   - El personaje siempre vuelve al centro tras el roll (con animación breve)
4. Los ataques caen en 3 carriles (izquierda, centro, derecha)
5. El jugador tiene 3 puntos de vida (representados como Estus Flasks 🧪)
6. Si un ataque le da → pierde 1 vida, flash rojo
7. Si pierde las 3 vidas → "YOU DIED" (con la tipografía clásica), reinicio

### Condición de victoria

- Sobrevivir a **20 ataques** (oleada completa)
- Los ataques van aumentando de velocidad gradualmente
- Al sobrevivir los 20 → el Golden Lord se arrodilla → cofre bonus

### Parámetros de dificultad (especial)

- Velocidad inicial de caída: ~1.5 segundos desde arriba hasta abajo
- Velocidad final (ataque 20): ~0.8 segundos
- Intervalo entre ataques: empieza cada ~1.5s, baja a ~0.8s
- Los ataques nunca caen en el mismo carril 2 veces seguidas (para que sea justo)
- 3 vidas, sin forma de recuperarlas
- El dodge roll tiene un breve periodo de "invulnerabilidad" visual (~200ms) para que se sienta bien

### UI específica del nivel

- Descripción del área (al desbloquearse en el mapa, antes de entrar):
  > "Beyond the trials, a golden radiance calls. The Lord of the Auric Throne awaits — not to test your mind, but your instinct. Only those who learned to fall gracefully shall rise in gold."

- **Zona de juego:** ocupa la mayor parte de la pantalla, fondo más claro que el resto del juego (tonos dorados oscuros)
- **Personaje:** silueta simple del Tarnished abajo-centro, con capa que se mueve en el dodge
- **Ataques:** formas verticales doradas/brillantes que caen (barras luminosas tipo rayo divino)
- **Vidas:** 3 iconos de flask en la esquina superior
- **Contador:** "Survived: 12/20" discreto arriba
- **YOU DIED:** si pierde, pantalla completa con el texto en rojo con la fuente del juego, fade in lento, botón "Rise again" para reintentar

### Controles móviles

- **Opción principal:** dividir la pantalla en 2 zonas táctiles invisibles (izq/der)
- Al tocar cualquier zona, el personaje hace roll hacia ese lado
- Feedback visual del roll: el personaje se desplaza con una animación de giro/rodar
- Mostrar indicación sutil al empezar: "← Tap left or right →"

### Estética bonus/dorada

- Este nivel tiene paleta diferente: predominan los dorados, ámbar, blanco cálido sobre fondo oscuro (en vez del gris piedra del resto)
- El borde del nivel es dorado brillante
- Partículas doradas flotando de fondo (CSS, pocas, sutiles)
- Al ganar, el cofre bonus tiene un glow extra y la runa aparece más grande y luminosa

### Integración

- Componente en `src/challenges/GoldenLord.jsx`
- Reemplaza el placeholder
- Al completar → `onComplete()` 
- Este es el último nivel, así que al completarlo el mapa muestra un estado final tipo "All runes collected. The Tarnished has risen."
- Usa estilos de `souls.css` + estilos propios dorados

### Restricciones técnicas

- requestAnimationFrame para el game loop
- Detección de colisiones simple (comparar carril del ataque con posición del jugador)
- NO canvas: todo con elementos DOM posicionados con CSS transforms
- Touch events (touchstart) para los controles, con fallback a click para testing en desktop
- Pausar si la pestaña pierde el foco (document.visibilitychange)
- Sin sonidos
