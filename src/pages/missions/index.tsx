import { useState, useEffect, useRef } from 'react'
import { useSelector } from '@/store/hooks'
import { useNavigate } from 'react-router-dom'
import * as presentation from './presentation'
import * as selectors from '@/store/selectors'
import { HUD } from '@/components/hud'
import { Title } from '@/components/title'
import styles from './Missions.module.css'
import * as services from '@/services/mission'

const useMission = () => {
  const [selected, setSelected] = useState(0)
  const missions = useSelector(selectors.missions)
  const mission = services.getMission(selected.toString())!
  return { selected, missions, mission, setSelected }
}

type State = 'informations' | 'preparations'
export const Missions = () => {
  const navigate = useNavigate()
  const details = useMission()
  const [state, setState] = useState<State>('informations')
  const onPrepare = () => setState('preparations')
  const opened = state === 'informations'
  const reset = () => setState('informations')
  return (
    <HUD>
      <div className={styles.missions}>
        <presentation.MissionSelector
          opened={opened}
          reset={reset}
          {...details}
        />
        <presentation.MissionInformations opened={opened} {...details} />
        {opened && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <button className={styles.startMission} onClick={onPrepare}>
              PREPARE FOR THE MISSION
            </button>
          </div>
        )}
        {!opened && (
          <div className={styles.prepareMission}>
            <Title content="Mission Preparation" />
          </div>
        )}
      </div>
    </HUD>
  )
}
