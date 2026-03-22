# Feature Specification: Child Development Score

**Feature Branch**: `001-child-dev-score`
**Created**: 2026-03-22
**Status**: Draft
**Input**: User description: "Child Development Score is a web application that calculates a Child Development Score (0–100) for five Fairfax County neighborhoods. Users input their budget, child's age group, and how much they personally value each of four core pillars. The app combines static neighborhood data with the user's priorities to produce a personalized, AI-explained score."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Personalized Neighborhood Scoring (Priority: P1)

A parent wants to find the best Fairfax County neighborhood to raise their child. They open the
app, set their budget range, select their child's age group, and use four sliders to express how
much they personally care about Education, Social Development, Safety, and Infrastructure. The app
calculates a Child Development Score (0–100) for each of the five neighborhoods and displays the
results so the parent can compare at a glance.

**Why this priority**: This is the core value proposition. Without a working, personalized score,
nothing else in the app delivers value.

**Independent Test**: Open the app with no prior state, fill in budget, age group, and all four
sliders, and verify that five neighborhood scores appear — each between 0 and 100 — and that
changing any slider visibly changes the scores.

**Acceptance Scenarios**:

1. **Given** a parent has opened the app, **When** they set a budget of $500k–$700k, select
   "Child" age group, and rate Education at 90, Social at 50, Safety at 80, Infrastructure at 40,
   **Then** all five neighborhoods display a numeric score between 0 and 100, and neighborhoods
   with stronger education and safety data score higher than those without.

2. **Given** all four sliders are set to 0, **When** the parent submits their inputs, **Then**
   the app assigns equal weight to all four pillars and returns a valid score for each
   neighborhood (no error, no blank result, no crash).

3. **Given** a parent changes the Education slider from 50 to 90, **When** the scores update,
   **Then** neighborhoods with stronger education metrics show a meaningfully higher score
   than before the change.

4. **Given** a parent selects "Newborn" as the age group, **When** scores are calculated,
   **Then** the system applies a safety and infrastructure nudge reflecting that hospital
   proximity and crime rate matter more for newborns, without overriding the parent's own
   slider intent.

---

### User Story 2 - Budget-Filtered Map View (Priority: P2)

A parent wants to see which neighborhoods they can realistically afford. After entering their
budget, neighborhoods whose average home price exceeds their maximum budget are visually
distinguished (greyed out, non-interactive) on the map. Affordable neighborhoods remain fully
selectable. If the parent adjusts their budget, the map updates accordingly.

**Why this priority**: Showing unaffordable neighborhoods as equally valid options misleads
parents. Budget filtering makes results actionable without distorting quality scores.

**Independent Test**: Set a maximum budget low enough that at least one ZIP code is over budget.
Verify that over-budget ZIPs appear greyed out, clicking them is blocked or shows a warning,
and their underlying scores are unchanged by the budget value.

**Acceptance Scenarios**:

1. **Given** the parent sets a maximum budget of $600k, **When** the map renders, **Then**
   neighborhoods with an average home price above $600k are visually greyed out and cannot
   be selected.

2. **Given** a greyed-out neighborhood, **When** the parent attempts to interact with it,
   **Then** the app either prevents selection or displays: "Average home prices in this area
   exceed your budget. Results are shown for reference only."

3. **Given** all five neighborhoods exceed the parent's maximum budget, **When** the map
   renders, **Then** all five remain visible (none hidden) and a global warning banner reads:
   "Your budget may be below the typical range for Fairfax County. All neighborhoods are
   shown for reference."

4. **Given** the parent increases their maximum budget after a neighborhood was greyed out,
   **When** the budget updates, **Then** any now-affordable neighborhoods become interactive
   again without requiring a page reload.

---

### User Story 3 - AI-Generated Neighborhood Explanation (Priority: P3)

A parent selects a neighborhood and wants to understand *why* it scored the way it did for their
specific family. The app generates a plain-language, 3–4 sentence explanation personalized to
their priorities and child's age, highlighting the neighborhood's strengths and the single most
important trade-off they should be aware of.

**Why this priority**: Raw numbers alone don't tell a story. The AI explanation transforms an
abstract score into an actionable narrative, building trust and driving the "aha moment" of
the product.

**Independent Test**: Select any neighborhood after providing a complete set of inputs. Verify
that a 3–4 sentence plain-language explanation appears, references the parent's stated priorities,
mentions the child's age group, and identifies at least one trade-off specific to that
neighborhood's data profile.

**Acceptance Scenarios**:

1. **Given** a parent selects McLean (22101) with Education priority at 90 and age group
   "Child", **When** the explanation loads, **Then** it references McLean's strong school
   performance, the parent's education priority, and notes at least one drawback (e.g., high
   cost or academic pressure culture).

2. **Given** the explanation is generated, **When** the parent reads it, **Then** it is 3–4
   sentences long, written in plain language without bullet points, and contains no technical
   jargon (e.g., no "sub-metric", "pillar weight", "normalization").

3. **Given** a neighborhood is marked over-budget and the parent views its explanation, **When**
   the explanation displays, **Then** it acknowledges the budget constraint alongside the
   quality assessment.

4. **Given** the AI explanation service is unavailable, **When** the parent selects a
   neighborhood, **Then** scores and pillar breakdowns still display and a friendly error
   message appears ("Explanation unavailable — please try again") rather than a blank or
   crashed state.

---

### Edge Cases

- What happens when all four sliders are set to 0? The system MUST assign equal weights
  (25% each) rather than dividing by zero or returning an error.
- What happens when the parent lowers their budget after selecting a neighborhood that is now
  over budget? A warning banner MUST appear; the score MUST remain visible for reference.
- What happens when the parent's maximum budget equals exactly the average home price of a
  neighborhood? That neighborhood MUST be treated as affordable (boundary-inclusive check).
- What happens if the AI explanation service is unavailable? Scores and pillar breakdowns MUST
  display; the explanation area MUST show a user-friendly error, not a blank or crashed UI.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST accept four inputs from the parent: budget range (min and max dollar
  amounts), child's age group (Newborn / Toddler / Child), and a 0–100 priority slider for
  each of the four pillars (Education, Social Development, Safety, Infrastructure).

- **FR-002**: System MUST calculate a Child Development Score (0–100) for each of the five
  Fairfax County neighborhoods by combining sub-metric data, the parent's normalized slider
  weights, and an age-group modifier that nudges weights before re-normalization.

- **FR-003**: System MUST display all five neighborhood scores simultaneously so parents can
  compare neighborhoods without navigating between screens.

- **FR-004**: System MUST mark any neighborhood as unaffordable when its average home price
  exceeds the parent's stated maximum budget, and MUST visually distinguish it (greyed out,
  non-interactive) on the map.

- **FR-005**: System MUST display an inline warning when a parent views or selects a
  neighborhood whose average home price exceeds their maximum budget.

- **FR-006**: System MUST display a global warning banner when all five neighborhoods exceed
  the parent's maximum budget, while keeping all five visible on the map.

- **FR-007**: System MUST guard against divide-by-zero: if all four sliders are set to 0, equal
  weights (25% each) MUST be applied before the age-group modifier runs.

- **FR-008**: System MUST display all four individual pillar scores alongside the final composite
  score so parents can audit what drove the result.

- **FR-009**: System MUST generate a plain-language, 3–4 sentence AI explanation for each
  selected neighborhood, personalized to the parent's priorities, child's age group, and
  budget fit status, with at least one trade-off called out.

- **FR-010**: System MUST remain functional (scores and pillar breakdowns visible) even when
  the AI explanation service is unavailable; a user-friendly error message MUST appear in
  place of the explanation.

- **FR-011**: System MUST NOT factor budget into score calculation; budget is exclusively a
  display filter and affordability flag.

### Key Entities

- **Neighborhood**: One of five fixed Fairfax County ZIP codes (McLean 22101, Reston 20190,
  Annandale 22003, Burke 22015, Fairfax City 22030). Carries an average home price, a human-
  readable label, and pre-computed quality sub-metrics for all four pillars.

- **Pillar**: One of four child-development dimensions (Education, Social Development, Safety,
  Infrastructure). Each pillar has a computed average score (0–100) derived from its
  constituent sub-metrics.

- **UserInput**: The parent's session-scoped inputs — budget range, child age group, and four
  priority slider values (0–100 each). Not persisted across sessions.

- **ChildDevelopmentScore**: The final weighted composite score (0–100) for a neighborhood,
  produced from the four pillar scores and the parent's normalized, age-adjusted weights.

- **AIExplanation**: A 3–4 sentence plain-language narrative generated for a specific
  neighborhood given the parent's full input context, explaining the score and the key
  trade-off for their family.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A parent can go from opening the app to seeing personalized scores for all five
  neighborhoods in under 2 minutes.

- **SC-002**: Score updates are reflected without a full page reload when the parent changes
  any slider or age group value.

- **SC-003**: 100% of valid input combinations produce a score in the 0–100 range with no
  errors or blank results, including the all-zero slider edge case.

- **SC-004**: The budget filter correctly classifies all five neighborhoods as affordable or
  unaffordable for any given max budget, with 0 misclassifications.

- **SC-005**: An AI explanation is generated and displayed within 10 seconds of a parent
  selecting a neighborhood under normal operating conditions.

- **SC-006**: AI explanations reference the parent's stated priorities and child's age group in
  100% of generated outputs (verifiable by manual review of test cases).

- **SC-007**: When the AI service is unavailable, the app continues to display scores and pillar
  breakdowns with a user-friendly message — 0 complete application failure states.

## Assumptions

- Neighborhood data is static for the hackathon; no live data pipeline is required.
- The five neighborhoods are fixed; no search, add, or remove neighborhood capability is in
  scope.
- There is no user account system; parent inputs are not persisted between sessions.
- The age-group modifier logic (Newborn / Toddler / Child nudges) is a fixed business rule,
  not user-configurable.
- "Affordable" means average home price ≤ budget maximum; the minimum budget value is
  informational context only and does not gate any neighborhood.
- Sub-metric inversion (e.g., lower bullying rate = higher score) is handled in the data layer
  before any scoring logic runs; all scoring math treats higher values as better.
- The app targets desktop and modern mobile browsers; no native mobile app is in scope.
