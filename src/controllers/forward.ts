import * as svb from '@svb-41/core'

type Data = { angle: number }

export const data = { angle: Math.PI / 12 + Math.PI }
export const ai: svb.AI<Data> = ({ stats, memory, ship }) => {
  if (memory.angle > stats.position.direction && stats.stats.size === 8)
    return ship.turnLeft()
  if (stats.position.speed < 0.2) return ship.thrust()
  return ship.idle()
}
