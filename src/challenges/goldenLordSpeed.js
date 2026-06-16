export const TOTAL_ROUNDS = 4
export const ATTACKS_PER_ROUND = 12

// Per-round global speed factor (multiplies fall/spawn durations).
// Lower = faster. Each round is strictly faster than the previous.
export const ROUND_SPEED = [1, 0.82, 0.68, 0.55]

const FALL_MS_START = 1500
const FALL_MS_END = 950
const SPAWN_MS_START = 1500
const SPAWN_MS_END = 950

const lerp = (a, b, t) => a + (b - a) * t

const factorFor = (round) => ROUND_SPEED[Math.min(round, ROUND_SPEED.length - 1)]

export const fallDurationFor = (round, index) =>
  lerp(FALL_MS_START, FALL_MS_END, index / (ATTACKS_PER_ROUND - 1)) * factorFor(round)

export const spawnIntervalFor = (round, index) =>
  lerp(SPAWN_MS_START, SPAWN_MS_END, index / (ATTACKS_PER_ROUND - 1)) * factorFor(round)
