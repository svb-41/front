import { useState, useEffect, useRef } from 'react'
import { Row, Column } from '@/components/flex'
import { Title, SubTitle, Jumbotron } from '@/components/title'
import styles from './pages.module.css'
import s from '@/strings.json'

const useInterval = (interval: number, callback: () => void) => {
  useEffect(() => {
    const counter = setInterval(() => callback(), interval)
    return () => clearInterval(counter)
  }, [])
}

const ActivityIndicator = () => {
  const [colored, setColored] = useState(-1)
  useInterval(250, () => {
    setColored(c => {
      if (c === -1) return 0
      const value = (c + 1) % 20
      if (value === 0) return -1
      return value
    })
  })
  return (
    <Row gap="s">
      {new Array(20).fill(0).map((_, index) => {
        const background = index <= colored ? 'var(--yellow)' : undefined
        return (
          <div
            key={index}
            className={styles.activityIndicatorRect}
            style={{ background }}
          />
        )
      })}
    </Row>
  )
}

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

export const Overlay = ({ visible = true }: { visible?: boolean }) => {
  if (process.env.NODE_ENV === 'development') return null
  if (!visible) return null
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
