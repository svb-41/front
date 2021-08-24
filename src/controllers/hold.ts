import { INSTRUCTION } from '../engine'
import { Controller } from '../engine/control'
import { Ship, RadarResult, dist2 } from '../engine/ship'
import * as helpers from '@/helpers'

type Data = {}
const hold = (ship: Ship) => {
  const shipId = ship.id
  const getInstruction = (ship: Ship, radar: RadarResult[], _data: Data) => {
    const ally = radar.find(
      (res: RadarResult) =>
        res.team === ship.team &&
        Math.abs(
          helpers.trigo.angle({
            source: ship.position,
            target: helpers.trigo.nextPosition(200)(res.position),
          }) - ship.position.direction
        ) < 0.1
    )

    const closeEnemy = radar
      .filter((res: RadarResult) => res.team !== ship.team && !res.destroyed)
      .map((res: RadarResult) => ({
        res,
        dist: dist2(res.position, ship.position),
      }))
    if (closeEnemy.length > 0) {
      const nearestEnemy: RadarResult = closeEnemy.reduce((acc, val) =>
        acc.dist > val.dist ? val : acc
      ).res

      const resAim = helpers.trigo.aim({
        source: ship.position,
        target: nearestEnemy.position,
        threshold: 0.1,
        delay: 200,
      })
      if (resAim === INSTRUCTION.FIRE && ally) return INSTRUCTION.IDLE
      return resAim
    }

    return INSTRUCTION.IDLE
  }
  return new Controller(shipId, getInstruction, {})
}

export default hold
