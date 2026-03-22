<!--
SYNC IMPACT REPORT
==================
Version change: 1.0.0 → 1.0.1
Bump rationale: PATCH — corrected spec filename reference from child_development_score_spec.md to child_development_score_spec.md throughout.

Modified principles:
  - [PRINCIPLE_1_NAME] → I. Algorithmic Integrity
  - [PRINCIPLE_2_NAME] → II. Security & Secrets Management
  - [PRINCIPLE_3_NAME] → III. User-Centered Simplicity
  - [PRINCIPLE_4_NAME] → IV. Transparent Scoring
  - [PRINCIPLE_5_NAME] → V. Budget Context, Not Bias

Added sections:
  - Technical Constraints (replaces generic [SECTION_2_NAME])
  - Development Workflow (replaces generic [SECTION_3_NAME])

Removed sections: None

Templates requiring updates:
  ✅ .specify/templates/plan-template.md — Constitution Check section references generic gates;
     no structural change needed; gates will be instantiated per-feature at plan time.
  ✅ .specify/templates/spec-template.md — template structure aligns with constitution principles.
  ✅ .specify/templates/tasks-template.md — task phases align with workflow defined here.

Deferred TODOs:
  - TODO(RATIFICATION_DATE): Hackathon start date unknown; set to 2026-03-22 (today) as first
    ratification. Update if team has an earlier agreed-upon project start date.
-->

# HooHacks26 Constitution

## Core Principles

### I. Algorithmic Integrity

The Child Development Score MUST be computed exactly as defined in `child_development_score_spec.md`
(weighted pillar averages → user slider normalization → age-group modifier → re-normalization →
final score). No shortcuts, heuristics, or undocumented overrides are permitted.

- Sub-metric values MUST come from `data/mock_data.json`; no values may be hardcoded inline.
- Inverted metrics MUST be pre-inverted in the data layer so all scoring math is "higher = better".
- The all-zero slider edge case (divide-by-zero) MUST be guarded: assign equal weights (0.25 each)
  before applying the age modifier.
- Budget comparison MUST remain a flag/filter only — it MUST NOT influence pillar scores.

**Rationale**: Correctness of the score is the product's core value proposition. An undetected
scoring bug invalidates every result shown to users.

### II. Security & Secrets Management

The Anthropic API key MUST never appear in any committed source file, configuration file, or log
output.

- The key MUST be loaded exclusively via the environment variable `ANTHROPIC_API_KEY`.
- A `.env` file storing the real key MUST be listed in `.gitignore` and MUST NOT be committed.
- A `.env.example` file containing only the placeholder `ANTHROPIC_API_KEY=your_key_here` MUST
  be committed so teammates know what is required.
- Any PR that introduces a hardcoded secret MUST be rejected and the commit history sanitized
  before merge.

**Rationale**: Leaked API keys cause immediate financial and reputational damage; the fix cannot
be a "we'll fix it later" item.

### III. User-Centered Simplicity

Every UI decision MUST prioritize parent usability over technical elegance.

- The map MUST visually distinguish affordable vs. over-budget ZIP codes (greyed out,
  non-clickable) without requiring the user to read fine print.
- Sliders MUST accept raw 0–100 values; normalization happens invisibly in the algorithm layer.
- Warning banners MUST appear when: (a) a selected ZIP exceeds budget, or (b) all five ZIPs
  exceed budget.
- Features MUST NOT be added beyond what `child_development_score_spec.md` defines; YAGNI applies.

**Rationale**: This is a hackathon MVP. Scope creep kills demos. Every addition that is not in
the spec requires explicit team consensus and a spec amendment.

### IV. Transparent Scoring

Every score presented to a user MUST be accompanied by an AI-generated explanation that
references their specific priorities and child's age group.

- The Claude explanation prompt MUST follow the template in Section 7 of
  `child_development_score_spec.md` — it MUST include ZIP label, age group, all four pillar scores,
  the final score, and budget fit status.
- The explanation MUST be 3–4 sentences, warm but honest, and free of bullet points.
- Pillar scores MUST be visible in the UI alongside the final composite score so users can
  audit the result themselves.

**Rationale**: Parents make real decisions based on this tool. Unexplained scores erode trust;
explainability is a non-negotiable feature, not a nice-to-have.

### V. Budget Context, Not Bias

Budget MUST be treated as affordability context and MUST NOT distort neighborhood quality scores.

- `average_home_price > budget.max` marks a ZIP `affordable: false` client-side before render.
- This flag affects only visual state (greyed out) and warning copy — it MUST NOT modify
  `child_development_score` or any pillar score.
- If all five ZIPs are over budget, all MUST still be displayed with a global warning banner;
  the app MUST NOT hide results.

**Rationale**: A neighborhood's quality for child development is independent of whether a
particular family can afford it. Conflating affordability with quality produces misleading scores.

## Technical Constraints

- **Frontend**: Single-page web application (React/JSX or plain HTML+JS per team preference).
- **Backend / Scoring**: Scoring logic lives in `scoring.js` or `scoring.py`; it MUST be
  importable/testable independently of the UI.
- **Data**: All neighborhood data comes from `data/mock_data.json`. No live data pipeline is
  in scope for the hackathon.
- **AI**: Claude API via Anthropic SDK. Model selection deferred to implementation; use the
  latest available Haiku or Sonnet tier appropriate for the explanation task.
- **Environment**: Node.js or Python runtime (team decides); document chosen runtime in
  `README.md` before first commit that includes runnable code.
- **No live data**: Confidence intervals, ML models, and live FCPD/FCPS feeds are explicitly
  out of scope (see Section 6 of spec for rationale).

## Development Workflow

- Every feature implementation MUST start from a spec artifact (user story + acceptance
  scenarios) before any code is written.
- The scoring module MUST be implemented and manually verified against at least one known
  input/output pair before the UI is connected to it.
- `.env` setup MUST be validated locally before the AI explanation phase is demonstrated.
- Commits MUST be atomic per logical unit (e.g., scoring module, map component, AI call).
- The `data/mock_data.json` file MUST be treated as read-only during implementation; any
  data corrections require a documented change and re-validation of all five ZIP scores.

## Governance

This constitution supersedes all other informal agreements, Slack decisions, or verbal
understandings about how the project is built.

**Amendment procedure**: Any principle change requires (a) a PR updating this file,
(b) a one-line rationale comment in the PR description, and (c) unanimous team approval
before merge. Emergency amendments during the hackathon may be ratified by majority vote
with the dissenting opinion noted inline.

**Versioning policy**:
- MAJOR: Removal or redefinition of an existing principle.
- MINOR: New principle or section added.
- PATCH: Clarification, wording fix, or non-semantic refinement.

**Compliance review**: Every PR description MUST include a one-line "Constitution Check"
confirming no principles are violated, or explicitly calling out the violation and its
justification (documented in the plan's Complexity Tracking table).

**Runtime guidance**: See `child_development_score_spec.md` for the authoritative product specification
and scoring algorithm. This constitution governs *how* we build; the spec governs *what* we build.

**Version**: 1.0.1 | **Ratified**: 2026-03-22 | **Last Amended**: 2026-03-22
