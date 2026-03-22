# Child Development Score

**How great is the given environment for your child?**

A web application that calculates a personalized Child Development Score (0–100) for five
Fairfax County neighborhoods. Parents input their budget, child's age group, and priority
weights across Education, Social Development, Safety, and Infrastructure — and the app
produces a weighted, AI-explained score for each neighborhood.

## Requirements

- **Node.js 20 LTS** or later
- An **Anthropic API key** (for the AI explanation feature)

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env and set: ANTHROPIC_API_KEY=sk-ant-xxxxxxxx

# 3. Start development server
npm run dev
# Open http://localhost:5173
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server + Express AI proxy (concurrently) |
| `npm run build` | Build production bundle |
| `npm start` | Serve production build via Express |
| `npm test` | Run scoring algorithm unit tests |

## Validation

See [`specs/001-child-dev-score/quickstart.md`](specs/001-child-dev-score/quickstart.md)
for five user-flow validation scripts to confirm the app works correctly after setup.

## Project Layout

```
data/mock_data.json        Static neighborhood data (read-only)
src/scoring.js             Pure scoring algorithm — independently testable
src/components/            React components
server/index.js            Express AI proxy (POST /api/explain)
.env.example               Template — copy to .env and add your API key
```

## Neighborhoods

Five Fairfax County ZIP codes: McLean (22101), Reston (20190), Annandale (22003),
Burke (22015), Fairfax City (22030).

## Security

The Anthropic API key is never exposed to the browser. It lives in `.env` (gitignored)
and is read server-side only by `server/index.js`.
