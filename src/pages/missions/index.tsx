import { useState, useEffect, useRef } from 'react'
import { useSelector } from '@/store/hooks'
import { useNavigate, useLocation } from 'react-router-dom'
import * as presentation from './presentation'
import * as selectors from '@/store/selectors'
import { AI } from '@/store/reducers/ai'
import { HUD } from '@/components/hud'
import { Title } from '@/components/title'
import { FleetManager, Data } from '@/components/fleet-manager'
import { Button } from '@/components/button'
import { Renderer } from '@/renderer'
import { Color } from '@/store/reducers/user'
import { Mission } from '@/services/mission'
import * as services from '@/services/mission'
import { findBuilder } from '@/missions/builders'
import { engine } from '@svb-41/engine'
import styles from './Missions.module.css'

const useMission = () => {
  const missions = useSelector(selectors.missions)
  const location = useLocation()
  const matched = location.pathname.match(/mission\/([0-9]+)/) ?? []
  const matchedID = matched[1]
  const id_ = matchedID ? parseInt(matchedID) : null
  const id = id_ && isNaN(id_) ? null : id_
  console.log(id)
  const [selected, setSelected] = useState(id ?? 0)
  useEffect(() => {
    if (id && !isNaN(id)) setSelected(id)
  }, [id])
  const mission = services.getMission(selected.toString())!
  return { selected, missions, mission, setSelected, opened: !((id ?? -1) + 1) }
}

const usePreferences = () => {
  const player = useSelector(selectors.userData)
  const { ais } = useSelector(selectors.ais)
  const colors = Object.values(Color)
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value)
  const enemy = colors.find(color => color !== player.color)!
  return { player, enemy, ais }
}

const prepareMission = (
  setEngineData: (data: any) => void,
  setState: (state: string) => void,
  setEngine: (engine: engine.Engine) => void,
  enemyColor: string,
  ais: AI[],
  team: string,
  data: Data,
  mission: Mission
) => {
  const step = Math.floor(mission.size.height / 10)
  const starts = Object.entries(data.ships).flatMap(([x_, values]) => {
    return Object.entries(values).flatMap(([y_, value]) => {
      const x = parseInt(x_)
      const y = parseInt(y_)
      return { x, y, value: value.toUpperCase() }
    })
  })
  const ships_ = starts.flatMap(({ x, y, value }) => {
    const builder = findBuilder(value)
    const x_ = x * step
    const y_ = mission.size.height - y * step * 2
    const position = { pos: { x: x_, y: y_ }, direction: 0 }
    if (builder) {
      const ship = builder.builder({ position, team })
      const code = ais.find(ai => ai.id === data.AIs[x][y])!.compiledValue
      const ai = { code, shipId: ship.id }
      return [{ ship, ai }]
    }
    return []
  })
  const ships = ships_.map(s => s.ship)
  const AIs = ships_.map(s => s.ai)
  const result = { ships, AIs }
  setEngineData(result)
  const shipsAndAi = mission.ships
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
  console.log(result.AIs)
  const ais_ = [
    ...shipsAndAi.map(({ ship, ai }) => ({
      shipId: ship.id,
      code: require(`@/missions/ais/${ai}.json`) as string,
    })),
    ...result.AIs,
  ]

  const teams = [team, enemyColor]
  const state: engine.State = {
    ships: [...shipsAndAi.map(({ ship }) => ship), ...result.ships],
    size: mission.size,
    teams,
    bullets: [],
    maxSpeed: 3,
    comm: teams.map(id => ({ id, channel: new engine.comm.Channel(id) })),
    timeElapsed: 0,
  }

  const gameEnder = (state: engine.State): boolean =>
    state.ships
      .filter(s => s.team === teams[0])
      .map(s => s.destroyed)
      .reduce((acc, val) => acc && val, true) ||
    state.ships
      .filter(s => s.team === teams[1])
      .map(s => s.destroyed)
      .reduce((acc, val) => acc && val, true) ||
    false
  // @ts-ignore
  const engine_ = new engine.Engine(state, ais_, gameEnder)
  const toPostMission = () => {
    setTimeout(() => {
      engine_.removeEventListener('state.end', toPostMission)
      setState('post')
    }, 1500)
  }
  engine_.addEventListener('state.end', toPostMission)
  setEngine(engine_)
  setState('engine')
}

export const Missions = () => {
  const [engineData, setEngineData] = useState<any>()
  const [engine, setEngine] = useState<engine.Engine>()
  const [state, setState] = useState('prep')
  const [data, setData] = useState<Data | null>(null)
  const navigate = useNavigate()
  const details = useMission()
  const reset = () => navigate('/missions')
  const onPrepare = () => navigate(`/mission/${details.selected}`)
  const preferences = usePreferences()
  return (
    <HUD links={state !== 'engine'}>
      {!!engine && state === 'engine' && <Renderer engine={engine} />}
      {state === 'prep' && (
        <div className={styles.missions}>
          <presentation.MissionSelector reset={reset} {...details} />
          <presentation.MissionInformations {...details} />
          {details.opened && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <Button
                onClick={onPrepare}
                primary
                text="PREPARE FOR THE MISSION"
              />
            </div>
          )}
          {!details.opened && (
            <div className={styles.prepareMission}>
              <Title content="Mission Preparation" />
              <FleetManager
                team={preferences.player.color}
                ships={preferences.player.unlockedShips}
                ais={preferences.ais}
                onValidConfiguration={setData}
                width={2}
                height={5}
              />
              <Button
                primary
                disabled={!Boolean(data)}
                onClick={() =>
                  prepareMission(
                    setEngineData,
                    setState,
                    setEngine,
                    preferences.enemy,
                    preferences.ais,
                    preferences.player.color,
                    data!,
                    details.mission
                  )
                }
                text="Launch the mission"
              />
            </div>
          )}
        </div>
      )}
    </HUD>
  )
}
