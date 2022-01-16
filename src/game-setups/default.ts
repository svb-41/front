import { State, Engine } from '@/engine'
import { Ship } from '@/engine/ship'
import { Channel } from '@/engine/comm'
import * as services from '@/services/compile'

import {
  buildFighter,
  // buildDestroyer,
  buildCruiser,
  buildBomber,
  buildStealth,
} from '@/engine/config/builder'

import controller from '@/default-controllers/assets.json'

const teams = ['blue', 'red']

const bomber = buildBomber({
  position: { pos: { x: 100, y: 600 }, direction: 0 },
  team: teams[0],
})
const stealths: Array<Ship> = [
  buildStealth({
    position: { pos: { x: 100, y: 400 }, direction: 0 },
    team: teams[0],
  }),
  buildStealth({
    position: { pos: { x: 100, y: 800 }, direction: 0 },
    team: teams[0],
  }),
]

const red: Array<Ship> = [bomber, ...stealths]

const blue: Array<Ship> = [
  buildFighter({
    position: { pos: { x: 1700, y: 300 }, direction: Math.PI },
    team: teams[1],
  }),
  buildFighter({
    position: { pos: { x: 1700, y: 500 }, direction: Math.PI },
    team: teams[1],
  }),
  buildFighter({
    position: { pos: { x: 1700, y: 700 }, direction: Math.PI },
    team: teams[1],
  }),
  buildFighter({
    position: { pos: { x: 1700, y: 900 }, direction: Math.PI },
    team: teams[1],
  }),

  buildCruiser({
    position: { pos: { x: 2000, y: 700 }, direction: Math.PI },
    team: teams[1],
  }),
]

const ships = [...red, ...blue]

const gameEnder = (state: State): boolean =>
  state.ships
    .filter(s => s.team === teams[0])
    .map(s => s.destroyed)
    .reduce((acc, val) => acc && val, true) ||
  state.ships
    .filter(s => s.team === teams[1])
    .map(s => s.destroyed)
    .reduce((acc, val) => acc && val, true) ||
  false

const defaultState: State = {
  ships,
  size: { height: window.innerHeight, width: window.innerWidth },
  teams,
  bullets: [],
  maxSpeed: 3,
  comm: teams.map(id => ({ id, channel: new Channel(id) })),
  timeElapsed: 0,
}

const controllers: Array<{ code: string; shipId: string; name: string }> = [
  { code: controller.torpedo, shipId: bomber.id, name: 'torpedo.ts' },
  ...stealths.map(({ id }) => ({
    code: controller.scout,
    shipId: id,
    name: 'scout.ts',
  })),
  ...blue.map(({ id }) => ({
    code: controller.assault,
    shipId: id,
    name: 'assault.ts',
  })),
]

const compiledController = async (
  controllers: Array<{ code: string; shipId: string; name: string }>
): Promise<Array<{ code: string; shipId: string }>> =>
  Promise.all(
    controllers.map(async ({ code, name, shipId }) => {
      const c_ = await services.compile({ uid: 'test-to-delete', name, code })
      return { shipId, code: c_ }
    })
  )

const gen = async () =>
  new Engine(defaultState, await compiledController(controllers), gameEnder)

export default gen
