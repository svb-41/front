import * as svb from '@svb-41/core'

export type Data = {}
export const initialData = {}

export default ({
  stats,
  radar,
  memory,
  ship,
}: svb.controller.ControllerArgs<Data>) => {
  const ally = radar.find(rad => {
    const isSameTeam = rad.team === stats.team
    if (!isSameTeam) return false
    const source = stats.position
    const target = svb.helpers.nextPosition(200)(rad.position)
    const newAngle =
      svb.helpers.angle({ source, target }) - stats.position.direction
    return Math.abs(newAngle) < 0.1
  })

  const closeEnemy = radar
    .filter(res => res.team !== stats.team && !res.destroyed)
    .map(res => ({
      res,
      dist: svb.helpers.dist2(res.position, stats.position),
    }))

  if (closeEnemy.length > 0) {
    const nearestEnemy = closeEnemy.reduce((acc, val) =>
      acc.dist > val.dist ? val : acc
    )
    const source = stats.position
    const target = nearestEnemy.res.position
    const threshold = 1 / Math.sqrt(nearestEnemy.dist)
    const delay =
      Math.sqrt(nearestEnemy.dist) / stats.weapons[0].bullet.position.speed
    const resAim = svb.helpers.aim({ ship, source, target, threshold, delay })
    if (resAim === ship.fire() && ally) return ship.idle()
    return resAim
  }

  return ship.idle()
}
