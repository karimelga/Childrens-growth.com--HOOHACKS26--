import { useState, useEffect, useRef } from 'react'

export default function AIExplanation({ zip, label, archetype, ageGroup, priorities, scores, budgetFit }) {
  const [status, setStatus] = useState('loading') // 'loading' | 'ready' | 'error'
  const [explanation, setExplanation] = useState('')
  const abortRef = useRef(null)

  useEffect(() => {
    // Cancel any in-flight request when props change
    if (abortRef.current) {
      abortRef.current.abort()
    }
    const controller = new AbortController()
    abortRef.current = controller

    setStatus('loading')
    setExplanation('')

    async function fetchExplanation() {
      try {
        const res = await fetch('/api/explain', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            zip,
            label,
            archetype,
            age_group: ageGroup,
            priorities,
            scores,
            budget_fit: budgetFit,
          }),
        })

        if (!res.ok) {
          setStatus('error')
          return
        }

        const data = await res.json()
        setExplanation(data.explanation)
        setStatus('ready')
      } catch (err) {
        if (err.name === 'AbortError') return // intentional cancel, ignore
        setStatus('error')
      }
    }

    fetchExplanation()

    return () => {
      controller.abort()
    }
  }, [zip, ageGroup, JSON.stringify(priorities), JSON.stringify(scores), budgetFit])

  return (
    <div className="ai-explanation">
      <h3 className="ai-explanation-title">Why this score?</h3>
      {status === 'loading' && (
        <p className="ai-loading">Generating explanation…</p>
      )}
      {status === 'ready' && (
        <p className="ai-text">{explanation}</p>
      )}
      {status === 'error' && (
        <p className="ai-error">Explanation unavailable — please try again.</p>
      )}
    </div>
  )
}
