import { Bullet } from '@/engine/ship'

export const BASIC_BULLET: Bullet = {
  id: 'bullet',
  position: {
    pos: { x: 0, y: 0 },
    direction: 0,
    speed: 0.8,
  },
  stats: { size: 4, acceleration: 0, turn: 0 },
  distance: 0,
  armed: false,
  range: 600,
  coolDown: 400,
  destroyed: false,
}
export const TORPEDO: Bullet = {
  id: 'bullet',
  position: {
    pos: { x: 0, y: 0 },
    direction: 0,
    speed: 0,
  },
  stats: { size: 4, acceleration: 0.02, turn: Math.PI / 20 },
  distance: 0,
  armed: false,
  range: 6000,
  coolDown: 4000,
  destroyed: false,
}

export const FAST_BULLET: Bullet = {
  id: 'bullet',
  position: {
    pos: { x: 0, y: 0 },
    direction: 0,
    speed: 0.8,
  },
  stats: { size: 4, acceleration: 0, turn: 0 },
  distance: 0,
  armed: false,
  range: 300,
  coolDown: 50,
  destroyed: false,
}
