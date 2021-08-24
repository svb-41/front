export type Ship = {
  id: string
  position: Position
  stats: Stats
  destroyed: boolean
  team: string
  bulletsFired: number
  weapons: Array<{ bullet: Bullet; amo: number; coolDown: number }>
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
  destroyed: boolean
}

export type RadarResult = {
  position: Position
  size: number
  team: string
  destroyed: boolean
}

export const position = (position: Position) => ({
  ...position,
  pos: {
    x: Math.cos(position.direction) * position.speed + position.pos.x,
    y: Math.sin(position.direction) * position.speed + position.pos.y,
  },
})

export const step = (ship: Ship): Ship => ({
  ...ship,
  weapons: ship.weapons.map(
    (w: { bullet: Bullet; amo: number; coolDown: number }) => ({
      ...w,
      coolDown: w.coolDown > 0 ? w.coolDown - 1 : 0,
    })
  ),
  position: position(ship.position),
})

export const bulletStep = (bullet: Bullet): Bullet => ({
  ...bullet,
  distance: bullet.distance + bullet.position.speed,
  destroyed: bullet.distance > bullet.range,
  armed: true,
  position: position(bullet.position),
})

export const dist2 = (pos1: Position, pos2: Position) =>
  Math.pow(pos1.pos.x - pos2.pos.x, 2) + Math.pow(pos1.pos.y - pos2.pos.y, 2)

export const collide =
  (obj1: { position: Position; stats: Stats }) =>
  (obj2: { position: Position; stats: Stats }): boolean =>
    dist2(obj1.position, obj2.position) <
    Math.pow(obj1.stats.size + obj2.stats.size, 2)
