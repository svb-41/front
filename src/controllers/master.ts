import * as svb from '@svb-41/core'

type SwarmMessage =
  | {
      messageType: 'RADAR'
      pos: Array<svb.ship.RadarResult>
    }
  | {
      messageType: 'GO'
      pos: svb.ship.Position
    }
  | {
      messageType: 'ATTACK'
      pos: svb.ship.Position
    }
  | {
      messageType: 'DEFEND'
      pos: svb.ship.Position
    }
  | {
      messageType: 'REGISTER'
      id: string
      shipClass?: string
    }

type Data = { ships: Array<{ id: string; shipClass?: string }> }

export const data: Data = { ships: [] }
export const ai: svb.AI<Data> = ({ stats, radar, ship, comm, memory }) => {
  const messages = comm.messagesSince(0)
  messages.map(m => {
    const message: SwarmMessage = m.content.message
    if (message.messageType === 'REGISTER') {
      const { messageType, ...rest } = message
      memory.ships.push(rest)
      comm.sendMessage({
        messageType: 'ATTACK',
        pos: { pos: { x: 400, y: 400 }, speed: 0, direction: 0 },
      })
    }
  })

  const near = svb.radar.nearestEnemy(radar, stats.team, stats.position)
  if (near) {
    const source = stats.position
    const target = near.enemy.position
    const threshold = 1 / Math.sqrt(near.dist2)
    const speed = stats.weapons[0].bullet.position.speed
    const delay = Math.sqrt(near.dist2) / speed
    const resAim = svb.geometry.aim({ ship, source, target, threshold, delay })
    if (resAim.id === svb.Instruction.FIRE) return ship.idle()
    return resAim
  }

  return ship.idle()
}
