import * as svb from '@svb-41/core'

type Data = { initialDir?: number }

export const data = {}
export const ai: svb.AI<Data> = ({ stats, comm, radar, ship }) => {
  if (radar.length > 0) {
    const enemies = radar
      .filter(res => res.team !== stats.team && !res.destroyed)
      .map(res => res.position)
    if (enemies.length > 0) comm.sendMessage(enemies)
  }
  if (stats.position.speed < 0.1) return ship.thrust(0.1 - stats.position.speed)
  if (stats.position.speed - 0.1 >= 0.01)
    return ship.thrust(stats.position.speed - 0.1)

  return ship.idle()
}
