import { INSTRUCTION } from '../engine'
import { Controller } from '../engine/control'
import { Ship, RadarResult } from '../engine/ship'

type Data = { angle: number }
const forward = (ship: Ship) => {
  const shipId = ship.id
  const getInstruction = (ship: Ship, radar: RadarResult[], data: Data) => {
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
