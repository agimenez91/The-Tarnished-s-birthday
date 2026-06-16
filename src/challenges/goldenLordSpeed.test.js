import { describe, it, expect } from 'vitest'
import {
  TOTAL_ROUNDS,
  ATTACKS_PER_ROUND,
  ROUND_SPEED,
  fallDurationFor,
  spawnIntervalFor,
} from './goldenLordSpeed'

describe('goldenLordSpeed', () => {
  it('4 rondas y un factor de velocidad por ronda', () => {
    expect(TOTAL_ROUNDS).toBe(4)
    expect(ROUND_SPEED).toHaveLength(4)
    expect(ATTACKS_PER_ROUND).toBeGreaterThan(0)
  })

  it('los factores son estrictamente decrecientes (cada ronda más rápida)', () => {
    for (let i = 1; i < ROUND_SPEED.length; i++) {
      expect(ROUND_SPEED[i]).toBeLessThan(ROUND_SPEED[i - 1])
    }
  })

  it('para el mismo índice, una ronda posterior cae más rápido', () => {
    expect(fallDurationFor(3, 0)).toBeLessThan(fallDurationFor(0, 0))
    expect(spawnIntervalFor(3, 0)).toBeLessThan(spawnIntervalFor(0, 0))
  })

  it('dentro de una ronda, los ataques se aceleran con el índice', () => {
    expect(fallDurationFor(0, ATTACKS_PER_ROUND - 1)).toBeLessThan(fallDurationFor(0, 0))
  })
})
