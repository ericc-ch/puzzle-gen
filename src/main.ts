import { Hono } from "hono"

import type { GameState, ScenarioAttributes, ScenarioResponse } from "./types"

import { generatePerson } from "./person-generator"
import { scenarios, staticStats } from "./scenarios"
import { states } from "./states"
import { generateAttributeStatistics } from "./stats-generator"

const PORT = process.env.PORT ?? 3000
const STATIC = process.env.STATIC === "true"

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

  // Generate or use static statistics for the scenario
  const stats =
    STATIC ? staticStats[scenario] : generateAttributeStatistics(attributes)

  // Generate the first person using the statistics
  const firstPerson = generatePerson(stats) as Record<
    ScenarioAttributes,
    boolean
  >

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

    status: "running",

    currentPerson: {
      index: 0,
      attributes: firstPerson,
    },
    admitted: 0,
    rejected: 0,

    constraints,
  }

  // Save game state to persistent storage
  await states.write(gameId, gameState)

  const response: ScenarioResponse = {
    gameId,
    constraints: scenarioData.constraints,
    attributeStatistics: stats,
  }

  return c.json(response)
})

// eslint-disable-next-line max-lines-per-function, complexity
app.get("/decide-and-next", async (c) => {
  const params = c.req.query()

  const gameId = params.gameId
  const personIndex = Number.parseInt(params.personIndex, 10)

  if (!gameId) {
    return c.json({ error: "gameId is required" }, 400)
  }

  if (Number.isNaN(personIndex) || personIndex < 0) {
    return c.json({ error: "personIndex must be a non-negative integer" }, 400)
  }

  const gameState = await states.get(gameId)
  if (!gameState) {
    return c.json({ error: "Game not found" }, 404)
  }

  if (gameState.status !== "running") {
    return c.json({
      status: gameState.status,
      rejectedCount: gameState.rejected,
      ...(gameState.failedReason && { reason: gameState.failedReason }),
      nextPerson: null,
    })
  }

  if (personIndex !== gameState.currentPerson.index) {
    return c.json(
      {
        error: `Invalid personIndex. Expected ${gameState.currentPerson.index}, got ${personIndex}`,
      },
      400,
    )
  }

  if (personIndex > 0) {
    if (!params.accept) {
      return c.json(
        { error: "accept parameter is required for personIndex > 0" },
        400,
      )
    }

    const accept = params.accept === "true"

    if (accept) {
      gameState.admitted++

      for (const constraint of gameState.constraints) {
        if (gameState.currentPerson.attributes[constraint.attribute]) {
          constraint.current++
        }
      }
    } else {
      gameState.rejected++
    }
  }

  if (gameState.admitted >= 1000) {
    gameState.status = "completed"
    await states.write(gameId, gameState)
    return c.json({
      status: "completed",
      rejectedCount: gameState.rejected,
      nextPerson: null,
    })
  }

  if (gameState.rejected >= 20000) {
    gameState.status = "failed"
    gameState.failedReason = "Maximum rejections (20,000) reached"
    await states.write(gameId, gameState)
    return c.json({
      status: "failed",
      reason: "Maximum rejections (20,000) reached",
      nextPerson: null,
    })
  }

  if (personIndex > 0 || params.accept) {
    const missingConstraints = gameState.constraints.filter(
      (constraint) => constraint.current < constraint.target,
    )

    const remainingCapacity = 1000 - gameState.admitted
    const minRequiredCount =
      missingConstraints.length > 0 ?
        Math.max(...missingConstraints.map((c) => c.target - c.current))
      : 0

    if (remainingCapacity < minRequiredCount) {
      gameState.status = "failed"
      gameState.failedReason =
        "Cannot meet minimum constraints with remaining capacity"
      await states.write(gameId, gameState)
      return c.json({
        status: "failed",
        reason: "Cannot meet minimum constraints with remaining capacity",
        nextPerson: null,
      })
    }

    const nextPerson = generatePerson(gameState.meta.stats) as Record<
      ScenarioAttributes,
      boolean
    >

    gameState.currentPerson = {
      index: personIndex + 1,
      attributes: nextPerson,
    }
  }

  await states.write(gameId, gameState)

  return c.json({
    status: "running",
    admittedCount: gameState.admitted,
    rejectedCount: gameState.rejected,
    nextPerson: {
      personIndex: gameState.currentPerson.index,
      attributes: gameState.currentPerson.attributes,
    },
  })
})

export default {
  fetch: app.fetch,
  port: PORT,
} satisfies Bun.Serve
