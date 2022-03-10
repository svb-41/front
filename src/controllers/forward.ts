import * as svb from '@svb-41/core'

type Data = { angle: number }
type ControllerArgs = svb.controller.ControllerArgs<Data>

export const initialData = { angle: Math.PI / 12 + Math.PI }
export default ({ stats, memory, ship }: ControllerArgs) => {
  if (memory.angle > stats.position.direction && stats.stats.size === 8)
    return ship.turnLeft()
  if (stats.position.speed < 0.2) return ship.thrust()
  return ship.idle()
}
