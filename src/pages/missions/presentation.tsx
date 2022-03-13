import { Fragment, useState, useEffect, useRef } from 'react'
import { Title, SubTitle } from '@/components/title'
import * as services from '@/services/mission'
import styles from './Missions.module.css'

const useTitle = (mission: services.Mission, selected: number) => {
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
  return title
}

export const MissionSelector = (props: any) => {
  const { missions, selected, setSelected, opened, reset } = props
  const title = opened ? 'Select your mission' : 'Back to selection'
  return (
    <div
      className={styles.missionsSelectorWrapper}
      onClick={() => !opened && reset()}
      style={{
        gridRow: opened ? '1 / 3' : undefined,
        cursor: opened ? undefined : 'pointer',
      }}
    >
      <Title content={title} />
      {opened && (
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
      )}
    </div>
  )
}

const MessageInformationsLabeled = ({ title, content }: any) => (
  <div className={styles.message}>
    <div className={styles.messageContent}>{title}</div>
    <p className={styles.description}>{content}</p>
  </div>
)

export const MissionInformations = ({ mission, selected, opened }: any) => {
  const title = useTitle(mission, selected)
  return (
    <div className={styles.info}>
      <div>
        <Title content={`Mission ${mission.id}`} />
        {opened && <SubTitle blinking content="HQ message incoming!" />}
      </div>
      {opened && (
        <Fragment>
          <div className={styles.typing}>{title}</div>
          <MessageInformationsLabeled
            title="Message content"
            content={mission.description}
          />
          <MessageInformationsLabeled
            title="Problems & constraints"
            content={mission.constraints ?? 'None'}
          />
        </Fragment>
      )}
    </div>
  )
}
