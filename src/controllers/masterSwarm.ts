import * as svb from '@svb-41/core'

type SwarmMessage =
  | {
      messageType: 'RADAR'
      pos: Array<svb.ship.RadarResult>
      id: string
    }
  | {
      messageType: 'FIRE'
      pos: svb.ship.Position
      id: string
    }
  | {
      messageType: 'ATTACK'
      pos: svb.ship.Position
      id: string
    }
  | {
      messageType: 'DEFEND'
      pos: svb.ship.Position
      id: string
    }
  | {
      messageType: 'REGISTER'
      id: string
      shipClass?: string
    }

type Data = { ships: Array<{ id: string; shipClass?: string }> }

const start = { speed: 0, direction: 0, pos: { x: 3000, y: 4500 } }
export const data: Data = { ships: [] }
export const ai: svb.AI<Data> = ({ stats, radar, ship, comm, memory }) => {
  const messages: Array<SwarmMessage> = comm
    .messagesSince(0)
    .map(m => m.content.message)
  messages.map(message => {
    if (message.messageType === 'REGISTER') {
      const { messageType, ...rest } = message
      memory.ships.push(rest)
      const m: SwarmMessage = {
        messageType: 'ATTACK',
        pos: start,
        id: rest.id,
      }
      comm.sendMessage(m)
      svb.console.log(JSON.stringify(m))
    }
  })
  const enemy = svb.radar.nearestEnemy(
    svb.radar.closeEnemies(radar, stats.team, stats.position)
  )
  if (enemy)
    return svb.geometry.aim({
      source: stats.position,
      target: start,
      ship,
      weapon: stats.weapons.findIndex(w => w.amo > 0) ?? 0,
    })
  if (stats.position.speed < 0.6) ship.thrust()
  return svb.geometry.turnToTarget({
    source: stats.position,
    target: start,
    ship,
  })
}
