---

description: "Task list for Child Development Score web application"
---

# Tasks: Child Development Score

**Input**: Design documents from `/specs/001-child-dev-score/`
**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | contracts/ ✅ | quickstart.md ✅

**Tests**: Not requested in spec — no test tasks included.

**Organization**: Tasks grouped by user story for independent implementation and validation.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story this task belongs to (US1, US2, US3)

## Path Conventions

- Web app: `src/` for React components, `server/` for Express proxy, `data/` for static data

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and base structure

- [x] T001 Initialize Node.js project with `package.json` at repo root (name: `hoohacks26`, type: `module`)
- [x] T00X [P] Install frontend dependencies: `react`, `react-dom`, `react-leaflet`, `leaflet`, `vite`, `@vitejs/plugin-react`
- [x] T00X [P] Install backend dependencies: `express`, `@anthropic-ai/sdk`, `dotenv`, `concurrently`
- [x] T00X [P] Install dev dependencies: `vitest` for scoring unit tests
- [x] T00X Create `vite.config.js` at repo root — configure React plugin and proxy `/api` to `localhost:3001` in dev mode
- [x] T00X [P] Create `.gitignore` at repo root — include `.env`, `node_modules/`, `dist/`
- [x] T00X [P] Create `.env.example` at repo root with content: `ANTHROPIC_API_KEY=your_key_here`
- [x] T00X Create `src/` directory structure: `src/components/` for React components
- [x] T00X Create `server/` directory for Express proxy
- [x] T0XX [P] Add npm scripts to `package.json`: `dev` (concurrently runs Vite + Express), `build` (vite build), `start` (node server/index.js), `test` (vitest)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T0XX Create `src/scoring.js` — implement the complete scoring algorithm as a pure module with no React imports:
  - Export `computeScores(neighborhoodData, userInput)` returning an array of `ChildDevelopmentScore` objects
  - Implement Step 1: read `pillar_score` directly from data (already pre-inverted)
  - Implement Step 2: normalize sliders; guard against all-zero (assign 0.25 each)
  - Implement Step 3: apply age-group modifier deltas (Newborn: safety+0.10, infra+0.10; Toddler: all+0.05; Child: edu+0.15, safety+0.05) then re-normalize
  - Implement Step 4: compute `final_score = sum(weight_i * pillar_score_i)`
  - Implement Step 5: compute `affordable = (avg_home_price <= budget_max)` as a separate non-scoring flag
  - Export `AGE_GROUPS` constant and `DEFAULT_WEIGHTS` constant
- [x] T0XX Manually verify `src/scoring.js` against two known inputs from `data/mock_data.json`:
  - Case A: budget_max=700000, age_group="child", edu=90, social=50, safety=80, infra=40 — confirm McLean final_score ≈ 87, Burke ≈ 85
  - Case B: all sliders=0 — confirm all five ZIPs return equal-weight result with no error
- [x] T0XX Create `server/index.js` — Express server on port 3001:
  - Load `dotenv` and read `ANTHROPIC_API_KEY` from `process.env`
  - Serve Vite-built static files from `dist/` when `NODE_ENV=production`
  - Register `POST /api/explain` route (handler implemented in T015)
  - Start listening and log port on startup
- [x] T0XX [P] Create `src/App.jsx` — root React component shell:
  - Declare state for `userInput` (budget_min, budget_max, age_group, four sliders)
  - Declare state for `scores` (array of ChildDevelopmentScore, initially empty)
  - Declare state for `selectedZip` (initially null)
  - Import and call `computeScores` from `src/scoring.js` whenever `userInput` changes
  - Render placeholder `<div>` sections for InputPanel, NeighborhoodMap, ScoreCard, AIExplanation
- [x] T0XX Implement `POST /api/explain` handler in `server/index.js`:
  - Validate required fields: `zip`, `label`, `archetype`, `age_group`, `priorities`, `scores`, `budget_fit`
  - Return 400 with `{ error: "Missing required field: <field>" }` if any field missing
  - Build Claude prompt using the template from `contracts/ai-explanation-api.md`
  - Call Anthropic SDK with model `claude-haiku-4-5-20251001`, max_tokens 300
  - Return 200 `{ explanation: <text> }` on success
  - Return 502 `{ error: "AI explanation service unavailable. Please try again." }` on any SDK exception

**Checkpoint**: Foundation ready — scoring module verified, Express server handles `/api/explain`, App shell renders. User story work can now begin.

---

## Phase 3: User Story 1 — Personalized Neighborhood Scoring (Priority: P1) 🎯 MVP

**Goal**: Parent fills in inputs and sees a personalized Child Development Score (0–100) for
all five neighborhoods simultaneously.

**Independent Test**: Open app → set budget $500k–$700k, age group "Child", sliders edu=90/social=50/safety=80/infra=40 → verify five scores appear between 0–100 → change Education slider to 20 → verify scores change.

### Implementation for User Story 1

- [x] T0XX [US1] Create `src/components/InputPanel.jsx`:
  - Budget range: two number inputs (`budget_min`, `budget_max`) with labels "Min Budget ($)" and "Max Budget ($)"
  - Age group: radio buttons or dropdown for Newborn / Toddler / Child
  - Four sliders (range 0–100, step 1) labeled Education, Social Development, Safety, Infrastructure — each showing current numeric value beside the slider
  - All inputs call an `onChange` prop with the updated field name and value
  - Default state: budget_min=300000, budget_max=700000, age_group="toddler", all sliders=50
- [x] T0XX [P] [US1] Create `src/components/NeighborhoodMap.jsx`:
  - Import `MapContainer`, `TileLayer`, `Marker`, `Popup` from `react-leaflet`
  - Render a Leaflet map centered on Fairfax County (lat 38.85, lng -77.30, zoom 11)
  - Accept `scores` prop (array of ChildDevelopmentScore) and `onSelect` callback prop
  - For each of the five neighborhoods, place a `Marker` at its coordinates (hardcode the five lat/lng pairs)
  - Marker popup shows: neighborhood label, final score, and "View Details" button that calls `onSelect(zip)`
  - Neighborhoods with `affordable: false` render with a grey icon; affordable ones render with a colored icon
  - Neighborhood coordinates: McLean (38.9339, -77.1773), Reston (38.9587, -77.3570), Annandale (38.8304, -77.1974), Burke (38.7868, -77.2711), Fairfax City (38.8462, -77.3064)
- [x] T0XX [US1] Wire `InputPanel` and `NeighborhoodMap` into `src/App.jsx`:
  - Replace placeholder divs with `<InputPanel>` and `<NeighborhoodMap>`
  - Pass `userInput` state to InputPanel; handle `onChange` to update state
  - Pass computed `scores` to NeighborhoodMap; handle `onSelect` to set `selectedZip`
  - Confirm in browser: changing any slider immediately updates all five map markers

**Checkpoint**: User Story 1 is independently functional — all five scored neighborhoods appear on the map and update live on input change.

---

## Phase 4: User Story 2 — Budget-Filtered Map View (Priority: P2)

**Goal**: Neighborhoods the parent cannot afford are greyed out and non-interactive on the map; warning banners appear for over-budget selections and for the all-over-budget edge case.

**Independent Test**: Set max budget $500k → verify McLean, Burke, Reston grey out → set max budget $100k → verify all five grey out AND global warning banner appears → raise budget to $700k → verify Burke and Reston become interactive.

### Implementation for User Story 2

- [x] T0XX [US2] Update `src/components/NeighborhoodMap.jsx` to handle affordability visual state:
  - Import Leaflet's `divIcon` or use separate icon instances for affordable (blue) vs. over-budget (grey)
  - Markers with `affordable: false` MUST NOT call `onSelect` — either disable the click handler or show a warning popup instead of the detail popup
  - Over-budget marker popup text: "Average home prices in this area exceed your budget. Results are shown for reference only."
- [x] T0XX [US2] Add global warning banner to `src/App.jsx`:
  - Compute `allOverBudget = scores.every(s => !s.affordable)` after each score recomputation
  - If `allOverBudget` is true, render a banner above the map: "⚠️ Your budget may be below the typical range for Fairfax County. All neighborhoods are shown for reference."
  - Banner MUST disappear when the budget is raised so at least one neighborhood is affordable
- [x] T0XX [US2] Add per-selection warning to `src/components/ScoreCard.jsx` (created in Phase 5):
  - If the selected neighborhood has `affordable: false`, render a warning banner at the top of the ScoreCard: "⚠️ Average home prices in this area exceed your budget. Results are shown for reference only."
  - This banner is in addition to the greyed-out map state

**Checkpoint**: User Stories 1 AND 2 work independently — scoring updates live, budget filter greys out unaffordable ZIPs, banners appear correctly.

---

## Phase 5: User Story 3 — AI-Generated Neighborhood Explanation (Priority: P3)

**Goal**: Selecting a neighborhood shows all four pillar scores + composite score, then an AI-generated 3–4 sentence explanation personalized to the parent's inputs; graceful error state if AI is unavailable.

**Independent Test**: Select Reston (20190) with any valid inputs → ScoreCard shows four pillar scores + final score → AI explanation appears within 10 seconds → explanation references age group and at least one trade-off → disconnect network → select another neighborhood → scores still show + friendly error message appears instead of explanation.

### Implementation for User Story 3

- [x] T0XX [P] [US3] Create `src/components/ScoreCard.jsx`:
  - Accept props: `neighborhood` (label, archetype, zip), `score` (ChildDevelopmentScore object)
  - Display neighborhood name and archetype as heading
  - Display final composite score prominently (large number)
  - Display all four pillar scores in a grid: Education, Social Development, Safety, Infrastructure — each as label + score/100
  - Render `<AIExplanation>` component below the scores (implemented in T023)
  - If `score.affordable === false`, render the per-selection warning banner (from T021)
- [x] T0XX [P] [US3] Create `src/components/AIExplanation.jsx`:
  - Accept props: `zip`, `label`, `archetype`, `ageGroup`, `priorities`, `scores`, `budgetFit`
  - On mount (and when any prop changes), call `POST /api/explain` with a JSON body matching the contract in `contracts/ai-explanation-api.md`
  - Render a loading indicator ("Generating explanation…") while the request is in flight
  - On success: render the explanation text as a paragraph
  - On error (network failure, 502, 500): render "Explanation unavailable — please try again." without crashing the component
- [x] T0XX [US3] Wire `ScoreCard` into `src/App.jsx`:
  - When `selectedZip` is set, find the matching neighborhood data and score from state
  - Render `<ScoreCard>` with the matched neighborhood and score
  - Pass all UserInput fields needed for the AI explanation (age_group, priorities, budget_fit)
  - Render ScoreCard in a panel beside or below the map

**Checkpoint**: All three user stories fully functional and independently testable.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Hardening, UX finishing, and validation against quickstart test flows

- [x] T0XX [P] Add basic CSS / styling to `src/App.jsx` and components:
  - Layout: two-column (InputPanel left, map + ScoreCard right) on desktop; single column on mobile
  - Slider labels display current value next to each slider
  - Score display uses color coding: ≥80 green, 60–79 yellow, <60 red (final score only)
  - Warning banners styled distinctly (amber background, warning icon)
- [x] T0XX Run all five quickstart validation flows from `specs/001-child-dev-score/quickstart.md` and confirm each passes:
  - Flow 1: Scoring works
  - Flow 2: Budget filter works
  - Flow 3: All-zero slider guard
  - Flow 4: AI explanation
  - Flow 5: All neighborhoods over budget
- [x] T0XX [P] Verify Constitution compliance:
  - Principle I: Confirm `src/scoring.js` matches spec algorithm exactly — no shortcuts
  - Principle II: Confirm `.env` is in `.gitignore`; confirm no API key appears in `src/` files
  - Principle III: Confirm no features exist beyond the spec (no extra tabs, pages, or inputs)
  - Principle IV: Confirm all four pillar scores are visible alongside the composite in ScoreCard
  - Principle V: Confirm budget value is NOT passed to `computeScores` — only used post-computation for the `affordable` flag
- [x] T0XX Update `README.md` with: project description, chosen runtime (Node.js 20), setup steps (clone → `npm install` → copy `.env.example` → `npm run dev`), and link to `specs/001-child-dev-score/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational — can start once T011–T015 are done
- **User Story 2 (Phase 4)**: Depends on Foundational — can start in parallel with US1
- **User Story 3 (Phase 5)**: Depends on Foundational — can start in parallel with US1/US2; ScoreCard (T022) can begin once T014 (App shell) is done
- **Polish (Phase 6)**: Depends on all three user stories complete

### User Story Dependencies

- **US1**: No dependency on US2 or US3 — fully independent
- **US2**: Adds affordability UI to components created in US1 — can be developed in parallel but shares `App.jsx` and `NeighborhoodMap.jsx`; coordinate on file edits
- **US3**: Adds ScoreCard + AIExplanation — no dependency on US2; shares `App.jsx`

### Within Each User Story

- Models/services before components
- Components before wiring into App.jsx
- Wiring before checkpoint validation

### Parallel Opportunities

- T002, T003, T004, T006, T007, T010 can all run in parallel (Phase 1)
- T014 and T015 can run in parallel once T013 is done (Phase 2)
- T017 and T022, T023 can run in parallel (different files)
- T025 and T026 can run in parallel (Phase 6)

---

## Parallel Example: Foundational Phase

```bash
# After T011 (scoring.js) and T013 (server shell) are complete, launch in parallel:
Task: "Create App.jsx shell in src/App.jsx"           # T014
Task: "Implement /api/explain handler in server/index.js"  # T015
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (T011–T015) — CRITICAL GATE
3. Complete Phase 3: User Story 1 (T016–T018)
4. **STOP and VALIDATE**: Open browser, run Flow 1 from quickstart.md
5. Demo-ready MVP: five scored neighborhoods on a map

### Incremental Delivery

1. Setup + Foundational → scoring verified, server running
2. Add User Story 1 → live-updating scored map → **Demo checkpoint**
3. Add User Story 2 → budget filter + warning banners → **Demo checkpoint**
4. Add User Story 3 → AI explanation per neighborhood → **Full feature complete**
5. Polish → styling, quickstart validation, README

### Parallel Team Strategy (if 2+ developers)

1. Both complete Phase 1 + Phase 2 together
2. Split:
   - Developer A: User Story 1 (InputPanel + Map wiring)
   - Developer B: User Story 3 (ScoreCard + AIExplanation — can start T022/T023 as soon as App shell exists)
3. Developer A adds User Story 2 (budget filter) after US1 checkpoint
4. Merge and validate all three stories together in Phase 6

---

## Notes

- `[P]` = different files, no incomplete-task dependencies — safe to run in parallel
- `[Story]` label maps each task to its user story for traceability
- Each user story phase ends with a **Checkpoint** — validate before moving to next
- `src/scoring.js` MUST stay a pure module (no React imports) — enforced by Constitution Principle I
- Never commit `.env` — enforced by Constitution Principle II
- Budget value MUST NOT enter `computeScores()` — enforced by Constitution Principle V
