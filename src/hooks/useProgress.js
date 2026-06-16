import { useCallback, useEffect, useState } from 'react'
import { LEVELS } from '../data/levels'
import { FIRST_LEVEL_ID, isLevelUnlocked, nextLevelId } from './progressLogic'

const STORAGE_KEY = 'tarnished-progress'

const defaultProgress = () => ({
  completedLevels: [],
  currentLevel: FIRST_LEVEL_ID,
})

const loadProgress = () => {
  if (typeof window === 'undefined') return defaultProgress()

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultProgress()

    const parsed = JSON.parse(raw)
    return {
      completedLevels: Array.isArray(parsed.completedLevels)
        ? parsed.completedLevels
        : [],
      currentLevel: parsed.currentLevel ?? FIRST_LEVEL_ID,
    }
  } catch {
    return defaultProgress()
  }
}

const saveProgress = (progress) => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
}

export function useProgress() {
  const [progress, setProgress] = useState(loadProgress)

  useEffect(() => {
    saveProgress(progress)
  }, [progress])

  const isCompleted = useCallback(
    (levelId) => progress.completedLevels.includes(levelId),
    [progress.completedLevels],
  )

  const isUnlocked = useCallback(
    (levelId) => isLevelUnlocked(levelId, progress.completedLevels),
    [progress.completedLevels],
  )

  const getLevelStatus = useCallback(
    (levelId) => {
      if (isCompleted(levelId)) return 'completed'
      if (isUnlocked(levelId)) return 'available'
      return 'locked'
    },
    [isCompleted, isUnlocked],
  )

  const completeLevel = useCallback((levelId) => {
    setProgress((prev) => {
      if (prev.completedLevels.includes(levelId)) return prev
      const completedLevels = [...prev.completedLevels, levelId]
      return {
        completedLevels,
        currentLevel: nextLevelId(completedLevels) ?? prev.currentLevel,
      }
    })
  }, [])

  const resetProgress = useCallback(() => {
    const fresh = defaultProgress()
    setProgress(fresh)
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  const allCompleted = LEVELS.every((level) =>
    progress.completedLevels.includes(level.id),
  )

  return {
    progress,
    isCompleted,
    isUnlocked,
    getLevelStatus,
    completeLevel,
    resetProgress,
    allCompleted,
  }
}
