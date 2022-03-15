import * as svb from '@svb-41/core'

type Data = { angle: number }

export const data: Data = { angle: Math.PI / 12 + Math.PI }
export const ai: svb.AI<Data> = ({ stats, memory, ship }) => {
  const { direction, speed } = stats.position
  if (memory.angle > direction && stats.stats.size === 8) return ship.turnLeft()
  if (speed < 0.2) return ship.thrust()
  return ship.idle()
}
