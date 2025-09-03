import type { ScenarioAttributes } from "./types"

export interface ScenarioConstraints {
  constraints: Array<{
    attribute: ScenarioAttributes
    minCount: number
  }>
}

export const scenarios: Record<number, ScenarioConstraints> = {
  1: {
    constraints: [
      { attribute: "young", minCount: 600 },
      { attribute: "well_dressed", minCount: 600 },
    ],
  },
  2: {
    constraints: [
      { attribute: "techno_lover", minCount: 650 },
      { attribute: "well_connected", minCount: 450 },
      { attribute: "creative", minCount: 300 },
      { attribute: "berlin_local", minCount: 750 },
    ],
  },
  3: {
    constraints: [
      { attribute: "underground_veteran", minCount: 500 },
      { attribute: "international", minCount: 650 },
      { attribute: "fashion_forward", minCount: 550 },
      { attribute: "queer_friendly", minCount: 250 },
      { attribute: "vinyl_collector", minCount: 200 },
      { attribute: "german_speaker", minCount: 800 },
    ],
  },
}
