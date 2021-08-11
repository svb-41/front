import { ship, bullet } from './ship'

export const BASIC_SHIP: ship = {
  id: 'basic',
  position: {
    pos: { x: 0, y: 0 },
    direction: 0,
    speed: 0,
  },
  stats: { size: 20, acceleration: 10, turn: Math.PI / 10 },
}

export const BASIC_BULLET: bullet = {
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
