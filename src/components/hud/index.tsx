import styles from './hud.module.css'
import { useNavigate } from 'react-router-dom'

export type State = 'game' | 'editor'
export type Props = { state: State; onClick: () => void }
export const HUD = ({
  title = 'SVB 41',
  back,
  button,
}: {
  title?: string
  back?: string
  button?: string
}) => {
  const navigate = useNavigate()
  return (
    <div className={styles.hud}>
      <div>{title}</div>
      <button
        onClick={() => {
          if (back) navigate(back)
        }}
        className={styles.button}
      >
        {button ? button : 'back'}
      </button>
    </div>
  )
}

export const Container = ({
  children,
}: {
  children: JSX.Element | JSX.Element[]
}) => <div className={styles.gameContainer}>{children}</div>
