import styles from '@/components/ships/display.module.css'
import * as selectors from '@/store/selectors'
import { useSelector } from '@/store/hooks'

export const ships = [
  'fighter',
  'scout',
  'cruiser',
  'stealth',
  'bomber',
  'destroyer',
]

export const getImage = (ship: string, color: string) =>
  require(`../../../public/assets/Tiles/${ship}-${color}.png`).default

const Display = () => {
  const { color, unlockedShips } = useSelector(selectors.userData)

  return (
    <div className={styles.container}>
      {ships.map(ship => (
        <div key={ship} className={styles.cell}>
          {unlockedShips.includes(ship) ? (
            <img
              src={getImage(ship, color)}
              className={styles.img}
              alt="ship"
            />
          ) : (
            <div className={styles.img}>locked</div>
          )}
        </div>
      ))}
    </div>
  )
}

export default Display
