# Fase 3: The Grinding Hollow — Boss Final (Puzzle Lógico)

## Contexto

Tercer y último nivel principal. Es el boss final. Dificultad alta. El regalo es el molinillo de café (el regalo fuerte). La prueba debe sentirse como un enfrentamiento final: más elaborada, más tensa, más satisfactoria de superar.

## El reto: Cifrado de runas (descifrar un mensaje)

### Mecánica

Un puzzle de descifrado por sustitución. El jugador recibe un mensaje cifrado donde cada letra ha sido sustituida por un símbolo rúnico. Debe descubrir la correspondencia y descifrar el mensaje completo.

### Cómo funciona

1. Se muestra un mensaje cifrado en runas (cada runa = una letra)
2. Debajo, un panel con casillas vacías donde el jugador escribe la letra que cree que corresponde a cada runa
3. El mensaje a descifrar es corto pero significativo (una frase Souls):

   **Mensaje en claro:** `SEEK THE WARMTH WITHIN`
   **Cifrado:** cada letra sustituida por una runa nórdica distinta

4. Se dan 3 pistas iniciales "gratis" (3 letras ya reveladas):
   - La `W` ya aparece resuelta
   - La `E` ya aparece resuelta  
   - La `T` ya aparece resuelta
   
5. El jugador puede:
   - Pulsar una runa del mensaje cifrado → se abre un selector de letra (A-Z)
   - Asignar una letra a esa runa → TODAS las apariciones de esa runa en el mensaje se actualizan automáticamente
   - Cambiar su respuesta en cualquier momento

6. Un botón "Decipher" para comprobar cuando crea que tiene la solución

### Condición de victoria

- El mensaje descifrado completo coincide con el original
- Si falla al comprobar → mensaje de error, puede seguir intentando (sin límite de intentos, pero sin pistas extra)
- Al acertar → victoria épica → cofre del boss

### Pistas reveladas (las 3 gratuitas)

Con W, E y T reveladas, el jugador ve algo como:
```
_EE_ T_E W___T_ W_T___
```
Esto le da suficiente para deducir "SEEK THE WARMTH WITHIN" con algo de esfuerzo.

### UI específica del nivel

- Descripción del área:
  > "In the deepest hollow, where all things are ground to dust and born anew, the final truth awaits. The ancient script guards its meaning — only the worthy shall read what was written in stone."

- **Zona del cifrado:** el mensaje en runas mostrado en grande, con estética de inscripción en piedra
- **Zona de trabajo:** debajo, el mensaje con las letras descifradas/por descifrar. Las letras resueltas en dorado, los huecos como guiones bajos pulsables
- **Panel de asignación:** al pulsar un hueco, aparece un grid de letras A-Z para seleccionar
- **Tabla de correspondencias:** a un lado (o desplegable), muestra las runas y las letras asignadas hasta ahora

### Feedback visual

- Al asignar una letra, todas las apariciones se rellenan con animación de "grabado en piedra"
- Al pulsar "Decipher" con solución incorrecta: las letras incorrectas tiemblan en rojo, las correctas se quedan en dorado
- Al acertar: el mensaje completo brilla en dorado, efecto de "la piedra se ilumina"
- La animación de victoria del boss debe ser más épica que las anteriores: más partículas, más glow, quizá un texto tipo "THE HOLLOW IS VANQUISHED"

### Estética de boss final

- El header/frame del nivel debe tener un borde más elaborado (doble borde dorado, esquinas decoradas con CSS)
- Una barra de "vida del boss" decorativa que se reduce a medida que el jugador asigna letras correctas (calculada por porcentaje de letras acertadas)
- Al entrar, un breve texto dramático tipo cinemática:
  > "A presence stirs in the darkness..."
  
  (con fade-in lento antes de mostrar el puzzle)

### Integración

- Componente en `src/challenges/GrindingHollow.jsx`
- Reemplaza el placeholder
- Al completar → `onComplete()`
- Usa estilos de `souls.css`
- Al ser el boss final, al completarlo se desbloquea el bonus Y aparece un mensaje especial en el mapa

### Restricciones técnicas

- El mapa de cifrado (runa ↔ letra) se genera al montar el componente, no hardcodeado en el código fuente (para que no se pueda ver inspeccionando)
- Las 3 pistas se aplican automáticamente al cargar
- El selector de letras debe ser cómodo en móvil (botones grandes, grid 6x5 o similar)
- Sin sonidos
- Scroll suave si el contenido no cabe en una pantalla
