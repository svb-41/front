import * as svb from '@svb-41/core'
const { dist2 } = svb.helpers

type Data = { initialDir?: number }
type ControllerArgs = svb.controller.ControllerArgs<Data>

export const initialData = {}
export default ({ stats, memory, comm, radar, ship }: ControllerArgs) => {
  if (!memory.initialDir) memory.initialDir = stats.position.direction
  if (stats.position.speed < 0.08)
    return ship.thrust(0.08 - stats.position.speed)
  if (radar.length > 0) {
    const enemies = radar
      .filter(res => res.team !== stats.team && !res.destroyed)
      .map(res => res.position)
    if (enemies.length > 0) comm.sendMessage(enemies)
  }
  if (memory.initialDir - stats.position.direction === 0) return ship.idle()
  return ship.turn(memory.initialDir - stats.position.direction)
}
