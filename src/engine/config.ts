import { Ship, Bullet } from './ship'

export const BASIC_SHIP: Ship = {
  id: 'basic',
  position: {
    pos: { x: 0, y: 0 },
    direction: 0,
    speed: 0,
  },
  stats: { size: 20, acceleration: 1, turn: Math.PI / 30, detection: 100 },
  destroyed: false,
  team: 'none',
}

export const BASIC_BULLET: Bullet = {
  position: {
    pos: { x: 0, y: 0 },
    direction: 0,
    speed: 100,
  },
  stats: { size: 4, acceleration: 0, turn: 0 },
  distance: 0,
  armed: false,
  range: 1000,
}

export const BASIC_BASE: Ship = {
  id: 'base',
  position: {
    pos: { x: 0, y: 0 },
    direction: 0,
    speed: 0,
  },
  stats: { size: 100, acceleration: 1, turn: Math.PI / 30, detection: 40 },
  destroyed: false,
  team: 'none',
}

type BuildShipProps = {
  position?: {
    pos: { x: number; y: number }
    direction: number
  }
  id?: string
  team?: string
}

export const buildBasicShip = ({
  id = 'basic',
  position = { pos: { x: 0, y: 0 }, direction: 0 },
  team = 'none',
}: BuildShipProps): Ship => ({
  ...BASIC_SHIP,
  id,
  position: { ...BASIC_SHIP.position, ...position },
  team,
})

export const buildBasicBase = ({
  id = 'base',
  position = { pos: { x: 0, y: 0 }, direction: 0 },
  team = 'none',
}: BuildShipProps): Ship => ({
  ...BASIC_BASE,
  id,
  position: { ...BASIC_BASE.position, ...position },
  team,
})
