import neighborhoodData from '../data/mock_data.json' assert { type: 'json' }

export const AGE_GROUPS = {
  NEWBORN: 'newborn',
  TODDLER: 'toddler',
  CHILD: 'child',
}

export const DEFAULT_WEIGHTS = {
  education: 0.25,
  social: 0.25,
  safety: 0.25,
  infra: 0.25,
}

const AGE_MODIFIERS = {
  [AGE_GROUPS.NEWBORN]: { education: 0, social: 0, safety: 0.1, infra: 0.1 },
  [AGE_GROUPS.TODDLER]: { education: 0.05, social: 0.05, safety: 0.05, infra: 0.05 },
  [AGE_GROUPS.CHILD]:   { education: 0.15, social: 0, safety: 0.05, infra: 0 },
}

/**
 * Normalize raw slider values to weights that sum to 1.
 * If all are 0, assign equal weights (0.25 each) — zero-division guard.
 */
function normalizeSliders(educationPriority, socialPriority, safetyPriority, infraPriority) {
  const total = educationPriority + socialPriority + safetyPriority + infraPriority
  if (total === 0) {
    return { ...DEFAULT_WEIGHTS }
  }
  return {
    education: educationPriority / total,
    social: socialPriority / total,
    safety: safetyPriority / total,
    infra: infraPriority / total,
  }
}

/**
 * Apply age-group modifier deltas then re-normalize so weights still sum to 1.
 */
function applyAgeModifier(weights, ageGroup) {
  const mod = AGE_MODIFIERS[ageGroup] ?? AGE_MODIFIERS[AGE_GROUPS.TODDLER]
  const adjusted = {
    education: weights.education + mod.education,
    social: weights.social + mod.social,
    safety: weights.safety + mod.safety,
    infra: weights.infra + mod.infra,
  }
  const total = adjusted.education + adjusted.social + adjusted.safety + adjusted.infra
  return {
    education: adjusted.education / total,
    social: adjusted.social / total,
    safety: adjusted.safety / total,
    infra: adjusted.infra / total,
  }
}

/**
 * Compute Child Development Scores for all five neighborhoods.
 *
 * @param {object} userInput - { budget_min, budget_max, age_group, education_priority,
 *                               social_priority, safety_priority, infra_priority }
 * @returns {Array<ChildDevelopmentScore>}
 */
export function computeScores(userInput) {
  const {
    budget_max,
    age_group,
    education_priority = 50,
    social_priority = 50,
    safety_priority = 50,
    infra_priority = 50,
  } = userInput

  // Step 2 — normalize sliders
  let weights = normalizeSliders(
    education_priority,
    social_priority,
    safety_priority,
    infra_priority,
  )

  // Step 3 — apply age-group modifier and re-normalize
  weights = applyAgeModifier(weights, age_group)

  const results = []

  for (const [zip, neighborhood] of Object.entries(neighborhoodData.zip_codes)) {
    const { pillars, average_home_price, label, archetype, average_rent } = neighborhood

    // Step 1 — pillar scores (pre-inverted in data, higher = better)
    const educationScore = pillars.education.pillar_score
    const socialScore = pillars.social_development.pillar_score
    const safetyScore = pillars.safety.pillar_score
    const infraScore = pillars.infrastructure.pillar_score

    // Step 4 — weighted composite
    const finalScore = Math.round(
      weights.education * educationScore +
      weights.social    * socialScore +
      weights.safety    * safetyScore +
      weights.infra     * infraScore
    )

    // Step 5 — budget flag (non-scoring, boundary-inclusive)
    const affordable = average_home_price <= budget_max

    results.push({
      zip,
      label,
      archetype,
      average_home_price,
      average_rent,
      education_score: educationScore,
      social_score: socialScore,
      safety_score: safetyScore,
      infra_score: infraScore,
      final_score: finalScore,
      affordable,
    })
  }

  return results
}

export { neighborhoodData }
