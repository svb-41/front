import { Controller, ControllerArgs } from '../engine/control'
import { Ship, RadarResult } from '../engine/ship'
import * as helpers from '@/helpers'

type Data = {
  inst: number
  num: number
  cptDist: number
  cptTurn: number
  wait: number
}
const dance = (ship: Ship) => {
  const shipId = ship.id
  const getInstruction = ({ stats, radar, memory, ship }: ControllerArgs) => {
    // return INSTRUCTION.IDLE
    if (memory.wait < 0) {
      const target = radar.find(
        (res: RadarResult) =>
          res.team !== stats.team &&
          Math.abs(
            helpers.trigo.angle({
              source: stats.position,
              target: res.position,
            }) - stats.position.direction
          ) < 0.01
      )
      if (target) {
        return ship.fire()
      }
    } else {
      memory.wait--
    }
    if (memory.num > 0) {
      memory.num--
      return memory.inst
    }
    if (memory.cptDist <= 0 && memory.cptTurn <= 0) {
      memory.cptDist = 20 + Math.random() * 100
      memory.cptTurn = 20 + Math.random() * 20
    }

    if (memory.cptDist < 0 && memory.cptTurn > 0) {
      if (stats.position.speed) {
        return ship.thrust(-1)
      }
      memory.cptTurn--
      return ship.turn(memory.inst)
    }
    memory.cptDist--
    return stats.position.speed < 11 ? ship.thrust() : ship.idle()
  }

  return new Controller<Data>(shipId, getInstruction, {
    inst: Math.random() - 1,
    num: Math.random() * 100,
    cptDist: 40 + Math.random() * 40,
    cptTurn: 20 + Math.random() * 20,
    wait: 0,
  })
}

export default dance
