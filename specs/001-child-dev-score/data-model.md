# Data Model: Child Development Score

**Branch**: `001-child-dev-score` | **Date**: 2026-03-22

All data is static (read from `data/mock_data.json` at build time) or session-scoped
(parent inputs). No database or persistent storage is used.

---

## Entities

### Neighborhood

Represents one of five fixed Fairfax County ZIP codes.

| Field | Type | Constraints | Source |
|-------|------|-------------|--------|
| `zip` | string | One of: `22101`, `20190`, `22003`, `22015`, `22030` | mock_data.json key |
| `label` | string | e.g., "McLean", "Reston" | mock_data.json |
| `archetype` | string | e.g., "The Expensive Suburb" | mock_data.json |
| `average_home_price` | number | > 0, USD | mock_data.json |
| `average_rent` | number | > 0, USD/month | mock_data.json |
| `pillars` | PillarSet | See below | mock_data.json |

**Relationships**: One Neighborhood has one PillarSet (four Pillars).

---

### PillarSet

A container for the four child-development pillars belonging to one Neighborhood.

| Field | Type | Description |
|-------|------|-------------|
| `education` | Pillar | Education pillar data |
| `social_development` | Pillar | Social Development pillar data |
| `safety` | Pillar | Safety pillar data |
| `infrastructure` | Pillar | Infrastructure pillar data |

---

### Pillar

One of the four child-development dimensions. All sub-metric values are pre-inverted in
`mock_data.json` so that higher always means better.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `pillar_score` | number | 0–100 | Pre-computed average of sub-metrics |
| `sub_metrics` | object | key→number (0–100 each) | Individual sub-metric scores |
| `notes` | string | Optional | Human-readable context (display only) |

**Sub-metrics by pillar**:

- **Education**: `school_quality_rating`, `special_needs_accessibility`, `peer_academic_culture`
- **Social Development**: `community_cohesion`, `bullying_rate` (inverted), `mental_health_index`,
  `political_diversity`
- **Safety**: `crime_trend_score`, `sex_offender_density` (inverted), `neighborhood_stability`,
  `noise_disorder_level` (inverted)
- **Infrastructure**: `hospital_proximity`, `library_access`, `parks_green_space`,
  `daycare_density`, `tutoring_availability`, `walkability`

---

### UserInput

Session-scoped. Not persisted. Represents one parent's current set of preferences.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `budget_min` | number | ≥ 0, ≤ budget_max | Minimum budget (informational only) |
| `budget_max` | number | > 0 | Maximum budget; drives affordability flag |
| `age_group` | enum | `"newborn"` \| `"toddler"` \| `"child"` | Child's age group |
| `education_priority` | number | 0–100 | Raw slider value |
| `social_priority` | number | 0–100 | Raw slider value |
| `safety_priority` | number | 0–100 | Raw slider value |
| `infra_priority` | number | 0–100 | Raw slider value |

**Validation rules**:
- If all four priority values are 0, treat as equal weights (0.25 each) before normalization.
- `budget_max` must be > 0; default to a high value (e.g., 2,000,000) if not set.

---

### ChildDevelopmentScore

Computed output for one Neighborhood given one UserInput. Ephemeral — recomputed on every
input change.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `zip` | string | FK → Neighborhood | Which neighborhood this score is for |
| `education_score` | number | 0–100 | Pillar score (from data) |
| `social_score` | number | 0–100 | Pillar score (from data) |
| `safety_score` | number | 0–100 | Pillar score (from data) |
| `infra_score` | number | 0–100 | Pillar score (from data) |
| `final_score` | number | 0–100 | Weighted composite; see algorithm |
| `affordable` | boolean | — | `true` if avg_home_price ≤ budget_max |

**Score computation** (implemented in `src/scoring.js`):

```
Step 1 — Pillar scores (read directly from mock_data.json pillar_score fields)

Step 2 — Normalize sliders
  total = edu + social + safety + infra priorities
  if total == 0: w_edu = w_soc = w_safe = w_infra = 0.25
  else: w_i = priority_i / total

Step 3 — Apply age-group modifier (additive deltas, then re-normalize)
  Newborn:  safety += 0.10, infra += 0.10
  Toddler:  all four += 0.05
  Child:    education += 0.15, safety += 0.05
  Re-normalize so sum == 1.0

Step 4 — Final score
  final = w_edu*edu_score + w_soc*social_score + w_safe*safety_score + w_infra*infra_score

Step 5 — Budget flag (separate, non-scoring)
  affordable = (neighborhood.average_home_price <= user_input.budget_max)
```

---

### AIExplanation

Generated on demand when a parent selects a neighborhood. Not cached.

| Field | Type | Description |
|-------|------|-------------|
| `zip` | string | Which neighborhood |
| `text` | string | 3–4 sentence plain-language explanation |
| `status` | enum | `"loading"` \| `"ready"` \| `"error"` | UI rendering state |

**Generation inputs** (all passed to the server-side prompt):
- ZIP label and archetype
- Child age group
- Education, Social, Safety, Infrastructure priorities (0–100)
- All four pillar scores and the final score
- Budget fit: `"affordable"` or `"over budget"`

---

## State Transitions

```
UserInput changes
  → recompute ChildDevelopmentScore for all 5 ZIPs (synchronous, < 1ms)
  → recompute affordability flags (synchronous)
  → update map visual state

Parent selects a neighborhood
  → show ScoreCard (immediate, from computed ChildDevelopmentScore)
  → trigger AIExplanation request (async, status: loading → ready | error)
```
