import { INSTRUCTION } from '../engine'
import { Controller } from '../engine/control'
import { Ship, RadarResult } from '../engine/ship'

const hold = (ship: Ship) => {
  const shipId = ship.id
  const getInstruction = (
    ship: Ship,
    radar: Array<RadarResult>,
    _data: any
  ) => {
    const target = radar.find(
      (res: RadarResult) =>
        res.team !== ship.team &&
        Math.abs(
          Math.atan2(res.position.pos.x, res.position.pos.y) -
            ship.position.direction
        ) < 1
    )
    if (target) {
      return INSTRUCTION.FIRE
    }
    return INSTRUCTION.IDLE
  }

  return new Controller(shipId, getInstruction, {})
}

export default hold
