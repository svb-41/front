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
import styles from './skirmishes.module.css'

type SavedFleetProps = {
  fleet: string | null
  size: 'small' | 'huge'
  fleetConfigs: { [id: string]: Data }
  team: string
  ais: AI[]
  onCreate: () => void
  selected: Data | null
  selectedID: string | null
}
const SavedFleet = ({
  fleet,
  size,
  fleetConfigs,
  team,
  ais,
  onCreate,
  selected,
  selectedID,
}: SavedFleetProps) => {
  const dispatch = useDispatch()
  const [visible, setVisible] = useState(false)
  const selectable = Object.keys(fleetConfigs).length > 0
  const id = selectedID?.replace(/-/g, '')
  return (
    <Column gap="s">
      <div style={{ maxWidth: 320 }}>
        {!selected &&
          `You don’t have any selected fleet for ${size} fleet. By selecting one, opponents will be able to fight against it.`}
        {id &&
          `You selected 0x${id.slice(0, 8)}...${id.slice(
            id.length - 8,
            id.length
          )} fleet`}
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
          onClick={onCreate}
          text="Create your fleet"
        />
      </Row>
      {visible && (
        <LoadSaveFleet
          onClose={() => setVisible(false)}
          onLoad={async id => {
            const action = actions.skirmishes.selectFleet(id, size)
            dispatch(action)
            setVisible(false)
          }}
          confs={fleetConfigs}
          team={team}
          ais={ais}
        />
      )}
    </Column>
  )
}

const PlaySkirmishes = () => {
  const dispatch = useDispatch()
  const [page, setPage] = useState<'small' | 'huge'>('small')
  const [fleet, setFleet] = useState<Data | null>(null)
  const user = useSelector(selectors.userData)
  const ais = useSelector(selectors.ais)
  const { stats, fleets } = useSelector(selectors.skirmishes)
  const { victories, defeats } = stats
  const [addingFleet, setAddingFleet] = useState(false)
  const selected = fleets[page] ? user.fleetConfigs[fleets[page]!] : null
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
          <Row>
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
                  selectedID={fleets[page]}
                  selected={selected}
                  onCreate={() => setAddingFleet(true)}
                  ais={ais.ais}
                  team={user.color}
                  fleetConfigs={user.fleetConfigs}
                  fleet={page === 'small' ? fleets.small : fleets.huge}
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
            onAIClick={id => {
              // setSelected(id)
              // setSelectedTeam(undefined)
            }}
            onShipClick={id => {
              // setSelected(id)
              // setSelectedTeam(preferences.player.color)
            }}
          >
            <Button
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
