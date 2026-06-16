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
