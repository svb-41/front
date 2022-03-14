import { useState } from 'react'
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
  const step = Math.floor(props.mission.size.height / 10)
  const starts = Object.entries(fleetData.ships).flatMap(([x_, values]) => {
    return Object.entries(values).flatMap(([y_, value]) => {
      const x = parseInt(x_)
      const y = parseInt(y_)
      return { x, y, value: value.toUpperCase() }
    })
  })
  return starts.reduce<Data>((acc, { x, y, value }) => {
    const builder = findBuilder(value)
    const x_ = x * step
    const y_ = props.mission.size.height - y * step * 2
    const position = { pos: { x: x_, y: y_ }, direction: 0 }
    const findAI = (ai: AI) => ai.id === fleetData.AIs[x][y]
    const code = props.ais.find(findAI)?.compiledValue
    if (builder && code) {
      const { team } = props
      const ship = builder.builder({ position, team })
      const ai = { code, shipId: ship.id }
      const ships = [...acc.ships, ship]
      const ais = [...acc.ais, ai]
      return { ...acc, ships, ais }
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

const teamDestroyed = (ships: svb.engine.ship.Ship[], team: string) => {
  return ships
    .filter(s => s.team === team)
    .map(s => s.destroyed)
    .reduce((acc, val) => acc && val, true)
}

const isEnded = (teams: Teams) => {
  return (state: svb.engine.State): boolean => {
    const { ships } = state
    const [fst, snd] = teams
    return teamDestroyed(ships, fst) || teamDestroyed(ships, snd) || false
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
  const engine = new svb.engine.Engine(state, ais, isEnded(teams))
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

  return { engine, start, fleet: fleetData, setFleet: setFleetData }
}
