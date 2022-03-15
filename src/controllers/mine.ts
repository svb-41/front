import * as svb from '@svb-41/core'

type Data = { targets: Array<{ x: number; y: number }> }

const t = (x: number, y: number) => ({ x, y })
const targets = [t(500, 300), t(500, 500), t(500, 700), t(500, 700)]

export const data: Data = { targets }
export const ai: svb.AI<Data> = ({ stats, radar, memory, ship }) => {
  if (radar.length > 0) {
    const near = svb.radar.nearestEnemy(radar, stats.team, stats.position)
    if (near) {
      const dist = Math.sqrt(near.dist2) / 0.6
      const target = svb.geometry.nextPosition(dist)(near.enemy.position)
      return ship.fire(stats.weapons[0].coolDown === 0 ? 0 : 1, {
        target: target.pos,
        armedTime: near.dist2 - 100,
      })
    }
  }
  if (stats.weapons[2].coolDown === 0 && memory.targets.length > 0)
    return ship.fire(2, { target: memory.targets.pop(), armedTime: 500 })
  return ship.idle()
}
