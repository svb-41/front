import { Ship, Bullet } from './ship'
import { v4 as uuid } from 'uuid'

export const BASIC_BULLET: Bullet = {
  id: 'bullet',
  position: {
    pos: { x: 0, y: 0 },
    direction: 0,
    speed: 1,
  },
  stats: { size: 4, acceleration: 0, turn: 0 },
  distance: 0,
  armed: false,
  range: 600,
  coolDown: 200,
  destroyed: false,
}

export const FAST_BULLET: Bullet = {
  id: 'bullet',
  position: {
    pos: { x: 0, y: 0 },
    direction: 0,
    speed: 1,
  },
  stats: { size: 4, acceleration: 0, turn: 0 },
  distance: 0,
  armed: false,
  range: 300,
  coolDown: 50,
  destroyed: false,
}

export const BASIC_SHIP: Ship = {
  id: 'basic',
  position: {
    pos: { x: 0, y: 0 },
    direction: 0,
    speed: 0,
  },
  stats: { size: 8, acceleration: 0.01, turn: Math.PI / 30, detection: 200 },
  destroyed: false,
  team: 'none',
  bulletsFired: 0,
  weapons: [{ bullet: FAST_BULLET, amo: 10, coolDown: 0 }],
}
export const MOTHER_SHIP: Ship = {
  id: 'mother',
  position: {
    pos: { x: 0, y: 0 },
    direction: 0,
    speed: 0,
  },
  stats: { size: 16, acceleration: 0.001, turn: Math.PI / 120, detection: 400 },
  destroyed: false,
  team: 'none',
  bulletsFired: 0,
  weapons: [{ bullet: BASIC_BULLET, amo: 20, coolDown: 0 }],
}

export const BASIC_BASE: Ship = {
  id: 'base',
  position: {
    pos: { x: 0, y: 0 },
    direction: 0,
    speed: 0,
  },
  stats: { size: 32, acceleration: 0, turn: Math.PI / 30, detection: 10 },
  destroyed: false,
  team: 'none',
  bulletsFired: 0,
  weapons: [],
}

type BuildShipProps = {
  position?: {
    pos: { x: number; y: number }
    direction: number
  }
  team?: string
}

export const buildBasicShip = ({
  position = { pos: { x: 0, y: 0 }, direction: 0 },
  team = 'none',
}: BuildShipProps): Ship => ({
  ...BASIC_SHIP,
  id: uuid(),
  weapons: BASIC_SHIP.weapons.map(w => ({ ...w })),
  position: { ...BASIC_SHIP.position, ...position },
  team,
})

export const buildMotherShip = ({
  position = { pos: { x: 0, y: 0 }, direction: 0 },
  team = 'none',
}: BuildShipProps): Ship => ({
  ...MOTHER_SHIP,
  id: uuid(),
  position: { ...MOTHER_SHIP.position, ...position },
  weapons: MOTHER_SHIP.weapons.map(w => ({ ...w })),
  team,
})

export const buildBasicBase = ({
  position = { pos: { x: 0, y: 0 }, direction: 0 },
  team = 'none',
}: BuildShipProps): Ship => ({
  ...BASIC_BASE,
  id: uuid(),
  weapons: BASIC_BASE.weapons.map(w => ({ ...w })),
  position: { ...BASIC_BASE.position, ...position },
  team,
})
