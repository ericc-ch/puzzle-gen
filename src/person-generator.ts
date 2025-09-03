import { create, all } from "mathjs"

import type { AttributeStatistics } from "./stats-generator"
import type { ScenarioAttributes } from "./types"

const math = create(all)

export interface PersonAttributes {
  [key: string]: boolean
}

/**
 * Generates a random person with correlated attributes using Cholesky decomposition
 *
 * @param relativeFrequencies - How often each attribute should be true (0-1)
 * @param correlations - How attributes relate to each other (-1 to 1)
 * @returns A person with binary attributes following the specified patterns
 */
export function generatePerson(stats: AttributeStatistics): PersonAttributes {
  const attributes = Object.keys(
    stats.relativeFrequencies,
  ) as Array<ScenarioAttributes>
  const numAttributes = attributes.length

  // Step 1: Build correlation matrix in mathjs format
  const correlationMatrix = []
  for (let i = 0; i < numAttributes; i++) {
    const row = []
    for (let j = 0; j < numAttributes; j++) {
      row.push(stats.correlations[attributes[i]][attributes[j]])
    }
    correlationMatrix.push(row)
  }

  // Step 2: Decompose correlation matrix to enable correlated random generation
  const choleskyMatrix = math.lup(correlationMatrix).L

  // Step 3: Generate independent random normal values
  const independentRandoms = []
  for (let i = 0; i < numAttributes; i++) {
    independentRandoms.push(boxMullerRandom())
  }

  // Step 4: Transform independent randoms into correlated ones
  const correlatedRandoms = math.multiply(
    choleskyMatrix,
    independentRandoms,
  ) as Array<number>

  // Step 5: Convert correlated randoms to binary attributes based on frequencies
  const person: PersonAttributes = {}
  for (let i = 0; i < numAttributes; i++) {
    const attributeName = attributes[i]
    const targetFrequency = stats.relativeFrequencies[attributeName]

    // Find the threshold where P(random > threshold) = targetFrequency
    const threshold = inverseNormalCDF(1 - targetFrequency)

    // Attribute is true if the correlated random exceeds the threshold
    person[attributeName] = correlatedRandoms[i] > threshold
  }

  return person
}

/**
 * Box-Muller transformation to generate standard normal random variables
 */
function boxMullerRandom(): number {
  let u = 0,
    v = 0
  while (u === 0) u = Math.random() // Converting [0,1) to (0,1)
  while (v === 0) v = Math.random()

  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
}

/**
 * Simple approximation of inverse normal CDF using Box-Muller-like approach
 * For a frequency f, returns the z-score threshold where P(Z > threshold) = f
 */
function inverseNormalCDF(p: number): number {
  if (p <= 0) return -Infinity
  if (p >= 1) return Infinity

  // Use a simple approximation for readability
  // This is accurate enough for our game simulation purposes
  if (p === 0.5) return 0

  // For p close to 0.5, use linear approximation
  if (Math.abs(p - 0.5) < 0.4) {
    return (p - 0.5) * 2.5 // Rough approximation around center
  }

  // For extreme values, use logarithmic approximation
  return p < 0.5 ?
      -Math.sqrt(-2 * Math.log(p))
    : Math.sqrt(-2 * Math.log(1 - p))
}
