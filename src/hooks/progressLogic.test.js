import { describe, it, expect } from 'vitest'
import { isLevelUnlocked, nextLevelId, runesOwned, FIRST_LEVEL_ID } from './progressLogic'

describe('progressLogic', () => {
  it('el primer nivel siempre está desbloqueado', () => {
    expect(FIRST_LEVEL_ID).toBe('vanilla-shrine')
    expect(isLevelUnlocked('vanilla-shrine', [])).toBe(true)
  })

  it('un nivel se desbloquea solo si el anterior está completo', () => {
    expect(isLevelUnlocked('ember-forge', [])).toBe(false)
    expect(isLevelUnlocked('ember-forge', ['vanilla-shrine'])).toBe(true)
    expect(isLevelUnlocked('golden-lord', ['vanilla-shrine'])).toBe(false)
    expect(isLevelUnlocked('golden-lord', ['vanilla-shrine', 'ember-forge'])).toBe(true)
    expect(
      isLevelUnlocked('grinding-hollow', ['vanilla-shrine', 'ember-forge', 'golden-lord']),
    ).toBe(true)
  })

  it('nextLevelId devuelve el primer nivel no completado por orden', () => {
    expect(nextLevelId([])).toBe('vanilla-shrine')
    expect(nextLevelId(['vanilla-shrine'])).toBe('ember-forge')
    expect(nextLevelId(['vanilla-shrine', 'ember-forge', 'golden-lord'])).toBe('grinding-hollow')
  })

  it('nextLevelId devuelve null cuando todo está completo', () => {
    expect(
      nextLevelId(['vanilla-shrine', 'ember-forge', 'golden-lord', 'grinding-hollow']),
    ).toBe(null)
  })

  it('runesOwned suma los runeCount de los niveles completados', () => {
    expect(runesOwned([])).toBe(0)
    expect(runesOwned(['vanilla-shrine'])).toBe(2)
    expect(runesOwned(['vanilla-shrine', 'golden-lord'])).toBe(6)
    expect(
      runesOwned(['vanilla-shrine', 'ember-forge', 'golden-lord', 'grinding-hollow']),
    ).toBe(9)
  })
})
