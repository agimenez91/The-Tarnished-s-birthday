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
