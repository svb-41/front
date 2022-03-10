import * as svb from '@svb-41/core'
const { dist2 } = svb.helpers

type Data = { targets: Array<{ x: number; y: number }> }
type ControllerArgs = svb.controller.ControllerArgs<Data>

const t = (x: number, y: number) => ({ x, y })
const targets = [t(500, 300), t(500, 500), t(500, 700), t(500, 700)]
export const initialData = { targets }
export default ({ stats, radar, memory, ship }: ControllerArgs) => {
  if (radar.length > 0) {
    const closeEnemy = radar
      .filter(res => res.team !== stats.team && !res.destroyed)
      .map(res => ({ res, dist: dist2(res.position, stats.position) }))
    if (closeEnemy.length > 0) {
      const nearEnmy = closeEnemy.reduce((a, v) => (a.dist > v.dist ? v : a))
      if (nearEnmy) {
        const dist = Math.sqrt(nearEnmy.dist) / 0.6
        const target = svb.helpers.nextPosition(dist)(nearEnmy.res.position)
        return ship.fire(stats.weapons[0].coolDown === 0 ? 0 : 1, {
          target: target.pos,
          armedTime: nearEnmy.dist - 100,
        })
      }
    }
  }
  if (stats.weapons[2].coolDown === 0 && memory.targets.length > 0)
    return ship.fire(2, { target: memory.targets.pop(), armedTime: 500 })
  return ship.idle()
}
