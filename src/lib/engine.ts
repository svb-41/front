import { useState } from 'react'
import * as svb from '@svb-41/engine'
import { AI } from '@/lib/ai'
import * as fleetManager from '@/components/fleet-manager'
import { findBuilder } from '@/missions/builders'
import { v4 as uuid } from 'uuid'
import { Mission } from '@/services/mission'
type Ship = svb.engine.ship.Ship

export type Size = { width: number; height: number }
export type Teams = [string, string]
export type EnemyData = {
  fleet: fleetManager.Data
  ais: { id: string; compiled: string }[]
  team: string
}
export type Data = {
  ships: svb.engine.ship.Ship[]
  ais: { shipId: string; code: string }[]
}

const emptyData: Data = { ships: [], ais: [] }

const preparePlayerData = async (
  ais: AI[],
  fleetData: fleetManager.Data,
  team: string
) => {
  const start = { x: 0, y: 0 }
  return fleetData.ships.reduce(
    async (acc_, { x, y, shipClass, rotation, id }) => {
      const acc = await acc_
      const value = shipClass.toUpperCase()
      const builder = findBuilder(value)
      const direction = rotation * (-Math.PI / 180) + Math.PI / 2
      const position = { pos: { x: x + start.x, y: y + start.y }, direction }
      const aid = fleetData.ais.find(ai => ai.sid === id)?.aid
      const code = ais.find(ai => ai.id === aid)?.compiledValue
      if (builder && code) {
        const ship = await builder.builder({ position, team })
        const ai = { code, shipId: ship.id }
        return { ...acc, ships: [...acc.ships, ship], ais: [...acc.ais, ai] }
      }
      return acc
    },
    Promise.resolve(emptyData)
  )
}

const prepareEnemyData = async (data: EnemyData, size: Size): Promise<Data> => {
  if (!data) return emptyData
  const { team } = data
  return data.fleet.ships.reduce(async (acc_, ship) => {
    const acc = await acc_
    const builder = findBuilder(ship.shipClass)
    const aid = data.fleet.ais.find(ai => ai.sid === ship.id)?.aid
    const code = data.ais.find(ai => ai.id === aid)?.compiled
    if (builder && code) {
      const direction = ship.rotation * (Math.PI / 180) + Math.PI / 2
      const position = {
        pos: { x: ship.x + size.width, y: ship.y },
        direction,
      }
      const ship_ = await builder.builder({ position, team })
      const ai = { code, shipId: ship_.id }
      const ships = [...acc.ships, ship_]
      const ais = [...acc.ais, ai]
      return { ...acc, ships, ais }
    }
    return acc
  }, Promise.resolve(emptyData))
}

const outOfBound = (ship: Ship, size: Size): boolean => {
  return (
    ship.position.pos.x < -size.width * 2 ||
    ship.position.pos.y < -size.height * 2 ||
    ship.position.pos.x > size.width * 3 ||
    ship.position.pos.y > size.height * 3
  )
}

const outOfAmo = (ship: Ship) => {
  const exhausted = ship.weapons.filter(w => w.amo <= 0)
  const allExhausted = exhausted.length === ship.weapons.length
  return allExhausted
}

const teamDestroyed = (ships: Ship[], team: string, size: Size) => {
  const members = ships.filter(s => s.team === team)
  const filter = (s: Ship) => {
    return s.destroyed || outOfBound(s, size) || outOfAmo(s)
  }
  const dead = members.filter(filter)
  const allDeceased = dead.length === members.length
  return allDeceased
}

const isEnded = (teams: Teams, size: { height: number; width: number }) => {
  return (state: svb.engine.State): boolean => {
    const { ships } = state
    for (const team of teams) {
      const isDestroyed = teamDestroyed(ships, team, size)
      if (isDestroyed) return true
    }
    return false
  }
}

export const outOfCredits = (
  mission: Mission,
  state: svb.engine.State,
  team: String
) =>
  state.ships
    .filter(s => s.team === team)
    .map(s => s.price)
    .reduce((acc, val) => acc + val, 0) > mission.credit

const setupEngine = (
  playerTeam: string,
  enemyTeam: string,
  playerData: Data,
  enemyData: Data,
  size: Size,
  onEnd: () => void
) => {
  const teams: Teams = [playerTeam, enemyTeam]
  const comm = teams.map(id => {
    const channel = new svb.engine.comm.Channel(id)
    return { id, channel }
  })
  const state: svb.engine.State = {
    ships: [...enemyData.ships, ...playerData.ships],
    size: { width: 2000, height: 2000 },
    teams,
    bullets: [],
    maxSpeed: 3,
    comm,
    timeElapsed: 0,
  }
  const ais = [...enemyData.ais, ...playerData.ais]
  const ender = isEnded(teams, size)
  const engine = new svb.engine.Engine(state, ais, ender)
  const toPostMission = () => {
    setTimeout(() => {
      engine.removeEventListener('state.end', toPostMission)
      onEnd()
    }, 1500)
  }
  engine.addEventListener('state.end', toPostMission)
  return engine
}

export type UseEngine = {
  onStart: () => void
  onEnd: () => void
  size: Size
  start?: { x: number; y: number }
  enemy?: EnemyData
  player: {
    team: string
    ais: AI[]
    fleet?: fleetManager.Data
  }
}

export const useEngine = (params: UseEngine) => {
  const [engine, setEngine] = useState<svb.engine.Engine>()
  type UserFleet = fleetManager.Data | undefined
  const [fleet, setFleet] = useState<UserFleet>(params.player.fleet)
  const start = async () => {
    if (!fleet || !params.enemy) return
    const engine = setupEngine(
      params.player.team,
      params.enemy.team,
      await preparePlayerData(params.player.ais, fleet, params.player.team),
      await prepareEnemyData(params.enemy, params.size),
      params.size,
      params.onEnd
    )
    setEngine(engine)
    params.onStart()
  }
  const reset = (fleet?: UserFleet) => {
    setEngine(undefined)
    setFleet(fleet)
  }
  return { engine, start, reset, fleet, setFleet }
}

export const winnerTeam = (engine: svb.engine.Engine, size: Size) => {
  for (const team of engine.state.teams) {
    const isDestroyed = teamDestroyed(engine.state.ships, team, size)
    if (!isDestroyed) return team
  }
}

export const useMissionEnemy = (mission: Mission, team: string): EnemyData => {
  const ships_ = mission.ships.map(s => ({ ...s, id: uuid() }))
  const aiIDs = [...new Set(ships_.map(s => s.ai))]
  const ships = ships_.map(ship => {
    const { id, position, classShip: shipClass } = ship
    const { pos, direction } = position
    const rotation = (direction - Math.PI / 2) / (Math.PI / 180)
    const x = pos.x
    const y = pos.y
    return { id, x, y, rotation, shipClass }
  })
  const ais = ships_.map(ship => {
    const sid = ship.id
    const aid = ship.ai
    return { sid, aid }
  })
  return {
    team,
    fleet: { ships, ais },
    ais: aiIDs.map(id => {
      const compiled = require(`@/missions/ais/${id}.json`)
      return { id, compiled }
    }),
  }
}
