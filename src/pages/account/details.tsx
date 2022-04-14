import { useState } from 'react'
import { useSelector, useDispatch } from '@/store/hooks'
import * as actions from '@/store/actions/user'
import * as selectors from '@/store/selectors'
import { Main } from '@/components/main'
import { Row, Column } from '@/components/flex'
import { Title, Caption } from '@/components/title'
import { Button } from '@/components/button'
import refresh from './refresh.svg'
import styles from './account.module.css'
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
      <img className={cl} style={{ width: 20 }} src={refresh} />
      <Title content={s.pages.account.sync} />
    </Row>
  )
}

export const Details = () => {
  const user = useSelector(selectors.userData)
  if (!user.user) return null
  return (
    <Main>
      <Row padding="xl" gap="xl">
        <Column flex={1} background="var(--eee)" padding="l">
          <Title content={`${s.pages.account.hello} @${user.user.username}`} />
        </Column>
        <SyncButton />{' '}
      </Row>
    </Main>
  )
}
