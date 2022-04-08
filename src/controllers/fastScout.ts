import * as svb from '@svb-41/core'

type Data = { initialDir?: number }

export const data: Data = {}
export const ai: svb.AI<Data> = ({ stats, comm, radar, ship }) => {
  if (radar.length > 0) {
    const enemies = radar
      .filter(res => res.team !== stats.team && !res.destroyed)
      .map(res => res.position)
    if (enemies.length > 0) comm.sendMessage(enemies)
  }
  return ship.thrust()
}
