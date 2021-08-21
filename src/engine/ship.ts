export type Ship = {
  id: string
  position: Position
  stats: Stats
  destroyed: boolean
  team: string
  bulletsFired: number
  coolDown: number
}

export type Position = {
  pos: { x: number; y: number }
  direction: number
  speed: number
}

export type Stats = {
  acceleration: number
  turn: number
  size: number
  detection?: number
}

export type Bullet = {
  position: Position
  stats: Stats
  distance: number
  armed: boolean
  range: number
  id: string
  coolDown: number
}

export type RadarResult = {
  position: Position
  size: number
  team: string
}

const position = (position: Position) => ({
  ...position,
  pos: {
    x: Math.cos(position.direction) * position.speed + position.pos.x,
    y: Math.sin(position.direction) * position.speed + position.pos.y,
  },
})

export const step = (ship: Ship): Ship => ({
  ...ship,
  coolDown: ship.coolDown > 0 ? ship.coolDown - 1 : 0,
  position: position(ship.position),
})

export const bulletStep = (bullet: Bullet): Bullet => ({
  ...bullet,
  distance: bullet.distance + bullet.position.speed,
  armed: true,
  position: position(bullet.position),
})

const dist2 = (pos1: Position, pos2: Position) =>
  Math.pow(pos1.pos.x - pos2.pos.x, 2) + Math.pow(pos1.pos.y - pos2.pos.y, 2)

export const collide =
  (obj1: { position: Position; stats: Stats }) =>
  (obj2: { position: Position; stats: Stats }): boolean =>
    dist2(obj1.position, obj2.position) <
    Math.pow(obj1.stats.size + obj2.stats.size, 2)
