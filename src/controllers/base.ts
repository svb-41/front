import * as svb from '@svb-41/core'

type Data = { initialDir?: number }

export const data: Data = {}
export const ai: svb.AI<Data> = ({ stats, radar, memory, ship }) => {
  const near = svb.radar.nearestEnemy(radar, stats.team, stats.position)
  if (near && stats.weapons[0].coolDown === 0) {
    return ship.fire(0, {
      target: near.enemy.position.pos,
      armedTime: near.dist2 - 100,
    })
  }
  return ship.turn()
}
