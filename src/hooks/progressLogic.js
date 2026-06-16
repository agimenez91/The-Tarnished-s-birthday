import { LEVELS, getLevelById } from '../data/levels'

const byOrder = [...LEVELS].sort((a, b) => a.order - b.order)

export const FIRST_LEVEL_ID = byOrder[0]?.id

export function isLevelUnlocked(levelId, completedLevels) {
  const level = getLevelById(levelId)
  if (!level) return false
  if (level.order === 1) return true
  const previous = byOrder.find((entry) => entry.order === level.order - 1)
  return previous ? completedLevels.includes(previous.id) : false
}

export function nextLevelId(completedLevels) {
  const next = byOrder.find((entry) => !completedLevels.includes(entry.id))
  return next ? next.id : null
}

export function runesOwned(completedLevels) {
  return completedLevels.reduce((sum, id) => {
    const level = getLevelById(id)
    return sum + (level ? level.runeCount : 0)
  }, 0)
}
