import { INSTRUCTION } from '../engine'
import { Controller } from '../engine/control'
import { Ship, RadarResult } from '../engine/ship'

const forward = (ship: Ship) => {
  const shipId = ship.id
  const getInstruction = (ship: Ship, radar: Array<RadarResult>, data: any) => {
    if (data.angle > ship.position.direction && ship.stats.size === 8)
      return INSTRUCTION.TURN_LEFT
    if (ship.position.speed < 0.2) return INSTRUCTION.THRUST
    return INSTRUCTION.IDLE
  }
  return new Controller(shipId, getInstruction, {
    angle: Math.PI / 12 + Math.PI,
  })
}

export default forward
