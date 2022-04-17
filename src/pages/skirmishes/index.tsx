import { useState } from 'react'
import { useSelector, useDispatch } from '@/store/hooks'
import * as selectors from '@/store/selectors'
import * as actions from '@/store/actions'
import { Main } from '@/components/main'
import { Row, Column } from '@/components/flex'
import { Title, Caption } from '@/components/title'
import { Button } from '@/components/button'
import { AI } from '@/lib/ai'
import { Login } from '../login'
import { FleetManager, LoadSaveFleet, Data } from '@/components/fleet-manager'
import { Grid } from '@/components/fleet-manager/grid'
import { Leaderboard } from '@/components/leaderboard'
import { Matchmaking } from '@/components/matchmaking'
import s from '@/strings.json'
import styles from './skirmishes.module.css'

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

const PlaySkirmishes = () => {
  const dispatch = useDispatch()
  const [fleet, setFleet] = useState<Data | null>(null)
  const user = useSelector(selectors.userData)
  const ais = useSelector(selectors.ais)
  const { stats, fleets } = useSelector(selectors.skirmishes)
  const { victories, defeats } = stats
  const [addingFleet, setAddingFleet] = useState(false)
  const [page, setPage] = useState<'small' | 'huge'>('small')
  return (
    <Main>
      <Column padding="l" gap="l">
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
        {!addingFleet && (
          <Row gap="l">
            <SavedFleetSelector
              fleets={fleets}
              user={user}
              setAddingFleet={setAddingFleet}
              ais={ais}
              page={page}
              setPage={setPage}
            />
            <Matchmaking />
            <Leaderboard />
          </Row>
        )}
        {addingFleet && (
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
      </Column>
    </Main>
  )
}

export const Skirmishes = () => {
  const user = useSelector(selectors.userData)
  if (!user.user) return <Login />
  return <PlaySkirmishes />
}
