import * as svb from '@svb-41/core'

type Data = {
  mine: Array<{ x: number; y: number }>
  init: boolean
  lastFire: number
  initialPos: svb.ship.Position
  objPos: svb.ship.Position
}

export const data: Data = {
  mine: [],
  init: false,
  lastFire: 0,
  initialPos: { speed: 0, direction: 0, pos: { x: 0, y: 0 } },
  objPos: { speed: 0, direction: 0, pos: { x: 0, y: 0 } },
}
export const ai: svb.AI<Data> = ({ stats, radar, ship, comm, memory }) => {
  if (!memory.init) {
    memory.objPos = {
      ...stats.position,
      pos: { x: stats.position.pos.x + 1000, y: stats.position.pos.y },
    }
    memory.initialPos = stats.position
    const angle = Math.PI / 8
    const dist = 280
    const direction = stats.position.direction
    const pos = stats.position.pos
    memory.mine = new Array(4)
      .fill(0)
      .map((_, i) => direction - 2 * angle + angle * i)
      .map(a => ({
        x: dist * Math.cos(a) + pos.x,
        y: dist * Math.sin(a) + pos.y,
      }))
    memory.init = true
    return ship.idle()
  }
  if (stats.weapons[2].amo > memory.mine.length) {
    const angle = Math.PI / 8
    const dist = 280
    const direction = stats.position.direction
    const pos = memory.initialPos.pos
    memory.mine = [
      ...memory.mine,
      ...new Array(4 - (stats.weapons[2].amo - memory.mine.length))
        .fill(0)
        .map((_, i) => direction - 2 * angle + angle * i)
        .map(a => ({
          x: dist * Math.cos(a) + pos.x,
          y: dist * Math.sin(a) + pos.y,
        })),
    ]
  }

  const nearestEnemies = svb.radar
    .closeEnemies(radar, stats.team, stats.position)
    .map(p => p.enemy.position)
  if (nearestEnemies.length > 0) comm.sendMessage(nearestEnemies)
  if (stats.shipClass !== svb.ship.SHIP_CLASS.BOMBER) return ship.idle()

  const torpedo = stats.weapons[0]
  const homing = stats.weapons[1]
  const mine = stats.weapons[2]
  if (mine.coolDown === 0 && mine.amo > 0 && memory.mine.length > 0) {
    const target = memory.mine.pop()
    return ship.fire(2, { target, armedTime: 250 })
  }

  const near = svb.radar.nearestEnemy(radar, stats.team, stats.position)
  if (near) {
    const target = near.enemy.position
    if (Date.now() - memory.lastFire > 200)
      return ship.fire(torpedo.coolDown === 0 ? 0 : 1, {
        target: svb.geometry.nextPosition(200)(target).pos,
        armedTime: Math.sqrt(near.dist2) - 100,
      })
  }
  const messages = comm.messagesSince(0)
  if (messages && messages.length > 0) {
    const target: svb.ship.Position = messages.pop()?.content.message.pop()
    if (target && Date.now() - memory.lastFire > 200)
      return ship.fire(torpedo.coolDown === 0 ? 0 : 1, {
        target: svb.geometry.nextPosition(200)(target).pos,
        armedTime: 100,
      })
  }
  if (stats.position.speed > -0.2 && stats.position.pos.x < memory.objPos.pos.x)
    return ship.thrust(-1)
  if (stats.position.pos.x > memory.objPos.pos.x)
    return ship.thrust(-stats.position.speed)
  return ship.idle()
}
