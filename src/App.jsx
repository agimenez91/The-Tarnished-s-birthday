import { useState } from 'react'
import StartScreen from './components/StartScreen'
import MapScreen from './components/MapScreen'
import LevelScreen from './components/LevelScreen'
import Inventory from './components/Inventory'
import EndingScreen from './components/EndingScreen'
import { useProgress } from './hooks/useProgress'
import { getLevelById } from './data/levels'
import VanillaShrine from './challenges/VanillaShrine'
import EmberForge from './challenges/EmberForge'
import GrindingHollow from './challenges/GrindingHollow'
import GoldenLord from './challenges/GoldenLord'

const CHALLENGE_COMPONENTS = {
  'vanilla-shrine': VanillaShrine,
  'ember-forge': EmberForge,
  'grinding-hollow': GrindingHollow,
  'golden-lord': GoldenLord,
}

export default function App() {
  const [screen, setScreen] = useState('start')
  const [activeLevelId, setActiveLevelId] = useState(null)
  const { isCompleted, isUnlocked, getLevelStatus, completeLevel, resetProgress, allCompleted } =
    useProgress()

  const handleSelectLevel = (levelId) => {
    if (!isUnlocked(levelId)) return
    setActiveLevelId(levelId)
    setScreen('level')
  }

  if (screen === 'start') {
    return <StartScreen onEnter={() => setScreen('map')} onResetProgress={resetProgress} />
  }

  if (screen === 'inventory') {
    return <Inventory isCompleted={isCompleted} onBack={() => setScreen('map')} />
  }

  if (screen === 'ending') {
    return <EndingScreen onBack={() => setScreen('map')} />
  }

  if (screen === 'level' && activeLevelId) {
    const level = getLevelById(activeLevelId)
    const ChallengeComponent = CHALLENGE_COMPONENTS[activeLevelId]

    return (
      <LevelScreen
        level={level}
        alreadyCompleted={isCompleted(activeLevelId)}
        onComplete={() => completeLevel(activeLevelId)}
        onBack={() => setScreen('map')}
        onFinish={() => setScreen('ending')}
      >
        {(onChallengeComplete) => <ChallengeComponent onComplete={onChallengeComplete} />}
      </LevelScreen>
    )
  }

  return (
    <MapScreen
      getLevelStatus={getLevelStatus}
      allCompleted={allCompleted}
      onSelectLevel={handleSelectLevel}
      onOpenInventory={() => setScreen('inventory')}
      onResetProgress={resetProgress}
    />
  )
}
