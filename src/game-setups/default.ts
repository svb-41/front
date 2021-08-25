import { State, Engine } from '@/engine'
import { Ship } from '@/engine/ship'
import { buildBasicShip, buildMotherShip } from '@/engine/config/builder'
import * as controller from '@/controllers'

const teams = ['red', 'blue']
const redMotherShip = buildMotherShip({
  position: { pos: { x: 100, y: 600 }, direction: 0 },
  team: teams[0],
})
const red: Array<Ship> = [
  buildBasicShip({
    position: { pos: { x: 300, y: 300 }, direction: 0 },
    team: teams[0],
  }),
  buildBasicShip({
    position: { pos: { x: 300, y: 500 }, direction: 0 },
    team: teams[0],
  }),
  buildBasicShip({
    position: { pos: { x: 300, y: 700 }, direction: 0 },
    team: teams[0],
  }),
  buildBasicShip({
    position: { pos: { x: 300, y: 900 }, direction: 0 },
    team: teams[0],
  }),
  // redMotherShip,
]

const blueMotherShip = buildMotherShip({
  position: { pos: { x: 1400, y: 600 }, direction: Math.PI },
  team: teams[1],
})

const blue: Array<Ship> = [
  // buildBasicShip({
  //   position: { pos: { x: 1200, y: 300 }, direction: Math.PI },
  //   team: teams[1],
  // }),
  // buildBasicShip({
  //   position: { pos: { x: 1200, y: 500 }, direction: Math.PI },
  //   team: teams[1],
  // }),
  // buildBasicShip({
  //   position: { pos: { x: 1200, y: 700 }, direction: Math.PI },
  //   team: teams[1],
  // }),
  // buildBasicShip({
  //   position: { pos: { x: 1200, y: 900 }, direction: Math.PI },
  //   team: teams[1],
  // }),
  blueMotherShip,
]

const ships = [...red, ...blue]

const gameEnder = (state: State): boolean =>
  state.ships
    .filter(s => s.team === 'blue')
    .map(s => s.destroyed)
    .reduce((acc, val) => acc && val, true) ||
  state.ships
    .filter(s => s.team === 'red')
    .map(s => s.destroyed)
    .reduce((acc, val) => acc && val, true) ||
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

const controllers = [
  ...red.map(controller.assault.default),
  ...blue.map(controller.torpedo.default),
]

const gen = () => new Engine(defaultState, controllers, gameEnder)

export default gen
