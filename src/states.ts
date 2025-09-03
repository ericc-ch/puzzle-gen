import path from "node:path"

import type { GameState } from "./types"

const statesFile = Bun.file(path.join(process.cwd(), "states.json"))

if (!(await statesFile.exists())) {
  await Bun.write(statesFile, JSON.stringify([]))
}

const get = async (id: string) => {
  const states = await statesFile
    .text()
    .then((text) => JSON.parse(text) as Array<[string, GameState]>)
    .then((arr) => new Map(arr))

  return states.get(id)
}

const write = async (id: string, state: GameState) => {
  const states = await statesFile
    .text()
    .then((text) => JSON.parse(text) as Array<[string, GameState]>)
    .then((arr) => new Map(arr))

  states.set(id, state)

  await Bun.write(statesFile, JSON.stringify(Array.from(states.entries())))
}

const _delete = async (id: string) => {
  const states = await statesFile
    .text()
    .then((text) => JSON.parse(text) as Array<[string, GameState]>)
    .then((arr) => new Map(arr))

  states.delete(id)

  await Bun.write(statesFile, JSON.stringify(Array.from(states.entries())))
}

export const states = {
  get,
  write,
  delete: _delete,
}
