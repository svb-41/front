import { useState } from 'react'
import { useDispatch } from '@/store/hooks'
import * as actions from '@/store/actions'
import { Row, Column } from '@/components/flex'
import { Title, Caption } from '@/components/title'
import { Button } from '@/components/button'
import * as services from '@/services'
import { URL } from '@/envs'

const Plus = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={40}
    height={40}
    viewBox="0 0 64 64"
    style={{ backgroundColor: 'rgba(240,240,240,1)' }}
  >
    <g fill="black" stroke="black" strokeWidth={0.32}>
      <rect x="20" y="28" width="8" height="8" />
      <rect x="28" y="20" width="8" height="8" />
      <rect x="28" y="28" width="8" height="8" />
      <rect x="28" y="36" width="8" height="8" />
      <rect x="28" y="44" width="8" height="8" />
      <rect x="12" y="28" width="8" height="8" />
      <rect x="28" y="12" width="8" height="8" />
      <rect x="36" y="28" width="8" height="8" />
      <rect x="44" y="28" width="8" height="8" />
    </g>
  </svg>
)

const Login = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={40}
    height={40}
    viewBox="0 0 64 64"
    style={{ backgroundColor: 'rgba(240,240,240,1)' }}
  >
    <g fill="black" stroke="black" strokeWidth={0.32}></g>
  </svg>
)

const QuestionMark = () => (
  <svg
    width={40}
    height={40}
    version="1.1"
    viewBox="0 0 700 550"
    style={{ backgroundColor: 'rgba(240,240,240,1)' }}
  >
    <g>
      <path d="m308.56 404.88h83.441v82.879h-83.441z" />
      <path d="m557.76 72.238v249.2h-249.2v-82.883h166.32v-83.438h-249.76v83.438h-82.883v-166.32z" />
    </g>
  </svg>
)

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
    <Button primary small onClick={() => {}} text="Connect" />
  </Row>
)

export const AccountsConnection = () => {
  const [accounts] = useState(services.accounts.read)
  const auth = services.auth.useAuth()
  const dispatch = useDispatch()
  return (
    <Column flex={1} background="var(--eee)">
      <Column style={{ margin: 'auto' }} gap="l">
        <Column>
          <div style={{ fontSize: '1.1rem' }}>SVB-41</div>
          <Title content="Connect to your account" />
          <Caption content="Or create your account" />
        </Column>
        <Column gap="s">
          {accounts.map((account, index) => (
            <Card
              {...account}
              key={index}
              onClick={() => {
                if (account.username.startsWith('Guest')) {
                  services.localStorage.setUserId(account.uid)
                  dispatch(actions.init.initStore)
                } else {
                  auth.login(
                    'Username-Password-Authentication',
                    account.username
                  )
                }
              }}
            />
          ))}
          <Card
            onClick={() => auth.login('Username-Password-Authentication')}
            text="Connect as an existing user"
          />
          <Card
            plus
            onClick={() => {
              const uid = services.localStorage.generateUid()
              services.accounts.addGuest(uid)
              dispatch(actions.init.initStore)
            }}
            text="Connect as new user"
          />
        </Column>
      </Column>
    </Column>
  )
}
