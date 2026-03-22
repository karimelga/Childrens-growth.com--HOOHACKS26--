import AIExplanation from './AIExplanation.jsx'

const PILLARS = [
  { key: 'education_score', label: 'Education' },
  { key: 'social_score', label: 'Social Development' },
  { key: 'safety_score', label: 'Safety' },
  { key: 'infra_score', label: 'Infrastructure' },
]

function scoreColor(value) {
  if (value >= 80) return 'score-green'
  if (value >= 60) return 'score-yellow'
  return 'score-red'
}

export default function ScoreCard({ score, userInput }) {
  const budgetFit = score.affordable ? 'affordable' : 'over budget'

  const priorities = {
    education: userInput.education_priority,
    social_development: userInput.social_priority,
    safety: userInput.safety_priority,
    infrastructure: userInput.infra_priority,
  }

  const aiScores = {
    education: score.education_score,
    social_development: score.social_score,
    safety: score.safety_score,
    infrastructure: score.infra_score,
    final: score.final_score,
  }

  return (
    <div className="score-card">
      {!score.affordable && (
        <div className="banner banner-warning">
          ⚠️ Average home prices in this area exceed your budget.
          Results are shown for reference only.
        </div>
      )}

      <div className="score-card-header">
        <div>
          <h2 className="score-card-title">{score.label}</h2>
          <p className="score-card-archetype">{score.archetype}</p>
        </div>
        <div className={`final-score ${scoreColor(score.final_score)}`}>
          <span className="final-score-number">{score.final_score}</span>
          <span className="final-score-label">/100</span>
        </div>
      </div>

      <div className="pillar-grid">
        {PILLARS.map(({ key, label }) => (
          <div key={key} className="pillar-item">
            <span className="pillar-label">{label}</span>
            <span className={`pillar-score ${scoreColor(score[key])}`}>
              {score[key]}/100
            </span>
          </div>
        ))}
      </div>

      <AIExplanation
        zip={score.zip}
        label={score.label}
        archetype={score.archetype}
        ageGroup={userInput.age_group}
        priorities={priorities}
        scores={aiScores}
        budgetFit={budgetFit}
      />
    </div>
  )
}
