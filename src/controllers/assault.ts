import { Controller, ControllerArgs } from '../engine/control'
import { Ship, RadarResult, dist2 } from '../engine/ship'
import * as helpers from '@/helpers'

type Data = { turn: boolean }
const assault = (ship: Ship) => {
  const shipId = ship.id
  const getInstruction = ({ stats, radar, memory, ship }: ControllerArgs) => {
    if (stats.stats.size === 8) {
      if (memory.turn) {
        memory.turn = false
        return Math.random() > 0.5 ? ship.turnLeft() : ship.turnRight()
      }
      if (stats.position.speed < 0.1) {
        return ship.thrust()
      }
    } else {
      if (stats.position.speed < 0.1) {
        return ship.thrust()
      }
    }
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
        threshold: 0.02,
        delay:
          Math.sqrt(nearestEnemy.dist) /
          stats.weapons[0]?.bullet.position.speed,
      })
      if (resAim.constructor.name === 'Fire' && ally) return ship.idle()
      return resAim
    }

    return ship.idle()
  }
  return new Controller<Data>(shipId, getInstruction, { turn: false })
}

export default assault
