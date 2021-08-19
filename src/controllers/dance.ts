import { INSTRUCTION } from '../engine'
import { Controller } from '../engine/control'
import { Ship, RadarResult } from '../engine/ship'

const dance = (ship: Ship) => {
  const shipId = ship.id
  const getInstruction = (ship: Ship, radar: Array<RadarResult>, data: any) => {
    // return INSTRUCTION.IDLE
    if (data.wait < 0) {
      const target = radar.find(
        (res: RadarResult) =>
          res.team !== ship.team &&
          Math.abs(
            Math.atan2(res.position.pos.x, res.position.pos.y) -
              ship.position.direction
          ) < 0.2
      )
      if (target) {
        return INSTRUCTION.FIRE
      }
    } else {
      data.wait--
    }
    if (data.num > 0) {
      data.num--
      return data.inst
    }
    if (data.cptDist <= 0 && data.cptTurn <= 0) {
      data.cptDist = 20 + Math.random() * 100
      data.cptTurn = 20 + Math.random() * 20
    }

    if (data.cptDist < 0 && data.cptTurn > 0) {
      if (ship.position.speed) {
        return INSTRUCTION.BACK_THRUST
      }
      data.cptTurn--
      return data.inst
    }
    data.cptDist--
    return ship.position.speed < 11 ? INSTRUCTION.THRUST : INSTRUCTION.IDLE
  }

  return new Controller(shipId, getInstruction, {
    inst: Math.random() > 0.5 ? INSTRUCTION.TURN_RIGHT : INSTRUCTION.TURN_LEFT,
    num: Math.random() * 100 * 0,
    cptDist: 20 + Math.random() * 100,
    cptTurn: 20 + Math.random() * 20,
    wait: 0,
  })
}

export default dance
