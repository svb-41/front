import { Ship, Bullet } from './ship'
import { v4 as uuid } from 'uuid'

export const BASIC_SHIP: Ship = {
  id: 'basic',
  position: {
    pos: { x: 0, y: 0 },
    direction: 0,
    speed: 0,
  },
  stats: { size: 16, acceleration: 0.01, turn: Math.PI / 30, detection: 200 },
  destroyed: false,
  team: 'none',
  bulletsFired: 0,
  coolDown: 0,
}

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
  range: 1000,
  coolDown: 100,
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
  coolDown: 0,
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
  position: { ...BASIC_SHIP.position, ...position },
  team,
})

export const buildBasicBase = ({
  position = { pos: { x: 0, y: 0 }, direction: 0 },
  team = 'none',
}: BuildShipProps): Ship => ({
  ...BASIC_BASE,
  id: uuid(),
  position: { ...BASIC_BASE.position, ...position },
  team,
})
