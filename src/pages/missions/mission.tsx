import { useState, useRef } from 'react'
import missionsJSON from '@/missions/confs.json'
import aisJson from '@/missions/ai.json'
import { findBuilder } from '@/missions/builders'
import * as HUD from '@/components/hud'
import { useLocation } from 'react-router-dom'
import { useSelector } from '@/store/hooks'
import * as selector from '@/store/selectors'
import { Color } from '@/store/reducers/user'
import { SHIP_CLASS, Position, Ship } from '@/engine/ship'
import { State, Engine } from '@/engine'
import { Channel } from '@/engine/comm'
import { Renderer } from '@/renderer'
import PreMissions, { PlayerData } from './preMissions'

//@ts-ignore fuck off TS
const missions: { [k: string]: Mission } = missionsJSON
const enemyControllers: { [k: string]: string } = aisJson

type SerializedShip = { classShip: SHIP_CLASS; ai: string; position: Position }

export type Mission = {
  title: string
  description: string
  size: { height: number; width: number }
  ships: Array<SerializedShip>
  credit: number
}

const colors = [Color.BLUE, Color.RED, Color.YELLOW, Color.GREEN, Color.WHITE]
  .map(value => ({ value, sort: Math.random() }))
  .sort((a, b) => a.sort - b.sort)
  .map(({ value }) => value)

const Mission = () => {
  const [start, setStart] = useState<boolean>(false)
  const location = useLocation()
  const playerColor = useSelector(selector.userColor)
  const [missionId] = location.pathname.split('/').reverse()
  const mission: Mission = missions[missionId]
  const enemyColor: Color = colors.find(c => c !== playerColor)!

  const teams = [playerColor, enemyColor]

  const shipsAndAi: Array<{ ship: Ship; ai: string }> = mission.ships
    .map(ship => ({
      ...ship,
      builder: findBuilder(ship.classShip),
    }))
    .filter(ship => ship.builder)
    .map(ship => ({
      ai: ship.ai,
      ship:
        ship.builder &&
        ship.builder.builder({ position: ship.position, team: enemyColor }),
    }))

  const ships = shipsAndAi.map(({ ship }) => ship)

  const defaultAis: Array<{ shipId: string; code: string }> = shipsAndAi.map(
    ({ ship, ai }) => ({ shipId: ship.id, code: enemyControllers[ai] })
  )

  const defaultState: State = {
    ships,
    size: mission.size,
    teams,
    bullets: [],
    maxSpeed: 3,
    comm: teams.map(id => ({ id, channel: new Channel(id) })),
    timeElapsed: 0,
  }

  const state = useRef(defaultState)
  const ais = useRef(defaultAis)

  const playerSubmit = (data: PlayerData) => {
    state.current = {
      ...state.current,
      ships: [...state.current.ships, ...data.ships],
    }
    ais.current = [...ais.current, ...data.AIs]
    setStart(true)
  }

  const generateEngine = () => {
    const gameEnder = (state: State): boolean =>
      state.ships
        .filter(s => s.team === teams[0])
        .map(s => s.destroyed)
        .reduce((acc, val) => acc && val, true) ||
      state.ships
        .filter(s => s.team === teams[1])
        .map(s => s.destroyed)
        .reduce((acc, val) => acc && val, true) ||
      false
    return new Engine(state.current, ais.current, gameEnder)
  }

  return (
    <>
      <HUD.HUD title="Missions" back="/missions" />
      {start ? (
        <Renderer engine={generateEngine()} />
      ) : (
        <PreMissions
          onSubmit={playerSubmit}
          mission={mission}
          teams={teams.map(c => c.toString())}
        />
      )}
    </>
  )
}

export default Mission
