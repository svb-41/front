import styles from './hud.module.css'

const selectText = (state: State) => {
  switch (state) {
    case 'game':
      return 'Go to edition'
    case 'editor':
      return 'Go to game'
  }
}

export type State = 'game' | 'editor'
export type Props = { state: State; onClick: () => void }
export const Render = ({ state, onClick }: Props) => {
  const title = selectText(state)
  return (
    <div className={styles.hud}>
      <div>HUD</div>
      <button onClick={onClick} className={styles.button}>
        {title}
      </button>
    </div>
  )
}
