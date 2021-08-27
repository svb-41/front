import { Controller, ControllerArgs } from '@/engine/control'
import { Ship, Position } from '@/engine/ship'
import { trigo } from '@/helpers'

type Data = {
  targets: Array<{ x: number; y: number }>
}
const hold = (ship: Ship) => {
  const shipId = ship.id
  const getInstruction = ({
    stats,
    radar,
    memory,
    ship,
    comm,
  }: ControllerArgs) => {
    const messages = comm.getNewMessages()
    if (messages.length > 0) {
      const targets = messages
        .map(m => m.content.message.map((res: any) => res))
        .reduce((acc, val) => [...acc, ...val]) as Array<Position>
      memory.targets = targets
    }
    if (memory.targets.length > 0) {
      const target = trigo.nextPosition(200)(memory.targets.pop())

      return ship.fire(1, { target: target.pos, armedTime: 800 })
    }

    return ship.idle()
  }
  return new Controller<Data>(shipId, getInstruction, {
    targets: [],
  })
}

export default hold
