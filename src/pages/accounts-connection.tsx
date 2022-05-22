import { useState } from 'react'
import { useDispatch } from '@/store/hooks'
import * as actions from '@/store/actions'
import { Row, Column } from '@/components/flex'
import { Title, Caption } from '@/components/title'
import { Button } from '@/components/button'
import { ActivityIndicator } from '@/components/activity-indicator'
import { Plus } from '@/assets/icons/plus'
import { QuestionMark } from '@/assets/icons/question-mark'
import { Login } from '@/assets/icons/login'
import * as services from '@/services'
import { URL } from '@/envs'

type CardProps = {
  username?: string
  identicon?: boolean
  plus?: boolean
  onClick: () => void
  text?: string
}
const Card = ({ username, plus, identicon, onClick, text }: CardProps) => (
  <Row
    background="var(--ddd)"
    align="center"
    gap="l"
    style={{ paddingRight: 'var(--m)' }}
    onClick={onClick}
  >
    {identicon && username && (
      <img style={{ width: 40 }} src={`${URL}/user/${username}.svg`} />
    )}
    {username && !identicon && <QuestionMark />}
    {!username && plus && <Plus />}
    {!username && !plus && <Login />}
    <div style={{ fontSize: '1.3rem', flex: 1 }}>{username ?? text}</div>
  </Row>
)

export const AccountsConnection = () => {
  const [accounts] = useState(services.accounts.read)
  const [loading, setLoading] = useState(false)
  const auth = services.auth.useAuth()
  const dispatch = useDispatch()
  const align = loading ? 'center' : 'stretch'
  const loader = async (fun: () => Promise<void>) => {
    setLoading(true)
    try {
      await fun()
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }
  const onAccountClick = (account: services.accounts.Account) => () => {
    return loader(async () => {
      if (account.username.startsWith('Guest')) {
        services.localStorage.setUserId(account.uid)
        await dispatch(actions.init.initStore)
      } else {
        await auth.login('Username-Password-Authentication', account.username)
      }
    })
  }
  const onConnect = () => {
    return loader(async () => {
      await auth.login('Username-Password-Authentication')
    })
  }
  const onNewAccount = async () => {
    return loader(async () => {
      const uid = services.localStorage.generateUid()
      services.accounts.addGuest(uid)
      await dispatch(actions.init.initStore)
    })
  }
  return (
    <Column flex={1} background="var(--eee)">
      <Column style={{ margin: 'auto' }} gap="l" align={align}>
        <Column>
          <div style={{ fontSize: '1.1rem' }}>SVB-41</div>
          <Title content="Connect to your account" />
          <Caption content="Or create your account" />
        </Column>
        {loading && <ActivityIndicator />}
        {!loading && (
          <Column gap="s">
            You already connected as
            {accounts.map((acc, index) => (
              <Card {...acc} key={index} onClick={onAccountClick(acc)} />
            ))}
          </Column>
        )}
        {!loading && (
          <Column gap="s">
            Or create or connect to your account
            <Card text="Connect as an existing user" onClick={onConnect} />
            <Card plus text="Connect as new user" onClick={onNewAccount} />
          </Column>
        )}
      </Column>
    </Column>
  )
}
