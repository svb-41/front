import { useState, useEffect, useRef } from 'react'
import { Row, Column } from '@/components/flex'
import { Title, SubTitle } from '@/components/title'
import styles from './pages.module.css'
import s from '@/strings.json'

const ActivityIndicator = () => {
  const [colored, setColored] = useState(-1)
  useEffect(() => {
    const counter = setInterval(() => {
      setColored(c => {
        if (c === -1) return 0
        const value = (c + 1) % 20
        if (value === 0) return -1
        return value
      })
    }, 250)
    return () => clearInterval(counter)
  }, [])
  return (
    <Row gap="s">
      {new Array(20).fill(0).map((_, index) => {
        const style =
          index <= colored ? { background: 'var(--yellow)' } : undefined
        return (
          <div
            key={index}
            className={styles.activityIndicatorRect}
            style={style}
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
  useEffect(() => {
    const counter = setInterval(() => {
      const idx = index.current
      setSentence(sentences[idx])
      index.current += 1
    }, 1000)
    return () => clearInterval(counter)
  }, [])
  return <SubTitle color="#999" content={sentence} />
}

export const Overlay = ({ visible = true }: { visible?: boolean }) => {
  if (process.env.NODE_ENV === 'development') return null
  if (!visible) return null
  return (
    <div className={styles.overlay}>
      <Column gap="m">
        <Column>
          <Title content="Loading…" />
          <InsideTitle />
        </Column>
        <ActivityIndicator />
      </Column>
    </div>
  )
}
