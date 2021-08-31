import { State, Engine } from '@/engine'
import { Ship } from '@/engine/ship'
import { Channel } from '@/engine/comm'

import {
  buildFighter,
  buildDestroyer,
  // buildCruiser,
  buildBomber,
  buildStealth,
} from '@/engine/config/builder'
import * as controller from '@/controllers'

const teams = ['blue', 'red']

const bomber = buildBomber({
  position: { pos: { x: 100, y: 600 }, direction: 0 },
  team: teams[0],
})
const stealths = [
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

  buildDestroyer({
    position: { pos: { x: 1900, y: 700 }, direction: Math.PI },
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

const controllers = [
  controller.torpedo.default(bomber),
  ...stealths.map(controller.scout.default),
  ...blue.map(controller.assault.default),
]

const gen = () => new Engine(defaultState, controllers, gameEnder)

export default gen
