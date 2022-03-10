import { Controller, ControllerArgs } from '../engine/control'
import { Ship, RadarResult, dist2, Position } from '../engine/ship'
import * as helpers from '@/helpers'

type Data = {}
const heavy = (ship: Ship) => {
  const shipId = ship.id
  const getInstruction = ({
    stats,
    radar,
    memory,
    ship,
    comm,
  }: ControllerArgs) => {
    const messages = comm.getNewMessages()
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
        threshold: 1 / Math.sqrt(nearestEnemy.dist),
        delay:
          Math.sqrt(nearestEnemy.dist) / stats.weapons[0].bullet.position.speed,
      })
      if (resAim === ship.fire() && ally) return ship.idle()
      return resAim
    }
    if (messages.length > 0) {
      const targets = messages
        .map(m => m.content.message.map((res: any) => res))
        .reduce((acc, val) => [...acc, ...val]) as Array<Position>
      memory.targets = targets
    }
    if (memory.targets.length > 0 && stats.weapons[1].coolDown === 0) {
      const target = helpers.trigo.nextPosition(200)(memory.targets.pop())
      return helpers.trigo.aim({ ship, source: stats.position, target })
    }
    return ship.idle()
  }
  return new Controller<Data>(shipId, getInstruction, {})
}

export default heavy
