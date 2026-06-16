# The Tarnished's Birthday — Guía de construcción

## Orden de ejecución en Claude Code

Ejecuta cada archivo como prompt **en orden**. Espera a que cada fase esté funcionando antes de pasar a la siguiente.

### Paso 1: Setup
```
Carga el archivo 00-setup-proyecto.md y ejecútalo como instrucciones.
```
Resultado: proyecto Vite+React con mapa, pantallas, progreso, y placeholders.

### Paso 2–5: Cada reto
```
Carga 01-vanilla-shrine.md → implementa el reto de timing
Carga 02-ember-forge.md → implementa el reto de memoria  
Carga 03-grinding-hollow.md → implementa el puzzle del boss
Carga 04-golden-lord.md → implementa el reto de esquivar
```

### Testing rápido entre fases
- El botón oculto (tap 5 veces en el título) resetea el progreso
- Cada placeholder tiene un "Complete Challenge (DEV)" para saltarte niveles durante testing

### Deploy
Cuando todo funcione, haz deploy en Netlify o simplemente `npm run build` y sube la carpeta `dist` a cualquier hosting estático. También puedes compartir por Netlify Drop (arrastra la carpeta dist a https://app.netlify.com/drop).

## Regalos ↔ Runas

| Runa | Nivel | Regalo |
|------|-------|--------|
| ᚠ | The Vanilla Shrine | Gel de ducha de vainilla |
| ᚢ | The Ember Forge | Café en grano |
| ᚦ | The Grinding Hollow | Molinillo de café |
| ᚨ | The Golden Lord | Camiseta color mostaza |
