// Level configuration for "The Tarnished's Birthday"
// Each level describes an area on the map, its lore, and the rune
// awarded upon completion. Challenges themselves are implemented
// separately under src/challenges and wired up in App.jsx.

export const LEVELS = [
  {
    id: 'vanilla-shrine',
    order: 1,
    type: 'main',
    name: 'The Vanilla Shrine',
    icon: '🕯️',
    rune: 'ᚠ',
    runeName: 'Rune of Beginnings',
    difficulty: 'Sin probar',
    tagline: 'Un lugar de comienzos, donde el aire permanece dulce e inmóvil.',
    description:
      "Mucho antes del Hollowing, los peregrinos se ungían aquí con aceites de vainilla, buscando el favor de dioses olvidados hace tiempo. El santuario le pide poco al Tarnished: solo paciencia y una mano firme.",
    rewardFlavor:
      'Un pequeño frasco, cálido al tacto, con un suave aroma a vainilla.',
    gift: 'Vanilla shower gel',
  },
  {
    id: 'ember-forge',
    order: 2,
    type: 'main',
    name: 'The Ember Forge',
    icon: '🔥',
    rune: 'ᚢ',
    runeName: 'Rune of the Ember',
    difficulty: 'Prueba',
    tagline: 'Donde el recuerdo arde más brillante que la propia llama.',
    description:
      'En las profundidades de la montaña, los antiguos herreros forjaban algo más que espadas: forjaban el recuerdo en brasa y acero. Para superarla, el Tarnished debe recordar el patrón de las llamas, o será consumido por ellas.',
    rewardFlavor:
      'Una bolsa de granos oscuros y aromáticos, todavía calientes de la forja.',
    gift: 'Coffee beans',
  },
  {
    id: 'grinding-hollow',
    order: 3,
    type: 'main',
    name: 'The Grinding Hollow',
    icon: '⚙️',
    rune: 'ᚦ',
    runeName: 'Rune of the Hollow',
    difficulty: 'Calvario',
    tagline: 'El último hollow. Pocos de los que entran salen enteros.',
    description:
      'Aquí yace el último de los grandes hollows, donde hueso y bronce se muelen por igual hasta volverse polvo. El mecanismo gira eternamente, indiferente a la carne. Solo quienes aprendan su ritmo podrán silenciarlo... y reclamar lo que se oculta en su interior.',
    rewardFlavor:
      'Un pesado mecanismo de latón y piedra, construido para moler sin descanso.',
    gift: 'Coffee grinder (final boss reward)',
  },
  {
    id: 'golden-lord',
    order: 4,
    type: 'bonus',
    name: 'The Golden Lord',
    icon: '👑',
    rune: 'ᚨ',
    runeName: 'Rune of the Golden Lord',
    difficulty: '???',
    tagline: 'Un resplandor más allá de las tres pruebas, para quienes lo soportaron todo.',
    description:
      'Cuando las tres pruebas enmudecen, un camino dorado se revela: estrecho, veloz, despiadado. El Golden Lord no pone a prueba la fuerza ni el ingenio, solo el reflejo. Esquiva, Tarnished, o serás devuelto a las sombras.',
    rewardFlavor:
      'Una prenda del color del sol moribundo, digna de un señor de antaño.',
    gift: 'Mustard t-shirt',
  },
]

export const getLevelById = (id) => LEVELS.find((level) => level.id === id)

export const MAIN_LEVELS = LEVELS.filter((level) => level.type === 'main')
export const BONUS_LEVEL = LEVELS.find((level) => level.type === 'bonus')
