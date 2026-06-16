import { useCallback, useEffect, useState } from 'react'
import { LEVELS, MAIN_LEVELS, BONUS_LEVEL } from '../data/levels'

const STORAGE_KEY = 'tarnished-progress'

const FIRST_LEVEL_ID = MAIN_LEVELS[0]?.id

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
    (levelId) => {
      const level = LEVELS.find((entry) => entry.id === levelId)
      if (!level) return false

      if (level.type === 'bonus') {
        return MAIN_LEVELS.every((entry) =>
          progress.completedLevels.includes(entry.id),
        )
      }

      if (level.order === 1) return true

      const previous = MAIN_LEVELS.find(
        (entry) => entry.order === level.order - 1,
      )
      return previous ? progress.completedLevels.includes(previous.id) : false
    },
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

      const nextMain = MAIN_LEVELS.find(
        (entry) => !completedLevels.includes(entry.id),
      )
      const allMainDone = !nextMain
      const nextLevel = nextMain
        ? nextMain.id
        : allMainDone && BONUS_LEVEL && !completedLevels.includes(BONUS_LEVEL.id)
          ? BONUS_LEVEL.id
          : prev.currentLevel

      return { completedLevels, currentLevel: nextLevel }
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
