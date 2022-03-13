import { useState } from 'react'
// import aisJson from '@/missions/ai.json'
import { findBuilder } from '@/missions/builders'
import { HUD } from '@/components/hud'
import { useLocation } from 'react-router-dom'
import { useSelector } from '@/store/hooks'
import * as selector from '@/store/selectors'
import { Color } from '@/store/reducers/user'
import { engine } from '@svb-41/engine'
import { Renderer } from '@/renderer'
import { PreMissions, PlayerData } from './pre-mission'
import PostMissions from './postMission'
import { getMission } from '@/services/mission'

type State = engine.State
// type SHIP_CLASS = engine.ship.SHIP_CLASS
// type Position = engine.ship.Position
type Ship = engine.ship.Ship

const { Engine } = engine
const { Channel } = engine.comm

type MissionState = 'pre' | 'mission' | 'post'

const colors = [Color.BLUE, Color.RED, Color.YELLOW, Color.GREEN, Color.WHITE]
  .map(value => ({ value, sort: Math.random() }))
  .sort((a, b) => a.sort - b.sort)
  .map(({ value }) => value)

export const Mission = () => {
  const [missionState, setMissionState] = useState<MissionState>('pre')
  const [engine, setEngine] = useState<engine.Engine>()
  const [data, setData] = useState<PlayerData>()
  const location = useLocation()
  const playerColor = useSelector(selector.userColor)
  const [missionId] = location.pathname.split('/').reverse()
  const mission = getMission(missionId)!
  const enemyColor: Color = colors.find(c => c !== playerColor)!
  const restart = () => {
    setMissionState('pre')
    setEngine(undefined)
    setData(undefined)
  }

  const replay = () => {
    if (data) playerSubmit(data)
  }

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

  const playerSubmit = (data: PlayerData) => {
    setData(data)
    const ais = [
      ...shipsAndAi.map(({ ship, ai }) => ({
        shipId: ship.id,
        code: require(`@/missions/ais/${ai}.json`) as string,
      })),
      ...data.AIs,
    ]

    const state: State = {
      ships: [...shipsAndAi.map(({ ship }) => ship), ...data.ships],
      size: mission.size,
      teams,
      bullets: [],
      maxSpeed: 3,
      comm: teams.map(id => ({ id, channel: new Channel(id) })),
      timeElapsed: 0,
    }

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
    const engine = new Engine(state, ais, gameEnder)
    const toPostMission = () => {
      setTimeout(() => {
        engine.removeEventListener('state.end', toPostMission)
        setMissionState('post')
      }, 1500)
    }
    engine.addEventListener('state.end', toPostMission)
    setMissionState('mission')
    setEngine(engine)
  }

  return (
    <HUD>
      {engine ? (
        missionState === 'mission' ? (
          <Renderer {...{ engine }} />
        ) : (
          <PostMissions {...{ engine, restart, mission, replay }} />
        )
      ) : (
        <PreMissions
          onSubmit={playerSubmit}
          mission={mission}
          teams={teams.map(c => c.toString())}
        />
      )}
    </HUD>
  )
}
