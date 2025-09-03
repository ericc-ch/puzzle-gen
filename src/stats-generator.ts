import type { ScenarioAttributes } from "./types"

export interface AttributeStatistics {
  relativeFrequencies: Record<ScenarioAttributes, number>
  correlations: Record<ScenarioAttributes, Record<ScenarioAttributes, number>>
}

/**
 * Generates random relative frequencies (0.0 to 1.0) for the given attributes
 */
function generateRelativeFrequencies(
  attributes: Array<ScenarioAttributes>,
): Record<ScenarioAttributes, number> {
  const frequencies: Partial<Record<ScenarioAttributes, number>> = {}

  for (const attribute of attributes) {
    frequencies[attribute] = Math.random() // 0.0 to 1.0
  }

  return frequencies as Record<ScenarioAttributes, number>
}

/**
 * Generates a random but mathematically valid correlation matrix
 * The matrix will be symmetric with 1.0 on the diagonal
 */
function generateCorrelationMatrix(
  attributes: Array<ScenarioAttributes>,
): Record<ScenarioAttributes, Record<ScenarioAttributes, number>> {
  const n = attributes.length
  const correlations: Partial<
    Record<ScenarioAttributes, Record<ScenarioAttributes, number>>
  > = {}

  // Initialize the matrix
  for (const attr1 of attributes) {
    correlations[attr1] = {} as Record<ScenarioAttributes, number>
    for (const attr2 of attributes) {
      // eslint-disable-next-line unicorn/prefer-ternary
      if (attr1 === attr2) {
        correlations[attr1][attr2] = 1.0 // Diagonal elements are 1
      } else {
        correlations[attr1][attr2] = 0 // Will be filled later
      }
    }
  }

  // Fill the upper triangle with random values and mirror to lower triangle
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const attr1 = attributes[i]
      const attr2 = attributes[j]

      // Generate random correlation between -1 and 1
      const correlation = Math.random() * 2 - 1 // -1.0 to 1.0

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      correlations[attr1]![attr2] = correlation
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      correlations[attr2]![attr1] = correlation // Symmetric
    }
  }

  return correlations as Record<
    ScenarioAttributes,
    Record<ScenarioAttributes, number>
  >
}

/**
 * Generates random attribute statistics for the given attributes
 */
export function generateAttributeStatistics(
  attributes: Array<ScenarioAttributes>,
): AttributeStatistics {
  return {
    relativeFrequencies: generateRelativeFrequencies(attributes),
    correlations: generateCorrelationMatrix(attributes),
  }
}
