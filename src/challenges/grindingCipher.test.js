import { describe, it, expect } from 'vitest'
import { MESSAGE, RUNE_POOL, FREE_HINTS, buildCipher } from './grindingCipher'

const uniqueLettersOf = (msg) => [...new Set(msg.replace(/\s/g, '').split(''))]

describe('grindingCipher', () => {
  it('la frase es la de Malenia, en mayúsculas y sin acentos', () => {
    expect(MESSAGE).toBe('LA DIOSA DE LA PUTREFACCION ESCARLATA')
    expect(MESSAGE).toBe(MESSAGE.toUpperCase())
    expect(MESSAGE).not.toMatch(/[ÁÉÍÓÚÑáéíóúñ]/)
  })

  it('solo letras A-Z y espacios', () => {
    expect(MESSAGE).toMatch(/^[A-Z ]+$/)
  })

  it('el pool de runas no contiene las runas de recompensa', () => {
    for (const reward of ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ']) {
      expect(RUNE_POOL).not.toContain(reward)
    }
  })

  it('hay runas suficientes para todas las letras únicas', () => {
    expect(RUNE_POOL.length).toBeGreaterThanOrEqual(uniqueLettersOf(MESSAGE).length)
  })

  it('las pistas son pocas (dificultad alta) y son letras de la frase', () => {
    expect(FREE_HINTS.length).toBeLessThanOrEqual(2)
    const letters = uniqueLettersOf(MESSAGE)
    for (const hint of FREE_HINTS) {
      expect(letters).toContain(hint)
    }
  })

  it('buildCipher asigna una runa única a cada letra de la frase', () => {
    const { letterToRune, uniqueLetters } = buildCipher()
    expect(uniqueLetters).toEqual(uniqueLettersOf(MESSAGE))
    const runes = uniqueLetters.map((l) => letterToRune[l])
    expect(new Set(runes).size).toBe(uniqueLetters.length)
  })
})
