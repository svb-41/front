import { State, Engine } from '@/engine'
import { Ship } from '@/engine/ship'
import { buildBasicShip, buildMotherShip } from '@/engine/config'
import holdTheLineController from '@/controllers/holdTheLine'

const teams = ['red', 'blue']
const redMotherShip = buildMotherShip({
  position: { pos: { x: 100, y: 500 }, direction: 0 },
  team: 'red',
})
const red: Array<Ship> = [
  buildBasicShip({
    position: { pos: { x: 300, y: 200 }, direction: 0 },
    team: 'red',
  }),
  buildBasicShip({
    position: { pos: { x: 300, y: 400 }, direction: 0 },
    team: 'red',
  }),
  buildBasicShip({
    position: { pos: { x: 300, y: 600 }, direction: 0 },
    team: 'red',
  }),
  buildBasicShip({
    position: { pos: { x: 300, y: 800 }, direction: 0 },
    team: 'red',
  }),
  redMotherShip,
]

const blueMotherShip = buildMotherShip({
  position: { pos: { x: 1400, y: 500 }, direction: Math.PI },
  team: 'blue',
})

const blue: Array<Ship> = [
  buildBasicShip({
    position: { pos: { x: 1200, y: 200 }, direction: Math.PI },
    team: 'blue',
  }),
  buildBasicShip({
    position: { pos: { x: 1200, y: 400 }, direction: Math.PI },
    team: 'blue',
  }),
  buildBasicShip({
    position: { pos: { x: 1200, y: 600 }, direction: Math.PI },
    team: 'blue',
  }),
  buildBasicShip({
    position: { pos: { x: 1200, y: 800 }, direction: Math.PI },
    team: 'blue',
  }),
  blueMotherShip,
]

const ships = [...red, ...blue]

const gameEnder = (state: State): boolean =>
  state.ships.find(s => s.id === blueMotherShip.id)?.destroyed ||
  state.ships.find(s => s.id === redMotherShip.id)?.destroyed ||
  false

const defaultState: State = {
  ships,
  size: { height: window.innerHeight, width: window.innerWidth },
  teams,
  bullets: [],
  maxSpeed: 3,
}

const controllers = defaultState.ships.map(holdTheLineController)

export default new Engine(defaultState, controllers, gameEnder)
