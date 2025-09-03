/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

import { test, expect, describe } from "bun:test"

import { generatePerson } from "../src/person-generator"

describe("person generator", () => {
  test("generates a person with all required attributes", () => {
    const relativeFrequencies = {
      young: 0.3,
      well_dressed: 0.4,
    } as any
    const correlations = {
      young: { young: 1, well_dressed: 0.2 },
      well_dressed: { young: 0.2, well_dressed: 1 },
    } as any

    const person = generatePerson(relativeFrequencies, correlations)

    // Should have all attributes as boolean values
    expect(typeof person.young).toBe("boolean")
    expect(typeof person.well_dressed).toBe("boolean")
    expect(Object.keys(person)).toHaveLength(2)
  })

  test("respects relative frequencies over many generations", () => {
    const relativeFrequencies = {
      young: 0.7, // 70% should be young
    } as any
    const correlations = {
      young: { young: 1 },
    } as any

    // Generate many people to test frequency
    const iterations = 1000
    let youngCount = 0

    for (let i = 0; i < iterations; i++) {
      const person = generatePerson(relativeFrequencies, correlations)
      if (person.young) youngCount++
    }

    const actualFrequency = youngCount / iterations
    // Allow for some variance (±10%)
    expect(actualFrequency).toBeGreaterThan(0.6)
    expect(actualFrequency).toBeLessThan(0.8)
  })

  test("handles multiple attributes", () => {
    const relativeFrequencies = {
      techno_lover: 0.6,
      well_connected: 0.4,
      creative: 0.1,
      berlin_local: 0.5,
    } as any
    const correlations = {
      techno_lover: {
        techno_lover: 1,
        well_connected: -0.2,
        creative: 0.1,
        berlin_local: -0.3,
      },
      well_connected: {
        techno_lover: -0.2,
        well_connected: 1,
        creative: 0.15,
        berlin_local: 0.4,
      },
      creative: {
        techno_lover: 0.1,
        well_connected: 0.15,
        creative: 1,
        berlin_local: 0.1,
      },
      berlin_local: {
        techno_lover: -0.3,
        well_connected: 0.4,
        creative: 0.1,
        berlin_local: 1,
      },
    } as any

    const person = generatePerson(relativeFrequencies, correlations)

    // Should have all 4 attributes
    expect(Object.keys(person)).toHaveLength(4)
    expect(typeof person.techno_lover).toBe("boolean")
    expect(typeof person.well_connected).toBe("boolean")
    expect(typeof person.creative).toBe("boolean")
    expect(typeof person.berlin_local).toBe("boolean")
  })

  test("handles edge case frequencies (0 and 1)", () => {
    const relativeFrequencies = {
      young: 0.0, // Never young
      well_dressed: 1.0, // Always well dressed
    } as any
    const correlations = {
      young: { young: 1, well_dressed: 0 },
      well_dressed: { young: 0, well_dressed: 1 },
    } as any

    // Test multiple generations
    for (let i = 0; i < 10; i++) {
      const person = generatePerson(relativeFrequencies, correlations)
      expect(person.young).toBe(false)
      expect(person.well_dressed).toBe(true)
    }
  })

  test("generates different people on multiple calls", () => {
    const relativeFrequencies = {
      young: 0.5,
      well_dressed: 0.5,
    } as any
    const correlations = {
      young: { young: 1, well_dressed: 0 },
      well_dressed: { young: 0, well_dressed: 1 },
    } as any

    const people = []
    for (let i = 0; i < 10; i++) {
      people.push(generatePerson(relativeFrequencies, correlations))
    }

    // Check that we get some variation (not all identical)
    const uniquePeople = new Set(people.map((p) => JSON.stringify(p)))
    expect(uniquePeople.size).toBeGreaterThan(1)
  })
})
