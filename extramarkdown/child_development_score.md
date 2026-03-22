# Child Development Score — Refined Product Specification
## Fairfax County Edition | Hackathon v1.1

---

## 1. Overview

Child Development Score is a web application that calculates a **Child Development Score (0–100)** for five Fairfax County neighborhoods. Users input their budget, child's age group, and how much they personally value each of four core pillars. The app combines static neighborhood data with the user's priorities to produce a personalized, AI-explained score.

---

## 2. Revised Core Pillars & Subcategories

> **Change from v1.0:** Social Development's redundant subcategories ("community alignment" and "community values") have been merged. Two inverted metrics are noted — a lower real-world value produces a higher score for those.

### 2.1 Education
| Subcategory | Description |
|---|---|
| `school_quality_rating` | FCPS school rating composite (GreatSchools + state assessments) |
| `special_needs_accessibility` | Quality of IEP/504 programs, ESL support, disability accommodations |
| `peer_academic_culture` | Graduation rates, AP enrollment, college-going culture |

### 2.2 Social Development
| Subcategory | Description |
|---|---|
| `community_cohesion` | HOA activity, civic events, neighborhood identity (merges prior overlap) |
| `bullying_rate` | *(Inverted)* Reported school bullying incidents — lower = higher score |
| `mental_health_index` | Youth mental health indicators; inversely related to academic pressure |
| `political_diversity` | Ideological mix — relevant for raising children with broad worldviews |

### 2.3 Safety
| Subcategory | Description |
|---|---|
| `crime_trend_score` | FCPD crime data, trending direction (improving = higher score) |
| `sex_offender_density` | *(Inverted)* Registered offender proximity — lower density = higher score |
| `neighborhood_stability` | Homeownership rates, long-term residency, low turnover |
| `noise_disorder_level` | *(Inverted)* General chaos, noise complaints, public disorder |

### 2.4 Infrastructure
| Subcategory | Description |
|---|---|
| `hospital_proximity` | Drive time to nearest hospital/urgent care |
| `library_access` | Branch availability, hours, children's programming |
| `parks_green_space` | Acreage, trail access, playground quality |
| `daycare_density` | Licensed daycare facilities per capita |
| `tutoring_availability` | After-school programs, learning centers, enrichment |
| `walkability` | Walk Score — relevant for car-free/low-car families |

---

## 3. The Five ZIP Codes (Fairfax County)

| ZIP | Label | Archetype | Avg. Home Price | Character |
|---|---|---|---|---|
| 22101 | McLean | The Expensive Suburb | $1,650,000 | Top schools, top safety, low walkability, high pressure |
| 20190 | Reston | The Urban Center | $620,000 | Best infrastructure, walkable, diverse, moderate safety |
| 22003 | Annandale | The Diverse Community | $520,000 | Highest social dev, most culturally rich, moderate schools |
| 22015 | Burke | The Quiet Suburb | $680,000 | Safest area, excellent schools, car-dependent, low infra |
| 22030 | Fairfax City | The Balanced Hub | $595,000 | Well-rounded across all pillars, no extreme highs or lows |

> All data sourced from FCPS school ratings, FCPD crime statistics, Walk Score, and US Census profiles. See `data/mock_data.json` for full sub-metric breakdown. Make sure you get the file "mock_data.json" file from "data" directory.

---

## 4. Input Model (Phase 1)

```json
{
  "location": "22101",
  "budget": {
    "min": 400000,
    "max": 800000
  },
  "priorities": {
    "education": 80,
    "social_development": 50,
    "safety": 90,
    "infrastructure": 40
  },
  "children": {
    "count": 1,
    "age_groups": ["newborn"]
  }
}
```

**Priority sliders:** Each pillar is rated 0–100 by the user, expressing relative importance. These do NOT need to sum to 100 — they are raw preference signals that the algorithm normalizes.

---

## 5. Scoring Algorithm (Phase 3)

### Step 1 — Compute Pillar Scores from Sub-metrics
Average the sub-metric values for each pillar. Inverted metrics should already be expressed as "higher = better" in `mock_data.json` (pre-inverted).

```
education_score    = avg(school_quality, special_needs_access, peer_culture)
social_score       = avg(community_cohesion, bullying_rate, mental_health, political_diversity)
safety_score       = avg(crime_trend, sex_offender_density, stability, noise_disorder)
infra_score        = avg(hospital_proximity, library, parks, daycare, tutoring, walkability)
```

### Step 2 — Normalize User Priority Sliders
Convert the raw 0–100 slider values to weights that sum to 1.

```
total = edu_priority + social_priority + safety_priority + infra_priority
w_edu   = edu_priority / total
w_soc   = social_priority / total
w_safe  = safety_priority / total
w_infra = infra_priority / total
```

### Step 3 — Apply Age Group Modifier
The user's age group selection nudges the weights, regardless of their slider input. These are additive deltas applied before re-normalization.

| Age Group | Education | Social Dev | Safety | Infrastructure |
|---|---|---|---|---|
| Newborn | 0 | 0 | +0.10 | +0.10 |
| Toddler | +0.05 | +0.05 | +0.05 | +0.05 |
| Child | +0.15 | 0 | +0.05 | 0 |

After adding deltas, **re-normalize** so all four weights still sum to 1.

> **Why this approach?** The user's slider is the primary signal. The age modifier is a light nudge — it prevents a parent of a newborn from accidentally under-weighting hospital access because they forgot to adjust the slider.

### Step 4 — Calculate Final Score

```
child_development_score = (w_edu * education_score)
           + (w_soc * social_score)
           + (w_safe * safety_score)
           + (w_infra * infra_score)
```

Final score is already on a 0–100 scale. No further transformation needed.

### Step 5 — Budget Filter & Flag (non-scoring)
Compare `budget.max` against `average_home_price` for **all 5 ZIP codes** before rendering the map. Any ZIP where `average_home_price > budget.max` is marked `affordable: false`. This happens client-side, before map render, and does not affect scoring math in any way.

**UI behavior:**
- ZIP codes marked `affordable: false` are **greyed out and non-clickable** on the map.
- If the user somehow selects an over-budget ZIP (e.g. they lower their budget after selecting), display a warning banner: *"⚠️ Average home prices in this area exceed your budget. Results are shown for reference only."*
- If **all 5 ZIP codes** are over budget, display all of them as normal but show a global warning: *"⚠️ Your budget may be below the typical range for Fairfax County. All neighborhoods are shown for reference."*

---

## 6. Algorithm Verdict

**The algorithm is sound for a hackathon. Here is the honest assessment:**

### ✅ What works well
- Dynamic weighting combining sliders + age modifier is clever and personalized
- Re-normalizing weights after the age modifier prevents broken math
- Keeping budget as a flag (not a score modifier) is the right call — affordability is context, not a quality metric
- Sub-metric averaging is simple, transparent, and debuggable under time pressure

### ⚠️ One thing to fix (important)
The algorithm currently treats all sub-metrics within a pillar as equally important. This is fine for now, but if you have time, consider weighting `school_quality_rating` more heavily within Education, or `crime_trend_score` more heavily within Safety — the current averages can produce misleading pillar scores.

### ⚠️ One edge case to handle
If a user sets ALL sliders to 0, the normalization step divides by zero. Add a guard:
```
if total == 0: assign equal weights (0.25 each) before applying age modifier
```

### ❌ What would be needed for a real product (not needed for hackathon)
- Confidence intervals on sub-metrics (data freshness varies)
- A regression or ML model trained on actual child outcome data
- Live data pipeline instead of mock JSON

**Bottom line: ship it as-is. The formula is logical, the weights are defensible, and the AI explanation in Phase 4 will carry a lot of the interpretive weight.**

---

## 7. AI Explanation Prompt (Phase 4)

Pass this structure to Claude:

```
You are analyzing a neighborhood score for a parent using the Child Development Score app.

ZIP Code: {zip} ({label})
Child Age Group: {age_group}
User Priorities (0-100): Education={edu}, Social={soc}, Safety={safe}, Infrastructure={infra}

Calculated Scores:
- Education: {edu_score}/100
- Social Development: {soc_score}/100
- Safety: {safe_score}/100
- Infrastructure: {infra_score}/100
- FINAL Child Development Score: {final_score}/100

Budget fit: {affordable | over budget}

In 3-4 sentences, explain why this neighborhood scored the way it did for THIS specific family's priorities and child's age. Highlight the biggest trade-off they should be aware of. Be warm but honest. Do not use bullet points.
```

---

## 8. API Key & Environment Variables

The Anthropic API key used for the AI explanation (Phase 4) must **never** be hardcoded in any source file.

**Required setup:**
- Store the key in a `.env` file at the project root: `ANTHROPIC_API_KEY=sk-ant-xxxxxxxx`
- Add `.env` to `.gitignore` — this file must never be committed to GitHub
- Commit a `.env.example` file instead, containing: `ANTHROPIC_API_KEY=your_key_here`
- All code must read the key via `process.env.ANTHROPIC_API_KEY` (JS) or `os.environ.get("ANTHROPIC_API_KEY")` (Python)

---

## 9. Files to Generate

| File | Purpose |
|---|---|
| `mock_data.json` | All neighborhood data (attached separately) |
| `scoring.js` / `scoring.py` | Algorithm logic (Steps 1–5 above) |
| `App.jsx` or `index.html` | Frontend: map, sliders, results |
| `.env` | `ANTHROPIC_API_KEY=...` — local only, never committed |
| `.env.example` | Template committed to repo so teammates know what's needed |
| `.gitignore` | Must include `.env` |
