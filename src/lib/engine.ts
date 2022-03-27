import { useState, useMemo } from 'react'
import * as svb from '@svb-41/engine'
import { Mission } from '@/services/mission'
import { AI } from '@/lib/ai'
import * as fleet from '@/components/fleet-manager'
import { findBuilder } from '@/missions/builders'

export type State = 'preparation' | 'engine' | 'end'
type Teams = [string, string]
type SetState = (value: State) => void

const emptyData: Data = { ships: [], ais: [] }
export type Data = {
  ships: svb.engine.ship.Ship[]
  ais: { shipId: string; code: string }[]
}

export type UseEngine = {
  team: string
  enemy: string
  ais: AI[]
  mission: Mission
}

const prepareData = (props: UseEngine, fleetData: fleet.Data): Data => {
  const start = props.mission.start ? props.mission.start : { x: 0, y: 0 }
  return fleetData.ships.reduce((acc, { x, y, shipClass, rotation, id }) => {
    const value = shipClass.toUpperCase()
    const builder = findBuilder(value)
    const direction = rotation * (Math.PI / 180) - Math.PI / 2
    const position = { pos: { x: x + start.x, y: y + start.y }, direction }
    const code = props.ais.find(
      ai => ai.id === fleetData.ais.find(ai => ai.sid === id)?.aid
    )?.compiledValue
    if (builder && code) {
      const { team } = props
      const ship = builder.builder({ position, team })
      const ai = { code, shipId: ship.id }
      return { ...acc, ships: [...acc.ships, ship], ais: [...acc.ais, ai] }
    }
    return acc
  }, emptyData)
}

const prepareEnemyData = (props: UseEngine): Data => {
  const team = props.enemy
  return props.mission.ships.reduce<Data>((acc, { position, ...dat }) => {
    const builder = findBuilder(dat.classShip)
    const code: string = require(`@/missions/ais/${dat.ai}.json`)
    if (builder && code) {
      const ship = builder.builder({ position, team })
      const ai = { code, shipId: ship.id }
      const ships = [...acc.ships, ship]
      const ais = [...acc.ais, ai]
      return { ...acc, ships, ais }
    }
    return acc
  }, emptyData)
}

const outOfBound = (
  ship: svb.engine.ship.Ship,
  size: { height: number; width: number }
): boolean =>
  ship.position.pos.x < -size.width * 2 ||
  ship.position.pos.y < -size.height * 2 ||
  ship.position.pos.x > size.width * 3 ||
  ship.position.pos.y > size.height * 3

const outOfAmo = (ship: svb.engine.ship.Ship) =>
  ship.weapons.map(w => w.amo <= 0).reduce((acc, val) => acc && val, true)

const teamDestroyed = (
  ships: svb.engine.ship.Ship[],
  team: string,
  size: { height: number; width: number }
) => {
  return ships
    .filter(s => s.team === team)
    .map(s => s.destroyed || outOfBound(s, size) || outOfAmo(s))
    .reduce((acc, val) => acc && val, true)
}

const isEnded = (teams: Teams, size: { height: number; width: number }) => {
  return (state: svb.engine.State): boolean => {
    const { ships } = state
    return teams
      .map(t => teamDestroyed(ships, t, size))
      .reduce((acc, val) => acc || val, false)
  }
}

type SetupEngine = {
  props: UseEngine
  enemy: Data
  data: Data
  setState: SetState
}
const setupEngine = ({ props, enemy, data, setState }: SetupEngine) => {
  const teams: Teams = [props.team, props.enemy]
  const comm = teams.map(id => {
    const channel = new svb.engine.comm.Channel(id)
    return { id, channel }
  })
  const state: svb.engine.State = {
    ships: [...enemy.ships, ...data.ships],
    size: props.mission.size,
    teams,
    bullets: [],
    maxSpeed: 3,
    comm,
    timeElapsed: 0,
  }
  const ais = [...enemy.ais, ...data.ais]
  const engine = new svb.engine.Engine(
    state,
    ais,
    isEnded(teams, props.mission.size)
  )
  const toPostMission = () => {
    setTimeout(() => {
      engine.removeEventListener('state.end', toPostMission)
      setState('end')
    }, 1500)
  }
  engine.addEventListener('state.end', toPostMission)
  return engine
}

export const useEngine = (props: UseEngine) => {
  const [engine, setEngine] = useState<svb.engine.Engine>()
  const [fleetData, setFleetData] = useState<fleet.Data>()

  const start = (setState: SetState) => {
    if (!fleetData) return
    const data = prepareData(props, fleetData)
    const enemy = prepareEnemyData(props)
    const engine = setupEngine({ props, enemy, data, setState })
    setEngine(engine)
    setState('engine')
  }

  const reset = () => {
    setEngine(undefined)
    setFleetData(undefined)
  }

  const fleet = fleetData
  const setFleet = setFleetData
  return { engine, start, reset, fleet, setFleet }
}
