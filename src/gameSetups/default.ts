import { State, Engine } from '@/engine'
import { Ship } from '@/engine/ship'
import { buildBasicShip } from '@/engine/config'
import holdTheLineController from '@/controllers/holdTheLine'

const teams = ['red', 'blue']

const red: Array<Ship> = [
  buildBasicShip({
    position: { pos: { x: 200, y: 100 }, direction: 0 },
    team: 'red',
  }),
  buildBasicShip({
    position: { pos: { x: 200, y: 300 }, direction: 0 },
    team: 'red',
  }),
  buildBasicShip({
    position: { pos: { x: 200, y: 500 }, direction: 0 },
    team: 'red',
  }),
  buildBasicShip({
    position: { pos: { x: 200, y: 700 }, direction: 0 },
    team: 'red',
  }),
]

const blue: Array<Ship> = [
  buildBasicShip({
    position: { pos: { x: 1200, y: 100 }, direction: Math.PI },
    team: 'blue',
  }),
  buildBasicShip({
    position: { pos: { x: 1200, y: 300 }, direction: Math.PI },
    team: 'blue',
  }),
  buildBasicShip({
    position: { pos: { x: 1200, y: 500 }, direction: Math.PI },
    team: 'blue',
  }),
  buildBasicShip({
    position: { pos: { x: 1200, y: 700 }, direction: Math.PI },
    team: 'blue',
  }),
]

const ships = [...red, ...blue]

const defaultState: State = {
  ships,
  size: { height: window.innerHeight, width: window.innerWidth },
  teams,
  bullets: [],
  maxSpeed: 3,
}

const controllers = defaultState.ships.map(holdTheLineController)

export default new Engine(defaultState, controllers)
