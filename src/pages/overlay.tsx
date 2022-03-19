import { useState, useRef } from 'react'
import { Column } from '@/components/flex'
import { Title, SubTitle, Jumbotron } from '@/components/title'
import { ActivityIndicator } from '@/components/activity-indicator'
import { useInterval } from '@/lib/time'
import styles from './pages.module.css'
import s from '@/strings.json'

const InsideTitle = () => {
  const sentences = [
    s.pages.overlay.readingData,
    s.pages.overlay.polishingPixels,
    s.pages.overlay.preparingSpaceships,
    s.pages.overlay.settingsUpWormholes,
    s.pages.overlay.firingEngine,
  ]
  const [sentence, setSentence] = useState(sentences[0])
  const index = useRef(1)
  useInterval(1000, () => {
    const idx = index.current
    if (sentences[idx]) setSentence(sentences[idx])
    index.current += 1
  })
  return <SubTitle color="var(--999)" content={sentence} />
}

export const Overlay = () => {
  if (process.env.NODE_ENV === 'development') return null
  return (
    <div className={styles.overlay}>
      <Column gap="m">
        <Column>
          <Jumbotron content={s.svb} />
          <Title content={s.loading} />
          <InsideTitle />
        </Column>
        <ActivityIndicator />
      </Column>
    </div>
  )
}
