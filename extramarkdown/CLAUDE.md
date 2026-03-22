# HooHacks26 Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-03-22

## Active Technologies

- JavaScript (ES2022) — Node.js 20 LTS for the server; modern browser JS + React 18 (Vite) for the UI; Express 4 for the AI proxy server; (001-child-dev-score)

## Project Structure

```text
data/mock_data.json        # Static neighborhood data (read-only)
src/scoring.js             # Pure scoring algorithm — no UI dependencies
src/components/            # React components (App, InputPanel, NeighborhoodMap, ScoreCard, AIExplanation)
server/index.js            # Express AI proxy — serves static build + POST /api/explain
.env.example               # Committed; real .env is gitignored
```

## Commands

npm run dev    # Start Vite dev server + Express proxy concurrently
npm test       # Run Vitest unit tests (scoring algorithm)
npm run build  # Production build
npm start      # Serve production build via Express

## Code Style

JavaScript ES2022. React functional components with hooks. No class components.
`src/scoring.js` MUST remain a pure module with no React imports — independently testable.

## Recent Changes

- 001-child-dev-score: Added JavaScript (ES2022) — Node.js 20 LTS for the server; modern browser JS + React 18 (Vite) for the UI; Express 4 for the AI proxy server;

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
