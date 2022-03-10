import { helpers } from '@svb-41/engine'
import styles from './speed.module.css'

export type Props = { speed: number; onSetSpeed: (value: number) => void }
export const Render = ({ speed, onSetSpeed }: Props) => {
  const minClick = () => onSetSpeed(Math.max(1, speed / 2))
  const maxClick = () => onSetSpeed(Math.min(speed * 2, 32))
  return (
    <div className={styles.wrapper}>
      <button className={styles.button} onClick={minClick}>
        -
      </button>
      <div className={styles.speed}>{helpers.strings.prependZero(speed)}</div>
      <button className={styles.button} onClick={maxClick}>
        +
      </button>
    </div>
  )
}
