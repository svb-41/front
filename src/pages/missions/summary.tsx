import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import * as svb from '@svb-41/engine'
import { useSelector, useDispatch } from '@/store/hooks'
import * as selector from '@/store/selectors'
import { unlockRewards } from '@/store/actions/user'
import { Button } from '@/components/button'
import { Row, Column } from '@/components/flex'
import { Title, SubTitle, Jumbotron } from '@/components/title'
import { getImage } from '@/helpers/ships'
import { Mission, getMission } from '@/services/mission'
import styles from './Missions.module.css'
import trophy from '@/assets/icons/trophy.svg'
import cry from '@/assets/icons/cry.svg'

const ShipsSummary = ({
  ships,
  team,
  name,
}: {
  ships: svb.engine.ship.Ship[]
  team: string
  name: string
}) => {
  const yours = ships.filter(ship => ship.team === team)
  const theirs = ships.filter(ship => ship.team !== team)
  return (
    <Column background="#eee" gap="s" padding="xl" flex={1}>
      <SubTitle content={name} />
      {yours.length > 0 && (
        <Column background="#ddd" padding="m">
          <SubTitle color="#555" content="Yours" />
          <Row gap="m" wrap="wrap">
            {yours.map((ship, i) => (
              <div key={i} className={styles.availableShip}>
                <img
                  src={getImage(ship.shipClass.toLowerCase(), ship.team)}
                  className={styles.summaryShipImage}
                  alt={`${ship.shipClass}-${ship.team}`}
                />
              </div>
            ))}
          </Row>
        </Column>
      )}
      {theirs.length > 0 && (
        <Column background="#ddd" padding="m">
          <SubTitle color="#555" content="Theirs" />
          <Row gap="m" wrap="wrap">
            {theirs.map((ship, i) => (
              <div key={i} className={styles.availableShip}>
                <img
                  src={getImage(ship.shipClass.toLowerCase(), ship.team)}
                  className={styles.summaryShipImage}
                  alt={`${ship.shipClass}-${ship.team}`}
                />
              </div>
            ))}
          </Row>
        </Column>
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

  const playerWin = () =>
    state.ships
      .filter(s => s.team === playerData.color)
      .map(s => !s.destroyed)
      .reduce((acc, val) => acc || val, false)

  useEffect(() => {
    if (mission.rewards && playerWin()) {
      dispatch(unlockRewards(mission.rewards))
    }
  }, [mission])
  return (
    <Column align="center" justify="center" padding="xxl" gap="xxl">
      <Row align="center" gap="xl">
        <img src={playerWin() ? trophy : cry} style={{ width: 100 }} />
        <Column>
          <Jumbotron
            content={
              playerWin() ? 'Congratulations' : 'Too bad for your defeat'
            }
          />
          <Title
            content={
              playerWin()
                ? 'For your brilliant victory!'
                : 'You lost, but it will be for the next time'
            }
          />
        </Column>
      </Row>
      <Row gap="xxl">
        <Column gap="m">
          <Title content="Some statistics" />
          <Row padding="xl" background="#eee">
            <SubTitle
              content={`Elapsed time: ${state.timeElapsed / 1000} seconds`}
            />
          </Row>
          <Row gap="m">
            <ShipsSummary
              name="Ships destroyed"
              ships={state.ships.filter(s => s.destroyed)}
              team={playerData.color}
            />
            <ShipsSummary
              name="Surviving ships"
              ships={state.ships.filter(s => !s.destroyed)}
              team={playerData.color}
            />
          </Row>
          {mission.rewards && playerWin() && (
            <Column background="#eee" padding="xl" gap="xl">
              <SubTitle content="Rewards" />
              {mission.rewards.missions.length > 0 && (
                <Row
                  gap="m"
                  padding="l"
                  wrap="wrap"
                  maxWidth={800}
                  justify="space-between"
                  background="#ddd"
                >
                  <Column align="flex-start" gap="s">
                    <SubTitle color="#555" content="Next mission:" />
                    {mission.rewards.missions.map(getMission).map(m => (
                      <Button
                        primary
                        key={m!.id}
                        onClick={() => {
                          restart()
                          navigate('/mission/' + m!.id)
                        }}
                        text={`#${m!.id} – ${m!.title}`}
                      />
                    ))}
                  </Column>
                </Row>
              )}
              {mission.rewards.ships.length > 0 && (
                <Row
                  gap="m"
                  padding="l"
                  wrap="wrap"
                  maxWidth={800}
                  justify="space-between"
                  background="#ddd"
                >
                  <Column align="flex-start" gap="s">
                    <SubTitle
                      color="#555"
                      content={`Unlocked Ship${
                        mission.ships.length < 1 ? 's' : ''
                      }:`}
                    />
                    {mission.rewards.ships.map((ship, i) => (
                      <img
                        key={i}
                        src={getImage(ship.toLowerCase(), playerData.color)}
                        className={styles.summaryShipImage}
                        alt={`${ship}-${playerData.color}`}
                      />
                    ))}
                  </Column>
                  <div className={styles.shipsRewards}>
                    <div className={styles.nextMission}></div>
                    <div></div>
                  </div>
                </Row>
              )}
            </Column>
          )}
        </Column>
        <Column justify="center" gap="xl">
          <Button
            secondary
            text="Return to mission preparation"
            onClick={restart}
          />
          <Button secondary text="Watch replay" onClick={replay} />
          <Button text="Go back to missions" onClick={back} />
        </Column>
      </Row>
    </Column>
  )
}
