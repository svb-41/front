import { useState, useEffect, useRef } from 'react'
import { useSelector } from '@/store/hooks'
import { useNavigate, useLocation } from 'react-router-dom'
import * as presentation from './presentation'
import * as summary from './summary'
import * as selectors from '@/store/selectors'
import { HUD } from '@/components/hud'
import { Title } from '@/components/title'
import { FleetManager } from '@/components/fleet-manager'
import { Button } from '@/components/button'
import { Renderer } from '@/renderer'
import * as color from '@/lib/color'
import { useEngine, State } from '@/lib/engine'
import * as services from '@/services/mission'
import styles from './Missions.module.css'
import s from './missions.strings.json'

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
  const enemy = color.random.find(color => color !== player.color)!
  return { player, enemy, ais }
}

const useSetupEngine = () => {
  const preferences = usePreferences()
  const details = useMission()
  const team = preferences.player.color
  const enemy = preferences.enemy
  const ais = preferences.ais
  const mission = details.mission
  const engine = useEngine({ team, enemy, ais, mission })
  return { preferences, details, engine }
}

export const Missions = () => {
  const { details, engine, preferences } = useSetupEngine()
  const [state, setState] = useState<State>('preparation')
  const navigate = useNavigate()
  const reset = () => navigate('/missions')
  return (
    <HUD links={state === 'preparation'}>
      {state === 'end' && (
        <summary.Summary
          engine={engine.engine!}
          restart={() => {
            engine.reset()
            setState('preparation')
          }}
          replay={() => engine.start(setState)}
          mission={details.mission}
          back={() => {
            navigate('/missions')
            setState('preparation')
            engine.reset()
          }}
        />
      )}
      {state === 'engine' && <Renderer engine={engine.engine!} />}
      {state === 'preparation' && (
        <div className={styles.missions}>
          <presentation.MissionSelector reset={reset} {...details} />
          <presentation.MissionInformations {...details} />
          <presentation.Submit {...details} />
          {!details.opened && (
            <div className={styles.prepareMission}>
              <Title content={s.mission.preparation} />
              <FleetManager
                team={preferences.player.color}
                ships={preferences.player.unlockedShips}
                ais={preferences.ais}
                onValidConfiguration={c => c && engine.setFleet(c)}
                width={2}
                height={5}
              />
              <Button
                primary
                disabled={!engine.fleet}
                onClick={() => engine.start(setState)}
                text={s.launch}
              />
            </div>
          )}
        </div>
      )}
    </HUD>
  )
}
