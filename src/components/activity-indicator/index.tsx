import { useState } from 'react'
import { Row } from '@/components/flex'
import { useInterval } from '@/lib/time'
import styles from './activity-indicator.module.css'

export const ActivityIndicator = () => {
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
        const background = index <= colored ? 'var(--team-yellow)' : undefined
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
