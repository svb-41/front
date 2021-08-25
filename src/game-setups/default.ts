import { State, Engine } from '@/engine'
import { Ship } from '@/engine/ship'
import {
  buildFighter,
  buildDestroyer,
  buildStealth,
} from '@/engine/config/builder'
import * as controller from '@/controllers'

const teams = ['blue', 'red']
const redMotherShip = buildDestroyer({
  position: { pos: { x: 100, y: 600 }, direction: 0 },
  team: teams[0],
})
const red: Array<Ship> = [
  buildStealth({
    position: { pos: { x: 300, y: 300 }, direction: 0 },
    team: teams[0],
  }),
  buildStealth({
    position: { pos: { x: 300, y: 500 }, direction: 0 },
    team: teams[0],
  }),
  buildStealth({
    position: { pos: { x: 300, y: 700 }, direction: 0 },
    team: teams[0],
  }),
  buildStealth({
    position: { pos: { x: 300, y: 900 }, direction: 0 },
    team: teams[0],
  }),
  // redMotherShip,
]

const blueMotherShip = buildDestroyer({
  position: { pos: { x: 1400, y: 600 }, direction: Math.PI },
  team: teams[1],
})

const blue: Array<Ship> = [
  // buildFighter({
  //   position: { pos: { x: 1200, y: 300 }, direction: Math.PI },
  //   team: teams[1],
  // }),
  // buildFighter({
  //   position: { pos: { x: 1200, y: 500 }, direction: Math.PI },
  //   team: teams[1],
  // }),
  // buildFighter({
  //   position: { pos: { x: 1200, y: 700 }, direction: Math.PI },
  //   team: teams[1],
  // }),
  // buildFighter({
  //   position: { pos: { x: 1200, y: 900 }, direction: Math.PI },
  //   team: teams[1],
  // }),
  blueMotherShip,
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
  ...blue.map(controller.hold.default),
]

const gen = () => new Engine(defaultState, controllers, gameEnder)

export default gen
