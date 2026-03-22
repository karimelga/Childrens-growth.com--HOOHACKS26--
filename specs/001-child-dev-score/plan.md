# Implementation Plan: Child Development Score

**Branch**: `001-child-dev-score` | **Date**: 2026-03-22 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-child-dev-score/spec.md`

## Summary

Build a single-page web application that scores five Fairfax County neighborhoods (0–100) for
child-rearing suitability. Parents enter a budget range, child age group, and four priority
sliders (Education, Social Development, Safety, Infrastructure). A weighted scoring algorithm
— defined exactly in `child_development_score_spec.md` — combines static neighborhood data
with the parent's preferences and an age-group modifier to produce personalized scores. A
Claude-powered AI explanation is generated for each selected neighborhood via a lightweight
server-side proxy that keeps the API key out of the browser.

## Technical Context

**Language/Version**: JavaScript (ES2022) — Node.js 20 LTS for the server; modern browser JS
for the frontend scoring module
**Primary Dependencies**: React 18 (Vite) for the UI; Express 4 for the AI proxy server;
Anthropic JS SDK for the Claude call; Leaflet.js or a lightweight map library for the
neighborhood map
**Storage**: N/A — all data is read from `data/mock_data.json` at startup; no database or
persistent storage
**Testing**: Vitest (unit tests for scoring algorithm); manual browser testing for UI flows
**Target Platform**: Modern desktop and mobile browsers (Chrome, Firefox, Safari, Edge); no
IE support required
**Project Type**: Web application (React SPA + minimal Node/Express AI proxy)
**Performance Goals**: Scores update on slider change within 100ms (client-side math); AI
explanation returns within 10 seconds under normal network conditions
**Constraints**: API key MUST be server-side only; scoring logic MUST be independently
importable and testable without the UI; no live data pipeline
**Scale/Scope**: Single-session, no auth, five fixed neighborhoods, hackathon demo scale

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate | Status |
|-----------|------|--------|
| I. Algorithmic Integrity | Scoring MUST follow spec algorithm exactly (pillar avg → slider normalize → age modifier → re-normalize → final score). No hardcoded shortcuts. Zero-slider guard required. | ✅ PASS — scoring module will be spec-faithful and independently testable |
| II. Security & Secrets Management | `ANTHROPIC_API_KEY` MUST be server-side only, read from `.env`, never committed. `.env.example` committed instead. | ✅ PASS — Express proxy architecture enforces this; `.env` in `.gitignore` |
| III. User-Centered Simplicity | Only spec-defined features. No scope additions. YAGNI. | ✅ PASS — plan matches spec exactly; no extra features introduced |
| IV. Transparent Scoring | Every selected neighborhood MUST show all four pillar scores + composite + AI explanation. | ✅ PASS — UI design includes pillar breakdown panel alongside the composite score |
| V. Budget Context, Not Bias | Budget MUST NOT enter score math; affordability is display-only flag. | ✅ PASS — budget filter runs client-side after scores are computed, touches only visual state |

**Post-Phase-1 re-check**: No violations introduced by design phase. Architecture upholds all
five principles.

## Project Structure

### Documentation (this feature)

```text
specs/001-child-dev-score/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── ai-explanation-api.md   # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
data/
└── mock_data.json          # Static neighborhood data (read-only)

src/
├── scoring.js              # Pure scoring algorithm — no UI dependencies
└── components/
    ├── App.jsx             # Root component: wires inputs → scoring → map → detail
    ├── InputPanel.jsx      # Budget range, age group, four priority sliders
    ├── NeighborhoodMap.jsx # Interactive map; affordable/over-budget visual state
    ├── ScoreCard.jsx       # Composite score + four pillar scores for selected ZIP
    └── AIExplanation.jsx   # Explanation panel; handles loading/error states

server/
└── index.js                # Express server: serves static build + /api/explain proxy

.env.example                # ANTHROPIC_API_KEY=your_key_here (committed)
.env                        # Real key — in .gitignore, never committed
.gitignore
package.json
vite.config.js
```

**Structure Decision**: Web application layout with a shared `src/` for the React SPA and a
`server/` for the Express AI proxy. The scoring module (`src/scoring.js`) is a plain JS module
with no React imports, making it independently testable with Vitest. The server proxies only
the `/api/explain` call; all scoring runs client-side.
