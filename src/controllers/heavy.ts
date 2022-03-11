import * as svb from '@svb-41/core'
const { dist2 } = svb.helpers

type Position = svb.ship.Position
type Data = { targets: Array<Position> }
type ControllerArgs = svb.controller.ControllerArgs<Data>
const FIRE = svb.controller.Instruction.FIRE

export const initialData: Data = { targets: [] }
export default ({ stats, radar, memory, ship, comm }: ControllerArgs) => {
  if (stats.position.speed < 0.08)
    return ship.thrust(0.08 - stats.position.speed)
  const messages = comm.getNewMessages()

  const ally = radar.find(res => {
    const isSameTeam = res.team === stats.team
    if (!isSameTeam) return false
    const source = stats.position
    const target = svb.helpers.nextPosition(200)(res.position)
    const finalAngle = svb.helpers.angle({ source, target })
    const direction = finalAngle - stats.position.direction
    return Math.abs(direction) < 0.1
  })

  const closeEnemy = radar
    .filter(res => res.team !== stats.team && !res.destroyed)
    .map(res => ({ res, dist: dist2(res.position, stats.position) }))

  if (closeEnemy.length > 0) {
    const nearestEnemy = closeEnemy.reduce((a, v) => (a.dist > v.dist ? v : a))
    const source = stats.position
    const target = nearestEnemy.res.position
    const threshold = 4 / Math.sqrt(nearestEnemy.dist)
    const speed = stats.weapons[0]?.bullet.position.speed
    const delay = Math.sqrt(nearestEnemy.dist) / speed
    const resAim = svb.helpers.aim({ ship, source, target, threshold, delay })
    if (resAim.id === FIRE && ally) return ship.idle()
    return resAim
  }

  if (messages.length > 0) {
    const targets = messages
      .map(m => m.content.message.map((res: any) => res))
      .reduce((acc, val) => [...acc, ...val]) as Array<Position>
    memory.targets = targets
  }

  if (memory.targets.length > 0 && stats.weapons[1].coolDown === 0) {
    const target = svb.helpers.nextPosition(200)(
      memory.targets
        .map(res => ({ res, dist: dist2(res, stats.position) }))
        .reduce((a, v) => (a.dist > v.dist ? v : a)).res
    )
    memory.targets = memory.targets.filter(t => t !== target)
    //const target = svb.helpers.nextPosition(200)(memory.targets.pop()!)
    return svb.helpers.aim({ ship, source: stats.position, target })
  }

  return ship.idle()
}
