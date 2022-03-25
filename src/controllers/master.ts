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

export const data: Data = { ships: [] }
export const ai: svb.AI<Data> = ({ stats, radar, ship, comm, memory }) => {
  const messages: Array<SwarmMessage> = comm
    .messagesSince(0)
    .map(m => m.content.message)
  messages.map(message => {
    if (message.messageType === 'REGISTER') {
      const { messageType, ...rest } = message
      memory.ships.push(rest)
    }
  })

  if (messages.length > 0) {
    //@ts-ignore
    const enemiesDetected: Array<{
      messageType: 'RADAR'
      pos: Array<svb.ship.RadarResult>
      id: string
    }> = messages.filter(m => m.messageType === 'RADAR')
    const destroyer = memory.ships.find(
      ship => ship.shipClass === svb.ship.SHIP_CLASS.DESTROYER
    )
    svb.console.log(JSON.stringify(enemiesDetected[0].pos[0].position))
    if (destroyer && enemiesDetected.length > 0) {
      const m: SwarmMessage = {
        messageType: 'FIRE',
        pos: svb.geometry.nextPosition(600)(enemiesDetected[0].pos[0].position),
        id: destroyer.id,
      }
      comm.sendMessage(m)
    }
  }

  return ship.idle()
}
