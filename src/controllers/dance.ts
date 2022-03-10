import * as svb from '@svb-41/core'

type Data = {
  inst: number
  num: number
  cptDist: number
  cptTurn: number
  wait: number
}
type ControllerArgs = svb.controller.ControllerArgs<Data>

export const initialData = {
  inst: Math.random() - 1,
  num: Math.random() * 100,
  cptDist: 40 + Math.random() * 40,
  cptTurn: 20 + Math.random() * 20,
  wait: 0,
}
export default ({ stats, radar, memory, ship }: ControllerArgs) => {
  if (memory.wait < 0) {
    const target = radar.find(res => {
      const isDifferentTeam = res.team !== stats.team
      if (!isDifferentTeam) return false
      const source = stats.position
      const target = res.position
      const angle = svb.helpers.angle({ source, target })
      const dir = angle - stats.position.direction
      return Math.abs(dir) < 0.01
    })
    if (target) return ship.fire()
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
    if (stats.position.speed) return ship.thrust(-1)
    memory.cptTurn--
    return ship.turn(memory.inst)
  }
  memory.cptDist--
  return stats.position.speed < 11 ? ship.thrust() : ship.idle()
}
