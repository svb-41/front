import { Fragment, useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Column } from '@/components/flex'
import { Button } from '@/components/button'
import { Title, SubTitle } from '@/components/title'
import * as services from '@/services/mission'
import styles from './Missions.module.css'
import s from './missions.strings.json'

const useTitle = (mission: services.Mission, selected: number) => {
  const [title, setTitle] = useState('')
  const timer = useRef<any>()
  useEffect(() => {
    if (timer.current) clearTimeout(timer.current)
    const fun = (slice: number) => {
      if (slice <= mission.subtitle.length) {
        setTitle(mission.subtitle.slice(0, slice))
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
  const cl = opened ? styles.mswOpened : styles.missionsSelectorWrapper
  return (
    <div className={cl} onClick={() => !opened && reset()}>
      <Title content={opened ? s.mission.select : s.mission.back} />
      {opened && (
        <div className={styles.missionsSelector}>
          {services.missions.map((miss, index) => {
            const unlocked =
              missions.includes(miss.id) ||
              process.env.NODE_ENV === 'development'
            const isSelected = selected === index
            const sel = isSelected
              ? styles.selectedMissionSelector
              : styles.unlockedMissionSelector
            const clName = unlocked ? sel : styles.lockedMissionSelector
            const st = { cursor: unlocked ? 'pointer' : 'auto' }
            const onClick = () => unlocked && setSelected(index)
            return (
              <button className={clName} onClick={onClick} style={st}>
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

const Description = ({ title, description: desc, constraints }: any) => {
  const constr = constraints || s.info.none
  return (
    <Fragment>
      <div className={styles.typing}>{title}</div>
      <MessageInformationsLabeled title={s.info.content} content={desc} />
      <MessageInformationsLabeled title={s.info.problems} content={constr} />
    </Fragment>
  )
}

export const MissionInformations = ({ mission, selected, opened }: any) => {
  const title = useTitle(mission, selected)
  return (
    <div className={styles.info}>
      <Column>
        <Title content={`${mission.id} – ${mission.title}`} />
        {opened && <SubTitle blinking content="HQ message incoming!" />}
      </Column>
      {opened && <Description {...mission} title={title} />}
    </div>
  )
}

export type SubmitProps = { opened: boolean; selected: number }
export const Submit = ({ opened, selected }: SubmitProps) => {
  const navigate = useNavigate()
  if (!opened) return null
  const onPrepare = () => navigate(`/mission/${selected}`)
  return (
    <Column>
      <Button onClick={onPrepare} primary text={s.submit} />
    </Column>
  )
}
