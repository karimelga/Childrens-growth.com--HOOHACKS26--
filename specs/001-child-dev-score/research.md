# Research: Child Development Score

**Branch**: `001-child-dev-score` | **Date**: 2026-03-22

## Summary

All technical decisions are resolved. No external research was required — the product spec
(`child_development_score_spec.md`) is authoritative for the algorithm, and the data file
(`data/mock_data.json`) is already present and complete. Architecture decisions below reflect
the constraints of a hackathon MVP that must keep the API key server-side.

---

## Decision 1: Frontend Framework

- **Decision**: React 18 with Vite as the build tool
- **Rationale**: React's component model cleanly maps to the app's distinct UI zones (input
  panel, map, score card, explanation). Vite provides near-instant HMR for hackathon iteration
  speed. The spec references `App.jsx`, confirming React is the expected choice.
- **Alternatives considered**: Plain HTML/CSS/JS — simpler but makes reactive slider-to-score
  updates verbose and error-prone under time pressure.

## Decision 2: Server Architecture (AI Proxy)

- **Decision**: Minimal Express 4 server in `server/index.js` that serves the Vite-built
  static files and exposes a single `POST /api/explain` endpoint
- **Rationale**: The Anthropic API key cannot live in browser code (Constitution Principle II).
  A thin Express proxy is the simplest possible server-side layer — no framework overhead,
  no database, no auth. The server does nothing except forward the structured prompt to Claude
  and return the response.
- **Alternatives considered**:
  - Serverless functions (Vercel/Netlify) — viable but adds deployment complexity irrelevant
    for a local hackathon demo.
  - Python/Flask backend — workable but mixes languages unnecessarily when the frontend
    is already JS.

## Decision 3: Scoring Module Placement

- **Decision**: `src/scoring.js` — pure JavaScript module, no React imports, exported as
  named functions
- **Rationale**: Constitution Principle I requires the scoring algorithm to be independently
  importable and testable. A pure JS module with no UI coupling satisfies this and can be
  unit-tested with Vitest without mounting a React tree.
- **Alternatives considered**: Embedding scoring logic inside a React hook — quicker initially
  but breaks independent testability and violates Constitution Principle I.

## Decision 4: Map Library

- **Decision**: Leaflet.js with OpenStreetMap tiles via `react-leaflet`
- **Rationale**: Free, open-source, no API key required. Sufficient for pinning five fixed
  neighborhoods. Lightweight enough for a hackathon. The map's primary job is showing five
  markers with color-coded affordability state — Leaflet handles this trivially.
- **Alternatives considered**: Google Maps / Mapbox — both require API keys, adding secret
  management complexity for a non-core feature.

## Decision 5: Scoring Algorithm Fidelity (from spec)

All algorithm details are resolved directly from `child_development_score_spec.md`. Summary
of key rules implemented in `src/scoring.js`:

- **Pillar scores**: Average of pre-inverted sub-metric values from `mock_data.json`
  (all values already "higher = better")
- **Slider normalization**: `weight_i = slider_i / sum(all sliders)`
- **Zero-slider guard**: If `sum == 0`, assign `weight_i = 0.25` for all four pillars
- **Age-group modifier** (additive deltas before re-normalization):
  - Newborn: Safety +0.10, Infrastructure +0.10
  - Toddler: all four +0.05
  - Child: Education +0.15, Safety +0.05
- **Final score**: `sum(weight_i * pillar_score_i)` — already 0–100, no further transform
- **Budget filter**: `affordable = (avg_home_price <= budget_max)` — computed after scoring,
  never fed into score math

## Decision 6: Claude Model for AI Explanation

- **Decision**: Use `claude-haiku-4-5-20251001` (latest Haiku) for the explanation call
- **Rationale**: The explanation task (3–4 sentences of warm prose) is well within Haiku's
  capability. Haiku is faster and cheaper than Sonnet/Opus — important for hackathon demo
  latency. The exact model can be swapped via an env var if needed.
- **Alternatives considered**: Sonnet — higher quality but slower; overkill for this prompt.

## Decision 7: Data Loading Strategy

- **Decision**: Import `mock_data.json` directly as an ES module in `src/scoring.js`
- **Rationale**: Since data is static and known at build time, a direct import is the simplest
  approach — no fetch, no loading state, no error handling for data load failure. Vite handles
  JSON imports natively.
- **Alternatives considered**: `fetch()` at runtime — adds async complexity and a loading
  state for no benefit since the data never changes.

---

## Resolved Clarifications

No `[NEEDS CLARIFICATION]` markers existed in the spec. All decisions above were inferred
from the project spec, existing data file, and constitution constraints.
