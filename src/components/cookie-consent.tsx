import { useState } from 'react'
import { Row, Column } from '@/components/flex'
import { SubTitle, Caption } from '@/components/title'
import { Button } from '@/components/button'
import styles from './components.module.css'
import s from '@/strings.json'

const key = 'svb41.cookie-consent'

const readData = (): boolean | undefined => {
  const data = localStorage.getItem(key)
  if (data === null) return
  return JSON.parse(data)
}

const saveData = (value: boolean) => {
  const val = JSON.stringify(value)
  localStorage.setItem(key, val)
}

export const CookieConsent = () => {
  const [st, setSt] = useState(readData)
  if (typeof st === 'boolean') return null
  const reject = () => {
    saveData(false)
    setSt(false)
    // @ts-ignore
    gtag('consent', 'update', {
      analytics_storage: 'denied',
    })
  }
  const accept = () => {
    saveData(true)
    setSt(true)
    // @ts-ignore
    gtag('consent', 'update', {
      analytics_storage: 'granted',
    })
  }
  return (
    <div className={styles.cookieConsent}>
      <Row background="var(--ccc)" padding="xl" gap="xl">
        <Column flex={1} maxWidth={700} gap="m">
          <Column>
            <SubTitle content={s.cookieConsent.title} />
            <Caption content={s.cookieConsent.needHelp} />
          </Column>
          <p>{s.cookieConsent.helpUs}</p>
          <p>
            {s.cookieConsent.youCould}{' '}
            <a className={styles.link} href="mailto:hivert.is.coming@gmail.com">
              {s.cookieConsent.writeMessage}
            </a>
            !
          </p>
        </Column>
        <Column gap="m" align="flex-end" justify="center" flex={1}>
          <Button warning onClick={reject} text={s.cookieConsent.no} />
          <Button primary onClick={accept} text={s.cookieConsent.yes} />
        </Column>
      </Row>
    </div>
  )
}
