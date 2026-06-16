import { describe, it, expect } from 'vitest'
import { LEVELS, MAIN_LEVELS, getLevelById, TOTAL_RUNES } from './levels'

describe('LEVELS config', () => {
  it('tiene 4 niveles, todos main, sin bonus', () => {
    expect(LEVELS).toHaveLength(4)
    expect(LEVELS.every((l) => l.type === 'main')).toBe(true)
    expect(MAIN_LEVELS).toHaveLength(4)
  })

  it('ordenado 1..4 sin huecos ni repetidos', () => {
    const orders = LEVELS.map((l) => l.order).sort((a, b) => a - b)
    expect(orders).toEqual([1, 2, 3, 4])
  })

  it('IDs y orden esperados', () => {
    expect(LEVELS.map((l) => l.id)).toEqual([
      'vanilla-shrine',
      'ember-forge',
      'golden-lord',
      'grinding-hollow',
    ])
  })

  it('runeCount por nivel y total = 9', () => {
    expect(getLevelById('vanilla-shrine').runeCount).toBe(2)
    expect(getLevelById('ember-forge').runeCount).toBe(2)
    expect(getLevelById('golden-lord').runeCount).toBe(4)
    expect(getLevelById('grinding-hollow').runeCount).toBe(1)
    expect(TOTAL_RUNES).toBe(9)
  })

  it('el último nivel está marcado como final', () => {
    expect(getLevelById('grinding-hollow').isFinal).toBe(true)
  })

  it('sin vocabulario Dark Souls en nombres visibles', () => {
    const text = LEVELS.map((l) => `${l.name} ${l.runeName}`).join(' ').toLowerCase()
    expect(text).not.toMatch(/hollow|shrine|\bember\b/)
  })
})
