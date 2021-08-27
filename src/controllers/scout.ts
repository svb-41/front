import { Controller, ControllerArgs } from '../engine/control'
import { Ship } from '../engine/ship'

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
    if (stats.position.speed < 0.1) return ship.thrust()
    if (radar.length > 0) {
      const enemy = radar
        .filter(res => res.team !== stats.team && !res.destroyed)
        .map(res => res.position)
      if (enemy.length > 0) comm.sendMessage(enemy)
    }
    return ship.idle()
  }
  return new Controller<Data>(shipId, getInstruction, {})
}

export default forward
