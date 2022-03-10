import { engine, helpers } from '@svb-41/engine'
const { ship } = engine
const { dist2 } = ship

type RadarResult = engine.ship.RadarResult

export type Data = { initialDir?: number }
type ControllerArgs = engine.control.ControllerArgs<Data>

export const initialData = {}
export default ({ stats, radar, memory, ship }: ControllerArgs) => {
  if (!memory.initialDir) memory.initialDir = stats.position.direction
  if (stats.position.speed < 0.1) return ship.thrust()

  const ally = radar.find(
    (res: RadarResult) =>
      res.team === stats.team &&
      Math.abs(
        helpers.trigo.angle({
          source: stats.position,
          target: helpers.trigo.nextPosition(200)(res.position),
        }) - stats.position.direction
      ) < 0.1
  )
  const closeEnemy = radar
    .filter((res: RadarResult) => res.team !== stats.team && !res.destroyed)
    .map((res: RadarResult) => ({
      res,
      dist: dist2(res.position, stats.position),
    }))
  if (closeEnemy.length > 0) {
    const nearestEnemy = closeEnemy.reduce((acc, val) =>
      acc.dist > val.dist ? val : acc
    )

    const resAim = helpers.trigo.aim({
      ship,
      source: stats.position,
      target: nearestEnemy.res.position,
      threshold: 4 / Math.sqrt(nearestEnemy.dist),
      delay:
        Math.sqrt(nearestEnemy.dist) / stats.weapons[0]?.bullet.position.speed,
    })
    if (resAim.constructor.name === 'Fire' && ally) return ship.idle()
    return resAim
  }

  if (memory.initialDir - stats.position.direction)
    return ship.turn(memory.initialDir - stats.position.direction)
  return ship.idle()
}
