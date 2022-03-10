import * as svb from '@svb-41/core'
const { dist2 } = svb.helpers

type Data = {}
type ControllerArgs = svb.controller.ControllerArgs<Data>
const FIRE = svb.controller.Instruction.FIRE

export default ({ stats, radar, ship }: ControllerArgs) => {
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
    const threshold = 1 / Math.sqrt(nearestEnemy.dist)
    const speed = stats.weapons[0].bullet.position.speed
    const delay = Math.sqrt(nearestEnemy.dist) / speed
    const resAim = svb.helpers.aim({ ship, source, target, threshold, delay })
    if (resAim.id === FIRE && ally) return ship.idle()
    return resAim
  }

  return ship.idle()
}
