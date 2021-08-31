import { Controller, ControllerArgs } from '../engine/control'
import { Ship, dist2 } from '../engine/ship'
import * as helpers from '@/helpers'

type Data = {}
const forward = (ship: Ship) => {
  const shipId = ship.id
  const getInstruction = ({
    stats,
    memory,
    comm,
    radar,
    ship,
  }: ControllerArgs) => {
    if (stats.position.speed < 0.08) return ship.thrust()
    if (radar.length > 0) {
      const enemies = radar
        .filter(res => res.team !== stats.team && !res.destroyed)
        .map(res => res.position)
      if (enemies.length > 0) comm.sendMessage(enemies)
      const importantTarget = radar
        .filter(res => res.team !== stats.team && !res.destroyed)
        .find(enemy => enemy.size === 16)
      if (importantTarget) {
        const targetDist = dist2(stats.position, importantTarget.position)
        return helpers.trigo.aim({
          ship,
          source: stats.position,
          target: importantTarget!.position,
          threshold: 4 / Math.sqrt(targetDist),
          delay:
            Math.sqrt(targetDist) / stats.weapons[0]?.bullet.position.speed,
        })
      }
    }
    return ship.idle()
  }
  return new Controller<Data>(shipId, getInstruction, {})
}

export default forward
