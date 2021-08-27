import { Controller, ControllerArgs } from 'starships'
import { Ship } from 'starships'

type Data = { angle: number }
const forward = (ship: Ship) => {
  const shipId = ship.id
  const getInstruction = ({ stats, memory, ship }: ControllerArgs) => {
    if (memory.angle > stats.position.direction && stats.stats.size === 8)
      return ship.turnLeft()
    if (stats.position.speed < 0.2) return ship.thrust()
    return ship.idle()
  }
  return new Controller<Data>(shipId, getInstruction, {
    angle: Math.PI / 12 + Math.PI,
  })
}

export default forward
