import { Ship, Bullet, SHIP_CLASS } from '@/engine/ship'
import { FAST_BULLET, TORPEDO, BASIC_BULLET } from './weapon'

export const BASIC_SHIP: Ship = {
  id: 'basic',
  class: SHIP_CLASS.FIGHTER,
  position: {
    pos: { x: 0, y: 0 },
    direction: 0,
    speed: 0,
  },
  stats: { size: 8, acceleration: 0.01, turn: Math.PI / 30, detection: 200 },
  destroyed: false,
  team: 'none',
  bulletsFired: 0,
  weapons: [
    { bullet: FAST_BULLET, amo: 5, coolDown: 0 },
    { bullet: FAST_BULLET, amo: 5, coolDown: 0 },
  ],
}
export const MOTHER_SHIP: Ship = {
  id: 'mother',
  class: SHIP_CLASS.DESTROYER,
  position: {
    pos: { x: 0, y: 0 },
    direction: 0,
    speed: 0,
  },
  stats: { size: 16, acceleration: 0.001, turn: Math.PI / 120, detection: 400 },
  destroyed: false,
  team: 'none',
  bulletsFired: 0,
  weapons: [
    { bullet: BASIC_BULLET, amo: 20, coolDown: 0 },
    { bullet: TORPEDO, amo: 2, coolDown: 0 },
  ],
}

export const BASIC_BASE: Ship = {
  id: 'base',
  class: SHIP_CLASS.BASE,
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
