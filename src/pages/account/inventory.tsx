import { useSelector } from '@/store/hooks'
import * as selectors from '@/store/selectors'
import styles from './account.module.css'
import { Stuff } from '@/store/reducers/inventory'

const Inventory = () => {
  const items = useSelector(selectors.inventory)
  const stacked = items
    .filter(item => item.type === 'metal' || item.type === 'fuel')
    .reduce((acc: any, val: Stuff) => {
      const type = acc[val.type]
      if (type) {
        if (type[val.category]) type[val.category]++
        else type[val.category] = 1
      } else acc[val.type] = { [val.category]: 1 }
      return acc
    }, {})
  const notStacked = items.filter(
    item => item.type !== 'metal' && item.type !== 'fuel'
  )
  const stackArray = Object.entries(stacked)
    .map(([type, value]: [string, any]) =>
      Object.entries(value)
        .map(([category, quantity]) => ({
          type,
          category,
          quantity,
        }))
        .flat()
    )
    .flat()
  return (
    <div className={styles.inventory}>
      {stackArray.map(stack => (
        <StackedItem stack={stack} />
      ))}
      {notStacked.map(s => (
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
type StackItem = {
  type: string
  category: string
  quantity: any
}
const StackedItem = ({ stack }: { stack: StackItem }) => (
  <div className={styles.stuff}>
    <div className={styles.type}>
      <div style={{ color: color(stack.type) }}>{stack.type}</div>
    </div>
    <div className={styles.category}>{stack.category}</div>
    {stack.type === 'piece' && <div className={styles.stats}></div>}
    <div className={styles.stack}>X {stack.quantity}</div>
  </div>
)

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
              key != 'builder' &&
              key != 'stats'
          )
          .map(([key, value]) => (
            <div key={key}>{`${key}: ${formatPi(value)}`}</div>
          ))}
      </div>
    )}
  </div>
)

const formatPi = (n: any) => {
  if (typeof n === 'number') {
    const size = n.toString().length > 10
    if (size) return 'PI x ' + n / Math.PI
  }
  return n
}

export default Inventory
