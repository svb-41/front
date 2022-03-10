import * as svb from '@svb-41/core'
const { dist2 } = svb.helpers

type Position = svb.ship.Position
type Data = { targets: Array<Position> }
type ControllerArgs = svb.controller.ControllerArgs<Data>

export const initialData: Data = { targets: [] }
export default ({ stats, radar, memory, ship, comm }: ControllerArgs) => {
  const messages = comm.getNewMessages()
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

  if (messages.length > 0) {
    const targets = messages
      .map(m => m.content.message.map((res: any) => res))
      .reduce((acc, val) => [...acc, ...val]) as Array<Position>
    memory.targets = targets
  }

  if (memory.targets.length > 0 && stats.weapons[1].coolDown === 0) {
    const target = svb.helpers.nextPosition(200)(memory.targets.pop()!)
    const d = Math.sqrt(dist2(stats.position, target))
    return ship.fire(1, { target: target.pos, armedTime: d - 100 })
  }

  return ship.idle()
}
