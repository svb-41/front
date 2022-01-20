import styles from './hud.module.css'

export type State = 'game' | 'editor'
export type Props = { state: State; onClick: () => void }
export const HUD = () => {
  return (
    <div className={styles.hud}>
      <div>HUD</div>
      <button onClick={() => {}} className={styles.button}>
        Bouton
      </button>
    </div>
  )
}
