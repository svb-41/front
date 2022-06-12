import { useState } from 'react'
import { useSelector, useDispatch } from '@/store/hooks'
import * as actions from '@/store/actions/user'
import * as selectors from '@/store/selectors'
import { useAuth } from '@/services/auth0'
import { Main } from '@/components/main'
import { Row, Column } from '@/components/flex'
import { Title, Caption } from '@/components/title'
import { Button } from '@/components/button'
import refresh from './refresh.svg'
import Inventory from '@/pages/account/inventory'
import styles from './account.module.css'
import { URL } from '@/envs'
import s from '@/strings.json'

const SyncButton = () => {
  const [syncing, setSyncing] = useState(false)
  const dispatch = useDispatch()
  const cl = syncing ? styles.turning : undefined
  const onSync = async () => {
    setSyncing(true)
    try {
      await dispatch(actions.sync)
    } catch (error) {
    } finally {
      setSyncing(false)
    }
  }
  return (
    <Row background="var(--eee)" padding="l" gap="l" onClick={onSync}>
      <img alt="refresh" className={cl} style={{ width: 20 }} src={refresh} />
      <Title content={s.pages.account.sync} />
    </Row>
  )
}

export const Details = () => {
  const user = useSelector(selectors.userData)
  const auth = useAuth()
  if (!user.user) return null
  return (
    <Main>
      <Column padding="xl" gap="xl" align="flex-end">
        <Row
          flex={1}
          background="var(--eee)"
          align="center"
          gap="l"
          width="100%"
        >
          <img
            alt="User icon"
            className={styles.profilePictureDetails}
            src={`${URL}/user/${user.user.username}.svg`}
          />
          <Title content={`${s.pages.account.hello} @${user.user.username}`} />
        </Row>
        <Button secondary text="Disconnect" onClick={auth.logout} />
      </Column>
      <Inventory />
    </Main>
  )
}
