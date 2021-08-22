import { INSTRUCTION } from '../engine'
import { Controller } from '../engine/control'
import { Ship, RadarResult } from '../engine/ship'
import * as helpers from '@/helpers'

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
          helpers.trigo.angle({ source: ship.position, target: res.position }) -
            ship.position.direction
        ) < 0.1
    )

    if (target) {
      return INSTRUCTION.FIRE
    }

    return INSTRUCTION.THRUST
  }
  return new Controller(shipId, getInstruction, {})
}

export default hold
