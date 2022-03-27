import * as svb from '@svb-41/core'
const AREA_THRESHHOLD2 = 4000
const REFRESH_TIMEOUT = 20000
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

type Data = {
  init: boolean
  ships: Array<{
    id: string
    shipClass?: string
  }>
  targetArea: Array<{
    pos: svb.ship.Position
    ships: Array<string>
    refresh: number
  }>
}

export const data: Data = {
  init: false,
  ships: [],
  targetArea: [],
}
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
  if (!memory.init) {
    memory.init = true
  }

  if (messages.length > 0) {
    //@ts-ignore
    const enemiesDetected: Array<{
      messageType: 'RADAR'
      pos: Array<svb.ship.RadarResult>
      id: string
    }> = messages.filter(m => m.messageType === 'RADAR')

    enemiesDetected
      .flatMap(m => m.pos.map(r => r.position))
      .filter(
        (pos, i, arr) =>
          i ===
          arr.findIndex(p => p.pos.x === pos.pos.x && p.pos.y === pos.pos.y)
      )
      .map(pos => {
        const nearPos = memory.targetArea.find(
          ta => svb.geometry.dist2(ta.pos, pos) < AREA_THRESHHOLD2
        )
        if (!nearPos)
          memory.targetArea.push({ pos, ships: [], refresh: Date.now() })
        else nearPos.refresh = Date.now()
      })
    memory.targetArea = memory.targetArea
      .filter(ta => Date.now() - ta.refresh <= REFRESH_TIMEOUT)
      .map(ta => {
        if (ta.ships.length === 0) {
          const affected = memory.targetArea.flatMap(ta => ta.ships)
          const available = memory.ships
            .filter(s => s.shipClass !== svb.ship.SHIP_CLASS.SCOUT)
            .find(s => !affected.includes(s.id))
          if (available) {
            const message: SwarmMessage = {
              messageType: 'ATTACK',
              pos: ta.pos,
              id: available.id,
            }
            comm.sendMessage(message)
          }
        }
        return ta
      })
  }

  if (stats.position.speed < 0.1) return ship.thrust()

  return ship.idle()
}
