import { useAuth, Connection, Provider } from '@/services/auth0'
import { Main } from '@/components/main'
import { Row, Column } from '@/components/flex'
import { Title, Caption } from '@/components/title'
import { Button } from '@/components/button'
import { ActivityIndicator } from '@/components/activity-indicator'
import s from '@/strings.json'

const colors = {
  username: 'var(--ts-blue)',
  google: 'var(--google)',
}

const connections: { [k: string]: Connection } = {
  username: 'Username-Password-Authentication',
  google: 'google-oauth2',
}

type LoginButtonProps = { provider: Provider; login: any }
const LoginButton = ({ provider, login }: LoginButtonProps) => {
  const connection = connections[provider]
  const text = s.pages.login.connect[provider]
  const background = colors[provider]
  const handler = () => login(connection)
  return <Button primary text={text} onClick={handler} style={{ background }} />
}

export const Login = () => {
  const { loading, login } = useAuth()
  return (
    <Main>
      <Column maxWidth={700} style={{ margin: 'var(--xl) auto' }} width="100%">
        <Column padding="xl" background="var(--ddd)" gap="l">
          <Column>
            <Title content={s.pages.login.title} />
            <Caption content={s.pages.login.caption} />
          </Column>
          <p>{s.pages.login.first}</p>
          <p>{s.pages.login.second}</p>
          <p>{s.pages.login.third}</p>
          {!loading && <LoginButton provider="username" login={login} />}
          {!loading && false && <LoginButton provider="google" login={login} />}
          {loading && (
            <Row padding="m" justify="center">
              <ActivityIndicator />
            </Row>
          )}
        </Column>
      </Column>
    </Main>
  )
}
