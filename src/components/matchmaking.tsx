import { useState, useRef } from 'react'
import { useDispatch } from '@/store/hooks'
import * as actions from '@/store/actions'
import { Title, Caption } from '@/components/title'
import { Row, Column } from '@/components/flex'
import { Button } from '@/components/button'
import * as Input from '@/components/input'
import type { Fight } from '@/store/actions/skirmishes'
import { ActivityIndicator } from '@/components/activity-indicator'
import { renderShip } from '@/pages/missions/preparation'
import s from '@/strings.json'
import * as colors from '@/lib/color'

const FleetDescription = ({
  fight,
  username,
}: {
  fight: Fight
  username: string
}) => {
  const ships = fight.fleet.ships.reduce((acc, val) => {
    const n = val.shipClass
    return { ...acc, [n]: (acc[n] ?? 0) + 1 }
  }, {} as { [key: string]: number })
  const cards = Object.entries(ships)
  return (
    <Column gap="l">
      <Column>
        <Title content={`${username} fleet`} />
        <Caption content={`All the ships you’ll fight`} />
      </Column>
      <Row gap="l">{cards.map(renderShip(fight.team))}</Row>
    </Column>
  )
}

export const Matchmaking = ({
  onClick,
  team,
}: {
  onClick: (value: Fight) => void
  team: string
}) => {
  const dispatch = useDispatch()
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedSize, setSelectedSize] = useState<'small' | 'huge'>('small')
  const [searched, setSearched] = useState(false)
  const [fetchedFleet, setFetchedFleet] = useState<Fight | null>(null)
  const usernameRef = useRef('')
  return (
    <Column flex={1} gap="l">
      <Column background="var(--eee)" padding="l" gap="l">
        <Column>
          <Title content={s.components.matchmaking.title} />
          <Caption content={s.components.matchmaking.caption} />
        </Column>
        <Column
          gap="l"
          tag="form"
          onSubmit={async event => {
            event.preventDefault()
            setLoading(true)
            try {
              const action = actions.skirmishes.fight(username, 'small')
              const value = await dispatch(action)
              const val = value
                ? {
                    ...value,
                    team:
                      team === value.team
                        ? colors.random.filter(c => c !== team)[0]
                        : value.team,
                  }
                : value
              setFetchedFleet(val)
              usernameRef.current = username
            } catch (error) {
            } finally {
              if (username.length > 0) setSearched(true)
              setLoading(false)
            }
          }}
        >
          <Column gap="s">
            <div>{s.components.matchmaking.selectSize}</div>
            <Row gap="s">
              <Button
                primary={selectedSize === 'small'}
                small
                text="small"
                onClick={() => setSelectedSize('small')}
              />
              <Button
                primary={selectedSize === 'huge'}
                small
                text="huge"
                onClick={() => setSelectedSize('huge')}
              />
            </Row>
          </Column>
          <Column tag="label" gap="s">
            <div>{s.components.matchmaking.enterUsername}</div>
            <Row gap="s">
              <Input.Text
                value={username}
                onChange={setUsername}
                style={{ flex: 1 }}
              />
              <Button
                disabled={username.length < 1}
                primary
                small
                text="Search"
                onClick={() => {}}
              />
            </Row>
          </Column>
        </Column>
      </Column>
      {loading && (
        <Row justify="center" padding="xxl">
          <ActivityIndicator />
        </Row>
      )}
      {!loading && searched && fetchedFleet && (
        <>
          <Column background="var(--eee)" padding="l">
            <FleetDescription
              fight={fetchedFleet}
              username={usernameRef.current}
            />
          </Column>
          <Button primary text="Start" onClick={() => onClick(fetchedFleet)} />
        </>
      )}
      {!loading && searched && !fetchedFleet && (
        <Column align="center">
          <Row>
            <div style={{ fontSize: '5rem' }}>:</div>
            <div style={{ fontSize: '5rem', position: 'relative', top: 10 }}>
              /
            </div>
          </Row>
          <div style={{ whiteSpace: 'pre', textAlign: 'center' }}>
            {s.components.matchmaking.noSetup}
          </div>
        </Column>
      )}
    </Column>
  )
}
