export type ship = {
  id: string
  position: position
  stats: stats
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
}

export type bullet = {
  position: position
  stats: stats
  distance: number
  armed: boolean
  range: number
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
