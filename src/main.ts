import { Hono } from "hono"

import type { GameState } from "./types"

import { scenarios } from "./scenarios"
import { states } from "./states"
import { generateAttributeStatistics } from "./stats-generator"

const app = new Hono()

app.get("/", (c) => c.text("Hello Bun!"))

app.get("/new-game", async (c) => {
  const params = c.req.query()

  const scenario = Number.parseInt(params.scenario, 10)

  if (Number.isNaN(scenario) || !(scenario in scenarios)) {
    return c.json({ error: "Invalid scenario" }, 400)
  }

  const gameId = crypto.randomUUID()

  // Get scenario data
  const scenarioData = scenarios[scenario]

  // Get all attributes for this scenario
  const attributes = scenarioData.constraints.map(
    (constraint) => constraint.attribute,
  )

  // Generate statistics for the scenario
  const stats = generateAttributeStatistics(attributes)

  // Create constraints with current: 0 and target from scenario
  const constraints = scenarioData.constraints.map((constraint) => ({
    attribute: constraint.attribute,
    current: 0,
    target: constraint.minCount,
  }))

  const gameState: GameState = {
    meta: {
      gameId,
      scenario,
      stats,
    },
    admitted: 0,
    rejected: 0,
    constraints,
    lastPerson: null,
  }

  // Save game state to persistent storage
  await states.write(gameId, gameState)

  return c.json(gameState)
})

app.get("/decide-and-next", (c) => {
  const params = c.req.query()
  const personIndex = Number.parseInt(params.personIndex, 10)

  if (personIndex === 0) {
    // TODO: Implement decision logic
  }

  return c.json({})
})

export default app
