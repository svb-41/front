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
import { findBuilder } from '@/missions/builders'
import { Renderer as EngineRenderer } from '@/renderer'
import { winnerTeam } from '@/lib/engine'
import { CongratsOrCry, ShipsSummary } from '@/pages/missions/summary'

type Teams = [string, string]

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

export type Dat = {
  ships: svb.engine.ship.Ship[]
  ais: { shipId: string; code: string }[]
}

const emptyData: Dat = { ships: [], ais: [] }
export const prepareData = (ais: AI[], fleetData: Data, team: string) => {
  const start = { x: 0, y: 0 }
  return fleetData.ships.reduce(
    async (acc_, { x, y, shipClass, rotation, id }) => {
      const acc = await acc_
      const value = shipClass.toUpperCase()
      const builder = findBuilder(value)
      const direction = rotation * (Math.PI / 180) - Math.PI / 2
      const position = { pos: { x: x + start.x, y: y + start.y }, direction }
      const aid = fleetData.ais.find(ai => ai.sid === id)?.aid
      const code = ais.find(ai => ai.id === aid)?.compiledValue
      if (builder && code) {
        const ship = await builder.builder({ position, team })
        const ai = { code, shipId: ship.id }
        return { ...acc, ships: [...acc.ships, ship], ais: [...acc.ais, ai] }
      }
      return acc
    },
    Promise.resolve(emptyData)
  )
}

const prepareEnemyData = async (fight?: Fight): Promise<Dat> => {
  if (!fight) return emptyData
  const { team } = fight
  return fight.fleet.ships.reduce(async (acc_, ship) => {
    const acc = await acc_
    const builder = findBuilder(ship.shipClass)
    const aid = fight.fleet.ais.find(ai => ai.sid === ship.id)?.aid
    const code = fight.ais.find(ai => ai.id === aid)?.compiled
    if (builder && code) {
      const direction = ship.rotation * (Math.PI / 180) + Math.PI / 2
      const position = {
        pos: { x: ship.x + 2000, y: ship.y },
        direction,
      }
      const ship_ = await builder.builder({ position, team })
      const ai = { code, shipId: ship_.id }
      const ships = [...acc.ships, ship_]
      const ais = [...acc.ais, ai]
      return { ...acc, ships, ais }
    }
    return acc
  }, Promise.resolve(emptyData))
}

const outOfBound = (
  ship: svb.engine.ship.Ship,
  size: { height: number; width: number }
): boolean =>
  ship.position.pos.x < -size.width * 2 ||
  ship.position.pos.y < -size.height * 2 ||
  ship.position.pos.x > size.width * 3 ||
  ship.position.pos.y > size.height * 3

const outOfAmo = (ship: svb.engine.ship.Ship) =>
  ship.weapons.map(w => w.amo <= 0).reduce((acc, val) => acc && val, true)

const teamDestroyed = (
  ships: svb.engine.ship.Ship[],
  team: string,
  size: { height: number; width: number }
) => {
  return ships
    .filter(s => s.team === team)
    .map(s => s.destroyed || outOfBound(s, size) || outOfAmo(s))
    .reduce((acc, val) => acc && val, true)
}

const isEnded = (teams: Teams, size: { height: number; width: number }) => {
  return (state: svb.engine.State): boolean => {
    const { ships } = state
    return teams
      .map(t => teamDestroyed(ships, t, size))
      .reduce((acc, val) => acc || val, false)
  }
}

type SetupEngine = {
  team: string
  enemy: string
  enemyData: Dat
  data: Dat
  setState: (value: string) => void
}
const setupEngine = ({
  team,
  enemy,
  enemyData,
  data,
  setState,
}: SetupEngine) => {
  const teams: Teams = [team, enemy]
  const comm = teams.map(id => {
    const channel = new svb.engine.comm.Channel(id)
    return { id, channel }
  })
  const state: svb.engine.State = {
    ships: [...enemyData.ships, ...data.ships],
    size: { width: 2000, height: 2000 },
    teams,
    bullets: [],
    maxSpeed: 3,
    comm,
    timeElapsed: 0,
  }
  const ais = [...enemyData.ais, ...data.ais]
  const engine = new svb.engine.Engine(
    state,
    ais,
    isEnded(teams, { width: 2000, height: 2000 })
  )
  const toPostMission = () => {
    setTimeout(() => {
      engine.removeEventListener('state.end', toPostMission)
      setState('end')
    }, 1500)
  }
  engine.addEventListener('state.end', toPostMission)
  return engine
}

const useEngine = (ais: AI[], team: string, fight?: Fight) => {
  const [engine, setEngine] = useState<svb.engine.Engine>()
  const [fleetData, setFleetData] = useState<Data>()

  const start = async (setState: (value: string) => void) => {
    if (!fleetData) return
    const data = await prepareData(ais, fleetData, team)
    const enemyData = await prepareEnemyData(fight)
    const engine = setupEngine({
      team,
      enemy: fight?.team ?? 'blue',
      enemyData,
      data,
      setState,
    })
    setEngine(engine)
    setState('engine')
  }

  const reset = () => {
    setEngine(undefined)
    setFleetData(undefined)
  }

  const fleet = fleetData
  const setFleet = setFleetData
  return { engine, start, reset, fleet, setFleet }
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
        <Column flex={1} gap="xl">
          <Button
            primary
            disabled={!engine.fleet}
            onClick={() => engine.start(setState)}
            text={s.pages.missions.launch}
          />
        </Column>
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

const opts = {}
const PlaySkirmishes = () => {
  const dispatch = useDispatch()
  const [fleet, setFleet] = useState<Data | null>(null)
  const user = useSelector(selectors.userData)
  const ais = useSelector(selectors.ais)
  const { stats, fleets } = useSelector(selectors.skirmishes)
  const { victories, defeats } = stats
  const [addingFleet, setAddingFleet] = useState(false)
  const [page, setPage] = useState<'small' | 'huge'>('small')
  const [fight, setFight] = useState<Fight | null>(null)
  const [state, setState] = useState('search')
  const engine = useEngine(ais.ais, user.color, fight ?? undefined)
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
          replay={() => engine.start(setState)}
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
              onValidConfiguration={c => setFleet(c)}
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
                      setFleet(null)
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
