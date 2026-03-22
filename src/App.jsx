import { useState, useEffect } from 'react'
import { computeScores } from './scoring.js'
import InputPanel from './components/InputPanel.jsx'
import NeighborhoodMap from './components/NeighborhoodMap.jsx'
import ScoreCard from './components/ScoreCard.jsx'
import './App.css'

const DEFAULT_INPUT = {
  budget_min: 300000,
  budget_max: 700000,
  age_group: 'toddler',
  education_priority: 50,
  social_priority: 50,
  safety_priority: 50,
  infra_priority: 50,
}

export default function App() {
  const [userInput, setUserInput] = useState(DEFAULT_INPUT)
  const [scores, setScores] = useState([])
  const [selectedZip, setSelectedZip] = useState(null)

  // Recompute scores whenever userInput changes
  useEffect(() => {
    const computed = computeScores(userInput)
    setScores(computed)
    // If the selected ZIP is now over-budget, keep it selected but show warning
  }, [userInput])

  function handleInputChange(field, value) {
    setUserInput(prev => ({ ...prev, [field]: value }))
  }

  const allOverBudget = scores.length > 0 && scores.every(s => !s.affordable)
  const selectedScore = scores.find(s => s.zip === selectedZip) ?? null

  return (
    <div className="app">
      <header className="app-header">
        <h1>Child Development Score</h1>
        <p className="app-subtitle">Find the best Fairfax County neighborhood to raise your child.</p>
      </header>

      <div className="app-body">
        <aside className="input-panel-container">
          <InputPanel userInput={userInput} onChange={handleInputChange} />
        </aside>

        <main className="main-panel">
          {allOverBudget && (
            <div className="banner banner-warning global-warning">
              ⚠️ Your budget may be below the typical range for Fairfax County.
              All neighborhoods are shown for reference.
            </div>
          )}

          <NeighborhoodMap scores={scores} onSelect={setSelectedZip} selectedZip={selectedZip} />

          {selectedScore && (
            <ScoreCard
              score={selectedScore}
              userInput={userInput}
            />
          )}
        </main>
      </div>
    </div>
  )
}
