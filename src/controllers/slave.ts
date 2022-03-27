import * as svb from '@svb-41/core'

type State = 'ATTACK' | 'DEFEND' | 'FIRE'

type Data = {
  init: boolean
  state: State
  pos: svb.ship.Position
  speed: number
}

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

const weaponType = (stats: svb.ship.Ship) => {
  const weapon = stats.weapons
    .map((w, i) => ({ w, i }))
    .find(({ w }) => w.coolDown === 0 && w.amo > 0)
  if (weapon) return weapon.i
  return 0
}

const attack = (stats: svb.ship.Ship, radar: any, ship: svb.ControlPanel) => {
  const enemies = svb.radar.closeEnemies(radar, stats.team, stats.position)
  const nearest = svb.radar.nearestEnemy(enemies)
  const ally = radar.find((res: any) => {
    const isSameTeam = res.team === stats.team
    if (!isSameTeam) return false
    const source = stats.position
    const target = svb.geometry.nextPosition(200)(res.position)
    const finalAngle = svb.geometry.angle({ source, target })
    const direction = finalAngle - stats.position.direction
    return Math.abs(direction) < 0.1
  })
  if (nearest) {
    const target = nearest.enemy.position
    const source = stats.position
    const weapon = weaponType(stats)
    if (ally || nearest.dist2 > Math.pow(stats.weapons[weapon].bullet.range, 2))
      return svb.geometry.turnToTarget({
        target,
        source,
        ship,
      })
    return svb.geometry.aim({ target, source, ship, weapon })
  }
  return ship.idle()
}

export const data: Data = {
  init: false,
  state: 'DEFEND',
  speed: 0.6,
  pos: { pos: { x: 0, y: 0 }, speed: 0, direction: 0 },
}
export const ai: svb.AI<Data> = ({ stats, radar, ship, comm, memory }) => {
  if (!memory.init) {
    memory.init = true
    comm.sendMessage({
      messageType: 'REGISTER',
      id: stats.id,
      shipClass: stats.shipClass,
    })
    memory.pos = stats.position
  }
  const messages = comm.messagesSince(0)
  if (messages.length > 0) {
    messages.map(m => {
      const message: SwarmMessage = m.content.message
      if (message.id === stats.id) {
        switch (message.messageType) {
          case 'DEFEND':
            memory.pos = message.pos
            memory.state = 'DEFEND'
            break
          case 'ATTACK':
            memory.pos = message.pos
            memory.state = 'ATTACK'
            break
          case 'FIRE':
            memory.pos = message.pos
            memory.state = 'FIRE'
            break
        }
      }
    })
  }

  const enemies = svb.radar.closeEnemies(radar, stats.team, stats.position)
  const enemyPoss = enemies.map(e => e.enemy)
  if (enemyPoss.length > 0) {
    const m: SwarmMessage = {
      messageType: 'RADAR',
      pos: enemyPoss,
      id: stats.id,
    }
    comm.sendMessage(m)
  }

  if (memory.state === 'DEFEND') {
    const d2 = svb.geometry.dist2(memory.pos, stats.position)
    if (memory.pos && d2 > 400) {
      if (stats.position.speed < memory.speed / 3)
        return ship.thrust(memory.speed - stats.position.speed / 3)
      else
        return svb.geometry.turnToTarget({
          source: stats.position,
          target: memory.pos,
          ship,
        })
    } else {
      if (stats.position.speed > 0) return ship.thrust(-stats.position.speed)
      else return attack(stats, radar, ship)
    }
  }
  if (memory.state === 'ATTACK') {
    if (stats.position.speed < memory.speed)
      return ship.thrust(memory.speed - stats.position.speed)
    const d2 = svb.geometry.dist2(memory.pos, stats.position)
    if (memory.pos && d2 > 4000 && enemies.length === 0) {
      return svb.geometry.turnToTarget({
        source: stats.position,
        target: memory.pos,
        ship,
      })
    }
    return attack(stats, radar, ship)
  }
  if (memory.state === 'FIRE') {
    const weapon = weaponType(stats)
    const target = memory.pos
    const source = stats.position
    if (
      svb.geometry.dist2(target, source) <
      Math.pow(stats.weapons[weapon].bullet.range, 2)
    ) {
      if (stats.weapons[weapon].bullet.stats.acceleration > 0) {
        return ship.fire(weapon, { target: target.pos, armedTime: 200 })
      }
      const resAim = svb.geometry.aim({ target, source, ship, weapon })
      if (resAim.id === 'FIRE' && stats.weapons[weapon].coolDown === 0) {
        memory.pos = stats.position
        memory.state = 'DEFEND'
      }
      return resAim
    }
    return svb.geometry.turnToTarget({
      target,
      source,
      ship,
    })
  }
  return ship.idle()
}
