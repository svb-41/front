import { Fragment, useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Column } from '@/components/flex'
import { Button } from '@/components/button'
import { Title, SubTitle } from '@/components/title'
import * as preparation from './preparation'
import * as services from '@/services/mission'
import styles from './Missions.module.css'
import s from '@/strings.json'

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
  }, [mission.subtitle, selected])
  return title
}

export const MissionSelector = (props: any) => {
  const { missions, selected, setSelected, opened, reset } = props
  const title = opened
    ? s.pages.missions.mission.select
    : s.pages.missions.mission.back
  return (
    <Column
      background={opened ? 'var(--eee)' : 'var(--warn-red)'}
      gap="xl"
      padding="xl"
      color={!opened ? 'var(--white)' : undefined}
      className={opened ? styles.mswOpened : undefined}
      onClick={opened ? undefined : () => reset()}
    >
      <Title content={title} />
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
              <button
                key={index}
                className={clName}
                onClick={onClick}
                style={st}
              >
                {index + 1}
              </button>
            )
          })}
        </div>
      )}
    </Column>
  )
}

const MessageInformationsLabeled = ({ title, content }: any) => (
  <Column padding="m" gap="s" background="var(--ddd)">
    <div className={styles.messageContent}>{title}</div>
    <p>{content}</p>
  </Column>
)

const Description = ({ title, description, constraints }: any) => (
  <Fragment>
    <p>{title}</p>
    <MessageInformationsLabeled
      title={s.pages.missions.info.content}
      content={description}
    />
    <MessageInformationsLabeled
      title={s.pages.missions.info.problems}
      content={constraints || s.none}
    />
  </Fragment>
)

export type ShipsProps = any
export const Ships = ({ mission, opened, team }: ShipsProps) => {
  if (!opened) return null
  return <preparation.EnemyShips mission={mission} team={team} />
}

export const MissionInformations = ({ mission, selected, opened }: any) => {
  const title = useTitle(mission, selected)
  return (
    <Column padding="xl" gap="xl" background="var(--eee)">
      <Column>
        <Title content={`${parseInt(mission.id) + 1} – ${mission.title}`} />
        {opened && <SubTitle blinking content={s.incomingMessage} />}
      </Column>
      {opened && <Description {...mission} title={title} />}
    </Column>
  )
}

export type SubmitProps = { opened: boolean; selected: number }
export const Submit = ({ opened, selected }: SubmitProps) => {
  const navigate = useNavigate()
  if (!opened) return null
  const onPrepare = () => navigate(`/mission/${selected}`)
  return (
    <Column>
      <Button onClick={onPrepare} primary text={s.pages.missions.submit} />
    </Column>
  )
}
