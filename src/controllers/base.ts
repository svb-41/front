import * as svb from '@svb-41/core'

type Data = { initialDir?: number }

const nextPosition =
  (num: number) =>
  (pos: svb.ship.Position): svb.ship.Position => {
    if (num > 500) {
      const res = svb.geometry.nextPosition(500)(pos)
      const time = num - 500
      return nextPosition(time)(res)
    } else {
      return svb.geometry.nextPosition(num)(pos)
    }
  }

export const data: Data = {}
export const ai: svb.AI<Data> = ({ stats, radar, memory, ship }) => {
  const near = svb.radar.nearestEnemy(radar, stats.team, stats.position)
  if (near && stats.weapons[0].coolDown === 0) {
    const target = near.enemy.position
    const dist = Math.floor(Math.sqrt(near.dist2 / 0.6))
    const prev = nextPosition(dist + 200)(target)
    if (svb.geometry.dist(prev, stats.position) < stats.weapons[0].bullet.range)
      return ship.fire(0, {
        target: prev.pos,
        armedTime: 200,
      })
  }
  return ship.turn()
}
