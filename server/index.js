import 'dotenv/config'
import express from 'express'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import Anthropic from '@anthropic-ai/sdk'

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3001

app.use(express.json())

// Serve production build
if (process.env.NODE_ENV === 'production') {
  const distPath = join(__dirname, '..', 'dist')
  app.use(express.static(distPath))
}

// POST /api/explain — AI explanation proxy
app.post('/api/explain', async (req, res) => {
  const { zip, label, archetype, age_group, priorities, scores, budget_fit } = req.body

  // Validate required fields
  const required = ['zip', 'label', 'archetype', 'age_group', 'priorities', 'scores', 'budget_fit']
  for (const field of required) {
    if (req.body[field] === undefined || req.body[field] === null) {
      return res.status(400).json({ error: `Missing required field: ${field}` })
    }
  }

  const prompt = `You are analyzing a neighborhood score for a parent using the Child Development Score app.

ZIP Code: ${label} (${zip}) — ${archetype}
Child Age Group: ${age_group}
User Priorities (0-100): Education=${priorities.education}, Social=${priorities.social_development}, Safety=${priorities.safety}, Infrastructure=${priorities.infrastructure}

Calculated Scores:
- Education: ${scores.education}/100
- Social Development: ${scores.social_development}/100
- Safety: ${scores.safety}/100
- Infrastructure: ${scores.infrastructure}/100
- FINAL Child Development Score: ${scores.final}/100

Budget fit: ${budget_fit}

In 3-4 sentences, explain why this neighborhood scored the way it did for THIS specific family's priorities and child's age. Highlight the biggest trade-off they should be aware of. Be warm but honest. Do not use bullet points.`

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    })
    const explanation = message.content[0].text
    return res.json({ explanation })
  } catch (err) {
    console.error('Anthropic SDK error:', err.message)
    return res.status(502).json({
      error: 'AI explanation service unavailable. Please try again.',
    })
  }
})

// Catch-all for SPA in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(join(__dirname, '..', 'dist', 'index.html'))
  })
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
