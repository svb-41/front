import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import * as svb from '@svb-41/engine'
import { useSelector, useDispatch } from '@/store/hooks'
import * as selector from '@/store/selectors'
import { unlockRewards } from '@/store/actions/user'
import { Button } from '@/components/button'
import { Row, Column } from '@/components/flex'
import { Title, SubTitle, Jumbotron } from '@/components/title'
import { Icon } from '@/components/ship'
import { getImage } from '@/helpers/ships'
import { Mission, getMission } from '@/services/mission'
import { winnerTeam } from '@/lib/engine'
import styles from './Missions.module.css'
import trophy from '@/assets/icons/trophy.svg'
import cry from '@/assets/icons/cry.svg'
import s from '@/strings.json'

type RSSProps = { content: string; ships: svb.engine.ship.Ship[] }
const RenderShipsSummary = ({ ships, content }: RSSProps) => (
  <Column background="var(--ddd)" padding="m">
    <SubTitle color="var(--555)" content={content} />
    <Row gap="m" wrap="wrap">
      {ships.map(ship => (
        <Icon shipClass={ship.shipClass} team={ship.team} />
      ))}
    </Row>
  </Column>
)

type SSProps = { ships: svb.engine.ship.Ship[]; team: string; name: string }
const ShipsSummary = ({ ships, team, name }: SSProps) => {
  const yours = ships.filter(ship => ship.team === team)
  const their = ships.filter(ship => ship.team !== team)
  const yText = s.pages.summary.yours
  const tText = s.pages.summary.theirs
  return (
    <Column background="var(--eee)" gap="s" padding="xl" flex={1}>
      <SubTitle content={name} />
      {yours.length > 0 && <RenderShipsSummary ships={yours} content={yText} />}
      {their.length > 0 && <RenderShipsSummary ships={their} content={tText} />}
    </Column>
  )
}

const CongratsOrCry = ({ won }: { won: boolean }) => {
  const { congratsOrCry } = s.pages.summary
  const { congrats, tooBad, brilliantVictory, youLost } = congratsOrCry
  return (
    <Row align="center" gap="xl">
      <img
        src={won ? trophy : cry}
        alt={won ? 'Trophy' : 'Cries'}
        style={{ width: 100 }}
      />
      <Column>
        <Jumbotron content={won ? congrats : tooBad} />
        <Title content={won ? brilliantVictory : youLost} />
      </Column>
    </Row>
  )
}

const MissionsRewards = ({ mission, onMissionClick }: RProps) => {
  if ((mission.rewards?.missions?.length ?? 0) <= 0) return null
  return (
    <Row
      gap="m"
      padding="l"
      wrap="wrap"
      maxWidth={800}
      justify="space-between"
      background="var(--ddd)"
    >
      <Column align="flex-start" gap="s">
        <SubTitle color="var(--555)" content={s.pages.summary.nextMission} />
        {mission.rewards!.missions.map(getMission).map(m => {
          const t = `#${m!.id} – ${m!.title}`
          const cl = () => onMissionClick(m!)
          return <Button primary key={m!.id} onClick={cl} text={t} />
        })}
      </Column>
    </Row>
  )
}

type RProps = {
  mission: Mission
  won: boolean
  onMissionClick: (m: Mission) => void
  team: string
}
const Rewards = (props: RProps) => {
  const { mission, won, team } = props
  if (!(mission.rewards && won)) return null
  return (
    <Column background="var(--eee)" padding="xl" gap="xl">
      <SubTitle content={s.pages.summary.rewards} />
      <MissionsRewards {...props} />
      {mission.rewards.ships.length > 0 && (
        <Row
          gap="m"
          padding="l"
          wrap="wrap"
          maxWidth={800}
          justify="space-between"
          background="var(--ddd)"
        >
          <Column align="flex-start" gap="s">
            <SubTitle
              color="var(--555)"
              content={
                mission.ships.length > 1
                  ? s.pages.summary.unlockedShips
                  : s.pages.summary.unlockedShip
              }
            />
            {mission.rewards.ships.map((ship, i) => (
              <img
                key={i}
                src={getImage(ship.toLowerCase(), team)}
                className={styles.summaryShipImage}
                alt={`${ship}-${team}`}
              />
            ))}
          </Column>
        </Row>
      )}
    </Column>
  )
}

export type Props = {
  engine: svb.engine.Engine
  restart: () => void
  replay: () => void
  back: () => void
  mission: Mission
}
export const Summary = ({ engine, restart, mission, replay, back }: Props) => {
  const playerData = useSelector(selector.userData)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const state = engine.state
  const playerWin = winnerTeam(engine, mission.size) === playerData.color
  useEffect(() => {
    if (mission.rewards && playerWin) {
      const action = unlockRewards(mission.rewards)
      dispatch(action)
    }
  }, [dispatch, mission, playerWin])
  return (
    <Column align="center" justify="center" padding="xxl" gap="xxl">
      <CongratsOrCry won={playerWin} />
      <Row gap="xxl">
        <Column gap="m">
          <Title content={s.pages.summary.someStats} />
          <Row padding="xl" background="var(--eee)">
            <SubTitle
              content={`${s.pages.summary.elapsedTime} ${
                state.timeElapsed / 1000
              } ${s.pages.summary.seconds}`}
            />
          </Row>
          <Row gap="m">
            <ShipsSummary
              name={s.pages.summary.shipsDestroyed}
              ships={state.ships.filter(s => s.destroyed)}
              team={playerData.color}
            />
            <ShipsSummary
              name={s.pages.summary.survivingShips}
              ships={state.ships.filter(s => !s.destroyed)}
              team={playerData.color}
            />
          </Row>
          <Rewards
            mission={mission}
            won={playerWin}
            team={playerData.color}
            onMissionClick={(m: Mission) => {
              restart()
              navigate('/mission/' + m.id)
            }}
          />
        </Column>
        <Column justify="center" gap="xl">
          <Button
            secondary
            text={s.pages.summary.returnToMissionPreparation}
            onClick={restart}
          />
          <Button secondary text={s.pages.summary.replay} onClick={replay} />
          <Button text={s.pages.summary.goBack} onClick={back} />
        </Column>
      </Row>
    </Column>
  )
}
