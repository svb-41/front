export type ship = {
  id: string
  position: position
  stats: stats
  destroyed: boolean
}

export type position = {
  pos: { x: number; y: number }
  direction: number
  speed: number
}

export type stats = {
  acceleration: number
  turn: number
  size: number
  detection?: number
}

export type bullet = {
  position: position
  stats: stats
  distance: number
  armed: boolean
  range: number
}

export type radarResult = {
  position: position
  size: number
}

const position = (position: position) => ({
  ...position,
  pos: {
    x: Math.cos(position.direction) * position.speed + position.pos.x,
    y: Math.sin(position.direction) * position.speed + position.pos.y,
  },
})

export const step = (ship: ship): ship => ({
  ...ship,
  position: position(ship.position),
})

export const bulletStep = (bullet: bullet): bullet => ({
  ...bullet,
  armed: true,
  position: position(bullet.position),
})

const dist2 = (pos1: position, pos2: position) =>
  Math.pow(pos1.pos.x - pos2.pos.x, 2) + Math.pow(pos1.pos.y - pos2.pos.y, 2)

export const collide = (obj1: { position: position; stats: stats }) => (obj2: {
  position: position
  stats: stats
}): boolean =>
  dist2(obj1.position, obj2.position) <
  Math.pow(obj1.stats.size + obj2.stats.size, 2)
