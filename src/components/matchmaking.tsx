import { useState } from 'react'
import { useDispatch } from '@/store/hooks'
import * as actions from '@/store/actions'
import { Title, Caption } from '@/components/title'
import { Row, Column } from '@/components/flex'
import { Button } from '@/components/button'
import * as Input from '@/components/input'
import { ActivityIndicator } from '@/components/activity-indicator'
import s from '@/strings.json'

export const Matchmaking = () => {
  const dispatch = useDispatch()
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedSize, setSelectedSize] = useState<'small' | 'huge'>('small')
  return (
    <Column flex={1} background="var(--eee)" padding="l" gap="l">
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
            console.log('value', value)
          } catch (error) {
          } finally {
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
      {loading && <ActivityIndicator />}
    </Column>
  )
}
