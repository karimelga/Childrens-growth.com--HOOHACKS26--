const AGE_GROUP_OPTIONS = [
  { value: 'newborn', label: 'Newborn' },
  { value: 'toddler', label: 'Toddler' },
  { value: 'child', label: 'Child' },
]

const PILLAR_SLIDERS = [
  { field: 'education_priority', label: 'Education' },
  { field: 'social_priority', label: 'Social Development' },
  { field: 'safety_priority', label: 'Safety' },
  { field: 'infra_priority', label: 'Infrastructure' },
]

export default function InputPanel({ userInput, onChange }) {
  function handleNumber(field, value) {
    const parsed = parseInt(value, 10)
    if (!isNaN(parsed) && parsed >= 0) {
      onChange(field, parsed)
    }
  }

  return (
    <div className="input-panel">
      <h2>Your Preferences</h2>

      <section className="input-section">
        <h3>Budget Range</h3>
        <label className="input-label">
          Min Budget ($)
          <input
            type="number"
            className="input-number"
            value={userInput.budget_min}
            min={0}
            step={10000}
            onChange={e => handleNumber('budget_min', e.target.value)}
          />
        </label>
        <label className="input-label">
          Max Budget ($)
          <input
            type="number"
            className="input-number"
            value={userInput.budget_max}
            min={0}
            step={10000}
            onChange={e => handleNumber('budget_max', e.target.value)}
          />
        </label>
      </section>

      <section className="input-section">
        <h3>Child&apos;s Age Group</h3>
        <div className="radio-group">
          {AGE_GROUP_OPTIONS.map(({ value, label }) => (
            <label key={value} className="radio-label">
              <input
                type="radio"
                name="age_group"
                value={value}
                checked={userInput.age_group === value}
                onChange={() => onChange('age_group', value)}
              />
              {label}
            </label>
          ))}
        </div>
      </section>

      <section className="input-section">
        <h3>Your Priorities</h3>
        <p className="input-hint">Rate how much each factor matters to you (0–100).</p>
        {PILLAR_SLIDERS.map(({ field, label }) => (
          <label key={field} className="slider-label">
            <span className="slider-name">{label}</span>
            <div className="slider-row">
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={userInput[field]}
                onChange={e => onChange(field, parseInt(e.target.value, 10))}
                className="slider"
              />
              <span className="slider-value">{userInput[field]}</span>
            </div>
          </label>
        ))}
      </section>
    </div>
  )
}
