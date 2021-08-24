import { Controller, ControllerArgs } from '../engine/control'
import { Ship, RadarResult, dist2 } from '../engine/ship'
import * as helpers from '@/helpers'

type Data = {}
const hold = (ship: Ship) => {
  const shipId = ship.id
  const getInstruction = ({ stats, radar, memory, ship }: ControllerArgs) => {
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
      const nearestEnemy: RadarResult = closeEnemy.reduce((acc, val) =>
        acc.dist > val.dist ? val : acc
      ).res

      const resAim = helpers.trigo.aim({
        ship,
        source: stats.position,
        target: nearestEnemy.position,
        threshold: 0.1,
        delay: 200,
      })
      if (resAim === ship.fire() && ally) return ship.idle()
      return resAim
    }

    return ship.idle()
  }
  return new Controller<Data>(shipId, getInstruction, {})
}

export default hold
