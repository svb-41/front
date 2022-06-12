import { useSelector } from '@/store/hooks'
import * as selectors from '@/store/selectors'
import styles from './account.module.css'
import { Stuff } from '@/store/reducers/inventory'

const Inventory = () => {
  const items = useSelector(selectors.inventory)
  console.log(items.map(a => a.ownStats))
  return (
    <div className={styles.inventory}>
      {items.map(s => (
        <Item stuff={s} key={s.id} />
      ))}
    </div>
  )
}

const color = (type: string): string => {
  switch (type) {
    case 'metal':
      return 'blue'
    case 'fuel':
      return 'red'
    case 'piece':
      return 'purple'
    case 'ship':
      return 'yellow'
    default:
      return 'white'
  }
}

const Item = ({ stuff }: { stuff: Stuff }) => (
  <div className={styles.stuff}>
    <div className={styles.type}>
      <div style={{ color: color(stuff.type) }}>{stuff.type}</div>
    </div>
    <div className={styles.category}>{stuff.category}</div>
    {stuff.type === 'piece' && (
      <div className={styles.stats}>
        {Object.entries(stuff.ownStats)
          .filter(
            ([key, value]) =>
              key != 'position' &&
              key != 'distance' &&
              key != 'armed' &&
              key != 'destroyed' &&
              key != 'stats'
          )
          .map(([key, value]) => (
            <div key={key}>{`${key}: ${value}`}</div>
          ))}
      </div>
    )}
  </div>
)

export default Inventory
