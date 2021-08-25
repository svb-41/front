import { Controller, ControllerArgs } from '../engine/control'
import { Ship, RadarResult } from '../engine/ship'

type Data = {
  targets: Array<{ x: number; y: number }>
}
const hold = (ship: Ship) => {
  const shipId = ship.id
  const getInstruction = ({ stats, radar, memory, ship }: ControllerArgs) => {
    if (memory.targets.length > 0) {
      if (stats.weapons[1].coolDown === 0) {
        const target = memory.targets.pop()
        return ship.fire(1, { target, armedTime: 800 })
      }
    } else {
      // const enemy = radar.filter((res: RadarResult) => res.team !== stats.team)
      // memory.targets = enemy.map(res => res.position.pos)
    }
    return ship.idle()
  }
  return new Controller<Data>(shipId, getInstruction, {
    targets: [
      { x: 401, y: 300 },
      { x: 401, y: 500 },
      { x: 401, y: 700 },
      { x: 401, y: 900 },
    ],
  })
}

export default hold
