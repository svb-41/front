import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from '@/store/hooks'
import * as selectors from '@/store/selectors'
import * as actions from '@/store/actions'
import { Main } from '@/components/main'
import { Row, Column } from '@/components/flex'
import { Title, SubTitle, Caption } from '@/components/title'
import { Button } from '@/components/button'
import { AI } from '@/lib/ai'
import { Login } from '../login'
import { FleetManager, LoadSaveFleet, Data } from '@/components/fleet-manager'
import { Grid } from '@/components/fleet-manager/grid'
import { Leaderboard } from '@/components/leaderboard'
import { Matchmaking } from '@/components/matchmaking'
import type { Fight } from '@/store/actions/skirmishes'
import s from '@/strings.json'
import styles from './skirmishes.module.css'
import * as svb from '@svb-41/engine'
import { Renderer as EngineRenderer } from '@/renderer'
import { winnerTeam } from '@/lib/engine'
import { CongratsOrCry, ShipsSummary } from '@/pages/missions/summary'
import { useEngine } from '@/lib/engine'

type SavedFleetProps = {
  fleet: string | null
  size: 'small' | 'huge'
  fleetConfigs: { [id: string]: Data }
  team: string
  ais: AI[]
  onCreate: () => void
  selected: Data | null
}
const SavedFleet = (props: SavedFleetProps) => {
  const dispatch = useDispatch()
  const [visible, setVisible] = useState(false)
  const selectable = Object.keys(props.fleetConfigs).length > 0
  const id = props.fleet?.replace(/-/g, '')
  const { notSelected, notSelectedNext, youSelected, fleet } =
    s.pages.skirmishes
  return (
    <Column gap="s">
      <div style={{ maxWidth: 320 }}>
        {!props.selected && `${notSelected} ${props.size} ${notSelectedNext}`}
        {id && youSelected}
        {id && (
          <code className={styles.code}>
            0x{id.slice(0, 8)}…{id.slice(id.length - 8, id.length)}
          </code>
        )}
        {id && fleet}
      </div>
      <Row gap="s">
        {selectable && (
          <Button
            style={{ flex: 1 }}
            primary
            small
            onClick={() => setVisible(true)}
            text="Select your fleet"
          />
        )}
        <Button
          style={{ flex: 1 }}
          primary
          small
          onClick={props.onCreate}
          text="Create your fleet"
        />
      </Row>
      {visible && (
        <LoadSaveFleet
          onClose={() => setVisible(false)}
          onLoad={async id => {
            const action = actions.skirmishes.selectFleet(id, props.size)
            dispatch(action)
            setVisible(false)
          }}
          confs={props.fleetConfigs}
          team={props.team}
          ais={props.ais}
        />
      )}
    </Column>
  )
}

const SavedFleetSelector = ({
  page,
  setPage,
  fleets,
  user,
  setAddingFleet,
  ais,
}: any) => {
  const selected = fleets[page] ? user.fleetConfigs[fleets[page]!] : null
  return (
    <Column gap="l">
      <Column gap="s" padding="l" background="var(--eee)">
        <Title content="Your saved fleets" />
        <Row gap="s" justify="flex-end">
          <Button
            small
            primary={page === 'small'}
            text="small"
            onClick={() => setPage('small')}
          />
          <Button
            small
            primary={page === 'huge'}
            text="huge"
            onClick={() => setPage('huge')}
          />
        </Row>
        <SavedFleet
          selected={selected}
          onCreate={() => setAddingFleet(true)}
          ais={ais.ais}
          team={user.color}
          fleetConfigs={user.fleetConfigs}
          fleet={fleets[page]}
          size={page}
        />
      </Column>
      <Grid
        options={false}
        ships={selected?.ships ?? []}
        aiIDs={selected?.ais ?? []}
        team={user.color}
        ais={ais.ais}
      />
    </Column>
  )
}

const Manager = ({
  engine,
  ais,
  team,
  setState,
}: {
  engine: any
  ais: AI[]
  team: string
  setState: (value: string) => void
}) => {
  const user = useSelector(selectors.userData)
  return (
    <Row className={styles.prepareMission} gap="xl">
      <FleetManager
        maxCredits={500}
        team={team}
        ships={user.unlockedShips}
        ais={ais}
        onValidConfiguration={c => c && engine.setFleet(c)}
      >
        <Row gap="xl">
          <Button
            style={{ flex: 1 }}
            warning
            onClick={() => setState('search')}
            text="Back"
          />
          <Button
            style={{ flex: 1 }}
            primary
            disabled={!engine.fleet}
            onClick={() => engine.start(setState)}
            text="Start"
          />
        </Row>
      </FleetManager>
    </Row>
  )
}

const EndScreen = ({
  engine,
  team,
  setState,
  replay,
  back,
}: {
  engine: svb.engine.Engine
  team: string
  setState: (value: string) => void
  replay: () => void
  back: () => void
}) => {
  const dispatch = useDispatch()
  const state = engine.state
  const playerWin = winnerTeam(engine, { height: 2000, width: 2000 }) === team
  useEffect(() => {
    const action = actions.skirmishes.updateStat(playerWin)
    dispatch(action)
  }, [dispatch])
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
              team={team}
            />
            <ShipsSummary
              name={s.pages.summary.survivingShips}
              ships={state.ships.filter(s => !s.destroyed)}
              team={team}
            />
          </Row>
        </Column>
        <Column justify="center" gap="xl">
          <Button
            secondary
            text={s.pages.summary.returnToMissionPreparation}
            onClick={() => setState('preparation')}
          />
          <Button secondary text={s.pages.summary.replay} onClick={replay} />
          <Button text={s.pages.summary.goBack} onClick={back} />
        </Column>
      </Row>
    </Column>
  )
}

const prepareEnemy = (fight: Fight | null) => {
  if (!fight) return undefined
  const { team, ais, fleet } = fight
  return { team, ais, fleet }
}

const opts = {}
const PlaySkirmishes = () => {
  const dispatch = useDispatch()
  const [fleet, setFleet] = useState<Data | undefined>()
  const user = useSelector(selectors.userData)
  const ais = useSelector(selectors.ais)
  const { stats, fleets } = useSelector(selectors.skirmishes)
  const { victories, defeats } = stats
  const [addingFleet, setAddingFleet] = useState(false)
  const [page, setPage] = useState<'small' | 'huge'>('small')
  const [fight, setFight] = useState<Fight | null>(null)
  const [state, setState] = useState('search')
  const width = page === 'small' ? 2000 : 20000
  const enemy = prepareEnemy(fight)
  const engine = useEngine({
    onStart: () => setState('engine'),
    onEnd: () => setState('end'),
    size: { width, height: width },
    player: { team: user.color, ais: ais.ais },
    enemy,
  })
  return (
    <Main links={state !== 'engine'}>
      {state === 'engine' && (
        <EngineRenderer engine={engine.engine!} opts={opts} />
      )}
      {state === 'end' && (
        <EndScreen
          engine={engine.engine!}
          team={user.color}
          setState={setState}
          replay={() => engine.start()}
          back={() => setState('search')}
        />
      )}
      {state !== 'engine' && (
        <Column padding="l" gap="l">
          {state === 'search' && (
            <Row padding="l" background="var(--eee)" align="center" gap="l">
              <Column flex={1}>
                <Title content="Skirmishes" />
                <Caption content="Your stats" />
              </Column>
              <Row background="var(--ddd)" padding="m">
                Matches {victories + defeats}
              </Row>
              <Row background="var(--ddd)" padding="m">
                Victories {victories}
              </Row>
              <Row background="var(--ddd)" padding="m">
                Defeats {defeats}
              </Row>
            </Row>
          )}
          {!addingFleet && state === 'search' && (
            <Row gap="l">
              <SavedFleetSelector
                fleets={fleets}
                user={user}
                setAddingFleet={setAddingFleet}
                ais={ais}
                page={page}
                setPage={setPage}
              />
              <Matchmaking
                team={user.color}
                onClick={fight => {
                  setFight(fight)
                  setState('preparation')
                }}
              />
              <Leaderboard />
            </Row>
          )}
          {addingFleet && state === 'search' && (
            <FleetManager
              maxCredits={500}
              title={false}
              team={user.color}
              ships={user.unlockedShips}
              ais={ais.ais}
              onValidConfiguration={c => setFleet(c ?? undefined)}
              initialConfig={fleet ?? undefined}
            >
              <Row gap="l">
                <Button
                  warning
                  style={{ flex: 1 }}
                  text="Back"
                  onClick={() => setAddingFleet(false)}
                />
                <Button
                  style={{ flex: 1 }}
                  primary
                  disabled={!fleet}
                  onClick={async () => {
                    if (fleet) {
                      const save = actions.user.saveFleetConfig(fleet)
                      const cid = await dispatch(save)
                      setFleet(undefined)
                      setAddingFleet(false)
                      const select = actions.skirmishes.selectFleet(cid, page)
                      await dispatch(select)
                    }
                  }}
                  text="Submit"
                />
              </Row>
            </FleetManager>
          )}
          {state === 'preparation' && fight && (
            <Manager
              engine={engine}
              team={user.color}
              ais={ais.ais}
              setState={setState}
            />
          )}
        </Column>
      )}
    </Main>
  )
}

export const Skirmishes = () => {
  const user = useSelector(selectors.userData)
  if (!user.user) return <Login />
  return <PlaySkirmishes />
}
