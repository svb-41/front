import { useState, useEffect, useRef } from 'react'
import { useSelector } from '@/store/hooks'
import { useNavigate } from 'react-router-dom'

import * as selectors from '@/store/selectors'
import { HUD } from '@/components/hud'
import Carousel from '@/components/carousel'
import styles from './Missions.module.css'
import * as services from '@/services/mission'

export const Missions = () => {
  const missions = useSelector(selectors.missions)
  const navigate = useNavigate()
  const [selected, setSelected] = useState(0)
  const mission = services.getMission(selected.toString())!
  const [title, setTitle] = useState('')
  const timer = useRef<any>()
  useEffect(() => {
    if (timer.current) clearTimeout(timer.current)
    const fun = (slice: number) => {
      if (slice <= mission.title.length) {
        setTitle(mission.title.slice(0, slice))
        const value = Math.round(Math.random() * 50)
        const speed = Math.max(20, value)
        timer.current = setTimeout(() => fun(slice + 1), speed)
      }
    }
    fun(1)
  }, [selected])
  return (
    <HUD>
      <div className={styles.missions}>
        <div className={styles.missionsSelectorWrapper}>
          <div className={styles.missionsSelectorTitle}>
            Select your mission
          </div>
          <div className={styles.missionsSelector}>
            {services.missions.map((miss, index) => {
              const unlocked = missions.includes(miss.id)
              const clName = unlocked
                ? selected === index
                  ? styles.selectedMissionSelector
                  : styles.unlockedMissionSelector
                : styles.lockedMissionSelector
              return (
                <button
                  className={clName}
                  onClick={() => unlocked && setSelected(index)}
                  style={{ cursor: unlocked ? 'pointer' : 'auto' }}
                >
                  {index + 1}
                </button>
              )
            })}
          </div>
        </div>
        <div className={styles.info}>
          <div>
            <div className={styles.missionID}>Mission #{mission.id}</div>
            <div className={styles.hqBlinking}>HQ message incoming!</div>
          </div>
          <div className={styles.typing}>{title}</div>
          <div className={styles.message}>
            <div className={styles.messageContent}>Message content</div>
            <p className={styles.description}>{mission.description}</p>
          </div>
          <button
            className={styles.startMission}
            onClick={() => navigate('/mission/' + selected)}
          >
            START THE MISSION
          </button>
        </div>
      </div>
    </HUD>
  )
}
