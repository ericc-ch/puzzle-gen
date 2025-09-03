export type ScenarioAttributes =
  // Scenario 1
  | "young"
  | "well_dressed"
  // Scenario 2
  | "techno_lover"
  | "well_connected"
  | "creative"
  | "berlin_local"
  // Scenario 3
  | "underground_veteran"
  | "international"
  | "fashion_forward"
  | "queer_friendly"
  | "vinyl_collector"
  | "german_speaker"

export interface ScenarioResponse {
  gameId: string
  constraints: Array<{
    attribute: ScenarioAttributes
    minCount: number
  }>
  attributeStatistics: {
    /**
     * Frequency ranges from 0.0 to 1.0
     */
    relativeFrequencies: Record<ScenarioAttributes, number>
    /**
     * Correlations ranges from -1.0 to 1.0
     */
    correlations: Record<ScenarioAttributes, Record<ScenarioAttributes, number>>
  }
}

export type GameStatus = "running" | "completed" | "failed"

export interface GameState {
  meta: {
    gameId: string
    scenario: number
    stats: ScenarioResponse["attributeStatistics"]
  }

  status: GameStatus
  failedReason?: string

  currentPerson: {
    index: number
    attributes: Record<ScenarioAttributes, boolean>
  }
  admitted: number
  rejected: number

  constraints: Array<{
    attribute: ScenarioAttributes
    current: number
    target: number
  }>
}
