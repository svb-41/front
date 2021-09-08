import { Controller, ControllerArgs } from '@/engine/control'
import { Ship, dist2, RadarResult } from '@/engine/ship'
import { trigo } from '@/helpers'

type Data = {
  targets: Array<{ x: number; y: number }>
}
const hold = (ship: Ship) => {
  const shipId = ship.id
  const getInstruction = ({ stats, radar, memory, ship }: ControllerArgs) => {
    if (radar.length > 0) {
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
        if (nearestEnemy) {
          const target = trigo.nextPosition(Math.sqrt(nearestEnemy.dist) / 0.6)(
            nearestEnemy.res.position
          )
          return ship.fire(stats.weapons[0].coolDown === 0 ? 0 : 1, {
            target: target.pos,
            armedTime: nearestEnemy.dist - 100,
          })
        }
      }
    }
    if (stats.weapons[2].coolDown === 0 && memory.targets.length > 0) {
      return ship.fire(2, { target: memory.targets.pop(), armedTime: 500 })
    }
    return ship.idle()
  }
  return new Controller<Data>(shipId, getInstruction, {
    targets: [
      { x: 500, y: 300 },
      { x: 500, y: 500 },
      { x: 500, y: 700 },
      { x: 500, y: 900 },
    ],
  })
}

export default hold
